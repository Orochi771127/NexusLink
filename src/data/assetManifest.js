export const ILLUSTRATED_COMPANION_RUNTIME_POLICY = Object.freeze({
  artStyle: "illustrated-512-transparent",
  sampling: "linear-mipmap",
  anchor: Object.freeze({ x: 0.5, y: 1 }),
  scaleBasis: "frameHeight",
  maxSheetEdge: 4096,
  sheetGrid: "exact"
});

function createIllustratedCompanionAsset({
  id,
  sourceRoot,
  animations,
  approvalStatus = "runtime-ready-registry"
}) {
  return Object.freeze({
    id,
    sourceRoot,
    animations,
    runtimeManifest: animations,
    fallbackImage: null,
    protectedRuntimeRoot: true,
    approvalStatus,
    ...ILLUSTRATED_COMPANION_RUNTIME_POLICY
  });
}

// 裂隙剪影（GAP-1，靜態 512×512 透明 PNG）：key 必須與 enemyRegistry 的 enemy id 一一對應。
// 呼吸/相位/結局動態仍由 battleController 的程序層驅動；缺圖或載入失敗時回退程序霧體。
export const ENEMY_RIFT_SILHOUETTES = Object.freeze({
  static_wisp: "./assets/enemies/static_wisp/static_wisp_rift_512x512.png",
  tearveil_wisp: "./assets/enemies/tearveil_wisp/tearveil_wisp_rift_512x512.png",
  crystal_golemite: "./assets/enemies/crystal_golemite/crystal_golemite_rift_512x512.png",
  spite_ember: "./assets/enemies/spite_ember/spite_ember_rift_512x512.png",
  rift_shade: "./assets/enemies/rift_shade/rift_shade_rift_512x512.png",
  dread_coil: "./assets/enemies/dread_coil/dread_coil_rift_512x512.png",
  weary_husk: "./assets/enemies/weary_husk/weary_husk_rift_512x512.png",
  sink_weight: "./assets/enemies/sink_weight/sink_weight_rift_512x512.png",
  hollow_echo: "./assets/enemies/hollow_echo/hollow_echo_rift_512x512.png",
  drift_murmur: "./assets/enemies/drift_murmur/drift_murmur_rift_512x512.png"
});

export function getEnemyRiftSilhouettePath(enemyId) {
  return ENEMY_RIFT_SILHOUETTES[enemyId] || null;
}

export const RUNTIME_COMPANION_ASSET_KEYS = Object.freeze([
  "greyshadeCat",
  "flameFlicker",
  "iceTalon",
  "stoneShard",
  "vineTwist",
  "crystalRabbit",
  // 正式心輝議會五席（2026-07-10 Owner 定版；145 sheets 已 runtime 化）——
  // 列入此清單後 release gate 會逐 sheet 檢查網格/邊長/anchor 完整性。
  "sprigfawn",
  "starstripeCub",
  "auriowl",
  "blazetailKit",
  "crystalfinSeahorse"
]);

export const MOONLAKE_VIVARIUM_V3 = Object.freeze({
  backgrounds: Object.freeze({
    night: "./assets/backgrounds/MoonlakeVivarium_v3/bg_night_base.png",
    day: "./assets/backgrounds/MoonlakeVivarium_v3/bg_day_base.png"
  }),
  // Habitat 契約增量層（v5）：仍可與 full-bleed day/night 疊加；透明 PNG，中央留空給夥伴。
  layers: Object.freeze({
    campStructures: "./assets/layers/MoonlakeVivarium_v3/camp_structures.png",
    foregroundOcclusion: "./assets/layers/MoonlakeVivarium_v3/foreground_occlusion.png"
  }),
  platforms: Object.freeze({
    magicCircle: "./assets/platforms/MoonlakeVivarium_v3/magic_circle.png"
  }),
  props: Object.freeze({
    lanternPost: "./assets/props/MoonlakeVivarium_v3/lantern_post.png",
    stoneArch: "./assets/props/MoonlakeVivarium_v3/stone_arch.png",
    campfire: "./assets/props/MoonlakeVivarium_v3/campfire.png",
    crystal: "./assets/props/MoonlakeVivarium_v3/crystal_cluster.png"
  })
});

