# 04 — Current Tasks

This file is the compact task queue for Codex. It should stay short, specific, and executable.

## Task Pack Protocol

Before starting any non-trivial task, report:

```text
Task name:        <task name>
Layer:            GROUNDWORK / EXPERIENCE / DOCS / PIPELINE
Files touched:    <expected files>
Files not touched:<explicit non-goals>
Risk:             low / medium / high
Rollback:         <how to revert safely>
Acceptance:       <checks to pass>
```

For groundwork files listed in `AGENTS.md`, do not proceed without explicit human approval.

## Current Priority 1 — Codex Context Pack Integration

Status: IN PROGRESS

Goal:

Make Codex able to understand the project direction through repository documents instead of repeated copy-paste from ChatGPT conversations.

Files:

- `docs/codex/01_PROJECT_BRIEF.md`
- `docs/codex/02_DECISION_LOG.md`
- `docs/codex/03_ARCHITECTURE_RULES.md`
- `docs/codex/04_CURRENT_TASKS.md`
- `docs/codex/05_UNITY_PIPELINE.md`
- `docs/codex/06_PIXIJS_RUNTIME_BRIDGE.md`
- `docs/codex/07_ASSET_PIPELINE.md`

Acceptance:

- Docs exist under `docs/codex/`.
- Docs do not contradict `AGENTS.md` hard runtime constraints.
- Docs preserve Web/PixiJS-first direction.
- Docs define Unity/UModeler as an asset-production pipeline, not a runtime migration.
- Docs define how future ChatGPT conclusions should become context patches.

Non-goals:

- No runtime code changes.
- No asset changes.
- No save-state changes.
- No dependency changes.
- No Unity project import.

## Current Priority 2 — Unity Layer Export Pipeline Specification

Status: READY FOR FUTURE TASK PACK

Goal:

Design a deterministic Unity/UModeler pipeline that exports habitat scenes into four Web/PixiJS-ready layers.

Expected outputs:

- `Background.png`
- `Midground.png`
- `Foreground.png`
- `Overlay.png`
- `manifest.json`

Required behavior:

- layer naming convention
- camera/export convention
- transparent output where needed
- deterministic output paths
- PixiJS-compatible manifest
- no runtime migration to Unity

Suggested future files if a Unity pipeline is added:

- `unity-pipeline/Assets/Editor/NexusLayerExporter.cs`
- `unity-pipeline/Assets/Editor/NexusSceneValidation.cs`
- `docs/pipeline/UNITY_LAYER_EXPORT_SPEC.md`

Acceptance for future implementation:

- Export can be run through a Unity Editor menu and ideally batchmode.
- Missing layer objects are reported clearly.
- Output manifest can be consumed by a PixiJS loader without manual renaming.
- Existing Web runtime is untouched unless explicitly requested.

## Current Priority 3 — PixiJS Layered Scene Loader Specification

Status: READY FOR FUTURE TASK PACK

Goal:

Define how the Web runtime should consume Unity-exported scene layers.

Expected loader responsibilities:

- load scene manifest JSON
- load four PNG layers
- position layers consistently
- support light parallax
- support optional overlay effects
- respect mobile performance constraints

Non-goals:

- no framework migration
- no React
- no npm
- no build step
- no save-state mutation unless scene unlocks are explicitly required

## Current Priority 4 — Asset Readiness Gates

Status: READY FOR FUTURE TASK PACK

Goal:

Create a checklist or validation script for companion and habitat assets before they enter runtime.

Possible checks:

- transparent PNG
- no baked-in background
- bottom-center anchor convention
- dimensions within GPU-safe limits
- naming convention
- manifest completeness
- no placeholder/fallback asset confusion

Non-goals:

- do not delete legacy accepted assets
- do not replace Greyshade without reference-audited swap approval

## How to Add New Tasks

Append tasks in this file using this structure:

```md
## Current Priority N — <Task Name>

Status: READY / IN PROGRESS / BLOCKED / DONE

Goal:

Files:

Acceptance:

Non-goals:
```

Do not erase old task history if it is needed for handoff. Move completed details to the execution ledger when appropriate.
