export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

// 「樂觀預收合」：iOS 第一次開鍵盤時 visualViewport 常常還沒縮（要等手動捲動才更新），
// 造成首次點擊的黑塊。focus 當下先用「上次記住的鍵盤可視高度」或估計值（版面 55%）把 drawer
// 立即收合到鍵盤上方；等 vv 真的更新後再換成真值（並記住，供下次直接用）。
let keyboardExpectedUntil = 0;
let lastKeyboardVisibleHeight = 0;
const HAS_SOFT_KEYBOARD =
  (typeof navigator !== "undefined" && Number(navigator.maxTouchPoints) > 0) ||
  (typeof window !== "undefined" && "ontouchstart" in window);

// soulTalkController 在 focus/blur 呼叫：宣告「鍵盤即將出現/離開」。windowMs 後若 vv 仍沒縮就放棄估計。
export function setKeyboardExpected(expected, windowMs) {
  keyboardExpectedUntil = expected ? Date.now() + (windowMs || 2500) : 0;
  setViewportVars();
}

export function setViewportVars() {
  const vv = window.visualViewport;
  const rawHeight = Math.round(vv?.height || window.innerHeight);
  const offsetTop = Math.max(0, Math.round(vv?.offsetTop || 0));
  const root = document.documentElement;

  // 穩定的版面高度基準（不隨鍵盤縮短）：某些 iOS innerHeight 會跟鍵盤縮短，clientHeight 才是 layout viewport。
  const layoutHeight = Math.max(root.clientHeight || 0, window.innerHeight || 0, rawHeight);

  let height = rawHeight;
  let kbInset = Math.max(0, Math.round(layoutHeight - rawHeight - offsetTop));

  if (kbInset >= 80) {
    // 真的偵測到鍵盤：記住此可視高度，供下次冷啟直接套用。
    lastKeyboardVisibleHeight = rawHeight;
  } else if (HAS_SOFT_KEYBOARD && Date.now() < keyboardExpectedUntil) {
    // 已 focus 但 vv 還沒縮 → 用估計值先收合，消除首次黑塊（vv 更新後此分支不再命中）。
    const estimate = lastKeyboardVisibleHeight || Math.round(layoutHeight * 0.55);
    if (estimate > 0 && estimate < layoutHeight - 40) {
      height = estimate;
      kbInset = Math.max(0, layoutHeight - estimate - offsetTop);
    }
  }

  root.style.setProperty("--app-height", `${height}px`);
  root.style.setProperty("--vv-offset-top", `${offsetTop}px`);
  root.style.setProperty("--kb-inset", `${kbInset}px`);
  document.body?.classList.toggle("kb-open", kbInset > 80);

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

// iOS Safari 的虛擬鍵盤要 ~250–350ms 才動畫完成；focus 當下只量一兩次（rAF）會在鍵盤開之前就跑完，
// 導致 --app-height / body.kb-open 維持「無鍵盤」狀態，drawer 出現黑塊，要等使用者手動捲動才被 visualViewport
// scroll 事件修正。此函式在 focus/blur 後的整段鍵盤動畫窗口內持續重量 viewport，讓版面即時跟著鍵盤升起／
// 收合，不需手動拖曳。
// 用「rAF 迴圈 + setTimeout 檢查點」雙保險：iOS Safari 在鍵盤動畫期間有時會節流/暫停 rAF（正是我們要追蹤的
// 那段窗口），故再加幾個固定時間點的 setTimeout 重量，rAF 即使被節流也能補上。重複呼叫只延長 rAF 截止時間。
let viewportSyncRaf = 0;
let viewportSyncDeadline = 0;
const VIEWPORT_SYNC_CHECKPOINTS = [60, 140, 260, 420, 620, 820];

// 真機關鍵修法：某些 iOS Safari / Chrome 在鍵盤彈出時**不會更新** visualViewport.height
// （量到的還是無鍵盤的舊值），要等使用者「手動捲一下」才更新 → 黑塊。此函式用 1px 捲動 jiggle
// 模擬那個手勢，強迫瀏覽器重算 visualViewport，然後立即重量。鍵盤開啟時 document 比可視視窗高、
// 有捲動範圍，drawer 又是 position:fixed 不會被捲動帶走，所以 1px jiggle 不可見、只是觸發重算。
export function nudgeViewportRecompute() {
  const el = document.scrollingElement || document.documentElement;
  if (el) {
    const y = el.scrollTop || 0;
    el.scrollTop = y > 0 ? y - 1 : y + 1; // 一個真實的 1px 捲動 delta，觸發 iOS 重算 visualViewport
  }
  setViewportVars();
}

export function syncViewportDuringTransition(durationMs = 800) {
  viewportSyncDeadline = Date.now() + durationMs;
  // setTimeout 檢查點：即使 rAF 被節流也保證在鍵盤動畫後重量到位；同時做捲動 jiggle 強迫 vv 重算。
  for (const t of VIEWPORT_SYNC_CHECKPOINTS) {
    if (t <= durationMs + 40) window.setTimeout(nudgeViewportRecompute, t);
  }
  if (viewportSyncRaf) return;
  const tick = () => {
    setViewportVars();
    if (Date.now() < viewportSyncDeadline) {
      viewportSyncRaf = requestAnimationFrame(tick);
    } else {
      viewportSyncRaf = 0;
    }
  };
  viewportSyncRaf = requestAnimationFrame(tick);
}

export function bindViewportVars() {
  setViewportVars();
  // Re-measure after first paint; image-backed nav can be zero before layout.
  requestAnimationFrame(setViewportVars);
  window.addEventListener("load", setViewportVars);
  window.addEventListener("resize", setViewportVars);
  window.addEventListener("orientationchange", setViewportVars);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setViewportVars);
    window.visualViewport.addEventListener("scroll", setViewportVars);
  }
}
