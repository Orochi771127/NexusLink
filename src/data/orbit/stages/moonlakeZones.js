export const MOONLAKE_ORBIT_ZONE_ORDER = Object.freeze([
  "starwood_trail",
  "misttide_shore",
  "mirror_hollow",
  "crystal_ruins",
  "rift_observatory"
]);

export const MOONLAKE_ORBIT_ZONES = Object.freeze([
  Object.freeze({
    id: "starwood_trail",
    title: "星林步道",
    englishTitle: "STARLIT FOREST TRAIL",
    theme: "軌跡基礎",
    copy: "先讀懂啟動、折徑與守圈；不是撞得更重，而是讓軌跡變得可預期。",
    firstStageId: "moonlake-1",
    finalStageId: "moonlake-5",
    prerequisiteFinalStageIds: Object.freeze([])
  }),
  Object.freeze({
    id: "misttide_shore",
    title: "霧潮河岸",
    englishTitle: "MISTY TIDE SHORE",
    theme: "收束與克制",
    copy: "潮流會推著化身走。這一區練習何時放慢、何時讓路，而不是追求更大衝擊。",
    firstStageId: "moonlake-6",
    finalStageId: "moonlake-10",
    prerequisiteFinalStageIds: Object.freeze([])
  }),
  Object.freeze({
    id: "mirror_hollow",
    title: "湖心倒影",
    englishTitle: "MIRROR HOLLOW",
    theme: "鏡像精準",
    copy: "同一條軌跡在水面有另一個答案。先完成星林與霧潮，倒影才會穩定。",
    firstStageId: "moonlake-11",
    finalStageId: "moonlake-15",
    prerequisiteFinalStageIds: Object.freeze(["moonlake-5", "moonlake-10"])
  }),
  Object.freeze({
    id: "crystal_ruins",
    title: "晶岩遺跡",
    englishTitle: "CRYSTALLINE RUINS",
    theme: "折光與複合",
    copy: "護盾柱不只是阻礙，也是改寫方向的介面。把反彈、清理與停泊接成一段。",
    firstStageId: "moonlake-16",
    finalStageId: "moonlake-20",
    prerequisiteFinalStageIds: Object.freeze(["moonlake-15"])
  }),
  Object.freeze({
    id: "rift_observatory",
    title: "裂隙觀測點",
    englishTitle: "RIFT OBSERVATORY",
    theme: "綜合觀測",
    copy: "最後一區不考戰力。它要求你們把撐住、轉向、回收與共鳴放在同一條邊界上。",
    firstStageId: "moonlake-21",
    finalStageId: "moonlake-25",
    prerequisiteFinalStageIds: Object.freeze(["moonlake-20"])
  })
]);

const ZONE_BY_ID = new Map(MOONLAKE_ORBIT_ZONES.map((zone) => [zone.id, zone]));

export function getMoonlakeOrbitZone(zoneId) {
  return ZONE_BY_ID.get(zoneId) || null;
}

export function isMoonlakeOrbitZoneId(zoneId) {
  return ZONE_BY_ID.has(zoneId);
}
