# Skill Invocation Plan

## Job

- Character id: `<character-id>`
- Action id: `<action-id>`
- Generation job: `<path-to-generation-job.json>`
- Reference manifest: `<path-to-reference-manifest.json>`
- Prompt: `<path-to-prompt.txt>`

## 1. Game Studio Step

Route the request as Nexus Link companion asset production.

- Confirm this is an asset-generation workflow, not runtime implementation.
- Confirm no Phaser migration, runtime wiring, or gameplay integration is part of this job.
- Confirm the character lock spec and action config are the source of truth.

## 2. Generate 2D Sprite Step

Generate the raw image or sprite sheet only when image generation is explicitly authorized and a callable backend is available.

Inputs:

- Character Lock Spec.
- Reference manifest.
- Action config.
- Prompt text.
- Generation job JSON.

Expected output:

- Raw output PNG at the `output_targets.raw_output` path.

## 3. Sprite Pipeline Step

Normalize and inspect the raw output.

Required checks:

- Sheet layout matches rows, cols, frame count, total width, and total height.
- Frame grid divides evenly.
- Each frame preserves bottom-center anchor.
- Baseline remains stable across frames.
- Character scale is based on frame height, not sheet height.
- Preview is generated for human review when possible.
- QC report records any identity, alignment, transparency, or layout issues.

Expected outputs:

- Processed sheet.
- Preview.
- QC notes or report.

## 4. Validator Step

Run the project validator against the processed sheet.

```powershell
node scripts/validate_companion_asset.js --file <processed-sheet.png> --character-id <character-id> --cols <cols> --rows <rows> --expected-frames <frame-count>
```

Expected output:

- Validation report at the `output_targets.validation_report` path.

## 5. Human Approval Step

Human reviews the processed sheet and preview against the approval checklist.

Approval requires:

- Validator pass.
- Human identity approval.
- No UI, text, scene, card frame, pedestal, or baked background.
- Stable baseline and readable action.
- Explicit approve decision in the human review report.

## Fallback If Image Backend Is Unavailable

If Codex cannot directly invoke Image 2 or another image generation backend, Codex must output:

- Generation job JSON.
- Prompt text.
- Reference manifest.
- Expected output paths.
- Validation command.

Codex must then stop and wait for the human or an external image generation tool to provide the generated PNG. After the generated PNG is provided, Codex can resume from the Sprite Pipeline step.
