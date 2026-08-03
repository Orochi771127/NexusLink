/**
 * Presentation-only skin profiles for gameplay scenes.
 *
 * These profiles deliberately contain no collision, objective, reward, save,
 * relationship, or companion-authority data. Renderers may consume them, but
 * simulation modules must not import them.
 */

export const GAMEPLAY_VISUAL_PROFILE_VERSION = 1;

export const CLAY_RESIN_MATERIAL_FAMILY = Object.freeze({
  id: "nexus-clay-resin-miniature-v1",
  label: "Nexus Link handcrafted 3D miniature + resin-clay",
  clayFinish: "matte-satin",
  resinUses: Object.freeze(["water", "crystal", "memory", "authored-energy"]),
  companionLayer: "canonical-illustrated-2d",
  contactShadows: true,
  glossyToyPlastic: false
});

const ORBIT_PROFILES = Object.freeze({
  moonlake: Object.freeze({
    id: "orbit-moonlake-clay-resin-v1",
    version: GAMEPLAY_VISUAL_PROFILE_VERSION,
    materialFamilyId: CLAY_RESIN_MATERIAL_FAMILY.id,
    palette: Object.freeze({
      skyTop: "#8fd3e8",
      skyBottom: "#e7d7a7",
      distantClay: "#8398a0",
      distantClayLight: "#b8c9c8",
      foliage: "#587b54",
      foliageLight: "#89a76c",
      resinDeep: "#168da7",
      resinMid: "#42bfd0",
      resinLight: "#a8eff0",
      clayStone: "#88969a",
      clayStoneLight: "#c7d0ca",
      clayStoneDark: "#53676b",
      cyan: "#77e5f4",
      gold: "#f1cf72",
      warmLight: "#ffd98c",
      shadow: "rgba(24, 54, 58, 0.28)",
      text: "rgba(236, 249, 250, 0.92)"
    }),
    arena: Object.freeze({
      rimStoneCount: 18,
      resinAlpha: 0.94,
      outerShadowAlpha: 0.28,
      contactRingAlpha: 0.82
    }),
    ambient: Object.freeze({
      waterfallCount: 2,
      moteCount: 9,
      motion: "gentle-drift"
    }),
    assetSlots: Object.freeze({
      foundation: null,
      materialAtlas: null,
      foreground: null
    })
  }),
  plains: Object.freeze({
    id: "orbit-plains-clay-resin-v1",
    version: GAMEPLAY_VISUAL_PROFILE_VERSION,
    materialFamilyId: CLAY_RESIN_MATERIAL_FAMILY.id,
    palette: Object.freeze({
      skyTop: "#91c9de",
      skyBottom: "#f2dda6",
      distantClay: "#8fa493",
      distantClayLight: "#cad7bf",
      foliage: "#688653",
      foliageLight: "#9eb778",
      resinDeep: "#288da0",
      resinMid: "#5bc2c5",
      resinLight: "#b7eee4",
      clayStone: "#9c9b8a",
      clayStoneLight: "#d5d0b8",
      clayStoneDark: "#676b60",
      cyan: "#77e5f4",
      gold: "#f0cb6f",
      warmLight: "#ffe09a",
      shadow: "rgba(38, 60, 43, 0.26)",
      text: "rgba(241, 250, 240, 0.92)"
    }),
    arena: Object.freeze({
      rimStoneCount: 18,
      resinAlpha: 0.9,
      outerShadowAlpha: 0.26,
      contactRingAlpha: 0.8
    }),
    ambient: Object.freeze({
      waterfallCount: 0,
      moteCount: 8,
      motion: "gentle-drift"
    }),
    assetSlots: Object.freeze({
      foundation: null,
      materialAtlas: null,
      foreground: null
    })
  })
});

