# Habitat System Master Spec

*Status: ACTIVE CONTRACT · Runtime stack: HTML / CSS / Vanilla JS / PixiJS v8 / localStorage / GitHub Pages*  
*Authoring default: no Unity · Unity / Blender = optional offline tools only*

> 整併來源：`HABITAT_SCENE_PROFILE_SPEC.md`、`HABITAT_WEATHER_MOOD_PRESET_SPEC.md`、`LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`、`RFC_2_5D_HABITAT_RENDERER.md`，以及遠端 `UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md`（附錄，非必要）。

## 1. One-sentence model

```text
Habitat Scene Profile
+ Layer Manifest (same-size transparent PNGs)
+ Time Phase (day / dusk / night / dawn)
+ Weather / Mood Preset
+ Pixi FX Runtime
+ Trace / Companion Safe Placement
+ Human Approval Gate (assets/**)
```

## 2. Stable decisions

1. **Canonical runtime stays PixiJS + DOM.** No Unity WebGL, no Three.js, no React Three Fiber, no new build step for habitat runtime.
2. **Default art authoring = AI layered PNG / paintover / Pixi FX.** Unity and Blender are optional offline benches that must export the same PNG + manifest contract.
3. **Weather and time are atmosphere only.** No FOMO windows, daily streaks, timed rewards, dependency detection, or punishment for missing weather.
4. **Moonlake first.** Do not mass-produce GAP-3 region habitats until Moonlake Scene Profile + weather/time pass visual and performance review.
5. **Human visual approval** is required before promoting generated layers into `assets/**` (GROUNDWORK).

## 3. Layer model (art + runtime)

```text
sky_atmosphere
distant_mountains_or_city
water_or_atmosphere_plane
shore_ground_platform
camp_or_region_structures          # static only if non-interactive
runtime_props                      # magic circle, campfire, crystals, lantern, arch
celestial_bodies                   # sun / moon sprites (never baked into base)
trace_fx
weather_fx                         # rain, mist, tint, ripples
foreground_occlusion
companion
ui_dom
```

Moonlake v4 minimum playable set may start with a full-bleed day/night foundation plus separate runtime props; further far/mid splits are incremental.

## 4. Scene Profile contract

Future / now: `src/data/sceneProfiles/moonlakeProfile.js`

Required fields:

| Field | Role |
|-------|------|
| `artSize` | Master artboard (Moonlake: 1080×1920) |
| `safeZone` | Runtime reference (390×844) |
| `background` | day/night paths, cover mode, `sameComposition` |
| `sky` / `celestial` | horizon + sun/moon arc |
| `companion.anchor` + `reservedRect` | feet baseline + opaque-cover forbid |
| `ui` | dynamic inset opts + static forbidden fallbacks |
| `zones` | water / ground / affinity / weather spawn |
| `weatherPresets` | clear / rain / mist / quiet_after_talk / rift_pressure / after_repair |
| `timePhases` | day / dusk / night / dawn mapping hints |

Profiles are **pure data**. Interpreters live in environment / weather / placement code.

## 5. Time system

```text
sceneTimePhase = day | dusk | night | dawn
```

- Extends `environmentController` (do not invent a second clock authority).
- Drives celestial alpha, nightAlpha blend, optional tint, campfire fade.
- Dawn/dusk may be tint-only at first; four base paintings are not required on day one.
- No real-time pressure loops for players.

## 6. Weather / mood system

Presets (Moonlake first):

| Id | Intent |
|----|--------|
| `clear` | Readable, lightly luminous |
| `rain` | Quiet memory; capped rain lines |
| `mist` | Soft fog over water/ground, not UI |
| `quiet_after_talk` | Warmer, thinner FX after Soul Talk |
| `rift_pressure` | Cooler tension after standoff; no jump scare |
| `after_repair` | Stabilized warmth |

FX budget (mobile): max ~90 rain particles, ~28 motes, ≤2 fog overlays, 1 full-screen tint; honor `prefers-reduced-motion` and `data-quality`.

## 7. Authoring paths (priority)

| Path | When |
|------|------|
| AI imagegen + generate2dmap / generate2dsprite | **Default now** |
| Pixi-only weather FX | Weather prototype without new base art |
| Blender offline orthographic PNG export | Later quality upgrade |
| Unity / UModeler offline PNG export | Optional; see appendix |

Export contract when using any 3D bench:

```text
fixed orthographic camera
same-size transparent PNG layers
PixiJS reconstructs
```

## 8. Task pack order

1. **TP-HAB-SYSTEM-0** — this master spec + optional Unity docs on main (done when this file lands).
2. **TP-HAB-SYSTEM-1** — `moonlakeProfile.js` data-only.
3. **TP-HAB-TIME-1** — `day/dusk/night/dawn` in `environmentController`.
4. **TP-HAB-WEATHER-1** — Pixi weather prototype on `layerFX`.
5. **TP-UH-1** — optional offline 3D authoring (deferred).

## 9. Explicit non-goals

- Unity / Three.js as game runtime
- Baking weather into foundation backgrounds
- GAP-3 seven-region mass generation before Profile + region switch
- Daily weather chores / FOMO

## 10. Source documents

- [`HABITAT_SCENE_PROFILE_SPEC.md`](./HABITAT_SCENE_PROFILE_SPEC.md)
- [`HABITAT_WEATHER_MOOD_PRESET_SPEC.md`](./HABITAT_WEATHER_MOOD_PRESET_SPEC.md)
- [`../assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`](../assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md)
- [`../rfc/RFC_2_5D_HABITAT_RENDERER.md`](../rfc/RFC_2_5D_HABITAT_RENDERER.md)
- [`UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md`](./UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md) *(optional appendix)*
- [`../agent/HABITAT_LAYER_PIPELINE_HANDOFF_2026-07-03.md`](../agent/HABITAT_LAYER_PIPELINE_HANDOFF_2026-07-03.md)

## Appendix A — Unity / UModeler (optional, non-default)

Unity may be used **only** as an offline art workstation:

- Export Background / Midground / Foreground / Overlay transparent PNGs
- Companion sits between Midground and Foreground in Pixi
- Do **not** ship a Unity project as the Nexus Link runtime
- Prefer AI layered PNGs until Moonlake weather/time are stable

Full detail: `UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md`.
