# Nexus Link Illustrated Runtime Asset Audit

> Package 7 record for the Steam Demo Master Blueprint. This document is an
> audit and runtime policy reference; it is not approval to generate, delete, or
> replace assets.

## Scope

- Active runtime companion manifests listed by the current registry.
- Source / readiness status from `src/data/companionRegistry.js` and
  `src/data/assetManifest.js`.
- Sprite sheet dimensions, grid exactness, declared bottom-center anchors,
  runtime sampling policy, and visible companion placement assumptions.
- Legacy assets are preserved. No `assets/**` file is moved, deleted, renamed,
  regenerated, or committed by this package.

## Active runtime entries

| Companion ID | Manifest / asset | Runtime status | Package 7 status |
| --- | --- | --- | --- |
| `greyshade-cat` | `assets/characters/greyshade-cat/metadata/animations.json` | primary full-runtime | Active illustrated manifest; legacy Greyshade sheets remain reference/rollback assets until a separate reference audit retires them. |
| `flame-flicker` | `assets/characters/flame-flicker/metadata/animations.json` | full-runtime | Active illustrated guardian manifest; protected runtime-ready root. |
| `ice-talon` | `assets/characters/ice-talon/metadata/animations.json` | full-runtime | Active illustrated guardian manifest; protected runtime-ready root. |
| `stone-shard` | `assets/characters/stone-shard/metadata/animations.json` | full-runtime | Active illustrated guardian manifest; protected runtime-ready root. |
| `vine-twist` | `assets/characters/vine-twist/metadata/animations.json` | full-runtime | Active illustrated guardian manifest; protected runtime-ready root. |
| `crystal-rabbit` | `assets/characters/crystal-rabbit/metadata/animations.json` | full-runtime | Active illustrated guardian manifest; protected runtime-ready root. |
| `blazetail-kit` | `assets/characters/blazetail-kit/metadata/animations.json` | full-runtime | Canonical runtime identity for 焰尾狐; Stage 1 form name is 焰尾小狐. The old `flametail-fox` id is a one-way save alias, not another asset root. |

Formal Heartspark and Ironflow companions promoted after the original Package 7
snapshot are governed by their current Stage 1 asset indexes. The remaining
named roadmap candidate `star-energy-boarlet` still requires a separate spec,
transparent master, human approval and asset-readiness gate.

## Runtime policy locked by Package 7

- Companion art style: illustrated / painterly / high-detail, not chunky pixel
  art.
- Runtime sampling: linear sampling; animated sheets attempt mipmap enablement
  where Pixi exposes the property.
- Anchor: bottom-center only, conceptually `{ x: 0.5, y: 1 }`.
- Scale basis: animated companions scale from `frameHeight`, not total
  `sheetHeight`.
- Sheet rule: every sheet edge must be `<= 4096 px`.
- Grid rule: `sheet_width === columns * frameWidth` and
  `sheet_height === rows * frameHeight`; extra pixels are not accepted.
- Load rule: keep existing boot-only loading and lazy warmup. Package 7 does
  not increase first-paint simultaneous texture load.
- Placement rule: final on-screen companion position remains snapped by the
  existing bottom-center placement path to prevent foot sliding.

## Audit evidence

Root-relative manifest audit was run against the six active animated companion
manifests:

```text
greyshade-cat: 34 animations, 26 unique sheets audited
flame-flicker: 29 animations, 29 unique sheets audited
ice-talon: 29 animations, 29 unique sheets audited
stone-shard: 29 animations, 29 unique sheets audited
vine-twist: 29 animations, 29 unique sheets audited
crystal-rabbit: 29 animations, 29 unique sheets audited
PASS: active runtime manifests match grid dimensions, <=4096 edges, bottom-center anchors where declared
```

## Findings and fixes

1. Active runtime sheets already match the required grid dimensions and
   `<=4096 px` edge limit.
2. Active metadata declares bottom-center anchors where anchor metadata is
   present.
3. `styles.css` was forcing `image-rendering: pixelated` on the entire Pixi
   canvas. Package 7 changes that global canvas rule to `auto` so illustrated
   companion rendering is not globally downgraded.
4. `spriteSheetAnimationLoader.js` now enforces exact sheet dimensions,
   `<=4096 px` sheet edges, bottom-center anchors, and illustrated texture
   policy at load time.
5. `companionRenderer.js` now avoids `roundPixels` for static companion images
   and applies the same linear sampling intent to static fallback textures.
6. `assetManifest.js` now lists all active runtime companion manifest roots and
   the shared illustrated runtime policy for future audits.

## Browser smoke evidence

- 390x844 Chrome headless smoke: one Pixi canvas, `image-rendering: auto`,
  `greyshade-cat` visible in sprite-sheet mode, current animation `idle_calm`,
  bottom-center anchor `{ x: 0.5, y: 1 }`, animated `roundPixels === false`,
  metadata loaded, no missing `idle_calm`, no animation errors, no policy
  warnings, no blocking console errors. Screenshot captured to the local temp
  directory during the run.
- 1280x900 Chrome headless smoke: same assertions passed; canvas remained
  centered in the desktop viewport with no visible placement assertion failure.
  Screenshot captured to the local temp directory during the run.

## Protected roots

The following runtime-ready roots are protected and must not be moved, deleted,
renamed, or regenerated by this audit package:

- `assets/characters/greyshade-cat`
- `assets/characters/flame-flicker`
- `assets/characters/ice-talon`
- `assets/characters/stone-shard`
- `assets/characters/vine-twist`
- `assets/characters/crystal-rabbit`

## Rollback

Revert the Package 7 commit. This restores the previous CSS canvas sampling,
loader validation behavior, static image sprite rounding, and asset manifest
shape. Because no `assets/**` file is changed, asset rollback requires no file
movement.

## Acceptance checklist

- Active runtime manifests are listed and auditable.
- No generated asset batch, legacy asset, or protected runtime root is deleted
  or moved.
- Runtime loader enforces exact grid dimensions and `<=4096 px` sheet edges.
- Runtime loader keeps bottom-center anchors and frame-height scaling.
- Illustrated companion rendering no longer uses global pixelated canvas CSS.
- Boot/lazy-load behavior remains bounded.
- 390x844 browser smoke has no blocking console error and no visible placement
  regression.
