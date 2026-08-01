// P2 Habitat Rhythm: pure, session-only projection for Moonlake practices.
//
// This module deliberately owns no DOM, Pixi, store, clock, persistence,
// relationship reward, Growth evidence, or habitat layout. Heart Phase remains
// the canonical outcome authority; this layer only maps habitat affordances to
// those existing practices and adds presentation metadata.

import {
  HEART_PHASE_COMPLETION,
  deriveHeartPhaseSnapshot,
  evaluateHeartPhasePractice,
  isCanonicalHeartPhaseResult,
  resolveHeartPhaseRewrite
} from "./companionGrowthSessionEngine.js";

const CARE_ORIGIN_EVENT_ID = "heart_phase_practice";
const VALID_TIME_PHASES = new Set(["dawn", "day", "dusk", "night"]);
const VALID_WEATHER_IDS = new Set(["clear", "rain", "mist"]);

export const HABITAT_RHYTHM_HOTSPOTS = Object.freeze({
  water: Object.freeze({
    hotspotType: "water",
    practiceId: "attunement",
    affordanceId: "listen_to_tide",
    waypointId: "bridge_far",
    animationIntent: "care.calm_sync"
  }),
  lantern: Object.freeze({
    hotspotType: "lantern",
    practiceId: "boundary_respect",
    affordanceId: "approach_lantern_with_space",
    waypointId: "near_ground_left",
    animationIntent: "soul.acknowledge"
  }),
  crystal: Object.freeze({
    hotspotType: "crystal",
    practiceId: "pathfinding",
    affordanceId: "sort_crystal_echoes",
    waypointId: "platform_left",
    animationIntent: "standoff.resonance"
  }),
  "quiet-ground": Object.freeze({
    hotspotType: "quiet-ground",
    practiceId: "steadfastness",
    affordanceId: "sit_or_wait_together",
    waypointId: "near_ground_center",
    animationIntent: "soul.rest"
  })
});

const HOTSPOT_TYPE_ALIASES = new Map([
  ["water", "water"],
  ["waterside", "water"],
  ["water-edge", "water"],
  ["lake", "water"],
  ["lantern", "lantern"],
  ["light", "lantern"],
  ["crystal", "crystal"],
  ["echo-crystal", "crystal"],
  ["quiet-ground", "quiet-ground"],
  ["quiet_ground", "quiet-ground"],
  ["quiet", "quiet-ground"],
  ["ground", "quiet-ground"]
]);

const BODY_CUE_BY_PHASE = Object.freeze({
  resting: "settle_low",
  guarded: "hold_comfortable_distance",
  curious: "look_twice_then_approach",
  steady: "breathe_evenly"
});

const TIME_VISIBLE_AFFORDANCE = Object.freeze({
  dawn: "notice_dawn_reflection",
  day: "notice_daylight_ripples",
  dusk: "follow_dusk_glow",
  night: "sit_with_moonlight"
});

const WEATHER_VISIBLE_AFFORDANCE = Object.freeze({
  clear: "notice_clear_air",
  rain: "listen_to_rain",
  mist: "watch_nearby_glow"
});

/**
 * Derive the current habitat rhythm without mutating or persisting anything.
 * Time and weather affect only presentation, visible affordances, and roaming.
 */
export function deriveHabitatRhythm({ state = {}, environment = {} } = {}) {
  const heartPhase = deriveHeartPhaseSnapshot(state);
  const timePhaseId = normalizeTimePhase(environment.timePhaseId ?? environment.timePhase ?? environment.phase);
  const weatherId = normalizeWeather(environment.weatherId ?? environment.weather);

  if (heartPhase.safetyPaused) {
    return {
      companionId: heartPhase.companionId,
      phaseId: heartPhase.phaseId,
      bodyCueId: null,
      availableAffordanceIds: [],
      roamingPolicyId: "safety_paused",
      safetyPaused: true,
      presentation: {
        timePhaseId,
        weatherId,
        ambienceId: `moonlake.${timePhaseId}.${weatherId}`
      }
    };
  }

  const baseAffordances = Object.values(HABITAT_RHYTHM_HOTSPOTS).map((hotspot) => hotspot.affordanceId);
  return {
    companionId: heartPhase.companionId,
    phaseId: heartPhase.phaseId,
    bodyCueId: BODY_CUE_BY_PHASE[heartPhase.phaseId] || BODY_CUE_BY_PHASE.steady,
    availableAffordanceIds: [
      ...baseAffordances,
      TIME_VISIBLE_AFFORDANCE[timePhaseId],
      WEATHER_VISIBLE_AFFORDANCE[weatherId]
    ],
    roamingPolicyId: deriveRoamingPolicy(heartPhase.phaseId, timePhaseId, weatherId),
    safetyPaused: false,
    presentation: {
      timePhaseId,
      weatherId,
      ambienceId: `moonlake.${timePhaseId}.${weatherId}`
    }
  };
}

