import assert from "node:assert/strict";

import {
  createCompanionMotion,
  getCompanionRoamingSnapshot,
  playDevMotion,
  setCompanionFishingPaused,
  snapCompanionRoamingToWaypoint,
  updateCompanionMotion
} from "../../src/pixi/motionController.js";

let interactionLocked = false;
const played = [];
const companion = {
  x: 100,
  y: 100,
  alpha: 1,
  rotation: 0,
  scale: {
    x: 1,
    y: 1,
    set(value) {
      this.x = value;
      this.y = value;
    }
  },
  __opaqueFoot: { x: 0, y: 0 },
  __animationProfile: {
    ambientWalkEnabled: true,
    ambientActions: [],
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
    getCurrentAnimationName: () => played.at(-1)?.animationName || "idle_calm",
    getAnimationDurationMs: () => 1_000
  },
  __interactionController: {
    isAnimationLocked: () => interactionLocked
  }
};

const motion = createCompanionMotion(companion, "calm");
motion.ambientNextAt = Number.POSITIVE_INFINITY;
motion.ambientActionNextAt = Number.POSITIVE_INFINITY;
assert.equal(snapCompanionRoamingToWaypoint(motion, "bridge_mid", 0), true);

const projectWorldPoint = ({ x, z }) => ({
  x,
  y: z,
  scale: 0.5,
  referenceScale390: 1,
  surface: "bridge",
  routeId: "bridge-clearance-r2-1"
});
const updateAt = (nowMs, extra = {}) => updateCompanionMotion(
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
    lifecycleActive: true,
    projectWorldPoint,
    ...extra
  }
);

const startedAt = performance.now();
playDevMotion(motion, "fishing_side", {
  mirrorX: false,
  waterSide: "right",
  durationMs: 10_000,
  lifecycleScale: 0.1
});
assert.equal(motion.fishingSequence?.phase, "cast");
assert.equal(motion.fishingSequence?.phaseDurationMs, 100);
assert.equal(motion.fishingSequence?.waitDurationMs, 1_000);

interactionLocked = true;
updateAt(startedAt + 50);
assert.equal(motion.fishingSequence?.phase, "cast");
assert.equal(motion.fishingSequence?.pauseReasons.has("interaction_lock"), true);
updateAt(startedAt + 1_050);
assert.equal(motion.fishingSequence?.phase, "cast");

interactionLocked = false;
updateAt(startedAt + 1_050);
assert.equal(motion.fishingSequence?.pausedAt, 0);
assert.equal(motion.fishingSequence?.phase, "cast");
updateAt(startedAt + 1_101);
assert.equal(motion.fishingSequence?.phase, "wait");
assert.equal(played.at(-1)?.holdFrame, "last");

setCompanionFishingPaused(motion, "visibility", true, startedAt + 1_200);
updateAt(startedAt + 6_200, { lifecycleActive: false });
assert.equal(motion.fishingSequence?.phase, "wait");
assert.equal(motion.fishingSequence?.pausedAt, startedAt + 1_200);
setCompanionFishingPaused(motion, "visibility", false, startedAt + 6_200);
updateAt(startedAt + 6_200);
assert.equal(motion.fishingSequence?.phase, "wait");
assert.equal(getCompanionRoamingSnapshot(motion)?.fishing?.paused, false);

updateAt(startedAt + 7_102);
assert.equal(motion.fishingSequence?.phase, "bite");
assert.equal(getCompanionRoamingSnapshot(motion)?.fishing?.phase, "bite");
updateAt(startedAt + 7_198);
assert.equal(motion.fishingSequence?.phase, "reel");
assert.equal(played.at(-1)?.reverse, true);
updateAt(startedAt + 7_299);
assert.equal(motion.fishingSequence?.phase, "settle");
updateAt(startedAt + 7_385);
assert.equal(motion.fishingSequence, null);

playDevMotion(motion, "fishing_front", {
  mirrorX: true,
  waterSide: "left",
  lifecycleScale: 0.02
});
assert.equal(motion.fishingSequence?.mirrorX, true);
assert.equal(motion.fishingSequence?.waterSide, "left");
updateAt(startedAt + 8_000, { isBattleActive: true });
assert.equal(
  motion.fishingSequence,
  null,
  "battle or other busy state interrupts fishing without leaving stale lifecycle state"
);

console.log(JSON.stringify({
  pass: true,
  package: "TP-MOONLAKE-FISHING-LIFECYCLE-PUBLIC-R3.4",
  phases: ["cast", "wait", "bite", "reel", "settle", "idle"],
  interactionLockPaused: true,
  visibilityPaused: true,
  interruptionCleanup: true
}, null, 2));
