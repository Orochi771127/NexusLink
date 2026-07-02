# 05 — Unity / UModeler Pipeline

This document defines how Unity / UModeler should be used in Nexus Link without changing the active Web/PixiJS runtime direction.

## Positioning

Unity / UModeler is currently an **asset and scene production pipeline**.

It is not the main Nexus Link runtime unless a future approved decision explicitly changes that.

Correct relationship:

```text
Unity / UModeler scene production
        ↓
Layered PNG export + scene manifest
        ↓
Web / PixiJS runtime loading
        ↓
Nexus Link commercial vertical slice
```

## Primary Use Case

Use Unity/UModeler to compose habitat scenes and export parallax-ready visual layers.

Target layer outputs:

- `Background.png`
- `Midground.png`
- `Foreground.png`
- `Overlay.png`
- `manifest.json`

These files should be consumed by the Web/PixiJS runtime.

## Layer Definitions

### Background

Long-distance visual depth.

Examples:

- sky
- far mountains
- far city silhouettes
- distant atmosphere
- static distant structures

Expected behavior:

- lowest parallax movement
- no collision semantics
- usually opaque or near-opaque

### Midground

Main environmental body.

Examples:

- lake
- buildings
- major terrain
- industrial structures
- large crystals
- bridges only when canon allows them

Expected behavior:

- moderate parallax movement
- primary spatial identity of the habitat
- may contain animated secondary effects through separate runtime overlays

### Foreground

Player/companion grounding layer.

Examples:

- platform
- grass
- railings
- pillars
- near rocks
- foreground architecture

Expected behavior:

- highest non-overlay parallax movement
- visually grounds companion feet / anchor
- should not obscure the companion unless intentionally designed

### Overlay

Non-solid atmosphere and effects.

Examples:

- light rays
- fog
- particles
- shimmer
- glow haze
- dust motes

Expected behavior:

- optional
- transparent PNG preferred
- may be static or paired with PixiJS runtime effects
- should not make UI readability worse

## Scene Export Requirements

A future Unity exporter should:

1. detect objects by Unity Layer, tag, naming convention, or explicit export component
2. render each layer with a deterministic camera setup
3. preserve transparent alpha where needed
4. export PNGs using stable file names
5. generate a manifest JSON for PixiJS
6. report missing or empty layers
7. avoid manual post-export renaming

## Suggested Unity Structure

If a Unity pipeline folder is added later, prefer:

```text
unity-pipeline/
  Assets/
    Editor/
      NexusLayerExporter.cs
      NexusSceneValidation.cs
      NexusPrefabValidation.cs
    Scenes/
      HabitatExports/
    Scripts/
      ExportMarkers/
  Packages/
  ProjectSettings/
```

Do not commit Unity-generated cache folders:

- `Library/`
- `Temp/`
- `Obj/`
- `Build/`
- `Builds/`
- `Logs/`
- `UserSettings/`

Large binary files should use Git LFS if they exceed normal GitHub limits or create repo bloat.

## Batchmode Rule

Repeatable Unity operations should be callable through Unity batchmode.

Example command shape:

```bash
Unity.exe -quit -batchmode -projectPath "<repo>/unity-pipeline" -executeMethod NexusLayerExporter.ExportAll
```

Do not rely on Codex manually clicking Unity Editor UI for repeatable work.

## Manifest Output Contract

A minimum manifest should contain:

```json
{
  "sceneId": "northern-verdant-plains-habitat",
  "version": 1,
  "size": {
    "width": 1920,
    "height": 1080
  },
  "layers": [
    {
      "id": "background",
      "src": "Background.png",
      "parallax": 0.05,
      "zIndex": 0
    },
    {
      "id": "midground",
      "src": "Midground.png",
      "parallax": 0.12,
      "zIndex": 10
    },
    {
      "id": "foreground",
      "src": "Foreground.png",
      "parallax": 0.2,
      "zIndex": 20
    },
    {
      "id": "overlay",
      "src": "Overlay.png",
      "parallax": 0.16,
      "zIndex": 30,
      "blendMode": "normal",
      "alpha": 1
    }
  ]
}
```

## Safety Boundaries

Unity pipeline work must not:

- migrate the Web runtime into Unity
- introduce React, npm, TypeScript, or a build step into the Web runtime
- overwrite existing `assets/**` without asset readiness approval
- delete accepted legacy assets
- alter RaphaelCore, save state, or gameplay loops as a side effect

## Acceptance Checklist For Future Implementation

A Unity export task is acceptable only if:

- generated layer file names are deterministic
- manifest paths match actual outputs
- transparent overlays remain transparent
- missing layers produce clear validation errors
- PixiJS can load the output without manual renaming
- no runtime code is changed unless the task explicitly includes the PixiJS loader work
