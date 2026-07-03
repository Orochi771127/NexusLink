# Habitat Weather And Mood Preset Spec

*Status: PROPOSAL - docs only - no runtime implementation*

This document translates throwaway weather / lighting demos into the Nexus Link habitat language. The goal is not to import a Three.js demo. The goal is to extract visual rules and rebuild them as lightweight PixiJS v8 habitat FX governed by Scene Profiles.

One sentence:

```text
Scene Profile
+ layered habitat art
+ lightweight Pixi FX layer
+ emotion / time / weather presets
+ mobile performance budget
+ QA / human approval gate
```

## 1. Translation Rule

Do not ask an AI tool to generate a complete rainy, night, or emotional habitat painting for runtime use.

Weather and mood are runtime breathing layers on top of a stable habitat:

- Base habitat art stays separated into layers.
- Weather is represented by preset data and lightweight FX.
- Mood changes tint, density, rhythm, and trace visibility.
- Scene Profile zones decide where FX may appear.
- Human visual approval is required before any generated asset or FX preset becomes runtime-facing.

## 2. Correct Pipeline

### Prototype Layer

Use Fable, Claude, Codex, or another agent to create throwaway demos only when a visual behavior needs exploration:

- rain lines
- mist
- reflection
- ripple
- clear daylight glow
- night moon glow

Prototype code can prove a look, but it is not the runtime architecture.

### Extraction Layer

Extract rules from the prototype, not its full code package:

- How rain lines move.
- Where splash particles spawn.
- Which zones can show puddles or wet overlays.
- Which layers darken or brighten.
- Which traces become more visible.
- Which FX must avoid the companion and UI.

### Nexus Link Runtime Layer

Rebuild the accepted rules in the existing stack:

- PixiJS v8 only.
- Vanilla JS ES modules only.
- No React, Three.js, React Three Fiber, TypeScript, backend, dependency, or build step.
- `ParticleContainer` for rain lines, motes, and tiny glows where appropriate.
- Sprite sheets for splash, ripple, or compact VFX loops.
- Semi-transparent overlays for wet stone, low fog, and reflections.
- Scene Profile zones control valid placement.
- Emotional state changes atmosphere only; it must not create dependency-driven behavior, rewards, red dots, daily pressure, or FOMO.

## 3. Data Shape

Weather and mood presets belong beside, or inside, a Scene Profile. They should reference named zones and layer roles instead of hardcoded screen coordinates.

```js
{
  id: "ethereal_moon_lakefront",
  layers: {
    sky: "layers/moonlake_sky.png",
    mountains: "layers/moonlake_mountains.png",
    lakeWater: "layers/moonlake_lake_water.png",
    groundPlatform: "layers/moonlake_shore_ground_platform.png",
    campStructures: "layers/moonlake_camp_structures.png",
    foregroundOcclusion: "layers/moonlake_foreground_occlusion.png"
  },
  zones: {
    sky: [],
    water: [],
    ground: [],
    companionReserved: {},
    uiForbidden: []
  },
  weatherPresets: {
    clear: {
      ambientTint: "#dcefff",
      motes: "soft_glow",
      waterRipple: "low"
    },
    rain: {
      rainLines: true,
      splashZones: ["lake_main", "stone_platform_edge"],
      wetOverlay: "stone_low_alpha",
      reflection: "lake_only",
      fog: "blue_low"
    },
    night: {
      moonGlow: true,
      lakeReflection: true,
      traceAlphaBoost: 0.15
    }
  }
}
```

## 4. Moonlake First Presets

Do Moonlake first. Do not expand to all seven Linkara regions until Moonlake passes visual and performance review.

### `clear`

Intent: safe, readable, lightly luminous.

- Low water ripple.
- Soft glow motes only.
- No heavy fog.
- No companion occlusion.
- Trace visibility remains normal.

### `rain`

Intent: quiet memory, not drama or punishment.

- Rain lines use a capped particle count.
- Splash/ripple is restricted to water and platform-edge zones.
- Wet overlay is low-alpha and never covers the companion.
- Blue low fog may sit over water, not over UI or the companion.
- No reward framing, no daily task framing, no red-dot pressure.

### `night`

Intent: moonlight, heart-core glow, and clearer memory traces.

- Moon glow enabled if the profile has sky/celestial support.
- Lake reflection is restricted to water zones.
- Trace alpha may increase slightly.
- UI contrast and companion readability must stay intact.

### `quiet_after_talk`

