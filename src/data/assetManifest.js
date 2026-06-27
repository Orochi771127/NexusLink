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

function createStaticCompanionAsset({
  id,
  sourceRoot,
  fallbackImage,
  approvalStatus = "static-ready-registry"
}) {
  return Object.freeze({
    id,
    sourceRoot,
    animations: null,
    runtimeManifest: null,
    fallbackImage,
    protectedRuntimeRoot: false,
    approvalStatus,
    artStyle: "static-illustrated",
    sampling: "linear",
    anchor: ILLUSTRATED_COMPANION_RUNTIME_POLICY.anchor,
    scaleBasis: "spriteHeight",
    maxSheetEdge: null,
    sheetGrid: null
  });
}

export const RUNTIME_COMPANION_ASSET_KEYS = Object.freeze([
  "greyshadeCat",
  "flameFlicker",
  "iceTalon",
  "stoneShard",
  "vineTwist",
  "crystalRabbit"
]);

export const ASSET_MANIFEST = Object.freeze({
  backgrounds: Object.freeze({
    lakeDay: "./assets/backgrounds/LakeNightCamp_v2/bg_day_base.png",
    lakeNight: "./assets/backgrounds/LakeNightCamp_v2/bg_night_base.png"
  }),
  platforms: Object.freeze({
    magicCircle: "./assets/platforms/LakeNightCamp_v2/magic_circle.png"
  }),
  props: Object.freeze({
    campfire: "./assets/props/LakeNightCamp_v2/prop_campfire.png",
    crystal: "./assets/props/LakeNightCamp_v2/prop_crystal.png",
    sun: "./assets/props/LakeNightCamp_v2/celestial_sun.png",
    moon: "./assets/props/LakeNightCamp_v2/celestial_moon.png"
  }),
  audio: Object.freeze({
    bgm: "./assets/audio/bgm_nexuslink.m4a"
  }),
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
    flametailFox: createStaticCompanionAsset({
      id: "flametail-fox",
      sourceRoot: "./assets",
      fallbackImage: "./assets/flametail-fox.png"
    })
  })
});
