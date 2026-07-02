# 07 — Asset Pipeline

This document summarizes asset readiness expectations for Codex and other agents. It does not replace canonical art documents or human approval.

## Asset Pipeline Principle

Assets should enter runtime only after they are:

- intentional
- named consistently
- visually compatible
- performance-aware
- free from baked-in UI or unintended background elements
- approved by the human when generated externally

Raw AI outputs, concept art, placeholder files, or chat-generated drafts are not automatically runtime-ready.

## Companion Asset Rules

Current companion direction:

- illustrated / painterly / high-detail
- not chunky pixel art by default
- transparent PNG final runtime asset
- no baked-in white background
- no UI frame
- no text
- no pedestal or display base unless explicitly part of the character design
- bottom-center anchor
- stable foot/ground contact
- avoid silhouette/background blending

Frame and sheet constraints:

- master frame target: `512×512 px` for new illustrated companion assets
- sprite sheet edge: `<= 4096 px`
- frame grid must divide evenly
- scale should be based on frame height, not full sheet height
- existing Greyshade 443/444 legacy frames are accepted exceptions and must not be force-upscaled

## Greyshade Cat Replacement Rule

Greyshade Cat is the first validated runtime carrier.

Any replacement from legacy 64-style assets to illustrated 512 assets is a **reference-audited groundwork swap**.

Required behavior:

- new and old assets must coexist during audit
- do not delete legacy assets before reference audit passes
- do not let Greyshade fallback to another character's art
- preserve single-active-companion runtime model
- document all touched asset paths

## Habitat Scene Asset Rules

Layered habitat assets should use this convention when generated from Unity/UModeler or another authoring pipeline:

```text
assets/scenes/<scene-id>/
  manifest.json
  Background.png
  Midground.png
  Foreground.png
  Overlay.png
```

Layer purpose:

- Background: sky, far mountains, far city, distant atmospheric forms
- Midground: lake, architecture, terrain, large structures, primary environment
- Foreground: platform, grass, rails, near props, companion grounding elements
- Overlay: glow, fog, particles, light rays, shimmer, atmospheric effects

## Naming Rules

Use stable lowercase IDs for runtime-facing files and manifests.

Recommended scene ID style:

```text
moonlake-camp-habitat
northern-verdant-plains-habitat
southeast-forge-hills-habitat
southwest-tidal-frontier-habitat
eastern-mystic-mountains-habitat
central-radiant-core-habitat
south-harbor-habitat
```

Do not rename runtime assets casually. If a rename is necessary, update all references and provide a reference-audit checklist.

## Approved vs Placeholder

Agents must distinguish:

- concept art
- placeholder art
- design reference
- runtime-ready art
- legacy accepted art
- deprecated but locked art

Do not treat visual presence in a folder as automatic approval for runtime use.

## Runtime Entry Gate

Before adding an asset to runtime selection, verify:

- file path is stable
- dimensions are suitable
- transparent regions behave correctly
- naming matches registry/manifest expectations
- no accidental white/purple/solid background remains
- visual silhouette remains readable in the target scene
- mobile memory impact is acceptable
- human approval exists for generated art

## Audio Asset Rules

Music and ambience should support calm companionship and loop cleanly.

For background music:

- avoid harsh transients
- avoid sudden endings
- loop compatibility matters more than maximal drama
- scene identity should be clear but not fatiguing
- do not add copyrighted audio unless rights are clear

For sound effects:

- avoid manipulative notification patterns
- avoid casino-like reward stingers
- keep UI feedback gentle and readable

## Generated Asset Rule

When using AI-generated images, audio, or video as source material:

1. keep source prompt/context in documentation when useful
2. verify rights and licensing separately when commercial use is intended
3. remove baked-in backgrounds before runtime use
4. test silhouette/readability against actual UI and habitat backgrounds
5. do not overwrite approved runtime assets without audit

## Asset Validation Ideas

A future validation tool may check:

- PNG dimensions
- alpha channel presence
- max texture edge
- manifest path existence
- expected layer names
- oversized assets
- missing overlay optional flag
- sprite sheet divisibility
- naming convention mismatches

Suggested future script area:

```text
tools/asset-validation/
```

Note: `tools/**` is high-risk according to `AGENTS.md`; do not modify it without explicit task scope.

## Non-Goals

The asset pipeline must not:

- delete accepted legacy assets without approval
- replace Greyshade without audit
- turn all companions into pixel art by default
- introduce large uncompressed binaries casually
- create hidden dependency on Unity runtime
- add gacha, rarity, skin-shop, or power-pack semantics through asset structure
