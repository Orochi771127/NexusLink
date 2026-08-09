# Global 3D Presentation Contract V1

*Status: OWNER APPROVED · RUNTIME PROMOTION VERIFIED LOCALLY · PUBLICATION IN PROGRESS · 2026-08-09 · GLOBAL_3D_GAMEPLAY_PILOTS_R1*

## 1. Decision

Nexus Link may use the existing fixed Three.js CDN ES Module throughout the
game as a presentation capability. Adoption is per scene and opt-in. It is not
a global renderer migration and does not require every scene, companion or UI
surface to become 3D.

The approved visual family is a bright handcrafted miniature: rounded resin
and polymer-clay forms, soft physical contact shadows, selective translucent
water／memory materials and restrained cyan／warm-gold Cyber-Taoism accents.

## 2. Ownership boundary

```text
Pure engine / state authority
  gameplay, fixed-step simulation, collision, objective, outcome, save
                         |
                         | serializable read-only snapshot
                         v
Scene presentation adapter
  world transform, animation phase, camera framing, quality tier
                         |
             +-----------+-----------+
             |                       |
             v                       v
Three.js scene (opt-in)       Pixi／Canvas fallback
  GLB, material, lighting       same gameplay truth

DOM UI remains above both renderers.
```

Three.js may never own or mutate gameplay, save, relationship, Growth,
reward, Safety, RaphaelCore, unlock, companion willingness or outcome state.
The renderer may report diagnostics and context loss; it cannot settle a
session or grant progress.

## 3. Scene registration

Every Three-enabled scene must declare a small profile with:

- a stable scene id and an explicit `enabled` decision;
- module and asset paths pinned to the reviewed Three.js version;
- a canvas host and z-order contract;
- accepted serializable snapshot fields;
- mobile quality tiers, DPR cap and reduced-motion behavior;
- teardown, context-loss and static／Canvas／Pixi fallback behavior;
- asset size, triangle, material and draw-call budgets.

Unknown scenes default to Three disabled. A missing module, GLB, WebGL context
or shader capability must fail to the declared fallback without changing game
state. Context restore must not duplicate canvases, listeners or render loops.

## 4. Runtime layering

- Three.js renders opt-in 3D environments, props or presentation models.
- PixiJS renders illustrated companions, 2D authored FX and scenes that remain
  2D／2.5D.
- Canvas may remain the authoritative visual fallback for deterministic
  gameplay surfaces such as Heartcore Orbit.
- DOM owns HUD, controls, dialogs, text and accessibility semantics.
- UI controllers may start／stop a renderer through a narrow lifecycle API but
  do not manipulate Three scene graph nodes directly.

The current reviewed Three.js version and matching `GLTFLoader` remain in the
single `index.html` import map. No npm package, bundler, TypeScript or React
Three Fiber path is authorized.

## 5. Blender offline pipeline

Blender is an offline authoring and validation tool, not a runtime dependency
or website build step. Source `.blend` files and deterministic Python export
scripts may live under versioned project tooling roots. Runtime consumes only
reviewed GLB/glTF plus manifest metadata.

Each promoted GLB package must record:

- source reference, author／license and human approval state;
- Blender version, export command or script and coordinate convention;
- node／mesh names, scale, bottom contact plane and rotation pivot;
- collider proxy type and dimensions as metadata, never renderer authority;
- triangle, material, texture, draw-call, animation and file-size report;
- SHA-256 and runtime fallback path.

Blender rigid-body simulation may be used for authoring experiments or visual
reference only. Browser gameplay collision remains in the deterministic pure
engine unless a separately approved authority migration contract says
otherwise.

## 6. Heartcore Orbit Pilot

Orbit keeps `src/orbit/` fixed-step simulation as sole authority. Three.js may
render the arena and two GLB tops from that session snapshot. Both player and
opponent:

- rotate around a bottom-centre vertical spin axis;
- receive the same position, velocity, spin, tilt, wobble, stability and out
  truth produced by the engine;
- use simple engine-owned circular gameplay colliders even when the render
  mesh has more detail;
- follow the same collision, energy-retention, speed-cap, wall and ring-out
  rules;
- may use different equal-budget profiles, silhouette and material identity.

The Canvas renderer remains playable and consumes the same snapshot. It is
not deleted after Three promotion.

### 6.1 Session-only resonance form

