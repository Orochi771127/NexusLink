# Blazetail Kit touch_accept Pilot QC

Status: review pilot accepted for sequence continuation; not runtime-approved.

## Automated checks

- Raw grid: 1536x1024, exact 2 rows x 3 columns.
- Processed sheet: 1536x1024 RGBA, six 512x512 frames.
- Transparent corners: pass (all four alpha = 0).
- Sheet edge: pass (1536x1024, both <=4096).
- Grid divisibility: pass.
- Edge touch: pass; edge_touch_frames is empty.
- Shared scale: enabled.
- Bottom/feet alignment: processed frame alpha bottoms are 480/481, within one pixel.
- Frame alpha bboxes remain inside 512x512.
- Chroma cleanup: soft matte + despill + one-pixel contraction before shared-scale processing.

## Visual identity review

- One juvenile fox in every frame.
- Amber eyes, orange/cream palette, single flame-fur tail, chest diamond, gold mount, and spiral markings remain recognizable.
- No player hand, second character, detached flame attack, text, UI, scene, or cell dividers.
- Sequence reads as noticing, softening, stepping closer, leaning, and settling.
- Frame 1 is identity-consistent with the approved seed but is not an exact pixel lockback; runtime promotion remains false.

## Residual risks

- Fine flame-edge details create multiple small disconnected alpha components; the body uses component_mode=largest.
- Face and marking micro-details vary slightly across the generated frames. This is acceptable for a review pilot, not yet a final production-sheet approval.
- Human may request a stricter exact-seed frame-1 lockback before runtime promotion.

## Decision

Keep as the first formal motion-family pilot candidate. Continue to the avian seed gate; do not write to assets/**.
