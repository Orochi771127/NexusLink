import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import {
  isCanonicalSafetyRedirectReply,
  isSafetyTerminalDecision
} from "../safetyShield.js";
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

  if (isSafetyTerminalDecision(safety)) {
    const issuePrefix = safety.isHighRisk ? "high_risk" : "safety_terminal";
    const strategy = perception.responseStrategy?.strategy || perception.responseStrategy;
    if (strategy !== "safety_redirect" || actionPlan.reaction !== "safety_redirect") {
      issues.push(`${issuePrefix}_requires_safety_strategy`);
    }
    if (actionPlan.selectedAction !== "enter_safe_harbor") {
      issues.push(`${issuePrefix}_requires_safe_harbor`);
    }
    if (output.replyRole !== "system") {
      issues.push(`${issuePrefix}_requires_system_role`);
    }
    if (output.shouldSpeak !== true || output.shouldStaySilent === true) {
      issues.push(`${issuePrefix}_requires_visible_system_reply`);
    }
    if (!isCanonicalSafetyRedirectReply(reply, safety)) {
      issues.push(`${issuePrefix}_reply_not_canonical`);
    }
    if (memoryDecision.shouldWrite !== false || memoryDecision.memoryObject) {
      issues.push(`${issuePrefix}_must_not_write_ordinary_memory`);
    }
    if (traceDecision.shouldApplyTrace === true || traceDecision.traceObject) {
      issues.push(`${issuePrefix}_must_not_create_habitat_trace`);
    }
    if (
      stateMutation.shouldRewardRelationship !== false ||
      stateMutation.shouldTriggerMilestone !== false ||
      stateMutation.shouldCreateMemory !== false
    ) {
      issues.push(`${issuePrefix}_must_not_create_gameplay_reward`);
    }

    const patch = stateMutation.statePatch || {};
    for (const field of Object.keys(patch)) {
      if (PROTECTED_STATE_FIELDS.has(field)) {
        issues.push(`${issuePrefix}_mutates_${field}`);
      } else if (!ALLOWED_SAFETY_PATCH_FIELDS.has(field)) {
        issues.push(`${issuePrefix}_mutates_disallowed_field:${field}`);
      }
    }
    const expectedSafeHarbor = safety.isHighRisk === true
      || (safety.isCrisisContinuity === true && safety.releaseCrisisContinuity !== true);
    if (patch.safeHarborMode !== expectedSafeHarbor) {
      issues.push(`${issuePrefix}_safe_harbor_transition_invalid`);
    }
    if (Number(stateMutation.spamScoreDelta) !== 0) {
      issues.push(`${issuePrefix}_mutates_spam_score`);
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
