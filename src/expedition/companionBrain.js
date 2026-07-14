import { pickNearestExplorePoint } from "./navigationGrid.js";
import {
  getTacticalBias,
  pickHighestBehavior,
  scoreAttack,
  scoreCollect,
  scoreEvade,
  scoreExplore,
  scoreIdle,
  scoreRest,
  scoreRetreat
} from "./utilityScoring.js";
import { DETECT_RADIUS } from "./combatResolver.js";
import { getLivingEnemies } from "./encounterDirector.js";
import { countUncollectedLoot } from "./lootSystem.js";
import { getEnemyById } from "../data/enemyRegistry.js";

/**
 * 意圖旁白：用語避免綁死單一地圖（「草叢」），
 * 讓三區共用時仍像「這隻夥伴在想什麼」，而不是系統 log。
 */
const REASON_COPY = Object.freeze({
  EXPLORE: {
    default: "牠想先看看附近有什麼可疑的地方。",
    low_energy: "牠放慢腳步，只敢在附近轉轉。",
    target_near: "牠在那裡停了下來，正在查看。"
  },
  ATTACK: {
    default: "牠決定試著驅散那道雜訊。",
    named: "牠決定試著驅散{enemy}。",
    focus: "牠相信你的判斷，朝那個目標撲去。",
    angry: "牠的背脊微微拱起，準備接戰。",
    low_hp: "儘管受傷，牠仍選擇守在你前面。"
  },
  EVADE: {
    default: "牠察覺到強敵，決定先拉開距離。",
    anxious: "牠對未知目標保持距離。"
  },
  COLLECT: {
    default: "牠想先撿取附近的碎晶。",
    near: "碎晶就在腳邊，牠湊了過去。"
  },
  RETREAT: {
    default: "牠的能量不足，想先離開這裡。",
    ordered: "牠相信你的判斷，決定撤退。",
    low_trust: "牠沒有立刻聽話，但還是慢慢退開了。",
    refuse: "牠不願再深入，逕自往營地方向走。"
  },
  REST: {
    default: "牠的能量不太夠，決定先歇一會。"
  },
  IDLE: {
    default: "牠停下來，耳朵轉向風的方向。"
  }
});

function pickReason(type, context = {}) {
  const pool = REASON_COPY[type] || REASON_COPY.IDLE;
  if (type === "EXPLORE" && context.energy <= 2) return pool.low_energy;
  if (type === "EXPLORE" && context.distToTarget != null && context.distToTarget < 28) {
    return pool.target_near;
  }
  if (type === "ATTACK" && context.playerFocus) return pool.focus;
  if (type === "ATTACK" && context.hpRatio != null && context.hpRatio < 0.4) return pool.low_hp;
  if (type === "ATTACK" && context.mood === "defensive") return pool.angry;
  if (type === "ATTACK" && context.enemyName) {
    return (pool.named || pool.default).replace("{enemy}", context.enemyName);
  }
  if (type === "EVADE" && context.mood === "anxious") return pool.anxious;
  if (type === "COLLECT" && context.distToLoot != null && context.distToLoot < 40) return pool.near;
  if (type === "RETREAT" && context.playerOrdered && context.trust < 35) return pool.low_trust;
  if (type === "RETREAT" && context.playerOrdered && context.trust >= 35) return pool.ordered;
  if (type === "RETREAT" && context.refuseDeep) return pool.refuse;
  return pool.default;
}

function enemyDisplayName(enemy) {
  if (!enemy) return null;
  return getEnemyById(enemy.enemyId)?.name?.zh || null;
}

function pickNearestLoot(session, nav) {
  const loot = (session.loot || []).filter((p) => !p.collected && p.phase !== "collected");
  if (!loot.length) return null;
  let best = null;
  let bestDist = Infinity;
  loot.forEach((piece) => {
    const d = nav.distance(session.companion.x, session.companion.y, piece.x, piece.y);
    if (d < bestDist) {
      bestDist = d;
      best = piece;
    }
  });
  return best ? { piece: best, dist: bestDist } : null;
}

function pickCombatTarget(session, nav, detectRadius, focusId) {
  const living = getLivingEnemies(session);
  const visible = living.filter((e) => {
    return nav.distance(session.companion.x, session.companion.y, e.x, e.y) <= detectRadius;
  });
  if (!visible.length) return null;
  if (focusId) {
    const focused = visible.find((e) => e.id === focusId);
    if (focused) return focused;
  }
  // 灰影貓偏好低威脅；同威脅時選較近的，感覺更像「先處理眼前的」。
  return visible.sort((a, b) => {
    const threatDelta = (a.threat ?? 0) - (b.threat ?? 0);
    if (threatDelta !== 0) return threatDelta;
    const da = nav.distance(session.companion.x, session.companion.y, a.x, a.y);
    const db = nav.distance(session.companion.x, session.companion.y, b.x, b.y);
    return da - db;
  })[0];
}

/**
 * 夥伴遠征大腦：Utility AI + 關係修正（零 DOM / Pixi / store）。
 */
