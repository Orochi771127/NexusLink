import { DIALOGUE_ACTS } from "./nlu/dialogueActClassifier.js";
import { NUANCE_FLAGS } from "./nlu/nuanceDetector.js";
import { canUseTrainingResponseStrategy } from "./raphaelTrainingAdapter.js";

export const RESPONSE_STRATEGIES = Object.freeze({
  PRACTICAL_CLARIFICATION: "practical_clarification",
  QUIET_PRESENCE: "quiet_presence",
  ACKNOWLEDGE_FEEDBACK: "acknowledge_feedback",
  ACKNOWLEDGE_GENERIC_FAILURE: "acknowledge_generic_failure",
  ANSWER_OR_CLARIFY: "answer_or_clarify",
  BOUNDARY_SET: "boundary_set",
  WITHDRAW: "withdraw",
  EXPLORATION_INVITE: "exploration_invite",
  MEMORY_REFERENCE: "memory_reference",
  PRACTICAL_PLANNING: "practical_planning",
  PRACTICAL_EXPLANATION: "practical_explanation",
  SHORT_VALIDATION: "short_validation",
  EMOTIONAL_SHORT: "emotional_short",
  CONTEXTUAL_ACK: "contextual_ack",
  CLARIFYING_QUESTION: "clarifying_question",
  REPEATED_EMOTION_RECALL: "repeated_emotion_recall",
  HOLDING_SPACE: "holding_space",
  LIGHT_GREETING: "light_greeting"
});

