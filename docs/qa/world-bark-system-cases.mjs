/**
 * TP-WORLD-BARK-AND-DIALOGUE-DIRECTOR-R1 — World Bark System
 * Run: node docs/qa/world-bark-system-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const load = (rel) => import(pathToFileURL(path.join(repoRoot, rel)).href);

let passed = 0;
function ok(name) {
  console.log(`PASS  ${name}`);
  passed += 1;
}

const { WORLD_BARK_LIMITS, WORLD_BARK_CATEGORIES, evaluateWorldBarkBudget, isWithinBarkShape } =
  await load("src/ai/worldAutonomy/worldBarkPolicy.js");
const { buildWorldBark, createWorldBarkBudgetState, markPlayerInteraction, bandDrive } =
  await load("src/ai/worldAutonomy/worldBarkSystem.js");
const { buildWorldRuntimeInput, WORLD_AVAILABILITY } =
  await load("src/ai/worldAutonomy/worldStateAdapter.js");
const { listAllWorldBarkKeys } = await load("src/data/worldBarkPacks.js");
const { executeWorldAction } = await load("src/ai/worldAutonomy/worldActionExecutor.js");
const { runWorldAutonomyLoop } = await load("src/ai/worldAutonomy/worldAutonomyLoop.js");
const { STRINGS } = await load("src/i18n/strings.js");
const { detectForbiddenPhrases } = await load("src/ai/forbiddenPhrases.js");

const BOOT = 1_000_000;
const READY = BOOT + WORLD_BARK_LIMITS.BOOT_QUIET_MS + 1;

/** Availability where every drive is backed — used to exercise the happy path. */
const ALL_AVAILABLE = Object.freeze({
  energy: WORLD_AVAILABILITY.OK,
  hunger: WORLD_AVAILABILITY.OK,
  boredom: WORLD_AVAILABILITY.OK,
  loneliness: WORLD_AVAILABILITY.OK
});

function ledger(overrides = {}) {
  return { ...createWorldBarkBudgetState(BOOT), ...overrides };
}

// ---------------------------------------------------------------- budget gate

{
  const budget = evaluateWorldBarkBudget({
    now: BOOT + 10_000,
    bootAt: BOOT,
    category: WORLD_BARK_CATEGORIES.DISCOVERY,
    candidateKeys: ["worldBark.eat.high.0"]
  });
  assert.equal(budget.allowed, false);
  assert.ok(budget.blocks.includes("boot_quiet"));
  assert.equal(budget.nextEligibleAt, BOOT + WORLD_BARK_LIMITS.BOOT_QUIET_MS);
  assert.equal(budget.persistence, "session_only");
  assert.equal(budget.dailyCap, null);
  ok("boot quiet blocks the first 60s");
}

{
  const budget = evaluateWorldBarkBudget({
    now: READY + 100_000,
    bootAt: BOOT,
    lastBarkAt: READY,
    category: WORLD_BARK_CATEGORIES.DISCOVERY,
    candidateKeys: ["worldBark.eat.high.0"]
  });
  assert.equal(budget.allowed, false);
  assert.ok(budget.blocks.includes("bark_interval"));
  assert.equal(budget.requiredInterval, WORLD_BARK_LIMITS.MIN_INTERVAL_MS);
  ok("150s interval blocks a second bark");
}

{
  const budget = evaluateWorldBarkBudget({
    now: READY + WORLD_BARK_LIMITS.MIN_INTERVAL_MS + 1,
    bootAt: BOOT,
    lastBarkAt: READY,
    barksThisSession: WORLD_BARK_LIMITS.SESSION_CAP,
    category: WORLD_BARK_CATEGORIES.DISCOVERY,
    candidateKeys: ["worldBark.eat.high.0"]
  });
  assert.equal(budget.allowed, false);
  assert.ok(budget.blocks.includes("session_cap"));
  assert.equal(budget.remaining, 0);
  ok("5th bark blocked by SESSION_CAP");
}

{
  const budget = evaluateWorldBarkBudget({
    now: READY,
    bootAt: BOOT,
    barksThisSession: 2,
    hintBarksThisSession: WORLD_BARK_LIMITS.HINT_CAP,
    category: WORLD_BARK_CATEGORIES.HINT,
    candidateKeys: ["worldBark.rest.high.0"]
  });
  assert.equal(budget.allowed, false);
  assert.ok(budget.blocks.includes("hint_cap"));
  assert.equal(budget.hintRemaining, 0);
  ok("3rd hint blocked by HINT_CAP while session budget remains");
}

{
  const budget = evaluateWorldBarkBudget({
    now: READY,
    bootAt: BOOT,
    category: WORLD_BARK_CATEGORIES.DISCOVERY,
    candidateKeys: ["worldBark.eat.high.0"],
    recentBarkKeys: ["worldBark.eat.high.0"]
  });
  assert.equal(budget.allowed, false);
  assert.ok(budget.blocks.includes("duplicate_bark"));
  ok("duplicate key suppressed");
}

