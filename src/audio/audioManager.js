import { ASSET_MANIFEST } from "../data/assetManifest.js";
import { resolveBgmScene, BGM_SCENE } from "../data/bgmRegistry.js";

const MAX_BGM_VOLUME = 0.42;
const FADE_MS = 700;
const FADE_INTERVAL_MS = 50;

/* =========================================================================
   SFX（TP-6）：Web Audio 程序化合成，零資產。API：playSfx(name)
   ========================================================================= */
const SFX_DEFS = Object.freeze({
  touch_accept: { gain: 0.5, tones: [{ f: 880, t: 0, d: 0.14 }, { f: 1174.7, t: 0.09, d: 0.22 }] },
  touch_guarded: { gain: 0.3, tones: [{ f: 440, t: 0, d: 0.16, type: "triangle" }] },
  touch_refusal: { gain: 0.28, tones: [{ f: 196, t: 0, d: 0.3, a: 0.03 }] },
  touch_calm: { gain: 0.26, tones: [{ f: 523.3, t: 0, d: 0.18 }] },
  soul_send: { gain: 0.22, tones: [{ f: 1568, t: 0, d: 0.05 }] },
  soul_reply: { gain: 0.3, tones: [{ f: 523.3, t: 0, d: 0.2 }, { f: 784, t: 0.07, d: 0.26 }] },
  trace_bloom: {
    gain: 0.34,
    tones: [
      { f: 659.3, t: 0, d: 0.16 },
      { f: 987.8, t: 0.1, d: 0.18 },
      { f: 1318.5, t: 0.2, d: 0.3 }
    ]
  },
  initiative_breath: { gain: 0.24, tones: [{ f: 587.3, t: 0, d: 0.5, a: 0.18 }] },
  standoff_action: { gain: 0.3, tones: [{ f: 98, t: 0, d: 0.22 }, { f: 196, t: 0.02, d: 0.16 }] },
  standoff_retreat: { gain: 0.26, tones: [{ f: 392, t: 0, d: 0.2 }, { f: 293.7, t: 0.12, d: 0.28 }] }
});
const SFX_THROTTLE_MS = 120;

function createAudioElement(src) {
  const audio = new Audio(src || ASSET_MANIFEST.audio?.bgm || "");
  audio.preload = "none";
  audio.loop = true;
  audio.volume = 0;
  return audio;
}