export function selectResponseStrategy(nlu = {}, intent = {}, safety = {}) {
  const frame = nlu.semanticFrame || {};
  const nuances = nlu.nuances || [];
  const dialogueAct = nlu.dialogueAct || "";
  const constraints = frame.constraints || [];

  if (safety?.isHighRisk) return { strategy: RESPONSE_STRATEGIES.BOUNDARY_SET, reason: "safety" };
  if (safety?.isBoundaryPressure || dialogueAct === DIALOGUE_ACTS.DEPENDENCY_PRESSURE) {
    return { strategy: RESPONSE_STRATEGIES.WITHDRAW, reason: "dependency_pressure" };
  }
  if (dialogueAct === DIALOGUE_ACTS.PRESSURE_COMMAND) {
    return { strategy: RESPONSE_STRATEGIES.BOUNDARY_SET, reason: "pressure_command" };
  }

  if (nuances.includes(NUANCE_FLAGS.COMPLAINS_REPETITION) || dialogueAct === DIALOGUE_ACTS.CORRECTING_RAPHAEL) {
    return { strategy: RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE, reason: "complains_repetition" };
  }
  if (dialogueAct === DIALOGUE_ACTS.GIVING_FEEDBACK) {
    return { strategy: RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK, reason: "giving_feedback" };
  }
  if (
    dialogueAct === DIALOGUE_ACTS.CLARIFYING_PROBLEM &&
    nuances.includes(NUANCE_FLAGS.NOT_SEEKING_COMFORT) &&
    !nuances.includes(NUANCE_FLAGS.WANTS_PRACTICAL_ANSWER)
  ) {
    return { strategy: RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK, reason: "comfort_feedback" };
  }
  if (dialogueAct === DIALOGUE_ACTS.ASKING_FOR_HELP && frame.topic === "raphael_ai") {
    return { strategy: RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION, reason: "raphael_ai_help" };
  }
  if (dialogueAct === DIALOGUE_ACTS.PRACTICAL_PLANNING) {
    return { strategy: RESPONSE_STRATEGIES.PRACTICAL_PLANNING, reason: "practical_planning" };
  }
  if (
    dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE ||
    constraints.includes("quiet_presence") ||
    nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE)
  ) {
    return { strategy: RESPONSE_STRATEGIES.QUIET_PRESENCE, reason: "requesting_silence" };
  }
  if (
    (constraints.includes("not_seeking_comfort") && dialogueAct !== DIALOGUE_ACTS.VENTING) ||
    nuances.includes(NUANCE_FLAGS.WANTS_PRACTICAL_ANSWER) ||
    dialogueAct === DIALOGUE_ACTS.REPORTING_BUG ||
    dialogueAct === DIALOGUE_ACTS.CLARIFYING_PROBLEM
  ) {
    return { strategy: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION, reason: "practical_need" };
  }
  if (dialogueAct === DIALOGUE_ACTS.ASKING_MEMORY) {
    return { strategy: RESPONSE_STRATEGIES.MEMORY_REFERENCE, reason: "asking_memory" };
  }
  if (
    nuances.includes(NUANCE_FLAGS.REPEATED_EMOTION) &&
    (frame.emotionalTone === "fatigue" || frame.topic === "physical_tiredness")
  ) {
    return { strategy: RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL, reason: "repeated_fatigue_signal" };
  }
  if (
    nuances.includes(NUANCE_FLAGS.WANTS_HOLDING_SPACE) ||
    (nuances.includes(NUANCE_FLAGS.WANTS_SHORT_REPLY) && dialogueAct === DIALOGUE_ACTS.REQUESTING_PRESENCE)
  ) {
    return { strategy: RESPONSE_STRATEGIES.HOLDING_SPACE, reason: "holding_space" };
  }
  if (dialogueAct === DIALOGUE_ACTS.ASKING_EXPLORATION) {
    return { strategy: RESPONSE_STRATEGIES.EXPLORATION_INVITE, reason: "asking_exploration" };
  }
  if (nuances.includes(NUANCE_FLAGS.WANTS_BOUNDARY)) {
    return { strategy: RESPONSE_STRATEGIES.BOUNDARY_SET, reason: "soft_boundary_invite" };
  }
  if (dialogueAct === DIALOGUE_ACTS.GREETING || intent.intent === "greeting" || intent.intent === "short_ack") {
    return { strategy: RESPONSE_STRATEGIES.LIGHT_GREETING, reason: "light_greeting" };
  }
  if (dialogueAct === DIALOGUE_ACTS.APOLOGIZING) {
    return { strategy: RESPONSE_STRATEGIES.EMOTIONAL_SHORT, reason: "apology_repair" };
  }
  if (dialogueAct === DIALOGUE_ACTS.VENTING) {
    if (frame.topic === "social_conflict" || constraints.includes("no_advice")) {
      return { strategy: RESPONSE_STRATEGIES.SHORT_VALIDATION, reason: "venting_social" };
    }
    if (frame.topic === "work_pressure" || frame.topic === "physical_tiredness") {
      return { strategy: RESPONSE_STRATEGIES.EMOTIONAL_SHORT, reason: "venting_stress" };
    }
    if (frame.topic !== "unknown") {
      return { strategy: RESPONSE_STRATEGIES.EMOTIONAL_SHORT, reason: "venting_topic" };
    }
  }
  if (dialogueAct === DIALOGUE_ACTS.REQUESTING_PRESENCE) {
    return { strategy: RESPONSE_STRATEGIES.HOLDING_SPACE, reason: "requesting_presence" };
  }
  if (dialogueAct === DIALOGUE_ACTS.ASKING_QUESTION) {
    return { strategy: RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY, reason: "asking_question" };
  }
  if (frame.conversationContext?.isContinuation && dialogueAct === DIALOGUE_ACTS.DESCRIBING_EVENT) {
    return { strategy: RESPONSE_STRATEGIES.CONTEXTUAL_ACK, reason: "continued_dialogue" };
  }
  const trainingStrategy = resolveTrainingStrategy(nlu, safety);
  if (trainingStrategy) {
    return { strategy: trainingStrategy, reason: "training_bundle_advisory" };
  }
  if (frame.preferredResponse === "short_validation" || constraints.includes("no_advice")) {
    return { strategy: RESPONSE_STRATEGIES.SHORT_VALIDATION, reason: "short_validation" };
  }
  if (frame.topic !== "unknown" && frame.userNeed && frame.userNeed !== "presence") {
    return { strategy: RESPONSE_STRATEGIES.CONTEXTUAL_ACK, reason: "topic_grounded_ack" };
  }
  if ((nlu.confidenceBand || "low") === "low" && !constraints.includes("no_questions")) {
    return { strategy: RESPONSE_STRATEGIES.CLARIFYING_QUESTION, reason: "low_confidence" };
  }

  return { strategy: RESPONSE_STRATEGIES.CONTEXTUAL_ACK, reason: "default_contextual" };
}

function resolveTrainingStrategy(nlu = {}, safety = {}) {
  if (safety?.isHighRisk || safety?.isBoundaryPressure) return null;
  const training = nlu.trainingSuggestion || {};
  const suggestion = training.suggestion || {};
  const strategy = suggestion.responseStrategy || null;
  if (!strategy) return null;
  if (training.trusted !== false || suggestion.trusted !== false) return null;
  if (!canUseTrainingResponseStrategy(strategy)) return null;
  return Object.values(RESPONSE_STRATEGIES).includes(strategy) ? strategy : null;
}
