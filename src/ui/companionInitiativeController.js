import EventBus from "../utils/eventBus.js";
import { deriveInitiativeMoment } from "../engine/gentleInvitationEngine.js";
import {
  evaluateAmbientInitiativeCooldown,
  getAmbientInitiativeBudget
} from "../ai/autonomy/initiativeCooldown.js";

// 夥伴主動微時刻（TP-7 Companion Presence v1）。
//
// gentleInvitation 是旁白「牠像是想…」；這裡是牠**真的做了**：一個動畫意圖 + 至多一句話。
// 守則（對齊 CLAUDE.md §1 契約 / §2 紅線）：
//   - 觸發只來自 deriveInitiativeMoment（夥伴狀態）+ evaluateAmbientInitiativeCooldown
//     （節拍防打擾）。**絕不**讀取玩家離線時長 / 上線頻率（紅線 1）。
//   - 台詞是瞬時呈現，**不寫 chatHistory**、不進存檔——牠的主動是「存在」，不是「來訊」，
//     不製造未讀焦慮（紅線 6）。
//   - 動畫走既有 COMPANION_ANIMATION_INTENT 事件（同 mapController / battleController /
//     return-echo 模式），UI 不直接操作 Pixi（H1 解耦）。
//   - 顯示條件與 gentleInvitation 相同：只在首頁、無面板、非 onboarding / first-loop /
//     st-focus。安全（safeHarbor）時由引擎與冷卻雙重擋下。
//   - 元素與樣式於 boot 動態建立（不動 index.html / styles.css）。

const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";
const EVALUATE_INTERVAL_MS = 45_000;
const LINE_VISIBLE_MS = 5_500;
const STYLE_ID = "companion-initiative-style";

const CSS = `
.companion-initiative-line {
  position: fixed;
  left: 50%;
  bottom: 42%;
  transform: translateX(-50%);
  max-width: min(78vw, 340px);
  padding: 6px 14px;
  border-radius: 14px;
  background: rgba(10, 16, 30, 0.55);
  color: rgba(235, 242, 255, 0.92);
  font-size: 0.85rem;
  line-height: 1.5;
  text-align: center;
  letter-spacing: 0.02em;
  white-space: normal;
  word-break: keep-all;
  pointer-events: none;
  opacity: 0;
  transition: opacity 720ms ease;
  z-index: 40;
}
.companion-initiative-line.is-visible { opacity: 1; }
.companion-initiative-line.voice-narration {
  background: transparent;
  color: rgba(210, 224, 245, 0.78);
  font-size: 0.8rem;
}
@media (prefers-reduced-motion: reduce) {
  .companion-initiative-line { transition: none; }
}
html[data-reduced-motion-preference="reduced"] .companion-initiative-line { transition: none; }
/* 牠「真的在做」的時候，旁白「牠像是想…」讓位——兩句同屏會互相壓住、語意也矛盾。 */
body.companion-initiative-active .gentle-invitation,
body.first-loop-reveal-active .companion-initiative-line { opacity: 0 !important; }
`;

export function createCompanionInitiativeController({
  store,
  isPanelOpen,
  onMomentAvailable
} = {}) {
  let el = null;
  let intervalId = null;
  let hideTimerId = null;
  const session = {
    bootAt: 0,
    lastMomentAt: 0,
    momentsThisSession: 0,
    lastMomentId: null,
    lineRotation: {}
  };

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function ensureElement() {
    if (el) return el;
    ensureStyles();
    el = document.createElement("p");
    el.className = "companion-initiative-line";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
    return el;
  }

  function canShow(state) {
    if (!state?.onboarding?.completed) return false;
    const firstLoop = state.onboarding?.firstLoop || {};
    if (!firstLoop.completedAt && !firstLoop.skippedAt) return false;
    const body = document.body.classList;
    if (
      body.contains("onboarding-active") ||
      body.contains("first-loop-active") ||
      body.contains("first-loop-reveal-active") ||
      body.contains("page-open") ||
      body.contains("st-focus") ||
      body.contains("habitat-moment-active") ||
      body.contains("habitat-moment-offered")
    ) {
      return false;
    }
    if (typeof isPanelOpen === "function" && isPanelOpen()) return false;
    return true;
  }

  function pickLine(momentDef) {
    const pool = momentDef.lines || [];
    if (!pool.length) return "";
    const index = (session.lineRotation[momentDef.id] || 0) % pool.length;
    session.lineRotation[momentDef.id] = index + 1;
    return pool[index];
  }

  function showLine(momentDef) {
    const node = ensureElement();
    const line = pickLine(momentDef);
    if (!line) return;
    node.textContent = line;
    node.classList.toggle("voice-narration", momentDef.voice === "narration");
    node.classList.add("is-visible");
    document.body.classList.add("companion-initiative-active");
    window.clearTimeout(hideTimerId);
    hideTimerId = window.setTimeout(() => {
      node.classList.remove("is-visible");
      document.body.classList.remove("companion-initiative-active");
    }, LINE_VISIBLE_MS);
  }

  /** Pack C：給 gate／除錯讀取目前主動性預算（不寫存檔）。 */
  function getBudgetView(now = Date.now()) {
    const state = store?.getState?.() || {};
    return getAmbientInitiativeBudget({
      now,
      bootAt: session.bootAt,
      lastMomentAt: session.lastMomentAt,
      momentsThisSession: session.momentsThisSession,
      safeUnstable: Boolean(state.safeHarborMode)
    });
  }

  function evaluate(now = Date.now()) {
    const state = store.getState();
    if (!canShow(state)) return null;

    // 預算視圖與 cooldown 同源；allowed 仍以 evaluateAmbientInitiativeCooldown 為準。
    const budget = getBudgetView(now);
    const cooldown = evaluateAmbientInitiativeCooldown({
      now,
      bootAt: session.bootAt,
      lastMomentAt: session.lastMomentAt,
      momentsThisSession: session.momentsThisSession,
      safeUnstable: Boolean(state.safeHarborMode)
    });
    if (!cooldown.allowed || !budget.allowed) return null;

    const momentDef = deriveInitiativeMoment(state, now);
    if (!momentDef) return null;
    // 同一個 session 內不重複同一種時刻：兩次都「去火邊瞇」會讀成腳本，不像活著。
    if (momentDef.id === session.lastMomentId) return null;

    session.lastMomentAt = now;
    session.momentsThisSession += 1;
    session.lastMomentId = momentDef.id;

    EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
      intent: momentDef.intent,
      source: "companion-initiative"
    });
    showLine(momentDef);
    try {
      onMomentAvailable?.(momentDef);
    } catch (error) {
      // 微時刻的可操作層是加值呈現；失敗不得中斷既有夥伴主動行為。
      console.warn("Habitat moment invitation was unavailable", error);
    }
    return momentDef;
  }

  function bind() {
    session.bootAt = Date.now();
    intervalId = window.setInterval(() => evaluate(), EVALUATE_INTERVAL_MS);
  }

  function dispose() {
    window.clearInterval(intervalId);
    window.clearTimeout(hideTimerId);
    document.body.classList.remove("companion-initiative-active");
    if (el) el.classList.remove("is-visible");
  }

  return { bind, evaluate, dispose, getBudgetView };
}
