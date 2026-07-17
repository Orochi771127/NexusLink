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

export const moonlakeObjectPack = Object.freeze({
  id: "moonlake-objects-r2",
  placementGrid: GRID,
  slots: Object.freeze([
    slot({ id: "moonlake-crescent-shrine", cell: { column: 3, row: 7 }, offsetPx: { x: 35, y: -70 }, depthBand: "far", renderLayer: "farStructures", allowedKinds: ["shrine"], maxDisplaySize: { width: 130, height: 180 }, waterRule: "island-ground-only", companionClearance: 360, uiClearance: "hud-and-bottom-nav", shadowFootprint: { width: 76, height: 24, opacity: 0.2 }, dayNightPolicy: "shared-base-plus-emissive", stateKey: "moonlake.shrineState" }),
    slot({ id: "moonlake-far-beacon", cell: { column: 9, row: 5 }, offsetPx: { x: -5, y: -18 }, depthBand: "far", renderLayer: "farStructures", allowedKinds: ["beacon"], maxDisplaySize: { width: 86, height: 154 }, waterRule: "island-ground-only", companionClearance: 420, uiClearance: "hud-and-dialogue", shadowFootprint: { width: 52, height: 17, opacity: 0.18 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-far-tent", cell: { column: 8, row: 7 }, offsetPx: { x: 25, y: -70 }, depthBand: "far", renderLayer: "farStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 128, height: 105 }, waterRule: "island-ground-only", companionClearance: 360, uiClearance: "hud-and-dialogue", shadowFootprint: { width: 82, height: 21, opacity: 0.18 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-main-beacon", cell: { column: 5, row: 7 }, offsetPx: { x: 25, y: -30 }, depthBand: "mid", renderLayer: "midStructures", allowedKinds: ["beacon"], maxDisplaySize: { width: 120, height: 235 }, waterRule: "island-ground-only", companionClearance: 300, uiClearance: "dialogue-and-companion", shadowFootprint: { width: 74, height: 24, opacity: 0.22 }, dayNightPolicy: "shared-base-plus-emissive", stateKey: "moonlake.mainBeaconState" }),
    slot({ id: "moonlake-mid-left-tent", cell: { column: 3, row: 9 }, offsetPx: { x: -5, y: -57 }, depthBand: "mid", renderLayer: "midStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 166, height: 138 }, waterRule: "island-ground-only", companionClearance: 270, uiClearance: "dialogue-and-companion", shadowFootprint: { width: 104, height: 27, opacity: 0.22 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-mid-right-tent", cell: { column: 7, row: 8 }, offsetPx: { x: 15, y: 39 }, depthBand: "mid", renderLayer: "midStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 166, height: 138 }, waterRule: "island-ground-only", companionClearance: 270, uiClearance: "dialogue-and-companion", shadowFootprint: { width: 104, height: 27, opacity: 0.22 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-near-left-tent", cell: { column: 2, row: 12 }, offsetPx: { x: -35, y: 20 }, depthBand: "near", renderLayer: "nearStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 246, height: 203 }, waterRule: "shore-ground-only", companionClearance: 190, uiClearance: "companion-and-soul-talk", shadowFootprint: { width: 154, height: 40, opacity: 0.26 }, dayNightPolicy: "shared-base-plus-emissive" }),
    slot({ id: "moonlake-near-right-tent", cell: { column: 9, row: 12 }, offsetPx: { x: 45, y: 10 }, depthBand: "near", renderLayer: "nearStructures", allowedKinds: ["tent"], maxDisplaySize: { width: 246, height: 203 }, waterRule: "shore-ground-only", companionClearance: 190, uiClearance: "companion-and-soul-talk", shadowFootprint: { width: 154, height: 40, opacity: 0.26 }, dayNightPolicy: "shared-base-plus-emissive" })
  ]),
  placements: Object.freeze([
    placement({ assetId: "crescent_shrine", asset: MOONLAKE_DIORAMA_R2.props.crescentShrine, slotId: "moonlake-crescent-shrine", scale: 0.32, state: "default", visibleAnchor: { x: 0.498047, y: 0.953125 }, light: { color: 0xffc36a, radius: 70, intensity: 0.42, offsetPx: { x: 0, y: -112 } } }),
    placement({ assetId: "beacon_far", asset: MOONLAKE_DIORAMA_R2.props.beaconFar, slotId: "moonlake-far-beacon", scale: 0.22, state: "default", visibleAnchor: { x: 0.498047, y: 0.953125 }, light: { color: 0x69ddff, radius: 65, intensity: 0.4, offsetPx: { x: 0, y: -72 } } }),
    placement({ assetId: "tent_far", asset: MOONLAKE_DIORAMA_R2.props.tentFar, slotId: "moonlake-far-tent", scale: 0.22, state: "default", visibleAnchor: { x: 0.499023, y: 0.953125 }, light: { color: 0xffbd68, radius: 55, intensity: 0.3, offsetPx: { x: 0, y: -28 } } }),
    placement({ assetId: "beacon_main", asset: MOONLAKE_DIORAMA_R2.props.beaconMain, slotId: "moonlake-main-beacon", scale: 0.42, state: "default", visibleAnchor: { x: 0.498047, y: 0.953125 }, light: { color: 0x69ddff, radius: 120, intensity: 0.55, offsetPx: { x: 0, y: -126 } } }),
    placement({ assetId: "tent_mid_left", asset: MOONLAKE_DIORAMA_R2.props.tentMidLeft, slotId: "moonlake-mid-left-tent", scale: 0.3, state: "default", visibleAnchor: { x: 0.498047, y: 0.857422 }, light: { color: 0xffbd68, radius: 85, intensity: 0.38, offsetPx: { x: 0, y: -38 } } }),
    placement({ assetId: "tent_mid_right", asset: MOONLAKE_DIORAMA_R2.props.tentMidRight, slotId: "moonlake-mid-right-tent", scale: 0.3, state: "default", visibleAnchor: { x: 0.501953, y: 0.888672 }, light: { color: 0xffbd68, radius: 85, intensity: 0.38, offsetPx: { x: 0, y: -38 } } }),
    placement({ assetId: "tent_near_left", asset: MOONLAKE_DIORAMA_R2.props.tentNearLeft, slotId: "moonlake-near-left-tent", scale: 0.52, state: "default", visibleAnchor: { x: 0.474609, y: 0.888672 }, light: { color: 0xffb95e, radius: 130, intensity: 0.42, offsetPx: { x: 38, y: -58 } } }),
    placement({ assetId: "tent_near_right", asset: MOONLAKE_DIORAMA_R2.props.tentNearRight, slotId: "moonlake-near-right-tent", scale: 0.52, state: "default", visibleAnchor: { x: 0.501953, y: 0.84375 }, light: { color: 0xffb95e, radius: 130, intensity: 0.42, offsetPx: { x: -38, y: -58 } } })
  ])
});

export default moonlakeObjectPack;