export function decideCompanionIntent(session, region, nav) {
  if (!session || !region) {
    return { type: "IDLE", targetId: null, reason: "牠還在對齊方向。", confidence: 0 };
  }

  const profile = session.profile || {};
  const rel = session.relationship || {};
  const tactics = session.playerTactics || "balanced";
  const bias = getTacticalBias(tactics);
  const detectRadius = DETECT_RADIUS * bias.detect;
  const hpRatio = session.companion.hpMax
    ? session.companion.hp / session.companion.hpMax
    : 1;

  const inCombat = getLivingEnemies(session).some(
    (e) => nav.distance(session.companion.x, session.companion.y, e.x, e.y) <= detectRadius
  );

  const enemyTarget = pickCombatTarget(session, nav, detectRadius, session.playerFocusTargetId);
  const lootPick = pickNearestLoot(session, nav);
  const exploreTarget = pickNearestExplorePoint(session, region, nav);
  const distToTarget = exploreTarget
    ? nav.distance(session.companion.x, session.companion.y, exploreTarget.x, exploreTarget.y)
    : null;

  const playerOrderedRetreat = Boolean(session.playerRetreatRequested);
  const refuseDeep = rel.defense >= 70 && (session.playerInterventions || 0) >= 3;

  const scores = {
    EXPLORE: scoreExplore({
      hasTarget: Boolean(exploreTarget),
      distToTarget,
      curiosity: profile.curiosity,
      energy: rel.energy,
      mood: rel.mood,
      inCombat
    }),
    ATTACK: scoreAttack({
      enemyVisible: Boolean(enemyTarget),
      aggression: profile.aggression,
      hpRatio,
      trust: rel.trust,
      tacticalBias: bias.attack,
      mood: rel.mood,
      playerFocus: Boolean(session.playerFocusTargetId && enemyTarget?.id === session.playerFocusTargetId)
    }),
    EVADE: scoreEvade({
      enemyVisible: Boolean(enemyTarget),
      riskAversion: profile.riskAversion,
      hpRatio,
      mood: rel.mood,
      tacticalBias: bias.attack
    }),
    COLLECT: scoreCollect({
      hasLoot: countUncollectedLoot(session) > 0 && !inCombat,
      distToLoot: lootPick?.dist,
      curiosity: profile.curiosity
    }),
    RETREAT: scoreRetreat({
      hpRatio,
      energy: rel.energy,
      riskAversion: profile.riskAversion,
      trust: rel.trust,
      playerOrdered: playerOrderedRetreat,
      tacticalBias: bias.retreat
    }),
    REST: scoreRest({ energy: rel.energy, mood: rel.mood, inCombat }),
    IDLE: scoreIdle()
  };

  // 玩家明確下令撤退：大幅抬高 RETREAT（低信任仍可能略低於 EXPLORE）。
  if (playerOrderedRetreat) {
    scores.RETREAT += 1.0 * (rel.trust / 100);
    scores.EXPLORE *= 0.12;
    scores.ATTACK *= 0.15;
    scores.COLLECT *= 0.5;
  }
  // 邊界壓力高 + 連續介入：降低深入意願。
  if (refuseDeep) {
    scores.RETREAT += 0.45;
    scores.EXPLORE *= 0.35;
    scores.ATTACK *= 0.5;
  }

  const { behavior, score } = pickHighestBehavior(scores);

  if (behavior === "RETREAT" && (playerOrderedRetreat || hpRatio < profile.retreatHpRatio || refuseDeep)) {
    session.phase = "retreating";
    return {
      type: "RETREAT",
      targetId: null,
      reason: pickReason("RETREAT", {
        playerOrdered: playerOrderedRetreat,
        trust: rel.trust,
        refuseDeep
      }),
      confidence: Math.min(0.98, score)
    };
  }

  if (behavior === "ATTACK" && enemyTarget) {
    return {
      type: "ATTACK",
      targetId: enemyTarget.id,
      targetX: enemyTarget.x,
      targetY: enemyTarget.y,
      reason: pickReason("ATTACK", {
        playerFocus: session.playerFocusTargetId === enemyTarget.id,
        mood: rel.mood,
        hpRatio,
        enemyName: enemyDisplayName(enemyTarget)
      }),
      confidence: Math.min(0.98, score)
    };
  }

  if (behavior === "EVADE" && enemyTarget) {
    return {
      type: "EVADE",
      targetId: enemyTarget.id,
      reason: pickReason("EVADE", { mood: rel.mood === "distant" ? "anxious" : rel.mood }),
      confidence: score
    };
  }

  if (behavior === "COLLECT" && lootPick) {
    return {
      type: "COLLECT",
      targetId: lootPick.piece.id,
      targetX: lootPick.piece.x,
      targetY: lootPick.piece.y,
      reason: pickReason("COLLECT", { distToLoot: lootPick.dist }),
      confidence: score
    };
  }

  if (behavior === "EXPLORE" && exploreTarget) {
    return {
      type: "EXPLORE",
      targetId: exploreTarget.id,
      targetX: exploreTarget.x,
      targetY: exploreTarget.y,
      reason: pickReason("EXPLORE", { energy: rel.energy, distToTarget }),
      confidence: Math.min(0.98, score)
    };
  }

  if (behavior === "REST") {
    return {
      type: "REST",
      targetId: null,
      reason: pickReason("REST"),
      confidence: score
    };
  }

  return {
    type: "IDLE",
    targetId: null,
    reason: pickReason("IDLE"),
    confidence: score
  };
}
