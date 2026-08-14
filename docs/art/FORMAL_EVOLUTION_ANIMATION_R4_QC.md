# Formal Evolution Animation R4 QC

## Result

`PASS` for the complete Stage 2 / Stage 3 art-production package.

- Characters: 11
- Later forms: 22
- Delivery sheets: 176
- Frames: 2,816
- Actions per form: idle, movement, attack and recovery
- Direction families per action: cardinal and diagonal
- Directions represented: eight
- Frames per direction: four
- Cell size: 512x512 RGBA PNG
- Sheet size: 2048x2048 RGBA PNG

The roster-level machine-readable index is
`assets/characters/formal-evolution-animation-r4.json`. Every form has its own
`animation-r3/animation-manifest.json`; character stage metadata points to the
corresponding manifest.

## Mechanical audit

The final global audit scanned all 176 delivery sheets and all 2,816 cells.
It passed with:

- zero missing manifests or sheets;
- zero malformed sheet dimensions or image modes;
- zero empty cells;
- zero frame-edge contacts;
- zero detached-fragment failures under the strict 12-pixel / 0.15% rule;
- `runtimeAuthority:false` and `runtimeFormSwapReady:false` on every form.

Forty-four earlier sheets failed the detached-fragment gate because chroma-key
sources left isolated matte fragments. They were rebuilt from the retained
normalized source sheets, filtered to the largest connected body in each cell,
normalized to the shared feet/bottom anchor and re-audited. Failed and
intermediate files remain only under ignored `output/`; none are part of the
versioned delivery surface.

## Visual audit

All twenty-two forms were reviewed in complete checkerboard and dark-background
contact boards. The review covered:

- Stage 1 lineage recognition and clear Stage 2 / Stage 3 differentiation;
- front, side, back and diagonal direction readability;
- consistent body scale and bottom-center anchoring within each action family;
- complete feet, tails, antlers, fins, wings, ears and costume silhouettes;
- no half-body crop, missing fin, severed tail, clipped flame, white rectangle,
  baked UI, diffuse blue halo or visible chroma-key block;
- distinct idle, movement, attack and recovery silhouettes without detached
  projectiles or wide baked combat effects.

The assets are accepted as strict self-QC art-production candidates. This does
not replace an Owner in-motion feel-check, mobile memory/load proof or a live
runtime reference audit.

## Runtime and product boundary

This package deliberately does not implement Growth G4, invitation or consent,
stage advancement, save migration, registry changes, Pixi loading, Expedition
selection, Orbit manifestation or live form swapping. Stage 1 remains the live
runtime fallback. A separately authorized GROUNDWORK package is required before
any of these later forms can become runtime-active.
