import { buildAdvisorPayload } from "./privacyRedactor.js";
import {
  DEFAULT_GATEWAY_URL,
  GATEWAY_TOOLS,
  buildGatewayContext
} from "./externalIntelligencePolicy.js";

const DEFAULT_TIMEOUT_MS = 4500;

export async function checkGatewayHealth(gatewayUrl = DEFAULT_GATEWAY_URL) {
  try {
    const response = await fetchWithTimeout(`${gatewayUrl}/v1/health`, { method: "GET" });
    if (!response.ok) return { ok: false, reason: `http_${response.status}` };
    const body = await response.json();
    return { ok: Boolean(body.ok), service: body.service, phase: body.phase };
  } catch (error) {
    return { ok: false, reason: error?.message || "unreachable" };
  }
}

export async function callRaphaelGateway({
  tool = GATEWAY_TOOLS.ASK_MODEL_ADVISOR,
  payload = {},
  companionId = "greyshade-cat",
  context = {},
  gatewayUrl = DEFAULT_GATEWAY_URL,
  requestId = null
} = {}) {
  const body = {
    requestId: requestId || createRequestId(),
    companionId,
    tool,
    payload,
    context
  };

  const response = await fetchWithTimeout(`${gatewayUrl}/v1/gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Raphael-Client": "nexuslink-raphael-core"
    },
    body: JSON.stringify(body)
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!result.ok) {
    return {
      ok: false,
      reason: result?.error?.code || `http_${response.status}`,
      response: result
    };
  }

  return { ok: true, response: result };
}

export async function askGatewayAdvisor({
  perception = {},
  coreDecision = {},
  settings = {},
  runtime = {}
} = {}) {
  const gatewayUrl = settings.gatewayUrl || DEFAULT_GATEWAY_URL;
  const payload = buildAdvisorPayload({ perception, coreDecision });
  const context = buildGatewayContext(settings, runtime);

  const gatewayResult = await callRaphaelGateway({
    tool: GATEWAY_TOOLS.ASK_MODEL_ADVISOR,
    payload,
    companionId: perception.persona?.companionId || runtime.companion?.id || "greyshade-cat",
    context,
    gatewayUrl
  });

  if (!gatewayResult.ok) {
    return { used: false, reason: gatewayResult.reason, advice: null, source: "gateway" };
  }

  const advisor = gatewayResult.response?.advisor || null;
  return {
    used: Boolean(advisor),
    reason: advisor ? "ok" : "empty_advisor",
    advice: advisor
      ? {
          provider: "gateway",
          mode: "advisor",
          emotion: advisor.emotion,
          intent: advisor.intent,
          boundaryRisk: advisor.boundaryRisk,
          recommendedReaction: advisor.suggestedReaction,
          replyCandidates: advisor.replyCandidates || [],
          warnings: advisor.warnings || [],
          confidence: gatewayResult.response?.metadata?.confidence ?? 0.7,
          trusted: false
        }
      : null,
    source: "gateway",
    metadata: gatewayResult.response?.metadata || null
  };
}

function createRequestId() {
  return `rgw_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}