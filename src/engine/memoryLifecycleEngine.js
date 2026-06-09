const TIME_THRESHOLDS = Object.freeze({
  SETTLED: 12 * 60 * 60 * 1000,
  TRANSFORMED: 3 * 24 * 60 * 60 * 1000
});

const VISIBLE_MEMORY_LIMIT = 12;
const ACTIVE_STATUSES = new Set(["fresh", "settled", "transformed"]);

export function updateMemoryLifecycles(emotionalMemories = [], now = Date.now()) {
  let stateChanged = false;

  const updatedMemories = emotionalMemories.map((memory) => {
    if (!memory) return memory;

    const nextMemory = updateSingleMemoryLifecycle(memory, now);
    if (nextMemory !== memory) stateChanged = true;
    return nextMemory;
  });

  const limitedMemories = enforceVisibleMemoryLimit(updatedMemories, now);

  if (limitedMemories !== updatedMemories) {
    stateChanged = true;
  }

  return {
    updatedMemories: limitedMemories,
    stateChanged
  };
}

export function releaseMemory(emotionalMemories = [], memoryId, now = Date.now()) {
  return emotionalMemories.map((memory) => {
    if (memory?.id !== memoryId) return memory;

    return {
      ...memory,
      status: "released",
      isVisibleInHabitat: false,
      lastUpdatedAt: now
    };
  });
}

export function archiveMemory(emotionalMemories = [], memoryId, now = Date.now()) {
  return emotionalMemories.map((memory) => {
    if (memory?.id !== memoryId) return memory;

    return {
      ...memory,
      status: "archived",
      isVisibleInHabitat: false,
      lastUpdatedAt: now
    };
  });
}

function updateSingleMemoryLifecycle(memory, now) {
  const createdAt = Number(memory.createdAt) || now;
  const age = now - createdAt;

  let newStatus = memory.status || "fresh";

  if (memory.status === "fresh" && age >= TIME_THRESHOLDS.SETTLED) {
    newStatus = "settled";
  } else if (memory.status === "settled" && age >= TIME_THRESHOLDS.TRANSFORMED) {
    newStatus = "transformed";
  }

  const changed = newStatus !== memory.status;

  if (!changed) return memory;

  return {
    ...memory,
    status: newStatus,
    lastUpdatedAt: now
  };
}

function enforceVisibleMemoryLimit(memories, now) {
  const activeMemories = memories.filter((memory) => {
    return memory && ACTIVE_STATUSES.has(memory.status) && memory.isVisibleInHabitat !== false;
  });

  if (activeMemories.length <= VISIBLE_MEMORY_LIMIT) return memories;

  const overflowCount = activeMemories.length - VISIBLE_MEMORY_LIMIT;
  const oldestActiveIds = activeMemories
    .slice()
    .sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0))
    .slice(0, overflowCount)
    .map((memory) => memory.id);

  const overflowSet = new Set(oldestActiveIds);

  return memories.map((memory) => {
    if (!memory || !overflowSet.has(memory.id)) return memory;

    return {
      ...memory,
      status: "archived",
      isVisibleInHabitat: false,
      lastUpdatedAt: now
    };
  });
}
