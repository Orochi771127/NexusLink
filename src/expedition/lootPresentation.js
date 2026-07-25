/**
 * Pack D — Expedition loot semantics（遠征戰利品語意）
 *
 * 引擎仍用 shardId + 數量；本模組只改「玩家讀到的意思」：
 * 微光是同行痕跡，不是刷怪戰利品／戰力貨幣。
 */

import { getShardType } from "../data/lootTables.js";

/** 質性數量帶：避免「帶回 17 枚」的農場感。 */
export function describeMoteAmount(count, lang = "zh") {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  const useEn = String(lang).toLowerCase().startsWith("en");
  if (n <= 0) return useEn ? "none" : "沒有";
  if (n <= 2) return useEn ? "a few" : "幾縷";
  if (n <= 5) return useEn ? "some" : "一些";
  return useEn ? "quite a few" : "不少";
}

export function getShardDisplayLabel(shardId, lang = "zh") {
  const shard = getShardType(shardId);
  const useEn = String(lang).toLowerCase().startsWith("en");
  return useEn ? (shard.label?.en || shard.id) : (shard.label?.zh || shard.id);
}

/** 結算／日誌：帶回微光的質性句。 */
export function formatBroughtMotesLine({
  companionName = "夥伴",
  shardId,
  count,
  regionLabel = "",
  lang = "zh"
} = {}) {
  const useEn = String(lang).toLowerCase().startsWith("en");
  const label = getShardDisplayLabel(shardId, lang);
  const amount = describeMoteAmount(count, lang);
  const n = Math.max(0, Math.floor(Number(count) || 0));
  if (n <= 0) {
    return useEn
      ? `${companionName} returned without gathering light-traces.`
      : `${companionName}回來了，這次沒有帶回微光痕跡。`;
  }
  if (useEn) {
    const place = regionLabel ? ` from ${regionLabel}` : "";
    return `${companionName} brought ${amount} ${label}${place} — shared traces, not trophies.`;
  }
  if (regionLabel) {
    return `${companionName}從${regionLabel}帶回了${amount}${label}——是同行痕跡，不是戰利品。`;
  }
  return `${companionName}帶回了${amount}${label}——是同行痕跡，不是戰利品。`;
}

/** 探索頁條帶：數字可保留（庫存需要），標籤強調微光語意。 */
export function formatVaultMoteStripLabel(shardId, count, lang = "zh") {
  const useEn = String(lang).toLowerCase().startsWith("en");
  const label = getShardDisplayLabel(shardId, lang);
  const n = Math.max(0, Math.floor(Number(count) || 0));
  if (useEn) return { count: n, label: `${label} traces` };
  return { count: n, label: `${label}痕跡` };
}

/** 靜態掃描用：玩家文案應避開的農場戰利品框架（允許「非刷怪」否定句）。 */
export const LOOT_FARM_FRAMING_RE = /戰利品箱|掉落表|刷碎晶|升戰力|裝備強化|loot box/i;
