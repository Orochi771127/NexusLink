import {
  CHAMPIONSHIP_RULESET_ID,
  CHAMPIONSHIP_SCHEMA_VERSION,
  clonePlainData,
  FORENSIC_SCALE_EXPECTATIONS,
  stableDigest
} from "../../../championship/contracts/championshipContracts.js";
import { validateChampionshipRecord } from "./validateChampionshipRecord.js";
import { assertPublicCatalogShape } from "./validateChampionshipRecord.js";

const CATALOG_KINDS = Object.freeze([
  "entities",
  "actions",
  "gates",
  "cages",
  "shopRecords",
  "titleMatches",
  "eligibilityRules",
  "teams",
  "battlePresets",
  "battleFields"
]);

const ID_FIELD = Object.freeze({
  entities: "speciesId",
  actions: "actionId",
  gates: "gateId",
  cages: "environmentId",
  shopRecords: "shopRecordId",
  titleMatches: "matchId",
  eligibilityRules: "ruleId",
  teams: "teamId",
  battlePresets: "presetId",
  battleFields: "battleFieldId"
});

const ENVELOPE_KIND = Object.freeze({
  "nexus:championship:catalog:entities": Object.freeze({ kind: "entities", expected: "entities", stride: null }),
  "nexus:championship:catalog:battle-actions": Object.freeze({ kind: "actions", expected: "actions", stride: 104 }),
  "nexus:championship:catalog:gates": Object.freeze({ kind: "gates", expected: "gates", stride: null }),
  "nexus:championship:catalog:cages": Object.freeze({ kind: "cages", expected: "cages", stride: null }),
  "nexus:championship:catalog:shop-records": Object.freeze({ kind: "shopRecords", expected: "shopRecords", stride: null }),
  "nexus:championship:catalog:title-matches": Object.freeze({ kind: "titleMatches", expected: "titleMatches", stride: null }),
  "nexus:championship:catalog:eligibility-rules": Object.freeze({ kind: "eligibilityRules", expected: "eligibilityRules", stride: null }),
  "nexus:championship:catalog:teams": Object.freeze({ kind: "teams", expected: "teams", stride: null }),
  "nexus:championship:catalog:battle-presets": Object.freeze({ kind: "battlePresets", expected: "battlePresets", stride: null }),
  "nexus:championship:catalog:battle-fields": Object.freeze({ kind: "battleFields", expected: "battleFields", stride: null })
});

function collectIds(records, field, errors, kind) {
  const ids = new Set();
  for (const record of records) {
    const id = record[field];
    if (ids.has(id)) errors.push(`Duplicate ${kind} ID: ${id}`);
    ids.add(id);
  }
  return ids;
}

function requireReference(ids, value, label, errors) {
  if (!ids.has(value)) errors.push(`Broken ${label} reference: ${value}`);
}

