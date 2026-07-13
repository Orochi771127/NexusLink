/**
 * Session-scoped dialogue loop state — not persisted to STORAGE_KEY / defaultState.
 * Pattern mirrors companionPreferenceProfile session cache.
 */

const MAX_TURNS = 8;
const SESSION_DIALOGUE = new Map();

export function createEmptyDialogueState() {
  return {
    recentTurns: [],
    currentTopic: null,
    lastResponseStrategy: null,
    lastVariantId: null,
    lastQuickReplySet: [],
    topicShiftCount: 0,
    repetitionScore: 0,
    lastPlayerComplaintType: null,
    activeContext: null
  };
}

export function getDialogueState(sessionKey = "default") {
  const key = String(sessionKey || "default");
  if (!SESSION_DIALOGUE.has(key)) {
    SESSION_DIALOGUE.set(key, createEmptyDialogueState());
  }
  return SESSION_DIALOGUE.get(key);
}

export function clearDialogueState(sessionKey = "default") {
  SESSION_DIALOGUE.delete(String(sessionKey || "default"));
}

export function clearAllDialogueStates() {
  SESSION_DIALOGUE.clear();
}

export function recordDialogueTurn(sessionKey = "default", coreResult = {}) {
  const state = getDialogueState(sessionKey);
  const strategy = coreResult.responseStrategy?.strategy || coreResult.responseStrategy || null;
  const topic = coreResult.nlu?.topic || coreResult.nlu?.semanticFrame?.topic || null;
  const previousTopic = state.currentTopic;

  const turn = {
    turnId: Number(coreResult.now) || Date.now(),
    userInput: String(coreResult.inputText || coreResult.input?.originalInput || "").trim(),
    topic,
    dialogueAct: coreResult.nlu?.dialogueAct || coreResult.nlu?.semanticFrame?.dialogueAct || null,
    userNeed: coreResult.nlu?.semanticFrame?.userNeed || null,
    specificDetail: coreResult.nlu?.semanticFrame?.specificDetail || null,
    constraints: coreResult.nlu?.constraints || coreResult.nlu?.semanticFrame?.constraints || [],
    responseStrategy: strategy,
    variantId: coreResult.composeMeta?.variantId || null,
    replySource: coreResult.composeMeta?.replySource || null,
    openingPhrase: coreResult.composeMeta?.openingPhrase || null,
    reply: coreResult.reply || coreResult.output?.reply || "",
    quickReplyIntents: (coreResult.quickReplies || []).map((item) => item.intent).filter(Boolean),
    quickReplyLabels: (coreResult.quickReplies || []).map((item) => item.label).filter(Boolean),
    timestamp: Number(coreResult.now) || Date.now()
  };

  state.recentTurns.push(turn);
  if (state.recentTurns.length > MAX_TURNS) {
    state.recentTurns.shift();
  }

  if (previousTopic && topic && topic !== "unknown" && previousTopic !== topic) {
    state.topicShiftCount += 1;
  }

  if (topic && topic !== "unknown") state.currentTopic = topic;
  state.lastResponseStrategy = strategy;
  state.lastVariantId = turn.variantId;
  state.lastQuickReplySet = turn.quickReplyIntents;
  state.repetitionScore = computeRepetitionScore(state.recentTurns);
  state.activeContext = updateActiveContext(state.activeContext, turn);

  return state;
}

export function applyRecentDialogueContext(nlu = {}, state = {}) {
  const inputText = String(nlu.inputText || "");
  const activeContext = state.activeContext;
  const explicitTopicShift = /換個話題|换个话题|對了|对了|另外/.test(inputText);
  const isContinuation = !explicitTopicShift && isContinuationInput(inputText, activeContext);
  if (!isContinuation || !activeContext) {
    return nlu;
  }

  const inheritedTopic = nlu.topic === "unknown" ? activeContext.topic : nlu.topic;

  return {
    ...nlu,
    topic: inheritedTopic,
    semanticFrame: {
      ...nlu.semanticFrame,
      topic: inheritedTopic,
      conversationContext: {
        inheritedTopic,
        source: "recent_dialogue",
        isContinuation: true,
        subject: activeContext.subject,
        previousDetail: activeContext.detail,
        previousInput: activeContext.lastPlayerInput,
        previousReply: activeContext.lastCompanionReply
      }
    }
  };
}

