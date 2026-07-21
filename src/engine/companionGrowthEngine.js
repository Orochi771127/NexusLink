import { isKnownCompanionId } from "../data/companionRegistry.js";

export const COMPANION_GROWTH_SOURCE_TYPES = Object.freeze([
  "care",
  "exploration",
  "reflection",
  "standoff",
  "chapter",
  "boundary",
  "recovery"
]);

export const COMPANION_GROWTH_TENDENCIES = Object.freeze([
  "attunement",
  "boundary_respect",
  "pathfinding",
  "steadfastness"
]);

export const COMPANION_GROWTH_STANDOFF_OUTCOMES = Object.freeze([
  "stabilized",
  "recovered",
  "retreated",
  "overwhelmed_but_safe"
]);

export const COMPANION_GROWTH_CONSENT_KINDS = Object.freeze([
  "respected_rewrite",
  "boundary_respected",
  "regulation_completed",
  "repair_completed"
]);

export const COMPANION_GROWTH_WILLINGNESS = Object.freeze({
  WILLING: "willing",
  REWRITE: "rewrite",
  NOT_YET: "not_yet"
});

export const COMPANION_GROWTH_FATIGUE_KINDS = Object.freeze([
  "touch",
  "regulation"
]);

export const COMPANION_GROWTH_FATIGUE_STATES = Object.freeze([
  "regulated",
  "overfatigued"
]);

export const COMPANION_GROWTH_BOUNDARY_STATES = Object.freeze([
  "clear",
  "repaired",
  "unresolved"
]);

export const COMPANION_GROWTH_COMPANION_INTENTS = Object.freeze([
  "accept",
  "rewrite",
  "defer"
]);

export const COMPANION_GROWTH_CHAPTER_RHYTHMS = Object.freeze([
  "open",
  "hold"
]);

export const COMPANION_GROWTH_REEVALUATION_KINDS = Object.freeze([
  "new_completed_context",
  "regulation_completed",
  "repair_completed"
]);

export const MAX_GROWTH_EVIDENCE_DETAILS = 24;
export const MAX_GROWTH_ROOTS_PER_WINDOW = 24;
export const MAX_GROWTH_CONSUMED_ROOTS = 48;

const EVENT_VERSION = 1;
const SAFETY_PROVENANCE_VERSION = 1;
const STAGES = Object.freeze([
  "initial_awakened",
  "resonant_mature",
  "final_awakened"
]);
const SOURCE_TYPE_SET = new Set(COMPANION_GROWTH_SOURCE_TYPES);
const TENDENCY_SET = new Set(COMPANION_GROWTH_TENDENCIES);
const CONSENT_KIND_SET = new Set(COMPANION_GROWTH_CONSENT_KINDS);
const FATIGUE_KIND_SET = new Set(COMPANION_GROWTH_FATIGUE_KINDS);
const FATIGUE_STATE_SET = new Set(COMPANION_GROWTH_FATIGUE_STATES);
const BOUNDARY_STATE_SET = new Set(COMPANION_GROWTH_BOUNDARY_STATES);
const COMPANION_INTENT_SET = new Set(COMPANION_GROWTH_COMPANION_INTENTS);
const CHAPTER_RHYTHM_SET = new Set(COMPANION_GROWTH_CHAPTER_RHYTHMS);
const REEVALUATION_KIND_SET = new Set(COMPANION_GROWTH_REEVALUATION_KINDS);

const REQUIRED_FAMILY_COUNT = Object.freeze({
  resonant_mature: 3,
  final_awakened: 4
});

const SOURCE_TYPE_ALIASES = createAliasMap({
  care: ["care", "care_practice", "companion_care"],
  exploration: ["exploration", "explore", "map_exploration"],
  reflection: ["reflection", "reflect", "memory_reflection"],
  standoff: ["standoff", "emotional_standoff", "confrontation"],
  chapter: ["chapter", "chapter_moment", "story_chapter"],
  boundary: ["boundary", "boundary_respected", "boundary_respect"],
  recovery: ["recovery", "repair", "repair_recovery"]
});

const TENDENCY_ALIASES = createAliasMap({
  attunement: ["attunement", "co_breath", "co_breathing", "resonance"],
  boundary_respect: ["boundary_respect", "respect_boundary", "guarding_boundary"],
  pathfinding: ["pathfinding", "path_finding", "wayfinding"],
  steadfastness: ["steadfastness", "steadfast", "holding_light"]
});

const STANDOFF_OUTCOME_ALIASES = createAliasMap({
  stabilized: ["stabilized", "stability", "steady"],
  recovered: ["recovered", "restored", "recovery"],
  retreated: ["retreated", "withdrawn", "stepped_back"],
  overwhelmed_but_safe: [
    "overwhelmed_but_safe",
    "safe_overwhelm",
    "overwhelmed_safe"
  ]
});

/**
 * Normalize a source-owner alias to the fixed seven-family contract.
 * Unknown values fail closed instead of creating a new ad-hoc family.
 */
export function normalizeGrowthSourceType(value) {
  return SOURCE_TYPE_ALIASES.get(normalizeAlias(value)) || null;
}

/** Normalize a presentation alias to one of the four qualitative tendencies. */
export function normalizeGrowthTendency(value) {
  return TENDENCY_ALIASES.get(normalizeAlias(value)) || null;
}

