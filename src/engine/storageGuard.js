export const STORAGE_LIMITS = Object.freeze({
  memories: 50,
  habitatTraces: 50,
  emotionalMemories: 60,
  chatHistory: 40,
  memoryTextMaxLength: 240,
  chatTextMaxLength: 300,
  traceMaxAgeMs: 1000 * 60 * 60 * 24 * 14
});

export function sanitizeMemory(memory, now = Date.now()) {
  return {
    id: String(memory?.id || `mem_${now}`),
    type: String(memory?.type || "generic"),
    title: String(memory?.title || "Memory").slice(0, 40),
    text: String(memory?.text || "").slice(0, STORAGE_LIMITS.memoryTextMaxLength),
    createdAt: Number.isFinite(memory?.createdAt) ? memory.createdAt : now,
    mood: memory?.mood || "calm",
    bond: Number.isFinite(memory?.bond) ? memory.bond : 0,
    trust: Number.isFinite(memory?.trust) ? memory.trust : 0
  };
}

export function sanitizeTrace(trace, now = Date.now()) {
  const createdAt = Number.isFinite(trace?.createdAt) ? trace.createdAt : now;
  const expiresAt = trace?.expiresAt === null || trace?.expiresAt === undefined ? null : Number(trace.expiresAt);
  return {
    id: String(trace?.id || `trace_${createdAt}`),
    type: String(trace?.type || "ambient"),
    intensity: Number.isFinite(trace?.intensity) ? Math.max(0, Math.min(1, trace.intensity)) : 0.4,
    createdAt,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : null
  };
}

export function sanitizeEmotionalMemory(memory, now = Date.now()) {
  if (!memory) return null;

  const allowedStatuses = new Set(["fresh", "settled", "transformed", "archived", "released"]);

  return {
    id: String(memory.id || `emem_${now}`),
    theme: String(memory.theme || "未命名情緒").slice(0, 20),
    label: String(memory.label || "情緒回聲").slice(0, 40),
    emotion: String(memory.emotion || "unknown").slice(0, 32),
    intensity: Number.isFinite(memory.intensity) ? Math.max(0, Math.min(1, memory.intensity)) : 0.4,
    symbol: String(memory.symbol || "faint_spark").slice(0, 40),
    place: String(memory.place || "shore_side").slice(0, 40),
    status: allowedStatuses.has(memory.status) ? memory.status : "fresh",
    source: String(memory.source || "soul_talk").slice(0, 40),
    excerpt: String(memory.excerpt || "").slice(0, 40),
    createdAt: Number.isFinite(memory.createdAt) ? memory.createdAt : now,
    lastUpdatedAt: Number.isFinite(memory.lastUpdatedAt) ? memory.lastUpdatedAt : now,
    isVisibleInHabitat: memory.isVisibleInHabitat !== false
  };
}

export function applyRollingLimit(list, limit) {
  if (!Array.isArray(list)) return [];
  return list.slice(-limit);
}

export function isTraceActive(trace, now = Date.now()) {
  if (!trace) return false;
  if (trace.expiresAt !== null && Number.isFinite(trace.expiresAt) && trace.expiresAt < now) return false;
  if (trace.createdAt && now - trace.createdAt > STORAGE_LIMITS.traceMaxAgeMs) return false;
  return true;
}

export function pruneStateForStorage(state, now = Date.now(), limits = STORAGE_LIMITS) {
  const memories = applyRollingLimit(
    (state.memories || []).map((memory) => sanitizeMemory(memory, now)),
    limits.memories
  );

  const habitatTraces = applyRollingLimit(
    (state.habitatTraces || [])
      .map((trace) => sanitizeTrace(trace, now))
      .filter((trace) => isTraceActive(trace, now)),
    limits.habitatTraces
  );

  const emotionalMemories = applyRollingLimit(
    (state.emotionalMemories || [])
      .map((memory) => sanitizeEmotionalMemory(memory, now))
      .filter(Boolean),
    limits.emotionalMemories
  );

  const chatHistory = applyRollingLimit(
    (state.chatHistory || []).map((entry) => ({
      role: entry?.role || "companion",
      text: String(entry?.text || "").slice(0, limits.chatTextMaxLength)
    })),
    limits.chatHistory
  );

  return {
    ...state,
    memories,
    habitatTraces,
    emotionalMemories,
    chatHistory
  };
}

export function estimateSaveSizeKB(state) {
  const payload = JSON.stringify(state || {});
  if (typeof Blob !== "undefined") {
    return new Blob([payload]).size / 1024;
  }
  return payload.length / 1024;
}

export function getEmergencyStorageLimits() {
  return {
    ...STORAGE_LIMITS,
    memories: 25,
    habitatTraces: 25,
    emotionalMemories: 30,
    chatHistory: 20
  };
}
