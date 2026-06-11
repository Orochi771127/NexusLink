import { qs, qsa } from "../utils/dom.js";

export function createPanelManager({ onSoulTalkFocus } = {}) {
  const panelLayer = qs(".panel-layer");
  const panelCloseButtons = qsa("[data-panel-close]");
  let activePanel = null;
  const closeGuards = new Map();

  function openPanel(panelName) {
    if (!panelName) return;
    activePanel = panelName;
    panelLayer.dataset.activePanel = panelName;
    panelLayer.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-open");
    if (panelName === "soulTalk") {
      requestAnimationFrame(() => onSoulTalkFocus?.());
    }
  }

  function closePanel({ force = false } = {}) {
    if (!force && activePanel && closeGuards.has(activePanel)) {
      const guard = closeGuards.get(activePanel);
      const vetoed = guard?.();
      if (vetoed) return;
    }
    activePanel = null;
    panelLayer.dataset.activePanel = "none";
    panelLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
  }

  function registerCloseGuard(panelName, guardFn) {
    if (typeof guardFn === "function") {
      closeGuards.set(panelName, guardFn);
    }
    return () => closeGuards.delete(panelName);
  }

  function bind(handlers = {}) {
    qsa("[data-panel-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const handler = handlers[trigger.dataset.panelTrigger];
        if (typeof handler === "function") handler();
      });
    });

    panelCloseButtons.forEach((button) => {
      button.addEventListener("click", () => closePanel());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activePanel) closePanel();
    });
  }

  return {
    bind,
    openPanel,
    closePanel,
    registerCloseGuard,
    isPanelOpen: () => Boolean(activePanel),
    getActivePanel: () => activePanel
  };
}
