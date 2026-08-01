// 共鳴圈 R2：session-only 的準備、領拍自主判斷與單次共鳴請託。
//
// 本模組只做決策，不執行 battleEngine 行動、不結算、不寫 store / Growth /
// relationship / memory。battleEngine 仍是對峙數值的唯一權威；controller 取得
// leadDecision 後，才可呼叫既有 applyPlayerAction / applyNoiseTurn。

import { canUseAction, MAX_FATIGUE } from "./battleEngine.js";
import {
  deriveResonanceCircle,
  getCircleStance,
  listEligibleResonanceCompanions
} from "./resonanceCircleEngine.js";
import { deriveHeartPhaseSnapshot } from "./companionGrowthSessionEngine.js";
import { resolveRelationshipForJudgment } from "../state/relationshipAuthorityGuard.js";

export const STANDOFF_CONTROL_MODES = Object.freeze(["manual", "entrusted"]);
export const STANDOFF_APPROACHES = Object.freeze(["adaptive", "attune", "shelter"]);
export const STANDOFF_REQUEST_ACTIONS = Object.freeze(["barrier", "resonance", "pulse"]);
export const STANDOFF_PARTICIPATION_OUTCOMES = Object.freeze([
  "accept",
  "rewrite",
  "rest",
  "decline"
]);
export const MAX_AUTONOMOUS_BEATS = 20;

const CONTROL_MODE_SET = new Set(STANDOFF_CONTROL_MODES);
const APPROACH_SET = new Set(STANDOFF_APPROACHES);
const REQUEST_ACTION_SET = new Set(STANDOFF_REQUEST_ACTIONS);
const PARTICIPATION_OUTCOME_SET = new Set(STANDOFF_PARTICIPATION_OUTCOMES);
const EXPLICIT_BOUNDARY_REACTIONS = new Set(["reject", "blocked", "spam_angry"]);

const ACTION_PRESENTATION = Object.freeze({
  barrier: Object.freeze({
    animationIntent: "standoff.barrier",
    bodyCueId: "stand_forward"
  }),
  resonance: Object.freeze({
    animationIntent: "standoff.resonance",
    bodyCueId: "listen_together"
  }),
  pulse: Object.freeze({
    animationIntent: "standoff.pulse",
    bodyCueId: "soften_breath"
  })
});

/**
 * 建立本場共鳴協議。preferredIds 若明示提供，無效候選會被排除且不自動補位。
 * safeHarborMode 是終端：不產生參與回應變體，也不建立可運行的自主 session。
 */
export function deriveStandoffPreparation(state = {}, options = {}) {
  const sourceOptions = options && typeof options === "object" ? options : {};
  const {
    preferredIds,
    controlMode = "manual",
    approach = "adaptive"
  } = sourceOptions;
  const normalizedControlMode = normalizeControlMode(controlMode);
  const normalizedApproach = normalizeApproach(approach);
  const eligibleCompanionIds = listEligibleResonanceCompanions(state).map(({ id }) => id);

  if (state?.safeHarborMode === true) {
    return {
      ok: false,
      reason: "safety-paused",
      version: 1,
      safetyPaused: true,
      controlMode: "manual",
      approach: normalizedApproach,
      eligibleCompanionIds,
      invitedIds: [],
      participation: [],
      companions: []
    };
  }

  const circleOptions = Object.prototype.hasOwnProperty.call(sourceOptions, "preferredIds")
    ? { preferredIds }
    : undefined;
  const invited = deriveResonanceCircle(state, circleOptions);
  const participation = invited.map((companion) => deriveParticipation(state, companion));
  const participatingIds = new Set(
    participation
      .filter(({ outcomeId }) => outcomeId === "accept" || outcomeId === "rewrite")
      .map(({ companionId }) => companionId)
  );

  return {
    ok: true,
    reason: null,
    version: 1,
    safetyPaused: false,
    controlMode: normalizedControlMode,
    approach: normalizedApproach,
    eligibleCompanionIds,
    invitedIds: invited.map(({ id }) => id),
    participation,
    companions: invited.filter(({ id }) => participatingIds.has(id))
  };
}

