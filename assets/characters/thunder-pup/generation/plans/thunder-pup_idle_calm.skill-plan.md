# ThunderPup idle_calm Skill Invocation Plan

## Package

- Character id: `thunder-pup`
- Action id: `idle_calm`
- Lock spec: `assets/characters/thunder-pup/canon/thunder-pup.lock.md`
- Action config: `assets/characters/thunder-pup/actions/idle_calm.json`
- Prompt: `assets/characters/thunder-pup/prompts/thunder-pup_idle_calm.prompt.txt`
- Reference manifest: `assets/characters/thunder-pup/canon/references/reference-manifest.json`
- Generation job: `assets/characters/thunder-pup/generation/jobs/thunder-pup_idle_calm.generation-job.json`

## Current Reference Gate

Generation may proceed because human-provided Priority A and Priority B reference files are present:

- Priority A: `assets/characters/thunder-pup/canon/references/thunder-pup_front-seated.png`
- Priority B: `assets/characters/thunder-pup/canon/references/thunder-pup_side-standing.png`

Supplemental references are optional and cannot replace Priority A or Priority B. If either Priority A or Priority B is removed or missing in a future run, generation must stop before image backend invocation.

## 1. Game Studio Routing Step

Route this task as Nexus Link companion asset production.

- This is not runtime implementation.
- Do not connect ThunderPup to runtime.
- Do not route the task into Phaser migration or gameplay code.
- Use the lock spec for identity and the action config for animation layout/timing.

## 2. Generate 2D Sprite Step

Use Generate 2D Sprite only after the reference gate passes and image generation is explicitly authorized.

Inputs:

- Character lock spec.
- Reference manifest with physically present Priority A and Priority B images.
- `idle_calm` action config.
- `thunder-pup_idle_calm.prompt.txt`.
- Generation job JSON.

Expected raw output:

- `assets/characters/thunder-pup/generation/raw/thunder-pup_idle_calm_raw.png`

Generation target:

- 8 frames.
- 2 rows x 4 columns.
- 512x512 per frame.
- Total sheet size 2048x1024.
- Transparent PNG.
- Subtle calm seated idle breathing.

## 3. Sprite Pipeline Step

Run sheet normalization and QC after a raw generated PNG exists.

Required checks:

- Sheet is 2048x1024.
- Grid is exactly 2 rows x 4 columns.
- Frame size is 512x512.
- Frame count is 8.
- Transparent background is preserved.
- Bottom-center baseline is stable.
- Scale is based on frame height, not full sheet height.
- ThunderPup identity remains consistent in every frame.

Expected processed output:

- `assets/characters/thunder-pup/generation/processed/thunder-pup_idle_calm_sheet.png`

Expected preview output:

- `assets/characters/thunder-pup/generation/previews/thunder-pup_idle_calm_preview.png`

## 4. Validator Step

Run this command after the processed sheet exists:

```powershell
node scripts/validate_companion_asset.js --file assets/characters/thunder-pup/generation/processed/thunder-pup_idle_calm_sheet.png --character-id thunder-pup --cols 4 --rows 2 --expected-frames 8
```

Expected report:

- `assets/characters/thunder-pup/qc/reports/thunder-pup_idle_calm_validation.json`

## 5. Human Approval Step

Human reviews the processed sheet and preview using:

- `assets/characters/thunder-pup/qc/thunder-pup_idle_calm_human-approval.md`

Approval requires:

- Validator pass.
- Identity match to ThunderPup lock spec.
- No white-green or gold variant drift.
- No adult warwolf drift.
- No armor, gun, wing, UI, text, scene, or baked background.
- Stable bottom-center baseline.
- Explicit human approve decision.

## Fallback Path

If Codex cannot directly invoke an image backend, or if required reference files are missing, stop after this generation package and wait for human or external image generation.

Codex must provide:

- Generation job JSON.
- Prompt text.
- Reference manifest.
- Expected output paths.
- Validator command.

Codex must not generate images or proceed to Sprite Pipeline until a generated PNG is provided.
