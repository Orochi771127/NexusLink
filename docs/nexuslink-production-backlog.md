# NexusLink Production Backlog

This backlog breaks the first emotional habitat loop into concrete work packages. It should be read with `docs/nexuslink-game-plan.md`, `docs/nexuslink-implementation-roadmap.md`, and `docs/asset-pipeline.md`.

## Backlog Rules

- Keep the first release focused on one habitat, one companion, and one persistent relationship loop.
- Do not add large RPG, battle, inventory, multiplayer, or pathfinding systems before the first habitat QA gate passes.
- Cloud Codex owns runtime, UI, state, asset loading, and browser QA.
- Local Codex owns visual asset generation, sprite normalization, map layers, props, FX, and local visual QA.
- Do not register asset metadata before final runtime assets exist in the repository.

## P0: Baseline Verification

Owner: Cloud Codex

Goal: prove the current static prototype is still a valid base.

Tasks:

- Run syntax validation for `script.js`.
- Verify the app still boots from the repository root.
- Verify PixiJS loads from CDN and creates the world container.
- Verify the companion appears centered on the platform.
- Verify localStorage load/save still works.
- Verify `?devPanel=1` opens the dev-only panel.

Acceptance:

- No syntax check failures.
- Desktop and mobile browser smoke tests pass.
- No console error blocks the companion scene.

## P1: Greyshade-Cat Animation Integrity

Owner: Cloud Codex with Local Codex asset support

Goal: make the current registered animation set trustworthy.

Tasks:

- Compare `assets/characters/greyshade-cat/metadata/animations.json` with the official list in `docs/asset-pipeline.md`.
- Verify each registered sheet path exists.
- Verify frame dimensions and frame counts match the sheet files.
- Confirm the dev panel reports available and missing animations correctly.
- Keep missing future states out of `animations.json`.

Acceptance:

- Every registered animation path resolves.
- Runtime fallback behavior works if a non-registered state is requested.
- No future animation is listed before its runtime sheet exists.

## P2: Companion Presence Upgrade

Owner: Cloud Codex for runtime, Local Codex for final animation assets

Goal: make the companion feel alive before adding new systems.

Tasks:

- Keep `ambient_walk` as placeholder container movement until its sprite sheet exists.
- Produce and QC `ambient_walk` through the local sprite pipeline.
- Produce and QC `hug`, `sit`, and `sleep`.
- Add runtime metadata only after final sheets exist.
- Confirm touch reactions override ambient movement.
- Confirm panels block ambient movement.

Acceptance:

- The companion has idle, touch reaction, ambient, hug, sit, and sleep behavior available or explicitly deferred.
- No transform drift occurs; companion position always resolves from the base position.
- Touch and hug remain responsive on mobile.

## P3: Habitat FX Layer

Owner: Local Codex for assets, Cloud Codex for runtime integration

Goal: make the lake camp breathe with separate runtime-controlled FX.

Tasks:

- Produce campfire `idle_flame`.
- Produce lake shimmer.
- Produce firefly soul particles.
- Produce magic circle glow.
- Add `fx.json` metadata for accepted FX.
- Integrate the first accepted FX layer into the PixiJS scene.

Acceptance:

- At least one separated animated FX layer renders in the habitat.
- FX can be removed or replaced without editing the foundation background.
- FX does not obscure the companion, Soul Talk, HUD, or bottom navigation.

## P4: Emotional Interaction Tuning

Owner: Cloud Codex

Goal: make touch, hug, care, and Soul Talk responses legible and bounded.

Tasks:

- Tune repeated touch fatigue thresholds.
- Ensure defensive responses are clear but not hostile.
- Tune energy cost and recovery so the companion can become tired without feeling broken.
- Keep Soul Talk responses short and mood-aware.
- Preserve mood, bond, trust, energy, touch fatigue, and chat history across reloads.

Acceptance:

- Players can infer why a touch was accepted, guarded, or rejected.
- Repeated input changes state visibly.
- Reloading the page preserves the relationship state.

## P5: UI And Mobile QA

Owner: Cloud Codex

Goal: protect the playfield and keep interaction usable on small screens.

Tasks:

- Verify HUD does not cover the companion.
- Verify Soul Talk modal is readable on mobile.
- Verify character detail modal and action sheet close reliably.
- Verify bottom navigation remains reachable with safe-area insets.
- Verify panel-open state blocks companion interaction and ambient walking.

Acceptance:

- Normal idle view keeps the companion and habitat readable.
- Modals and sheets do not trap input.
- Mobile viewport behavior is stable after reload and orientation changes.

## P6: First Habitat QA Gate

Owner: Cloud Codex

Goal: decide whether the first habitat loop is ready for broader feature expansion.

Checks:

- Page loads on desktop.
- Page loads on mobile.
- Companion renders centered.
- Single tap, double tap, Soul Talk, and action sheet work.
- Touch reactions override idle and ambient movement.
- Panels block touch and ambient walking.
- localStorage persists state.
- Registered animation sheets all exist.
- At least one separated FX layer renders.
- Final assets only live inside `C:\Users\User\AIForgeNexus2\NexusLink`.

Exit decision:

- If all checks pass, begin planning the next habitat or deeper memory system.
- If any check fails, fix the first habitat loop before expanding scope.

## Deferred Backlog

Do not start these until P6 passes:

- Full movement pathfinding
- Collision-driven map traversal
- Battle state implementation
- Quest chains
- Inventory
- Multi-companion party management
- Multiplayer
- Full AI memory architecture
- Large world map or multi-habitat navigation
