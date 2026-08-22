# Championship Presentation Contract R1

Status: standalone research presentation

Visual authority: NexusLink project-native
Simulation authority: Championship deterministic core only

## Presentation outcome

R1 uses a responsive two-plane composition:

- a primary 2D stage for the field, encounter, collection context, and Arena;
- a secondary status and command deck implemented as semantic DOM.

Narrow portrait viewports stack the planes. Wide viewports use a stage plus side HUD while preserving reading order, focus order, command meaning, and simulation authority. The stage clips and reframes content; it does not assume every future field has the same dimensions as the viewport.

## Layer order

The presentation preserves this explicit order:

1. environment and field surface;
2. world actors and feedback shapes;
3. persistent status strip;
4. contextual command or movement deck;
5. modal, result, and announcement plane.

The current Pixi presenter draws only original geometric field, obstacle, actor, encounter, and Arena shapes. It contains no source-game tiles, layouts, palettes, sprites, icons, logos, effects, audio, or map art.

## DOM and Pixi responsibilities

DOM is authoritative for:

- phase title and instructions;
- wallet, collection, revision, and HP values;
- available actions and disabled states;
- keyboard, touch, and gamepad activation;
- focus state;
- polite phase and event announcements;
- complete gameplay fallback.

Pixi is responsible only for visualizing the already-decided immutable snapshot. It does not own the clock, collision, turn resolution, AI policy, capture outcome, Shop transaction, HP, phase, result, or event order. No Pixi ticker advances simulation. Attaching, resizing, losing context, or disposing Pixi cannot change the event digest.

If Pixi loading fails, the DOM field telemetry and every command remain available. If a WebGL context is lost, the canvas is hidden and an accessible fallback message is displayed.

## Input contract

The same intent vocabulary is shared across inputs:

- pointer and touch activate semantic buttons;
- arrow keys move in the Hunt Field;
- gamepad D-pad or primary axes map to the same four movement intents;
- the primary gamepad button maps to the focused semantic action.

Input adapters issue commands only through the controller. They do not mutate state or the renderer. Focus moves to the first enabled phase action when the phase changes. Focus styling is visible and not color-only. The screen-stack abstraction keeps one authoritative phase and allows future modal focus trapping without boolean flag combinations.

## Responsive and accessibility requirements

R1 requires:

- 320 CSS-pixel viewport support without horizontal page overflow;
- 390 by 844 and desktop coverage;
- 200 percent browser zoom tolerance;
- safe-area inset padding;
- minimum 3 rem critical action height, meeting the 44 CSS-pixel target at the root size;
- semantic headings, buttons, description lists, meters, regions, and live status;
- canvas marked `aria-hidden` and removed from tab order;
- `prefers-reduced-motion` behavior that removes nonessential transition motion;
- no information communicated by motion or color alone.

## Art direction boundary

Transferable composition language is limited to structural readability:

- Hunt uses a landmark-led roaming field with explicit collision topology;
- Battle uses a contained Arena plate, stable combat framing, and separate actor/effect/HUD layers;
- Cage environments use compact project-native diorama composition with an explicit footprint.

All production visuals must remain original NexusLink work. A private screenshot or contact sheet may guide scale, hierarchy, and readability during research, but cannot be shipped, traced, copied, palette-sampled, or used to infer unverified collision and gameplay rules.

## Lifecycle requirements

Mounting creates one controller and at most one canvas. Subscriptions, input listeners, gamepad polling, resize observers, context-loss listeners, Pixi scene objects, and the app are disposed exactly once. `dispose` is idempotent at the runtime boundary. Repeated page mount/reload must not accumulate listeners or canvases.

## Validation

Automated checks cover default-off zero-load behavior, enabled DOM flow, DOM fallback, mobile and desktop viewports, zoom, reduced motion, keyboard controls, collision telemetry, full completion, production-state digest stability, and repeated dispose. Core tests separately prove frame-rate-independent event and state digests.
