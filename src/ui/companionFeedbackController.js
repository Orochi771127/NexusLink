import EventBus from "../utils/eventBus.js";

// 夥伴觸碰回饋與棲地狀態的共用 toast 面。
// 私測回報：點貓有動畫但沒有任何文字回饋（反應文字寫在收合的 Soul Talk drawer 裡看不見）、
// Care/Growth 按鈕狀態塞進聊天紀錄造成混淆。此元件把兩者都改成主畫面上的一行安靜提示。
// 元素於 boot 時動態建立（不動 index.html），pointer-events:none、aria-live=polite。
const COMPANION_REACTION_FEEDBACK_EVENT = "COMPANION_REACTION_FEEDBACK";
const HABITAT_STATUS_TOAST_EVENT = "HABITAT_STATUS_TOAST";
const HIDE_DELAY_MS = 2200;

export function createCompanionFeedbackController() {
  let element = null;
  let hideTimer = null;

  function ensureElement() {
    if (element) return element;
    element = document.createElement("p");
    element.className = "companion-feedback";
    element.setAttribute("role", "status");
    element.setAttribute("aria-live", "polite");
    document.body.appendChild(element);
    return element;
  }

  // 浮字預設錨在夥伴身上（棲地主畫面），但探索／照顧／成長／記憶頁與各面板會整片蓋住
  // 舞台——此時錨點座標已無意義，文字會直接壓在卡片說明上（私測回報：圖四／圖五疊字）。
  // 舞台被蓋住時改成停靠底部的一行 toast，讓它永遠落在內容之外。
  function isStageCovered() {
    const { body } = document;
    if (body.classList.contains("panel-open")) return true;
    if (body.classList.contains("expedition-active")) return true;
    const activePage = document.getElementById("page-layer")?.dataset.activePage;
    return Boolean(activePage) && activePage !== "home";
  }

  function show({ text, tone = "accept" } = {}) {
    if (!text) return;
    const el = ensureElement();
    window.clearTimeout(hideTimer);
    el.textContent = text;
    el.dataset.tone = tone;
    el.dataset.placement = isStageCovered() ? "docked" : "anchored";
    el.classList.remove("is-visible");
    // 強制 reflow 重啟 transition：連續觸碰時每一句都要有明確的進場感
    void el.offsetWidth;
    el.classList.add("is-visible");
    hideTimer = window.setTimeout(hide, HIDE_DELAY_MS);
  }

  function hide() {
    window.clearTimeout(hideTimer);
    element?.classList.remove("is-visible");
  }

  function bind() {
    EventBus.on(COMPANION_REACTION_FEEDBACK_EVENT, show);
    EventBus.on(HABITAT_STATUS_TOAST_EVENT, show);
  }

  return { bind, show, hide };
}
