import { clonePlainData, deepFreeze, isPlainRecord } from "../contracts/championshipContracts.js";
import {
  FIELD_COLLISION_DECISIONS,
  FIELD_COLLISION_RULES,
  FIELD_FAMILIES,
  FIELD_PARITY_STATUS,
  FIELD_RUNTIME_AUTHORITY
} from "./fieldConstants.js";
import { assertFieldDefinition } from "./fieldDefinition.js";

const COORDINATE_KEYS = Object.freeze(["x", "y"]);

function assertExactKeys(value, expected, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label} must be a plain object`);
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (actual.length !== allowed.length || actual.some((key, index) => key !== allowed[index])) {
    throw new Error(`${label} contains missing or unsupported fields`);
  }
}

function validateTileCoordinate(value) {
  const coordinate = clonePlainData(value);
  assertExactKeys(coordinate, COORDINATE_KEYS, "Field collision coordinate");
  if (!Number.isSafeInteger(coordinate.x) || !Number.isSafeInteger(coordinate.y)) {
    throw new TypeError("Field collision coordinates must be safe-integer tile coordinates");
  }
  return coordinate;
}

function unknownResult(definition, coordinate, outOfBounds) {
  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS,
    family: definition.family,
    fieldId: definition.fieldId,
    x: coordinate.x,
    y: coordinate.y,
    outOfBounds,
    traversalDecision: FIELD_COLLISION_DECISIONS.UNKNOWN,
    traversalAllowed: null,
    blockedByKnownRule: null,
    reason: `${definition.family}_COLLISION_SEMANTICS_UNRESOLVED`,
    attributeValue: null,
    unknownBitMask: null,
    evidenceStatus: definition.profile.collisionContract.evidenceStatus,
    evidenceRefs: [...definition.profile.collisionContract.evidenceRefs],
    unresolvedSemantics: [...definition.profile.collisionContract.unresolvedSemantics]
  });
}

function hmResult(definition, coordinate) {
  const widthTiles = definition.dimensions.widthTiles;
  const heightTiles = definition.dimensions.heightTiles;
  const outOfBounds = coordinate.x < 0
    || coordinate.y < 0
    || coordinate.x >= widthTiles
    || coordinate.y >= heightTiles;

  if (outOfBounds) {
    return deepFreeze({
      authority: FIELD_RUNTIME_AUTHORITY,
      parityStatus: FIELD_PARITY_STATUS,
      family: definition.family,
      fieldId: definition.fieldId,
      x: coordinate.x,
      y: coordinate.y,
      outOfBounds: true,
      traversalDecision: FIELD_COLLISION_DECISIONS.BLOCKED,
      traversalAllowed: false,
      blockedByKnownRule: true,
      reason: "HM_OUT_OF_BOUNDS_BLOCKS",
      attributeValue: null,
      unknownBitMask: 0,
      evidenceStatus: definition.profile.collisionContract.evidenceStatus,
      evidenceRefs: [...definition.profile.collisionContract.evidenceRefs],
      unresolvedSemantics: [...definition.profile.collisionContract.unresolvedSemantics]
    });
  }

  const attributeValue = definition.collisionData.values[(coordinate.y * widthTiles) + coordinate.x];
  const blocked = (attributeValue & 0x01) === 0x01;
  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS,
    family: definition.family,
    fieldId: definition.fieldId,
    x: coordinate.x,
    y: coordinate.y,
    outOfBounds: false,
    traversalDecision: blocked ? FIELD_COLLISION_DECISIONS.BLOCKED : FIELD_COLLISION_DECISIONS.UNKNOWN,
    traversalAllowed: blocked ? false : null,
    blockedByKnownRule: blocked,
    reason: blocked
      ? "HM_ATTRIBUTE_BIT0_BLOCKS"
      : "HM_BIT0_CLEAR_OTHER_COLLISION_SEMANTICS_UNRESOLVED",
    attributeValue,
    unknownBitMask: attributeValue & 0xfe,
    evidenceStatus: definition.profile.collisionContract.evidenceStatus,
    evidenceRefs: [...definition.profile.collisionContract.evidenceRefs],
    unresolvedSemantics: [...definition.profile.collisionContract.unresolvedSemantics]
  });
}

export function createFieldCollisionAdapter(definition) {
  assertFieldDefinition(definition);
  const executableHmRule = definition.family === FIELD_FAMILIES.HM
    && definition.profile.collisionContract.knownBlockingRule === FIELD_COLLISION_RULES.HM_ATTRIBUTE_BIT0_OR_OOB_BLOCKS
    && definition.profile.collisionContract.executable === true;

  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS,
    family: definition.family,
    fieldId: definition.fieldId,
    evaluate(coordinateDraft) {
      const coordinate = validateTileCoordinate(coordinateDraft);
      if (executableHmRule) return hmResult(definition, coordinate);
      const outOfBounds = coordinate.x < 0
        || coordinate.y < 0
        || coordinate.x >= definition.dimensions.widthTiles
        || coordinate.y >= definition.dimensions.heightTiles;
      return unknownResult(definition, coordinate, outOfBounds);
    }
  });
}
