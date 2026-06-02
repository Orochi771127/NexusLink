export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setViewportVars() {
  const height = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

export function bindViewportVars() {
  setViewportVars();
  window.addEventListener("resize", setViewportVars);
  window.addEventListener("orientationchange", setViewportVars);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setViewportVars);
    window.visualViewport.addEventListener("scroll", setViewportVars);
  }
}
