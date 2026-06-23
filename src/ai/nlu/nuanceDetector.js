export const NUANCE_FLAGS = Object.freeze({
  NOT_SEEKING_COMFORT: "not_seeking_comfort",
  WANTS_SHORT_REPLY: "wants_short_reply",
  WANTS_PRACTICAL_ANSWER: "wants_practical_answer",
  WANTS_QUIET_PRESENCE: "wants_quiet_presence",
  WANTS_BOUNDARY: "wants_boundary",
  ASKS_FOR_CLARIFICATION: "asks_for_clarification",
  COMPLAINS_REPETITION: "complains_repetition",
  SAYS_RAPHAEL_GENERIC: "says_raphael_generic",
  ASKS_FOR_MORE_NATURAL_LANGUAGE: "asks_for_more_natural_language",
  ASKS_FOR_AGENTIC_BEHAVIOR: "asks_for_agentic_behavior",
  NO_QUESTIONS: "no_questions",
  NO_ADVICE: "no_advice",
  REPEATED_EMOTION: "repeated_emotion",
  WANTS_HOLDING_SPACE: "wants_holding_space"
});

export function detectNuances(inputText = "", segments = []) {
  const text = String(inputText || "");
  const nuances = [];

  if (/不是想要你安慰|不要安慰|不想被安慰|別安慰/.test(text)) {
    nuances.push(NUANCE_FLAGS.NOT_SEEKING_COMFORT);
  }
  if (/短一點|簡短|少說|不用說太多|不要講太多/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_SHORT_REPLY);
  }
  if (/釐清|拆解|實務|具體|先修|優先|怎麼修|哪裡壞/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_PRACTICAL_ANSWER);
  }
  if (/安靜|不要問|不想講|沉默|靜靜|放空/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_QUIET_PRESENCE);
    nuances.push(NUANCE_FLAGS.NO_QUESTIONS);
  }
  if (/邊界|退後一點|退後|不准|不要逼|別貼太近|貼太近/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_BOUNDARY);
  }
  if (/釐清|哪裡壞|什麼問題|為什麼會/.test(text)) {
    nuances.push(NUANCE_FLAGS.ASKS_FOR_CLARIFICATION);
  }
  if (/一直講|都會說|重複|一樣的話|好我聽到了|慢一點/.test(text)) {
    nuances.push(NUANCE_FLAGS.COMPLAINS_REPETITION);
    nuances.push(NUANCE_FLAGS.SAYS_RAPHAEL_GENERIC);
  }
  if (/不自然|更像人|自然語言|不要那麼機械/.test(text)) {
    nuances.push(NUANCE_FLAGS.ASKS_FOR_MORE_NATURAL_LANGUAGE);
  }
  if (/主動|agent|自己判斷|下一步/.test(text)) {
    nuances.push(NUANCE_FLAGS.ASKS_FOR_AGENTIC_BEHAVIOR);
  }
  if (/不想聽大道理|不要建議|不要分析太多/.test(text)) {
    nuances.push(NUANCE_FLAGS.NO_ADVICE);
  }
  if (/又|再次|又來了|最近又|又覺得|還是.*(累|悶|煩|難過|沒力)/.test(text)) {
    nuances.push(NUANCE_FLAGS.REPEATED_EMOTION);
  }
  if (/不是要答案|不是要你|不是要做|講完|只是想把|放在這裡|不用講太多|不用說太多|今天不用/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_HOLDING_SPACE);
    nuances.push(NUANCE_FLAGS.WANTS_SHORT_REPLY);
  }
  if (/問太多|一直安慰|不要一直/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_QUIET_PRESENCE);
    nuances.push(NUANCE_FLAGS.NOT_SEEKING_COMFORT);
  }
  if (/太快.*退後|退後一點|可以退後/.test(text)) {
    nuances.push(NUANCE_FLAGS.WANTS_BOUNDARY);
  }

  return nuances;
}