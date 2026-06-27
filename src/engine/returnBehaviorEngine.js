import { isEmotionalHabitatTrace } from "./habitatTraceEngine.js";
import { RETURN_PRESENCE } from "../data/soulTalkResponsePacks.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const SHORT_AWAY_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const OFFLINE_RETURN_TRACE_TYPES = new Set(["small_silence", "fallen_leaf", "campfire_dim"]);
const VULNERABLE_EMOTIONS = new Set(["sadness", "anxiety", "loneliness", "fatigue", "anger"]);

const RETURN_COPY = {
  minimal_return: "我看見湖面還有一點微光。你回來了，我會慢慢靠近。",
  repaired_return: "那段痕跡變淡了一些。不是消失，是被安穩地放回湖裡。",
  soft_return: "月湖還留著上次的光。你不用補償什麼，回來本身就夠了。"
};

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

  const seenGap = Math.max(0, now - (Number(previousState.lastSeenAt) || now));
  if (seenGap < SHORT_AWAY_MS && !hasRecentOfflineReturnTrace(previousState, now)) {
    return null;
  }

  const awayMs = estimateAwayMs(previousState, visibleTraces, emotionalMemories, now);
  if (awayMs < SHORT_AWAY_MS) {
    return null;
  }

  const dominantTrace = visibleTraces[0] || null;
  const dominantEmotion = dominantTrace?.emotion || previousState.lastEmotionTag || null;
  const baseReturn = {
    traceId: dominantTrace?.id || null,
    memoryId: dominantTrace?.memoryId || null,
    dominantEmotion,
    awayMs
  };

  if (awayMs < SIX_HOURS_MS) {
    return {
      ...baseReturn,
      type: "minimal_return",
      message: RETURN_COPY.minimal_return,
      moodHint: previousState.mood || "calm",
      shouldPersist: false
    };
  }

  const repairedCount = visibleTraces.filter((trace) => trace.status === "transformed").length;
  if (repairedCount > 0) {
    return {
      ...baseReturn,
      type: "repaired_return",
      message: RETURN_COPY.repaired_return,
      moodHint: "calm",
      shouldPersist: true
    };
  }

  const vulnerableMemories = emotionalMemories.filter(
    (memory) =>
      memory?.isVisibleInHabitat !== false &&
      !["released", "archived"].includes(memory?.status) &&
      (memory?.status === "fresh" || memory?.status === "settled") &&
      VULNERABLE_EMOTIONS.has(memory?.emotion)
  );

  const hasVulnerableSignal = vulnerableMemories.length > 0 || VULNERABLE_EMOTIONS.has(dominantEmotion);

  if (hasVulnerableSignal) {
    return {
      ...baseReturn,
      type: "gentle_return",
      message: buildGentleReturnMessage(dominantEmotion, previousState.energy),
      moodHint: "warm",
      shouldPersist: true
    };
  }

  return {
    ...baseReturn,
    type: "soft_return",
    message: RETURN_COPY.soft_return,
    moodHint: previousState.mood || "calm",
    shouldPersist: true
  };
}

export function getReturnMessage(returnBehavior) {
  if (!returnBehavior?.message) return null;
  return String(returnBehavior.message);
}

export function buildReturnGreeting(elapsedMs, state = {}) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < SHORT_AWAY_MS) return null;

  if (elapsedMs < SIX_HOURS_MS) {
    return "我看見你回來了。先不用急著說話。";
  }

  return buildGentleReturnMessage(state.lastEmotionTag, state.energy);
}

export function resolveReturnTier(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < SHORT_AWAY_MS) return null;
  if (elapsedMs < SIX_HOURS_MS) return "soft_return";
  if (elapsedMs < DAY_MS) return "overnight";
  return "long_absence";
}

export function pickReturnPresenceLine(elapsedMs, state = {}) {
  if (!resolveReturnTier(elapsedMs)) return null;
  const tag = state.lastEmotionTag;
  const category = tag === "fatigue" ? "fatigue" : tag === "loneliness" ? "loneliness" : "quiet";
  const pool = RETURN_PRESENCE[category] || RETURN_PRESENCE.quiet || [];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

export function resolveReturnAnimationIntent(elapsedMs, state = {}) {
  const tier = resolveReturnTier(elapsedMs);
  if (!tier) return null;
  const tag = state.lastEmotionTag;
  const energy = Number(state.energy) || 0;
  const bond = Number(state.bond) || 0;
  if (tier === "soft_return") {
    if (energy <= 2) return "return.distant";
    if (bond >= 60) return "return.happy";
    return "return.calm";
  }
  if (tier === "overnight") {
    return tag === "fatigue" || tag === "sadness" ? "return.sad" : "return.distant";
  }
  return "return.rest";
}

function estimateAwayMs(previousState, visibleTraces, emotionalMemories, now) {
  const lastSeenAt = Number(previousState.lastSeenAt) || now;
  const seenGap = Math.max(0, now - lastSeenAt);

  if (seenGap >= SIX_HOURS_MS) {
    return seenGap;
  }

  if (hasRecentOfflineReturnTrace(previousState, now)) {
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

function hasRecentOfflineReturnTrace(previousState, now) {
  return (previousState.habitatTraces || []).some(
    (trace) => OFFLINE_RETURN_TRACE_TYPES.has(trace.type) && now - Number(trace.createdAt || 0) < 120000
  );
}

function buildGentleReturnMessage(emotion, energy = 10) {
  if (energy <= 2) {
    return "你看起來還很累。先不用說太多，我會把聲音放輕。";
  }

  if (emotion === "sadness") {
    return "我記得那段沉下去的感覺。今天先從一點點光開始。";
  }
  if (emotion === "anxiety") {
    return "我記得那陣緊繃。現在不用急著整理，我們先把呼吸放慢。";
  }
  if (emotion === "loneliness") {
    return "那段孤單還在湖邊留下微光。你不是被要求回來，只是被記得。";
  }
  if (emotion === "fatigue") {
    return "我記得那份疲憊。你可以先在這裡休息，不用立刻回應。";
  }
  if (emotion === "anger") {
    return "我記得那股用力撐住的熱。今天我們先保留一點距離。";
  }

  return "湖邊還留著一點光。你回來了，我會慢慢認出今天的你。";
}

function isTraceCurrentlyVisible(trace, now) {
  if (!trace) return false;
  if (["released", "archived"].includes(trace.status)) return false;
  if (trace.expiresAt !== null && trace.expiresAt !== undefined && trace.expiresAt < now) return false;
  return true;
}
