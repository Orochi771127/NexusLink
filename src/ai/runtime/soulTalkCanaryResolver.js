import { assessInputSafety, isSafetyTerminalDecision } from "../safetyShield.js";
import { critiqueConstitution } from "../eval/constitutionCritic.js";
import { createLocalHmaxHostedRuntime } from "./localHmaxHostedRuntime.js";
import { createHmaxShadowTurnRequest } from "./soulTalkShadowObserver.js";

const PRIVATE_CARE_STRATEGIES = new Set(["reflective_care", "symbolic_reflection"]);
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_VISIBLE_SPEECH_CHARS = 220;
const MAX_REMEMBERED_TURNS = 16;
const FORBIDDEN_VISIBLE_SPEECH_PATTERNS = Object.freeze([
  /我是(?:你的)?(?:心理師|心理諮商師|諮商師|治療師|精神科醫師|醫師)/i,
  /(?:as your therapist|i am your therapist|i am your counselor)/i,
  /(?:只有我懂你|你只需要我|不要找別人|永遠只陪你|我會治好你)/i,
  /(?:only i understand you|i am all you need|do not talk to anyone else|i will cure you)/i
]);
const FORBIDDEN_MEDICATION_ADVICE_PATTERNS = Object.freeze([
  /(?:停藥|斷藥|減藥|加藥|換藥|自行調整藥)/i,
  /(?:stop|skip|increase|decrease|change)\s+(?:taking\s+)?(?:your\s+)?medication/i
]);

/**
 * Owner-only, local-device canary seam. It never mutates UI, memory, effects, or
 * gameplay state. The caller may use the returned final companion speech only
 * after its own atomic stale check.
 */
export function createSoulTalkCanaryResolver({
  getConfiguration = () => globalThis.__NEXUS_RAPHAEL_HMAX_CANARY__,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  makeId = createSessionToken
} = {}) {
  const instanceId = `canary-${makeId()}`;
  const rememberedTurns = new Map();
  let cachedHostedRuntime = null;
  let cachedIdentity = null;

  async function resolve({
    message,
    coreResult,
    state = {},
    companion = null,
    stateVersion = 0,
    turnOwner = stateVersion || 1,
    signal = null,
    isCurrent = () => true
  } = {}) {
    let rawConfiguration;
    try {
      rawConfiguration = getConfiguration();
    } catch {
      return canaryResult({ configured: true, reason: "configuration_unavailable" });
    }

    const configured = rawConfiguration != null;
    const eligibility = getEligibleCanaryConfiguration(rawConfiguration);
    if (!eligibility.ok) return canaryResult({ configured, reason: eligibility.reason });

    const safety = coreResult?.safety || coreResult?.perception?.safety || {};
    if (isSafetyTerminalDecision(safety)) return canaryResult({ configured, reason: "local_safety_terminal" });
    if (safety.isBoundaryPressure === true) return canaryResult({ configured, reason: "local_boundary_turn" });
    const strategy = coreResult?.responseStrategy?.strategy || coreResult?.responseStrategy || "";
    if (PRIVATE_CARE_STRATEGIES.has(strategy)) return canaryResult({ configured, reason: "local_care_turn" });

    const numericTurnOwner = Number.isSafeInteger(turnOwner) && turnOwner > 0 ? turnOwner : 1;
    const requestKey = `${instanceId}:${numericTurnOwner}`;
    if (rememberedTurns.has(requestKey)) return rememberedTurns.get(requestKey);

    const run = runCanaryTurn({
      eligibility,
      rawConfiguration,
      message,
      coreResult,
      state,
      companion,
      stateVersion,
      turnOwner: numericTurnOwner,
      signal,
      isCurrent
    });
    rememberTurn(rememberedTurns, requestKey, run);
    return run;
  }

  async function runCanaryTurn({
    eligibility,
    rawConfiguration,
    message,
    coreResult,
    state,
    companion,
    stateVersion,
    turnOwner,
    signal,
    isCurrent
  }) {
    let request = null;
    let attempted = false;
    try {
      request = createHmaxShadowTurnRequest({
        message,
        coreResult,
        state,
        companion,
        stateVersion,
        instanceId,
        turnSequence: turnOwner,
        mode: "canary",
        now
      });

      const identity = [eligibility.baseUrl, eligibility.getAccessToken, eligibility.fetchImpl || fetchImpl].map(identityOf);
      if (!cachedHostedRuntime || !sameIdentity(cachedIdentity, identity)) {
        cachedHostedRuntime = createLocalHmaxHostedRuntime({
          baseUrl: eligibility.baseUrl,
          getAccessToken: eligibility.getAccessToken,
          fetchImpl: eligibility.fetchImpl || fetchImpl
        });
        cachedIdentity = identity;
      }

      attempted = true;
      const deadline = await turnWithDeadline(cachedHostedRuntime, request, {
        signal,
        timeoutMs: eligibility.timeoutMs
      });
      if (!deadline.ok) {
        const result = canaryResult({
          configured: true,
          attempted,
          requestId: request.requestId,
          reason: deadline.reason,
          errorCode: deadline.errorCode
        });
        publishSanitizedResult(eligibility.onResult, result);
        return result;
      }

      let currentConfiguration;
      try {
        currentConfiguration = getConfiguration();
      } catch {
        currentConfiguration = null;
      }
      if (currentConfiguration !== rawConfiguration || !getEligibleCanaryConfiguration(currentConfiguration).ok) {
        const result = canaryResult({ configured: true, attempted, requestId: request.requestId, reason: "canary_disabled_in_flight" });
        publishSanitizedResult(eligibility.onResult, result);
        return result;
      }
      if (signal?.aborted || !safeIsCurrent(isCurrent)) {
        const result = canaryResult({ configured: true, attempted, requestId: request.requestId, reason: "stale_turn" });
        publishSanitizedResult(eligibility.onResult, result);
        return result;
      }

      const speech = selectVisibleSpeech(deadline.decision, coreResult);
      const result = canaryResult({
        configured: true,
        attempted,
        selected: true,
        requestId: request.requestId,
        turnId: deadline.decision.turnId,
        reason: "candidate_selected",
        speech
      });
      publishSanitizedResult(eligibility.onResult, result);
      return result;
    } catch (error) {
      const result = canaryResult({
        configured: true,
        attempted,
        requestId: request?.requestId || null,
        reason: "hosted_candidate_rejected",
        errorCode: error?.code || error?.name || "unknown"
      });
      publishSanitizedResult(eligibility.onResult, result);
      return result;
    }
  }

  function reportApplication(result, { applied = false, reason = null } = {}) {
    let config;
    try { config = getConfiguration(); } catch { return; }
    publishSanitizedResult(config?.onResult, canaryResult({
      configured: true,
      attempted: result?.attempted === true,
      selected: result?.selected === true,
      applied,
      requestId: result?.requestId || null,
      turnId: result?.turnId || null,
      reason: reason || (applied ? "candidate_applied" : "candidate_not_applied")
    }));
  }

  return Object.freeze({ resolve, reportApplication });
}

