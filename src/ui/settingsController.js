import AudioManager from "../audio/audioManager.js";
import { qs, qsa } from "../utils/dom.js";

export function createSettingsController({ panelManager, restartOnboarding } = {}) {
  const panel = qs('[data-panel="settings"]');
  const settingsToggleButton = qs("#btn-settings-toggle");
  const panelLayer = qs(".panel-layer");

  function bind() {
    if (!panel) return;
    panel.addEventListener("input", handleInput);
    panel.addEventListener("click", handleClick);
    observePanelState();
    syncAudioRanges();
    syncOutputs();
    syncAudioToggle();
  }

  function open() {
    syncAudioRanges();
    syncOutputs();
    syncAudioToggle();
    panelManager?.openPanel("settings");
    settingsToggleButton?.setAttribute("aria-expanded", "true");
  }

  function handleInput(event) {
    const range = event.target.closest("[data-settings-range]");
    if (!range) return;
    updateAudioVolume(range);
    const output = panel.querySelector(`[data-settings-output="${range.dataset.settingsRange}"]`);
    if (output) output.textContent = range.value;
  }

  function handleClick(event) {
    const actionButton = event.target.closest("[data-settings-action]");
    if (actionButton) {
      handleAction(actionButton);
      return;
    }

    const segmentButton = event.target.closest("[data-settings-segment]");
    if (segmentButton) {
      selectSegment(segmentButton);
    }
  }

  function handleAction(button) {
    const action = button.dataset.settingsAction;
    if (action === "toggle-audio") {
      const isMuted = AudioManager.toggleMute();
      button.setAttribute("aria-pressed", String(!isMuted));
      return;
    }
    if (action === "toggle-motion") {
      const isPressed = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!isPressed));
      document.documentElement.dataset.reducedMotionPreference = isPressed ? "standard" : "reduced";
      return;
    }
    if (action === "restart-onboarding") {
      panelManager?.closePanel({ force: true });
      restartOnboarding?.();
    }
  }

  function selectSegment(button) {
    const group = button.dataset.settingsSegment;
    qsa(`[data-settings-segment="${group}"]`, panel).forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
  }

  function syncOutputs() {
    qsa("[data-settings-range]", panel).forEach((range) => {
      const output = panel.querySelector(`[data-settings-output="${range.dataset.settingsRange}"]`);
      if (output) output.textContent = range.value;
    });
  }

  function syncAudioRanges() {
    const volumeSettings = AudioManager.getVolumeSettings?.();
    if (!volumeSettings) return;
    qsa("[data-settings-range]", panel).forEach((range) => {
      const value = volumeSettings[range.dataset.settingsRange];
      if (value != null) range.value = String(value);
    });
  }

  function updateAudioVolume(range) {
    const key = range.dataset.settingsRange;
    if (!["master", "bgm", "sfx"].includes(key)) return;
    AudioManager.setVolume?.({ [key]: Number(range.value) });
  }

  function syncAudioToggle() {
    const audioButton = qs('[data-settings-action="toggle-audio"]', panel);
    audioButton?.setAttribute("aria-pressed", String(!AudioManager.isMuted));
  }

  function observePanelState() {
    if (!panelLayer || !settingsToggleButton || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      settingsToggleButton.setAttribute(
        "aria-expanded",
        String(panelLayer.dataset.activePanel === "settings")
      );
    });
    observer.observe(panelLayer, { attributes: true, attributeFilter: ["data-active-panel"] });
  }

  return {
    bind,
    open
  };
}
