export function createRuntimeGuard(app) {
  let skipNextFrame = false;

  function onVisibilityChange() {
    if (document.visibilityState === "hidden") {
      app.ticker.stop();
      return;
    }

    skipNextFrame = true;
    app.ticker.start();
  }

  document.addEventListener("visibilitychange", onVisibilityChange);

  function shouldSkipFrame() {
    if (!skipNextFrame) return false;
    skipNextFrame = false;
    return true;
  }

  function getSafeDeltaMS(ticker) {
    return Math.max(0, Math.min(100, ticker.deltaMS));
  }

  function getSafeTicker(ticker) {
    const deltaMS = getSafeDeltaMS(ticker);
    return {
      deltaMS,
      deltaTime: deltaMS / (1000 / 60)
    };
  }

  function dispose() {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  return {
    shouldSkipFrame,
    getSafeDeltaMS,
    getSafeTicker,
    dispose
  };
}