export const RECALL_MODES = Object.freeze({
  NONE: "none",
  SOFT_CONTEXT: "soft_context",
  EXPLICIT_REFERENCE: "explicit_reference"
});

export const LOW_RECALL_INTENTS = new Set([
  "rest_request",
  "silence_request",
  "quiet_presence",
  "low_intent",
  "short_ack",
  "empty_or_noise"
]);

const EXPLICIT_RECALL_RE =
  /你還記得|回想一下|還記得嗎|記得那次|記得當時|還記得上次|記得嗎|想起來了嗎/;
const AWAKENING_RECALL_RE =
  /第一次醒|初醒|心核亮起|心核初醒|月湖那次|醒來的時候|第一次.*醒|月湖.*亮/;
const SILENCE_INPUT_RE = /不想講|不要問|不用說|別說太多|先不要聊|不想說|不要說太多|先別問/;
const QUIET_PRESENCE_RE = /陪我安靜|安靜陪|安靜一下|安靜待|靜靜陪/;
const LOW_SIGNAL_RE = /^(嗯|哦|好|ok|嗨|)$|^[。.…]+$/i;

export function isAwakeningMemory(memory) {
  if (!memory) return false;
  const label = `${memory.theme || ""}${memory.label || ""}${memory.excerpt || ""}`;
  return (
    memory.type === "awakening_memory" ||
    memory.source === "first_awakening" ||
    memory.theme === "心核初醒" ||
    /初醒|第一次醒|心核.*醒/.test(label)
  );
}

export function isConflictApologyMemory(memory) {
  if (!memory) return false;
  const label = `${memory.theme || ""}${memory.label || ""}`;
  return (
    memory.source === "apology" ||
    memory.emotion === "boundary" ||
    /道歉|衝突|邊界|拒絕|傷害/.test(label)
  );
}

export function isProtectedFromImplicitRecall(memory) {
  return isAwakeningMemory(memory) || isConflictApologyMemory(memory);
}

export function isExplicitRecallRequest(inputText = "") {
  return EXPLICIT_RECALL_RE.test(String(inputText || "").trim());
}

export function isAwakeningRecallRequest(inputText = "") {
  const text = String(inputText || "").trim();
  return AWAKENING_RECALL_RE.test(text) || /你還記得.*(醒|初醒|心核)/.test(text);
}

export function isLowRecallIntent(intentKey = "", inputText = "") {
  if (LOW_RECALL_INTENTS.has(intentKey)) return true;
  const text = String(inputText || "").trim();
  if (!text) return true;
  if (LOW_SIGNAL_RE.test(text)) return true;
  if (SILENCE_INPUT_RE.test(text)) return true;
  if (QUIET_PRESENCE_RE.test(text)) return true;
  return false;
}