/**
 * Seal the safety facts captured when a source event is created.
 *
 * All safety booleans and strategy/action slots must be explicit. Missing or
 * malformed provenance is excluded. Descendants inherit an excluded parent
 * and cannot clear it after a queued/deferred flush.
 */
export function sealGrowthSafetyProvenance(rawSafety = {}, parentEvent = null) {
  const source = isPlainObject(rawSafety) ? rawSafety : {};
  const parent = parentEvent?.safetyProvenance;
  const parentValid = parentEvent === null || validateSafetyProvenance(parent);
  const hasExplicitSignals = [
    "isHighRisk",
    "systemRoleSafetyReply",
    "safetyModeActive",
    "safeHarborModeActive"
  ].every((field) => typeof source[field] === "boolean")
    && hasOwn(source, "strategyId")
    && hasOwn(source, "actionId")
    && isNullableMachineLabel(source.strategyId)
    && isNullableMachineLabel(source.actionId);
  const complete = hasExplicitSignals && parentValid;
  const inheritedExcluded = parentEvent === null
    ? false
    : !parentValid || parentEvent.growthSafetyExcluded !== false || parent?.excluded !== false;
  const strategyId = normalizeNullableMachineLabel(source.strategyId);
  const actionId = normalizeNullableMachineLabel(source.actionId);
  const excluded = !complete
    || inheritedExcluded
    || source.isHighRisk === true
    || strategyId === "safety_redirect"
    || actionId === "enter_safe_harbor"
    || source.systemRoleSafetyReply === true
    || source.safetyModeActive === true
    || source.safeHarborModeActive === true;
  const parentSeal = parentValid && parent ? parent.seal : null;
  const values = {
    version: SAFETY_PROVENANCE_VERSION,
    complete,
    isHighRisk: source.isHighRisk === true,
    strategyId,
    actionId,
    systemRoleSafetyReply: source.systemRoleSafetyReply === true,
    safetyModeActive: source.safetyModeActive === true,
    safeHarborModeActive: source.safeHarborModeActive === true,
    inheritedExcluded,
    parentSeal,
    excluded
  };
  return Object.freeze({ ...values, seal: createSafetySeal(values) });
}

/**
 * Build the deterministic key, root and source id for a completed domain event.
 */
export function createGrowthEvidenceIdentity(sourceTypeInput, rawContext = {}) {
  const sourceType = normalizeGrowthSourceType(sourceTypeInput);
  if (!sourceType) return identityFailure("unknown_source_type");
  if (!isPlainObject(rawContext)) return identityFailure("invalid_context");

  const context = rawContext;
  switch (sourceType) {
    case "care": {
      const chapterNo = normalizeChapterNo(context.chapterNo);
      const originEventId = normalizeContextId(context.originEventId);
      const practiceId = normalizeContextId(context.practiceId);
      if (!chapterNo || !originEventId || !practiceId) return identityFailure("invalid_care_context");
      return identitySuccess(sourceType, {
        chapterNo,
        originEventId,
        practiceId
      }, `care:${chapterNo}:${originEventId}:${practiceId}`, `care:${chapterNo}:${originEventId}`, `${originEventId}:${practiceId}`);
    }
    case "exploration": {
      const chapterNo = normalizeChapterNo(context.chapterNo);
      const nodeId = normalizeContextId(context.nodeId);
      const choiceId = normalizeContextId(context.choiceId);
      if (!chapterNo || !nodeId || !choiceId) return identityFailure("invalid_exploration_context");
      return identitySuccess(sourceType, {
        chapterNo,
        nodeId,
        choiceId
      }, `exploration:${chapterNo}:${nodeId}:${choiceId}`, `exploration:${chapterNo}:${nodeId}`, `${nodeId}:${choiceId}`);
    }
    case "reflection": {
      const memoryId = normalizeContextId(context.memoryId, 100);
      const traceId = normalizeContextId(context.traceId, 100);
      const resolutionId = normalizeContextId(context.resolutionId);
      if (Boolean(memoryId) === Boolean(traceId) || !resolutionId) {
        return identityFailure("invalid_reflection_context");
      }
      const originId = memoryId || traceId;
      return identitySuccess(sourceType, {
        memoryId,
        traceId,
        resolutionId
      }, `reflection:${originId}:${resolutionId}`, `reflection:${originId}`, `${originId}:${resolutionId}`);
    }
    case "standoff": {
      const chapterNo = normalizeChapterNo(context.chapterNo);
      const nodeId = normalizeContextId(context.nodeId);
      const outcomeFamily = STANDOFF_OUTCOME_ALIASES.get(normalizeAlias(context.outcomeFamily)) || null;
      if (!chapterNo || !nodeId || !outcomeFamily) return identityFailure("invalid_standoff_context");
      return identitySuccess(sourceType, {
        chapterNo,
        nodeId,
        outcomeFamily
      }, `standoff:${chapterNo}:${nodeId}:${outcomeFamily}`, `standoff:${chapterNo}:${nodeId}`, `${nodeId}:${outcomeFamily}`);
    }
    case "chapter": {
      const chapterNo = normalizeChapterNo(context.chapterNo);
      const eventId = normalizeContextId(context.eventId);
      const branchFamily = normalizeContextId(context.branchFamily);
      if (!chapterNo || !eventId || !branchFamily) return identityFailure("invalid_chapter_context");
      return identitySuccess(sourceType, {
        chapterNo,
        eventId,
        branchFamily
      }, `chapter:${chapterNo}:${eventId}:${branchFamily}`, `chapter:${chapterNo}:${eventId}`, `${eventId}:${branchFamily}`);
    }
    case "boundary": {
      const originKey = normalizeImmutableOriginKey(context.originKey);
      if (!originKey) return identityFailure("invalid_boundary_context");
      return identitySuccess(sourceType, { originKey }, `boundary:${originKey}:respected`, originKey, `${originKey}:respected`);
    }
    case "recovery": {
      const originKey = normalizeImmutableOriginKey(context.originKey);
      if (!originKey) return identityFailure("invalid_recovery_context");
      return identitySuccess(sourceType, { originKey }, `recovery:${originKey}:completed`, originKey, `${originKey}:completed`);
    }
    default:
      return identityFailure("unknown_source_type");
  }
}

