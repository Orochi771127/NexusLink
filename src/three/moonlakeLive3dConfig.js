export const MOONLAKE_LIVE3D_ASSET = Object.freeze({
  id: "moonlake-live3d-r1",
  glb: "./assets/3d/moonlake/moonlake_clay_resin_r3.glb",
  sha256: "60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6",
  bytes: 3_098_820,
  triangles: 66_726,
  sourceCoordinateSystem: "blender-z-up",
  runtimeCoordinateSystem: "three-y-up"
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
  bridge_mid: Object.freeze({ x: 2.2, y: 0.34, z: -7.2, area: "bridge" }),
  bridge_far: Object.freeze({ x: 2.2, y: 0.18, z: -11.1, area: "bridge" }),
  far_bank_center: Object.freeze({ x: 0.75, y: 0.1, z: -12.55, area: "fishing_spot" }),
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
  bridge_far: Object.freeze(["bridge_mid", "far_bank_center"]),
  far_bank_center: Object.freeze(["bridge_far", "far_bank_left", "far_bank_right"]),
  far_bank_left: Object.freeze(["far_bank_center"]),
  far_bank_right: Object.freeze(["far_bank_center"])
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
