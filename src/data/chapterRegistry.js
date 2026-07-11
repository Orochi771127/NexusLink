// 章節旅程骨架（CH-4，docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md §4）。
// 七區各為一章，自月湖營地（世界觀區號 5）起。每章一位「相遇」心核夥伴與
// 一個裂隙情緒主題；相遇/共鳴邀請的玩法觸發屬 CH-5，本檔只是資料與純函數。
//
// companionId＝**正式相遇名單**（2026-07-11 GROUNDWORK 定案，設計文件 §4）：
// 新五幼獸資產已升級入庫（assets/ + companionRegistry runtime-ready）。
// 相遇/共鳴邀請的玩法觸發仍屬 CH-5b（尚未實裝）；本欄目前僅為資料，
// 尚無 runtime 消費者，CH-5b 開工時以此為準接線。

export const CHAPTER_COUNT = 7;

export const CHAPTERS = Object.freeze([
  Object.freeze({ chapter: 1, regionId: "moonlake", zh: "月湖營地", companionId: null, riftEmotion: "fatigue" }),
  Object.freeze({ chapter: 2, regionId: "plains", zh: "北部翠綠平原區", companionId: "sprigfawn", riftEmotion: "loneliness" }),
  Object.freeze({ chapter: 3, regionId: "forge", zh: "東南熔爐丘陵區", companionId: "starstripe-cub", riftEmotion: "anger" }),
  Object.freeze({ chapter: 4, regionId: "harbor", zh: "南港", companionId: "auriowl", riftEmotion: "anxiety" }),
  Object.freeze({ chapter: 5, regionId: "core", zh: "中央輝耀核心區", companionId: "blazetail-kit", riftEmotion: "sadness" }),
  Object.freeze({ chapter: 6, regionId: "tidal", zh: "西南潮汐邊疆區", companionId: "crystalfin-seahorse", riftEmotion: "mixed" }),
  Object.freeze({ chapter: 7, regionId: "mystic", zh: "秘境山脈核心", companionId: null, riftEmotion: "all" })
]);

// 章節試煉（CH-5a）：當前章以「穩住 / 回收」結束裂隙對峙即通關（Owner 可改規則）。
// overwhelmed_but_safe / retreated 不算失敗、也不懲罰——只是這一章還沒走完。
export const CHAPTER_TRIAL_OUTCOMES = Object.freeze(new Set(["stabilized", "recovered"]));

/**
 * 節點 → 章節歸屬（CH-5a 防刷）：試煉只在「對峙節點屬於當前章」時推進，
 * 否則第一章的節點可以原地刷穿七章。現有探索節點全部在月湖營地周邊＝第 1 章；
 * 之後各章的節點/劇情上線時（CH-5b+），在此擴充對映。未知節點回傳 1（保守）。
 */
export function getChapterForNode(nodeId) {
  void nodeId; // 現階段所有節點皆屬第 1 章；參數保留給未來章節節點。
  return 1;
}

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
