import AudioManager from "../audio/audioManager.js";
import { qs, qsa } from "../utils/dom.js";

// data-settings-range key → state.settings 欄位
const VOLUME_FIELD = { master: "volMaster", bgm: "volBgm", sfx: "volSfx" };

export function createSettingsController({ panelManager, restartOnboarding, store, saveSettings } = {}) {
  const panel = qs('[data-panel="settings"]');
  const settingsToggleButton = qs("#btn-settings-toggle");
  const panelLayer = qs(".panel-layer");

  function getSettings() {
    return (store && store.getState().settings) || {};
  }

  // 寫回既有 save state（不新增 localStorage key；持久化由 saveManager 走 STORAGE_KEY）。
  function patchSettings(patch) {
    if (!store) return;
    const current = store.getState().settings || {};
    store.setState({ settings: { ...current, ...patch } });
    saveSettings?.();
  }

  // 套用到 runtime：音量走既有 AudioManager.setVolume；低動態/畫質/文字大小寫 root dataset
  // （低動態沿用既有 reducedMotionPreference 標記；畫質/文字大小目前為持久化標記，視覺套用另案）。
  function applyToRuntime(settings = getSettings()) {
    AudioManager.setVolume?.({
      master: Number(settings.volMaster),
      bgm: Number(settings.volBgm),
      sfx: Number(settings.volSfx)
    });
    const root = document.documentElement;
    root.dataset.reducedMotionPreference = settings.lowMotion ? "reduced" : "standard";
    root.dataset.textSize = settings.textSize || "medium";
    root.dataset.quality = settings.quality || "high";
  }

  function bind() {
    if (!panel) return;
    panel.addEventListener("input", handleInput);
    panel.addEventListener("click", handleClick);
    observePanelState();
    syncControlsFromState();
    applyToRuntime();
  }

  function open() {
    syncControlsFromState();
    panelManager?.openPanel("settings");
    settingsToggleButton?.setAttribute("aria-expanded", "true");
  }

  function handleInput(event) {
    const range = event.target.closest("[data-settings-range]");
    if (!range) return;
    const field = VOLUME_FIELD[range.dataset.settingsRange];
    if (!field) return;
    const value = Number(range.value);
    const output = panel.querySelector(`[data-settings-output="${range.dataset.settingsRange}"]`);
    if (output) output.textContent = range.value;
    AudioManager.setVolume?.({ [range.dataset.settingsRange]: value });
    patchSettings({ [field]: value });
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
      // 靜音維持既有獨立 key（nexusLinkAudioMuted:v1），不併入 settings schema。
      const isMuted = AudioManager.toggleMute();
      button.setAttribute("aria-pressed", String(!isMuted));
      return;
    }
    if (action === "toggle-motion") {
      const nextLowMotion = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(nextLowMotion));
      patchSettings({ lowMotion: nextLowMotion });
      applyToRuntime();
      return;
    }
    if (action === "restart-onboarding") {
      panelManager?.closePanel({ force: true });
      restartOnboarding?.();
    }
  }

  function selectSegment(button) {
    const group = button.dataset.settingsSegment;
    const value = button.dataset.value;
    qsa(`[data-settings-segment="${group}"]`, panel).forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    if (group === "quality" || group === "textSize") {
      patchSettings({ [group]: value });
      applyToRuntime();
    }
  }

  function syncControlsFromState() {
    if (!panel) return;
    const settings = getSettings();

    qsa("[data-settings-range]", panel).forEach((range) => {
      const field = VOLUME_FIELD[range.dataset.settingsRange];
      if (field && settings[field] != null) range.value = String(settings[field]);
      const output = panel.querySelector(`[data-settings-output="${range.dataset.settingsRange}"]`);
      if (output) output.textContent = range.value;
    });

    syncSegment("quality", settings.quality);
    syncSegment("textSize", settings.textSize);

    const motionButton = qs('[data-settings-action="toggle-motion"]', panel);
    motionButton?.setAttribute("aria-pressed", String(Boolean(settings.lowMotion)));

    syncAudioToggle();
  }

  function syncSegment(group, value) {
    qsa(`[data-settings-segment="${group}"]`, panel).forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.value === value));
    });
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
