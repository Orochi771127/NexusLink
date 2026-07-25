import { LINKARA_HABITATS_R1 } from "../assetManifest.js";
import { moonlakeProfile } from "./moonlakeProfile.js";

const REGION_DEFINITIONS = Object.freeze({
  core: Object.freeze({ label: "Central Radiant Core / 中央輝耀核心區", compassCenter: Object.freeze({ x: 540, y: 1290 }), groundY: 0.53, groundH: 0.19 }),
  mystic: Object.freeze({ label: "Mystic Mountains / 秘境山脈核心", compassCenter: Object.freeze({ x: 540, y: 930 }), groundY: 0.29, groundH: 0.23 }),
  plains: Object.freeze({ label: "Verdant Plains / 北部翠綠平原區", compassCenter: Object.freeze({ x: 540, y: 1200 }), groundY: 0.49, groundH: 0.2 }),
  forge: Object.freeze({ label: "Forge Hills / 東南熔爐丘陵區", compassCenter: Object.freeze({ x: 540, y: 1092 }), groundY: 0.45, groundH: 0.2 }),
  harbor: Object.freeze({ label: "Harbor Nexus / 南港", compassCenter: Object.freeze({ x: 540, y: 1175 }), groundY: 0.5, groundH: 0.21 }),
  tidal: Object.freeze({ label: "Tidal Frontier / 西南潮汐邊疆區", compassCenter: Object.freeze({ x: 540, y: 1110 }), groundY: 0.45, groundH: 0.2 })
});

function createRegionProfile(id, definition) {
  const art = LINKARA_HABITATS_R1[id];
  return Object.freeze({
    ...moonlakeProfile,
    id,
    version: 1,
    label: definition.label,
    background: Object.freeze({ mode: "cover", day: art.day, night: art.night, sameComposition: true }),
    layers: Object.freeze({ depthMask: art.depthMask, placementMask: art.placementMask }),
    companion: Object.freeze({
      // Owner 2026-07-25：腳底對齊各區十字中心（compassCenter）。
      alignment: "foot",
      backgroundPoint: definition.compassCenter,
      anchor: Object.freeze({ x: 0.5, y: definition.compassCenter.y / 1920 }),
      reservedRect: Object.freeze({ x: 0.38, y: definition.compassCenter.y / 1920 - 0.135, w: 0.24, h: 0.27 })
    }),
    zones: Object.freeze({
      ...moonlakeProfile.zones,
      water: Object.freeze([]),
      ground: Object.freeze([
        Object.freeze({ id: `${id}_companion_plaza`, rect: Object.freeze({ x: 0.2, y: definition.groundY, w: 0.6, h: definition.groundH }) })
      ]),
      affinity: Object.freeze([])
    })
  });
}

export const linkaraRegionProfiles = Object.freeze(
  Object.fromEntries(Object.entries(REGION_DEFINITIONS).map(([id, definition]) => [id, createRegionProfile(id, definition)]))
);