/**
 * Project a habitat hotspot into the existing Heart Phase invitation matrix.
 * The returned Heart Phase session/result are ephemeral and are included so a
 * later rewrite resolution cannot silently recalculate a different phase.
 */
export function deriveHabitatPracticeInvitation({
  state = {},
  environment = {},
  hotspotType = ""
} = {}) {
  const rhythm = deriveHabitatRhythm({ state, environment });
  if (rhythm.safetyPaused) return invitationFailure("safety-paused", rhythm);

  const normalizedHotspotType = normalizeHotspotType(
    hotspotType || environment.hotspotType || environment.hotspot?.type || environment.type
  );
  const hotspot = HABITAT_RHYTHM_HOTSPOTS[normalizedHotspotType];
  if (!hotspot) return invitationFailure("unknown-hotspot", rhythm);

  const evaluation = evaluateHeartPhasePractice(state, null, hotspot.practiceId);
  if (!evaluation.ok || !evaluation.result) {
    return invitationFailure(evaluation.reason || "heart-phase-unavailable", rhythm);
  }

  const hotspotId = normalizeOptionalId(environment.hotspotId || environment.hotspot?.id);
  const chapterNo = normalizeChapterNo(environment.chapterNo ?? state.chapterProgress?.current);
  const careRootKey = deriveHabitatCareRootKey({ chapterNo });
  const heartPhaseResult = { ...evaluation.result };

  return {
    ok: true,
    reason: null,
    rhythm,
    invitation: {
      version: 1,
      sessionOnly: true,
      companionId: rhythm.companionId,
      chapterNo,
      careRootKey,
      hotspotType: hotspot.hotspotType,
      hotspotId,
      practiceId: hotspot.practiceId,
      affordanceId: hotspot.affordanceId,
      waypointId: hotspot.waypointId,
      animationIntent: hotspot.animationIntent,
      phaseId: heartPhaseResult.phaseId,
      outcomeId: heartPhaseResult.outcomeId,
      responseKey: heartPhaseResult.responseKey,
      completionStatus: heartPhaseResult.completionStatus,
      heartPhaseSession: evaluation.session,
      heartPhaseResult
    }
  };
}

/**
 * Produce the session-only result shown after a hotspot invitation. A modify
 * remains pending until the player explicitly accepts or defers the companion's
 * rewrite. Rest and decline stay canonical zero-evidence endings.
 */
export function projectHabitatPracticeResult({
  state = {},
  invitation = null,
  rewriteDecision = null
} = {}) {
  const snapshot = deriveHeartPhaseSnapshot(state);
  if (snapshot.safetyPaused) return resultFailure("safety-paused");

  const validation = validateInvitation(invitation, snapshot.companionId);
  if (!validation.ok) return resultFailure(validation.reason);

  let heartPhaseResult = { ...invitation.heartPhaseResult };
  if (heartPhaseResult.outcomeId === "modify") {
    if (rewriteDecision !== null && rewriteDecision !== undefined && rewriteDecision !== "") {
      const resolution = resolveHeartPhaseRewrite(state, invitation.heartPhaseSession, rewriteDecision);
      if (!resolution.ok || !resolution.result) return resultFailure(resolution.reason || "rewrite-unavailable");
      heartPhaseResult = { ...resolution.result };
    }
  } else if (rewriteDecision !== null && rewriteDecision !== undefined && rewriteDecision !== "") {
    return resultFailure("unexpected-rewrite-decision");
  }

  if (
    !isCanonicalHeartPhaseResult(heartPhaseResult, invitation.companionId)
    || heartPhaseResult.practiceId !== invitation.practiceId
    || heartPhaseResult.phaseId !== invitation.phaseId
    || heartPhaseResult.outcomeId !== invitation.outcomeId
  ) {
    return resultFailure("invalid-invitation");
  }

  return {
    ok: true,
    reason: null,
    result: {
      version: 1,
      sessionOnly: true,
      companionId: invitation.companionId,
      chapterNo: invitation.chapterNo,
      careRootKey: invitation.careRootKey,
      hotspotType: invitation.hotspotType,
      hotspotId: invitation.hotspotId,
      practiceId: invitation.practiceId,
      affordanceId: invitation.affordanceId,
      waypointId: invitation.waypointId,
      animationIntent: invitation.animationIntent,
      phaseId: heartPhaseResult.phaseId,
      outcomeId: heartPhaseResult.outcomeId,
      responseKey: heartPhaseResult.responseKey,
      completionStatus: heartPhaseResult.completionStatus,
      rewriteDecision: heartPhaseResult.rewriteDecision,
      resolutionResponseKey: heartPhaseResult.resolutionResponseKey,
      completed: heartPhaseResult.completionStatus === HEART_PHASE_COMPLETION.COMPLETED,
      heartPhaseResult
    }
  };
}

