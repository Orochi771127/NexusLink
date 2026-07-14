/**
 * 遠征區域地圖資料（半固定：邊界/障礙/探索點固定，敵人 Phase C 再隨機）。
 * 美術定位：3D 微縮模型／黏土樹脂 diorama——程式端以圓角色塊 placeholder 呈現。
 */

/** @typedef {{ id: string, x: number, y: number, r: number }} CircleObstacle */
/** @typedef {{ id: string, x: number, y: number, w: number, h: number, r?: number }} RectObstacle */
/** @typedef {{ id: string, x: number, y: number, kind?: string }} ExplorePoint */

export const PLAINS_WINDREST_REGION = Object.freeze({
  id: "plains_windrest",
  nodeId: "plains_windrest",
  label: { zh: "風歇草坡", en: "Windrest Meadow" },
  regionLabel: { zh: "北部翠綠平原", en: "Northern Verdant Plains" },
  /** 約 3 個螢幕寬（390×3）的俯視地景。 */
  worldWidth: 1170,
  worldHeight: 780,
  /** 夥伴出生點（入口營地側）。 */
  spawn: Object.freeze({ x: 140, y: 390 }),
  /** 圓形障礙：樹叢、岩石（樹脂塊）。 */
  circleObstacles: Object.freeze([
    { id: "rock_a", x: 320, y: 280, r: 36 },
    { id: "rock_b", x: 540, y: 520, r: 44 },
    { id: "bush_a", x: 780, y: 220, r: 28 },
    { id: "bush_b", x: 920, y: 460, r: 32 },
    { id: "bush_c", x: 640, y: 640, r: 26 }
  ]),
  /** 矩形障礙：古老樹根、地塊隆起。 */
  rectObstacles: Object.freeze([
    { id: "root_mound", x: 860, y: 120, w: 120, h: 64, r: 18 },
    { id: "grass_ridge", x: 420, y: 600, w: 200, h: 48, r: 14 }
  ]),
  /** 可調查的探索點（Phase B 巡邏目標）。 */
  explorePoints: Object.freeze([
    { id: "ep_crystal", x: 480, y: 340, kind: "crystal" },
    { id: "ep_flower", x: 720, y: 380, kind: "flowers" },
    { id: "ep_hidden", x: 980, y: 280, kind: "hidden" },
    { id: "ep_rest", x: 300, y: 560, kind: "rest" }
  ]),
  /**
   * 敵人生成池（Phase 2：半隨機）。
   * 每場遠征從 anchors 挑位置，± jitter 偏移。
   */
  enemySpawnPools: Object.freeze([
    {
      enemyId: "hollow_echo",
      threat: 0.52,
      anchors: Object.freeze([{ x: 650, y: 320 }, { x: 580, y: 400 }])
    },
    {
      enemyId: "drift_murmur",
      threat: 0.38,
      anchors: Object.freeze([{ x: 820, y: 480 }, { x: 760, y: 360 }])
    }
  ]),
  /** 地面色塊（黏土 diorama 分區）。 */
  groundPatches: Object.freeze([
    { x: 0, y: 0, w: 1170, h: 780, color: 0x4a6741 },
    { x: 380, y: 80, w: 420, h: 280, color: 0x527552 },
    { x: 720, y: 420, w: 380, h: 300, color: 0x3f5a38 }
  ]),
  /** 區域氛圍：草坡微風（Phase 4A）。 */
  atmosphere: Object.freeze({
    id: "windrest_breeze",
    tint: 0x9fd4a0,
    tintAlpha: 0.05,
    motion: "drift",
    particleColor: 0xc8e8b8,
    particleCount: 12,
    particleAlpha: 0.32
  })
});

