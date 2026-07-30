import { qs, qsa, restoreViewportAfterKeyboard } from "../utils/dom.js";
import { getCompanionById } from "../data/companionRegistry.js";
import { isVeteranSave } from "../state/store.js";
import EventBus from "../utils/eventBus.js";
import { LANGUAGE_CHANGED_EVENT, t } from "../i18n/i18n.js";
import { createFirstResonanceController } from "./firstResonanceController.js";

const STEP_ORDER = ["start", "identity", "guidance", "bond", "meet"];
const FINAL_GREETING = "我在這裡。你可以慢慢靠近，也可以先只是看著月湖。";

// 初遇定情（CH-2，Master Canon §1.3 階段一）：三道初醒的心核光，每隻只給
// 一句話、一個氛圍——非六隻選單逛街。未選者不是收集品，章節旅途中會再遇見。
// 注意：bond 不是持久化的 status 值（store normalizeOnboarding 有白名單）；
// 它由「status=guidance 且 guidanceCompleted」推導，reload 會安全回到本步。
export const INITIAL_BOND_CHOICES = Object.freeze([
  {
    id: "greyshade-cat",
    hue: 200,
    line: "……你來了。我會在這裡，不吵你。"
  },
  {
    id: "blazetail-kit",
    hue: 18,
    line: "就算心裡還有點怕，我也想替你照亮前面的路。"
  },
  {
    id: "crystalfin-seahorse",
    hue: 194,
    line: "有些記憶會沉到很深的地方。我可以陪你慢慢聽。"
  }
]);

