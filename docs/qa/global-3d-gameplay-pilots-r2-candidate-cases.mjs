import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getExpeditionCompanionActionPilotProfile,
  getExpeditionEnemyActionPilotProfile,
  isExpeditionActionPilotRequested
} from "../../src/data/expeditionActionSpriteProfiles.js";
import { getOrbitTopProfile } from "../../src/data/orbitTopProfiles.js";

globalThis.location = { search: "?expeditionActionPilot=1" };

const {
  playCompanionActionPilot,
  playEnemyActionPilot,
  syncEnemyActionPilot,
  syncExpeditionActionEvents
} = await import("../../src/pixi/expeditionScene.js");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const greyshadeManifestPath = path.join(
  repoRoot,
  "assets/characters/greyshade-cat/metadata/expedition-actions-r2.json"
);
const enemyManifestPath = path.join(
  repoRoot,
  "assets/enemies/rift-root-echo/expedition/r2/manifest.json"
);
const orbitManifestPath = path.join(repoRoot, "assets/3d/orbit-tops-r2/manifest.json");

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

assert.equal(isExpeditionActionPilotRequested("?expeditionActionPilot=1"), true);
assert.equal(isExpeditionActionPilotRequested("?expeditionActionPilot=0"), false);
assert.equal(isExpeditionActionPilotRequested(""), true);

const companionProfile = getExpeditionCompanionActionPilotProfile("greyshade-cat");
assert.equal(companionProfile.artStatus, "runtime-promoted-owner-approved");
assert.equal(companionProfile.runtimePromotion, true);
assert.deepEqual(Object.keys(companionProfile.actions), ["attack_basic", "hit"]);
const enemyProfile = getExpeditionEnemyActionPilotProfile("unregistered-rift-type");
assert.equal(enemyProfile.ownerId, "rift-root-echo");
assert.equal(enemyProfile.artStatus, "runtime-promoted-owner-approved");
assert.equal(enemyProfile.runtimePromotion, true);
assert.deepEqual(Object.keys(enemyProfile.actions), ["move", "attack"]);

