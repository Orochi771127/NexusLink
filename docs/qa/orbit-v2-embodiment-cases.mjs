/**
 * Heartcore Orbit V2 formal-stage embodiment / illustrated asset cases.
 * Run: node docs/qa/orbit-v2-embodiment-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const fromRepo = (relativePath) =>
  pathToFileURL(path.join(repoRoot, relativePath)).href;

const {
  ORBIT_FORMAL_STAGE_IDS,
  getOrbitFormalStagePhysicsProfile,
  orbitEmbodimentBudget,
  projectOrbitEmbodimentProfile
} = await import(fromRepo("src/orbit/orbitEmbodimentProfile.js"));
const {
  confirmOrbitAttunement,
  createOrbitSession,
  launchOrbitSession,
  selectOrbitEmbodiment,
  stepOrbitSession,
  triggerOrbitResonancePulse
} = await import(fromRepo("src/orbit/orbitEngine.js"));
const {
  AVATAR_RADIUS,
  ORBIT_PHYSICS_MODELS,
  collideBodies,
  createBody
} = await import(fromRepo("src/orbit/orbitPhysics.js"));
const { createOrbitAttunementSnapshot } = await import(
  fromRepo("src/orbit/orbitAttunement.js")
);
const { MOONLAKE_CAMP_SLICE } = await import(
  fromRepo("src/data/orbit/stages/index.js")
);
const { ASSET_MANIFEST, RUNTIME_COMPANION_ASSET_KEYS } = await import(
  fromRepo("src/data/assetManifest.js")
);

const RUNTIME_COMPANION_IDS = Object.freeze([
  "greyshade-cat",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit"
]);

const stats = Object.freeze({
  impact: 38,
  spin: 42,
  guard: 46,
  burst: 18,
  overheat: 0,
  canLaunch: true
});

const indexedRuntimeIds = RUNTIME_COMPANION_ASSET_KEYS.map(
  (key) => ASSET_MANIFEST.characters[key]?.id
).sort();
assert.deepEqual(indexedRuntimeIds, [...RUNTIME_COMPANION_IDS].sort());

function ok(name) {
  console.log(`PASS  ${name}`);
}

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, relativePath), "utf8")
  );
}

function pngInfo(relativePath) {
  const bytes = fs.readFileSync(path.join(repoRoot, relativePath));
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
    hasTransparencyChunk: bytes.includes(Buffer.from("tRNS"))
  };
}

for (const companionId of RUNTIME_COMPANION_IDS) {
  const manifestationPath =
    `assets/characters/${companionId}/metadata/orbit-manifestations.json`;
  const animationPath =
    `assets/characters/${companionId}/metadata/animations.json`;
  const manifestation = readJson(manifestationPath);
  const animations = readJson(animationPath);
  assert.equal(manifestation.schemaVersion, 1);
  assert.equal(manifestation.companionId, companionId);
  assert.deepEqual(
    Object.keys(manifestation.formalStages),
    ["initial_awakened"]
  );
  const stageAsset = manifestation.formalStages.initial_awakened;
  assert.equal(stageAsset.status, "runtime-ready");
  assert.equal(stageAsset.renderMode, "illustrated-self-projection");
  assert.equal(stageAsset.collisionCarrier, "outer-resonance-field");
  const animation = animations[stageAsset.animationId];
  assert.ok(animation, `${companionId} must resolve its animationId`);
  assert.equal(animation.frameWidth, 512);
  assert.equal(animation.frameHeight, 512);
  assert.equal(animation.anchor.x, 0.5);
  assert.equal(animation.anchor.y, 1);
  assert.equal(animation.frameCount, animation.rows * animation.columns);
  assert.ok(!animation.sheet.includes("/assets/reference/"));
  const sheetPath = animation.sheet.replace(/^\.\//, "");
  const png = pngInfo(sheetPath);
  assert.equal(png.width, animation.frameWidth * animation.columns);
  assert.equal(png.height, animation.frameHeight * animation.rows);
  assert.ok(png.width <= 4096 && png.height <= 4096);
  assert.ok(
    [4, 6].includes(png.colorType) || png.hasTransparencyChunk,
    `${companionId} sheet must carry alpha`
  );
}
assert.equal(RUNTIME_COMPANION_IDS.length, 16);
ok("all 16 runtime companions have Stage 1-only illustrated Orbit manifests");

const coreBudget = orbitEmbodimentBudget({
  collisionRadius: 1,
  inertia: 1,
  speedCap: 1,
  spinRetention: 1,
  turnAuthority: 1,
  signalReach: 1
});
assert.equal(coreBudget, 6);
for (const stageId of ORBIT_FORMAL_STAGE_IDS) {
  const profile = getOrbitFormalStagePhysicsProfile(stageId);
  assert.ok(Math.abs(orbitEmbodimentBudget(profile) - coreBudget) < 1e-12);
  assert.ok(Object.values(profile).some((value) => value > 1));
  assert.ok(Object.values(profile).some((value) => value < 1));
  assert.equal("impact" in profile, false);
  assert.equal("damage" in profile, false);
  assert.equal("winner" in profile, false);
}
ok("core and all three formal-stage profiles use the same normalized budget");

const thunderInitial = projectOrbitEmbodimentProfile({
  companionId: "thunder-pup",
  companionName: "雷霆幼狼",
  formalStage: "initial_awakened",
  availableFormalStages: ["initial_awakened"],
  assetReadiness: {
    ready: true,
    stage: "initial_awakened",
    status: "runtime-ready",
    animationId: "idle_calm"
  }
});
assert.equal(thunderInitial.formalStage, "initial_awakened");
assert.equal(thunderInitial.stageLegality, "canonical");
assert.equal(
  thunderInitial.options.find((option) => option.id === "formal_stage")
    .manifestationIntent,
  "illustrated"
);

const thunderUnsupported = projectOrbitEmbodimentProfile({
  companionId: "thunder-pup",
  companionName: "雷霆幼狼",
  formalStage: "resonant_mature",
  availableFormalStages: ["initial_awakened"],
  assetReadiness: {
    ready: true,
    stage: "initial_awakened",
    status: "runtime-ready",
    animationId: "idle_calm"
  }
});
assert.equal(thunderUnsupported.formalStage, "initial_awakened");
assert.equal(thunderUnsupported.stageLegality, "fallback_initial");
assert.match(thunderUnsupported.stageNotice, /後續形態線尚未封印/);
assert.ok(!JSON.stringify(thunderUnsupported).includes("雷霆戰狼"));
ok("ThunderPup fails closed to its approved Stage 1 line without inventing an evolution");

const missingMatureAsset = projectOrbitEmbodimentProfile({
  companionId: "greyshade-cat",
  formalStage: "resonant_mature",
  availableFormalStages: ORBIT_FORMAL_STAGE_IDS,
  assetReadiness: {
    ready: false,
    stage: "resonant_mature",
    status: "stage_asset_missing"
  }
});
assert.equal(missingMatureAsset.formalStage, "resonant_mature");
assert.equal(
  missingMatureAsset.options.find((option) => option.id === "formal_stage")
    .manifestationIntent,
  "aura"
);
ok("a canonical stage with no approved evolved asset uses aura instead of Stage 1 art");

function attunement() {
  return createOrbitAttunementSnapshot(
    { mood: "calm", energy: 10, trust: 40, touchFatigue: 0 },
    {
      defaultStanceId: MOONLAKE_CAMP_SLICE.defaultLaunchStanceId,
      ...MOONLAKE_CAMP_SLICE.attunement
    }
  );
}

function createSession(mode = "formal_stage") {
  const embodiment = projectOrbitEmbodimentProfile({
    companionId: "thunder-pup",
    companionName: "雷霆幼狼",
    formalStage: "initial_awakened",
    availableFormalStages: ["initial_awakened"],
    assetReadiness: {
      ready: true,
      stage: "initial_awakened",
      status: "runtime-ready",
      animationId: "idle_calm"
    },
    requestedMode: mode
  });
  return createOrbitSession({
    stats,
    stage: MOONLAKE_CAMP_SLICE,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    prototypeSlice: true,
    nonPersistent: true,
    attunement: attunement(),
    embodiment
  });
}

let session = createSession();
assert.equal(session.embodimentMode, "formal_stage");
assert.ok(session.player.radius > AVATAR_RADIUS);
assert.ok(session.player.inertiaScale > 1);
const formalSpeedCap = session.player.speedCap;
session = selectOrbitEmbodiment(session, "core");
assert.equal(session.player.radius, AVATAR_RADIUS);
assert.equal(session.player.inertiaScale, 1);
assert.ok(session.player.speedCap > formalSpeedCap);
session = selectOrbitEmbodiment(session, "formal_stage");
session = confirmOrbitAttunement(session);
assert.equal(session.confirmedLaunchPlan.embodimentMode, "formal_stage");
assert.equal(session.confirmedLaunchPlan.formalStage, "initial_awakened");
assert.equal(selectOrbitEmbodiment(session, "core"), session);
ok("core/formal choice is visible before confirmation and immutable after confirmation");

const bodyA = createBody({
  id: "a",
  x: -0.05,
  y: 0,
  vx: 1,
  vy: 0,
  spin: 45,
  radius: 0.1,
  inertiaScale: 1.1
});
const bodyB = createBody({
  id: "b",
  x: 0.05,
  y: 0,
  vx: -0.3,
  vy: 0,
  spin: 35,
  radius: 0.1,
  inertiaScale: 1
});
const energyBefore =
  bodyA.inertiaScale * (bodyA.vx ** 2 + bodyA.vy ** 2) +
  bodyB.inertiaScale * (bodyB.vx ** 2 + bodyB.vy ** 2);
const collision = collideBodies(bodyA, bodyB, 40, 40, 40, 40);
const energyAfter =
  collision.a.inertiaScale * (collision.a.vx ** 2 + collision.a.vy ** 2) +
  collision.b.inertiaScale * (collision.b.vx ** 2 + collision.b.vy ** 2);
assert.equal(collision.hit, true);
assert.ok(energyAfter <= energyBefore * 0.96 + 1e-12);
ok("collision emphasis changes inertia while preserving the existing energy cap");

function replaySnapshot(hz, mode) {
  let replay = createSession(mode);
  replay = confirmOrbitAttunement(replay);
  replay = launchOrbitSession(replay, -0.46, 0.18);
  for (let frame = 0; frame < hz * 2; frame += 1) {
    if (frame === Math.floor(hz * 0.8)) {
      replay = triggerOrbitResonancePulse(replay);
    }
    replay = stepOrbitSession(replay, 1 / hz);
  }
  return {
    phase: replay.phase,
    elapsed: replay.elapsed,
    objectiveIndex: replay.objectiveIndex,
    nextMemoryMoteIndex: replay.nextMemoryMoteIndex,
    boundaryChargesRemaining: replay.boundaryChargesRemaining,
    resonancePulseUsed: replay.resonancePulseUsed,
    embodimentMode: replay.embodimentMode,
    player: replay.player
  };
}

for (const mode of ["core", "formal_stage"]) {
  assert.deepEqual(replaySnapshot(30, mode), replaySnapshot(60, mode));
  assert.deepEqual(replaySnapshot(60, mode), replaySnapshot(120, mode));
}
ok("core and illustrated Stage 1 replay exactly at 30/60/120 Hz");

const fakePersistentState = {
  activeCompanionId: "thunder-pup",
  companionStates: {
    byId: {
      "thunder-pup": {
        growth: { stage: "initial_awakened", evidence: [] }
      }
    }
  }
};
const persistentBefore = structuredClone(fakePersistentState);
projectOrbitEmbodimentProfile({
  companionId: "thunder-pup",
  formalStage:
    fakePersistentState.companionStates.byId["thunder-pup"].growth.stage,
  availableFormalStages: ["initial_awakened"]
});
assert.deepEqual(fakePersistentState, persistentBefore);
ok("formal-stage projection is read-only and creates no Growth or save mutation");

console.log("\nAll Heartcore Orbit V2 embodiment cases passed.");