/** 建立不持久化的自主控制狀態。 */
export function createStandoffAutonomyState(preparation = {}, {
  sessionKey = "",
  leadCompanionId = ""
} = {}) {
  const safetyPaused = preparation?.ok === false || preparation?.safetyPaused === true;
  return {
    version: 1,
    sessionKey: normalizeText(sessionKey),
    leadCompanionId: normalizeText(leadCompanionId),
    controlMode: safetyPaused ? "manual" : normalizeControlMode(preparation?.controlMode),
    approach: normalizeApproach(preparation?.approach),
    participation: sanitizeParticipation(preparation?.participation),
    beatCount: 0,
    maxBeats: MAX_AUTONOMOUS_BEATS,
    paused: safetyPaused,
    pauseReason: safetyPaused ? "safety-paused" : null,
    safetyPaused,
    request: {
      used: false,
      consumed: false,
      pending: false,
      targetId: null,
      outcomeId: null,
      requestedActionId: null,
      resolvedActionId: null,
      reasonId: null
    },
    nextActionOverride: null
  };
}

/**
 * 只推導下一個 lead action，不執行它。相同 session + autonomy 必然得到相同結果。
 */
export function deriveAutonomousLeadDecision(session, autonomy = {}) {
  const guard = validateAutonomousTurn(session, autonomy);
  if (guard) return { ok: false, reason: guard, leadDecision: null };

  let actionId;
  let reasonId;
  let bodyCueId;

  if (autonomy.nextActionOverride?.actionId) {
    const override = autonomy.nextActionOverride;
    if (isRequestedActionSafe(session, override.actionId)) {
      actionId = override.actionId;
      reasonId = override.reasonId || "request_accepted";
      bodyCueId = override.bodyCueId || ACTION_PRESENTATION[actionId]?.bodyCueId;
    } else {
      actionId = chooseProtectiveAction(session);
      reasonId = "request_revalidated_for_safety";
      bodyCueId = ACTION_PRESENTATION[actionId]?.bodyCueId;
    }
  } else {
    const choice = chooseApproachAction(session, normalizeApproach(autonomy.approach));
    actionId = choice.actionId;
    reasonId = choice.reasonId;
    bodyCueId = choice.bodyCueId;
  }

  const presentation = ACTION_PRESENTATION[actionId] || ACTION_PRESENTATION.resonance;
  return {
    ok: true,
    reason: null,
    leadDecision: {
      companionId: session.companionId,
      actionId,
      reasonId,
      animationIntent: presentation.animationIntent,
      bodyCueId: bodyCueId || presentation.bodyCueId,
      beatIndex: finiteInteger(autonomy.beatCount, 0) + 1
    }
  };
}

/**
 * controller 在 battleEngine 完成一個完整 lead/noise beat 後呼叫。
 * 第 20 拍只會把自主流程暫停，不會代替 battleEngine 判定任何結局。
 */
export function markAutonomousBeatComplete(autonomy = {}) {
  const current = finiteInteger(autonomy.beatCount, 0);
  const maxBeats = normalizeMaxBeats(autonomy.maxBeats);
  const beatCount = Math.min(maxBeats, current + 1);
  const limitReached = beatCount >= maxBeats;
  const nextAutonomy = {
    ...autonomy,
    beatCount,
    maxBeats,
    paused: limitReached ? true : Boolean(autonomy.paused),
    pauseReason: limitReached ? "max-beats" : autonomy.pauseReason || null,
    request: {
      ...normalizeRequestRecord(autonomy.request),
      pending: false
    },
    nextActionOverride: null
  };

  return {
    nextAutonomy,
    beatMetadata: getAutonomyBeatMetadata(nextAutonomy)
  };
}

