export function createChampionshipFocusController(root) {
  let previousFocus = null;

  function focusFirst() {
    const first = root.querySelector("[data-championship-action]:not([disabled])");
    if (first instanceof HTMLElement) first.focus({ preventScroll: true });
  }

  return Object.freeze({
    remember() {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    focusFirst,
    restore() {
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      else focusFirst();
      previousFocus = null;
    },
    trap(event) {
      if (event.key !== "Tab") return;
      const focusable = [...root.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")]
        .filter((element) => element instanceof HTMLElement && !element.hidden);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
