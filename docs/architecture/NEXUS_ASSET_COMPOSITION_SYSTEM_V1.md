# Nexus Asset Composition System V1

Status: PROPOSED / DESIGN-ONLY
Owner approval: architecture direction approved in principle; runtime implementation deferred
Canonical runtime: Web (PixiJS + Moonlake Three.js)
Source branch: `docs/nexus-asset-composition-system-v1`

## 0. Purpose

This document defines an asset-composition architecture for Nexus Link inspired by efficient Nintendo DS-era 2D production patterns, especially the separation of raw image data, composition data, animation timing, palette/effect state, and reusable scene tiles.

The goal is **not** to reproduce Nintendo DS binary formats or import copyrighted Digimon assets. The goal is to preserve the engineering principle:

> Store expensive visual primitives once; generate many runtime states by composition, animation recipes, transforms, shaders, palettes/tints, and shared VFX.

This architecture must remain subordinate to `NEXUS_LINK_MASTER_CANON_v3.1.md`, `CLAUDE.md`, the First Session Flow, save governance, and all companion autonomy/boundary contracts.

## 1. Non-goals / hard prohibitions

Do not:

- import Digimon sprites, maps, UI, names, sound, or original game binary assets into production;
- implement NCGR / NCLR / NCER / NANR as a production runtime dependency;
- create a parallel Unity product;
- create `NewHabitatGame`, `AnimationV2`, or another duplicate source of truth;
- replace existing Moonlake/Living Yard production paths unless a migration plan explicitly proves compatibility;
- add TRAIN XP, capture ownership, forced companion obedience, or any progression system that conflicts with Growth evidence/readiness;
- allow gameplay code to depend directly on raw sprite-frame indices;
- store duplicate pixel-identical runtime assets under different semantic names when reuse is possible.

## 2. Canonical Web translation of the DS composition idea

| DS-era concept | Nexus Link Web equivalent |
|---|---|
| Raw character graphics | trimmed WebP/AVIF/PNG atlas regions |
| Palette | tint/shader/material profile |
| Cell/OAM composition | frame/part/pivot/anchor definition |
| Animation bank | semantic `AnimationSet` clip |
| OAM flip/position | Pixi transform / sprite transform |
| Tile map | modular habitat/world-kit placement data |
| Separate effect assets | shared VFX layers |

The runtime should use modern Web-native asset formats and existing PixiJS/Three.js paths. The transfer is architectural, not binary-format compatibility.

## 3. Core invariant: Primitive != State

A semantic state must not automatically create a new image file.

Example:

```text
idle
care_listening
first_link_alert
hurt
```

may reuse one or more existing poses while adding different timing, transform, tint, or VFX.

The runtime model should be:

```text
Visual Primitive
  + Animation Recipe
  + Transform
  + VFX / Shader
  + Runtime State
  = Presented Action
```

A new full pose is justified only when silhouette/gesture materially changes.

## 4. Proposed high-level data model

### 4.1 VisualPrimitive

Represents one canonical expensive visual unit.

Suggested fields:

```text
id
assetRef
trimBounds
nativeSize
pivot
anchor
mirrorPolicy
contentHash
visualHash
sourceClass
runtimeClass
```

No gameplay semantics should be encoded in the image filename alone.

### 4.2 AnimationClipDefinition

A semantic clip references primitives instead of owning duplicate images.

Suggested fields:

```text
id
semanticAction
frames[]
loopMode
frameDurations[]
transformTrack?
tintTrack?
vfxTrack?
interruptPolicy
fallbackAction
```

### 4.3 CompanionAnimationSet

Species/companion-specific mapping from semantic actions to clips.

Suggested families:

```text
locomotion
life
interaction
firstLink
optionalCombat
optionalTraining
optionalStatus
```

Gameplay code requests `walk`, `sleep`, `link_resist`, etc. It must not request `frame_07.png`.

### 4.4 SharedVfxDefinition

Shared presentation assets should be reusable across companions:

```text
resonanceLine
resonanceCircle
linkBreak
linkStable
emotionRipple
statusFlash
shadowBlob
footstepDust
```

Per-companion variation should primarily use scale, offset, timing, color profile, and intensity.

### 4.5 HabitatKitDefinition

Habitat scenes should compose reusable props rather than flatten every variant into a new giant background.

Suggested fields:

```text
kitId
biome
baseLayerRefs
propRefs
foregroundRefs
lightingProfiles
weatherProfiles
placementRules
occlusionRules
interactionSockets
```

Day/night/rain/sunset should prefer shared geometry/textures plus lighting/shader/VFX changes over duplicate full-scene bitmaps.

## 5. Animation production contract

### 5.1 Tier A — Living Core

Highest-value companion animation set. Prioritize quality here.

Recommended semantic actions:

```text
idle
blink
walk
run
alert
sleep
eat
happy
angry
rest
approach
flee
```

### 5.2 Tier B — First Link

Recommended actions:

```text
link_alert
link_tension_low
link_tension_high
link_resist
link_break
link_accept
```

These may reuse locomotion/life primitives where appropriate, but dedicated poses are allowed when the body language meaningfully changes.

### 5.3 Tier C — Signature

Per-species signature actions. Usually 1–3 clips that communicate unique identity.

### 5.4 Tier D — Optional mode packs

Only load/build if the gameplay actually needs them:

```text
combat
training/practice
special status
chapter-specific presentation
```

Do not require all companions to ship all optional packs.

