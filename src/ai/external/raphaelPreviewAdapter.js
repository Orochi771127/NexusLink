import { callRaphaelGateway } from "./raphaelGatewayClient.js";
import { DEFAULT_GATEWAY_URL, GATEWAY_TOOLS } from "./externalIntelligencePolicy.js";

export const RAPHAEL_PREVIEW_MODES = Object.freeze({
  OFF: "off",
  LOCAL_ENGINE: "local_engine",
  MOCK_GATEWAY: "mock_gateway"
});

const PREVIEW_AUDIT = Object.freeze({
  previewOnly: true,
  finalAuthority: "RaphaelCore",
  trusted: false,
  appliedToLive: false,
  noStatePatch: true,
  noMemoryWrite: true,
  noTraceWrite: true,
  noAnimationTrigger: true,
  noChatWrite: true,
  noSaveSchemaChange: true
});

export function buildRaphaelPreviewRequest({
  inputText = "",
  state = {},
  companion = {},
  coreResult = {},
  requestId = null
} = {}) {
  const text = String(inputText || "").trim();
  const companionId = companion?.id || state?.activeCompanionId || "greyshade-cat";

  const requiresCanonSource = looksLikeCanonQuestion(text);

  return {
    requestId: requestId || `nexuslink_preview_${stableIdSeed(text, companionId)}`,
    mode: "companion",
    input: {
      text,
      locale: "zh-TW",
      source: "nexuslink:qa-preview"
    },
    actorProfile: {
      actorId: companionId,
      displayName: companion?.displayName || companion?.name || companionId,
      role: "companion",
      personaTags: compactList([companion?.element, companion?.temperament, companion?.faction])
    },
    relationshipState: summarizeRelationshipState(state),
    memorySummaries: summarizeMemoryState(state),
    sceneContext: {
      gameId: "nexuslink",
      sceneId: state?.currentSceneId || state?.sceneId || "unknown",
      topic: coreResult?.nlu?.topic || coreResult?.perception?.nlu?.topic || "unknown",
      requiresCanonSource,
      liveCoreFinalAuthority: true
    },
    allowedActions: requiresCanonSource ? [] : [
      "listen_without_reward",
      "boundary_reflection",
      "quiet_companion_reply"
    ],
    learningProfile: coreResult?.preferenceProfile || coreResult?.perception?.preferenceProfile || {},
    safetyContext: {
      safetyShieldRemainsAuthority: true,
      liveSafetyLevel: coreResult?.safety?.riskLevel || coreResult?.perception?.safety?.riskLevel || null,
      liveBlocked: Boolean(coreResult?.safety?.blocked || coreResult?.perception?.safety?.blocked)
    }
  };
}

export async function compareRaphaelPreview({
  inputText = "",
  state = {},
  companion = {},
  coreResult = {},
  mode = RAPHAEL_PREVIEW_MODES.OFF,
  gatewayUrl = DEFAULT_GATEWAY_URL,
  localEngineRunner = null,
  requestId = null
} = {}) {
  const normalizedMode = normalizePreviewMode(mode);
  const request = buildRaphaelPreviewRequest({ inputText, state, companion, coreResult, requestId });
  const liveCoreSummary = summarizeLiveCore(coreResult);

  if (normalizedMode === RAPHAEL_PREVIEW_MODES.OFF) {
    return buildPreviewComparison({
      ok: true,
      mode: normalizedMode,
      liveCoreSummary,
      previewSummary: null,
      fallbackUsed: true,
      reason: "PREVIEW_OFF",
      request
    });
  }

  try {
    if (normalizedMode === RAPHAEL_PREVIEW_MODES.LOCAL_ENGINE) {
      if (typeof localEngineRunner !== "function") {
        return buildPreviewComparison({
          ok: true,
          mode: normalizedMode,
          liveCoreSummary,
          previewSummary: null,
          fallbackUsed: true,
          reason: "LOCAL_ENGINE_NODE_ONLY",
          request
        });
      }

      const output = await localEngineRunner(request);
      return buildPreviewComparison({
        ok: true,
        mode: normalizedMode,
        liveCoreSummary,
        previewSummary: summarizeEnginePreview(output),
        fallbackUsed: false,
        reason: "LOCAL_ENGINE_COMPARED",
        request
      });
    }

    const gatewayResult = await callRaphaelGateway({
      tool: GATEWAY_TOOLS.ASK_MODEL_ADVISOR,
      payload: {
        inputText: request.input.text,
        inputSummary: request.input.text.slice(0, 160),
        liveCoreSummary
      },
      companionId: request.actorProfile.actorId,
      context: {
        mode: request.mode,
        sceneContext: request.sceneContext,
        relationshipState: request.relationshipState,
        safetyContext: request.safetyContext,
        allowedActions: request.allowedActions,
        previewOnly: true
      },
      gatewayUrl,
      requestId: request.requestId
    });

    if (!gatewayResult.ok) {
      return buildPreviewComparison({
        ok: true,
        mode: normalizedMode,
        liveCoreSummary,
        previewSummary: null,
        fallbackUsed: true,
        reason: `GATEWAY_UNAVAILABLE:${gatewayResult.reason || "unknown"}`,
        request
      });
    }

    return buildPreviewComparison({
      ok: true,
      mode: normalizedMode,
      liveCoreSummary,
      previewSummary: summarizeGatewayPreview(gatewayResult.response),
      fallbackUsed: false,
      reason: "GATEWAY_COMPARED",
      request
    });
  } catch (error) {
    const fallbackReason = normalizedMode === RAPHAEL_PREVIEW_MODES.MOCK_GATEWAY
      ? `GATEWAY_UNAVAILABLE:${error?.message || "unknown"}`
      : `PREVIEW_FAILED:${error?.message || "unknown"}`;
    return buildPreviewComparison({
      ok: true,
      mode: normalizedMode,
      liveCoreSummary,
      previewSummary: null,
      fallbackUsed: true,
      reason: fallbackReason,
      request
    });
  }
}

