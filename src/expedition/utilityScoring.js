/**
 * Utility 行為分數（RE-2：納入 session heart）。
 * 仍是純函式：只吃數字，不碰 DOM／Pixi／store。
 */

export const EXPEDITION_BEHAVIORS = Object.freeze([
  "EXPLORE",
  "ATTACK",
  "EVADE",
  "COLLECT",
  "RETREAT",
  "REST",
  "IDLE"
]);

function heartOr(heart, key, fallback) {
  const n = Number(heart?.[key]);
  return Number.isFinite(n) ? n : fallback;
}

export function scoreExplore({
  hasTarget,
  distToTarget,
  curiosity = 0.5,
  energy = 10,
  mood = "calm",
  inCombat = false,
  heart = null
}) {
  if (inCombat) return 0.05;
  if (!hasTarget) return 0.1;
  const curiosityDrive = heartOr(heart, "curiosityDrive", curiosity);
  const fatigue = heartOr(heart, "fatigue", 0);
  const stress = heartOr(heart, "stress", 0);

  let score = 0.55 + curiosityDrive * 0.35;
  if (energy <= 2) score *= 0.55;
  if (mood === "tired") score *= 0.65;
  if (mood === "happy") score *= 1.12;
  if (distToTarget != null && distToTarget < 28) score *= 0.4;
  // 累了／慌了就比較不想亂逛。
  score *= 1 - fatigue * 0.35;
  score *= 1 - stress * 0.2;
  return Math.max(0, score);
}

export function scoreAttack({
  enemyVisible = false,
  aggression = 0.5,
  hpRatio = 1,
  trust = 50,
  tacticalBias = 1,
  mood = "calm",
  playerFocus = false,
  heart = null
}) {
  if (!enemyVisible) return 0;
  const stress = heartOr(heart, "stress", 0);
  const feltSafety = heartOr(heart, "feltSafety", 0.5);
  const fatigue = heartOr(heart, "fatigue", 0);

  let score = 0.35 + aggression * 0.45;
  score *= hpRatio;
  score *= tacticalBias;
  score *= 0.85 + (trust / 100) * 0.25;
  if (mood === "angry" || mood === "defensive") score *= 1.15;
  if (mood === "distant" || mood === "tired") score *= 0.75;
  if (playerFocus) score *= 1.35;
  // 壓力高或安心低時，接戰意願下降（保守戰術會更明顯）。
  score *= 0.75 + feltSafety * 0.35;
  score *= 1 - stress * 0.25;
  score *= 1 - fatigue * 0.2;
  return Math.max(0, score);
}

export function scoreEvade({
  enemyVisible = false,
  riskAversion = 0.5,
  hpRatio = 1,
  mood = "calm",
  tacticalBias = 1,
  heart = null
}) {
  if (!enemyVisible) return 0;
  const stress = heartOr(heart, "stress", 0);
  const feltSafety = heartOr(heart, "feltSafety", 0.5);

  let score = 0.15 + riskAversion * 0.35;
  if (hpRatio < 0.45) score += 0.45;
  if (mood === "anxious" || mood === "distant" || mood === "defensive") score += 0.2;
  if (tacticalBias < 1) score += 0.15;
  score += stress * 0.35;
  score += (1 - feltSafety) * 0.2;
  return score;
}

export function scoreCollect({ hasLoot = false, distToLoot, curiosity = 0.5, heart = null }) {
  if (!hasLoot) return 0;
  const curiosityDrive = heartOr(heart, "curiosityDrive", curiosity);
  let score = 0.5 + curiosityDrive * 0.25;
  if (distToLoot != null && distToLoot < 40) score += 0.25;
  return score;
}

export function scoreRetreat({
  hpRatio = 1,
  energy = 10,
  riskAversion = 0.5,
  trust = 50,
  playerOrdered = false,
  tacticalBias = 1,
  heart = null
}) {
  const stress = heartOr(heart, "stress", 0);
  const fatigue = heartOr(heart, "fatigue", 0);
  const interventionPressure = heartOr(heart, "interventionPressure", 0);
  const feltSafety = heartOr(heart, "feltSafety", 0.5);

  let score = 0.05;
  if (hpRatio < 0.35) score += 0.55 + riskAversion * 0.3;
  if (energy <= 1) score += 0.35;
  if (playerOrdered) {
    // 低信任可能較慢聽話；安全出口另走 return_home，不走這條。
    score += 0.4 * (trust / 100);
  }
  if (tacticalBias < 0.85) score += 0.12;
  score += stress * 0.3;
  score += fatigue * 0.25;
  score += interventionPressure * 0.4;
  score += (1 - feltSafety) * 0.15;
  return score;
}

export function scoreRest({ energy = 10, mood = "calm", inCombat = false, heart = null }) {
  if (inCombat) return 0;
  const fatigue = heartOr(heart, "fatigue", 0);
  const stress = heartOr(heart, "stress", 0);

  let score = 0.08;
  if (energy <= 1) score = 0.85;
  if (mood === "tired") score = Math.max(score, 0.55);
  // REST 不再是空停：累／慌時分數明顯上升。
  score += fatigue * 0.55;
  score += stress * 0.25;
  return score;
}

export function scoreIdle() {
  return 0.05;
}

export function pickHighestBehavior(scores) {
  let best = "IDLE";
  let bestValue = -Infinity;
  EXPEDITION_BEHAVIORS.forEach((key) => {
    const value = scores[key] ?? 0;
    if (value > bestValue) {
      bestValue = value;
      best = key;
    }
  });
  return { behavior: best, score: bestValue };
}

/** 戰術模式 → 接戰/索敵修正。 */
export function getTacticalBias(tactics = "balanced") {
  if (tactics === "aggressive") return { attack: 1.25, detect: 1.2, retreat: 0.85 };
  if (tactics === "conservative") return { attack: 0.75, detect: 0.75, retreat: 1.2 };
  return { attack: 1, detect: 1, retreat: 1 };
}
