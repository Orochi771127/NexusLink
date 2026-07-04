# Habitat Automation Workflow

Status: `PRODUCTION WORKFLOW / STAGING FIRST`
Scope: Linkara habitat environment production, AI / skill routing, staging automation, review gates, and future runtime promotion.
Runtime status: no runtime wiring. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, `scripts/**`, or `tools/**` mutation in this workflow document.

This document turns habitat production into a repeatable pipeline. It is the entry point for future generation windows and agent handoffs.

Global art target: `docs/assets/NEXUS_LINK_ART_STYLE_TARGET.md`.

## 1. Authority Model

Codex is the production orchestrator. Other AI tools may generate images, prototypes, or candidate diffs, but Codex owns repo boundaries, task packs, acceptance checks, and final staging review.

Human approval is the only runtime promotion gate. Generated images are not runtime assets until they pass visual review, readiness audit, and a separate GROUNDWORK asset-readiness task.

## 2. AI And Skill Routing

| Role | Tool / AI | Use |
| --- | --- | --- |
| Orchestration | Codex | Read repo, write job specs, create prompts, validate outputs, maintain ledger, keep GROUNDWORK boundaries. |
| Code discovery | codebase-memory-mcp | Use `index_status`, `get_architecture`, `get_code_snippet`, and graph search before runtime planning. |
| Map / habitat contract | `generate2dmap` skill | Use `scene_mode`, `layered_raster`, `separate_props`, `foreground_occluders`, and `project-native` for scene contracts, layer ownership, prop strategy, placement metadata, and QA previews. |
| Bitmap exploration | `imagegen` skill | Use for concepts, paintovers, texture/prop exploration, and small prop candidates. Do not treat direct 2D image generation as the sole final-background source for high-quality habitat bases. |
| Architecture guard | `game-studio:web-game-foundations` skill | Keep simulation/state outside renderer; keep DOM UI outside canvas; keep manifest keys stable. |
| Offline 3D / DCC source | `game-studio:web-3d-asset-pipeline` skill | Use for high-quality habitat blockouts, camera lock, render-pass naming, material/lighting discipline, masks, depth, and source hygiene before exporting Pixi-friendly 2.5D layers. |
| 3D runtime evaluation | `game-studio:three-webgl-game` skill | Evaluation only. Do not adopt Three.js / GLB / TypeScript / Vite runtime for Nexus Link without a separate architecture pivot approval. |
| FX / animation strips | `game-studio:sprite-pipeline` skill | Use only for approved FX sprite strips or companion animation work, not for base habitat images. |
| Prototype partner | Fable / Claude Code | Optional throwaway weather or visual FX prototypes; output must be extracted into Nexus Link data/runtime rules, not imported wholesale. |
| Visual reviewer | Gemini or human visual QA | Inspect composition, alpha, UI clearance, companion readability, and baked-object mistakes. |

Hard exclusions:

- Do not use Phaser, React, TypeScript, npm, backend, database, or build step.
- Do not switch the Nexus Link habitat runtime from PixiJS to Three.js as part of art production.
- Do not treat a complete generated painting as a runtime habitat.
- Do not treat direct 2D image generation as final-quality production for high-value habitat bases unless it passes the same render-pass and human-approval gates as a DCC-assisted package.
- Do not bake companion, UI, labels, weather, memory traces, or stateful props into base layers.
- Do not bake sun, moon, stars, or time-of-day celestial bodies into `sky_atmosphere`; they must be separate when they move or change with time.
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
3. For high-quality habitat bases, author or block out the scene in an offline 3D / DCC-style source first:
   - lock one mobile portrait camera at `1080x1920`
   - establish terrain, water plane, platform, major silhouettes, and companion clearance before paintover
   - validate material response and lighting in source before exporting raster passes
   - export optional mask, depth, and normal references for cleanup and future FX placement
4. Generate or export foundation-only passes next:
   - `sky_atmosphere`
   - `celestial_bodies` when the region uses time-of-day sun/moon/star motion
   - `celestial_occlusion` when clouds, canopy, cliffs, or shrine edges should pass over celestial bodies
   - `distant_landmarks`
   - `water_or_atmosphere`
   - `ground_platform`
   - `structures`
   - `foreground_occlusion`
