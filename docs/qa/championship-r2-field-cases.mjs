import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  FIELD_COLLISION_DECISIONS,
  FIELD_COLLISION_PROFILE_IDS,
  FIELD_COLLISION_RULES,
  FIELD_FAMILIES,
  FIELD_RUNTIME_LIMITS,
  createFieldCollisionAdapter,
  createFieldDefinition,
  computeFieldCameraWindow,
  computeVisibleChunkWindow,
  getFieldChunkBounds,
  getFieldTileCount,
  getFieldWorldSize,
  worldPointToFieldTile
} from "../../src/championship/field/index.js";
import {
  CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER,
  CHAMPIONSHIP_R2_FIELD_COUNTS,
  CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES,
  CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES,
  getFieldFamilyProfile,
  getSanitizedFieldInventory,
  validateFieldFamilyProfileCatalog,
  validateSanitizedFieldInventoryCatalog
} from "../../src/data/championship/r2/fields/fieldInventoryR2.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

function cmDraft(overrides = {}) {
  return {
    schemaVersion: 2,
    fieldId: "nexus:championship:r2:field:cm-test",
    family: FIELD_FAMILIES.CM,
    collisionProfileId: FIELD_COLLISION_PROFILE_IDS.CM,
    dimensions: { widthTiles: 40, heightTiles: 24 },
    tileSizePx: 16,
    chunkSizeTiles: 8,
    collisionData: { kind: FIELD_COLLISION_RULES.UNKNOWN_NOT_EXECUTABLE },
    ...overrides
  };
}

function bmDraft(overrides = {}) {
  return {
    schemaVersion: 2,
    fieldId: "nexus:championship:r2:field:bm-test",
    family: FIELD_FAMILIES.BM,
    collisionProfileId: FIELD_COLLISION_PROFILE_IDS.BM,
    dimensions: { widthTiles: 17, heightTiles: 9 },
    tileSizePx: 24,
    chunkSizeTiles: 8,
    collisionData: { kind: FIELD_COLLISION_RULES.UNKNOWN_NOT_EXECUTABLE },
    ...overrides
  };
}

function hmDraft(values, overrides = {}) {
  return {
    schemaVersion: 2,
    fieldId: "nexus:championship:r2:field:hm-test",
    family: FIELD_FAMILIES.HM,
    collisionProfileId: FIELD_COLLISION_PROFILE_IDS.HM,
    dimensions: { widthTiles: 128, heightTiles: 128 },
    tileSizePx: 8,
    chunkSizeTiles: 16,
    collisionData: { kind: "HM_SANITIZED_ATTRIBUTE_GRID", values },
    ...overrides
  };
}

function plainClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const cm = createFieldDefinition(cmDraft(), getFieldFamilyProfile(FIELD_FAMILIES.CM));
const bm = createFieldDefinition(bmDraft(), getFieldFamilyProfile(FIELD_FAMILIES.BM));
const hmValues = Array(128 * 128).fill(0);
hmValues[0] = 1;
hmValues[1] = 2;
const hm = createFieldDefinition(hmDraft(hmValues), getFieldFamilyProfile(FIELD_FAMILIES.HM));

test("sanitized inventories expose exactly 40 CM, 30 HM, and 12 physical BM records", () => {
  assert.equal(CHAMPIONSHIP_R2_FIELD_COUNTS.CM, 40);
  assert.equal(CHAMPIONSHIP_R2_FIELD_COUNTS.HM, 30);
  assert.equal(CHAMPIONSHIP_R2_FIELD_COUNTS.BM_PHYSICAL, 12);
  assert.equal(getSanitizedFieldInventory("CM").length, 40);
  assert.equal(getSanitizedFieldInventory("HM").length, 30);
  assert.equal(getSanitizedFieldInventory("BM").length, 12);
  assert.equal(validateSanitizedFieldInventoryCatalog(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES), true);
  assert.equal(new Set(Object.values(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES).flat().map((record) => record.inventoryId)).size, 82);
});

