export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setViewportVars() {
  const vv = window.visualViewport;
  const height = vv?.height || window.innerHeight;
  const root = document.documentElement;
  root.style.setProperty("--app-height", `${height}px`);

  // 鍵盤讓位：visualViewport 比 layout viewport 短多少（含 offsetTop）= 鍵盤佔用高度。
  // 供 soul-talk drawer 在鍵盤開啟時收縮並把輸入框抬到鍵盤上方，避免下方留黑塊。
  const kbInset = Math.max(0, Math.round(window.innerHeight - height - (vv?.offsetTop || 0)));
  root.style.setProperty("--kb-inset", `${kbInset}px`);
  document.body?.classList.toggle("kb-open", kbInset > 80);

  // 量測底部 nav 實際高度，讓 soul-strip / 完整頁 / 設定底緣能「緊鄰但不重疊」，
  // 取代各檔散落的魔術數（如 108/124px）。nav 由 PNG aspect-ratio 決定高度，隨寬度變動。
  const nav = document.querySelector(".bottom-nav");
  if (nav) {
    const navH = Math.round(nav.getBoundingClientRect().height);
    if (navH > 0) root.style.setProperty("--nav-block-h", `${navH}px`);
  }
}

export function bindViewportVars() {
  setViewportVars();
  // nav/字體晚一拍才定版面，補量一次，避免 --nav-block-h 初值為 0。
  requestAnimationFrame(setViewportVars);
  window.addEventListener("load", setViewportVars);
  window.addEventListener("resize", setViewportVars);
  window.addEventListener("orientationchange", setViewportVars);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setViewportVars);
    window.visualViewport.addEventListener("scroll", setViewportVars);
  }
}
