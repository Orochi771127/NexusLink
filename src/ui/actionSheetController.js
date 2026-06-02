import { qs, qsa } from "../utils/dom.js";

export function createActionSheetController({ soulTalkController, saveCurrentState, statusText, panelManager }) {
  const bottomNavButtons = qsa(".bottom-nav button[data-action]");
  const actionSheetTitle = qs("#action-sheet-title");
  const actionSheetCopy = qs("#action-sheet-copy");
  const actionSheetActions = qs("#action-sheet-actions");
  let queuedAction = null;

  function bind() {
    bottomNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
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
    const message = choice ? `${actionMeta.message}（${choice}）` : actionMeta.message;
    soulTalkController.addChat("system", message);
    statusText.textContent = message;
    saveCurrentState();
    soulTalkController.renderChat();
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
      copy: "選擇一個短探索行動；首頁保持乾淨，不展開永久工具列表。",
      message: "森林深處有微弱的光。",
      rows: ["前往湖畔深處", "查看今日事件", "搜尋微光記號"]
    },
    care: {
      title: "照顧",
      copy: "用一次短照顧行動安撫夥伴，詳細互動留在 Soul Talk。",
      message: "你靠近牠，牠的呼吸變得穩定。",
      rows: ["摸摸", "餵食", "休息", "安撫"]
    },
    grow: {
      title: "成長",
      copy: "查看一次心核同步提示，不在首頁展開大型 HUD。",
      message: "心核頻率正在緩慢同步。",
      rows: ["查看同步率", "進化預覽", "能力培養"]
    },
    memory: {
      title: "記憶",
      copy: "保存目前片刻，並將細節留給角色詳情或 Soul Talk。",
      message: "一段微弱的回憶被保存下來。",
      rows: ["回憶紀錄", "對話片段", "羈絆節點"]
    }
  };
  return actions[action];
}
