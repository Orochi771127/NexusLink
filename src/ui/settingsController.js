import AudioManager from "../audio/audioManager.js";
import { qs, qsa } from "../utils/dom.js";
import { clearState, exportSaveData, STORAGE_KEY } from "../state/saveManager.js";
import { exportTranscriptData } from "../ai/dialogue/soulTalkTranscriptJournal.js";
import { applyLanguage } from "../i18n/i18n.js";
import { loginWithGoogle, logout, onAuthStateChanged } from "../auth/authManager.js";
import { pullState, pushState } from "../auth/cloudSync.js";

// data-settings-range key → state.settings 欄位
const VOLUME_FIELD = { master: "volMaster", bgm: "volBgm", sfx: "volSfx" };
// 拖動音效滑桿時給極輕預覽，讓玩家立刻聽到「音效音量有作用」。
const SFX_PREVIEW_THROTTLE_MS = 220;
let lastSfxPreviewAt = 0;

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

  /**
   * 把設定套到 runtime：
   * - 音量 → AudioManager（BGM／SFX 即時）
   * - 低動態／文字大小／畫質 → html dataset（CSS + Pixi 輕量讀取）
   */
  function applyToRuntime(settings = getSettings()) {
    AudioManager.setVolume?.({
      master: Number(settings.volMaster),
      bgm: Number(settings.volBgm),
      sfx: Number(settings.volSfx)
    });
    AudioManager.setMuted?.(Boolean(settings.audioMuted));
    const root = document.documentElement;
    root.dataset.reducedMotionPreference = settings.lowMotion ? "reduced" : "standard";
    root.dataset.textSize = settings.textSize || "medium";
    root.dataset.quality = settings.quality || "high";
    document.body?.classList.toggle("is-low-motion", Boolean(settings.lowMotion));
  }

  function bind() {
    if (!panel) return;
    panel.addEventListener("input", handleInput);
    panel.addEventListener("change", handleInput);
    panel.addEventListener("click", handleClick);
    observePanelState();
    syncControlsFromState();
    applyToRuntime();
    applyLanguage(getSettings().lang || "tc");
    bindAuth();
  }

  function bindAuth() {
    if (!panel) return;
    onAuthStateChanged((user) => {
      const statusText = qs("#settings-account-status", panel);
      const btnLogin = qs('[data-settings-action="login-google"]', panel);
      const btnLogout = qs('[data-settings-action="logout"]', panel);
      
      if (!statusText || !btnLogin || !btnLogout) return;

      if (user) {
        statusText.textContent = `已綁定帳號：${user.email || 'Google User'}`;
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'inline-block';
      } else {
        statusText.textContent = "目前未登入，存檔僅保存在此裝置中。";
        btnLogin.style.display = 'inline-block';
        btnLogout.style.display = 'none';
      }
    });
  }

  function open() {
    syncControlsFromState();
    applyToRuntime();
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

    // 即時寫入 AudioManager；完整三軌再走一次，避免只改單軌時其餘不同步。
    const nextPatch = { [field]: value };
    const merged = { ...getSettings(), ...nextPatch };
    AudioManager.setVolume?.({
      master: Number(merged.volMaster),
      bgm: Number(merged.volBgm),
      sfx: Number(merged.volSfx)
    });
    patchSettings(nextPatch);

    // 音效滑桿：節流預覽一聲，證明 SFX 音量真的有接上。
    if (range.dataset.settingsRange === "sfx") {
      previewSfxVolume();
    }
  }

  function previewSfxVolume() {
    const now = Date.now();
    if (now - lastSfxPreviewAt < SFX_PREVIEW_THROTTLE_MS) return;
    lastSfxPreviewAt = now;
    AudioManager.playSfx?.("touch_calm");
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
      patchSettings({ audioMuted: isMuted });
      // aria-pressed=true 表示「聲音開啟中」
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
      return;
    }
    if (action === "export-save") {
      exportSave();
      return;
    }
    if (action === "export-transcript") {
      exportTranscript();
      return;
    }
    if (action === "delete-save") {
      deleteSave();
      return;
    }
    if (action === "login-google") {
      handleLogin();
      return;
    }
    if (action === "logout") {
      logout();
      return;
    }
  }

  async function handleLogin() {
    const res = await loginWithGoogle();
    if (res && res.ok) {
      // 登入成功後，檢查雲端是否有更新的存檔
      const syncRes = await pullState();
      if (syncRes.ok && syncRes.data) {
        const localState = store ? store.getState() : {};
        const localTime = localState.lastSeenAt || 0;
        
        // Firestore Timestamp 轉毫秒
        const cloudTime = syncRes.serverTimestamp 
            ? (syncRes.serverTimestamp.seconds * 1000 + syncRes.serverTimestamp.nanoseconds / 1000000)
            : localTime + 1; // Fallback to always prompt if server format differs
            
        if (cloudTime > localTime) {
          const confirmed = window.confirm("發現雲端有更新的存檔，是否要將雲端進度同步至此裝置？\n(若選擇取消，則會以目前裝置的進度覆蓋雲端)");
          if (confirmed) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(syncRes.data));
            window.location.reload();
            return;
          }
        }
      }
      
      // 若雲端無存檔，或是玩家拒絕下載雲端，則以本地為主推上去
      if (store) {
        pushState(store.getState());
      }
    }
  }

  // 匯出存檔：玩家自行下載 JSON（client 端、不上傳）。
  function exportSave() {
    const data = exportSaveData();
    if (!data) return;
    try {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexuslink-save-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Export save failed", error);
    }
  }

  // 匯出心語對話 journal：結構化問／答＋學習桶，供 Owner 離線複查（不上傳、不自動訓練）。
  function exportTranscript() {
    const data = exportTranscriptData();
    if (!data) return;
    try {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexuslink-soul-talk-transcript-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Export transcript failed", error);
    }
  }

  // 刪除存檔：清空本機存檔 → reload，自然回到開場 → 輸入名字 → 導引 → 遊戲。需玩家二次確認。
  function deleteSave() {
    const confirmed = window.confirm(
      "確定要刪除這台裝置上的存檔嗎？\n記憶與痕跡會清空，回到最開始的開場流程，無法復原。"
    );
    if (!confirmed) return;
    clearState();
    window.location.reload();
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
    if (group === "language") {
      patchSettings({ lang: value });
      applyLanguage(value);
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
    syncSegment("language", settings.lang);

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
    audioButton?.setAttribute("aria-pressed", String(!Boolean(getSettings().audioMuted)));
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
    open,
    applyToRuntime
  };
}