test("inventory records are immutable count-only data with no executable or original content", () => {
  assert.ok(Object.isFrozen(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES));
  for (const record of Object.values(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES).flat()) {
    assert.ok(Object.isFrozen(record));
    assert.equal(record.recordStatus, "SANITIZED_COUNT_INVENTORY_ONLY");
    assert.equal(record.executableDefinition, false);
    assert.equal(record.originalContentIncluded, false);
    assert.deepEqual(Object.keys(record).sort(), [
      "collisionStatus",
      "dimensionStatus",
      "executableDefinition",
      "family",
      "inventoryId",
      "originalContentIncluded",
      "physicalOrdinal",
      "recordStatus",
      "selectabilityStatus"
    ]);
  }
});

test("BM 11-vs-12 selectability is an explicit unresolved blocker", () => {
  assert.equal(CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER.physicalMapCount, 12);
  assert.equal(CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER.observedSelectableFieldCount, 11);
  assert.equal(CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER.status, "BLOCKED_UNKNOWN");
  assert.equal(CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER.identityResolution, "UNRESOLVED");
  assert.equal(CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER.prohibitedInference, "DO_NOT_DROP_OR_SELECT_A_PHYSICAL_RECORD");
  assert.ok(getSanitizedFieldInventory("BM").every((record) => record.selectabilityStatus === "UNRESOLVED_11_OF_12"));
  assert.equal(Object.isFrozen(CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER), true);
});

test("family profiles are immutable and exact accepted R2 contracts", () => {
  assert.equal(validateFieldFamilyProfileCatalog(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES), true);
  assert.ok(Object.isFrozen(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.HM.collisionContract.unresolvedSemantics));
  assert.equal(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.HM.fixedDimensions.widthTiles, 128);
  assert.equal(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.HM.fixedDimensions.heightTiles, 128);
  assert.equal(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.HM.collisionContract.originalParityClaim, true);
  assert.equal(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.CM.originalDimensionStatus, "VERIFIED_STRUCTURE_ONLY");
  assert.equal(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.CM.collisionContract.originalParityClaim, false);
  assert.equal(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES.BM.collisionContract.originalParityClaim, false);
});

test("FieldDefinition supports variable CM dimensions and bounded BM runtime dimensions", () => {
  const cmWide = createFieldDefinition(cmDraft({
    fieldId: "nexus:championship:r2:field:cm-wide",
    dimensions: { widthTiles: 73, heightTiles: 31 }
  }), getFieldFamilyProfile("CM"));
  assert.equal(getFieldTileCount(cmWide), 2263);
  assert.deepEqual(getFieldWorldSize(cmWide), { widthPx: 1168, heightPx: 496 });
  assert.equal(getFieldTileCount(bm), 153);
  assert.equal(bm.profile.originalDimensionStatus, "UNKNOWN_REQUIRES_TRACE");
});

test("FieldDefinition is defensively cloned, deeply frozen, and factory branded", () => {
  const draft = cmDraft({ fieldId: "nexus:championship:r2:field:cm-clone" });
  const definition = createFieldDefinition(draft, getFieldFamilyProfile("CM"));
  draft.dimensions.widthTiles = 1;
  assert.equal(definition.dimensions.widthTiles, 40);
  assert.ok(Object.isFrozen(definition));
  assert.ok(Object.isFrozen(definition.dimensions));
  assert.throws(() => getFieldTileCount(plainClone(definition)), /created by createFieldDefinition/);
});

test("HM dimensions and sanitized attribute grid are exact and bounded", () => {
  assert.throws(() => createFieldDefinition(hmDraft(Array(127 * 128).fill(0), {
    dimensions: { widthTiles: 127, heightTiles: 128 }
  }), getFieldFamilyProfile("HM")), /exactly 128 by 128/);
  assert.throws(() => createFieldDefinition(hmDraft(Array((128 * 128) - 1).fill(0)), getFieldFamilyProfile("HM")), /exactly 16384 values/);
  const invalidValues = Array(128 * 128).fill(0);
  invalidValues[9] = 256;
  assert.throws(() => createFieldDefinition(hmDraft(invalidValues), getFieldFamilyProfile("HM")), /0 through 255/);
});

