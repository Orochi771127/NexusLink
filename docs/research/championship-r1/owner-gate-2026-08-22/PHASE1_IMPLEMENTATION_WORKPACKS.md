# PHASE 1 IMPLEMENTATION WORKPACKS

Status: prepared only; implementation has not started
Proposed branch after next Owner Gate: `codex/championship-domain-r1` from freshly fetched `origin/main`

## Shared rules

- The Lead Integrator alone owns `src/championship/index.js`, shared contracts, shared evidence policy, canonical manifests, and the adoption ledger.
- Agents work in non-overlapping directories and do not repair reviewer findings in the review lane.
- R1 uses ES modules and the current static deployment; no new framework, backend, database, LLM, npm dependency, or bundler.
- R1 is standalone, default-off, memory-only, deterministic, project-native, and nonpersistent.
- Production integration and player-state writes remain unauthorized.

## Agent D — Canonical Data Schemas

### Owns

- JSON-schema proposals for entities, actions, gates, cages, shops, matches, teams, presets, research state, and events;
- project-native minimal R1 catalogs and fixtures;
- D-owned catalog/record validators and a synthetic scale-test generator;
- cross-reference and evidence-status checks.

### Does not own

- shared contract adoption;
- runtime formulas or reducers;
- private ROM payload publication;
- product names/assets copied from the reference game;
- evidence promotion.

### Handoff contract

Agent D proposes `ChampionshipCatalogBundleV1`. The Lead adopts and freezes the shared version. Agent E consumes it but cannot alter canonical schemas or data.

### Exact implementation ownership

```text
src/data/championship/validation/validateChampionshipCatalog.js
src/data/championship/validation/validateChampionshipRecord.js
src/data/championship/testing/createSyntheticScaleCatalog.js
```

The generator is test-support code and must not emit synthetic rows into canonical catalog paths. The Lead owns shared contract adoption; E may call D's validator through the catalog adapter but cannot edit D's validation files.

### Acceptance

- minimal fixture: 3 creatures, 1 gate/field, limited items, 1 arena, 2–3 actions;
- synthetic capacity fixtures validate 224/596/16/40/118/62/152/456;
- no duplicate IDs or broken references;
- array indexes are never permanent IDs;
- unknown/high-confidence fields cannot become active original-parity rules;
- public fixtures contain no protected reference-game payload.

## Agent E — Championship Core Architecture

### Owns

- deterministic command/event state machine;
- immutable memory-only research store;
- one injected seeded RNG port and injected clock;
- read-only Heartlake projection adapter;
- Gate, Hunt, Encounter, Capture, Collection, Shop, Arena, Battle, and Result pure transitions;
- invariants, selectors, transaction rollback, lifecycle/disposal.

### Public factory

```text
createChampionshipResearchRuntime({
  profilePort,
  catalogPort,
  clockPort,
  seed,
  presentationPort
})
```

It returns only:

```text
dispatch(command)
getSnapshot()
subscribe(listener)
dispose()
```

It never exposes root setters, save methods, relationship/memory writers, or Raphael intents.

### State machine

```text
HEARTLAKE_PROFILE
 -> GATE_SELECT
 -> HUNT_FIELD
 -> WILD_ENCOUNTER
 -> CAPTURE
 -> COLLECTION
 -> SHOP
 -> ARENA
 -> BATTLE
 -> BATTLE_RESULT
 -> COMPLETE
```

Commands carry `commandId`, `type`, `expectedRevision`, and payload. Validation, reduction, invariant checking, and publication are atomic. Rejection leaves snapshot, revision, and event log unchanged.

### Non-parity research rules

Until reverse evidence closes the relevant behavior:

- capture uses one deterministic project-native registration transaction;
- battle uses project-native fixed magnitudes, fixed success, no critical/status/resistance/TP, fixed alternating order, and an explicit research opponent policy;
- no rank, badge, production reward, or progression writer exists;
- every such rule is `NEXUS_ADAPTATION / RESEARCH_NON_PARITY`.

### Acceptance

- replay equality for identical catalog digests/seed/clock/commands;
- no `Math.random()` or implicit wall clock in reducers;
- frozen input is never mutated;
- full rollback on capture/shop/battle rejection or synthetic reducer fault;
- research collection entries never claim player ownership or relationship authority;
- disposal releases listeners and discards the session;
- no forbidden import/call edge.

## Agent F — Web Presentation Architecture

### Owns

- isolated `/research/championship-r1/` page;
- default-off query flag `?championshipResearch=r1`;
- DOM screen stack, controller, view model, focus/input adapters;
- optional presentation-only Pixi layer using the existing pinned runtime;
- responsive, accessible, reduced-motion, and DOM fallback behavior.

### Screen stack

```text
Heartlake
Gate
Hunt
Encounter
CaptureConfirm overlay
Collection
Shop
ShopConfirm overlay
Arena
Battle
BattleResult
```

Only the top screen receives input. Overlays make the background inert, trap focus, and restore focus when closed. Escape closes only the top overlay and cannot skip an atomic transaction.

### Presentation authority

```text
UI intent
 -> dispatch(command)
 -> reducer publishes snapshot/events
 -> selector creates view model
 -> DOM/Pixi presentation
```

The renderer/ticker never resolves a turn, advances RNG, purchases, captures, or creates results. Important controls and state are always present in semantic DOM; canvas may be `aria-hidden`.

### Acceptance

