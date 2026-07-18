import { getCompanionById } from "../data/companionRegistry.js";
import { getLanguage, t } from "../i18n/i18n.js";
import { prefersReducedMotion } from "../utils/motionPreference.js";

const PRESENTATION_MS = 22_000;
const REDUCED_MOTION_MS = 6_000;

const RESONANCE_PROFILES = Object.freeze({
  "greyshade-cat": {
    hue: 204,
    response: "distance",
    responseKey: "fr.responseDistance"
  },
  "blazetail-kit": {
    hue: 24,
    response: "approach",
    responseKey: "fr.responseApproach"
  },
  "crystalfin-seahorse": {
    hue: 192,
    response: "hesitate",
    responseKey: "fr.responseHesitate"
  }
});

const DEFAULT_PROFILE = Object.freeze({
  hue: 200,
  response: "hesitate",
  responseKey: "fr.responseHesitate"
});

/**
 * Session-only Initial Bond presentation.
 *
 * The caller owns all state changes. This controller only presents the already
 * persisted choice, and it always resolves (including interruption/replacement)
 * so a visual flourish can never roll back a valid bond selection.
 */
export function createFirstResonanceController({ root } = {}) {
  let layer = null;
  let portrait = null;
  let portraitFallback = null;
  let companionName = null;
  let phaseLine = null;
  let skipButton = null;
  let kicker = null;
  let title = null;
  let activeSession = null;

  function ensureLayer() {
    if (layer || !root) return;

    root.dataset.firstResonanceSupported = "true";
    layer = document.createElement("section");
    layer.className = "first-resonance-layer";
    layer.hidden = true;
    layer.dataset.viewState = "idle";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-labelledby", "first-resonance-title");
    layer.setAttribute("aria-describedby", "first-resonance-phase");

    const veil = document.createElement("div");
    veil.className = "first-resonance-veil";
    veil.setAttribute("aria-hidden", "true");

    const stage = document.createElement("div");
    stage.className = "first-resonance-stage";

    kicker = document.createElement("p");
    kicker.className = "first-resonance-kicker";
    kicker.textContent = t("fr.kicker");

    title = document.createElement("h2");
    title.id = "first-resonance-title";
    title.textContent = t("fr.title");

    const visual = document.createElement("div");
    visual.className = "first-resonance-visual";
    visual.setAttribute("aria-hidden", "true");

    const pulse = document.createElement("div");
    pulse.className = "first-resonance-pulse";
    pulse.innerHTML =
      '<span class="first-resonance-ring first-resonance-ring--outer"></span>' +
      '<span class="first-resonance-ring first-resonance-ring--inner"></span>' +
      '<span class="first-resonance-core"></span>';

    const portraitFrame = document.createElement("div");
    portraitFrame.className = "first-resonance-portrait-frame";

    portrait = document.createElement("img");
    portrait.className = "first-resonance-portrait";
    portrait.alt = "";
    portrait.setAttribute("aria-hidden", "true");

    portraitFallback = document.createElement("span");
    portraitFallback.className = "first-resonance-portrait-fallback";
    portraitFallback.setAttribute("aria-hidden", "true");

    portrait.addEventListener("error", () => {
      portrait.hidden = true;
      portraitFallback.hidden = false;
    });

    portraitFrame.append(portrait, portraitFallback);
    visual.append(pulse, portraitFrame);

    companionName = document.createElement("strong");
    companionName.className = "first-resonance-name";

    phaseLine = document.createElement("p");
    phaseLine.id = "first-resonance-phase";
    phaseLine.className = "first-resonance-phase";

    skipButton = document.createElement("button");
    skipButton.type = "button";
    skipButton.className = "first-resonance-skip";
    skipButton.dataset.firstResonanceAction = "skip";
    skipButton.textContent = t("fr.skip");

    stage.append(kicker, title, visual, companionName, phaseLine, skipButton);
    layer.append(veil, stage);
    root.appendChild(layer);
  }

  function setPhase(phase, copyKey) {
    if (!layer || !phaseLine) return;
    layer.dataset.phase = phase;
    phaseLine.textContent = t(copyKey);
  }

  function finish(reason = "completed") {
    const session = activeSession;
    if (!session) return;
    activeSession = null;

    session.timers.forEach((timerId) => window.clearTimeout(timerId));
    skipButton?.removeEventListener("click", session.onSkip);
    document.removeEventListener("keydown", session.onKeyDown, true);
    document.removeEventListener("visibilitychange", session.onVisibilityChange);
    window.removeEventListener("pagehide", session.onPageHide);

    const shell = root?.querySelector(".onboarding-shell");
    if (shell) {
      if (session.shellWasInert) {
        shell.setAttribute("inert", "");
      } else {
        shell.removeAttribute("inert");
      }
      if (session.shellAriaHidden === null) {
        shell.removeAttribute("aria-hidden");
      } else {
        shell.setAttribute("aria-hidden", session.shellAriaHidden);
      }
    }

    if (layer) {
      layer.hidden = true;
      layer.dataset.viewState = reason === "completed" ? "completed" : "dismissed";
      delete layer.dataset.phase;
      delete layer.dataset.response;
    }
    document.body.classList.remove("first-resonance-active");

    if (reason !== "pagehide" && reason !== "replaced") {
      window.requestAnimationFrame(() => {
        if (activeSession) return;
        const previousFocusIsVisible =
          session.previousFocus?.isConnected &&
          session.previousFocus.getClientRects?.().length > 0;
        const focusTarget = previousFocusIsVisible
          ? session.previousFocus
          : root?.querySelector('.onboarding-step.is-active button:not([disabled])');
        focusTarget?.focus();
      });
    }
    session.resolve({ reason });
  }

  function play(companionId) {
    ensureLayer();
    if (!layer) return Promise.resolve({ reason: "unavailable" });

    finish("replaced");
    if (document.hidden) return Promise.resolve({ reason: "hidden" });

    const companion = getCompanionById(companionId);
    const profile = RESONANCE_PROFILES[companionId] || DEFAULT_PROFILE;
    const language = getLanguage();
    const localizedName = companion?.displayName?.[language]
      || (language === "en" ? companion?.displayName?.en : companion?.displayName?.zh);
    const name = localizedName || companion?.name || t("fr.fallbackName");
    const source = companion?.image || "";
    const reducedMotion = prefersReducedMotion();
    const totalDuration = reducedMotion ? REDUCED_MOTION_MS : PRESENTATION_MS;
    const previousFocus = document.activeElement;
    const shell = root.querySelector(".onboarding-shell");

    kicker.textContent = t("fr.kicker");
    title.textContent = t("fr.title");
    skipButton.textContent = t("fr.skip");
    companionName.textContent = name;
    portraitFallback.textContent = String(name).trim().slice(0, 1) || "✦";
    portraitFallback.hidden = Boolean(source);
    portrait.hidden = !source;
    if (source) portrait.src = source;

    layer.style.setProperty("--resonance-hue", String(profile.hue));
    layer.dataset.response = profile.response;
    layer.dataset.viewState = "busy";
    layer.classList.toggle("is-reduced-motion", reducedMotion);
    layer.hidden = false;
    document.body.classList.add("first-resonance-active");

    const shellWasInert = shell?.hasAttribute("inert") === true;
    const shellAriaHidden = shell?.getAttribute("aria-hidden") ?? null;
    shell?.setAttribute("inert", "");
    shell?.setAttribute("aria-hidden", "true");

    setPhase("listening", "fr.phaseListening");

    return new Promise((resolve) => {
      const onSkip = () => finish("skipped");
      const onKeyDown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish("skipped");
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          event.stopPropagation();
          skipButton?.focus();
        }
      };
      const onVisibilityChange = () => {
        if (document.hidden) finish("hidden");
      };
      const onPageHide = () => finish("pagehide");
      const timers = [];

      activeSession = {
        resolve,
        timers,
        onSkip,
        onKeyDown,
        onVisibilityChange,
        onPageHide,
        previousFocus,
        shellWasInert,
        shellAriaHidden
      };

      skipButton.addEventListener("click", onSkip);
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("pagehide", onPageHide);

      if (reducedMotion) {
        setPhase("settled", profile.responseKey);
        timers.push(window.setTimeout(
          () => setPhase("settled", "fr.phaseSettled"),
          3_000
        ));
      } else {
        timers.push(window.setTimeout(
          () => setPhase("responding", profile.responseKey),
          7_000
        ));
        timers.push(window.setTimeout(
          () => setPhase("settled", "fr.phaseSettled"),
          15_000
        ));
      }
      timers.push(window.setTimeout(() => finish("completed"), totalDuration));
      window.requestAnimationFrame(() => {
        if (activeSession && !layer.hidden) skipButton.focus();
      });
    });
  }

  ensureLayer();

  return {
    play,
    cancel: () => finish("cancelled"),
    isActive: () => Boolean(activeSession)
  };
}
