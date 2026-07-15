# Black Iron Hackers Five-Species Pilot QC

Status: **AWAITING OWNER VISUAL APPROVAL**. These are staging outputs only; none are runtime-approved and nothing has been written to `assets/**`.

| Character | Pilot action | Frames | Species gate | Edge gate | Visual review note |
|---|---|---:|---|---|---|
| ThunderPup | `right_walk` | 8 | canine grounded walk | pass | approve crystal-detail consistency |
| WaveCub | `touch_reject` | 8 | feline boundary refusal | pass | approve stronger face-angle progression |
| Starflame Phoenix | `right_walk` | 8 | grounded two-talon step/hop | pass | approve restrained talon lift |
| Star Foal | `right_walk` | 8 | equine four-beat hoof walk | pass | approve youthful high foreleg lift |
| Goldenspark Wyrm | `idle_calm` | 8 | wingless low saurian idle | pass | approve subtle gear-tail motion |

## Deterministic checks

- Each final sheet is RGBA 2048 x 1024 with a 4 x 2 grid of 512 x 512 frames.
- Each preview GIF contains exactly eight frames.
- Every source cell passed `--reject-edge-touch` with an 8 px margin.
- All 40 final frame corners are transparent.
- Shared-scale normalization and species-specific bottom-center anchor families are recorded per action.

## Gate decision

If the Owner approves these five pilots, expand the already documented 29-action catalog for all five characters. The catalog-wide sleep action remains `deep_sleep` / 熟睡, eight frames, replacing a lighter generic sleeping read. If any pilot is rejected, revise that species pilot before spending generation budget on the remaining actions.
