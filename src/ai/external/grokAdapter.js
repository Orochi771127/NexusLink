/** Placeholder — no API key in repo. Enable only after human approval. */
export async function askGrokAdvisor() {
  return {
    provider: "grok",
    disabled: true,
    reason: "grok_adapter_not_configured",
    emotion: null,
    boundaryRisk: null,
    recommendedReaction: null,
    replyCandidates: [],
    warnings: ["Connect via ExternalModelGateway with user-provided key."],
    confidence: 0
  };
}