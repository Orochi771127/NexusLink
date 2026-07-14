// 座標對齊 MoonlakeVivarium_v3 foundation（1080×1920 → 390×844）。
// magic_circle / companion 對中央石台；燈柱、石拱依 v3 地形微調（非 v2 舊錨點）。
const MOONLAKE_RUNTIME_SCALE = 390 / 1080;

export const SCENE_LAYOUT = {
  referenceWidth: 390,
  referenceHeight: 844,
  objects: [
    { id: "sun", x: 205, y: 140, scale: { x: 0.145, y: 0.145 } },
    { id: "moon", x: 230, y: 120, scale: { x: 0.132, y: 0.132 } },
    { id: "magic_circle", x: 195, y: 542, scale: { x: 0.142, y: 0.142 } },
    { id: "lantern_post_left", x: 65, y: 488, scale: { x: 0.098, y: 0.098 } },
    { id: "stone_arch_right", x: 312, y: 468, scale: { x: 0.112, y: 0.112 } },
    { id: "companion", x: 195, y: 532, scale: { x: 0.72, y: 0.72 } }
  ],
  anchors: {
    magic_circle: { x: 0.5, y: 0.5 },
    lantern_post_left: { x: 0.5, y: 1 },
    stone_arch_right: { x: 0.5, y: 1 }
  },
  artSpaceScale: MOONLAKE_RUNTIME_SCALE
};
