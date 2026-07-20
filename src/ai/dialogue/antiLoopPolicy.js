import { NUANCE_FLAGS } from "../nlu/nuanceDetector.js";
import { DIALOGUE_ACTS } from "../nlu/dialogueActClassifier.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { setLastPlayerComplaint } from "./dialogueStateTracker.js";

const STRATEGY_ALTERNATIVES = Object.freeze({
  [RESPONSE_STRATEGIES.CONTEXTUAL_ACK]: RESPONSE_STRATEGIES.HOLDING_SPACE,
  [RESPONSE_STRATEGIES.CLARIFYING_QUESTION]: RESPONSE_STRATEGIES.CONTEXTUAL_ACK,
  [RESPONSE_STRATEGIES.EMOTIONAL_SHORT]: RESPONSE_STRATEGIES.SHORT_VALIDATION,
  [RESPONSE_STRATEGIES.SHORT_VALIDATION]: RESPONSE_STRATEGIES.HOLDING_SPACE,
  [RESPONSE_STRATEGIES.LIGHT_GREETING]: RESPONSE_STRATEGIES.CONTEXTUAL_ACK,
  // 注意：不可指向 PRACTICAL_CLARIFICATION —— 那組替代策略會連帶把
  // quickReplyPlanner 導去除錯／HUD 語彙的快速回覆池（"先列現象與重現" 等），
  // 對一般問句（例如身份/依附提問）完全語域錯配、瞬間出戲。
  // HOLDING_SPACE 是安全的通用替代：語氣是「先不給答案、陪著」，適用任何主題。
  [RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY]: RESPONSE_STRATEGIES.HOLDING_SPACE,
  [RESPONSE_STRATEGIES.HOLDING_SPACE]: RESPONSE_STRATEGIES.QUIET_PRESENCE,
  [RESPONSE_STRATEGIES.QUIET_PRESENCE]: RESPONSE_STRATEGIES.HOLDING_SPACE,
  [RESPONSE_STRATEGIES.MEMORY_REFERENCE]: RESPONSE_STRATEGIES.CONTEXTUAL_ACK,
  [RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL]: RESPONSE_STRATEGIES.EMOTIONAL_SHORT
});

export function evaluateAntiLoop({
  nlu = {},
  responseStrategy = null,
  dialogueState = {},
  inputText = "",
  sessionKey = "default"
} = {}) {
  const decision = {
    shouldBlock: false,
    forceStrategy: null,
    reason: "",
    complaintType: null
  };

  const currentStrategy = responseStrategy?.strategy || responseStrategy || null;
  const recent = (dialogueState.recentTurns || []).slice(-3);

  const complaint = detectPlayerComplaint(nlu, inputText);
  if (complaint) {
    setLastPlayerComplaint(sessionKey, complaint);
    decision.shouldBlock = true;
    decision.forceStrategy =
      complaint === "template" || complaint === "repetition" || complaint === "jumping"
        ? RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE
        : RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK;
    decision.reason = `player_complaint_${complaint}`;
    decision.complaintType = complaint;
    return decision;
  }

  if (currentStrategy) {
    const sameStrategyCount = recent.filter((turn) => turn.responseStrategy === currentStrategy).length;
    if (sameStrategyCount >= 3) {
      decision.shouldBlock = true;
      decision.forceStrategy = pickAlternativeStrategy(currentStrategy);
      decision.reason = "strategy_repeated";
      return decision;
    }
  }

  const proposedVariantId = inferProposedVariantId(currentStrategy);
  if (proposedVariantId && currentStrategy !== RESPONSE_STRATEGIES.LIGHT_GREETING) {
    const sameVariantCount = recent.filter((turn) => turn.variantId === proposedVariantId).length;
    if (sameVariantCount >= 2) {
      decision.shouldBlock = true;
      decision.forceStrategy = pickAlternativeStrategy(currentStrategy);
      decision.reason = "same_variant_repeated";
      return decision;
    }
  }

  if ((dialogueState.repetitionScore || 0) >= 0.75 && currentStrategy === RESPONSE_STRATEGIES.CONTEXTUAL_ACK) {
    decision.shouldBlock = true;
    decision.forceStrategy = RESPONSE_STRATEGIES.HOLDING_SPACE;
    decision.reason = "high_repetition_score";
    return decision;
  }

  return decision;
}

export function detectPlayerComplaint(nlu = {}, inputText = "") {
  const text = String(inputText || nlu?.inputText || "").toLowerCase();
  const nuances = nlu?.nuances || [];
  const dialogueAct = nlu?.dialogueAct || "";

  if (
    nuances.includes(NUANCE_FLAGS.COMPLAINS_REPETITION) ||
    dialogueAct === DIALOGUE_ACTS.CORRECTING_RAPHAEL ||
    /跳針|一樣的話|又說|都會說|好我聽到了|念稿|太機械/.test(text)
  ) {
    if (/模板|像ai|固定|念稿/.test(text)) return "template";
    if (/跳針|又說|一樣的話/.test(text)) return "jumping";
    return "repetition";
  }

  if (/模板|像ai|固定句|像機器/.test(text)) return "template";
  if (/跳針/.test(text)) return "jumping";
  if (/重複|一直講|一直說/.test(text)) return "repetition";

  return null;
}

export function pickAlternativeStrategy(currentStrategy = "") {
  return STRATEGY_ALTERNATIVES[currentStrategy] || RESPONSE_STRATEGIES.HOLDING_SPACE;
}

function inferProposedVariantId(strategy) {
  if (!strategy) return null;
  return `strategy:${strategy}`;
}