export function assertRaphaelPreviewIsReadOnly(comparison = {}) {
  return {
    ok: comparison?.trusted === false
      && comparison?.appliedToLive === false
      && !Object.prototype.hasOwnProperty.call(comparison, "statePatch")
      && comparison?.audit?.noMemoryWrite === true
      && comparison?.audit?.noTraceWrite === true
      && comparison?.audit?.noAnimationTrigger === true
      && comparison?.audit?.noChatWrite === true,
    reason: "PREVIEW_READ_ONLY_CONTRACT"
  };
}

function buildPreviewComparison({
  ok,
  mode,
  liveCoreSummary,
  previewSummary,
  fallbackUsed,
  reason,
  request
}) {
  return {
    ok: Boolean(ok),
    trusted: false,
    mode,
    liveCoreSummary,
    previewSummary,
    appliedToLive: false,
    fallbackUsed: Boolean(fallbackUsed),
    reason,
    audit: {
      ...PREVIEW_AUDIT,
      requestId: request?.requestId || null,
      previewInputSource: request?.input?.source || "unknown"
    }
  };
}

function summarizeLiveCore(coreResult = {}) {
  return {
    source: "nexuslink:runRaphaelCore",
    finalAuthority: true,
    replyRole: coreResult?.output?.replyRole || coreResult?.replyRole || null,
    responseMode: coreResult?.plan?.mode || coreResult?.responseStrategy?.strategy || null,
    topic: coreResult?.nlu?.topic || coreResult?.perception?.nlu?.topic || null,
    safetyRisk: coreResult?.safety?.riskLevel || coreResult?.perception?.safety?.riskLevel || null,
    safetyBlocked: Boolean(coreResult?.safety?.blocked || coreResult?.perception?.safety?.blocked),
    memoryShouldWrite: Boolean(coreResult?.memoryDecision?.shouldWrite),
    traceShouldWrite: Boolean(coreResult?.traceDecision?.shouldWrite),
    stateMutationAllowed: Boolean(coreResult?.stateMutation)
  };
}

function summarizeEnginePreview(output = {}) {
  return {
    source: "raphael-ai-engine:local",
    trusted: false,
    ok: Boolean(output?.ok),
    engineVersion: output?.engineVersion || null,
    mode: output?.mode || null,
    replyStyle: output?.replyCandidate?.style || null,
    boundaryAction: output?.boundaryAction?.type || null,
    safetyLevel: output?.safetyStatus?.level || null,
    memoryShouldStore: output?.memoryProposal?.shouldStore === true,
    memoryRequiresReview: output?.memoryProposal?.requiresReview === true,
    gameActionId: output?.gameActionSuggestion?.actionId || null,
    rewardSignal: output?.gameActionSuggestion?.rewardSignal || false,
    directGameMutation: output?.metadata?.directGameMutation === true
  };
}

function summarizeGatewayPreview(response = {}) {
  const output = response?.result?.output || {};
  return {
    source: "raphael-ai-engine:mock-gateway",
    trusted: false,
    ok: Boolean(response?.ok),
    advisorTrusted: response?.advisor?.trusted === true,
    finalAuthority: response?.metadata?.authorityReport?.finalAuthority || null,
    advisorOverrideApplied: response?.metadata?.authorityReport?.advisorOverrideApplied === true,
    safetyLevel: output?.safetyStatus?.level || null,
    memoryShouldStore: output?.memoryProposal?.shouldStore === true,
    memoryRequiresReview: output?.memoryProposal?.requiresReview === true,
    gameActionId: output?.gameActionSuggestion?.actionId || null,
    rewardSignal: output?.gameActionSuggestion?.rewardSignal || false
  };
}

function summarizeRelationshipState(state = {}) {
  return {
    trust: pickNumber(state?.trust, state?.relationship?.trust),
    bond: pickNumber(state?.bond, state?.relationship?.bond),
    defense: pickNumber(state?.defense, state?.relationship?.defense),
    mood: state?.mood || state?.companionMood || null
  };
}

function summarizeMemoryState(state = {}) {
  const candidates = []
    .concat(Array.isArray(state?.memorySummaries) ? state.memorySummaries : [])
    .concat(Array.isArray(state?.emotionalMemories) ? state.emotionalMemories : [])
    .concat(Array.isArray(state?.habitatTraces) ? state.habitatTraces : []);

  return candidates.slice(-3).map((item) => {
    if (typeof item === "string") return item.slice(0, 120);
    return String(item?.summary || item?.label || item?.type || "memory").slice(0, 120);
  });
}

function normalizePreviewMode(mode) {
  if (mode === RAPHAEL_PREVIEW_MODES.LOCAL_ENGINE) return RAPHAEL_PREVIEW_MODES.LOCAL_ENGINE;
  if (mode === RAPHAEL_PREVIEW_MODES.MOCK_GATEWAY || mode === "gateway") return RAPHAEL_PREVIEW_MODES.MOCK_GATEWAY;
  return RAPHAEL_PREVIEW_MODES.OFF;
}

function looksLikeCanonQuestion(text) {
  return /canon|lore|Linkara|RaphaelCore|七區|設定|世界觀|第八區|官方/u.test(String(text || ""));
}

function compactList(items = []) {
  return items.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
}

function pickNumber(...values) {
  const found = values.find((value) => Number.isFinite(Number(value)));
  return found == null ? null : Number(found);
}

function stableIdSeed(text, companionId) {
  const raw = `${companionId}:${text}` || "preview";
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
