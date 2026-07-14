# Unity / UModeler To PixiJS Habitat Layer Pipeline

*Status: PROPOSAL · Scope: docs only · Runtime stack target: HTML / CSS / Vanilla JS / PixiJS v8 / localStorage / GitHub Pages*

> This document captures the source discussion about using Unity + UModeler as an external art-authoring workstation for Nexus Link habitat scenes, then exporting four transparent PNG layers for the existing Web / PixiJS runtime.
>
> This is not a Unity runtime migration. Unity and UModeler are treated as offline scene-production tools only. The active Nexus Link game remains the root Web runtime.

---

## Source Discussion Summary

The discussion started from two external Threads references:

1. A weather-visual prototype discussion, interpreted as an AI-assisted coding workflow for scene weather, reflections, rain splashes, and mood lighting.
2. A UModeler / UModeler X workflow discussion, interpreted as a Unity-editor-native way to build modular 3D scene props, architectural forms, materials, UVs, and paint-ready game assets.

The useful Nexus Link translation is not to convert the game into Unity 3D. The useful translation is:

```text
AI / visual reference / UModeler workflow
→ Unity authoring scene
→ fixed orthographic camera
→ four transparent PNG layers
→ existing Web / PixiJS runtime
→ parallax, breath, traces, weather overlays, companion placement
```

The core production idea:

```text
Unity / UModeler = controlled external 3D art bench
PixiJS = actual game runtime presentation layer
```

This keeps the project aligned with the Web-first vertical slice while giving art production a more controllable method than one-off flat AI images.

---

## Stable Decisions

1. **Nexus Link remains Web-first.**
   - No Unity runtime migration.
   - No WebGL build export from Unity.
   - No replacement of the current root runtime.

2. **Unity / UModeler is an offline authoring pipeline only.**
   - It may create scene geometry, modular props, lighting references, render passes, and preview stills.
   - It does not introduce runtime dependencies into Nexus Link.

3. **Export target is four same-size transparent PNG layers.**

   ```text
   Background
   Midground
   Foreground
   Overlay
   ```

4. **PixiJS reconstructs the scene from those layers.**
   - The runtime stacks PNGs as sprites.
   - Parallax, breathing motion, traces, particles, and mood/weather states are applied in PixiJS.

5. **The companion sits between Midground and Foreground.**

   ```text
   Background
   Midground
   Companion
   Foreground
   Overlay
   DOM UI
   ```

   This allows foreground grass, railings, platform lips, or roots to cover the feet and make the companion feel embedded in the habitat.

6. **Overlay is split conceptually.**
   - Static atmospheric overlay may be exported as `*_ov.png`.
   - Dynamic particles, glow pulses, water sparkle, and heart-core breathing should remain PixiJS-side effects when possible.

7. **The first recommended prototype is one Heart Radiance Council habitat.**
   - It is safer than trying to build all three factions at once.
   - It can validate the export and Pixi integration contract before asset production scales.

---

## Open Questions

1. **Target aspect and master resolution**
   - Recommended first pass: `2560 × 1440` landscape master for Steam/web presentation.
   - Existing mobile habitat contracts also need portrait-safe placement. A later task must decide whether every habitat needs both 16:9 and 9:16 exports, or whether one master can be cover/contain-fitted through a profile.

2. **Relationship to `HABITAT_SCENE_PROFILE_SPEC.md`**
   - The existing scene profile spec defines spatial contracts for background placement, safe zones, traces, companion anchors, sky, water, ground, and UI forbidden areas.
   - This Unity/UModeler pipeline should either extend that schema or define a companion `layerManifest` consumed by the same future resolver.

3. **File location and asset approval gate**
   - Final PNGs would probably belong under `assets/backgrounds/` or a new `assets/habitats/` structure.
   - Because `assets/**` is GROUNDWORK, importing real PNGs needs explicit approval and audit.

4. **How much of Overlay should be baked?**
   - Static mist and soft light are acceptable.
   - High-frequency particles and glow animation should usually stay runtime-side.
   - A future visual QA pass must define the threshold.