const EXPEDITION_PROFILES = Object.freeze({
  plains_windrest: Object.freeze({
    id: "expedition-windrest-clay-resin-v1",
    version: GAMEPLAY_VISUAL_PROFILE_VERSION,
    materialFamilyId: CLAY_RESIN_MATERIAL_FAMILY.id,
    palette: Object.freeze({
      ground: 0x8ea65f,
      groundLight: 0xaec47b,
      groundDark: 0x667b4f,
      path: 0xc9c3a7,
      pathLight: 0xe7dfc4,
      pathDark: 0x7f806e,
      rock: 0x8b8e81,
      rockLight: 0xc8c8b7,
      bush: 0x6e8d50,
      bushLight: 0x9ab56c,
      flower: 0xe8e2bd,
      resin: 0x65dbe5,
      resinDeep: 0x278aa7,
      rift: 0x35266f,
      riftLight: 0x705ac8,
      shadow: 0x34422e,
      companion: 0x4f5b68,
      companionAccent: 0x80dce4,
      hpBar: 0x82d69b,
      hpBarBg: 0x3e4d3b
    }),
    pathPolylines: Object.freeze([
      Object.freeze([
        Object.freeze({ x: 0.5, y: 1.02 }),
        Object.freeze({ x: 0.5, y: 0.58 }),
        Object.freeze({ x: 0.5, y: 0.42 })
      ]),
      Object.freeze([
        Object.freeze({ x: 0.5, y: 0.58 }),
        Object.freeze({ x: 0.35, y: 0.43 }),
        Object.freeze({ x: 0.2, y: 0.18 })
      ]),
      Object.freeze([
        Object.freeze({ x: 0.5, y: 0.42 }),
        Object.freeze({ x: 0.64, y: 0.29 }),
        Object.freeze({ x: 0.78, y: 0.08 })
      ])
    ]),
    atmosphere: Object.freeze({ tint: 0xb9dca0, tintAlpha: 0.035 }),
    assetSlots: Object.freeze({ foundation: null, decorAtlas: null, foreground: null })
  }),
  forge_emberpath: Object.freeze({
    id: "expedition-emberpath-clay-resin-v1",
    version: GAMEPLAY_VISUAL_PROFILE_VERSION,
    materialFamilyId: CLAY_RESIN_MATERIAL_FAMILY.id,
    palette: Object.freeze({
      ground: 0x8b5d43,
      groundLight: 0xb77a51,
      groundDark: 0x5e4035,
      path: 0xb39a82,
      pathLight: 0xd8c2a8,
      pathDark: 0x6a5145,
      rock: 0x776964,
      rockLight: 0xb09c91,
      bush: 0x6f5c42,
      bushLight: 0x987957,
      flower: 0xf2bd74,
      resin: 0xffb76e,
      resinDeep: 0xc5643d,
      rift: 0x4a285d,
      riftLight: 0xb35c92,
      shadow: 0x382821,
      companion: 0x59606a,
      companionAccent: 0x84dce6,
      hpBar: 0xe0b579,
      hpBarBg: 0x4a3930
    }),
    pathPolylines: Object.freeze([
      Object.freeze([
        Object.freeze({ x: 0.08, y: 0.76 }),
        Object.freeze({ x: 0.36, y: 0.58 }),
        Object.freeze({ x: 0.56, y: 0.46 }),
        Object.freeze({ x: 0.88, y: 0.2 })
      ])
    ]),
    atmosphere: Object.freeze({ tint: 0xffc18a, tintAlpha: 0.045 }),
    assetSlots: Object.freeze({ foundation: null, decorAtlas: null, foreground: null })
  }),
  harbor_quayside: Object.freeze({
    id: "expedition-quayside-clay-resin-v1",
    version: GAMEPLAY_VISUAL_PROFILE_VERSION,
    materialFamilyId: CLAY_RESIN_MATERIAL_FAMILY.id,
    palette: Object.freeze({
      ground: 0x65868a,
      groundLight: 0x83a7a3,
      groundDark: 0x45656b,
      path: 0xb8b9ae,
      pathLight: 0xd8d8ca,
      pathDark: 0x6c7775,
      rock: 0x77878a,
      rockLight: 0xaebcba,
      bush: 0x587a6b,
      bushLight: 0x7fa08a,
      flower: 0xc7e1d6,
      resin: 0x67d8e8,
      resinDeep: 0x287f9a,
      rift: 0x2e376a,
      riftLight: 0x5f72c7,
      shadow: 0x2f4548,
      companion: 0x54616b,
      companionAccent: 0x83dce8,
      hpBar: 0x84d2b1,
      hpBarBg: 0x354b4e
    }),
    pathPolylines: Object.freeze([
      Object.freeze([
        Object.freeze({ x: 0.04, y: 0.56 }),
        Object.freeze({ x: 0.33, y: 0.52 }),
        Object.freeze({ x: 0.57, y: 0.42 }),
        Object.freeze({ x: 0.92, y: 0.48 })
      ])
    ]),
    atmosphere: Object.freeze({ tint: 0x9ed7df, tintAlpha: 0.055 }),
    assetSlots: Object.freeze({ foundation: null, decorAtlas: null, foreground: null })
  })
});

export function getOrbitGameplayVisualProfile(regionId = "moonlake") {
  return ORBIT_PROFILES[regionId] || ORBIT_PROFILES.moonlake;
}

export function getExpeditionGameplayVisualProfile(regionId = "plains_windrest") {
  return EXPEDITION_PROFILES[regionId] || EXPEDITION_PROFILES.plains_windrest;
}

export function listGameplayVisualProfileIds() {
  return Object.freeze({
    orbit: Object.freeze(Object.values(ORBIT_PROFILES).map((profile) => profile.id)),
    expedition: Object.freeze(Object.values(EXPEDITION_PROFILES).map((profile) => profile.id))
  });
}