test("FieldDefinition rejects excess keys, unsafe identifiers, bounds, and profile mismatches", () => {
  assert.throws(() => createFieldDefinition({ ...cmDraft(), extra: true }, getFieldFamilyProfile("CM")), /missing or unsupported/);
  assert.throws(() => createFieldDefinition(cmDraft({ fieldId: "field/private" }), getFieldFamilyProfile("CM")), /bounded Nexus/);
  assert.throws(() => createFieldDefinition(cmDraft({ dimensions: { widthTiles: 0, heightTiles: 1 } }), getFieldFamilyProfile("CM")), /safe integer/);
  assert.throws(() => createFieldDefinition(cmDraft({ dimensions: { widthTiles: 2048, heightTiles: 2048 } }), getFieldFamilyProfile("CM")), /tile count exceeds/);
  assert.throws(() => createFieldDefinition(cmDraft({ tileSizePx: FIELD_RUNTIME_LIMITS.maxTileSizePx + 1 }), getFieldFamilyProfile("CM")), /safe integer/);
  assert.throws(() => createFieldDefinition(cmDraft(), getFieldFamilyProfile("BM")), /family mismatch/);
});

test("plain-data gates reject accessors, cycles, forbidden keys, sparse arrays, and non-finite values", () => {
  const accessorDraft = cmDraft();
  Object.defineProperty(accessorDraft, "tileSizePx", { enumerable: true, get() { return 16; } });
  assert.throws(() => createFieldDefinition(accessorDraft, getFieldFamilyProfile("CM")), /Accessor property is forbidden/);

  const cyclicDraft = cmDraft();
  cyclicDraft.dimensions.loop = cyclicDraft;
  assert.throws(() => createFieldDefinition(cyclicDraft, getFieldFamilyProfile("CM")), /Cyclic/);

  const forbiddenDraft = cmDraft();
  Object.defineProperty(forbiddenDraft, "__proto__", { value: {}, enumerable: true });
  assert.throws(() => createFieldDefinition(forbiddenDraft, getFieldFamilyProfile("CM")), /Forbidden Championship data key/);

  const sparseValues = Array(128 * 128);
  sparseValues[0] = 0;
  assert.throws(() => createFieldDefinition(hmDraft(sparseValues), getFieldFamilyProfile("HM")), /dense/);
  assert.throws(() => createFieldDefinition(cmDraft({ tileSizePx: Number.POSITIVE_INFINITY }), getFieldFamilyProfile("CM")), /Non-finite/);
});

test("HM bit0 and out-of-bounds are the only executable blocking rules", () => {
  const collision = createFieldCollisionAdapter(hm);
  const bit0 = collision.evaluate({ x: 0, y: 0 });
  assert.equal(bit0.traversalDecision, FIELD_COLLISION_DECISIONS.BLOCKED);
  assert.equal(bit0.traversalAllowed, false);
  assert.equal(bit0.blockedByKnownRule, true);
  assert.equal(bit0.attributeValue, 1);

  const outside = collision.evaluate({ x: -1, y: 0 });
  assert.equal(outside.traversalDecision, FIELD_COLLISION_DECISIONS.BLOCKED);
  assert.equal(outside.reason, "HM_OUT_OF_BOUNDS_BLOCKS");
  assert.equal(outside.attributeValue, null);
});

test("HM bit0-clear cells remain UNKNOWN and preserve unresolved high-bit telemetry", () => {
  const clear = createFieldCollisionAdapter(hm).evaluate({ x: 1, y: 0 });
  assert.equal(clear.attributeValue, 2);
  assert.equal(clear.unknownBitMask, 2);
  assert.equal(clear.traversalDecision, FIELD_COLLISION_DECISIONS.UNKNOWN);
  assert.equal(clear.traversalAllowed, null);
  assert.equal(clear.blockedByKnownRule, false);
  assert.ok(clear.unresolvedSemantics.includes("ATTRIBUTE_BITS_1_THROUGH_7"));
});

