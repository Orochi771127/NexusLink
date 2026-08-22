# Championship Domain Architecture R1

Status: isolated research implementation; default-off; not production-integrated

Ruleset: `championship-research-r1`
Persistence: `MEMORY_ONLY_DISCARD_ON_EXIT`

## Outcome

Championship R1 is a complete but deliberately small research vertical slice. It proves that the accepted Championship architecture can support a modern web implementation without coupling the new domain to NexusLink progression, saves, Emotional Standoff, Heartcore Orbit, or RaphaelCore.

The executable flow is:

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

The standalone entry is `research/championship-r1/index.html?championshipResearch=r1`. With the query flag absent, the page displays a disabled notice and does not request the profile adapter, core runtime, catalog fixture, Pixi, or the production state reader.

## Accepted-contract reconciliation

The accepted Gate package contains both an abbreviated domain sketch and a later implementation workpack. R1 adopts the workpack's explicit eleven-phase state machine shown above because it preserves the abbreviated lifecycle while making encounter, capture, collection, Shop, battle, and result boundaries independently testable. It does not interpret the added phase names as evidence of original-game timing or screen parity.

Product catalog definitions use the canonical `battleFieldId` key required by the accepted data contract. The disposable Hunt runtime projects the selected definition into a session-local `fieldId`; this is a runtime reference, not a second catalog identity. No silent alias is accepted at the catalog boundary.

Where the accepted documents name a production integration seam but also require Phase 1 to remain isolated, the isolation gate wins for R1: the profile port is read-only and whitelisted, the result port is noncommittable, and no navigation, progression, reward, ownership, relationship, or save authority is introduced. Production integration remains a later Owner Gate.

## Authority boundary

Championship R1 owns only its disposable in-memory snapshot and ordered event log. Its public runtime surface is limited to `dispatch`, `getSnapshot`, `subscribe`, and `dispose`.

The only production-state contact is a read adapter that projects and deeply freezes this whitelist:

- active companion ID;
- legally visible unlocked companion IDs needed for presentation;
- locale;
- reduced-motion preference;
- project-native presentation references.

The projection excludes production wallet, inventory, battle record, progression, Growth, bond, trust, relationship, memory, emotional memory, Standoff, Orbit, and Raphael state. No Championship result is a root-store patch. Every result forces:

```json
{
  "committable": false,
  "playerStatePatch": null,
  "persistenceAttempted": false
}
```

## Layering

```text
standalone entry + default-off flag
  -> read-only profile adapter + canonical catalog adapter
    -> command/store transaction boundary
      -> phase reducer
        -> Gate / Hunt / Encounter / Capture / Collection / Shop / Arena / Battle domains
      -> ordered immutable events + noncommittable result envelope
    -> event-driven controller
      -> semantic DOM HUD and controls
      -> optional injected Pixi presentation
```

The reducer and domain functions do not reference the DOM, Pixi, frame rate, storage, network APIs, or production services. The Pixi presenter consumes immutable snapshots and cannot dispatch commands. The DOM remains the accessible interaction surface when WebGL is missing or its context is lost.

## Deterministic transaction model

Every command includes a stable command ID and expected revision. The store performs these gates in order:

1. reject malformed commands;
2. reject duplicate accepted command IDs;
3. reject stale revisions;
4. run the pure reducer through an atomic transaction wrapper;
5. verify the input digest was unchanged;
6. enforce state and result invariants;
7. assign ordered events using an injected deterministic clock;
8. freeze the next snapshot and publish it.

Failed transitions preserve the current snapshot and produce no events. Accepted commands advance the revision exactly once, including collision outcomes. Seed, clock, session identity, canonical key ordering, and finite-number validation are explicit.

## Domain data separation

The following concepts do not share an array or authority:

- product creature definitions;
- research capture instances;
- seen-species database entries;
- visible presentation actors;
- research inventory;
- research cage ownership;
- the whitelisted player-profile projection.

A research capture creates a new research instance with `playerOwned:false` and `relationshipAuthority:"NONE"`. It may add the species ID to the research-only seen database, but it never changes a player companion, unlock, relationship, or save.

The Shop debits only a fixture wallet whose source is `RESEARCH_FIXTURE`. Arena completion records no rank, badge, reward, progression, or persistence writer.

## R1 authored content

The initial project-native slice contains:

- Greyshade Cat, Blazetail Kit, and Crystalfin Seahorse;
- Moonlit Reed Gate and one 12 by 8 collision field;
- Willow Observatory research environment;
- Reed Tonic and Willow Observatory Shop records;
- Reedlight Trial Arena match;
- Comet Pounce and Tide Arc actions.

These names, shapes, map geometry, UI composition, combat values, and opponent policy are authored NexusLink research content. Their executable rules are labeled `NEXUS_ADAPTATION / NEXUS_RESEARCH_RULE / RESEARCH_NON_PARITY`. They do not claim original Championship formula or content parity.

## Canonical catalog strategy

The runtime consumes a compact combined fixture. Ten split public catalogs also carry a stable catalog kind, authority, generator version, accepted forensic count expectation, optional verified record stride, SHA-256 digest of their project-native records, and their records.

The schemas and synthetic generator prove addressable capacity for 224 entities, 596 actions, 16 gates, 40 cages, 118 Shop records, 62 title matches, 152 teams, 456 battle presets, 45 eligibility rules, 11 battle fields, and 40 regular Main animation slots. Synthetic records are test-only and never canonical content or player unlocks.

## Evidence-bound evolution

An executable rule is either:

- a `NEXUS_ADAPTATION` with no original-parity claim; or
- a narrowly scoped `VERIFIED_YDIJ_RULE` backed by accepted `VERIFIED_BINARY` or `VERIFIED_CROSSCHECK` finding IDs.

Private `HIGH_CONFIDENCE` and `UNKNOWN_REQUIRES_TRACE` evidence cannot enter a public executable wrapper. New reverse evidence must replace a fallback through this typed rule boundary, accompanied by deterministic vectors and regression tests. It must not silently change a constant.

## R1 non-goals

R1 does not add production navigation, a production route, save writes, progression, rewards, public player access, a backend, database, service worker, analytics, or copied source-game content. It is not a claim that the full original game is reproduced. It is the first complete, scalable, testable research spine for that longer reconstruction goal.
