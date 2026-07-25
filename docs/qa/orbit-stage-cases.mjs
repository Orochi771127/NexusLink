/**
 * PACK R2 — Orbit five-stage route + progress cases.
 * Run: node docs/qa/orbit-stage-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const { MOONLAKE_STAGES, PLAINS_STAGES, getOrbitStageById, listStagesForRegion } =
  await import(pathToFileURL(path.join(repoRoot, "src/data/orbit/stages/index.js")).href);

const {
  resetOrbitPathProgressForTests,
  isOrbitStageUnlocked,
  isOrbitRegionUnlocked,
  recordOrbitStageClear,
  listOrbitMapNodes,
  getOrbitPathProgressSnapshot,
  setActiveOrbitRegion
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitPathProgress.js")).href);

const {
  createOrbitSession,
  launchOrbitSession,
  stepOrbitSession,
  retreatOrbitSession
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitEngine.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

resetOrbitPathProgressForTests();

assert.equal(MOONLAKE_STAGES.length, 5);
assert.equal(listStagesForRegion("moonlake").length, 5);
assert.ok(PLAINS_STAGES.length >= 1);
ok("moonlake has 5 stages; plains has at least 1");

const goals = new Set(MOONLAKE_STAGES.map((s) => s.goal));
assert.ok(goals.has("clear"));
assert.ok(goals.has("survive"));
assert.ok(goals.has("reach_anchor"));
ok("stage goals include clear / survive / reach_anchor");

assert.equal(isOrbitStageUnlocked("moonlake-1"), true);
assert.equal(isOrbitStageUnlocked("moonlake-2"), false);
assert.equal(isOrbitRegionUnlocked("plains"), false);
ok("only first stage unlocked initially; plains locked");

// Sequential unlock without regression on retreat
recordOrbitStageClear("moonlake-1");
assert.equal(isOrbitStageUnlocked("moonlake-2"), true);
const retreated = retreatOrbitSession(
  createOrbitSession({
    stats: { impact: 50, spin: 50, guard: 50, burst: 20, overheat: 10 },
    stage: getOrbitStageById("moonlake-2")
  })
);
assert.equal(retreated.progressEligible, false);
assert.equal(isOrbitStageUnlocked("moonlake-2"), true);
assert.equal(getOrbitPathProgressSnapshot().clearedStageIds.includes("moonlake-1"), true);
ok("retreat does not revoke cleared progress");

// Clear all moonlake → unlock plains
for (const stage of MOONLAKE_STAGES) {
  recordOrbitStageClear(stage.id);
}
assert.equal(isOrbitRegionUnlocked("plains"), true);
assert.ok(setActiveOrbitRegion("plains"));
const plainsNodes = listOrbitMapNodes("plains");
assert.ok(plainsNodes.length >= 1);
assert.equal(plainsNodes[0].unlocked, true);
ok("clearing moonlake-5 unlocks plains path");

// Survive stage can win by time
resetOrbitPathProgressForTests();
const surviveStage = getOrbitStageById("moonlake-3");
let session = createOrbitSession({
  stats: { impact: 55, spin: 60, guard: 60, burst: 20, overheat: 5 },
  stage: surviveStage
});
session = launchOrbitSession(session, 0, 0.3);
let guard = 0;
while (session.phase === "spinning" && guard < 5000) {
  session = stepOrbitSession(session, 1 / 20);
  guard += 1;
}
assert.equal(session.phase, "resolved");
assert.ok(
  session.outcome.reason === "survived" ||
    session.outcome.reason === "player_out" ||
    session.outcome.reason === "player_burst" ||
    session.outcome.reason === "timeout" ||
    session.outcome.reason === "dummy_burst"
);
ok("survive stage session resolves");

// Anchor stage win when forced onto anchor
const anchorStage = getOrbitStageById("moonlake-4");
session = createOrbitSession({
  stats: { impact: 40, spin: 40, guard: 70, burst: 10, overheat: 0 },
  stage: anchorStage
});
session = launchOrbitSession(session, 0, 0.2);
session = {
  ...session,
  player: {
    ...session.player,
    x: anchorStage.anchor.x,
    y: anchorStage.anchor.y,
    out: false,
    stability: 80
  }
};
session = stepOrbitSession(session, 1 / 30);
assert.equal(session.phase, "resolved");
assert.equal(session.outcome.reason, "anchor_reached");
assert.equal(session.progressEligible, true);
ok("reach_anchor wins when avatar on anchor");

// Narrow stage has pillars + smaller radius
const narrow = getOrbitStageById("moonlake-2");
assert.ok(narrow.arenaRadius < 1);
assert.ok(narrow.pillars.length >= 2);
const narrowSession = createOrbitSession({
  stats: { impact: 40, spin: 40, guard: 40, burst: 10, overheat: 0 },
  stage: narrow
});
assert.equal(narrowSession.arenaRadius, narrow.arenaRadius);
assert.equal(narrowSession.pillars.length, narrow.pillars.length);
ok("narrow stage carries pillars and arena radius");

console.log("\nAll orbit stage cases passed.");