export function validateChampionshipCatalog(bundle, options = {}) {
  const errors = [];
  try {
    if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) {
      return { valid: false, errors: ["Catalog bundle must be an object"], digest: null };
    }
    bundle = clonePlainData(bundle);
    options = clonePlainData(options);
    if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Catalog validator options must be an object");
    assertPublicCatalogShape(bundle);
  } catch {
    return { valid: false, errors: ["Catalog bundle contains unsafe or invalid plain data"], digest: null };
  }
  const allowedBundleKeys = new Set([
    "schemaVersion", "rulesetId", "authority", "forensicCatalogExpectations",
    "productScaleTargets", "initialSlice", "catalogDigests",
    ...CATALOG_KINDS, "regularMainAnimationSlots", "fixtureEconomy", "syntheticTestOnly"
  ]);
  for (const key of Object.keys(bundle)) if (!allowedBundleKeys.has(key)) errors.push(`Unsupported public catalog bundle field: ${key}`);
  if (bundle.schemaVersion !== CHAMPIONSHIP_SCHEMA_VERSION) errors.push("Unsupported catalog schemaVersion");
  if (bundle.rulesetId !== CHAMPIONSHIP_RULESET_ID) errors.push("Unexpected Championship rulesetId");
  if (bundle.authority !== "NEXUS_PRODUCT") errors.push("Catalog authority must be NEXUS_PRODUCT");
  for (const [key, expected] of Object.entries(FORENSIC_SCALE_EXPECTATIONS)) {
    if (bundle.forensicCatalogExpectations?.[key] !== expected) errors.push(`Forensic scale expectation mismatch: ${key}`);
  }
  const productScaleKeys = {
    entities: "entities", actions: "actions", gates: "gates", cages: "cages",
    shopRecords: "shopRecords", titleMatches: "titleMatches", teams: "opponentTeams", battlePresets: "battlePresets"
  };
  for (const [expectationKey, manifestKey] of Object.entries(productScaleKeys)) {
    if (bundle.productScaleTargets?.minimumAddressableCapacity?.[manifestKey] !== FORENSIC_SCALE_EXPECTATIONS[expectationKey]) {
      errors.push(`Product scale target mismatch: ${manifestKey}`);
    }
  }
  if (bundle.productScaleTargets?.maximumRecords !== null) errors.push("Product maximumRecords must remain unbounded/null in R1");
  const digestKeys = CATALOG_KINDS;
  for (const key of digestKeys) {
    if (!/^[a-f0-9]{64}$/.test(bundle.catalogDigests?.[key] ?? "")) errors.push(`Catalog manifest digest is invalid: ${key}`);
  }

  const ids = {};
  for (const kind of CATALOG_KINDS) {
    const records = bundle[kind];
    if (!Array.isArray(records)) {
      errors.push(`${kind} must be an array`);
      ids[kind] = new Set();
      continue;
    }
    for (const record of records) {
      try {
        validateChampionshipRecord(kind, record);
      } catch (error) {
        errors.push(`${kind}: ${error.message}`);
      }
    }
    ids[kind] = collectIds(records, ID_FIELD[kind], errors, kind);
  }

  for (const gate of bundle.gates ?? []) requireReference(ids.battleFields, gate.fieldDefinitionId, "gate field", errors);
  for (const gate of bundle.gates ?? []) {
    if (gate.fieldSelectionRule?.value?.fieldId !== gate.fieldDefinitionId) errors.push(`Gate field rule mismatch: ${gate.gateId}`);
  }
  for (const entity of bundle.entities ?? []) {
    if (entity.huntProfileRef !== null) requireReference(ids.gates, entity.huntProfileRef, "entity Hunt profile", errors);
    if (entity.arenaFixtureRef !== null) requireReference(ids.battlePresets, entity.arenaFixtureRef, "entity Arena preset", errors);
  }
  for (const cage of bundle.cages ?? []) requireReference(ids.battleFields, cage.fieldDefinitionId, "cage field", errors);
  for (const field of bundle.battleFields ?? []) requireReference(ids.entities, field.encounterSpeciesId, "field encounter species", errors);
  for (const record of bundle.shopRecords ?? []) {
    if (record.commitDomain === "CAGE_OWNERSHIP") requireReference(ids.cages, record.itemId, "Shop cage", errors);
  }
  for (const match of bundle.titleMatches ?? []) {
    requireReference(ids.eligibilityRules, match.eligibilityRuleId, "match eligibility", errors);
    requireReference(ids.battleFields, match.battleFieldId, "match field", errors);
    requireReference(ids.battlePresets, match.playerPresetId, "match player preset", errors);
    requireReference(ids.battlePresets, match.opponentPresetId, "match opponent preset", errors);
    requireReference(ids.teams, match.opponentSelectionRule?.value?.teamId, "match opponent team", errors);
    if (match.entryRule?.value?.ruleId !== match.eligibilityRuleId) errors.push(`Match eligibility rule mismatch: ${match.matchId}`);
    if (match.fieldSelectionRule?.value?.fieldId !== match.battleFieldId) errors.push(`Match field rule mismatch: ${match.matchId}`);
  }
  for (const preset of bundle.battlePresets ?? []) {
    requireReference(ids.entities, preset.speciesId, "preset species", errors);
    for (const rule of preset.actionLoadoutRules ?? []) {
      for (const actionId of rule.value?.actionIds ?? []) requireReference(ids.actions, actionId, "preset action", errors);
    }
  }
  for (const team of bundle.teams ?? []) {
    for (const presetId of team.memberPresetIds ?? []) if (presetId !== null) requireReference(ids.battlePresets, presetId, "team preset", errors);
  }
  for (const speciesId of bundle.initialSlice?.creatureSpeciesIds ?? []) requireReference(ids.entities, speciesId, "initial-slice creature", errors);
  for (const gateId of bundle.initialSlice?.huntGateIds ?? []) requireReference(ids.gates, gateId, "initial-slice Gate", errors);
  for (const shopRecordId of bundle.initialSlice?.shopRecordIds ?? []) requireReference(ids.shopRecords, shopRecordId, "initial-slice Shop", errors);
  for (const matchId of bundle.initialSlice?.arenaMatchIds ?? []) requireReference(ids.titleMatches, matchId, "initial-slice Arena", errors);
  for (const actionId of bundle.initialSlice?.battleActionIds ?? []) requireReference(ids.actions, actionId, "initial-slice action", errors);
  if ((bundle.initialSlice?.creatureSpeciesIds?.length ?? 0) !== 3) errors.push("Initial slice requires exactly three creature species IDs");
  if ((bundle.initialSlice?.huntGateIds?.length ?? 0) !== 1 || (bundle.initialSlice?.arenaMatchIds?.length ?? 0) !== 1) errors.push("Initial slice requires one Gate and one Arena match");
  if ((bundle.initialSlice?.battleActionIds?.length ?? 0) < 2 || bundle.initialSlice.battleActionIds.length > 3) errors.push("Initial slice requires two or three actions");
  if ((bundle.entities?.length ?? 0) < 3) errors.push("Minimal fixture requires three project-native creatures");
  if ((bundle.gates?.length ?? 0) < 1 || (bundle.titleMatches?.length ?? 0) < 1) errors.push("Minimal fixture requires a Gate and Arena match");
  if (options.requireScale !== true && ((bundle.actions?.length ?? 0) < 2 || (bundle.actions?.length ?? 0) > 3)) {
    errors.push("R1 canonical fixture requires two or three actions");
  }
  if (bundle.fixtureEconomy?.source !== "RESEARCH_FIXTURE") errors.push("Fixture economy must be RESEARCH_FIXTURE");

  if (options.requireScale === true) {
    const scaleKeys = {
      entities: "entities",
      actions: "actions",
      gates: "gates",
      cages: "cages",
      shopRecords: "shopRecords",
      titleMatches: "titleMatches",
      teams: "teams",
      battlePresets: "battlePresets",
      eligibilityRules: "eligibilityRules",
      battleFields: "battleFields"
    };
    for (const [kind, expectation] of Object.entries(scaleKeys)) {
      if ((bundle[kind]?.length ?? 0) !== FORENSIC_SCALE_EXPECTATIONS[expectation]) {
        errors.push(`Synthetic scale mismatch for ${kind}`);
      }
    }
    if ((bundle.regularMainAnimationSlots?.length ?? 0) !== FORENSIC_SCALE_EXPECTATIONS.regularMainAnimationSlots) {
      errors.push("Synthetic scale mismatch for regularMainAnimationSlots");
    }
    const slots = (bundle.regularMainAnimationSlots ?? []).map((entry) => entry.rawSlot).sort((left, right) => left - right);
    if (slots.some((slot, index) => slot !== index)) errors.push("Synthetic animation slots must cover raw slots 0 through 39 exactly once");
  }

  return { valid: errors.length === 0, errors, digest: errors.length === 0 ? stableDigest(bundle) : null };
}

