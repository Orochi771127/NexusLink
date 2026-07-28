# Habitat System Master Spec

*Status: ACTIVE CONTRACT · Runtime stack: HTML / CSS / Vanilla JS / PixiJS v8 + controlled Moonlake Three.js exception / localStorage / GitHub Pages*
*Authoring default: Blender / GLB for Moonlake Live 3D; layered PNG remains the fallback and legacy habitat path*

> 整併來源：`HABITAT_SCENE_PROFILE_SPEC.md`、`HABITAT_WEATHER_MOOD_PRESET_SPEC.md`、`LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`、`RFC_2_5D_HABITAT_RENDERER.md`，以及遠端 `UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md`（附錄，非必要）。

## 1. One-sentence model

```text
Habitat Scene Profile
+ Live 3D Scene Contract (Moonlake GLB/glTF)
+ Layer Manifest (fallback / legacy same-size transparent PNGs)
+ Time Phase (day / dusk / night / dawn)
+ Weather / Mood Preset
+ Three Environment Runtime + Pixi Companion/FX Runtime
+ Trace / Companion Safe Placement
+ Human Approval Gate (assets/**)
```

## 2. Stable decisions

1. **Canonical runtime is PixiJS + DOM, with one controlled Moonlake Three.js environment layer.** Three.js may render the approved live 3D habitat only; Pixi retains 2D companions and existing effects. No React Three Fiber and no build step.
2. **Moonlake authoring = Blender/GLB plus runtime materials and FX.** Layered PNG remains a reduced-capability fallback and the default for habitats that have not received a separate live-3D approval.
3. **Weather and time are atmosphere only.** No FOMO windows, daily streaks, timed rewards, dependency detection, or punishment for missing weather.
4. **Moonlake first.** Do not mass-produce GAP-3 region habitats until Moonlake Scene Profile + weather/time pass visual and performance review.
5. **Human visual approval** is required before promoting generated layers or GLB/glTF into `assets/**` (GROUNDWORK).
6. **The live-3D exception is Moonlake-scoped.** Other habitats remain on the Pixi/layer-manifest path until separately authorized.

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
| Blender + GLB/glTF + img2threejs quality contract | **Moonlake Live 3D default** |
| AI imagegen + generate2dmap / generate2dsprite | Concept, fallback and legacy habitat art |
| Pixi-only weather FX | Fallback or non-live-3D habitat weather |
| Blender offline orthographic PNG export | Reduced-capability fallback |
| Unity / UModeler offline PNG export | Optional; see appendix |

Moonlake live-3D export contract:

```text
Blender source
optimized GLB/glTF
fixed cinematic camera with bounded projection
Three.js environment runtime
PixiJS 2D companion projected from 3D world positions
static PNG fallback
```

## 8. Task pack order

1. **TP-HAB-SYSTEM-0** — this master spec + optional Unity docs on main (done when this file lands).
2. **TP-HAB-SYSTEM-1** — `moonlakeProfile.js` data-only.
3. **TP-HAB-TIME-1** — `day/dusk/night/dawn` in `environmentController`.
4. **TP-HAB-WEATHER-1** — Pixi weather fallback on `layerFX`.
5. **TP-MOONLAKE-LIVE-3D-R1** — approved live 3D Moonlake environment, hybrid projection and mobile fallback.

## 9. Explicit non-goals

- Unity as game runtime
- Three.js outside the approved Moonlake environment renderer
- Converting 2D illustrated companions into 3D models
- Giving the 3D renderer gameplay, save, relationship, reward, Safety or RaphaelCore authority
- Baking weather into foundation backgrounds
- GAP-3 seven-region mass generation before Profile + region switch
- Daily weather chores / FOMO

## 10. Source documents

- [`HABITAT_SCENE_PROFILE_SPEC.md`](./HABITAT_SCENE_PROFILE_SPEC.md)
- [`HABITAT_WEATHER_MOOD_PRESET_SPEC.md`](./HABITAT_WEATHER_MOOD_PRESET_SPEC.md)
- [`../assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`](../assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md)
- [`../rfc/RFC_2_5D_HABITAT_RENDERER.md`](../rfc/RFC_2_5D_HABITAT_RENDERER.md)
- [`../design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`](../design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md)
- [`UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md`](./UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md) *(optional appendix)*
- [`../agent/HABITAT_LAYER_PIPELINE_HANDOFF_2026-07-03.md`](../agent/HABITAT_LAYER_PIPELINE_HANDOFF_2026-07-03.md)

## Appendix A — Unity / UModeler (optional, non-default)

Unity may be used **only** as an offline art workstation:

- Export Background / Midground / Foreground / Overlay transparent PNGs
- Companion sits between Midground and Foreground in Pixi
- Do **not** ship a Unity project as the Nexus Link runtime
- Prefer AI layered PNGs until Moonlake weather/time are stable

Full detail: `UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md`.
