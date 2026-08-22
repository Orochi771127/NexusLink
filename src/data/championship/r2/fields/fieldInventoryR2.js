import { clonePlainData, deepFreeze, isPlainRecord } from "../../../../championship/contracts/championshipContracts.js";
import {
  FIELD_COLLISION_PROFILE_IDS,
  FIELD_COLLISION_RULES,
  FIELD_DIMENSION_POLICIES,
  FIELD_FAMILIES,
  FIELD_PARITY_STATUS,
  FIELD_RUNTIME_AUTHORITY,
  FIELD_UNKNOWN_SEMANTICS,
  HM_VERIFIED_EVIDENCE_REFS
} from "../../../../championship/field/fieldConstants.js";

const INVENTORY_ID = /^nexus:championship:r2:field-inventory:(cm|hm|bm)-\d{3}$/;
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
const INVENTORY_RECORD_KEYS = Object.freeze([
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
const CATALOG_KEYS = Object.freeze(["BM", "CM", "HM"]);

export const CHAMPIONSHIP_R2_FIELD_COUNTS = deepFreeze({
  CM: 40,
  HM: 30,
  BM_PHYSICAL: 12,
  BM_OBSERVED_SELECTABLE: 11
});

function profile({
  family,
  profileId,
  dimensionPolicy,
  fixedDimensions,
  originalDimensionStatus,
  knownBlockingRule,
  executable,
  evidenceStatus,
  originalParityClaim,
  evidenceRefs,
  unresolvedSemantics
}) {
  return deepFreeze({
    authority: FIELD_RUNTIME_AUTHORITY,
    collisionContract: {
      evidenceRefs: [...evidenceRefs],
      evidenceStatus,
      executable,
      knownBlockingRule,
      originalParityClaim,
      unresolvedSemantics: [...unresolvedSemantics]
    },
    dimensionPolicy,
    family,
    fixedDimensions,
    originalDimensionStatus,
    parityStatus: FIELD_PARITY_STATUS,
    profileId
  });
}

export const CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES = deepFreeze({
  CM: profile({
    family: FIELD_FAMILIES.CM,
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
  }),
  HM: profile({
    family: FIELD_FAMILIES.HM,
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
  }),
  BM: profile({
    family: FIELD_FAMILIES.BM,
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
  })
});

function inventoryRecord(family, ordinal) {
  const familySlug = family.toLowerCase();
  const bmSelectability = family === FIELD_FAMILIES.BM
    ? "UNRESOLVED_11_OF_12"
    : "NOT_APPLICABLE";
  return deepFreeze({
    collisionStatus: family === FIELD_FAMILIES.HM
      ? "KNOWN_BIT0_AND_OOB_ONLY"
      : "UNKNOWN_REQUIRES_TRACE",
    dimensionStatus: family === FIELD_FAMILIES.HM
      ? "FIXED_128_BY_128"
      : family === FIELD_FAMILIES.CM
        ? "VARIABLE_DIMENSIONS"
        : "ORIGINAL_DIMENSIONS_UNKNOWN",
    executableDefinition: false,
    family,
    inventoryId: `nexus:championship:r2:field-inventory:${familySlug}-${String(ordinal).padStart(3, "0")}`,
    originalContentIncluded: false,
    physicalOrdinal: ordinal,
    recordStatus: "SANITIZED_COUNT_INVENTORY_ONLY",
    selectabilityStatus: bmSelectability
  });
}

function inventory(family, count) {
  return deepFreeze(Array.from({ length: count }, (_, index) => inventoryRecord(family, index + 1)));
}

export const CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES = deepFreeze({
  CM: inventory(FIELD_FAMILIES.CM, CHAMPIONSHIP_R2_FIELD_COUNTS.CM),
  HM: inventory(FIELD_FAMILIES.HM, CHAMPIONSHIP_R2_FIELD_COUNTS.HM),
  BM: inventory(FIELD_FAMILIES.BM, CHAMPIONSHIP_R2_FIELD_COUNTS.BM_PHYSICAL)
});

export const CHAMPIONSHIP_R2_BM_SELECTABLE_BLOCKER = deepFreeze({
  blockerId: "nexus:championship:r2:blocker:bm-selectable-identity",
  family: FIELD_FAMILIES.BM,
  physicalMapCount: CHAMPIONSHIP_R2_FIELD_COUNTS.BM_PHYSICAL,
  observedSelectableFieldCount: CHAMPIONSHIP_R2_FIELD_COUNTS.BM_OBSERVED_SELECTABLE,
  status: "BLOCKED_UNKNOWN",
  identityResolution: "UNRESOLVED",
  blocks: [
    "ORIGINAL_SELECTABLE_BM_CATALOG",
    "ORIGINAL_BM_FIELD_IDENTITY_MAPPING",
    "ORIGINAL_BM_SELECTION_PARITY_CLAIM"
  ],
  prohibitedInference: "DO_NOT_DROP_OR_SELECT_A_PHYSICAL_RECORD"
});

function assertExactKeys(value, expected, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label} must be a plain object`);
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (actual.length !== allowed.length || actual.some((key, index) => key !== allowed[index])) {
    throw new Error(`${label} contains missing or unsupported fields`);
  }
}

function validateProfileShape(candidate, family) {
  assertExactKeys(candidate, PROFILE_KEYS, `${family} field profile`);
  assertExactKeys(candidate.collisionContract, COLLISION_CONTRACT_KEYS, `${family} collision contract`);
  if (candidate.family !== family) throw new Error(`${family} profile family mismatch`);
  if (candidate.authority !== FIELD_RUNTIME_AUTHORITY || candidate.parityStatus !== FIELD_PARITY_STATUS) {
    throw new Error(`${family} profile authority boundary changed`);
  }
  if (!Array.isArray(candidate.collisionContract.evidenceRefs)
    || !Array.isArray(candidate.collisionContract.unresolvedSemantics)) {
    throw new TypeError(`${family} profile evidence and unknowns must be arrays`);
  }
}

function expectedInventoryFields(family) {
  return {
    collisionStatus: family === FIELD_FAMILIES.HM
      ? "KNOWN_BIT0_AND_OOB_ONLY"
      : "UNKNOWN_REQUIRES_TRACE",
    dimensionStatus: family === FIELD_FAMILIES.HM
      ? "FIXED_128_BY_128"
      : family === FIELD_FAMILIES.CM
        ? "VARIABLE_DIMENSIONS"
        : "ORIGINAL_DIMENSIONS_UNKNOWN",
    selectabilityStatus: family === FIELD_FAMILIES.BM
      ? "UNRESOLVED_11_OF_12"
      : "NOT_APPLICABLE"
  };
}

export function validateSanitizedFieldInventoryCatalog(catalogDraft) {
  const catalog = clonePlainData(catalogDraft);
  assertExactKeys(catalog, CATALOG_KEYS, "Sanitized field inventory catalog");
  const expectedCounts = {
    CM: CHAMPIONSHIP_R2_FIELD_COUNTS.CM,
    HM: CHAMPIONSHIP_R2_FIELD_COUNTS.HM,
    BM: CHAMPIONSHIP_R2_FIELD_COUNTS.BM_PHYSICAL
  };
  const seenIds = new Set();

  for (const family of CATALOG_KEYS) {
    const records = catalog[family];
    if (!Array.isArray(records) || records.length !== expectedCounts[family]) {
      throw new Error(`${family} sanitized inventory count mismatch`);
    }
    const expectedFields = expectedInventoryFields(family);
    records.forEach((record, index) => {
      assertExactKeys(record, INVENTORY_RECORD_KEYS, `${family} inventory record`);
      const expectedOrdinal = index + 1;
      const expectedInventoryId = `nexus:championship:r2:field-inventory:${family.toLowerCase()}-${String(expectedOrdinal).padStart(3, "0")}`;
      if (record.family !== family || record.physicalOrdinal !== expectedOrdinal) {
        throw new Error(`${family} inventory order or family mismatch`);
      }
      if (
        typeof record.inventoryId !== "string"
        || !INVENTORY_ID.test(record.inventoryId)
        || record.inventoryId !== expectedInventoryId
        || seenIds.has(record.inventoryId)
      ) {
        throw new Error("Sanitized inventory IDs must be bounded, unique Nexus identifiers");
      }
      seenIds.add(record.inventoryId);
      if (
        record.recordStatus !== "SANITIZED_COUNT_INVENTORY_ONLY"
        || record.executableDefinition !== false
        || record.originalContentIncluded !== false
        || record.collisionStatus !== expectedFields.collisionStatus
        || record.dimensionStatus !== expectedFields.dimensionStatus
        || record.selectabilityStatus !== expectedFields.selectabilityStatus
      ) throw new Error(`${family} inventory record exceeds the sanitized count-only contract`);
    });
  }
  return true;
}

export function validateFieldFamilyProfileCatalog(catalogDraft) {
  const catalog = clonePlainData(catalogDraft);
  assertExactKeys(catalog, CATALOG_KEYS, "Field family profile catalog");
  for (const family of CATALOG_KEYS) {
    validateProfileShape(catalog[family], family);
    if (JSON.stringify(catalog[family]) !== JSON.stringify(clonePlainData(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES[family]))) {
      throw new Error(`${family} field family profile differs from the accepted R2 evidence boundary`);
    }
  }
  return true;
}

export function getFieldFamilyProfile(family) {
  if (!Object.values(FIELD_FAMILIES).includes(family)) throw new Error(`Unknown field family: ${family}`);
  return CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES[family];
}

export function getSanitizedFieldInventory(family) {
  if (!Object.values(FIELD_FAMILIES).includes(family)) throw new Error(`Unknown field family: ${family}`);
  return CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES[family];
}

validateFieldFamilyProfileCatalog(CHAMPIONSHIP_R2_FIELD_FAMILY_PROFILES);
validateSanitizedFieldInventoryCatalog(CHAMPIONSHIP_R2_SANITIZED_FIELD_INVENTORIES);
