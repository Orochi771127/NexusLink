/**
 * Nexus Spin Moonlake Camp vertical-slice cases.
 * Run: node docs/qa/orbit-moonlake-camp-slice-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  MOONLAKE_CAMP_SLICE,
  getOrbitStageById,
  listStagesForRegion
} = await import(
  pathToFileURL(path.join(repoRoot, "src/data/orbit/stages/index.js")).href
);
const {
  createOrbitSession,
  launchOrbitSession,
  stepOrbitSession
} = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitEngine.js")).href
);
const {
  ORBIT_PHYSICS_MODELS,
  PHYSICS_FIXED_DT,
  createBody,
  stepBody
} = await import(
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

assert.equal(getOrbitStageById(MOONLAKE_CAMP_SLICE.id), MOONLAKE_CAMP_SLICE);
assert.equal(listStagesForRegion("moonlake").length, 25);
assert.equal(
  listStagesForRegion("moonlake").some(
    (stage) => stage.id === MOONLAKE_CAMP_SLICE.id
  ),
  false
);
assert.equal(MOONLAKE_CAMP_SLICE.goal, "collect_then_resonate");
assert.equal(MOONLAKE_CAMP_SLICE.dummyEnabled, false);
assert.equal(MOONLAKE_CAMP_SLICE.memoryMotes.length, 3);
ok("camp slice is addressable but does not widen the twenty-five-stage route");

function createSliceSession() {
  return createOrbitSession({
    stats,
    stage: MOONLAKE_CAMP_SLICE,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    prototypeSlice: true,
    nonPersistent: true
  });
}

const fresh = createSliceSession();
assert.equal(fresh.physicsModel, ORBIT_PHYSICS_MODELS.hybridSpin);
assert.equal(fresh.prototypeSlice, true);
assert.equal(fresh.nonPersistent, true);
assert.equal(fresh.dummyEnabled, false);
assert.equal(fresh.dummy.out, true);
assert.equal(fresh.nextMemoryMoteIndex, 0);
assert.equal(fresh.resonanceReady, false);
ok("slice reuses Hybrid Spin with no dummy or HP-clear target");

let ordered = launchOrbitSession(fresh, 0, 0.1);
ordered = {
  ...ordered,
  player: {
    ...ordered.player,
    x: ordered.memoryMotes[1].x,
    y: ordered.memoryMotes[1].y,
    vx: 0,
    vy: 0,
    spin: 0
  }
};
ordered = stepOrbitSession(ordered, PHYSICS_FIXED_DT);
assert.equal(ordered.nextMemoryMoteIndex, 0);
for (let index = 0; index < ordered.memoryMotes.length; index += 1) {
  const mote = ordered.memoryMotes[index];
  ordered = {
    ...ordered,
    player: {
      ...ordered.player,
      x: mote.x,
      y: mote.y,
      vx: 0,
      vy: 0,
      spin: 0
    }
  };
  ordered = stepOrbitSession(ordered, PHYSICS_FIXED_DT);
  assert.equal(ordered.nextMemoryMoteIndex, index + 1);
}
assert.equal(ordered.resonanceReady, true);
ok("memory motes only collect in the visible 1 → 2 → 3 order");

const initialStability = ordered.player.stability;
ordered = {
  ...ordered,
  player: {
    ...ordered.player,
    x: ordered.resonanceZone.x,
    y: ordered.resonanceZone.y,
    vx: 0,
    vy: 0,
    spin: 0
  }
};
for (let step = 0; step < 120 && ordered.phase === "spinning"; step += 1) {
  ordered = stepOrbitSession(ordered, PHYSICS_FIXED_DT);
}
assert.equal(ordered.phase, "resolved");
assert.equal(ordered.outcome.reason, "camp_resonated");
assert.equal(ordered.outcome.key, "recovered");
assert.equal(ordered.companionLine, MOONLAKE_CAMP_SLICE.companionLine);
assert.equal(ordered.player.stability, initialStability);
assert.equal(ordered.progressEligible, false);
ok("low-speed camp dwell resolves without damage or settlement eligibility");

const contained = stepBody(
  createBody({
    id: "contained",
    x: 0.98,
    vx: 5,
    spin: 70,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    speedCap: 3.4
  }),
  1 / 30,
  {
    arenaRadius: 1,
    containAtBoundary: true
  }
);
assert.equal(contained.out, false);
assert.ok(Math.hypot(contained.vx, contained.vy) <= 3.4 + 1e-12);
ok("camp arena contains the body and applies its local speed cap");

function runLaunch(dx, dy, hz = 60) {
  let session = createSliceSession();
  session = launchOrbitSession(session, dx, dy);
  for (let frame = 0; frame < hz * 45; frame += 1) {
    session = stepOrbitSession(session, 1 / hz);
    if (session.phase === "resolved") break;
  }
  return session;
}

const shortPull = runLaunch(-0.02, 0.14);
const mediumPull = runLaunch(-0.04, 0.22);
const longPull = runLaunch(-0.1, 0.5);
for (const session of [shortPull, mediumPull, longPull]) {
  assert.equal(session.outcome?.reason, "camp_resonated");
  assert.equal(session.nextMemoryMoteIndex, 3);
  assert.equal(session.progressEligible, false);
}
function initialSpeed(dx, dy) {
  const launched = launchOrbitSession(createSliceSession(), dx, dy);
  return Math.hypot(launched.player.vx, launched.player.vy);
}
const launchSpeeds = [
  initialSpeed(-0.02, 0.14),
  initialSpeed(-0.04, 0.22),
  initialSpeed(-0.1, 0.5)
];
assert.ok(launchSpeeds[0] < launchSpeeds[1]);
assert.ok(launchSpeeds[1] < launchSpeeds[2]);
assert.equal(
  new Set([
    shortPull.elapsed,
    mediumPull.elapsed,
    longPull.elapsed
  ]).size,
  3
);
ok("fresh-save short / medium / long pulls have distinct speeds and routes");

function deterministicSnapshot(hz) {
  const session = runLaunch(-0.1, 0.5, hz);
  return {
    phase: session.phase,
    elapsed: session.elapsed,
    outcome: session.outcome?.reason || null,
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

const snapshot30 = deterministicSnapshot(30);
const snapshot60 = deterministicSnapshot(60);
const snapshot120 = deterministicSnapshot(120);
assert.deepEqual(snapshot30, snapshot60);
assert.deepEqual(snapshot60, snapshot120);
ok("Moonlake Camp launch is identical at 30/60/120 Hz");

const controllerSource = fs.readFileSync(
  path.join(repoRoot, "src/ui/orbitBattleController.js"),
  "utf8"
);
assert.ok(controllerSource.includes('.get("orbitCampSlice") === "1"'));
assert.ok(controllerSource.includes("drawCampSliceField"));
assert.ok(controllerSource.includes("drawObjectiveProgress"));
assert.ok(controllerSource.includes("本切片未寫入路徑、微光、Growth 或存檔"));
assert.doesNotMatch(
  controllerSource,
  /querySelector\(["']\.orbit-companion-line["']\)/
);
ok("hidden slice entry, readable objective HUD, and zero-write copy stay wired");

console.log("\nAll Moonlake Camp slice cases passed.");
