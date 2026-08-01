// 共鳴圈引擎（CH-6，docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md §6）。
//
// 一句話：已結緣的夥伴會「陪你站進對峙」——牠們貢獻的是共鳴與陪伴姿態，
// 不是輸出（非戰力隊伍：無排行、無等級、無裝備、無站位、對峙中不換人）。
//
// 設計守則（對齊 CLAUDE.md §1 契約 / §2 紅線）：
//   - 圈內組成在進入對峙前決定（純推導：最早結緣者優先），對峙中不換。
//   - 每隻圈員有自己的「呼吸」（session 內疲勞）；用盡時牠退到圈外喘一口氣——
//     非死亡、非懲罰，下一場自動回來（session 重建即回歸）。
//   - 被動全部輕量（±1/±2、有上限），只往「安撫」方向推，永不懲罰玩家。
//   - 不顯示戰力數字、不做貢獻排行（紅線 6 精神）。
//
// 純函數：零 DOM、零 store。battleEngine 消費 CIRCLE_STANCES；battleController
// 只讀 session.circle 做小像列渲染。

import { getCompanionById } from "../data/companionRegistry.js";

export const MAX_CIRCLE_SIZE = 3; // 主夥伴 + 最多 2 位圈員（Owner 定版：最多三隻同場）
export const MAX_MEMBER_BREATH = 3; // 圈員呼吸：每次姿態發動用 1 口氣，用盡即退圈喘息

// 陪伴姿態（element → 一個輕量被動）。水/木兩例出自設計文件 §6 原文；
// 其餘依五行氣質補齊。line 只在「首次發動」時說一次，避免日誌洗版。
export const CIRCLE_STANCES = Object.freeze({
  wood: {
    id: "wood_recede",
    name: "青蔭",
    hint: "雜訊每拍自然回落",
    line: (name) => `${name}的綠意繞著場邊生長，雜訊自己低了下去。`
  },
  water: {
    id: "water_soothe",
    name: "霜緩",
    hint: "設界時柔光更穩",
    line: (name) => `${name}的水霧滲進邊界，柔光更穩了。`
  },
  earth: {
    id: "earth_ward",
    name: "磐守",
    hint: "湧動的衝擊被擋下一角",
    line: (name) => `${name}往前站了半步，替你們擋下衝擊的一角。`
  },
  fire: {
    id: "fire_ember",
    name: "餘燼",
    hint: "共鳴時雜訊多放輕一分",
    line: (name) => `${name}的餘燼貼著你們的共鳴一起亮，雜訊又輕了一點。`
  },
  metal: {
    id: "metal_chime",
    name: "清鳴",
    hint: "暫歇的靜裡幫你們對上節奏",
    line: (name) => `暫歇的安靜裡，${name}輕輕一鳴，你們的節奏又對上了。`
  },
  neutral: {
    id: "still_watch",
    name: "靜候",
    hint: "心核吃緊時牠會靠近",
    line: (name) => `${name}安靜地靠近半步，心核跟著穩了下來。`
  }
});

export function getCircleStance(element) {
  return CIRCLE_STANCES[element] || CIRCLE_STANCES.neutral;
}

/**
 * 推導本場共鳴圈的圈員（不含主夥伴）。
 * 規則：已結緣（resonance.companions[id].joinedAt）且已解鎖、runtime 可用的夥伴，
 * 依結緣先後（joinedAt 升冪）取最多 MAX_CIRCLE_SIZE - 1 位。
 * 純讀 state，絕不寫入；查無此夥伴（registry fallback 觸發）一律排除。
 */
export function listEligibleResonanceCompanions(state = {}) {
  const activeId = state?.activeCompanionId || "greyshade-cat";
  const unlocked = new Set(Array.isArray(state?.unlockedCompanionIds) ? state.unlockedCompanionIds : []);
  const companions = state?.resonance?.companions || {};

  return Object.keys(companions)
    .filter((id) => {
      const joinedAt = Number(companions[id]?.joinedAt);
      return id !== activeId && Number.isFinite(joinedAt) && joinedAt > 0 && unlocked.has(id);
    })
    .map((id) => ({ id, joinedAt: Number(companions[id].joinedAt) || 0, companion: getCompanionById(id) }))
    .filter(({ id, companion }) => companion && companion.id === id && companion.runtimeEnabled !== false)
    .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))
    .map(({ companion }) => companion);
}

/**
 * 推導本場實際同行者（不含主夥伴）。
 *
 * preferredIds 是 session-only 的邀請清單：一旦呼叫端明示提供，就只會從該
 * 清單依序挑選，不會在無效、鎖定或拒絕的 id 後自動補人。這個 fail-closed
 * 規則避免 UI 選了 A，runtime 卻暗中換成 B。未提供 preferredIds 時仍保留
 * 舊版「最早結緣者優先」行為，讓既有呼叫端與存檔相容。
 */
export function deriveResonanceCircle(state = {}, options = undefined) {
  const eligible = listEligibleResonanceCompanions(state);
  const preferredProvided = Array.isArray(options)
    || Boolean(options && Object.prototype.hasOwnProperty.call(options, "preferredIds"));

  if (!preferredProvided) {
    return eligible.slice(0, MAX_CIRCLE_SIZE - 1);
  }

  const preferredIds = Array.isArray(options)
    ? options
    : Array.isArray(options?.preferredIds)
      ? options.preferredIds
      : [];
  const eligibleById = new Map(eligible.map((companion) => [companion.id, companion]));
  const selected = [];
  const seen = new Set();

  for (const rawId of preferredIds) {
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const companion = eligibleById.get(id);
    if (!companion) continue;
    selected.push(companion);
    if (selected.length >= MAX_CIRCLE_SIZE - 1) break;
  }

  return selected;
}
