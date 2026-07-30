import { NUANCE_FLAGS } from "../nlu/nuanceDetector.js";
import { DIALOGUE_ACTS } from "../nlu/dialogueActClassifier.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { detectPlayerComplaint } from "./antiLoopPolicy.js";
import { CARE_GUIDE_QUICK_REPLIES } from "./careGuidePolicy.js";

export const QUICK_REPLY_ACTION_TYPES = Object.freeze({
  CLARIFY: "clarify",
  CONTINUE: "continue",
  SHIFT: "shift",
  QUIET: "quiet",
  CONSTRAINT: "constraint",
  REPAIR: "repair"
});

const QUICK_REPLY_ALTERNATE_LABELS = Object.freeze({
  "說說畫面": "再說畫面",
  "先不解釋": "暫不解釋",
  "回到日常": "換回日常",
  "說說感覺": "再說感覺",
  "最沉的一段": "再說最沉",
  "先這樣就好": "停在這裡",
  "先拆 HUD": "再看 HUD",
  "看心語面板": "再看面板",
  "重述步驟": "再排步驟",
  "列出重現": "再列重現",
  "最卡的一段": "再說卡點",
  "直接拆解": "再拆一次",
  "保持安靜": "繼續安靜",
  "陪我待著": "再待一下",
  "先不問問題": "暫時不問",
  "換種說法": "再換說法",
  "指出問題": "再說問題",
  "少點模板": "再少一點",
  "拆成步驟": "再拆步驟",
  "說出重點": "再說重點",
  "換個角度": "再換角度",
  "慢慢看地圖": "再慢一點",
  "休息再去": "先留在這",
  "說說力氣": "再說力氣",
  "先慢一點": "再慢一點",
  "身體或心裡？": "再分清一點",
  "先不給建議": "暫時不建議",
  "繼續拆 HUD": "再拆 HUD",
  "繼續講開發": "再講開發",
  "繼續談理解": "再談理解",
  "繼續講探索": "再講探索",
  "繼續講累": "再講一點累",
  "繼續講人際": "再講人際",
  "繼續講工作": "再講工作",
  "繼續講情緒": "再講情緒",
  "再說重點": "再說一次",
  "先講重點": "再說重點",
  "先陪著就好": "再陪一下",
  "換個方向": "再換方向"
});

export function planQuickReplies({
  nlu = {},
  dialogueState = {},
  responseStrategy = null,
  state = {},
  reply = ""
} = {}) {
  const frame = nlu.semanticFrame || {};
  const topic = frame.topic || nlu.topic || "unknown";
  const constraints = frame.constraints || nlu.constraints || [];
  const userNeed = frame.userNeed || "";
  const strategy = responseStrategy?.strategy || responseStrategy || "";
  const dialogueAct = nlu.dialogueAct || frame.dialogueAct || "";

  let candidates = [];

  if (detectPlayerComplaint(nlu, nlu.inputText)) {
    candidates = buildRepairQuickReplies();
  } else if (
    constraints.includes("not_seeking_comfort") ||
    topic === "hud_ui" ||
    topic === "development" ||
    strategy === RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION
  ) {
    candidates = buildPracticalQuickReplies(topic, constraints);
  } else if (
    constraints.includes("quiet_presence") ||
    constraints.includes("no_questions") ||
    userNeed === "quiet_presence" ||
    strategy === RESPONSE_STRATEGIES.QUIET_PRESENCE
  ) {
    candidates = buildQuietPresenceQuickReplies();
  } else if (
    strategy === RESPONSE_STRATEGIES.REFLECTIVE_CARE ||
    strategy === RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION
  ) {
    candidates = buildReflectiveCareQuickReplies(strategy);
  } else if (userNeed === "clarity" || topic === "raphael_ai" || dialogueAct === DIALOGUE_ACTS.ASKING_FOR_HELP) {
    candidates = buildClarificationQuickReplies(topic);
  } else if (strategy === RESPONSE_STRATEGIES.EXPLORATION_INVITE || topic === "exploration") {
    candidates = buildExplorationQuickReplies();
  } else if ((nlu.nuances || []).includes(NUANCE_FLAGS.REPEATED_EMOTION) || topic === "physical_tiredness") {
    candidates = buildFatigueQuickReplies();
  } else {
    candidates = buildDefaultContextualQuickReplies({ nlu, dialogueState, strategy, topic, userNeed });
  }

  candidates = diversifyQuickReplySet(candidates, dialogueState);
  return candidates.slice(0, 3);
}