/**
 * Create a frozen source-owner event. This is deliberately not an evidence
 * write: excluded events remain representable so a delayed writer can reject
 * them from their sealed origin facts.
 */
export function createCompletedGrowthEvent(input = {}) {
  if (!isPlainObject(input)) return eventFailure("invalid_event_input");
  if (input.completed !== true || input.completionStatus !== "completed") {
    return eventFailure("event_not_completed");
  }
  if (!isKnownCompanionId(input.companionId)) return eventFailure("unknown_companion");

  const sourceType = normalizeGrowthSourceType(input.sourceType);
  const tendency = normalizeGrowthTendency(input.tendency);
  if (!sourceType) return eventFailure("unknown_source_type");
  if (!tendency) return eventFailure("unknown_tendency");

  const identityResult = createGrowthEvidenceIdentity(sourceType, input.context);
  if (!identityResult.ok) return eventFailure(identityResult.reason);
  const createdAt = normalizePositiveTimestamp(input.createdAt);
  if (!createdAt) return eventFailure("invalid_created_at");

  const memoryId = normalizeOptionalReference(
    input.memoryId ?? identityResult.identity.context.memoryId
  );
  const traceId = normalizeOptionalReference(
    input.traceId ?? identityResult.identity.context.traceId
  );
  if ((input.memoryId != null && !memoryId) || (input.traceId != null && !traceId)) {
    return eventFailure("invalid_reference_id");
  }

  const consentKind = deriveConsentKind(sourceType, input.consentKind);
  if (input.consentKind != null && !consentKind) return eventFailure("invalid_consent_kind");
  const safetyProvenance = sealGrowthSafetyProvenance(input.safetyProvenance, input.parentEvent ?? null);
  const identity = identityResult.identity;
  const event = deepFreeze({
    eventVersion: EVENT_VERSION,
    completed: true,
    completionStatus: "completed",
    companionId: input.companionId,
    sourceType,
    tendency,
    context: identity.context,
    key: identity.key,
    rootContextKey: identity.rootContextKey,
    sourceId: identity.sourceId,
    chapterNo: identity.context.chapterNo || normalizeChapterNo(input.chapterNo),
    memoryId,
    traceId,
    createdAt,
    consentAnchorObserved: Boolean(consentKind),
    consentKind,
    safetyProvenance,
    growthSafetyExcluded: safetyProvenance.excluded
  });
  return Object.freeze({ ok: true, reason: "event_created", event });
}

/**
 * Pure per-companion evidence writer.
 *
 * It never advances a stage or creates an offer (G4 ownership). The returned
 * growth object is new only when a root or consent anchor is accepted.
 */
