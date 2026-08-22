export const CHAMPIONSHIP_SCHEMA_VERSION = 1;
export const CHAMPIONSHIP_RULESET_ID = "championship-research-r1";

export const CHAMPIONSHIP_PHASES = Object.freeze([
  "HEARTLAKE_PROFILE",
  "GATE_SELECT",
  "HUNT_FIELD",
  "WILD_ENCOUNTER",
  "CAPTURE",
  "COLLECTION",
  "SHOP",
  "ARENA",
  "BATTLE",
  "BATTLE_RESULT",
  "COMPLETE"
]);

export const FORENSIC_SCALE_EXPECTATIONS = Object.freeze({
  entities: 224,
  actions: 596,
  gates: 16,
  cages: 40,
  shopRecords: 118,
  titleMatches: 62,
  teams: 152,
  battlePresets: 456,
  eligibilityRules: 45,
  battleFields: 11,
  regularMainAnimationSlots: 40
});

export const RESEARCH_AUTHORITY = "NEXUS_ADAPTATION";
export const RESEARCH_EVIDENCE_STATUS = "NEXUS_RESEARCH_RULE";
export const RESEARCH_PARITY_STATUS = "RESEARCH_NON_PARITY";
const FORBIDDEN_PLAIN_DATA_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function isPlainRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function clonePlainData(value, seen = new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Non-finite numbers are not valid Championship data");
    return value;
  }
  if (typeof value !== "object") throw new TypeError("Championship data must be plain serializable data");
  if (seen.has(value)) throw new TypeError("Cyclic Championship data is not allowed");
  seen.add(value);

  if (Array.isArray(value)) {
    const arrayKeys = Reflect.ownKeys(value).filter((key) => key !== "length");
    if (
      arrayKeys.length !== value.length
      || arrayKeys.some((key, index) => key !== String(index) || !Object.prototype.propertyIsEnumerable.call(value, key))
    ) {
      throw new TypeError("Championship arrays must be dense and cannot contain symbols or extra properties");
    }
    const cloned = value.map((entry) => clonePlainData(entry, seen));
    seen.delete(value);
    return cloned;
  }
  if (!isPlainRecord(value)) throw new TypeError("Championship data must use plain objects");

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string" || !Object.prototype.propertyIsEnumerable.call(value, key))) {
    throw new TypeError("Championship objects cannot contain symbols or hidden properties");
  }
  const cloned = {};
  for (const key of ownKeys.sort()) {
    if (FORBIDDEN_PLAIN_DATA_KEYS.has(key)) throw new TypeError(`Forbidden Championship data key: ${key}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.get || descriptor.set || !("value" in descriptor)) {
      throw new TypeError(`Accessor property is forbidden in Championship data: ${key}`);
    }
    cloned[key] = clonePlainData(descriptor.value, seen);
  }
  seen.delete(value);
  return cloned;
}

export function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const entry of Object.values(value)) deepFreeze(entry, seen);
  return Object.freeze(value);
}

export function canonicalStringify(value) {
  return JSON.stringify(clonePlainData(value));
}

export function stableDigest(value) {
  const input = canonicalStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createResearchResultEnvelope(overrides = {}) {
  const envelope = {
    accepted: true,
    code: "CHAMPIONSHIP_OK",
    committable: false,
    playerStatePatch: null,
    persistenceAttempted: false,
    sessionEventDigest: null,
    findingIds: [],
    ...clonePlainData(overrides)
  };
  envelope.committable = false;
  envelope.playerStatePatch = null;
  envelope.persistenceAttempted = false;
  return deepFreeze(envelope);
}

export function assertResultEnvelope(result) {
  if (!isPlainRecord(result)) throw new TypeError("Research result must be a plain object");
  if (result.committable !== false) throw new Error("Research results are never committable");
  if (result.playerStatePatch !== null) throw new Error("Research results cannot contain a player-state patch");
  if (result.persistenceAttempted !== false) throw new Error("Research results cannot attempt persistence");
  const forbidden = ["saveCommand", "cloudCommand", "relationshipDelta", "growthDelta", "productionRewardWrite"];
  for (const key of forbidden) {
    if (Object.prototype.hasOwnProperty.call(result, key)) throw new Error(`Forbidden result field: ${key}`);
  }
  if (!Array.isArray(result.findingIds) || result.findingIds.some((findingId) => (
    typeof findingId !== "string"
    || !/^[a-z0-9][a-z0-9:_-]{2,95}$/i.test(findingId)
    || findingId.includes("\\")
    || findingId.includes("/")
    || findingId.includes("..")
  ))) throw new Error("Research result findingIds must be sanitized identifiers");
  return true;
}

export function createResearchRule(value, evidenceRefs = []) {
  if (value === null || value === undefined) throw new TypeError("Research rules require a non-null value");
  clonePlainData(value);
  if (!Array.isArray(evidenceRefs) || evidenceRefs.some((findingId) => typeof findingId !== "string" || !/^[a-z0-9][a-z0-9:_-]{2,95}$/i.test(findingId))) {
    throw new TypeError("Research rule evidenceRefs must contain sanitized identifiers");
  }
  return deepFreeze({
    value: clonePlainData(value),
    ruleAuthority: RESEARCH_AUTHORITY,
    evidenceStatus: RESEARCH_EVIDENCE_STATUS,
    executable: true,
    originalParityClaim: false,
    evidenceRefs: [...evidenceRefs]
  });
}
