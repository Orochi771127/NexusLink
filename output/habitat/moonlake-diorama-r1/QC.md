# Moonlake Diorama R1 QC

Status: `PROMOTED RUNTIME FOUNDATION / ARCHIVAL PROVENANCE SUBSET`

This directory now retains only small prompts, a manifest and the stateful-object
plan. Large generated candidate rasters and stale historical runners/reports
were local staging and are intentionally excluded from Git. The reviewed
runtime files live under `assets/backgrounds/MoonlakeDiorama_r1/`,
`assets/layers/MoonlakeDiorama_r1/` and `assets/props/MoonlakeDiorama_r1/`.

## Current runtime truth

- Human approval and reference audit are complete.
- `src/data/sceneProfiles/moonlakeProfile.js` uses the R1 day foundation as the
  active geometry master with dynamic day/dusk/night relighting.
- The baked R1 night foundation and old camp-structure plates remain available
  only as fallback or rollback material.
- `src/data/sceneProfiles/moonlakeObjectPack.js` owns the live eight-object R2
  base-plus-emissive overlay; the old baked camp plates are not loaded.
- Runtime QA passed at `390x844` and `390x664`; current release gates remain the
  authority rather than a copied historical browser snapshot.

## Historical candidate review

- Initial A/B/C candidates were rejected because they did not preserve the
  canonical Moonlake geography.
- A2/B2/C2 corrected the geography and established the visual direction used by
  the promoted foundation work.
- B2 provided the clearest mobile interaction stage; C2 provided the strongest
  depth and atmosphere reference. The production result combined those useful
  qualities without promoting any full-scene candidate directly.
- The sky/mountain/lake/shore micro-plate prompts listed as
  `rejectedExperiments` in the manifest are retained only to document a failed
  shoreline-seam direction. They are not candidates for runtime connection.

## Retention boundary

- Keep: prompts, manifest and the stateful-object plan.
- Exclude from Git: raw generations, rejected candidates, normalized review
  copies, contact sheets and duplicate runtime rasters.
- Runtime assets may only be changed through a separately reviewed GROUNDWORK
  promotion; this provenance package does not alter runtime bytes.
