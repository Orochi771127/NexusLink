/**
 * Dynamic Chapter Encounter Resolver（Pack 4）
 *
 * 設計理念：
 * - 章節只決定「這裡會發生一場相遇」，不硬鎖唯一 companionId。
 * - Resolver 依玩家既有關係挑第一個「尚未認識」的候選；已認識者不重跑初遇。
 * - 候選用盡 → 有意義的 fallback 事件（不是空轉）。
 * - 純函數、可重入（idempotent）：已寫入 resolvedCompanionId / fallbackEventId 則不再演出。
 */

import { getChapterByNumber } from "../data/chapterRegistry.js";

/** 心輝議會輪替池：preferred 之後的備援順序。 */
export const CHAPTER_ENCOUNTER_POOL = Object.freeze([
  "sprigfawn",
  "starstripe-cub",
  "auriowl",
  "blazetail-kit",
  "crystalfin-seahorse"
]);

const DEFAULT_FALLBACK_LINES = Object.freeze([
  "這片土地記得你們的腳步，卻沒有新的身影停下來。",
  "風裡有一點熟悉的溫度——像是已經相遇過的人，在更遠的地方看著你們。",
  "這一站不必再初遇。把目光放回同行的夥伴，就夠了。"
]);

/**
 * 收集「已認識」的 companionId（不可再走初遇）。
 * 來源：active、unlocked、resonance.metAt / joinedAt。
 */
export function collectKnownCompanionIds(state = {}) {
  const known = new Set();
  const activeId = state.activeCompanionId;
  if (activeId) known.add(String(activeId));

  const unlocked = Array.isArray(state.unlockedCompanionIds) ? state.unlockedCompanionIds : [];
  for (const id of unlocked) {
    if (id) known.add(String(id));
  }

  const companions = state.resonance?.companions && typeof state.resonance.companions === "object"
    ? state.resonance.companions
    : {};
  for (const [id, entry] of Object.entries(companions)) {
    if (!id || !entry) continue;
    if (entry.metAt || entry.joinedAt) known.add(String(id));
  }

  return known;
}

export function isCompanionAlreadyKnown(state, companionId) {
  if (!companionId) return true;
  return collectKnownCompanionIds(state).has(String(companionId));
}

/**
 * 章節相遇候選：preferred（registry companionId）→ 議會池其餘。
 * 第 1／7 章無 preferred → 空陣列（走 fallback 或 skip）。
 */
export function listChapterEncounterCandidates(chapterNo) {
  const chapter = getChapterByNumber(chapterNo);
  if (!chapter) return [];
  const preferred = chapter.companionId || null;
  const ordered = [];
  if (preferred) ordered.push(preferred);
  for (const id of CHAPTER_ENCOUNTER_POOL) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  // 無 preferred 的章（如 ch7）不應從池裡硬塞初遇——只回空，讓 fallback 承接。
  if (!preferred) return [];
  return ordered;
}

export function buildChapterFallbackEventId(chapterNo) {
  return `chapter_${Number(chapterNo)}_quiet_echo`;
}

export function getChapterFallbackLines(chapterNo) {
  return DEFAULT_FALLBACK_LINES;
}

/**
 * 解析本章遭遇（不寫 state）。
 * @returns {{
 *   kind: "skip"|"already_met"|"already_fallback"|"meet"|"fallback",
 *   companionId?: string|null,
 *   preferredCompanionId?: string|null,
 *   usedAlternate?: boolean,
 *   eventId?: string,
 *   lines?: string[],
 *   reason?: string
 * }}
 */
export function resolveChapterEncounter(state = {}, chapterNo) {
  const no = Number(chapterNo);
  if (!Number.isInteger(no) || no <= 1) {
    return { kind: "skip", reason: "home_or_invalid_chapter" };
  }

  const mark = state.resonance?.chapterMarks?.[no] || {};
  const preferred = getChapterByNumber(no)?.companionId || null;

  if (mark.resolvedCompanionId) {
    return {
      kind: "already_met",
      companionId: mark.resolvedCompanionId,
      preferredCompanionId: preferred,
      usedAlternate: Boolean(preferred && mark.resolvedCompanionId !== preferred),
      reason: "resolved_companion_present"
    };
  }

  if (mark.fallbackEventId) {
    return {
      kind: "already_fallback",
      eventId: mark.fallbackEventId,
      companionId: null,
      preferredCompanionId: preferred,
      reason: "fallback_already_recorded"
    };
  }

  const candidates = listChapterEncounterCandidates(no);
  if (!candidates.length) {
    return {
      kind: "fallback",
      companionId: null,
      preferredCompanionId: preferred,
      eventId: buildChapterFallbackEventId(no),
      lines: [...getChapterFallbackLines(no)],
      reason: "no_candidates"
    };
  }

  const known = collectKnownCompanionIds(state);
  const pick = candidates.find((id) => !known.has(id)) || null;
  if (!pick) {
    return {
      kind: "fallback",
      companionId: null,
      preferredCompanionId: preferred,
      eventId: buildChapterFallbackEventId(no),
      lines: [...getChapterFallbackLines(no)],
      reason: "all_candidates_known"
    };
  }

  return {
    kind: "meet",
    companionId: pick,
    preferredCompanionId: preferred,
    usedAlternate: Boolean(preferred && pick !== preferred),
    reason: "first_eligible_candidate"
  };
}
