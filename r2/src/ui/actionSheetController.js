import { evaluateActionEffect } from "../engine/actionEffectEngine.js";
import EventBus from "../utils/eventBus.js";
import { qs, qsa } from "../utils/dom.js";

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";

export function createActionSheetController({ soulTalkController, saveCurrentState, statusText, panelManager, store, openMap }) {
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
    const actionMeta = getActionMeta(action, store.getState());
    if (!actionMeta) return;
    queuedAction = action;
    actionSheetTitle.textContent = actionMeta.title;
    actionSheetCopy.textContent = actionMeta.copy;
    renderActionRows(actionMeta.rows);
    panelManager.openPanel("actionSheet");
  }

  function renderActionRows(rows) {
    actionSheetActions.innerHTML = "";
    rows.forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = row.label;
      button.addEventListener("click", () => {
        commitNavAction(queuedAction, row);
        queuedAction = null;
        // open_map 會自行切換到地圖面板，不可再關閉。
        if (row?.kind !== "open_map") panelManager.closePanel();
      });
      actionSheetActions.appendChild(button);
    });
  }

  function commitNavAction(action, row) {
    const actionMeta = getActionMeta(action, store.getState());
    if (!actionMeta) return;

    if (row?.kind === "open_map") {
      if (typeof openMap === "function") {
        openMap();
      } else {
        soulTalkController.addChat("system", "探索地圖整備中。");
        soulTalkController.renderChat();
      }
      return;
    }

    const choice = row?.choice;
    const result = evaluateActionEffect(store.getState(), action, choice);
    store.setState(result.statePatch);
    if (result.environmentEvent) EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, result.environmentEvent);
    const message = row?.status || actionMeta.message;
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

function getActionMeta(action, state = {}) {
  const actions = {
    explore: {
      title: "探索",
      copy: "走出營地，或在棲地裡找個安靜的地方。",
      message: "探索完成。",
      rows: [
        { label: "開啟探索地圖", kind: "open_map", status: "探索地圖展開。" },
        { label: "湖畔微光", choice: "lake_glow", status: "湖畔留下了一圈柔和微光。" },
        { label: "星圖回廊", choice: "star_corridor", status: "星圖回廊回應了一道安靜脈動。" },
        { label: "靜默晶簇", choice: "silent_crystal", status: "晶簇亮起微光，空氣變得穩定。" }
      ]
    },
    care: {
      title: "照顧",
      copy: "提供支持，但不強迫靠近。",
      message: "照顧完成。",
      rows: [
        { label: "輕聲安撫", choice: "soft_comfort", status: "夥伴稍微放鬆了一點。" },
        { label: "能量補給", choice: "energy_supply", status: "溫暖能量回到心核。" },
        { label: "陪伴休息", choice: "rest_together", status: "棲地安靜下來，適合一起休息。" },
        { label: "清理雜訊", choice: "clear_static", status: "空氣中的雜訊被清掉了一些。" }
      ]
    },
    grow: {
      title: "成長",
      copy: "校準羈絆與信任的回路。",
      message: "成長調整完成。",
      rows: [
        { label: "信任校準", choice: "trust_tuning", status: "信任回路略微對齊。" },
        { label: "情緒穩定", choice: "emotional_balance", status: "心核回到更穩定的節奏。" },
        { label: "技能回路", choice: "skill_circuit", status: "技能回路仍保持休眠。" }
      ]
    },
    memory: {
      title: "記憶",
      copy: "保存今天留下的一小段痕跡。",
      message: "記憶已保存。",
      rows: [
        { label: "湖面片段", choice: "lake_fragment", status: "湖面片段被收入心核。" },
        { label: "今日回聲", choice: "today_echo", status: "今天的回聲被輕輕記下。" },
        { label: "夥伴筆記", choice: "companion_note", status: "夥伴筆記已保存。" }
      ]
    }
  };

  const meta = actions[action];
  if (!meta) return meta;

  const energy = Number(state.energy ?? 10);
  const defense = Number(state.defense ?? 0);
  const emotionalMemoryCount = Array.isArray(state.emotionalMemories) ? state.emotionalMemories.length : 0;

  // 防備偏高時：照顧／成長以「靜靜陪伴」優先，不強迫靠近。
  if (defense >= 60 && (action === "care" || action === "grow")) {
    meta.rows = [
      { label: "靜靜陪伴", choice: "gentle_presence", status: "你只是待在牠身邊，沒有伸手。牠的肩膀慢慢鬆了。" },
      ...meta.rows.filter((row) => row.choice !== "gentle_presence")
    ];
    meta.copy = "牠現在需要一點距離。先讓陪伴代替觸碰。";
  }

  // 能量偏低時：照顧以「陪伴休息」優先。
  if (energy <= 3 && action === "care") {
    const restRow = meta.rows.find((row) => row.choice === "rest_together");
    if (restRow) {
      meta.rows = [restRow, ...meta.rows.filter((row) => row !== restRow)];
      meta.copy = "夥伴的能量偏低。先一起休息，其他的可以等。";
    }
  }

  // 情緒記憶累積後：記憶面板出現「回聲整理」。
  if (emotionalMemoryCount >= 3 && action === "memory") {
    meta.rows = [
      { label: "回聲整理", choice: "memory_echo", status: "你們把最近的幾段回聲輕輕排好，棲地安靜了一點。" },
      ...meta.rows
    ];
  }

  return meta;
}
