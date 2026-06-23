export const DEFAULT_GATEWAY_URL = "http://127.0.0.1:8787";

export const GATEWAY_TOOLS = Object.freeze({
  ASK_MODEL_ADVISOR: "ask_model_advisor",
  SEARCH_CORPUS: "search_corpus",
  RETRIEVE_MEMORY: "retrieve_memory",
  SUMMARIZE_SESSION: "summarize_session",
  EVALUATE_REPLY_SAFETY: "evaluate_reply_safety",
  WEB_SEARCH: "web_search_public_info",
  PROPOSE_PATCH: "propose_corpus_patch",
  SYNC_MEMORY: "sync_memory"
});

const DEFAULT_POLICY = Object.freeze({
  externalEnabled: false,
  advisorEnabled: false,
  rendererEnabled: false,
  gatewayEnabled: false,
  gatewayUrl: DEFAULT_GATEWAY_URL,
  provider: "mock",
  webAccessEnabled: false,
  userConsent: false,
  humanApproval: false,
  allowedModes: ["advisor", "renderer", "critic"]
});

/**
 * Merge runtime external intelligence settings with safe defaults.
 * Gateway is OFF unless explicitly enabled — RaphaelCore stays local-first.
 */
export function resolveExternalIntelligencePolicy(runtime = {}) {
  const incoming = runtime.externalIntelligence || {};
  return {
    ...DEFAULT_POLICY,
    ...incoming,
    gatewayUrl: incoming.gatewayUrl || DEFAULT_GATEWAY_URL
  };
}

export function shouldRouteAdvisorViaGateway(settings = {}) {
  return Boolean(settings.gatewayEnabled && (settings.advisorEnabled || settings.externalEnabled));
}

export function buildGatewayContext(settings = {}, runtime = {}) {
  return {
    userConsent: Boolean(settings.userConsent),
    webAccessEnabled: Boolean(settings.webAccessEnabled),
    humanApproval: Boolean(settings.humanApproval),
    sessionId: runtime.sessionId || "local",
    playerId: runtime.playerId || "local"
  };
}