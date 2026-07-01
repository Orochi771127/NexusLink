import { qs, qsa } from "../utils/dom.js";

export function createPanelManager({ onSoulTalkFocus } = {}) {
  const panelLayer = qs(".panel-layer");
  const pageLayer = qs("#page-layer");
  const panelBackdrop = qs(".panel-backdrop", panelLayer);
  const panels = qsa("[data-panel]", panelLayer);
  const panelCloseButtons = qsa("[data-panel-close]");
  let activePanel = null;
  const closeGuards = new Map();

  function setInert(element, shouldInert) {
    if (!element) return;
    if ("inert" in element) {
      element.inert = shouldInert;
    } else if (shouldInert) {
      element.setAttribute("inert", "");
    } else {
      element.removeAttribute("inert");
    }
  }

  function syncPanelAccessibility() {
    const hasActivePanel = Boolean(activePanel);
    panelLayer.hidden = !hasActivePanel;
    panelLayer.setAttribute("aria-hidden", String(!hasActivePanel));
    setInert(panelLayer, !hasActivePanel);
    if (pageLayer) {
      pageLayer.setAttribute("aria-hidden", String(hasActivePanel));
      setInert(pageLayer, hasActivePanel);
    }

    if (panelBackdrop) {
      panelBackdrop.hidden = !hasActivePanel;
      panelBackdrop.tabIndex = hasActivePanel ? 0 : -1;
    }

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === activePanel;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
      setInert(panel, !isActive);
    });
  }

  function openPanel(panelName) {
    if (!panelName) return;
    activePanel = panelName;
    panelLayer.dataset.activePanel = panelName;
    syncPanelAccessibility();
    document.body.classList.add("panel-open");
    if (panelName === "soulTalk") {
      document.body.dataset.soulTalk = "open";
      requestAnimationFrame(() => onSoulTalkFocus?.());
    }
  }

  function closePanel({ force = false } = {}) {
    if (!force && activePanel && closeGuards.has(activePanel)) {
      const guard = closeGuards.get(activePanel);
      const vetoed = guard?.();
      if (vetoed) return;
    }
    const closedPanel = activePanel;
    activePanel = null;
    panelLayer.dataset.activePanel = "none";
    syncPanelAccessibility();
    document.body.classList.remove("panel-open");
    if (closedPanel === "soulTalk") {
      document.body.dataset.soulTalk = "collapsed";
    }
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

  syncPanelAccessibility();

  return {
    bind,
    openPanel,
    closePanel,
    registerCloseGuard,
    isPanelOpen: () => Boolean(activePanel),
    getActivePanel: () => activePanel
  };
}
