import { ASSET_MANIFEST } from "../data/assetManifest.js";

const MAX_BGM_VOLUME = 0.42;
const FADE_IN_DURATION_MS = 2000;
const FADE_INTERVAL_MS = 50;
const MUTE_STORAGE_KEY = "nexusLinkAudioMuted:v1";

const bgmAudio = new Audio(ASSET_MANIFEST.audio.bgm);
bgmAudio.loop = true;
bgmAudio.volume = 0;

function createAudioManager() {
  let isMuted = readStoredMuteState();
  let isUnlocked = false;
  let hasRegisteredUnlock = false;
  let fadeIntervalId = null;

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
      bgmAudio.volume = MAX_BGM_VOLUME;
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

      const progress = Math.min((Date.now() - startTime) / FADE_IN_DURATION_MS, 1);
      bgmAudio.volume = Math.min(progress * MAX_BGM_VOLUME, MAX_BGM_VOLUME);

      if (progress >= 1) {
        bgmAudio.volume = MAX_BGM_VOLUME;
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
    get isMuted() {
      return isMuted;
    },
    get isUnlocked() {
      return isUnlocked;
    }
  };
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
