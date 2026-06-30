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
