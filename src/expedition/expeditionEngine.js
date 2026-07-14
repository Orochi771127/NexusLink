import { BRAIN_TICK_MS } from "./expeditionConfig.js";
import { decideCompanionIntent } from "./companionBrain.js";
import { createNavigationGrid } from "./navigationGrid.js";
import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { getEnemyById } from "../data/enemyRegistry.js";
import {
  applyAttack,
  ATTACK_RANGE,
  DETECT_RADIUS,
  isDetected,
  isInRange
} from "./combatResolver.js";
import { getLivingEnemies, markEnemyAlert } from "./encounterDirector.js";
import { spawnLootFromEnemy, updateLootPhysics, countUncollectedLoot } from "./lootSystem.js";
import { consumePendingMemoryEvent, tryTriggerMemoryEvent } from "./memoryEventDirector.js";

const ARRIVE_RADIUS = 22;
const EVADE_SPEED_MULT = 1.15;
/** 探索點記憶事件：旁白停頓，避免下一拍 AI 立刻蓋掉情緒時刻。 */
const MEMORY_HOLD_MS = 2800;

/**
 * 遠征引擎 tick：AI + 移動 + 簡化戰鬥 + 掉落。
 */
export function createExpeditionEngine(session) {
  const region = getExpeditionRegionByNodeId(session?.nodeId);
  const nav = createNavigationGrid(region);
  const retreatPoint = region?.spawn || { x: 140, y: 390 };

  function tick(deltaMs, now = Date.now()) {
    if (!session || !region) return session;
    if (session.phase === "complete") return session;

    session.elapsedMs += deltaMs;
    session.brainAccumMs += deltaMs;
    session.combatAccumMs += deltaMs;

    updateLootPhysics(session, deltaMs);

    if (session.phase === "retreating") {
      // 撤退必須回「本區入口」，不可寫死風歇草坡座標。
      moveToward(session, region, nav, retreatPoint.x, retreatPoint.y, deltaMs, 1.1);
      if (nav.distance(session.companion.x, session.companion.y, retreatPoint.x, retreatPoint.y) < 36) {
        session.phase = "complete";
        session.lastIntent = {
          type: "RETREAT",
          reason: "牠回到了入口一帶，遠征結束。",
          confidence: 1
        };
      }
      return session;
    }

    // 記憶停頓期間：不重算意圖，讓玩家讀完那句 excerpt。
    const holdingMemory = Boolean(session.memoryHoldUntil && now < session.memoryHoldUntil);
    if (!holdingMemory && session.pendingMemoryEvent) {
      consumePendingMemoryEvent(session);
      session.memoryHoldUntil = 0;
    }

    if (!holdingMemory && session.brainAccumMs >= BRAIN_TICK_MS) {
      session.brainAccumMs = 0;
      session.lastIntent = decideCompanionIntent(session, region, nav);
      session.debug.brainTicks += 1;
      if (session.lastIntent.targetId) {
        session.activeTargetId = session.lastIntent.targetId;
      }
    }

    const intent = session.lastIntent || {};
    tickEnemyAwareness(session, now);

    // 記憶停頓時仍可微幅減速（像愣住），但不主動開打。
    if (holdingMemory || intent.type === "INVESTIGATE") {
      session.companion.vx *= 0.7;
      session.companion.vy *= 0.7;
    } else if (intent.type === "ATTACK") {
      handleAttackIntent(session, region, nav, intent, deltaMs, now);
    } else if (intent.type === "EVADE") {
      handleEvadeIntent(session, region, nav, intent, deltaMs);
    } else if (intent.type === "COLLECT" || intent.type === "EXPLORE") {
      handleMoveIntent(session, region, nav, intent, deltaMs, now);
    } else if (intent.type === "REST" || intent.type === "IDLE") {
      session.companion.vx *= 0.85;
      session.companion.vy *= 0.85;
    }

    tickEnemyAttacks(session, deltaMs, now);
    checkExtractReady(session, region);

    if (session.companion.hp <= 0) {
      session.phase = "retreating";
      session.playerRetreatRequested = true;
      session.lastIntent = {
        type: "RETREAT",
        reason: "心核穩定度見底——牠帶著你撤離了。",
        confidence: 1
      };
    }

    return session;
  }

  return { tick, region, nav };
}

function tickEnemyAwareness(session, now) {
  getLivingEnemies(session).forEach((enemy) => {
    if (isDetected(session.companion.x, session.companion.y, enemy.x, enemy.y, DETECT_RADIUS)) {
      markEnemyAlert(enemy);
    }
  });
}

