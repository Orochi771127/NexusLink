import { qs } from "../utils/dom.js";
import {
  COMPANIONS,
  ELEMENT_LABELS,
  RUNTIME_STATUS_LABELS,
  getCompanionById
} from "../data/companionRegistry.js";

export function createCompanionSelectController({ store, panelManager, saveCurrentState, onCompanionChanged }) {
  const listEl = qs("#companion-select-list");

  function render() {
    if (!listEl) return;
    const activeId = store.getState().activeCompanionId;
    listEl.innerHTML = "";

    COMPANIONS.forEach((companion) => {
      const isActive = companion.id === activeId;
      const card = document.createElement("button");
      card.type = "button";
      card.className = `companion-card element-${companion.element}${isActive ? " is-active" : ""}`;
      card.setAttribute("aria-pressed", String(isActive));

      const elementLabel = ELEMENT_LABELS[companion.element]?.zh || companion.element;
      const statusLabel = RUNTIME_STATUS_LABELS[companion.runtimeStatus] || companion.runtimeStatus;

      card.innerHTML = `
        <span class="companion-card-badge" aria-hidden="true">${elementLabel}</span>
        <span class="companion-card-main">
          <strong class="companion-card-name">${companion.displayName.zh}</strong>
          <em class="companion-card-name-en">${companion.displayName.en}</em>
          <span class="companion-card-meta">${companion.emotionalEmblem.zh} ・ ${companion.battleRole.zh}</span>
        </span>
        <span class="companion-card-side">
          <span class="companion-card-status">${statusLabel}</span>
          ${isActive ? '<span class="companion-card-active">同行中</span>' : ""}
        </span>
      `;

      card.addEventListener("click", () => selectCompanion(companion.id));
      listEl.appendChild(card);
    });
  }

  function selectCompanion(companionId) {
    const state = store.getState();
    if (state.activeCompanionId === companionId) {
      panelManager.closePanel();
      return;
    }
    store.setState({ activeCompanionId: companionId });
    saveCurrentState?.();
    const companion = getCompanionById(companionId);
    Promise.resolve(onCompanionChanged?.(companion)).catch((error) => {
      console.warn("Companion swap failed:", error);
    });
    panelManager.closePanel();
  }

  function open() {
    render();
    panelManager.openPanel("companionSelect");
  }

  return { open, render };
}
