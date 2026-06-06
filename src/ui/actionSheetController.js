import { evaluateActionEffect } from "../engine/actionEffectEngine.js";
import EventBus from "../utils/eventBus.js";
import { qs, qsa } from "../utils/dom.js";

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";

export function createActionSheetController({ soulTalkController, saveCurrentState, statusText, panelManager, store }) {
  const bottomNavButtons = qsa(".bottom-nav button[data-action]");
  const actionSheetTitle = qs("#action-sheet-title");
  const actionSheetCopy = qs("#action-sheet-copy");
  const actionSheetActions = qs("#action-sheet-actions");
  let queuedAction = null;

  function bind() {
    bottomNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveNav(button.dataset.action);
        openActionSheet(button.dataset.action);
      });
    });
  }

  function openActionSheet(action) {
    const actionMeta = getActionMeta(action);
    if (!actionMeta) return;
    queuedAction = action;
    actionSheetTitle.textContent = actionMeta.title;
    actionSheetCopy.textContent = actionMeta.copy;
    renderActionRows(actionMeta.rows);
    panelManager.openPanel("actionSheet");
  }

  function renderActionRows(rows) {
    actionSheetActions.innerHTML = "";
    rows.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        commitNavAction(queuedAction, label);
        queuedAction = null;
        panelManager.closePanel();
      });
      actionSheetActions.appendChild(button);
    });
  }

  function commitNavAction(action, choice) {
    const actionMeta = getActionMeta(action);
    if (!actionMeta) return;
    const result = evaluateActionEffect(store.getState(), action, choice);
    store.setState(result.statePatch);
    if (result.environmentEvent) EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, result.environmentEvent);
    const message = result.message || (choice ? `${actionMeta.message}: ${choice}` : actionMeta.message);
    soulTalkController.addChat("system", message);
    statusText.textContent = message;
    saveCurrentState();
    soulTalkController.renderChat();
  }

  function setActiveNav(action) {
    bottomNavButtons.forEach((button) => {
      const isActive = button.dataset.action === action;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  return {
    bind,
    openActionSheet
  };
}

function getActionMeta(action) {
  const actions = {
    explore: {
      title: "Explore",
      copy: "Choose a quiet place in the first habitat.",
      message: "Explore",
      rows: ["Lake glow", "Star corridor", "Silent crystal"]
    },
    care: {
      title: "Care",
      copy: "Offer support without forcing closeness.",
      message: "Care",
      rows: ["Soft comfort", "Energy supply", "Rest together", "Clear static"]
    },
    grow: {
      title: "Grow",
      copy: "Tune the bond without opening combat systems.",
      message: "Grow",
      rows: ["Trust tuning", "Emotional balance", "Skill circuit"]
    },
    memory: {
      title: "Memory",
      copy: "Save a small trace from today.",
      message: "Memory",
      rows: ["Lake fragment", "Today echo", "Companion note"]
    }
  };
  return actions[action];
}
