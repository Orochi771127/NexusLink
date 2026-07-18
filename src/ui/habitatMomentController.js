import {
  createHabitatMomentSession,
  resolveHabitatMomentChoice
} from "../engine/habitatMomentEngine.js";
import { prefersReducedMotion } from "../utils/motionPreference.js";
import EventBus from "../utils/eventBus.js";
import { LANGUAGE_CHANGED_EVENT, t } from "../i18n/i18n.js";

const OFFER_VISIBLE_MS = 8_500;
const RESULT_VISIBLE_MS = 2_400;
const STYLE_ID = "habitat-moment-v2-style";

const MOMENT_COPY_KEYS = Object.freeze({
  quiet_approach: Object.freeze({
    title: "hm.quiet.title",
    copy: "hm.quiet.copy"
  }),
  moon_gaze: Object.freeze({
    title: "hm.moon.title",
    copy: "hm.moon.copy"
  }),
  fireside_settle: Object.freeze({
    title: "hm.crystal.title",
    copy: "hm.crystal.copy"
  })
});

const CSS = `
.habitat-moment-offer {
  position: fixed;
  left: 50%;
  bottom: calc(34% + var(--bottom-safe, 0px));
  z-index: 42;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  max-width: min(82vw, 360px);
  min-height: 42px;
  padding: 8px 15px 8px 10px;
  border: 1px solid rgba(124, 231, 255, 0.34);
  border-radius: 999px;
  color: rgba(241, 247, 255, 0.94);
  background: rgba(7, 16, 34, 0.84);
  box-shadow: 0 10px 30px rgba(2, 7, 18, 0.36), 0 0 22px rgba(82, 210, 255, 0.12);
  backdrop-filter: blur(14px);
  font: inherit;
  font-size: 0.8rem;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  opacity: 0;
  transform: translate(-50%, 8px);
  transition: opacity 260ms ease, transform 260ms ease, border-color 160ms ease;
}
.habitat-moment-offer.is-visible {
  opacity: 1;
  transform: translate(-50%, 0);
}
.habitat-moment-offer:hover,
.habitat-moment-offer:focus-visible {
  border-color: rgba(247, 223, 170, 0.58);
  outline: none;
  box-shadow: 0 0 0 3px rgba(124, 231, 255, 0.13), 0 10px 30px rgba(2, 7, 18, 0.4);
}
.habitat-moment-offer__core,
.habitat-moment-core {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(124, 231, 255, 0.46);
  border-radius: 50%;
  color: #f7dfaa;
  background: radial-gradient(circle, rgba(247, 223, 170, 0.48) 0 12%, rgba(124, 231, 255, 0.18) 18% 42%, transparent 46%);
  box-shadow: 0 0 18px rgba(124, 231, 255, 0.34);
  animation: habitat-moment-core-pulse 2.8s ease-in-out infinite;
}
.habitat-moment-layer {
  position: fixed;
  inset: 0;
  z-index: 92;
  display: grid;
  place-items: end center;
  padding: calc(var(--top-safe, 0px) + 24px) 16px calc(var(--bottom-safe, 0px) + 96px);
  color: var(--v3-moon-100, #f7f2e7);
  background:
    radial-gradient(circle at 50% 48%, rgba(124, 231, 255, 0.13), transparent 34%),
    rgba(3, 8, 20, 0.48);
  backdrop-filter: blur(7px);
}
.habitat-moment-layer[hidden] { display: none; }
.habitat-moment-card {
  width: min(100%, 460px);
  max-height: min(70vh, 560px);
  overflow: auto;
  padding: clamp(20px, 5vw, 30px);
  border: 1px solid rgba(124, 231, 255, 0.3);
  border-radius: 26px;
  background:
    radial-gradient(circle at 50% 12%, rgba(124, 231, 255, 0.13), transparent 34%),
    linear-gradient(160deg, rgba(12, 27, 53, 0.94), rgba(6, 13, 29, 0.97));
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.52), 0 0 34px rgba(82, 210, 255, 0.12);
}
.habitat-moment-card__head {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}
.habitat-moment-core {
  width: 38px;
  height: 38px;
}
.habitat-moment-card__copy {
  min-width: 0;
}
.habitat-moment-card__copy > p,
.habitat-moment-card__copy > h2 {
  margin: 0;
}
.habitat-moment-card__copy > p:first-child {
  color: var(--v3-cyan-300, #7ce7ff);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.habitat-moment-card__copy > h2 {
  margin-top: 4px;
  font-family: var(--v3-font-serif, serif);
  font-size: clamp(1.25rem, 6vw, 1.75rem);
  letter-spacing: 0.07em;
}
.habitat-moment-card__description {
  margin: 15px 0 0;
  color: rgba(233, 239, 250, 0.78);
  line-height: 1.7;
}
.habitat-moment-close {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(185, 201, 230, 0.22);
  border-radius: 50%;
  color: rgba(233, 239, 250, 0.82);
  background: rgba(255, 255, 255, 0.04);
  font: inherit;
  cursor: pointer;
}
.habitat-moment-choices {
  display: grid;
  gap: 9px;
  margin-top: 20px;
}
.habitat-moment-choice {
  display: grid;
  gap: 3px;
  width: 100%;
  min-height: 54px;
  padding: 11px 14px;
  border: 1px solid rgba(247, 223, 170, 0.22);
  border-radius: 16px;
  color: var(--v3-moon-100, #f7f2e7);
  background: rgba(255, 255, 255, 0.045);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.habitat-moment-choice strong {
  font-size: 0.9rem;
  letter-spacing: 0.04em;
}
.habitat-moment-choice em {
  color: rgba(185, 201, 230, 0.75);
  font-size: 0.74rem;
  font-style: normal;
  line-height: 1.45;
}
.habitat-moment-choice:hover,
.habitat-moment-choice:focus-visible,
.habitat-moment-close:focus-visible {
  border-color: rgba(124, 231, 255, 0.52);
  outline: none;
  box-shadow: 0 0 0 3px rgba(124, 231, 255, 0.12);
}
.habitat-moment-result {
  min-height: 104px;
  margin: 20px 0 0;
  padding: 16px;
  border-left: 2px solid rgba(124, 231, 255, 0.5);
  border-radius: 0 16px 16px 0;
  color: rgba(241, 247, 255, 0.9);
  background: rgba(124, 231, 255, 0.06);
  line-height: 1.75;
}
.habitat-moment-result[hidden] { display: none; }
@keyframes habitat-moment-core-pulse {
  0%, 100% { opacity: 0.72; transform: scale(0.94); }
  50% { opacity: 1; transform: scale(1.05); }
}
@media (max-width: 420px) {
  .habitat-moment-layer { padding-inline: 10px; }
  .habitat-moment-card { border-radius: 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .habitat-moment-offer,
  .habitat-moment-core,
  .habitat-moment-offer__core { animation: none; transition: none; }
}
html[data-reduced-motion-preference="reduced"] .habitat-moment-offer,
html[data-reduced-motion-preference="reduced"] .habitat-moment-core,
html[data-reduced-motion-preference="reduced"] .habitat-moment-offer__core {
  animation: none;
  transition: none;
}
body.page-open .habitat-moment-offer,
body.panel-open .habitat-moment-offer,
body.standoff-active .habitat-moment-offer {
  pointer-events: none;
  opacity: 0;
}
`;

