/**
 * Moonlake five-zone / twenty-five-stage route cases.
 * Run: node docs/qa/orbit-stage-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const qaDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(qaDir, "../..");

const {
  MOONLAKE_ORBIT_ZONES,
  MOONLAKE_STAGES,
  getOrbitStageById,
  listStagesForMoonlakeZone,
  listStagesForRegion
} = await import(pathToFileURL(path.join(repoRoot, "src/data/orbit/stages/index.js")).href);

const {
  getMoonlakeZoneProgress,
  isMoonlakeOrbitZoneUnlocked,
  isOrbitStageUnlocked,
  recordOrbitStageClear
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

function makeState({ arrived = true } = {}) {
  return {
    explorationProgress: {
      totalExplorations: arrived ? 1 : 0,
      visitCounts: arrived ? { moonlake_camp: 1 } : {}
    },
    activityProgress: {
      version: 1,
      orbit: { clearedStageIds: [] },
      standoff: { clearedScenarioIds: [] },
      expedition: { clearedRouteIds: [] }
    }
  };
}

assert.equal(MOONLAKE_ORBIT_ZONES.length, 5);
assert.equal(MOONLAKE_STAGES.length, 25);
assert.equal(listStagesForRegion("moonlake").length, 25);
for (const zone of MOONLAKE_ORBIT_ZONES) {
  assert.equal(listStagesForMoonlakeZone(zone.id).length, 5);
}
ok("Moonlake is five Orbit zones with five stages each");

const beforeArrival = makeState({ arrived: false });
assert.equal(isOrbitStageUnlocked("moonlake-1", beforeArrival), false);
assert.equal(isOrbitStageUnlocked("moonlake-6", beforeArrival), false);
ok("safe Moonlake Camp arrival remains the first gate");

const state = makeState();
assert.equal(isMoonlakeOrbitZoneUnlocked("starwood_trail", state), true);
assert.equal(isMoonlakeOrbitZoneUnlocked("misttide_shore", state), true);
assert.equal(isMoonlakeOrbitZoneUnlocked("mirror_hollow", state), false);
assert.equal(isOrbitStageUnlocked("moonlake-1", state), true);
assert.equal(isOrbitStageUnlocked("moonlake-2", state), false);
assert.equal(isOrbitStageUnlocked("moonlake-6", state), true);
ok("Starwood and Misttide open together; stages remain sequential");

recordOrbitStageClear("moonlake-1", state);
assert.equal(isOrbitStageUnlocked("moonlake-2", state), true);
const retreated = retreatOrbitSession(
  createOrbitSession({
    stats: { impact: 50, spin: 50, guard: 50, burst: 20, overheat: 10 },
    stage: getOrbitStageById("moonlake-2")
  })
);
assert.equal(retreated.progressEligible, false);
assert.ok(state.activityProgress.orbit.clearedStageIds.includes("moonlake-1"));
ok("retreat never writes or revokes persistent progress");

for (const stage of listStagesForMoonlakeZone("starwood_trail")) {
  recordOrbitStageClear(stage.id, state);
}
assert.equal(isMoonlakeOrbitZoneUnlocked("mirror_hollow", state), false);
for (const stage of listStagesForMoonlakeZone("misttide_shore")) {
  recordOrbitStageClear(stage.id, state);
}
assert.equal(isMoonlakeOrbitZoneUnlocked("mirror_hollow", state), true);
assert.equal(isOrbitStageUnlocked("moonlake-11", state), true);
ok("Mirror opens only after both Starwood and Misttide finals");

for (const stage of listStagesForMoonlakeZone("mirror_hollow")) {
  recordOrbitStageClear(stage.id, state);
}
assert.equal(isMoonlakeOrbitZoneUnlocked("crystal_ruins", state), true);
for (const stage of listStagesForMoonlakeZone("crystal_ruins")) {
  recordOrbitStageClear(stage.id, state);
}
assert.equal(isMoonlakeOrbitZoneUnlocked("rift_observatory", state), true);
assert.deepEqual(getMoonlakeZoneProgress("crystal_ruins", state), {
  zoneId: "crystal_ruins",
  unlocked: true,
  clearedCount: 5,
  totalCount: 5,
  complete: true
});
ok("Mirror → Crystal → Rift zone chain is derived from final clears");

const surviveStage = getOrbitStageById("moonlake-4");
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
assert.equal(session.outcome.reason, "stage_completed");
assert.equal(session.progressEligible, true);
ok("authored survival objective is reachable");

const anchorStage = getOrbitStageById("moonlake-1");
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
assert.equal(session.outcome.reason, "stage_completed");
ok("reach-anchor objective completes through the sequence runner");

const finalStage = getOrbitStageById("moonlake-25");
assert.deepEqual(
  finalStage.objectives.map((entry) => entry.type),
  ["survive", "collect_motes", "resonate_zone"]
);
assert.equal(finalStage.maxSeconds, 60);
ok("final stage composes survival, collection and resonance under 60 seconds");

console.log("\nAll Moonlake Orbit stage cases passed.");