export function writeCompanionGrowthEvidence({ growth, companionId, event } = {}) {
  const growthInspection = inspectGrowth(growth, companionId);
  if (!growthInspection.ok) return writeFailure(growth, growthInspection.reason);

  const eventInspection = inspectEvent(event, companionId);
  if (!eventInspection.ok) return writeFailure(growth, eventInspection.reason, event);
  if (event.growthSafetyExcluded !== false) return writeFailure(growth, "safety_excluded", event);
  if (growth.coverage.targetStage === null) return writeFailure(growth, "final_stage_complete", event);
  if (event.createdAt < growth.coverage.windowOpenedAt) {
    return writeFailure(growth, "event_before_target_window", event);
  }

  const currentRoots = flattenCoverageRoots(growth.coverage.rootsBySourceType);
  const currentRootSet = new Set(currentRoots);
  const consumedRootSet = new Set(growth.consumedRootKeys);
  const duplicateKey = growth.evidence.some((detail) => detail.key === event.key);
  if (duplicateKey) return writeFailure(growth, "duplicate_key", event);

  if (currentRootSet.has(event.rootContextKey)) {
    if (event.consentAnchorObserved && !growth.coverage.consentAnchorRootKey) {
      const nextGrowth = cloneGrowthWith(growth, {
        coverage: {
          ...cloneCoverage(growth.coverage),
          consentAnchorRootKey: event.rootContextKey
        },
        lastGrowthEventAt: maxTimestamp(growth.lastGrowthEventAt, event.createdAt)
      });
      return writeSuccess(nextGrowth, event, {
        reason: "consent_anchor_observed",
        evidenceAdded: false,
        rootAccepted: false,
        anchorAccepted: true
      });
    }
    return writeFailure(growth, "duplicate_root", event);
  }

  if (consumedRootSet.has(event.rootContextKey)) {
    return writeFailure(growth, "consumed_root", event);
  }
  if (currentRoots.length >= MAX_GROWTH_ROOTS_PER_WINDOW) {
    return writeFailure(growth, "window_root_capacity", event);
  }
  if (growth.consumedRootKeys.length >= MAX_GROWTH_CONSUMED_ROOTS) {
    return writeFailure(growth, "consumed_root_capacity", event);
  }

  const currentFamilyCount = countCoveredFamilies(growth.coverage.rootsBySourceType);
  const requiredFamilyCount = REQUIRED_FAMILY_COUNT[growth.coverage.targetStage];
  const isNewFamily = growth.coverage.rootsBySourceType[event.sourceType].length === 0;
  const suppliesAnchor = event.consentAnchorObserved && !growth.coverage.consentAnchorRootKey;
  const missingFamiliesAfter = Math.max(
    0,
    requiredFamilyCount - currentFamilyCount - (isNewFamily ? 1 : 0)
  );
  const missingAnchorAfter = growth.coverage.consentAnchorRootKey || suppliesAnchor ? 0 : 1;
  const reservedSlotsAfter = missingFamiliesAfter + missingAnchorAfter;
  if (currentRoots.length + 1 > MAX_GROWTH_ROOTS_PER_WINDOW - reservedSlotsAfter) {
    return writeFailure(growth, "reserved_readiness_capacity", event);
  }

  const nextRootsBySourceType = cloneRootsBySourceType(growth.coverage.rootsBySourceType);
  nextRootsBySourceType[event.sourceType] = sortedUnique([
    ...nextRootsBySourceType[event.sourceType],
    event.rootContextKey
  ]);
  const nextAnchor = growth.coverage.consentAnchorRootKey
    || (suppliesAnchor ? event.rootContextKey : null);
  const detail = createEvidenceDetail(event);
  const compacted = compactEvidenceDetails(
    [...growth.evidence, detail],
    nextAnchor
  );
  const nextGrowth = cloneGrowthWith(growth, {
    evidence: compacted.evidence,
    coverage: {
      ...cloneCoverage(growth.coverage),
      rootsBySourceType: nextRootsBySourceType,
      consentAnchorRootKey: nextAnchor
    },
    consumedRootKeys: sortedUnique([
      ...growth.consumedRootKeys,
      event.rootContextKey
    ]).slice(0, MAX_GROWTH_CONSUMED_ROOTS),
    lastGrowthEventAt: maxTimestamp(growth.lastGrowthEventAt, event.createdAt)
  });

  return writeSuccess(nextGrowth, event, {
    reason: compacted.evidenceAdded
      ? (compacted.compacted ? "evidence_recorded_compacted" : "evidence_recorded")
      : "coverage_recorded_detail_omitted",
    evidenceAdded: compacted.evidenceAdded,
    rootAccepted: true,
    anchorAccepted: suppliesAnchor
  });
}

/** Evaluate current-window readiness without consulting bond, defense or time. */
export function evaluateCompanionGrowthReadiness({
  growth,
  companionId,
  chapterNo,
  profile
} = {}) {
  const inspection = inspectGrowth(growth, companionId);
  if (!inspection.ok) return readinessFailure(inspection.reason, null, companionId);
  const targetStage = growth.coverage.targetStage;
  if (!targetStage) return readinessFailure("final_stage_complete", null, companionId);

  const currentChapterNo = normalizeChapterNo(chapterNo);
  const minimumChapterNo = normalizeMinimumChapter(profile, targetStage);
  if (!currentChapterNo || !minimumChapterNo) {
    return readinessFailure("invalid_chapter_gate", targetStage, companionId);
  }

  const families = COMPANION_GROWTH_SOURCE_TYPES.filter(
    (sourceType) => growth.coverage.rootsBySourceType[sourceType].length > 0
  );
  const requiredFamilyCount = REQUIRED_FAMILY_COUNT[targetStage];
  const consentAnchorObserved = Boolean(growth.coverage.consentAnchorRootKey);
  const familyReady = families.length >= requiredFamilyCount;
  const chapterReady = currentChapterNo >= minimumChapterNo;
  const ready = familyReady && consentAnchorObserved && chapterReady;
  const reason = !familyReady
    ? "source_family_diversity_incomplete"
    : !consentAnchorObserved
      ? "consent_anchor_missing"
      : !chapterReady
        ? "chapter_minimum_not_met"
        : "ready";

  return Object.freeze({
    integrityOk: true,
    companionId,
    ready,
    reason,
    targetStage,
    families: Object.freeze([...families]),
    familyCount: families.length,
    requiredFamilyCount,
    consentAnchorObserved,
    currentChapterNo,
    minimumChapterNo
  });
}

/**
 * Evaluate the companion's typed willingness separately from readiness.
 * Numeric bond/defense and wall-clock values are intentionally not read.
 */
