/**
 * Authored Standoff tension by chapter.
 *
 * These profiles adjust readable intent cadence only. They never override
 * retreat, refusal, D2 safety terminals or guaranteed repair reachability.
 */
export const STANDOFF_TENSION_PROFILES = Object.freeze([
  Object.freeze({
    id: "hear_the_noise",
    label: "聽見雜訊",
    chapters: Object.freeze([1]),
    copy: "雜訊會留下較長的觀察空拍，讓玩家先讀懂預示。",
    intentBias: Object.freeze({ surge: -0.12, gather: 0, lull: 0.12 })
  }),
  Object.freeze({
    id: "overlapping_echoes",
    label: "交疊回聲",
    chapters: Object.freeze([2]),
    copy: "兩種預示開始交替，但仍保留明顯的修正窗口。",
    intentBias: Object.freeze({ surge: -0.04, gather: 0.04, lull: 0 })
  }),
  Object.freeze({
    id: "boundary_pressure",
    label: "邊界風壓",
    chapters: Object.freeze([3, 4]),
    copy: "湧動更常要求先立界，再把節奏接回來。",
    intentBias: Object.freeze({ surge: 0.06, gather: 0.02, lull: -0.08 })
  }),
  Object.freeze({
    id: "memory_return",
    label: "記憶回潮",
    chapters: Object.freeze([5, 6]),
    copy: "蓄能與暫歇交錯，回收記憶的時機更需要判讀。",
    intentBias: Object.freeze({ surge: 0.04, gather: 0.08, lull: -0.12 })
  }),
  Object.freeze({
    id: "rift_ensemble",
    label: "裂隙合奏",
    chapters: Object.freeze([7]),
    copy: "三種預示完整交錯；安全終端與撤退仍永遠優先。",
    intentBias: Object.freeze({ surge: 0.1, gather: 0.06, lull: -0.16 })
  })
]);

export function getStandoffTensionProfile(chapterNo = 1) {
  const chapter = Math.max(1, Math.min(7, Math.floor(Number(chapterNo) || 1)));
  return STANDOFF_TENSION_PROFILES.find((profile) =>
    profile.chapters.includes(chapter)
  ) || STANDOFF_TENSION_PROFILES[0];
}
