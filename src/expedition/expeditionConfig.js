import { getChapterStatus } from "../data/chapterRegistry.js";
import { hasAdventureProfile } from "../data/companionAdventureProfiles.js";

/** 預設遠征節點（第 2 章 · 風歇草坡）。 */
export const EXPEDITION_LAUNCH_NODE_ID = "plains_windrest";

/** 各遠征節點解鎖章節（current≥N 或已通關該章）。 */
export const EXPEDITION_NODES = Object.freeze({
  plains_windrest: Object.freeze({
    chapterRequired: 2,
    depth: Object.freeze({ id: "near_shore", label: "近岸", duration: "3–4 分鐘" })
  }),
  forge_emberpath: Object.freeze({
    chapterRequired: 3,
    depth: Object.freeze({ id: "turning_path", label: "轉折", duration: "4–6 分鐘" })
  }),
  harbor_quayside: Object.freeze({
    chapterRequired: 4,
    depth: Object.freeze({ id: "deep_path", label: "深徑", duration: "5–7 分鐘" })
  })
});

export const EXPEDITION_FUTURE_DEPTHS = Object.freeze([
  Object.freeze({ id: "far_return", label: "遠回", chapters: Object.freeze([5, 6]) }),
  Object.freeze({ id: "boundary", label: "邊界", chapters: Object.freeze([7]) })
]);

/** 夥伴 AI 決策間隔（毫秒）。 */
export const BRAIN_TICK_MS = 400;

/** 世界座標：單格像素（微縮地景用較小格，方便俯視巡邏）。 */
export const EXPEDITION_TILE_PX = 16;

function getNodeChapterRequired(nodeId) {
  return EXPEDITION_NODES[nodeId]?.chapterRequired ?? 99;
}

export function getExpeditionRouteDepth(nodeId) {
  return EXPEDITION_NODES[nodeId]?.depth || null;
}

/** 單一遠征區是否已解鎖。 */
export function isExpeditionRegionUnlocked(state = {}, nodeId = EXPEDITION_LAUNCH_NODE_ID) {
  const chapterRequired = getNodeChapterRequired(nodeId);
  const status = getChapterStatus(chapterRequired, state.chapterProgress || {});
  return status === "current" || status === "completed";
}

/** 任一遠征區解鎖即視為心域遠征功能開放（地圖入口用）。 */
export function isExpeditionUnlocked(state = {}) {
  return Object.keys(EXPEDITION_NODES).some((nodeId) => isExpeditionRegionUnlocked(state, nodeId));
}

/** 列出目前已解鎖的遠征節點 id（依章節排序）。 */
export function listUnlockedExpeditionNodes(state = {}) {
  return Object.keys(EXPEDITION_NODES).filter((nodeId) => isExpeditionRegionUnlocked(state, nodeId));
}

/**
 * 可否出發（RE-1）：章節解鎖 + 能量 + 正式 adventure profile（fail-closed）。
 */
export function canLaunchExpedition(state = {}, nodeId = EXPEDITION_LAUNCH_NODE_ID) {
  if (!EXPEDITION_NODES[nodeId]) return false;
  if (!isExpeditionRegionUnlocked(state, nodeId)) return false;
  if ((state.energy ?? 0) <= 0) return false;
  // E-PERSONA：沒有正式遠征人格的角色不能開遠征（禁止變身灰影貓）。
  if (!hasAdventureProfile(state.activeCompanionId)) return false;
  return true;
}

