import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const GLB_URL = new URL(
  "../../assets/3d/moonlake/moonlake_visible_r4_1.glb",
  import.meta.url
);
const R3_URL = new URL(
  "../../assets/3d/moonlake/moonlake_clay_resin_r3.glb",
  import.meta.url
);
const EXPECTED_R3_SHA256 =
  "60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6";
const REQUIRED_NODES = [
  "MOONLAKE_VISIBLE_R4_1",
  "R4_ENVIRONMENT",
  "R4_PLATFORM",
  "R4_BRIDGE",
  "R4_CLIFF_LEFT",
  "R4_CLIFF_RIGHT",
  "R4_TENT_LEFT",
  "R4_TENT_RIGHT",
  "R4_FOLIAGE",
  "R4_ACCENTS",
  "R4_NAVIGATION",
  "R4_COLLIDERS",
  "NAV_PLATFORM_CENTER",
  "NAV_BRIDGE_NEAR",
  "NAV_BRIDGE_MID",
  "NAV_BRIDGE_FAR",
  "NAV_FAR_BANK",
  "COLLIDER_PLATFORM_WALKABLE",
  "COLLIDER_BRIDGE_WALKABLE",
  "COLLIDER_FAR_BANK_WALKABLE",
  "COLLIDER_TENT_LEFT",
  "COLLIDER_TENT_RIGHT",
  "R4_FIXED_PORTRAIT_CAMERA"
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function parseGlb(bytes) {
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, "invalid GLB magic");
  assert.equal(bytes.readUInt32LE(4), 2, "GLB must be glTF 2.0");
  assert.equal(bytes.readUInt32LE(8), bytes.length, "GLB length mismatch");
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a, "first chunk must be JSON");
  return JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8"));
}

const glbBytes = await readFile(GLB_URL);
const r3Bytes = await readFile(R3_URL);
const gltf = parseGlb(glbBytes);
const nodes = gltf.nodes || [];
const nodeByName = new Map(nodes.map((node) => [node.name, node]));
const nodeNames = new Set(nodeByName.keys());

assert.ok(glbBytes.length <= 15 * 1024 * 1024, "GLB exceeds 15 MB");
assert.equal(sha256(r3Bytes), EXPECTED_R3_SHA256, "R3 source changed");
assert.equal(gltf.asset?.version, "2.0");
assert.equal(gltf.cameras?.length, 1, "one fixed review camera expected");
assert.ok((gltf.materials?.length || 0) <= 14, "material budget exceeded");
assert.equal(gltf.images?.length || 0, 0, "R4.1A must not embed textures");
assert.equal(gltf.textures?.length || 0, 0, "R4.1A must not use textures");
assert.ok((gltf.meshes?.length || 0) <= 60, "mesh/draw-call budget exceeded");

for (const nodeName of REQUIRED_NODES) {
  assert.ok(nodeNames.has(nodeName), `missing node ${nodeName}`);
}

const root = nodeByName.get("MOONLAKE_VISIBLE_R4_1");
assert.equal(root.extras?.asset_id, "moonlake-visible-r4-1");
assert.equal(root.extras?.shipping_default, false);
assert.ok(root.extras?.renderable_mesh_objects <= 60);
assert.equal(root.extras?.shared_material_count, 14);

const bridge = nodeByName.get("R4_BRIDGE");
assert.equal(bridge.extras?.continuous_deck, true);
assert.equal(bridge.extras?.plank_count, 18);
assert.equal(bridge.extras?.deck_width_m, 2.25);
assert.ok(bridge.extras?.max_gap_m <= 0.03);
assert.ok(bridge.extras?.near_land_overlap_m >= 0.35);
assert.ok(bridge.extras?.far_land_overlap_m >= 0.35);
assert.equal(
  nodes.filter((node) => node.name?.startsWith("R4_BRIDGE_PLANK_")).length,
  18
);

for (const nodeName of REQUIRED_NODES.filter((name) => name.startsWith("NAV_"))) {
  const node = nodeByName.get(nodeName);
  assert.equal(node.extras?.node_role, "navigation_waypoint");
  assert.equal(node.extras?.walkable, true);
}

for (
  const nodeName of REQUIRED_NODES.filter((name) => name.startsWith("COLLIDER_"))
) {
  const node = nodeByName.get(nodeName);
  assert.equal(node.extras?.node_role, "collision_proxy");
  assert.ok(["walkable", "obstacle"].includes(node.extras?.collision_role));
  assert.equal(node.extras?.half_extents_m?.length, 3);
  assert.ok(node.extras.half_extents_m.every((value) => value > 0));
}

for (const node of nodes) {
  if (!node.scale) continue;
  assert.ok(node.scale.every((value) => Number.isFinite(value) && value >= 0));
}

const primitiveCount = (gltf.meshes || []).reduce(
  (total, mesh) => total + (mesh.primitives?.length || 0),
  0
);

console.log(JSON.stringify({
  pass: true,
  package: "TP-MOONLAKE-VISIBLE-GLB-AUTHORING-R4.1A",
  bytes: glbBytes.length,
  sha256: sha256(glbBytes),
  nodes: nodes.length,
  meshes: gltf.meshes?.length || 0,
  primitives: primitiveCount,
  materials: gltf.materials?.length || 0,
  cameras: gltf.cameras?.length || 0,
  bridgePlanks: 18,
  collisionNodes: REQUIRED_NODES.filter((name) => name.startsWith("COLLIDER_"))
    .length,
  navigationNodes: REQUIRED_NODES.filter((name) => name.startsWith("NAV_"))
    .length,
  preservedR3Sha256: sha256(r3Bytes)
}, null, 2));
