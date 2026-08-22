# GROUNDWORK MODIFICATION LIST

Status: exact file-level declaration for the next Owner Gate

## R1 executable research slice

Existing protected files requiring modification:

```text
NONE
```

The proposed standalone/default-off architecture can be implemented entirely through new files listed in `PROPOSED_PHASE1_FILE_TREE.md`.

## Existing files that may be read/imported but remain byte-for-byte unchanged

```text
src/state/saveManager.js
  allowed named import: loadState only, at the standalone profile adapter boundary
  forbidden: saveState

src/state/store.js
  indirect normalization/read only
  forbidden: setState, updateState, replaceState, live subscription/reference in Championship core

src/pixi/pixiApp.js
  existing createPixiApp factory may host the standalone page's only Pixi app
  forbidden: replacement, authority change, renderer-owned simulation
```

## Existing files explicitly outside R1 modification scope

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

## New paths covered by the approved limited GROUNDWORK

```text
src/championship/**
src/data/championship/**
research/championship-r1/**
docs/design/CHAMPIONSHIP_*.md
docs/qa/championship-r1-*
docs/qa/_run_championship-r1-browser-gate.py
```

These are permissions to propose/implement the bounded research slice after the next Owner Gate, not permission to add persistence or production integration.

## Reverse tooling

Gate 4 permits reverse-engineering tooling, but the executable R1 tree does not require a `tools/**` change. If a later workpack proposes public reverse tools, list every new `tools/reverse/ydij/**` file and obtain the protected-directory review before adding it. The tool must default to user-supplied private input and must not commit/output protected payload into the public tree.

## Future production integration — not approved

The smallest likely existing-file request for a later embedded launcher is:

```text
index.html
src/app.js
styles.css
```

That future request must specify exact launcher DOM, lazy factory/lifecycle wiring, existing Pixi host injection, read-only profile projection, scoped CSS, Pages behavior, and rollback.

Even then, the following remain separately gated and are not implied:

```text
src/state/saveManager.js
src/state/saveQueue.js
src/state/store.js
src/state/defaultState.js
src/pixi/pixiApp.js
Emotional Standoff files
Heartcore Orbit files
RaphaelCore / src/ai/**
```

Any production persistence proposal must be a new Owner Gate with schema versioning, migration, rollback, quota/failure recovery, privacy/cloud-sync impact, and negative tests.

## Owner Gate constants

```text
R1_EXISTING_GROUNDWORK_MODIFICATION_COUNT = 0
R1_NEW_BOUNDED_PATHS_ONLY = YES
PRODUCTION_BOOTSTRAP_CHANGE = NO
PLAYER_SAVE_CHANGE = NO
STANDOFF_ORBIT_RAPHAEL_CHANGE = NO
```
