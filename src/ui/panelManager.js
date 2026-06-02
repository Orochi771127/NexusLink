import { qs, qsa } from "../utils/dom.js";

export function createPanelManager({ onSoulTalkFocus } = {}) {
  const panelLayer = qs(".panel-layer");
  const panelTriggers = qsa("[data-panel-trigger]");
  const panelCloseButtons = qsa("[data-panel-close]");
  let activePanel = null;

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

  function closePanel() {
    activePanel = null;
    panelLayer.dataset.activePanel = "none";
    panelLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
  }

  function bind({ openCharacterDetail, openSoulTalk }) {
    panelTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (trigger.dataset.panelTrigger === "character") openCharacterDetail();
        if (trigger.dataset.panelTrigger === "soulTalk") openSoulTalk();
      });
    });

    panelCloseButtons.forEach((button) => {
      button.addEventListener("click", closePanel);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activePanel) closePanel();
    });
  }

  return {
    bind,
    openPanel,
    closePanel,
    isPanelOpen: () => Boolean(activePanel),
    getActivePanel: () => activePanel
  };
}
