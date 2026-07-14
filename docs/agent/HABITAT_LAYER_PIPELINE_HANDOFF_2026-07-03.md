# Habitat Layer Pipeline Handoff Record

Date: 2026-07-03
Agent: ChatGPT
Branch: `docs-habitat-layer-pipeline`
Scope: Documentation-only handoff for Unity / UModeler authored 2.5D habitat layers intended for the existing Web / PixiJS runtime.

This handoff exists so Codex can judge the proposed pipeline without reconstructing the discussion from chat history.

---

## Source Discussion Summary

The source discussion analyzed a possible production workflow where Unity and UModeler are used only as offline authoring tools for controlled 3D/2.5D habitat scenes.

The proposal is not to migrate Nexus Link to Unity, Unity WebGL, Three.js, React, TypeScript, npm, or a build pipeline.

The proposed workflow is:

```text
Unity / UModeler scene authoring
→ fixed orthographic export camera
→ four transparent PNG layers
→ Web / PixiJS runtime re-composes the scene
→ PixiJS handles parallax, breathing motion, light particles, weather overlays, and character placement
```

The primary source file added in this branch is:

```text
docs/architecture/UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md
```

Codex should treat that file as a proposal and review target, not as approved runtime implementation.

---

## Stable Decisions

1. Nexus Link remains Web-first and root-runtime first.
2. Unity and UModeler are offline art/scene authoring tools only.
3. Exported habitat scenes use four PNG layers:
   - Background
   - Midground
   - Foreground
   - Overlay
4. All exported PNG layers must share the same resolution and camera framing.
5. PixiJS is responsible for reconstructing the scene and applying runtime motion.
6. The character layer should sit between Midground and Foreground.
7. Overlay PNG should be mostly static atmosphere; dynamic particles and shimmer should remain in PixiJS.
8. No current runtime file should be edited just because this architecture proposal exists.

---

## Open Questions

Codex should decide or ask for human approval before implementation:

1. Whether the first actual habitat prototype should be Heart Radiance Council / 心輝議會.
2. Whether output resolution should be 1920x1080, 2560x1440, or 3840x2160.
3. Whether habitat assets should live under `assets/habitats/` or another approved asset directory.
4. Whether a manifest data file should be JSON, JS module, or integrated with the existing habitat scene profile spec.
5. Whether PixiJS layer reconstruction should be prototyped as a separate renderer module or integrated into the existing Pixi app only after a GROUNDWORK review.
6. Whether Unity export scripts belong in this repository, an external art tooling repository, or documentation only.
7. How large PNG layers can be before mobile performance becomes unacceptable.
8. Whether scene profile mood/weather data should remain separate from asset manifest data.

---

## Runtime Constraints

Codex must preserve the current runtime boundaries unless the human explicitly approves a new TASK_PACK:

- Do not add Unity WebGL runtime.
- Do not add Three.js.
- Do not add React, Vue, TypeScript, npm, bundlers, or a build step.
- Do not create a second Pixi app.
- Do not create a new ticker independent from the existing runtime loop.
- Do not touch save schema, localStorage keys, or state normalization for this docs-only proposal.
- Do not touch `index.html`, `src/state/**`, `src/pixi/pixiApp.js`, `assets/**`, `tools/**`, or `scripts/**` without separate approval.
- Do not import generated assets until the asset naming, size, alpha, and mobile readability gates are defined.

---

## Unity Authoring Requirements

If Codex later writes a task pack or tooling spec, the Unity side should follow this model:

```text
NL_HabitatScene_<Faction>_<Variant>
├── L_BG_Background
├── L_MG_Midground
├── L_FG_Foreground
└── L_OV_Overlay
```

Required Unity Layers:

```text
NL_BG
NL_MG
NL_FG
NL_OV
```

Each export must use:

- one fixed orthographic camera;
- fixed position, rotation, orthographic size, and aspect ratio;
- transparent background;
- identical output resolution for all four layers;
- no transparent-pixel trimming;
- clear naming such as:

```text
council_01_bg.png
council_01_mg.png
council_01_fg.png
council_01_ov.png
```

Unity Recorder or a Unity Editor export script may be used, but this repository should not contain Unity project files unless approved.

---

## PixiJS Requirements

If Codex later implements a runtime prototype, it should be data-driven and reversible.

Expected layer order:

```text
Background
Midground
Character
Foreground
Overlay
UI
```

Expected manifest fields:

```text
id
faction
resolution.width
resolution.height
layers[].key
layers[].file
layers[].zIndex
layers[].parallax
layers[].alpha
safeCharacterAnchor
cameraFeel
```

PixiJS should:

- load four transparent PNGs as sprites;
- preserve layer order with z-index or container order;
- fit scene to current screen without distorting aspect ratio;
- apply slight parallax and breathing motion per layer;
- keep dynamic particles, glow, shimmer, and weather overlays in runtime rather than baking them all into PNG;
- place the companion between Midground and Foreground;
- keep UI outside the habitat layer stack.

---

## Non-Goals

This handoff does not authorize:

- converting Nexus Link into a Unity game;
- shipping Unity WebGL;
- adding a backend or LLM/API integration;
- adding a build system;
- importing actual habitat PNGs;
- modifying save/state systems;
- modifying existing Pixi app architecture;
- adding gacha, shop pressure, FOMO, daily streaks, red-dot pressure, or multi-character team mechanics;
- claiming the pipeline is implemented in runtime.

---

## Future Task Packs

Recommended order for Codex judgment:

### TP-UH-0 — Pipeline Spec Review

- Scope: review `docs/architecture/UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md` against repo constraints.
- Output: approve, revise, or reject the pipeline.
- Runtime changes: none.

### TP-UH-1 — Heart Radiance Council Habitat Prototype Spec

- Scope: define the first Council habitat scene asset list and layer breakdown.
- Output: art brief and export checklist.
- Runtime changes: none.

### TP-UH-2 — Asset Import Gate

- Scope: define PNG size limits, alpha requirements, naming, folder structure, mobile memory gate, and review process.
- Runtime changes: none unless human approves asset import.

### TP-UH-3 — Data-Only Manifest Prototype

- Scope: create a manifest or JS preset for one placeholder habitat without importing final assets.
- Runtime changes: data-only, if approved.

### TP-UH-4 — PixiJS Habitat Layer Renderer Prototype

- Scope: implement a reversible renderer module only after GROUNDWORK approval.
- Must not create a second Pixi app or ticker.

### TP-UH-5 — Existing Habitat Scene Profile Reconciliation

- Scope: align this pipeline with any existing habitat scene profile documentation.
- Output: one unified spec.

### TP-UH-6 — Mood / Weather Overlay Mapping

- Scope: map emotional state and habitat mood to PixiJS overlay effects.
- Runtime changes: only after data model and visual rules are approved.

---

## Required Reading For Codex

Codex should read these before judging or implementing anything:

```text
AGENTS.md
CLAUDE.md
ACCEPTANCE.md
docs/agent/AI_EXECUTION_LEDGER.md
docs/architecture/UNITY_UMODELER_TO_PIXIJS_HABITAT_LAYER_PIPELINE.md
docs/design/HABITAT_SCENE_PROFILE_SPEC.md
```

If any of those documents conflict, higher-authority project governance documents win over this handoff.