test("CM and BM collision adapters remain UNKNOWN even outside runtime dimensions", () => {
  for (const definition of [cm, bm]) {
    const adapter = createFieldCollisionAdapter(definition);
    for (const coordinate of [{ x: 0, y: 0 }, { x: -1, y: -1 }]) {
      const result = adapter.evaluate(coordinate);
      assert.equal(result.traversalDecision, FIELD_COLLISION_DECISIONS.UNKNOWN);
      assert.equal(result.traversalAllowed, null);
      assert.equal(result.blockedByKnownRule, null);
    }
  }
});

test("collision coordinate gates reject floats, extras, accessors, and extreme unsafe integers", () => {
  const adapter = createFieldCollisionAdapter(hm);
  assert.throws(() => adapter.evaluate({ x: 0.5, y: 0 }), /safe-integer/);
  assert.throws(() => adapter.evaluate({ x: 0, y: 0, z: 0 }), /unsupported fields/);
  assert.throws(() => adapter.evaluate({ x: Number.MAX_SAFE_INTEGER + 1, y: 0 }), /safe-integer/);
  const accessor = { y: 0 };
  Object.defineProperty(accessor, "x", { enumerable: true, get() { return 0; } });
  assert.throws(() => adapter.evaluate(accessor), /Accessor property is forbidden/);
});

test("camera clamps to field edges and never exposes more than the field", () => {
  const centered = computeFieldCameraWindow(cm, {
    centerX: -100,
    centerY: -100,
    viewportWidth: 160,
    viewportHeight: 96
  });
  assert.deepEqual(
    { left: centered.left, top: centered.top, right: centered.right, bottom: centered.bottom },
    { left: 0, top: 0, right: 160, bottom: 96 }
  );
  const oversized = computeFieldCameraWindow(cm, {
    centerX: 10,
    centerY: 10,
    viewportWidth: 1000,
    viewportHeight: 1000
  });
  assert.equal(oversized.width, 640);
  assert.equal(oversized.height, 384);
});

test("world-point and visible-chunk helpers are deterministic at field boundaries", () => {
  assert.deepEqual(worldPointToFieldTile(cm, { x: 0, y: 0 }), { inBounds: true, tileX: 0, tileY: 0 });
  assert.deepEqual(worldPointToFieldTile(cm, { x: 639.999, y: 383.999 }), { inBounds: true, tileX: 39, tileY: 23 });
  assert.deepEqual(worldPointToFieldTile(cm, { x: 640, y: 384 }), { inBounds: false, tileX: null, tileY: null });
  const visible = computeVisibleChunkWindow(cm, {
    centerX: 80,
    centerY: 48,
    viewportWidth: 160,
    viewportHeight: 96
  });
  assert.deepEqual(
    {
      startTileX: visible.startTileX,
      startTileY: visible.startTileY,
      endTileX: visible.endTileX,
      endTileY: visible.endTileY,
      startChunkX: visible.startChunkX,
      startChunkY: visible.startChunkY,
      endChunkX: visible.endChunkX,
      endChunkY: visible.endChunkY,
      chunkCount: visible.chunkCount
    },
    {
      startTileX: 0,
      startTileY: 0,
      endTileX: 9,
      endTileY: 5,
      startChunkX: 0,
      startChunkY: 0,
      endChunkX: 1,
      endChunkY: 0,
      chunkCount: 2
    }
  );
});

