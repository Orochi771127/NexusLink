import { deriveGentleInvitation } from "../engine/gentleInvitationEngine.js";

// 柔性邀請 UI（First-Session 支柱二）：把 gentleInvitationEngine 推導出的「此刻牠像是想做什麼」
// 顯示成首頁上一句溫柔、可忽略的下一步，並（僅 bottom-nav 目的地）在對應 nav 項疊一層很輕的暖光。
//
// 顯示條件：onboarding 已完成、首輪閉環已完成/跳過、目前在首頁（非 page-open）、
// 沒有面板開啟、非 Soul Talk 鍵盤聚焦（st-focus）、非 onboarding/first-loop 進行中。
// 敘事句維持中文（同 first-trace / trace-echo 設計）。元素於 boot 動態建立（不動 index.html）。
//
// 反紅點守則：這不是通知徽章。navGlow 是一層會呼吸的柔光、不是數字/紅點；文字可忽略、不阻擋操作。

const LINES = Object.freeze({
  space: [
    "牠現在想要一點空間。待在旁邊、什麼都不做，也是一種陪。",
    "牠把身體側了側，像在說「先這樣就好」。給牠一點安靜。"
  ],
  rest: [
    "牠有點累了，也許想在營火邊靜靜待著。",
    "牠的眼皮沉沉的——也許，是休息一下的時候了。"
  ],
  connect: [
    "牠望了你一眼，像是願意多聽你說一點。",
    "牠的耳朵朝你這邊轉了過來——有什麼想說的嗎？"
  ],
  explore: [
    "牠的耳朵朝湖那邊動了動，好像對外面有點好奇。",
    "牠望向遠處的星林，像是想去走走。"
  ],
  stillness: [
    "牠很安穩地待著。此刻，什麼都不做也很好。",
    "夜很靜，牠就靠在你旁邊。這樣就夠了。"
  ],
  presence: [
    "牠安靜地陪著你，呼吸很輕。"
  ]
});

const NAV_ACTIONS = new Set(["explore", "care", "grow", "memory"]);
const REEVAL_INTERVAL_MS = 4000;

export function createGentleInvitationController({
  store,
  isPanelOpen,
  isResonanceThreadVisible
} = {}) {
  let el = null;
  let currentKind = null;
  const rotation = {}; // kind -> 下一個要用的索引，讓同一 kind 每次重現時輪播、不呆板
  let intervalId = null;

  function ensureElement() {
    if (el) return el;
    el = document.createElement("p");
    el.className = "gentle-invitation";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
    return el;
  }

  function canShow(state) {
    if (!state?.onboarding?.completed) return false;
    const firstLoop = state.onboarding?.firstLoop || {};
    if (!firstLoop.completedAt && !firstLoop.skippedAt) return false; // 首輪閉環進行中 → 交給 firstLoopController
    const body = document.body.classList;
    if (
      body.contains("onboarding-active") ||
      body.contains("first-loop-active") ||
      body.contains("first-loop-reveal-active") ||
      body.contains("page-open") ||
      body.contains("st-focus")
    ) {
      return false;
    }
    if (typeof isPanelOpen === "function" && isPanelOpen()) return false;
    // Thread 可見時讓位，避免兩句並存搶注意力。
    if (typeof isResonanceThreadVisible === "function" && isResonanceThreadVisible()) return false;
    return true;
  }

  function pickLine(kind) {
    const pool = LINES[kind] || LINES.presence;
    const index = (rotation[kind] || 0) % pool.length;
    rotation[kind] = index + 1;
    return pool[index];
  }

  function setNavGlow(navHint) {
    document
      .querySelectorAll(".bottom-nav .bottom-nav__item.invite-glow")
      .forEach((item) => item.classList.remove("invite-glow"));
    if (navHint && NAV_ACTIONS.has(navHint)) {
      const item = document.querySelector(`.bottom-nav .bottom-nav__item[data-action="${navHint}"]`);
      if (item) item.classList.add("invite-glow");
    }
  }

  function render() {
    const state = store.getState();
    if (!canShow(state)) {
      if (el) el.classList.remove("is-visible");
      setNavGlow(null);
      currentKind = null;
      return;
    }

    const { kind, navHint } = deriveGentleInvitation(state, Date.now());
    const node = ensureElement();
    // kind 不變就維持同一句（避免每個 tick 抖動）；kind 變了才換句、換暖光。
    if (kind !== currentKind) {
      currentKind = kind;
      node.textContent = pickLine(kind);
      setNavGlow(navHint);
    }
    node.classList.add("is-visible");
  }

  function bind() {
    render();
    // 導覽切換（home↔分頁）、開面板、Soul Talk 鍵盤聚焦都是 UI 事件、不觸發 store.subscribe。
    // 用捕獲階段監聽 + rAF 在下一幀重算，確保切走分頁的當下邀請就即時隱藏（不殘留在子頁上）、
    // 回到首頁又即時顯示。render 很輕（讀 state + 切 class）。
    document.addEventListener("click", scheduleRender, true);
    document.addEventListener("focusin", scheduleRender, true);
    document.addEventListener("focusout", scheduleRender, true);
    // 慢節拍：反映時段/能量的自然漂移（導覽以外的狀態變化）。
    intervalId = window.setInterval(render, REEVAL_INTERVAL_MS);
  }

  function scheduleRender() {
    window.requestAnimationFrame(render);
  }

  function dispose() {
    window.clearInterval(intervalId);
    document.removeEventListener("click", scheduleRender, true);
    document.removeEventListener("focusin", scheduleRender, true);
    document.removeEventListener("focusout", scheduleRender, true);
  }

  return { bind, render, dispose };
}
