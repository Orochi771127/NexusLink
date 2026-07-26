/**
 * 月湖路徑 — 五關彈珠式闖關（R2）
 *
 * goal 類型：
 * - clear：撞散雜訊結（穩定性歸零或出場）
 * - survive：撐過指定秒數且化身仍在場
 * - reach_anchor：化身抵達錨點
 */

export const MOONLAKE_STAGES = Object.freeze([
  Object.freeze({
    id: "moonlake-1",
    regionId: "moonlake",
    index: 1,
    title: "湖心訓練",
    goal: "clear",
    goalLabel: "清掉訓練雜訊結",
    copy: "先熟悉拉動與旋轉。化身不是夥伴本人。",
    clearNarrative: "湖心安靜了一點。第一顆微光像露水一樣亮了一下。",
    dummyName: "訓練雜訊結",
    dummyStability: 70,
    dummyGuardBonus: 0,
    arenaRadius: 1,
    pillars: [],
    playerStart: { x: 0, y: 0.55 },
    dummyStart: { x: 0, y: -0.25 }
  }),
  Object.freeze({
    id: "moonlake-2",
    regionId: "moonlake",
    index: 2,
    title: "薄界窄徑",
    goal: "clear",
    goalLabel: "在窄徑裡清掉雜訊結",
    copy: "邊界變窄了。擦邊可以加速，但太用力會出場。",
    clearNarrative: "窄徑裡的雜訊被撥開。你們沒有硬撞過界。",
    dummyName: "窄徑雜訊結",
    dummyStability: 78,
    dummyGuardBonus: 4,
    arenaRadius: 0.78,
    pillars: [
      { x: -0.35, y: 0.05, r: 0.1 },
      { x: 0.35, y: -0.1, r: 0.1 }
    ],
    playerStart: { x: 0, y: 0.48 },
    dummyStart: { x: 0.1, y: -0.2 }
  }),
  Object.freeze({
    id: "moonlake-3",
    regionId: "moonlake",
    index: 3,
    title: "撐過漣漪",
    goal: "survive",
    goalLabel: "撐過 15 秒漣漪",
    copy: "不必趕盡殺絕。在場上稳住，讓漣漪過去就好。",
    clearNarrative: "漣漪退去。懂得撐住，也是一種一起。",
    dummyName: "漣漪雜訊",
    dummyStability: 120,
    dummyGuardBonus: 10,
    arenaRadius: 1,
    surviveSeconds: 15,
    containedArena: true,
    physicsTuning: Object.freeze({
      friction: 0.18,
      driveScale: 0.72,
      driveTargetSpeed: 2.35,
      speedCap: 2.8,
      dummyDriveScale: 0.24,
      dummyDriveTargetSpeed: 1.25,
      dummySpeedCap: 1.7
    }),
    collisionTuning: Object.freeze({
      damageScaleToA: 0.18,
      damageScaleToB: 0.6
    }),
    pillars: [{ x: 0, y: 0, r: 0.08 }],
    playerStart: { x: 0, y: 0.55 },
    dummyStart: { x: -0.2, y: -0.15 }
  }),
  Object.freeze({
    id: "moonlake-4",
    regionId: "moonlake",
    index: 4,
    title: "錨點微光",
    goal: "reach_anchor",
    goalLabel: "抵達北側錨點",
    copy: "把化身送到微光錨點。撞散不是唯一答案。",
    clearNarrative: "錨點亮了。有一絲微光被你們一起接住。",
    dummyName: "游移雜訊",
    dummyStability: 90,
    dummyGuardBonus: 2,
    arenaRadius: 1,
    pillars: [{ x: 0.4, y: 0.15, r: 0.09 }],
    anchor: { x: 0, y: -0.62, r: 0.14 },
    playerStart: { x: 0, y: 0.55 },
    dummyStart: { x: 0.25, y: 0 }
  }),
  Object.freeze({
    id: "moonlake-5",
    regionId: "moonlake",
    index: 5,
    title: "月湖終關",
    goal: "clear",
    goalLabel: "清掉終關雜訊結",
    copy: "月湖路徑的最後一轉。穩一點，別急著核散自己。",
    clearNarrative: "月湖路徑靜下來了。往平原的方向，好像亮了一點。",
    dummyName: "終關雜訊結",
    dummyStability: 95,
    dummyGuardBonus: 8,
    arenaRadius: 0.92,
    pillars: [
      { x: -0.4, y: -0.2, r: 0.09 },
      { x: 0.4, y: 0.2, r: 0.09 }
    ],
    playerStart: { x: 0, y: 0.5 },
    dummyStart: { x: 0, y: -0.3 },
    unlocksNextRegion: "plains"
  })
]);
