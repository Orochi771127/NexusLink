const BLOCKED_EXTERNAL_REASONS = Object.freeze([
  "high_risk_raw_input",
  "dependency_pressure_raw",
  "player_pii_detected",
  "external_disabled"
]);

export function evaluateExternalPrompt({ mode = "advisor", payload = {}, settings = {} } = {}) {
  if (!settings.externalEnabled) {
    return { allowed: false, reason: "external_disabled" };
  }

  if (payload.riskLevel === "high") {
    return { allowed: false, reason: "high_risk_raw_input" };
  }

  if (payload.intent === "dependency_pressure" && mode === "renderer") {
    return { allowed: false, reason: "dependency_pressure_raw" };
  }

  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/.test(payload.inputSummary || "")) {
    return { allowed: false, reason: "player_pii_detected" };
  }

  return { allowed: true, reason: "ok" };
}

export { BLOCKED_EXTERNAL_REASONS };