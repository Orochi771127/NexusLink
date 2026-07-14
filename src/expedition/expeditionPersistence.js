import { clamp } from "../utils/clamp.js";
import { getShardType, getRegionLootTable } from "../data/lootTables.js";
import { getMemoryEventForExplorePoint } from "../data/expeditionMemoryEvents.js";
import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { EmotionDict } from "../data/emotionDictionary.js";

const MAX_VAULT_LOGS = 12;

/**
 * 遠征結算 → state patch（純函數，不寫 store）。
 */
export function buildExpeditionSettlement(session, { retreated = false } = {}, existingVault = {}) {
  const rel = session?.relationship || {};
  let bond = Number(rel.bond) || 0;
  let trust = Number(rel.trust) || 0;
  let energy = Number(rel.energy) || 0;

  const loot = session?.lootCollected || {};
  const regionId = session?.regionId || "plains_windrest";
  const primaryShard = getRegionLootTable(regionId).primaryShard;
  const primaryCount = Number(loot[primaryShard]) || 0;
  const kills = session?.stats?.kills || 0;
  const visited = session?.visitedExplorePoints?.length || 0;
  const memoryEvents = session?.triggeredMemoryEvents?.length || 0;

  // 能量消耗：出門本身的成本（與擊殺／碎晶脫鉤）。
  energy = Math.max(0, energy - 1);

  // RE-1 E-FARM：關係成長來自共同發現／尊重節奏，不是擊殺或碎晶農場。
  // 每趟硬上限 bond/trust 各 +2。
  let bondGain = 0;
  let trustGain = 0;
  if (memoryEvents >= 1 && !retreated) bondGain += 1;
  if (memoryEvents >= 2 && !retreated) trustGain += 1;
  if (visited >= 2 && !retreated) bondGain += 1;
  if (visited >= 3 && memoryEvents >= 1 && !retreated) trustGain += 1;
  bondGain = Math.min(2, bondGain);
  trustGain = Math.min(2, trustGain);
  bond = clamp(bond + bondGain, 0, 100);
  trust = clamp(trust + trustGain, 0, 100);
  // primaryCount／kills 只影響 journal／vault，不進關係公式（E-FARM）。

  const vaultPatch = mergeExpeditionVault(existingVault, session, { lootSummary: loot, retreated, kills });
  const memoryObjects = buildExpeditionMemoryObjects(session, Date.now());

  // journal 保留給除錯／摘要；UI 結算發言改走 expeditionSettlementVoice（E-CORE）。
  const journal = buildExpeditionJournal(session, {
    retreated,
    primaryShard,
    primaryCount,
    kills,
    memoryEvents
  });

  return {
    statePatch: { energy, bond, trust },
    vaultPatch,
    memoryObjects,
    lootSummary: loot,
    retreated,
    bondGain,
    trustGain,
    journal
  };
}

export function mergeExpeditionVault(existingVault, session, { lootSummary = {}, retreated = false, kills = 0 } = {}) {
  const base = existingVault && typeof existingVault === "object" ? existingVault : {};
  const shards = { ...(base.shards || {}) };
  Object.entries(lootSummary).forEach(([shardId, count]) => {
    const n = Number(count) || 0;
    if (n <= 0) return;
    shards[shardId] = (Number(shards[shardId]) || 0) + n;
  });

  const logEntry = {
    at: Date.now(),
    regionId: session?.regionId || null,
    loot: { ...lootSummary },
    kills,
    retreated
  };

  const logs = [logEntry, ...(Array.isArray(base.logs) ? base.logs : [])].slice(0, MAX_VAULT_LOGS);

  return {
    shards,
    logs,
    totalExpeditions: (Number(base.totalExpeditions) || 0) + 1,
    lastExpeditionAt: Date.now()
  };
}

export function buildExpeditionMemoryObjects(session, now = Date.now()) {
  const regionId = session?.regionId;
  const points = session?.triggeredMemoryEvents || [];
  return points
    .map((explorePointId) => {
      const event = getMemoryEventForExplorePoint(regionId, explorePointId);
      if (!event) return null;
      const dict = EmotionDict[event.emotion] || EmotionDict.calm;
      return {
        id: `emem_${now}_${event.id}`,
        theme: event.theme || dict.theme,
        label: event.label?.zh || dict.label,
        emotion: event.emotion || dict.key,
        intensity: 0.42,
        symbol: dict.symbol,
        place: dict.place,
        status: "fresh",
        source: "expedition",
        excerpt: event.excerpt,
        createdAt: now,
        lastUpdatedAt: now,
        isVisibleInHabitat: true
      };
    })
    .filter(Boolean);
}

export function buildExpeditionJournal(session, {
  retreated,
  primaryShard = "forest_shard",
  primaryCount = 0,
  kills,
  memoryEvents = 0
}) {
  const name = session?.companionName || "夥伴";
  const region = getExpeditionRegionByNodeId(session?.regionId);
  const regionLabel = region?.label?.zh || "遠征區";
  const shardLabel = getShardType(primaryShard).label.zh;
  const lines = [];

  if (retreated) {
    lines.push(`${name}在${regionLabel}深處停了下來，決定先回到營地。`);
  } else if (kills > 0 && primaryCount > 0) {
    lines.push(`${name}在${regionLabel}謹慎接戰後，帶回了 ${primaryCount} 枚${shardLabel}。`);
  } else if (kills > 0) {
    lines.push(`${name}驅散了${regionLabel}裡的雜訊，但來不及撿齊碎晶。`);
  } else {
    lines.push(`${name}在${regionLabel}巡視了一陣，把可疑的動靜都記在心裡。`);
  }

  if (memoryEvents > 0) {
    lines.push(`這趟遠征留下了 ${memoryEvents} 段短記憶，像風一樣貼在草葉上。`);
  }

  const intent = session?.lastIntent?.reason;
  if (intent && kills === 0 && !retreated && session.lastIntent?.type === "INVESTIGATE") {
    lines.push(intent);
  }

  return lines.join("\n");
}
