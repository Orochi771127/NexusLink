import { isKnownCompanionId } from "../data/companionRegistry.js";
import {
  createCompletedGrowthEvent,
  createGrowthEvidenceIdentity,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "./companionGrowthEngine.js";

export const REFLECTION_GROWTH_RESOLUTION_IDS = Object.freeze([
  "shared_understanding",
  "accepted_rewrite",
  "held_uncertainty",
  "named_next_step"
]);

const RESOLUTION_RULES = Object.freeze({
  shared_understanding: Object.freeze({
    tendency: "attunement",
    consentKind: null
  }),
  accepted_rewrite: Object.freeze({
    tendency: "boundary_respect",
    consentKind: "respected_rewrite"
  }),
  held_uncertainty: Object.freeze({
    tendency: "steadfastness",
    consentKind: null
  }),
  named_next_step: Object.freeze({
    tendency: "pathfinding",
    consentKind: null
  })
});

const ALLOWED_INPUT_KEYS = new Set([
  "state",
  "companionId",
  "memoryId",
  "traceId",
  "resolutionId",
  "completedAt",
  "safetyFacts"
]);
const RAW_TEXT_INPUT_KEYS = new Set([
  "text",
  "rawText",
  "playerText",
  "message",
  "excerpt",
  "reflectionText",
  "resolutionText",
  "copy"
]);
const SAFETY_FACT_KEYS = new Set([
  "isHighRisk",
  "strategyId",
  "actionId",
  "systemRoleSafetyReply",
  "safetyModeActive",
  "safeHarborModeActive"
]);
const MEMORY_STATUSES = new Set(["fresh", "settled", "transformed", "archived"]);
const TRACE_STATUSES = new Set(["fresh", "settled", "transformed"]);
const MACHINE_LABEL_PATTERN = /^[a-z0-9][a-z0-9._]*$/;
const SAFE_PROVENANCE_VALIDATION_FACTS = Object.freeze({
  isHighRisk: false,
  strategyId: null,
  actionId: null,
  systemRoleSafetyReply: false,
  safetyModeActive: false,
  safeHarborModeActive: false
});

/**
 * Validate an Echo Sorting completion and return the exact payload accepted by
 * companionGrowthController.writeIntoDraft(). This function is deliberately
 * pure: it neither mutates the supplied state nor writes Growth evidence.
 *
 * Current legacy emotional-memory and habitat-trace records do not retain a
 * companion owner or sealed Growth safety provenance. Those records therefore
 * fail closed; this owner never infers ownership from activeCompanionId.
 */
export function createReflectionGrowthWriteInput(input = {}) {
  if (!isPlainObject(input)) return ownerFailure("invalid_input");
  if (Object.keys(input).some((key) => RAW_TEXT_INPUT_KEYS.has(key))) {
    return ownerFailure("raw_player_text_forbidden");
  }
  if (Object.keys(input).some((key) => !ALLOWED_INPUT_KEYS.has(key))) {
    return ownerFailure("invalid_input_shape");
  }

  const state = input.state;
  const companionId = input.companionId;
  if (!isPlainObject(state)) return ownerFailure("invalid_state");
  if (!isKnownCompanionId(companionId)) return ownerFailure("unknown_companion");
  if (state.activeCompanionId !== companionId) {
    return ownerFailure("active_companion_mismatch");
  }
  if (!Array.isArray(state.unlockedCompanionIds)
    || !state.unlockedCompanionIds.includes(companionId)) {
    return ownerFailure("companion_locked");
  }

  const growth = state.companionStates?.byId?.[companionId]?.growth;
  if (!isPlainObject(growth)) return ownerFailure("missing_companion_growth");
  if (state.safeHarborMode === true) return ownerFailure("safe_harbor_zero_evidence");

  const resolution = RESOLUTION_RULES[input.resolutionId] || null;
  if (!resolution) return ownerFailure("unknown_resolution");
  const completedAt = normalizePositiveTimestamp(input.completedAt);
  if (!completedAt) return ownerFailure("invalid_completed_at");

  const source = inspectCanonicalReflectionSource({
    state,
    companionId,
    memoryId: input.memoryId,
    traceId: input.traceId,
    at: completedAt
  });
  if (!source.ok) return ownerFailure(source.reason);

  const identityResult = createGrowthEvidenceIdentity("reflection", {
    memoryId: source.originType === "memory" ? source.originId : null,
    traceId: source.originType === "trace" ? source.originId : null,
    resolutionId: input.resolutionId
  });
  if (!identityResult.ok) return ownerFailure(identityResult.reason);
  if (identityResult.identity.context.resolutionId !== input.resolutionId) {
    return ownerFailure("noncanonical_resolution_id");
  }
  if (hasConsumedReflectionRoot(growth, identityResult.identity.rootContextKey)) {
    return ownerFailure("reflection_origin_already_consumed");
  }

  const safety = inspectResolutionSafetyFacts(
    input.safetyFacts,
    state,
    source.safetyProvenance
  );
  if (!safety.ok) return ownerFailure(safety.reason);

  const context = Object.freeze({
    memoryId: source.originType === "memory" ? source.originId : null,
    traceId: source.originType === "trace" ? source.originId : null,
    resolutionId: input.resolutionId
  });
  const parentEvent = deepFreeze({
    safetyProvenance: { ...source.safetyProvenance },
    growthSafetyExcluded: false
  });
  const writeInput = deepFreeze({
    companionId,
    sourceType: "reflection",
    tendency: resolution.tendency,
    context,
    memoryId: context.memoryId,
    traceId: context.traceId,
    createdAt: completedAt,
    completed: true,
    completionStatus: "completed",
    consentKind: resolution.consentKind,
    safetyProvenance: { ...safety.facts },
    parentEvent
  });

  // Prove compatibility against the existing sole Growth authority without
  // mutating the supplied record. This also fails closed for a corrupt/final
  // Growth window or a completion timestamp predating the current target.
  const created = createCompletedGrowthEvent(writeInput);
  if (!created.ok) return ownerFailure(created.reason);
  const preview = writeCompanionGrowthEvidence({
    growth,
    companionId,
    event: created.event
  });
  if (!preview.result.accepted) return ownerFailure(preview.result.reason);

  return deepFreeze({
    ok: true,
    reason: "reflection_write_input_ready",
    originType: source.originType,
    originId: source.originId,
    rootContextKey: identityResult.identity.rootContextKey,
    writeInput
  });
}

/**
 * Inspect a canonical source without returning its text-bearing record.
 * Consumers may use the returned sealed safety provenance to preserve the
 * source chain, but cannot receive excerpt/textHint/player copy from here.
 */
export function inspectCanonicalReflectionSource({
  state = {},
  companionId = null,
  memoryId = null,
  traceId = null,
  at = null
} = {}) {
  if (!isKnownCompanionId(companionId)) return sourceFailure("unknown_companion");
  if (Boolean(memoryId) === Boolean(traceId)) {
    return sourceFailure("reflection_source_requires_one_id");
  }
  const originType = memoryId ? "memory" : "trace";
  const originId = memoryId || traceId;
  if (!isCanonicalReflectionId(originType, originId)) {
    return sourceFailure("invalid_source_id");
  }

  const collection = originType === "memory"
    ? state?.emotionalMemories
    : state?.habitatTraces;
  if (!Array.isArray(collection)) return sourceFailure("missing_source_collection");
  const matches = collection.filter((item) => item?.id === originId);
  if (matches.length === 0) return sourceFailure("unknown_source_id");
  if (matches.length !== 1) return sourceFailure("ambiguous_source_id");

  const recordInspection = inspectOwnedSafeSourceRecord(
    matches[0],
    companionId,
    originType,
    at
  );
  if (!recordInspection.ok) return sourceFailure(recordInspection.reason);

  if (originType === "trace" && matches[0].memoryId) {
    const linkedMemoryId = matches[0].memoryId;
    if (!isCanonicalReflectionId("memory", linkedMemoryId)) {
      return sourceFailure("invalid_linked_memory_id");
    }
    const linked = Array.isArray(state?.emotionalMemories)
      ? state.emotionalMemories.filter((item) => item?.id === linkedMemoryId)
      : [];
    if (linked.length !== 1) return sourceFailure("linked_memory_unverifiable");
    const linkedInspection = inspectOwnedSafeSourceRecord(
      linked[0],
      companionId,
      "memory",
      at
    );
    if (!linkedInspection.ok) return sourceFailure("linked_memory_unverifiable");
  }

  return deepFreeze({
    ok: true,
    reason: "canonical_source_verified",
    originType,
    originId,
    safetyProvenance: { ...recordInspection.safetyProvenance }
  });
}

/**
 * 建立「一開始就有主人」的反思來源。
 * companionId 必須由呼叫端明示傳入；禁止帶 state／activeCompanionId 來猜。
 * 這是新建來源，不是幫舊資料補洞。
 */
export function createOwnedSafeReflectionSource(input = {}) {
  if (!isPlainObject(input)) return sourceFailure("invalid_input");
  if (Object.prototype.hasOwnProperty.call(input, "state")
    || Object.prototype.hasOwnProperty.call(input, "activeCompanionId")) {
    return sourceFailure("active_companion_inference_forbidden");
  }
  if (Object.keys(input).some((key) => RAW_TEXT_INPUT_KEYS.has(key))) {
    return sourceFailure("raw_player_text_forbidden");
  }

  const companionId = input.companionId;
  if (!isKnownCompanionId(companionId)) return sourceFailure("unknown_companion");

  const originType = input.originType;
  if (originType !== "memory" && originType !== "trace") {
    return sourceFailure("invalid_origin_type");
  }

  const id = input.id;
  if (!isCanonicalReflectionId(originType, id)) return sourceFailure("invalid_source_id");

  const createdAt = normalizePositiveTimestamp(input.createdAt);
  if (!createdAt) return sourceFailure("source_timestamp_unverifiable");

  // 必須先驗證呼叫端明示的原始 facts，不可把缺欄位補成 false／null 再封成 complete。
  const explicitSafety = inspectExplicitSafetyFacts(input.safetyFacts);
  if (!explicitSafety.ok) return sourceFailure("source_safety_unverifiable");
  const sealed = sealGrowthSafetyProvenance(explicitSafety.facts);
  if (sealed.excluded !== false || sealed.complete !== true) {
    return sourceFailure("source_safety_unverifiable");
  }

  const status = input.status || "settled";
  const statuses = originType === "memory" ? MEMORY_STATUSES : TRACE_STATUSES;
  if (!statuses.has(status)) return sourceFailure("source_not_reflectable");

  const record = {
    id,
    companionId,
    status,
    createdAt,
    growthSafetyExcluded: false,
    safetyProvenance: sealed
  };
  if (originType === "memory") {
    record.source = "owned_reflection_source";
    record.excerpt = "";
  } else {
    record.memoryId = input.memoryId == null ? null : input.memoryId;
    record.expiresAt = Number.isFinite(input.expiresAt) ? input.expiresAt : createdAt + 14 * 24 * 60 * 60 * 1000;
    record.textHint = "";
  }

  const inspection = inspectOwnedSafeSourceRecord(record, companionId, originType, createdAt + 1);
  if (!inspection.ok) return sourceFailure(inspection.reason);

  return deepFreeze({
    ok: true,
    reason: "owned_source_created",
    originType,
    originId: id,
    record
  });
}

/**
 * 找出目前這隻夥伴已經封存、可被回看的來源。
 * 不會把 activeCompanionId 當成缺漏 owner 的答案。
 */
export function findReflectableCanonicalSource({
  state = {},
  companionId = null,
  at = null
} = {}) {
  if (!isKnownCompanionId(companionId)) return sourceFailure("unknown_companion");

  const inspectedAt = normalizePositiveTimestamp(at) || Number.MAX_SAFE_INTEGER;
  const memories = Array.isArray(state?.emotionalMemories) ? state.emotionalMemories : [];
  for (let index = memories.length - 1; index >= 0; index -= 1) {
    const id = memories[index]?.id;
    if (!id) continue;
    const inspected = inspectCanonicalReflectionSource({
      state,
      companionId,
      memoryId: id,
      at: inspectedAt
    });
    if (inspected.ok) return inspected;
  }

  const traces = Array.isArray(state?.habitatTraces) ? state.habitatTraces : [];
  for (let index = traces.length - 1; index >= 0; index -= 1) {
    const id = traces[index]?.id;
    if (!id) continue;
    const inspected = inspectCanonicalReflectionSource({
      state,
      companionId,
      traceId: id,
      at: inspectedAt
    });
    if (inspected.ok) return inspected;
  }

  return sourceFailure("source_owner_unverifiable");
}

function inspectOwnedSafeSourceRecord(record, companionId, originType, at) {
  if (!isPlainObject(record) || record.companionId !== companionId) {
    return sourceFailure("source_owner_unverifiable");
  }
  if (record.growthSafetyExcluded !== false) {
    return sourceFailure("source_safety_unverifiable");
  }
  if (!validateSealedSafeProvenance(record.safetyProvenance)) {
    return sourceFailure("source_safety_unverifiable");
  }

  const inspectedAt = normalizePositiveTimestamp(at);
  const sourceCreatedAt = normalizePositiveTimestamp(record.createdAt);
  if (!inspectedAt || !sourceCreatedAt || sourceCreatedAt > inspectedAt) {
    return sourceFailure("source_timestamp_unverifiable");
  }

  const statuses = originType === "memory" ? MEMORY_STATUSES : TRACE_STATUSES;
  if (!statuses.has(record.status)) return sourceFailure("source_not_reflectable");
  if (originType === "trace") {
    if (inspectedAt && Number.isFinite(record.expiresAt) && record.expiresAt <= inspectedAt) {
      return sourceFailure("source_trace_expired");
    }
  }
  return {
    ok: true,
    safetyProvenance: record.safetyProvenance
  };
}

function inspectExplicitSafetyFacts(rawFacts) {
  if (!isPlainObject(rawFacts)) return safetyFailure("source_safety_unverifiable");
  const keys = Object.keys(rawFacts);
  if (keys.some((key) => !SAFETY_FACT_KEYS.has(key))) {
    return safetyFailure("source_safety_unverifiable");
  }
  for (const key of SAFETY_FACT_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(rawFacts, key)) {
      return safetyFailure("source_safety_unverifiable");
    }
  }
  const booleanFields = [
    "isHighRisk",
    "systemRoleSafetyReply",
    "safetyModeActive",
    "safeHarborModeActive"
  ];
  if (!booleanFields.every((field) => typeof rawFacts[field] === "boolean")) {
    return safetyFailure("source_safety_unverifiable");
  }
  if (!isNullableMachineLabel(rawFacts.strategyId)
    || !isNullableMachineLabel(rawFacts.actionId)) {
    return safetyFailure("source_safety_unverifiable");
  }
  return {
    ok: true,
    facts: Object.freeze({
      isHighRisk: rawFacts.isHighRisk,
      strategyId: rawFacts.strategyId,
      actionId: rawFacts.actionId,
      systemRoleSafetyReply: rawFacts.systemRoleSafetyReply,
      safetyModeActive: rawFacts.safetyModeActive,
      safeHarborModeActive: rawFacts.safeHarborModeActive
    })
  };
}

