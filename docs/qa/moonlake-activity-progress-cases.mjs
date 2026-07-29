/**
 * Moonlake three-mode persistence and authored progression cases.
 * Run: node docs/qa/moonlake-activity-progress-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const qaDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(qaDir, "../..");
const load = (file) => import(pathToFileURL(path.join(repoRoot, file)).href);

const { createDefaultState, normalizeState } = await load("src/state/store.js");
const {
  recordOrbitStageClear,
  isOrbitStageCleared
} = await load("src/orbit/orbitPathProgress.js");
const {
  recordStandoffScenarioClear,
  resolveStandoffFirstClear
} = await load("src/engine/standoffProgress.js");
const {
  getStandoffTensionProfile
} = await load("src/data/standoffDifficultyProfiles.js");
const {
  EXPEDITION_FUTURE_DEPTHS,
  getExpeditionRouteDepth
} = await load("src/expedition/expeditionConfig.js");
const {
  resolveOrbitNodeActionSheet
} = await load("src/orbit/orbitNodeActionResolver.js");

function ok(name) {
  console.log(`PASS  ${name}`);
}

const fresh = createDefaultState();
assert.deepEqual(fresh.activityProgress, {
  version: 1,
  orbit: { clearedStageIds: [] },
  standoff: { clearedScenarioIds: [] },
  expedition: { clearedRouteIds: [] }
});
ok("fresh state contains the versioned three-mode progress schema");

const normalized = normalizeState({
  activityProgress: {
    version: 99,
    orbit: { clearedStageIds: ["moonlake-1", "moonlake-1", "", null] },
    standoff: { clearedScenarioIds: ["rift_observatory", "rift_observatory"] },
    expedition: { clearedRouteIds: "invalid" }
  }
});
assert.deepEqual(normalized.activityProgress, {
  version: 1,
  orbit: { clearedStageIds: ["moonlake-1"] },
  standoff: { clearedScenarioIds: ["rift_observatory"] },
  expedition: { clearedRouteIds: [] }
});
ok("normalizer deduplicates IDs and repairs malformed legacy input");

const draft = createDefaultState();
draft.explorationProgress = {
  totalExplorations: 1,
  lastNodeId: "moonlake_camp",
  visitCounts: { moonlake_camp: 1 }
};
recordOrbitStageClear("moonlake-1", draft);
const reloaded = normalizeState(JSON.parse(JSON.stringify(draft)));
assert.equal(isOrbitStageCleared("moonlake-1", reloaded), true);
ok("Orbit first clear survives a save-shaped reload");

let decision = resolveStandoffFirstClear(
  fresh,
  "rift_observatory",
  "stabilized"
);
assert.equal(decision.grantsFirstClear, true);
recordStandoffScenarioClear(fresh, decision.scenarioId);
decision = resolveStandoffFirstClear(
  fresh,
  "rift_observatory",
  "recovered"
);
assert.equal(decision.grantsFirstClear, false);
assert.equal(decision.alreadyCleared, true);
assert.equal(
  resolveStandoffFirstClear(fresh, "rift_observatory", "retreated")
    .grantsFirstClear,
  false
);
ok("Standoff grants only the first canonical clear, never retreat or replay");

assert.equal(getStandoffTensionProfile(1).label, "聽見雜訊");
assert.equal(getStandoffTensionProfile(2).label, "交疊回聲");
assert.equal(getStandoffTensionProfile(4).label, "邊界風壓");
assert.equal(getStandoffTensionProfile(6).label, "記憶回潮");
assert.equal(getStandoffTensionProfile(7).label, "裂隙合奏");
ok("Standoff chapters resolve to five authored tension profiles");

assert.deepEqual(getExpeditionRouteDepth("plains_windrest"), {
  id: "near_shore",
  label: "近岸",
  duration: "3–4 分鐘"
});
assert.equal(getExpeditionRouteDepth("forge_emberpath").label, "轉折");
assert.equal(getExpeditionRouteDepth("harbor_quayside").label, "深徑");
assert.equal(EXPEDITION_FUTURE_DEPTHS.length, 2);
ok("current Expedition regions expose only the first three natural depths");

const actionSheet = resolveOrbitNodeActionSheet({
  chapterProgress: { current: 2, completed: [1] },
  onboarding: { firstLoop: { completedAt: Date.now() } },
  explorationProgress: { totalExplorations: 1, visitCounts: { moonlake_camp: 1 } },
  habitatTraces: [{ id: "trace" }],
  activeCompanionId: "greyshade-cat",
  energy: 10
});
assert.deepEqual(
  actionSheet.actions.map((action) => [action.id, action.route]),
  [
    ["orbit", "map"],
    ["expedition", "expedition"],
    ["standoff", "standoff"]
  ]
);
ok("the three Explore entries route independently");

console.log("\nAll Moonlake activity progress cases passed.");
