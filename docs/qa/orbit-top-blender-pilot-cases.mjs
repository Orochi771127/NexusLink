import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const candidateRoot = path.join(
  repoRoot,
  "output/global-3d-gameplay-pilots-r1/blender"
);
const manifestPath = path.join(candidateRoot, "orbit-top-pilot-manifest.json");
const requireCandidates = process.argv.includes("--require-candidates");

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function readGlbJson(buffer) {
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, "invalid GLB magic");
  assert.equal(buffer.readUInt32LE(4), 2, "GLB must use version 2");
  assert.equal(buffer.readUInt32LE(8), buffer.length, "GLB length mismatch");
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;
    assert.ok(chunkEnd <= buffer.length, "GLB chunk exceeds file length");
    if (chunkType === 0x4e4f534a) {
      return JSON.parse(buffer.subarray(chunkStart, chunkEnd).toString("utf8").trim());
    }
    offset = chunkEnd;
  }
  throw new Error("GLB JSON chunk missing");
}

if (!(await exists(manifestPath))) {
  if (requireCandidates) throw new Error(`candidate manifest missing: ${manifestPath}`);
  console.log("SKIP orbit-top-blender-pilot-cases (local candidates absent)");
  process.exit(0);
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
assert.equal(manifest.humanApprovalRequired, true);
assert.equal(manifest.runtimePromotionAllowed, false);
assert.equal(manifest.physicsAuthority, "src/orbit/orbitPhysics.js");
assert.equal(manifest.assets.length, 2);

for (const asset of manifest.assets) {
  assert.equal(asset.artStatus, "candidate-awaiting-human");
  assert.equal(asset.nodes.base, "BaseForm");
  assert.equal(asset.nodes.resonance, "ResonanceForm");
  assert.equal(asset.collider.type, "deterministic-2d-circle");
  assert.equal(asset.collider.source, "src/orbit/orbitPhysics.js body.radius");
  assert.equal(asset.collider.meshIsAuthority, false);

  const glbPath = path.join(candidateRoot, `${asset.assetId}.glb`);
  assert.equal(await exists(glbPath), true, `candidate GLB missing: ${asset.assetId}`);
  const gltf = readGlbJson(await readFile(glbPath));
  const nodeNames = new Set((gltf.nodes || []).map((node) => node.name));
  for (const requiredNode of ["OrbitTopRoot", "BaseForm", "ResonanceForm"]) {
    assert.equal(nodeNames.has(requiredNode), true,
      `${asset.assetId} missing ${requiredNode}`);
  }
}

console.log("PASS orbit-top-blender-pilot-cases");
