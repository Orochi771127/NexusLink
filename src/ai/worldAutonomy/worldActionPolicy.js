/**
 * worldActionPolicy.js
 * Action safety gates, cooldown definitions, and permissions for the World Runtime.
 * Based on the 4-level permission schema (A, B, C, D).
 */

export const EMBODIED_ACTIONS = Object.freeze({
  // Level A: Auto-executable, low-risk, pure expression/movement
  wander_safe_area: { level: "A", maxDurationSec: 30, cooldownSec: 10 },
  rest_at_spot: { level: "A", maxDurationSec: 120, cooldownSec: 300 },
  inspect_habitat_object: { level: "A", maxDurationSec: 15, cooldownSec: 60 },
  play_idle_activity: { level: "A", maxDurationSec: 20, cooldownSec: 60 },
  approach_player_avatar_anchor: { level: "A", maxDurationSec: 15, cooldownSec: 120 },
  
  // Level B: Auto-executable with budget/resource limits
  eat_available_food: { level: "B", maxDurationSec: 10, cooldownSec: 300, resourceCost: "food_node" }
});

export function validateWorldAction(actionId, actionState = {}) {
  const policy = EMBODIED_ACTIONS[actionId];
  
  if (!policy) {
    return { valid: false, reason: `unknown_action:${actionId}` };
  }

  // Check Cooldown
  // `actionState.now` lets the caller inject the tick clock so one loop pass
  // uses a single consistent timestamp (and stays testable). Falls back to
  // wall-clock for callers that do not thread a clock.
  const lastUsedTime = actionState.cooldowns?.[actionId] || 0;
  const now = Number.isFinite(Number(actionState.now)) ? Number(actionState.now) : Date.now();
  if (now - lastUsedTime < policy.cooldownSec * 1000) {
    return { valid: false, reason: `cooldown_active:${actionId}` };
  }

  // Check Budget/Resources for Level B
  if (policy.level === "B") {
    // In Phase 1, we just do a basic check.
    // In the future, this would check `actionState.dailyBudget`.
    if (policy.resourceCost === "food_node" && !actionState.hasAvailableFood) {
      return { valid: false, reason: "insufficient_resource:food_node" };
    }
  }

  return { valid: true };
}
