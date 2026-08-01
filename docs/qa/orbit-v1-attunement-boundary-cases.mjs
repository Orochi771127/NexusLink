/**
 * Heartcore Orbit V1 attunement / visible rewrite / Boundary Resonance cases.
 * Run: node docs/qa/orbit-v1-attunement-boundary-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const fromRepo = (relativePath) =>
  pathToFileURL(path.join(repoRoot, relativePath)).href;

const { MOONLAKE_CAMP_SLICE } = await import(
  fromRepo("src/data/orbit/stages/index.js")
);
const {
  ORBIT_ATTUNEMENT_DECISIONS,
  createOrbitAttunementSnapshot
} = await import(fromRepo("src/orbit/orbitAttunement.js"));
const {
  confirmOrbitAttunement,
  createOrbitSession,
  launchOrbitSession,
  selectOrbitLaunchStance,
  stepOrbitSession,
  triggerOrbitResonancePulse
} = await import(fromRepo("src/orbit/orbitEngine.js"));
const { ORBIT_PHYSICS_MODELS } = await import(
  fromRepo("src/orbit/orbitPhysics.js")
);

const stats = {
  impact: 38,
  spin: 42,
  guard: 46,
  burst: 18,
  overheat: 0,
  canLaunch: true
};

function ok(name) {
  console.log(`PASS  ${name}`);
}

function attune(vitals, extra = {}) {
  return createOrbitAttunementSnapshot(vitals, {
    defaultStanceId: MOONLAKE_CAMP_SLICE.defaultLaunchStanceId,
    ...MOONLAKE_CAMP_SLICE.attunement,
    ...extra
  });
}

function createAttunedSession(vitals = {
  mood: "calm",
  energy: 10,
  trust: 30,
  touchFatigue: 0
}) {
  return createOrbitSession({
    stats,
    stage: MOONLAKE_CAMP_SLICE,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    prototypeSlice: true,
    nonPersistent: true,
    attunement: attune(vitals)
  });
}

const calm = attune({ mood: "calm", energy: 10, trust: 30 });
assert.equal(calm.decision, ORBIT_ATTUNEMENT_DECISIONS.accept);
assert.equal(calm.canStart, true);
assert.equal(calm.proposedStanceId, "upright");
assert.equal(calm.maxPullDistance, 0.55);
assert.deepEqual(
  calm,
  attune({ mood: "calm", energy: 10, trust: 30 })
);
ok("calm attunement accepts with an exact deterministic Energy envelope");

const guarded = attune({
  mood: "defensive",
  energy: 8,
  trust: 18,
  touchFatigue: 1
});
const alert = attune({ mood: "alert", energy: 8, trust: 18 });
assert.equal(guarded.decision, ORBIT_ATTUNEMENT_DECISIONS.rewrite);
assert.equal(guarded.proposedStanceId, "conservative");
assert.equal(guarded.moodLabel, "護界");
assert.equal(alert.decision, ORBIT_ATTUNEMENT_DECISIONS.rewrite);
assert.equal(alert.proposedStanceId, "tilted");
assert.equal(alert.moodLabel, "警醒");
ok("named Mood expressions produce visible rewrites without random deviation");

const lowTrustCalm = attune({ mood: "calm", energy: 8, trust: 2 });
const highTrustCalm = attune({ mood: "calm", energy: 8, trust: 90 });
assert.equal(lowTrustCalm.proposedStanceId, highTrustCalm.proposedStanceId);
assert.equal(lowTrustCalm.maxPullDistance, highTrustCalm.maxPullDistance);
assert.notEqual(lowTrustCalm.trustLine, highTrustCalm.trustLine);
ok("Trust changes willingness legibility, not stance or physics authority");

const resting = attune({ mood: "tired", energy: 2, trust: 40 });
const refusing = attune(
  { mood: "calm", energy: 10, trust: 70 },
  { safetyPaused: true }
);
assert.equal(resting.decision, ORBIT_ATTUNEMENT_DECISIONS.rest);
assert.equal(resting.canStart, false);
assert.equal(refusing.decision, ORBIT_ATTUNEMENT_DECISIONS.refuse);
assert.equal(refusing.canStart, false);
ok("rest and high-risk refusal stop before a gameplay session can start");

let locked = createAttunedSession();
assert.equal(locked.attunementConfirmed, false);
assert.equal(launchOrbitSession(locked, -1, 0), locked);
locked = selectOrbitLaunchStance(locked, "tilted");
assert.equal(locked.launchStanceId, "tilted");
locked = confirmOrbitAttunement(locked);
assert.equal(locked.attunementConfirmed, true);
assert.equal(locked.confirmedLaunchPlan.stanceId, "tilted");
assert.equal(selectOrbitLaunchStance(locked, "upright"), locked);
const launched = launchOrbitSession(locked, -1, 0);
assert.equal(launched.phase, "spinning");
assert.equal(launched.launchInput.wasClamped, true);
assert.ok(
  Math.abs(
    launched.launchInput.pullDistance -
    locked.confirmedLaunchPlan.maxPullDistance
  ) < 1e-12
);
ok("confirmation locks the visible plan and clamps launch to the shown envelope");

let boundarySession = confirmOrbitAttunement(createAttunedSession());
boundarySession = {
  ...boundarySession,
  phase: "spinning",
  softWell: null,
  driftField: null,
  player: {
    ...boundarySession.player,
    x: 0.968,
    y: 0,
    vx: 1.4,
    vy: 0,
    spin: 62,
    driveScale: 0
  }
};
const objectiveBeforeBoundary = boundarySession.objectiveIndex;
boundarySession = stepOrbitSession(boundarySession, 1 / 120);
assert.equal(boundarySession.boundaryResonanceCount, 1);
assert.equal(boundarySession.boundaryChargesRemaining, 0);
assert.equal(boundarySession.boundaryChargeSpent, 1);
assert.equal(boundarySession.objectiveIndex, objectiveBeforeBoundary);
assert.ok(
  boundarySession.boundaryResonanceTrace.outputSpeed <=
    boundarySession.boundaryResonanceTrace.inputSpeed + 1e-12
);
assert.ok(
  boundarySession.boundaryResonanceTrace.outputSpin <=
    boundarySession.boundaryResonanceTrace.inputSpin + 1e-12
);
const afterFirstRail = boundarySession;
for (let step = 0; step < 60; step += 1) {
  boundarySession = stepOrbitSession(boundarySession, 1 / 120);
}
assert.equal(boundarySession.boundaryResonanceCount, 1);
assert.equal(boundarySession.progressEligible, false);
assert.equal(triggerOrbitResonancePulse(afterFirstRail).objectiveIndex, objectiveBeforeBoundary);
ok("Boundary Resonance debits 1/1, creates no energy, and never resolves an objective directly");

function boundarySnapshot(hz) {
  let session = confirmOrbitAttunement(createAttunedSession());
  session = {
    ...session,
    phase: "spinning",
    softWell: null,
    driftField: null,
    player: {
      ...session.player,
      x: 0.968,
      y: 0,
      vx: 1.4,
      vy: 0,
      spin: 62,
      driveScale: 0
    }
  };
  for (let frame = 0; frame < hz; frame += 1) {
    session = stepOrbitSession(session, 1 / hz);
  }
  return {
    phase: session.phase,
    elapsed: session.elapsed,
    objectiveIndex: session.objectiveIndex,
    boundaryChargesRemaining: session.boundaryChargesRemaining,
    boundaryResonanceCount: session.boundaryResonanceCount,
    lastBoundaryRailId: session.lastBoundaryRailId,
    trace: session.boundaryResonanceTrace,
    player: session.player
  };
}

assert.deepEqual(boundarySnapshot(30), boundarySnapshot(60));
assert.deepEqual(boundarySnapshot(60), boundarySnapshot(120));
ok("attuned Boundary Resonance replay is exact at 30/60/120 Hz");

const controllerSource = fs.readFileSync(
  path.join(repoRoot, "src/ui/orbitBattleController.js"),
  "utf8"
);
const cssSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
assert.ok(controllerSource.includes("createOrbitAttunementSnapshot"));
assert.ok(controllerSource.includes("state.safeHarborMode === true"));
assert.ok(controllerSource.includes('data-orbit-action="confirm-attunement"'));
assert.ok(controllerSource.includes("drawBoundaryRails"));
assert.ok(controllerSource.includes("prefers-reduced-motion: reduce"));
assert.ok(controllerSource.includes("本切片未寫入路徑、微光、Growth 或存檔"));
assert.ok(cssSource.includes(".orbit-attunement-panel"));
assert.ok(cssSource.includes("@media (max-width: 420px)"));
ok("Canvas-adjacent controls, high-risk gate, mobile CSS, and zero-write copy remain wired");

console.log("\nAll Heartcore Orbit V1 attunement / Boundary Resonance cases passed.");
