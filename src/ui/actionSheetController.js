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
    const message = choice ? `${actionMeta.message}（${choice}）` : actionMeta.message;
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
      copy: "選擇一個探索節點，讓夥伴感知棲地周圍的微光。",
      message: "探索訊號已展開",
      rows: ["湖畔微光", "星圖回廊", "靜默晶簇"]
    },
    care: {
      title: "照顧",
      copy: "用低干擾的照顧動作回應夥伴，不在主畫面展開大型 HUD。",
      message: "照顧行動已同步",
      rows: ["輕聲安撫", "能量補給", "陪伴休息", "清理雜訊"]
    },
    grow: {
      title: "成長",
      copy: "查看一次心核同步提示，讓成長節點保留在面板內完成。",
      message: "成長節點已記錄",
      rows: ["信任校準", "情緒穩定", "技能回路"]
    },
    memory: {
      title: "記憶",
      copy: "把目前的互動沉澱成一段記憶，並回寫到 Soul Talk。",
      message: "記憶片段已收束",
      rows: ["湖面片段", "今日回聲", "夥伴筆記"]
    }
  };
  return actions[action];
}
