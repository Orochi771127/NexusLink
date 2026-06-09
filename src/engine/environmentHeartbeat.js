import { syncHabitatTracesFromMemories } from "./habitatTraceEngine.js";
import { updateMemoryLifecycles } from "./memoryLifecycleEngine.js";
import { buildReturnBehavior, getReturnMessage } from "./returnBehaviorEngine.js";

export const DEFAULT_HEARTBEAT_INTERVAL_MS = 60 * 1000;

export function startEnvironmentHeartbeat({
  store,
  saveCurrentState,
  onHeartbeat,
  intervalMs = DEFAULT_HEARTBEAT_INTERVAL_MS
} = {}) {
  if (!store?.getState || !store?.updateState || typeof window === "undefined") {
    return () => {};
  }

  function tick(reason = "interval") {
    const state = store.getState();
    const emotionalMemories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];

    if (emotionalMemories.length === 0) return false;

    const now = Date.now();

    if (reason === "startup") {
      applyReturnBehavior(state, now);
    }

    const { updatedMemories, stateChanged: memoriesChanged } = updateMemoryLifecycles(emotionalMemories, now);
    const traceSync = syncHabitatTracesFromMemories(state.habitatTraces || [], updatedMemories, now);
    const stateChanged = memoriesChanged || traceSync.changed;

    if (!stateChanged) return false;

    store.updateState((draft) => {
      draft.emotionalMemories = updatedMemories;
      draft.habitatTraces = traceSync.habitatTraces;
      draft.habitatRepairFactor = calculateHabitatRepairFactor(updatedMemories);
    });

    saveCurrentState?.();
    onHeartbeat?.({ reason, now, updatedMemories, habitatTraces: traceSync.habitatTraces });
    return true;
  }

  function applyReturnBehavior(state, now) {
    const returnBehavior = buildReturnBehavior(state, now);
    const message = getReturnMessage(returnBehavior);
    if (!message || !returnBehavior?.shouldPersist) return;

    store.updateState((draft) => {
      if (draft.reactionPreview) return;
      draft.reactionPreview = message;
    });
  }

  tick("startup");

  const normalizedInterval = Math.max(30 * 1000, Number(intervalMs) || DEFAULT_HEARTBEAT_INTERVAL_MS);
  const intervalId = window.setInterval(() => tick("interval"), normalizedInterval);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      tick("visibility");
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

function calculateHabitatRepairFactor(emotionalMemories = []) {
  if (!Array.isArray(emotionalMemories) || emotionalMemories.length === 0) return 0;

  const transformedCount = emotionalMemories.filter((memory) => memory.status === "transformed").length;
  const settledCount = emotionalMemories.filter((memory) => memory.status === "settled").length;
  const total = emotionalMemories.length;

  return Math.max(0, Math.min(1, (transformedCount * 0.08 + settledCount * 0.04) / Math.max(1, total)));
}
