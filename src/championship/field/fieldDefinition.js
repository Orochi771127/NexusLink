import { clonePlainData, deepFreeze, isPlainRecord } from "../contracts/championshipContracts.js";
import {
  FIELD_COLLISION_PROFILE_IDS,
  FIELD_COLLISION_RULES,
  FIELD_DIMENSION_POLICIES,
  FIELD_FAMILIES,
  FIELD_PARITY_STATUS,
  FIELD_RUNTIME_AUTHORITY,
  FIELD_RUNTIME_LIMITS,
  FIELD_SCHEMA_VERSION,
  FIELD_UNKNOWN_SEMANTICS,
  HM_VERIFIED_EVIDENCE_REFS
} from "./fieldConstants.js";

const FIELD_ID = /^nexus:championship:r2:field:[a-z0-9][a-z0-9-]*$/;
const VALIDATED_FIELD_DEFINITIONS = new WeakSet();

const DRAFT_KEYS = Object.freeze([
  "chunkSizeTiles",
  "collisionData",
  "collisionProfileId",
  "dimensions",
  "family",
  "fieldId",
  "schemaVersion",
  "tileSizePx"
]);

const PROFILE_KEYS = Object.freeze([
  "authority",
  "collisionContract",
  "dimensionPolicy",
  "family",
  "fixedDimensions",
  "originalDimensionStatus",
  "parityStatus",
  "profileId"
]);

const COLLISION_CONTRACT_KEYS = Object.freeze([
  "evidenceRefs",
  "evidenceStatus",
  "executable",
  "knownBlockingRule",
  "originalParityClaim",
  "unresolvedSemantics"
]);

function assertExactKeys(value, expected, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label} must be a plain object`);
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (actual.length !== allowed.length || actual.some((key, index) => key !== allowed[index])) {
    throw new Error(`${label} contains missing or unsupported fields`);
  }
}

function assertPositiveBoundedInteger(value, minimum, maximum, label) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be a safe integer from ${minimum} through ${maximum}`);
  }
}

function assertExactArray(actual, expected, label) {
  if (!Array.isArray(actual) || actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new Error(`${label} does not match the accepted R2 contract`);
  }
}

function expectedProfilePolicy(family) {
  if (family === FIELD_FAMILIES.CM) {
    return {
      profileId: FIELD_COLLISION_PROFILE_IDS.CM,
      dimensionPolicy: FIELD_DIMENSION_POLICIES.CM_VARIABLE,
      fixedDimensions: null,
      originalDimensionStatus: "VERIFIED_STRUCTURE_ONLY",
      knownBlockingRule: FIELD_COLLISION_RULES.UNKNOWN_NOT_EXECUTABLE,
      executable: false,
      evidenceStatus: "UNKNOWN_REQUIRES_TRACE",
      originalParityClaim: false,
      evidenceRefs: [],
      unresolvedSemantics: FIELD_UNKNOWN_SEMANTICS.CM
    };
  }
  if (family === FIELD_FAMILIES.HM) {
    return {
      profileId: FIELD_COLLISION_PROFILE_IDS.HM,
      dimensionPolicy: FIELD_DIMENSION_POLICIES.HM_FIXED_128,
      fixedDimensions: { widthTiles: 128, heightTiles: 128 },
      originalDimensionStatus: "VERIFIED_BINARY",
      knownBlockingRule: FIELD_COLLISION_RULES.HM_ATTRIBUTE_BIT0_OR_OOB_BLOCKS,
      executable: true,
      evidenceStatus: "VERIFIED_BINARY",
      originalParityClaim: true,
      evidenceRefs: HM_VERIFIED_EVIDENCE_REFS,
      unresolvedSemantics: FIELD_UNKNOWN_SEMANTICS.HM
    };
  }
  if (family === FIELD_FAMILIES.BM) {
    return {
      profileId: FIELD_COLLISION_PROFILE_IDS.BM,
      dimensionPolicy: FIELD_DIMENSION_POLICIES.BM_RUNTIME_BOUNDED_ORIGINAL_UNKNOWN,
      fixedDimensions: null,
      originalDimensionStatus: "UNKNOWN_REQUIRES_TRACE",
      knownBlockingRule: FIELD_COLLISION_RULES.UNKNOWN_NOT_EXECUTABLE,
      executable: false,
      evidenceStatus: "UNKNOWN_REQUIRES_TRACE",
      originalParityClaim: false,
      evidenceRefs: [],
      unresolvedSemantics: FIELD_UNKNOWN_SEMANTICS.BM
    };
  }
  throw new Error(`Unsupported Championship field family: ${family}`);
}

