# Starstripe Cub Seed Frame QC

- Status: awaiting Owner identity approval; review-only and not runtime-approved.
- Output: `starstripe-cub_idle_calm_seed_v1_512x512.png`.
- Canvas: exact 512 x 512 RGBA.
- Alpha bbox: `(48, 26) - (464, 486)`; all four canvas corners are transparent.
- Paw datum: four oversized rounded feline paws are visible; alpha ends at y=485.
- Containment: rounded ears, fur silhouette, collar/gem, curled tail, and all paws are complete and do not touch an edge.
- Feline lock: juvenile tiger cub anatomy with sturdy shoulders and curled tail; no fox, wolf, dog, or adult-tiger redesign.
- Identity read: pink-magenta eyes and nose, white/cobalt/sky-blue coat, charcoal-edged stripes, gold collar, and glowing star chest gem are preserved.
- Known edge risk: extremely thin pink-purple antialiasing remains on isolated ear and tail-edge pixels. It is acceptable for identity review but requires a stricter edge audit before any runtime promotion.
- Next gate after approval: generate one coherent six-frame 2x3 `touch_accept` feline sequence with shoulder softening, head lean, slow blink, and tail-curl release; no canine play-bow.
