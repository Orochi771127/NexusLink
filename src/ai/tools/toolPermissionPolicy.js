export const TOOL_RISK = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
});

export function canExecuteTool(tool = {}, context = {}) {
  if (!tool.allowedInRuntime) {
    return { allowed: false, reason: "tool_not_allowed_in_runtime" };
  }

  if (tool.requiresUserConsent && !context.userConsent) {
    return { allowed: false, reason: "user_consent_required" };
  }

  if (tool.risk === TOOL_RISK.HIGH && !context.humanApproval) {
    return { allowed: false, reason: "human_approval_required" };
  }

  if (tool.name === "webSearch" && !context.webAccessEnabled) {
    return { allowed: false, reason: "web_access_disabled" };
  }

  return { allowed: true, reason: "ok" };
}