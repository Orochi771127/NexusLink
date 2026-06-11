import { isEmotionalHabitatTrace } from "./habitatTraceEngine.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const SHORT_AWAY_MS = 30 * 60 * 1000;

const OFFLINE_RETURN_TRACE_TYPES = new Set(["small_silence", "fallen_leaf", "campfire_dim"]);
const VULNERABLE_EMOTIONS = new Set(["sadness", "anxiety", "loneliness", "fatigue", "anger"]);

export function buildReturnBehavior(previousState = {}, now = Date.now()) {
  const habitatTraces = Array.isArray(previousState.habitatTraces) ? previousState.habitatTraces : [];
  const emotionalMemories = Array.isArray(previousState.emotionalMemories)
    ? previousState.emotionalMemories
    : [];
  const visibleTraces = habitatTraces
    .filter((trace) => isEmotionalHabitatTrace(trace) && isTraceCurrentlyVisible(trace, now))
    .sort(
      (left, right) =>
        (Number(right.lastUpdatedAt) || Number(right.createdAt) || 0) -
        (Number(left.lastUpdatedAt) || Number(left.createdAt) || 0)
    );

  if (visibleTraces.length === 0) {
    return null;
  }

  const awayMs = estimateAwayMs(previousState, visibleTraces, emotionalMemories, now);
  if (awayMs < SHORT_AWAY_MS) {
    return null;
  }

  if (awayMs < SIX_HOURS_MS) {
    return {
      type: "minimal_return",
      message: "你回來了，棲地仍留著一點安靜的光。",
      moodHint: previousState.mood || "calm",
      shouldPersist: false
    };
  }

  const vulnerableMemories = emotionalMemories.filter(
    (memory) =>
      memory?.isVisibleInHabitat !== false &&
      !["released", "archived"].includes(memory?.status) &&
      (memory?.status === "fresh" || memory?.status === "settled") &&
      VULNERABLE_EMOTIONS.has(memory?.emotion)
  );

  const dominantTrace = visibleTraces[0];
  const dominantEmotion = dominantTrace?.emotion || previousState.lastEmotionTag || null;
  const hasVulnerableSignal = vulnerableMemories.length > 0 || VULNERABLE_EMOTIONS.has(dominantEmotion);

  if (hasVulnerableSignal) {
    return {
      type: "gentle_return",
      message: buildGentleReturnMessage(dominantEmotion, previousState.energy),
      moodHint: "warm",
      shouldPersist: true
    };
  }

  const repairedCount = visibleTraces.filter((trace) => trace.status === "transformed").length;
  if (repairedCount > 0) {
    return {
      type: "repaired_return",
      message: "你離開的這段時間，棲地裡有些痕跡被柔光修過。我在這裡。",
      moodHint: "calm",
      shouldPersist: true
    };
  }

  return {
    type: "soft_return",
    message: "湖邊留著你上次留下的情緒痕跡。不用急著說話，先休息一下也可以。",
    moodHint: previousState.mood || "calm",
    shouldPersist: true
  };
}

export function getReturnMessage(returnBehavior) {
  if (!returnBehavior?.message) return null;
  return String(returnBehavior.message);
}

/**
 * 回歸問候（寫進對話）：短離開輕聲招呼，長離開依最近的情緒語氣。
 * 不責備、不情緒勒索；少於 30 分鐘不打招呼。
 */
export function buildReturnGreeting(elapsedMs, state = {}) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < SHORT_AWAY_MS) return null;

  if (elapsedMs < SIX_HOURS_MS) {
    return "你回來了。湖面的光還亮著，我有注意到你離開的方向。";
  }

  return buildGentleReturnMessage(state.lastEmotionTag, state.energy);
}

function estimateAwayMs(previousState, visibleTraces, emotionalMemories, now) {
  const lastSeenAt = Number(previousState.lastSeenAt) || now;
  const seenGap = Math.max(0, now - lastSeenAt);

  if (seenGap >= SIX_HOURS_MS) {
    return seenGap;
  }

  const offlineReturnTrace = (previousState.habitatTraces || []).find(
    (trace) => OFFLINE_RETURN_TRACE_TYPES.has(trace.type) && now - Number(trace.createdAt || 0) < 120000
  );
  if (offlineReturnTrace) {
    return SIX_HOURS_MS;
  }

  const latestActivity = Math.max(
    0,
    ...visibleTraces.map((trace) => Number(trace.lastUpdatedAt) || Number(trace.createdAt) || 0),
    ...emotionalMemories.map((memory) => Number(memory.lastUpdatedAt) || Number(memory.createdAt) || 0)
  );

  if (latestActivity > 0) {
    return Math.max(seenGap, now - latestActivity);
  }

  return seenGap;
}

function buildGentleReturnMessage(emotion, energy = 10) {
  if (energy <= 2) {
    return "你回來了。棲地還在，我也還在。先慢慢呼吸，不用急著整理一切。";
  }

  if (emotion === "sadness") {
    return "你回來了。湖邊仍留著柔軟的痕跡，我不會催你變好。";
  }
  if (emotion === "anxiety") {
    return "你回來了。這裡還是安靜的，我們可以先把步伐放輕。";
  }
  if (emotion === "loneliness") {
    return "你回來了。你不是一個人，棲地一直替你留著位置。";
  }
  if (emotion === "fatigue") {
    return "你回來了。先休息一下吧，不必急著把話說完。";
  }
  if (emotion === "anger") {
    return "你回來了。那些起伏可以慢慢放下，我不會責怪你。";
  }

  return "你回來了。棲地還留著你的痕跡，我會溫柔地陪著你。";
}

function isTraceCurrentlyVisible(trace, now) {
  if (!trace) return false;
  if (["released", "archived"].includes(trace.status)) return false;
  if (trace.expiresAt !== null && trace.expiresAt !== undefined && trace.expiresAt < now) return false;
  return true;
}