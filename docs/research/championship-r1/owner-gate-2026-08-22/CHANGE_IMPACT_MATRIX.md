# CHANGE IMPACT MATRIX

Status: proposed Phase 1 R1 impact; implementation not started

## Executive result

The standalone, default-off research slice can be implemented with new files only. It requires zero modification of existing protected GROUNDWORK files and zero modification of existing player behavior.

## New-file impact authorized by the limited GROUNDWORK gate

| Proposed area | Change | Runtime authority | Risk controls |
|---|---|---|---|
| `src/championship/**` | New bounded-domain ES modules | Research session only | No save/root setters/cross-domain imports; deterministic reducer |
| `src/data/championship/**` | New schemas, project-native catalogs, fixtures | Catalog validation only | Evidence-status firewall; IP scanner; stable namespaced IDs |
| `research/championship-r1/**` | New standalone, default-off research page | Presentation and research-host lifecycle | Query flag; visible research warning; no production nav/bootstrap change |
| `docs/design/CHAMPIONSHIP_*` | New architecture/evidence/presentation docs | None | Canon review |
| `docs/qa/championship-*` | New tests/browser gate/manual matrix | None | Independent reviewer, exact SHA |

## Existing files read or imported but not modified

| Existing file | R1 use | Modification count | Boundary |
|---|---|---:|---|
| `src/state/saveManager.js` | Standalone entry may inject named `loadState` into the profile adapter | 0 | `saveState` import/call forbidden; projection immediately clones/freezes whitelist |
| `src/state/store.js` | Indirect normalization through `loadState`; possible future host snapshot source | 0 | No setter/subscription/live reference is passed to core |
| `src/pixi/pixiApp.js` | Standalone page may call the existing factory for that page's only app | 0 | No replacement; presentation only; DOM fallback required |

## Existing files explicitly unchanged in R1

```text
index.html
src/app.js
src/ui/pageRouter.js
src/state/saveManager.js
src/state/saveQueue.js
src/state/store.js
src/state/defaultState.js
src/pixi/pixiApp.js
src/engine/battleEngine.js
src/ui/battleController.js
src/ui/orbitBattleController.js
src/ui/orbitDuelController.js
src/ai/**
assets/**
tools/**
scripts/**
main.js
style.css
script.js
```

`tools/**` is unchanged by the executable slice. Reverse tools, if later approved for public publication, belong to a separate reviewed workpack and must not output or commit protected payloads by default.

## Domain impact

| Domain/state | Read? | Write? | Behavioral change? |
|---|---:|---:|---:|
| Heartlake/player identity projection | Whitelisted read | No | No |
| Emotional Standoff | No | No | No |
| Heartcore Orbit | No | No | No |
| RaphaelCore/memory/safety | No | No | No |
| root store | Indirect normalized snapshot only | No | No |
| saveManager/saveQueue/cloud | `loadState` only at standalone boundary | No | No |
| production wallet/inventory/collection | No | No | No |
| Championship research state | Yes | Memory-only | New default-off research behavior only |

## Persistence and privacy impact

- No new storage key, IndexedDB database, cookie, service-worker cache authority, save schema, or migration.
- No local/session storage write, network write, cloud sync, beacon, or XHR from the slice.
- Existing normalized/raw save must be byte/digest identical before and after a complete flow.
- Research data is discarded on reload/close.
- Private forensic artifacts remain outside the repository and deployment.

## IP impact

- Shipped content is project-native.
- No original sprite, animation, music, UI, map art, logo, raw table dump, ROM slice, or bulk decoded text.
- Structural facts may be represented through finding IDs, hashes, counts, addresses, schemas, and original project-native mechanics.
- A publication scanner and manual manifest review are required.

## Build and deployment impact

- Browser-native ES modules; no whole-repo TypeScript migration.
- No new dependency, package manager, lockfile, bundler, or framework.
- No production `index.html` or Pages workflow modification.
- The canonical standalone URL is repository-relative: `research/championship-r1/index.html?championshipResearch=r1`. A leading `/research/...` URL is forbidden because project Pages is deployed below `/NexusLink/`.
- The page must be browser-tested from a local `/NexusLink/` subpath and the generated Pages artifact/preview. HTML, entry module, CSS, JSON catalogs, and every dynamic import must return 200 with correct MIME.
- With the flag absent, the entry checks the flag before conditional imports: disabled notice visible, runtime/profile/Pixi module requests zero, `loadState` calls zero, canvases zero.
- Any future build pipeline requires a separate ADR with GitHub Pages impact.

## Performance and accessibility impact

- Core commands are deterministic and event-driven, not frame-driven.
- Presentation targets 60 FPS/16.7 ms but this is a future measured gate, not a current claim.
- Responsive, safe-area, keyboard, gamepad, screen-reader, 200% zoom, reduced-motion, and DOM fallback testing are mandatory.
- Renderer lifecycle must release tickers/listeners/observers on dispose.

## Future production integration — separate GROUNDWORK only

If a later Owner Gate authorizes a production launcher/embedded experience, the smallest likely existing-file set is:

```text
index.html
src/app.js
styles.css
```

Potential purposes:

- launcher/host DOM;
- lazy runtime factory and lifecycle disposal;
- read-only profile injection and existing Pixi layer injection;
- strictly scoped `.championship-*` production styles.

That future gate still does not automatically authorize changes to:

```text
saveManager.js
saveQueue.js
store.js
defaultState.js
pixiApp.js
Emotional Standoff
Heartcore Orbit
RaphaelCore
```

Production persistence would require its own save-governance, migration, rollback, privacy, and cloud-sync review.

## Current package impact

This Owner Gate package itself is documentation-only. Publishing it should add the gate documents and one append-only AI execution ledger entry. It must not publish the private baseline archive, ROM, reverse binaries, downloaded handbook/ledger/handoff pack, or any generated forensic payload.

`EXISTING_PROTECTED_FILES_REQUIRED_FOR_R1_MODIFICATION = 0`
`PLAYER_BEHAVIOR_CHANGED_BY_THIS_PACKAGE = NO`
`PRODUCTION_INTEGRATION_AUTHORIZED = NO`