5. **Unity render method**
   - Manual Unity Recorder export is simpler for artists.
   - A custom Unity Editor script is better for repeated production.
   - The repo should not store Unity tooling unless a future approved task creates an external-art-tools area outside the Web runtime path.

6. **Parallax intensity**
   - Initial values can be data-only guesses.
   - Real-device visual QA should tune motion to avoid nausea, clutter, or visual noise.

---

## Runtime Constraints

The current game architecture must remain intact:

1. **Allowed runtime stack**

   ```text
   HTML
   CSS
   Vanilla JavaScript / ES Modules
   PixiJS v8 via CDN
   localStorage
   GitHub Pages
   ```

2. **Do not introduce**

   ```text
   React / Vue / Svelte
   TypeScript
   npm dependencies
   build step
   backend / database / API
   LLM API
   Unity WebGL runtime
   second Pixi app
   new ticker
   ```

3. **Groundwork files are not touched by this document.**

   ```text
   index.html
   src/state/saveManager.js
   src/state/store.js normalizeState
   src/state/defaultState.js
   src/pixi/pixiApp.js
   assets/**
   tools/**
   scripts/**
   ```

4. **No state migration in this pipeline spec.**
   - Scene layer metadata should start as static design/data.
   - It must not add a new localStorage key.
   - It must not alter save schema.

5. **No gameplay ownership inversion.**
   - Visual habitat layers may enhance atmosphere.
   - They must not turn the game into a collection, gacha, farming, or FOMO system.

6. **Pixi and DOM remain decoupled.**
   - Pixi renders habitat/companion/traces/effects.
   - DOM renders HUD, panels, Soul Talk, modal UI, navigation.
   - Cross-layer communication must continue to use store or event bus patterns.

---

## Unity Authoring Requirements

### Scene Hierarchy

Each authored habitat scene should use a predictable hierarchy:

```text
NL_HabitatScene_<Faction>_<Number>
├── L_BG_Background
├── L_MG_Midground
├── L_FG_Foreground
└── L_OV_Overlay
```

### Unity Layers

Create matching Unity layers:

```text
NL_BG
NL_MG
NL_FG
NL_OV
```

Every renderable scene object must belong to exactly one of these export layers.

| Unity Layer | Content |
|---|---|
| `NL_BG` | sky, far mountains, far city, far temple, distant silhouettes |
| `NL_MG` | lake, main buildings, hills, industrial structures, heart-core device |
| `NL_FG` | platform, grass, railings, columns, roots, near props, foot occluders |
| `NL_OV` | static mist, light shafts, soft bloom cards, still particles, reflection glints |

### Export Camera

Use one locked export camera:

```text
Name: NL_ExportCamera_16x9
Projection: Orthographic
Aspect: 16:9 for first prototype
Clear Flags: Solid Color
Background Color: RGBA(0, 0, 0, 0)
Position: locked
Rotation: locked
Orthographic Size: locked
```

Rules:

1. Do not move the camera between layer exports.
2. Do not change orthographic size between exports.
3. Do not crop transparent pixels after export.
4. Do not trim each layer independently.
5. All four exported PNGs must share the exact same pixel dimensions.

### Export Naming

Recommended first prototype path shape:

```text
council_01_bg.png
council_01_mg.png
council_01_fg.png
council_01_ov.png
council_01.manifest.json
```

Recommended future asset folder shape, subject to GROUNDWORK approval:

```text
assets/habitats/council_01/
├── council_01_bg.png
├── council_01_mg.png
├── council_01_fg.png
├── council_01_ov.png
└── council_01.manifest.json
```

### Export Method A: Unity Recorder

For manual export:

```text
Recorder Type: Image Sequence
Source: Targeted Camera
Target Camera: NL_ExportCamera_16x9
Format: PNG
Include Alpha: ON
Resolution: fixed, e.g. 2560 × 1440
```

Export four times by changing only the camera culling mask:

```text
NL_BG → council_01_bg.png
NL_MG → council_01_mg.png
NL_FG → council_01_fg.png
NL_OV → council_01_ov.png
```

### Export Method B: Unity Editor Script

For repeated production, use an external Unity editor script to:

1. Cache the camera settings.
2. Set transparent background.
3. Iterate the four Unity layers.
4. Render each layer to `RenderTexture`.
5. Read to `Texture2D`.
6. Encode PNG.
7. Restore original camera settings.

The script should live in the Unity art-authoring project, not in the Web runtime, unless a later approved tooling task defines a safe external-tools path.

### Faction Authoring Notes

#### Heart Radiance Council

```text
ivory, gold, soft black accents
sacred natural forest temple
arches, roots, luminous flowers, heart-core crystal, circular platforms
```

#### Ironflow Hackers

```text
metal white, electric blue, dark iron grey
cyber-industrial stronghold
pipes, vents, glowing conduits, metal platforms, machine towers
```

#### Mundun Rift / Chaos Rift

```text
black, violet, dark red
void contamination, broken stone, unstable fissures
asymmetric shards, red-core obelisks, floating debris, corrupted portals
```

---

## PixiJS Requirements

### Layer Reconstruction

PixiJS should treat each exported PNG as a sprite loaded through `PIXI.Assets.load()` and added to one habitat container.

Minimum logical structure:

```text
habitatRoot
├── backgroundLayer   zIndex 0
├── midgroundLayer    zIndex 10
├── companionLayer    zIndex 15
├── foregroundLayer   zIndex 20
└── overlayLayer      zIndex 30
```

### Data Manifest Shape

A proposed static manifest shape:

```js
export const habitatScenePresets = {
  council_01: {
    id: "council_01",
    basePath: "/assets/habitats/council_01/",
    width: 2560,
    height: 1440,
    layers: [
      { key: "background", file: "council_01_bg.png", zIndex: 0, parallax: 0.15, alpha: 1 },
      { key: "midground",  file: "council_01_mg.png", zIndex: 10, parallax: 0.35, alpha: 1 },
      { key: "foreground", file: "council_01_fg.png", zIndex: 20, parallax: 0.55, alpha: 1 },
      { key: "overlay",    file: "council_01_ov.png", zIndex: 30, parallax: 0.20, alpha: 0.85 }
    ],
    companion: {
      anchor: { x: 0.5, y: 0.78 },
      reservedRect: { x: 0.38, y: 0.48, w: 0.24, h: 0.28 }
    },
    cameraFeel: {
      breathX: 8,
      breathY: 4,
      breathSpeed: 0.22
    }
  }
};
```

This shape is not yet runtime-approved. A later task should reconcile it with `HABITAT_SCENE_PROFILE_SPEC.md` before implementation.

### Fit And Scaling

Requirements:

1. All four PNGs use the same design size.
2. Runtime fitting should preserve shared alignment.
3. The root container can be cover-scaled or profile-scaled, but each child layer should share the same base origin.
4. Parallax offsets are applied relative to the same center point.
5. Resizing must not desynchronize layers.

### Motion Rules

Recommended initial motion:

```text
background: subtle / slow
midground: moderate
foreground: stronger but still calm
overlay: low-amplitude atmospheric drift
```

Motion should support Nexus Link's habitat mood, not become a noisy game effect.

### Dynamic Effects Left In PixiJS

Prefer Pixi-side effects for:

```text
heart-core glow pulse
water sparkle
floating dust
emotional trace light
return echo shimmer
breathing scene offset
weather particles
soft touch ripple
```

Baked PNG overlay is best for:

```text
static mist
painted soft fog
non-animated light veil
subtle vignette-like atmosphere
```

### Scene Profile Compatibility

The eventual implementation should not create a parallel system that ignores the scene-profile contract. It should either:

1. Extend each scene profile with `layers`, `layerArtSize`, and `layerParallax`, or
2. Let a layer manifest reference a scene profile id for anchors, zones, and UI-safe placement.

The second option is cleaner if the art pipeline and spatial-placement rules evolve independently.

---

## Non-Goals

1. No Unity runtime migration.
2. No Unity WebGL export.
3. No Three.js / React Three Fiber / WebGPU rewrite.
4. No second Pixi app.
5. No npm, bundler, TypeScript, framework, or build step.
6. No immediate edits to `src/pixi/pixiApp.js`.
7. No immediate edits to `assets/**`.
8. No immediate save/state migration.
9. No import of unapproved PNG files.
10. No new map/progression/unlock economy.
11. No gacha, rarity, daily dispatch, red-dot pressure, streak pressure, shop-like loop, or FOMO mechanic.
12. No multi-companion scene or party system from this pipeline.
13. No automatic replacement of existing Moonlake background art.
14. No assumption that a pretty Unity render is already gameplay-ready.

