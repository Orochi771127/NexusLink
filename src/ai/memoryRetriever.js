const ACTIVE_STATUSES = new Set(["fresh", "settled", "transformed"]);
const BOUNDARY_SOURCES = new Set(["boundary", "bond", "battle_repair"]);
const RECENT_WINDOW = 10;
const SIMILAR_EMOTION_WINDOW = 5;

export function retrieveRelevantMemories(state = {}, analysis = {}, runtime = {}) {
  const now = Number.isFinite(runtime.now) ? runtime.now : Date.now();
  const memories = (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [])
    .filter((memory) => memory && ACTIVE_STATUSES.has(memory.status));

  const emotionKey = analysis?.emotionKey || null;
  const ranked = memories
    .map((memory) => ({
      memory,
      score: scoreMemory(memory, emotionKey, now)
    }))
    .sort((left, right) => right.score - left.score);

  const relevantMemories = ranked
    .filter((entry) => entry.score >= 0.35)
    .slice(0, RECENT_WINDOW)
    .map((entry) => entry.memory);

  const strongestMemory = ranked[0]?.memory || null;
  const hasBoundaryMemory = memories.some(
    (memory) =>
      BOUNDARY_SOURCES.has(memory.source) ||
      memory.emotion === "boundary" ||
      /邊界|拒絕|退後/.test(String(memory.theme || memory.label || ""))
  );

  const recentSlice = memories
    .slice()
    .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
    .slice(0, SIMILAR_EMOTION_WINDOW);

  const hasRecentSimilarEmotion = Boolean(
    emotionKey &&
      recentSlice.filter((memory) => memory.emotion === emotionKey).length >= 2
  );

  return {
    relevantMemories,
    strongestMemory,
    hasBoundaryMemory,
    hasRecentSimilarEmotion
  };
}

function scoreMemory(memory, emotionKey, now) {
  let score = 0;
  const intensity = Number(memory.intensity) || 0;
  const ageMs = now - (Number(memory.createdAt) || now);
  const recencyBoost = Math.max(0, 1 - ageMs / (14 * 24 * 60 * 60 * 1000));

  score += intensity * 0.45;
  score += recencyBoost * 0.35;

  if (emotionKey && memory.emotion === emotionKey) score += 0.25;
  if (memory.status === "fresh") score += 0.1;
  if (memory.status === "transformed") score += 0.05;
  if (BOUNDARY_SOURCES.has(memory.source)) score += 0.15;

  return Math.min(1, score);
}