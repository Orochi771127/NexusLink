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
    version: 1,
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
    safetyPaused: phaseId === "safety_pause",
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
    practiceId,
    outcomeId: rule.outcomeId,
    observedTendencyId: rule.observedTendencyId,
    responseKey: rule.responseKey
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

function derivePhaseId(state) {
  if (state.safeHarborMode === true || state.growthSafetyExcluded === true) {
    return "safety_pause";
  }

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
  const lastResult = isValidResult(session.lastResult) ? { ...session.lastResult } : null;

  return {
    version: 1,
    companionId,
    observedTendencyIds,
    lastResult
  };
}

function isValidResult(result) {
  return Boolean(
    result
    && PRACTICE_IDS.has(result.practiceId)
    && ["accept", "modify", "rest", "decline"].includes(result.outcomeId)
    && (result.observedTendencyId === null || TENDENCY_IDS.has(result.observedTendencyId))
    && typeof result.responseKey === "string"
  );
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
