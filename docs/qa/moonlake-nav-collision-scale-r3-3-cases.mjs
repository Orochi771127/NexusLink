import assert from "node:assert/strict";

import {
  MOONLAKE_COMPANION_PRESENTATION,
  MOONLAKE_NAVIGATION_SAFETY,
  MOONLAKE_WORLD_EDGES,
  MOONLAKE_WORLD_WAYPOINTS
} from "../../src/three/moonlakeLive3dConfig.js";
import { projectMoonlakeVisualPoint } from "../../src/three/moonlakeLive3dScene.js";
import {
  getMoonlakeCollisionRadiusPx390,
  getMoonlakePresentationScale,
  getMoonlakeProjectedFootSafety,
  isMoonlakeRouteSegmentSafe
} from "../../src/pixi/moonlakeNavigationSafety.js";

const COMPANION_IDS = Object.freeze([
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

const projectWorldPoint = (point) => projectMoonlakeVisualPoint(
  point,
  { width: 390, height: 844 }
);

assert.equal(MOONLAKE_NAVIGATION_SAFETY.id, "moonlake-spatial-coherence-r1");
assert.equal(MOONLAKE_NAVIGATION_SAFETY.homeWaypointId, "platform_center");
assert.equal(MOONLAKE_NAVIGATION_SAFETY.walkableSurfaces.length, 2);
assert.equal(MOONLAKE_NAVIGATION_SAFETY.footprints.length, 8);
assert.deepEqual(
  Object.keys(MOONLAKE_COMPANION_PRESENTATION)
    .filter((id) => id !== "default")
    .sort(),
  [...COMPANION_IDS].sort()
);

const edgeResults = [];
const waypointResults = [];
for (const companionId of COMPANION_IDS) {
  const groundRadius = getMoonlakeCollisionRadiusPx390(companionId, "near_ground");
  const bridgeRadius = getMoonlakeCollisionRadiusPx390(companionId, "bridge");
  assert.ok(groundRadius >= 18 && groundRadius <= 25);
  assert.ok(bridgeRadius < groundRadius);

  const bridgeScale = getMoonlakePresentationScale(
    companionId,
    "bridge",
    "back_walk"
  );
  const fishingScale = getMoonlakePresentationScale(
    companionId,
    "fishing_spot",
    "fishing_back"
  );
  assert.ok(fishingScale > bridgeScale, `${companionId} fishing must read larger than bridge walk`);

  for (const [waypointId, waypoint] of Object.entries(MOONLAKE_WORLD_WAYPOINTS)) {
    if ((MOONLAKE_WORLD_EDGES[waypointId] || []).length === 0) continue;
    const safety = getMoonlakeProjectedFootSafety(
      projectWorldPoint(waypoint),
      { companionId, area: waypoint.area }
    );
    assert.equal(
      safety.safe,
      true,
      `${companionId} ${waypointId} overlaps ${safety.violations.join(",")}`
    );
    waypointResults.push({ companionId, waypointId, safety });
  }

  for (const [fromId, toIds] of Object.entries(MOONLAKE_WORLD_EDGES)) {
    for (const toId of toIds) {
      const from = MOONLAKE_WORLD_WAYPOINTS[fromId];
      const to = MOONLAKE_WORLD_WAYPOINTS[toId];
      const fromAreaSafe = isMoonlakeRouteSegmentSafe(from, to, {
        companionId,
        area: from.area,
        projectWorldPoint
      });
      const toAreaSafe = isMoonlakeRouteSegmentSafe(from, to, {
        companionId,
        area: to.area,
        projectWorldPoint
      });
      assert.equal(fromAreaSafe && toAreaSafe, true, `${companionId} ${fromId}->${toId}`);
      edgeResults.push({ companionId, fromId, toId });
    }
  }
}

const oldUnsafeLeftRoute = isMoonlakeRouteSegmentSafe(
  { x: 0, y: 0.08, z: 4.25 },
  { x: -2.35, y: 0.08, z: 4.4 },
  {
    companionId: "stone-shard",
    area: "near_ground",
    projectWorldPoint
  }
);
assert.equal(oldUnsafeLeftRoute, false, "the retired route must reproduce the lamp collision");

const foregroundBushSafety = getMoonlakeProjectedFootSafety(
  { x: 174, y: 557, referenceScale390: 1 },
  { companionId: "greyshade-cat", area: "near_ground" }
);
assert.equal(foregroundBushSafety.safe, false);
assert.equal(foregroundBushSafety.reason, "outside_walkable_surface");

const platformCenterSafety = getMoonlakeProjectedFootSafety(
  projectWorldPoint(MOONLAKE_WORLD_WAYPOINTS.platform_center),
  { companionId: "greyshade-cat", area: "platform" }
);
assert.equal(platformCenterSafety.safe, true);
assert.equal(platformCenterSafety.walkableSurfaceId, "central-stone-plaza");

const responsiveViewports = [
  { width: 390, height: 664 },
  { width: 1440, height: 900 }
];
let responsiveWaypointChecks = 0;
for (const viewport of responsiveViewports) {
  for (const [waypointId, waypoint] of Object.entries(MOONLAKE_WORLD_WAYPOINTS)) {
    if ((MOONLAKE_WORLD_EDGES[waypointId] || []).length === 0) continue;
    const projected = projectMoonlakeVisualPoint(waypoint, viewport);
    const safety = getMoonlakeProjectedFootSafety(projected, {
      companionId: "stone-shard",
      area: waypoint.area
    });
    assert.equal(
      safety.safe,
      true,
      `${viewport.width}x${viewport.height} ${waypointId}: ${safety.reason}`
    );
    responsiveWaypointChecks += 1;
  }
}

console.log(JSON.stringify({
  pass: true,
  companionCount: COMPANION_IDS.length,
  walkableSurfaces: MOONLAKE_NAVIGATION_SAFETY.walkableSurfaces.length,
  authoredFootprints: MOONLAKE_NAVIGATION_SAFETY.footprints.length,
  checkedWaypoints: waypointResults.length,
  checkedDirectedEdges: edgeResults.length,
  retiredLampCollisionReproduced: !oldUnsafeLeftRoute,
  foregroundBushRejected: !foregroundBushSafety.safe,
  homeAnchorSafe: platformCenterSafety.safe,
  responsiveWaypointChecks
}));
