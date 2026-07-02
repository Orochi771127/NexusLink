# 08 — Habitat Weather And Unity Habitat Authoring

This document is the curated landing zone for discussions about:

- habitat weather systems
- habitat atmosphere and ambience
- Unity / UModeler habitat authoring
- layered habitat export into the Web / PixiJS runtime

It should contain stable decisions and implementation-ready constraints, not raw chat transcripts.

## Current Status

Status: CONTEXT STUB — awaiting distilled source notes from the related ChatGPT discussion.

Known direction from current repo context:

- Web / PixiJS remains the active runtime.
- Unity / UModeler may be used as an asset and scene authoring pipeline.
- Unity-authored habitats should export Web-friendly layered assets and manifests.
- Weather should support companionship, mood, habitat identity, and visual breathing without becoming a pressure loop.

## Intended Role Of Habitat Weather

Habitat weather should be an ambience and emotional-state amplifier, not a chore system.

Allowed roles:

- reinforce habitat identity
- express subtle emotional climate
- create visual breathing
- support scene variation
- create calm returning-player recognition
- make the companion feel located in a living place

Avoid:

- FOMO weather windows
- daily streak pressure
- punishment for missing weather events
- gacha/rarity weather drops
- mandatory timed login events
- combat-stat farming based on weather

## Weather Layer Model

A future weather system may use layered visual components rather than replacing whole scenes.

Possible weather components:

- sky tint
- fog overlay
- rain streak overlay
- snow particle overlay
- firefly / dust particle overlay
- water shimmer intensity
- crystal glow intensity
- wind sway intensity
- ambient sound loop
- companion idle variation trigger

Default layer relationship:

```text
Base habitat layers
  Background
  Midground
  Foreground
  Overlay

Weather additions
  WeatherOverlay
  ParticleLayer
  LightTint
  AmbientAudio
  OptionalCompanionReaction
```

## Suggested Weather State Schema

A future manifest extension could look like:

```json
{
  "weather": {
    "default": "clear",
    "states": [
      {
        "id": "clear",
        "weight": 1,
        "overlay": null,
        "ambientAudio": "ambience-clear.ogg",
        "mood": "stable"
      },
      {
        "id": "mist",
        "weight": 0.35,
        "overlay": "weather-mist.png",
        "ambientAudio": "ambience-mist.ogg",
        "mood": "quiet"
      },
      {
        "id": "light-rain",
        "weight": 0.2,
        "overlay": "weather-light-rain.png",
        "ambientAudio": "ambience-light-rain.ogg",
        "mood": "reflective"
      }
    ]
  }
}
```

This schema is illustrative only. Do not implement it until a future task pack approves the exact runtime file locations and loader behavior.

## Weather Selection Policy

Weather should be calm, deterministic enough for testing, and not manipulative.

Possible selection modes:

1. **Manual debug mode** — developer selects weather for visual QA.
2. **Scene default mode** — each habitat has a default weather profile.
3. **Soft rotation mode** — weather changes occasionally without reward pressure.
4. **Emotional resonance mode** — companion/habitat mood can bias weather subtly.

Do not tie weather to:

- login streaks
- exp multipliers
- rare drop windows
- countdown urgency
- monetized weather tickets

## Unity Habitat Authoring Rules

When using Unity/UModeler to author habitats:

- keep scene composition separate from Web runtime logic
- group objects by export layer
- export deterministic PNG layers
- export a manifest JSON
- avoid manual renaming after export
- preserve transparent alpha for overlay/weather layers
- document camera size, resolution, and anchor assumptions

Suggested authoring groups:

```text
HabitatRoot
  Background
  Midground
  Foreground
  Overlay
  WeatherPreview
  ExportCamera
```

## Unity Export Expectations

A future Unity exporter should be able to output:

```text
assets/scenes/<scene-id>/
  manifest.json
  Background.png
  Midground.png
  Foreground.png
  Overlay.png
  weather/
    mist.png
    light-rain.png
    snow.png
```

Actual output path must be approved before implementation because `assets/**` is high-risk under `AGENTS.md`.

## PixiJS Runtime Expectations

A future PixiJS weather runtime should:

- load base scene layers first
- load optional weather overlays separately
- allow weather to be disabled for performance/accessibility
- avoid blocking first render on optional weather
- support manual QA override
- keep UI readability intact
- keep companion silhouette readable
- avoid excessive alpha overdraw on mobile

Potential future files:

```text
src/pixi/habitatWeatherController.js
src/pixi/habitatWeatherManifest.js
src/pixi/weatherOverlayRenderer.js
```

Touching `src/pixi/**` may be high-risk depending on bootstrap impact. Follow `AGENTS.md` groundwork protocol.

## Acceptance Criteria For Future Implementation

A future habitat weather task should pass these checks:

- clear/default weather renders without optional assets
- missing optional weather overlay does not crash the scene
- weather can be disabled
- weather does not affect save state unless explicitly approved
- no FOMO, reward pressure, or timed-login mechanics are introduced
- companion remains grounded and readable
- UI remains readable
- mobile performance is considered
- Unity export and PixiJS loading stay decoupled

## How To Fold In The Other Chat Window

When the human provides the other conversation content, distill it into this structure:

```md
## Source Discussion Summary

<one paragraph summary>

## Stable Decisions

- <decision 1>
- <decision 2>

## Open Questions

- <question 1>
- <question 2>

## Runtime Constraints

- <constraint 1>
- <constraint 2>

## Unity Authoring Requirements

- <requirement 1>
- <requirement 2>

## PixiJS Requirements

- <requirement 1>
- <requirement 2>

## Non-Goals

- <non-goal 1>
- <non-goal 2>

## Future Task Packs

- <task pack 1>
- <task pack 2>
```

Do not paste the raw full chat into this file unless explicitly requested. Preserve only the stable, implementation-relevant conclusions.