export function resolveRecallPolicy({
  inputText = "",
  intent = {},
  analysis = {},
  memoryResult = {},
  runtime = {}
} = {}) {
  const intentKey = intent.intent || "unknown";
  const explicitRequest = isExplicitRecallRequest(inputText);
  const awakeningRequest = isAwakeningRecallRequest(inputText);
  const lowIntent = isLowRecallIntent(intentKey, inputText);
  const awakeningGate = Boolean(runtime.awakeningGate || runtime.source === "raphael-awakening");
  const emotionKey = analysis?.emotionKey || null;

  const ranked = buildRankedCandidates(memoryResult, emotionKey);
  let recallMode = RECALL_MODES.NONE;
  let shouldRecall = false;
  let strongestMemory = null;
  let blockReason = lowIntent && !explicitRequest ? "low_intent" : "";

  if (awakeningGate) {
    const awakeningMemory = ranked.find((entry) => isAwakeningMemory(entry.memory))?.memory || null;
    if (awakeningMemory) {
      return finalizePolicy({
        shouldRecall: true,
        recallMode: RECALL_MODES.EXPLICIT_REFERENCE,
        strongestMemory: awakeningMemory,
        blockReason: "awakening_gate",
        explicitRequest,
        awakeningRequest,
        lowIntent
      });
    }
  }

  if (explicitRequest || awakeningRequest) {
    strongestMemory = pickExplicitTarget({
      ranked,
      awakeningRequest,
      emotionKey
    });
    if (strongestMemory) {
      shouldRecall = true;
      recallMode = RECALL_MODES.EXPLICIT_REFERENCE;
      blockReason = awakeningRequest ? "explicit_awakening_request" : "explicit_recall_request";
    }
    return finalizePolicy({
      shouldRecall,
      recallMode,
      strongestMemory,
      blockReason,
      explicitRequest,
      awakeningRequest,
      lowIntent
    });
  }

  if (lowIntent) {
    return finalizePolicy({
      shouldRecall: false,
      recallMode: RECALL_MODES.NONE,
      strongestMemory: null,
      blockReason: "low_intent_blocked",
      explicitRequest,
      awakeningRequest,
      lowIntent
    });
  }

  const emotionMatches = ranked.filter(
    (entry) =>
      emotionKey &&
      entry.memory.emotion === emotionKey &&
      !isProtectedFromImplicitRecall(entry.memory)
  );

  if (emotionMatches.length >= 2 || (emotionMatches[0] && emotionMatches[0].memory.status === "settled")) {
    strongestMemory = emotionMatches[0].memory;
    shouldRecall = true;
    recallMode = RECALL_MODES.EXPLICIT_REFERENCE;
    blockReason = "emotion_pattern_recall";
  } else if (emotionMatches.length === 1 && memoryResult.hasRecentSimilarEmotion) {
    strongestMemory = emotionMatches[0].memory;
    shouldRecall = false;
    recallMode = RECALL_MODES.SOFT_CONTEXT;
    blockReason = "soft_context_only";
  } else {
    const safeCandidate = ranked.find((entry) => !isProtectedFromImplicitRecall(entry.memory));
    if (safeCandidate && memoryResult.hasRecallableMemory && !isProtectedFromImplicitRecall(safeCandidate.memory)) {
      strongestMemory = safeCandidate.memory;
      shouldRecall = false;
      recallMode = RECALL_MODES.SOFT_CONTEXT;
      blockReason = "no_explicit_target";
    }
  }

  return finalizePolicy({
    shouldRecall,
    recallMode,
    strongestMemory,
    blockReason,
    explicitRequest,
    awakeningRequest,
    lowIntent
  });
}

function buildRankedCandidates(memoryResult = {}, emotionKey = null) {
  const relevant = Array.isArray(memoryResult.relevantMemories) ? memoryResult.relevantMemories : [];
  const strongest = memoryResult.strongestMemory;
  const merged = strongest && !relevant.some((m) => m.id === strongest.id) ? [strongest, ...relevant] : relevant;

  return merged
    .filter(Boolean)
    .map((memory, index) => ({
      memory,
      score: index === 0 && memory.id === strongest?.id ? 1 : 0.5
    }))
    .sort((left, right) => {
      if (emotionKey) {
        const leftEmotion = left.memory.emotion === emotionKey ? 1 : 0;
        const rightEmotion = right.memory.emotion === emotionKey ? 1 : 0;
        if (rightEmotion !== leftEmotion) return rightEmotion - leftEmotion;
      }
      return right.score - left.score;
    });
}

function pickExplicitTarget({ ranked = [], awakeningRequest = false, emotionKey = null } = {}) {
  if (awakeningRequest) {
    return ranked.find((entry) => isAwakeningMemory(entry.memory))?.memory || null;
  }

  const emotionHit = ranked.find(
    (entry) => emotionKey && entry.memory.emotion === emotionKey && !isAwakeningMemory(entry.memory)
  );
  if (emotionHit) return emotionHit.memory;

  return ranked.find((entry) => !isProtectedFromImplicitRecall(entry.memory))?.memory || null;
}

function finalizePolicy({
  shouldRecall,
  recallMode,
  strongestMemory,
  blockReason,
  explicitRequest,
  awakeningRequest,
  lowIntent
}) {
  return {
    shouldRecall,
    recallMode,
    strongestMemory,
    blockReason,
    explicitRequest,
    awakeningRequest,
    lowIntent,
    allowsExplicitReference: recallMode === RECALL_MODES.EXPLICIT_REFERENCE,
    allowsTemplateRecall: recallMode === RECALL_MODES.EXPLICIT_REFERENCE && Boolean(strongestMemory)
  };
}

export function containsExplicitRecallLanguage(text = "") {
  return /我還記得|記得上次|不是第一次|上次那段|上次我們|回想|初醒|心核初醒|第一次醒|月湖/.test(
    String(text || "")
  );
}