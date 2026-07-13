export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

// ============================================================================
// 鍵盤模型 v6 —— 不對抗鍵盤（2026-07-13 Owner 指示：改用瀏覽器原生「自動彈窗」
// 行為，黑色空白區塊不可接受；取代 v5 的吊頂／保留區／--kb-inset 貼合整套補償）。
//
// 歷史教訓（v1–v5，詳見 ledger 2026-06-29 ~ 2026-07-04 各條）：所有「量測或猜測
// 鍵盤高度、把 --app-height 縮成 visualViewport 高」的路線，真機 iOS 26 都以黑塊
// 收場——vv 有時整段不回報、收起後 height 殘留變矮、offsetTop 不歸零；只要版面
// 高度跟著 vv 走，.app-shell 就被剪短，文件底下露出 html 背景 = 黑色空白區塊。
//
// v6 原則：
//   1. --app-height 永遠 = 佈局視口高度（documentElement.clientHeight），與
//      visualViewport 完全脫鉤。鍵盤彈出時版面一動不動：
//      - iOS Safari：鍵盤覆蓋頁面，瀏覽器原生把頁面上推（pan）露出輸入框。
//      - Android Chrome：viewport meta 已含 interactive-widget=resizes-content，
//        鍵盤直接縮排版 → clientHeight 真的變小 → resize 事件驅動重新量測。
//   2. 鍵盤收起後唯一的修正：把 iOS 26 可能殘留的頁面上推捲回 0
//      （restoreViewportAfterKeyboard），修「收起後下半屏黑塊」。
//   3. 鍵盤「打開中」嚴禁任何主動捲動／搬動（真機證實會讓 iOS 直接取消顯示
//      鍵盤）；restore 只掛在 blur 之後的延遲檢查點，且聚焦中一律跳過。
// ============================================================================

function isTextEditingActive() {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || active.isContentEditable;
}

export function setViewportVars() {
  const root = document.documentElement;
  // 佈局視口高度：iOS 鍵盤不改 clientHeight（覆蓋模式）；Android resizes-content
  // 縮排版時 clientHeight 會真的變小並發 resize。innerHeight 僅作 0 值保險。
  const height = Math.max(root.clientHeight || 0, window.innerHeight || 0);
  if (height > 0) root.style.setProperty("--app-height", `${height}px`);

  // Measure nav height after image/CSS layout; page and soul-strip reserve this.
  const nav = document.querySelector(".bottom-nav");
  if (nav) {
    const navH = Math.round(nav.getBoundingClientRect().height);
    if (navH > 0) root.style.setProperty("--nav-block-h", `${navH}px`);
  }

  // Measure the collapsed Soul Talk strip for page layout spacing.
  const strip = document.querySelector(".soul-strip");
  if (strip) {
    const stripH = Math.round(strip.getBoundingClientRect().height);
    if (stripH > 0) root.style.setProperty("--soul-strip-h", `${stripH}px`);
  }
}

// iOS 26 回歸（真機截圖 2026-07-13）：鍵盤收起後，Safari 有時不把「為了露出輸入框
// 而上推的頁面」推回原位（visual viewport 的 offsetTop 殘留），整頁停在被推高的
// 位置，文件底部以下露出 html 背景 = 下半屏黑塊。把捲動硬歸零即可復原；本頁本身
// 不可捲（overflow hidden、文件高 = 視口高），因此歸零在正常狀態是 no-op、安全。
// 時點：只在 blur 後的延遲檢查點執行（跨過 ~250–350ms 的收鍵盤動畫）。不立即執行
// ——blur 當下可能正處於「聚焦下一個輸入框」的空窗（activeElement 還是 body），
// 對開著的鍵盤捲動是 iOS 已知會直接取消鍵盤的反模式；檢查點時刻若又在編輯中，
// 一律跳過。
const RESTORE_CHECKPOINTS_MS = [260, 620, 1000];
let restoreTimers = [];
export function restoreViewportAfterKeyboard() {
  for (const timer of restoreTimers) window.clearTimeout(timer);
  const restore = () => {
    if (isTextEditingActive()) return;
    window.scrollTo(0, 0);
    const scroller = document.scrollingElement || document.documentElement;
    scroller.scrollTop = 0;
    scroller.scrollLeft = 0;
    setViewportVars();
  };
  restoreTimers = RESTORE_CHECKPOINTS_MS.map((ms) => window.setTimeout(restore, ms));
}

export function bindViewportVars() {
  setViewportVars();
  // Re-measure after first paint; image-backed nav can be zero before layout.
  requestAnimationFrame(setViewportVars);
  // 開機保險：部分 in-app webview（與預覽面板）會以 0 尺寸視口先跑 boot，
  // 首輪量測被 height>0 守門擋下（此時 CSS fallback 100dvh 接手，畫面仍正確），
  // 之後也不一定補發 resize。等視口就緒後補量幾次——純讀值，與鍵盤生命週期無關。
  for (const ms of [120, 400, 1000]) window.setTimeout(setViewportVars, ms);
  window.addEventListener("load", setViewportVars);
  window.addEventListener("resize", setViewportVars);
  window.addEventListener("orientationchange", setViewportVars);
}
