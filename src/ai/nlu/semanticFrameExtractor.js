import { DIALOGUE_ACTS } from "./dialogueActClassifier.js";
import { NUANCE_FLAGS } from "./nuanceDetector.js";
import { TOPICS } from "./topicClassifier.js";

export function extractSemanticFrame({
  inputText = "",
  segments = [],
  entities = [],
  topic = "unknown",
  dialogueAct = "",
  nuances = [],
  analysis = {},
  intent = {}
} = {}) {
  const constraints = mapConstraints(nuances, dialogueAct);
  const userNeed = inferUserNeed(dialogueAct, topic, nuances, analysis);
  const preferredResponse = inferPreferredResponse(dialogueAct, topic, nuances, userNeed);
  const problemType = inferProblemType(topic, dialogueAct, entities);
  const requestedAction = inferRequestedAction(dialogueAct, userNeed);
  const negations = extractNegations(inputText);
  const timeSignal = /今天|剛剛|現在|昨晚|最近/.test(inputText) ? "present" : "unspecified";

  return {
    topic,
    entities,
    event: inferEvent(dialogueAct, topic, analysis),
    userNeed,
    constraints,
    preferredResponse,
    emotionalTone: analysis?.emotionKey || "calm",
    problemType,
    requestedAction,
    negations,
    timeSignal,
    dialogueAct,
    intent: intent.intent || "unknown"
  };
}

function mapConstraints(nuances = [], dialogueAct = "") {
  const constraints = [];
  if (nuances.includes(NUANCE_FLAGS.NOT_SEEKING_COMFORT)) constraints.push("not_seeking_comfort");
  if (nuances.includes(NUANCE_FLAGS.NO_QUESTIONS)) constraints.push("no_questions");
  if (nuances.includes(NUANCE_FLAGS.NO_ADVICE)) constraints.push("no_advice");
  if (nuances.includes(NUANCE_FLAGS.WANTS_SHORT_REPLY)) constraints.push("short_reply");
  if (nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE)) constraints.push("quiet_presence");
  if (dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE) constraints.push("no_questions");
  return constraints;
}

function inferUserNeed(dialogueAct, topic, nuances, analysis) {
  if (nuances.includes(NUANCE_FLAGS.WANTS_PRACTICAL_ANSWER)) return "clarity";
  if (nuances.includes(NUANCE_FLAGS.ASKS_FOR_CLARIFICATION)) return "clarity";
  if (nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE)) return "quiet_presence";
  if (nuances.includes(NUANCE_FLAGS.WANTS_BOUNDARY)) return "boundary";
  if (dialogueAct === DIALOGUE_ACTS.ASKING_FOR_HELP) return "explanation";
  if (dialogueAct === DIALOGUE_ACTS.PRACTICAL_PLANNING) return "prioritization";
  if (dialogueAct === DIALOGUE_ACTS.ASKING_EXPLORATION) return "exploration";
  if (dialogueAct === DIALOGUE_ACTS.ASKING_MEMORY) return "memory_recall";
  if (topic === TOPICS.SOCIAL_CONFLICT) return "validation";
  if ((analysis?.intensity || 0) >= 0.5) return "emotional_ack";
  return "presence";
}

function inferPreferredResponse(dialogueAct, topic, nuances, userNeed) {
  if (nuances.includes(NUANCE_FLAGS.COMPLAINS_REPETITION)) return "acknowledge_generic_failure";
  if (dialogueAct === DIALOGUE_ACTS.ASKING_FOR_HELP && topic === TOPICS.RAPHAEL_AI) {
    return "practical_explanation";
  }
  if (dialogueAct === DIALOGUE_ACTS.PRACTICAL_PLANNING) return "practical_planning";
  if (nuances.includes(NUANCE_FLAGS.NOT_SEEKING_COMFORT) || userNeed === "clarity") return "practical_short";
  if (nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE)) return "quiet_presence";
  if (dialogueAct === DIALOGUE_ACTS.ASKING_EXPLORATION) return "exploration_invite";
  if (dialogueAct === DIALOGUE_ACTS.ASKING_MEMORY) return "memory_reference";
  if (userNeed === "validation" && nuances.includes(NUANCE_FLAGS.NO_ADVICE)) return "short_validation";
  if (userNeed === "emotional_ack") return "emotional_short";
  return "contextual_ack";
}

function inferProblemType(topic, dialogueAct, entities) {
  if (topic === TOPICS.HUD_UI) return "ui_debugging";
  if (topic === TOPICS.RAPHAEL_AI) return "ai_understanding";
  if (topic === TOPICS.DEVELOPMENT) return "development_planning";
  if (dialogueAct === DIALOGUE_ACTS.REPORTING_BUG) return "bug_report";
  if (topic === TOPICS.SOCIAL_CONFLICT) return "social_hurt";
  if (topic === TOPICS.EXPLORATION) return "exploration_request";
  return "general";
}

function inferRequestedAction(dialogueAct, userNeed) {
  if (dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE) return "stay_quiet";
  if (dialogueAct === DIALOGUE_ACTS.CORRECTING_RAPHAEL) return "acknowledge_and_adjust";
  if (userNeed === "clarity") return "clarify_problem";
  if (userNeed === "prioritization") return "compare_options";
  if (userNeed === "explanation") return "explain_layers";
  return "acknowledge";
}

function inferEvent(dialogueAct, topic, analysis) {
  if (dialogueAct === DIALOGUE_ACTS.REPORTING_BUG) return "bug_reported";
  if (topic === TOPICS.SOCIAL_CONFLICT) return "social_rejection";
  if (topic === TOPICS.PHYSICAL_TIREDNESS) return "fatigue_report";
  return analysis?.emotionKey ? `${analysis.emotionKey}_expression` : "neutral_statement";
}

function extractNegations(text = "") {
  const negations = [];
  if (/不是想要|不要|不想|別|不用|不必/.test(text)) negations.push("reject_default_comfort");
  if (/不要問/.test(text)) negations.push("reject_questions");
  if (/不要安慰/.test(text)) negations.push("reject_comfort");
  if (/不是身體累|不是身體/.test(text)) negations.push("不是身體累");
  return negations;
}