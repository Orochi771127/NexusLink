export const FIELD_SCHEMA_VERSION = 2;

export const FIELD_FAMILIES = Object.freeze({
  CM: "CM",
  HM: "HM",
  BM: "BM"
});

export const FIELD_COLLISION_PROFILE_IDS = Object.freeze({
  CM: "nexus:championship:r2:field-profile:cm",
  HM: "nexus:championship:r2:field-profile:hm",
  BM: "nexus:championship:r2:field-profile:bm"
});

export const FIELD_DIMENSION_POLICIES = Object.freeze({
  CM_VARIABLE: "CM_VARIABLE_BOUNDED",
  HM_FIXED_128: "HM_FIXED_128_BY_128",
  BM_RUNTIME_BOUNDED_ORIGINAL_UNKNOWN: "BM_RUNTIME_BOUNDED_ORIGINAL_UNKNOWN"
});

export const FIELD_COLLISION_RULES = Object.freeze({
  UNKNOWN_NOT_EXECUTABLE: "UNKNOWN_NOT_EXECUTABLE",
  HM_ATTRIBUTE_BIT0_OR_OOB_BLOCKS: "HM_ATTRIBUTE_BIT0_OR_OOB_BLOCKS"
});

export const FIELD_COLLISION_DECISIONS = Object.freeze({
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

export const FIELD_RUNTIME_LIMITS = Object.freeze({
  minAxisTiles: 1,
  maxAxisTiles: 2048,
  maxTotalTiles: 1_048_576,
  minTileSizePx: 1,
  maxTileSizePx: 512,
  minChunkSizeTiles: 1,
  maxChunkSizeTiles: 128,
  maxWorldSpanPx: 1_048_576,
  maxViewportSpanPx: 1_048_576,
  maxFieldIdLength: 96
});

export const FIELD_RUNTIME_AUTHORITY = "NEXUS_RESEARCH_FIELD_KERNEL_R2";
export const FIELD_PARITY_STATUS = "RESEARCH_NON_PARITY";

export const HM_VERIFIED_EVIDENCE_REFS = Object.freeze([
  "HUNT-MAP-STRUCTURE-001",
  "HUNT-ATR-COLLISION-001",
  "HUNT-GEOMETRY-BOUNDARIES-001"
]);

export const FIELD_UNKNOWN_SEMANTICS = Object.freeze({
  CM: Object.freeze([
    "COLLISION_READER",
    "TERRAIN_TAXONOMY",
    "DYNAMIC_BLOCKERS",
    "TRIGGER_PRECEDENCE",
    "ACTOR_RADIUS"
  ]),
  HM: Object.freeze([
    "ATTRIBUTE_BITS_1_THROUGH_7",
    "TERRAIN_TAXONOMY",
    "DYNAMIC_BLOCKERS",
    "TRIGGER_PRECEDENCE",
    "DIAGONAL_POLICY",
    "ACTOR_RADIUS"
  ]),
  BM: Object.freeze([
    "COLLISION_READER",
    "TERRAIN_TAXONOMY",
    "ARENA_BOUNDARY_POLICY",
    "SELECTABLE_11_OF_12_IDENTITY"
  ])
});
