export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

const SOFT_KEYBOARD_FALLBACK_DELAY_MS = 340;
const SOFT_KEYBOARD_FALLBACK_RATIO = 0.55;
let softKeyboardExpectedUntil = 0;
let softKeyboardFallbackAfter = 0;
let lastSoftKeyboardHeight = 0;

function hasTouchKeyboard() {
  return Boolean(
    typeof navigator !== "undefined" &&
      (navigator.maxTouchPoints > 0 || "ontouchstart" in window)
  );
}

function isTextEditingActive() {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || active.isContentEditable;
}

function estimateKeyboardHeight(layoutHeight) {
  const remembered = lastSoftKeyboardHeight || 0;
  const estimated = remembered || Math.round(layoutHeight * SOFT_KEYBOARD_FALLBACK_RATIO);
  const minHeight = Math.min(260, Math.max(180, layoutHeight - 360));
  const maxHeight = Math.max(minHeight, layoutHeight - 120);
  return Math.min(maxHeight, Math.max(minHeight, estimated));
}

export function expectSoftKeyboard(durationMs = 1600) {
  const now = Date.now();
  softKeyboardExpectedUntil = now + durationMs;
  softKeyboardFallbackAfter = now + SOFT_KEYBOARD_FALLBACK_DELAY_MS;
}

export function clearSoftKeyboardExpectation() {
  softKeyboardExpectedUntil = 0;
  softKeyboardFallbackAfter = 0;
  document.body?.classList.remove("kb-fallback");
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
  const detectedKeyboard = kbInset > 80;
  let usingKeyboardFallback = false;

  if (detectedKeyboard) {
    lastSoftKeyboardHeight = rawHeight;
  } else if (
    hasTouchKeyboard() &&
    isTextEditingActive() &&
    Date.now() >= softKeyboardFallbackAfter &&
    Date.now() < softKeyboardExpectedUntil
  ) {
    height = estimateKeyboardHeight(layoutHeight);
    kbInset = Math.max(0, Math.round(layoutHeight - height - offsetTop));
    usingKeyboardFallback = kbInset > 80;
  }

  // 只用「真的量到」的 visualViewport 值，不猜測、不主動觸發捲動。
  // （先前版本試過「捲動 jiggle 強迫重算」與「focus 當下立即套用估計高度」，
  // 兩者都會在鍵盤正在打開的瞬間搬動 focus 元素的容器／觸發捲動事件，
  // 這是 iOS 已知會直接取消顯示鍵盤的反模式 —— 真機證實會整個不彈鍵盤，比黑塊更糟。
  // 現在改成純被動讀值 + CSS transition 讓最終套用的高度變化平滑，不再主動干預鍵盤生命週期。）
  root.style.setProperty("--app-height", `${height}px`);
  root.style.setProperty("--vv-offset-top", `${offsetTop}px`);
  root.style.setProperty("--kb-inset", `${kbInset}px`);
  document.body?.classList.toggle("kb-open", kbInset > 80);
  document.body?.classList.toggle("kb-fallback", usingKeyboardFallback);

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

// iOS 虛擬鍵盤要 ~250–350ms 才動畫完成，且某些版本要等鍵盤完全展開後才會回報新的
// visualViewport.height。此函式在 focus/blur 後的整段鍵盤動畫窗口內，被動地重複重量 viewport
// （只讀值、不捲動、不搬動任何元素），讓 --app-height 能盡快跟上鍵盤真正的可視高度。
// 用「rAF 迴圈 + setTimeout 檢查點」雙保險：iOS Safari 在鍵盤動畫期間有時會節流/暫停 rAF，
// 故再加幾個固定時間點的 setTimeout 重量，rAF 即使被節流也能補上。重複呼叫只延長 rAF 截止時間。
// 注意：這裡刻意只「讀」，不做任何主動觸發（捲動 jiggle、focus 時立即套用估計高度）——
// 兩者都曾在真機證實會讓 iOS 直接取消顯示鍵盤（比黑塊更糟）。剩餘的版面跳動改交給 CSS
// transition（見 mobile-safari-polish.css / soul-talk-drawer.css）讓套用新高度時是平滑滑入，
// 而不是瞬間跳動。
let viewportSyncRaf = 0;
let viewportSyncDeadline = 0;
const VIEWPORT_SYNC_CHECKPOINTS = [60, 140, 260, 420, 620, 820];
export function syncViewportDuringTransition(durationMs = 800) {
  viewportSyncDeadline = Date.now() + durationMs;
  for (const t of VIEWPORT_SYNC_CHECKPOINTS) {
    if (t <= durationMs + 40) window.setTimeout(setViewportVars, t);
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
