import { clonePlainData, deepFreeze, isPlainRecord } from "../contracts/championshipContracts.js";
import {
  FIELD_PARITY_STATUS,
  FIELD_RUNTIME_AUTHORITY,
  FIELD_RUNTIME_LIMITS
} from "./fieldConstants.js";
import { assertFieldDefinition, getFieldWorldSize } from "./fieldDefinition.js";

function assertExactKeys(value, expected, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label} must be a plain object`);
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (actual.length !== allowed.length || actual.some((key, index) => key !== allowed[index])) {
    throw new Error(`${label} contains missing or unsupported fields`);
  }
}

function validateFiniteNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
}

function validatePositiveViewport(value, label) {
  validateFiniteNumber(value, label);
  if (value <= 0 || value > FIELD_RUNTIME_LIMITS.maxViewportSpanPx) {
    throw new RangeError(`${label} exceeds the R2 viewport security bound`);
  }
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function worldPointToFieldTile(definition, pointDraft) {
  assertFieldDefinition(definition);
  const point = clonePlainData(pointDraft);
  assertExactKeys(point, ["x", "y"], "Field world point");
  validateFiniteNumber(point.x, "Field world x");
  validateFiniteNumber(point.y, "Field world y");
  const world = getFieldWorldSize(definition);
  const inBounds = point.x >= 0 && point.y >= 0 && point.x < world.widthPx && point.y < world.heightPx;
  return deepFreeze({
    inBounds,
    tileX: inBounds ? Math.floor(point.x / definition.tileSizePx) : null,
    tileY: inBounds ? Math.floor(point.y / definition.tileSizePx) : null
  });
}

export function computeFieldCameraWindow(definition, requestDraft) {
  assertFieldDefinition(definition);
  const request = clonePlainData(requestDraft);
  assertExactKeys(
    request,
    ["centerX", "centerY", "viewportHeight", "viewportWidth"],
    "Field camera request"
  );
  validateFiniteNumber(request.centerX, "Field camera centerX");
  validateFiniteNumber(request.centerY, "Field camera centerY");
  validatePositiveViewport(request.viewportWidth, "Field camera viewportWidth");
  validatePositiveViewport(request.viewportHeight, "Field camera viewportHeight");

  const world = getFieldWorldSize(definition);
  const width = Math.min(request.viewportWidth, world.widthPx);
  const height = Math.min(request.viewportHeight, world.heightPx);
  const centerX = clamp(request.centerX, width / 2, world.widthPx - (width / 2));
  const centerY = clamp(request.centerY, height / 2, world.heightPx - (height / 2));
  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS,
    fieldId: definition.fieldId,
    left: centerX - (width / 2),
    top: centerY - (height / 2),
    right: centerX + (width / 2),
    bottom: centerY + (height / 2),
    centerX,
    centerY,
    width,
    height
  });
}

export function computeVisibleChunkWindow(definition, requestDraft) {
  const camera = computeFieldCameraWindow(definition, requestDraft);
  const tileSizePx = definition.tileSizePx;
  const startTileX = Math.floor(camera.left / tileSizePx);
  const startTileY = Math.floor(camera.top / tileSizePx);
  const endTileX = Math.min(
    definition.dimensions.widthTiles - 1,
    Math.max(startTileX, Math.ceil(camera.right / tileSizePx) - 1)
  );
  const endTileY = Math.min(
    definition.dimensions.heightTiles - 1,
    Math.max(startTileY, Math.ceil(camera.bottom / tileSizePx) - 1)
  );
  const startChunkX = Math.floor(startTileX / definition.chunkSizeTiles);
  const startChunkY = Math.floor(startTileY / definition.chunkSizeTiles);
  const endChunkX = Math.floor(endTileX / definition.chunkSizeTiles);
  const endChunkY = Math.floor(endTileY / definition.chunkSizeTiles);

  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS,
    fieldId: definition.fieldId,
    startTileX,
    startTileY,
    endTileX,
    endTileY,
    startChunkX,
    startChunkY,
    endChunkX,
    endChunkY,
    chunkCount: ((endChunkX - startChunkX) + 1) * ((endChunkY - startChunkY) + 1)
  });
}

export function getFieldChunkBounds(definition, requestDraft) {
  assertFieldDefinition(definition);
  const request = clonePlainData(requestDraft);
  assertExactKeys(request, ["chunkX", "chunkY"], "Field chunk request");
  if (!Number.isSafeInteger(request.chunkX) || !Number.isSafeInteger(request.chunkY)) {
    throw new TypeError("Field chunk coordinates must be safe integers");
  }
  const chunkColumns = Math.ceil(definition.dimensions.widthTiles / definition.chunkSizeTiles);
  const chunkRows = Math.ceil(definition.dimensions.heightTiles / definition.chunkSizeTiles);
  if (request.chunkX < 0 || request.chunkY < 0 || request.chunkX >= chunkColumns || request.chunkY >= chunkRows) {
    throw new RangeError("Field chunk coordinate is out of bounds");
  }
  const startTileX = request.chunkX * definition.chunkSizeTiles;
  const startTileY = request.chunkY * definition.chunkSizeTiles;
  const endTileXExclusive = Math.min(startTileX + definition.chunkSizeTiles, definition.dimensions.widthTiles);
  const endTileYExclusive = Math.min(startTileY + definition.chunkSizeTiles, definition.dimensions.heightTiles);

  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS,
    fieldId: definition.fieldId,
    chunkX: request.chunkX,
    chunkY: request.chunkY,
    startTileX,
    startTileY,
    endTileXExclusive,
    endTileYExclusive,
    leftPx: startTileX * definition.tileSizePx,
    topPx: startTileY * definition.tileSizePx,
    rightPx: endTileXExclusive * definition.tileSizePx,
    bottomPx: endTileYExclusive * definition.tileSizePx
  });
}
