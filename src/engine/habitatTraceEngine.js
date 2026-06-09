const TRACE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const DEFAULT_VISIBLE_LIMIT = 18;

const TRACE_PROFILES = Object.freeze({
  fresh: {
    visualHint: "faint_glow",
    intensityScale: 0.38,
    textHint: "湖面上浮著一點細小的光。"
  },
  settled: {
    visualHint: "soft_mist",
    intensityScale: 0.28,
    textHint: "那段情緒慢慢沉成薄霧，仍在棲地裡。"
  },
  transformed: {
    visualHint: "repaired_light",
    intensityScale: 0.22,
    textHint: "舊痕被柔光覆過，像被修補過的湖面。"
  }
});

const HIDDEN_STATUSES = new Set(["released", "archived"]);

export function createHabitatTraceFromMemory(memory, now = Date.now()) {
  if (!memory?.id || HIDDEN_STATUSES.has(memory.status) || memory.isVisibleInHabitat === false) {
    return null;
  }

  const status = memory.status || "fresh";
  const profile = TRACE_PROFILES[status] || TRACE_PROFILES.fresh;
  const createdAt = Number.isFinite(memory.createdAt) ? memory.createdAt : now;

  return {
    id: buildTraceId(memory.id),
    memoryId: memory.id,
    type: buildTraceType(status, memory.emotion),
    emotion: String(memory.emotion || "unknown"),
    intensity: clamp01((Number(memory.intensity) || 0.4) * profile.intensityScale),
    status,
    createdAt,
    lastUpdatedAt: now,
    expiresAt: createdAt + TRACE_TTL_MS,
    visualHint: profile.visualHint,
    textHint: profile.textHint
  };
}

export function upsertHabitatTrace(habitatTraces = [], trace) {
  if (!trace?.memoryId) return Array.isArray(habitatTraces) ? [...habitatTraces] : [];

  const nextTraces = Array.isArray(habitatTraces) ? [...habitatTraces] : [];
  const memoryId = trace.memoryId;
  const index = nextTraces.findIndex((item) => resolveMemoryId(item) === memoryId);

  if (index >= 0) {
    nextTraces[index] = {
      ...nextTraces[index],
      ...trace,
      id: nextTraces[index].id || trace.id,
      memoryId,
      createdAt: nextTraces[index].createdAt || trace.createdAt
    };
    return nextTraces;
  }

  nextTraces.push(trace);
  return nextTraces;
}

export function syncHabitatTracesFromMemories(habitatTraces = [], emotionalMemories = [], now = Date.now()) {
  const activeMemoryIds = new Set();
  let traces = Array.isArray(habitatTraces) ? [...habitatTraces] : [];
  let changed = false;

  for (const memory of emotionalMemories) {
    if (!memory?.id || HIDDEN_STATUSES.has(memory.status) || memory.isVisibleInHabitat === false) {
      continue;
    }

    activeMemoryIds.add(memory.id);
    const nextTrace = createHabitatTraceFromMemory(memory, now);
    if (!nextTrace) continue;

    const previousTrace = traces.find((item) => resolveMemoryId(item) === memory.id);
    const mergedTraces = upsertHabitatTrace(traces, nextTrace);
    const updatedTrace = mergedTraces.find((item) => resolveMemoryId(item) === memory.id);

    if (!tracesEqual(previousTrace, updatedTrace) || mergedTraces.length !== traces.length) {
      changed = true;
    }

    traces = mergedTraces;
  }

  const prunedTraces = traces.filter((trace) => {
    const memoryId = resolveMemoryId(trace);
    if (!memoryId) return isEmotionalHabitatTrace(trace);
    return activeMemoryIds.has(memoryId);
  });

  if (prunedTraces.length !== traces.length) {
    changed = true;
    traces = prunedTraces;
  }

  const limitedTraces = pruneHabitatTraces(traces);
  if (limitedTraces.length !== traces.length) {
    changed = true;
  }

  return {
    habitatTraces: limitedTraces,
    changed
  };
}

export function pruneHabitatTraces(habitatTraces = [], limit = DEFAULT_VISIBLE_LIMIT) {
  const now = Date.now();
  const visibleTraces = (Array.isArray(habitatTraces) ? habitatTraces : [])
    .filter((trace) => isTraceVisible(trace, now))
    .sort((left, right) => getTraceSortTime(right) - getTraceSortTime(left));

  return visibleTraces.slice(0, Math.max(0, limit));
}

export function isEmotionalHabitatTrace(trace) {
  return Boolean(trace?.memoryId) || String(trace?.type || "").startsWith("em_");
}

function buildTraceId(memoryId) {
  return `htrace_${memoryId}`;
}

function buildTraceType(status, emotion) {
  return `em_${status || "fresh"}_${emotion || "unknown"}`;
}

function resolveMemoryId(trace) {
  if (!trace) return null;
  if (trace.memoryId) return trace.memoryId;
  if (typeof trace.id === "string" && trace.id.startsWith("htrace_")) {
    return trace.id.slice("htrace_".length);
  }
  return null;
}

function isTraceVisible(trace, now) {
  if (!trace) return false;
  if (HIDDEN_STATUSES.has(trace.status)) return false;
  if (trace.expiresAt !== null && trace.expiresAt !== undefined && trace.expiresAt < now) return false;
  return true;
}

function getTraceSortTime(trace) {
  return Number(trace?.lastUpdatedAt) || Number(trace?.createdAt) || 0;
}

function tracesEqual(left, right) {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return (
    left.id === right.id &&
    left.memoryId === right.memoryId &&
    left.type === right.type &&
    left.status === right.status &&
    left.visualHint === right.visualHint &&
    left.textHint === right.textHint &&
    left.intensity === right.intensity &&
    left.lastUpdatedAt === right.lastUpdatedAt
  );
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}