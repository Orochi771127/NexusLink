/**
 * Orbit feel / deterministic baseline cases.
 * Run: node docs/qa/orbit-feel-cases.mjs
 */

import assert from "node:assert/strict";
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

function ok(name) {
  console.log(`PASS  ${name}`);
}

const {
  LAUNCH_PULL_MIN,
  LAUNCH_PULL_MAX,
  LAUNCH_CHARGE_EXP,
  LAUNCH_SPEED_BASE,
  DEFAULT_SPIN_DECAY,
  DEFAULT_FRICTION,
  SPIN_CURVE_STRENGTH,
  SPIN_DRIVE,
  PHYSICS_FIXED_DT,
  PHYSICS_MAX_STEPS_PER_FRAME,
  COLLIDE_DAMAGE_MAX_TO_B,
  COLLIDE_DAMAGE_MAX_TO_A,
  launchVelocityFromPull,
  createBody,
  planFixedPhysicsSteps,
  stepBody
} = physics;
const {
  createOrbitSession,
  launchOrbitSession,
  stepOrbitSession
} = engine;

assert.equal(LAUNCH_PULL_MIN, 0.04);
assert.equal(LAUNCH_PULL_MAX, 0.55);
assert.equal(LAUNCH_CHARGE_EXP, 0.82);
assert.equal(LAUNCH_SPEED_BASE, 1.05);
assert.equal(DEFAULT_SPIN_DECAY, 5.4);
assert.equal(DEFAULT_FRICTION, 0.05);
assert.ok(SPIN_CURVE_STRENGTH >= 1);
assert.equal(SPIN_DRIVE, 5.4);
assert.equal(PHYSICS_FIXED_DT, 1 / 120);
assert.equal(PHYSICS_MAX_STEPS_PER_FRAME, 6);
assert.equal(COLLIDE_DAMAGE_MAX_TO_B, 30);
assert.equal(COLLIDE_DAMAGE_MAX_TO_A, 26);
ok("R6 feel constants match deterministic tuning");

const short = launchVelocityFromPull(0, 0.12, 50);
const mid = launchVelocityFromPull(0, 0.28, 50);
const long = launchVelocityFromPull(0, 0.5, 50);
const shortSpeed = Math.hypot(short.vx, short.vy);
const midSpeed = Math.hypot(mid.vx, mid.vy);
const longSpeed = Math.hypot(long.vx, long.vy);
assert.ok(shortSpeed < midSpeed && midSpeed < longSpeed);
assert.ok(short.charge < mid.charge && mid.charge <= long.charge);
ok("launch speed / charge increase with pull length");

const lowImpact = launchVelocityFromPull(0, 0.35, 20);
const highImpact = launchVelocityFromPull(0, 0.35, 90);
assert.ok(Math.hypot(highImpact.vx, highImpact.vy) > Math.hypot(lowImpact.vx, lowImpact.vy));
ok("Impact projection scales launch speed");

// 短拉仍可控，但長拉要有明顯爆發
assert.ok(shortSpeed < longSpeed * 0.72);
// R6：地板從 1.8 提到 3.2，鎖住這次提速的下限，避免日後不小心調回慢速卻沒被抓到
assert.ok(longSpeed > 3.2, `long pull should feel fast (R6 target), got ${longSpeed}`);
ok("short pull controllable; long pull has speed punch");

// 高轉速會彎軌：同初速下，spin 高者側向偏移更大
const straight = createBody({ x: 0, y: 0, vx: 1.2, vy: 0, spin: 10 });
const curving = createBody({ x: 0, y: 0, vx: 1.2, vy: 0, spin: 90 });
let a = straight;
let b = curving;
for (let i = 0; i < 45; i += 1) {
  a = stepBody(a, PHYSICS_FIXED_DT, {
    friction: DEFAULT_FRICTION,
    spinDecay: DEFAULT_SPIN_DECAY,
    arenaRadius: 10
  });
  b = stepBody(b, PHYSICS_FIXED_DT, {
    friction: DEFAULT_FRICTION,
    spinDecay: DEFAULT_SPIN_DECAY,
    arenaRadius: 10
  });
}
assert.ok(Math.abs(b.y) > Math.abs(a.y) + 0.04, "high spin should curve more than low spin");
ok("spin curves trajectory (beyblade-like, not pure marble)");

function runSessionAtHz(hz) {
  let session = createOrbitSession();
  session = launchOrbitSession(session, 0.18, 0.42);
  for (let frame = 0; frame < hz * 2; frame += 1) {
    session = stepOrbitSession(session, 1 / hz);
    if (session.phase === "resolved") break;
  }
  return {
    phase: session.phase,
    elapsed: session.elapsed,
    hits: session.hits,
    outcome: session.outcome?.reason || null,
    player: {
      x: session.player.x,
      y: session.player.y,
      vx: session.player.vx,
      vy: session.player.vy,
      spin: session.player.spin,
      stability: session.player.stability,
      out: session.player.out
    },
    dummy: {
      x: session.dummy.x,
      y: session.dummy.y,
      vx: session.dummy.vx,
      vy: session.dummy.vy,
      spin: session.dummy.spin,
      stability: session.dummy.stability,
      out: session.dummy.out
    }
  };
}

const plan30 = planFixedPhysicsSteps(0, 1 / 30);
const plan60 = planFixedPhysicsSteps(0, 1 / 60);
const plan120 = planFixedPhysicsSteps(0, 1 / 120);
assert.deepEqual(
  [plan30.steps, plan60.steps, plan120.steps],
  [4, 2, 1]
);
ok("30/60/120 Hz frame deltas map to the same 120 Hz physics clock");

const session30 = runSessionAtHz(30);
const session60 = runSessionAtHz(60);
const session120 = runSessionAtHz(120);
assert.deepEqual(session30, session60);
assert.deepEqual(session60, session120);
ok("same launch resolves identically at 30/60/120 Hz");

console.log("\nAll orbit feel cases passed.");