export const MOONLAKE_DIORAMA_R1 = Object.freeze({
  backgrounds: Object.freeze({
    night: "./assets/backgrounds/MoonlakeDiorama_r1/bg_night_base.png",
    day: "./assets/backgrounds/MoonlakeDiorama_r1/bg_day_base.png"
  }),
  layers: Object.freeze({
    campStructuresDay: "./assets/layers/MoonlakeDiorama_r1/camp_structures_day.png",
    campStructuresNight: "./assets/layers/MoonlakeDiorama_r1/camp_structures_night.png",
    foregroundOcclusionDay: "./assets/layers/MoonlakeDiorama_r1/foreground_occlusion_day.png",
    foregroundOcclusionNight: "./assets/layers/MoonlakeDiorama_r1/foreground_occlusion_night.png"
  }),
  props: Object.freeze({
    lanternPost: "./assets/props/MoonlakeDiorama_r1/lantern_post.png",
    crystal: "./assets/props/MoonlakeDiorama_r1/crystal_cluster.png",
    sun: "./assets/props/MoonlakeDiorama_r1/celestial_sun.png",
    moon: "./assets/props/MoonlakeDiorama_r1/celestial_moon.png",
    crystalStates: Object.freeze({
      glimmer: "./assets/props/MoonlakeDiorama_r1/crystal_states/crystal_glimmer.png",
      seed: "./assets/props/MoonlakeDiorama_r1/crystal_states/crystal_seed.png",
      cluster: "./assets/props/MoonlakeDiorama_r1/crystal_states/crystal_cluster.png",
      attuned: "./assets/props/MoonlakeDiorama_r1/crystal_states/crystal_attuned.png",
      transformed: "./assets/props/MoonlakeDiorama_r1/crystal_states/crystal_transformed.png",
      released: "./assets/props/MoonlakeDiorama_r1/crystal_states/crystal_released.png"
    })
  })
});

export const MOONLAKE_DIORAMA_R2 = Object.freeze({
  props: Object.freeze({
    tentNearLeft: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/tent_near_left_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/tent_near_left_emissive.png"
    }),
    tentNearRight: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/tent_near_right_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/tent_near_right_emissive.png"
    }),
    tentMidLeft: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/tent_mid_left_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/tent_mid_left_emissive.png"
    }),
    tentMidRight: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/tent_mid_right_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/tent_mid_right_emissive.png"
    }),
    tentFar: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/tent_far_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/tent_far_emissive.png"
    }),
    beaconMain: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/beacon_main_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/beacon_main_emissive.png"
    }),
    beaconFar: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/beacon_far_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/beacon_far_emissive.png"
    }),
    crescentShrine: Object.freeze({
      base: "./assets/props/MoonlakeDiorama_r2/crescent_shrine_base.png",
      emissive: "./assets/props/MoonlakeDiorama_r2/crescent_shrine_emissive.png"
    })
  })
});

export const LINKARA_HABITATS_R1 = Object.freeze({
  core: Object.freeze({
    day: "./assets/backgrounds/LinkaraHabitats_r1/core_day.png",
    night: "./assets/backgrounds/LinkaraHabitats_r1/core_night.png",
    depthMask: "./assets/layers/LinkaraHabitats_r1/core_depth_mask.png",
    placementMask: "./assets/layers/LinkaraHabitats_r1/core_placement_mask.png"
  }),
  mystic: Object.freeze({
    day: "./assets/backgrounds/LinkaraHabitats_r1/mystic_day.png",
    night: "./assets/backgrounds/LinkaraHabitats_r1/mystic_night.png",
    depthMask: "./assets/layers/LinkaraHabitats_r1/mystic_depth_mask.png",
    placementMask: "./assets/layers/LinkaraHabitats_r1/mystic_placement_mask.png"
  }),
  plains: Object.freeze({
    day: "./assets/backgrounds/LinkaraHabitats_r1/plains_day.png",
    night: "./assets/backgrounds/LinkaraHabitats_r1/plains_night.png",
    depthMask: "./assets/layers/LinkaraHabitats_r1/plains_depth_mask.png",
    placementMask: "./assets/layers/LinkaraHabitats_r1/plains_placement_mask.png"
  }),
  forge: Object.freeze({
    day: "./assets/backgrounds/LinkaraHabitats_r1/forge_day.png",
    night: "./assets/backgrounds/LinkaraHabitats_r1/forge_night.png",
    depthMask: "./assets/layers/LinkaraHabitats_r1/forge_depth_mask.png",
    placementMask: "./assets/layers/LinkaraHabitats_r1/forge_placement_mask.png"
  }),
  harbor: Object.freeze({
    day: "./assets/backgrounds/LinkaraHabitats_r1/harbor_day.png",
    night: "./assets/backgrounds/LinkaraHabitats_r1/harbor_night.png",
    depthMask: "./assets/layers/LinkaraHabitats_r1/harbor_depth_mask.png",
    placementMask: "./assets/layers/LinkaraHabitats_r1/harbor_placement_mask.png"
  }),
  tidal: Object.freeze({
    day: "./assets/backgrounds/LinkaraHabitats_r1/tidal_day.png",
    night: "./assets/backgrounds/LinkaraHabitats_r1/tidal_night.png",
    depthMask: "./assets/layers/LinkaraHabitats_r1/tidal_depth_mask.png",
    placementMask: "./assets/layers/LinkaraHabitats_r1/tidal_placement_mask.png"
  })
});

