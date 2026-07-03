// 互動可讀性提示（First-Session 支柱一）。
//
// 私測回報：朋友「不知道怎麼跟貓互動、不知道怎麼摸」。
// 現況：onboarding 只教氛圍與三契約、不教機制；first-loop 的文字提示又飄在畫面別處、
// 與貓本身脫節；貓身上沒有任何「我可以被輕觸」的視覺訊號（手機也沒有 hover 可暗示）。
//
// 這個控制器在貓身上疊一圈非常輕的呼吸光暈 + 一顆會回應的心核微光，指向貓本身，
// 讓「牠可以被碰」用視覺說出來。設計守則（對齊 CLAUDE.md §2 紅線 6）：
//   - 這是「邀請」不是「任務」：無紅點、無倒數、無進度條、無「未完成」焦慮。
//   - 玩家一旦完成首次觸碰（firstTouchCompleted）就永久停止，不再打擾。
//   - 尊重 lowMotion / prefers-reduced-motion：降級為靜態微光。
//   - pointer-events:none，讓點擊直接穿透到 Pixi 貓；本元素只負責「被看見」。
// 元素於 boot 動態建立（不動 index.html）；垂直錨點用 CSS 變數，可在真機微調。

export function createInteractionHintController({ store, isPanelOpen, isOnboardingActive } = {}) {
  let el = null;

  function ensureElement() {
    if (el) return el;
    el = document.createElement("div");
    el.className = "touch-affordance";
    el.setAttribute("aria-hidden", "true"); // 純視覺；指示文字由 first-loop hint（aria-live）負責
    const ring = document.createElement("span");
    ring.className = "touch-affordance__ring";
    const core = document.createElement("span");
    core.className = "touch-affordance__core";
    el.appendChild(ring);
    el.appendChild(core);
    document.body.appendChild(el);
    return el;
  }

  function shouldShow(state) {
    if (!state?.onboarding?.completed) return false; // onboarding 進行中：不顯示
    if (state.firstTouchCompleted) return false; // 已學會怎麼摸 → 永久停止打擾
    if (typeof isPanelOpen === "function" && isPanelOpen()) return false;
    if (typeof isOnboardingActive === "function" && isOnboardingActive()) return false;
    return true;
  }

  function render() {
    const state = store.getState();
    if (!shouldShow(state)) {
      if (el) el.classList.remove("is-visible");
      return;
    }
    const node = ensureElement();
    node.classList.toggle("is-lowmotion", Boolean(state.settings?.lowMotion));
    node.classList.add("is-visible");
  }

  function bind() {
    render();
  }

  return { bind, render };
}