function validateProfile(profile, family) {
  assertExactKeys(profile, PROFILE_KEYS, "Field family profile");
  assertExactKeys(profile.collisionContract, COLLISION_CONTRACT_KEYS, "Field collision contract");
  const expected = expectedProfilePolicy(family);
  if (profile.family !== family) throw new Error("Field profile family mismatch");
  if (profile.profileId !== expected.profileId) throw new Error("Field profile ID mismatch");
  if (profile.dimensionPolicy !== expected.dimensionPolicy) throw new Error("Field dimension policy mismatch");
  if (profile.originalDimensionStatus !== expected.originalDimensionStatus) throw new Error("Field original-dimension status mismatch");
  if (profile.authority !== FIELD_RUNTIME_AUTHORITY || profile.parityStatus !== FIELD_PARITY_STATUS) {
    throw new Error("Field profile authority or parity boundary changed");
  }

  if (expected.fixedDimensions === null) {
    if (profile.fixedDimensions !== null) throw new Error("Variable/unknown field profile cannot claim fixed dimensions");
  } else {
    assertExactKeys(profile.fixedDimensions, ["heightTiles", "widthTiles"], "Fixed field dimensions");
    if (
      profile.fixedDimensions.widthTiles !== expected.fixedDimensions.widthTiles
      || profile.fixedDimensions.heightTiles !== expected.fixedDimensions.heightTiles
    ) throw new Error("HM field profile must remain exactly 128 by 128 tiles");
  }

  const contract = profile.collisionContract;
  if (
    contract.knownBlockingRule !== expected.knownBlockingRule
    || contract.executable !== expected.executable
    || contract.evidenceStatus !== expected.evidenceStatus
    || contract.originalParityClaim !== expected.originalParityClaim
  ) throw new Error("Field collision evidence boundary changed");
  assertExactArray(contract.evidenceRefs, expected.evidenceRefs, "Field collision evidenceRefs");
  assertExactArray(contract.unresolvedSemantics, expected.unresolvedSemantics, "Field unresolved semantics");
  return expected;
}

function validateDimensions(dimensions, expected) {
  assertExactKeys(dimensions, ["heightTiles", "widthTiles"], "Field dimensions");
  assertPositiveBoundedInteger(
    dimensions.widthTiles,
    FIELD_RUNTIME_LIMITS.minAxisTiles,
    FIELD_RUNTIME_LIMITS.maxAxisTiles,
    "Field widthTiles"
  );
  assertPositiveBoundedInteger(
    dimensions.heightTiles,
    FIELD_RUNTIME_LIMITS.minAxisTiles,
    FIELD_RUNTIME_LIMITS.maxAxisTiles,
    "Field heightTiles"
  );
  const totalTiles = dimensions.widthTiles * dimensions.heightTiles;
  if (!Number.isSafeInteger(totalTiles) || totalTiles > FIELD_RUNTIME_LIMITS.maxTotalTiles) {
    throw new RangeError("Field tile count exceeds the R2 runtime security bound");
  }
  if (expected.fixedDimensions && (
    dimensions.widthTiles !== expected.fixedDimensions.widthTiles
    || dimensions.heightTiles !== expected.fixedDimensions.heightTiles
  )) throw new Error("HM FieldDefinition dimensions must be exactly 128 by 128 tiles");
}

