/**
 * 心核迴旋戰結算匯流（R4）
 *
 * 設計理念（給初階開發者）：
 * - 遠征與迴旋戰共用 `expeditionVault.shards` 當「微光痕跡」倉庫。
 * - 通關可寫入有限 lived evidence（sourceType=exploration），不升階、不改 bond/trust。
 * - 對決不走本模組發獎，避免連戰農場。
 * - 絕不呼叫 buildExpeditionSettlement（那會動關係數值）。
 */

import { getShardDisplayLabel } from "../expedition/lootPresentation.js";

/** 迴旋區域 → 微光種類（對齊遠征三色語意） */
export const ORBIT_REGION_SHARD = Object.freeze({
  moonlake: "tide_shard",
  plains: "forest_shard",
  forge: "ember_shard",
  harbor: "tide_shard",
  core: "ember_shard",
  tidal: "tide_shard",
  mystic: "forest_shard"
});

const ALLOWED_SHARDS = new Set(["forest_shard", "tide_shard", "ember_shard"]);

/**
 * 從 vault 讀取可進場的微光（遠征→迴旋戰進場路徑）。
 * 不消耗；只描述「帶著微光進場」。
 */
export function describeOrbitEntryFromVault(vault, regionId = "moonlake") {
  const shards = vault?.shards && typeof vault.shards === "object" ? vault.shards : {};
  const preferred = ORBIT_REGION_SHARD[regionId] || "tide_shard";
  const preferredCount = Math.max(0, Math.floor(Number(shards[preferred]) || 0));
  if (preferredCount > 0) {
    return {
      hasMote: true,
      shardId: preferred,
      count: preferredCount,
      line: `帶著${getShardDisplayLabel(preferred, "zh")}進場——遠征留下的同行痕跡。`
    };
  }
  // 任一微光也可進場敘事
  for (const shardId of ALLOWED_SHARDS) {
    const count = Math.max(0, Math.floor(Number(shards[shardId]) || 0));
    if (count > 0) {
      return {
        hasMote: true,
        shardId,
        count,
        line: `帶著${getShardDisplayLabel(shardId, "zh")}進場——遠征留下的同行痕跡。`
      };
    }
  }
  return {
    hasMote: false,
    shardId: null,
    count: 0,
    line: "沒有遠征微光也沒關係。化身仍可進場，只是軌道會安靜一些。"
  };
}

/**
 * 有微光時略增 Burst 顯示（投影加成，非永久 ATK）。
 */
export function applyOrbitEntryAttunement(stats, entry) {
  const base = { ...(stats || {}) };
  if (!entry?.hasMote) return { ...base, entryAttuned: false };
  return {
    ...base,
    burst: Math.min(90, Math.round((base.burst || 10) + 6)),
    entryAttuned: true,
    entryShardId: entry.shardId
  };
}

/**
 * 薄合併 vault shards；不增加 totalExpeditions。
 */
export function mergeOrbitVaultShards(existingVault, shardId, amount = 1) {
  if (!ALLOWED_SHARDS.has(shardId)) {
    return { ok: false, reason: "unknown_shard", vault: existingVault || { shards: {} } };
  }
  const add = Math.max(0, Math.floor(Number(amount) || 0));
  const prev = existingVault && typeof existingVault === "object" ? existingVault : {};
  const prevShards = prev.shards && typeof prev.shards === "object" ? { ...prev.shards } : {};
  const nextCount = Math.min(99999, (Math.floor(Number(prevShards[shardId]) || 0) + add));
  if (add > 0) prevShards[shardId] = nextCount;
  return {
    ok: true,
    reason: null,
    vault: {
      shards: prevShards,
      logs: Array.isArray(prev.logs) ? prev.logs : [],
      totalExpeditions: Math.max(0, Math.floor(Number(prev.totalExpeditions) || 0)),
      lastExpeditionAt: Number(prev.lastExpeditionAt) || null
    },
    granted: { shardId, amount: add, total: nextCount }
  };
}

/**
 * 建 growth input（exploration family；對齊 mapController 先例）。
 */
export function buildOrbitGrowthInput({
  companionId,
  stageId,
  chapterNo = 1,
  createdAt = Date.now(),
  safeHarborMode = false,
  tendency = "pathfinding"
} = {}) {
  if (!companionId || !stageId) {
    return { ok: false, reason: "missing_ids", input: null };
  }
  if (safeHarborMode) {
    return { ok: false, reason: "safe_harbor_zero_evidence", input: null };
  }
  return {
    ok: true,
    reason: null,
    input: {
      companionId,
      sourceType: "exploration",
      tendency,
      context: {
        chapterNo: Math.max(1, Math.min(7, Math.floor(Number(chapterNo) || 1))),
        nodeId: String(stageId),
        choiceId: "orbit_clear"
      },
      createdAt: Number(createdAt) || Date.now(),
      completed: true,
      completionStatus: "completed",
      safetyProvenance: {
        isHighRisk: false,
        strategyId: null,
        actionId: null,
        systemRoleSafetyReply: false,
        safetyModeActive: false,
        safeHarborModeActive: false
      }
    }
  };
}

/**
 * 通關結算計畫（純資料；由 controller 寫入 store）。
 *
 * @param {{
 *  stage: { id: string, regionId: string, clearNarrative?: string },
 *  alreadyCleared: boolean,
 *  companionId: string,
 *  chapterNo?: number,
 *  safeHarborMode?: boolean,
 *  existingVault?: object
 * }} opts
 */
export function planOrbitStageSettlement(opts = {}) {
  const stage = opts.stage;
  if (!stage?.id) {
    return {
      ok: false,
      shouldGrant: false,
      shardGrant: null,
      growth: null,
      moteLine: null,
      reason: "missing_stage"
    };
  }

  // 重複通關：進度可重玩，但不重複發微光／evidence
  if (opts.alreadyCleared) {
    return {
      ok: true,
      shouldGrant: false,
      shardGrant: null,
      growth: null,
      moteLine: "這條路徑你們走過了。痕跡還在，不必再摘一次微光。",
      reason: "already_cleared"
    };
  }

  const shardId = ORBIT_REGION_SHARD[stage.regionId] || "tide_shard";
  const vaultMerge = mergeOrbitVaultShards(opts.existingVault, shardId, 1);
  const growth = buildOrbitGrowthInput({
    companionId: opts.companionId,
    stageId: stage.id,
    chapterNo: opts.chapterNo,
    safeHarborMode: opts.safeHarborMode === true,
    tendency:
      stage.goal === "survive" ||
      stage.objectives?.some?.((objective) => objective.type === "survive")
        ? "steadfastness"
        : "pathfinding"
  });

  const label = getShardDisplayLabel(shardId, "zh");
  return {
    ok: true,
    shouldGrant: true,
    shardGrant: vaultMerge.ok
      ? { shardId, amount: 1, nextVault: vaultMerge.vault }
      : null,
    growth: growth.ok ? growth.input : null,
    growthSkipReason: growth.ok ? null : growth.reason,
    moteLine: `軌道上留下一縷${label}——是同行痕跡，不是戰利品。`,
    narrative: stage.clearNarrative || null,
    reason: "first_clear"
  };
}
