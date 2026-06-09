import {
  clearTextureCache,
  createMemorySymbolEntity
} from "./memorySymbolFactory.js";
import {
  getMemoriesByPlace,
  getVisibleActiveMemories,
  resolveMemoryPosition,
  snapPixel
} from "./memorySymbolLayout.js";

const EXIT_FADE_MS = 1200;
const MAX_ACTIVE_VISUAL_DELTA_MS = 100;

export function createMemorySymbolRenderer({ app, layer, store } = {}) {
  if (!app?.ticker || !app?.renderer) {
    throw new Error("createMemorySymbolRenderer requires a ready PixiJS app.");
  }
  if (!layer) {
    throw new Error("createMemorySymbolRenderer requires a memory symbol layer.");
  }

  const activeSymbols = new Map();
  const dyingSymbols = new Map();
  let latestMemories = [];
  let isPaused = false;
  let unsubscribe = null;

  function reconcile(memories = []) {
    latestMemories = getVisibleActiveMemories(memories);
    const nextIds = new Set(latestMemories.map((memory) => memory.id));

    for (const [id, entry] of activeSymbols.entries()) {
      if (!nextIds.has(id)) {
        moveToDying(id, entry, "removed_from_state");
      }
    }

    for (const memory of latestMemories) {
      const revived = reviveIfDying(memory);
      if (revived) {
        updateEntryFromMemory(revived, memory, latestMemories);
        continue;
      }

      const existing = activeSymbols.get(memory.id);
      if (existing) {
        updateEntryFromMemory(existing, memory, latestMemories);
        continue;
      }

      const entity = createMemorySymbolEntity(memory, { renderer: app.renderer });
      const entry = {
        id: memory.id,
        entity,
        latestMemory: memory,
        symbol: memory.symbol,
        place: memory.place
      };

      activeSymbols.set(memory.id, entry);
      layer.addChild(entity.node);
      updateEntryFromMemory(entry, memory, latestMemories);
      playEnter(entry);
    }
  }

  function update(deltaMS = 16.67) {
    if (isPaused) return;

    const now = getNowMs();
    const visualDeltaMS = Math.min(Number(deltaMS) || 16.67, MAX_ACTIVE_VISUAL_DELTA_MS);

    for (const entry of activeSymbols.values()) {
      entry.entity.updateVisual(visualDeltaMS, entry.latestMemory);
      snapDisplayObject(entry.entity.node);
    }

    sweepDyingSymbols(now, visualDeltaMS);
  }

  function subscribe() {
    if (!store?.subscribe || unsubscribe) return;
    unsubscribe = store.subscribe((state) => {
      reconcile(state.emotionalMemories || []);
    });
  }

  function initialReconcileFromStore() {
    if (!store?.getState) return;
    reconcile(store.getState().emotionalMemories || []);
  }

  function bindContextRecovery() {
    const canvas = app.canvas;
    if (!canvas?.addEventListener) return () => {};

    const handleContextLost = (event) => {
      event.preventDefault?.();
      isPaused = true;
    };

    const handleContextRestored = () => {
      isPaused = false;
      forceRebuild();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }

  function bindVisibilityRecovery() {
    if (typeof document === "undefined" || !document.addEventListener) return () => {};

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sweepDyingSymbols(getNowMs(), 0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }

  const unbindContextRecovery = bindContextRecovery();
  const unbindVisibilityRecovery = bindVisibilityRecovery();
  const tickerUpdate = (ticker) => update(ticker.deltaMS);
  app.ticker.add(tickerUpdate);

  function forceRebuild() {
    destroyAllEntries();
    clearTextureCache();
    reconcile(store?.getState?.().emotionalMemories || latestMemories);
  }

  function pause() {
    isPaused = true;
  }

  function resume() {
    isPaused = false;
    sweepDyingSymbols(getNowMs(), 0);
  }

  function destroy() {
    unsubscribe?.();
    unsubscribe = null;
    app.ticker.remove(tickerUpdate);
    unbindContextRecovery?.();
    unbindVisibilityRecovery?.();
    destroyAllEntries();
    clearTextureCache();
  }

  return {
    reconcile,
    update,
    subscribe,
    initialReconcileFromStore,
    forceRebuild,
    pause,
    resume,
    destroy,
    getDebugSnapshot() {
      return {
        activeCount: activeSymbols.size,
        dyingCount: dyingSymbols.size,
        latestMemoryCount: latestMemories.length
      };
    }
  };

  function updateEntryFromMemory(entry, memory, allVisibleMemories) {
    const samePlaceMemories = getMemoriesByPlace(allVisibleMemories, memory.place);
    const position = resolveMemoryPosition(memory, samePlaceMemories);

    entry.latestMemory = memory;
    entry.place = memory.place;
    entry.symbol = memory.symbol;
    entry.entity.setStatus(memory.status);
    entry.entity.node.x = position.x;
    entry.entity.node.y = position.y;
    snapDisplayObject(entry.entity.node);
  }

  function moveToDying(id, entry, reason) {
    if (!entry || dyingSymbols.has(id)) return;

    const now = getNowMs();
    activeSymbols.delete(id);
    entry.entity.node.__isDying = true;
    dyingSymbols.set(id, {
      id,
      entry,
      reason,
      startedAtMs: now,
      deadlineAtMs: now + EXIT_FADE_MS,
      durationMs: EXIT_FADE_MS,
      fromAlpha: entry.entity.node.alpha
    });
  }

  function reviveIfDying(memory) {
    const dying = dyingSymbols.get(memory.id);
    if (!dying) return null;

    dyingSymbols.delete(memory.id);
    dying.entry.entity.node.__isDying = false;
    dying.entry.entity.node.alpha = Math.max(dying.entry.entity.node.alpha, 0.2);
    dying.entry.entity.node.scale.set(1);
    activeSymbols.set(memory.id, dying.entry);
    return dying.entry;
  }

  function sweepDyingSymbols(now, visualDeltaMS) {
    for (const [id, dying] of Array.from(dyingSymbols.entries())) {
      const elapsedMs = Math.max(0, now - dying.startedAtMs);
      const progress = Math.min(1, elapsedMs / Math.max(1, dying.durationMs));
      const eased = easeOutCubic(progress);

      dying.entry.entity.updateVisual(visualDeltaMS, dying.entry.latestMemory);
      dying.entry.entity.node.alpha = Math.max(0, dying.fromAlpha * (1 - eased));
      dying.entry.entity.node.scale.set(1 - eased * 0.08);
      snapDisplayObject(dying.entry.entity.node);

      if (progress >= 1 || now >= dying.deadlineAtMs) {
        dying.entry.entity.destroy();
        dyingSymbols.delete(id);
      }
    }
  }

  function playEnter(entry) {
    entry.entity.node.alpha = 0;
    entry.entity.node.scale.set(0.86);
    entry.entity.node.__enterMs = 0;
  }

  function destroyAllEntries() {
    for (const entry of activeSymbols.values()) {
      entry.entity.destroy();
    }
    for (const dying of dyingSymbols.values()) {
      dying.entry.entity.destroy();
    }
    activeSymbols.clear();
    dyingSymbols.clear();
  }
}

function snapDisplayObject(displayObject) {
  displayObject.x = snapPixel(displayObject.x);
  displayObject.y = snapPixel(displayObject.y);
}

function getNowMs() {
  return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}
