# NexusLink Local Art And Animation Pipeline

This document is the official local art asset pipeline reference for NexusLink.
It defines where asset work happens, where final files may be written, and how character sprites, habitat maps, props, FX, and metadata move from raw generation to runtime-ready assets.

> Status: NEEDS UPDATE for commercial companion production. This file remains
> useful for asset ownership, folder standards, metadata, and QA flow, but its
> older 64x64 character normalization steps must be separated from the current
> illustrated 512x512 companion policy in `AGENTS.md`, `CLAUDE.md`, and
> `ACCEPTANCE.md`. Do not use this file to downgrade approved illustrated
> companion work into chunky pixel-art runtime assets.

## 1. Division Of Responsibility

Cloud Codex owns web-game architecture and integration work:

- Runtime architecture and module boundaries
- PixiJS and browser-game integration
- UI, HUD, modal, and responsive layout systems
- State systems, localStorage, persistence, and interaction logic
- GitHub Pages readiness and deployment support
- Runtime asset loading and metadata consumption

Local Codex owns visual asset production and local QA:

- Character and creature visual generation
- Sprite sheet generation and postprocessing
- Transparent PNG cleanup and frame extraction
- Sprite Pipeline normalization and preview sheets
- Habitat backgrounds, map layers, props, and platform assets
- FX sheets such as fire, shimmer, particles, and glow
- Local browser-game visual QA before runtime registration

Use Game Studio and Web Game Foundations to keep runtime, UI, state, asset loading, and QA boundaries clear. Use Generate 2D Sprite, Sprite Pipeline, Generate 2D Map, and agent-sprite-forge for local visual production. Use Game UI Frontend when assets affect HUD, overlays, safe areas, or playfield readability.

## 2. Repository Rule

All generated final assets must be written only inside:

```text
C:\Users\User\AIForgeNexus2\NexusLink
```

Never use these as final asset locations:

- `C:\Users\User\NexusLink`
- Playground
- Temporary output folders
- Tool cache folders
- Desktop scratch folders

Temporary processing folders are allowed only as intermediate work areas. Accepted final assets, metadata, prompts, QA previews, and runtime sheets must be copied into the NexusLink repository before they are referenced by runtime code or metadata.

Do not delete existing assets unless explicitly approved.

## 3. Character Sprite Pipeline

Character animation production must start from an approved seed frame. The seed frame is the identity lock for the character.

Every generated animation must preserve:

- Same character identity
- Same facing direction
- Same palette family
- Same silhouette family
- Same body proportions
- Same readable face and key identity marks
- Transparent final output
- Shared scale across all frames in the animation
- Bottom-center anchor for runtime alignment

Use Sprite Pipeline for normalization, frame extraction, preview assembly, and QC. Preview the sheet before approval, and only register the animation after the final runtime sheet exists in the repository.

## 4. Raw Generation Rule

For character or creature body animations, do not directly generate final `1xN` runtime strips as raw art.

Use a multi-frame strip or grid generation step first:

- 4 frames: prefer `2x2`
- 6 frames: prefer `2x3`
- 8 frames: prefer `2x4`
- 9 frames: prefer `3x3`
- 12 frames: prefer `3x4` or `4x3`

After raw generation:

1. Clean the background to transparency.
2. Normalize frames to fixed `64x64` cells.
3. Apply one shared scale across the full animation.
4. Align all frames to a shared bottom-center anchor.
5. Render a preview sheet for QC.
6. Export the runtime sheet only after QC passes.
7. Register the animation in `animations.json` only after the runtime sheet exists.

This prevents frame drift, inconsistent scale, cropped limbs, and runtime anchor instability.

## 5. Map Pipeline

NexusLink habitats must be layered. A habitat is not a single baked image unless explicitly approved for concept-only use.

The habitat pipeline should produce:

- Foundation-only base
- Separate props
- Separate FX
- Separate metadata
- QA preview

The foundation-only base may include stable non-interactive environment art such as terrain, ground material, water shapes, paths, cliffs, and distant atmosphere.

The foundation-only base must not bake in:

- Campfire flame
- Animated props
- Magic circle glow
- Characters
- UI
- Interactive objects
- Runtime-controlled props
- Collision-bearing objects

Runtime-controlled visual objects must be separate prop or FX assets with metadata that defines placement, animation, layering, and interaction expectations.

## 6. Folder Standards

### Characters

```text
assets/characters/{characterId}/
  concept/
  portrait/
  icons/
  spritesheets/
    emotion/
    touch/
    movement/
    battle/
    special/
  frames/
    emotion/
    touch/
    movement/
    battle/
    special/
  metadata/
    animations.json
```

Use `spritesheets/` for runtime-ready animation sheets. Use `frames/` for extracted normalized frames. Use `metadata/` for animation metadata, QA notes, and pipeline records.

### Habitats

```text
assets/habitats/{habitatId}/
  base/
  props/
  fx/
  previews/
  metadata/
    habitat.json
    props.json
    fx.json
```

Use `base/` for foundation-only habitat layers. Use `props/` and `fx/` for separately controlled runtime assets. Use `previews/` for composed QA views.

### Props

```text
assets/props/{propId}/
  source/
  final/
  previews/
  metadata/
    props.json
```

Props should remain reusable and separately placeable. Do not bake important props into the habitat foundation layer.

### FX

```text
assets/fx/{fxId}/
  source/
  spritesheets/
  frames/
  previews/
  metadata/
    fx.json
```

FX assets include fire, shimmer, glow, particles, bursts, and other animated overlays. Keep FX separate from character body sheets unless the effect is intentionally part of the character silhouette.

## 7. Metadata Standards

### `animations.json`

Character animation metadata. Each entry should define:

- Animation id
- Type or category
- Runtime sheet path
- Frame width
- Frame height
- Frame count
- FPS
- Loop behavior
- Anchor assumptions when needed

Do not add an animation entry until its final runtime sprite sheet exists.

### `habitat.json`

Habitat base and layer metadata. It should define:

- Habitat id
- Base layer assets
- Canvas or world dimensions
- Render order
- Camera or viewport assumptions
- QA preview references

### `props.json`

Prop placement metadata. It should define:

- Prop ids
- Asset paths
- World positions
- Scale
- Anchor
- Render layer
- Collision or interaction notes when applicable

### `fx.json`

Animated effect metadata. It should define:

- FX ids
- Runtime sheet paths
- Frame dimensions
- Frame counts
- FPS
- Loop behavior
- Blend or alpha expectations
- Placement or attachment rules

## 8. Current Greyshade-Cat Animation List

The official registered greyshade-cat animation list is:

- `idle_calm`
- `idle_defensive`
- `idle_distant`
- `blink`
- `touch_guarded`
- `touch_accept`
- `touch_reject`

If the working tree temporarily disagrees with this list during local asset iteration, treat this document as the intended pipeline record and resolve metadata only after the corresponding runtime sprite sheets are present.

## 9. Next Priority Assets

Recommended next asset tasks:

- `greyshade-cat` `ambient_walk`
- `greyshade-cat` `hug`
- `greyshade-cat` `sit`
- `greyshade-cat` `sleep`
- `campfire` `idle_flame`
- `lake` shimmer
- `firefly` soul particles
- `magic circle` glow

Prioritize assets that make the habitat feel alive before expanding into large character batches. Each accepted asset should include final runtime output, source or raw generation record when useful, metadata, and a QA preview.
