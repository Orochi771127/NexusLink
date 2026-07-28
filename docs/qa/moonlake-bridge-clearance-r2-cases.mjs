import assert from "node:assert/strict";

import {
  MOONLAKE_BRIDGE_PRESENTATION,
  MOONLAKE_FISHING_PRESENTATION,
  MOONLAKE_VISUAL_WALKWAY,
  MOONLAKE_WORLD_EDGES,
  MOONLAKE_WORLD_WAYPOINTS
} from "../../src/three/moonlakeLive3dConfig.js";
import { projectMoonlakeVisualPoint } from "../../src/three/moonlakeLive3dScene.js";
import {
  createMoonlakeRoamingState,
  snapMoonlakeRoamingToWaypoint,
  stageMoonlakeRoamingSegment,
  updateMoonlakeRoaming
} from "../../src/pixi/moonlakeRoamingController.js";

const VIEWPORT = Object.freeze({ width: 390, height: 844 });
const ALL_DIRECTIONS = new Set(["left_walk", "right_walk", "front_walk", "back_walk"]);
const canResolveAll = (name) => ALL_DIRECTIONS.has(name);

const expected = Object.freeze({
  bridge_near: Object.freeze({ x: 268.59, y: 384.02, scale: 0.495, surface: "bridge" }),
  bridge_mid: Object.freeze({ x: 265.26, y: 331.69, scale: 0.45, surface: "bridge" }),
  bridge_far: Object.freeze({ x: 259.09, y: 288.65, scale: 0.42, surface: "bridge" })
});

for (const [waypointId, target] of Object.entries(expected)) {
  const projected = projectMoonlakeVisualPoint(
    MOONLAKE_WORLD_WAYPOINTS[waypointId],
    VIEWPORT
  );
  assert.ok(projected?.visible, `${waypointId} must remain visible`);
  assert.ok(Math.abs(projected.x - target.x) <= 0.75, `${waypointId} x drifted`);
  assert.ok(Math.abs(projected.y - target.y) <= 0.75, `${waypointId} y drifted`);
  assert.ok(Math.abs(projected.scale - target.scale) <= 0.001, `${waypointId} scale drifted`);
  assert.equal(projected.surface, target.surface);
  assert.equal(projected.routeId, MOONLAKE_VISUAL_WALKWAY.routeId);
}

assert.deepEqual(MOONLAKE_WORLD_EDGES.bridge_far, ["bridge_mid"]);
assert.deepEqual(MOONLAKE_WORLD_EDGES.far_bank_center, []);
assert.deepEqual(MOONLAKE_WORLD_EDGES.far_bank_left, []);
assert.deepEqual(MOONLAKE_WORLD_EDGES.far_bank_right, []);
assert.ok(MOONLAKE_BRIDGE_PRESENTATION.widenedNearHalfWidth
  > MOONLAKE_BRIDGE_PRESENTATION.sourceNearHalfWidth);
assert.ok(MOONLAKE_BRIDGE_PRESENTATION.widenedFarHalfWidth
  > MOONLAKE_BRIDGE_PRESENTATION.sourceFarHalfWidth);

const state = createMoonlakeRoamingState(0);
assert.equal(snapMoonlakeRoamingToWaypoint(state, "bridge_mid", 100), true);
const bridgeDwell = updateMoonlakeRoaming(state, {
  deltaMs: 16,
  nowMs: 101,
  mood: "calm",
  canRoam: true,
  canResolve: canResolveAll,
  projectWorldPoint: (point) => projectMoonlakeVisualPoint(point, VIEWPORT)
});
assert.equal(bridgeDwell.area, "bridge");
assert.equal(bridgeDwell.projected.surface, "bridge");
assert.equal(bridgeDwell.isFishingSpot, true);
assert.deepEqual(
  bridgeDwell.fishingOptions,
  MOONLAKE_FISHING_PRESENTATION.bridgeMidOptions
);
assert.deepEqual(
  bridgeDwell.fishingOptions.map((option) => [
    option.animationName,
    option.mirrorX,
    option.waterSide
  ]),
  [
    ["fishing_front", false, "right"],
    ["fishing_front", true, "left"],
    ["fishing_side", false, "right"],
    ["fishing_side", true, "left"]
  ]
);

assert.equal(
  stageMoonlakeRoamingSegment(state, "bridge_near", "bridge_mid", 0.9),
  true
);
const stagedWalk = updateMoonlakeRoaming(state, {
  deltaMs: 16,
  nowMs: 150,
  mood: "calm",
  canRoam: true,
  canResolve: canResolveAll,
  projectWorldPoint: (point) => projectMoonlakeVisualPoint(point, VIEWPORT)
});
assert.equal(stagedWalk.animationName, "back_walk");
assert.equal(stagedWalk.projected.surface, "bridge");
assert.equal(
  stageMoonlakeRoamingSegment(state, "far_bank_center", "far_bank_left", 0.5),
  false
);

assert.equal(snapMoonlakeRoamingToWaypoint(state, "bridge_far", 200), true);
const fishingDwell = updateMoonlakeRoaming(state, {
  deltaMs: 16,
  nowMs: 201,
  mood: "calm",
  canRoam: true,
  canResolve: canResolveAll,
  projectWorldPoint: (point) => projectMoonlakeVisualPoint(point, VIEWPORT)
});
assert.equal(fishingDwell.area, "fishing_spot");
assert.equal(fishingDwell.projected.surface, "bridge");
assert.equal(fishingDwell.isFishingSpot, true);
assert.deepEqual(
  fishingDwell.fishingOptions,
  MOONLAKE_FISHING_PRESENTATION.bridgeFarOptions
);
assert.deepEqual(
  MOONLAKE_FISHING_PRESENTATION.rejectedTerrain,
  [
    "stepping_stones",
    "waterfall_basins",
    "shallow_water",
    "far_bank",
    "tent_shoreline",
    "near_ground"
  ]
);

const reducedMotion = updateMoonlakeRoaming(state, {
  deltaMs: 16,
  nowMs: 202,
  mood: "calm",
  canRoam: true,
  reducedMotion: true,
  canResolve: canResolveAll,
  projectWorldPoint: (point) => projectMoonlakeVisualPoint(point, VIEWPORT)
});
assert.equal(reducedMotion.reason, "reduced_motion");
assert.equal(reducedMotion.moving, false);

console.log(JSON.stringify({
  pass: true,
  routeId: MOONLAKE_VISUAL_WALKWAY.routeId,
  viewport: VIEWPORT,
  projectedWaypoints: expected,
  stagedBridgeAnimation: stagedWalk.animationName,
  bridgeMidFishingOptions: bridgeDwell.fishingOptions,
  dedicatedBridgeFishingStop: fishingDwell.isFishingSpot,
  unreachableOpenWaterStops: ["far_bank_center", "far_bank_left", "far_bank_right"],
  reducedMotionFallback: reducedMotion.reason
}, null, 2));
