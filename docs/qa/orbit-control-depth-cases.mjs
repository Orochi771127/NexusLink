/**
 * Nexus Spin control-depth prototype cases.
 * Run: node docs/qa/orbit-control-depth-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const { MOONLAKE_CAMP_SLICE } = await import(
  pathToFileURL(
    path.join(repoRoot, "src/data/orbit/stages/index.js")
  ).href
);
const {
  createOrbitSession,
  launchOrbitSession,
  selectOrbitLaunchStance,
  stepOrbitSession,
  triggerOrbitResonancePulse
} = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitEngine.js")).href
);
const { ORBIT_PHYSICS_MODELS } = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitPhysics.js")).href
);

const stats = {
  impact: 18,
  spin: 22,
  guard: 40,
  burst: 10,
  overheat: 0,
  canLaunch: true
};

function ok(name) {
  console.log(`PASS  ${name}`);
}

function createSliceSession(stanceId = "upright") {
  let session = createOrbitSession({
    stats,
    stage: MOONLAKE_CAMP_SLICE,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    prototypeSlice: true,
    nonPersistent: true
  });
  session = selectOrbitLaunchStance(session, stanceId);
  return session;
}

assert.deepEqual(
  MOONLAKE_CAMP_SLICE.launchStances.map((stance) => stance.id),
  ["upright", "tilted", "conservative"]
);
assert.equal(MOONLAKE_CAMP_SLICE.defaultLaunchStanceId, "upright");
assert.equal(MOONLAKE_CAMP_SLICE.resonancePulse.enabled, true);
const aiming = createSliceSession();
assert.equal(aiming.launchStanceId, "upright");
assert.equal(aiming.resonancePulseUsed, false);
assert.equal(
  selectOrbitLaunchStance(aiming, "missing-stance"),
  aiming
);
ok("slice exposes exactly three data-driven launch stances and one pulse");

function launchedFor(stanceId) {
  return launchOrbitSession(
    createSliceSession(stanceId),
    -0.1,
    0.5
  );
}

const uprightLaunch = launchedFor("upright");
const tiltedLaunch = launchedFor("tilted");
const conservativeLaunch = launchedFor("conservative");
const speedOf = (session) =>
  Math.hypot(session.player.vx, session.player.vy);
assert.ok(speedOf(uprightLaunch) > speedOf(tiltedLaunch));
assert.ok(speedOf(tiltedLaunch) > speedOf(conservativeLaunch));
assert.ok(tiltedLaunch.player.tilt > uprightLaunch.player.tilt);
assert.ok(uprightLaunch.player.tilt > conservativeLaunch.player.tilt);
assert.ok(conservativeLaunch.player.spin > uprightLaunch.player.spin);
assert.equal(
  selectOrbitLaunchStance(uprightLaunch, "tilted"),
  uprightLaunch
);
ok("same pull produces predictable speed / tilt / spin stance differences");

function stepFor(session, seconds, hz = 120) {
  const frames = Math.round(seconds * hz);
  let next = session;
  for (let frame = 0; frame < frames; frame += 1) {
    next = stepOrbitSession(next, 1 / hz);
    if (next.phase === "resolved") break;
  }
  return next;
}

const stanceTrajectories = [
  stepFor(uprightLaunch, 0.75),
  stepFor(tiltedLaunch, 0.75),
  stepFor(conservativeLaunch, 0.75)
].map((session) => ({
  x: session.player.x,
  y: session.player.y
}));
assert.notDeepEqual(stanceTrajectories[0], stanceTrajectories[1]);
assert.notDeepEqual(stanceTrajectories[1], stanceTrajectories[2]);
assert.notDeepEqual(stanceTrajectories[0], stanceTrajectories[2]);
ok("stance choice remains visible in the autonomous trajectory");

let pulseCandidate = stepFor(launchedFor("upright"), 0.5);
const objectiveBefore = pulseCandidate.nextMemoryMoteIndex;
const targetBefore =
  pulseCandidate.memoryMotes[objectiveBefore] ||
  pulseCandidate.resonanceZone;
const targetVector = {
  x: targetBefore.x - pulseCandidate.player.x,
  y: targetBefore.y - pulseCandidate.player.y
};
function alignmentToTarget(session, vector) {
  const speed = Math.hypot(session.player.vx, session.player.vy);
  const distance = Math.hypot(vector.x, vector.y);
  return (
    (session.player.vx * vector.x + session.player.vy * vector.y) /
    ((speed || 1) * (distance || 1))
  );
}
const alignmentBefore = alignmentToTarget(
  pulseCandidate,
  targetVector
);
const speedBeforePulse = speedOf(pulseCandidate);
const pulsed = triggerOrbitResonancePulse(pulseCandidate);
assert.notEqual(pulsed, pulseCandidate);
assert.equal(pulsed.resonancePulseUsed, true);
assert.equal(pulsed.nextMemoryMoteIndex, objectiveBefore);
assert.equal(
  pulsed.resonanceHold,
  pulseCandidate.resonanceHold
);
assert.equal(pulsed.phase, "spinning");
assert.equal(pulsed.outcome, null);
assert.ok(speedOf(pulsed) < speedBeforePulse);
assert.ok(alignmentToTarget(pulsed, targetVector) > alignmentBefore);
assert.equal(triggerOrbitResonancePulse(pulsed), pulsed);
ok("pulse steers once without collecting a mote or resolving the stage");

function runStance(stanceId, hz = 60, pulseAt = null) {
  let session = launchedFor(stanceId);
  for (let frame = 0; frame < hz * 45; frame += 1) {
    session = stepOrbitSession(session, 1 / hz);
    if (
      pulseAt !== null &&
      !session.resonancePulseUsed &&
      session.elapsed + 1e-9 >= pulseAt
    ) {
      session = triggerOrbitResonancePulse(session);
    }
    if (session.phase === "resolved") break;
  }
  return session;
}

for (const stanceId of ["upright", "tilted", "conservative"]) {
  const completed = runStance(stanceId);
  assert.equal(completed.outcome?.reason, "camp_resonated");
  assert.equal(completed.nextMemoryMoteIndex, 3);
  assert.equal(completed.progressEligible, false);
}
ok("all three stances retain a zero-write completion route");

function deterministicPulseSnapshot(hz) {
  const session = runStance("tilted", hz, 1);
  return {
    phase: session.phase,
    elapsed: session.elapsed,
    outcome: session.outcome?.reason || null,
    launchStanceId: session.launchStanceId,
    resonancePulseUsed: session.resonancePulseUsed,
    nextMemoryMoteIndex: session.nextMemoryMoteIndex,
    resonanceHold: session.resonanceHold,
    progressEligible: session.progressEligible,
    player: {
      x: session.player.x,
      y: session.player.y,
      vx: session.player.vx,
      vy: session.player.vy,
      spin: session.player.spin,
      tilt: session.player.tilt,
      wobble: session.player.wobble,
      spinPhase: session.player.spinPhase,
      stability: session.player.stability,
      out: session.player.out
    }
  };
}

const snapshot30 = deterministicPulseSnapshot(30);
const snapshot60 = deterministicPulseSnapshot(60);
const snapshot120 = deterministicPulseSnapshot(120);
assert.deepEqual(snapshot30, snapshot60);
assert.deepEqual(snapshot60, snapshot120);
ok("fixed-time stance + pulse replay is identical at 30/60/120 Hz");

const controllerSource = fs.readFileSync(
  path.join(repoRoot, "src/ui/orbitBattleController.js"),
  "utf8"
);
const cssSource = fs.readFileSync(
  path.join(repoRoot, "styles.css"),
  "utf8"
);
assert.ok(controllerSource.includes("selectOrbitLaunchStance"));
assert.ok(controllerSource.includes("triggerOrbitResonancePulse"));
assert.ok(controllerSource.includes("data-orbit-stance"));
assert.ok(controllerSource.includes('data-orbit-action="pulse"'));
assert.ok(controllerSource.includes("可見改軌・發射後可用"));
assert.ok(controllerSource.includes("合息定軌"));
assert.ok(cssSource.includes(".orbit-control-depth"));
assert.ok(cssSource.includes(".orbit-stance-picker"));
assert.ok(cssSource.includes(".orbit-pulse-btn"));
assert.ok(cssSource.includes('content: "✓"'));
ok("390-friendly attunement, stance, and rewrite controls remain wired into the existing overlay");

console.log("\nAll Nexus Spin control-depth cases passed.");
