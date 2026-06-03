# NexusLink First Habitat QA Checklist

Use this checklist before expanding NexusLink beyond the first emotional habitat loop.

## Setup

- Run from `C:\Users\User\AIForgeNexus2\NexusLink`.
- Use the repository root as the static site root.
- Do not use Playground.
- Do not use `C:\Users\User\NexusLink`.
- Do not accept final generated assets from temporary folders.

## Static Checks

- `node --check script.js` passes.
- `git diff --check` passes.
- `assets/characters/greyshade-cat/metadata/animations.json` is valid JSON.
- Every registered animation sheet path exists.
- No future animation is registered before its final runtime sheet exists.
- Final assets only live inside `C:\Users\User\AIForgeNexus2\NexusLink`.

## Desktop Smoke Test

- Page loads without a blocking console error.
- PixiJS initializes.
- Habitat stage fills the intended viewport.
- Companion renders centered on the platform.
- Platform renders beneath the companion.
- Ambient particles or placeholder environment motion render without blocking input.
- HUD shows bond, trust, mood, and energy.
- Bottom navigation is visible and clickable.

## Mobile Smoke Test

- Page loads at a mobile viewport width.
- No text or UI controls overlap incoherently.
- Companion remains readable and is not covered by persistent UI.
- Bottom navigation respects safe-area inset behavior.
- Soul Talk and action sheet remain reachable.
- Closing a modal or sheet returns to the habitat cleanly.

## Companion Interaction

- Single tap triggers gentle touch behavior.
- Double tap triggers hug behavior.
- Touch reactions can produce accept, guarded, or reject states.
- Touch reactions override idle and ambient movement.
- Touch fatigue changes repeated input behavior.
- Companion returns to mood-based idle after temporary reactions.
- `ambient_walk` does not cause permanent drift.

## Panel And Input Blocking

- Character detail modal blocks companion touch.
- Soul Talk modal blocks companion touch.
- Action bottom sheet blocks companion touch.
- Any open panel blocks ambient walking.
- Closing the panel restores normal companion interaction.
- Escape closes an open panel on desktop.

## Soul Talk

- Soul Talk opens from the launcher.
- Text entry works.
- Sending a message appends player and companion chat lines.
- Repeated input can influence mood or trust.
- Low energy can produce tired responses.
- Chat history persists after reload.

## State Persistence

- Bond persists after reload.
- Trust persists after reload.
- Mood persists after reload.
- Energy persists after reload.
- Touch fatigue persists or recovers according to offline recovery rules.
- Dev reset clears state only when explicitly requested.

## Dev Panel

Use `?devPanel=1`.

- Dev panel appears only with the query flag.
- Motion buttons are available for registered and prototype states.
- `ambient_walk` can be manually triggered.
- Animation readout reports current animation state.
- Missing animation availability is visible without crashing the app.

## Habitat FX Gate

Before the first loop is considered complete:

- At least one separated habitat FX layer is integrated.
- FX is not baked into the foundation background.
- FX metadata exists for accepted runtime FX.
- FX does not obscure the companion, HUD, Soul Talk, or bottom navigation.

## Release Decision

Pass only if:

- Desktop smoke test passes.
- Mobile smoke test passes.
- Companion interaction passes.
- Panel blocking passes.
- Soul Talk passes.
- State persistence passes.
- Animation metadata integrity passes.
- At least one separated habitat FX layer is integrated.

If any item fails, keep scope on the first habitat loop and fix it before adding larger systems.