export const FORGE_EMBERPATH_REGION = Object.freeze({
  id: "forge_emberpath",
  nodeId: "forge_emberpath",
  label: { zh: "餘燼小徑", en: "Emberpath Trail" },
  regionLabel: { zh: "南部鍛造遺跡區", en: "Southern Forge Ruins" },
  worldWidth: 1040,
  worldHeight: 720,
  spawn: Object.freeze({ x: 120, y: 360 }),
  circleObstacles: Object.freeze([
    { id: "forge_boulder", x: 340, y: 240, r: 40 },
    { id: "ember_mound", x: 560, y: 480, r: 34 },
    { id: "rust_bush", x: 780, y: 300, r: 28 },
    { id: "coal_pile", x: 880, y: 520, r: 30 }
  ]),
  rectObstacles: Object.freeze([
    { id: "anvil_ridge", x: 620, y: 140, w: 140, h: 56, r: 12 },
    { id: "slag_track", x: 280, y: 560, w: 220, h: 44, r: 10 }
  ]),
  explorePoints: Object.freeze([
    { id: "ep_forge_glow", x: 420, y: 300, kind: "ember" },
    { id: "ep_rust_flower", x: 700, y: 380, kind: "rust" },
    { id: "ep_heat_veil", x: 900, y: 260, kind: "heat" },
    { id: "ep_cinder_rest", x: 260, y: 480, kind: "rest" }
  ]),
  enemySpawnPools: Object.freeze([
    {
      enemyId: "spite_ember",
      threat: 0.58,
      anchors: Object.freeze([{ x: 580, y: 320 }, { x: 520, y: 400 }])
    },
    {
      enemyId: "static_wisp",
      threat: 0.42,
      anchors: Object.freeze([{ x: 760, y: 440 }, { x: 820, y: 300 }])
    }
  ]),
  groundPatches: Object.freeze([
    { x: 0, y: 0, w: 1040, h: 720, color: 0x4a3a32 },
    { x: 300, y: 60, w: 420, h: 260, color: 0x5c4034 },
    { x: 640, y: 360, w: 360, h: 280, color: 0x6b4538 }
  ]),
  atmosphere: Object.freeze({
    id: "ember_haze",
    tint: 0xffb070,
    tintAlpha: 0.07,
    motion: "rise",
    particleColor: 0xffc888,
    particleCount: 10,
    particleAlpha: 0.38
  })
});

export const HARBOR_QUAYSIDE_REGION = Object.freeze({
  id: "harbor_quayside",
  nodeId: "harbor_quayside",
  label: { zh: "靜泊碼頭", en: "Stillharbor Quay" },
  regionLabel: { zh: "南港", en: "Southern Harbor" },
  worldWidth: 1100,
  worldHeight: 740,
  spawn: Object.freeze({ x: 130, y: 370 }),
  circleObstacles: Object.freeze([
    { id: "mooring_buoy", x: 360, y: 260, r: 26 },
    { id: "tide_rock", x: 520, y: 500, r: 38 },
    { id: "barnacle_cluster", x: 740, y: 280, r: 30 },
    { id: "rope_coil", x: 860, y: 480, r: 24 }
  ]),
  rectObstacles: Object.freeze([
    { id: "quay_plank", x: 400, y: 140, w: 180, h: 48, r: 10 },
    { id: "fog_breakwater", x: 620, y: 560, w: 240, h: 52, r: 14 }
  ]),
  explorePoints: Object.freeze([
    { id: "ep_mooring", x: 440, y: 320, kind: "mooring" },
    { id: "ep_tide_line", x: 680, y: 400, kind: "tide" },
    { id: "ep_foghorn", x: 920, y: 300, kind: "fog" },
    { id: "ep_quay_rest", x: 280, y: 520, kind: "rest" }
  ]),
  enemySpawnPools: Object.freeze([
    {
      enemyId: "rift_shade",
      threat: 0.55,
      anchors: Object.freeze([{ x: 600, y: 340 }, { x: 540, y: 420 }])
    },
    {
      enemyId: "drift_murmur",
      threat: 0.45,
      anchors: Object.freeze([{ x: 780, y: 460 }, { x: 840, y: 320 }])
    }
  ]),
  groundPatches: Object.freeze([
    { x: 0, y: 0, w: 1100, h: 740, color: 0x3a5560 },
    { x: 280, y: 80, w: 460, h: 280, color: 0x456872 },
    { x: 660, y: 380, w: 380, h: 300, color: 0x2f4850 }
  ]),
  atmosphere: Object.freeze({
    id: "harbor_mist",
    tint: 0x8ed4e8,
    tintAlpha: 0.08,
    motion: "mist",
    particleColor: 0xd0f0f8,
    particleCount: 14,
    particleAlpha: 0.3
  })
});

const REGIONS_BY_NODE = Object.freeze({
  plains_windrest: PLAINS_WINDREST_REGION,
  forge_emberpath: FORGE_EMBERPATH_REGION,
  harbor_quayside: HARBOR_QUAYSIDE_REGION
});

export function getExpeditionRegionByNodeId(nodeId) {
  return REGIONS_BY_NODE[nodeId] || null;
}
