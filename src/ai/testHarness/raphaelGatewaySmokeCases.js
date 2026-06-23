import { checkGatewayHealth, callRaphaelGateway } from "../external/raphaelGatewayClient.js";
import { askAdvisor } from "../external/externalModelGateway.js";
import { GATEWAY_TOOLS } from "../external/externalIntelligencePolicy.js";

const GATEWAY_URL = "http://127.0.0.1:8787";

export async function runGatewaySmokeCases() {
  const health = await checkGatewayHealth(GATEWAY_URL);

  const advisorDirect = await callRaphaelGateway({
    gatewayUrl: GATEWAY_URL,
    tool: GATEWAY_TOOLS.ASK_MODEL_ADVISOR,
    companionId: "greyshade-cat",
    payload: {
      emotion: "fatigue",
      intent: "vent",
      riskLevel: "none",
      inputSummary: "今天有點累"
    },
    context: { sessionId: "smoke", playerId: "smoke" }
  });

  const blockedWeb = await callRaphaelGateway({
    gatewayUrl: GATEWAY_URL,
    tool: GATEWAY_TOOLS.WEB_SEARCH,
    payload: { query: "情緒支持" },
    context: { webAccessEnabled: false, userConsent: true }
  });

  const advisorViaCore = await askAdvisor({
    perception: {
      gateway: { normalizedInput: "今天有點累" },
      analysis: { emotionKey: "fatigue" },
      intent: { intent: "vent" },
      safety: { riskLevel: "none" },
      persona: { companionId: "greyshade-cat", tone: "quiet_observer" }
    },
    coreDecision: { activeGoal: "acknowledge_emotion", selectedAction: "say_reply" },
    settings: {
      gatewayEnabled: true,
      advisorEnabled: true,
      gatewayUrl: GATEWAY_URL,
      provider: "gateway"
    }
  });

  const checks = {
    health_ok: health.ok,
    advisor_direct_ok: advisorDirect.ok && Boolean(advisorDirect.response?.advisor),
    advisor_structured: !/^Raphael 說/.test(
      advisorDirect.response?.advisor?.replyCandidates?.[0] || ""
    ),
    web_blocked: !blockedWeb.ok && blockedWeb.reason === "web_access_disabled",
    core_gateway_ok: advisorViaCore.used && advisorViaCore.advice?.provider === "gateway"
  };

  return {
    health,
    advisorDirect,
    blockedWeb,
    advisorViaCore,
    checks,
    pass: Object.values(checks).every(Boolean)
  };
}

export function installGatewaySmokeHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_GATEWAY_SMOKE__ = { run: runGatewaySmokeCases };
}