test("chunk bounds clip final chunks and reject invalid coordinates", () => {
  const finalChunk = getFieldChunkBounds(cm, { chunkX: 4, chunkY: 2 });
  assert.deepEqual(
    {
      startTileX: finalChunk.startTileX,
      startTileY: finalChunk.startTileY,
      endTileXExclusive: finalChunk.endTileXExclusive,
      endTileYExclusive: finalChunk.endTileYExclusive,
      rightPx: finalChunk.rightPx,
      bottomPx: finalChunk.bottomPx
    },
    {
      startTileX: 32,
      startTileY: 16,
      endTileXExclusive: 40,
      endTileYExclusive: 24,
      rightPx: 640,
      bottomPx: 384
    }
  );
  assert.throws(() => getFieldChunkBounds(cm, { chunkX: 5, chunkY: 0 }), /out of bounds/);
  assert.throws(() => getFieldChunkBounds(cm, { chunkX: -1, chunkY: 0 }), /out of bounds/);
  assert.throws(() => getFieldChunkBounds(cm, { chunkX: 0.25, chunkY: 0 }), /safe integers/);
});

test("camera and world-point validation rejects denial-of-service and malformed inputs", () => {
  assert.throws(() => computeFieldCameraWindow(cm, {
    centerX: 0,
    centerY: 0,
    viewportWidth: FIELD_RUNTIME_LIMITS.maxViewportSpanPx + 1,
    viewportHeight: 1
  }), /security bound/);
  assert.throws(() => computeFieldCameraWindow(cm, {
    centerX: 0,
    centerY: 0,
    viewportWidth: 0,
    viewportHeight: 1
  }), /security bound/);
  assert.throws(() => worldPointToFieldTile(cm, { x: Number.NaN, y: 0 }), /Non-finite/);
  assert.throws(() => worldPointToFieldTile(cm, { x: 0, y: 0, hidden: true }), /unsupported fields/);
});

test("catalog validation rejects count drift, duplicates, profile drift, accessors, and cycles", () => {
  const countDrift = plainClone(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
  countDrift.CM.pop();
  assert.throws(() => validateSanitizedFieldInventoryCatalog(countDrift), /count mismatch/);

  const duplicate = plainClone(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
  duplicate.HM[1].inventoryId = duplicate.HM[0].inventoryId;
  assert.throws(() => validateSanitizedFieldInventoryCatalog(duplicate), /unique Nexus/);

  const privatePathIdentity = plainClone(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
  privatePathIdentity.CM[0].inventoryId = ["C", "private", "field"].join("\\");
  assert.throws(() => validateSanitizedFieldInventoryCatalog(privatePathIdentity), /bounded, unique Nexus/);

  const profileDrift = plainClone(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES);
  profileDrift.HM.collisionContract.executable = false;
  assert.throws(() => validateFieldFamilyProfileCatalog(profileDrift), /differs from the accepted/);

  const accessorCatalog = plainClone(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
  Object.defineProperty(accessorCatalog, "CM", { enumerable: true, get() { return []; } });
  assert.throws(() => validateSanitizedFieldInventoryCatalog(accessorCatalog), /Accessor property is forbidden/);

  const cyclicCatalog = plainClone(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
  cyclicCatalog.CM[0].loop = cyclicCatalog;
  assert.throws(() => validateSanitizedFieldInventoryCatalog(cyclicCatalog), /Cyclic/);

  const forbiddenCatalog = plainClone(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
  Object.defineProperty(forbiddenCatalog.HM[0], "constructor", { value: "blocked", enumerable: true });
  assert.throws(() => validateSanitizedFieldInventoryCatalog(forbiddenCatalog), /Forbidden Championship data key/);
});

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  }));
  return nested.flat();
}

test("owned Field Kernel files contain no private path, network, save, or protected-boundary hooks", async () => {
  const ownedRoots = [
    path.join(repoRoot, "src/championship/field"),
    path.join(repoRoot, "src/data/championship/r2/fields")
  ];
  const files = (await Promise.all(ownedRoots.map(listFiles))).flat();
  const forbidden = [
    /[A-Za-z]:[\\/]/,
    /file:\/\//i,
    /\bfetch\s*\(/,
    /\bWebSocket\b/,
    /\blocalStorage\b/,
    /\bindexedDB\b/,
    /\bsaveQueue\b/,
    /\bRaphaelCore\b/,
    /\bStandoff\b/,
    /\bOrbit\b/
  ];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `${file} violates isolation: ${pattern}`);
  }
});
