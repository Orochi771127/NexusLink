import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  MOONLAKE_COMPANION_PRESENTATION,
  MOONLAKE_LIVE3D_ASSET,
  MOONLAKE_VISIBLE_GLB_CANDIDATE,
  MOONLAKE_WORLD_WAYPOINTS
} from "../../src/three/moonlakeLive3dConfig.js";

const EXPECTED_COMPANION_IDS = Object.freeze([
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

assert.equal(MOONLAKE_VISIBLE_GLB_CANDIDATE.shippingDefault, false);
assert.equal(MOONLAKE_VISIBLE_GLB_CANDIDATE.queryParam, "moonlakeVisibleGlb");
assert.equal(MOONLAKE_VISIBLE_GLB_CANDIDATE.queryValue, "1");
assert.equal(
  MOONLAKE_VISIBLE_GLB_CANDIDATE.rasterRole,
  "loading-reduced-capability-renderer-failure-fallback"
);
assert.deepEqual(
  MOONLAKE_VISIBLE_GLB_CANDIDATE.hiddenMeshTokens,
  ["backdrop", "water"]
);
assert.ok(MOONLAKE_VISIBLE_GLB_CANDIDATE.camera.position.y > 10);
assert.ok(MOONLAKE_VISIBLE_GLB_CANDIDATE.camera.fov >= 30);
assert.ok(MOONLAKE_VISIBLE_GLB_CANDIDATE.camera.fov <= 45);

const explicitProfiles = Object.keys(MOONLAKE_COMPANION_PRESENTATION)
  .filter((id) => id !== "default");
assert.deepEqual(explicitProfiles.sort(), [...EXPECTED_COMPANION_IDS].sort());

for (const waypointId of [
  "platform_center",
  "platform_right",
  "bridge_near",
  "bridge_mid",
  "bridge_far"
]) {
  const waypoint = MOONLAKE_WORLD_WAYPOINTS[waypointId];
  assert.ok(waypoint, `missing ${waypointId}`);
  assert.ok(Number.isFinite(waypoint.x));
  assert.ok(Number.isFinite(waypoint.y));
  assert.ok(Number.isFinite(waypoint.z));
}

const sceneSource = await readFile(
  new URL("../../src/three/moonlakeLive3dScene.js", import.meta.url),
  "utf8"
);
for (const token of [
  "visible_glb_candidate",
  "projectMoonlakeCameraPoint",
  "visualBackdrop.mesh.visible = !visibleGlbCandidate",
  "createVisibleGlbCandidateMaterial",
  "modelVisibleMeshCount",
  "dynamicRigVisible"
]) {
  assert.ok(sceneSource.includes(token), `missing R4 source token: ${token}`);
}
assert.ok(
  sceneSource.includes("if (state.visibleGlbCandidate)"),
  "camera projection must remain candidate-gated"
);

const glbBytes = await readFile(
  new URL("../../assets/3d/moonlake/moonlake_clay_resin_r3.glb", import.meta.url)
);
const glbSha256 = createHash("sha256").update(glbBytes).digest("hex").toUpperCase();
assert.equal(glbBytes.length, MOONLAKE_LIVE3D_ASSET.bytes);
assert.equal(glbSha256, MOONLAKE_LIVE3D_ASSET.sha256);

console.log(JSON.stringify({
  pass: true,
  package: "TP-MOONLAKE-VISIBLE-GLB-FEASIBILITY-R4.0",
  shippingDefault: MOONLAKE_VISIBLE_GLB_CANDIDATE.shippingDefault,
  visibleGlbQuery: `${MOONLAKE_VISIBLE_GLB_CANDIDATE.queryParam}=${MOONLAKE_VISIBLE_GLB_CANDIDATE.queryValue}`,
  companionCount: EXPECTED_COMPANION_IDS.length,
  checkedWaypoints: 5,
  assetBytes: glbBytes.length,
  assetSha256: glbSha256
}, null, 2));
