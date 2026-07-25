/**
 * 平原路徑 — R2 先開首關（破月湖後解鎖）；完整五關可於後續內容包補齊。
 */

export const PLAINS_STAGES = Object.freeze([
  Object.freeze({
    id: "plains-1",
    regionId: "plains",
    index: 1,
    title: "風歇草坡",
    goal: "clear",
    goalLabel: "清掉草坡雜訊結",
    copy: "平原路徑開了。風比較大，但節奏可以自己選。",
    clearNarrative: "草坡上的雜訊散了。旅途還長，不必一次走完。",
    dummyName: "草坡雜訊結",
    dummyStability: 80,
    dummyGuardBonus: 2,
    arenaRadius: 1,
    pillars: [{ x: 0.3, y: -0.15, r: 0.1 }],
    playerStart: { x: 0, y: 0.55 },
    dummyStart: { x: -0.1, y: -0.22 }
  })
]);
