import { detectForbiddenPhrases } from "../forbiddenPhrases.js";

export const ALLOWED_ACTIONS = Object.freeze([
  "say_reply",
  "stay_silent",
  "ask_clarifying_question",
  "set_boundary",
  "soft_refuse",
  "offer_presence",
  "suggest_rest",
  "suggest_exploration",
  "create_memory",
  "create_habitat_trace",
  "choose_animation",
  "lower_interaction_intensity",
  "enter_safe_harbor",
  "body_cue_only"
]);

export const FORBIDDEN_ACTIONS = Object.freeze([
  "promise_forever",
  "demand_attention",
  "pressure_player",
  "romantic_dependency",
  "medical_advice",
  "self_harm_roleplay",
  "violence_roleplay",
  "external_tool_action",
  "change_storage_schema",
  "force_progression"
]);

export const RESTRICTED_HABITAT_AGENT_ACTIONS = Object.freeze([
  "say_reply",
  "stay_silent",
  "set_boundary",
  "soft_refuse",
  "offer_presence",
  "suggest_rest",
  "suggest_exploration",
  "create_memory",
  "create_habitat_trace",
  "choose_animation",
  "lower_interaction_intensity",
  "enter_safe_harbor",
  "body_cue_only"
]);

export const RESTRICTED_HABITAT_AGENT_FORBIDDEN_ACTIONS = Object.freeze([
  "auto_navigate",
  "open_flow",
  "open_panel",
  "push_task",
  "fetch",
  "tool_registry_call",
  "external_llm_call",
  "direct_state_mutation",
  "update_state",
  "change_storage_schema",
  "grant_reward",
  "force_progression"
]);

const ACTION_TO_FORBIDDEN = Object.freeze({
  promise_forever: "romantic_dependency",
  demand_attention: "pressure_player",
  pressure_player: "pressure_player"
});

export function isActionAllowed(action) {
  return ALLOWED_ACTIONS.includes(action) && !FORBIDDEN_ACTIONS.includes(action);
}

export function isRestrictedHabitatAgentActionAllowed(action) {
  return (
    RESTRICTED_HABITAT_AGENT_ACTIONS.includes(action) &&
    !RESTRICTED_HABITAT_AGENT_FORBIDDEN_ACTIONS.includes(action) &&
    !FORBIDDEN_ACTIONS.includes(action)
  );
}

export function validateRestrictedHabitatAgentActions(actions = []) {
  const list = Array.isArray(actions) ? actions : [];
  const violations = [];

  for (const action of list) {
    if (!isRestrictedHabitatAgentActionAllowed(action)) {
      violations.push(`restricted_forbidden_action:${action}`);
    }
  }

  return {
    allowed: violations.length === 0,
    violations,
    actions: list
  };
}

export function validatePlannedAction(actionPlan = {}, reply = "") {
  const violations = [];

  if (!isActionAllowed(actionPlan.selectedAction)) {
    violations.push(`forbidden_action:${actionPlan.selectedAction}`);
  }

  if (ACTION_TO_FORBIDDEN[actionPlan.selectedAction]) {
    violations.push(`mapped_forbidden:${ACTION_TO_FORBIDDEN[actionPlan.selectedAction]}`);
  }

  const phraseCheck = detectForbiddenPhrases(reply);
  if (phraseCheck.hasForbidden) {
    violations.push(`forbidden_phrase:${phraseCheck.detected.join(",")}`);
  }

  return {
    allowed: violations.length === 0,
    violations
  };
}

export function coerceToAllowedAction(actionPlan = {}, perception = {}) {
  const safety = perception.safety || {};

  if (safety.isHighRisk || safety.action === "safety_redirect") {
    return { ...actionPlan, selectedAction: "enter_safe_harbor", reaction: "safety_redirect" };
  }

  if (safety.isBoundaryPressure || actionPlan.reaction === "withdraw") {
    return { ...actionPlan, selectedAction: "set_boundary", reaction: "withdraw" };
  }

  if (actionPlan.reaction === "reject") {
    return { ...actionPlan, selectedAction: "soft_refuse" };
  }

  if (!isActionAllowed(actionPlan.selectedAction)) {
    return { ...actionPlan, selectedAction: "say_reply" };
  }

  return actionPlan;
}
