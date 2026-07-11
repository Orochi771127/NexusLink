# Heartspark Council Owner Review Boards

`heartspark-council-owner-review-board.png` compares five representative states for every formal Stage 1 council member:

1. appearance-lock idle;
2. species-specific locomotion;
3. already-asleep sleep loop;
4. species-specific attack translation;
5. victory silhouette.

## Cross-action scale finding

An automated height scan flagged several low-height silhouettes. Direct sheet review determined these are pose-driven rather than accidental scale drift:

- owl: wing extension and forward dive redistribute the silhouette horizontally;
- seahorse: attack propulsion uncoils the tail into a long horizontal body line;
- sleeping and fainted quadrupeds intentionally compress toward the ground;
- defensive poses intentionally lower the body and widen the stance.

These sheets must not be enlarged solely to equalize bounding-box height. Doing so would introduce actual scale drift and reduce extremity clearance. Runtime display scaling should continue to use the fixed 512 px frame height and bottom-center anchoring, not per-pose opaque bounds.

The board is a review aid, not a replacement for owner approval and not a runtime asset.
