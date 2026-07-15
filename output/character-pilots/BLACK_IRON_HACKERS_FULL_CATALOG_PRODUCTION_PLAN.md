# Black Iron Hackers Full 8-Frame Animation Production Plan

## Authority and scope

- Owner-approved reference: `docs/art/reference/black-iron-hackers-stage1-reference-sheet.png`.
- Review roster: `thunder-pup`, `wavecub`, `starflame-phoenix`, `star-foal`, `goldenspark-wyrm`.
- Review staging only under `output/character-pilots/**`.
- No `assets/**`, runtime, registry, manifest, state/save, canon authority, commit, or push change.

## Gates

1. Generate and QC one transparent identity seed per character.
2. Human identity review.
3. Generate and QC one species-specific eight-frame pilot per character.
4. Human motion-family review.
5. Produce each character vertically through P1, P2, and P3.
6. Cross-catalog mechanical and visual review.

## Full catalog contract

All five characters receive the 29 action IDs from `docs/assets/COMPANION_ANIMATION_CATALOG.md`, but the Owner's 2026-07-14 instruction overrides legacy per-action frame counts: every action is eight frames in a `2×4` raw grid and a `2048×1024` processed sheet with eight `512×512` cells.

Character order:

1. `thunder-pup`
2. `wavecub`
3. `starflame-phoenix`
4. `star-foal`
5. `goldenspark-wyrm`

Per-character order remains P1 → P2 → P3.

## Deep-sleep lock

`sleep` remains the shared action ID but every frame must already be deeply asleep: eyes closed, body settled, low-amplitude breathing, and only tiny species-specific secondary motion. No lying-down transition, eye opening, waking, standing, or return to idle. `idle_wake` owns all waking motion.

## QC

- exact `2×4` grid and `512×512` cells;
- RGBA output with transparent corners;
- no cell-edge contact;
- stable species datum and shared scale;
- complete anatomy and identity markers;
- no pedestal, scene, UI, text, human hand, weapon, projectile, or detached FX;
- consent/refusal/battle meanings remain compatible with Nexus Link boundaries;
- human approval required before any promotion.
