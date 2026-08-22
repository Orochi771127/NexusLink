# CURRENT MAIN BASELINE REPORT

Date: 2026-08-22 (Asia/Taipei)
Repository: `https://github.com/Orochi771127/NexusLink`
Decision scope: Phase 1 planning and Owner Gate evidence only; no Phase 1 production integration

## Decision

The audited checkout `feature/2d5-ro-habitat-agent-skills` is not an acceptable Phase 1 base. It is 57 commits behind current remote `main` and contains four branch-only commits, one of which is patch-equivalent to work already upstream.

The authoritative planning baseline is the fetched remote commit:

- ref: `origin/main`
- commit: `3b9624e82b6a3a050d0f99a57c3c64ea2ceca810`
- commit date: `2026-08-15T02:32:33+08:00`
- subject: `Merge pull request #215 from Orochi771127/feat/raphael-continuity-and-boundary`
- tree: `5114143231d0cdc3a4859cae013c45287f043587`

No existing local checkout was rebased, reset, cleaned, or deleted during this audit.

## Read-only fetch and divergence evidence

The remote was refreshed with:

```text
git fetch origin main
```

The audited feature checkout remained at:

```text
7a18031a28c92548eff535a69da86a5cd6b87dc0
```

The comparison `git rev-list --left-right --count origin/main...HEAD` returned:

```text
57  4
```

Meaning:

- 57 commits exist on current `origin/main` but not on the audited feature checkout;
- 4 commits exist on the audited feature checkout but not by commit identity on `origin/main`.

The common ancestor is:

```text
dc6fcf803eb33352e9730dbe583a520991621ffd
```

## Existing local-state protection

The audited checkout already contained these untracked files before any Phase 1 planning work:

```text
.cursor/debug-f1933d.log
debug-90e83c.log
debug-f1933d.log
```

They were treated as owner-owned local state. They were not opened for publication, staged, modified, deleted, or copied into the clean baseline.

## Reproducible clean snapshot

A read-only archive of `origin/main` was materialized outside the source checkout:

```text
C:\Users\User\Documents\Playground\YDIJ_Championship_R1_OwnerGate_2026-08-22\baseline\origin-main-3b9624e8
```

Archive evidence:

- archive: `baseline/origin-main-3b9624e8.tar`
- file count after extraction: 3,538
- archive SHA-256: `71022E0400986782DEFF43535AE22D565641FDA0D95A3034FD871B6EF9CACFE7`

This snapshot, not the stale feature checkout, was used to inspect current governance, architecture, protected files, and regression tests.

## Current governance found on main

Current `main` permits ES modules and bounded use of TypeScript/npm/bundlers, but does not authorize a repository-wide migration. A build step requires a separate architectural decision with GitHub Pages impact and dependency locking.

Relevant protected boundaries remain in force:

- `index.html`, `src/state/saveManager.js`, `src/state/store.js` normalization/default-state authority, `src/pixi/pixiApp.js`, `assets/**`, `tools/**`, and `scripts/**` require GROUNDWORK-level review;
- `main.js`, `style.css`, and `script.js` are locked legacy roots;
- Emotional Standoff is a non-HP emotional domain and must not be reinterpreted as Championship combat;
- the existing application bootstrap, save pipeline, root store, RaphaelCore, Emotional Standoff, and Heartcore Orbit remain outside this Phase 1 research slice.

## Current-main architecture observations

- `src/state/saveManager.js` writes canonical local state and can initiate cloud synchronization. Championship core must therefore have no import or call path to its write authority, `saveQueue`, cloud sync, or root-store mutation. The sole proposed exception is a named `loadState` import in the standalone entry adapter; the adapter immediately returns a cloned/frozen whitelist projection and never exposes `saveState` to the core.
- `src/state/store.js` exposes mutable root-state operations. A read-only Heartlake adapter must return a defensive projection, not a live store object.
- `src/ui/pageRouter.js` is a large bootstrap-owned integration surface. The first research slice should not modify it.
- `src/pixi/pixiApp.js` is bootstrap-owned. The first research slice should not replace it or create hidden production authority around it.
- existing Emotional Standoff creation and resolution paths are reachable from existing map/battle controllers and must remain untouched.

## Baseline verification

Executed against the clean `origin/main` snapshot:

```text
node docs/qa/raphael-vent-work-relationship-life-cases.mjs
```

Result: PASS, all 13 reported cases passed.

```text
node docs/qa/storage-consolidation-cases.mjs
```

Result: PASS, 22 checks, 0 failed. The logged `SyntheticStorageError` is an intentional negative-path injection; the test confirms legacy keys survive a failed canonical write and are removed only after success.

## Branch recommendation

For the later, separately authorized executable research slice, create a new isolated branch from then-current fetched `origin/main`:

```text
codex/championship-domain-r1
```

Before creating it, re-fetch `origin/main` and record its exact commit. Do not base it on `feature/2d5-ro-habitat-agent-skills`, and do not cherry-pick the four ahead commits as a group.

The Owner Gate documentation itself may be published from a separate docs-only branch, also created from current `origin/main`, after independent review.

## Gate result

`BASELINE_ACCEPTABLE_FOR_PLANNING = YES`
`OLD_FEATURE_ACCEPTABLE_FOR_PHASE1 = NO`
`PRODUCTION_INTEGRATION_AUTHORIZED = NO`
