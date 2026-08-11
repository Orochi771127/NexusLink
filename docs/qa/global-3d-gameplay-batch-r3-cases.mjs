import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
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
  createOrbitTopCombatFormConfig,
  getOrbitTopProfile
} from "../../src/data/orbitTopProfiles.js";
import { hasAdventureProfile } from "../../src/data/companionAdventureProfiles.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const metadataRoot = path.join(repoRoot, "assets/characters/blazetail-kit/metadata");

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
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

assert.equal(isExpeditionSpritePilotRequested("blazetail-kit", "?expedition8dirPilot=0"), false);
assert.equal(isExpeditionSpritePilotRequested("blazetail-kit", ""), true);
assert.equal(getExpeditionSpritePilotProfile("flametail-fox"), null, "legacy ID must not gain an R3 profile");
assert.equal(getExpeditionCompanionActionPilotProfile("flametail-fox"), null);
assert.equal(getOrbitTopProfile("flametail-fox"), null);
assert.equal(hasAdventureProfile("blazetail-kit"), true);
assert.equal(hasAdventureProfile("flametail-fox"), false);

const walkProfile = getExpeditionSpritePilotProfile("blazetail-kit");
assert.equal(walkProfile.artStatus, "runtime-promoted-owner-approved");
assert.equal(walkProfile.runtimePromotion, true);
assert.deepEqual(Object.keys(walkProfile.directions), [...EXPEDITION_WALK_DIRECTIONS]);
for (const [direction, sheet] of Object.entries(walkProfile.directions)) {
  const filePath = path.join(repoRoot, sheet.replace(/^\.\//, ""));
  assert.equal(await exists(filePath), true, `walk:${direction} missing`);
  assert.deepEqual(parsePngSize(await readFile(filePath)), [2048, 256]);
}

const actionProfile = getExpeditionCompanionActionPilotProfile("blazetail-kit");
assert.equal(actionProfile.ownerId, "blazetail-kit");
assert.equal(actionProfile.runtimePromotion, true);
assert.deepEqual(Object.keys(actionProfile.actions), ["attack_basic", "hit"]);
for (const [actionId, action] of Object.entries(actionProfile.actions)) {
  const expected = actionId === "attack_basic" ? [1536, 256] : [1024, 256];
  const expectedFrames = actionId === "attack_basic" ? 6 : 4;
  assert.equal(action.frameCount, expectedFrames);
  assert.equal(action.columns * action.rows, expectedFrames);
  assert.deepEqual(Object.keys(action.directions), [...EXPEDITION_WALK_DIRECTIONS]);
  for (const [direction, sheet] of Object.entries(action.directions)) {
    assert.match(sheet, /assets\/characters\/blazetail-kit\//, "R3 may only fallback within its owner root");
    const filePath = path.join(repoRoot, sheet.replace(/^\.\//, ""));
    assert.equal(await exists(filePath), true, `${actionId}:${direction} missing`);
    assert.deepEqual(parsePngSize(await readFile(filePath)), expected);
  }
}

const walkManifest = JSON.parse(await readFile(path.join(metadataRoot, "expedition-walk-r3.json"), "utf8"));
const actionManifest = JSON.parse(await readFile(path.join(metadataRoot, "expedition-actions-r3.json"), "utf8"));
for (const manifest of [walkManifest, actionManifest]) {
  assert.equal(manifest.companionId, "blazetail-kit");
  assert.equal(manifest.status, "runtime-promoted-owner-approved");
  assert.equal(manifest.ownerApproval.approved, true);
  assert.equal(manifest.legacyPolicy.fallbackOwner, "blazetail-kit");
  assert.equal(manifest.legacyPolicy.crossOwnerFallbackAllowed, false);
  assert.equal(manifest.qualityGate.result, "passed");
}
assert.equal(Object.keys(walkManifest.directions).length, 8);
assert.equal(Object.keys(actionManifest.actions.attack_basic.directions).length, 8);
assert.equal(Object.keys(actionManifest.actions.hit.directions).length, 8);
assert.equal(actionManifest.runtimeBudget.decodedMiBActiveDirection, 2.5);
assert.equal(actionManifest.runtimeBudget.decodedMiBAllCachedDirections, 20);

const orbitManifestPath = path.join(repoRoot, "assets/3d/orbit-tops-r3/manifest.json");
const orbitManifest = JSON.parse(await readFile(orbitManifestPath, "utf8"));
assert.equal(orbitManifest.runtimePromotionAllowed, true);
assert.equal(orbitManifest.physicsAuthority, "src/orbit/orbitPhysics.js");
assert.equal(orbitManifest.ownerApproval.approved, true);
assert.equal(orbitManifest.assets.length, 1);
const orbitAsset = orbitManifest.assets[0];
assert.equal(orbitAsset.ownerId, "blazetail-kit");
assert.equal(orbitAsset.collider.meshIsAuthority, false);
assert.match(orbitAsset.formContract, /equal-budget session state/);
const glbPath = path.join(repoRoot, orbitAsset.path);
assert.ok((await stat(glbPath)).size < 2 * 1024 * 1024, "Blazetail GLB exceeds 2 MiB budget");
const gltf = parseGlbJson(await readFile(glbPath));
const nodeNames = new Set((gltf.nodes || []).map((node) => node.name));
for (const required of orbitAsset.runtimeStats.requiredNodes) {
  assert.equal(nodeNames.has(required), true, `Blazetail GLB missing ${required}`);
}

const orbitProfile = getOrbitTopProfile("blazetail-kit");
assert.equal(orbitProfile.id, "blazetail-kit-orbit-top-r3");
assert.equal(orbitProfile.model.colliderProxyNode, "ColliderProxy_Deterministic2D");
assert.deepEqual(orbitProfile.model.spinAxis, [0, 0, 1]);
const baseBudget = Object.values(orbitProfile.forms.base.physics).reduce((sum, value) => sum + value, 0);
const resonanceBudget = Object.values(orbitProfile.forms.resonance.physics).reduce((sum, value) => sum + value, 0);
assert.equal(baseBudget, 6);
assert.ok(Math.abs(resonanceBudget - 6) < 1e-9, "resonance must remain equal-budget");
assert.notDeepEqual(orbitProfile.forms.base.physics, orbitProfile.forms.resonance.physics);

const symmetricConfig = createOrbitTopCombatFormConfig("blazetail-kit", { enemyId: "blazetail-kit" });
assert.equal(symmetricConfig.player.profileId, "blazetail-kit-orbit-top-r3");
assert.equal(symmetricConfig.dummy.profileId, "blazetail-kit-orbit-top-r3");
assert.deepEqual(symmetricConfig.player.forms, symmetricConfig.dummy.forms);

for (const protectedFile of [
  "src/state/defaultState.js",
  "src/state/saveManager.js",
  "src/state/store.js"
]) {
  const source = await readFile(path.join(repoRoot, protectedFile), "utf8");
  assert.doesNotMatch(source, /blazetail-kit-orbit-top-r3|orbit-tops-r3/, `${protectedFile} must not persist R3 session forms`);
}

console.log("PASS global-3d-gameplay-batch-r3-cases");
