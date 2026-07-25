import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { getRegionLootTable } from "../data/lootTables.js";
import { formatBroughtMotesLine } from "./lootPresentation.js";
import { getAdventureProfile } from "../data/companionAdventureProfiles.js";
import { bootstrapExpeditionEncounter } from "./encounterDirector.js";
import { createSessionHeart } from "./sessionHeart.js";

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

  // RE-1 E-PERSONA：無正式 profile 直接拒絕建 session。
  const profile = getAdventureProfile(companionId);
  if (!profile) return null;
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
    /** 安全出口：永遠成功，不走信任閘（RE-1 E-EXIT）。 */
    returnHomeRequested: false,
    playerInterventions: 0,
    /**
     * Session heart：場內情緒（不可持久化）。
     * 見 sessionHeart.js；結束後只影響結算政策，不整包寫回存檔。
     */
    heart: createSessionHeart(
      {
        bond: Number(state.bond) || 0,
        trust: Number(state.trust) || 0,
        mood: state.mood || "calm",
        energy: Number(state.energy) || 0,
        defense: Number(state.defense) || 0
      },
      profile
    ),
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
      reason: "牠在入口附近嗅了嗅，準備開始巡邏。",
      confidence: 1
    },
    visitedExplorePoints: [],
    triggeredMemoryEvents: [],
    pendingMemoryEvent: null,
    /** 記憶 excerpt 之後的短回聲（session-only）。 */
    pendingMemoryEcho: null,
    /** 旁白停頓截止時間（epoch ms）；期間不重算 Utility AI。 */
    memoryHoldUntil: 0,
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
  const kills = session.stats?.kills || 0;

  let message = `${session.companionName}在${regionLabel}邊緣張望了一會兒，還沒來得及深入。`;
  if (kills > 0 && primaryCount > 0) {
    message = formatBroughtMotesLine({
      companionName: session.companionName,
      shardId: primaryShard,
      count: primaryCount,
      regionLabel
    });
  } else if (visited > 0) {
    message = `${session.companionName}在${regionLabel}巡視了一陣，看過幾處讓人心安或心懸的地方。`;
  }

  return {
    visitedCount: visited,
    elapsedMs: session.elapsedMs || 0,
    loot,
    kills,
    message
  };
}
