# NexusLink Implementation Roadmap

This roadmap turns the NexusLink game plan into ordered engineering and asset-production milestones. It is scoped to the first complete emotional habitat loop.

## Milestone 0: Keep The Baseline Stable

Goal: preserve the current playable prototype while planning the next production steps.

Required state:

- Static app loads from the repository root.
- `src/app.js` remains the PixiJS and UI bootstrap.
- State remains serializable and localStorage-backed.
- DOM owns HUD, panels, Soul Talk, bottom navigation, and action sheet.
- PixiJS owns companion rendering, platform rendering, particles, and motion.
- `?devPanel=1` remains the only place for development-only motion controls.

Validation:

- `node --check script.js`
- `git diff --check`
- Manual browser smoke test on desktop width and mobile width

Do not add large systems during this milestone.

## Milestone 1: Companion Animation Integrity

Goal: make the greyshade-cat animation library trustworthy before adding more states.

Work items:

- Verify every entry in `assets/characters/greyshade-cat/metadata/animations.json` points to an existing runtime sheet.
- Resolve any mismatch between the official animation list and current metadata.
- Confirm sprite sheet frame dimensions, frame counts, FPS, and loop flags.
- Keep `ambient_walk` as container motion until its runtime sheet exists.
- Keep touch reaction priority above battle, sleep, ambient, and idle.

Acceptance:

- Registered animations load without breaking fallback rendering.
- Dev panel reports available and missing animations clearly.
- Touch reactions can interrupt ambient movement.
- No animation is registered before its final sheet exists.

## Milestone 2: Local Sprite Production Pass

Goal: produce the next greyshade-cat animation assets through the approved local pipeline.

Priority order:

1. `greyshade-cat` `ambient_walk`
2. `greyshade-cat` `hug`
3. `greyshade-cat` `sit`
4. `greyshade-cat` `sleep`

Production rules:

- Start from an approved seed frame.
- Use multi-frame grid generation, not raw final `1xN` strips.
- Preserve identity, facing direction, palette family, silhouette, and proportions.
- Normalize to fixed `64x64` frames.
- Use shared scale and bottom-center anchor.
- Export transparent runtime sheets only after QC.
- Register metadata only after final sheets exist.

Acceptance:

- Each animation has final sheet, normalized frames, QA preview, and metadata.
- The runtime can play each registered animation.
- The first frame alignment does not visibly pop when returning to idle.

## Milestone 3: Habitat FX Layer Pass

Goal: make the habitat breathe without baking interactive or animated elements into the background.

Priority order:

1. Campfire `idle_flame`
2. Lake shimmer
3. Firefly soul particles
4. Magic circle glow

Production rules:

- Keep foundation background separate from animated FX.
- Store FX under `assets/fx/{fxId}/`.
- Add `fx.json` metadata for frame size, frame count, FPS, loop behavior, blend expectations, and placement.
- Use QA previews before runtime registration.

Acceptance:

- At least one separated animated FX layer renders in the habitat.
- FX can be disabled or replaced without changing the foundation background.
- FX does not cover the companion or important UI surfaces.

## Milestone 4: Emotional Loop Tuning

Goal: make touch, hug, Soul Talk, and care actions feel bounded and readable.

Work items:

- Confirm single tap maps to gentle touch.
- Confirm double tap maps to hug.
- Confirm panels block touch and ambient movement.
- Tune repeated input so defensive behavior is visible but not punishing.
- Let mood and energy influence idle and ambient behavior.
- Preserve state after reload.

Acceptance:

- The player can understand why the companion accepted, guarded, or rejected touch.
- Energy and mood affect behavior without making the companion feel broken.
- localStorage recovery feels consistent after closing and reopening the page.

## Milestone 5: First Habitat QA Gate

Goal: verify the first complete habitat loop before expanding scope.

Required checks:

- Desktop load
- Mobile load
- Companion centered on platform
- Touch, hug, Soul Talk, and action sheet usable
- Modal and bottom-sheet blocking works
- Animation metadata loads
- Missing animation fallback does not crash
- localStorage persists state
- GitHub Pages static paths remain valid
- No final assets live outside `C:\Users\User\AIForgeNexus2\NexusLink`

Exit criteria:

- The habitat has one companion, one persistent state model, one conversational surface, one touch system, one ambient behavior layer, and at least one separated animated FX layer.
- Larger systems remain deferred until this loop is stable.

## Explicitly Deferred

Do not prioritize these before the first habitat loop passes QA:

- Full pathfinding
- Collision-heavy map movement
- Battle systems
- Inventory
- Quest chains
- Multiplayer
- Large multi-habitat world map
- Full AI memory architecture
- Multi-character party management

These can be revisited after the emotional habitat loop is stable and visually alive.
