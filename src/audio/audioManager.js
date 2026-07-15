import { ASSET_MANIFEST } from "../data/assetManifest.js";

const MAX_BGM_VOLUME = 0.42;
const FADE_IN_DURATION_MS = 2000;
const FADE_INTERVAL_MS = 50;

const bgmAudio = new Audio(ASSET_MANIFEST.audio.bgm);
// 首屏不需要聲音：preload="none" 讓瀏覽器（尤其 iOS/mobile）不要在啟動時就預抓 BGM；
// 第一次 unlock（click/touch）後 playBGM() 的 .play() 會即時載入。
bgmAudio.preload = "none";
bgmAudio.loop = true;
bgmAudio.volume = 0;

/* =========================================================================
   SFX（TP-6 感官回饋包 v1）：Web Audio 程序化合成，零資產、零依賴。
   音色哲學＝賽博道教的「輕」：水滴、玻璃風鈴、低頻氣息；全部 <0.6s、低音量。
   換真實錄音資產時只需改 SFX_DEFS/playSfx 實作，呼叫點 API（playSfx(name)）不變。
   紅線：無通知式鈴聲；safety 回合由呼叫端靜音（soulTalkController）。
   ========================================================================= */
const SFX_DEFS = Object.freeze({
  // 觸碰回饋（tone 對映 COMPANION_REACTION_FEEDBACK）
  touch_accept: { gain: 0.5, tones: [{ f: 880, t: 0, d: 0.14 }, { f: 1174.7, t: 0.09, d: 0.22 }] },
  touch_guarded: { gain: 0.3, tones: [{ f: 440, t: 0, d: 0.16, type: "triangle" }] },
  touch_refusal: { gain: 0.28, tones: [{ f: 196, t: 0, d: 0.3, a: 0.03 }] },
  touch_calm: { gain: 0.26, tones: [{ f: 523.3, t: 0, d: 0.18 }] },
  // 心語
  soul_send: { gain: 0.22, tones: [{ f: 1568, t: 0, d: 0.05 }] },
  soul_reply: { gain: 0.3, tones: [{ f: 523.3, t: 0, d: 0.2 }, { f: 784, t: 0.07, d: 0.26 }] },
  // 痕跡微光（首痕與後續 echo 共用；「微光落下」玻璃琶音）
  trace_bloom: { gain: 0.34, tones: [{ f: 659.3, t: 0, d: 0.16 }, { f: 987.8, t: 0.1, d: 0.18 }, { f: 1318.5, t: 0.2, d: 0.3 }] },
  // 夥伴主動微時刻（TP-7）：一聲很輕的氣息鈴
  initiative_breath: { gain: 0.24, tones: [{ f: 587.3, t: 0, d: 0.5, a: 0.18 }] },
  // 對峙：行動＝低頻脈動；撤退＝下行柔音（「懂得離開也是照顧」，不是失敗音）
  standoff_action: { gain: 0.3, tones: [{ f: 98, t: 0, d: 0.22 }, { f: 196, t: 0.02, d: 0.16 }] },
  standoff_retreat: { gain: 0.26, tones: [{ f: 392, t: 0, d: 0.2 }, { f: 293.7, t: 0.12, d: 0.28 }] }
});
const SFX_THROTTLE_MS = 120;

function createAudioManager() {
  let isMuted = false;
  let isUnlocked = false;
  let hasRegisteredUnlock = false;
  let fadeIntervalId = null;
  let masterVolume = 0.8;
  let bgmVolume = 0.7;
  let sfxVolume = 0.8;
  let sfxContext = null;
  const sfxLastPlayedAt = {};

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
    return setMuted(!isMuted);
  }

  function setMuted(nextMuted) {
    isMuted = Boolean(nextMuted);

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

    // 玩家拖動音量時立刻生效：中斷淡入，避免 fade interval 蓋掉新音量。
    stopFadeIn();

    if (isMuted) {
      bgmAudio.volume = 0;
      return;
    }

    const target = getTargetBgmVolume();
    if (!isUnlocked) {
      // 尚未解鎖：只記住目標音量，等第一次點擊再播。
      return;
    }

    if (target <= 0.0001) {
      bgmAudio.volume = 0;
      bgmAudio.pause();
      return;
    }

    bgmAudio.volume = target;
    if (bgmAudio.paused) safePlay();
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

  /** 播一個合成 SFX。靜音 / 未解鎖 / sfx 音量 0 / 未知名稱 / 節流中 → 安靜略過。 */
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
    } catch (error) {
      // 音訊失敗絕不影響遊戲流程（舊瀏覽器 / 無 AudioContext）。
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
    playSfx,
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

export const AudioManager = createAudioManager();
export default AudioManager;
