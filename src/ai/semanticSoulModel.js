import { clamp } from "../utils/clamp.js";

export function deriveSemanticSoulState(state = {}, analysis = {}) {
  return {
    bond: clamp(state.bond ?? 0, 0, 100),
    trust: clamp(state.trust ?? 0, 0, 100),
    mood: state.mood || "calm",
    energy: clamp(state.energy ?? 10, 0, 10),
    joySorrow: deriveJoySorrow(state, analysis),
    fearCourage: deriveFearCourage(state),
    bondAffinity: deriveBondAffinity(state),
    boundaryPressure: deriveBoundaryPressure(state, analysis),
    stability: deriveStability(state),
    recentTouchCount: clamp((state.blockedTouchCount || 0) + (state.spamScore || 0), 0, 999),
    lastInteraction: {
      lastTouchAt: state.lastTouchAt || null,
      lastRejectAt: state.lastRejectAt || null,
      lastTouchReaction: state.lastTouchReaction || "",
      lastMessage: state.lastMessage || ""
    },
    returnEchoState: deriveReturnEchoState(state),
    safetyState: state.safeHarborMode ? "safe_harbor" : "none"
  };
}

export function deriveBoundaryPressure(state = {}, analysis = {}) {
  const defense = clamp(state.defense ?? 0, 0, 100) / 100;
  const touchFatigue = clamp(state.touchFatigue ?? 0, 0, 10) / 10;
  const blocked = clamp(state.blockedTouchCount ?? 0, 0, 6) / 6;
  const lowEnergy = 1 - clamp(state.energy ?? 10, 0, 10) / 10;
  const trustRelief = clamp(state.trust ?? 0, 0, 100) / 100;
  const pressureFromText = analysis?.containsIntenseEmotionWords ? 0.08 : 0;

  return clamp(defense * 0.45 + touchFatigue * 0.28 + blocked * 0.16 + lowEnergy * 0.16 + pressureFromText - trustRelief * 0.18, 0, 1);
}

function deriveJoySorrow(state = {}, analysis = {}) {
  const mood = state.mood || "calm";
  const moodScore = {
    happy: 0.75,
    warm: 0.45,
    calm: 0.2,
    soft: -0.12,
    tired: -0.25,
    alert: -0.18,
    defensive: -0.35,
    distant: -0.3,
    safe_harbor: -0.2
  }[mood] ?? 0;

  const analysisScore = clamp(analysis.sentiment || 0, -1, 1) * 0.35;
  return clamp(moodScore + analysisScore, -1, 1);
}

function deriveFearCourage(state = {}) {
  const defense = clamp(state.defense ?? 0, 0, 100) / 100;
  const trust = clamp(state.trust ?? 0, 0, 100) / 100;
  const energy = clamp(state.energy ?? 10, 0, 10) / 10;
  return clamp(trust * 0.45 + energy * 0.25 - defense * 0.55, -1, 1);
}

function deriveBondAffinity(state = {}) {
  const bond = clamp(state.bond ?? 0, 0, 100) / 100;
  const trust = clamp(state.trust ?? 0, 0, 100) / 100;
  return clamp(bond * 0.45 + trust * 0.55, 0, 1);
}

function deriveStability(state = {}) {
  const repair = clamp(state.habitatRepairFactor ?? 0, 0, 1);
  const defense = clamp(state.defense ?? 0, 0, 100) / 100;
  const energy = clamp(state.energy ?? 10, 0, 10) / 10;
  return clamp(0.35 + repair * 0.35 + energy * 0.2 - defense * 0.2, 0, 1);
}

function deriveReturnEchoState(state = {}) {
  const lastSeenAt = Number(state.lastSeenAt) || 0;
  if (!lastSeenAt) return "new_session";

  const gapMs = Date.now() - lastSeenAt;
  if (gapMs > 72 * 60 * 60 * 1000) return "long_absence";
  if (gapMs > 24 * 60 * 60 * 1000) return "overnight_return";
  return "same_day";
}
