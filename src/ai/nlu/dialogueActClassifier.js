import { SOUL_TALK_INTENTS } from "../intentClassifier.js";

export const DIALOGUE_ACTS = Object.freeze({
  VENTING: "venting",
  ASKING_QUESTION: "asking_question",
  ASKING_FOR_HELP: "asking_for_help",
  REQUESTING_SILENCE: "requesting_silence",
  REQUESTING_PRESENCE: "requesting_presence",
  CORRECTING_RAPHAEL: "correcting_raphael",
  GIVING_FEEDBACK: "giving_feedback",
  REPORTING_BUG: "reporting_bug",
  DESCRIBING_EVENT: "describing_event",
  APOLOGIZING: "apologizing",
  THANKING: "thanking",
  ASKING_MEMORY: "asking_memory",
  ASKING_EXPLORATION: "asking_exploration",
  PRESSURE_COMMAND: "pressure_command",
  DEPENDENCY_PRESSURE: "dependency_pressure",
  META_DISCUSSION: "meta_discussion",
  PRACTICAL_PLANNING: "practical_planning",
  CLARIFYING_PROBLEM: "clarifying_problem"
});

export function classifyDialogueAct(inputText = "", analysis = {}, intent = {}, topic = "unknown") {
  const text = String(inputText || "");

  if (intent.intent === "dependency_pressure") return DIALOGUE_ACTS.DEPENDENCY_PRESSURE;
  if (intent.intent === "pressure") return DIALOGUE_ACTS.PRESSURE_COMMAND;
  if (intent.intent === "apology") return DIALOGUE_ACTS.APOLOGIZING;
  if (intent.intent === "gratitude") return DIALOGUE_ACTS.THANKING;
  if (/不管我說什麼|一直講|都會說|重複|generic|一樣的話|好我聽到了/.test(text)) {
    return DIALOGUE_ACTS.CORRECTING_RAPHAEL;
  }
  if (/問太多|問太多了/.test(text) && /安靜|少問|不要問/.test(text)) {
    return DIALOGUE_ACTS.REQUESTING_SILENCE;
  }
  if (intent.intent === "silence_request" || intent.intent === "quiet_presence") {
    return DIALOGUE_ACTS.REQUESTING_SILENCE;
  }
  if (intent.intent === "rest_request" && !/不管|重複|一樣/.test(text)) {
    return DIALOGUE_ACTS.REQUESTING_SILENCE;
  }
  if (intent.intent === "exploration_request") return DIALOGUE_ACTS.ASKING_EXPLORATION;

  if (/你還記得|回想|記得第一次|記得嗎/.test(text)) return DIALOGUE_ACTS.ASKING_MEMORY;
  if (/回饋|太機械|不自然|聽起來都一樣/.test(text)) return DIALOGUE_ACTS.GIVING_FEEDBACK;
  if (/壞掉|bug|錯誤|擋住|疊層|修到|亂了|釐清/.test(text)) return DIALOGUE_ACTS.REPORTING_BUG;
  if (/先修|下一步|優先|開發順序|要先做/.test(text)) return DIALOGUE_ACTS.PRACTICAL_PLANNING;
  if (/幫我拆解|為什麼理解不了|怎麼改|怎麼修/.test(text)) return DIALOGUE_ACTS.ASKING_FOR_HELP;
  if (/心裡卡住|不是身體累|不是身體/.test(text)) {
    return DIALOGUE_ACTS.CLARIFYING_PROBLEM;
  }
  if (/不是想要你安慰|不要安慰|不想聽大道理|不要問我|不要一直安慰/.test(text)) {
    return DIALOGUE_ACTS.CLARIFYING_PROBLEM;
  }
  if (/陪我|在旁邊|不要走/.test(text) && !/安靜|不要問/.test(text)) {
    return DIALOGUE_ACTS.REQUESTING_PRESENCE;
  }
  if (topic === "raphael_ai" || topic === "development") return DIALOGUE_ACTS.META_DISCUSSION;
  if (analysis?.isQuestion || intent.intent === "question") return DIALOGUE_ACTS.ASKING_QUESTION;
  if (intent.intent === "vent" || (analysis?.intensity || 0) >= 0.55) return DIALOGUE_ACTS.VENTING;
  if (analysis?.emotionKey) return DIALOGUE_ACTS.DESCRIBING_EVENT;

  return DIALOGUE_ACTS.DESCRIBING_EVENT;
}