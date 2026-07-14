/**
 * Utility 行為分數（Phase C/D：探索 + 戰鬥 + 拾取 + 撤退）。
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

export function scoreExplore({ hasTarget, distToTarget, curiosity = 0.5, energy = 10, mood = "calm", inCombat = false }) {
  if (inCombat) return 0.05;
  if (!hasTarget) return 0.1;
  let score = 0.55 + curiosity * 0.35;
  if (energy <= 2) score *= 0.55;
  if (mood === "tired") score *= 0.65;
  if (mood === "happy") score *= 1.12;
  if (distToTarget != null && distToTarget < 28) score *= 0.4;
  return score;
}

export function scoreAttack({
  enemyVisible = false,
  aggression = 0.5,
  hpRatio = 1,
  trust = 50,
  tacticalBias = 1,
  mood = "calm",
  playerFocus = false
}) {
  if (!enemyVisible) return 0;
  let score = 0.35 + aggression * 0.45;
  score *= hpRatio;
  score *= tacticalBias;
  score *= 0.85 + (trust / 100) * 0.25;
  if (mood === "angry" || mood === "defensive") score *= 1.15;
  if (mood === "distant" || mood === "tired") score *= 0.75;
  if (playerFocus) score *= 1.35;
  return score;
}

export function scoreEvade({
  enemyVisible = false,
  riskAversion = 0.5,
  hpRatio = 1,
  mood = "calm",
  tacticalBias = 1
}) {
  if (!enemyVisible) return 0;
  let score = 0.15 + riskAversion * 0.35;
  if (hpRatio < 0.45) score += 0.45;
  if (mood === "anxious" || mood === "distant" || mood === "defensive") score += 0.2;
  if (tacticalBias < 1) score += 0.15;
  return score;
}

export function scoreCollect({ hasLoot = false, distToLoot, curiosity = 0.5 }) {
  if (!hasLoot) return 0;
  let score = 0.5 + curiosity * 0.25;
  if (distToLoot != null && distToLoot < 40) score += 0.25;
  return score;
}

export function scoreRetreat({
  hpRatio = 1,
  energy = 10,
  riskAversion = 0.5,
  trust = 50,
  playerOrdered = false,
  tacticalBias = 1
}) {
  let score = 0.05;
  if (hpRatio < 0.35) score += 0.55 + riskAversion * 0.3;
  if (energy <= 1) score += 0.35;
  if (playerOrdered) {
    // 低信任可能無視撤退指令
    score += 0.4 * (trust / 100);
  }
  if (tacticalBias < 0.85) score += 0.12;
  return score;
}

export function scoreRest({ energy = 10, mood = "calm", inCombat = false }) {
  if (inCombat) return 0;
  if (energy <= 1) return 0.85;
  if (mood === "tired") return 0.55;
  return 0.08;
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
