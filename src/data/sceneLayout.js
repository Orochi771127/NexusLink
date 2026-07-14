// 座標由 output/linkara/moonlake/data/moonlake-props.json（v3, 1080×1920）換算至 390×844。
const MOONLAKE_RUNTIME_SCALE = 390 / 1080;

export const SCENE_LAYOUT = {
  referenceWidth: 390,
  referenceHeight: 844,
  objects: [
    { id: "sun", x: 205, y: 140, scale: { x: 0.145, y: 0.145 } },
    { id: "moon", x: 230, y: 120, scale: { x: 0.132, y: 0.132 } },
    { id: "magic_circle", x: 195, y: 545, scale: { x: 0.152, y: 0.152 } },
    { id: "lantern_post_left", x: 72, y: 484, scale: { x: 0.101, y: 0.101 } },
    { id: "stone_arch_right", x: 318, y: 462, scale: { x: 0.116, y: 0.116 } },
    { id: "companion", x: 195, y: 586, scale: { x: 0.72, y: 0.72 } }
  ],
  anchors: {
    magic_circle: { x: 0.5, y: 0.5 },
    lantern_post_left: { x: 0.5, y: 1 },
    stone_arch_right: { x: 0.5, y: 1 }
  },
  artSpaceScale: MOONLAKE_RUNTIME_SCALE
};
