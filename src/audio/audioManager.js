const MAX_BGM_VOLUME = 0.42;
const FADE_IN_DURATION_MS = 2000;
const FADE_INTERVAL_MS = 50;

const bgmAudio = new Audio("./assets/audio/nexus-core_-ethereal-lakefron.mp3");
bgmAudio.loop = true;
bgmAudio.volume = 0;

function createAudioManager() {
  let isMuted = false;
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

    if (isMuted) {
      stopFadeIn();
      bgmAudio.volume = 0;
      bgmAudio.pause();
      return isMuted;
    }

    if (isUnlocked) {
      bgmAudio.volume = MAX_BGM_VOLUME;
      bgmAudio.play().catch(console.warn);
    }

    return isMuted;
  }

  function playBGM() {
    if (isMuted || !isUnlocked) {
      return;
    }

    stopFadeIn();
    bgmAudio.volume = 0;
    bgmAudio.play().catch(console.warn);
    fadeInVolume();
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

export const AudioManager = createAudioManager();
export default AudioManager;
