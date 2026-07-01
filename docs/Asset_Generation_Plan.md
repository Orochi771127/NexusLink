# Nexus Link Asset Generation Plan

This document defines the first asset batches for the Nexus Link v0.1.x Web prototype.

The current product direction is an AI emotional habitat: one URL, one lake camp, one companion, one relationship that remembers.

---

## Priority 0 Assets

These are the first assets required to make the current prototype feel less like a placeholder and more like an emotional habitat.

### `assets/flametail-fox.png`

- Purpose: replacement Flametail Fox companion image; previous root file was removed after human review because the content was incorrect
- Size: 512x512 px recommended
- Frame count: 1
- Background type: transparent PNG
- PixiJS usage: only after a new approved transparent PNG exists; until then runtime must use placeholder graphics
- Status: replacement needed / not current runtime-ready

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

### `assets/sprites/flametail-fox/idle.png`

- Purpose: default companion idle animation
- Size: 128x128 px per frame
- Frame count: 4 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: future `AnimatedSprite`
- Status: planned

### `assets/sprites/flametail-fox/happy.png`

- Purpose: positive reaction animation
- Size: 128x128 px per frame
- Frame count: 4 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: triggered by caring, touch, or warm messages
- Status: planned

### `assets/sprites/flametail-fox/tired.png`

- Purpose: low-energy state animation
- Size: 128x128 px per frame
- Frame count: 4 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: triggered when Energy is low
- Status: planned

### `assets/sprites/flametail-fox/defensive.png`

- Purpose: boundary reaction animation
- Size: 128x128 px per frame
- Frame count: 4 frames, horizontal sheet
- Background type: transparent PNG
- PixiJS usage: triggered by repeated input, high SpamScore, or low Trust
- Status: planned

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

Do not expand into large asset batches before generating a new human-approved Flametail Fox replacement and confirming that the current runtime can load and display it successfully on GitHub Pages.