export function createHabitatMomentController({
  store,
  isPanelOpen,
  onOutcome
} = {}) {
  let offerButton = null;
  let layer = null;
  let card = null;
  let titleEl = null;
  let descriptionEl = null;
  let choicesEl = null;
  let resultEl = null;
  let closeButton = null;
  let activeSession = null;
  let offerTimerId = null;
  let resultTimerId = null;
  let bodyObserver = null;
  let lastFocusedElement = null;
  let offerOriginFocus = null;
  let isolatedBackground = [];
  let bound = false;

  function ensureUi() {
    if (offerButton && layer) return;
    ensureStyles();

    offerButton = document.createElement("button");
    offerButton.type = "button";
    offerButton.className = "habitat-moment-offer";
    offerButton.hidden = true;
    offerButton.innerHTML = `
      <span class="habitat-moment-offer__core" aria-hidden="true">·</span>
      <span data-habitat-moment-offer-copy></span>
    `;
    document.body.appendChild(offerButton);

    layer = document.createElement("section");
    layer.className = "habitat-moment-layer";
    layer.hidden = true;
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-labelledby", "habitat-moment-title");
    layer.setAttribute("aria-describedby", "habitat-moment-description");
    layer.innerHTML = `
      <article class="habitat-moment-card" data-habitat-moment-card>
        <header class="habitat-moment-card__head">
          <span class="habitat-moment-core" aria-hidden="true">·</span>
          <div class="habitat-moment-card__copy">
            <p data-habitat-moment-kicker></p>
            <h2 id="habitat-moment-title"></h2>
          </div>
          <button type="button" class="habitat-moment-close" data-habitat-moment-close aria-label="">×</button>
        </header>
        <p id="habitat-moment-description" class="habitat-moment-card__description"></p>
        <div class="habitat-moment-choices" data-habitat-moment-choices></div>
        <p class="habitat-moment-result" data-habitat-moment-result role="status" aria-live="polite" hidden></p>
      </article>
    `;
    document.body.appendChild(layer);

    card = layer.querySelector("[data-habitat-moment-card]");
    titleEl = layer.querySelector("#habitat-moment-title");
    descriptionEl = layer.querySelector("#habitat-moment-description");
    choicesEl = layer.querySelector("[data-habitat-moment-choices]");
    resultEl = layer.querySelector("[data-habitat-moment-result]");
    closeButton = layer.querySelector("[data-habitat-moment-close]");

    offerButton.addEventListener("click", open);
    closeButton?.addEventListener("click", () => cancel("close"));
    choicesEl?.addEventListener("click", handleChoice);
    layer.addEventListener("click", (event) => {
      if (event.target === layer) cancel("backdrop");
    });
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function bind() {
    if (bound || typeof document === "undefined") return;
    bound = true;
    ensureUi();
    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    EventBus.on(LANGUAGE_CHANGED_EVENT, render);

    bodyObserver = new MutationObserver(() => {
      if (!activeSession) return;
      const body = document.body.classList;
      if (
        body.contains("page-open")
        || body.contains("panel-open")
        || body.contains("standoff-active")
        || body.contains("first-loop-active")
        || body.contains("onboarding-active")
      ) {
        cancel("surface-change");
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  function offer(momentDef, now = Date.now()) {
    ensureUi();
    if (document.hidden || document.visibilityState === "hidden") return false;
    if (activeSession || !momentDef || typeof store?.getState !== "function") return false;
    if (typeof isPanelOpen === "function" && isPanelOpen()) return false;

    const session = createHabitatMomentSession(store.getState(), momentDef, now);
    if (!session?.sourceId) return false;

    activeSession = {
      ...session,
      stage: "offered",
      settled: false,
      momentDef
    };
    offerOriginFocus = document.activeElement;
    render();
    offerButton.hidden = false;
    window.requestAnimationFrame(() => offerButton?.classList.add("is-visible"));
    document.body.classList.add("habitat-moment-offered");
    scheduleOfferExpiry();
    return true;
  }

  function scheduleOfferExpiry(delay = OFFER_VISIBLE_MS) {
    window.clearTimeout(offerTimerId);
    offerTimerId = window.setTimeout(() => {
      if (document.activeElement === offerButton) {
        scheduleOfferExpiry(4_000);
        return;
      }
      cancel("timeout");
    }, delay);
  }

  function open() {
    if (!activeSession || activeSession.stage !== "offered") return false;
    if (typeof isPanelOpen === "function" && isPanelOpen()) {
      cancel("panel-open");
      return false;
    }

    window.clearTimeout(offerTimerId);
    lastFocusedElement = isVisibleFocusable(offerOriginFocus)
      ? offerOriginFocus
      : document.activeElement;
    activeSession.stage = "open";
    hideOffer();
    render();
    layer.hidden = false;
    isolateModalBackground();
    document.body.classList.add("habitat-moment-active");
    choicesEl?.querySelector("button")?.focus({ preventScroll: true });
    return true;
  }

  function render() {
    if (!offerButton || !layer || !activeSession) return;
    const copy = MOMENT_COPY_KEYS[activeSession.sourceId] || MOMENT_COPY_KEYS.quiet_approach;
    const offerCopy = offerButton.querySelector("[data-habitat-moment-offer-copy]");
    if (offerCopy) offerCopy.textContent = t("hm.offer");
    const kicker = layer.querySelector("[data-habitat-moment-kicker]");
    if (kicker) kicker.textContent = t("hm.kicker");
    if (titleEl) titleEl.textContent = t(copy.title);
    if (descriptionEl) descriptionEl.textContent = t(copy.copy);
    if (closeButton) closeButton.setAttribute("aria-label", t("hm.close"));

    if (activeSession.stage !== "resolved" && choicesEl) {
      choicesEl.hidden = false;
      choicesEl.innerHTML = [
        renderChoice("respond", "hm.choice.respond", "hm.choice.respondSub"),
        renderChoice("wait", "hm.choice.wait", "hm.choice.waitSub"),
        renderChoice("leave", "hm.choice.leave", "hm.choice.leaveSub")
      ].join("");
    }
  }

  function renderChoice(choiceId, labelKey, copyKey) {
    return `
      <button type="button" class="habitat-moment-choice" data-habitat-moment-choice="${choiceId}">
        <strong>${t(labelKey)}</strong>
        <em>${t(copyKey)}</em>
      </button>
    `;
  }

  function handleChoice(event) {
    const button = event.target.closest("[data-habitat-moment-choice]");
    if (!button) return;
    settle(button.dataset.habitatMomentChoice);
  }

  function settle(choiceId, now = Date.now()) {
    if (!activeSession || activeSession.stage !== "open" || activeSession.settled) return null;
    activeSession.settled = true;
    const engineResult = resolveHabitatMomentChoice(
      store.getState(),
      activeSession,
      choiceId,
      now
    );
    const result = engineResult?.message
      ? { ...engineResult, message: t(engineResult.message) }
      : engineResult;
    if (!result?.terminal) {
      activeSession.settled = false;
      return result || null;
    }

    activeSession.stage = "resolved";
    if (choicesEl) choicesEl.hidden = true;
    if (resultEl) {
      resultEl.hidden = false;
      resultEl.textContent = result.message || t("hm.resultFallback");
    }
    closeButton?.focus({ preventScroll: true });
    const isUnavailable = String(result.outcomeKind || "").includes("invalid")
      || String(result.outcomeKind || "").includes("expired")
      || String(result.outcomeKind || "").includes("safety_pause");
    layer.dataset.viewState = isUnavailable ? "unavailable" : "completed";
    try {
      onOutcome?.(result);
    } catch (error) {
      console.warn("Habitat moment presentation outcome was not applied", error);
    }

    const lingerMs = prefersReducedMotion() ? 1_200 : RESULT_VISIBLE_MS;
    window.clearTimeout(resultTimerId);
    resultTimerId = window.setTimeout(() => cancel("settled"), lingerMs);
    return result;
  }

  function handleKeydown(event) {
    if (!activeSession) return;
    if (event.key === "Escape") {
      event.preventDefault();
      cancel("escape");
      return;
    }
    if (
      event.key !== "Tab"
      || !["open", "resolved"].includes(activeSession.stage)
      || layer.hidden
    ) return;
    const focusable = [...layer.querySelectorAll("button:not([disabled])")]
      .filter((element) => isVisibleFocusable(element));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "hidden") cancel("visibility");
  }

  function handlePageHide() {
    cancel("pagehide");
  }

  function hideOffer() {
    if (!offerButton) return;
    offerButton.classList.remove("is-visible");
    offerButton.hidden = true;
    document.body.classList.remove("habitat-moment-offered");
  }

  function cancel(reason = "cancelled") {
    if (!activeSession) return false;
    const shouldRestoreFocus = activeSession.stage === "open" || activeSession.stage === "resolved";
    window.clearTimeout(offerTimerId);
    window.clearTimeout(resultTimerId);
    hideOffer();
    if (layer) {
      layer.hidden = true;
      layer.removeAttribute("data-view-state");
    }
    restoreModalBackground();
    if (choicesEl) choicesEl.hidden = false;
    if (resultEl) {
      resultEl.hidden = true;
      resultEl.textContent = "";
    }
    document.body.classList.remove("habitat-moment-active");
    activeSession = null;

    if (
      shouldRestoreFocus
      && reason !== "visibility"
      && reason !== "pagehide"
      && isVisibleFocusable(lastFocusedElement)
    ) {
      lastFocusedElement.focus({ preventScroll: true });
    }
    lastFocusedElement = null;
    offerOriginFocus = null;
    return true;
  }

  function dispose() {
    cancel("dispose");
    restoreModalBackground();
    document.removeEventListener("keydown", handleKeydown, true);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", handlePageHide);
    EventBus.off(LANGUAGE_CHANGED_EVENT, render);
    bodyObserver?.disconnect();
    bodyObserver = null;
    bound = false;
  }

  return {
    bind,
    offer,
    open,
    settle,
    cancel,
    dispose,
    isActive: () => Boolean(activeSession)
  };

  function isolateModalBackground() {
    restoreModalBackground();
    isolatedBackground = [...document.body.children]
      .filter((element) => element !== layer)
      .map((element) => ({
        element,
        hadInert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden")
      }));
    isolatedBackground.forEach(({ element }) => {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    });
  }

  function restoreModalBackground() {
    isolatedBackground.forEach(({ element, hadInert, ariaHidden }) => {
      if (!element?.isConnected) return;
      if (hadInert) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
    isolatedBackground = [];
  }

  function isVisibleFocusable(element) {
    return Boolean(
      element?.isConnected
      && element !== document.body
      && !element.closest?.("[hidden]")
      && element.getClientRects?.().length
    );
  }
}