function validateCollisionData(collisionData, family, totalTiles) {
  if (family !== FIELD_FAMILIES.HM) {
    assertExactKeys(collisionData, ["kind"], "Unknown field collision data");
    if (collisionData.kind !== FIELD_COLLISION_RULES.UNKNOWN_NOT_EXECUTABLE) {
      throw new Error("CM/BM collision data must remain explicitly unknown and non-executable");
    }
    return;
  }

  assertExactKeys(collisionData, ["kind", "values"], "HM collision data");
  if (collisionData.kind !== "HM_SANITIZED_ATTRIBUTE_GRID") {
    throw new Error("HM collision data must be a sanitized attribute grid");
  }
  if (!Array.isArray(collisionData.values) || collisionData.values.length !== totalTiles) {
    throw new Error(`HM sanitized attribute grid must contain exactly ${totalTiles} values`);
  }
  for (const value of collisionData.values) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new RangeError("HM sanitized attribute values must be integers from 0 through 255");
    }
  }
}

export function createFieldDefinition(draft, familyProfile) {
  const input = clonePlainData(draft);
  const profile = clonePlainData(familyProfile);
  assertExactKeys(input, DRAFT_KEYS, "FieldDefinition draft");
  if (input.schemaVersion !== FIELD_SCHEMA_VERSION) throw new Error("Unsupported FieldDefinition schemaVersion");
  if (
    typeof input.fieldId !== "string"
    || input.fieldId.length > FIELD_RUNTIME_LIMITS.maxFieldIdLength
    || !FIELD_ID.test(input.fieldId)
  ) throw new TypeError("fieldId must be a bounded Nexus Championship R2 field ID");
  if (!Object.values(FIELD_FAMILIES).includes(input.family)) throw new Error("Unknown FieldDefinition family");
  const expected = validateProfile(profile, input.family);
  if (input.collisionProfileId !== expected.profileId) throw new Error("FieldDefinition collision profile mismatch");
  validateDimensions(input.dimensions, expected);
  assertPositiveBoundedInteger(
    input.tileSizePx,
    FIELD_RUNTIME_LIMITS.minTileSizePx,
    FIELD_RUNTIME_LIMITS.maxTileSizePx,
    "Field tileSizePx"
  );
  assertPositiveBoundedInteger(
    input.chunkSizeTiles,
    FIELD_RUNTIME_LIMITS.minChunkSizeTiles,
    FIELD_RUNTIME_LIMITS.maxChunkSizeTiles,
    "Field chunkSizeTiles"
  );
  const worldWidthPx = input.dimensions.widthTiles * input.tileSizePx;
  const worldHeightPx = input.dimensions.heightTiles * input.tileSizePx;
  if (
    !Number.isSafeInteger(worldWidthPx)
    || !Number.isSafeInteger(worldHeightPx)
    || worldWidthPx > FIELD_RUNTIME_LIMITS.maxWorldSpanPx
    || worldHeightPx > FIELD_RUNTIME_LIMITS.maxWorldSpanPx
  ) throw new RangeError("Field world span exceeds the R2 runtime security bound");
  validateCollisionData(input.collisionData, input.family, input.dimensions.widthTiles * input.dimensions.heightTiles);

  const definition = deepFreeze({
    ...input,
    profile,
    authority: FIELD_RUNTIME_AUTHORITY,
    parityStatus: FIELD_PARITY_STATUS
  });
  VALIDATED_FIELD_DEFINITIONS.add(definition);
  return definition;
}

export function assertFieldDefinition(definition) {
  if (!definition || typeof definition !== "object" || !VALIDATED_FIELD_DEFINITIONS.has(definition)) {
    throw new TypeError("FieldDefinition must be created by createFieldDefinition");
  }
  return true;
}

export function getFieldTileCount(definition) {
  assertFieldDefinition(definition);
  return definition.dimensions.widthTiles * definition.dimensions.heightTiles;
}

export function getFieldWorldSize(definition) {
  assertFieldDefinition(definition);
  return Object.freeze({
    widthPx: definition.dimensions.widthTiles * definition.tileSizePx,
    heightPx: definition.dimensions.heightTiles * definition.tileSizePx
  });
}
