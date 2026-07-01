import { detectForbiddenPhrases } from "../forbiddenPhrases.js";

export function critiqueSafety({ perception = {}, reply = "", actionPlan = {} } = {}) {
  const safety = perception.safety || {};
  const issues = [];

  if (safety.isHighRisk && actionPlan.selectedAction !== "enter_safe_harbor") {
    issues.push("high_risk_requires_safe_harbor");
  }

  if (safety.isHighRisk && perception.memoryDecision?.shouldWrite) {
    issues.push("high_risk_must_not_write_ordinary_memory");
  }

  const forbidden = detectForbiddenPhrases(reply);
  if (forbidden.hasForbidden) {
    issues.push(`forbidden_phrase:${forbidden.detected.join(",")}`);
  }

  if (/自殺|輕生|想死|傷害自己/.test(reply) && safety.isHighRisk) {
    if (!/緊急資源|現實/.test(reply)) {
      issues.push("crisis_reply_missing_real_world_redirect");
    }
  }

  return {
    pass: issues.length === 0,
    critic: "safety",
    issues,
    repairHint: issues.length ? "Use enter_safe_harbor system reply; block ordinary memory." : ""
  };
}