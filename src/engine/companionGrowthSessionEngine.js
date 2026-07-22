// G1 Companion Growth: session-only, qualitative Heart Phase practice.
//
// This module is intentionally pure. It does not touch DOM, Pixi, store,
// localStorage, clocks, offline duration, relationship rewards, or save data.
// G2+ owns persistent per-companion growth truth.

export const HEART_PHASE_TENDENCIES = Object.freeze([
  "attunement",
  "boundary_respect",
  "pathfinding",
  "steadfastness"
]);

export const HEART_PHASE_PRACTICES = Object.freeze([
  Object.freeze({
    id: "attunement",
    tendencyId: "attunement",
    labelKey: "growth.session.practice.attunement.label",
    copyKey: "growth.session.practice.attunement.copy"
  }),
  Object.freeze({
    id: "boundary_respect",
    tendencyId: "boundary_respect",
    labelKey: "growth.session.practice.boundaryRespect.label",
    copyKey: "growth.session.practice.boundaryRespect.copy"
  }),
  Object.freeze({
    id: "pathfinding",
    tendencyId: "pathfinding",
    labelKey: "growth.session.practice.pathfinding.label",
    copyKey: "growth.session.practice.pathfinding.copy"
  }),
  Object.freeze({
    id: "steadfastness",
    tendencyId: "steadfastness",
    labelKey: "growth.session.practice.steadfastness.label",
    copyKey: "growth.session.practice.steadfastness.copy"
  })
]);

export const HEART_PHASE_COMPLETION = Object.freeze({
  COMPLETED: "completed",
  AWAITING_REWRITE: "awaiting_rewrite",
  ZERO_EVIDENCE: "zero_evidence",
  DEFERRED: "deferred"
});

const TENDENCY_IDS = new Set(HEART_PHASE_TENDENCIES);
const PRACTICE_IDS = new Set(HEART_PHASE_PRACTICES.map((practice) => practice.id));
const GUARDED_REACTIONS = new Set(["reject", "blocked", "spam_angry"]);

const OUTCOME_MATRIX = Object.freeze({
  resting: Object.freeze({
    attunement: accepted("attunement"),
    boundary_respect: accepted("boundary_respect"),
    pathfinding: rested(),
    steadfastness: rested()
  }),
  guarded: Object.freeze({
    attunement: modified("boundary_respect", "growth.session.response.modify.boundary"),
    boundary_respect: accepted("boundary_respect"),
    pathfinding: declined(),
    steadfastness: modified("boundary_respect", "growth.session.response.modify.boundary")
  }),
  curious: Object.freeze({
    attunement: accepted("attunement"),
    boundary_respect: accepted("boundary_respect"),
    pathfinding: accepted("pathfinding"),
    steadfastness: modified("pathfinding", "growth.session.response.modify.curiosity")
  }),
  steady: Object.freeze({
    attunement: accepted("attunement"),
    boundary_respect: accepted("boundary_respect"),
    pathfinding: accepted("pathfinding"),
    steadfastness: accepted("steadfastness")
  })
});

export function createCompanionGrowthSession(companionId) {
  return {
    version: 2,
    companionId: normalizeCompanionId(companionId),
    observedTendencyIds: [],
    lastResult: null
  };
}

export function deriveHeartPhaseSnapshot(state = {}, session = null) {
  const companionId = normalizeCompanionId(state.activeCompanionId || session?.companionId);
  const normalizedSession = normalizeSession(session, companionId);
  const phaseId = derivePhaseId(state);

  return {
    companionId,
    phaseId,
    phaseLabelKey: `growth.session.phase.${phaseId}.label`,
    phaseCopyKey: `growth.session.phase.${phaseId}.copy`,
    // safeHarborMode is canonical persisted UI/mode state. Immutable
    // growthSafetyExcluded provenance belongs to source events and the future
    // G3 writer; it must not become a hidden top-level save field in G1.
    safetyPaused: state.safeHarborMode === true,
    observedTendencyIds: normalizedSession.observedTendencyIds,
    lastResult: normalizedSession.lastResult
  };
}