for (const [actionId, definition] of Object.entries(companionProfile.actions)) {
  assert.equal(definition.frameWidth, 256);
  assert.equal(definition.frameHeight, 256);
  assert.equal(definition.columns * definition.rows, definition.frameCount);
  assert.deepEqual(Object.keys(definition.directions), [
    "north", "northeast", "east", "southeast",
    "south", "southwest", "west", "northwest"
  ]);
  const expected = actionId === "attack_basic" ? [1536, 256] : [1024, 256];
  for (const [direction, sheet] of Object.entries(definition.directions)) {
    const filePath = path.join(repoRoot, sheet.replace(/^\.\//, ""));
    assert.equal(await exists(filePath), true, `${actionId}:${direction} missing`);
    assert.deepEqual(parsePngSize(await readFile(filePath)), expected);
  }
}

for (const [actionId, definition] of Object.entries(enemyProfile.actions)) {
  assert.equal(definition.frameWidth, 256);
  assert.equal(definition.frameHeight, 256);
  assert.equal(definition.columns * definition.rows, definition.frameCount);
  const expected = actionId === "move" ? [2048, 256] : [1536, 256];
  const filePath = path.join(repoRoot, definition.sheet.replace(/^\.\//, ""));
  assert.equal(await exists(filePath), true, `enemy:${actionId} missing`);
  assert.deepEqual(parsePngSize(await readFile(filePath)), expected);
}

function mockSprite(name) {
  return {
    name,
    visible: false,
    playing: false,
    calls: [],
    stop() { this.playing = false; this.calls.push("stop"); },
    play() { this.playing = true; this.calls.push("play"); },
    gotoAndStop(frame) { this.playing = false; this.calls.push(`stop:${frame}`); },
    gotoAndPlay(frame) { this.playing = true; this.calls.push(`play:${frame}`); }
  };
}

const walk = mockSprite("walk");
walk.visible = true;
const fallback = { visible: false };
class MockTexture {
  constructor(options) { Object.assign(this, options); }
}
class MockRectangle {
  constructor(x, y, width, height) { Object.assign(this, { x, y, width, height }); }
}
class MockAnimatedSprite {
  constructor(textures) {
    Object.assign(this, mockSprite("action"));
    this.textures = textures;
    this.anchor = { set: (x, y) => { this.anchorValue = [x, y]; } };
    this.scale = { set: (value) => { this.scaleValue = value; } };
  }
}
const PIXI = {
  Assets: { load: async (sheet) => ({ source: { sheet } }) },
  Texture: MockTexture,
  Rectangle: MockRectangle,
  AnimatedSprite: MockAnimatedSprite
};
const companionNode = {
  destroyed: false,
  __eightDirectionSprite: walk,
  __eightDirectionDirection: "east",
  __candidateActionPIXI: PIXI,
  __candidateActionProfile: companionProfile,
  __candidateActionSprites: Object.create(null),
  __candidateActionLoadPromises: Object.create(null),
  children: [],
  addChildAt(sprite) { this.children.push(sprite); },
  getChildByName(name) { return name === "procedural_body_fallback" ? fallback : null; }
};
assert.equal(playCompanionActionPilot(companionNode, "attack_basic"), true);
await new Promise((resolve) => setTimeout(resolve, 0));
const companionAttack = companionNode.__candidateActionSprites["attack_basic:east"];
assert.ok(companionAttack);
assert.equal(companionAttack.visible, true);
assert.equal(walk.visible, false);
companionAttack.onComplete();
assert.equal(companionAttack.visible, false);
assert.equal(walk.visible, true);

const enemyMove = mockSprite("move");
enemyMove.visible = true;
const enemyAttack = mockSprite("attack");
const enemyNode = {
  destroyed: false,
  __candidateEnemyActionSprites: { move: enemyMove, attack: enemyAttack },
  __candidateEnemyPosition: { x: 0, y: 0 }
};
assert.equal(syncEnemyActionPilot(enemyNode, 1, 0), true);
assert.equal(enemyMove.playing, true);
assert.equal(playEnemyActionPilot(enemyNode), true);
assert.equal(enemyAttack.visible, true);
assert.equal(enemyMove.visible, false);
enemyAttack.onComplete();
assert.equal(enemyMove.visible, true);

const enemyLayer = {
  getChildByName(name) { return name === "enemy_rift-1" ? enemyNode : null; }
};
const sceneRoot = {
  __companionNode: companionNode,
  __enemyLayer: enemyLayer,
  __candidateActionCombatLogLength: 0
};
const combatLog = [
  { t: 1, who: "companion", target: "rift-1" },
  { t: 2, who: "enemy", target: "rift-1" }
];
assert.equal(syncExpeditionActionEvents(sceneRoot, { combatLog }), 2);
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(companionNode.__candidateActionPlaying, "hit");
assert.equal(enemyNode.__candidateEnemyActionPlaying, "attack");
assert.equal(syncExpeditionActionEvents(sceneRoot, { combatLog }), 0);

const greyshadeManifest = JSON.parse(await readFile(greyshadeManifestPath, "utf8"));
assert.equal(greyshadeManifest.status, "runtime-promoted-owner-approved");
assert.equal(greyshadeManifest.ownerApproval.approved, true);
assert.equal(greyshadeManifest.runtimeBudget.decodedMiBActiveDirection, 2.5);
assert.equal(greyshadeManifest.runtimeBudget.decodedMiBAllCachedDirections, 20);
const enemyManifest = JSON.parse(await readFile(enemyManifestPath, "utf8"));
assert.equal(enemyManifest.status, "runtime-promoted-owner-approved");
assert.equal(enemyManifest.ownerApproval.approved, true);
const orbitManifest = JSON.parse(await readFile(orbitManifestPath, "utf8"));
assert.equal(orbitManifest.runtimePromotionAllowed, true);
assert.equal(orbitManifest.ownerApproval.approved, true);
assert.equal(orbitManifest.physicsAuthority, "src/orbit/orbitPhysics.js");
assert.equal(orbitManifest.assets.length, 1);
const asset = orbitManifest.assets[0];
assert.equal(asset.ownerId, "crystalfin-seahorse");
assert.equal(asset.collider.meshIsAuthority, false);
assert.equal(asset.artStatus, "runtime-promoted-owner-approved");

const glbPath = path.join(repoRoot, asset.path);
assert.ok((await stat(glbPath)).size < 2 * 1024 * 1024, "Crystalfin GLB exceeds 2 MiB Pilot budget");
const gltf = parseGlbJson(await readFile(glbPath));
const nodeNames = new Set((gltf.nodes || []).map((node) => node.name));
for (const nodeName of [
  "OrbitTopRoot",
  "BaseForm",
  "ResonanceForm",
  "ColliderProxy_Deterministic2D"
]) {
  assert.equal(nodeNames.has(nodeName), true, `Crystalfin GLB missing ${nodeName}`);
}

const orbitProfile = getOrbitTopProfile("crystalfin-seahorse");
assert.equal(orbitProfile.artStatus, "runtime-promoted-owner-approved");
assert.equal(
  path.normalize(orbitProfile.model.glbPath),
  path.normalize("assets/3d/orbit-tops-r2/crystalfin-seahorse-orbit-top-r2.glb")
);

const orbitPilotSceneSource = await readFile(
  path.join(repoRoot, "src/three/orbitTopPilotScene.js"),
  "utf8"
);
assert.match(orbitPilotSceneSource, /candidateUrlsFor/);
assert.match(orbitPilotSceneSource, /candidateIsReviewable/);
assert.match(orbitPilotSceneSource, /loadFirstAvailable/);
assert.match(orbitPilotSceneSource, /loadedUrls/);
assert.match(
  orbitPilotSceneSource,
  /\? \[candidateUrl, approvedUrl\]/,
  "candidate mode must retain approved per-actor fallback"
);

console.log("PASS global-3d-gameplay-pilots-r2-candidate-cases");
