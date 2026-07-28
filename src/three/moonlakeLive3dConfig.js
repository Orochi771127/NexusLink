export const MOONLAKE_LIVE3D_ASSET = Object.freeze({
  id: "moonlake-live3d-r1",
  glb: "./assets/3d/moonlake/moonlake_clay_resin_r3.glb",
  sha256: "60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6",
  bytes: 3_098_820,
  triangles: 66_726,
  sourceCoordinateSystem: "blender-z-up",
  runtimeCoordinateSystem: "three-y-up"
});

export const MOONLAKE_VISUAL_MASTER = Object.freeze({
  id: "moonlake-visual-fidelity-r2",
  texture: "./assets/backgrounds/MoonlakeDiorama_r2/moonlake_visual_master_r2.png",
  width: 1080,
  height: 1920,
  imageAspect: 1080 / 1920,
  sourceRole: "owner-approved-composition-and-quality-authority"
});

export const MOONLAKE_VISUAL_WALKWAY = Object.freeze({
  routeId: "bridge-clearance-r2-1",
  anchors: Object.freeze([
    Object.freeze({
      id: "platform_right",
      worldX: 1.35,
      worldZ: 0.7,
      imageX: 0.62,
      imageY: 0.545,
      scale: 0.76
    }),
    Object.freeze({
      id: "bridge_near",
      worldX: 2.2,
      worldZ: -3.2,
      imageX: 0.655,
      imageY: 0.455,
      scale: 0.495
    }),
    Object.freeze({
      id: "bridge_mid",
      worldX: 2.2,
      worldZ: -7.2,
      imageX: 0.648,
      imageY: 0.393,
      scale: 0.45
    }),
    Object.freeze({
      id: "bridge_far",
      worldX: 2.2,
      worldZ: -11.1,
      imageX: 0.635,
      imageY: 0.342,
      scale: 0.42
    })
  ]),
  lateralImageScale: 0.018,
  bridgeEntryBlendStartX: 0.9,
  bridgeEntryBlendEndX: 1.35,
  bridgeWorldZMax: 0.8,
  farLandingWorldZ: -12
});

export const MOONLAKE_BRIDGE_PRESENTATION = Object.freeze({
  textureNearY: 0.545,
  textureFarY: 0.685,
  nearCenterX: 0.655,
  farCenterX: 0.635,
  sourceNearHalfWidth: 0.052,
  sourceFarHalfWidth: 0.041,
  widenedNearHalfWidth: 0.07,
  widenedFarHalfWidth: 0.062,
  maxBridgeSilhouetteWidthPx390: 66,
  maxFishingSilhouetteWidthPx390: 66
});

const BRIDGE_MID_FISHING_OPTIONS = Object.freeze([
  Object.freeze({
    animationName: "fishing_front",
    mirrorX: false,
    waterSide: "right",
    railOffsetX390: 0
  }),
  Object.freeze({
    animationName: "fishing_front",
    mirrorX: true,
    waterSide: "left",
    railOffsetX390: 0
  }),
  Object.freeze({
    animationName: "fishing_side",
    mirrorX: false,
    waterSide: "right",
    railOffsetX390: 8
  }),
  Object.freeze({
    animationName: "fishing_side",
    mirrorX: true,
    waterSide: "left",
    railOffsetX390: -8
  })
]);

const BRIDGE_FAR_FISHING_OPTIONS = Object.freeze([
  Object.freeze({
    animationName: "fishing_back",
    mirrorX: false,
    waterSide: "far",
    railOffsetX390: 0
  })
]);

export const MOONLAKE_FISHING_PRESENTATION = Object.freeze({
  id: "moonlake-fishing-orientation-r2-2",
  bridgeMidOptions: BRIDGE_MID_FISHING_OPTIONS,
  bridgeFarOptions: BRIDGE_FAR_FISHING_OPTIONS,
  rejectedTerrain: Object.freeze([
    "stepping_stones",
    "waterfall_basins",
    "shallow_water",
    "far_bank",
    "tent_shoreline",
    "near_ground"
  ])
});