export function evaluateCompanionGrowthWillingness({
  growth,
  companionId,
  readiness,
  context
} = {}) {
  const inspection = inspectGrowth(growth, companionId);
  if (!inspection.ok) return willingnessResult("not_yet", inspection.reason);
  if (!readiness?.integrityOk || readiness.ready !== true) {
    return willingnessResult("not_yet", "readiness_incomplete");
  }
  if (!isReadinessCurrent(readiness, growth, companionId)) {
    return willingnessResult("not_yet", "readiness_stale_or_mismatched");
  }
  if (!isPlainObject(context)) return willingnessResult("not_yet", "invalid_willingness_context");
  if (context.growthSafetyExcluded !== false || !validateSafetyProvenance(context.safetyProvenance)) {
    return willingnessResult("not_yet", "safety_provenance_invalid");
  }
  if (context.safetyProvenance.excluded !== false) {
    return willingnessResult("not_yet", "safety_excluded");
  }

  const fatigueKind = context.fatigue?.kind;
  const fatigueState = context.fatigue?.state;
  if (!FATIGUE_KIND_SET.has(fatigueKind) || !FATIGUE_STATE_SET.has(fatigueState)) {
    return willingnessResult("not_yet", "invalid_typed_fatigue");
  }
  if (fatigueState === "overfatigued") {
    return willingnessResult("not_yet", "typed_overfatigue");
  }
  if (!BOUNDARY_STATE_SET.has(context.boundaryState)) {
    return willingnessResult("not_yet", "invalid_boundary_state");
  }
  if (context.boundaryState === "unresolved") {
    return willingnessResult("not_yet", "boundary_unresolved");
  }
  if (!CHAPTER_RHYTHM_SET.has(context.chapterRhythm)) {
    return willingnessResult("not_yet", "invalid_chapter_rhythm");
  }
  if (context.chapterRhythm === "hold") {
    return willingnessResult("not_yet", "chapter_rhythm_hold");
  }
  if (!COMPANION_INTENT_SET.has(context.companionIntent)) {
    return willingnessResult("not_yet", "invalid_companion_intent");
  }

  if (growth.deferredAt !== null) {
    const reevaluationKind = context.reevaluation?.kind;
    const reevaluationRootKey = normalizeImmutableOriginKey(context.reevaluation?.rootContextKey);
    const reevaluationEvent = context.reevaluation?.event;
    const eventInspection = inspectEvent(reevaluationEvent, companionId);
    const currentRoots = new Set(flattenCoverageRoots(growth.coverage.rootsBySourceType));
    if (
      !REEVALUATION_KIND_SET.has(reevaluationKind)
      || !reevaluationRootKey
      || !eventInspection.ok
      || reevaluationEvent.rootContextKey !== reevaluationRootKey
      || reevaluationEvent.createdAt <= growth.deferredAt
      || reevaluationEvent.growthSafetyExcluded !== false
      || !currentRoots.has(reevaluationRootKey)
    ) {
      return willingnessResult("not_yet", "awaiting_new_context");
    }
  }

  if (context.companionIntent === "defer") {
    return willingnessResult("not_yet", "companion_deferred");
  }
  if (context.companionIntent === "rewrite") {
    return willingnessResult("rewrite", "companion_rewrites_ritual");
  }
  return willingnessResult("willing", "companion_willing");
}

function inspectGrowth(growth, companionId) {
  if (!isKnownCompanionId(companionId)) return { ok: false, reason: "unknown_companion" };
  if (!isPlainObject(growth) || !STAGES.includes(growth.stage)) {
    return { ok: false, reason: "invalid_growth_state" };
  }
  const expectedTarget = getNextStage(growth.stage);
  if (!isPlainObject(growth.coverage) || growth.coverage.targetStage !== expectedTarget) {
    return { ok: false, reason: "invalid_growth_coverage" };
  }
  if (!normalizePositiveTimestamp(growth.coverage.windowOpenedAt)) {
    return { ok: false, reason: "invalid_growth_window" };
  }
  if (!isPlainObject(growth.coverage.rootsBySourceType)) {
    return { ok: false, reason: "invalid_growth_roots" };
  }

  const allRoots = [];
  for (const sourceType of COMPANION_GROWTH_SOURCE_TYPES) {
    const roots = growth.coverage.rootsBySourceType[sourceType];
    if (!isValidUniqueRootList(roots, MAX_GROWTH_ROOTS_PER_WINDOW)) {
      return { ok: false, reason: "invalid_growth_roots" };
    }
    allRoots.push(...roots);
  }
  if (allRoots.length > MAX_GROWTH_ROOTS_PER_WINDOW || new Set(allRoots).size !== allRoots.length) {
    return { ok: false, reason: "invalid_growth_roots" };
  }

  const consentAnchor = growth.coverage.consentAnchorRootKey;
  if (consentAnchor !== null && (!isValidRootKey(consentAnchor) || !allRoots.includes(consentAnchor))) {
    return { ok: false, reason: "invalid_consent_anchor" };
  }
  if (!isValidUniqueRootList(growth.consumedRootKeys, MAX_GROWTH_CONSUMED_ROOTS)) {
    return { ok: false, reason: "invalid_consumed_roots" };
  }
  if (allRoots.some((root) => !growth.consumedRootKeys.includes(root))) {
    return { ok: false, reason: "unconsumed_coverage_root" };
  }
  if (!Array.isArray(growth.evidence) || growth.evidence.length > MAX_GROWTH_EVIDENCE_DETAILS) {
    return { ok: false, reason: "invalid_evidence_details" };
  }

  const seenKeys = new Set();
  const seenDetailRoots = new Set();
  for (const detail of growth.evidence) {
    if (!isValidEvidenceDetail(detail, companionId)) {
      return { ok: false, reason: "invalid_evidence_details" };
    }
    if (seenKeys.has(detail.key) || seenDetailRoots.has(detail.rootContextKey)) {
      return { ok: false, reason: "duplicate_evidence_details" };
    }
    if (!growth.consumedRootKeys.includes(detail.rootContextKey)) {
      return { ok: false, reason: "unconsumed_evidence_root" };
    }
    seenKeys.add(detail.key);
    seenDetailRoots.add(detail.rootContextKey);
  }

  if (growth.deferredAt !== null && !normalizePositiveTimestamp(growth.deferredAt)) {
    return { ok: false, reason: "invalid_deferred_at" };
  }
  if (growth.lastGrowthEventAt !== null && !normalizePositiveTimestamp(growth.lastGrowthEventAt)) {
    return { ok: false, reason: "invalid_last_growth_event_at" };
  }
  return { ok: true, reason: "growth_valid" };
}