function handleAttackIntent(session, region, nav, intent, deltaMs, now) {
  const enemy = getLivingEnemies(session).find((e) => e.id === intent.targetId);
  if (!enemy) {
    handleMoveIntent(session, region, nav, intent, deltaMs, now);
    return;
  }

  if (isInRange(session.companion.x, session.companion.y, enemy.x, enemy.y, ATTACK_RANGE)) {
    const result = applyAttack(session.companion, enemy, now);
    if (result.hit) {
      session.stats.damageDealt += result.damage;
      session.combatLog.push({ t: now, who: "companion", damage: result.damage, target: enemy.id });
      if (enemy.hp <= 0) {
        session.stats.kills += 1;
        spawnLootFromEnemy(session, enemy, session.regionId);
        const enemyName = getEnemyById(enemy.enemyId)?.name?.zh || "雜訊";
        session.lastIntent = {
          ...intent,
          reason: `${enemyName}散開了，碎晶落在附近。`
        };
      }
    }
    return;
  }

  moveToward(session, region, nav, enemy.x, enemy.y, deltaMs, 1);
}

function handleEvadeIntent(session, region, nav, intent, deltaMs) {
  const enemy = getLivingEnemies(session).find((e) => e.id === intent.targetId);
  if (!enemy) return;
  const dx = session.companion.x - enemy.x;
  const dy = session.companion.y - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;
  const fleeX = session.companion.x + (dx / dist) * 80;
  const fleeY = session.companion.y + (dy / dist) * 80;
  moveToward(session, region, nav, fleeX, fleeY, deltaMs, EVADE_SPEED_MULT);
}

function handleMoveIntent(session, region, nav, intent, deltaMs, now = Date.now()) {
  if (intent.targetX == null || intent.targetY == null) return;

  const dx = intent.targetX - session.companion.x;
  const dy = intent.targetY - session.companion.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= ARRIVE_RADIUS) {
    if (intent.type === "EXPLORE" && intent.targetId && !session.visitedExplorePoints.includes(intent.targetId)) {
      session.visitedExplorePoints.push(intent.targetId);
      const memory = tryTriggerMemoryEvent(session, intent.targetId);
      if (memory) {
        // 觸發後進入停頓：HUD 會停在記憶 excerpt 約 2.8 秒。
        session.memoryHoldUntil = now + MEMORY_HOLD_MS;
      } else {
        session.lastIntent = {
          ...intent,
          reason: "牠在那裡查看了一會兒，似乎沒有發現什麼異樣。"
        };
      }
    }
    session.companion.vx = 0;
    session.companion.vy = 0;
    return;
  }

  moveToward(session, region, nav, intent.targetX, intent.targetY, deltaMs, 1);
}

function moveToward(session, region, nav, tx, ty, deltaMs, speedMult = 1) {
  const companion = session.companion;
  const dt = deltaMs / 1000;
  const dx = tx - companion.x;
  const dy = ty - companion.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;
  const speed = companion.speed * (session.relationship?.energy <= 2 ? 0.55 : 1) * speedMult;
  const stepX = nx * speed * dt;
  const stepY = ny * speed * dt;

  const prevX = companion.x;
  const prevY = companion.y;
  const moved = nav.moveWithCollision(companion.x, companion.y, stepX, stepY, region.worldWidth, region.worldHeight);
  companion.x = moved.x;
  companion.y = moved.y;
  companion.vx = (companion.x - prevX) / dt;
  companion.vy = (companion.y - prevY) / dt;
  companion.facing = companion.vx >= 0 ? 1 : -1;
  session.debug.distanceTraveled += Math.hypot(companion.x - prevX, companion.y - prevY);
}

function tickEnemyAttacks(session, deltaMs, now) {
  const companion = session.companion;
  getLivingEnemies(session).forEach((enemy) => {
    if (enemy.state !== "alert") return;
    if (!isInRange(enemy.x, enemy.y, companion.x, companion.y, ATTACK_RANGE + 8)) return;
    const result = applyAttack(enemy, companion, now);
    if (result.hit) {
      session.stats.damageTaken += result.damage;
      session.combatLog.push({ t: now, who: "enemy", damage: result.damage, target: enemy.id });
    }
  });
}

/**
 * 可結算條件：
 * - 清場 + 撿完碎晶（有擊殺），或
 * - 和平路徑：探索點全訪 + 無存活敵 + 無未撿碎晶
 * 不必強迫走回入口。
 */
function checkExtractReady(session, region) {
  if (session.phase === "retreating" || session.phase === "complete") return;
  if (getLivingEnemies(session).length > 0) return;
  if (countUncollectedLoot(session) > 0) return;

  const kills = session.stats?.kills || 0;
  const exploreTotal = region?.explorePoints?.length || 0;
  const visited = session.visitedExplorePoints?.length || 0;
  const fullyExplored = exploreTotal > 0 && visited >= exploreTotal;

  if (kills < 1 && !fullyExplored) return;
  session.phase = "extract_ready";
}

export function getExpeditionRegionForSession(session) {
  return getExpeditionRegionByNodeId(session?.nodeId);
}

export function shouldAutoFinish(session) {
  if (!session) return false;
  if (session.phase === "complete") return true;
  return session.phase === "retreating" && session.companion.hp <= 0;
}
