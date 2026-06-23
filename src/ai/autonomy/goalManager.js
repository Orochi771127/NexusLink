export const GOAL_WHITELIST = Object.freeze({
  MAINTAIN_SAFETY: "maintain_safety",
  RESPECT_BOUNDARY: "respect_boundary",
  RESTORE_CALM: "restore_calm",
  ACKNOWLEDGE_EMOTION: "acknowledge_emotion",
  REPAIR_AFTER_CONFLICT: "repair_after_conflict",
  PRESERVE_DISTANCE: "preserve_distance",
  INVITE_EXPLORATION: "invite_exploration",
  REST: "rest",
  REFLECT_MEMORY: "reflect_memory"
});

const GOAL_PRIORITY = [
  GOAL_WHITELIST.MAINTAIN_SAFETY,
  GOAL_WHITELIST.RESPECT_BOUNDARY,
  GOAL_WHITELIST.RESTORE_CALM,
  GOAL_WHITELIST.REFLECT_MEMORY,
  GOAL_WHITELIST.REPAIR_AFTER_CONFLICT,
  GOAL_WHITELIST.ACKNOWLEDGE_EMOTION,
  GOAL_WHITELIST.PRESERVE_DISTANCE,
  GOAL_WHITELIST.REST,
  GOAL_WHITELIST.INVITE_EXPLORATION
];

export function selectActiveGoal(needs = {}, perception = {}, plan = {}) {
  const safety = perception.safety || {};
  const intent = perception.intent?.intent || "unknown";

  const candidates = [];

  if (safety.isHighRisk || safety.action === "safety_redirect") {
    candidates.push({ goal: GOAL_WHITELIST.MAINTAIN_SAFETY, score: 1 });
  }
  if (safety.isBoundaryPressure || plan.mode === "withdraw" || plan.mode === "reject") {
    candidates.push({ goal: GOAL_WHITELIST.RESPECT_BOUNDARY, score: 0.95 });
  }
  if (needs.needForSafety >= 0.65) {
    candidates.push({ goal: GOAL_WHITELIST.MAINTAIN_SAFETY, score: needs.needForSafety });
  }
  if (needs.needForDistance >= 0.55) {
    candidates.push({ goal: GOAL_WHITELIST.PRESERVE_DISTANCE, score: needs.needForDistance });
  }
  if (needs.needForRest >= 0.6 || intent === "rest_request") {
    candidates.push({ goal: GOAL_WHITELIST.REST, score: needs.needForRest });
  }
  if (needs.needForRepair >= 0.5 || intent === "apology") {
    candidates.push({ goal: GOAL_WHITELIST.REPAIR_AFTER_CONFLICT, score: needs.needForRepair });
  }
  if (needs.needForReflection >= 0.45) {
    candidates.push({ goal: GOAL_WHITELIST.REFLECT_MEMORY, score: needs.needForReflection });
  }
  if (needs.needForExploration >= 0.5 || intent === "exploration_request") {
    candidates.push({ goal: GOAL_WHITELIST.INVITE_EXPLORATION, score: needs.needForExploration });
  }
  if (needs.needForConnection >= 0.35 || perception.analysis?.emotionKey) {
    candidates.push({
      goal: GOAL_WHITELIST.ACKNOWLEDGE_EMOTION,
      score: Math.max(needs.needForConnection, perception.analysis?.intensity || 0.35)
    });
  }
  if (safety.action === "safe_harbor" || plan.mode === "guarded_acknowledge") {
    candidates.push({ goal: GOAL_WHITELIST.RESTORE_CALM, score: 0.7 });
  }

  candidates.sort((a, b) => {
    const priorityA = GOAL_PRIORITY.indexOf(a.goal);
    const priorityB = GOAL_PRIORITY.indexOf(b.goal);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return b.score - a.score;
  });

  const activeGoal = candidates[0]?.goal || GOAL_WHITELIST.ACKNOWLEDGE_EMOTION;

  return {
    activeGoal,
    candidates,
    priority: GOAL_PRIORITY.indexOf(activeGoal)
  };
}