export function validateChampionshipCatalogEnvelope(envelope, options = {}) {
  const errors = [];
  try {
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
      return { valid: false, errors: ["Catalog envelope must be an object"] };
    }
    envelope = clonePlainData(envelope);
    options = clonePlainData(options);
    if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Catalog envelope validator options must be an object");
    assertPublicCatalogShape(envelope);
  } catch {
    return { valid: false, errors: ["Catalog envelope contains unsafe or invalid plain data"] };
  }
  const allowed = new Set(["schemaVersion", "catalogKind", "authority", "generatorVersion", "expectedForensicRecordCount", "recordStrideBytes", "recordsDigestSha256", "records"]);
  for (const key of Object.keys(envelope)) if (!allowed.has(key)) errors.push(`Unsupported catalog envelope field: ${key}`);
  if (envelope.schemaVersion !== CHAMPIONSHIP_SCHEMA_VERSION) errors.push("Unsupported catalog envelope schemaVersion");
  if (envelope.authority !== "NEXUS_PRODUCT") errors.push("Catalog envelope authority must be NEXUS_PRODUCT");
  if (typeof envelope.generatorVersion !== "string" || envelope.generatorVersion.length < 3) errors.push("Catalog envelope generatorVersion is invalid");
  const descriptor = ENVELOPE_KIND[envelope.catalogKind];
  if (!descriptor) errors.push(`Unknown catalogKind: ${envelope.catalogKind}`);
  if (descriptor && envelope.expectedForensicRecordCount !== FORENSIC_SCALE_EXPECTATIONS[descriptor.expected]) errors.push("Catalog envelope forensic count mismatch");
  if (descriptor && envelope.recordStrideBytes !== descriptor.stride) errors.push("Catalog envelope stride mismatch");
  if (!/^[a-f0-9]{64}$/.test(envelope.recordsDigestSha256 ?? "")) errors.push("Catalog envelope records digest is invalid");
  if (!Array.isArray(envelope.records)) errors.push("Catalog envelope records must be an array");
  if (descriptor && Array.isArray(envelope.records)) {
    const seen = new Set();
    for (const record of envelope.records) {
      try {
        validateChampionshipRecord(descriptor.kind, record);
      } catch (error) {
        errors.push(`${descriptor.kind}: ${error.message}`);
      }
      const id = record?.[ID_FIELD[descriptor.kind]];
      if (seen.has(id)) errors.push(`Duplicate envelope record ID: ${id}`);
      seen.add(id);
    }
  }
  if (options.computedRecordsDigestSha256 !== undefined && options.computedRecordsDigestSha256 !== envelope.recordsDigestSha256) {
    errors.push("Catalog envelope records digest mismatch");
  }
  return { valid: errors.length === 0, errors, kind: descriptor?.kind ?? null };
}

export { CATALOG_KINDS };
