import { qs } from "../utils/dom.js";
import {
  COMPANIONS,
  COMPANION_ASSET_READINESS_LABELS,
  ELEMENT_LABELS,
  RUNTIME_STATUS_LABELS,
  getCompanionById
} from "../data/companionRegistry.js";
import { getCompanionRuntimeEligibility, normalizeRuntimeCompanionId } from "../data/companionRuntimePolicy.js";

export function createCompanionSelectController({ store, panelManager, saveCurrentState, onCompanionChanged }) {
  const listEl = qs("#companion-select-list");

  function render() {
    if (!listEl) return;
    const state = store.getState();
    const activeId = state.activeCompanionId;
    listEl.innerHTML = "";

    COMPANIONS.forEach((companion) => {
      const eligibility = getCompanionRuntimeEligibility(companion, state);
      const isActive = companion.id === activeId;
      const card = document.createElement("button");
      card.type = "button";
      card.className = [
        `companion-card element-${companion.element}`,
        isActive ? "is-active" : "",
        eligibility.canSelect ? "" : "is-locked"
      ].filter(Boolean).join(" ");
      card.setAttribute("aria-pressed", String(isActive));
      card.disabled = !eligibility.canSelect;
      card.setAttribute("aria-disabled", String(!eligibility.canSelect));

      const elementLabel = ELEMENT_LABELS[companion.element]?.zh || companion.element;
      const statusLabel = getCardStatusLabel(companion, eligibility);

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

      if (eligibility.canSelect) {
        card.addEventListener("click", () => selectCompanion(companion.id));
      }
      listEl.appendChild(card);
    });
  }

  function selectCompanion(companionId) {
    const state = store.getState();
    const normalizedCompanionId = normalizeRuntimeCompanionId(companionId, state);
    if (normalizedCompanionId !== companionId) {
      render();
      return;
    }
    if (state.activeCompanionId === normalizedCompanionId) {
      panelManager.closePanel();
      return;
    }
    const nextState = store.setState({ activeCompanionId: normalizedCompanionId });
    saveCurrentState?.();
    const companion = getCompanionById(nextState.activeCompanionId);
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

function getCardStatusLabel(companion, eligibility) {
  if (eligibility.canSelect) {
    return RUNTIME_STATUS_LABELS[companion.runtimeStatus] || companion.runtimeStatus;
  }
  if (!eligibility.isAssetReady) {
    return COMPANION_ASSET_READINESS_LABELS[companion.assetReadiness] || "Asset pending";
  }
  if (!eligibility.isUnlocked) return "章節未解鎖";
  return "暫不可同行";
}
