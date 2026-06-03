# NexusLink Game Plan

This document is the clean implementation-facing game plan for NexusLink. It consolidates the current repository state, the emotional habitat direction, and the local art pipeline into one working spec for Cloud Codex and Local Codex.

## 1. Product Shape

NexusLink is a Web-first AI companion habitat. It is closer to an emotional diorama than a traditional RPG.

The first playable target is:

```text
Enter the habitat
See one companion
Talk, touch, care, or simply stay
Receive a bounded emotional response
Watch the companion and space subtly change
Return later to a remembered state
```

The MVP must make one habitat feel alive before expanding into combat, large maps, multiplayer, or complex RPG systems.

## 2. Current Runtime Baseline

The current implementation uses:

- Static Web entry: `index.html`
- Main app module: `src/app.js`
- PixiJS via CDN for companion, platform, and ambient particles
- DOM/CSS for HUD, Soul Talk, modals, bottom navigation, and action sheet
- localStorage-backed state through `src/state/`
- Touch reaction logic through `src/engine/touchReactionEngine.js`
- Greyshade-cat sprite metadata through `assets/characters/greyshade-cat/metadata/animations.json`

The current companion runtime supports:

- Mood-based idle state selection
- Touch and hug input through single tap and double tap
- Touch reactions: `touch_accept`, `touch_guarded`, `touch_reject`
- Dev-only motion testing through `?devPanel=1`
- Ambient container motion through `ambient_walk` without requiring a sprite sheet

## 3. Core Player Verbs

Keep the first version narrow:

- Stay: the player can idle in the habitat and watch subtle movement.
- Touch: single tap means gentle touch.
- Hug: double tap means hug.
- Talk: Soul Talk lets the player send short messages.
- Care: bottom navigation opens small care/explore/growth/memory actions.
- Return: localStorage preserves the emotional state between visits.

Do not add full pathfinding, map traversal, battle, quest chains, inventory, or multi-character party systems until the first habitat loop is stable.

## 4. State Model

The core state should remain serializable and renderer-independent.

Current important fields:

- `bond`: long-term connection
- `trust`: willingness to accept closeness
- `mood`: visible emotional state
- `energy`: fatigue and readiness
- `defense`: boundary sensitivity
- `touchFatigue`: repeated touch pressure
- `chatHistory`: Soul Talk transcript
- `lastTouchReaction`: last touch response

Rules:

- Simulation and state logic live outside PixiJS display objects.
- PixiJS reads state and plays motion; it does not own saved emotional truth.
- localStorage stores plain data, not renderer objects.
- Dev hooks may override state only when explicitly enabled by query parameters.

## 5. Companion Motion And Animation

The companion should feel present through layered behavior:

1. Touch reaction has top priority.
2. Battle and sleep states are reserved higher-priority future states.
3. Ambient walking may run only when UI panels are closed and the companion is available.
4. Mood-based idle is the fallback.

Current official animation states:

- `idle_calm`
- `idle_defensive`
- `idle_distant`
- `blink`
- `touch_guarded`
- `touch_accept`
- `touch_reject`

Current prototype-only state:

- `ambient_walk`: container movement only, no required sprite sheet yet

Next animation targets:

- `greyshade-cat` `ambient_walk` sprite sheet
- `greyshade-cat` `hug`
- `greyshade-cat` `sit`
- `greyshade-cat` `sleep`

Do not register a new animation in `animations.json` until the final runtime sheet exists.

## 6. Habitat And FX Direction

The first habitat is a lake camp emotional space: quiet, night-focused, low-noise, and readable on mobile.

Visual goals:

- Small companion as the emotional center
- Cool night palette with warm focal light
- Subtle particles and slow environmental motion
- Minimal UI coverage over the playfield
- Foundation background separated from animated props and FX

Next habitat assets:

- Campfire `idle_flame`
- Lake shimmer
- Firefly soul particles
- Magic circle glow

Habitat assets must follow `docs/asset-pipeline.md`: foundation-only base, separate props, separate FX, metadata, and QA preview.

## 7. UI Surface

Use DOM for text-heavy and accessibility-sensitive UI. Use PixiJS for the companion, platform, particles, and visual habitat layer.

Required UI surfaces:

- Compact core HUD for bond, trust, mood, and energy
- Character detail modal
- Soul Talk modal
- Action bottom sheet
- Bottom navigation
- Dev-only reaction and animation lab behind `?devPanel=1`

UI rules:

- Keep the center playfield clear.
- Do not cover the companion during normal idle.
- Modals and bottom sheets block companion touch and ambient walking.
- Mobile viewport fixes remain part of the core experience.

## 8. Asset Pipeline Boundary

Cloud Codex handles runtime integration:

- Loading metadata
- Wiring PixiJS animation playback
- UI and state behavior
- GitHub Pages compatibility
- Browser-game QA

Local Codex handles visual production:

- Seed-frame approval
- Sprite generation
- Sprite Pipeline normalization
- Transparent PNG processing
- Habitat, prop, and FX generation
- Local QA previews

All final generated assets must live under:

```text
C:\Users\User\AIForgeNexus2\NexusLink
```

Never use `C:\Users\User\NexusLink`, Playground, or temporary output folders as final locations.

## 9. Near-Term Roadmap

### Priority 1: Stabilize The Living Companion

- Verify the current greyshade-cat registered animation list matches shipped sprite sheets.
- Keep `ambient_walk` as placeholder container motion until the sprite sheet exists.
- Add proper `hug`, `sit`, and `sleep` animation assets through the local pipeline.
- Keep touch reaction priority above ambient movement.

### Priority 2: Make The Habitat Breathe

- Produce separate campfire, lake shimmer, firefly, and magic circle FX.
- Add metadata for FX placement and looping.
- Keep foundation background clean and non-interactive.

### Priority 3: Strengthen The Emotional Loop

- Make repeated talk and repeated touch produce readable but bounded responses.
- Let mood and energy influence idle and ambient behavior.
- Preserve relationship state across sessions without adding full AI memory yet.

### Priority 4: QA And Deployment

- Test mobile viewport layout.
- Test panel blocking and touch input.
- Test animation metadata loading.
- Test GitHub Pages static loading paths.

## 10. Acceptance Criteria For The First Complete Habitat Loop

The first loop is complete when:

- The page loads on desktop and mobile.
- The companion renders centered on the platform.
- The player can single tap, double tap, open Soul Talk, and open the action sheet.
- Touch reactions override idle and ambient movement.
- Panels block companion interaction and ambient walking.
- Mood, bond, trust, energy, and touch fatigue persist through localStorage.
- Registered sprite sheets all exist and load without breaking fallback behavior.
- The habitat has at least one separated animated FX layer.
- The asset pipeline document is followed for any new art.

This is the bar before adding larger gameplay systems.
