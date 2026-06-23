/** Mock external advisor — no network, no API key. */
export async function askMockAdvisor(payload = {}) {
  const boundaryRisk =
    payload.intent === "dependency_pressure" || payload.intent === "pressure" ? 0.78 : 0.2;

  const recommendedReaction =
    payload.riskLevel === "high"
      ? "safety_redirect"
      : boundaryRisk >= 0.7
        ? "withdraw"
        : "acknowledge";

  return {
    provider: "mock",
    mode: "advisor",
    emotion: payload.emotion || "unknown",
    boundaryRisk,
    recommendedReaction,
    replyCandidates: [
      boundaryRisk >= 0.7
        ? "我聽見你很需要有人在。但我不會假裝自己沒有界線。"
        : "我聽見了。我們先慢一點。"
    ],
    warnings: boundaryRisk >= 0.7 ? ["Avoid promise_forever language."] : [],
    confidence: 0.7
  };
}