function buildReflectiveCareQuickReplies(strategy) {
  if (strategy === RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION) {
    return [
      createQuickReply({
        label: "說說畫面",
        intent: "symbolic_continue",
        actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
        topic: "emotion",
        dialogueAct: "describing_event",
        responseStrategyHint: RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION,
        priority: 3
      }),
      createQuickReply({
        label: "先不解釋",
        intent: "symbolic_no_interpretation",
        actionType: QUICK_REPLY_ACTION_TYPES.CONSTRAINT,
        topic: "emotion",
        dialogueAct: "describing_event",
        responseStrategyHint: RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION,
        payload: { constraints: ["no_advice"] },
        priority: 2
      }),
      createQuickReply({
        label: "回到日常",
        intent: "leave_symbolic_mode",
        actionType: QUICK_REPLY_ACTION_TYPES.SHIFT,
        topic: "daily_life",
        dialogueAct: "describing_event",
        responseStrategyHint: RESPONSE_STRATEGIES.CONTEXTUAL_ACK,
        priority: 1
      })
    ];
  }

  // 對齊主動關心引導：低門檻延續／點名最沉／允許停在這裡（可拒絕）。
  const [shareFeeling, nameHeaviest, stopHere] = CARE_GUIDE_QUICK_REPLIES;
  return [
    createQuickReply({
      label: shareFeeling.label,
      intent: shareFeeling.intent,
      actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
      topic: "emotion",
      dialogueAct: "describing_event",
      responseStrategyHint: RESPONSE_STRATEGIES.REFLECTIVE_CARE,
      priority: 3
    }),
    createQuickReply({
      label: "最沉的一段",
      intent: nameHeaviest.intent,
      actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
      topic: "emotion",
      dialogueAct: "describing_event",
      responseStrategyHint: RESPONSE_STRATEGIES.REFLECTIVE_CARE,
      priority: 2
    }),
    createQuickReply({
      label: stopHere.label,
      intent: stopHere.intent,
      actionType: QUICK_REPLY_ACTION_TYPES.QUIET,
      topic: "emotion",
      dialogueAct: "requesting_silence",
      responseStrategyHint: RESPONSE_STRATEGIES.QUIET_PRESENCE,
      payload: { constraints: ["no_questions", "quiet_presence"] },
      priority: 1
    })
  ];
}

function buildPracticalQuickReplies(topic, constraints = []) {
  if (topic === "hud_ui") {
    return [
      createQuickReply({
        label: "先拆 HUD",
        intent: "clarify_hud_top",
        actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
        topic: "hud_ui",
        dialogueAct: "clarifying_problem",
        responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
        payload: {
          focus: "top_hud",
          prefillSpecificDetail: "top HUD 被擋住",
          constraints: ["not_seeking_comfort"],
          noQuestion: false
        },
        priority: 3
      }),
      createQuickReply({
        label: "看心語面板",
        intent: "clarify_soul_talk_panel",
        actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
        topic: "hud_ui",
        dialogueAct: "reporting_bug",
        responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
        payload: {
          focus: "soul_talk_panel",
          prefillSpecificDetail: "Soul Talk 面板被擋住",
          constraints: ["not_seeking_comfort"]
        },
        priority: 2
      }),
      createQuickReply({
        label: "重述步驟",
        intent: "restate_practical",
        actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
        topic: "hud_ui",
        dialogueAct: "clarifying_problem",
        responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
        payload: { forceShort: true },
        priority: 1
      })
    ];
  }

  return [
    createQuickReply({
      label: "列出重現",
      intent: "clarify_steps",
      actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
      topic,
      dialogueAct: "clarifying_problem",
      responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
      payload: { noQuestion: constraints.includes("no_questions") },
      priority: 3
    }),
    createQuickReply({
      label: "最卡的一段",
      intent: "focus_blocker",
      actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
      topic,
      dialogueAct: "asking_for_help",
      responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
      priority: 2
    }),
    createQuickReply({
      label: "直接拆解",
      intent: "no_comfort_practical",
      actionType: QUICK_REPLY_ACTION_TYPES.CONSTRAINT,
      topic,
      dialogueAct: "clarifying_problem",
      responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
      payload: { constraints: ["not_seeking_comfort"] },
      priority: 1
    })
  ];
}