export const ASSET_MANIFEST = Object.freeze({
  backgrounds: Object.freeze({
    lakeDay: MOONLAKE_DIORAMA_R1.backgrounds.day,
    lakeNight: MOONLAKE_DIORAMA_R1.backgrounds.night
  }),
  layers: Object.freeze({
    campStructuresDay: MOONLAKE_DIORAMA_R1.layers.campStructuresDay,
    campStructuresNight: MOONLAKE_DIORAMA_R1.layers.campStructuresNight,
    foregroundOcclusionDay: MOONLAKE_DIORAMA_R1.layers.foregroundOcclusionDay,
    foregroundOcclusionNight: MOONLAKE_DIORAMA_R1.layers.foregroundOcclusionNight
  }),
  platforms: Object.freeze({
    magicCircle: MOONLAKE_VIVARIUM_V3.platforms.magicCircle
  }),
  props: Object.freeze({
    campfire: MOONLAKE_VIVARIUM_V3.props.campfire,
    crystal: MOONLAKE_DIORAMA_R1.props.crystal,
    crystalStates: MOONLAKE_DIORAMA_R1.props.crystalStates,
    lanternPost: MOONLAKE_DIORAMA_R1.props.lanternPost,
    stoneArch: MOONLAKE_VIVARIUM_V3.props.stoneArch,
    sun: MOONLAKE_DIORAMA_R1.props.sun,
    moon: MOONLAKE_DIORAMA_R1.props.moon
  }),
  audio: Object.freeze({
    bgm: "./assets/audio/bgm_nexuslink.m4a"
  }),
  enemies: ENEMY_RIFT_SILHOUETTES,
  habitats: LINKARA_HABITATS_R1,
  characters: Object.freeze({
    greyshadeCat: createIllustratedCompanionAsset({
      id: "greyshade-cat",
      sourceRoot: "./assets/characters/greyshade-cat",
      animations: "./assets/characters/greyshade-cat/metadata/animations.json",
      approvalStatus: "primary-runtime-active-legacy-preserved"
    }),
    flameFlicker: createIllustratedCompanionAsset({
      id: "flame-flicker",
      sourceRoot: "./assets/characters/flame-flicker",
      animations: "./assets/characters/flame-flicker/metadata/animations.json"
    }),
    iceTalon: createIllustratedCompanionAsset({
      id: "ice-talon",
      sourceRoot: "./assets/characters/ice-talon",
      animations: "./assets/characters/ice-talon/metadata/animations.json"
    }),
    stoneShard: createIllustratedCompanionAsset({
      id: "stone-shard",
      sourceRoot: "./assets/characters/stone-shard",
      animations: "./assets/characters/stone-shard/metadata/animations.json"
    }),
    vineTwist: createIllustratedCompanionAsset({
      id: "vine-twist",
      sourceRoot: "./assets/characters/vine-twist",
      animations: "./assets/characters/vine-twist/metadata/animations.json"
    }),
    crystalRabbit: createIllustratedCompanionAsset({
      id: "crystal-rabbit",
      sourceRoot: "./assets/characters/crystal-rabbit",
      animations: "./assets/characters/crystal-rabbit/metadata/animations.json"
    }),
    sprigfawn: createIllustratedCompanionAsset({
      id: "sprigfawn",
      sourceRoot: "./assets/characters/sprigfawn",
      animations: "./assets/characters/sprigfawn/metadata/animations.json",
      approvalStatus: "formal-heartspark-council-runtime"
    }),
    starstripeCub: createIllustratedCompanionAsset({
      id: "starstripe-cub",
      sourceRoot: "./assets/characters/starstripe-cub",
      animations: "./assets/characters/starstripe-cub/metadata/animations.json",
      approvalStatus: "formal-heartspark-council-runtime"
    }),
    auriowl: createIllustratedCompanionAsset({
      id: "auriowl",
      sourceRoot: "./assets/characters/auriowl",
      animations: "./assets/characters/auriowl/metadata/animations.json",
      approvalStatus: "formal-heartspark-council-runtime"
    }),
    blazetailKit: createIllustratedCompanionAsset({
      id: "blazetail-kit",
      sourceRoot: "./assets/characters/blazetail-kit",
      animations: "./assets/characters/blazetail-kit/metadata/animations.json",
      approvalStatus: "formal-heartspark-council-runtime"
    }),
    crystalfinSeahorse: createIllustratedCompanionAsset({
      id: "crystalfin-seahorse",
      sourceRoot: "./assets/characters/crystalfin-seahorse",
      animations: "./assets/characters/crystalfin-seahorse/metadata/animations.json",
      approvalStatus: "formal-heartspark-council-runtime"
    }),
  })
});