function createAudioManager() {
  let isMuted = false;
  let isUnlocked = false;
  let hasRegisteredUnlock = false;
  let masterVolume = 0.8;
  let bgmVolume = 0.7;
  let sfxVolume = 0.8;
  let sfxContext = null;
  const sfxLastPlayedAt = {};

  let pendingSceneId = BGM_SCENE.START;
  let activeSceneId = null;
  let activeSrc = null;
  let currentAudio = createAudioElement(resolveBgmScene(BGM_SCENE.START)?.src);
  let fadeTimerId = null;
  let transitionToken = 0;
  let visibilityBound = false;
  let wasPlayingBeforeHide = false;

  function initUnlock() {
    if (hasRegisteredUnlock || isUnlocked || typeof document === "undefined") return;
    hasRegisteredUnlock = true;
    document.addEventListener("click", unlockAudio, { once: true, capture: true });
    document.addEventListener("touchstart", unlockAudio, { once: true, capture: true });
    bindVisibility();
  }

  function bindVisibility() {
    if (visibilityBound || typeof document === "undefined") return;
    visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        wasPlayingBeforeHide = Boolean(currentAudio && !currentAudio.paused);
        // 不啟動新曲；暫停以免背景雙播／耗電。回來再依 pending/active 恢復。
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
        }
        return;
      }
      if (!isUnlocked || isMuted || !wasPlayingBeforeHide) return;
      requestBgmScene(activeSceneId || pendingSceneId, { forceRestart: false });
    });
  }

  function unlockAudio() {
    if (isUnlocked) return;
    isUnlocked = true;
    if (!isMuted) {
      requestBgmScene(pendingSceneId || BGM_SCENE.START, { forceRestart: true });
    }
  }

  function toggleMute() {
    return setMuted(!isMuted);
  }

  function setMuted(nextMuted) {
    isMuted = Boolean(nextMuted);
    stopFade();
    if (isMuted) {
      if (currentAudio) {
        currentAudio.volume = 0;
        currentAudio.pause();
      }
      return isMuted;
    }
    if (isUnlocked) {
      requestBgmScene(activeSceneId || pendingSceneId || BGM_SCENE.START, { forceRestart: false });
    }
    return isMuted;
  }

  /** @deprecated Prefer requestBgmScene — kept for older callers. */
  function playBGM() {
    requestBgmScene(activeSceneId || pendingSceneId || BGM_SCENE.START, { forceRestart: false });
  }

  /**
   * Semantic BGM entry. Safe before unlock (stores pending).
   * Same src + already playing → no restart.
   */
  function requestBgmScene(sceneId, { forceRestart = false } = {}) {
    const resolved = resolveBgmScene(sceneId) || resolveBgmScene(BGM_SCENE.FALLBACK);
    if (!resolved?.src) return false;
    pendingSceneId = resolved.sceneId;

    if (!isUnlocked) return false;
    if (isMuted) {
      activeSceneId = resolved.sceneId;
      activeSrc = resolved.src;
      return false;
    }

    if (!forceRestart && activeSrc === resolved.src && currentAudio && !currentAudio.paused) {
      activeSceneId = resolved.sceneId;
      applyVolumeNow(currentAudio);
      return true;
    }

    return transitionToSrc(resolved.sceneId, resolved.src);
  }

  function transitionToSrc(sceneId, src) {
    const token = ++transitionToken;
    stopFade();

    const next = createAudioElement(src);
    next.loop = true;
    const previous = currentAudio;

    // 立即掛上新曲（音量 0），舊曲淡出／新曲淡入；過期 token 不得覆寫。
    currentAudio = next;
    activeSceneId = sceneId;
    activeSrc = src;

    const target = getTargetBgmVolume();
    const startPlay = next.play();
    if (startPlay && typeof startPlay.catch === "function") {
      startPlay.catch((error) => {
        if (error?.name === "NotAllowedError") return;
        if (token !== transitionToken) return;
        console.warn("[BGM] playback failed", src, error);
      });
    }

    const startedAt = Date.now();
    fadeTimerId = setInterval(() => {
      if (token !== transitionToken) {
        stopFade();
        return;
      }
      if (isMuted) {
        next.volume = 0;
        next.pause();
        if (previous && previous !== next) {
          previous.pause();
          previous.src = "";
        }
        stopFade();
        return;
      }

      const progress = Math.min((Date.now() - startedAt) / FADE_MS, 1);
      next.volume = progress * target;
      if (previous && previous !== next) {
        previous.volume = Math.max(0, (1 - progress) * target);
      }

      if (progress >= 1) {
        next.volume = target;
        if (previous && previous !== next) {
          previous.pause();
          try {
            previous.removeAttribute("src");
            previous.load();
          } catch {
            /* ignore */
          }
        }
        stopFade();
      }
    }, FADE_INTERVAL_MS);

    return true;
  }

  function applyVolumeNow(audio) {
    if (!audio) return;
    if (isMuted || !isUnlocked) {
      audio.volume = 0;
      return;
    }
    const target = getTargetBgmVolume();
    audio.volume = target;
    if (target <= 0.0001) {
      audio.pause();
      return;
    }
    if (audio.paused) {
      audio.play().catch((error) => {
        if (error?.name === "NotAllowedError") return;
        console.warn("[BGM] resume failed", error);
      });
    }
  }

  function setVolume(settings = {}) {
    if (Number.isFinite(settings.master)) masterVolume = clampVolume(settings.master);
    if (Number.isFinite(settings.bgm)) bgmVolume = clampVolume(settings.bgm);
    if (Number.isFinite(settings.sfx)) sfxVolume = clampVolume(settings.sfx);

    stopFade();
    if (isMuted) {
      if (currentAudio) currentAudio.volume = 0;
      return;
    }
    if (!isUnlocked) return;
    applyVolumeNow(currentAudio);
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

  function stopFade() {
    if (fadeTimerId === null) return;
    clearInterval(fadeTimerId);
    fadeTimerId = null;
  }

  function playSfx(name) {
    const def = SFX_DEFS[name];
    if (!def || isMuted || !isUnlocked) return false;
    if (sfxVolume <= 0 || masterVolume <= 0) return false;

    const now = Date.now();
    if (now - (sfxLastPlayedAt[name] || 0) < SFX_THROTTLE_MS) return false;
    sfxLastPlayedAt[name] = now;

    try {
      const ctx = ensureSfxContext();
      if (!ctx) return false;
      if (ctx.state === "suspended") ctx.resume();

      const level = def.gain * sfxVolume * masterVolume;
      def.tones.forEach((tone) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.type || "sine";
        osc.frequency.value = tone.f;
        const start = ctx.currentTime + (tone.t || 0);
        const attack = tone.a || 0.008;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(level, start + attack);
        gain.gain.exponentialRampToValueAtTime(0.0005, start + tone.d);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + tone.d + 0.05);
      });
      return true;
    } catch {
      return false;
    }
  }

  function ensureSfxContext() {
    if (sfxContext) return sfxContext;
    const Ctx = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
    if (!Ctx) return null;
    sfxContext = new Ctx();
    return sfxContext;
  }

  return {
    initUnlock,
    toggleMute,
    setMuted,
    playBGM,
    requestBgmScene,
    playSfx,
    setVolume,
    getVolumeSettings,
    getPendingSceneId: () => pendingSceneId,
    getActiveSceneId: () => activeSceneId,
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

export const AudioManager = createAudioManager();
export default AudioManager;