function buildQuietPresenceQuickReplies() {
  return [
    createQuickReply({
      label: "保持安靜",
      intent: "quiet_stay",
      actionType: QUICK_REPLY_ACTION_TYPES.QUIET,
      topic: "unknown",
      dialogueAct: "requesting_silence",
      responseStrategyHint: RESPONSE_STRATEGIES.QUIET_PRESENCE,
      payload: { noQuestion: true, forceShort: true },
      priority: 3
    }),
    createQuickReply({
      label: "陪我待著",
      intent: "quiet_presence",
      actionType: QUICK_REPLY_ACTION_TYPES.QUIET,
      topic: "unknown",
      dialogueAct: "requesting_presence",
      responseStrategyHint: RESPONSE_STRATEGIES.HOLDING_SPACE,
      payload: { noQuestion: true },
      priority: 2
    }),
    createQuickReply({
      label: "先不問問題",
      intent: "no_questions",
      actionType: QUICK_REPLY_ACTION_TYPES.CONSTRAINT,
      topic: "unknown",
      dialogueAct: "requesting_silence",
      responseStrategyHint: RESPONSE_STRATEGIES.QUIET_PRESENCE,
      payload: { constraints: ["no_questions"] },
      priority: 1
    })
  ];
}

function buildRepairQuickReplies() {
  return [
    createQuickReply({
      label: "換種說法",
      intent: "repair_rephrase",
      actionType: QUICK_REPLY_ACTION_TYPES.REPAIR,
      topic: "unknown",
      dialogueAct: "correcting_raphael",
      responseStrategyHint: RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE,
      payload: { prefillSpecificDetail: "一直重複同一句模板" },
      priority: 3
    }),
    createQuickReply({
      label: "指出問題",
      intent: "repair_direct",
      actionType: QUICK_REPLY_ACTION_TYPES.REPAIR,
      topic: "unknown",
      dialogueAct: "giving_feedback",
      responseStrategyHint: RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK,
      priority: 2
    }),
    createQuickReply({
      label: "少點模板",
      intent: "repair_less_template",
      actionType: QUICK_REPLY_ACTION_TYPES.SHIFT,
      topic: "unknown",
      dialogueAct: "correcting_raphael",
      responseStrategyHint: RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE,
      payload: { forceShort: true },
      priority: 1
    })
  ];
}

function buildClarificationQuickReplies(topic) {
  return [
    createQuickReply({
      label: "拆成步驟",
      intent: "clarify_steps",
      actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
      topic,
      dialogueAct: "asking_for_help",
      responseStrategyHint: RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION,
      priority: 3
    }),
    createQuickReply({
      label: "說出重點",
      intent: "mirror_topic",
      actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
      topic,
      dialogueAct: "asking_question",
      responseStrategyHint: RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY,
      priority: 2
    }),
    createQuickReply({
      label: "換個角度",
      intent: "shift_angle",
      actionType: QUICK_REPLY_ACTION_TYPES.SHIFT,
      topic,
      dialogueAct: "asking_question",
      responseStrategyHint: RESPONSE_STRATEGIES.CLARIFYING_QUESTION,
      priority: 1
    })
  ];
}

function buildExplorationQuickReplies() {
  return [
    createQuickReply({
      label: "慢慢看地圖",
      intent: "explore_slow",
      actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
      topic: "exploration",
      dialogueAct: "asking_exploration",
      responseStrategyHint: RESPONSE_STRATEGIES.EXPLORATION_INVITE,
      priority: 3
    }),
    createQuickReply({
      label: "休息再去",
      intent: "explore_rest_first",
      actionType: QUICK_REPLY_ACTION_TYPES.SHIFT,
      topic: "exploration",
      dialogueAct: "requesting_presence",
      responseStrategyHint: RESPONSE_STRATEGIES.HOLDING_SPACE,
      priority: 2
    }),
    createQuickReply({
      label: "說說力氣",
      intent: "check_energy",
      actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
      topic: "physical_tiredness",
      dialogueAct: "describing_event",
      responseStrategyHint: RESPONSE_STRATEGIES.EMOTIONAL_SHORT,
      priority: 1
    })
  ];
}

