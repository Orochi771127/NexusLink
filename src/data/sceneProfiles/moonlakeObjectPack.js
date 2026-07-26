import { MOONLAKE_DIORAMA_R2 } from "../assetManifest.js";

const GRID = Object.freeze({
  columns: 12,
  rows: 20,
  artWidth: 1080,
  artHeight: 1920,
  cellWidth: 90,
  cellHeight: 96,
  runtimeVisible: false,
  snap: "cell-center-with-offset"
});

function slot(config) {
  return Object.freeze({
    ...config,
    cell: Object.freeze(config.cell),
    offsetPx: Object.freeze(config.offsetPx),
    allowedKinds: Object.freeze(config.allowedKinds),
    maxDisplaySize: Object.freeze(config.maxDisplaySize),
    shadowFootprint: Object.freeze(config.shadowFootprint)
  });
}

function placement(config) {
  return Object.freeze({
    ...config,
    visibleAnchor: Object.freeze(config.visibleAnchor),
    light: Object.freeze({
      ...config.light,
      offsetPx: Object.freeze(config.light.offsetPx)
    })
  });
}

/**
 * Moonlake R2 object pack.
 * 2026-07-25：放大道具 scale，修正「中景帳棚 ≈ 角色」的錯覺；角色 displayScale 不動。
 * 計畫基線 mid 0.38；真機螢幕座標驗證後 mid 再調到 0.52（物件 cover-scale vs 角色 safe-zone）。
 * near +15%、far +18%、main beacon / shrine 小幅跟上；shadow／light 同步。
 */