export function createOnboardingController({
  store,
  saveCurrentState,
  onBondChosen,
  onStepShown,
  prepareSceneReveal
} = {}) {
  const root = qs("#onboarding-root");
  const shell = root?.querySelector(".onboarding-shell");
  const firstResonance = createFirstResonanceController({ root });
  let steps = root ? qsa(".onboarding-step", root) : [];
  const nameInput = qs("#player-display-name");
  let activeStep = "start";
  let interactionInFlight = false;
  let feedbackEl = null;
  let markingStarted = false;
  let lastAnnouncedStep = null;

  function bind() {
    if (!root) return;
    ensureBondStep();
    ensureFeedback();
    root.addEventListener("click", handleAction);
    // 語言切換時 applyLanguage 會把 meet 標題蓋回字典預設（寫死灰影）；
    // 若正停在 meet 步且已定情，於下一幀重寫為「{選定者}在月湖邊等你。」
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => {
      if (!isActive() || activeStep !== "meet") return;
      window.requestAnimationFrame(() => showStep("meet", store.getState()));
    });
    nameInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveIdentity(false);
      }
    });
    // 鍵盤模型 v6（見 dom.js / ui-v3-onboarding.css，2026-07-13 Owner 指示）：
    // 不偵測、不量測、也不再釘頂（v5 的 body.ob-focus 已移除）。聚焦時交給
    // 瀏覽器原生「自動彈窗」上推；收起後把 iOS 26 可能殘留的上推歸零。
    nameInput?.addEventListener("blur", () => {
      restoreViewportAfterKeyboard();
    });
  }

  function render() {
    if (!root) return;
    const state = store.getState();
    const shouldShow = !state.onboarding?.completed;

    root.hidden = !shouldShow;
    root.setAttribute("aria-hidden", String(!shouldShow));
    document.body.classList.toggle("onboarding-active", shouldShow);
    document.body.classList.toggle("v3-home-ready", !shouldShow);

    if (!shouldShow) return;
    root.classList.remove("is-revealing");
    delete root.dataset.revealMode;

    const storedName = state.playerProfile?.displayName || "";
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = storedName;
    }

    activeStep = resolveStep(state.onboarding?.status, state.onboarding);
    showStep(activeStep, state);
    markStarted(state);
  }

  function isActive() {
    return Boolean(root && !root.hidden);
  }

  function restart() {
    firstResonance.cancel();
    lastAnnouncedStep = null;
    const state = store.getState();
    const now = Date.now();
    store.setState({
      onboarding: {
        ...state.onboarding,
        completed: false,
        status: "start",
        startedAt: now,
        completedAt: null,
        identityCompleted: false,
        guidanceCompleted: false
      }
    });
    persist();
    render();
  }

  async function handleAction(event) {
    const button = event.target.closest("[data-onboarding-action]");
    if (!button || interactionInFlight || button.disabled) return;

    const action = button.dataset.onboardingAction;
    const stateBeforeAction = store.getState();
    interactionInFlight = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    root.dataset.viewState = "busy";
    setFeedback(t("onboarding.busy"), "status");

    try {
      if (action === "start") {
        setOnboardingStep("identity", { startedAt: Date.now() });
      } else if (action === "skip-identity") {
        saveIdentity(true);
      } else if (action === "save-identity") {
        saveIdentity(false);
      } else if (action === "guidance-next") {
        // status 維持 "guidance"（bond 不是白名單 status 值）；guidanceCompleted=true
        // 讓 resolveStep 推導出 bond 步，中斷 reload 也會安全回到這裡。
        setOnboardingStep("guidance", { guidanceCompleted: true });
        render();
      } else if (action === "bond-choose") {
        await chooseBond(button.dataset.bondId);
      } else if (action === "complete") {
        await completeOnboarding();
      } else {
        throw new Error(`Unsupported onboarding action: ${action || "missing"}`);
      }
      root.dataset.viewState = "completed";
      setFeedback("", "status");
    } catch (error) {
      console.warn("First-session onboarding action did not complete", { action, error });
      store.replaceState(stateBeforeAction);
      render();
      root.dataset.viewState = "recoverable-error";
      setFeedback(t("onboarding.recoverableError"), "alert");
    } finally {
      interactionInFlight = false;
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  }

  function ensureFeedback() {
    if (feedbackEl || !shell) return;
    feedbackEl = document.createElement("p");
    feedbackEl.className = "onboarding-feedback";
    feedbackEl.hidden = true;
    shell.appendChild(feedbackEl);
  }

  function setFeedback(message, role) {
    ensureFeedback();
    if (!feedbackEl) return;
    feedbackEl.hidden = !message;
    feedbackEl.textContent = message;
    feedbackEl.setAttribute("role", role);
    feedbackEl.setAttribute("aria-live", role === "alert" ? "assertive" : "polite");
  }

  // 初遇定情（CH-3 嚴格模型）：fresh 玩家「選後即唯一」——unlocked=[選定者]，
  // 未選者是「未走的那條人生」，章節中再遇見；veteran（restart 重看引導、已有
  // 遊玩痕跡）用聯集，不沒收已解鎖。判據與 store 的 veteran heuristic 同源。
  async function chooseBond(companionId) {
    const choice = INITIAL_BOND_CHOICES.find((entry) => entry.id === companionId);
    if (!choice) return;
    const state = store.getState();
    const unlocked = Array.isArray(state.unlockedCompanionIds) ? state.unlockedCompanionIds : [];
    const nextUnlocked = isVeteranSave(state)
      ? (unlocked.includes(companionId) ? unlocked : [...unlocked, companionId])
      : [companionId];
    store.setState({
      activeCompanionId: companionId,
      unlockedCompanionIds: nextUnlocked,
      onboarding: {
        ...state.onboarding,
        status: "meet"
      }
    });
    // Presentation state is deliberately ephemeral. Persist the recoverable
    // destination first so reload/pagehide during the flourish resumes at meet.
    persist();
    render();
    try {
      await onBondChosen?.(companionId);
    } catch (error) {
      console.warn("initial bond swap failed; companion will load on next boot", error);
    }
    await firstResonance.play(companionId);
  }

  function saveIdentity(skipIdentity) {
    const state = store.getState();
    const now = Date.now();
    const displayName = skipIdentity ? "" : normalizeDisplayName(nameInput?.value || "");

    store.setState({
      playerProfile: {
        ...state.playerProfile,
        displayName,
        identitySkipped: skipIdentity || displayName.length === 0,
        createdAt: state.playerProfile?.createdAt || now,
        updatedAt: now
      },
      onboarding: {
        ...state.onboarding,
        status: "guidance",
        startedAt: state.onboarding?.startedAt || now,
        identityCompleted: true
      }
    });
    persist();
  }

  function setOnboardingStep(step, patch = {}) {
    const state = store.getState();
    store.setState({
      onboarding: {
        ...state.onboarding,
        ...patch,
        status: step
      }
    });
    persist();
  }

  async function completeOnboarding() {
    await prepareSceneReveal?.();
    const state = store.getState();
    const now = Date.now();
    const chatHistory = Array.isArray(state.chatHistory) ? state.chatHistory : [];

    store.setState({
      firstSessionOpeningSeenAt: state.firstSessionOpeningSeenAt || now,
      onboarding: {
        ...state.onboarding,
        status: "completed",
        completed: true,
        completedAt: state.onboarding?.completedAt || now,
        startedAt: state.onboarding?.startedAt || now,
        identityCompleted: true,
        guidanceCompleted: true,
        greyshadeMetAt: state.onboarding?.greyshadeMetAt || now
      },
      chatHistory: [
        ...chatHistory,
        { role: "companion", text: FINAL_GREETING }
      ].slice(-24)
    });
    persist();
  }

  function markStarted(state) {
    if (state.onboarding?.startedAt || markingStarted) return;
    markingStarted = true;
    const stateBeforeStart = store.getState();
    try {
      store.setState({
        onboarding: {
          ...state.onboarding,
          startedAt: Date.now()
        }
      });
      persist();
    } catch (error) {
      console.warn("First-session start marker was not saved", error);
      store.replaceState(stateBeforeStart);
      root.dataset.viewState = "recoverable-error";
      setFeedback(t("onboarding.recoverableError"), "alert");
    } finally {
      markingStarted = false;
    }
  }

  function showStep(step, state) {
    root.dataset.currentStep = step;
    if (shell) shell.dataset.onboardingStep = step;
    steps.forEach((stepEl) => {
      const isActiveStep = stepEl.dataset.step === step;
      stepEl.classList.toggle("is-active", isActiveStep);
      stepEl.hidden = !isActiveStep;
    });
    // meet 標題跟著定情對象走（從 state 取，reload 也正確；i18n 動態化留給內容翻譯包）。
    if (step === "meet") {
      const companion = getCompanionById(state?.activeCompanionId || store.getState().activeCompanionId);
      const meetTitle = qs("#onboarding-meet-title");
      if (meetTitle && companion?.name) {
        meetTitle.textContent = `${companion.name}在月湖邊等你。`;
      }
    }
    // BGM／場景旁路：只在步驟真的變了才通知，避免 render 重入重播。
    if (step && step !== lastAnnouncedStep) {
      lastAnnouncedStep = step;
      try {
        onStepShown?.(step, state);
      } catch (error) {
        console.warn("[onboarding] onStepShown failed", error);
      }
    }
  }

  // 初遇定情步（動態建立，不動 index.html）：插在 guidance 步之後。
  function ensureBondStep() {
    if (!root || root.querySelector('[data-step="bond"]')) return;
    const guidanceStep = root.querySelector('[data-step="guidance"]');
    if (!guidanceStep) return;

    const section = document.createElement("section");
    section.className = "onboarding-step";
    section.dataset.step = "bond";
    section.hidden = true;
    section.setAttribute("aria-labelledby", "onboarding-bond-title");

    const cards = INITIAL_BOND_CHOICES.map((choice) => {
      const companion = getCompanionById(choice.id);
      const name = companion?.name || choice.id;
      const temperament = companion?.temperament?.zh || "";
      return (
        `<button type="button" class="bond-card" data-onboarding-action="bond-choose" data-bond-id="${choice.id}" style="--bond-hue:${choice.hue}">` +
        `<span class="bond-card-glow" aria-hidden="true"></span>` +
        `<img class="bond-card-portrait" src="${companion?.image || ""}" alt="" aria-hidden="true">` +
        `<span class="bond-card-copy">` +
          `<strong>${name}</strong>` +
          `<em>${temperament}</em>` +
          `<p>${choice.line}</p>` +
        `</span>` +
        `</button>`
      );
    }).join("");

    section.innerHTML =
      '<p class="onboarding-kicker">Initial Bond</p>' +
      '<h2 id="onboarding-bond-title">三道初醒的心核光，在月湖邊亮著。</h2>' +
      '<p class="onboarding-copy">你選擇走近誰，誰就成為你的開始。未選的，會在旅途中再遇見。</p>' +
      `<div class="bond-choice-list">${cards}</div>`;

    guidanceStep.after(section);
    steps = qsa(".onboarding-step", root);
  }

  function persist() {
    const result = saveCurrentState?.();
    if (result?.ok === false) {
      const error = new Error("First-session state was not saved");
      error.code = "SAVE_FAILED";
      error.cause = result.error;
      throw error;
    }
    return result;
  }

  return {
    bind,
    render,
    isActive,
    restart
  };
}

function resolveStep(status, onboarding = {}) {
  // bond 步不是持久化 status：guidance 完成但尚未定情（status 仍為 guidance）→ 顯示 bond。
  if (status === "guidance" && onboarding.guidanceCompleted) return "bond";
  return STEP_ORDER.includes(status) ? status : "start";
}

function normalizeDisplayName(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 32);
}