/**
 * Same-chapter care group root used by the existing source owner. Individual
 * canonical Heart Phase practices may become bounded detail keys later, but
 * all habitat hotspots share this immutable group and cannot farm new roots.
 */
export function deriveHabitatCareRootKey({ state = {}, chapterNo = null } = {}) {
  const resolvedChapterNo = normalizeChapterNo(chapterNo ?? state.chapterProgress?.current);
  return resolvedChapterNo ? `care:${resolvedChapterNo}:${CARE_ORIGIN_EVENT_ID}` : null;
}

function validateInvitation(invitation, companionId) {
  if (!invitation || invitation.sessionOnly !== true || invitation.companionId !== companionId) {
    return { ok: false, reason: "invalid-invitation" };
  }

  const hotspot = HABITAT_RHYTHM_HOTSPOTS[invitation.hotspotType];
  const sessionResult = invitation.heartPhaseSession?.lastResult;
  if (
    !hotspot
    || invitation.practiceId !== hotspot.practiceId
    || invitation.affordanceId !== hotspot.affordanceId
    || invitation.waypointId !== hotspot.waypointId
    || invitation.animationIntent !== hotspot.animationIntent
    || !isCanonicalHeartPhaseResult(invitation.heartPhaseResult, companionId)
    || invitation.phaseId !== invitation.heartPhaseResult.phaseId
    || invitation.outcomeId !== invitation.heartPhaseResult.outcomeId
    || invitation.completionStatus !== invitation.heartPhaseResult.completionStatus
    || !isCanonicalHeartPhaseResult(sessionResult, companionId)
    || !sameHeartPhaseResult(sessionResult, invitation.heartPhaseResult)
  ) {
    return { ok: false, reason: "invalid-invitation" };
  }

  return { ok: true, reason: null };
}

function sameHeartPhaseResult(left, right) {
  const fields = [
    "companionId",
    "practiceId",
    "phaseId",
    "outcomeId",
    "observedTendencyId",
    "responseKey",
    "completionStatus",
    "rewriteDecision",
    "resolutionResponseKey"
  ];
  return fields.every((field) => left?.[field] === right?.[field]);
}

function deriveRoamingPolicy(phaseId, timePhaseId, weatherId) {
  const posture = {
    resting: "settling",
    guarded: "boundary",
    curious: "curious",
    steady: "unhurried"
  }[phaseId] || "unhurried";

  const atmosphere = weatherId === "rain"
    ? "sheltered"
    : weatherId === "mist"
      ? "nearby"
      : timePhaseId === "night"
        ? "lantern"
        : "open";
  return `${posture}_${atmosphere}_loop`;
}

function normalizeHotspotType(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return HOTSPOT_TYPE_ALIASES.get(normalized) || "";
}

function normalizeTimePhase(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const aliases = { morning: "dawn", noon: "day", afternoon: "day", evening: "dusk" };
  const resolved = aliases[normalized] || normalized;
  return VALID_TIME_PHASES.has(resolved) ? resolved : "day";
}

function normalizeWeather(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const aliases = { rainy: "rain", drizzle: "rain", fog: "mist", foggy: "mist", clear_sky: "clear" };
  const resolved = aliases[normalized] || normalized;
  return VALID_WEATHER_IDS.has(resolved) ? resolved : "clear";
}

function normalizeChapterNo(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 7 ? numeric : null;
}

function normalizeOptionalId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function invitationFailure(reason, rhythm) {
  return { ok: false, reason, rhythm, invitation: null };
}

function resultFailure(reason) {
  return { ok: false, reason, result: null };
}