## 6. Asset budget targets

These are architecture targets, not immutable product law. Measure actual repo/runtime data before enforcing.

Per production companion target:

```text
Living Core        <= 2.5 MB
First Link         <= 1.0 MB
Signature          <= 1.0 MB
Optional Modes     <= 2.0 MB
Typical total      <= 6.0 MB
Review threshold   > 6.0 MB
Hard review        > 8.0 MB
```

First-session critical payload target:

```text
Target             <= 35 MB
Warning            > 50 MB
Release review     > 75 MB
```

The critical rule is not total installed size; it is avoiding loading every companion/region/mode on first launch.

## 7. Lazy-load / streaming policy

The first session should only require the app shell, current scene, current companion, and required UI/audio.

Suggested load flow:

```text
Boot
 -> Moonlake/Living Yard core
 -> active companion Living Core

Enter Wild Zone
 -> region encounter pack
 -> encountered companion First Link pack

First Link established
 -> linked companion Living Core

Enter optional mode
 -> mode-specific pack
```

No release gate should require loading all companion assets merely to boot the first session.

## 8. Duplicate Guard

A future build-time guard should detect redundant runtime assets.

Recommended checks:

```text
cryptographic content hash
trimmed-pixel hash
optional perceptual hash
alpha bounds
encoded byte size
atlas membership
```

If two runtime files are pixel-identical, the build should report a duplicate candidate and prefer a canonical primitive reference.

Important: perceptual similarity should warn, not auto-delete; visually similar but semantically intentional poses may be valid.

## 9. Atlas / trim policy

Runtime export should:

- trim transparent whitespace where safe;
- preserve canonical pivot/anchor metadata separately;
- pack compatible small sprites into atlases;
- avoid duplicating left/right art when mirror-safe;
- prefer Web-friendly compressed formats where the rendering path supports them;
- preserve lossless formats for assets where compression artifacts damage silhouette/UI readability.

Master art remains separate from runtime delivery art.

## 10. Mirror policy

A visual primitive may declare:

```text
mirror-safe
mirror-forbidden
mirror-with-adjustment
```

Do not mirror asymmetrical symbols, text, faction markings, one-sided accessories, or deliberately directional designs without review.

## 11. Habitat composition policy

Do not represent every habitat state as a separate full background when modular composition can preserve quality.

Prefer:

```text
shared ground / prop / foliage primitives
+ placement data
+ lighting profile
+ weather VFX
+ foreground occlusion
+ interactive sockets
```

The current Moonlake/Living Yard remains the canonical production path. This system must adapt to it; it must not create Habitat V2 beside it.

## 12. First Link presentation rule

The efficient composition lesson can be used without copying capture/ownership semantics.

First Link may combine:

```text
base companion pose
+ link-specific key pose where needed
+ resonance line/circle
+ body transform
+ alert/tension shader
+ particles
+ timing
```

Success means a link is established, not that a companion becomes owned property.

## 13. Runtime architecture principles

1. Semantic action names are the public gameplay contract.
2. Asset frame indices are implementation detail.
3. Companion-specific animation data is declarative where possible.
4. World autonomy/state machines select semantic behavior; they do not own asset files.
5. PixiJS/Three.js rendering remains downstream of gameplay truth.
6. LLM/RaphaelCore must not decide deterministic asset loading, spawn truth, Growth, or First Link success.
7. Existing save schema must not be modified in this design phase.

## 14. Migration strategy

Do not big-bang migrate all assets.

Recommended sequence:

### Phase A — Audit only
Inventory current assets, duplicate rates, atlas use, animation data, Living Yard/Moonlake composition, load paths, and initial payload.

### Phase B — One companion pilot
Choose one currently canonical companion and express its existing animations through a semantic `AnimationSet` without changing visible behavior.

### Phase C — Duplicate guard
Add reporting-only duplicate detection. No automatic deletion.

### Phase D — First Link pilot
Reuse the composition system for one future First Link encounter.

### Phase E — Habitat modular pilot
Apply the same primitive/composition model to one controlled Moonlake slice.

Only after each phase has visual parity and regression evidence may the next migration expand.

## 15. Acceptance criteria for an implementation proposal

Before production code begins, Codex/Cursor must prove:

- canonical Web runtime identified correctly;
- no Unity production dependency introduced;
- no duplicate parallel animation system created;
- existing Moonlake/Living Yard paths are reused or explicitly migrated;
- all proposed semantic action IDs have fallback behavior;
- current companion behavior remains visually equivalent in pilot scope;
- runtime payload before/after is measured;
- duplicate detection produces evidence, not destructive mutation;
- First Session Flow is not delayed or broken;
- no save-schema change occurs without a separate Groundwork Task Pack;
- no Digimon copyrighted production asset enters the repo.

## 16. Deferred decisions

The following are intentionally not decided here:

- exact atlas library/tooling;
- AVIF vs WebP per asset class;
- final content-hash storage location;
- whether the duplicate guard belongs in release gate or a separate asset CI job;
- exact First Link asset contract;
- exact habitat-kit schema;
- migration of existing character assets.

These require a current-repo audit before implementation.

## 17. Owner intent captured

Owner intent is to adopt the same **non-duplicative composition philosophy** observed in efficient DS-era asset pipelines: avoid regenerating or storing identical visual content when the runtime can reference, transform, compose, or reuse a canonical primitive.

This intent does not authorize copying original Digimon assets or bypassing current Nexus Link governance.
