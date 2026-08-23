const PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js";
const PIXI_CDN_INTEGRITY = "sha384-zdhGmV2SoYr+2tn3rLxuKWeeNdIcsEK3qFdEqFlmHOPdYCbq++efc+FP7DE8r4kC";
const RAISING_SAVE_SLOT_ID = "raising-home";
const root = document.getElementById("championship-r2-root");
const gate = document.getElementById("r2-gate");
const query = new URLSearchParams(window.location.search);
const enabled = query.get("championshipR2") === "1";
const injectFirstWriteFailure = enabled && query.get("r2SaveFailure") === "once";
const lifecycleAbort = new AbortController();

// This carrier is intentionally module-local. It survives a local session remount in this
// JavaScript realm, but a browser refresh creates a new module realm and loses every slot.
let realmSavePort = null;
let realmFailureController = null;
let failureInjectionArmed = false;
let createSession = null;
let createController = null;
let activeMount = null;
let remountPromise = null;
let pinnedPixiPromise = null;
let applicationDisposed = false;
let mountCount = 0;
let disposeCount = 0;
let remountCount = 0;
let disposeActiveSession = () => Promise.resolve();

if (!enabled) {
  document.documentElement.dataset.championshipR2 = "disabled";
} else {
  document.documentElement.dataset.championshipR2 = "enabled";
  gate.hidden = true;
  root.hidden = false;
  window.addEventListener("pagehide", () => {
    lifecycleAbort.abort();
    void disposeActiveSession();
    delete window.__NEXUS_CHAMPIONSHIP_R2__;
  }, { once: true });
  boot(lifecycleAbort.signal).catch((error) => {
    if (lifecycleAbort.signal.aborted) return;
    root.hidden = true;
    gate.hidden = false;
    gate.classList.add("r2-gate--error");
    gate.querySelector("h1").textContent = "Championship R2 could not start";
    gate.querySelectorAll("p").item(1).textContent = error instanceof Error ? error.message : String(error);
    console.error("[Championship R2] boot failed", error);
  });
}

function loadPinnedPixi(signal) {
  if (pinnedPixiPromise) return pinnedPixiPromise;
  const ownedScript = document.querySelector('script[data-championship-pixi="r2"]');
  if (window.PIXI) {
    return ownedScript && window.PIXI.Application
      ? Promise.resolve(window.PIXI)
      : Promise.reject(new Error("Unexpected pre-existing Pixi global"));
  }
  pinnedPixiPromise = new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Championship R2 boot was aborted", "AbortError"));
      return;
    }
    const script = document.createElement("script");
    script.src = PIXI_CDN_URL;
    script.integrity = PIXI_CDN_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.dataset.championshipPixi = "r2";
    const settle = (callback) => {
      signal.removeEventListener("abort", onAbort);
      callback();
    };
    const onAbort = () => {
      script.remove();
      pinnedPixiPromise = null;
      settle(() => reject(new DOMException("Championship R2 boot was aborted", "AbortError")));
    };
    script.addEventListener("load", () => settle(() => {
      if (window.PIXI?.Application) resolve(window.PIXI);
      else {
        reject(new Error("Pinned Pixi API unavailable"));
      }
    }), { once: true });
    script.addEventListener("error", () => settle(() => {
      reject(new Error("Pinned Pixi presentation unavailable"));
    }), { once: true });
    signal.addEventListener("abort", onAbort, { once: true });
    document.head.append(script);
  });
  return pinnedPixiPromise;
}

function destroyUnattachedPixiApp(app) {
  if (!app) return;
  try {
    app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
  } catch (error) {
    console.warn("[Championship R2] provisional Pixi cleanup failed", error);
  }
}

function runtimeFacade(session) {
  return Object.freeze({
    getSnapshot: session.getRaisingHomeSnapshot,
    dispatch: session.dispatchRaisingHome,
    subscribe: session.subscribeRaisingHome
  });
}

function persistenceFacade(session) {
  return Object.freeze({
    getStatus: session.getSaveStatus,
    subscribe: session.subscribeSaveStatus,
    save: session.saveRaisingHome,
    retry: session.retryRaisingHomeSave,
    exportRecovery: session.exportRaisingHomeRecovery
  });
}

async function disposeMount(record) {
  if (!record || record.disposed) return;
  record.disposed = true;
  record.controller.dispose();
  if (activeMount === record) activeMount = null;
  disposeCount += 1;
  await record.session.dispose();
}

