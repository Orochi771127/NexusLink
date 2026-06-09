/**
 * Pure companion personality layer for trait evolution and downstream modifiers.
 * Designed for later integration into the existing state/store pipeline.
 */

/** @typedef {"warmth"|"careDrive"|"boundaryFirmness"|"playfulness"|"sensitivity"|"independence"} TraitKey */

/**
 * @typedef {Object} CompanionTraits
 * @property {number} warmth
 * @property {number} careDrive
 * @property {number} boundaryFirmness
 * @property {number} playfulness
 * @property {number} sensitivity
 * @property {number} independence
 */

/**
 * @typedef {Object} PersonalityInputContext
 * @property {string} inputType
 * @property {number} intensity
 * @property {{ riskLevel?: string } | null} [safetyRisk]
 * @property {string|null} [matchedEmotionKey]
 * @property {boolean} [triggerSafeHarbor]
 * @property {boolean} [repeated]
 */

const TRAIT_MIN = 0;
const TRAIT_MAX = 100;
const MAX_TRAIT_DELTA = 1.25;
const OVERLOAD_INTENSITY_THRESHOLD = 0.72;

const TRAIT_KEYS = Object.freeze([
  "warmth",
  "careDrive",
  "boundaryFirmness",
  "playfulness",
  "sensitivity",
  "independence"
]);

const VULNERABLE_EMOTIONS = new Set(["sadness", "anxiety", "loneliness", "fatigue", "anger"]);

const PROTECTIVE_INPUT_TYPES = new Set(["vulnerable", "safeHarbor", "safe_harbor"]);
const DEMANDING_INPUT_TYPES = new Set(["demanding", "pressure", "insistent"]);
const PLAYFUL_INPUT_TYPES = new Set(["playful", "affection", "cheer"]);

export const COMPANION_ARCHETYPES = Object.freeze({
  greyshadeCat: Object.freeze({
    id: "greyshadeCat",
    label: "Greyshade Cat",
    baseline: Object.freeze({
      warmth: 58,
      careDrive: 52,
      boundaryFirmness: 62,
      playfulness: 34,
      sensitivity: 74,
      independence: 68
    })
  }),
  thunderPup: Object.freeze({
    id: "thunderPup",
    label: "Thunder Pup",
    baseline: Object.freeze({
      warmth: 72,
      careDrive: 66,
      boundaryFirmness: 38,
      playfulness: 81,
      sensitivity: 48,
      independence: 42
    })
  }),
  starEnergyBoarlet: Object.freeze({
    id: "starEnergyBoarlet",
    label: "Star Energy Boarlet",
    baseline: Object.freeze({
      warmth: 54,
      careDrive: 60,
      boundaryFirmness: 50,
      playfulness: 58,
      sensitivity: 40,
      independence: 76
    })
  })
});

/**
 * @param {string} [companionType]
 * @returns {CompanionTraits}
 */
export function createInitialTraits(companionType = "greyshadeCat") {
  const archetype = COMPANION_ARCHETYPES[companionType] || COMPANION_ARCHETYPES.greyshadeCat;
  return clampTraits({ ...archetype.baseline });
}

/**
 * @param {CompanionTraits} currentTraits
 * @param {Record<string, unknown>} [state]
 * @param {PersonalityInputContext} [inputContext]
 * @returns {CompanionTraits}
 */
