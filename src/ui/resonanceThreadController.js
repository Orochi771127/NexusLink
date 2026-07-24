/**
 * 共鳴線索 UI（Pack 1）：最多一條、可關閉、無紅點／倒數／貨幣。
 * Session-only dismiss；元素動態建立（不動 index.html）。
 */

import { deriveResonanceThread } from "../engine/resonanceThreadEngine.js";
import { t, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";
import EventBus from "../utils/eventBus.js";

export function createResonanceThreadController({
  store,
  isPanelOpen,
  onVisibilityChange
} = {}) {
  let root = null;
  let session = { dismissedKinds: [], enoughMarked: false };
  let currentKind = null;

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("aside");
    root.className = "resonance-thread";
    root.hidden = true;
    root.setAttribute("aria-live", "polite");
    root.innerHTML =
      '<p class="rt-kicker"></p>' +
      '<p class="rt-title"></p>' +
      '<p class="rt-body"></p>' +
      '<p class="rt-why"></p>' +
      '<p class="rt-consequence"></p>' +
      '<button type="button" class="rt-dismiss"></button>';
    root.querySelector(".rt-dismiss")?.addEventListener("click", () => {
      if (currentKind) {
        if (!session.dismissedKinds.includes(currentKind)) {
          session.dismissedKinds = [...session.dismissedKinds, currentKind];
        }
        if (currentKind === "session_enough") session.enoughMarked = true;
      }
      hide();
      onVisibilityChange?.(false);
    });
    document.body.appendChild(root);
    return root;
  }

  function canShow(state) {
    if (!state?.onboarding?.completed) return false;
    const body = document.body.classList;
    if (
      body.contains("onboarding-active") ||
      body.contains("first-loop-active") ||
      body.contains("first-loop-reveal-active") ||
      body.contains("page-open") ||
      body.contains("st-focus") ||
      body.contains("standoff-active") ||
      body.contains("panel-open")
    ) {
      return false;
    }
    if (typeof isPanelOpen === "function" && isPanelOpen()) return false;
    return true;
  }

  function isVisible() {
    return Boolean(root && !root.hidden && root.classList.contains("is-visible"));
  }

  function hide() {
    if (!root) return;
    root.hidden = true;
    root.classList.remove("is-visible");
    currentKind = null;
  }

  function render() {
    const state = store.getState();
    if (!canShow(state)) {
      const was = isVisible();
      hide();
      if (was) onVisibilityChange?.(false);
      return;
    }

    const thread = deriveResonanceThread(state, session);
    if (!thread) {
      const was = isVisible();
      hide();
      if (was) onVisibilityChange?.(false);
      return;
    }

    const node = ensureRoot();
    currentKind = thread.kind;
    node.querySelector(".rt-kicker").textContent = t("rt.kicker");
    node.querySelector(".rt-title").textContent = thread.title;
    node.querySelector(".rt-body").textContent = thread.body;
    node.querySelector(".rt-why").textContent = `${t("rt.whyLabel")} ${thread.why}`;
    node.querySelector(".rt-consequence").textContent =
      `${t("rt.consequenceLabel")} ${thread.consequence}`;
    node.querySelector(".rt-dismiss").textContent = t("rt.dismiss");
    node.hidden = false;
    node.classList.add("is-visible");
    onVisibilityChange?.(true);
  }

  function scheduleRender() {
    window.requestAnimationFrame(render);
  }

  function bind() {
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => render());
    document.addEventListener("click", scheduleRender, true);
    document.addEventListener("focusin", scheduleRender, true);
    document.addEventListener("focusout", scheduleRender, true);
    render();
  }

  function dispose() {
    document.removeEventListener("click", scheduleRender, true);
    document.removeEventListener("focusin", scheduleRender, true);
    document.removeEventListener("focusout", scheduleRender, true);
  }

  return {
    bind,
    render,
    dispose,
    isVisible,
    getSessionSnapshot: () => ({ ...session, dismissedKinds: [...session.dismissedKinds] })
  };
}