export function evaluateHeartPhasePractice(state = {}, session = null, practiceId = "") {
  const snapshot = deriveHeartPhaseSnapshot(state, session);
  const normalizedSession = normalizeSession(session, snapshot.companionId);

  if (!PRACTICE_IDS.has(practiceId)) {
    return {
      ok: false,
      reason: "unknown-practice",
      session: normalizedSession,
      result: null
    };
  }

  // Safety is terminal: no response variant, observation, reward, or session record.
  if (snapshot.safetyPaused) {
    return {
      ok: false,
      reason: "safety-paused",
      session: normalizedSession,
      result: null
    };
  }

  const rule = OUTCOME_MATRIX[snapshot.phaseId]?.[practiceId] || declined();
  const result = {
    companionId: snapshot.companionId,
    practiceId,
    phaseId: snapshot.phaseId,
    outcomeId: rule.outcomeId,
    observedTendencyId: rule.observedTendencyId,
    responseKey: rule.responseKey,
    completionStatus: getInitialCompletionStatus(rule.outcomeId),
    rewriteDecision: null,
    resolutionResponseKey: null
  };
  const observedTendencyIds = rule.observedTendencyId
    ? appendUnique(normalizedSession.observedTendencyIds, rule.observedTendencyId)
    : normalizedSession.observedTendencyIds;

  return {
    ok: true,
    reason: null,
    session: {
      ...normalizedSession,
      observedTendencyIds,
      lastResult: result
    },
    result
  };
}

/**
 * Resolve a companion-authored practice rewrite without turning the first
 * proposal into implicit consent. Accepting completes the care moment;
 * deferring is an equally valid zero-write ending. This stays session-only.
 */
export function resolveHeartPhaseRewrite(state = {}, session = null, decision = "") {
  const snapshot = deriveHeartPhaseSnapshot(state, session);
  const normalizedSession = normalizeSession(session, snapshot.companionId);

  if (snapshot.safetyPaused) {
    return {
      ok: false,
      reason: "safety-paused",
      session: normalizedSession,
      result: null
    };
  }
  if (!["accept", "defer"].includes(decision)) {
    return {
      ok: false,
      reason: "unknown-rewrite-decision",
      session: normalizedSession,
      result: null
    };
  }

  const pending = normalizedSession.lastResult;
  if (
    pending?.outcomeId !== "modify"
    || pending.completionStatus !== HEART_PHASE_COMPLETION.AWAITING_REWRITE
    || pending.rewriteDecision !== null
  ) {
    return {
      ok: false,
      reason: "no-pending-rewrite",
      session: normalizedSession,
      result: null
    };
  }

  const accepted = decision === "accept";
  const result = {
    ...pending,
    completionStatus: accepted
      ? HEART_PHASE_COMPLETION.COMPLETED
      : HEART_PHASE_COMPLETION.DEFERRED,
    rewriteDecision: decision,
    resolutionResponseKey: accepted
      ? "growth.session.response.rewriteAccepted"
      : "growth.session.response.rewriteDeferred"
  };
  return {
    ok: true,
    reason: null,
    session: {
      ...normalizedSession,
      lastResult: result
    },
    result
  };
}

/**
 * Authenticate a Heart Phase result against the same deterministic matrix that
 * produced it. Source owners call this before persistence so a hand-crafted or
 * stale shape cannot turn a rest/decline into completed Growth evidence.
 */
