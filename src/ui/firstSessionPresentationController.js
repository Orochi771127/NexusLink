import { prefersReducedMotion } from "../utils/motionPreference.js";

const FIRST_FRAME_SRC =
  "./assets/backgrounds/MoonlakeDiorama_r2/moonlake_onboarding_first_frame_r1.webp";
const SOURCE_MASTER_SRC =
  "./assets/backgrounds/MoonlakeDiorama_r2/moonlake_visual_master_r2.png";
const SCENE_REVEAL_TIMEOUT_MS = 8_000;
const STABLE_FRAME_TIMEOUT_MS = 2_000;
const REVEAL_TRANSITION_MS = 650;
const REDUCED_REVEAL_TRANSITION_MS = 120;

export function createFirstSessionPresentationController({
  shouldRunOnboarding = false
} = {}) {
  const loader = document.querySelector("#first-session-loading");
  const progress = loader?.querySelector("[role='progressbar']");
  const progressFill = loader?.querySelector(".first-session-loading__progress-fill");
  const progressCopy = loader?.querySelector(".first-session-loading__status");
  const onboardingRoot = document.querySelector("#onboarding-root");
  const sceneStatus = onboardingRoot?.querySelector(".onboarding-scene-status");

  let frameReady = false;
  let controllersReady = false;
  let loaderDismissed = false;
  let sceneResult = null;
  let framePromise = null;
  const sceneWaiters = new Set();

  document.documentElement.dataset.firstSessionSceneMode = "pending";

  function setProgress(value, message) {
    const normalized = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    if (progress) progress.setAttribute("aria-valuenow", String(normalized));
    if (progressFill) progressFill.style.setProperty("--loading-progress", `${normalized}%`);
    if (progressCopy && message) progressCopy.textContent = message;
  }

  function setSceneStatus(message, state = "pending") {
    if (!sceneStatus) return;
    sceneStatus.textContent = message;
    sceneStatus.dataset.state = state;
  }

  function decodeImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(source);
      image.onerror = reject;
      image.src = source;
      if (typeof image.decode === "function") {
        image.decode().then(() => resolve(source)).catch(() => {
          // Some browsers reject decode() while still completing load.
        });
      }
    });
  }

  function begin() {
    if (framePromise) return framePromise;
    setProgress(18, "正在整理月湖的第一道光");
    framePromise = decodeImage(FIRST_FRAME_SRC)
      .catch(() => decodeImage(SOURCE_MASTER_SRC))
      .catch(() => null)
      .then(() => {
        frameReady = true;
        setProgress(
          shouldRunOnboarding ? 58 : 38,
          "月湖首幀已準備完成"
        );
        maybeDismissLoader();
      });
    return framePromise;
  }

  function markControllersReady() {
    controllersReady = true;
    setProgress(
      shouldRunOnboarding ? 100 : 54,
      shouldRunOnboarding ? "入境介面已準備完成" : "正在喚醒棲地"
    );
    setSceneStatus("月湖棲地正在幕後甦醒", "pending");
    maybeDismissLoader();
  }

  function markPixiReady() {
    if (!shouldRunOnboarding) setProgress(72, "夥伴層已準備完成");
  }

  function maybeDismissLoader() {
    if (shouldRunOnboarding && frameReady && controllersReady) {
      dismissLoader();
      return;
    }
    if (!shouldRunOnboarding && sceneResult) dismissLoader();
  }

  function dismissLoader() {
    if (!loader || loaderDismissed) return;
    loaderDismissed = true;
    loader.dataset.state = "leaving";
    const duration = prefersReducedMotion() ? 0 : 420;
    window.setTimeout(() => {
      loader.hidden = true;
      loader.dataset.state = "complete";
      document.documentElement.dataset.firstSessionLoader = "complete";
    }, duration);
  }

  function resolveScene(mode, reason) {
    if (sceneResult) return sceneResult;
    const normalizedMode = mode === "live" ? "live" : "static";
    sceneResult = Object.freeze({
      mode: normalizedMode,
      reason: reason || (normalizedMode === "live" ? "stable_frames" : "fallback")
    });
    document.documentElement.dataset.firstSessionSceneMode = normalizedMode;
    setProgress(
      100,
      normalizedMode === "live" ? "月湖已甦醒" : "靜態月湖已準備完成"
    );
    setSceneStatus(
      normalizedMode === "live" ? "月湖已準備好" : "目前以靜態月湖陪你進入",
      normalizedMode === "live" ? "ready" : "fallback"
    );
    sceneWaiters.forEach((resolve) => resolve(sceneResult));
    sceneWaiters.clear();
    maybeDismissLoader();
    return sceneResult;
  }

  function waitForSceneResult(timeoutMs = SCENE_REVEAL_TIMEOUT_MS) {
    if (sceneResult) return Promise.resolve(sceneResult);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        sceneWaiters.delete(finish);
        resolve(result);
      };
      const timer = window.setTimeout(() => {
        finish(resolveScene("static", "reveal_timeout"));
      }, timeoutMs);
      sceneWaiters.add(finish);
    });
  }

  function waitForStableLiveFrames(live3d) {
    if (!live3d?.ready) return Promise.resolve(false);
    const startedAt = performance.now();
    return new Promise((resolve) => {
      const probe = () => {
        if (sceneResult?.mode === "static" || !live3d?.ready) {
          resolve(false);
          return;
        }
        const diagnostics = live3d.getDiagnostics?.() || {};
        const frameCount = Number(diagnostics.frameCount) || 0;
        const width = Number(diagnostics.size?.width) || 0;
        const height = Number(diagnostics.size?.height) || 0;
        if (frameCount >= 2 && width > 0 && height > 0) {
          resolve(true);
          return;
        }
        if (performance.now() - startedAt >= STABLE_FRAME_TIMEOUT_MS) {
          resolve(false);
          return;
        }
        window.requestAnimationFrame(probe);
      };
      window.requestAnimationFrame(probe);
    });
  }

  async function settleScene(sceneApi) {
    if (sceneResult) {
      sceneApi?.syncRendererVisibility?.();
      return sceneResult;
    }
    const stable = await waitForStableLiveFrames(sceneApi?.live3d);
    const result = stable
      ? resolveScene("live", "stable_frames")
      : resolveScene("static", sceneApi?.live3d?.ready ? "frame_timeout" : "live3d_unavailable");
    sceneApi?.syncRendererVisibility?.();
    return result;
  }

  async function prepareReveal() {
    const result = await waitForSceneResult();
    if (!onboardingRoot) return result;
    onboardingRoot.dataset.revealMode = result.mode;
    onboardingRoot.classList.add("is-revealing");
    const duration = prefersReducedMotion()
      ? REDUCED_REVEAL_TRANSITION_MS
      : REVEAL_TRANSITION_MS;
    await new Promise((resolve) => window.setTimeout(resolve, duration));
    return result;
  }

  return {
    begin,
    markControllersReady,
    markPixiReady,
    resolveScene,
    settleScene,
    prepareReveal,
    isStaticFallbackLocked: () => sceneResult?.mode === "static",
    getSceneResult: () => sceneResult
  };
}
