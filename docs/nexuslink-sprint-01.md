# NexusLink Sprint 01 Plan

Sprint 01 focuses on proving the current first habitat loop is stable enough for asset expansion.

## Sprint Goal

Verify and stabilize the living companion baseline:

- Greyshade-cat renders reliably.
- Registered animations are trustworthy.
- Touch, hug, Soul Talk, care actions, ambient movement, and localStorage work together.
- The team knows which asset should be produced next.

Do not start large new systems during this sprint.

## In Scope

### Runtime

- Run static syntax and diff checks.
- Verify PixiJS scene boot.
- Verify companion centering and platform layering.
- Verify touch reaction priority.
- Verify panels block touch and ambient movement.
- Verify localStorage persistence.
- Verify dev panel behavior with `?devPanel=1`.

### Animation Metadata

- Audit `assets/characters/greyshade-cat/metadata/animations.json`.
- Confirm every registered sheet path exists.
- Confirm no future animation is registered without a final sheet.
- Decide whether `idle_calm` metadata and asset state matches the official pipeline record.

### Local Asset Prep

- Select the approved greyshade-cat seed frame for the next sprite pass.
- Prepare the local sprite prompt/QC brief for `ambient_walk`.
- Do not generate images until the user explicitly asks for asset production.

### QA

- Run the first habitat QA checklist.
- Record failures as backlog items.
- Do not pass the release gate until at least one separated habitat FX layer is integrated.

## Out Of Scope

- Battle
- Inventory
- Full movement pathfinding
- Collision-heavy map traversal
- Large world map
- Multi-companion systems
- Multiplayer
- Full AI memory architecture
- New generated images without explicit asset-generation approval

## Work Order

1. Baseline static validation
   - `node --check script.js`
   - `git diff --check`

2. Animation integrity audit
   - Validate `animations.json`.
   - Validate registered sprite sheet paths.
   - Compare current metadata with `docs/asset-pipeline.md`.

3. Browser smoke test
   - Desktop viewport.
   - Mobile viewport.
   - `?devPanel=1` viewport.

4. Interaction test
   - Single tap.
   - Double tap.
   - Soul Talk open/send/close.
   - Bottom action sheet open/commit/close.
   - Panel blocking.
   - Ambient walking interruption.

5. Asset readiness check
   - Confirm next sprite target is `greyshade-cat ambient_walk`.
   - Confirm seed frame and output folders.
   - Confirm no metadata registration happens before the final sheet exists.

## Sprint Exit Criteria

Sprint 01 is complete when:

- Static validation passes.
- Desktop and mobile smoke tests pass or failures are documented.
- Animation metadata audit is complete.
- Touch and hug behavior are verified.
- Panel blocking is verified.
- localStorage persistence is verified.
- Dev panel motion testing is verified.
- The next asset production task is ready to begin with `ambient_walk`.

If any core baseline item fails, fix that before generating new art.

## Expected Next Sprint

Sprint 02 should produce and QC the first new local asset:

- `greyshade-cat` `ambient_walk` sprite sheet

Only after the sheet passes QC should runtime metadata be updated.