export const MOONLAKE_CAMERA = Object.freeze({
  position: Object.freeze({ x: 9.2, y: 17.8, z: 31.5 }),
  target: Object.freeze({ x: 0, y: 0.9, z: -4.2 }),
  fov: 36,
  near: 0.1,
  far: 160
});

export const MOONLAKE_WATERFALLS = Object.freeze([
  Object.freeze({
    id: "left",
    position: Object.freeze({ x: -4.2, y: 2.15, z: -9.22 }),
    width: 1.08,
    height: 3.7,
    phase: 0.17
  }),
  Object.freeze({
    id: "right",
    position: Object.freeze({ x: 4.3, y: 2.4, z: -9.42 }),
    width: 1.14,
    height: 4.05,
    phase: 0.63
  })
]);

export const MOONLAKE_WORLD_WAYPOINTS = Object.freeze({
  platform_center: Object.freeze({ x: 0, y: 0.28, z: 1.2, area: "platform" }),
  platform_left: Object.freeze({ x: -1.35, y: 0.24, z: 1.0, area: "platform" }),
  platform_right: Object.freeze({ x: 1.35, y: 0.24, z: 0.7, area: "platform" }),
  near_ground_center: Object.freeze({ x: 0, y: 0.08, z: 4.25, area: "near_ground" }),
  near_ground_left: Object.freeze({ x: -2.35, y: 0.08, z: 4.4, area: "near_ground" }),
  near_ground_right: Object.freeze({ x: 2.4, y: 0.08, z: 4.0, area: "near_ground" }),
  bridge_near: Object.freeze({ x: 2.2, y: 0.2, z: -3.2, area: "bridge" }),
  bridge_mid: Object.freeze({
    x: 2.2,
    y: 0.34,
    z: -7.2,
    area: "bridge",
    fishingOptions: BRIDGE_MID_FISHING_OPTIONS
  }),
  bridge_far: Object.freeze({
    x: 2.2,
    y: 0.18,
    z: -11.1,
    area: "fishing_spot",
    fishingOptions: BRIDGE_FAR_FISHING_OPTIONS
  }),
  far_bank_center: Object.freeze({ x: 0.75, y: 0.1, z: -12.55, area: "far_bank" }),
  far_bank_left: Object.freeze({ x: -1.55, y: 0.1, z: -12.75, area: "far_bank" }),
  far_bank_right: Object.freeze({ x: 2.85, y: 0.1, z: -12.75, area: "far_bank" })
});

export const MOONLAKE_WORLD_EDGES = Object.freeze({
  platform_center: Object.freeze(["platform_left", "platform_right", "near_ground_center"]),
  platform_left: Object.freeze(["platform_center"]),
  platform_right: Object.freeze(["platform_center", "bridge_near"]),
  near_ground_center: Object.freeze(["platform_center", "near_ground_left", "near_ground_right"]),
  near_ground_left: Object.freeze(["near_ground_center"]),
  near_ground_right: Object.freeze(["near_ground_center"]),
  bridge_near: Object.freeze(["platform_right", "bridge_mid"]),
  bridge_mid: Object.freeze(["bridge_near", "bridge_far"]),
  bridge_far: Object.freeze(["bridge_mid"]),
  far_bank_center: Object.freeze([]),
  far_bank_left: Object.freeze([]),
  far_bank_right: Object.freeze([])
});

export const MOONLAKE_BRIDGE_AUDIT = Object.freeze({
  plankCount: 16,
  minimumWidthMeters: 1.4,
  maximumGapMeters: 0.03,
  maximumHeightStepMeters: 0.042,
  nearEndBlenderY: 2.95,
  farEndBlenderY: 11.4,
  nearShoreOverlap: true,
  farBankOverlap: true
});