export const moonlakeObjectPack = Object.freeze({
  id: "moonlake-objects-r2",
  placementGrid: GRID,
  slots: Object.freeze([
    slot({ id: "moonlake-crescent-shrine", cell: { column: 4, row: 7 }, offsetPx: { x: 35, y: -42 }, depthBand: "far", renderLayer: "farStructures", allowedKinds: ["shrine"], maxDisplaySize: { width: 146, height: 203 }, waterRule: "island-ground-only", companionClearance: 360, uiClearance: "hud-and-bottom-nav", shadowFootprint: { width: 86, height: 27, opacity: 0.2 }, dayNightPolicy: "shared-base-plus-emissive", stateKey: "moonlake.shrineState" }),
    slot({ id: "moonlake-far-beacon", cell: { column: 9, row: 6 }, offsetPx: { x: -49, y: -6 }, depthBand: "far", renderLayer: "farStructures", allowedKinds: ["beacon"], maxDisplaySize: { width: 102, height: 182 }, waterRule: "island-ground-only", companionClearance: 420, uiClearance: "hud-and-dialogue", shadowFootprint: { width: 61, height: 20, opacity: 0.18 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-far-tent", cell: { column: 7, row: 6 }, offsetPx: { x: 25, y: -70 }, depthBand: "far", renderLayer: "farStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 151, height: 124 }, waterRule: "island-ground-only", companionClearance: 360, uiClearance: "hud-and-dialogue", shadowFootprint: { width: 97, height: 25, opacity: 0.18 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-main-beacon", cell: { column: 6, row: 9 }, offsetPx: { x: 65, y: -78 }, depthBand: "mid", renderLayer: "midStructures", allowedKinds: ["beacon"], maxDisplaySize: { width: 131, height: 257 }, waterRule: "island-ground-only", companionClearance: 300, uiClearance: "dialogue-and-companion", shadowFootprint: { width: 81, height: 26, opacity: 0.22 }, dayNightPolicy: "shared-base-plus-emissive", stateKey: "moonlake.mainBeaconState" }),
    slot({ id: "moonlake-mid-left-tent", cell: { column: 0, row: 13 }, offsetPx: { x: -5, y: -57 }, depthBand: "mid", renderLayer: "midStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 288, height: 239 }, waterRule: "island-ground-only", companionClearance: 270, uiClearance: "dialogue-and-companion", shadowFootprint: { width: 180, height: 47, opacity: 0.22 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-mid-right-tent", cell: { column: 10, row: 9 }, offsetPx: { x: -25, y: 39 }, depthBand: "mid", renderLayer: "midStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 288, height: 239 }, waterRule: "island-ground-only", companionClearance: 270, uiClearance: "dialogue-and-companion", shadowFootprint: { width: 180, height: 47, opacity: 0.22 }, dayNightPolicy: "shared-base-plus-emissive" }),
    // 放大後往內收，避免近景帳棚裁出 390 寬安全邊。
    slot({ id: "moonlake-near-left-tent", cell: { column: 3, row: 8 }, offsetPx: { x: 4, y: 36 }, depthBand: "near", renderLayer: "nearStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 283, height: 234 }, waterRule: "shore-ground-only", companionClearance: 190, uiClearance: "companion-and-soul-talk", shadowFootprint: { width: 177, height: 46, opacity: 0.26 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-near-right-tent", cell: { column: 11, row: 13 }, offsetPx: { x: -30, y: 10 }, depthBand: "near", renderLayer: "nearStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 283, height: 234 }, waterRule: "shore-ground-only", companionClearance: 190, uiClearance: "companion-and-soul-talk", shadowFootprint: { width: 177, height: 46, opacity: 0.26 }, dayNightPolicy: "shared-base-plus-emissive" })
  ]),
  placements: Object.freeze([
    placement({ assetId: "crescent_shrine", asset: MOONLAKE_DIORAMA_R2.props.crescentShrine, slotId: "moonlake-crescent-shrine", scale: 0.432, state: "default", visibleAnchor: { x: 0.498047, y: 0.953125 }, light: { color: 0xffc36a, radius: 79, intensity: 0.42, offsetPx: { x: 0, y: -126 } } }),
    placement({ assetId: "beacon_far", asset: MOONLAKE_DIORAMA_R2.props.beaconFar, slotId: "moonlake-far-beacon", scale: 0.218, state: "default", visibleAnchor: { x: 0.498047, y: 0.953125 }, light: { color: 0x69ddff, radius: 77, intensity: 0.4, offsetPx: { x: 0, y: -85 } } }),
    placement({ assetId: "tent_far", asset: MOONLAKE_DIORAMA_R2.props.tentFar, slotId: "moonlake-far-tent", scale: 0.198, state: "default", visibleAnchor: { x: 0.499023, y: 0.953125 }, light: { color: 0xffbd68, radius: 65, intensity: 0.3, offsetPx: { x: 0, y: -33 } } }),
    placement({ assetId: "beacon_main", asset: MOONLAKE_DIORAMA_R2.props.beaconMain, slotId: "moonlake-main-beacon", scale: 0.699, state: "default", visibleAnchor: { x: 0.498047, y: 0.953125 }, light: { color: 0x69ddff, radius: 131, intensity: 0.55, offsetPx: { x: 0, y: -138 } } }),
    placement({ assetId: "tent_mid_left", asset: MOONLAKE_DIORAMA_R2.props.tentMidLeft, slotId: "moonlake-mid-left-tent", scale: 1.513, state: "default", visibleAnchor: { x: 0.498047, y: 0.857422 }, light: { color: 0xffbd68, radius: 147, intensity: 0.38, offsetPx: { x: 0, y: -66 } } }),
    placement({ assetId: "tent_mid_right", asset: MOONLAKE_DIORAMA_R2.props.tentMidRight, slotId: "moonlake-mid-right-tent", scale: 0.77, state: "default", visibleAnchor: { x: 0.501953, y: 0.888672 }, light: { color: 0xffbd68, radius: 147, intensity: 0.38, offsetPx: { x: 0, y: -66 } } }),
    placement({ assetId: "tent_near_left", asset: MOONLAKE_DIORAMA_R2.props.tentNearLeft, slotId: "moonlake-near-left-tent", scale: 0.456, state: "default", visibleAnchor: { x: 0.474609, y: 0.888672 }, light: { color: 0xffb95e, radius: 150, intensity: 0.42, offsetPx: { x: 44, y: -67 } } }),
    placement({ assetId: "tent_near_right", asset: MOONLAKE_DIORAMA_R2.props.tentNearRight, slotId: "moonlake-near-right-tent", scale: 1.53, state: "default", visibleAnchor: { x: 0.501953, y: 0.84375 }, light: { color: 0xffb95e, radius: 150, intensity: 0.42, offsetPx: { x: -44, y: -67 } } })
  ])
});

export default moonlakeObjectPack;
