import assert from "node:assert/strict";

import {
  createMoonlakeRoamingState,
  hasFourDirectionAnimations,
  updateMoonlakeRoaming
} from "../../src/pixi/moonlakeRoamingController.js";

const ALL_DIRECTIONS = new Set(["left_walk", "right_walk", "front_walk", "back_walk"]);
const canResolveAll = (name) => ALL_DIRECTIONS.has(name);
const projectWorldPoint = ({ x, y, z }) => ({
  x: 195 + x * 10,
  y: 422 + z * 8 - y * 4,
  scale: 1,
  depth: 0
});

assert.equal(hasFourDirectionAnimations(canResolveAll), true);
assert.equal(hasFourDirectionAnimations((name) => name !== "back_walk"), false);

const state = createMoonlakeRoamingState(0);
state.dwellUntil = 0;

function walkTo(targetId, expectedDirection, nowMs) {
  state.targetId = targetId;
  const walking = updateMoonlakeRoaming(state, {
    deltaMs: 16,
    nowMs,
    mood: "calm",
    canRoam: true,
    canResolve: canResolveAll,
    projectWorldPoint,
    random: () => 0
  });
  assert.equal(walking.animationName, `${expectedDirection}_walk`);
  assert.equal(walking.projectionReady, true);

  return updateMoonlakeRoaming(state, {
    deltaMs: 120_000,
    nowMs: nowMs + 1,
    mood: "calm",
    canRoam: true,
    canResolve: canResolveAll,
    projectWorldPoint,
    random: () => 0
  });
}

walkTo("platform_right", "right", 10);
walkTo("bridge_near", "back", 20);
walkTo("bridge_mid", "back", 30);
walkTo("bridge_far", "back", 40);
const fishingArrival = walkTo("far_bank_center", "back", 50);

assert.equal(state.currentId, "far_bank_center");
assert.equal(state.bridgeTraversals, 1);
assert.equal(fishingArrival.isFishingSpot, true);

walkTo("far_bank_left", "left", 60);
walkTo("far_bank_center", "right", 70);
walkTo("bridge_far", "right", 80);
walkTo("bridge_mid", "front", 85);

const reducedMotion = updateMoonlakeRoaming(state, {
  deltaMs: 16,
  nowMs: 90,
  mood: "calm",
  canRoam: true,
  reducedMotion: true,
  canResolve: canResolveAll,
  projectWorldPoint
});
assert.equal(reducedMotion.enabled, false);
assert.equal(reducedMotion.reason, "reduced_motion");

console.log(JSON.stringify({
  pass: true,
  bridgeTraversals: state.bridgeTraversals,
  directionsCovered: [...ALL_DIRECTIONS],
  fishingSpotReached: fishingArrival.isFishingSpot,
  reducedMotionFallback: reducedMotion.reason
}));
