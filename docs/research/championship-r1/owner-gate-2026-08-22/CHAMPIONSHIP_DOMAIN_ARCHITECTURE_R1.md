# CHAMPIONSHIP DOMAIN ARCHITECTURE R1

Status: Owner Gate proposal; not implemented
Product status: `CHAMPIONSHIP CORE RESEARCH SLICE R1`
Persistence: prohibited
Original-parity claim: prohibited except per-rule `VERIFIED_BINARY` / `VERIFIED_CROSSCHECK` evidence

## Architecture decision

Championship is a new bounded domain. It does not replace, reinterpret, or write into Emotional Standoff, Heartcore Orbit, RaphaelCore, the root store, or the production save pipeline.

The first executable slice should be a standalone research route under `research/championship-r1/`, backed by new ES modules under `src/championship/`. It should run from the existing static GitHub Pages layout without changing the production bootstrap, production router, global store schema, or Pixi application.

This design intentionally makes the R1 result disposable:

```text
Heartlake profile projection (read-only, cloned, frozen)
  -> ChampionshipResearchSession (memory only)
  -> deterministic commands/reducer/events
  -> isolated view model and research page
  -> result envelope with committable:false
  -> discard on close/reload
```

## Domain boundary

| Domain | Owns | Does not own |
|---|---|---|
| Emotional Standoff | emotional choices, trust/boundary dialogue, non-HP standoff outcomes | arena HP/TP, capture, tournament rank, Championship AI |
| Heartcore Orbit | its own movement/combat-expression rules and session outcomes | Championship battle rules, shop, hunt, capture |
| Championship Arena | may eventually own isolated HP/TP/status/action timeline, opponent AI, and match result; the R1 active subset owns HP and a fixed action timeline only | bond, trust, mood, memory, Growth, RaphaelCore authority, player progression; TP/status remain schema-reserved and inactive until evidence plus a later Owner Gate |

Shared information moves only through explicit value contracts. No Championship reducer receives a live root-store reference. No Championship event is a production state patch.

## Required runtime layers

### 1. Contracts and catalog validation

Responsibilities:

- stable namespaced IDs;
- schema-version checks;
- catalog count/digest validation;
- provenance and confidence metadata;
- separation of project-native product definitions from private forensic records;
- rejection of unknown or higher-version inputs when no explicit pure migration exists.

No contract may infer semantics from an offset, name, visual impression, genre convention, or statistical correlation.

### 2. Read-only Heartlake profile adapter

`createResearchProfileProjection(existingState)` performs a whitelist projection, structured clone, normalization, deep freeze, and digest.

Allowed R1 fields should be the minimum needed for identity/presentation:

- active project-native companion ID;
- legally unlocked companion IDs, if the page needs them;
- project-native presentation references.

Explicitly excluded:

- bond, trust, relationship, memory, emotional memory;
- Growth/progression;
- Standoff or Orbit state;
- production wallet, inventory, collection, badges, rank, rewards;
- any setter, callback, mutable reference, or save authority.

Arena stats come from research fixtures, never from emotional or relationship state.

### 3. Research session store

The R1 store is a closure owned by the standalone research page. It accepts commands and replaces its own immutable snapshot with reducer output.

Hard properties:

- memory-only and discarded on reload;
- deterministic seed, clock, and command sequence are injected;
- state is plain serializable data, even though it is not saved;
- each transition returns `{ nextState, events, result }`;
- no access to root-store setters or browser persistence APIs;
- no network or cloud synchronization;
- result always declares `committable:false` and `playerStatePatch:null`.

### 4. Hunt domain

Owns only the research gate, hunt field, encounter, tool selection, capture attempt, and research collection transaction.

The first product field is project-native. ROM-derived topology/timing knowledge may inform a mechanic only when permitted by its evidence status. Unknown boundary inclusivity, AI state meanings, or coordinate scales remain unavailable to original-parity rules.

Capture creates an individual research instance. It does not unlock a species in the player's account and does not alter the source encounter object.

### 5. Shop domain

Owns a research wallet and research inventory/cage-ownership ledgers. A purchase is an atomic pure transition: validate availability, capacity, and balance; then return the updated research state and events.

Inventory and cage ownership are distinct contracts. No research purchase writes the production wallet or inventory.

### 6. Arena domain

Owns an isolated battle session, combatants, actions, deterministic AI decisions, timeline events, and a research result.

Until formula/AI/result writers are verified, R1 actions must be labeled:

```text
authority: NEXUS_ADAPTATION
parityStatus: RESEARCH_NON_PARITY
```

