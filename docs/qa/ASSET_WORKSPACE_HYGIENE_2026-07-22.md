# Asset Workspace Hygiene Audit — 2026-07-22

## Scope

This audit covers the primary checkout
`C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink` after the owner asked to
resolve the 891 files shown by GitHub Desktop. It does not cover or mutate the
separate video-art worktree, `AIForgeNexus2`, tracked runtime assets, or Git
history.

## Exact pre-cleanup inventory

| Group | Files | Size | Classification |
|---|---:|---:|---|
| `output/character-pilots/**` untracked | 673 | 786.88 MiB | raw, alpha-clean, diagnostic, rejected or superseded staging |
| `output/habitat/**` untracked | 213 | 211.72 MiB | raw, rejected, preview or duplicate promoted raster staging |
| regenerated `docs/qa/**` outputs | 5 | 0.07 MiB | Python bytecode and local evaluator reports |
| **GitHub Desktop-visible total** | **891** | **998.67 MiB** | all untracked; tracked changes = 0 |

An additional 4,677 ignored files under `output/**` occupied 2,366.62 MiB.
Together, the allowlisted removable `output/**` and five QA files comprised
5,568 files / 3,365.29 MiB, with zero intersection with tracked files.

## What was retained or connected

- Formal Heartspark Council selected sheets already match the promoted runtime
  assets byte-for-byte (SHA-256) and all five companions are already
  `full-runtime`; duplicate generation intermediates do not need another
  runtime connection.
- Moonlake R1 foundation/layers and the R2 eight-object base-plus-emissive pack
  are already wired through the active scene profile. Thirty-one local core
  rasters matched promoted runtime assets byte-for-byte. Small prompts,
  deterministic R2 processing scripts, integrity reports and stateful-object provenance
  are retained in `output/habitat/moonlake-diorama-r1/` and
  `output/habitat/moonlake-layered-r2/`.
- Black Iron character review packages remain retained where already tracked,
  but are not promoted into the registry or runtime. Their faction/canon status
  and the Thunder Pup identity conflict require an explicit owner decision and
  separate GROUNDWORK promotion.
- Raw/rejected/diagnostic files carry no unique approved runtime final. They are
  local staging, not game content.

## Repository policy

`.gitignore` now treats new `output/**` files as local art-generation staging
and ignores the three regenerated evaluator outputs plus `docs/qa/__pycache__`.
Existing intentionally tracked review packages remain tracked. Any new
provenance exception must be explicitly reviewed and force-added; approved
runtime finals belong under `assets/**`.

## Cleanup execution

- Before deletion, 540 small source/provenance files (24.76 MiB) were copied to
  `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink-asset-cold-storage\2026-07-22-pre-cleanup`.
  `ARCHIVE_MANIFEST.csv` records each relative path, byte size and SHA-256;
  post-copy verification reported 540 rows and zero missing/hash failures.
- A path-scoped Git clean removed the validated 5,568 untracked/ignored files
  (3,365.29 MiB) from the primary checkout. The command was restricted to
  `output/**` plus the five exact QA paths, so Git-protected tracked files were
  not candidates.
- The primary checkout then fast-forwarded from `e86bf6e` to current
  `origin/main` `7eebddb` (the merged G3.1 publication) and reported zero status
  entries and zero divergence.
- `.claude/**`, `node_modules/**`, the 207-file dirty video-art worktree and all
  other worktrees were intentionally left untouched.
- The repo-native web release gate passed all 27/27 automated required checks
  with `runtimeTreeClean:true`; the final provenance-only corrections then
  passed 13 JSON parses, 5 Python AST checks, 20/20 prompt classification and a
  fail-closed guard against authoring directly into `assets/**`.

## Safety and product boundary

- No runtime image, companion registry, unlock policy, save schema or Pixi code
  was changed by this cleanup.
- No unapproved character was made selectable.
- No history rewrite was performed, so repository clone history size is
  unchanged; this task reduces the working-copy footprint and prevents the same
  staging flood from returning.