Intent: repair warmth after a Soul Talk or boundary-stabilizing moment.

- Reflection becomes warmer.
- Fog decreases.
- Trace jitter decreases.
- Motes slow down or thin out.
- This is atmosphere feedback only, not a reward payout.

### `rift_pressure`

Intent: environmental tension without horror escalation.

- Ambient tint becomes cooler and tighter.
- Low-frequency pulse or trace instability may increase.
- Fog may narrow the visual field.
- Do not use jump scares, red danger alarms, failure-state framing, or irreversible bad-end language.

### `after_repair`

Intent: warmer reflection and stabilized traces.

- Wet/reflection highlights become warmer.
- Fog lowers.
- Trace positions stabilize.
- Companion safe zone remains clean.

## 5. Runtime FX Budget

Initial mobile budget targets for Moonlake:

```js
{
  maxRainParticles: 90,
  maxMotes: 28,
  maxRipples: 8,
  maxSplashSprites: 10,
  maxFogOverlays: 2,
  maxFullScreenTintOverlays: 1,
  targetMinFpsMobile: 50,
  hardStopBelowFps: 45
}
```

Implementation notes:

- Prefer pooled sprites and `ParticleContainer`.
- Avoid full-screen animated filters as a default.
- Avoid per-pixel displacement or expensive blur on mobile.
- Pause or reduce FX while menus, Soul Talk, or onboarding overlays dominate the screen.
- Weather FX must honor UI forbidden zones and the companion reserved rectangle.

## 6. Non-Goals And Prohibitions

- Do not introduce Three.js or React Three Fiber to the formal runtime.
- Do not bake rain, reflections, memory glows, or weather traces into the base background.
- Do not generate a complete rainy habitat image and call it a runtime asset.
- Do not make weather into a reward, streak, daily task, FOMO, or notification pressure system.
- Do not let emotion/weather logic detect or encourage player dependency.
- Do not touch `pixiApp.js`, `assetManifest.js`, `assets/**`, save schema, scene switching, or BGM routing without a separate approved GROUNDWORK task.

## 7. Task Packs

### TP-HAB-WEATHER-0 - Weather / Mood Preset Schema

Layer: `EXPERIENCE docs/data planning`, no runtime.

Outputs:

```text
docs/architecture/HABITAT_WEATHER_MOOD_PRESET_SPEC.md
future src/data/sceneProfiles weatherPreset shape draft only
```

Acceptance:

- Defines preset schema.
- Defines Moonlake first presets.
- Defines performance budget.
- Blocks Three.js / React / baked-weather assets.

### TP-HAB-WEATHER-1 - Moonlake Pixi Prototype

Layer: `EXPERIENCE prototype`, unless protected renderer files are touched.

Scope:

- Rain lines.
- Lake ripple.
- Low fog.
- Wet stone overlay.

Non-goals:

- No seven-region expansion.
- No asset promotion.
- No save schema.
- No emotional dependency logic.

### TP-HAB-WEATHER-2 - Scene Profile Integration

Layer: `EXPERIENCE data/runtime placement`, `GROUNDWORK` if protected renderer wiring is touched.

Scope:

- FX placement reads Scene Profile zones.
- Splash zones and water reflections use zone ids.
- UI and companion safety rects constrain FX.

### TP-HAB-WEATHER-3 - Emotion Mapping

Layer: `Raphael Core, Companion Reasoning, And Soul Talk` plus `Game Engineering And Architecture`.

Scope:

- Map approved emotional state deltas to `sceneMoodPreset`.
- Keep mapping atmospheric and non-rewarding.
- RaphaelCore safety, boundary, memory, and response policy remain final authority.

### TP-HAB-WEATHER-4 - Mobile QA

Layer: `Game Art, UI, And Visual Production`.

QA targets:

- Companion is not obscured.
- Lake ripple reads well.
- Rain does not drop below the mobile FPS budget.
- Trace positions remain plausible.
- UI safe zones stay clear.
- Soul Talk and onboarding overlays remain readable.

## 8. Moonlake Acceptance Checklist

Before applying weather/mood presets to other regions:

- `clear`, `rain`, `night`, and `quiet_after_talk` are visually reviewed on Moonlake.
- Companion readability passes at `390x844`.
- UI safe zones remain clear.
- Ripple and splash placement are water/edge-zone correct.
- Rain particle count stays within budget.
- No generated complete-weather background is promoted.
- Human approves any visible asset candidate before `assets/**` staging.
