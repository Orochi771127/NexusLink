/**
 * EVO-05 — Greyshade Cat formal evolution renderer canary.
 *
 * 這份測試證明：只有灰影貓、且存檔已是下一階時，才准試播 R4；
 * 失敗只能退回同一隻 Stage 1；不得改 growth.stage，也不得把 flags 寫成 true。
 * 這不是 EVO-06 promotion，也不是 11 隻一起換形。
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIVE_STAGE1_SOURCE,
  FORMAL_EVOLUTION_ANIMATION_INDEX_PATH,
  selectLiveAnimationAuthority
} from "../../src/engine/formalEvolutionCatalog.js";
import {
  CANARY_PRESENTATION_MODE,
  EVO05_ENABLED_CANARY_IDS,
  buildFormalCanaryLoadPlan,
  isEvo05CanaryCompanion,
  mapSemanticAnimationToFormalSheet,
  planFormalEvolutionCanaryAttempt,
  prepareFormalEvolutionCanaryLoad,
  recordCanaryLoadOutcome,
  shouldRefreshFormalEvolutionPresentation,
  stampCanaryFallbackPresentation
} from "../../src/engine/formalEvolutionCanaryPlan.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const cases = [];
const ANIMATION_INDEX = loadJson(FORMAL_EVOLUTION_ANIMATION_INDEX_PATH);
const GREYSHADE_MANIFEST = loadJson(
  "assets/characters/greyshade-cat/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
);
const CANARY_PLAN_SOURCE = readFileSync(
  join(ROOT, "src/engine/formalEvolutionCanaryPlan.js"),
  "utf8"
);
const LOADER_SOURCE = readFileSync(
  join(ROOT, "src/pixi/spriteSheetAnimationLoader.js"),
  "utf8"
);
const RENDERER_SOURCE = readFileSync(
  join(ROOT, "src/pixi/companionRenderer.js"),
  "utf8"
);

await runCase("only greyshade-cat is the enabled canary", () => {
  assertDeepEqual(EVO05_ENABLED_CANARY_IDS, ["greyshade-cat"], "enabled ids");
  assertEqual(isEvo05CanaryCompanion("greyshade-cat"), true, "cat is canary");
  assertEqual(isEvo05CanaryCompanion("auriowl"), false, "owl is not canary");
  assertEqual(isEvo05CanaryCompanion("crystalfin-seahorse"), false, "seahorse is not canary");
});

await runCase("non-canary companions stay on Stage 1 even if saved stage is later", () => {
  for (const companionId of ["auriowl", "crystalfin-seahorse", "blazetail-kit"]) {
    const plan = planFormalEvolutionCanaryAttempt({
      companionId,
      savedStage: "final_awakened",
      animationIndex: ANIMATION_INDEX
    });
    assertEqual(plan.attemptFormal, false, `${companionId} no attempt`);
    assertEqual(plan.reason, "not_enabled_canary", `${companionId} reason`);
    assertEqual(plan.liveSource, LIVE_STAGE1_SOURCE, `${companionId} live`);
    assertEqual(plan.growthMutation, null, `${companionId} no mutation`);
    assertEqual(plan.formalSheetsSelectedAsLiveAuthority, false, `${companionId} not live r4`);
  }
});

await runCase("greyshade Stage 1 does not attempt R4", () => {
  const plan = planFormalEvolutionCanaryAttempt({
    companionId: "greyshade-cat",
    savedStage: "initial_awakened",
    animationIndex: ANIMATION_INDEX
  });
  assertEqual(plan.attemptFormal, false, "no attempt");
  assertEqual(plan.reason, "stage_not_evolved", "stage reason");
  assertEqual(plan.canarySheetsAttempted, false, "no sheets");
  assertEqual(plan.growthMutation, null, "no mutation");
});

await runCase("greyshade later stage may attempt canary without promoting live authority", () => {
  const live = selectLiveAnimationAuthority(ANIMATION_INDEX, {
    requestedStage: "resonant_mature"
  });
  assertEqual(live.liveSource, LIVE_STAGE1_SOURCE, "catalog live stays stage1");
  assertEqual(live.formalSheetsSelected, false, "catalog does not select r4");

  const plan = planFormalEvolutionCanaryAttempt({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature",
    animationIndex: ANIMATION_INDEX
  });
  assertEqual(plan.attemptFormal, true, "attempt allowed");
  assertEqual(plan.presentationMode, CANARY_PRESENTATION_MODE, "canary mode");
  assertEqual(plan.liveSource, LIVE_STAGE1_SOURCE, "live authority still stage1");
  assertEqual(plan.formalSheetsSelectedAsLiveAuthority, false, "not promotion");
  assertEqual(plan.runtimeAuthority, false, "authority flag");
  assertEqual(plan.runtimeFormSwapReady, false, "swap flag");
  assertEqual(plan.retryable, true, "retryable");
  assertEqual(plan.growthMutation, null, "no stage patch");
  assertEqual(plan.catalogForm.characterId, "greyshade-cat", "same companion form");
  assertEqual(
    plan.catalogForm.manifest.includes("/greyshade-cat/"),
    true,
    "manifest stays cat"
  );
  assertEqual(plan.catalogForm.manifest.includes("auriowl"), false, "not owl path");
});

await runCase("canary load plan is lazy: one boot sheet, never 176", () => {
  const loadPlan = buildFormalCanaryLoadPlan({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature",
    animationIndex: ANIMATION_INDEX,
    manifest: GREYSHADE_MANIFEST,
    manifestPath: "assets/characters/greyshade-cat/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  });
  assertEqual(loadPlan.ok, true, "load plan ok");
  assertEqual(loadPlan.bootSheetCount, 1, "boot one sheet");
  assertEqual(loadPlan.bootAnimationNames[0], "idle_calm", "boot idle");
  assertEqual(
    loadPlan.bootSheetCount,
    new Set(loadPlan.bootAnimationNames.map((name) => loadPlan.metadata[name]?.sheet).filter(Boolean)).size,
    "boot count comes from boot metadata"
  );
  assertEqual(loadPlan.uniqueSheetCount <= 4, true, "at most 4 cardinal sheets");
  assertEqual(loadPlan.uniqueSheetCount < 176, true, "not the full r4 dump");
  assertEqual(
    loadPlan.metadata.idle_calm.sheet.includes("greyshade-cat"),
    true,
    "idle sheet is cat"
  );
  assertEqual(
    loadPlan.metadata.idle_calm.sheet.includes("auriowl"),
    false,
    "idle sheet is not owl"
  );
  assertEqual(loadPlan.metadata.idle_calm.frameCount, 4, "south row only");
  assertEqual(loadPlan.growthMutation, null, "plan has no stage patch");
});

await runCase("semantic names map to r4 action families without quadruped theft", () => {
  assertEqual(mapSemanticAnimationToFormalSheet("idle_calm").action, "idle", "idle");
  assertEqual(mapSemanticAnimationToFormalSheet("left_walk").action, "walk", "walk");
  assertEqual(mapSemanticAnimationToFormalSheet("attack_basic").action, "attack", "attack");
  assertEqual(mapSemanticAnimationToFormalSheet("hit").action, "recovery", "recovery");
  assertEqual(mapSemanticAnimationToFormalSheet("idle_calm").family, "cardinal", "cardinal");
  assertEqual(mapSemanticAnimationToFormalSheet("idle_calm").row, "south", "south");
});

await runCase("foreign sheet and missing idle fail closed to the same cat", () => {
  const swapped = JSON.parse(JSON.stringify(GREYSHADE_MANIFEST));
  swapped.actions.idle.cardinal = "idle/auriowl_resonant_mature_idle_cardinal_4x4_r3.png";
  const foreign = buildFormalCanaryLoadPlan({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature",
    animationIndex: ANIMATION_INDEX,
    manifest: swapped,
    manifestPath: "assets/characters/greyshade-cat/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  });
  assertEqual(foreign.ok, false, "foreign idle rejected");
  assertEqual(foreign.reason, "cross_companion_sheet_forbidden", "foreign reason");
  assertEqual(foreign.fallbackCompanionId, "greyshade-cat", "stays cat");
  assertEqual(foreign.growthMutation, null, "foreign no mutation");
  assertEqual(foreign.metadata, null, "no foreign metadata");

  const empty = JSON.parse(JSON.stringify(GREYSHADE_MANIFEST));
  empty.actions.idle.cardinal = "";
  const missing = buildFormalCanaryLoadPlan({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature",
    animationIndex: ANIMATION_INDEX,
    manifest: empty,
    manifestPath: "assets/characters/greyshade-cat/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  });
  assertEqual(missing.ok, false, "missing idle rejected");
  assertEqual(missing.fallbackCompanionId, "greyshade-cat", "missing stays cat");
  assertEqual(missing.growthMutation, null, "missing no mutation");
});

await runCase("load outcome never patches stage or flips flags", () => {
  const failed = recordCanaryLoadOutcome({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature",
    ok: false,
    reason: "canary_idle_load_failed"
  });
  assertEqual(failed.usedFallback, true, "uses fallback");
  assertEqual(failed.retryable, true, "retryable");
  assertEqual(failed.fallbackCompanionId, "greyshade-cat", "same cat");
  assertEqual(failed.growthMutation, null, "no stage patch");
  assertEqual(failed.runtimeAuthority, false, "failed authority");
  assertEqual(failed.runtimeFormSwapReady, false, "failed swap");
  assertEqual(failed.liveSource, LIVE_STAGE1_SOURCE, "failed live");

  const ok = recordCanaryLoadOutcome({
    companionId: "greyshade-cat",
    savedStage: "final_awakened",
    ok: true
  });
  assertEqual(ok.usedFallback, false, "success not fallback");
  assertEqual(ok.growthMutation, null, "success still no mutation");
  assertEqual(ok.runtimeFormSwapReady, false, "success does not promote");
  assertEqual(ok.formalSheetsSelectedAsLiveAuthority, false, "still not live authority");
});

await runCase("presentation refresh only follows a published accept", () => {
  assertEqual(
    shouldRefreshFormalEvolutionPresentation({
      ok: true,
      accepted: true,
      published: true,
      changed: true,
      companionId: "greyshade-cat"
    }),
    true,
    "published accept refreshes"
  );
  assertEqual(
    shouldRefreshFormalEvolutionPresentation({
      ok: false,
      accepted: false,
      published: false,
      changed: false,
      companionId: "greyshade-cat",
      reason: "formal_evolution_save_failed"
    }),
    false,
    "save failure does not refresh"
  );
  assertEqual(
    shouldRefreshFormalEvolutionPresentation({
      ok: true,
      accepted: false,
      published: true,
      changed: true,
      companionId: "greyshade-cat"
    }),
    false,
    "defer does not refresh"
  );
});

await runCase("test carriers and roadmap ids cannot enter canary", () => {
  for (const companionId of ["flame-flicker", "star-energy-boarlet"]) {
    const plan = planFormalEvolutionCanaryAttempt({
      companionId,
      savedStage: "resonant_mature",
      animationIndex: ANIMATION_INDEX
    });
    assertEqual(plan.attemptFormal, false, `${companionId} blocked`);
    assertEqual(plan.reason, "not_formal_evolution_companion", `${companionId} reason`);
    assertEqual(plan.growthMutation, null, `${companionId} no mutation`);
  }
});

await runCase("greyshade final_awakened load plan stays on the same cat", () => {
  const manifest = loadJson(
    "assets/characters/greyshade-cat/formal-stages/final_awakened/animation-r3/animation-manifest.json"
  );
  const loadPlan = buildFormalCanaryLoadPlan({
    companionId: "greyshade-cat",
    savedStage: "final_awakened",
    animationIndex: ANIMATION_INDEX,
    manifest,
    manifestPath: "assets/characters/greyshade-cat/formal-stages/final_awakened/animation-r3/animation-manifest.json"
  });
  assertEqual(loadPlan.ok, true, "final plan ok");
  assertEqual(loadPlan.catalogForm.characterId, "greyshade-cat", "final form owner");
  assertEqual(loadPlan.metadata.idle_calm.sheet.includes("greyshade-cat"), true, "final idle is cat");
  assertEqual(loadPlan.metadata.idle_calm.sheet.includes("auriowl"), false, "final idle not owl");
  assertEqual(loadPlan.bootSheetCount, 1, "final boot one sheet");
  assertEqual(loadPlan.growthMutation, null, "final no mutation");
});

await runCase("foreign walk sheet fails the whole canary instead of mixing bodies", () => {
  const swapped = JSON.parse(JSON.stringify(GREYSHADE_MANIFEST));
  swapped.actions.walk.cardinal = "walk/auriowl_resonant_mature_walk_cardinal_4x4_r3.png";
  const foreignWalk = buildFormalCanaryLoadPlan({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature",
    animationIndex: ANIMATION_INDEX,
    manifest: swapped,
    manifestPath: "assets/characters/greyshade-cat/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  });
  assertEqual(foreignWalk.ok, false, "foreign walk rejected");
  assertEqual(foreignWalk.reason, "cross_companion_sheet_forbidden", "foreign walk reason");
  assertEqual(foreignWalk.fallbackCompanionId, "greyshade-cat", "foreign walk stays cat");
  assertEqual(foreignWalk.metadata, null, "no mixed metadata");
  assertEqual(foreignWalk.growthMutation, null, "foreign walk no mutation");
});

await runCase("404 prepare path does not mutate a cloned growth stage", async () => {
  const growth = { stage: "resonant_mature", companionId: "greyshade-cat" };
  const before = JSON.stringify(growth);
  const prepared = await prepareFormalEvolutionCanaryLoad({
    companionId: "greyshade-cat",
    savedStage: growth.stage,
    animationIndex: ANIMATION_INDEX,
    fetchJson: async () => {
      throw new Error("HTTP 404");
    }
  });
  assertEqual(prepared.ok, false, "404 prepare fails");
  assertEqual(prepared.usedFallback, true, "404 uses fallback");
  assertEqual(prepared.retryable, true, "404 retryable");
  assertEqual(prepared.growthMutation, null, "404 no mutation object");
  assertEqual(prepared.runtimeFormSwapReady, false, "404 does not promote");
  assertEqual(JSON.stringify(growth), before, "caller growth untouched");
  assertEqual(growth.stage, "resonant_mature", "saved stage remains");
});

await runCase("stage 1 fallback stamp stays retryable without writing stage", () => {
  const stamp = stampCanaryFallbackPresentation({
    companionId: "greyshade-cat",
    savedStage: "resonant_mature"
  });
  assertEqual(stamp.usedFallback, true, "fallback marked");
  assertEqual(stamp.retryable, true, "retryable marked");
  assertEqual(stamp.growthMutation, null, "stamp has no mutation");
  assertEqual(stamp.presentationMode, LIVE_STAGE1_SOURCE, "fallback is stage1");
  assertEqual(stamp.runtimeFormSwapReady, false, "stamp does not promote");
  assertEqual(RENDERER_SOURCE.includes("stampCanaryFallbackPresentation"), true, "renderer stamps fallback");
});

await runCase("source files do not flip runtime flags or import evolutionLines", () => {
  for (const [label, source] of [
    ["canary plan", CANARY_PLAN_SOURCE],
    ["loader", LOADER_SOURCE],
    ["renderer", RENDERER_SOURCE]
  ]) {
    assertEqual(source.includes("runtimeFormSwapReady: true"), false, `${label} swap true`);
    assertEqual(source.includes("runtimeAuthority: true"), false, `${label} authority true`);
    assertEqual(source.includes("evolutionLines"), false, `${label} evolutionLines`);
  }
  assertEqual(INDEX_FLAGS_STILL_FALSE(), true, "asset flags stay false");
});

report();

function INDEX_FLAGS_STILL_FALSE() {
  const index = loadJson("assets/characters/formal-evolution-index.json");
  return index.runtimeAuthority === false
    && ANIMATION_INDEX.runtimeAuthority === false
    && ANIMATION_INDEX.runtimeFormSwapReady === false;
}

function loadJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf8"));
}

async function runCase(name, callback) {
  try {
    await callback();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error?.message || String(error) });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function report() {
  const failed = cases.filter((entry) => !entry.ok);
  for (const entry of cases) {
    console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : ` — ${entry.error}`}`);
  }
  console.log(`\nevo-05 formal evolution canary: ${cases.length - failed.length}/${cases.length}`);
  if (failed.length > 0) process.exitCode = 1;
}
