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
    lastPlayerComplaintType: null
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

  return state;
}

export function applyRecentDialogueContext(nlu = {}, state = {}) {
  const inputText = String(nlu.inputText || "");
  const isContinuation = /剛才|剛剛|刚才|刚刚|那件事|後來|后来|接著|接着|然後|然后/.test(inputText);
  const previousTopic = state.currentTopic;
  if (!isContinuation || !previousTopic || previousTopic === "unknown" || nlu.topic !== "unknown") {
    return nlu;
  }

  return {
    ...nlu,
    topic: previousTopic,
    semanticFrame: {
      ...nlu.semanticFrame,
      topic: previousTopic,
      conversationContext: {
        inheritedTopic: previousTopic,
        source: "recent_dialogue"
      }
    }
  };
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
