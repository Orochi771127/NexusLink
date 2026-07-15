# Black Iron Hackers Identity Seed QC

## Verdict

**MECHANICAL PASS — awaiting Owner visual approval.** Five selected transparent `512×512` identity seeds are ready for the human identity gate. No pilot or full-catalog action should inherit these identities until the Owner accepts them.

| Character | Selected seed | Alpha bbox | Minimum margin | Visual self-review |
|---|---|---|---:|---|
| `thunder-pup` | `thunder-pup/seed-frame/thunder-pup_seed_v1_512x512.png` | `(39,26)-(473,486)` | 26 px | Strong dark/cyan/violet identity; full ridge and tail; Owner should confirm the secondary flank node. |
| `wavecub` | `wavecub/seed-frame/wavecub_seed_v2_512x512.png` | `(53,26)-(458,486)` | 26 px | Compact feline cub, wave mane, chest core and attached single wisp tail; v1 detached droplets removed. |
| `starflame-phoenix` | `starflame-phoenix/seed-frame/starflame-phoenix_seed_v2_512x512.png` | `(73,26)-(439,486)` | 26 px | Grounded two-leg chick, folded wings, attached flame-feather plume; v1 detached embers removed. |
| `star-foal` | `star-foal/seed-frame/star-foal_seed_v2_512x512.png` | `(45,26)-(466,486)` | 26 px | Compact young foal, shorter legs/neck, raised crest, four hooves and attached star tail; v1 adult drift rejected. |
| `goldenspark-wyrm` | `goldenspark-wyrm/seed-frame/goldenspark-wyrm_seed_v2_512x512.png` | `(26,56)-(486,455)` | 26 px | Organic-scaled wingless whelp with chest/rear plates and gear tail; v1 full-mecha drift rejected. |

## Mechanical checks

- All selected files decode as RGBA `512×512`.
- All four corner pixels are fully transparent.
- No selected alpha bounding box touches a frame edge; minimum selected margin is 26 px.
- Bottom alignment is stable for grounded seeds; Goldenspark retains extra lower margin because its low saurian body is horizontally distributed.
- Selected silhouettes contain no pedestal, stone ring, scene, UI, text, weapon, projectile, or detached effect.

## Review board

`review-boards/black-iron-hackers-seed-review-board.png`

## Gate

Human approval at this checkpoint authorizes species-pilot generation under `output/**` only. It does not authorize `assets/**`, runtime, registry, canon, commit, or push changes.
