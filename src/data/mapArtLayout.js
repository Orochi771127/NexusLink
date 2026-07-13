export const LINKARA_ATLAS_ART = Object.freeze({
  image: "./assets/maps/linkara/atlas/linkara-atlas-mobile-v1.jpg",
  sourceWidth: 1200,
  sourceHeight: 888,
  viewWidth: 100,
  viewHeight: 74
});

export const LINKARA_ATLAS_REGIONS = Object.freeze([
  { id: "forge", no: "1", zh: "東南熔爐丘陵區", en: "Southeast Forge Hills", x: 80, y: 49.33 },
  { id: "core", no: "2", zh: "中央輝耀核心區", en: "Central Radiant Core", x: 46, y: 35.46 },
  { id: "plains", no: "3", zh: "北部翠綠平原區", en: "Northern Verdant Plains", x: 32, y: 20.81 },
  { id: "harbor", no: "4", zh: "南港", en: "Southern Harbor Nexus", x: 50, y: 69.38 },
  { id: "moonlake", no: "5", zh: "月湖營地", en: "Ethereal Moon Lakefront", x: 71, y: 29.29 },
  { id: "mystic", no: "6", zh: "秘境山脈核心", en: "Eastern Mystic Mountains", x: 80, y: 13.88 },
  { id: "tidal", no: "7", zh: "西南潮汐邊疆區", en: "Southwest Tidal Frontier", x: 19, y: 60.13 }
]);

export const MOONLAKE_ROUTE_ART = Object.freeze({
  image: "./assets/maps/moonlake/route/moonlake-route-v1.jpg",
  sourceWidth: 1200,
  sourceHeight: 1584,
  viewWidth: 100,
  viewHeight: 132
});

export const MOONLAKE_NODE_LAYOUT = Object.freeze({
  moonlake_camp: { x: 50, y: 83, tone: "safe", glyph: "☾", vignette: "./assets/maps/moonlake/route/nodes/moonlake-camp-v1.jpg" },
  starwood_trail: { x: 22, y: 57, tone: "calm", glyph: "✶", vignette: "./assets/maps/moonlake/route/nodes/starwood-trail-v1.jpg" },
  misttide_shore: { x: 78, y: 61, tone: "calm", glyph: "≋", vignette: "./assets/maps/moonlake/route/nodes/misttide-shore-v1.jpg" },
  crystal_ruins: { x: 26, y: 24, tone: "discovery", glyph: "◇", vignette: "./assets/maps/moonlake/route/nodes/crystal-ruins-v1.jpg" },
  rift_observatory: { x: 74, y: 15, tone: "danger", glyph: "×", vignette: "./assets/maps/moonlake/route/nodes/rift-observatory-v1.jpg" },
  mirror_hollow: { x: 50, y: 42, tone: "calm", glyph: "☽", vignette: "./assets/maps/moonlake/route/nodes/mirror-hollow-v1.jpg" },
  plains_windrest: { x: 86, y: 36, tone: "calm", glyph: "⌁" },
  plains_rift: { x: 50, y: 7, tone: "danger", glyph: "×" },
  forge_emberpath: { x: 86, y: 36, tone: "discovery", glyph: "✦" },
  forge_rift: { x: 50, y: 7, tone: "danger", glyph: "×" },
  harbor_quayside: { x: 86, y: 36, tone: "calm", glyph: "≋" },
  harbor_rift: { x: 50, y: 7, tone: "danger", glyph: "×" },
  core_lightwell: { x: 86, y: 36, tone: "discovery", glyph: "✧" },
  core_rift: { x: 50, y: 7, tone: "danger", glyph: "×" },
  tidal_saltmarsh: { x: 86, y: 36, tone: "calm", glyph: "⌁" },
  tidal_rift: { x: 50, y: 7, tone: "danger", glyph: "×" },
  mystic_summitgate: { x: 86, y: 36, tone: "calm", glyph: "▲" },
  mystic_rift: { x: 50, y: 7, tone: "danger", glyph: "×" }
});