`combatForm = base | resonance` is a transient, in-match presentation and
equal-budget physics sidegrade. It is not Companion Growth, canonical stage
advance, permanent evolution or an unlock written to save.

The transition may occur only at an explicit stage-authored resonance window
and must be deterministic from session input. It may change bounded radius,
inertia, turn authority, spin retention, objective affordance and silhouette
only through a normalized profile. It cannot increase total energy budget,
Impact, reward, Growth evidence or winner authority. Returning to base or
ending the session clears it completely.

Player and opponent use the same combat-form state machine. An opponent cannot
receive hidden privileged physics or a renderer-only timing advantage.

## 7. Expedition Pilot

Nexus Expedition stays a Pixi／DOM prototype in this package. Greyshade Cat is
presented as a project-native illustrated 512×512 transparent sprite with
eight walk directions. Three.js permission does not force a 3D companion or a
3D Expedition map.

Direction is derived from engine-owned velocity with stable octant hysteresis.
The promoted Pilot keeps eight 4096×512 master strips for audit and future
exports, but runtime loads only the eight 2048×256 downscaled strips. That
bounded set is 16 MiB decoded at RGBA8 instead of approximately 64 MiB for the
512 masters, while keeping every heading immediately available without a
direction-change hitch. Sprite selection cannot change navigation, enemy,
attack, reward, RaphaelCore or save truth.

## 8. Performance and accessibility

- Primary phone gates: 390×844 and 390×664 CSS pixels.
- DPR is capped by declared quality tier; no unbounded native mobile DPR.
- Orbit Pilot target: one arena, two top models, one key light, one fill／rim
  light, no mandatory post-processing and no per-frame asset allocation.
- A model package must stay within the scene budget recorded in its manifest;
  budget failure blocks promotion and preserves fallback.
- Reduced motion removes ornamental camera breathing, long trails, heavy shake
  and rapid transformation pulses while retaining position, spin direction,
  form state, collision and objective cues.
- Keyboard, pointer and touch input remain DOM／controller owned. Three canvas
  cannot intercept controls or remove accessible labels and 44px targets.

## 9. Promotion gate

A scene is runtime-promoted only after:

1. human visual approval of reference and current candidate;
2. GLB structure, pivot, scale, collider proxy and budget audit;
3. fixed-step 30／60／120 Hz exact-result regression;
4. phone, short-phone and desktop screenshots plus reduced-motion proof;
5. deliberate module／GLB／context-loss fallback test;
6. teardown proof with zero duplicate canvases, listeners and loops;
7. existing mode, save, Safety, Growth and release regressions;
8. provenance／license／hash manifest and protected-main publication proof.

Mechanical QC and AI visual comparison do not replace human art approval.

### 9.1 Current promoted Pilot pack

Owner continuation on 2026-08-09 accepts the reviewed Greyshade player top,
Rift Echo opponent top and Greyshade eight-direction R2 walk set for this Pilot.
The promoted runtime package is deliberately narrow:

- `assets/3d/orbit-tops-r1/manifest.json` owns the two approved GLB exports;
- `assets/characters/greyshade-cat/metadata/expedition-walk-r1.json` owns the
  eight-direction master/runtime hashes, grid data and bottom-centre anchor;
- the Moonlake camp Orbit Pilot uses Three by default when WebGL and its two
  GLBs load, while `?orbit3dPilot=0` proves the existing Canvas fallback;
- the Greyshade Expedition walk Pilot uses the approved 256 runtime strips by
  default, while `?expedition8dirPilot=0` proves the existing illustrated／
  procedural fallback chain;
- legacy Greyshade art remains present. No roster batch, attack-animation
  batch or all-scene renderer migration is part of this promotion.

Protected-main merge, deployment and public-site verification remain
publication evidence, not a precondition for the local runtime package to be
classified as Owner-approved.

## 10. Non-goals

- Full-site renderer migration or a second game-state authority.
- React／Vue／Svelte／React Three Fiber／TypeScript／npm／bundler／backend.
- Runtime Blender, runtime model generation or user-downloaded arbitrary GLB.
- Rapier, Matter.js, Planck.js or full six-degree rigid-body simulation.
- Converting all companions to 3D or replacing illustrated companion identity.
- Permanent mid-match Growth, stage advance, combat power grind or skin sales.
- Roster-wide top production before the two-top and Greyshade eight-direction
  Pilots pass their human and runtime gates.
