import { qs, qsa } from "../utils/dom.js";

const STEP_ORDER = ["start", "identity", "guidance", "meet"];
const FINAL_GREETING = "我在這裡。你可以慢慢靠近，也可以先只是看著月湖。";

export function createOnboardingController({ store, saveCurrentState } = {}) {
  const root = qs("#onboarding-root");
  const shell = root?.querySelector(".onboarding-shell");
  const steps = root ? qsa(".onboarding-step", root) : [];
  const nameInput = qs("#player-display-name");
  let activeStep = "start";

  function bind() {
    if (!root) return;
    root.addEventListener("click", handleAction);
    nameInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveIdentity(false);
      }
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

    const storedName = state.playerProfile?.displayName || "";
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = storedName;
    }

    activeStep = resolveStep(state.onboarding?.status);
    showStep(activeStep);
    markStarted(state);
  }

  function isActive() {
    return Boolean(root && !root.hidden);
  }

  function handleAction(event) {
    const button = event.target.closest("[data-onboarding-action]");
    if (!button) return;

    const action = button.dataset.onboardingAction;
    if (action === "start") {
      setOnboardingStep("identity", { startedAt: Date.now() });
    } else if (action === "skip-identity") {
      saveIdentity(true);
    } else if (action === "save-identity") {
      saveIdentity(false);
    } else if (action === "guidance-next") {
      setOnboardingStep("meet", { guidanceCompleted: true });
    } else if (action === "complete") {
      completeOnboarding();
    }
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

  function completeOnboarding() {
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
    if (state.onboarding?.startedAt) return;
    store.setState({
      onboarding: {
        ...state.onboarding,
        startedAt: Date.now()
      }
    });
    persist();
  }

  function showStep(step) {
    if (shell) shell.dataset.onboardingStep = step;
    steps.forEach((stepEl) => {
      const isActiveStep = stepEl.dataset.step === step;
      stepEl.classList.toggle("is-active", isActiveStep);
      stepEl.hidden = !isActiveStep;
    });
  }

  function persist() {
    saveCurrentState?.();
  }

  return {
    bind,
    render,
    isActive
  };
}

function resolveStep(status) {
  return STEP_ORDER.includes(status) ? status : "start";
}

function normalizeDisplayName(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 32);
}
