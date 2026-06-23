/** Placeholder — no API key in repo. Enable only after human approval. */
export async function askOpenAIAdvisor() {
  return {
    provider: "openai",
    disabled: true,
    reason: "openai_adapter_not_configured",
    emotion: null,
    boundaryRisk: null,
    recommendedReaction: null,
    replyCandidates: [],
    warnings: ["Connect via ExternalModelGateway with user-provided key."],
    confidence: 0
  };
}