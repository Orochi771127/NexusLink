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

export const HERMES_CAPABILITY_ALLOWLIST = Object.freeze([
  "web_search",
  "doc_retrieval",
  "code_analysis",
  "candidate_generation",
  "knowledge_synthesis"
]);

export const HERMES_FORBIDDEN_TOOLS = Object.freeze([
  "file_write",
  "terminal_exec",
  "cron_mutate",
  "memory_write",
  "state_delta"
]);

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
  hermesShadowEnabled: false,
  hermesShadowUrl: "http://127.0.0.1:8788", // Example sidecar port
  allowedHermesCapabilities: [...HERMES_CAPABILITY_ALLOWLIST],
  allowedModes: ["advisor", "renderer", "critic", "shadow"]
});

/**
 * Merge runtime external intelligence settings with safe defaults.
 * Gateway is OFF unless explicitly enabled — RaphaelCore stays local-first.
 */
export function resolveExternalIntelligencePolicy(runtime = {}) {
  const incoming = runtime.externalIntelligence || {};

  // Issue 7 fix: never allow incoming to expand beyond static allowlist
  let hermesCapabilities = [...HERMES_CAPABILITY_ALLOWLIST];
  if (Array.isArray(incoming.allowedHermesCapabilities)) {
    hermesCapabilities = incoming.allowedHermesCapabilities.filter(
      (cap) => HERMES_CAPABILITY_ALLOWLIST.includes(cap)
    );
  }

  return {
    ...DEFAULT_POLICY,
    ...incoming,
    gatewayUrl: incoming.gatewayUrl || DEFAULT_GATEWAY_URL,
    hermesShadowUrl: incoming.hermesShadowUrl || "http://127.0.0.1:8788",
    allowedHermesCapabilities: hermesCapabilities
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