function inspectResolutionSafetyFacts(rawFacts, state, parentProvenance) {
  if (!isPlainObject(rawFacts)) return safetyFailure("resolution_safety_incomplete");
  if (Object.keys(rawFacts).some((key) => !SAFETY_FACT_KEYS.has(key))) {
    return safetyFailure("resolution_safety_invalid");
  }
  const booleanFields = [
    "isHighRisk",
    "systemRoleSafetyReply",
    "safetyModeActive",
    "safeHarborModeActive"
  ];
  if (!booleanFields.every((field) => typeof rawFacts[field] === "boolean")) {
    return safetyFailure("resolution_safety_incomplete");
  }
  if (!Object.prototype.hasOwnProperty.call(rawFacts, "strategyId")
    || !Object.prototype.hasOwnProperty.call(rawFacts, "actionId")
    || !isNullableMachineLabel(rawFacts.strategyId)
    || !isNullableMachineLabel(rawFacts.actionId)) {
    return safetyFailure("resolution_safety_incomplete");
  }

  const facts = Object.freeze({
    isHighRisk: rawFacts.isHighRisk,
    strategyId: rawFacts.strategyId,
    actionId: rawFacts.actionId,
    systemRoleSafetyReply: rawFacts.systemRoleSafetyReply,
    safetyModeActive: rawFacts.safetyModeActive,
    safeHarborModeActive: rawFacts.safeHarborModeActive || state?.safeHarborMode === true
  });
  const parentEvent = {
    safetyProvenance: parentProvenance,
    growthSafetyExcluded: parentProvenance?.excluded !== false
  };
  const sealed = sealGrowthSafetyProvenance(facts, parentEvent);
  if (sealed.excluded) return safetyFailure("resolution_safety_excluded");
  return { ok: true, facts };
}

