/**
 * PACK R1 — Heartcore Orbit Battle prototype cases.
 * Run: node docs/qa/orbit-battle-prototype-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  projectOrbitCombatStats,
  vitalsFromState,
  recentEvidenceFromState
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitStatsProjector.js")).href);

const {
  createOrbitSession,
  launchOrbitSession,
  retreatOrbitSession,
  stepOrbitSession
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitEngine.js")).href);

const { mapOrbitResultToOutcome, companionLineForOutcome } =
  await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitOutcomes.js")).href);

const { getOrbitPathLabel, ORBIT_PATH_ORDER, getTrainingArena } =
  await import(pathToFileURL(path.join(repoRoot, "src/data/orbit/trainingArena.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

// Path short labels (Owner 2026-07-25)
assert.equal(getOrbitPathLabel("moonlake"), "月湖路徑");
assert.equal(getOrbitPathLabel("plains"), "平原路徑");
assert.equal(getOrbitPathLabel("forge"), "熔爐路徑");
assert.equal(getOrbitPathLabel("harbor"), "南港路徑");
assert.equal(getOrbitPathLabel("core"), "核心路徑");
assert.equal(getOrbitPathLabel("tidal"), "潮汐路徑");
assert.equal(getOrbitPathLabel("mystic"), "秘境路徑");
assert.deepEqual(ORBIT_PATH_ORDER, [
  "moonlake",
  "plains",
  "forge",
  "harbor",
  "core",
  "tidal",
  "mystic"
]);
ok("path short labels moonlake→mystic");

const arena = getTrainingArena("moonlake");
assert.equal(arena.pathLabel, "月湖路徑");
ok("moonlake training arena");

// Chat must not inflate Impact by itself: sharedActionCount drives the shared term
const lowShared = projectOrbitCombatStats(
  { bond: 40, trust: 40, energy: 8, defense: 35, touchFatigue: 0 },
  { sharedActionCount: 0, highTensionMemoryCount: 0 }
);
const highShared = projectOrbitCombatStats(
  { bond: 40, trust: 40, energy: 8, defense: 35, touchFatigue: 0 },
  { sharedActionCount: 8, highTensionMemoryCount: 0 }
);
assert.ok(highShared.impact > lowShared.impact);
ok("impact rises with shared actions, not assumed chat");

const refused = projectOrbitCombatStats(
  { bond: 10, trust: 2, energy: 1, defense: 40, touchFatigue: 8 },
  {}
);
assert.equal(refused.canLaunch, false);
assert.ok(refused.refuseReason);
ok("low energy can refuse launch");

const state = {
  bond: 30,
  trust: 20,
  energy: 7,
  defense: 35,
  touchFatigue: 1,
  habitatTraces: [{ id: "t1" }, { id: "t2" }],
  emotionalMemories: [{ intensity: 0.8 }, { intensity: 0.3 }]
};
const projected = projectOrbitCombatStats(
  vitalsFromState(state),
  recentEvidenceFromState(state)
);
assert.ok(projected.impact >= 12 && projected.impact <= 92);
assert.ok(projected.spin >= 14);
assert.ok(projected.canLaunch);
ok("vitals/evidence helpers");

let session = createOrbitSession({ stats: projected, arena });
assert.equal(session.phase, "aiming");
session = launchOrbitSession(session, 0, 0.35);
assert.equal(session.phase, "spinning");
assert.ok(session.player.vy < 0 || Math.abs(session.player.vx) + Math.abs(session.player.vy) > 0);
ok("launch enters spinning");

// Simulate until resolve or cap steps
let steps = 0;
while (session.phase === "spinning" && steps < 4000) {
  session = stepOrbitSession(session, 1 / 30);
  steps += 1;
}
assert.ok(session.phase === "resolved" || steps === 4000);
if (session.phase === "resolved") {
  assert.ok(["stabilized", "recovered", "retreated", "overwhelmed_but_safe"].includes(session.outcome.key));
  assert.ok(session.companionLine);
}
ok("spinning session eventually resolves or hits step cap");

const retreated = retreatOrbitSession(
  createOrbitSession({ stats: projected, arena })
);
assert.equal(retreated.phase, "resolved");
assert.equal(retreated.outcome.key, "retreated");
const comfortLine = companionLineForOutcome("overwhelmed_but_safe", { personaBias: "comfort" });
assert.match(comfortLine, /休息|旁邊|還在/);
ok("retreat maps to retreated; defeat line is comfort-biased");

const mapped = mapOrbitResultToOutcome({
  reason: "dummy_burst",
  playerStability: 70,
  dummyStability: 0,
  hits: 3,
  overheat: 10
});
assert.ok(mapped.key === "recovered" || mapped.key === "stabilized");
ok("dummy burst maps to non-punitive win outcomes");

console.log("\nAll orbit battle prototype cases passed.");
