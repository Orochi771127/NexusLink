# Formal Evolution Lineage Board QC R2

## Verdict

All 11 R2 boards pass the mechanical and visual gate for Owner review. R2
supersedes the R1 review direction because each later form now changes body
structure or silhouette rather than relying on scale, tint and VFX alone.

These are still wide, opaque concept boards. They are not transparent 512x512
production masters, eight-direction sprite sheets, Orbit manifestations or
runtime form-swap assets. `humanApproved` and `runtimeFormSwapReady` therefore
remain false.

## Shared checks

- Exactly three same-lineage forms are visible left-to-right on every board.
- Every PNG decodes successfully; all edges are below the 4096 px sheet limit.
- No required ear, crest, antler, wing, fin, paw, hoof, talon or tail tip is
  cropped by the board boundary.
- Species identity, face family, primary palette, heart-core and signature
  appendage remain traceable from Stage 1 through Stage 3.
- Stage 2 and Stage 3 are sortable without labels and differ structurally, not
  only by size, hue, glow or particle intensity.
- No board contains generated text, labels, game UI, card frames or scenery.
- All later forms retain a cute expressive face while using bolder saturated
  color blocks and a more capable silhouette.
- Except for reference-locked Blazetail, later forms use clean separable limbs,
  limited solid ornaments and visible joints suitable for a later sprite-sheet
  redraw. Dense particles and loose translucent layers are excluded.

## Board-specific anatomy and animation review

| Character | Result | R2 anatomy and sprite note |
| --- | --- | --- |
| Greyshade Cat | Pass | Four legs and one tail at every stage; wave mane is solid and bounded. |
| Auriowl | Pass after regeneration | Stage 3 has two wing-arms and two taloned legs, with no extra back-wing pair. |
| Sprigfawn | Pass | Stage 3 retains the fawn head and antlers with two hoof-like hands, two hooved legs and one tail. |
| Crystalfin Seahorse | Pass after regeneration | Stage 3 changes to a horizontal sea-dragon axis; one tail, two attached fins and zero limbs remain explicit. |
| Blazetail Kit | Pass | Stage 2 and Stage 3 faithfully translate the supplied upright fox references; one tail remains. |
| Starstripe Cub | Pass | Stage 3 retains tiger head, stripes and tail with two arms and two digitigrade legs. |
| ThunderPup | Pass | Stage 3 retains wolf head and bolt tail with two arms and two digitigrade legs. |
| WaveCub | Pass | Stage 3 retains lion face, round ears and one wave tail with two arms and two legs. |
| Starflame Phoenix | Pass | Stage 3 uses two wing-arms total and two taloned legs; no second wing pair. |
| Star Foal | Pass | Four hooves at every stage; the star tip is connected to one continuous tail. |
| Goldenspark Wyrm | Pass | Wingless throughout; Stage 3 has two arms, two legs and one connected gear-tip tail. |

## Production gate that remains closed

Owner approval of a board does not itself create animation readiness. The next
per-lineage package must redraw Stage 2 and Stage 3 as clean transparent 512x512
masters, freeze front-side-back proportions and appendage counts, then produce
and test the eight-direction Expedition set. Orbit manifestations stay a
separate surface and formal-stage swap remains disabled until Growth G4 and the
runtime asset gate are separately implemented.
