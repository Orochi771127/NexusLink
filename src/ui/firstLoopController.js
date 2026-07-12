import EventBus from "../utils/eventBus.js";
import { isEmotionalHabitatTrace } from "../engine/habitatTraceEngine.js";
import { LANGUAGE_CHANGED_EVENT, t } from "../i18n/i18n.js";
import { qsa } from "../utils/dom.js";

// Meet 之後的首輪閉環（CLAUDE.md §0.5.1：First Touch → First Soul Talk → First Trace）。
// 設計原則（K6 / 紅線 6）：這不是任務欄——單行提示、可跳過、無紅點、無倒數、
// 無進度條；完成後 nav 安靜淡入，不慶祝。
// stage 由既有持久欄位 derive（不落地）：
//   touch → 尚未 firstTouchCompleted
//   talk  → chatHistory 尚無 player 行
//   trace → 尚無可見情緒痕跡
//   done  → 寫入 onboarding.firstLoop.completedAt，淡出並揭示其餘 nav
// 提示元素動態建立（不動 index.html）。心核（home）與心語入口全程可用。
const REVEAL_LINGER_MS = 2600;
const NAV_GATED_SELECTOR = ".bottom-nav .bottom-nav__item:not(.bottom-nav__item--core)";

export function createFirstLoopController({ store, saveCurrentState } = {}) {
  let wrapEl = null;
  let hintEl = null;
  let skipEl = null;
  let revealTimer = null;
  let revealPlayed = false;
  let completing = false;
  let wasActive = false;

  function ensureElements() {
    if (wrapEl) return;
    wrapEl = document.createElement("div");
    wrapEl.className = "first-loop-hint-wrap";
    hintEl = document.createElement("p");
    hintEl.className = "first-loop-hint";
    hintEl.setAttribute("role", "status");
    hintEl.setAttribute("aria-live", "polite");
    skipEl = document.createElement("button");
    skipEl.type = "button";
    skipEl.className = "first-loop-skip";
    skipEl.addEventListener("click", skipLoop);
    wrapEl.appendChild(hintEl);
    wrapEl.appendChild(skipEl);
    document.body.appendChild(wrapEl);
  }

  function bind() {
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => render());
    render();
  }

  function isLoopActive(state) {
    const firstLoop = state.onboarding?.firstLoop || {};
    return Boolean(state.onboarding?.completed) && !firstLoop.skippedAt && !firstLoop.completedAt;
  }

  function deriveStage(state) {
    if (!state.firstTouchCompleted) return "touch";
    const hasPlayerLine = (Array.isArray(state.chatHistory) ? state.chatHistory : [])
      .some((entry) => entry?.role === "player");
    if (!hasPlayerLine) return "talk";
    const visibleTraces = (Array.isArray(state.habitatTraces) ? state.habitatTraces : [])
      .filter((trace) => isEmotionalHabitatTrace(trace));
    if (visibleTraces.length === 0) return "trace";
    return "done";
  }

  function render() {
    const state = store.getState();

    // onboarding 進行中：閉環還沒開始，什麼都不顯示。
    if (!state.onboarding?.completed) {
      deactivate({ reveal: false });
      return;
    }

    if (!isLoopActive(state)) {
      // 從 active 轉為完成/跳過的那一刻 → 安靜揭示；其餘情況（老玩家、reload 後）直接全開。
      deactivate({ reveal: wasActive });
      return;
    }

    const stage = deriveStage(state);
    if (stage === "done") {
      completeLoop();
      return;
    }

    ensureElements();
    wasActive = true;
    document.body.classList.add("first-loop-active");
    document.body.dataset.firstLoopStage = stage;
    setNavGated(true);
    hintEl.textContent = t(`fl.hint${stage === "touch" ? "Touch" : stage === "talk" ? "Talk" : "Trace"}`);
    skipEl.textContent = t("fl.skip");
    skipEl.hidden = false;
    delete wrapEl.dataset.viewState;
    wrapEl.classList.add("is-visible");
  }

  function deactivate({ reveal }) {
    document.body.classList.remove("first-loop-active");
    delete document.body.dataset.firstLoopStage;
    setNavGated(false);
    if (reveal && !revealPlayed) {
      revealPlayed = true;
      wasActive = false;
      ensureElements();
      hintEl.textContent = t("fl.reveal");
      skipEl.hidden = true;
      delete wrapEl.dataset.viewState;
      wrapEl.classList.add("is-visible");
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(() => wrapEl.classList.remove("is-visible"), REVEAL_LINGER_MS);
      return;
    }
    wasActive = false;
    if (wrapEl && !revealTimer) wrapEl.classList.remove("is-visible");
  }

  function setNavGated(gated) {
    qsa(NAV_GATED_SELECTOR).forEach((button) => {
      button.inert = gated;
      button.setAttribute("aria-hidden", String(gated));
    });
  }

  function completeLoop() {
    if (completing) return;
    completing = true;
    const previousCompletedAt = store.getState().onboarding?.firstLoop?.completedAt || null;
    try {
      store.updateState((draft) => {
        if (!draft.onboarding.firstLoop.completedAt) {
          draft.onboarding.firstLoop.completedAt = Date.now();
        }
      });
      persistOrThrow();
    } catch (error) {
      console.warn("First-loop completion was not saved", error);
      store.updateState((draft) => {
        draft.onboarding.firstLoop.completedAt = previousCompletedAt;
      });
      showRecoverableError();
    } finally {
      completing = false;
    }
  }

  function skipLoop() {
    const previousSkippedAt = store.getState().onboarding?.firstLoop?.skippedAt || null;
    try {
      store.updateState((draft) => {
        if (!draft.onboarding.firstLoop.skippedAt) {
          draft.onboarding.firstLoop.skippedAt = Date.now();
        }
      });
      persistOrThrow();
    } catch (error) {
      console.warn("First-loop skip was not saved", error);
      store.updateState((draft) => {
        draft.onboarding.firstLoop.skippedAt = previousSkippedAt;
      });
      showRecoverableError();
    }
  }

  function showRecoverableError() {
    ensureElements();
    wasActive = true;
    document.body.classList.add("first-loop-active");
    setNavGated(true);
    hintEl.textContent = t("fl.recoverableError");
    skipEl.textContent = t("fl.retrySkip");
    skipEl.hidden = false;
    wrapEl.dataset.viewState = "recoverable-error";
    wrapEl.classList.add("is-visible");
  }

  function persistOrThrow() {
    const result = saveCurrentState?.();
    if (result?.ok === false) {
      const error = new Error("First-loop state was not saved");
      error.code = "SAVE_FAILED";
      error.cause = result.error;
      throw error;
    }
    return result;
  }

  return { bind, render };
}
