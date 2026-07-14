// 座標對齊 MoonlakeVivarium_v3/v4 foundation（1080×1920 → 390×844）。
// magic_circle / companion 對中央石台；v4 無框底圖後重排燈柱、營火、晶簇、石拱。
const MOONLAKE_RUNTIME_SCALE = 390 / 1080;

export const SCENE_LAYOUT = {
  referenceWidth: 390,
  referenceHeight: 844,
  objects: [
    { id: "sun", x: 205, y: 140, scale: { x: 0.085, y: 0.085 } },
    { id: "moon", x: 230, y: 120, scale: { x: 0.085, y: 0.085 } },
    { id: "magic_circle", x: 195, y: 542, scale: { x: 0.142, y: 0.142 } },
    { id: "lantern_post_left", x: 72, y: 604, scale: { x: 0.095, y: 0.095 } },
    { id: "campfire_left", x: 118, y: 552, scale: { x: 0.088, y: 0.088 } },
    { id: "crystal_cluster", x: 290, y: 604, scale: { x: 0.13, y: 0.13 } },
    { id: "stone_arch_right", x: 330, y: 465, scale: { x: 0.106, y: 0.106 } },
    { id: "companion", x: 195, y: 590, scale: { x: 0.72, y: 0.72 } }
  ],
  anchors: {
    magic_circle: { x: 0.5, y: 0.5 },
    lantern_post_left: { x: 0.5, y: 1 },
    campfire_left: { x: 0.5, y: 1 },
    crystal_cluster: { x: 0.5, y: 1 },
    stone_arch_right: { x: 0.5, y: 1 }
  },
  artSpaceScale: MOONLAKE_RUNTIME_SCALE
};
