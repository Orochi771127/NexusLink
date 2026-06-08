const SUNRISE = 6 * 60;
const SUNSET = 18 * 60;
const MINUTES_PER_DAY = 24 * 60;
const DAY_DURATION = SUNSET - SUNRISE;
const NIGHT_DURATION = MINUTES_PER_DAY - DAY_DURATION;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function getMinutesElapsed(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getPhase(minutesElapsed) {
  return minutesElapsed >= SUNRISE && minutesElapsed < SUNSET ? "day" : "night";
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

export function getEnvironmentState() {
  const minutesElapsed = getMinutesElapsed(new Date());
  const phase = getPhase(minutesElapsed);
  const sunProgress = getSunProgress(minutesElapsed);
  const moonProgress = getMoonProgress(minutesElapsed);
  const sunAlpha = phase === "day" ? 1 : 0;
  const moonAlpha = phase === "night" ? 1 : 0;

  return {
    phase,
    nightAlpha: moonAlpha,
    celestialProgress: phase === "day" ? sunProgress : moonProgress,
    sunProgress,
    moonProgress,
    sunAlpha,
    moonAlpha
  };
}

export const EnvironmentController = Object.freeze({ getEnvironmentState });

export default EnvironmentController;
