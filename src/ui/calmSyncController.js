import EventBus from "../utils/eventBus.js";
import { evaluateActionEffect } from "../engine/actionEffectEngine.js";
import { t, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";

// 心核共息 / Calm Sync v1（spec: NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md §5）
// 36 秒共呼吸 session：4 cycles ×（4s 吸 + 5s 呼），CSS 驅動視覺、setTimeout 步進，
// 無 ticker/rAF、無逐 cycle setState；完成才做一次 evaluateActionEffect + save。
// 紅線對照：無倒數數字/進度條/cycle 計數（K6）；離開永遠有效且不是失敗（D5 精神）；
// 觸發只由玩家行動，不由玩家頻率/離線時間（紅線 1）。
const BREATH_CYCLES = 4;
const INHALE_MS = 4000;
const EXHALE_MS = 5000;
const HABITAT_STATUS_TOAST_EVENT = "HABITAT_STATUS_TOAST";
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";

export function createCalmSyncController({ store, saveCurrentState, statusText, goHome } = {}) {
  let layer = null;
  let hintEl = null;
  let leaveButton = null;
  let ringWrap = null;
  let active = false;
  let syncedCycles = 0;
  let cycleCredited = false;
  let currentCycle = 0;
  let timers = [];
  let removeSessionListeners = null;

  function ensureElements() {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "calm-sync-layer";
    layer.hidden = true;
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.innerHTML = `
      <div class="calm-sync-ring-wrap" role="button" tabindex="0" aria-label="${t("cs.ringAria")}">
        <div class="calm-sync-ring calm-sync-ring--outer"></div>
        <div class="calm-sync-ring calm-sync-ring--inner"></div>
      </div>
      <p class="calm-sync-hint" role="status" aria-live="polite"></p>
      <button type="button" class="calm-sync-leave"></button>
    `;
    document.body.appendChild(layer);
    hintEl = layer.querySelector(".calm-sync-hint");
    leaveButton = layer.querySelector(".calm-sync-leave");
    ringWrap = layer.querySelector(".calm-sync-ring-wrap");
    applyTexts();

    // 吸氣窗輕點 = 同步呼吸（純加分；錯過或呼氣點擊零回饋，永不懲罰）。
    const creditCycle = () => {
      if (!active || layer.dataset.phase !== "inhale" || cycleCredited) return;
      cycleCredited = true;
      syncedCycles += 1;
      ringWrap.classList.add("is-synced");
      window.setTimeout(() => ringWrap.classList.remove("is-synced"), 420);
    };
    ringWrap.addEventListener("pointerdown", creditCycle);
    ringWrap.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      creditCycle();
    });
    leaveButton.addEventListener("click", () => abort({ toast: true }));
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => {
      if (layer) applyTexts();
    });
  }

  function applyTexts() {
    if (layer) layer.setAttribute("aria-label", t("cs.ringAria"));
    if (hintEl) hintEl.textContent = t("cs.hint");
    if (leaveButton) leaveButton.textContent = t("cs.leave");
    if (ringWrap) ringWrap.setAttribute("aria-label", t("cs.ringAria"));
  }

  function schedule(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
  }

  function installSessionListeners() {
    const onKeydown = (event) => {
      if (event.key === "Escape") abort({ toast: true });
    };
    // capture 且不擋事件：點外部（nav/HUD/心語）→ 安靜退出，原點擊照常生效。
    // 心語安全路徑永遠不被 session 阻擋。
    const onPointerDown = (event) => {
      if (event.target === layer) abort({ toast: false });
    };
    const onVisibility = () => {
      if (document.hidden) abort({ toast: false });
    };
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("visibilitychange", onVisibility);
    removeSessionListeners = () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("visibilitychange", onVisibility);
      removeSessionListeners = null;
    };
  }

  function runCycle() {
    if (!active) return;
    currentCycle += 1;
    cycleCredited = false;
    layer.dataset.phase = "inhale";
    schedule(() => {
      if (!active) return;
      layer.dataset.phase = "exhale";
      schedule(() => {
        if (!active) return;
        if (currentCycle >= BREATH_CYCLES) complete();
        else runCycle();
      }, EXHALE_MS);
    }, INHALE_MS);
  }

  function teardown() {
    active = false;
    clearTimers();
    removeSessionListeners?.();
    if (layer) {
      layer.hidden = true;
      delete layer.dataset.phase;
    }
    document.body.classList.remove("calm-sync-active");
  }

  function start() {
    if (active) return;
    ensureElements();
    // Care 玻璃卡在 390px 會蓋住夥伴 focal zone；先收回 home 讓夥伴可見。
    goHome?.();
    active = true;
    syncedCycles = 0;
    currentCycle = 0;
    document.body.classList.add("calm-sync-active");
    layer.hidden = false;
    applyTexts();
    installSessionListeners();
    EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, { intent: "care.calm_sync", source: "calm-sync" });
    runCycle();
  }

  function abort({ toast = false } = {}) {
    if (!active) return;
    teardown();
    // 提早離開 = 溫柔 no-op：無 deltas、不記錄、不懲罰。
    if (toast) {
      EventBus.emit(HABITAT_STATUS_TOAST_EVENT, { text: t("cs.leftEarly"), tone: "calm" });
    }
  }

  function complete() {
    const synced = syncedCycles;
    teardown();
    const result = evaluateActionEffect(store.getState(), "care", "calm_sync", { syncedCycles: synced });
    store.setState(result.statePatch);
    const message = synced > 0 ? t("cs.doneSynced") : t("cs.doneQuiet");
    EventBus.emit(HABITAT_STATUS_TOAST_EVENT, { text: message, tone: "calm" });
    if (statusText) statusText.textContent = message;
    saveCurrentState?.();
  }

  return {
    start,
    abort,
    isActive: () => active
  };
}
