export const SAVE_LEVEL = Object.freeze({
  DEBOUNCE: 0,
  INTERACTION: 1,
  CRITICAL: 2
});

const SAVE_DELAYS_MS = Object.freeze({
  [SAVE_LEVEL.DEBOUNCE]: 400,
  [SAVE_LEVEL.INTERACTION]: 120
});

export function createSaveQueue(saveFn) {
  let pendingLevel = null;
  let timerId = null;

  function flush() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    if (pendingLevel === null) return undefined;

    pendingLevel = null;
    return saveFn();
  }

  function scheduleFlush() {
    if (pendingLevel === null || pendingLevel === SAVE_LEVEL.CRITICAL) return;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(flush, SAVE_DELAYS_MS[pendingLevel]);
  }

  function enqueue(level) {
    pendingLevel = Math.max(pendingLevel ?? SAVE_LEVEL.DEBOUNCE, level);

    if (level === SAVE_LEVEL.CRITICAL) {
      return flush();
    }

    scheduleFlush();
    return undefined;
  }

  function onVisibilityChange() {
    if (document.visibilityState === "hidden") {
      flush();
    }
  }

  function onBeforeUnload() {
    flush();
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", onBeforeUnload);

  function dispose() {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("beforeunload", onBeforeUnload);

    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    pendingLevel = null;
  }

  return {
    enqueue,
    flush,
    dispose
  };
}