export function evolveTraits(currentTraits, state = {}, inputContext = {}) {
  const nextTraits = cloneTraits(currentTraits);
  const intensity = clamp01(inputContext.intensity);
  const inputType = normalizeInputType(inputContext.inputType);
  const protectiveContext = isProtectiveContext(state, inputContext);
  const vulnerableContext = isVulnerableContext(inputContext);
  const repeated = Boolean(inputContext.repeated);
  const demanding = DEMANDING_INPUT_TYPES.has(inputType);
  const playful = PLAYFUL_INPUT_TYPES.has(inputType);
  const overload = isEmotionalOverload(state, inputContext);

  if (protectiveContext || vulnerableContext) {
    applyTraitDelta(nextTraits, "warmth", scaleDelta(0.45, intensity));
    applyTraitDelta(nextTraits, "careDrive", scaleDelta(0.35, intensity));
    applyTraitDelta(nextTraits, "sensitivity", scaleDelta(0.2, intensity));
  } else if (playful) {
    applyTraitDelta(nextTraits, "playfulness", scaleDelta(0.55, intensity));
    applyTraitDelta(nextTraits, "warmth", scaleDelta(0.3, intensity));
    applyTraitDelta(nextTraits, "careDrive", scaleDelta(0.2, intensity));
  } else if (inputType === "emotional" || inputType === "neutral") {
    applyTraitDelta(nextTraits, "warmth", scaleDelta(0.2, intensity));
    applyTraitDelta(nextTraits, "careDrive", scaleDelta(0.15, intensity));
  }

  if (repeated || inputType === "spam" || inputType === "repeated") {
    applyTraitDelta(nextTraits, "boundaryFirmness", scaleDelta(0.7, Math.max(intensity, 0.35)));
    applyTraitDelta(nextTraits, "playfulness", -scaleDelta(0.15, Math.max(intensity, 0.25)));
  }

  if (demanding) {
    applyTraitDelta(nextTraits, "boundaryFirmness", scaleDelta(0.55, intensity));
    applyTraitDelta(nextTraits, "independence", scaleDelta(0.45, intensity));
  }

  if (overload) {
    applyTraitDelta(nextTraits, "sensitivity", scaleDelta(0.25, intensity));
    applyTraitDelta(nextTraits, "boundaryFirmness", scaleDelta(0.2, intensity));
  }

  const spamPressure = clamp01((Number(state.spamScore) || 0) / 8);
  if (spamPressure > 0) {
    applyTraitDelta(nextTraits, "boundaryFirmness", spamPressure * 0.35);
  }

  if (protectiveContext || vulnerableContext) {
    nextTraits.warmth = Math.max(currentTraits.warmth, nextTraits.warmth);
  }

  return clampTraits(nextTraits);
}

/**
 * @param {Record<string, unknown>} [state]
 * @param {CompanionTraits} [traits]
 * @returns {Object}
 */
export function getPersonalityModifiers(state = {}, traits = createInitialTraits()) {
  const safeTraits = clampTraits(traits);
  const protectiveMode = Boolean(state.safeHarborMode);
  const lowEnergy = (Number(state.energy) || 0) <= 2;
  const highBoundary = safeTraits.boundaryFirmness >= 65;
  const highWarmth = safeTraits.warmth >= 60;
  const highIndependence = safeTraits.independence >= 65;

  const trustDeltaMultiplier = protectiveMode
    ? 1.08 + safeTraits.careDrive * 0.0015
    : 0.92 + safeTraits.warmth * 0.0012 - safeTraits.boundaryFirmness * 0.0008;

  const bondDeltaMultiplier = 0.95 + safeTraits.warmth * 0.001 + safeTraits.careDrive * 0.0008;
  const defenseDeltaBias = highBoundary ? 1.4 : -safeTraits.warmth * 0.01;
  const energyDrainMultiplier = 1 + safeTraits.sensitivity * 0.004 + (lowEnergy ? 0.08 : 0);
  const touchOpenness = clamp01(
    (safeTraits.warmth * 0.45 + safeTraits.careDrive * 0.35 - safeTraits.boundaryFirmness * 0.4) / 100 + 0.35
  );

  return {
    trustDeltaMultiplier: protectiveMode ? Math.max(1, trustDeltaMultiplier) : trustDeltaMultiplier,
    bondDeltaMultiplier,
    defenseDeltaBias,
    energyDrainMultiplier,
    touchOpenness,
    safeHarborProtective: protectiveMode || highWarmth,
    independenceBias: highIndependence ? 0.12 : 0,
    playBias: safeTraits.playfulness >= 60 ? 0.1 : 0
  };
}

/**
 * @param {Record<string, unknown>} [state]
 * @param {CompanionTraits} [traits]
 * @returns {Object}
 */