function updateActiveContext(current, turn) {
  const subject = inferConversationSubject(
    turn.userInput,
    turn.topic && turn.topic !== "unknown" ? turn.topic : current?.topic,
    current?.subject
  );
  const subjectChanged = Boolean(current?.subject && subject !== current.subject);
  const topic = turn.topic && turn.topic !== "unknown"
    ? turn.topic
    : (subjectChanged ? inferTopicForSubject(subject) : current?.topic) || inferTopicForSubject(subject);
  const detail = turn.specificDetail?.text || current?.detail || turn.userInput;
  if (!topic && !detail) return current || null;
  return {
    topic,
    subject,
    detail,
    lastPlayerInput: turn.userInput,
    lastCompanionReply: turn.reply
  };
}

function inferTopicForSubject(subject) {
  if (subject === "friend_reply" || subject === "relationship") return "social_conflict";
  if (subject === "meeting_mishap") return "work_pressure";
  if (["clothing_mishap", "dinner_choice", "companion_day"].includes(subject)) return "daily_life";
  return null;
}

function isContinuationInput(inputText, activeContext) {
  if (!activeContext) return false;
  if (/剛才|剛剛|刚才|刚刚|那件事|後來|后来|接著|接着|然後|然后|而且|可是|不過|不过|反正|以前|最後|最后|這樣|这样|吐槽/.test(inputText)) {
    return true;
  }
  if (/[他她它]什麼|[他她它]什么|^[他她它]|我知道[他她它]|[他她它]可能|直接問|直接问|顯得很黏|显得很黏|算逃避|有什麼想法|有什么想法/.test(inputText)) {
    return true;
  }
  return inputText.length <= 14 && /^(嗯|咦|蛤|好|算了|但|那|所以|沒事|没事)/.test(inputText);
}

function inferConversationSubject(inputText, topic, previousSubject = "") {
  const text = String(inputText || "");
  if (/朋友|回訊息|回消息|已讀|已读/.test(text)) return "friend_reply";
  if (/會議|会议|主管|投影機|投影仪/.test(text)) return "meeting_mishap";
  if (/襪子|袜子|穿反/.test(text)) return "clothing_mishap";
  if (/晚餐|吃什麼|吃什么|太油/.test(text)) return "dinner_choice";
  if (/湖邊|湖边|你今天.*做什麼|你今天.*做什么/.test(text)) return "companion_day";
  if (topic === "relationship" || topic === "social_conflict") return previousSubject || "relationship";
  return previousSubject || topic || "daily_event";
}

export function setLastPlayerComplaint(sessionKey = "default", complaintType = null) {
  const state = getDialogueState(sessionKey);
  state.lastPlayerComplaintType = complaintType || null;
  return state;
}

export function getRecentTopics(state = {}, n = 3) {
  const turns = Array.isArray(state.recentTurns) ? state.recentTurns : [];
  return turns
    .slice(-n)
    .map((turn) => turn.topic)
    .filter(Boolean);
}

export function getLastStrategies(state = {}, n = 3) {
  const turns = Array.isArray(state.recentTurns) ? state.recentTurns : [];
  return turns
    .slice(-n)
    .map((turn) => turn.responseStrategy)
    .filter(Boolean);
}

export function getRecentVariantIds(state = {}, n = 4) {
  const turns = Array.isArray(state.recentTurns) ? state.recentTurns : [];
  return turns
    .slice(-n)
    .map((turn) => turn.variantId)
    .filter(Boolean);
}

export function hasRecentComplaint(state = {}, type = null) {
  if (!state.lastPlayerComplaintType) return false;
  if (!type) return true;
  return state.lastPlayerComplaintType === type;
}

export function getRepetitionScore(state = {}) {
  if (Number.isFinite(state.repetitionScore)) return state.repetitionScore;
  return computeRepetitionScore(state.recentTurns || []);
}

function computeRepetitionScore(turns = []) {
  if (!turns.length) return 0;
  const recent = turns.slice(-4);
  const strategies = recent.map((turn) => turn.responseStrategy).filter(Boolean);
  const variants = recent.map((turn) => turn.variantId).filter(Boolean);

  let score = 0;
  if (strategies.length >= 2 && strategies.every((value) => value === strategies[0])) {
    score += 0.35;
  }
  if (strategies.length >= 3 && strategies.every((value) => value === strategies[0])) {
    score += 0.25;
  }
  if (variants.length >= 2 && variants.every((value) => value === variants[0])) {
    score += 0.25;
  }
  if (variants.length >= 3 && variants.every((value) => value === variants[0])) {
    score += 0.15;
  }

  return Math.min(1, score);
}
