import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  MOONLAKE_FISHING_PRESENTATION,
  MOONLAKE_WORLD_WAYPOINTS
} from "../../src/three/moonlakeLive3dConfig.js";
import {
  createCompanionMotion,
  snapCompanionRoamingToWaypoint,
  updateCompanionMotion
} from "../../src/pixi/motionController.js";

const ROOT = process.cwd();
const COMPANION_IDS = Object.freeze([
  "greyshade-cat",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm"
]);

const ORIENTATION_CASES = Object.freeze([
  Object.freeze({
    id: "front-right",
    waypointId: "bridge_mid",
    animationName: "fishing_front",
    mirrorX: false,
    waterSide: "right"
  }),
  Object.freeze({
    id: "front-left",
    waypointId: "bridge_mid",
    animationName: "fishing_front",
    mirrorX: true,
    waterSide: "left"
  }),
  Object.freeze({
    id: "side-right",
    waypointId: "bridge_mid",
    animationName: "fishing_side",
    mirrorX: false,
    waterSide: "right"
  }),
  Object.freeze({
    id: "side-left",
    waypointId: "bridge_mid",
    animationName: "fishing_side",
    mirrorX: true,
    waterSide: "left"
  }),
  Object.freeze({
    id: "back-far",
    waypointId: "bridge_far",
    animationName: "fishing_back",
    mirrorX: false,
    waterSide: "far"
  })
]);

assert.equal(MOONLAKE_FISHING_PRESENTATION.id, "moonlake-fishing-orientation-r2-2");
assert.deepEqual(
  MOONLAKE_WORLD_WAYPOINTS.bridge_mid.fishingOptions,
  MOONLAKE_FISHING_PRESENTATION.bridgeMidOptions
);
assert.deepEqual(
  MOONLAKE_WORLD_WAYPOINTS.bridge_far.fishingOptions,
  MOONLAKE_FISHING_PRESENTATION.bridgeFarOptions
);
assert.equal(MOONLAKE_FISHING_PRESENTATION.bridgeMidOptions.length, 4);
assert.equal(MOONLAKE_FISHING_PRESENTATION.bridgeFarOptions.length, 1);

const assetCases = [];
for (const companionId of COMPANION_IDS) {
  const manifestPath = path.join(
    ROOT,
    "assets",
    "characters",
    companionId,
    "metadata",
    "animations.json"
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const orientation of ORIENTATION_CASES) {
    const definition = manifest[orientation.animationName];
    assert.ok(
      definition,
      `${companionId}: missing ${orientation.animationName}`
    );
    assert.equal(definition.frameWidth, 512);
    assert.equal(definition.frameHeight, 512);
    assert.equal(definition.frameCount, 8);
    assert.equal(definition.columns, 4);
    assert.equal(definition.rows, 2);
    assert.deepEqual(definition.anchor, { x: 0.5, y: 1 });
    assert.equal(definition.loop, true);
    assert.ok(
      fs.existsSync(path.join(ROOT, definition.sheet.replace(/^\.\//, ""))),
      `${companionId}: sheet missing for ${orientation.animationName}`
    );
    assetCases.push({
      companionId,
      ...orientation
    });
  }
}
assert.equal(assetCases.length, 80);

function createMotionHarness() {
  const played = [];
  const companion = {
    x: 100,
    y: 100,
    alpha: 1,
    rotation: 0,
    scale: {
      x: 1,
      set(value) {
        this.x = value;
      }
    },
    __animationProfile: {
      ambientWalkEnabled: true,
      ambientActions: [],
      moodIdle: { calm: "idle_calm" },
      fallbackIdle: "idle_calm"
    },
    __animationController: {
      canResolve: () => true,
      hasAnimation: () => true,
      play(animationName, options) {
        played.push({
          animationName,
          mirrorX: Boolean(options?.mirrorX)
        });
        return true;
      },
      getAnimationDurationMs: () => 1_000
    }
  };
  const motion = createCompanionMotion(companion, "calm");
  motion.ambientActionNextAt = 0;
  return { companion, motion, played };
}

const originalRandom = Math.random;
try {
  for (const [index, option] of MOONLAKE_FISHING_PRESENTATION.bridgeMidOptions.entries()) {
    const { companion, motion, played } = createMotionHarness();
    assert.equal(snapCompanionRoamingToWaypoint(motion, "bridge_mid", 0), true);
    Math.random = () => (index + 0.1) / 4;
    updateCompanionMotion(companion, motion, 0, 1, "calm", () => {}, {
      activeHabitatId: "moonlake",
      deltaMs: 16,
      projectWorldPoint: ({ x, z }) => ({
        x,
        y: z,
        scale: 1,
        surface: "bridge",
        routeId: "bridge-clearance-r2-1"
      })
    });
    assert.equal(motion.fishingSequence?.animationName, option.animationName);
    assert.equal(motion.fishingSequence?.mirrorX, option.mirrorX);
    assert.equal(motion.fishingSequence?.waterSide, option.waterSide);
    assert.equal(
      motion.fishingSequence?.railOffsetX390,
      option.railOffsetX390
    );
    assert.equal(motion.fishingSequence?.phase, "cast");
    assert.ok(
      Math.abs(
        companion.x
        - MOONLAKE_WORLD_WAYPOINTS.bridge_mid.x
        - option.railOffsetX390
      ) < 0.001
    );
    assert.deepEqual(played.at(-1), {
      animationName: option.animationName,
      mirrorX: option.mirrorX
    });
  }

  const { companion, motion, played } = createMotionHarness();
  assert.equal(snapCompanionRoamingToWaypoint(motion, "bridge_far", 0), true);
  Math.random = () => 0;
  updateCompanionMotion(companion, motion, 0, 1, "calm", () => {}, {
    activeHabitatId: "moonlake",
    deltaMs: 16,
    projectWorldPoint: ({ x, z }) => ({
      x,
      y: z,
      scale: 1,
      surface: "bridge",
      routeId: "bridge-clearance-r2-1"
    })
  });
  assert.equal(motion.fishingSequence?.animationName, "fishing_back");
  assert.equal(motion.fishingSequence?.mirrorX, false);
  assert.equal(motion.fishingSequence?.waterSide, "far");
  assert.equal(motion.fishingSequence?.railOffsetX390, 0);
  assert.equal(motion.fishingSequence?.phase, "cast");
  assert.deepEqual(played.at(-1), {
    animationName: "fishing_back",
    mirrorX: false
  });
} finally {
  Math.random = originalRandom;
}

console.log(JSON.stringify({
  pass: true,
  companionCount: COMPANION_IDS.length,
  orientationCount: ORIENTATION_CASES.length,
  caseCount: assetCases.length,
  bridgeMidOptions: MOONLAKE_FISHING_PRESENTATION.bridgeMidOptions,
  bridgeFarOptions: MOONLAKE_FISHING_PRESENTATION.bridgeFarOptions,
  rejectedTerrain: MOONLAKE_FISHING_PRESENTATION.rejectedTerrain
}, null, 2));
