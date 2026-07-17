/**
 * Moonlake Scene Profile — pure data (TP-HAB-SYSTEM-1).
 * 對齊 MoonlakeVivarium_v3/v4 資產與 src/data/sceneLayout.js。
 * Runtime 消費方：environmentController / weatherFx / 未來 placement resolver。
 */

import { MOONLAKE_DIORAMA_R1 } from "../assetManifest.js";
import { moonlakeObjectPack } from "./moonlakeObjectPack.js";

export const moonlakeProfile = Object.freeze({
  id: "moonlake",
  version: 4,
  label: "Moonlake / 月湖棲地",

  artSize: Object.freeze({ width: 1080, height: 1920 }),

  background: Object.freeze({
    mode: "cover",
    day: MOONLAKE_DIORAMA_R1.backgrounds.day,
    night: MOONLAKE_DIORAMA_R1.backgrounds.night,
    sameComposition: true,
    lightingMode: "dynamic-day-master",
    bakedNightFallback: true
  }),

  // 增量分層（非取代 full-bleed）：營地靜態結構 + 前景遮擋（疊在夥伴之上）。
  // sky/mountains/lake/ground 仍 baked 在 day/night foundation；天氣 FX 為程序層。
  layers: Object.freeze({
    campStructuresDay: MOONLAKE_DIORAMA_R1.layers.campStructuresDay,
    campStructuresNight: MOONLAKE_DIORAMA_R1.layers.campStructuresNight,
    foregroundOcclusionDay: MOONLAKE_DIORAMA_R1.layers.foregroundOcclusionDay,
    foregroundOcclusionNight: MOONLAKE_DIORAMA_R1.layers.foregroundOcclusionNight
  }),

  objectPack: moonlakeObjectPack,

  safeZone: Object.freeze({ referenceWidth: 390, referenceHeight: 844 }),

  sky: Object.freeze({
    exists: true,
    rect: Object.freeze({ x: 0.08, y: 0.06, w: 0.84, h: 0.3 }),
    horizonY: 0.34
  }),

  celestial: Object.freeze({
    enabled: true,
    anchor: "background",
    mode: "sharedHorizonArc",
    xRange: Object.freeze([0.12, 0.88]),
    yRange: Object.freeze([0.12, 0.34]),
    twilightMinutes: 45,
    fallback: Object.freeze({
      sun: Object.freeze({ x: 0.3, y: 0.18 }),
      moon: Object.freeze({ x: 0.66, y: 0.16 })
    })
  }),

  // This scene anchor is the visible compass center. The renderer preserves the
  // sprite asset's bottom-center frame anchor while aligning its visual center here.
  companion: Object.freeze({
    alignment: "visual-center",
    backgroundPoint: Object.freeze({ x: 540, y: 1348 }),
    anchor: Object.freeze({ x: 0.5, y: 1348 / 1920 }),
    displayScale: 0.9,
    minimumHitArea: Object.freeze({ width: 84, height: 104 }),
    reservedRect: Object.freeze({ x: 0.38, y: 1348 / 1920 - 0.135, w: 0.24, h: 0.27 })
  }),

  ui: Object.freeze({
    subtractTopInset: true,
    subtractBottomInset: true,
    sideInset: true,
    extraForbidden: Object.freeze([])
  }),

  zones: Object.freeze({
    forbidden: Object.freeze([
      Object.freeze({
        id: "hud_top",
        rect: Object.freeze({ x: 0, y: 0, w: 1, h: 0.12 }),
        reason: "HUD"
      }),
      Object.freeze({
        id: "dock_bottom",
        rect: Object.freeze({ x: 0, y: 0.8, w: 1, h: 0.2 }),
        reason: "dock+soulTalk"
      })
    ]),
    water: Object.freeze([
      Object.freeze({
        id: "lake_main",
        rect: Object.freeze({ x: 0.28, y: 0.4, w: 0.44, h: 0.18 }),
        maxTraces: 4
      })
    ]),
    ground: Object.freeze([
      Object.freeze({
        id: "shoreline",
        rect: Object.freeze({ x: 0.28, y: 0.58, w: 0.44, h: 0.14 })
      }),
      Object.freeze({
        id: "fg_left",
        rect: Object.freeze({ x: 0.08, y: 0.66, w: 0.22, h: 0.12 })
      }),
      Object.freeze({
        id: "fg_right",
        rect: Object.freeze({ x: 0.7, y: 0.64, w: 0.22, h: 0.12 })
      })
    ]),
    affinity: Object.freeze([
      Object.freeze({
        id: "lanternLeft",
        kind: "lantern",
        rect: Object.freeze({ x: 0.12, y: 0.64, w: 0.14, h: 0.1 })
      }),
      Object.freeze({
        id: "crystal",
        kind: "crystal",
        rect: Object.freeze({ x: 0.68, y: 0.62, w: 0.16, h: 0.12 })
      }),
      Object.freeze({
        id: "magicCircle",
        kind: "platform",
        rect: Object.freeze({ x: 0.38, y: 0.6, w: 0.24, h: 0.1 })
      })
    ]),
    weather: Object.freeze([
      Object.freeze({
        id: "rain_band",
        rect: Object.freeze({ x: 0.05, y: 0.12, w: 0.9, h: 0.55 })
      }),
      Object.freeze({
        id: "mist_water",
        rect: Object.freeze({ x: 0.22, y: 0.38, w: 0.56, h: 0.22 })
      })
    ])
  }),

  placement: Object.freeze({
    minDistance: 0.06,
    avoidCompanion: true,
    avoidUiInsets: true
  }),

  // 時間相位提示（實際計算在 environmentController）
  timePhases: Object.freeze({
    day: Object.freeze({ nightAlpha: 0, sunAlpha: 1, moonAlpha: 0 }),
    dusk: Object.freeze({ nightAlpha: 0.45, sunAlpha: 0.55, moonAlpha: 0.35 }),
    night: Object.freeze({ nightAlpha: 1, sunAlpha: 0, moonAlpha: 1 }),
    dawn: Object.freeze({ nightAlpha: 0.35, sunAlpha: 0.45, moonAlpha: 0.25 })
  }),

  weatherPresets: Object.freeze({
    clear: Object.freeze({
      ambientTint: 0xdcefff,
      tintAlpha: 0,
      rainLines: false,
      fog: false,
      fogAlpha: 0,
      motes: "soft_glow",
      waterRipple: "low"
    }),
    rain: Object.freeze({
      ambientTint: 0x8aa8c4,
      tintAlpha: 0.12,
      rainLines: true,
      fog: true,
      fogAlpha: 0.18,
      motes: "none",
      waterRipple: "medium"
    }),
    mist: Object.freeze({
      ambientTint: 0xb8c8d8,
      tintAlpha: 0.1,
      rainLines: false,
      fog: true,
      fogAlpha: 0.28,
      motes: "soft_glow",
      waterRipple: "low"
    }),
    quiet_after_talk: Object.freeze({
      ambientTint: 0xffe8d0,
      tintAlpha: 0.08,
      rainLines: false,
      fog: false,
      fogAlpha: 0.05,
      motes: "warm_slow",
      waterRipple: "low"
    }),
    rift_pressure: Object.freeze({
      ambientTint: 0x6a7a9a,
      tintAlpha: 0.16,
      rainLines: false,
      fog: true,
      fogAlpha: 0.22,
      motes: "cool_pulse",
      waterRipple: "low"
    }),
    after_repair: Object.freeze({
      ambientTint: 0xfff0e0,
      tintAlpha: 0.06,
      rainLines: false,
      fog: false,
      fogAlpha: 0.04,
      motes: "soft_glow",
      waterRipple: "low"
    })
  }),

  fxBudget: Object.freeze({
    maxRainParticles: 90,
    maxMotes: 28,
    maxFogOverlays: 2,
    maxFullScreenTintOverlays: 1
  })
});

export default moonlakeProfile;
