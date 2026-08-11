import { isSafetyTerminalDecision } from "../safetyShield.js";
import { projectRaphaelCoreResultToDecision } from "./embeddedRaphaelRuntime.js";
import { createLocalHmaxHostedRuntime } from "./localHmaxHostedRuntime.js";
import { RAPHAEL_CONTRACT_VERSION, freezeTurnContext } from "./raphaelRuntimeContract.js";
import { createRaphaelShadowClient } from "./raphaelShadowClient.js";

const PRIVATE_CARE_STRATEGIES = new Set(["reflective_care", "symbolic_reflection"]);
const DEFAULT_TIMEOUT_MS = 8000;

export function createSoulTalkShadowObserver({
  getConfiguration = () => globalThis.__NEXUS_RAPHAEL_HMAX_SHADOW__,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  makeId = createSessionToken
} = {}) {
  const instanceId = `shadow-${makeId()}`;
  let turnSequence = 0;
  let cachedHostedRuntime = null;
  let cachedIdentity = null;

  return Object.freeze({
    async observe({ message, coreResult, state = {}, companion = null, stateVersion = 0 } = {}) {
      const safety = coreResult?.safety || coreResult?.perception?.safety || {};
      if (isSafetyTerminalDecision(safety)) return skipped("local_safety_terminal");
      if (state?.safeHarborMode === true) return skipped("local_crisis_continuity");
      if (safety.isBoundaryPressure === true) return skipped("local_boundary_turn");

      const strategy = coreResult?.responseStrategy?.strategy || coreResult?.responseStrategy || "";
      if (PRIVATE_CARE_STRATEGIES.has(strategy)) return skipped("local_care_turn");

      let rawConfiguration;
      try { rawConfiguration = getConfiguration(); } catch { return skipped("configuration_unavailable"); }
      const config = getEligibleConfiguration(rawConfiguration);
      if (!config.ok) return skipped(config.reason);

      try {
        turnSequence += 1;
        const request = createHmaxShadowTurnRequest({
          message,
          coreResult,
          state,
          companion,
          stateVersion,
          instanceId,
          turnSequence,
          now
        });
        const identity = [config.baseUrl, config.getAccessToken, config.fetchImpl || fetchImpl, config.timeoutMs].map(identityOf);
        if (!cachedHostedRuntime || !sameIdentity(cachedIdentity, identity)) {
          cachedHostedRuntime = createLocalHmaxHostedRuntime({
            baseUrl: config.baseUrl,
            getAccessToken: config.getAccessToken,
            fetchImpl: config.fetchImpl || fetchImpl
          });
          cachedIdentity = identity;
        }

        const embeddedRuntime = Object.freeze({
          async turn(frozenRequest, { signal } = {}) {
            if (signal?.aborted) throw abortError();
            return projectRaphaelCoreResultToDecision(coreResult, frozenRequest, {
              coreVersion: "nexuslink-live-shadow-baseline-v1",
              turnId: `live:${frozenRequest.requestId}`
            });
          }
        });
        const shadowClient = createRaphaelShadowClient({
          hostedRuntime: cachedHostedRuntime,
          embeddedRuntime,
          timeoutMs: config.timeoutMs,
          now
        });
        const result = await shadowClient.compare(request);
        publishSanitizedResult(config.onResult, result);
        return result;
      } catch (error) {
        const result = {
          requestId: null,
          shadowAttempted: false,
          reason: "configuration_or_contract_error",
          errorCode: error?.code || error?.name || "unknown",
          decision: null,
          audit: shadowAudit()
        };
        publishSanitizedResult(config.onResult, result);
        return result;
      }
    }
  });
}

export function createHmaxShadowTurnRequest({
  message,
  coreResult = {},
  state = {},
  companion = null,
  stateVersion = 0,
  instanceId = "shadow-fixture",
  turnSequence = 1,
  mode = "shadow",
  now = () => Date.now()
} = {}) {
  const sequence = Number.isSafeInteger(turnSequence) && turnSequence > 0 ? turnSequence : 1;
  const safeStateVersion = Number.isSafeInteger(stateVersion) && stateVersion >= 0 ? stateVersion : sequence;
  const suffix = `${instanceId}-${sequence}`;
  const companionId = companion?.id || state.activeCompanionId || "greyshade-cat";
  const timestamp = new Date(Number(coreResult.now) || now()).toISOString();
  const requestMode = mode === "canary" ? "canary" : "shadow";

  return freezeTurnContext({
    contractVersion: RAPHAEL_CONTRACT_VERSION,
    requestId: `req-${suffix}`.slice(0, 128),
    idempotencyKey: `idem-${suffix}`.slice(0, 128),
    client: {
      productId: "nexus-link",
      clientVersion: `${requestMode}-v1`,
      instanceId: String(instanceId).slice(0, 128),
      locale: "zh-TW"
    },
    actor: {
      companionId,
      personaVersion: companion?.personaVersion || "nexus-persona-v1"
    },
    input: {
      text: String(message || ""),
      source: `soul_talk_${requestMode}`,
      timestamp
    },
    context: {
      stateVersion: safeStateVersion,
      scene: {
        surface: "soul_talk",
        locationId: state.locationId || state.currentLocationId || "moonlake"
      },
      relationship: {
        bond: finiteNumber(state.bond),
        trust: finiteNumber(state.trust),
        defense: finiteNumber(state.defense)
      },
      currentTurnSignals: {
        energy: finiteNumber(state.energy, 7),
        mood: typeof state.mood === "string" ? state.mood : "calm"
      }
    },
    allowedEffects: [],
    consent: {
      cloudProcessing: true,
      retention: "none",
      careProcessing: "not_care"
    },
    capabilities: {
      embeddedFallback: true,
      memoryProposals: false,
      effectProposals: false
    }
  });
}

function getEligibleConfiguration(config) {
  if (!config || config.enabled !== true) return { ok: false, reason: "shadow_disabled" };
  if (config.ownerOnly !== true) return { ok: false, reason: "owner_gate_required" };
  if (config.cloudProcessingConsent !== true) return { ok: false, reason: "cloud_not_consented" };
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

function publishSanitizedResult(callback, result) {
  if (typeof callback !== "function") return;
  const sanitized = Object.freeze({
    requestId: result.requestId || null,
    shadowAttempted: result.shadowAttempted === true,
    reason: result.reason || "unknown",
    errorCode: result.errorCode || null,
    comparison: result.comparison ? Object.freeze({ ...result.comparison }) : null,
    elapsedMs: Number.isFinite(result.elapsedMs) ? result.elapsedMs : null,
    audit: Object.freeze({ ...(result.audit || shadowAudit()) })
  });
  try { callback(sanitized); } catch { /* Owner-only diagnostics cannot affect Soul Talk. */ }
}

function skipped(reason) {
  return Promise.resolve({ requestId: null, shadowAttempted: false, reason, decision: null, audit: shadowAudit() });
}
function shadowAudit() { return { displayedHostedSpeech: false, appliedHostedEffects: false, committedHostedMemory: false }; }
function finiteNumber(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function boundedTimeout(value) { const timeout = Number(value); return Number.isFinite(timeout) ? Math.min(8000, Math.max(250, timeout)) : DEFAULT_TIMEOUT_MS; }
function identityOf(value) { return value; }
function sameIdentity(left, right) { return Array.isArray(left) && left.length === right.length && left.every((item, index) => item === right[index]); }
function createSessionToken() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`; }
function abortError() { const error = new Error("Raphael shadow baseline aborted"); error.name = "AbortError"; return error; }