export function isCanonicalHeartPhaseResult(result, companionId = "") {
  const ownerId = typeof companionId === "string" ? companionId.trim() : "";
  const expected = result && OUTCOME_MATRIX[result.phaseId]?.[result.practiceId];
  return Boolean(
    ownerId
    && result
    && result.companionId === ownerId
    && expected
    && result.outcomeId === expected.outcomeId
    && result.observedTendencyId === expected.observedTendencyId
    && result.responseKey === expected.responseKey
    && Object.values(HEART_PHASE_COMPLETION).includes(result.completionStatus)
    && [null, "accept", "defer"].includes(result.rewriteDecision)
    && (result.resolutionResponseKey === null || typeof result.resolutionResponseKey === "string")
    && isCompletionConsistent(result)
  );
}

function derivePhaseId(state) {
  const energy = finiteNumber(state.energy, 10);
  const touchFatigue = finiteNumber(state.touchFatigue, 0);
  if (energy <= 2 || touchFatigue >= 7) return "resting";

  const mood = typeof state.mood === "string" ? state.mood : "calm";
  if (mood === "defensive" || mood === "distant" || GUARDED_REACTIONS.has(state.lastTouchReaction)) {
    return "guarded";
  }

  if ((mood === "happy" || mood === "warm") && energy >= 5) return "curious";
  return "steady";
}

function normalizeSession(session, companionId) {
  if (!session || session.companionId !== companionId) {
    return createCompanionGrowthSession(companionId);
  }

  const observedTendencyIds = Array.isArray(session.observedTendencyIds)
    ? [...new Set(session.observedTendencyIds.filter((id) => TENDENCY_IDS.has(id)))]
    : [];
  const lastResult = isCanonicalHeartPhaseResult(session.lastResult, companionId)
    ? { ...session.lastResult }
    : null;

  return {
    version: 2,
    companionId,
    observedTendencyIds,
    lastResult
  };
}

function getInitialCompletionStatus(outcomeId) {
  if (outcomeId === "accept") return HEART_PHASE_COMPLETION.COMPLETED;
  if (outcomeId === "modify") return HEART_PHASE_COMPLETION.AWAITING_REWRITE;
  return HEART_PHASE_COMPLETION.ZERO_EVIDENCE;
}

function isCompletionConsistent(result) {
  if (result.outcomeId === "accept") {
    return result.completionStatus === HEART_PHASE_COMPLETION.COMPLETED
      && result.rewriteDecision === null
      && result.resolutionResponseKey === null;
  }
  if (result.outcomeId === "modify") {
    if (result.completionStatus === HEART_PHASE_COMPLETION.AWAITING_REWRITE) {
      return result.rewriteDecision === null && result.resolutionResponseKey === null;
    }
    if (result.completionStatus === HEART_PHASE_COMPLETION.COMPLETED) {
      return result.rewriteDecision === "accept"
        && result.resolutionResponseKey === "growth.session.response.rewriteAccepted";
    }
    return result.completionStatus === HEART_PHASE_COMPLETION.DEFERRED
      && result.rewriteDecision === "defer"
      && result.resolutionResponseKey === "growth.session.response.rewriteDeferred";
  }
  return result.completionStatus === HEART_PHASE_COMPLETION.ZERO_EVIDENCE
    && result.rewriteDecision === null
    && result.resolutionResponseKey === null;
}

function accepted(tendencyId) {
  return Object.freeze({
    outcomeId: "accept",
    observedTendencyId: tendencyId,
    responseKey: `growth.session.response.accept.${tendencyId}`
  });
}

function modified(tendencyId, responseKey) {
  return Object.freeze({
    outcomeId: "modify",
    observedTendencyId: tendencyId,
    responseKey
  });
}

function rested() {
  return Object.freeze({
    outcomeId: "rest",
    observedTendencyId: null,
    responseKey: "growth.session.response.rest"
  });
}

function declined() {
  return Object.freeze({
    outcomeId: "decline",
    observedTendencyId: null,
    responseKey: "growth.session.response.decline"
  });
}

function appendUnique(values, value) {
  return values.includes(value) ? values : [...values, value];
}

function normalizeCompanionId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "greyshade-cat";
}

function finiteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
