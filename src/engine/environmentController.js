/**
 * 棲地時間相位（TP-HAB-TIME-1）。
 * sceneTimePhase = day | dusk | night | dawn
 * 氛圍用，不做每日任務／限時壓力。
 */

const SUNRISE = 6 * 60;
const SUNSET = 18 * 60;
const MINUTES_PER_DAY = 24 * 60;
const DAY_DURATION = SUNSET - SUNRISE;
const NIGHT_DURATION = MINUTES_PER_DAY - DAY_DURATION;

/** 晨昏過渡窗（分鐘）— 對齊 Scene Profile twilightMinutes 預設。 */
const TWILIGHT_MINUTES = 45;

/** @type {string | null} 測試／預覽覆寫；null = 跟隨本機時鐘 */
let phaseOverride = null;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function getMinutesElapsed(date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/**
 * 四相位：日出前後為 dawn、日間 day、日落前後 dusk、夜間 night。
 */
function getSceneTimePhase(minutesElapsed) {
  const dawnStart = SUNRISE - TWILIGHT_MINUTES;
  const dawnEnd = SUNRISE + TWILIGHT_MINUTES;
  const duskStart = SUNSET - TWILIGHT_MINUTES;
  const duskEnd = SUNSET + TWILIGHT_MINUTES;

  if (minutesElapsed >= dawnStart && minutesElapsed < dawnEnd) return "dawn";
  if (minutesElapsed >= dawnEnd && minutesElapsed < duskStart) return "day";
  if (minutesElapsed >= duskStart && minutesElapsed < duskEnd) return "dusk";
  return "night";
}

function getSunProgress(minutesElapsed) {
  return clamp01((minutesElapsed - SUNRISE) / DAY_DURATION);
}

function getMoonProgress(minutesElapsed) {
  if (minutesElapsed >= SUNSET) {
    return clamp01((minutesElapsed - SUNSET) / NIGHT_DURATION);
  }
  return clamp01((minutesElapsed + MINUTES_PER_DAY - SUNSET) / NIGHT_DURATION);
}

/**
 * 依相位計算日／夜混合與天體透明度。
 * dusk／dawn 用平滑過渡，不必立刻四張底圖。
 */
function alphasForPhase(phase, minutesElapsed) {
  if (phase === "day") {
    return { nightAlpha: 0, sunAlpha: 1, moonAlpha: 0 };
  }
  if (phase === "night") {
    return { nightAlpha: 1, sunAlpha: 0, moonAlpha: 1 };
  }

  if (phase === "dawn") {
    // 從夜 → 日：越接近 sunrise+twilight 越亮
    const t = clamp01((minutesElapsed - (SUNRISE - TWILIGHT_MINUTES)) / (TWILIGHT_MINUTES * 2));
    return {
      nightAlpha: 1 - t,
      sunAlpha: t,
      moonAlpha: Math.max(0, 1 - t * 1.4)
    };
  }

  // dusk：從日 → 夜
  const t = clamp01((minutesElapsed - (SUNSET - TWILIGHT_MINUTES)) / (TWILIGHT_MINUTES * 2));
  return {
    nightAlpha: t,
    sunAlpha: Math.max(0, 1 - t * 1.2),
    moonAlpha: t
  };
}

/** 預覽／測試用：設為 day|dusk|night|dawn，或 null 取消覆寫。 */
export function setSceneTimePhaseOverride(phase) {
  const allowed = new Set(["day", "dusk", "night", "dawn", null]);
  if (!allowed.has(phase)) {
    throw new Error(`Invalid sceneTimePhase override: ${phase}`);
  }
  phaseOverride = phase;
}

export function clearSceneTimePhaseOverride() {
  phaseOverride = null;
}

/** 覆寫相位時用該相位的代表時刻，避免本機時鐘把 dusk/dawn 算成 t≈0。 */
function representativeMinutesForPhase(phase, liveMinutes) {
  if (!phaseOverride) return liveMinutes;
  if (phase === "dawn") return SUNRISE;
  if (phase === "dusk") return SUNSET;
  if (phase === "day") return (SUNRISE + SUNSET) / 2;
  if (phase === "night") return SUNSET + NIGHT_DURATION / 2;
  return liveMinutes;
}

export function getEnvironmentState(date = new Date()) {
  const minutesElapsed = getMinutesElapsed(date);
  const phase = phaseOverride || getSceneTimePhase(minutesElapsed);
  const sampleMinutes = representativeMinutesForPhase(phase, minutesElapsed);
  const sunProgress = getSunProgress(sampleMinutes);
  const moonProgress = getMoonProgress(sampleMinutes);
  const alphas = alphasForPhase(phase, sampleMinutes);

  return {
    phase,
    sceneTimePhase: phase,
    // 舊呼叫端仍讀 phase === "day" | "night"；保留兼容欄位
    legacyPhase: alphas.nightAlpha >= 0.5 ? "night" : "day",
    nightAlpha: clamp01(alphas.nightAlpha),
    celestialProgress: phase === "day" || phase === "dusk" ? sunProgress : moonProgress,
    sunProgress,
    moonProgress,
    sunAlpha: clamp01(alphas.sunAlpha),
    moonAlpha: clamp01(alphas.moonAlpha),
    minutesElapsed,
    phaseOverride: phaseOverride
  };
}

export const EnvironmentController = Object.freeze({
  getEnvironmentState,
  setSceneTimePhaseOverride,
  clearSceneTimePhaseOverride
});

export default EnvironmentController;
