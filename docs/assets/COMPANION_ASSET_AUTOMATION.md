# COMPANION_ASSET_AUTOMATION.md — Nexus Link Companion Asset Automation

This document defines the minimum usable automation flow for Nexus Link companion asset production.

Codex is the character asset production-line engineer, not the art director. Codex organizes lock specs, prompts, action configs, validation, and QC reports. The image generation tool creates raw images. Human review owns final aesthetic approval and identity drift decisions.

No part of this pipeline may modify runtime renderer code, move existing assets, generate final images automatically, or place unapproved files into runtime assets.

---

## Core Policy

- New companion art style: illustrated / painterly / high-detail.
- New companion master frame: `512x512`.
- Final runtime asset: transparent PNG.
- Forbidden baked-in elements: white background, UI, text, scene, pedestal, codex frame.
- Anchor: bottom-center.
- Position snap: true.
- Sampling: linear + mipmaps.
- Sheet edge: `<= 4096`.
- Sheet grid: exactly divisible.
- Scale basis: `frameHeight`, not `sheetHeight`.
- `greyshade-cat` current 443/444 frame is legacy accepted and must never be upscaled to 512.
- Pixel-style concept sheets, 64 PPU references, and 96px codex markers are reference / art canon only, not runtime sprites.

---

## Production Flow

1. Human provides old design art / concept sheet / art canon.
2. Codex organizes a Character Lock Spec from `templates/character-lock.template.md`.
3. Human approves the Character Lock Spec.
4. Human or Codex selects an `animation_id` from `docs/assets/COMPANION_ANIMATION_CATALOG.md`.
5. Codex creates an Action Config from `templates/companion-action-config.template.json`.
6. Codex generates a prompt from the Lock Spec + Action Config.
7. Image generation tool produces a `512x512` transparent frame or full animation sheet.
8. Codex runs `scripts/validate_companion_asset.js`.
9. Codex produces a QC report.
10. Human confirms there is no character identity drift.
11. Only after approval may the asset enter runtime assets.
12. If the character drifts, return to the Lock Spec / prompt and fix the source instructions. Do not force the image into the game.

---

## Prompt Build

Use:

```bash
node scripts/build_companion_prompt.js --lock path/to/lock.md --action path/to/action.json --out path/to/prompt.txt
```

The prompt builder:

- reads the Character Lock Spec markdown
- reads the Action Config JSON
- validates the sheet math
- rejects sheet edges above `4096`
- rejects non-divisible grids
- emits text that can be pasted into an image generation tool
- never calls an image API
- never generates images

Use `--out -` to print to stdout.

---

## Asset Validation

Use:

```bash
node scripts/validate_companion_asset.js --file path/to/sheet.png --character-id thunderpup --cols 4 --rows 2 --expected-frames 8
```

The validator checks:

- file exists
- PNG signature
- PNG width / height from IHDR
- sheet edge `<= 4096`
- grid exactly divisible
- derived frame width / height
- new companion frame size is `512x512`
- `greyshade-cat` 443/444 legacy exception
- expected frame count equals `cols * rows`
- alpha-capable PNG metadata when possible

The validator writes a JSON QC report. It does not judge beauty, pose appeal, species match, or character likeness. Those remain human review responsibilities.

Transparent-background validation is metadata-only unless deeper pixel analysis is added later. Edge-touch warnings are currently `not_checked`.

---

## Action Sheet Rules

- High-value companion animation must not be generated frame-by-frame.
- Generate the whole action sheet at once, then run QC.
- One sheet should use one action config and one approved lock spec.
- Body scale must remain stable across frames.
- Full body must stay inside the safe area.
- Bottom-center baseline must remain stable.
- VFX / projectile / impact elements should not be mixed into the body sheet unless the action config explicitly allows it.
- Presentation sheets and concept sheets are never runtime sprites.

---

## Required Human Reviews

Human must approve:

- Character Lock Spec before prompt generation
- whether generated output preserves species, silhouette, palette, face, eyes, markings, and material language
- whether personality and motion style fit the companion
- whether the asset is allowed into runtime assets

Codex may report drift, but must not overrule human aesthetic judgment.
