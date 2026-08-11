export const STORAGE_LIMITS = Object.freeze({
  memories: 50,
  habitatTraces: 50,
  emotionalMemories: 60,
  companionAnchors: 20,
  chatHistory: 40,
  memoryTextMaxLength: 240,
  chatTextMaxLength: 300,
  emotionalExcerptMaxLength: 40,
  companionAnchorDetailMaxLength: 48,
  traceMaxAgeMs: 1000 * 60 * 60 * 24 * 14
});

const RAW_TRANSCRIPT_STATE_FIELDS = new Set([
  "chatHistory",
  "lastMessage",
  "reactionPreview"
]);

const CLOUD_EXCLUDED_COMPANION_CONTENT = new Set([
  "memories",
  "habitatTraces",
  "emotionalMemories",
  "companionAnchors"
]);

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
  const allowedStatuses = new Set(["fresh", "settled", "transformed", "archived", "released"]);
  const id = String(trace?.id || `trace_${now}`);
  const createdAt = Number.isFinite(trace?.createdAt) ? trace.createdAt : now;
  const lastUpdatedAt = Number.isFinite(trace?.lastUpdatedAt) ? trace.lastUpdatedAt : createdAt;
  const expiresAt = trace?.expiresAt === null || trace?.expiresAt === undefined ? null : Number(trace.expiresAt);
  const inferredMemoryId =
    typeof id === "string" && id.startsWith("htrace_") ? id.slice("htrace_".length) : null;
  const memoryId = trace?.memoryId
    ? String(trace.memoryId).slice(0, 80)
    : inferredMemoryId
      ? String(inferredMemoryId).slice(0, 80)
      : null;

  return {
    id,
    memoryId,
    type: String(trace?.type || "ambient").slice(0, 40),
    emotion: String(trace?.emotion || "unknown").slice(0, 32),
    intensity: Number.isFinite(trace?.intensity) ? Math.max(0, Math.min(1, trace.intensity)) : 0.4,
    status: allowedStatuses.has(trace?.status) ? trace.status : "fresh",
    createdAt,
    lastUpdatedAt,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    visualHint: String(trace?.visualHint || "").slice(0, 40),
    textHint: String(trace?.textHint || "").slice(0, 80)
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
    excerpt: sanitizeExcerpt(memory.excerpt, STORAGE_LIMITS.emotionalExcerptMaxLength),
    createdAt: Number.isFinite(memory.createdAt) ? memory.createdAt : now,
    lastUpdatedAt: Number.isFinite(memory.lastUpdatedAt) ? memory.lastUpdatedAt : now,
    isVisibleInHabitat: memory.isVisibleInHabitat !== false
  };
}

export function sanitizeCompanionAnchor(anchor, now = Date.now()) {
  if (!anchor || typeof anchor !== "object") return null;
  const kind = String(anchor.kind || "").slice(0, 32);
  const key = String(anchor.key || "").slice(0, 40);
  if (!kind || !key) return null;
  const detail = sanitizeExcerpt(anchor.detail, STORAGE_LIMITS.companionAnchorDetailMaxLength);
  if (!detail) return null;
  if (/自殺|輕生|傷害自己|想死|不想活|不准拒絕|你一定要陪我/.test(detail)) return null;

  return {
    id: String(anchor.id || `anch_${kind}_${key}`).slice(0, 64),
    kind,
    key,
    label: String(anchor.label || key).slice(0, 24),
    softLabel: String(anchor.softLabel || anchor.label || key).slice(0, 24),
    detail,
    confidence: Number.isFinite(anchor.confidence)
      ? Math.max(0, Math.min(1, anchor.confidence))
      : 0.7,
    createdAt: Number.isFinite(anchor.createdAt) ? anchor.createdAt : now,
    updatedAt: Number.isFinite(anchor.updatedAt) ? anchor.updatedAt : now
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

  const companionAnchors = applyRollingLimit(
    (state.companionAnchors || [])
      .map((anchor) => sanitizeCompanionAnchor(anchor, now))
      .filter(Boolean),
    limits.companionAnchors
  );

  const durableState = omitFields(state, RAW_TRANSCRIPT_STATE_FIELDS);
  const companionStates = sanitizeCompanionStatePreviews(durableState.companionStates);

  return {
    ...durableState,
    ...(companionStates ? { companionStates } : {}),
    memories,
    habitatTraces,
    emotionalMemories,
    companionAnchors
  };
}

/**
 * Existing Firebase save sync predates Raphael's account/memory consent
 * contract. Until the hosted MemoryPort exists, cloud sync receives gameplay
 * state only: no raw turn fields and no conversation-derived memory bundles.
 */
export function pruneStateForCloudSync(state, now = Date.now()) {
  const durable = pruneStateForStorage(state, now);
  return omitFields(durable, CLOUD_EXCLUDED_COMPANION_CONTENT);
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

function sanitizeExcerpt(value, maxLength) {
  const normalized = String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/&/g, "＆")
    .replace(/</g, "‹")
    .replace(/>/g, "›")
    .replace(/"/g, "＂")
    .replace(/'/g, "＇")
    .replace(/`/g, "｀");

  if (normalized.length <= maxLength) return normalized;

  const slice = normalized.slice(0, maxLength);
  const lastSpaceIndex = slice.lastIndexOf(" ");
  if (lastSpaceIndex >= Math.floor(maxLength * 0.65)) {
    return `${slice.slice(0, lastSpaceIndex)}...`;
  }

  return `${slice}...`;
}

function omitFields(source = {}, fields = new Set()) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !fields.has(key))
  );
}

function sanitizeCompanionStatePreviews(companionStates) {
  if (!companionStates || typeof companionStates !== "object" || Array.isArray(companionStates)) {
    return companionStates;
  }
  const byId = companionStates.byId;
  if (!byId || typeof byId !== "object" || Array.isArray(byId)) return companionStates;
  return {
    ...companionStates,
    byId: Object.fromEntries(
      Object.entries(byId).map(([companionId, record]) => [
        companionId,
        record && typeof record === "object" && !Array.isArray(record)
          ? {
              ...record,
              relationship: record.relationship && typeof record.relationship === "object"
                ? { ...record.relationship, reactionPreview: "" }
                : record.relationship
            }
          : record
      ])
    )
  };
}
