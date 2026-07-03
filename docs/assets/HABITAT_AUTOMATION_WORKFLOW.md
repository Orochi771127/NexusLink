# Habitat Automation Workflow

Status: `PRODUCTION WORKFLOW / STAGING FIRST`
Scope: Linkara habitat environment production, AI / skill routing, staging automation, review gates, and future runtime promotion.
Runtime status: no runtime wiring. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, `scripts/**`, or `tools/**` mutation in this workflow document.

This document turns habitat production into a repeatable pipeline. It is the entry point for future generation windows and agent handoffs.

## 1. Authority Model

Codex is the production orchestrator. Other AI tools may generate images, prototypes, or candidate diffs, but Codex owns repo boundaries, task packs, acceptance checks, and final staging review.

Human approval is the only runtime promotion gate. Generated images are not runtime assets until they pass visual review, readiness audit, and a separate GROUNDWORK asset-readiness task.

## 2. AI And Skill Routing

| Role | Tool / AI | Use |
| --- | --- | --- |
| Orchestration | Codex | Read repo, write job specs, create prompts, validate outputs, maintain ledger, keep GROUNDWORK boundaries. |
| Code discovery | codebase-memory-mcp | Use `index_status`, `get_architecture`, `get_code_snippet`, and graph search before runtime planning. |
| Map / habitat production | `generate2dmap` skill | Use `scene_mode`, `layered_raster`, `separate_props`, `foreground_occluders`, and `project-native`. |
| Bitmap generation | `imagegen` skill | Use built-in image generation by default. Use chroma-key removal for simple transparent props. Ask before CLI native transparency. |
| Architecture guard | `game-studio:web-game-foundations` skill | Keep simulation/state outside renderer; keep DOM UI outside canvas; keep manifest keys stable. |
| FX / animation strips | `game-studio:sprite-pipeline` skill | Use only for approved FX sprite strips or companion animation work, not for base habitat images. |
| Prototype partner | Fable / Claude Code | Optional throwaway weather or visual FX prototypes; output must be extracted into Nexus Link data/runtime rules, not imported wholesale. |
| Visual reviewer | Gemini or human visual QA | Inspect composition, alpha, UI clearance, companion readability, and baked-object mistakes. |

Hard exclusions:

- Do not use Phaser, React, TypeScript, npm, backend, database, or build step.
- Do not treat a complete generated painting as a runtime habitat.
- Do not bake companion, UI, labels, weather, memory traces, or stateful props into base layers.
- Do not copy generated output into `assets/**` before human approval.

## 3. Folder Contract

All generation output starts in `output/linkara/<region-id>/`.

Required staging layout:

```text
output/linkara/<region-id>/
  habitat-job.json
  readiness-report.md
  layered-preview.png
  props-preview.png
  profile-draft.json
  layers/
  props/
  prompts/
  reference/
  sources/
```

Runtime promotion, when approved later, targets:

```text
assets/backgrounds/linkara/<region-id>/
src/data/sceneProfiles/<region-id>.js
src/data/assetManifest.js
```

Those runtime targets are GROUNDWORK-gated and are not part of staging automation.

## 4. Habitat Job Lifecycle

1. Create `habitat-job.json` from `templates/habitat-generation-job.template.json`.
2. Lock the region's visual identity from `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`.
3. Generate foundation-only layers first:
   - `sky`
   - `distant_landmarks`
   - `water_or_atmosphere`
   - `ground_platform`
   - `structures`
   - `foreground_occlusion`
4. Generate an in-world preview or dressed reference only as a planning checkpoint.
5. Generate runtime props separately:
   - Important, tall, irregular, collision-aligned, or identity-critical props use one-by-one generation.
   - Compact decorative props may use a small prop pack only if they do not need exact placement.
6. Generate or stage FX separately:
   - memory glimmers
   - water ripples
   - mist
   - firefly glow
   - rain / splash sprite candidates
7. Validate dimensions, alpha, prompt metadata, profile JSON, and rejected files.
8. Write `readiness-report.md`.
9. Stop for human approval before runtime promotion.

## 5. Generation Prompt Rules

Foundation layers must say what they contain and what they must not contain.

Base layer prompt lock:

```text
Foundation-only habitat layer. Include only stable non-interactive environment art for this named layer.
Do not include companion, UI, labels, text, weather effects, memory traces, clickable props, glowing runtime props, foreground occluders outside this layer, or any object that should animate, be replaced, or have independent render order.
```

Transparent prop prompt lock:

```text
Create this single runtime habitat prop on a perfectly flat solid chroma-key background for background removal.
No floor plane, cast shadow, reflection, UI, labels, text, companion, scenery, or extra props.
Generous padding. Crisp edges. Match the region's art style and lighting.
```

Reference handoff rule:

- Before generating a dressed reference from a local base image, make the base visible with `view_image`.
- The dressed reference is never the final runtime asset.
- It may show proposed objects naturally in-world, but must not contain annotations, labels, circles, arrows, UI, or debug marks.

## 6. Readiness Gates

`readiness-report.md` must classify each asset:

- `keep_for_review`: useful staging candidate, not approved.
- `regenerate`: direction is valid but asset is not fit for runtime promotion.
- `reject`: wrong layer, baked object, fake transparency, wrong aspect, unreadable, or violates visual lock.
- `runtime_candidate_after_approval`: only after human approval and audit.

Minimum checks:

- `profile-draft.json` parses.
- All listed layer files exist.
- All listed prop files exist.
- Scene layers share one canvas size.
- Transparent layers / props use an alpha-capable format.
- Prompt notes or prompt files exist.
- No filename containing `rejected` remains in the accepted staging set.
- Composite preview does not hide companion reserved area.
- UI forbidden zones remain readable in the profile.

## 7. Runtime Promotion Rules

Runtime promotion is a separate task pack. It may begin only when:

- Human approval is recorded.
- `referenceAuditPassed` is true.
- Alpha and canvas QA pass.
- The approved staged assets have stable filenames.
- A Scene Profile exists with companion anchor, reserved rect, UI forbidden zones, and trace zones.

Promotion tasks must explicitly list any planned edits to:

- `assets/**`
- `src/data/assetManifest.js`
- `src/pixi/pixiApp.js`
- `src/data/sceneProfiles/**`
- save schema

Default: no save schema change. Scene switching and unlock persistence require a separate approved task.

## 8. Pack Order

1. `TP-HAB-AUTO-0`: this automation workflow plus templates.
2. `TP-HAB-AUTO-1`: Moonlake readiness audit under `output/linkara/moonlake/`.
3. `TP-HAB-AUTO-2`: Moonlake regeneration pass for rejected or weak layers.
4. `TP-HAB-AUTO-3`: Scene Profile data pack, data-only, no Pixi wiring.
5. `TP-HAB-AUTO-4`: Moonlake runtime promotion, GROUNDWORK-gated.
6. `TP-HAB-AUTO-5`: Moonlake weather / mood prototype.
7. `TP-HAB-AUTO-6`: seven-region rollout using the same gate.