5. Generate an in-world preview or dressed reference only as a planning checkpoint.
6. Generate runtime props separately:
   - Important, tall, irregular, collision-aligned, or identity-critical props use one-by-one generation.
   - Compact decorative props may use a small prop pack only if they do not need exact placement.
7. Generate or stage FX separately:
   - memory glimmers
   - water ripples
   - mist
   - firefly glow
   - rain / splash sprite candidates
8. Validate dimensions, alpha, source-pass metadata, prompt metadata, profile JSON, and rejected files.
9. Write `readiness-report.md`.
10. Stop for human approval before runtime promotion.

## 5. Generation Prompt Rules

Foundation layers must say what they contain and what they must not contain.

Direct 2D generation is no longer the default final-background path for Moonlake or other high-quality habitat bases. It can create concept targets, paintover references, prop candidates, and exploratory texture treatments, but final promotion requires either a DCC/3D-assisted render-pass package or an equivalent hand-authored layer package that passes the same gates.

Art direction lock:

```text
Project-native premium 3D storybook diorama, cozy fantasy, soft stylized forms, realistic material response, cinematic moonlit lighting, controlled magical glow, mobile-first readability.
Preserve diorama depth, companion-first framing, contact shadows, water reflection and ripple structure, atmospheric depth, wet stone, soft fur, foliage translucency, carved wood, controlled crystal/metal specular highlights, and restrained bloom.
Avoid flat anime concept art, photoreal animal/photo treatment, chunky pixel art, plastic surfaces, over-smoothed painterly gradients, noisy AI texture, one-note blue palettes, and glow that hides surface form.
```

Base layer prompt lock:

```text
Foundation-only habitat layer. Include only stable non-interactive environment art for this named layer.
Do not include companion, UI, labels, text, weather effects, memory traces, clickable props, glowing runtime props, foreground occluders outside this layer, or any object that should animate, be replaced, or have independent render order.
For `sky_atmosphere`, do not include sun, moon, stars, or time-of-day celestial bodies.
```

Transparent prop prompt lock:

```text
Create this single runtime habitat prop on a perfectly flat solid chroma-key background for background removal.
No floor plane, cast shadow, reflection, UI, labels, text, companion, scenery, or extra props.
Generous padding. Crisp edges. Match the project-native premium 3D storybook diorama style, region material language, and lighting.
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
- DCC/3D-assisted packages include source-pass notes for camera, layer ownership, materials, lighting, and any masks/depth references.
- Prompt notes or prompt files exist.
- No filename containing `rejected` remains in the accepted staging set.
- Composite preview does not hide companion reserved area.
- UI forbidden zones remain readable in the profile.
- Time-of-day celestial bodies are separated from `sky_atmosphere` and can be positioned from art-space profile data.
- Material and lighting review passes the semi-realistic lock: believable surface response, depth, shadows, reflections, and restrained bloom.
- Companion readability passes against the active companion reserved rect; foreground occlusion may cover feet lightly but not face/body silhouette.
- Style review passes `NEXUS_LINK_ART_STYLE_TARGET.md`: premium 3D storybook diorama, cozy fantasy, mobile-first readability, controlled moon/cyan/gold glow, and no flat anime / photoreal / pixel-art drift.

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

1. `TP-HAB-RESET-1`: delete rejected generated Moonlake image files under `output/linkara/moonlake/**`, preserving JSON / Markdown / prompt records.
2. `TP-HAB-PIPE-1`: revise the production workflow around 3D-assisted 2.5D habitat bases and keep PixiJS as the runtime.
3. `TP-HAB-MOON-3D-1`: produce the Moonlake 3D/DCC blockout and render-pass brief under staging only.
4. `TP-HAB-MOON-APPROVAL-1`: human visual approval of source composition, render passes, companion readability, UI safe zones, and celestial separation.
5. `TP-HAB-AUTO-3`: Scene Profile data pack, data-only, no Pixi wiring.
6. `TP-HAB-RUNTIME-1`: Moonlake runtime promotion, GROUNDWORK-gated and only after approval.
7. `TP-HAB-AUTO-5`: Moonlake weather / mood prototype.
8. `TP-HAB-AUTO-6`: seven-region rollout using the same gate.
