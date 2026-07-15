# Moonlake Layered R2 QC

## Gate A — Corrected Dressed Reference

### Candidate v1 — REJECTED

- File: `concepts/raw/corrected_dressed_reference_night_v1_REJECTED.png`
- Built-in output: `941x1672`, RGB; correct portrait ratio but not the required normalized runtime-review size.
- Object count: `7/8`. It contains four tents, two beacon towers, and one crescent shrine; the required fifth far tent is missing.
- Positive: both near tents are fully visible, the crescent shrine is complete and intentionally grounded, the companion plaza and dock axis remain clear, and depth scaling is readable.
- Blocking failure: the image model repainted island shorelines, vegetation, bridge/plaza proportions, and terrain detail instead of preserving the approved foundation. Coordinates derived from this candidate would not register exactly against the runtime base.
- Decision: preserve only as rejected provenance. Do not normalize, generate props from it, promote it, or use it for runtime placement.

## Current Gate State

### Candidate v2 - ACCEPTED FOR STAGING REFERENCE

- File: `concepts/raw/corrected_dressed_reference_night_v2.png`
- Built-in output: `941x1672`, RGB. It remains a non-runtime composition reference; it will not replace either approved `1080x1920` foundation.
- Object count: `8/8` - five complete tents, two complete beacon towers and one complete crescent shrine with a deliberate pedestal.
- Placement: all structures contact visible land; depth scale decreases from the two near tents through the mid pair to the far tent and far beacon.
- Clearance: the approach bridge, companion compass/plaza, top HUD corridor and bottom navigation corridor remain free of opaque structures.
- Geometry policy: the candidate is recognizably registered to the approved foundation, but image-generation/resampling differences remain (`mean absolute channel error 8.10` at candidate resolution; `8.74%` of pixels exceed a maximum-channel difference of 32). Therefore it is accepted only as a placement/material reference. Runtime composition must always use the original approved foundation plus independent RGBA props.
- Decision: pass Gate A and proceed to separate prop generation. Do not promote this full-scene candidate into `assets/**`.

## Current Gate State

- Owner authorization: automatic stage-by-stage execution and self-review granted on 2026-07-15.
- Reference audit: v2 passed for staging reference use; v1 remains rejected provenance.
- Runtime integration: not started.

## Gate B - Separate Props, Emissive Plates And Composite QA - PASSED

- Base props: `8/8` exact `512x512` RGBA runtime candidates.
- Emissive plates: `8/8` same-size RGBA companions with localized light masks.
- Alpha integrity: transparent corners, zero canvas-edge contact and zero hidden
  RGB in fully transparent pixels for all sixteen files.
- Placement contract: eight unique slots on a hidden `12x20` grid; every slot
  includes depth, layer, surface, clearance, footprint and day/night policy.
- Responsive contract: all placement coordinates remain in `1080x1920`
  art-space and must share the background cover transform at runtime.
- Preview evidence: day, night-emissive, day-mist and night-rain composites pass
  at `1080x1920`; no prop blocks the companion plaza, bridge or UI corridors.
- Scope: staging art is approved for GROUNDWORK promotion. The original day
  foundation remains authoritative; the generated dressed reference is never a
  runtime plate.

## Gate C - Runtime Integration And Mobile QA - PASSED

- The active Moonlake path uses the original day foundation as one geometry
  master; its baked night image and both old camp structure plates are neither
  preloaded nor requested.
- Eight independent props share the exact background cover transform at
  `390x844` and `390x664`. Their phase tint, directional ellipse shadow,
  emissive plate and local light update without geometry or anchor changes.
- Shared habitat lighting provides day/dawn/dusk/night ambient and moving key
  light. Weather adds bounded far/mid fog, rain, wetness and water ripples while
  honoring quality and reduced-motion policies.
- Formal URLs create no placement grid. The grid exists only with
  `devSceneEditor=1&showPlacementGrid=1`; dev JSON export/import round-trip
  passed for all eight slot objects.
- Five browser cases passed with zero console/page errors. The six other region
  IDs switched successfully with Moonlake objects hidden, then returned to
  Moonlake with the object pack restored and registered.
- Visual review confirmed a complete crescent shrine, grounded near/mid/far
  props, a clear bridge/plaza/companion area, no HUD/Soul Talk/navigation
  obstruction, and no short-screen clipping.
