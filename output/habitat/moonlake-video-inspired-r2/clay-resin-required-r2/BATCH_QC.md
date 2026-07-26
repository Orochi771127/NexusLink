# TP-E2 Clay/Resin Required Visuals R2 - Batch QC

Status: `GENERATED - HUMAN REVIEW PENDING`

## Coverage

- Required functional slots: `18/18`.
- Built-in image-generation calls: `18/18`.
- Raw chroma-key sources: `18/18`.
- Normalized transparent finals: `18/18`.
- Optional polish: `0/8`.
- CLI/API fallback: not used.
- Asset promotion: not performed.
- Runtime integration: not performed.
- Human approval: pending.
- Reference audit: pending.

## MCP And Runtime Need Audit

The current `main` runtime and codebase-memory MCP were checked for First
Resonance, Habitat Moments and Crystal Weaving consumers. No additional required
PNG slot was found beyond the eighteen already planned. Current presentation
still uses CSS/Pixi procedural visuals, so this batch is staging-only and does
not imply a runtime consumer or integration.

The optional eight polish images were not generated because no current runtime
consumer, acceptance assertion or chapter-specific distinction requires them.

## Mechanical QC

`18/18` finals pass:

- static finals are exact `512 x 512` RGBA;
- 2x2 finals are exact `1024 x 1024` RGBA with `512 x 512` cells;
- all corners are transparent;
- no alpha-over-8 pixel touches a cell edge;
- all cells retain at least 24 px margin;
- RGB is zero wherever alpha is zero.

Evidence:

- `qc/batch-mechanical-report.json`
- `previews/contact-sheet-required-18-r2.png`

## Visual Self-Review

Strong direction candidates:

- `heart-core-carrier-r2`
- `element-light-moon-r2`
- `element-light-fire-r2`
- `element-light-water-r2`
- `moment-symbol-moon-gaze-r2`
- `intervention-symbol-steady-r2`
- `intervention-symbol-boundary-r2`
- `crystal-release-afterglow-r2`

Pre-flagged `revise`:

- `ritual-fx-pulse-r2`: still reads as a heart/healing emblem and does not
  communicate a simple heart-core breath cleanly enough.
- `resonance-circle-layer-r2`: three linked objects still suggest a formation
  or device network despite the open center.

Needs human comparison:

- `ritual-foreground-veil-r2`: one selected variant is delivered as the static
  final; confirm that its volume remains foreground atmosphere rather than a
  decorative prop.
- `moment-symbol-quiet-approach-r2`: verify it reads as shared quiet distance,
  not another cradle.
- `moment-symbol-crystal-glimmer-r2`: grounded treatment reduces collectible
  risk, but the crystal remains visually prominent.
- `intervention-symbol-step-back-r2`: retreat is readable, but the human
  footprint metaphor may be too literal for companion-led emotional standoff.

## Promotion Gate

Nothing in this batch may move into `assets/**` until the exact candidate is
human-approved, reference audit passes, and a separate GROUNDWORK promotion
package names runtime target paths and manifests.
