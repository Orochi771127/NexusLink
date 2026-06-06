const BGM_SOURCE = "./assets/audio/bgm_lakefront.mp3";
const FADE_IN_DURATION_MS = 2000;

const bgmAudio = new Audio(BGM_SOURCE);
bgmAudio.loop = true;
bgmAudio.volume = 0;

function createAudioManager() {
  let isMuted = false;
  let isUnlocked = false;
  let hasRegisteredUnlock = false;
  let fadeFrameId = null;

  function initUnlock() {
    if (hasRegisteredUnlock || isUnlocked || typeof document === "undefined") {
      return;
    }

    hasRegisteredUnlock = true;
    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("touchstart", unlockAudio, { once: true });
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
      playBGM();
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
    const startTime = performance.now();

    function step(now) {
      if (isMuted) {
        bgmAudio.volume = 0;
        fadeFrameId = null;
        return;
      }

      const progress = Math.min((now - startTime) / FADE_IN_DURATION_MS, 1);
      bgmAudio.volume = progress;

      if (progress < 1) {
        fadeFrameId = requestAnimationFrame(step);
        return;
      }

      fadeFrameId = null;
    }

    fadeFrameId = requestAnimationFrame(step);
  }

  function stopFadeIn() {
    if (fadeFrameId === null) return;

    cancelAnimationFrame(fadeFrameId);
    fadeFrameId = null;
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