export function getAutonomyBeatMetadata(autonomy = {}) {
  const maxBeats = normalizeMaxBeats(autonomy.maxBeats);
  const beatCount = Math.min(maxBeats, finiteInteger(autonomy.beatCount, 0));
  const remainingBeats = Math.max(0, maxBeats - beatCount);
  const limitReached = remainingBeats === 0;
  return {
    beatCount,
    maxBeats,
    remainingBeats,
    limitReached,
    shouldPause: limitReached || Boolean(autonomy.paused),
    pauseReason: limitReached ? "max-beats" : autonomy.pauseReason || null
  };
}

/**
 * 解析每場唯一一次「共鳴請託」。合法請託不論接受、改寫、休息或拒絕都會
 * consumed；無效 target/action、owner mismatch 與 safety terminal 不會偽造回應。
 */
export function resolveStandoffRequest({
  state = {},
  session,
  autonomy = {},
  targetId = "",
  requestedActionId = ""
} = {}) {
  const unchanged = normalizeAutonomyReference(autonomy);
  if (state?.safeHarborMode === true || autonomy?.safetyPaused === true || session?.growthSafetyExcluded === true) {
    return failedRequest("safety-paused", unchanged);
  }
  if (autonomy?.request?.used === true) return failedRequest("request-already-used", unchanged);
  if (!REQUEST_ACTION_SET.has(requestedActionId)) return failedRequest("unknown-request-action", unchanged);
  if (!session || session.turn !== "player") return failedRequest("not-player-turn", unchanged);
  if (autonomy?.leadCompanionId && autonomy.leadCompanionId !== session.companionId) {
    return failedRequest("owner-mismatch", unchanged);
  }

  const normalizedTargetId = normalizeText(targetId);
  const isLead = normalizedTargetId && normalizedTargetId === session.companionId;
  const participant = sanitizeParticipation(autonomy?.participation)
    .find(({ companionId }) => companionId === normalizedTargetId);
  const circleMember = Array.isArray(session.circle)
    ? session.circle.find(({ id }) => id === normalizedTargetId)
    : null;
  const isSupport = Boolean(
    participant
    && circleMember
    && (participant.outcomeId === "accept" || participant.outcomeId === "rewrite")
  );
  if (!isLead && !isSupport) return failedRequest("invalid-request-target", unchanged);

  const relationshipView = getRelationshipView(state, normalizedTargetId);
  let outcomeId;
  let resolvedActionId = null;
  let reasonId;
  let bodyCueId;

  if ((isSupport && circleMember.resting === true) || (isLead && session.fatigue >= MAX_FATIGUE)) {
    outcomeId = "rest";
    reasonId = "companion_needs_rest";
    bodyCueId = "settle_back";
  } else if (relationshipView.phaseId === "resting") {
    outcomeId = "rest";
    reasonId = "heart_phase_resting";
    bodyCueId = "settle_back";
  } else if (hasExplicitBoundary(relationshipView.relationship)) {
    outcomeId = "decline";
    reasonId = "explicit_boundary_declined";
    bodyCueId = "hold_distance";
  } else if (relationshipView.phaseId === "guarded") {
    outcomeId = "rewrite";
    resolvedActionId = chooseProtectiveAction(session);
    reasonId = "guarded_rewrites_request";
    bodyCueId = "circle_edge";
  } else if (!isRequestedActionSafe(session, requestedActionId)) {
    outcomeId = "rewrite";
    resolvedActionId = chooseProtectiveAction(session, requestedActionId);
    reasonId = "request_rewritten_for_safety";
    bodyCueId = ACTION_PRESENTATION[resolvedActionId]?.bodyCueId || "stand_forward";
  } else {
    outcomeId = "accept";
    resolvedActionId = requestedActionId;
    reasonId = "request_accepted";
    bodyCueId = relationshipView.phaseId === "curious" ? "lean_in" : "step_closer";
  }

  const requestResult = {
    targetId: normalizedTargetId,
    outcomeId,
    requestedActionId,
    resolvedActionId,
    reasonId,
    bodyCueId,
    consumed: true
  };
  const nextActionOverride = resolvedActionId
    ? {
        actionId: resolvedActionId,
        targetId: normalizedTargetId,
        outcomeId,
        reasonId,
        bodyCueId
      }
    : null;
  const nextAutonomy = {
    ...unchanged,
    request: {
      used: true,
      consumed: true,
      pending: Boolean(nextActionOverride),
      targetId: normalizedTargetId,
      outcomeId,
      requestedActionId,
      resolvedActionId,
      reasonId
    },
    nextActionOverride
  };

  return {
    ok: true,
    reason: null,
    nextAutonomy,
    requestResult,
    nextActionOverride
  };
}

