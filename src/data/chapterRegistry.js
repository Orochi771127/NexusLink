// 章節旅程骨架（CH-4，docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md §4）。
// 七區各為一章，自月湖營地（世界觀區號 5）起。每章一位「相遇」心核夥伴與
// 一個裂隙情緒主題；相遇/共鳴邀請的玩法觸發屬 CH-5，本檔只是資料與純函數。
//
// 注意：companionId 是「該章預定相遇者」；若玩家初遇已選定該夥伴，
// 該章相遇對象由 CH-5 的替補規則另行解析（見 resolveChapterCompanion 註解）。

export const CHAPTER_COUNT = 7;

export const CHAPTERS = Object.freeze([
  Object.freeze({ chapter: 1, regionId: "moonlake", zh: "月湖營地", companionId: null, riftEmotion: "fatigue" }),
  Object.freeze({ chapter: 2, regionId: "plains", zh: "北部翠綠平原區", companionId: "vine-twist", riftEmotion: "loneliness" }),
  Object.freeze({ chapter: 3, regionId: "forge", zh: "東南熔爐丘陵區", companionId: "stone-shard", riftEmotion: "anger" }),
  Object.freeze({ chapter: 4, regionId: "harbor", zh: "南港", companionId: "crystal-rabbit", riftEmotion: "anxiety" }),
  Object.freeze({ chapter: 5, regionId: "core", zh: "中央輝耀核心區", companionId: "flame-flicker", riftEmotion: "sadness" }),
  Object.freeze({ chapter: 6, regionId: "tidal", zh: "西南潮汐邊疆區", companionId: "ice-talon", riftEmotion: "mixed" }),
  Object.freeze({ chapter: 7, regionId: "mystic", zh: "秘境山脈核心", companionId: null, riftEmotion: "all" })
]);

export function getChapterByNumber(chapterNo) {
  return CHAPTERS.find((entry) => entry.chapter === Number(chapterNo)) || null;
}

export function getChapterForRegion(regionId) {
  return CHAPTERS.find((entry) => entry.regionId === regionId) || null;
}

/** 章節狀態："current" | "completed" | "locked"。 */
export function getChapterStatus(chapterNo, chapterProgress = {}) {
  const no = Number(chapterNo);
  const completed = Array.isArray(chapterProgress.completed) ? chapterProgress.completed : [];
  if (completed.includes(no)) return "completed";
  if (no === Number(chapterProgress.current)) return "current";
  return "locked";
}

/**
 * 通關推進（純函數，CH-5 由章節對峙結算調用）：
 * 把 chapterNo 記入 completed，current 前進到下一未完成章（最終章封頂）。
 * 只推進「當前章」；重複通關舊章不回退、不重複記錄。
 */
export function advanceChapterProgress(chapterProgress = {}, chapterNo) {
  const no = Number(chapterNo);
  const current = Number(chapterProgress.current) || 1;
  const completed = Array.isArray(chapterProgress.completed) ? [...chapterProgress.completed] : [];
  if (!Number.isInteger(no) || no < 1 || no > CHAPTER_COUNT) return { current, completed };
  if (!completed.includes(no)) completed.push(no);
  completed.sort((a, b) => a - b);
  const nextCurrent = no === current ? Math.min(current + 1, CHAPTER_COUNT) : current;
  return { current: nextCurrent, completed };
}
