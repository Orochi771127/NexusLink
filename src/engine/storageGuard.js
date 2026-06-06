export const STORAGE_LIMITS = Object.freeze({
  memories: 50,
  habitatTraces: 50,
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
    chatHistory: 20
  };
}
