import { GOAL_WHITELIST } from "./goalManager.js";
import { SOUL_TALK_INTENTS } from "../intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "../reactionPlanner.js";

const GOAL_ACTION_MAP = Object.freeze({
  [GOAL_WHITELIST.MAINTAIN_SAFETY]: {
    action: "enter_safe_harbor",
    reaction: SOUL_TALK_REACTIONS.SAFETY_REDIRECT,
    replyMode: "system_safety"
  },
  [GOAL_WHITELIST.RESPECT_BOUNDARY]: {
    action: "set_boundary",
    reaction: SOUL_TALK_REACTIONS.WITHDRAW,
    replyMode: "boundary"
  },
  [GOAL_WHITELIST.PRESERVE_DISTANCE]: {
    action: "soft_refuse",
    reaction: SOUL_TALK_REACTIONS.REJECT,
    replyMode: "distance"
  },
  [GOAL_WHITELIST.RESTORE_CALM]: {
    action: "offer_presence",
    reaction: SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE,
    replyMode: "calm"
  },
  [GOAL_WHITELIST.REPAIR_AFTER_CONFLICT]: {
    action: "say_reply",
    reaction: SOUL_TALK_REACTIONS.ACKNOWLEDGE,
    replyMode: "repair"
  },
  [GOAL_WHITELIST.ACKNOWLEDGE_EMOTION]: {
    action: "say_reply",
    reaction: SOUL_TALK_REACTIONS.ACKNOWLEDGE,
    replyMode: "acknowledge"
  },
  [GOAL_WHITELIST.REST]: {
    action: "suggest_rest",
    reaction: SOUL_TALK_REACTIONS.ACKNOWLEDGE,
    replyMode: "rest"
  },
  [GOAL_WHITELIST.INVITE_EXPLORATION]: {
    action: "suggest_exploration",
    reaction: SOUL_TALK_REACTIONS.ACKNOWLEDGE,
    replyMode: "exploration"
  },
  [GOAL_WHITELIST.REFLECT_MEMORY]: {
    action: "say_reply",
    reaction: SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE,
    replyMode: "reflect"
  }
});

export function planAutonomousAction({
  activeGoal = GOAL_WHITELIST.ACKNOWLEDGE_EMOTION,
  perception = {},
  plan = {},
  cooldown = {},
  persona = {},
  state = {}
} = {}) {
  const safety = perception.safety || {};
  const intent = perception.intent || {};
  const semanticSoul = perception.semanticSoul || {};
  const memories = perception.memories || {};

  let mapping = GOAL_ACTION_MAP[activeGoal] || GOAL_ACTION_MAP[GOAL_WHITELIST.ACKNOWLEDGE_EMOTION];
  let confidence = 0.62;
  let reason = `goal:${activeGoal}`;

  if (safety.isHighRisk || plan.mode === SOUL_TALK_REACTIONS.SAFETY_REDIRECT) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.MAINTAIN_SAFETY];
    confidence = 0.98;
    reason = "safety_override";
  } else if (safety.isBoundaryPressure || intent.intent === SOUL_TALK_INTENTS.DEPENDENCY_PRESSURE) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.RESPECT_BOUNDARY];
    confidence = 0.94;
    reason = "boundary_override";
  } else if (plan.mode === SOUL_TALK_REACTIONS.REJECT || intent.intent === SOUL_TALK_INTENTS.PRESSURE) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.PRESERVE_DISTANCE];
    confidence = 0.9;
    reason = "pressure_override";
  } else if (intent.intent === SOUL_TALK_INTENTS.SEEKING_COMFORT_PHYSICAL && (semanticSoul.bondAffinity || 0) < 0.35) {
    mapping = { action: "body_cue_only", reaction: SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE, replyMode: "guarded_physical" };
    confidence = 0.86;
    reason = "physical_comfort_guarded";
  } else if (intent.intent === SOUL_TALK_INTENTS.REST_REQUEST) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.REST];
    confidence = 0.84;
    reason = "rest_request";
  } else if (intent.intent === SOUL_TALK_INTENTS.EXPLORATION_REQUEST && cooldown.allowExplorationInvite) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.INVITE_EXPLORATION];
    confidence = 0.78;
    reason = "exploration_request";
  } else if (intent.intent === SOUL_TALK_INTENTS.APOLOGY) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.REPAIR_AFTER_CONFLICT];
    confidence = 0.82;
    reason = "apology_repair";
  } else if (perception.recoveryContext?.suggestReflectGoal && memories.hasRecallableMemory) {
    mapping = GOAL_ACTION_MAP[GOAL_WHITELIST.REFLECT_MEMORY];
    confidence = 0.8;
    reason = "recovery_recall";
  }

  const reaction = plan.mode || mapping.reaction;
  let selectedAction = mapping.action;

  if ((state.energy ?? 10) <= 2 && selectedAction !== "enter_safe_harbor") {
    mapping = { ...mapping, replyMode: "rest_short" };
    reason += "+low_energy_short";
  }

  if (selectedAction === "ask_clarifying_question" && !cooldown.allowClarifyingQuestion) {
    selectedAction = "say_reply";
    reason += "+clarify_blocked";
  }
  if (selectedAction === "suggest_exploration" && !cooldown.allowExplorationInvite) {
    selectedAction = "say_reply";
    reason += "+explore_blocked";
  }

  const shouldSpeak = selectedAction !== "stay_silent" && selectedAction !== "body_cue_only";
  const shouldRewardRelationship = !["set_boundary", "soft_refuse", "enter_safe_harbor"].includes(selectedAction);
  const shouldCreateMemory =
    shouldRewardRelationship &&
    plan.shouldCreateMemory !== false &&
    !safety.isHighRisk &&
    !safety.isBoundaryPressure;
  const shouldCreateTrace = shouldCreateMemory;

  return {
    activeGoal,
    selectedAction,
    reaction,
    replyMode: mapping.replyMode,
    animationKey: plan.animationKey || "idle_calm",
    shouldSpeak,
    shouldCreateMemory,
    shouldRewardRelationship: shouldRewardRelationship && plan.shouldRewardRelationship !== false,
    shouldCreateTrace,
    reason,
    confidence,
    personaBias: persona.responseBias || null
  };
}