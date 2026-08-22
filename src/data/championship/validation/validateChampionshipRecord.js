import {
  validateAggregateParity,
  validateEvidenceBoundExecutableRule,
  validateFindingId
} from "../../../championship/contracts/evidencePolicy.js";

const FORBIDDEN_PUBLIC_KEYS = new Set([
  "rawHex",
  "romOffset",
  "ramAddress",
  "nicknamePointer",
  "sourceIndex",
  "forensicIndex",
  "sourceOriginalText",
  "originalAssetRef",
  "unknownFields",
  "rawVector",
  "rawFlags",
  "rawBytes",
  "sourceOffset",
  "privatePath",
  "sourceArtifactDigests",
  "reader",
  "writer",
  "callerChain",
  "remainingUnknowns",
  "__proto__",
  "prototype",
  "constructor"
]);

const NAMESPACED_ID = /^nexus:[a-z0-9][a-z0-9:_-]+$/;

export function assertNamespacedId(value, label = "ID") {
  if (typeof value !== "string" || !NAMESPACED_ID.test(value)) throw new TypeError(`${label} must be a Nexus namespaced ID`);
  return value;
}

function containsAbsoluteFileReference(value) {
  if (typeof value !== "string") return false;
  const candidates = [value.trim()];
  try {
    const decoded = decodeURIComponent(value).trim();
    if (decoded !== candidates[0]) candidates.push(decoded);
  } catch {
    // Invalid percent encoding is handled as the original string.
  }
  return candidates.some((candidate) => (
    /^[A-Za-z]:[\\/]/.test(candidate)
    || /^(?:\\\\|\/\/)/.test(candidate)
    || /^file:/i.test(candidate)
    || /^\//.test(candidate)
    || candidate.includes("<PRIVATE_RE_ROOT>")
  ));
}

export function assertPublicCatalogShape(value, path = "$", seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return true;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PUBLIC_KEYS.has(key)) throw new Error(`Private forensic key is forbidden at ${path}.${key}`);
    if (containsAbsoluteFileReference(child)) {
      throw new Error(`Private absolute path is forbidden at ${path}.${key}`);
    }
    assertPublicCatalogShape(child, `${path}.${key}`, seen);
  }
  return true;
}

function assertExactValueKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} value must be an object`);
  const keys = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (keys.length !== allowed.length || keys.some((key, index) => key !== allowed[index])) {
    throw new Error(`${label} value contains missing or unsupported fields`);
  }
}

function assertInteger(value, label, minimum = 0) {
  if (!Number.isInteger(value) || value < minimum) throw new TypeError(`${label} must be an integer >= ${minimum}`);
}

function validateRuleValue(ruleKey, rule, recordKind) {
  const value = rule.value;
  if (rule.executable !== true) return;
  if (ruleKey === "targetRule") {
    assertExactValueKeys(value, ["kind"], ruleKey);
    if (value.kind !== "SINGLE_OPPONENT") throw new Error("Unsupported R1 target rule");
  } else if (ruleKey === "timelineRules") {
    assertExactValueKeys(value, ["kind"], ruleKey);
    if (value.kind !== "FIXED_TURN") throw new Error("Unsupported R1 timeline rule");
  } else if (ruleKey === "effectRules") {
    assertExactValueKeys(value, ["kind", "magnitude"], ruleKey);
    if (value.kind !== "DAMAGE") throw new Error("Unsupported R1 effect rule");
    assertInteger(value.magnitude, "Damage magnitude");
  } else if (ruleKey === "admissionRule") {
    assertExactValueKeys(value, ["kind"], ruleKey);
    if (value.kind !== "RESEARCH_OPEN") throw new Error("Unsupported R1 admission rule");
  } else if (ruleKey === "fieldSelectionRule") {
    assertExactValueKeys(value, ["fieldId"], ruleKey);
    assertNamespacedId(value.fieldId, "fieldSelectionRule.fieldId");
  } else if (ruleKey === "topologyRule") {
    if (recordKind === "cages") {
      assertExactValueKeys(value, ["kind"], ruleKey);
      if (value.kind !== "SINGLE_RESEARCH_HABITAT") throw new Error("Unsupported R1 cage topology rule");
    } else {
      assertExactValueKeys(value, ["kind", "cellSize", "width", "height", "playerStart", "encounterPoint", "obstacles"], ruleKey);
      if (value.kind !== "GRID_COLLISION" || value.cellSize !== 1) throw new Error("Unsupported R1 field topology rule");
      assertInteger(value.width, "Field width", 1);
      assertInteger(value.height, "Field height", 1);
      for (const [label, point] of [["playerStart", value.playerStart], ["encounterPoint", value.encounterPoint]]) {
        assertExactValueKeys(point, ["x", "y"], label);
        assertInteger(point.x, `${label}.x`);
        assertInteger(point.y, `${label}.y`);
        if (point.x >= value.width || point.y >= value.height) throw new Error(`${label} must be inside the field`);
      }
      if (!Array.isArray(value.obstacles)) throw new TypeError("Field obstacles must be an array");
      for (const obstacle of value.obstacles) {
        assertExactValueKeys(obstacle, ["x", "y", "width", "height"], "obstacle");
        assertInteger(obstacle.x, "obstacle.x");
        assertInteger(obstacle.y, "obstacle.y");
        assertInteger(obstacle.width, "obstacle.width", 1);
        assertInteger(obstacle.height, "obstacle.height", 1);
        if (obstacle.x + obstacle.width > value.width || obstacle.y + obstacle.height > value.height) throw new Error("Obstacle must fit inside the field");
      }
    }
  } else if (ruleKey === "availabilityRule") {
    assertExactValueKeys(value, ["available"], ruleKey);
    if (typeof value.available !== "boolean") throw new TypeError("Shop availability must be boolean");
  } else if (ruleKey === "initialStockRule") {
    assertExactValueKeys(value, ["count"], ruleKey);
    assertInteger(value.count, "Initial stock");
  } else if (ruleKey === "capacityRule") {
    assertExactValueKeys(value, ["maximum"], ruleKey);
    assertInteger(value.maximum, "Capacity");
  } else if (ruleKey === "priceRule") {
    assertExactValueKeys(value, ["amount"], ruleKey);
    assertInteger(value.amount, "Price");
  } else if (ruleKey === "entryRule") {
    assertExactValueKeys(value, ["ruleId"], ruleKey);
    assertNamespacedId(value.ruleId, "entryRule.ruleId");
  } else if (ruleKey === "opponentSelectionRule") {
    assertExactValueKeys(value, ["teamId"], ruleKey);
    assertNamespacedId(value.teamId, "opponentSelectionRule.teamId");
  } else if (ruleKey === "resultContractRule") {
    assertExactValueKeys(value, ["committable"], ruleKey);
    if (value.committable !== false) throw new Error("Research result contracts are never committable");
  } else if (ruleKey === "tutorialRule") {
    assertExactValueKeys(value, ["kind"], ruleKey);
    if (!["RESEARCH_HINTS", "NONE"].includes(value.kind)) throw new Error("Unsupported R1 tutorial rule");
  } else if (ruleKey === "predicateRule") {
    assertExactValueKeys(value, ["allowed"], ruleKey);
    if (typeof value.allowed !== "boolean") throw new TypeError("Eligibility predicate must be boolean");
  } else if (ruleKey === "arenaStatRules") {
    assertExactValueKeys(value, ["kind", "amount"], ruleKey);
    if (value.kind !== "HP") throw new Error("Unsupported R1 Arena stat rule");
    assertInteger(value.amount, "Arena HP", 1);
  } else if (ruleKey === "actionLoadoutRules") {
    assertExactValueKeys(value, ["kind", "actionIds"], ruleKey);
    if (value.kind !== "ACTION_LOADOUT" || !Array.isArray(value.actionIds) || value.actionIds.length === 0) throw new Error("Unsupported R1 action loadout rule");
    value.actionIds.forEach((actionId) => assertNamespacedId(actionId, "actionLoadoutRules.actionId"));
  } else if (ruleKey === "opponentPolicyRule") {
    assertExactValueKeys(value, ["kind"], ruleKey);
    if (!["PLAYER_SELECTION", "FIXED_ALTERNATING"].includes(value.kind)) throw new Error("Unsupported R1 opponent policy rule");
  } else {
    throw new Error(`Unsupported executable ${ruleKey}`);
  }
}

function validateRules(record, recordKind) {
  const rules = [];
  for (const [key, value] of Object.entries(record)) {
    if (key.endsWith("Rule")) {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${key} must be an evidence-rule object`);
      rules.push({ key, rule: value });
    }
    if (key.endsWith("Rules")) {
      if (!Array.isArray(value)) throw new TypeError(`${key} must be an evidence-rule array`);
      if (["timelineRules", "effectRules", "arenaStatRules", "actionLoadoutRules"].includes(key) && value.length === 0) {
        throw new Error(`${key} must contain at least one executable rule`);
      }
      rules.push(...value.map((rule) => ({ key, rule })));
    }
  }
  for (const { key, rule } of rules) {
    validateEvidenceBoundExecutableRule(rule);
    validateRuleValue(key, rule, recordKind);
  }
  if (Array.isArray(record.evidenceRefs)) record.evidenceRefs.forEach(validateFindingId);
  if (record.aggregateParity) {
    validateAggregateParity(record.aggregateParity);
    const hasAdaptation = rules.some(({ rule }) => rule.ruleAuthority === "NEXUS_ADAPTATION");
    if (hasAdaptation && record.aggregateParity.status !== "RESEARCH_NON_PARITY") {
      throw new Error("An adapted child rule requires aggregate RESEARCH_NON_PARITY");
    }
    if (record.aggregateParity.status === "VERIFIED_BEHAVIOR" && rules.some(({ rule }) => rule.ruleAuthority !== "VERIFIED_YDIJ_RULE")) {
      throw new Error("VERIFIED_BEHAVIOR requires every child rule to be independently verified");
    }
  }
}

