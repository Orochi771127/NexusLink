/**
 * R1 訓練場：月湖路徑的單軌道原型資料。
 * 系統 key 綁 regionId；玩家可見短名見契約。
 */

export const ORBIT_PATH_SHORT_LABELS = Object.freeze({
  moonlake: "月湖路徑",
  plains: "平原路徑",
  forge: "熔爐路徑",
  harbor: "南港路徑",
  core: "核心路徑",
  tidal: "潮汐路徑",
  mystic: "秘境路徑"
});

/** Owner 定版順序：月湖 → 平原 → 熔爐 → 南港 → 核心 → 潮汐 → 秘境 */
export const ORBIT_PATH_ORDER = Object.freeze([
  "moonlake",
  "plains",
  "forge",
  "harbor",
  "core",
  "tidal",
  "mystic"
]);

export function getOrbitPathLabel(regionId) {
  return ORBIT_PATH_SHORT_LABELS[regionId] || "月湖路徑";
}

/**
 * R1 訓練場資料（相容保留）。R2 正式關卡見 `stages/moonlakeStages.js`。
 */
export const MOONLAKE_TRAINING_ARENA = Object.freeze({
  id: "orbit_training_moonlake",
  regionId: "moonlake",
  pathLabel: "月湖路徑",
  title: "月湖路徑・訓練軌道",
  copy: "拉動發射心核化身，在軌道上旋轉撞擊訓練雜訊結。夥伴在外圈守界，不是被拿去砸的兵器。",
  dummyName: "訓練雜訊結",
  dummyGuardBonus: 0
});

export function getTrainingArena(regionId = "moonlake") {
  if (regionId === "moonlake") return MOONLAKE_TRAINING_ARENA;
  // R1：其他區尚未開，先回月湖訓練場並標註
  return {
    ...MOONLAKE_TRAINING_ARENA,
    title: `${getOrbitPathLabel(regionId)}・尚未開放`,
    copy: "下一區路徑會在月湖路徑更穩之後自然亮起。先在月湖轉一場吧。"
  };
}