- 320 CSS px minimum layout, safe-area padding, 44 x 44 CSS px primary targets;
- keyboard-only, touch, and gamepad semantic-input paths;
- initial focus, focus trap/restoration, visible focus, 200% zoom;
- reduced motion changes presentation only, never event logs/outcomes;
- DOM fallback completes the full flow if Pixi is unavailable;
- mount/dispose cycles return canvas, ticker, listener, and observer counts to baseline;
- no copied YDIJ UI, art, logos, audio, text, or map assets.

## Agent G — Independent QA / Canon Auditor

### Authority

Read-only. Agent G cannot change implementation, fixtures, schemas, expectations, ledgers, or its own findings.

### Review protocol

1. Use a clean worktree and verify top-level path, exact base/candidate SHAs, branch, remote, and status.
2. Review the exact candidate commit, not an implementer's working-tree description.
3. Run core, transaction, evidence, scale, boundary, browser, accessibility, and existing-domain regressions.
4. Record OS/runtime/browser versions, seed, viewport, reduced-motion mode, storage before/after digest, exact commands, and timestamps.
5. Each finding includes severity, exact file/line, violated contract, reproduction, expected/actual, and artifact path.
6. After Lead/implementer repairs, re-run from a fresh candidate. Do not accept a textual claim.

Publication gate:

```text
P0 = 0
P1 = 0
P2 = 0, unless the Owner explicitly accepts a named P2
```

Automated screenshots do not replace the owner/human 390 x 844 and desktop feel check. Local PASS does not prove pushed, merged, deployed, or public-ready.

## Required QA groups

### Core and transactions

- deterministic replay and different-seed invariants;
- stale revision, invalid phase, duplicate command ID;
- capture capacity/missing encounter/duplicate/fault rollback;
- shop balance/SKU/stock/duplicate/fault rollback;
- research ownership and relationship authority remain false/none.

### Evidence and schema

- active unknowns rejected;
- parity claims require accepted evidence;
- synthetic full-capacity catalogs validate without becoming canonical content;
- public-catalog IP scanner finds no protected payload;
- original 596-row structure is not misrepresented as 596 decoded effects.

### No-write boundary

- static deny list for save, queue, cloud, root setters, Standoff, Orbit, RaphaelCore, storage/network writes;
- browser flow with storage/network write methods instrumented to throw/record;
- existing save raw bytes and digest unchanged before/after;
- Standoff/Orbit/Raphael invocation and state-diff counts remain zero.

Profile projection contract:

- recursive key set equals the exact allowlist; forbidden-key fuzz includes bond, trust, mood, energy, memory, chat history, Growth, battle record, safe-harbor, wallet, inventory, chapter, Standoff, Orbit, and Raphael fields;
- no forbidden key appears in the projection, research snapshot, command/result, or event log;
- source mutation after projection cannot change the projection or digest;
- every projection object/array is recursively frozen;
- functions, setters, callbacks, proxies that expose mutation, and cyclic references are rejected.

Result-envelope contract:

- every accepted, rejected, intermediate, terminal, replayed, and serialized result has `committable === false` and `playerStatePatch === null`;
- patch-like root keys, save/cloud commands, relationship/Growth deltas, and production reward writers are schema-invalid;
- the same invariant survives replay and JSON round-trip.

Pixi/static authority contract:

- `src/championship/**` contains zero `new PIXI.Application`, habitat/world/scene authority imports, storage/save/root setters, or simulation dispatch from a ticker callback;
- flag-on runtime has exactly one canvas when Pixi succeeds;
- Pixi failure has zero canvas and the full DOM flow remains playable;
- mount/dispose 20 times returns ticker/listener/observer/canvas counts to baseline;
- 30/60/120 Hz and a paused ticker produce an identical core event digest.

### Presentation

Test 320x568, 390x844, 390x664, 844x390, 768x1024, 1366x768, and 1920x1080; keyboard/touch/gamepad; 200% zoom; length-stress localization; reduced motion; Pixi failure/context loss; zero console errors/unhandled rejections. At 320x568 specifically assert no horizontal overflow, visible/reachable primary action, 44x44 targets, safe-area clearance, and a completable 200%-zoom path.

Project-Pages deployment gate:

1. Serve a preview under the `/NexusLink/` subpath, not only at localhost root.
2. Open the repository-relative `research/championship-r1/index.html?championshipResearch=r1` URL.
3. Require HTTP 200 and correct MIME for HTML, `entry.js`, CSS, JSON catalogs, and every dynamic import.
4. With the flag absent, require the disabled notice, zero core/catalog/presenter module requests, zero Pixi canvas/app, and no `loadState` import/call.
5. With the flag present, complete the flow, require exactly one Pixi canvas when available, and verify reload starts a fresh research session.
6. Repeat against the generated Pages artifact/preview URL before merge; post-merge public deployment remains a separate verified status.

### Existing-domain regression

At minimum, re-run the then-current Standoff, Orbit, storage/migration, live playtest, and web release gates. Commands must be confirmed from the candidate checkout rather than copied from an older report.

## Lead Integrator sequence

1. Adopt/freeze shared contracts and evidence policy.
2. Accept D's schemas and minimal project-native catalogs.
3. Integrate E's pure core behind tests.
4. Integrate F's standalone default-off page.
5. Run implementer QA and produce a candidate SHA.
6. Hand the exact SHA to G in a clean read-only worktree.
7. Resolve findings outside G's lane and repeat review.
8. Stop at the next explicit Owner Gate; do not add production navigation, saves, rewards, or progression.