async function mountSession(signal, { focusRemount = false } = {}) {
  if (signal.aborted || applicationDisposed) return null;
  mountCount += 1;
  const session = createSession({
    sessionId: `championship-r2-local-home:${mountCount}`,
    raisingSavePort: realmSavePort,
    raisingSaveSlotId: RAISING_SAVE_SLOT_ID
  });
  await session.open();
  if (signal.aborted || applicationDisposed) {
    await session.dispose();
    return null;
  }

  const runtime = runtimeFacade(session);
  let controller = null;
  const record = { session, runtime, controller: null, disposed: false };
  controller = createController({
    root,
    runtime,
    persistence: persistenceFacade(session),
    autoAdvanceMs: 0,
    onRemount: () => remountActiveSession(signal),
    onModeRequest(modeId) {
      if (modeId === "raising-home") controller.restoreCanvasPresentation();
      else controller.showModeNotice(`${modeId.replaceAll("-", " ")} is registered for R2, but its gameplay slice is not mounted in this batch.`);
    }
  });
  record.controller = controller;
  activeMount = record;
  if (focusRemount) controller.focusPersistenceControl("remount");

  let provisionalApp = null;
  let provisionalPresenter = null;
  try {
    const PIXI = await loadPinnedPixi(signal);
    if (signal.aborted || record.disposed || activeMount !== record) return record;
    const [{ createPixiApp }, { createRaisingHomePixiView }] = await Promise.all([
      import("../../src/pixi/pixiApp.js"),
      import("../../src/championship/presentation/r2/createRaisingHomePixiView.js")
    ]);
    if (signal.aborted || record.disposed || activeMount !== record) return record;
    provisionalApp = await createPixiApp(controller.getCanvasHost());
    if (signal.aborted || record.disposed || activeMount !== record) {
      destroyUnattachedPixiApp(provisionalApp);
      provisionalApp = null;
      return record;
    }
    provisionalPresenter = createRaisingHomePixiView({
      PIXI,
      app: provisionalApp,
      canvasHost: controller.getCanvasHost(),
      onTileIntent: controller.handleTileIntent,
      onFallback: controller.setCanvasFallback
    });
    if (signal.aborted || record.disposed || activeMount !== record) {
      provisionalPresenter.dispose();
      provisionalPresenter = null;
      provisionalApp = null;
      return record;
    }
    controller.attachPresenter(provisionalPresenter);
    provisionalPresenter = null;
    provisionalApp = null;
  } catch (error) {
    if (provisionalPresenter) provisionalPresenter.dispose();
    else destroyUnattachedPixiApp(provisionalApp);
    if (signal.aborted || record.disposed || activeMount !== record) return record;
    controller.setCanvasFallback("The 2D field is unavailable. Keyboard and semantic controls remain active.");
    console.warn("[Championship R2] safe DOM fallback", error);
  }
  return record;
}

async function remountActiveSession(signal) {
  if (signal.aborted || applicationDisposed) return null;
  if (remountPromise) return remountPromise;
  remountPromise = (async () => {
    remountCount += 1;
    const previous = activeMount;
    await disposeMount(previous);
    if (signal.aborted || applicationDisposed) return null;
    return mountSession(signal, { focusRemount: true });
  })();
  try {
    return await remountPromise;
  } finally {
    remountPromise = null;
  }
}

function publishInspectionApi() {
  window.__NEXUS_CHAMPIONSHIP_R2__ = Object.freeze({
    inspect() {
      const record = activeMount;
      if (!record || record.disposed) return structuredClone({ lifecycle: { mountCount, disposeCount, remountCount, active: false } });
      const state = record.runtime.getSnapshot();
      const sessionSnapshot = record.session.getSnapshot();
      return structuredClone({
        raisingHome: {
          revision: state.revision,
          tick: state.tick,
          paused: state.paused,
          caretakerPosition: state.caretakerPosition,
          selectedResidentId: state.selectedResidentId,
          residents: state.residents.map((resident) => ({
            residentId: resident.residentId,
            position: resident.position,
            lastResponse: resident.lastResponse
          })),
          feedback: state.feedback
        },
        mode: {
          revision: sessionSnapshot.mode.revision,
          lifecycle: sessionSnapshot.mode.lifecycle,
          currentModeId: sessionSnapshot.mode.currentModeId
        },
        raisingSave: record.session.getSaveStatus(),
        raisingSaveBoundary: record.session.inspectRaisingSaveBoundary({ slotId: RAISING_SAVE_SLOT_ID }),
        saveBoundary: sessionSnapshot.saveBoundary,
        lifecycle: { mountCount, disposeCount, remountCount, active: true }
      });
    },
    getPresentationDiagnostics() {
      return activeMount?.controller.getPresentationDiagnostics() ?? null;
    },
    dispose() {
      void disposeActiveSession();
    }
  });
}

async function boot(signal) {
  const [r2Module, controllerModule] = await Promise.all([
    import("../../src/championship/r2/index.js"),
    import("../../src/championship/presentation/r2/createRaisingHomeController.js")
  ]);
  if (signal.aborted) return;
  createSession = r2Module.createChampionshipR2Session;
  createController = controllerModule.createRaisingHomeController;
  realmFailureController = r2Module.createChampionshipSaveFailureControllerR2();
  if (injectFirstWriteFailure && !failureInjectionArmed) {
    realmFailureController.failNextWrite("CHAMPIONSHIP_R2_SAVE_INJECTED_FAILURE");
    failureInjectionArmed = true;
  }
  realmSavePort = r2Module.createChampionshipSavePortR2({ failureController: realmFailureController });

  disposeActiveSession = async () => {
    if (applicationDisposed) return;
    applicationDisposed = true;
    const record = activeMount;
    await disposeMount(record);
    delete window.__NEXUS_CHAMPIONSHIP_R2__;
  };

  await mountSession(signal);
  if (signal.aborted || applicationDisposed || !activeMount) return;
  publishInspectionApi();
}