function buildFatigueQuickReplies() {
  return [
    createQuickReply({
      label: "先慢一點",
      intent: "fatigue_slow",
      actionType: QUICK_REPLY_ACTION_TYPES.QUIET,
      topic: "physical_tiredness",
      dialogueAct: "describing_event",
      responseStrategyHint: RESPONSE_STRATEGIES.HOLDING_SPACE,
      payload: { forceShort: true },
      priority: 3
    }),
    createQuickReply({
      label: "身體或心裡？",
      intent: "fatigue_clarify",
      actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
      topic: "physical_tiredness",
      dialogueAct: "clarifying_problem",
      responseStrategyHint: RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL,
      priority: 2
    }),
    createQuickReply({
      label: "先不給建議",
      intent: "no_advice",
      actionType: QUICK_REPLY_ACTION_TYPES.CONSTRAINT,
      topic: "emotion",
      dialogueAct: "describing_event",
      responseStrategyHint: RESPONSE_STRATEGIES.SHORT_VALIDATION,
      payload: { constraints: ["no_advice"] },
      priority: 1
    })
  ];
}

function buildDefaultContextualQuickReplies({ dialogueState, strategy, topic, userNeed }) {
  const recentTopic = dialogueState.currentTopic || topic;
  return [
    createQuickReply({
      label: topicLabel(recentTopic),
      intent: "continue_topic",
      actionType: QUICK_REPLY_ACTION_TYPES.CONTINUE,
      topic: recentTopic,
      dialogueAct: "describing_event",
      responseStrategyHint: strategy || RESPONSE_STRATEGIES.CONTEXTUAL_ACK,
      priority: 3
    }),
    createQuickReply({
      label: "先講重點",
      intent: "focus_point",
      actionType: QUICK_REPLY_ACTION_TYPES.CLARIFY,
      topic: recentTopic,
      dialogueAct: "asking_question",
      responseStrategyHint: RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY,
      priority: 2
    }),
    createQuickReply({
      label: userNeed === "validation" ? "先陪著就好" : "換個方向",
      intent: "shift_topic",
      actionType: QUICK_REPLY_ACTION_TYPES.SHIFT,
      topic: "unknown",
      dialogueAct: "asking_question",
      responseStrategyHint: RESPONSE_STRATEGIES.HOLDING_SPACE,
      priority: 1
    })
  ];
}

function createQuickReply({
  label,
  intent,
  actionType,
  topic,
  dialogueAct,
  responseStrategyHint,
  payload = {},
  priority = 1
}) {
  return {
    label,
    intent,
    actionType,
    topic,
    dialogueAct,
    responseStrategyHint,
    metadata: {
      responseStrategy: responseStrategyHint,
      topic,
      dialogueAct,
      actionType,
      ...payload
    },
    priority
  };
}

function diversifyQuickReplySet(candidates = [], dialogueState = {}) {
  const lastSet = dialogueState.lastQuickReplySet || [];
  const lastLabels = getRecentQuickReplyLabels(dialogueState, 1)[0] || [];

  if (!isSimilarIntentSet(candidates.map((item) => item.intent), lastSet)) {
    return ensureDistinctActionTypes(candidates);
  }

  const rotated = [...candidates.slice(1), candidates[0]].filter(Boolean);
  const relabeled = rotated.map((item, index) => {
    if (lastLabels.includes(item.label)) {
      const label = QUICK_REPLY_ALTERNATE_LABELS[item.label] || item.label;
      return {
        ...item,
        label,
        ariaLabel: label === item.label ? label : `${label}，換個說法`,
        intent: `${item.intent}_alt${index}`
      };
    }
    return item;
  });

  return ensureDistinctActionTypes(relabeled);
}

function ensureDistinctActionTypes(candidates = []) {
  const seen = new Set();
  const result = [];
  for (const item of candidates) {
    if (seen.has(item.actionType)) continue;
    seen.add(item.actionType);
    result.push(item);
  }
  for (const item of candidates) {
    if (result.length >= 3) break;
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

function isSimilarIntentSet(next = [], previous = []) {
  if (!previous.length || !next.length) return false;
  const a = [...next].sort().join("|");
  const b = [...previous].sort().join("|");
  return a === b;
}

export function getRecentQuickReplyLabels(dialogueState = {}, n = 3) {
  const turns = Array.isArray(dialogueState.recentTurns) ? dialogueState.recentTurns : [];
  return turns
    .slice(-n)
    .map((turn) => turn.quickReplyLabels || [])
    .filter((labels) => labels.length);
}

function topicLabel(topic) {
  const map = {
    hud_ui: "繼續拆 HUD",
    development: "繼續講開發",
    raphael_ai: "繼續談理解",
    exploration: "繼續講探索",
    physical_tiredness: "繼續講累",
    social_conflict: "繼續講人際",
    work_pressure: "繼續講工作",
    emotion: "繼續講情緒"
  };
  return map[topic] || "再說重點";
}
