import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXPEDITION_WALK_DIRECTIONS,
  getExpeditionSpritePilotProfile,
  isExpeditionSpritePilotRequested
} from "../../src/data/expeditionSpriteProfiles.js";
import {
  getExpeditionCompanionActionPilotProfile
} from "../../src/data/expeditionActionSpriteProfiles.js";
import {
  getAdventureProfile,
  hasAdventureProfile
} from "../../src/data/companionAdventureProfiles.js";
import { getOrbitTopProfile } from "../../src/data/orbitTopProfiles.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const metadataRoot = path.join(repoRoot, "assets/characters/crystalfin-seahorse/metadata");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function parsePngSize(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

async function verifyAsset(asset, expectedSize, label) {
  const buffer = await readFile(path.join(repoRoot, asset.path));
  assert.equal(sha256(buffer), asset.sha256, `${label} hash mismatch`);
  assert.deepEqual(parsePngSize(buffer), expectedSize, `${label} size mismatch`);
  assert.equal(asset.transparentFrameCorners, true, `${label} transparent corners`);
  assert.equal(asset.bottomCenterSafe, true, `${label} bottom-center safety`);
  assert.equal(asset.visibleMagentaPixels, 0, `${label} magenta residue`);
  assert.ok(asset.uniqueFrameHashes >= 3, `${label} pose variation`);
}

assert.equal(isExpeditionSpritePilotRequested("crystalfin-seahorse", "?expedition8dirPilot=0"), false);
assert.equal(isExpeditionSpritePilotRequested("crystalfin-seahorse", ""), true);

const walkProfile = getExpeditionSpritePilotProfile("crystalfin-seahorse");
assert.equal(walkProfile.companionId, "crystalfin-seahorse");
assert.equal(walkProfile.artStatus, "runtime-promoted-owner-approved");
assert.equal(walkProfile.runtimePromotion, true);
assert.equal(walkProfile.frameCount, 8);
assert.equal(walkProfile.frameWidth, 256);
assert.equal(walkProfile.frameHeight, 256);
assert.deepEqual(Object.keys(walkProfile.directions), [...EXPEDITION_WALK_DIRECTIONS]);

const actionProfile = getExpeditionCompanionActionPilotProfile("crystalfin-seahorse");
assert.equal(actionProfile.ownerId, "crystalfin-seahorse");
assert.equal(actionProfile.runtimePromotion, true);
assert.deepEqual(Object.keys(actionProfile.actions), ["attack_basic", "hit"]);
assert.match(actionProfile.actions.attack_basic.presentationMeaning, /current-pulse/);
assert.match(actionProfile.actions.hit.presentationMeaning, /without injury spectacle/);
assert.equal(hasAdventureProfile("crystalfin-seahorse"), true);
assert.equal(getAdventureProfile("crystalfin-seahorse")?.riskAversion, 0.7);

const walkManifest = JSON.parse(await readFile(path.join(metadataRoot, "expedition-walk-r4.json"), "utf8"));
const actionManifest = JSON.parse(await readFile(path.join(metadataRoot, "expedition-actions-r4.json"), "utf8"));
for (const manifest of [walkManifest, actionManifest]) {
  assert.equal(manifest.companionId, "crystalfin-seahorse");
  assert.equal(manifest.status, "runtime-promoted-owner-approved");
  assert.equal(manifest.ownerApproval.approved, true);
  assert.equal(manifest.ownerApproval.approvedOn, "2026-08-11");
  assert.equal(manifest.qualityGate.result, "passed");
  assert.equal(manifest.legacyPolicy.legacyAssetsRetained, true);
  assert.equal(manifest.legacyPolicy.fallbackOwner, "crystalfin-seahorse");
  assert.equal(manifest.legacyPolicy.crossOwnerFallbackAllowed, false);
  assert.match(manifest.production.license, /project-owned generated assets/);
}

assert.deepEqual(walkManifest.directionSourcePolicy.authored, [
  "north", "northeast", "east", "southeast", "south"
]);
assert.deepEqual(walkManifest.directionSourcePolicy.mirrored, {
  northwest: "northeast",
  west: "east",
  southwest: "southeast"
});
assert.equal(walkManifest.runtimeBudget.decodedMiBAllDirections, 16);
assert.match(
  walkManifest.runtimeBudget.loadingPolicy,
  /preload all eight directional walk sheets/,
  "walk manifest must describe the runtime's actual eager eight-direction preload"
);
assert.equal(actionManifest.runtimeBudget.decodedMiBActiveDirection, 2.5);
assert.equal(actionManifest.runtimeBudget.decodedMiBAllCachedDirections, 20);

for (const direction of EXPEDITION_WALK_DIRECTIONS) {
  const walk = walkManifest.directions[direction];
  assert.ok(walk, `walk:${direction} manifest entry`);
  await verifyAsset(walk.master, [4096, 512], `walk:${direction}:master`);
  await verifyAsset(walk.runtime, [2048, 256], `walk:${direction}:runtime`);
  assert.equal(walkProfile.directions[direction], `./${walk.runtime.path}`);

  for (const [actionId, expectedMaster, expectedRuntime] of [
    ["attack_basic", [3072, 512], [1536, 256]],
    ["hit", [2048, 512], [1024, 256]]
  ]) {
    const action = actionManifest.actions[actionId].directions[direction];
    await verifyAsset(action.master, expectedMaster, `${actionId}:${direction}:master`);
    await verifyAsset(action.runtime, expectedRuntime, `${actionId}:${direction}:runtime`);
    assert.equal(actionProfile.actions[actionId].directions[direction], `./${action.runtime.path}`);
  }
}

for (const direction of ["northwest", "west", "southwest"]) {
  assert.equal(walkManifest.directions[direction].mirroredFromEastSide, true);
  assert.equal(actionManifest.actions.attack_basic.directions[direction].mirroredFromEastSide, true);
  assert.equal(actionManifest.actions.hit.directions[direction].mirroredFromEastSide, true);
}

const orbitProfile = getOrbitTopProfile("crystalfin-seahorse");
assert.equal(orbitProfile.id, "crystalfin-seahorse-orbit-top-r2");
assert.match(orbitProfile.model.glbPath, /assets\/3d\/orbit-tops-r2\//);
assert.doesNotMatch(orbitProfile.model.glbPath, /r4/);

for (const protectedFile of [
  "src/state/defaultState.js",
  "src/state/saveManager.js",
  "src/state/store.js"
]) {
  const source = await readFile(path.join(repoRoot, protectedFile), "utf8");
  assert.doesNotMatch(source, /expedition\/r4|expedition-walk-r4|expedition-actions-r4/);
}

console.log("PASS global-3d-gameplay-batch-r4-cases");
