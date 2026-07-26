/**
 * Nexus Spin Hybrid Physics Sandbox cases.
 * Run: node docs/qa/orbit-hybrid-physics-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const physics = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitPhysics.js")).href
);
const engine = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitEngine.js")).href
);

const {
  DEFAULT_FRICTION,
  DEFAULT_SPIN_DECAY,
  HYBRID_SPIN_PHASES,
  ORBIT_PHYSICS_MODELS,
  PHYSICS_FIXED_DT,
  collideBodies,
  createBody,
  stepBody
} = physics;
const {
  createOrbitSession,
  launchOrbitSession,
  stepOrbitSession
} = engine;

function ok(name) {
  console.log(`PASS  ${name}`);
}

const baseline = createBody({ id: "baseline" });
const hybrid = createBody({
  id: "hybrid",
  physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
  spinDirection: -1,
  tilt: 0.12,
  wobble: 0.08
});
assert.equal(baseline.physicsModel, ORBIT_PHYSICS_MODELS.baseline);
assert.equal(hybrid.physicsModel, ORBIT_PHYSICS_MODELS.hybridSpin);
assert.equal(hybrid.spinDirection, -1);
assert.equal(hybrid.spinPhase, HYBRID_SPIN_PHASES.launch);
assert.equal(hybrid.spinAge, 0);
ok("Hybrid Spin is opt-in; baseline bodies keep the R6 model");

let lifecycle = createBody({
  id: "lifecycle",
  vx: 0.15,
  spin: 90,
  stability: 100,
  physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin
});
const phases = new Set([lifecycle.spinPhase]);
for (let step = 0; step < 14 * 120; step += 1) {
  lifecycle = stepBody(lifecycle, PHYSICS_FIXED_DT, {
    friction: DEFAULT_FRICTION,
    spinDecay: DEFAULT_SPIN_DECAY,
    arenaRadius: 999
  });
  phases.add(lifecycle.spinPhase);
}
assert.ok(phases.has(HYBRID_SPIN_PHASES.launch));
assert.ok(phases.has(HYBRID_SPIN_PHASES.stable));
assert.ok(phases.has(HYBRID_SPIN_PHASES.curving));
assert.ok(phases.has(HYBRID_SPIN_PHASES.wobbling));
assert.ok(lifecycle.tilt > 0.12);
assert.ok(lifecycle.wobble > 0.08);
ok("body lifecycle advances launch → stable → curving → wobbling");

function runDirection(direction) {
  let body = createBody({
    id: `direction-${direction}`,
    vx: 1.2,
    spin: 90,
    stability: 100,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    spinDirection: direction
  });
  for (let step = 0; step < 45; step += 1) {
    body = stepBody(body, PHYSICS_FIXED_DT, {
      friction: DEFAULT_FRICTION,
      spinDecay: DEFAULT_SPIN_DECAY,
      arenaRadius: 10
    });
  }
  return body;
}

const clockwise = runDirection(1);
const counterClockwise = runDirection(-1);
assert.ok(clockwise.y > 0);
assert.ok(counterClockwise.y < 0);
assert.ok(Math.abs(clockwise.y + counterClockwise.y) < 1e-12);
ok("spin direction deterministically mirrors trajectory curvature");

const colliderA = createBody({
  id: "a",
  x: -0.08,
  vx: 1,
  spin: 80,
  stability: 100,
  radius: 0.11,
  physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin
});
const colliderB = createBody({
  id: "b",
  x: 0.08,
  vx: -1,
  spin: 70,
  stability: 100,
  radius: 0.11,
  physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
  spinDirection: -1
});
const collision = collideBodies(colliderA, colliderB, 55, 45, 50, 50);
assert.equal(collision.hit, true);
assert.ok(collision.a.vx < 0 && collision.b.vx > 0);
assert.ok(collision.a.stability < colliderA.stability);
assert.ok(collision.b.stability < colliderB.stability);
assert.ok(collision.a.tilt > colliderA.tilt);
assert.ok(collision.b.wobble > colliderB.wobble);
ok("Hybrid collision changes trajectory, stability, tilt, and wobble");

const boundaryStopped = stepBody(
  createBody({
    id: "boundary",
    x: 1.2,
    vx: 0.2,
    spin: 20,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin
  }),
  PHYSICS_FIXED_DT,
  { arenaRadius: 1 }
);
assert.equal(boundaryStopped.out, true);
assert.equal(boundaryStopped.spinPhase, HYBRID_SPIN_PHASES.stopped);
ok("leaving the arena terminates the Hybrid Spin lifecycle");

function snapshotAtHz(hz) {
  let session = createOrbitSession({
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    sandbox: true
  });
  session = launchOrbitSession(session, 0.18, 0.42);
  for (let frame = 0; frame < hz * 2; frame += 1) {
    session = stepOrbitSession(session, 1 / hz);
    if (session.phase === "resolved") break;
  }
  return {
    phase: session.phase,
    elapsed: session.elapsed,
    hits: session.hits,
    progressEligible: session.progressEligible,
    outcome: session.outcome?.reason || null,
    player: {
      x: session.player.x,
      y: session.player.y,
      vx: session.player.vx,
      vy: session.player.vy,
      spin: session.player.spin,
      stability: session.player.stability,
      tilt: session.player.tilt,
      wobble: session.player.wobble,
      spinAge: session.player.spinAge,
      spinPhase: session.player.spinPhase
    },
    dummy: {
      x: session.dummy.x,
      y: session.dummy.y,
      vx: session.dummy.vx,
      vy: session.dummy.vy,
      spin: session.dummy.spin,
      stability: session.dummy.stability,
      tilt: session.dummy.tilt,
      wobble: session.dummy.wobble,
      spinAge: session.dummy.spinAge,
      spinPhase: session.dummy.spinPhase
    }
  };
}

const snapshot30 = snapshotAtHz(30);
const snapshot60 = snapshotAtHz(60);
const snapshot120 = snapshotAtHz(120);
assert.deepEqual(snapshot30, snapshot60);
assert.deepEqual(snapshot60, snapshot120);
ok("Hybrid Spin session is identical at 30/60/120 Hz");

let sandboxWin = createOrbitSession({
  physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
  sandbox: true,
  stage: {
    id: "hybrid-sandbox-qa",
    title: "Hybrid Sandbox QA",
    regionId: "moonlake",
    goal: "survive",
    goalLabel: "QA",
    surviveSeconds: PHYSICS_FIXED_DT,
    arenaRadius: 10
  }
});
sandboxWin = launchOrbitSession(sandboxWin, 0, 0.2);
sandboxWin = stepOrbitSession(sandboxWin, PHYSICS_FIXED_DT);
assert.equal(sandboxWin.phase, "resolved");
assert.equal(sandboxWin.outcome.reason, "survived");
assert.equal(sandboxWin.progressEligible, false);
ok("sandbox wins cannot become path-progress or settlement eligible");

const controllerSource = fs.readFileSync(
  path.join(repoRoot, "src/ui/orbitBattleController.js"),
  "utf8"
);
assert.ok(controllerSource.includes('.get("orbitSandbox") === "1"'));
assert.ok(controllerSource.includes('querySelector(".orbit-battle .orbit-status")'));
assert.doesNotMatch(controllerSource, /querySelector\(["']\.orbit-status["']\)/);
ok("sandbox query route and battle-only status selector stay wired");

console.log("\nAll Orbit Hybrid Physics Sandbox cases passed.");
