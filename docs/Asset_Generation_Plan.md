# Nexus Link Asset Generation Plan

This document defines the first asset batches for the Nexus Link v0.1.x Web prototype.

The current product direction is an AI emotional habitat: one URL, one lake camp, one companion, one relationship that remembers.

---

## Priority 0 Assets

These are the first assets required to make the current prototype feel less like a placeholder and more like an emotional habitat.

### `assets/flametail-fox.png` — superseded; do not generate

- Canonical identity: 焰尾狐 uses runtime ID `blazetail-kit`; 焰尾小狐 is its Stage 1 form name.
- Current art: approved portrait plus 29 animation sheets already live under `assets/characters/blazetail-kit/`.
- Legacy rule: `flametail-fox` is a one-way save alias only. Do not recreate this root file or open a second generation queue.
- Status: superseded by the shipped `blazetail-kit` illustrated runtime package.

### `assets/backgrounds/lake-camp-night.png`

- Purpose: first habitat background
- Size: 1080x1920 px recommended
- Frame count: 1
- Background type: opaque PNG
- PixiJS usage: future background sprite replacing or supplementing the current Graphics-based lake camp
- Status: planned

### `assets/ui/icons/bond.png`

- Purpose: Bond status icon
- Size: 64x64 px
- Frame count: 1
- Background type: transparent PNG
- PixiJS usage: HTML UI or future PixiJS HUD icon
- Status: planned

### `assets/ui/icons/trust.png`

- Purpose: Trust status icon
- Size: 64x64 px
- Frame count: 1
- Background type: transparent PNG
- PixiJS usage: HTML UI or future PixiJS HUD icon
- Status: planned

### `assets/ui/icons/mood.png`

- Purpose: Mood status icon
- Size: 64x64 px
- Frame count: 1
- Background type: transparent PNG
- PixiJS usage: HTML UI or future PixiJS HUD icon
- Status: planned

### `assets/ui/icons/energy.png`

- Purpose: Energy status icon
- Size: 64x64 px
- Frame count: 1
- Background type: transparent PNG
- PixiJS usage: HTML UI or future PixiJS HUD icon
- Status: planned

### `assets/fx/campfire-flicker.png`

- Purpose: loopable campfire animation
- Size: 64x64 px per frame
- Frame count: 6 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: future `AnimatedSprite` or manual texture frame animation
- Status: planned

---

## Priority 1 Assets

These assets add emotional state variation after the static companion image is confirmed working.

### Flametail companion animation package — completed

- Canonical character: 焰尾狐; Stage 1 form: 焰尾小狐; runtime ID: `blazetail-kit`.
- Runtime root: `assets/characters/blazetail-kit/`.
- Coverage: approved portrait plus 29 illustrated animation sheets, including idle, positive reaction, fatigue and boundary/body-language states.
- Status: shipped and runtime-connected.
- Legacy rule: do not generate `assets/sprites/flametail-fox/*`; `flametail-fox` is a save migration alias only.

### `assets/fx/emotional-particles.png`

- Purpose: ambient emotional particles
- Size: 32x32 px per frame recommended
- Frame count: 6 to 8 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: subtle atmosphere effect
- Status: planned

### `assets/fx/memory-light.png`

- Purpose: memory residue / saved trace visual
- Size: 64x64 px per frame recommended
- Frame count: 4 to 6 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: future memory event visual cue
- Status: planned

---

## Implementation Rule

Do not reopen a Flametail Fox replacement batch: the approved `blazetail-kit` illustrated package is already runtime-connected. Any future form upgrade must extend that canonical package and pass the normal human approval and asset-readiness gate.