A temporary fixed formula or scripted opponent is acceptable only under that label. It must not be described as reconstructed YDIJ behavior.

### 7. Presentation adapter

The DOM/Canvas layer renders a derived `ChampionshipViewModel` and dispatches typed commands. It does not hold authoritative wallet, capture, battle, reward, or collection state.

Presentation requirements:

- event-driven feedback; no renderer-side outcome decisions;
- responsive from 320 CSS px upward;
- safe-area padding for notched devices;
- keyboard-operable controls and visible focus;
- semantic headings/buttons/status messages;
- reduced-motion support;
- screen-reader announcement of phase changes and transaction outcomes;
- layout remains usable at 200% zoom;
- no copied YDIJ sprites, UI, logos, map art, audio, or text.

## Initial executable flow

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

Presentation may add confirmation overlays above these domain states, but it cannot collapse or skip the encounter, capture, battle, or result acceptance gates.

An invalid command returns a typed rejection event and leaves state unchanged. Closing/reloading at any phase discards the research session without prompting a production save.

Minimal R1 content:

- three project-native creature definitions;
- one project-native hunt field and gate;
- a limited research-only equipment/item set;
- one research shop;
- one arena match;
- two or three battle actions.

The manifest carries the verified forensic catalog sizes, but those numbers are validation expectations for the source catalog, not permanent product hard caps.

## Event contract

Every accepted command emits ordered domain events with a monotonic session sequence:

```text
{
  eventId,
  sessionId,
  sequence,
  domain: "championship",
  type,
  payload,
  evidenceRefs,
  parityStatus
}
```

The UI may animate these events but cannot change their order or results. A replay using the same catalog digests, seed, injected clock, and commands must produce the same event-log digest.

## Confidence firewall

| Evidence status | May shape a parity rule? | May appear in analysis/UI metadata? |
|---|---:|---:|
| `VERIFIED_BINARY` | Yes, for the exact verified behavior only | Yes |
| `VERIFIED_CROSSCHECK` | Yes, for the exact cross-checked behavior only | Yes |
| `HIGH_CONFIDENCE` | No | Yes, clearly labeled |
| `UNKNOWN_REQUIRES_TRACE` | No | Only as an unresolved offset/raw placeholder in private evidence |
| `NEXUS_ADAPTATION` | Yes, as original project-native research behavior | Yes; never call it YDIJ parity |

Promotion is field-by-field. A verified 104-byte record boundary does not verify the semantics of every child field.

## IP and publication firewall

The public repository may contain:

- project-native IDs, names, text, art references, and mechanics;
- schemas and validators;
- finding IDs, hashes, counts, addresses, structural conclusions, and small metadata necessary to reproduce an audit;
- tools that operate on a privately supplied ROM without bundling its payload.

The public repository must not contain:

- ROMs or ROM slices;
- raw table dumps or bulk decoded original text;
- original sprites, animation banks, music, UI, map art, logos, or proprietary bundles;
- copied names/descriptions used as shipped product content.

Private forensic catalogs remain outside the public checkout.

## Explicit forbidden dependency edges

The Championship core, reducer, transaction, and presentation module graph must fail QA if it imports or calls any of the following:

```text
src/state/saveQueue.js
src/auth/cloudSync.js
saveState
store.setState
store.updateState
store.replaceState
localStorage.setItem/removeItem/clear
sessionStorage
indexedDB
fetch
```

The only allowlisted write-adjacent edge is `research/championship-r1/entry.js` importing the named `loadState` export. It passes the result into the profile adapter, which immediately selects, clones, freezes, and digests the whitelist. No other Championship file may import `saveManager.js`, and `saveState` is forbidden everywhere in the slice.

It must also fail if any Championship reducer imports Emotional Standoff, Heartcore Orbit, RaphaelCore, presentation, or asset-loader authority.

## Why ES modules for R1

Current-main conventions already support browser-native ES modules and the slice does not need a new compiler to prove the domain boundary. TypeScript could later add value for a large contract surface, but that would require a focused benefit/risk demonstration. A build pipeline remains a separate ADR with GitHub Pages path and dependency-lock evidence.

## Exit criteria for implementation authorization

The next owner gate may authorize implementation only if it accepts:

- the baseline and four-commit disposition;
- this bounded architecture;
- the schema/confidence firewall;
- the exact proposed file tree;
- the zero-existing-file research harness plan or explicitly approves named protected edits;
- the reverse and implementation workpacks;
- the negative tests proving no persistence, cloud, cross-domain mutation, or IP payload.

`PRODUCTION_INTEGRATION_AUTHORIZED = NO`
