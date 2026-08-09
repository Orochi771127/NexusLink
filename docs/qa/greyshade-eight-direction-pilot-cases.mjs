import assert from "node:assert/strict";

import {
  EXPEDITION_WALK_DIRECTIONS,
  getExpeditionSpritePilotProfile,
  isExpeditionSpritePilotRequested
} from "../../src/data/expeditionSpriteProfiles.js";
import {
  quantizeExpeditionWalkDirection,
  syncEightDirectionCompanionPilot
} from "../../src/pixi/expeditionScene.js";

const expectedDirections = {
  "0,-1": "north",
  "1,-1": "northeast",
  "1,0": "east",
  "1,1": "southeast",
  "0,1": "south",
  "-1,1": "southwest",
  "-1,0": "west",
  "-1,-1": "northwest"
};

for (const [vector, expected] of Object.entries(expectedDirections)) {
  const [dx, dy] = vector.split(",").map(Number);
  assert.equal(quantizeExpeditionWalkDirection(dx, dy), expected, vector);
}
assert.equal(quantizeExpeditionWalkDirection(0, 0, "northwest"), "northwest");
assert.equal(quantizeExpeditionWalkDirection(Number.NaN, 0, "invalid"), "south");

const profile = getExpeditionSpritePilotProfile("greyshade-cat");
assert.ok(profile);
assert.equal(profile.artStatus, "runtime-promoted-owner-approved");
assert.equal(profile.runtimePromotion, true);
assert.equal(profile.frameWidth, 256);
assert.equal(profile.frameHeight, 256);
assert.equal(profile.frameCount, 8);
assert.deepEqual(Object.keys(profile.directions), [...EXPEDITION_WALK_DIRECTIONS]);
assert.equal(isExpeditionSpritePilotRequested("greyshade-cat", "?expedition8dirPilot=1"), true);
assert.equal(isExpeditionSpritePilotRequested("greyshade-cat", ""), true);
assert.equal(isExpeditionSpritePilotRequested("greyshade-cat", "?expedition8dirPilot=0"), false);
assert.equal(isExpeditionSpritePilotRequested("blazetail-kit", "?expedition8dirPilot=1"), false);

const calls = [];
const sprite = {
  playing: false,
  textures: null,
  play() { this.playing = true; calls.push("play"); },
  stop() { this.playing = false; calls.push("stop"); },
  gotoAndStop(frame) { calls.push(`frame:${frame}`); }
};
const node = {
  __eightDirectionSprite: sprite,
  __eightDirectionTextures: Object.fromEntries(
    EXPEDITION_WALK_DIRECTIONS.map((direction) => [direction, [`${direction}-frames`]])
  ),
  __eightDirectionDirection: "south",
  __eightDirectionPilotPosition: { x: 10, y: 10 }
};
assert.equal(syncEightDirectionCompanionPilot(node, 11, 9), true);
assert.equal(node.__eightDirectionDirection, "northeast");
assert.deepEqual(sprite.textures, ["northeast-frames"]);
assert.equal(sprite.playing, true);
assert.equal(syncEightDirectionCompanionPilot(node, 11, 9), true);
assert.equal(sprite.playing, false);
assert.deepEqual(calls, ["play", "stop", "frame:0"]);

console.log("greyshade-eight-direction-pilot-cases: PASS");
