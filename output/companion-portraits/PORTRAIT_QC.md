# Companion Portrait Identity Pack QC

Status: `HUMAN-APPROVED / RUNTIME-WIRED IN WORKTREE`

## Scope

- 11 current `full-runtime` companions.
- One opaque 512 x 512 PNG portrait per companion.
- Used by the 46 px top-left identity card and 62 px Companion Status summary.
- Generated with built-in `image_gen` from each companion's approved `idle_calm` identity frame.
- Greyshade Cat additionally used the Owner-provided new-version screenshot as the highest-priority reference.

## Identity checks

- `greyshade-cat`: silver-grey tabby, gold eyes, mandatory blue diamond chest core; old no-gem identity not used.
- `flame-flicker`: charcoal fox, orange ember veins and round ember core.
- `ice-talon`: white/blue frost wolf, forehead crystals and cyan core.
- `stone-shard`: mossy stone bear, amber circular core.
- `vine-twist`: vine-wrapped stag, leafed antlers and green core.
- `crystal-rabbit`: stone rabbit, blue crystals, tall ears and cyan core.
- `sprigfawn`: spotted fawn, budding antlers and green diamond core.
- `starstripe-cub`: white/blue tiger cub, blue stripes and gold star core.
- `auriowl`: juvenile gold/white owl, amber eyes and gold diamond core.
- `blazetail-kit`: orange fox kit, flame tuft and orange diamond core.
- `crystalfin-seahorse`: juvenile blue seahorse, crystal crest/fins and blue diamond core.

## Technical checks

- 11/11 files decode as 512 x 512 RGB/RGBA PNG.
- 11/11 registry entries provide an explicit `image` path.
- Circular-crop review passed at both 46 px and 62 px.
- No portrait contains text, UI chrome, card borders, watermarks, duplicate bodies, or scenery.
- Portrait assets use an opaque dark vignette, avoiding fur/feather chroma-key edge damage.
- Runtime fallback remains the existing placeholder gradient when an image path is absent.

Review boards:

- `portrait-review-board-v1.jpg`
- `portrait-icon-legibility-board.png`
