/**
 * Moonlake Orbit V1 pre-launch negotiation.
 *
 * Pure and session-only: this module never reads the store, writes save data,
 * or calls RaphaelCore. Mood selects a named deterministic proposal, Energy
 * bounds the visible pull envelope, and Trust changes only the wording used
 * to make the companion's boundary legible.
 */

export const ORBIT_ATTUNEMENT_DECISIONS = Object.freeze({
  accept: "accept",
  rewrite: "rewrite",
  rest: "rest",
  refuse: "refuse"
});

const MOOD_PROFILES = Object.freeze({
  calm: Object.freeze({ label: "平息", stanceId: "upright" }),
  soft: Object.freeze({ label: "柔緩", stanceId: "upright" }),
  warm: Object.freeze({ label: "溫亮", stanceId: "upright" }),
  happy: Object.freeze({ label: "輕快", stanceId: "upright" }),
  excited: Object.freeze({ label: "昂揚", stanceId: "tilted" }),
  alert: Object.freeze({ label: "警醒", stanceId: "tilted" }),
  anxious: Object.freeze({ label: "警醒", stanceId: "tilted" }),
  chaotic: Object.freeze({ label: "散亂", stanceId: "tilted" }),
  defensive: Object.freeze({ label: "護界", stanceId: "conservative" }),
  distant: Object.freeze({ label: "留距", stanceId: "conservative" }),
  tired: Object.freeze({ label: "低潮", stanceId: "conservative" })
});

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function normalizeMood(value) {
  const key = String(value || "calm").trim().toLowerCase();
  return key || "calm";
}

function trustLegibility(trust) {
  if (trust >= 60) {
    return "牠願意直接說清楚自己的走法；這不代表服從。";
  }
  if (trust >= 20) {
    return "牠還在確認彼此的節奏，但每次改軌都會先說明。";
  }
  return "牠會保留距離；是否同行與所有改軌仍會先讓你看見。";
}

/**
 * @param {{ energy?: number, trust?: number, touchFatigue?: number, mood?: string }} vitals
 * @param {{ safetyPaused?: boolean, minPullDistance?: number, maxPullDistance?: number, defaultStanceId?: string }} options
 */
export function createOrbitAttunementSnapshot(vitals = {}, options = {}) {
  const energy = clampNumber(vitals.energy, 0, 10, 10);
  const trust = clampNumber(vitals.trust, 0, 100, 5);
  const touchFatigue = clampNumber(vitals.touchFatigue, 0, 10, 0);
  const mood = normalizeMood(vitals.mood);
  const moodProfile = MOOD_PROFILES[mood] || {
    label: "自持",
    stanceId: options.defaultStanceId || "upright"
  };
  const defaultStanceId = options.defaultStanceId || "upright";
  const minPullDistance = clampNumber(
    options.minPullDistance,
    0.04,
    0.55,
    0.24
  );
  const fullPullDistance = clampNumber(
    options.maxPullDistance,
    minPullDistance,
    0.55,
    0.55
  );
  const energyRatio = Math.max(0, Math.min(1, (energy - 2) / 8));
  const maxPullDistance = Number(
    (minPullDistance + (fullPullDistance - minPullDistance) * energyRatio).toFixed(3)
  );

  let decision = ORBIT_ATTUNEMENT_DECISIONS.accept;
  let canStart = true;
  let proposedStanceId = moodProfile.stanceId;
  let response = "這條軌可以。我們照看得見的計畫一起走。";

  if (options.safetyPaused === true) {
    decision = ORBIT_ATTUNEMENT_DECISIONS.refuse;
    canStart = false;
    response = "現在先不進心域。我會留在這裡，等界線安穩一點。";
  } else if (energy <= 1) {
    decision = ORBIT_ATTUNEMENT_DECISIONS.rest;
    canStart = false;
    response = "我想先休息。今天不轉，也不會失去任何東西。";
  } else if (trust < 3 && touchFatigue >= 7) {
    decision = ORBIT_ATTUNEMENT_DECISIONS.refuse;
    canStart = false;
    response = "邊界還刺刺的。今天我不進場，但之後仍可以再談。";
  } else if (energy <= 3) {
    decision = ORBIT_ATTUNEMENT_DECISIONS.rest;
    canStart = false;
    response = "力氣只夠照顧自己。我想把這一輪留白。";
  } else if (proposedStanceId !== defaultStanceId) {
    decision = ORBIT_ATTUNEMENT_DECISIONS.rewrite;
    response =
      proposedStanceId === "conservative"
        ? "我想把軌道收穩一點。這是我的改軌提案，你看得到再決定。"
        : "我想沿界紋提早入彎。這是我的改軌提案，不會在確認後偷改。";
  }

  return Object.freeze({
    version: "orbit-attunement-v1",
    decision,
    canStart,
    confirmed: false,
    mood,
    moodLabel: moodProfile.label,
    energy,
    trust,
    maxPullDistance,
    proposedStanceId,
    confirmedStanceId: null,
    response,
    trustLine: trustLegibility(trust)
  });
}
