export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setViewportVars() {
  const vv = window.visualViewport;
  const height = vv?.height || window.innerHeight;
  const offsetTop = Math.max(0, Math.round(vv?.offsetTop || 0));
  const root = document.documentElement;

  root.style.setProperty("--app-height", `${height}px`);
  root.style.setProperty("--vv-offset-top", `${offsetTop}px`);

  // Keyboard inset is the part of the layout viewport hidden by the OS keyboard.
  // Elements that are already sized to --app-height should anchor inside the
  // visual viewport rather than also adding this inset, otherwise iOS Safari can
  // show a large black gap between the drawer and keyboard.
  const kbInset = Math.max(0, Math.round(window.innerHeight - height - offsetTop));
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
// scroll 事件修正。此函式在 focus/blur 後的整段鍵盤動畫窗口內，每一幀重量一次 viewport，讓版面即時跟著
// 鍵盤升起／收合，不需手動拖曳。重複呼叫只延長截止時間，不會起第二個迴圈。
let viewportSyncRaf = 0;
let viewportSyncDeadline = 0;
export function syncViewportDuringTransition(durationMs = 800) {
  viewportSyncDeadline = Date.now() + durationMs;
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
