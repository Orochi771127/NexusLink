/**
 * PACK R3 — Orbit duel CPU / ghost cases.
 * Run: node docs/qa/orbit-duel-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const { CPU_DUEL_PROFILES, GHOST_DUEL_PROFILE, scaleStatsForOpponent, listDuelProfiles } =
  await import(pathToFileURL(path.join(repoRoot, "src/data/orbit/duelProfiles.js")).href);

const {
  createOrbitDuelSession,
  launchOrbitDuelPlayer,
  stepOrbitDuel,
  retreatOrbitDuel
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitDuelEngine.js")).href);

const {
  resetOrbitDuelBudgetForTests,
  canStartOrbitDuel,
  recordOrbitDuelFinished,
  getOrbitDuelBudgetSnapshot
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitDuelBudget.js")).href);

const {
  resetOrbitGhostForTests,
  recordOrbitGhostPull,
  hasOrbitGhostRecording,
  getOrbitGhostRecording
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitGhostRecorder.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

resetOrbitDuelBudgetForTests();
resetOrbitGhostForTests();

assert.ok(listDuelProfiles().length >= 3);
assert.equal(CPU_DUEL_PROFILES.mirror.mode, "cpu");
assert.equal(GHOST_DUEL_PROFILE.mode, "ghost");
ok("duel profiles include cpu + ghost");

const playerStats = { impact: 50, spin: 55, guard: 60, burst: 20, overheat: 15 };
const foe = scaleStatsForOpponent(playerStats, CPU_DUEL_PROFILES.mirror);
assert.ok(foe.impact > 0 && foe.impact <= playerStats.impact);
ok("opponent stats are scaled projections, not independent ATK tree");

let session = createOrbitDuelSession({
  playerStats,
  profile: CPU_DUEL_PROFILES.mirror
});
assert.equal(session.phase, "aiming");
assert.equal(session.player.team, "player");
assert.equal(session.foe.team, "foe");
session = launchOrbitDuelPlayer(session, 0, 0.4);
assert.equal(session.phase, "spinning");
assert.equal(session.foeLaunched, false);

let steps = 0;
while (session.phase === "spinning" && steps < 5000) {
  session = stepOrbitDuel(session, 1 / 30);
  steps += 1;
}
assert.equal(session.phase, "resolved");
assert.ok(["player", "foe", "none"].includes(session.winner));
assert.ok(session.companionLine);
// Must not invent bond deltas on outcome object
assert.equal(session.outcome.bondDelta, undefined);
ok("CPU duel can complete a bout");

const retreated = retreatOrbitDuel(
  launchOrbitDuelPlayer(
    createOrbitDuelSession({ playerStats, profile: CPU_DUEL_PROFILES.pressure }),
    0.1,
    0.3
  )
);
assert.equal(retreated.phase, "resolved");
assert.equal(retreated.outcome.reason, "retreat");
ok("retreat always available");

// Ghost recording
assert.equal(hasOrbitGhostRecording(), false);
recordOrbitGhostPull(0.12, 0.4);
assert.equal(hasOrbitGhostRecording(), true);
assert.equal(getOrbitGhostRecording().pullDy, 0.4);
ok("ghost pull can be recorded");

// Budget: 3 consecutive then rest
resetOrbitDuelBudgetForTests();
assert.equal(canStartOrbitDuel({ overheat: 20 }).ok, true);
recordOrbitDuelFinished(1_000);
recordOrbitDuelFinished(2_000);
recordOrbitDuelFinished(3_000);
const blocked = canStartOrbitDuel({ overheat: 20 }, 4_000);
assert.equal(blocked.ok, false);
assert.match(blocked.reason, /休息|降溫|連打/);
const snap = getOrbitDuelBudgetSnapshot();
assert.ok(snap.forcedRestUntil >= 4_000);
ok("overheat/session budget blocks consecutive duels");

// High overheat + 2 consecutive also blocks
resetOrbitDuelBudgetForTests();
recordOrbitDuelFinished(10_000);
recordOrbitDuelFinished(11_000);
const hot = canStartOrbitDuel({ overheat: 80 }, 12_000);
assert.equal(hot.ok, false);
ok("high overheat with consecutive duels refuses launch");

console.log("\nAll orbit duel cases passed.");