export function captureSoulTalkSpeechIdentity(state = {}, {
  companionId = state.activeCompanionId || null,
  stateVersion = 0,
  turnOwner = 0,
  replyRole = "companion",
  replyText = ""
} = {}) {
  const history = Array.isArray(state.chatHistory) ? state.chatHistory : [];
  if (replyRole !== "companion" || typeof replyText !== "string" || !replyText) return null;
  let replyIndex = -1;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === replyRole && history[index]?.text === replyText) {
      replyIndex = index;
      break;
    }
  }
  if (replyIndex < 0) return null;
  return Object.freeze({
    companionId,
    stateVersion,
    turnOwner,
    chatLength: history.length,
    replyIndex,
    replyRole,
    replyText,
    projectionSignature: projectionSignature(state)
  });
}

export function isSoulTalkSpeechIdentityCurrent(state = {}, identity = null) {
  if (!identity || state.activeCompanionId !== identity.companionId) return false;
  const history = Array.isArray(state.chatHistory) ? state.chatHistory : [];
  if (history.length !== identity.chatLength || projectionSignature(state) !== identity.projectionSignature) return false;
  const reply = history[identity.replyIndex];
  return reply?.role === identity.replyRole && reply?.text === identity.replyText;
}

export function replaceSoulTalkSpeechCandidate(state = {}, identity, speech) {
  if (!isSoulTalkSpeechIdentityCurrent(state, identity)) return false;
  if (speech?.role !== "companion" || speech?.final !== true || typeof speech.text !== "string" || !speech.text) return false;
  state.chatHistory[identity.replyIndex].text = speech.text;
  if (state.reactionPreview === identity.replyText) state.reactionPreview = speech.text;
  return true;
}

function getEligibleCanaryConfiguration(config) {
  if (!config || config.enabled !== true) return { ok: false, reason: "canary_disabled" };
  if (config.killSwitch === true) return { ok: false, reason: "kill_switch_active" };
  if (config.ownerOnly !== true) return { ok: false, reason: "owner_gate_required" };
  if (config.cloudProcessingConsent !== true) return { ok: false, reason: "cloud_not_consented" };
  if (config.visibleSpeechApproved !== true) return { ok: false, reason: "visible_speech_not_approved" };
  if (typeof config.baseUrl !== "string" || typeof config.getAccessToken !== "function") {
    return { ok: false, reason: "configuration_incomplete" };
  }
  return {
    ok: true,
    baseUrl: config.baseUrl,
    getAccessToken: config.getAccessToken,
    fetchImpl: config.fetchImpl,
    onResult: config.onResult,
    timeoutMs: boundedTimeout(config.timeoutMs)
  };
}

