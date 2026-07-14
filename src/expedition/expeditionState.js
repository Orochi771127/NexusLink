import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { getRegionLootTable, getShardType } from "../data/lootTables.js";
import { getAdventureProfile } from "../data/companionAdventureProfiles.js";
import { bootstrapExpeditionEncounter } from "./encounterDirector.js";

/**
 * 建立一次遠征 session（純資料，不碰 DOM / Pixi / store）。
 */
export function createExpeditionSession({
  nodeId,
  companionId,
  companionName = "夥伴",
  state = {},
  now = Date.now()
} = {}) {
  const region = getExpeditionRegionByNodeId(nodeId);
  if (!region) return null;

  const profile = getAdventureProfile(companionId);
  const spawn = region.spawn || { x: 80, y: 80 };

  const session = {
    id: `exp_${now}`,
    nodeId,
    regionId: region.id,
    companionId,
    companionName,
    profile,
    worldWidth: region.worldWidth,
    worldHeight: region.worldHeight,
    phase: "patrol",
    startedAt: now,
    elapsedMs: 0,
    brainAccumMs: 0,
    combatAccumMs: 0,
    playerTactics: "balanced",
    playerFocusTargetId: null,
    playerRetreatRequested: false,
    playerInterventions: 0,
    companion: {
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      speed: 72 + (profile.curiosity || 0.5) * 24,
      hp: 100,
      hpMax: 100,
      atk: 8,
      def: 4,
      facing: 1,
      attackIntervalMs: 880,
      lastAttackAt: 0
    },
    enemies: [],
    loot: [],
    lootCollected: {},
    combatLog: [],
    stats: { kills: 0, damageTaken: 0, damageDealt: 0, retreatsFromCombat: 0 },
    lastIntent: {
      type: "EXPLORE",
      targetId: null,
      reason: "INIT_PATROL",
      confidence: 1
    },
    visitedExplorePoints: [],
    triggeredMemoryEvents: [],
    pendingMemoryEvent: null,
    activeTargetId: null,
    relationship: {
      bond: Number(state.bond) || 0,
      trust: Number(state.trust) || 0,
      mood: state.mood || "calm",
      energy: Number(state.energy) || 0,
      defense: Number(state.defense) || 0
    },
    debug: {
      brainTicks: 0,
      distanceTraveled: 0
    }
  };

  bootstrapExpeditionEncounter(session, region, state);
  return session;
}

export function summarizeExpeditionSession(session) {
  if (!session) {
    return { message: "遠征中斷。", visitedCount: 0, loot: {}, kills: 0 };
  }
  const visited = session.visitedExplorePoints?.length || 0;
  const loot = session.lootCollected || {};
  const regionId = session.regionId || session.nodeId || "plains_windrest";
  const region = getExpeditionRegionByNodeId(session.nodeId);
  const regionLabel = region?.label?.zh || "遠征區";
  const primaryShard = getRegionLootTable(regionId).primaryShard;
  const primaryCount = Number(loot[primaryShard]) || 0;
  const shardLabel = getShardType(primaryShard).label.zh;
  const kills = session.stats?.kills || 0;

  let message = `${session.companionName}在${regionLabel}邊緣張望了一會兒，還沒來得及深入。`;
  if (kills > 0 && primaryCount > 0) {
    message = `${session.companionName}帶回了 ${primaryCount} 枚${shardLabel}。`;
  } else if (visited > 0) {
    message = `${session.companionName}在${regionLabel}巡視了一陣，造訪了 ${visited} 處可疑地點。`;
  }

  return {
    visitedCount: visited,
    elapsedMs: session.elapsedMs || 0,
    loot,
    kills,
    message
  };
}
