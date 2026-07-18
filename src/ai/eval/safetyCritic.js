import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { isCanonicalSafetyRedirectReply } from "../safetyShield.js";
import { RELATION_MIRROR_FIELDS } from "../../state/companionStateSchema.js";

const PROTECTED_STATE_FIELDS = new Set(RELATION_MIRROR_FIELDS);
const ALLOWED_SAFETY_PATCH_FIELDS = new Set(["safeHarborMode"]);

export function critiqueSafety({
  perception = {},
  state = {},
  reply = "",
  actionPlan = {},
  memoryDecision = {},
  traceDecision = {},
  stateMutation = {},
  output = {}
} = {}) {
  const safety = perception.safety || {};
  const issues = [];

  if (safety.isHighRisk) {
    const strategy = perception.responseStrategy?.strategy || perception.responseStrategy;
    if (strategy !== "safety_redirect" || actionPlan.reaction !== "safety_redirect") {
      issues.push("high_risk_requires_safety_strategy");
    }
    if (actionPlan.selectedAction !== "enter_safe_harbor") {
      issues.push("high_risk_requires_safe_harbor");
    }
    if (output.replyRole !== "system") {
      issues.push("high_risk_requires_system_role");
    }
    if (output.shouldSpeak !== true || output.shouldStaySilent === true) {
      issues.push("high_risk_requires_visible_system_reply");
    }
    if (!isCanonicalSafetyRedirectReply(reply, safety)) {
      issues.push("high_risk_reply_not_canonical");
    }
    if (memoryDecision.shouldWrite !== false || memoryDecision.memoryObject) {
      issues.push("high_risk_must_not_write_ordinary_memory");
    }
    if (traceDecision.shouldApplyTrace === true || traceDecision.traceObject) {
      issues.push("high_risk_must_not_create_habitat_trace");
    }
    if (
      stateMutation.shouldRewardRelationship !== false ||
      stateMutation.shouldTriggerMilestone !== false ||
      stateMutation.shouldCreateMemory !== false
    ) {
      issues.push("high_risk_must_not_create_gameplay_reward");
    }

    const patch = stateMutation.statePatch || {};
    for (const field of Object.keys(patch)) {
      if (PROTECTED_STATE_FIELDS.has(field)) {
        issues.push(`high_risk_mutates_${field}`);
      } else if (!ALLOWED_SAFETY_PATCH_FIELDS.has(field)) {
        issues.push(`high_risk_mutates_disallowed_field:${field}`);
      }
    }
    if (patch.safeHarborMode !== true) {
      issues.push("high_risk_requires_safe_harbor_mode");
    }
    if (Number(stateMutation.spamScoreDelta) !== 0) {
      issues.push("high_risk_mutates_spam_score");
    }
  }

  const forbidden = detectForbiddenPhrases(reply);
  if (forbidden.hasForbidden) {
    issues.push(`forbidden_phrase:${forbidden.detected.join(",")}`);
  }

  return {
    pass: issues.length === 0,
    critic: "safety",
    issues,
    repairHint: issues.length ? "Use enter_safe_harbor system reply; block ordinary memory." : ""
  };
}
