# NEXUS ASSET COMPOSITION — CODEX TASK PACK V1

Status: DEFERRED / READY FOR FUTURE CODEX AUDIT
Implementation authorization: NOT GRANTED by this document
Dependency: `docs/architecture/NEXUS_ASSET_COMPOSITION_SYSTEM_V1.md`

## Objective

When Codex capacity is available, perform a current-repo audit and design the smallest safe migration that gives Nexus Link a non-duplicative, composition-first asset pipeline while preserving current Web behavior.

Do not begin by writing a new rendering engine.

## Phase 0 — Read-only audit

Read current `main`, not remembered state.

Required governance/context:

- `NEXUS_LINK_MASTER_CANON_v3.1.md`
- `CLAUDE.md`
- `ACCEPTANCE.md`
- multi-runtime constitution
- current runtime map
- save schema / save governance
- Moonlake / Living Yard implementation
- current PixiJS / Three.js asset loaders
- companion animation definitions
- world autonomy / companion behavior state machine
- current release gate and payload checks

Confirm:

1. canonical runtime is still Web;
2. Unity remains non-production unless Owner has explicitly changed governance;
3. current First Session Flow priorities;
4. current asset directories and generated/runtime/master distinctions;
5. current animation architecture;
6. current atlas usage;
7. current payload/bundle measurements;
8. current duplicate/near-duplicate rate;
9. current lazy-load behavior;
10. whether any equivalent composition layer already exists.

If equivalent infrastructure already exists, extend it. Do not create a competing system.

## Required audit output

Produce:

### A. Existing system map

```text
source/master asset
 -> processing
 -> runtime asset
 -> loader
 -> renderer
 -> gameplay semantic state
```

### B. Asset inventory

For each major class:

- companion sprites
- companion animation metadata
- habitat backgrounds
- habitat props
- VFX
- UI
- audio

report:

```text
file count
encoded size
largest files
likely duplicate count
transparent-space waste
initial-session usage
lazy-loaded usage
```

### C. Architecture overlap

Classify proposed components as:

```text
REUSE
EXTEND
CREATE
REJECT_DUPLICATE
DEFER
```

### D. First-session payload baseline

Measure the actual current first-session network/runtime payload. Do not use estimates as evidence.

## Phase 1 proposal — semantic AnimationSet pilot

Do not implement until audit is reviewed.

Select exactly one currently canonical companion.

Goal:

- preserve visible behavior;
- replace raw frame-name coupling with semantic animation action mapping where needed;
- prove that an action may reuse canonical primitives without duplicate files;
- maintain world-autonomy ownership of behavior selection.

Candidate semantic actions:

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

Required fallback contract:

If a species lacks a requested clip, the system must degrade to an explicit fallback rather than crash or silently bind to an unrelated frame.

## Phase 2 proposal — reporting-only duplicate guard

First version must be non-destructive.

Detect/report:

```text
byte-identical assets
trimmed-pixel-identical assets
optional perceptual-near-duplicates
wasted transparent bounds
left/right mirror candidates
```

Do not auto-delete or rewrite assets.

Every warning must identify:

```text
candidate canonical asset
candidate duplicate asset
hash/evidence
encoded-size opportunity
risk notes
```

## Phase 3 proposal — asset budget evidence

Compare current real data against architecture targets in `NEXUS_ASSET_COMPOSITION_SYSTEM_V1.md`.

Do not fail CI based on provisional budget numbers until Owner approves enforcement thresholds.

First stage should produce a report only.

## Phase 4 proposal — First Link composition pilot

Only after the core pilot is proven.

For one encounter only, design a presentation composition such as:

```text
companion semantic pose
+ transform track
+ resonance VFX
+ shader/tint
+ timing
```

Do not introduce Capture ownership semantics.
Do not create TRAIN XP.
Do not modify Growth/evolution evidence rules.

## Phase 5 proposal — Moonlake modular composition pilot

Do not build a second habitat.

Use one small existing Living Yard/Moonlake slice and evaluate whether repeated environment visual content can become reusable primitives plus placement/lighting/VFX data without reducing visual quality.

Required before/after evidence:

```text
visual comparison
file count
runtime bytes
load time
memory use
mobile 390x844 behavior
occlusion correctness
interaction correctness
```

## Technical constraints

- No new React/Vue/Svelte runtime.
- No Unity production dependency.
- No NDS binary-format runtime dependency.
- No copied Digimon assets.
- No gameplay logic based on raw animation frame indexes.
- No unapproved save schema evolution.
- No large-scale file deletion in the same work package as the first duplicate audit.
- No changes to RaphaelCore safety/relationship contracts as part of asset optimization.

## Tests / gates

Any implementation phase must include:

- syntax/unit tests relevant to touched modules;
- current release-gate-equivalent coverage;
- browser/runtime smoke test;
- 390x844 mobile verification;
- visual behavior comparison for pilot companion;
- payload measurement before/after;
- console errors = 0 in the tested flow;
- rollback path.

Do not claim success from test counts alone. Verify that tests execute the migrated runtime path.

## Git discipline

When implementation is eventually authorized:

1. fresh branch from current `main`;
2. small scoped commits;
3. no unrelated asset cleanup;
4. protected PR/checks where current governance requires them;
5. post-main verification;
6. update Codebase MCP / ADR / execution ledger after final indexing;
7. append/supersede historical records; do not rewrite old evidence.

## Required final report from future Codex run

1. Current architecture baseline
2. Existing equivalent systems found
3. Duplicate/payload evidence
4. Proposed minimal architecture delta
5. Files to REUSE / EXTEND / CREATE / DO NOT TOUCH
6. Pilot companion selection and rationale
7. Save impact
8. First Session impact
9. Test plan
10. Payload budget plan
11. Risks / rollback
12. Exact implementation phases
13. Owner decisions required

Stop at Owner Gate after the read-only audit and proposal unless explicit implementation approval is present in the current session.