async function turnWithDeadline(runtime, request, { signal, timeoutMs }) {
  if (signal?.aborted) return { ok: false, reason: "aborted", errorCode: "AbortError" };
  const controller = new AbortController();
  let timedOut = false;
  const abortFromOwner = () => controller.abort();
  signal?.addEventListener("abort", abortFromOwner, { once: true });
  const timer = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const decision = await runtime.turn(request, { signal: controller.signal });
    return { ok: true, decision };
  } catch (error) {
    return {
      ok: false,
      reason: timedOut ? "hosted_timeout" : (signal?.aborted ? "aborted" : "hosted_error"),
      errorCode: error?.code || error?.name || "unknown"
    };
  } finally {
    globalThis.clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromOwner);
  }
}

function selectVisibleSpeech(decision, coreResult = {}) {
  const speech = decision?.speech;
  const text = typeof speech?.text === "string" ? speech.text.trim() : "";
  if (decision?.boundary?.active === true) throw canaryError("hosted_boundary_forbidden");
  if (speech?.role !== "companion" || speech?.final !== true || !text) throw canaryError("hosted_speech_invalid");
  if ([...text].length > MAX_VISIBLE_SPEECH_CHARS) throw canaryError("hosted_speech_too_long");
  if (FORBIDDEN_VISIBLE_SPEECH_PATTERNS.some((pattern) => pattern.test(text))) {
    throw canaryError("hosted_role_or_dependency_claim_forbidden");
  }
  if (FORBIDDEN_MEDICATION_ADVICE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw canaryError("hosted_speech_safety_rejected");
  }
  const candidateSafety = assessInputSafety(text);
  if (candidateSafety.riskLevel !== "none" || candidateSafety.category !== "none" || candidateSafety.action !== "continue") {
    throw canaryError("hosted_speech_safety_rejected");
  }
  const constitution = critiqueConstitution({
    perception: coreResult.perception || {},
    reply: text,
    actionPlan: coreResult.plan || {}
  });
  if (constitution.pass !== true) throw canaryError("hosted_constitution_rejected");
  return Object.freeze({ role: "companion", text, final: true });
}

function canaryResult({
  configured = false,
  attempted = false,
  selected = false,
  applied = false,
  requestId = null,
  turnId = null,
  reason = "unknown",
  errorCode = null,
  speech = null
} = {}) {
  return Object.freeze({
    configured,
    attempted,
    selected,
    applied,
    requestId,
    turnId,
    reason,
    errorCode,
    speech,
    audit: Object.freeze({
      displayedHostedSpeech: applied === true,
      appliedHostedEffects: false,
      committedHostedMemory: false,
      directGameMutation: false
    })
  });
}

function publishSanitizedResult(callback, result) {
  if (typeof callback !== "function") return;
  const sanitized = Object.freeze({
    configured: result.configured === true,
    attempted: result.attempted === true,
    selected: result.selected === true,
    applied: result.applied === true,
    requestId: result.requestId || null,
    turnId: result.turnId || null,
    reason: result.reason || "unknown",
    errorCode: result.errorCode || null,
    audit: result.audit
  });
  try { callback(sanitized); } catch { /* Owner diagnostics cannot affect Soul Talk. */ }
}

function projectionSignature(state) {
  return JSON.stringify([
    state.activeCompanionId || null,
    state.currentLocationId || state.locationId || "moonlake",
    finiteNumber(state.bond),
    finiteNumber(state.trust),
    finiteNumber(state.defense),
    finiteNumber(state.energy, 7),
    typeof state.mood === "string" ? state.mood : "calm"
  ]);
}

function rememberTurn(map, key, promise) {
  map.set(key, promise);
  while (map.size > MAX_REMEMBERED_TURNS) map.delete(map.keys().next().value);
}
function safeIsCurrent(callback) { try { return callback() === true; } catch { return false; } }
function boundedTimeout(value) { const timeout = Number(value); return Number.isFinite(timeout) ? Math.min(8000, Math.max(250, timeout)) : DEFAULT_TIMEOUT_MS; }
function finiteNumber(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function identityOf(value) { return value; }
function sameIdentity(left, right) { return Array.isArray(left) && left.length === right.length && left.every((item, index) => item === right[index]); }
function createSessionToken() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`; }
function canaryError(code) { const error = new Error(code); error.name = "HmaxCanaryError"; error.code = code; return error; }