function validateSealedSafeProvenance(provenance) {
  if (!isPlainObject(provenance) || provenance.excluded !== false) return false;
  // Let the existing Growth authority validate the parent seal instead of
  // duplicating its checksum implementation in this source-owner adapter.
  const child = sealGrowthSafetyProvenance(
    SAFE_PROVENANCE_VALIDATION_FACTS,
    { safetyProvenance: provenance, growthSafetyExcluded: false }
  );
  return child.complete === true
    && child.inheritedExcluded === false
    && child.excluded === false
    && child.parentSeal === provenance.seal;
}

function isCanonicalReflectionId(originType, value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 100) return false;
  const context = originType === "memory"
    ? { memoryId: value, resolutionId: "shared_understanding" }
    : { traceId: value, resolutionId: "shared_understanding" };
  const identity = createGrowthEvidenceIdentity("reflection", context);
  if (!identity.ok) return false;
  const normalized = originType === "memory"
    ? identity.identity.context.memoryId
    : identity.identity.context.traceId;
  return normalized === value;
}

function hasConsumedReflectionRoot(growth, rootContextKey) {
  const consumed = growth.consumedRootKeys;
  const evidence = growth.evidence;
  const roots = growth.coverage?.rootsBySourceType?.reflection;
  if (!Array.isArray(consumed) || !Array.isArray(evidence) || !Array.isArray(roots)) {
    return true;
  }
  return consumed.includes(rootContextKey)
    || roots.includes(rootContextKey)
    || evidence.some((detail) => detail?.rootContextKey === rootContextKey);
}

function isNullableMachineLabel(value) {
  return value === null
    || (typeof value === "string" && value.length <= 80 && MACHINE_LABEL_PATTERN.test(value));
}

function normalizePositiveTimestamp(value) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ownerFailure(reason) {
  return Object.freeze({
    ok: false,
    reason,
    originType: null,
    originId: null,
    rootContextKey: null,
    writeInput: null
  });
}

function sourceFailure(reason) {
  return Object.freeze({
    ok: false,
    reason,
    originType: null,
    originId: null,
    safetyProvenance: null
  });
}

function safetyFailure(reason) {
  return Object.freeze({ ok: false, reason, facts: null });
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach((child) => deepFreeze(child));
  return value;
}
