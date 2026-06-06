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
    rows.forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = row.label;
      button.addEventListener("click", () => {
        commitNavAction(queuedAction, row);
        queuedAction = null;
        panelManager.closePanel();
      });
      actionSheetActions.appendChild(button);
    });
  }

  function commitNavAction(action, row) {
    const actionMeta = getActionMeta(action);
    if (!actionMeta) return;
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

function getActionMeta(action) {
  const actions = {
    explore: {
      title: "探索",
      copy: "選擇第一棲地裡一個安靜的地方。",
      message: "探索完成。",
      rows: [
        { label: "湖畔微光", choice: "Lake glow", status: "湖畔留下了一圈柔和微光。" },
        { label: "星圖回廊", choice: "Star corridor", status: "星圖回廊回應了一道安靜脈動。" },
        { label: "靜默晶簇", choice: "Silent crystal", status: "晶簇亮起微光，空氣變得穩定。" }
      ]
    },
    care: {
      title: "照顧",
      copy: "提供支持，但不強迫靠近。",
      message: "照顧完成。",
      rows: [
        { label: "輕聲安撫", choice: "Soft comfort", status: "灰影貓稍微放鬆了一點。" },
        { label: "能量補給", choice: "Energy supply", status: "溫暖能量回到心核。" },
        { label: "陪伴休息", choice: "Rest together", status: "棲地安靜下來，適合一起休息。" },
        { label: "清理雜訊", choice: "Clear static", status: "空氣中的雜訊被清掉了一些。" }
      ]
    },
    grow: {
      title: "成長",
      copy: "校準羈絆，不開啟戰鬥系統。",
      message: "成長調整完成。",
      rows: [
        { label: "信任校準", choice: "Trust tuning", status: "信任回路略微對齊。" },
        { label: "情緒穩定", choice: "Emotional balance", status: "心核回到更穩定的節奏。" },
        { label: "技能回路", choice: "Skill circuit", status: "技能回路仍保持休眠。" }
      ]
    },
    memory: {
      title: "記憶",
      copy: "保存今天留下的一小段痕跡。",
      message: "記憶已保存。",
      rows: [
        { label: "湖面片段", choice: "Lake fragment", status: "湖面片段被收入心核。" },
        { label: "今日回聲", choice: "Today echo", status: "今天的回聲被輕輕記下。" },
        { label: "夥伴筆記", choice: "Companion note", status: "夥伴筆記已保存。" }
      ]
    }
  };
  return actions[action];
}
