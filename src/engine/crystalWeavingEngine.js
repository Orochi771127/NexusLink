import { releaseMemory } from "./memoryLifecycleEngine.js";

const HIDDEN_MEMORY_STATUSES = new Set(["archived", "released"]);
const PROTECTED_MEMORY_TOKENS = new Set([
  "bond",
  "first_awakening",
  "boundary",
  "standoff"
]);

export function getCrystalReleaseEligibility(state = {}, memory) {
  if (isProtectiveState(state)) {
    return Object.freeze({ allowed: false, reason: "protective_state" });
  }

  if (!memory?.id) {
    return Object.freeze({ allowed: false, reason: "memory_not_found" });
  }

  if (isProtectedMemory(memory)) {
    return Object.freeze({ allowed: false, reason: "protected_memory" });
  }

  if (memory.status === "released") {
    return Object.freeze({ allowed: false, reason: "already_released" });
  }

  if (memory.status !== "transformed") {
    return Object.freeze({ allowed: false, reason: "not_transformed" });
  }

  if (memory.isVisibleInHabitat === false) {
    return Object.freeze({ allowed: false, reason: "not_visible" });
  }

  return Object.freeze({ allowed: true, reason: null });
}

export function observeCrystalWeaving(state = {}, memoryId, now = Date.now()) {
  const memory = findMemory(state, memoryId);
  const companionId = normalizeCompanionId(state.activeCompanionId);
  void now;

  if (isProtectiveState(state)) {
    return createEnvelope({
      outcomeKind: "crystal_weaving_safety_pause",
      companionId,
      message: "memory.crystalResult.safetyPause"
    });
  }

  if (!isVisibleMemory(memory)) {
    return createEnvelope({
      outcomeKind: "crystal_observe_unavailable",
      companionId,
      message: "memory.crystalResult.observeUnavailable"
    });
  }

  return createEnvelope({
    outcomeKind: "crystal_observed",
    companionId,
    message: "memory.crystalObserveStatus",
    encounter: {
      kind: "environment",
      environmentEvent: {
        type: "crystal_touch",
        color: "#8deeff",
        x: 260,
        y: 500
      }
    }
  });
}

export function releaseCrystalMemory(state = {}, memoryId, now = Date.now()) {
  const emotionalMemories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  const habitatTraces = Array.isArray(state.habitatTraces) ? state.habitatTraces : [];
  const memory = emotionalMemories.find((item) => item?.id === memoryId);
  const companionId = normalizeCompanionId(state.activeCompanionId);
  const releasedAt = normalizeNow(now);
  const eligibility = getCrystalReleaseEligibility(state, memory);

  if (!eligibility.allowed) {
    const unchanged = eligibility.reason === "already_released";
    return createEnvelope({
      outcomeKind: unchanged ? "crystal_release_unchanged" : "crystal_release_blocked",
      companionId,
      message: getBlockedReleaseMessage(eligibility.reason)
    });
  }

  const nextMemories = releaseMemory(emotionalMemories, memory.id, releasedAt);
  const nextHabitatTraces = removeLinkedHabitatTraces(habitatTraces, memory.id);

  return createEnvelope({
    outcomeKind: "crystal_released",
    companionId,
    statePatch: {
      emotionalMemories: nextMemories,
      habitatTraces: nextHabitatTraces
    },
    message: "memory.crystalReleaseStatus"
  });
}

function createEnvelope({
  outcomeKind,
  companionId,
  statePatch = {},
  message,
  encounter = null,
  raphaelEvent = null
}) {
  return {
    outcomeKind,
    sourceId: "crystal_weaving",
    companionId: companionId || null,
    statePatch,
    message,
    memoryObject: null,
    traceIntent: null,
    encounter,
    raphaelEvent,
    terminal: true
  };
}

function findMemory(state, memoryId) {
  const emotionalMemories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  return emotionalMemories.find((memory) => memory?.id === memoryId) || null;
}

function removeLinkedHabitatTraces(habitatTraces, memoryId) {
  const traces = Array.isArray(habitatTraces) ? habitatTraces : [];
  const targetMemoryId = String(memoryId || "");
  const targetTraceId = `htrace_${targetMemoryId}`;
  return traces.filter((trace) => (
    String(trace?.memoryId || "") !== targetMemoryId
    && String(trace?.id || "") !== targetTraceId
  ));
}

function isVisibleMemory(memory) {
  return Boolean(
    memory?.id
    && !HIDDEN_MEMORY_STATUSES.has(memory.status)
    && memory.isVisibleInHabitat !== false
  );
}

function isProtectedMemory(memory) {
  return PROTECTED_MEMORY_TOKENS.has(normalizeMemoryToken(memory?.source))
    || PROTECTED_MEMORY_TOKENS.has(normalizeMemoryToken(memory?.emotion));
}

function normalizeMemoryToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeCompanionId(companionId) {
  const normalized = String(companionId || "").trim();
  return normalized || null;
}

function normalizeNow(now) {
  return Number.isFinite(now) ? now : Date.now();
}

function isProtectiveState(state = {}) {
  const mood = String(state.mood || "").trim().toLowerCase();
  return Boolean(
    state.safeHarborMode
    || mood === "defensive"
    || mood === "distant"
    || Number(state.defense) >= 70
  );
}

function getBlockedReleaseMessage(reason) {
  if (reason === "protective_state") {
    return "memory.crystalResult.safetyPause";
  }
  if (reason === "protected_memory") {
    return "memory.crystalResult.protected";
  }
  if (reason === "already_released") {
    return "memory.crystalResult.alreadyReleased";
  }
  if (reason === "not_visible") {
    return "memory.crystalResult.notVisible";
  }
  if (reason === "not_transformed") {
    return "memory.crystalResult.notTransformed";
  }
  return "memory.crystalResult.notFound";
}
