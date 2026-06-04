const DAWN_START = 5 * 60;
const DAY_START = 7 * 60;
const DUSK_START = 17 * 60;
const NIGHT_START = 19 * 60;
const MINUTES_PER_DAY = 24 * 60;
const DAWN_DURATION = DAY_START - DAWN_START;
const DUSK_DURATION = NIGHT_START - DUSK_START;
const DAY_CELESTIAL_DURATION = NIGHT_START - DAWN_START;
const NIGHT_CELESTIAL_DURATION = MINUTES_PER_DAY - NIGHT_START + DAWN_START;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function smoothstep(progress) {
  const t = clamp01(progress);
  return t * t * (3 - 2 * t);
}

function getMinutesElapsed(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getPhase(minutesElapsed) {
  if (minutesElapsed >= DAWN_START && minutesElapsed < DAY_START) return "dawn";
  if (minutesElapsed >= DAY_START && minutesElapsed < DUSK_START) return "day";
  if (minutesElapsed >= DUSK_START && minutesElapsed < NIGHT_START) return "dusk";
  return "night";
}

function getNightAlpha(phase, minutesElapsed) {
  if (phase === "dawn") {
    return 1 - smoothstep((minutesElapsed - DAWN_START) / DAWN_DURATION);
  }

  if (phase === "dusk") {
    return smoothstep((minutesElapsed - DUSK_START) / DUSK_DURATION);
  }

  return phase === "night" ? 1 : 0;
}

function getCelestialProgress(minutesElapsed) {
  if (minutesElapsed >= DAWN_START && minutesElapsed < NIGHT_START) {
    return clamp01((minutesElapsed - DAWN_START) / DAY_CELESTIAL_DURATION);
  }

  if (minutesElapsed >= NIGHT_START) {
    return clamp01((minutesElapsed - NIGHT_START) / NIGHT_CELESTIAL_DURATION);
  }

  return clamp01((minutesElapsed + DAWN_START) / NIGHT_CELESTIAL_DURATION);
}

export function getEnvironmentState() {
  const minutesElapsed = getMinutesElapsed(new Date());
  const phase = getPhase(minutesElapsed);

  return {
    phase,
    nightAlpha: getNightAlpha(phase, minutesElapsed),
    celestialProgress: getCelestialProgress(minutesElapsed)
  };
}

export const EnvironmentController = Object.freeze({ getEnvironmentState });

export default EnvironmentController;
