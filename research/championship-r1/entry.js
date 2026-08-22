const statusRoot = document.getElementById("championship-research-status");
const root = document.getElementById("championship-root");
const params = new URLSearchParams(window.location.search);
const enabled = params.get("championshipResearch") === "r1";
const PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js";
const PIXI_CDN_INTEGRITY = "sha384-zdhGmV2SoYr+2tn3rLxuKWeeNdIcsEK3qFdEqFlmHOPdYCbq++efc+FP7DE8r4kC";

if (!enabled) {
  document.documentElement.dataset.championshipResearch = "disabled";
  root.hidden = true;
} else {
  document.documentElement.dataset.championshipResearch = "r1";
  statusRoot.hidden = true;
  root.hidden = false;
  bootChampionshipResearch().catch((error) => {
    statusRoot.hidden = false;
    statusRoot.classList.add("championship-boot--error");
    statusRoot.querySelector("h1").textContent = "Championship Research could not start";
    statusRoot.querySelectorAll("p").item(1).textContent = error instanceof Error ? error.message : String(error);
    root.hidden = true;
    console.error("[Championship R1] boot failed", error);
  });
}

async function importCatalogFixture() {
  const module = await import("../../src/data/championship/fixtures/championship-r1-content.json", {
    with: { type: "json" }
  });
  return module.default;
}

function loadPinnedPixi() {
  if (window.PIXI) return Promise.reject(new Error("Unexpected pre-existing Pixi global; using safe DOM fallback"));
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PIXI_CDN_URL;
    script.integrity = PIXI_CDN_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.dataset.championshipPixi = "r1";
    script.addEventListener("load", () => {
      if (!window.PIXI?.Application) reject(new Error("Pinned Pixi artifact did not expose the expected API"));
      else resolve(window.PIXI);
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Pixi presentation unavailable")), { once: true });
    document.head.append(script);
  });
}

async function bootChampionshipResearch() {
  const [
    { loadState },
    { createNexusProfileReadAdapter },
    { createCanonicalCatalogAdapter },
    { createChampionshipResearchRuntime, createDeterministicClock },
    { createChampionshipController }
  ] = await Promise.all([
    import("../../src/state/saveManager.js"),
    import("../../src/championship/adapters/createNexusProfileReadAdapter.js"),
    import("../../src/championship/adapters/createCanonicalCatalogAdapter.js"),
    import("../../src/championship/index.js"),
    import("../../src/championship/presentation/createChampionshipController.js")
  ]);

  const catalogBundle = await importCatalogFixture();
  const catalogPort = createCanonicalCatalogAdapter(catalogBundle);
  const profilePort = createNexusProfileReadAdapter(loadState);
  const runtime = createChampionshipResearchRuntime({
    profilePort,
    catalogPort,
    clockPort: createDeterministicClock(0),
    seed: 0x43485231
  });
  const controller = createChampionshipController({ root, runtime, catalog: catalogPort.read() });

  try {
    await loadPinnedPixi();
    const [{ createPixiApp }, { createChampionshipPixiPresenter }] = await Promise.all([
      import("../../src/pixi/pixiApp.js"),
      import("../../src/championship/presentation/createChampionshipPixiPresenter.js")
    ]);
    const app = await createPixiApp(controller.getCanvasHost());
    const presenter = createChampionshipPixiPresenter({
      app,
      canvasHost: controller.getCanvasHost(),
      catalog: catalogPort.read(),
      onFallback: (message) => controller.setCanvasFallback(message)
    });
    controller.attachPixiPresenter(presenter);
  } catch (error) {
    controller.setCanvasFallback("Untrusted or unavailable 2D canvas rejected. Safe DOM game flow remains active.");
    console.warn("[Championship R1] Pixi fallback active", error);
  }

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    controller.dispose();
    runtime.dispose();
    window.removeEventListener("pagehide", dispose);
  };
  window.addEventListener("pagehide", dispose, { once: true });
  window.__NEXUS_CHAMPIONSHIP_R1__ = Object.freeze({ runtime, controller, dispose });
}
