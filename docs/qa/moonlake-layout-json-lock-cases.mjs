import assert from "node:assert/strict";
import { SCENE_LAYOUT } from "../../src/data/sceneLayout.js";
import { moonlakeObjectPack } from "../../src/data/sceneProfiles/moonlakeObjectPack.js";
import { moonlakeProfile } from "../../src/data/sceneProfiles/moonlakeProfile.js";

const expectedSceneObjects = {
  sun: { x: 263.948, y: 45.103, scale: 0.085 },
  moon: { x: 249.428, y: 44.174, scale: 0.085 },
  lantern_post_left: { x: 288.952, y: 585.271, scale: 0.21 },
  crystal_cluster: { x: 68.368, y: 662.921, scale: 0.29 },
  companion: { x: 205, y: 623, scale: 0.72 }
};

for (const [id, expected] of Object.entries(expectedSceneObjects)) {
  const actual = SCENE_LAYOUT.objects.find((entry) => entry.id === id);
  assert.ok(actual, `missing scene object ${id}`);
  assert.equal(actual.x, expected.x, `${id} x`);
  assert.equal(actual.y, expected.y, `${id} y`);
  assert.equal(actual.scale.x, expected.scale, `${id} scale.x`);
  assert.equal(actual.scale.y, expected.scale, `${id} scale.y`);
}

const expectedR2 = {
  beacon_far: {
    slotId: "moonlake-far-beacon",
    cell: { column: 9, row: 6 },
    offsetPx: { x: -49, y: -6 },
    artPosition: { x: 806, y: 618 },
    scale: 0.218
  },
  crescent_shrine: {
    slotId: "moonlake-crescent-shrine",
    cell: { column: 4, row: 7 },
    offsetPx: { x: 35, y: -42 },
    artPosition: { x: 440, y: 678 },
    scale: 0.432
  },
  tent_near_right: {
    slotId: "moonlake-near-right-tent",
    cell: { column: 11, row: 13 },
    offsetPx: { x: -30, y: 10 },
    artPosition: { x: 1005, y: 1306 },
    scale: 1.53
  },
  tent_near_left: {
    slotId: "moonlake-near-left-tent",
    cell: { column: 3, row: 8 },
    offsetPx: { x: 4, y: 36 },
    artPosition: { x: 319, y: 852 },
    scale: 0.456
  },
  tent_mid_right: {
    slotId: "moonlake-mid-right-tent",
    cell: { column: 10, row: 9 },
    offsetPx: { x: -25, y: 39 },
    artPosition: { x: 920, y: 951 },
    scale: 0.77
  },
  tent_mid_left: {
    slotId: "moonlake-mid-left-tent",
    cell: { column: 0, row: 13 },
    offsetPx: { x: -5, y: -57 },
    artPosition: { x: 40, y: 1239 },
    scale: 1.513
  },
  beacon_main: {
    slotId: "moonlake-main-beacon",
    cell: { column: 6, row: 9 },
    offsetPx: { x: 65, y: -78 },
    artPosition: { x: 650, y: 834 },
    scale: 0.699
  },
  tent_far: {
    slotId: "moonlake-far-tent",
    cell: { column: 7, row: 6 },
    offsetPx: { x: 25, y: -70 },
    artPosition: { x: 700, y: 554 },
    scale: 0.198
  }
};

const grid = moonlakeObjectPack.placementGrid;
const slots = new Map(moonlakeObjectPack.slots.map((slot) => [slot.id, slot]));

for (const [assetId, expected] of Object.entries(expectedR2)) {
  const placement = moonlakeObjectPack.placements.find((entry) => entry.assetId === assetId);
  assert.ok(placement, `missing placement ${assetId}`);
  assert.equal(placement.slotId, expected.slotId, `${assetId} slotId`);
  assert.equal(placement.scale, expected.scale, `${assetId} scale`);

  const slot = slots.get(expected.slotId);
  assert.deepEqual(slot.cell, expected.cell, `${assetId} cell`);
  assert.deepEqual(slot.offsetPx, expected.offsetPx, `${assetId} offsetPx`);
  assert.deepEqual({
    x: (slot.cell.column + 0.5) * grid.cellWidth + slot.offsetPx.x,
    y: (slot.cell.row + 0.5) * grid.cellHeight + slot.offsetPx.y
  }, expected.artPosition, `${assetId} artPosition`);
}

const art = moonlakeProfile.artSize;
const safe = moonlakeProfile.safeZone;
const point = moonlakeProfile.companion.backgroundPoint;
const backgroundScale = Math.max(safe.referenceWidth / art.width, safe.referenceHeight / art.height);
const projectedCompanion = {
  x: safe.referenceWidth / 2 + (point.x - art.width / 2) * backgroundScale,
  y: safe.referenceHeight / 2 + (point.y - art.height / 2) * backgroundScale
};

assert.deepEqual({
  x: Math.round(projectedCompanion.x),
  y: Math.round(projectedCompanion.y)
}, { x: 205, y: 623 }, "companion projected target");
assert.equal(
  expectedSceneObjects.companion.scale * moonlakeProfile.companion.displayScale,
  0.648,
  "companion runtime scale"
);

console.log("Moonlake layout JSON lock: 38/38 PASS");