export function getPersonalityVisualHint(state = {}, traits = createInitialTraits()) {
  const safeTraits = clampTraits(traits);
  const mood = String(state.mood || "calm");
  const defensiveMood = mood === "defensive" || mood === "distant";
  const tiredMood = mood === "tired" || mood === "safe_harbor";

  let stance = "attentive";
  if (defensiveMood || safeTraits.boundaryFirmness >= 72) {
    stance = "guarded";
  } else if (safeTraits.independence >= 70 && safeTraits.warmth < 55) {
    stance = "reserved";
  } else if (safeTraits.playfulness >= 68 && !tiredMood) {
    stance = "playful";
  }

  const proximityBias = clampRange(
    (safeTraits.warmth - safeTraits.independence) / 100,
    -1,
    1
  );
  const glowStrength = clamp01(
    (safeTraits.warmth * 0.35 + safeTraits.careDrive * 0.25 - safeTraits.boundaryFirmness * 0.15) / 100
  );
  const motionTempo =
    tiredMood || safeTraits.sensitivity >= 75
      ? "slow"
      : safeTraits.playfulness >= 70
        ? "quick"
        : "steady";

  return {
    stance,
    proximityBias,
    glowStrength,
    motionTempo,
    sensitivityLevel: clamp01(safeTraits.sensitivity / 100)
  };
}

/**
 * @param {CompanionTraits} traits
 * @returns {CompanionTraits}
 */
export function clampTraits(traits = {}) {
  /** @type {CompanionTraits} */
  const clamped = {
    warmth: TRAIT_MIN,
    careDrive: TRAIT_MIN,
    boundaryFirmness: TRAIT_MIN,
    playfulness: TRAIT_MIN,
    sensitivity: TRAIT_MIN,
    independence: TRAIT_MIN
  };

  TRAIT_KEYS.forEach((key) => {
    clamped[key] = clampTraitValue(traits[key]);
  });

  return clamped;
}

/**
 * @param {CompanionTraits} traits
 * @returns {CompanionTraits}
 */
function cloneTraits(traits = {}) {
  return clampTraits(traits);
}

/**
 * @param {CompanionTraits} traits
 * @param {TraitKey} key
 * @param {number} delta
 */
function applyTraitDelta(traits, key, delta) {
  if (!Number.isFinite(delta) || delta === 0) return;
  const boundedDelta = clampRange(delta, -MAX_TRAIT_DELTA, MAX_TRAIT_DELTA);
  traits[key] = clampTraitValue((Number(traits[key]) || 0) + boundedDelta);
}

/**
 * @param {Record<string, unknown>} state
 * @param {PersonalityInputContext} inputContext
 * @returns {boolean}
 */
function isProtectiveContext(state, inputContext) {
  return Boolean(
    state.safeHarborMode ||
      inputContext.triggerSafeHarbor ||
      PROTECTIVE_INPUT_TYPES.has(normalizeInputType(inputContext.inputType)) ||
      inputContext.safetyRisk?.riskLevel === "high" ||
      inputContext.safetyRisk?.riskLevel === "caution"
  );
}

/**
 * @param {PersonalityInputContext} inputContext
 * @returns {boolean}
 */
function isVulnerableContext(inputContext) {
  const inputType = normalizeInputType(inputContext.inputType);
  if (PROTECTIVE_INPUT_TYPES.has(inputType) || inputType === "vulnerable") {
    return true;
  }
  return VULNERABLE_EMOTIONS.has(String(inputContext.matchedEmotionKey || ""));
}

/**
 * @param {Record<string, unknown>} state
 * @param {PersonalityInputContext} inputContext
 * @returns {boolean}
 */
function isEmotionalOverload(state, inputContext) {
  const intensity = clamp01(inputContext.intensity);
  const emotionalMemories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  const freshCount = emotionalMemories.filter((memory) => memory?.status === "fresh").length;

  return (
    Boolean(inputContext.triggerSafeHarbor) ||
    intensity >= OVERLOAD_INTENSITY_THRESHOLD ||
    freshCount >= 4
  );
}

/**
 * @param {string} inputType
 * @returns {string}
 */
function normalizeInputType(inputType) {
  return String(inputType || "neutral").trim().toLowerCase();
}

/**
 * @param {number} base
 * @param {number} intensity
 * @returns {number}
 */
function scaleDelta(base, intensity) {
  return base * (0.35 + clamp01(intensity) * 0.65);
}

/**
 * @param {number} value
 * @returns {number}
 */
function clampTraitValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return TRAIT_MIN;
  return Math.max(TRAIT_MIN, Math.min(TRAIT_MAX, numeric));
}

/**
 * @param {number} value
 * @returns {number}
 */
function clamp01(value) {
  return clampRange(value, 0, 1);
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clampRange(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}