{
  const now = READY + 60_000;
  const waived = evaluateWorldBarkBudget({
    now,
    bootAt: BOOT,
    lastBarkAt: now - 40_000,
    lastPlayerInteractionAt: now - 5_000,
    category: WORLD_BARK_CATEGORIES.STATUS,
    candidateKeys: ["worldBark.approach.mid.0"]
  });
  assert.equal(waived.allowed, true, "grace should waive the 150s interval");
  assert.equal(waived.graceActive, true);
  assert.equal(waived.requiredInterval, WORLD_BARK_LIMITS.GRACE_FLOOR_MS);

  const floored = evaluateWorldBarkBudget({
    now,
    bootAt: BOOT,
    lastBarkAt: now - 5_000,
    lastPlayerInteractionAt: now - 5_000,
    category: WORLD_BARK_CATEGORIES.STATUS,
    candidateKeys: ["worldBark.approach.mid.0"]
  });
  assert.equal(floored.allowed, false, "grace must not defeat the 30s floor");
  assert.ok(floored.blocks.includes("bark_interval"));

  const capped = evaluateWorldBarkBudget({
    now,
    bootAt: BOOT,
    lastBarkAt: now - 40_000,
    lastPlayerInteractionAt: now - 5_000,
    barksThisSession: WORLD_BARK_LIMITS.SESSION_CAP,
    category: WORLD_BARK_CATEGORIES.STATUS,
    candidateKeys: ["worldBark.approach.mid.0"]
  });
  assert.equal(capped.allowed, false, "grace must not defeat the session cap");
  assert.ok(capped.blocks.includes("session_cap"));
  ok("interaction grace waives the interval but not the floor or the cap");
}

// ------------------------------------------------------------- bark selection

{
  const bark = buildWorldBark({
    plannedAction: { actionId: "eat_available_food", targetId: "food_1" },
    drives: { foodDrive: 0.9 },
    availability: ALL_AVAILABLE,
    budgetState: ledger(),
    safeUnstable: true,
    now: READY
  });
  assert.equal(bark.spoken, false);
  assert.equal(bark.degradedReason, "safety_quiet");
  assert.ok(bark.bodyCueId, "body language survives safety silence");
  ok("safeUnstable forces silence but keeps the body cue");
}

for (const actionId of ["wander_safe_area", "play_idle_activity", "idle"]) {
  const bark = buildWorldBark({
    plannedAction: { actionId },
    drives: { exploreDrive: 0.9, playDrive: 0.9 },
    availability: ALL_AVAILABLE,
    budgetState: ledger(),
    now: READY
  });
  assert.equal(bark.spoken, false, `${actionId} must never speak`);
  assert.equal(bark.degradedReason, "not_text_eligible");
  assert.ok(bark.bodyCueId);
}
ok("ordinary repeating actions never produce text");

{
  // Real canonical state → foodDrive is unbacked, so the food line must not fire.
  const { availability } = buildWorldRuntimeInput({ energy: 8, activeHabitatId: "moonlake" });
  assert.equal(availability.hunger, WORLD_AVAILABILITY.UNAVAILABLE);
  const bark = buildWorldBark({
    plannedAction: { actionId: "eat_available_food" },
    drives: { foodDrive: 0.9 },
    availability,
    budgetState: ledger(),
    now: READY
  });
  assert.equal(bark.spoken, false);
  assert.equal(bark.degradedReason, "drive_unavailable");
  assert.equal(bark.bodyCueId, "lower_head_to_forage");
  ok("eat_available_food degrades to body cue while foodDrive is unavailable");
}

{
  const args = {
    plannedAction: { actionId: "rest_at_spot" },
    drives: { restDrive: 0.8 },
    availability: ALL_AVAILABLE,
    budgetState: ledger(),
    now: READY,
    seed: 7
  };
  const a = buildWorldBark(args);
  const b = buildWorldBark(args);
  assert.equal(a.spoken, true);
  assert.equal(a.barkKey, b.barkKey, "same input must yield the same key");
  assert.equal(a.category, WORLD_BARK_CATEGORIES.HINT);
  assert.equal(bandDrive(0.8), "high");
  assert.ok(a.barkKey.startsWith("worldBark.rest.high."));
  assert.equal(a.budgetAfter.barksThisSession, 1);
  assert.equal(a.budgetAfter.hintBarksThisSession, 1);
  assert.deepEqual([...a.budgetAfter.recentBarkKeys], [a.barkKey]);
  ok("deterministic seeded selection and budget accounting");
}

