/**
 * Orbit R10 energy and ring-out repair cases.
 * Run: node docs/qa/orbit-energy-ringout-cases.mjs
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
const stages = await import(
  pathToFileURL(path.join(repoRoot, "src/data/orbit/stages/index.js")).href
);

const {
  BODY_RESTITUTION,
  COLLISION_ENERGY_RETENTION,
  DEFAULT_SPEED_CAP,
  PHYSICS_FIXED_DT,
  SPIN_TARGET_SPEED,
  WALL_BOUNCE,
  collideBodies,
  collidePillars,
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

assert.equal(WALL_BOUNCE, 0.82);
assert.equal(BODY_RESTITUTION, 0.78);
assert.equal(COLLISION_ENERGY_RETENTION, 0.96);
assert.equal(SPIN_TARGET_SPEED, 3.2);
assert.equal(DEFAULT_SPEED_CAP, 4.2);
ok("R10 bounded-energy constants stay explicit");

const wallBefore = createBody({
  id: "wall-before",
  x: 0.965,
  vx: 1.5,
  spin: 80,
  driveScale: 0,
  speedCap: 4.2
});
const wallAfter = stepBody(wallBefore, PHYSICS_FIXED_DT, {
  arenaRadius: 1,
  containAtBoundary: true,
  friction: 0,
  spinDecay: 0
});
assert.ok(Math.hypot(wallAfter.vx, wallAfter.vy) <= 1.5 * WALL_BOUNCE + 1e-12);
assert.equal(wallAfter.spin, 78);
assert.equal(wallAfter.out, false);
ok("neutral wall loses speed and spin instead of accelerating");

const inwardAfter = stepBody(
  createBody({
    id: "wall-inward",
    x: 0.98,
    vx: -1,
    spin: 0,
    driveScale: 0
  }),
  PHYSICS_FIXED_DT,
  {
    arenaRadius: 1,
    containAtBoundary: true,
    friction: 0,
    spinDecay: 0
  }
);
assert.ok(inwardAfter.vx < 0);
ok("boundary correction does not reflect an already inward-moving body");

const pillarBefore = createBody({
  id: "pillar-before",
  x: -0.165,
  vx: 1,
  spin: 80,
  driveScale: 0
});
const pillarAfter = collidePillars(pillarBefore, [{ x: 0, y: 0, r: 0.08 }]);
assert.ok(Math.hypot(pillarAfter.vx, pillarAfter.vy) <= WALL_BOUNCE + 1e-12);
assert.equal(pillarAfter.spin, 79);
ok("neutral pillar loses speed and spin instead of accelerating");

const colliderA = createBody({
  id: "baseline-a",
  x: -0.08,
  vx: 1,
  radius: 0.11,
  spin: 80
});
const colliderB = createBody({
  id: "baseline-b",
  x: 0.08,
  vx: -1,
  radius: 0.11,
  spin: 70
});
const energyBefore =
  colliderA.vx ** 2 +
  colliderA.vy ** 2 +
  colliderB.vx ** 2 +
  colliderB.vy ** 2;
const collision = collideBodies(colliderA, colliderB, 55, 45, 50, 50);
const energyAfter =
  collision.a.vx ** 2 +
  collision.a.vy ** 2 +
  collision.b.vx ** 2 +
  collision.b.vy ** 2;
assert.equal(collision.hit, true);
assert.ok(collision.a.vx < 0 && collision.b.vx > 0);
assert.ok(energyAfter <= energyBefore * COLLISION_ENERGY_RETENTION + 1e-12);
ok("baseline body collision uses approaching velocity and respects energy budget");

const separating = collideBodies(
  { ...colliderA, vx: -1 },
  { ...colliderB, vx: 1 },
  55,
  45,
  50,
  50
);
assert.equal(separating.hit, false);
ok("separating overlap does not receive a second collision impulse");

const stage = stages.getOrbitStageById("moonlake-3");
assert.equal(stage.goal, "survive");
assert.equal(stage.surviveSeconds, 15);
assert.equal(stage.containedArena, true);
assert.equal(stage.physicsTuning.speedCap, 2.8);
assert.ok(stage.collisionTuning.damageScaleToA < 0.25);
ok("Moonlake stage 3 is a contained 15-second survival objective");

const stats = { impact: 55, spin: 60, guard: 60, burst: 20, overheat: 5 };
const pulls = [0.08, 0.15, 0.25, 0.35, 0.45, 0.55];
const angles = Array.from(
  { length: 24 },
  (_, index) => (index * Math.PI * 2) / 24
);
let survived = 0;
let maxRuntimeSpeed = 0;
for (const pull of pulls) {
  for (const angle of angles) {
    let session = createOrbitSession({ stats, stage });
    session = launchOrbitSession(
      session,
      Math.cos(angle) * pull,
      Math.sin(angle) * pull
    );
    assert.ok(
      Math.hypot(session.player.vx, session.player.vy) <=
        session.player.speedCap + 1e-12
    );
    while (session.phase === "spinning" && session.elapsed < 16) {
      session = stepOrbitSession(session, 1 / 60);
      maxRuntimeSpeed = Math.max(
        maxRuntimeSpeed,
        Math.hypot(session.player.vx, session.player.vy)
      );
      assert.ok(
        Math.hypot(session.player.vx, session.player.vy) <=
          session.player.speedCap + 1e-12
      );
    }
    if (session.outcome?.reason === "survived") survived += 1;
  }
}
assert.ok(
  survived >= 132,
  `stage 3 should survive at least 90% of the 144-shot sweep; got ${survived}`
);
assert.ok(maxRuntimeSpeed <= stage.physicsTuning.speedCap + 1e-12);
ok(`stage 3 survives ${survived}/144 deterministic launch samples`);

function snapshotAtHz(hz) {
  let session = createOrbitSession({ stats, stage });
  session = launchOrbitSession(session, 0.15, 0);
  for (let frame = 0; frame < hz * 16; frame += 1) {
    session = stepOrbitSession(session, 1 / hz);
    if (session.phase === "resolved") break;
  }
  return {
    phase: session.phase,
    elapsed: session.elapsed,
    hits: session.hits,
    outcome: session.outcome?.reason,
    player: session.player,
    dummy: session.dummy
  };
}

const snapshot30 = snapshotAtHz(30);
const snapshot60 = snapshotAtHz(60);
const snapshot120 = snapshotAtHz(120);
assert.deepEqual(snapshot30, snapshot60);
assert.deepEqual(snapshot60, snapshot120);
assert.equal(snapshot60.outcome, "survived");
ok("stage 3 remains exact-match deterministic at 30/60/120 Hz");

console.log("\nAll Orbit R10 energy and ring-out cases passed.");
