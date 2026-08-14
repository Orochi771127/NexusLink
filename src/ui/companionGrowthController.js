import {
  createCompletedGrowthEvent,
  evaluateCompanionGrowthReadiness,
  evaluateCompanionGrowthWillingness,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../engine/companionGrowthEngine.js";
import {
  HEART_PHASE_COMPLETION,
  HEART_PHASE_PRACTICES,
  isCanonicalHeartPhaseResult
} from "../engine/companionGrowthSessionEngine.js";
import {
  createReflectionGrowthWriteInput,
  findReflectableCanonicalSource
} from "../engine/reflectionGrowthOwner.js";
import { decideFormalEvolutionTransition } from "../engine/companionFormalEvolutionTransitionEngine.js";

const GROWTH_PROFILE = Object.freeze({
  minimumChapterByStage: Object.freeze({
    resonant_mature: 2,
    final_awakened: 5
  })
});

const SOURCE_PRESENTATION = Object.freeze({
  care: "care",
  exploration: "exploration",
  reflection: "reflection",
  standoff: "standoff",
  chapter: "chapter",
  boundary: "boundary",
  recovery: "recovery"
});

const TENDENCY_PRESENTATION = new Set([
  "attunement",
  "boundary_respect",
  "pathfinding",
  "steadfastness"
]);
const GUARDED_REACTIONS = new Set(["reject", "blocked", "spam_angry"]);
const COMPANION_INTENTS = new Set(["accept", "rewrite", "defer"]);
const CHAPTER_RHYTHMS = new Set(["open", "hold"]);
const HEART_PHASE_IDS = new Set(["resting", "guarded", "curious", "steady"]);
const CARE_PRACTICE_IDS = new Set(HEART_PHASE_PRACTICES.map((practice) => practice.id));
const CARE_ORIGIN_EVENT_ID = "heart_phase_practice";

/**
 * Thin state-owner bridge for Companion Growth G3.
 *
 * Source controllers keep ownership of their existing transaction and save.
 * This bridge only validates a completed event, writes its per-companion
 * evidence into that draft, and derives a presentation-safe view model.
 */
export function createCompanionGrowthController() {
  function writeIntoDraft(draft, input = {}) {
    const companionId = input.companionId;
    if (!draft || draft.activeCompanionId !== companionId) {
      return rejectedWrite("active_companion_mismatch");
    }

    const record = draft.companionStates?.byId?.[companionId];
    if (!record?.growth) return rejectedWrite("missing_companion_growth");

    const created = createCompletedGrowthEvent(input);
    if (!created.ok) return rejectedWrite(created.reason);

    const written = writeCompanionGrowthEvidence({
      growth: record.growth,
      companionId,
      event: created.event
    });
    if (written.result.changed) record.growth = written.growth;
    return written.result;
  }

  function getViewModel(state, currentMoment = null) {
    const companionId = state?.activeCompanionId || "greyshade-cat";
    const safetyPaused = state?.safeHarborMode === true || currentMoment?.safetyPaused === true;
    if (safetyPaused) {
      return Object.freeze({ companionId, safetyPaused: true });
    }

    const growth = state?.companionStates?.byId?.[companionId]?.growth;
    const chapterNo = normalizeChapterNo(state?.chapterProgress?.current);
    const readiness = evaluateCompanionGrowthReadiness({
      growth,
      companionId,
      chapterNo,
      profile: GROWTH_PROFILE
    });
    const willingness = evaluateCompanionGrowthWillingness({
      growth,
      companionId,
      readiness,
      context: buildWillingnessContext(state, currentMoment)
    });

    return Object.freeze({
      companionId,
      safetyPaused: false,
      phase: Object.freeze({
        id: currentMoment?.phaseId || "steady",
        labelKey: currentMoment?.phaseLabelKey || "growth.session.phase.steady.label",
        copyKey: currentMoment?.phaseCopyKey || "growth.session.phase.steady.copy"
      }),
      formalStage: Object.freeze({
        id: normalizeStage(growth?.stage),
        labelKey: `growth.persisted.stage.${normalizeStage(growth?.stage)}`
      }),
      relationshipSignal: deriveRelationshipSignal(growth, readiness, willingness),
      formalEvolution: deriveFormalEvolutionView(growth, readiness, willingness),
      livedEvidence: deriveLivedEvidence(growth?.evidence),
      currentMoment: Object.freeze({
        observedTendencyIds: Object.freeze([
          ...(Array.isArray(currentMoment?.observedTendencyIds)
            ? currentMoment.observedTendencyIds.filter((id) => TENDENCY_PRESENTATION.has(id))
            : [])
        ]),
        lastResult: currentMoment?.lastResult || null
      })
    });
  }

  /**
   * Fixed source-owner adapter for completed Heart Phase care practices.
   * Rest, decline and pending/deferred rewrites are deliberately rejected
   * before event creation. A rewrite needs the player's explicit acceptance.
   */
  function writeCarePracticeIntoDraft(draft, {
    companionId,
    result,
    createdAt = Date.now(),
    safetyOverrides = {}
  } = {}) {
    const validation = validateCompletedCareResult(result, companionId);
    if (!validation.ok) return rejectedWrite(validation.reason);

    const rewritten = result.outcomeId === "modify";
    return writeIntoDraft(draft, {
      companionId,
      completed: true,
      completionStatus: "completed",
      sourceType: "care",
      tendency: result.observedTendencyId,
      context: {
        chapterNo: normalizeChapterNo(draft?.chapterProgress?.current),
        originEventId: CARE_ORIGIN_EVENT_ID,
        // A completed rewrite is a distinct deterministic detail under the
        // same care root, so a prior accepted practice cannot block its anchor.
        practiceId: rewritten ? `${result.practiceId}_rewrite` : result.practiceId
      },
      createdAt,
      consentKind: rewritten ? "respected_rewrite" : null,
      safetyProvenance: createGrowthSafetyFacts(draft, safetyOverrides)
    });
  }

  /**
   * Echo Sorting / Reflection source owner.
   * 只寫已經封存主人與安全 provenance 的來源；缺資料就 fail closed，
   * 不會用目前 active companion 去猜。
   */
  function writeReflectionPracticeIntoDraft(draft, {
    companionId,
    memoryId = null,
    traceId = null,
    resolutionId = "shared_understanding",
    createdAt = Date.now(),
    safetyFacts = null
  } = {}) {
    let resolvedMemoryId = memoryId;
    let resolvedTraceId = traceId;
    if (!resolvedMemoryId && !resolvedTraceId) {
      const found = findReflectableCanonicalSource({
        state: draft,
        companionId,
        at: createdAt
      });
      if (!found.ok) return rejectedWrite(found.reason);
      if (found.originType === "memory") resolvedMemoryId = found.originId;
      else resolvedTraceId = found.originId;
    }

    const prepared = createReflectionGrowthWriteInput({
      state: draft,
      companionId,
      memoryId: resolvedMemoryId,
      traceId: resolvedTraceId,
      resolutionId,
      completedAt: createdAt,
      safetyFacts: safetyFacts || createGrowthSafetyFacts(draft)
    });
    if (!prepared.ok) return rejectedWrite(prepared.reason);
    return writeIntoDraft(draft, prepared.writeInput);
  }

  function applyFormalEvolutionIntoDraft(draft, input = {}) {
    return applyFormalEvolutionTransition(draft, input);
  }

  return Object.freeze({
    writeIntoDraft,
    writeCarePracticeIntoDraft,
    writeReflectionPracticeIntoDraft,
    applyFormalEvolutionIntoDraft,
    getViewModel
  });
}

export async function commitFormalEvolutionTransition({
  currentState,
  saveCandidateState,
  publishState = null,
  notifyRenderer = null,
  action,
  companionId,
  at = Date.now(),
  generation = null,
  offerToken = null,
  rewriteAccepted = false,
  safetyFacts = null,
  willingnessContext = null,
  currentMoment = null
} = {}) {
  if (!currentState || typeof currentState !== "object") {
    return frozenCommit({
      ok: false,
      reason: "invalid_growth_state",
      changed: false,
      published: false,
      persistRequested: false
    });
  }
  if (typeof saveCandidateState !== "function") {
    return frozenCommit({
      ok: false,
      reason: "formal_evolution_save_unavailable",
      changed: false,
      published: false,
      persistRequested: false
    });
  }

  const candidateState = cloneJson(currentState);
  const applied = applyFormalEvolutionTransition(candidateState, {
    action,
    companionId,
    at,
    generation,
    offerToken,
    rewriteAccepted,
    safetyFacts,
    willingnessContext,
    currentMoment
  });
  if (!applied.ok) {
    return frozenCommit({
      ...applied,
      published: false,
      persistRequested: false
    });
  }
  if (!applied.changed) {
    return frozenCommit({
      ...applied,
      published: false,
      persistRequested: false
    });
  }

  const saveResult = await saveCandidateState(candidateState);
  if (saveResult?.ok !== true) {
    return frozenCommit({
      ok: false,
      accepted: false,
      changed: false,
      reason: "formal_evolution_save_failed",
      action,
      offer: applied.offer || null,
      candidateGrowth: cloneJson(currentState.companionStates?.byId?.[applied.companionId]?.growth),
      published: false,
      persistRequested: true,
      rendererIntent: null
    });
  }

  if (typeof publishState === "function") publishState(candidateState);
  if (typeof notifyRenderer === "function") notifyRenderer(null);

  return frozenCommit({
    ...applied,
    published: true,
    persistRequested: true,
    rendererIntent: null
  });
}

export function createGrowthSafetyFacts(state = {}, overrides = {}) {
  const facts = {
    isHighRisk: false,
    strategyId: null,
    actionId: null,
    systemRoleSafetyReply: false,
    safetyModeActive: false,
    ...overrides
  };
  // A caller may add stricter origin facts, but it cannot wash an active
  // safe-harbor state false while completing a delayed source event.
  facts.safeHarborModeActive = state?.safeHarborMode === true
    || overrides?.safeHarborModeActive === true;
  return Object.freeze(facts);
}

function applyFormalEvolutionTransition(draft, input = {}) {
  if (!draft || typeof draft !== "object") {
    return frozenCommit({
      ok: false,
      reason: "invalid_growth_state",
      changed: false
    });
  }
  const companionId = input.companionId || draft.activeCompanionId;
  const growth = draft.companionStates?.byId?.[companionId]?.growth;
  if (!growth) {
    return frozenCommit({
      ok: false,
      reason: "missing_companion_growth",
      changed: false
    });
  }

  const at = Number.isFinite(input.at) && input.at > 0 ? input.at : Date.now();
  const action = input.action;
  const existingOffer = growth.formalOffer;
  const generation = input.generation
    || (action === "offer" && existingOffer?.status === "open" ? existingOffer.generation : `g${at}`);
  const offerToken = input.offerToken
    || ((action === "accept") ? existingOffer?.token : null);
  const rewriteAccepted = input.rewriteAccepted === true;

  const decision = decideFormalEvolutionTransition({
    action,
    companionId,
    growth,
    state: draft,
    chapterNo: normalizeChapterNo(draft?.chapterProgress?.current),
    profile: GROWTH_PROFILE,
    willingnessContext: input.willingnessContext || buildWillingnessContext(draft, input.currentMoment),
    safetyFacts: input.safetyFacts || createGrowthSafetyFacts(draft),
    generation,
    at,
    offerToken,
    rewriteAccepted,
    forceEvolve: input.forceEvolve === true
  });

  if (decision.ok === true && decision.changed === true && decision.candidateGrowth) {
    draft.companionStates.byId[companionId].growth = cloneJson(decision.candidateGrowth);
  }

  return frozenCommit({
    ok: decision.ok === true,
    accepted: decision.accepted === true,
    changed: decision.changed === true,
    reason: decision.reason,
    action: decision.action,
    companionId,
    offer: decision.offer,
    candidateGrowth: decision.candidateGrowth,
    rendererIntent: null
  });
}

function deriveFormalEvolutionView(growth, readiness, willingness) {
  const stage = normalizeStage(growth?.stage);
  const offer = growth?.formalOffer;
  if (stage === "final_awakened") {
    return Object.freeze({
      kind: "complete",
      targetStage: null,
      copyKey: "growth.formal.complete"
    });
  }
  if (offer?.status === "open" && offer.rewritePending === true) {
    return Object.freeze({
      kind: "rewrite_pending",
      targetStage: offer.targetStage || null,
      copyKey: "growth.formal.rewritePending"
    });
  }
  if (offer?.status === "open") {
    return Object.freeze({
      kind: "open",
      targetStage: offer.targetStage || null,
      copyKey: "growth.formal.open"
    });
  }
  if (readiness?.ready === true && willingness?.state === "willing") {
    return Object.freeze({
      kind: "can_invite",
      targetStage: readiness.targetStage || null,
      copyKey: "growth.formal.canInvite"
    });
  }
  return Object.freeze({
    kind: "none",
    targetStage: null,
    copyKey: null
  });
}

function frozenCommit(value) {
  return Object.freeze({
    ok: value.ok === true,
    accepted: value.accepted === true,
    changed: value.changed === true,
    reason: value.reason || "invalid_input",
    action: value.action || null,
    companionId: value.companionId || null,
    offer: value.offer || null,
    candidateGrowth: value.candidateGrowth || null,
    published: value.published === true,
    persistRequested: value.persistRequested === true,
    rendererIntent: value.rendererIntent ?? null
  });
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildWillingnessContext(state = {}, currentMoment = null) {
  const safetyProvenance = sealGrowthSafetyProvenance(createGrowthSafetyFacts(state));
  const lastReaction = state.lastTouchReaction || "";
  const guarded = GUARDED_REACTIONS.has(lastReaction)
    || state.mood === "defensive"
    || state.mood === "distant";
  const boundaryState = guarded
    ? "unresolved"
    : lastReaction === "respected"
      ? "repaired"
      : "clear";
  const overfatigued = Number(state.touchFatigue) >= 7;
  const resultIntent = currentMoment?.lastResult?.outcomeId === "modify"
    ? "rewrite"
    : ["decline", "rest"].includes(currentMoment?.lastResult?.outcomeId)
      ? "defer"
      : "accept";
  const companionIntent = COMPANION_INTENTS.has(currentMoment?.companionIntent)
    ? currentMoment.companionIntent
    : boundaryState === "unresolved"
      ? "defer"
      : resultIntent;
  const chapterRhythm = CHAPTER_RHYTHMS.has(currentMoment?.chapterRhythm)
    ? currentMoment.chapterRhythm
    : isValidChapterNo(state?.chapterProgress?.current)
      ? "open"
      : "hold";

  return {
    growthSafetyExcluded: safetyProvenance.excluded,
    safetyProvenance,
    fatigue: {
      kind: "touch",
      state: overfatigued ? "overfatigued" : "regulated"
    },
    boundaryState,
    chapterRhythm,
    companionIntent,
    ...(currentMoment?.reevaluation ? { reevaluation: currentMoment.reevaluation } : {})
  };
}

function deriveRelationshipSignal(growth, readiness, willingness) {
  if (normalizeStage(growth?.stage) === "final_awakened") {
    return Object.freeze({
      readinessId: "complete",
      willingnessId: "not_evaluated",
      copyKey: "growth.persisted.signal.complete"
    });
  }
  if (!readiness?.ready) {
    return Object.freeze({
      readinessId: "forming",
      willingnessId: "not_evaluated",
      copyKey: "growth.persisted.signal.forming"
    });
  }

  let signal = "notNow";
  if (willingness?.state === "willing" || willingness?.state === "rewrite") signal = "open";
  else if (willingness?.reason === "typed_overfatigue") signal = "resting";
  else if (willingness?.reason === "boundary_unresolved") signal = "repairing";
  return Object.freeze({
    readinessId: "possible",
    willingnessId: willingness?.state || "not_yet",
    copyKey: `growth.persisted.signal.possible.${signal}`
  });
}

function deriveLivedEvidence(rawEvidence) {
  const candidates = (Array.isArray(rawEvidence) ? rawEvidence : [])
    .filter((item) => (
      item?.growthSafetyExcluded === false
      && SOURCE_PRESENTATION[item.sourceType]
      && TENDENCY_PRESENTATION.has(item.tendency)
      && Number.isFinite(item.createdAt)
      && item.createdAt > 0
    ))
    .sort((left, right) => right.createdAt - left.createdAt || String(left.key).localeCompare(String(right.key)));
  const rows = [];
  const seenPresentation = new Set();
  for (const item of candidates) {
    const sourceType = SOURCE_PRESENTATION[item.sourceType];
    const presentationKey = `${sourceType}:${item.tendency}`;
    if (seenPresentation.has(presentationKey)) continue;
    seenPresentation.add(presentationKey);
    rows.push(Object.freeze({
      sourceType,
      tendencyId: item.tendency,
      sourceLabelKey: `growth.persisted.source.${sourceType}.label`,
      sourceCopyKey: `growth.persisted.source.${sourceType}.copy`,
      tendencyLabelKey: `growth.session.tendency.${item.tendency}`
    }));
    if (rows.length === 3) break;
  }
  return Object.freeze({
    rows: Object.freeze(rows),
    empty: rows.length === 0,
    emptyCopyKey: "growth.persisted.evidenceEmpty"
  });
}

function rejectedWrite(reason) {
  return Object.freeze({
    accepted: false,
    changed: false,
    reason,
    evidenceAdded: false,
    rootAccepted: false,
    anchorAccepted: false,
    key: null,
    rootContextKey: null
  });
}

function validateCompletedCareResult(result, companionId) {
  if (!result || typeof result !== "object") {
    return { ok: false, reason: "invalid_care_result" };
  }
  if (result.companionId !== companionId) {
    return { ok: false, reason: "care_companion_mismatch" };
  }
  if (!isCanonicalHeartPhaseResult(result, companionId)) {
    return { ok: false, reason: "noncanonical_care_result" };
  }
  if (!CARE_PRACTICE_IDS.has(result.practiceId) || !HEART_PHASE_IDS.has(result.phaseId)) {
    return { ok: false, reason: "invalid_care_context" };
  }
  if (!TENDENCY_PRESENTATION.has(result.observedTendencyId)) {
    return { ok: false, reason: "invalid_care_tendency" };
  }
  if (result.completionStatus !== HEART_PHASE_COMPLETION.COMPLETED) {
    return { ok: false, reason: "care_event_not_completed" };
  }
  if (result.outcomeId === "accept" && result.rewriteDecision === null) {
    return { ok: true, reason: "care_completed" };
  }
  if (result.outcomeId === "modify" && result.rewriteDecision === "accept") {
    return { ok: true, reason: "care_rewrite_completed" };
  }
  return { ok: false, reason: "care_outcome_not_evidence" };
}

function normalizeStage(value) {
  return ["initial_awakened", "resonant_mature", "final_awakened"].includes(value)
    ? value
    : "initial_awakened";
}

function normalizeChapterNo(value) {
  const chapterNo = Number(value);
  return Number.isInteger(chapterNo) && chapterNo >= 1 && chapterNo <= 7 ? chapterNo : 1;
}

function isValidChapterNo(value) {
  const chapterNo = Number(value);
  return Number.isInteger(chapterNo) && chapterNo >= 1 && chapterNo <= 7;
}