function deriveParticipation(state, companion) {
  const { phaseId, relationship } = getRelationshipView(state, companion.id);
  const stance = getCircleStance(companion.element || "neutral");
  let outcomeId;
  let bodyCueId;
  let reasonId;

  if (phaseId === "resting") {
    outcomeId = "rest";
    bodyCueId = "settle_back";
    reasonId = "heart_phase_resting";
  } else if (hasExplicitBoundary(relationship)) {
    outcomeId = "decline";
    bodyCueId = "hold_distance";
    reasonId = "explicit_boundary_declined";
  } else if (phaseId === "guarded") {
    outcomeId = "rewrite";
    bodyCueId = "circle_edge";
    reasonId = "guarded_rewrites_distance";
  } else {
    outcomeId = "accept";
    bodyCueId = phaseId === "curious" ? "lean_in" : "step_closer";
    reasonId = phaseId === "curious" ? "curious_and_ready" : "steady_and_ready";
  }

  const participates = outcomeId === "accept" || outcomeId === "rewrite";
  return {
    companionId: companion.id,
    phaseId,
    outcomeId,
    stanceId: participates ? stance.id : null,
    bodyCueId,
    reasonId
  };
}

function chooseApproachAction(session, approach) {
  if (requiresProtectiveBarrier(session)) {
    return actionChoice("barrier", protectiveReason(session));
  }

  const stabilityRatio = getStabilityRatio(session);
  if (approach === "shelter") {
    if ((Number(session.boundary) || 0) < 2 || stabilityRatio < 0.8) {
      return actionChoice("barrier", "shelter_maintains_boundary");
    }
    return actionChoice("resonance", "shelter_boundary_is_steady");
  }

  if (approach === "attune") {
    if (stabilityRatio <= 0.55) return actionChoice("barrier", "attune_stability_low");
    return actionChoice("resonance", "attune_listens_first");
  }

  if (session.nextIntent === "surge") return actionChoice("barrier", "adaptive_reads_surge");
  if (session.nextIntent === "gather") return actionChoice("resonance", "adaptive_reads_gather");
  if (session.nextIntent === "lull" && isPulseSafe(session)) {
    return actionChoice("pulse", "adaptive_uses_safe_lull");
  }
  return actionChoice("resonance", "adaptive_follows_quiet");
}

function actionChoice(actionId, reasonId) {
  const presentation = ACTION_PRESENTATION[actionId] || ACTION_PRESENTATION.resonance;
  return { actionId, reasonId, bodyCueId: presentation.bodyCueId };
}

function requiresProtectiveBarrier(session) {
  const stabilityRatio = getStabilityRatio(session);
  return stabilityRatio <= 0.35
    || finiteNumber(session?.fatigue, 0) >= MAX_FATIGUE - 1
    || (session?.nextIntent === "surge" && finiteNumber(session?.boundary, 0) <= 0);
}

function protectiveReason(session) {
  if (getStabilityRatio(session) <= 0.35) return "stability_needs_boundary";
  if (finiteNumber(session?.fatigue, 0) >= MAX_FATIGUE - 1) return "fatigue_needs_boundary";
  return "surge_without_boundary";
}

function isPulseSafe(session) {
  return getStabilityRatio(session) > 0.55
    && finiteNumber(session?.fatigue, 0) <= MAX_FATIGUE - 2
    && canUseAction(session, "pulse");
}

function isRequestedActionSafe(session, actionId) {
  if (!REQUEST_ACTION_SET.has(actionId) || !canUseAction(session, actionId)) return false;
  if (requiresProtectiveBarrier(session) && actionId !== "barrier") return false;
  if (actionId === "pulse") return isPulseSafe(session);
  return true;
}

