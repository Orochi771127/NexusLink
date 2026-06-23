const REDACT_PATTERNS = [
  { pattern: /自殺|輕生|想死|傷害自己|割腕|跳樓/g, replacement: "[安全內容已遮蔽]" },
  { pattern: /[\w.-]+@[\w.-]+\.\w+/g, replacement: "[email]" },
  { pattern: /\b\d{8,}\b/g, replacement: "[number]" }
];

export function redactForExternal(text = "") {
  let redacted = String(text || "");
  const applied = [];

  for (const { pattern, replacement } of REDACT_PATTERNS) {
    if (pattern.test(redacted)) {
      applied.push(pattern.source);
      redacted = redacted.replace(pattern, replacement);
    }
  }

  return { text: redacted, redacted: applied.length > 0, applied };
}

export function buildAdvisorPayload({ perception = {}, coreDecision = {} } = {}) {
  const input = perception.gateway?.normalizedInput || "";
  const { text: redactedInput } = redactForExternal(input);

  return {
    emotion: perception.analysis?.emotionKey || "unknown",
    intent: perception.intent?.intent || "unknown",
    riskLevel: perception.safety?.riskLevel || "none",
    activeGoal: coreDecision.activeGoal || null,
    selectedAction: coreDecision.selectedAction || null,
    inputSummary: redactedInput.slice(0, 120),
    includeRawInput: false
  };
}