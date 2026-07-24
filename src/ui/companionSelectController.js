import { qs } from "../utils/dom.js";
import {
  COMPANIONS,
  ELEMENT_LABELS,
  getCompanionById
} from "../data/companionRegistry.js";
import { getCompanionRuntimeEligibility, normalizeRuntimeCompanionId } from "../data/companionRuntimePolicy.js";
import EventBus from "../utils/eventBus.js";
import { t, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";

export function createCompanionSelectController({
  store,
  panelManager,
  saveCurrentState,
  onCompanionChanged,
  onOpened
} = {}) {
  const listEl = qs("#companion-select-list");

  function render() {
    if (!listEl) return;
    const state = store.getState();
    const activeId = state.activeCompanionId;
    const visibleCompanions = COMPANIONS
      .map((companion) => ({
        companion,
        eligibility: getCompanionRuntimeEligibility(companion, state)
      }))
      .filter(({ companion, eligibility }) => shouldShowCompanionInSelector(companion, state, eligibility));
    listEl.innerHTML = "";
    listEl.setAttribute("aria-label", "已締結的夥伴");

    visibleCompanions.forEach(({ companion, eligibility }) => {
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
          ${isActive ? `<span class="companion-card-active">${t("roster.active")}</span>` : ""}
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
    try {
      onOpened?.();
    } catch (error) {
      console.warn("[companionSelect] onOpened failed", error);
    }
  }

  // roster 狀態標籤、「同行中」皆以 t() baked 進卡片 innerHTML；語言切換後重畫一次。
  EventBus.on(LANGUAGE_CHANGED_EVENT, () => render());

  return { open, render };
}

function shouldShowCompanionInSelector(companion, state, eligibility) {
  return companion.id === state.activeCompanionId || eligibility.isUnlocked || eligibility.canSelect;
}

// 玩家語：把工程狀態（「動畫就緒」/「Asset pending」）映射成玩家看得懂的字眼。
// 只改 controller 顯示層，companion data 不動。
function getCardStatusLabel(companion, eligibility) {
  if (eligibility.canSelect) return t("status.available");
  if (!eligibility.isAssetReady) return t("status.preparing");
  if (!eligibility.isUnlocked) return t("status.locked");
  return t("status.unavailable");
}
