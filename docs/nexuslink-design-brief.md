# NexusLink Design Brief

NexusLink is a Web-first AI companion habitat: one quiet place, one companion, one relationship that remembers enough to feel alive.

## North Star

Make the player feel that something gentle is waiting for them.

NexusLink should not feel like a dashboard, RPG menu, or content feed. The first version should feel like a small emotional space the player can return to.

## Player Promise

When the player opens NexusLink, they can:

- See a companion in a calm habitat.
- Touch or hug the companion.
- Talk through Soul Talk.
- Choose a small care action.
- Watch the companion respond through mood, motion, and small state changes.
- Return later and find the relationship state preserved.

## Design Pillars

### 1. Presence Before Progression

The first goal is not leveling, combat, or collection. The first goal is a companion that feels present.

Prioritize:

- Idle life
- Subtle ambient motion
- Emotional reactions
- Small state changes
- Quiet return loop

Defer:

- Battle systems
- Large maps
- Inventory
- Quest chains
- Multiplayer

### 2. Bounded Emotional Interaction

The companion should respond warmly, cautiously, or defensively depending on trust, bond, energy, mood, and repeated touch.

The system should make boundaries readable without punishing the player harshly.

### 3. One Habitat That Breathes

The first habitat is a lake camp scene. It should be visually calm and layered:

- Foundation-only background
- Companion and platform
- Separate FX such as flame, shimmer, particles, and glow
- Minimal UI coverage

The habitat should feel alive through motion and atmosphere before it becomes spatially large.

### 4. Runtime And Art Stay Separate

Runtime work and visual production have different responsibilities:

- Cloud Codex: architecture, PixiJS integration, UI, state, GitHub Pages, QA
- Local Codex: generated art, sprite sheets, map layers, props, FX, transparent PNG cleanup

Final assets must live only inside `C:\Users\User\AIForgeNexus2\NexusLink`.

## MVP Loop

```text
Open NexusLink
See greyshade-cat in the lake camp
Stay, touch, hug, talk, or care
Companion reacts through mood and motion
State is saved
Return later
```

The MVP is successful when this loop feels complete without adding larger game systems.

## Current Companion Focus

Primary companion: `greyshade-cat`

Current official animation list:

- `idle_calm`
- `idle_defensive`
- `idle_distant`
- `blink`
- `touch_guarded`
- `touch_accept`
- `touch_reject`

Prototype-only behavior:

- `ambient_walk` uses companion container motion until a final sprite sheet exists.

Next companion animation priorities:

1. `ambient_walk`
2. `hug`
3. `sit`
4. `sleep`

## Current Habitat Focus

Primary habitat: lake camp emotional space

Next habitat FX priorities:

1. Campfire `idle_flame`
2. Lake shimmer
3. Firefly soul particles
4. Magic circle glow

FX should be separate runtime assets, not baked into the foundation background.

## First Release Gate

Do not expand scope until these are true:

- The page loads on desktop and mobile.
- The companion renders centered and readable.
- Single tap, double tap, Soul Talk, and care actions work.
- Panels block touch and ambient movement.
- Touch reactions override ambient movement.
- localStorage preserves relationship state.
- Registered animation assets exist and load.
- At least one separated habitat FX layer is integrated.

This release gate protects the core fantasy: a small emotional habitat that feels alive.
