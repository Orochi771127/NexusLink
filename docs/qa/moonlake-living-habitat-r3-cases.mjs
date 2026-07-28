import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createCompanionMotion,
  getCompanionRoamingSnapshot,
  snapCompanionRoamingToWaypoint,
  updateCompanionMotion
} from "../../src/pixi/motionController.js";
import {
  getMoonlakeWalkPlaybackRate,
  MOONLAKE_LOCOMOTION_PROFILES
} from "../../src/pixi/moonlakeRoamingController.js";
import { MOONLAKE_INTERACTION_HOTSPOTS } from "../../src/three/moonlakeLive3dConfig.js";
import { projectMoonlakeImagePoint } from "../../src/three/moonlakeLive3dScene.js";

const COMPANION_IDS = [
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
];

assert.deepEqual(
  Object.keys(MOONLAKE_LOCOMOTION_PROFILES).sort(),
  [...COMPANION_IDS].sort(),
  "all 16 runtime companions have an authored Moonlake stride profile"
);

for (const companionId of COMPANION_IDS) {
  const nearRate = getMoonlakeWalkPlaybackRate({
    companionId,
    animationDurationMs: 1_600,
    projectedSpeedPxPerSecond: 22,
    projectedScale: 0.8,
    referenceScale390: 1
  });
  const bridgeRate = getMoonlakeWalkPlaybackRate({
    companionId,
    animationDurationMs: 1_600,
    projectedSpeedPxPerSecond: 8,
    projectedScale: 0.45,
    referenceScale390: 1
  });
  assert.ok(nearRate >= 0.55 && nearRate <= 3.2, `${companionId} near-ground cadence is bounded`);
  assert.ok(bridgeRate >= 0.55 && bridgeRate <= 3.2, `${companionId} bridge cadence is bounded`);
}

assert.ok(
  getMoonlakeWalkPlaybackRate({
    companionId: "auriowl",
    animationDurationMs: 1_600,
    projectedSpeedPxPerSecond: 12,
    projectedScale: 0.7,
    referenceScale390: 1
  }) > getMoonlakeWalkPlaybackRate({
    companionId: "sprigfawn",
    animationDurationMs: 1_600,
    projectedSpeedPxPerSecond: 12,
    projectedScale: 0.7,
    referenceScale390: 1
  }),
  "short bird steps cycle faster than long deer strides at the same projected speed"
);

const played = [];
const companion = {
  x: 0,
  y: 0,
  scale: { x: 1, y: 1, set(value) { this.x = value; this.y = value; } },
  alpha: 1,
  rotation: 0,
  __animationProfile: {
    ambientActions: [],
    ambientWalkEnabled: true,
    moodIdle: { calm: "idle_calm" },
    fallbackIdle: "idle_calm"
  },
  __animationController: {
    canResolve: () => true,
    hasAnimation: () => true,
    play(animationName, options = {}) {
      played.push({ animationName, ...options });
      return true;
    },
    loadAnimation: async () => null,
    getAnimationDurationMs: () => 1_000
  },
  __interactionController: {
    isAnimationLocked: () => false
  }
};
const motion = createCompanionMotion(companion, "calm");
motion.ambientNextAt = Number.POSITIVE_INFINITY;
motion.ambientActionNextAt = 0;
assert.equal(snapCompanionRoamingToWaypoint(motion, "bridge_mid", 0), true);

const originalRandom = Math.random;
Math.random = () => 0;
try {
  const updateAt = (nowMs) => updateCompanionMotion(
    companion,
    motion,
    nowMs / 1000,
    nowMs,
    "calm",
    () => {},
    {
      activeHabitatId: "moonlake",
      companionId: "greyshade-cat",
      deltaMs: 16,
      projectWorldPoint: ({ x, z }) => ({
        x,
        y: z,
        scale: 0.45,
        referenceScale390: 1,
        surface: "bridge"
      })
    }
  );

  updateAt(1_000);
  assert.equal(motion.fishingSequence?.phase, "cast");
  assert.equal(getCompanionRoamingSnapshot(motion)?.fishing?.waterSide, "right");
  assert.equal(played.at(-1)?.loop, false);
  assert.equal(played.at(-1)?.holdOnComplete, true);

  updateAt(2_001);
  assert.equal(motion.fishingSequence?.phase, "wait");
  assert.equal(played.at(-1)?.holdFrame, "last");

  updateAt(10_502);
  assert.equal(motion.fishingSequence?.phase, "bite");
  assert.equal(getCompanionRoamingSnapshot(motion)?.fishing?.phase, "bite");

  updateAt(11_453);
  assert.equal(motion.fishingSequence?.phase, "reel");
  assert.equal(played.at(-1)?.reverse, true);

  updateAt(12_454);
  assert.equal(motion.fishingSequence?.phase, "settle");

  updateAt(13_305);
  assert.equal(motion.fishingSequence, null, "fishing sequence returns to idle after settle");
} finally {
  Math.random = originalRandom;
}

const projectedHotspots = MOONLAKE_INTERACTION_HOTSPOTS.map((hotspot) => ({
  ...hotspot,
  projected: projectMoonlakeImagePoint(hotspot, { width: 390, height: 844 })
}));
assert.ok(projectedHotspots.length >= 8, "Moonlake has several bounded scene interactions");
assert.ok(projectedHotspots.every((hotspot) => hotspot.projected?.visible), "all interaction targets remain visible at 390x844");
assert.ok(
  new Set(projectedHotspots.map((hotspot) => hotspot.type)).size === 3,
  "lantern, crystal, and water interaction families are all present"
);

const sceneSource = fs.readFileSync("src/three/moonlakeLive3dScene.js", "utf8");
assert.match(sceneSource, /fallingBand/);
assert.match(sceneSource, /lanternPulse/);
assert.match(sceneSource, /crystalPulse/);
assert.match(sceneSource, /waterRing/);

const appSource = fs.readFileSync("src/app.js", "utf8");
assert.match(appSource, /extendsBeyondRail/);
assert.match(appSource, /quadraticCurveTo/);
assert.match(appSource, /createLanternTouchEffect/);
assert.match(appSource, /createWaterRippleEffect/);

console.log(JSON.stringify({
  pass: true,
  companions: COMPANION_IDS.length,
  interactionHotspots: projectedHotspots.length,
  fishingPhases: ["cast", "wait", "bite", "reel", "settle"],
  strideProfiles: Object.keys(MOONLAKE_LOCOMOTION_PROFILES).length
}, null, 2));
