# Formal Five Full Animation Production Plan

## Decision

Produce one character vertically to completion before switching to the next character. Within each character, produce and QC actions by catalog priority: P1, then P2, then P3.

Character order:

1. `blazetail-kit`
2. `auriowl`
3. `crystalfin-seahorse`
4. `sprigfawn`
5. `starstripe-cub`

## Why

- Keeps one identity seed, key color, silhouette family, scale, and anchor active through the full catalog.
- Reduces species-template leakage caused by repeatedly switching among vulpine, avian, aquatic-hover, cervid, and feline anatomy.
- Makes rejection/regeneration rules local and traceable per character.
- The cross-species pilot stage is already complete, so broad motion-family risk has been retired before vertical production begins.

## Catalog Contract

Each character receives all 29 shared animation IDs from `docs/assets/COMPANION_ANIMATION_CATALOG.md`. Existing accepted pilots count toward the 29. Every action is generated as one whole sheet, processed to transparent 512x512 cells, and self-reviewed before the next action begins.

## Priority Order Per Character

- P1: `idle_calm`, `idle_happy`, `idle_angry`, `idle_sad`, `idle_defensive`, `blink`, `right_walk`, `left_walk`, `touch_accept`, `touch_guarded`, `touch_reject`.
- P2: `idle_sick`, `idle_distant`, `idle_enjoy`, `sit`, `sleep`, `idle_wake`, `special_angry`, `special_sad`, `hug`.
- P3: `idle_dance`, `idle_wash`, `special_dance`, `attack_basic`, `skill_cast`, `defend`, `hit`, `faint`, `victory`.

## Self-Review Gate

Reject or regenerate any sheet that fails one or more of these:

- exact grid and 512x512 cell divisibility;
- transparent corners and no edge-touch frame;
- stable species-appropriate anchor and shared scale;
- complete body and anatomy in every frame;
- locked face, eye color, palette, markings, accessories, and material language;
- semantic action readability without forbidden species motion;
- consent/boundary meaning remains clear and non-punitive;
- no scenery, text, UI, human hand, detached effects, or poster composition;
- no runtime promotion claim before the separate GROUNDWORK gate.

## Sleep Loop Lock

For every character, `sleep` contains only an already-asleep looping state. Every frame must remain asleep; allowed variation is limited to breathing, tiny ear/feather/fin motion, tail or body settling, and other low-amplitude species-specific sleep motion. Do not include standing, lying down, waking, opening the eyes, or returning to idle inside `sleep`. Transition into sleep belongs outside this loop; waking animation belongs only to `idle_wake`.

## State

Review staging only. No files in this plan are approved for `assets/**` or runtime integration.