const RECORD_KEYS = Object.freeze({
  entities: new Set(["speciesId", "displayNameKey", "displayName", "assetRef", "formKind", "huntProfileRef", "arenaFixtureRef", "sourceAuthority"]),
  actions: new Set(["actionId", "displayNameKey", "displayName", "targetRule", "timelineRules", "effectRules", "aggregateParity"]),
  gates: new Set(["gateId", "fieldDefinitionId", "displayNameKey", "displayName", "ecologyTags", "presentationRef", "admissionRule", "fieldSelectionRule"]),
  cages: new Set(["environmentId", "fieldDefinitionId", "projectNativePresentationRef", "topologyRule", "dynamicSurfaceRules"]),
  shopRecords: new Set(["shopRecordId", "category", "subcategory", "itemId", "nameKey", "displayName", "descriptionKey", "commitDomain", "availabilityRule", "initialStockRule", "capacityRule", "priceRule", "evidenceRefs"]),
  titleMatches: new Set(["matchId", "nameKey", "displayName", "descriptionKey", "eligibilityRuleId", "battleFieldId", "playerPresetId", "opponentPresetId", "entryRule", "opponentSelectionRule", "fieldSelectionRule", "resultContractRule", "tutorialRule", "aggregateParity"]),
  eligibilityRules: new Set(["ruleId", "conditionTextKey", "predicateRule"]),
  teams: new Set(["teamId", "nameKey", "descriptionKey", "memberPresetIds", "evidenceRefs"]),
  battlePresets: new Set(["presetId", "speciesId", "displayNameKey", "arenaStatRules", "actionLoadoutRules", "opponentPolicyRule", "aggregateParity"]),
  battleFields: new Set(["battleFieldId", "projectNativePresentationRef", "encounterSpeciesId", "topologyRule", "presentationLayerRules"])
});

const RECORD_REQUIRED_KEYS = Object.freeze({
  entities: new Set(["speciesId", "displayNameKey", "assetRef", "formKind", "huntProfileRef", "arenaFixtureRef", "sourceAuthority"]),
  actions: new Set(["actionId", "displayNameKey", "targetRule", "timelineRules", "effectRules", "aggregateParity"]),
  gates: new Set(["gateId", "fieldDefinitionId", "displayNameKey", "ecologyTags", "presentationRef", "admissionRule", "fieldSelectionRule"]),
  cages: new Set(["environmentId", "fieldDefinitionId", "projectNativePresentationRef", "topologyRule", "dynamicSurfaceRules"]),
  shopRecords: new Set(["shopRecordId", "category", "subcategory", "itemId", "nameKey", "descriptionKey", "commitDomain", "availabilityRule", "initialStockRule", "capacityRule", "priceRule", "evidenceRefs"]),
  titleMatches: new Set(["matchId", "nameKey", "descriptionKey", "eligibilityRuleId", "battleFieldId", "playerPresetId", "opponentPresetId", "entryRule", "opponentSelectionRule", "fieldSelectionRule", "resultContractRule", "tutorialRule", "aggregateParity"]),
  eligibilityRules: new Set(["ruleId", "conditionTextKey", "predicateRule"]),
  teams: new Set(["teamId", "nameKey", "descriptionKey", "memberPresetIds", "evidenceRefs"]),
  battlePresets: new Set(["presetId", "speciesId", "displayNameKey", "arenaStatRules", "actionLoadoutRules", "opponentPolicyRule", "aggregateParity"]),
  battleFields: new Set(["battleFieldId", "projectNativePresentationRef", "encounterSpeciesId", "topologyRule", "presentationLayerRules"])
});

export function validateChampionshipRecord(kind, record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) throw new TypeError(`${kind} record must be an object`);
  assertPublicCatalogShape(record);
  const idFields = {
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
  };
  const idField = idFields[kind];
  if (!idField) throw new Error(`Unknown Championship catalog kind: ${kind}`);
  for (const key of RECORD_REQUIRED_KEYS[kind]) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) throw new Error(`Missing required public ${kind} field: ${key}`);
  }
  for (const key of Object.keys(record)) {
    if (!RECORD_KEYS[kind].has(key)) throw new Error(`Unsupported public ${kind} field: ${key}`);
  }
  assertNamespacedId(record[idField], idField);
  validateRules(record, kind);
  return true;
}

export function getForbiddenPublicCatalogKeys() {
  return [...FORBIDDEN_PUBLIC_KEYS];
}
