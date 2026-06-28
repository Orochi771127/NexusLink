import { ASSET_MANIFEST } from "../data/assetManifest.js";

const MAX_BGM_VOLUME = 0.42;
const FADE_IN_DURATION_MS = 2000;
const FADE_INTERVAL_MS = 50;
const MUTE_STORAGE_KEY = "nexusLinkAudioMuted:v1";

const bgmAudio = new Audio(ASSET_MANIFEST.audio.bgm);
// 首屏不需要聲音：preload="none" 讓瀏覽器（尤其 iOS/mobile）不要在啟動時就預抓 BGM；
// 第一次 unlock（click/touch）後 playBGM() 的 .play() 會即時載入。不改資產、不改路徑、mute key 不變。
bgmAudio.preload = "none";
bgmAudio.loop = true;
bgmAudio.volume = 0;

function createAudioManager() {
  let isMuted = readStoredMuteState();
  let isUnlocked = false;
  let hasRegisteredUnlock = false;
  let fadeIntervalId = null;
  let masterVolume = 0.8;
  let bgmVolume = 0.7;
  let sfxVolume = 0.8;

  function initUnlock() {
    if (hasRegisteredUnlock || isUnlocked || typeof document === "undefined") {
      return;
    }

    hasRegisteredUnlock = true;
    document.addEventListener("click", unlockAudio, { once: true, capture: true });
    document.addEventListener("touchstart", unlockAudio, { once: true, capture: true });
  }

  function unlockAudio() {
    if (isUnlocked) return;

    isUnlocked = true;
    if (!isMuted) {
      playBGM();
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    writeStoredMuteState(isMuted);

    if (isMuted) {
      stopFadeIn();
      bgmAudio.volume = 0;
      bgmAudio.pause();
      return isMuted;
    }

    if (isUnlocked) {
      bgmAudio.volume = getTargetBgmVolume();
      safePlay();
    }

    return isMuted;
  }

  function playBGM() {
    if (isMuted || !isUnlocked) {
      return;
    }

    stopFadeIn();
    bgmAudio.volume = 0;
    safePlay();
    fadeInVolume();
  }

  function setVolume(settings = {}) {
    if (Number.isFinite(settings.master)) {
      masterVolume = clampVolume(settings.master);
    }
    if (Number.isFinite(settings.bgm)) {
      bgmVolume = clampVolume(settings.bgm);
    }
    if (Number.isFinite(settings.sfx)) {
      sfxVolume = clampVolume(settings.sfx);
    }

    if (!isMuted && isUnlocked) {
      bgmAudio.volume = getTargetBgmVolume();
      if (!bgmAudio.paused) safePlay();
    }
  }

  function getVolumeSettings() {
    return {
      master: Math.round(masterVolume * 100),
      bgm: Math.round(bgmVolume * 100),
      sfx: Math.round(sfxVolume * 100)
    };
  }

  function getTargetBgmVolume() {
    return MAX_BGM_VOLUME * masterVolume * bgmVolume;
  }

  function safePlay() {
    bgmAudio.play().catch((error) => {
      if (error?.name === "NotAllowedError") return;
      console.warn("BGM playback failed", error);
    });
  }

  function fadeInVolume() {
    const startTime = Date.now();

    fadeIntervalId = setInterval(() => {
      if (isMuted) {
        bgmAudio.volume = 0;
        stopFadeIn();
        return;
      }

      const targetVolume = getTargetBgmVolume();
      const progress = Math.min((Date.now() - startTime) / FADE_IN_DURATION_MS, 1);
      bgmAudio.volume = Math.min(progress * targetVolume, targetVolume);

      if (progress >= 1) {
        bgmAudio.volume = targetVolume;
        stopFadeIn();
      }
    }, FADE_INTERVAL_MS);
  }

  function stopFadeIn() {
    if (fadeIntervalId === null) return;

    clearInterval(fadeIntervalId);
    fadeIntervalId = null;
  }

  return {
    initUnlock,
    toggleMute,
    playBGM,
    setVolume,
    getVolumeSettings,
    get isMuted() {
      return isMuted;
    },
    get isUnlocked() {
      return isUnlocked;
    }
  };
}

function clampVolume(value) {
  const normalized = value > 1 ? value / 100 : value;
  return Math.min(Math.max(normalized, 0), 1);
}

function readStoredMuteState() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredMuteState(isMuted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  } catch (error) {
    console.warn("Failed to save audio mute state", error);
  }
}

export const AudioManager = createAudioManager();
export default AudioManager;
