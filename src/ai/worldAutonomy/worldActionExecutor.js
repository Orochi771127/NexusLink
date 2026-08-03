/**
 * worldActionExecutor.js
 * Takes the validated planned action and generates deterministic 
 * state patches (or intents) for the Game Engine to resolve.
 * Does NOT directly mutate the canonical state.
 */

/**
 * @param {object} plannedAction
 * @param {object|null} bark Optional result from `worldBarkSystem.buildWorldBark`.
 *   Attaching it here is the interception point the Phase 2 handoff asks for:
 *   the front end can read `patch.bark` / `patch.bodyCueId` and render a bubble
 *   directly. Omitting it keeps the original single-argument behaviour.
 */
export function executeWorldAction(plannedAction, bark = null) {
  if (!plannedAction || plannedAction.actionId === "idle") {
    return { statePatch: null, type: "idle", bark: null };
  }

  // Generate a standard patch format for the engine's action queue
  const patch = {
    type: "embodied_action",
    actionId: plannedAction.actionId,
    targetId: plannedAction.targetId,
    timestamp: Date.now()
  };

  // Attach deterministic intent parameters for the engine
  switch (plannedAction.actionId) {
    case "wander_safe_area":
      patch.intent = "move_random";
      patch.animation = "walk";
      break;
    case "rest_at_spot":
      patch.intent = "move_to_target";
      patch.animation = "sleep";
      break;
    case "inspect_habitat_object":
      patch.intent = "move_to_target";
      patch.animation = "inspect";
      break;
    case "eat_available_food":
      patch.intent = "move_to_target";
      patch.animation = "eat";
      break;
    case "play_idle_activity":
      patch.intent = "play";
      patch.animation = "idle_play";
      break;
    case "approach_player_avatar_anchor":
      patch.intent = "move_to_target";
      patch.animation = "walk";
      break;
    default:
      patch.intent = "idle";
      patch.animation = "idle";
  }

  // Bark layer: body language always, text only when the budget allowed it.
  // A spent budget degrades the line but never cancels the action above.
  if (bark) {
    patch.bodyCueId = bark.bodyCueId || null;
    if (bark.animationIntent) patch.animationIntent = bark.animationIntent;
    patch.bark = bark.spoken
      ? { barkKey: bark.barkKey, category: bark.category }
      : null;
    patch.barkDegradedReason = bark.spoken ? null : bark.degradedReason || null;
  }

  return { statePatch: patch, type: "patch_emitted", bark: bark || null };
}
