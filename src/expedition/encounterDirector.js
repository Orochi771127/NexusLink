import { getEnemyById } from "../data/enemyRegistry.js";
import { deriveCompanionCombatStats } from "./combatResolver.js";
import { getCompanionById } from "../data/companionRegistry.js";

let enemySeq = 0;

const SPAWN_JITTER = 28;

/**
 * 半隨機擺放：每池抽一個 anchor，加 jitter。
 */
export function rollRegionEncounters(region, rng = Math.random) {
  const pools = region?.enemySpawnPools || region?.enemySpawns || [];
  if (!pools.length) return [];

  return pools.map((pool) => {
    if (pool.x != null && pool.y != null) {
      return { enemyId: pool.enemyId, x: pool.x, y: pool.y, threat: pool.threat ?? 0.5 };
    }
    const anchors = pool.anchors || [];
    const anchor = anchors[Math.floor(rng() * anchors.length)] || { x: 640, y: 320 };
    return {
      enemyId: pool.enemyId,
      x: anchor.x + (rng() - 0.5) * SPAWN_JITTER * 2,
      y: anchor.y + (rng() - 0.5) * SPAWN_JITTER * 2,
      threat: pool.threat ?? 0.5
    };
  });
}

/**
 * 初始化遠征遭遇：夥伴戰鬥數值 + 區域敵人。
 */
export function bootstrapExpeditionEncounter(session, region, state, rng = Math.random) {
  const companionDef = getCompanionById(session.companionId);
  const combat = deriveCompanionCombatStats(companionDef?.radar);
  session.companion.atk = combat.atk;
  session.companion.def = combat.def;
  session.companion.hpMax = combat.hpMax;
  session.companion.hp = combat.hpMax;
  session.companion.attackIntervalMs = combat.attackIntervalMs;
  session.companion.lastAttackAt = 0;

  const spawns = rollRegionEncounters(region, rng);
  session.enemies = spawns.map((spawn) => createEnemyEntity(spawn));
  session.loot = [];
  session.lootCollected = {};
  session.combatLog = [];
  session.triggeredMemoryEvents = [];
  session.pendingMemoryEvent = null;
  session.stats = {
    kills: 0,
    damageTaken: 0,
    damageDealt: 0,
    retreatsFromCombat: 0
  };

  return session;
}

function createEnemyEntity(spawn) {
  const def = getEnemyById(spawn.enemyId);
  enemySeq += 1;
  const hpMax = Math.round((def?.maxHp || 30) * 0.75);
  return {
    id: `enemy_${enemySeq}`,
    enemyId: spawn.enemyId,
    name: def?.name?.zh || "雜訊",
    x: spawn.x,
    y: spawn.y,
    hp: hpMax,
    hpMax,
    atk: Math.max(3, Math.round((def?.attack || 5) * 0.85)),
    def: 2,
    attackIntervalMs: 1100,
    lastAttackAt: 0,
    state: "idle",
    threat: spawn.threat ?? 0.55
  };
}

export function getLivingEnemies(session) {
  return (session.enemies || []).filter((e) => e.hp > 0);
}

export function getVisibleEnemies(session, detectRadius) {
  const { x, y } = session.companion;
  return getLivingEnemies(session).filter((e) => {
    const dist = Math.hypot(e.x - x, e.y - y);
    return dist <= detectRadius;
  });
}

export function markEnemyAlert(enemy) {
  if (enemy.state === "idle") enemy.state = "alert";
}