function chooseProtectiveAction(session, requestedActionId = null) {
  if (requiresProtectiveBarrier(session) && canUseAction(session, "barrier")) return "barrier";
  if (requestedActionId === "pulse" && canUseAction(session, "resonance")) return "resonance";
  return canUseAction(session, "barrier") ? "barrier" : "resonance";
}

function validateAutonomousTurn(session, autonomy) {
  if (!session || session.turn !== "player") return "not-player-turn";
  if (session.growthSafetyExcluded === true || autonomy?.safetyPaused === true) return "safety-paused";
  if (autonomy?.controlMode !== "entrusted") return "manual-control";
  if (autonomy?.leadCompanionId && autonomy.leadCompanionId !== session.companionId) return "owner-mismatch";
  const metadata = getAutonomyBeatMetadata(autonomy);
  if (metadata.limitReached) return "max-beats";
  if (autonomy?.paused === true) return autonomy.pauseReason || "paused";
  return null;
}

function getRelationshipView(state, companionId) {
  const relationship = resolveRelationshipForJudgment(state, companionId);
  const snapshot = deriveHeartPhaseSnapshot({
    ...state,
    ...relationship,
    activeCompanionId: companionId
  });
  return {
    relationship,
    phaseId: snapshot.phaseId
  };
}

function hasExplicitBoundary(relationship = {}) {
  return relationship.mood === "distant"
    || EXPLICIT_BOUNDARY_REACTIONS.has(relationship.lastTouchReaction);
}

function sanitizeParticipation(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  for (const entry of value) {
    const companionId = normalizeText(entry?.companionId);
    if (!companionId || seen.has(companionId) || !PARTICIPATION_OUTCOME_SET.has(entry?.outcomeId)) continue;
    seen.add(companionId);
    result.push({
      companionId,
      phaseId: normalizeText(entry?.phaseId) || "steady",
      outcomeId: entry.outcomeId,
      stanceId: normalizeText(entry?.stanceId) || null,
      bodyCueId: normalizeText(entry?.bodyCueId) || null,
      reasonId: normalizeText(entry?.reasonId) || null
    });
  }
  return result.slice(0, 2);
}

function normalizeAutonomyReference(autonomy) {
  const source = autonomy && typeof autonomy === "object" ? autonomy : {};
  return {
    ...source,
    participation: sanitizeParticipation(source.participation),
    request: normalizeRequestRecord(source.request),
    nextActionOverride: source.nextActionOverride && typeof source.nextActionOverride === "object"
      ? { ...source.nextActionOverride }
      : null
  };
}

function normalizeRequestRecord(request) {
  const source = request && typeof request === "object" ? request : {};
  return {
    used: source.used === true,
    consumed: source.consumed === true,
    pending: source.pending === true,
    targetId: normalizeText(source.targetId) || null,
    outcomeId: PARTICIPATION_OUTCOME_SET.has(source.outcomeId) ? source.outcomeId : null,
    requestedActionId: REQUEST_ACTION_SET.has(source.requestedActionId) ? source.requestedActionId : null,
    resolvedActionId: REQUEST_ACTION_SET.has(source.resolvedActionId) ? source.resolvedActionId : null,
    reasonId: normalizeText(source.reasonId) || null
  };
}

function failedRequest(reason, autonomy) {
  return {
    ok: false,
    reason,
    nextAutonomy: autonomy,
    requestResult: null,
    nextActionOverride: autonomy.nextActionOverride || null
  };
}

function getStabilityRatio(session) {
  const max = finiteNumber(session?.stability?.max, 0);
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, finiteNumber(session?.stability?.current, 0) / max));
}

function normalizeControlMode(value) {
  return CONTROL_MODE_SET.has(value) ? value : "manual";
}

function normalizeApproach(value) {
  return APPROACH_SET.has(value) ? value : "adaptive";
}

function normalizeMaxBeats() {
  // R2 intentionally seals this cap; callers cannot extend an entrusted loop.
  return MAX_AUTONOMOUS_BEATS;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
