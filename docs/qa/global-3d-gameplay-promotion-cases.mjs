import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXPEDITION_WALK_DIRECTIONS,
  getExpeditionSpritePilotProfile
} from "../../src/data/expeditionSpriteProfiles.js";
import { getOrbitTopProfile } from "../../src/data/orbitTopProfiles.js";
import { getThreeSceneProfile } from "../../src/data/threeSceneProfiles.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function parsePngSize(buffer) {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", "invalid PNG signature");
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

function parseGlbJson(buffer) {
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

const spriteManifest = JSON.parse(await readFile(path.join(
  repoRoot,
  "assets/characters/greyshade-cat/metadata/expedition-walk-r1.json"
), "utf8"));
const spriteProfile = getExpeditionSpritePilotProfile("greyshade-cat");
assert.equal(spriteManifest.status, "runtime-promoted-owner-approved");
assert.equal(spriteManifest.ownerApproval.approved, true);
assert.equal(spriteManifest.runtimeBudget.decodedMiBAllDirections, 16);
assert.equal(spriteManifest.legacyPolicy.legacyAssetsRetained, true);
assert.equal(spriteProfile.runtimePromotion, true);
assert.equal(spriteProfile.frameWidth, 256);
assert.equal(spriteProfile.frameHeight, 256);

for (const direction of EXPEDITION_WALK_DIRECTIONS) {
  const entry = spriteManifest.directions[direction];
  assert.ok(entry, `missing sprite manifest direction: ${direction}`);
  for (const [kind, expectedSize] of [
    ["master", [4096, 512]],
    ["runtime", [2048, 256]]
  ]) {
    const asset = entry[kind];
    const buffer = await readFile(path.join(repoRoot, asset.path));
    assert.equal(sha256(buffer), asset.sha256, `${direction} ${kind} hash mismatch`);
    assert.deepEqual(parsePngSize(buffer), expectedSize, `${direction} ${kind} size mismatch`);
    assert.equal(asset.transparentFrameCorners, true);
    assert.ok(asset.uniqueFrameHashes >= 6, `${direction} ${kind} pose variation`);
    assert.ok(asset.maxSoftEdgeRatio <= 1.2, `${direction} ${kind} matte ratio`);
  }
  assert.equal(
    spriteProfile.directions[direction],
    `./${entry.runtime.path}`,
    `${direction} runtime profile path`
  );
}

const orbitManifest = JSON.parse(await readFile(path.join(
  repoRoot,
  "assets/3d/orbit-tops-r1/manifest.json"
), "utf8"));
assert.equal(orbitManifest.status, "runtime-promoted-owner-approved");
assert.equal(orbitManifest.ownerApproval.approved, true);
assert.equal(orbitManifest.runtimePromotionAllowed, true);
assert.equal(orbitManifest.physicsAuthority, "src/orbit/orbitPhysics.js");
assert.equal(orbitManifest.assets.length, 2);

for (const asset of orbitManifest.assets) {
  const profile = getOrbitTopProfile(asset.ownerId);
  assert.ok(profile, `missing Orbit profile: ${asset.ownerId}`);
  assert.equal(profile.artStatus, "runtime-promoted-owner-approved");
  assert.equal(profile.model.glbPath, asset.path);
  assert.equal(asset.collider.meshIsAuthority, false);
  assert.ok(asset.runtimeStats.bytes < 2 * 1024 * 1024, `${asset.assetId} GLB budget`);
  const buffer = await readFile(path.join(repoRoot, asset.path));
  assert.equal(sha256(buffer), asset.runtimeStats.sha256, `${asset.assetId} hash mismatch`);
  const gltf = parseGlbJson(buffer);
  const nodeNames = new Set((gltf.nodes || []).map((node) => node.name));
  for (const requiredNode of ["OrbitTopRoot", "BaseForm", "ResonanceForm"]) {
    assert.equal(nodeNames.has(requiredNode), true, `${asset.assetId} missing ${requiredNode}`);
  }
}

const threeProfile = getThreeSceneProfile("orbit-top-pilot");
assert.equal(threeProfile.mode, "approved-live-pilot");
assert.equal(threeProfile.enableByDefault, true);
assert.equal(threeProfile.fallback, "orbit-canvas");
assert.equal(threeProfile.authority, "snapshot-only");

console.log("PASS global-3d-gameplay-promotion-cases");