function inspectEvent(event, companionId) {
  if (!isPlainObject(event) || event.eventVersion !== EVENT_VERSION) {
    return { ok: false, reason: "invalid_event" };
  }
  if (event.completed !== true || event.completionStatus !== "completed") {
    return { ok: false, reason: "event_not_completed" };
  }
  if (event.companionId !== companionId) return { ok: false, reason: "companion_mismatch" };
  if (!SOURCE_TYPE_SET.has(event.sourceType) || !TENDENCY_SET.has(event.tendency)) {
    return { ok: false, reason: "noncanonical_event_enum" };
  }
  const identityResult = createGrowthEvidenceIdentity(event.sourceType, event.context);
  if (!identityResult.ok) return { ok: false, reason: identityResult.reason };
  const identity = identityResult.identity;
  if (
    event.key !== identity.key
    || event.rootContextKey !== identity.rootContextKey
    || event.sourceId !== identity.sourceId
  ) {
    return { ok: false, reason: "event_identity_mismatch" };
  }
  if (!normalizePositiveTimestamp(event.createdAt)) return { ok: false, reason: "invalid_created_at" };
  if (!validateSafetyProvenance(event.safetyProvenance)) {
    return { ok: false, reason: "safety_provenance_invalid" };
  }
  if (event.growthSafetyExcluded !== event.safetyProvenance.excluded) {
    return { ok: false, reason: "safety_provenance_mismatch" };
  }
  const expectedConsentKind = deriveConsentKind(event.sourceType, event.consentKind);
  if (event.consentKind !== expectedConsentKind) {
    return { ok: false, reason: "consent_provenance_invalid" };
  }
  if (event.consentAnchorObserved !== Boolean(expectedConsentKind)) {
    return { ok: false, reason: "consent_provenance_mismatch" };
  }
  if (!isNullableReference(event.memoryId) || !isNullableReference(event.traceId)) {
    return { ok: false, reason: "invalid_reference_id" };
  }
  return { ok: true, reason: "event_valid" };
}

function validateSafetyProvenance(provenance) {
  if (!isPlainObject(provenance) || provenance.version !== SAFETY_PROVENANCE_VERSION) return false;
  if (
    typeof provenance.complete !== "boolean"
    || typeof provenance.isHighRisk !== "boolean"
    || typeof provenance.systemRoleSafetyReply !== "boolean"
    || typeof provenance.safetyModeActive !== "boolean"
    || typeof provenance.safeHarborModeActive !== "boolean"
    || typeof provenance.inheritedExcluded !== "boolean"
    || typeof provenance.excluded !== "boolean"
    || !isNullableMachineLabel(provenance.strategyId)
    || !isNullableMachineLabel(provenance.actionId)
    || !isNullableSeal(provenance.parentSeal)
  ) return false;
  const expectedExcluded = !provenance.complete
    || provenance.inheritedExcluded
    || provenance.isHighRisk
    || provenance.strategyId === "safety_redirect"
    || provenance.actionId === "enter_safe_harbor"
    || provenance.systemRoleSafetyReply
    || provenance.safetyModeActive
    || provenance.safeHarborModeActive;
  if (provenance.excluded !== expectedExcluded) return false;
  const values = {
    version: provenance.version,
    complete: provenance.complete,
    isHighRisk: provenance.isHighRisk,
    strategyId: provenance.strategyId,
    actionId: provenance.actionId,
    systemRoleSafetyReply: provenance.systemRoleSafetyReply,
    safetyModeActive: provenance.safetyModeActive,
    safeHarborModeActive: provenance.safeHarborModeActive,
    inheritedExcluded: provenance.inheritedExcluded,
    parentSeal: provenance.parentSeal,
    excluded: provenance.excluded
  };
  return provenance.seal === createSafetySeal(values);
}