---

## Future Task Packs

### TP-UH-0 — Pipeline Spec Review

- **Layer:** Docs / architecture only
- **Goal:** Review this document against current `HABITAT_SCENE_PROFILE_SPEC.md`, `CLAUDE.md`, `AGENTS.md`, and the active Pixi renderer boundaries.
- **Files:** docs only
- **Groundwork:** none
- **Acceptance:** confirms whether the four-layer manifest extends scene profile or stays separate.

### TP-UH-1 — Heart Radiance Council Authoring Prototype

- **Layer:** External art production / docs evidence
- **Goal:** Build one Heart Radiance Council habitat in Unity / UModeler and export four PNG layers outside the repo.
- **Files:** no repo asset import yet; evidence screenshots or export notes only
- **Groundwork:** none unless files are imported into `assets/**`
- **Acceptance:** four PNGs same dimensions, transparent background, aligned when stacked, visible companion-safe anchor.

### TP-UH-2 — Asset Import Gate

- **Layer:** GROUNDWORK asset gate
- **Goal:** Import the approved four PNGs and manifest into repo assets after human approval.
- **Files:** `assets/**` plus a static manifest/data file if approved
- **Groundwork:** yes
- **Acceptance:** asset paths stable, no broken references, no oversized texture risk, no unapproved generated files.

### TP-UH-3 — Data-Only Layer Manifest

- **Layer:** EXPERIENCE data, possibly architecture
- **Goal:** Add a pure data manifest for layered habitats without wiring it to the runtime yet.
- **Files:** likely `src/data/...` only, subject to review
- **Groundwork:** avoid `defaultState.js`, `store.js`, `pixiApp.js`, and `assets/**` unless separately approved
- **Acceptance:** manifest validates shape, references approved assets, and can map to an existing or future scene profile.

### TP-UH-4 — Pixi Layer Renderer Prototype

- **Layer:** EXPERIENCE / Pixi effects, but avoid `pixiApp.js` core unless explicitly approved
- **Goal:** Create a non-invasive renderer module that stacks four PNGs in a container and exposes resize/update methods.
- **Files:** likely `src/pixi/habitatLayerRenderer.js` plus a controlled integration point
- **Groundwork:** touching `pixiApp.js` is gated; integration may require a separate approval
- **Acceptance:** one container, no second Pixi app, no new ticker, uses existing Pixi Assets cache, no per-frame heavy work.

### TP-UH-5 — Scene Profile And Layer Manifest Reconciliation

- **Layer:** Architecture + data
- **Goal:** Reconcile layered art manifests with spatial profile rules: companion anchor, reserved rect, water/ground/trace zones, UI forbidden zones.
- **Files:** `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md` and/or new data modules if approved
- **Groundwork:** none if docs/data only
- **Acceptance:** no duplicate competing coordinate systems; future habitats can be audited through one spatial contract.

### TP-UH-6 — Mood / Weather Overlay Mapping

- **Layer:** EXPERIENCE visual polish
- **Goal:** Map existing emotional state and trace state into subtle scene-layer variations: mist, glow, water sparkle, light warmth, weather particles.
- **Files:** visual mapper / Pixi effect modules only
- **Groundwork:** no save/state changes; no assets unless approved
- **Acceptance:** enhances bounded companion presence without FOMO, reward pressure, or noisy effect spam.

---

## Bottom Line

The stable pipeline is:

```text
Unity / UModeler authoring
→ fixed orthographic camera
→ culling-mask layer export
→ four same-size transparent PNGs
→ static manifest
→ PixiJS layer stack
→ companion between midground and foreground
→ dynamic breath / traces / weather kept runtime-side
```

This gives Nexus Link a path toward commercial-grade 2.5D habitat visuals without violating the current Web-first architecture or turning the project into a Unity game.