{
  // Over budget must degrade the bark but never cancel the embodied action.
  const spent = ledger({ barksThisSession: WORLD_BARK_LIMITS.SESSION_CAP, lastBarkAt: READY });
  const bark = buildWorldBark({
    plannedAction: { actionId: "inspect_habitat_object" },
    drives: { exploreDrive: 0.5 },
    availability: ALL_AVAILABLE,
    budgetState: spent,
    now: READY + 1_000_000
  });
  assert.equal(bark.spoken, false);
  assert.ok(bark.blocks.includes("session_cap"));

  const executed = executeWorldAction({ actionId: "inspect_habitat_object", targetId: "obj_1" }, bark);
  assert.equal(executed.type, "patch_emitted");
  assert.equal(executed.statePatch.actionId, "inspect_habitat_object");
  assert.equal(executed.statePatch.intent, "move_to_target");
  assert.equal(executed.statePatch.bark, null);
  assert.equal(executed.statePatch.bodyCueId, "look_twice_then_approach");
  assert.equal(executed.statePatch.barkDegradedReason, "session_cap");
  ok("over-budget bark degrades yet the action still executes");
}

{
  // Legacy single-argument call must still work.
  const legacy = executeWorldAction({ actionId: "wander_safe_area" });
  assert.equal(legacy.statePatch.intent, "move_random");
  assert.equal(legacy.bark, null);
  assert.equal(legacy.statePatch.bark, undefined);
  ok("executeWorldAction stays backward compatible");
}

{
  const withInteraction = markPlayerInteraction(ledger(), READY);
  assert.equal(withInteraction.lastPlayerInteractionAt, READY);
  ok("markPlayerInteraction records the grace anchor");
}

// ------------------------------------------------------------- loop behaviour

{
  const tick = runWorldAutonomyLoop(
    { energy: 9, activeHabitatId: "moonlake" },
    { now: READY, seed: 1, barkBudget: ledger() }
  );
  assert.equal(tick.status, "success");
  assert.equal(tick.statePatch.actionId, "wander_safe_area");
  assert.equal(tick.bark, null, "wandering is body-cue only");
  assert.equal(tick.bodyCueId, "look_around_unhurried");
  assert.equal(tick.availability.hunger, WORLD_AVAILABILITY.UNAVAILABLE);
  ok("loop runs on canonical state and stays quiet while wandering");
}

{
  const tick = runWorldAutonomyLoop(
    { energy: 9, activeHabitatId: "moonlake", worldActionCooldowns: { wander_safe_area: READY } },
    { now: READY + 1_000, seed: 0, barkBudget: ledger() }
  );
  assert.equal(tick.status, "aborted");
  assert.match(tick.reason, /^cooldown_active/);
  assert.ok(tick.bark, "an aborted action should explain itself");
  assert.equal(tick.bark.category, WORLD_BARK_CATEGORIES.FAILURE);
  assert.ok(tick.bark.barkKey.startsWith("worldBark.blocked.cooldown."));
  ok("policy abort now speaks its reason instead of failing silently");
}

{
  const state = { energy: 9, activeHabitatId: "moonlake" };
  const frozen = JSON.stringify(state);
  runWorldAutonomyLoop(state, { now: READY, seed: 3, barkBudget: ledger() });
  assert.equal(JSON.stringify(state), frozen, "loop must not mutate canonical state");
  ok("loop leaves canonical state untouched");
}

// ------------------------------------------------------------- authored lines

const FOMO_BLOCKLIST = /一直在等你|怎麼現在才來|再不.*就會錯過|沒有你.*不能|今天一定要/;

{
  const keys = listAllWorldBarkKeys();
  assert.ok(keys.length >= 20, "expected a full bark table");
  for (const key of keys) {
    const entry = STRINGS[key];
    assert.ok(entry, `missing i18n entry: ${key}`);
    for (const lang of ["tc", "sc", "en", "jp"]) {
      assert.ok(String(entry[lang] || "").trim(), `${key} missing ${lang}`);
    }
    assert.ok(isWithinBarkShape(entry.tc), `${key} tc breaks the 8–24 char / 2 sentence shape: ${entry.tc}`);
    assert.equal(detectForbiddenPhrases(entry.tc).hasForbidden, false, `${key} hits a forbidden phrase`);
    assert.equal(FOMO_BLOCKLIST.test(entry.tc), false, `${key} reads as FOMO/guilt: ${entry.tc}`);
  }
  ok(`all ${keys.length} bark lines are four-language, in-shape, and pressure-free`);
}

{
  assert.equal(isWithinBarkShape("太短"), false);
  assert.equal(isWithinBarkShape("這句話刻意寫得非常非常長，長到超過二十四個字的上限限制。"), false);
  assert.equal(isWithinBarkShape("第一句。第二句。第三句。"), false);
  ok("bark shape guard rejects too short, too long, and three-sentence lines");
}

console.log(`\n${passed}/${passed} PASS`);
