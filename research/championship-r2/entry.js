const PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js";
const PIXI_CDN_INTEGRITY = "sha384-zdhGmV2SoYr+2tn3rLxuKWeeNdIcsEK3qFdEqFlmHOPdYCbq++efc+FP7DE8r4kC";
const root = document.getElementById("championship-r2-root");
const gate = document.getElementById("r2-gate");
const enabled = new URLSearchParams(window.location.search).get("championshipR2") === "1";
const lifecycleAbort = new AbortController();
let disposeActiveSession = () => {};

if (!enabled) {
  document.documentElement.dataset.championshipR2 = "disabled";
} else {
  document.documentElement.dataset.championshipR2 = "enabled";
  gate.hidden = true;
  root.hidden = false;
  window.addEventListener("pagehide", () => {
    lifecycleAbort.abort();
    disposeActiveSession();
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
  if (window.PIXI) return Promise.reject(new Error("Unexpected pre-existing Pixi global"));
  return new Promise((resolve, reject) => {
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
      settle(() => reject(new DOMException("Championship R2 boot was aborted", "AbortError")));
    };
    script.addEventListener("load", () => settle(() => window.PIXI?.Application ? resolve(window.PIXI) : reject(new Error("Pinned Pixi API unavailable"))), { once: true });
    script.addEventListener("error", () => settle(() => reject(new Error("Pinned Pixi presentation unavailable"))), { once: true });
    signal.addEventListener("abort", onAbort, { once: true });
    document.head.append(script);
  });
}

function destroyUnattachedPixiApp(app) {
  if (!app) return;
  try {
    app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
  } catch (error) {
    console.warn("[Championship R2] provisional Pixi cleanup failed", error);
  }
}

async function boot(signal) {
  const [
    { createChampionshipR2Session },
    { createRaisingHomeController }
  ] = await Promise.all([
    import("../../src/championship/r2/index.js"),
    import("../../src/championship/presentation/r2/createRaisingHomeController.js")
  ]);
  if (signal.aborted) return;
  const session = createChampionshipR2Session({ sessionId: "championship-r2-local-home" });
  await session.open();
  if (signal.aborted) {
    void session.dispose();
    return;
  }
  const runtime = Object.freeze({
    getSnapshot: session.getRaisingHomeSnapshot,
    dispatch: session.dispatchRaisingHome,
    subscribe: session.subscribeRaisingHome
  });
  const controller = createRaisingHomeController({
    root,
    runtime,
    autoAdvanceMs: 0,
    onModeRequest(modeId) {
      if (modeId === "raising-home") controller.restoreCanvasPresentation();
      else controller.showModeNotice(`${modeId.replaceAll("-", " ")} is registered for R2, but its gameplay slice is not mounted in this batch.`);
    }
  });

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    controller.dispose();
    void session.dispose();
    delete window.__NEXUS_CHAMPIONSHIP_R2__;
  };
  disposeActiveSession = dispose;
  if (signal.aborted) {
    dispose();
    return;
  }

  let provisionalApp = null;
  let provisionalPresenter = null;
  try {
    const PIXI = await loadPinnedPixi(signal);
    if (signal.aborted) throw new DOMException("Championship R2 boot was aborted", "AbortError");
    const [{ createPixiApp }, { createRaisingHomePixiView }] = await Promise.all([
      import("../../src/pixi/pixiApp.js"),
      import("../../src/championship/presentation/r2/createRaisingHomePixiView.js")
    ]);
    if (signal.aborted) throw new DOMException("Championship R2 boot was aborted", "AbortError");
    provisionalApp = await createPixiApp(controller.getCanvasHost());
    if (signal.aborted) throw new DOMException("Championship R2 boot was aborted", "AbortError");
    provisionalPresenter = createRaisingHomePixiView({
      PIXI,
      app: provisionalApp,
      canvasHost: controller.getCanvasHost(),
      onTileIntent: controller.handleTileIntent,
      onFallback: controller.setCanvasFallback
    });
    if (signal.aborted) throw new DOMException("Championship R2 boot was aborted", "AbortError");
    controller.attachPresenter(provisionalPresenter);
    provisionalPresenter = null;
    provisionalApp = null;
  } catch (error) {
    if (provisionalPresenter) provisionalPresenter.dispose();
    else destroyUnattachedPixiApp(provisionalApp);
    provisionalPresenter = null;
    provisionalApp = null;
    if (signal.aborted) {
      dispose();
      return;
    }
    controller.setCanvasFallback("The 2D field is unavailable. Keyboard and semantic controls remain active.");
    console.warn("[Championship R2] safe DOM fallback", error);
  }

  if (signal.aborted) {
    dispose();
    return;
  }
  window.__NEXUS_CHAMPIONSHIP_R2__ = Object.freeze({
    inspect() {
      const state = runtime.getSnapshot();
      const mode = session.getSnapshot().mode;
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
          revision: mode.revision,
          lifecycle: mode.lifecycle,
          currentModeId: mode.currentModeId
        },
        saveBoundary: session.getSnapshot().saveBoundary
      });
    },
    getPresentationDiagnostics() {
      return controller.getPresentationDiagnostics();
    },
    dispose
  });
}