function createSafetySeal(values) {
  const serialized = [
    values.version,
    values.complete ? 1 : 0,
    values.isHighRisk ? 1 : 0,
    values.strategyId || "-",
    values.actionId || "-",
    values.systemRoleSafetyReply ? 1 : 0,
    values.safetyModeActive ? 1 : 0,
    values.safeHarborModeActive ? 1 : 0,
    values.inheritedExcluded ? 1 : 0,
    values.parentSeal || "-",
    values.excluded ? 1 : 0
  ].join("|");
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `gsp1_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function createEvidenceDetail(event) {
  return {
    key: event.key,
    rootContextKey: event.rootContextKey,
    companionId: event.companionId,
    tendency: event.tendency,
    sourceType: event.sourceType,
    sourceId: event.sourceId,
    chapterNo: event.chapterNo || null,
    memoryId: event.memoryId,
    traceId: event.traceId,
    createdAt: event.createdAt,
    growthSafetyExcluded: false,
    legacyAttributed: false
  };
}

function compactEvidenceDetails(details, consentAnchorRootKey) {
  const sorted = [...details].sort(compareEvidence);
  const incomingKey = details[details.length - 1]?.key;
  if (sorted.length <= MAX_GROWTH_EVIDENCE_DETAILS) {
    return { evidence: sorted, compacted: false, evidenceAdded: true };
  }

  const counts = new Map();
  for (const detail of sorted) {
    counts.set(detail.sourceType, (counts.get(detail.sourceType) || 0) + 1);
  }
  const candidates = sorted.filter((detail) => (
    !detail.memoryId
    && !detail.traceId
    && detail.rootContextKey !== consentAnchorRootKey
    && (counts.get(detail.sourceType) || 0) > 1
  ));
  if (candidates.length === 0) {
    const withoutIncoming = sorted.filter((detail) => detail.key !== incomingKey);
    return {
      evidence: withoutIncoming.slice(-MAX_GROWTH_EVIDENCE_DETAILS),
      compacted: true,
      evidenceAdded: false
    };
  }
  const removeKey = candidates[0].key;
  const compacted = sorted.filter((detail) => detail.key !== removeKey);
  return {
    evidence: compacted.slice(-MAX_GROWTH_EVIDENCE_DETAILS),
    compacted: true,
    evidenceAdded: removeKey !== incomingKey
  };
}

function isValidEvidenceDetail(detail, companionId) {
  return isPlainObject(detail)
    && detail.companionId === companionId
    && SOURCE_TYPE_SET.has(detail.sourceType)
    && TENDENCY_SET.has(detail.tendency)
    && isValidBoundedText(detail.key, 180)
    && isValidRootKey(detail.rootContextKey)
    && isValidBoundedText(detail.sourceId, 160)
    && normalizePositiveTimestamp(detail.createdAt) === detail.createdAt
    && detail.growthSafetyExcluded === false
    && detail.legacyAttributed === false
    && (detail.chapterNo === null || normalizeChapterNo(detail.chapterNo) === detail.chapterNo)
    && isNullableReference(detail.memoryId)
    && isNullableReference(detail.traceId);
}

function normalizeMinimumChapter(profile, targetStage) {
  const value = profile?.minimumChapterByStage?.[targetStage];
  return normalizeChapterNo(value);
}

function readinessFailure(reason, targetStage = null, companionId = null) {
  return Object.freeze({
    integrityOk: false,
    companionId: isKnownCompanionId(companionId) ? companionId : null,
    ready: false,
    reason,
    targetStage,
    families: Object.freeze([]),
    familyCount: 0,
    requiredFamilyCount: targetStage ? REQUIRED_FAMILY_COUNT[targetStage] : null,
    consentAnchorObserved: false,
    currentChapterNo: null,
    minimumChapterNo: null
  });
}

function isReadinessCurrent(readiness, growth, companionId) {
  if (!isPlainObject(readiness) || readiness.companionId !== companionId) return false;
  if (readiness.targetStage !== growth.coverage.targetStage) return false;
  const families = COMPANION_GROWTH_SOURCE_TYPES.filter(
    (sourceType) => growth.coverage.rootsBySourceType[sourceType].length > 0
  );
  const currentChapterNo = normalizeChapterNo(readiness.currentChapterNo);
  const minimumChapterNo = normalizeChapterNo(readiness.minimumChapterNo);
  return Array.isArray(readiness.families)
    && readiness.families.length === families.length
    && readiness.families.every((sourceType, index) => sourceType === families[index])
    && readiness.familyCount === families.length
    && readiness.requiredFamilyCount === REQUIRED_FAMILY_COUNT[growth.coverage.targetStage]
    && readiness.consentAnchorObserved === Boolean(growth.coverage.consentAnchorRootKey)
    && currentChapterNo === readiness.currentChapterNo
    && minimumChapterNo === readiness.minimumChapterNo
    && currentChapterNo >= minimumChapterNo;
}

function willingnessResult(state, reason) {
  return Object.freeze({
    state,
    reason,
    canProceed: state === COMPANION_GROWTH_WILLINGNESS.WILLING
      || state === COMPANION_GROWTH_WILLINGNESS.REWRITE
  });
}

function writeFailure(growth, reason, event = null) {
  return Object.freeze({
    growth,
    result: Object.freeze({
      accepted: false,
      changed: false,
      reason,
      evidenceAdded: false,
      rootAccepted: false,
      anchorAccepted: false,
      key: event?.key || null,
      rootContextKey: event?.rootContextKey || null
    })
  });
}

function writeSuccess(growth, event, {
  reason,
  evidenceAdded,
  rootAccepted,
  anchorAccepted
}) {
  return Object.freeze({
    growth,
    result: Object.freeze({
      accepted: true,
      changed: true,
      reason,
      evidenceAdded,
      rootAccepted,
      anchorAccepted,
      key: event.key,
      rootContextKey: event.rootContextKey
    })
  });
}

function cloneGrowthWith(growth, patch) {
  return {
    ...growth,
    evidence: patch.evidence ?? [...growth.evidence],
    coverage: patch.coverage ?? cloneCoverage(growth.coverage),
    consumedRootKeys: patch.consumedRootKeys ?? [...growth.consumedRootKeys],
    lastGrowthEventAt: hasOwn(patch, "lastGrowthEventAt")
      ? patch.lastGrowthEventAt
      : growth.lastGrowthEventAt
  };
}

function cloneCoverage(coverage) {
  return {
    ...coverage,
    rootsBySourceType: cloneRootsBySourceType(coverage.rootsBySourceType)
  };
}

function cloneRootsBySourceType(rootsBySourceType) {
  return Object.fromEntries(COMPANION_GROWTH_SOURCE_TYPES.map((sourceType) => [
    sourceType,
    [...rootsBySourceType[sourceType]]
  ]));
}

function countCoveredFamilies(rootsBySourceType) {
  return COMPANION_GROWTH_SOURCE_TYPES.reduce(
    (count, sourceType) => count + (rootsBySourceType[sourceType].length > 0 ? 1 : 0),
    0
  );
}

function flattenCoverageRoots(rootsBySourceType) {
  return COMPANION_GROWTH_SOURCE_TYPES.flatMap((sourceType) => rootsBySourceType[sourceType]);
}

function deriveConsentKind(sourceType, requestedKind) {
  if (sourceType === "boundary") return requestedKind == null || requestedKind === "boundary_respected"
    ? "boundary_respected"
    : null;
  if (sourceType === "recovery") return requestedKind == null || requestedKind === "repair_completed"
    ? "repair_completed"
    : null;
  if (requestedKind == null) return null;
  return CONSENT_KIND_SET.has(requestedKind) ? requestedKind : null;
}

function getNextStage(stage) {
  const index = STAGES.indexOf(stage);
  return index >= 0 ? STAGES[index + 1] || null : null;
}

function identitySuccess(sourceType, context, key, rootContextKey, sourceId) {
  if (
    key.length > 180
    || rootContextKey.length > 180
    || sourceId.length > 160
    || !isValidRootKey(rootContextKey)
  ) return identityFailure("identity_too_long");
  return Object.freeze({
    ok: true,
    reason: "identity_created",
    identity: deepFreeze({ sourceType, context, key, rootContextKey, sourceId })
  });
}

function identityFailure(reason) {
  return Object.freeze({ ok: false, reason, identity: null });
}

function eventFailure(reason) {
  return Object.freeze({ ok: false, reason, event: null });
}

function normalizeAlias(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function createAliasMap(groups) {
  const aliases = new Map();
  for (const [canonical, values] of Object.entries(groups)) {
    for (const value of values) aliases.set(normalizeAlias(value), canonical);
  }
  return aliases;
}

function normalizeContextId(value, maxLength = 80) {
  const normalized = normalizeAlias(value);
  if (!normalized || normalized.length > maxLength) return null;
  return /^[a-z0-9][a-z0-9._]*$/.test(normalized) ? normalized : null;
}

function normalizeImmutableOriginKey(value) {
  if (typeof value !== "string") return null;
  const parts = value.trim().split(":");
  if (parts.length < 2) return null;
  const normalized = parts.map((part) => normalizeContextId(part, 80));
  if (normalized.some((part) => !part)) return null;
  const key = normalized.join(":");
  return key.length <= 150 ? key : null;
}

function normalizeChapterNo(value) {
  return Number.isInteger(value) && value >= 1 && value <= 7 ? value : null;
}

function normalizePositiveTimestamp(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function normalizeOptionalReference(value) {
  if (value == null) return null;
  return normalizeContextId(value, 120);
}

function normalizeNullableMachineLabel(value) {
  if (value === null) return null;
  return normalizeContextId(value, 64);
}

function isNullableMachineLabel(value) {
  return value === null || normalizeContextId(value, 64) === value;
}

function isNullableReference(value) {
  return value === null || normalizeContextId(value, 120) === value;
}

function isNullableSeal(value) {
  return value === null || (typeof value === "string" && /^gsp1_[0-9a-f]{8}$/.test(value));
}

function isValidUniqueRootList(value, limit) {
  return Array.isArray(value)
    && value.length <= limit
    && value.every(isValidRootKey)
    && new Set(value).size === value.length;
}

function isValidRootKey(value) {
  if (!isValidBoundedText(value, 180)) return false;
  const parts = value.split(":");
  return parts.length >= 2 && parts.every((part) => normalizeContextId(part, 80) === part);
}

function isValidBoundedText(value, maxLength) {
  return typeof value === "string"
    && value.length > 0
    && value.length <= maxLength
    && value.trim() === value;
}

function sortedUnique(values) {
  return [...new Set(values)].sort(compareText);
}

function compareEvidence(left, right) {
  return left.createdAt - right.createdAt || compareText(left.key, right.key);
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function maxTimestamp(left, right) {
  const normalizedLeft = normalizePositiveTimestamp(left);
  if (!normalizedLeft) return right;
  return Math.max(normalizedLeft, right);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const item of Object.values(value)) deepFreeze(item);
  return Object.freeze(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}
