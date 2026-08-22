# Championship Web Parity R2 — Product Architecture

Status: canonical architecture for the next implementation gate

Scope: Championship product domain only

Supersedes: no R1 evidence or contract document

Companion documents: [CHAMPIONSHIP_FIELDS_AND_PRESENTATION_R2.md](./CHAMPIONSHIP_FIELDS_AND_PRESENTATION_R2.md) and [CHAMPIONSHIP_EVIDENCE_AND_RELEASE_GATES_R2.md](./CHAMPIONSHIP_EVIDENCE_AND_RELEASE_GATES_R2.md)

## 1. Decision

R2 is a product architecture for reproducing the verified structure of the reference Championship experience with new, project-native technology and art. It is not a request to extend the R1 research shell screen by screen.

The R1 implementation remains a default-off, deterministic, memory-only fixture. It proves that bounded catalog import, commands, Hunt movement, capture, shop, arena, battle, DOM presentation, optional Pixi presentation, and teardown can coexist without mutating the production application. R2 may reuse its pure contracts and golden vectors after review, but must not treat its eleven research phases, sample values, research UI, or noncommittable state as the product model.

R2 introduces a separate Championship product root with:

- explicit domain ownership;
- separate definition and player-instance records;
- CM, HM, and BM field families;
- a lazy route and overlay registry;
- a versioned save port;
- deterministic simulation outside the renderer;
- project-native visual assets; and
- evidence labels on every parity-sensitive rule.

No R2 module may silently write production navigation, production root state, Standoff, Orbit, RaphaelCore, companion relationship state, or a backend. Those integrations require their own named gate.

## 2. Canon and evidence precedence

When sources conflict, implementation follows this order:

1. accepted, sanitized Championship binary findings at their exact verified scope;
2. the R2 evidence policy and unresolved-blocker register;
3. this R2 product architecture and its companion presentation contract;
4. accepted R1 contracts and golden fixtures, only where R2 explicitly adopts them;
5. project-authored adaptation rules, clearly labelled `NEXUS_ADAPTATION`.

Unknown behavior is not filled in by intuition, genre convention, external summaries, visual resemblance, or a convenient R1 sample. An unknown either remains non-executable or is implemented as an explicitly project-authored adaptation that makes no parity claim.

## 3. Product boundary

```text
Accessible DOM shell and input adapters
                  |
                  v
Championship lazy router and overlay coordinator
                  |
                  v
Typed commands -> deterministic domain runtime -> typed events
                  |                         |
                  |                         +-> read-only view models -> DOM/Pixi presenters
                  v
Plain-data Championship snapshot
                  |
                  v
ChampionshipSavePort -> separately approved storage adapter
```

The domain runtime is authoritative. The router coordinates presentation lifecycle, not game rules. DOM and Pixi consume immutable view models and dispatch intents; neither may mutate state. The save adapter receives a validated plain-data snapshot; it may never receive a renderer, DOM node, Pixi object, callback, timer, promise, proxy, accessor, or private evidence payload.

## 4. Nomenclature

This architecture uses `CM`, `HM`, and `BM` as stable field-family identifiers. It does not depend on an unverified expansion of those initials.

- `CM` is the raising/home field family: 40 physical environments with variable dimensions.
- `HM` is the Hunt field family: 30 physical environments, each with a verified 128 × 128 field structure.
- `BM` is the battle field family: 12 physical presentation assets are verified, while only 11 are currently selectable/addressable. That mismatch is a release blocker, not permission to alias or drop one.

Dimensions are logical field dimensions, not CSS pixels, viewport pixels, texture dimensions, or an assumed movement scale.

## 5. Domain ownership

| Domain | Owns | Does not own |
|---|---|---|
| Catalog | Immutable creature, action, item, gate, cage, team, preset, eligibility, field, overlay, and animation metadata | Player progress, mutable creature condition, route state |
| Profile | Championship-local player identity and options | Production account/authentication, RaphaelCore identity |
| Calendar | Product-authored clock and season projection until exact behavior is verified | Browser wall-clock authority, renderer ticks |
| Raising Home | Active CM field, residents, placements, care/training intents, home session | Definition records, relationship/bond state outside Championship |
| Creature | Championship creature instances, lifecycle stage, condition, learned actions, eligibility references | Catalog definitions, NexusLink companion relationship records |
| Hunt | Active HM field, hunter position, encounter session, capture attempt state | Collection ownership before an accepted capture event |
| Collection | Owned Championship creature-instance IDs, cage assignments, database discovery projection | Creature definitions, renderer-only selection |
| Inventory and Shop | Championship currency, item stacks, purchase ledger, shop projection | Production wallet, monetization, unverified stock/price rules |
| Arena | Team/preset selection, eligibility projection, bracket/rank projection when authorized | Battle simulation, network matchmaking |
| Battle | Active BM field, participants, deterministic timeline, autonomous action resolution, result proposal | Reward persistence, presentation animation clocks |
| Progression | Accepted result settlement, unlocks, ending eligibility, project-authored milestones | Raw battle mutation, source behavior not yet verified |
| Navigation | Product route ID, overlay stack, focus return target, load epoch | Domain transition authority, save mutation |
| Presentation | Read-only view models, project-native asset references, motion/accessibility projection | Simulation, persistence, evidence promotion |
| Evidence | Evidence grade, sanitized reference, parity scope, unresolved questions | Raw private evidence, executable behavior by itself |
| Persistence | Snapshot validation, schema version, migration, save/load result | Gameplay decisions, renderer state, direct domain access to storage |
| Diagnostics | Bounded command/event digests, performance counters, lifecycle leak counters | Unbounded histories, private payloads, gameplay authority |

## 6. Authoritative product state

The authoritative in-memory root is a plain-data record. The following shape is normative in ownership, not a finalized JavaScript spelling:

```ts
type ChampionshipProductStateR2 = {
  schemaVersion: number;
  revision: number;
  profile: ChampionshipProfileState;
  calendar: ChampionshipCalendarState;
  raisingHome: RaisingHomeState;
  creatures: Record<CreatureInstanceId, ChampionshipCreatureInstance>;
  hunt: HuntState;
  collection: CollectionState;
  economy: ChampionshipEconomyState;
  arena: ArenaState;
  battle: BattleState;
  progression: ChampionshipProgressionState;
  navigation: ChampionshipNavigationState;
  diagnostics: ChampionshipDiagnosticsState;
};
```

Persistence uses a separate `ChampionshipDurableSnapshotR2` projection containing `schemaVersion`, `revision`, and the authoritative profile/calendar/raising/creature/Hunt/collection/economy/arena/Battle/progression domains. It excludes `navigation` and `diagnostics`; both are reconstructed on load and cannot affect the durable digest.

The snapshot must satisfy all of these invariants:

- Every mutable creature is an instance with a unique product-local ID and a catalog definition ID.
- Catalog definitions never embed ownership, mutable condition, currency, placement, or route state.
- Collection owns creature-instance membership; Raising Home and Battle refer to those IDs.
- A creature instance cannot simultaneously occupy incompatible sessions.
- A capture result proposes an instance; Collection becomes owner only through an accepted settlement transaction.
- A battle result cannot directly grant currency, items, rank, or unlocks. Progression settles an accepted result exactly once by result ID.
- Navigation state may be discarded and reconstructed without changing simulation outcomes.
- Diagnostics are bounded and non-authoritative. Truncating them cannot change gameplay.
- All timestamps used by rules come from an injected Championship clock or deterministic simulation step, never directly from `Date.now()`.
- State clone, validation, migration, save, load, and digest operations fail closed on accessors, hidden keys, hostile/revoked proxies, non-plain objects, and prototype-polluting keys.

## 7. Definition records and player instances

### 7.1 Catalog definitions

A definition describes immutable content identity and verified/adapted rules:

```ts
type ChampionshipCatalogDefinition = {
  id: string;
  kind: string;
  schemaVersion: number;
  publicData: Readonly<Record<string, PlainData>>;
  evidence: readonly EvidenceClaim[];
};
```

Accepted R1 catalog capacities remain useful fixture checks: 224 entities, 596 actions, 16 Gates, 40 cages, 118 shop records, 62 title records, 152 team records, 456 preset records, 45 eligibility records, 11 currently addressable battle-field records, and 40 animation slots. They do not override the newer physical-field facts in the R2 evidence register, especially the BM 12-versus-11 mismatch.

### 7.2 Creature instances

Creature instances are Championship-local. A minimum durable instance contains:

- `instanceId` and immutable `definitionId`;
- lifecycle and condition values whose semantics are either verified or labelled adaptation;
- learned action references;
- eligibility and placement references;
- bounded provenance such as `caught`, `starter`, or `granted`, using project-native identifiers; and
- an optimistic revision or last-applied event sequence for exactly-once settlement.

It must not contain a copied source sprite, raw evidence offset, filesystem path, production companion relationship, renderer sprite, animation object, or UI focus state.

## 8. Command and event model

Commands are validated, cloned plain data with a unique command ID and expected state revision. The reducer either rejects without mutation or atomically emits a new snapshot and bounded events.

Every accepted event contains:

- a session-scoped monotonically increasing sequence;
- an injected deterministic timestamp or simulation step;
- a domain and event type;
- a plain-data public payload;
- sanitized evidence references;
- a parity status; and
- an event digest suitable for golden-vector comparison.

Examples of domain command families are `HOME_*`, `HUNT_*`, `COLLECTION_*`, `SHOP_*`, `ARENA_*`, `BATTLE_*`, `PROGRESSION_*`, and `NAV_*`. These names allocate ownership; they do not assert reference-game semantics.

Reducers must not call storage, network, DOM, Pixi, audio, wall-clock, randomness, or dynamic imports. Randomness is provided as deterministic input and covered by golden vectors. Command and event histories are bounded, and held input must not bypass one-intent-per-accepted-step limits.

## 9. Lazy product router

R2 does not add 22 eager controllers to the existing production page router. It introduces a Championship-local route manifest and overlay registry behind one separately approved production entry point.

```ts
type ChampionshipRouteManifestEntry = {
  routeId: string;
  familyIds: readonly number[];
  bundleKey: string;
  load: () => Promise<ChampionshipRouteModule>;
  domainPrecondition: string;
  focusPolicy: "first-action" | "remembered" | "explicit-target";
  savePolicy: "none" | "debounced" | "critical-before-exit";
  fallbackRouteId: string;
  enabled: boolean;
};
```

Router rules:

- Exactly one page route is active. Zero or more modal overlays may be stacked above it.
- A domain command or selector decides whether a transition is legal. The router cannot manufacture eligibility.
- A monotonically increasing load epoch and abort signal invalidate stale dynamic imports and asset loads.
- A route becomes active only after its DOM shell is mounted, critical accessible status exists, and its optional renderer has either initialized or entered DOM fallback.
- Back/close restores a recorded focus target when it still exists; otherwise it uses the route focus policy.
- Route exit disposes input, observers, ticker callbacks, DOM, Pixi presenter, audio handles, and route-owned asset references in that order.
- Bundles are reference-counted and may be unloaded when no active page/overlay uses them.
- Overlay family 20 is a verified stub and must never be routable.
- Overlay family 9 indicates a network-related family, not authorization for network code. Its route remains disabled until a separate backend/network gate exists.
- Title/login, rewards/rank, ending, and movie families remain presentation clusters until their detailed semantics and state transitions are separately verified or explicitly adapted.

The 22-family registry and presentation rules are canonical in the companion fields and presentation document.

## 10. Save-port boundary

R2 is designed to become save-capable without letting its domain import the current production save manager, `localStorage`, cloud sync, authentication, or a network client.

```ts
interface ChampionshipSavePort {
  load(slotId: string): Promise<ChampionshipLoadResult>;
  commit(request: ChampionshipSaveRequest): Promise<ChampionshipSaveResult>;
  export(slotId: string): Promise<ChampionshipExportResult>;
  clear(slotId: string, confirmationToken: string): Promise<ChampionshipClearResult>;
}

type ChampionshipSaveRequest = {
  slotId: string;
  expectedStoredRevision: number | null;
  snapshot: ChampionshipDurableSnapshotR2;
  snapshotDigest: string;
  reason: "debounced" | "critical" | "pagehide" | "manual";
};
```

The port contract requires:

- schema version at the root and pure `vN -> vN+1` migrations;
- structural validation before and after every migration;
- idempotent, revision-checked commits;
- atomic replacement or an explicit failure result; no partial success;
- quota/failure reporting that leaves the last durable save usable;
- a serialized save queue so stale debounced work cannot overwrite a newer critical save;
- an explicit dirty flag and recovery UI after failure;
- optional export/import through the same validator and migration chain;
- deterministic canonical serialization and digesting; and
- no automatic cloud/network side effect unless a later integration contract explicitly authorizes it.

Only an adapter composition root may bind this port to the production save infrastructure. Until that gate is accepted, product tests use an in-memory fake and the R2 entry point stays default-off. R1 keeps its stronger memory-only/no-write contract unchanged.

Durable state excludes:

- route module instances, overlay DOM, focus nodes, canvases, Pixi applications, textures, tickers, sound objects, timers, abort controllers, and promises;
- replayable view models and derived selectors;
- unbounded command/event histories;
- raw private evidence, source paths, binary offsets, or copied asset payloads; and
- transient Battle or Hunt presentation state that can be reconstructed from an authoritative session record.

## 11. Raising-home vertical slice

The complete R2-B target is a save-backed raising-home loop on one project-native CM environment. It is deliberately narrower than full parity but exercises every permanent architecture boundary.

The initial implementation checkpoint may remain session-only while the field kernel, lazy router, accessible DOM, optional Pixi presentation, and adaptation-labelled Raising Home rules are validated. Such a checkpoint is playable architecture evidence only: it does not pass R2-B until the in-memory versioned save port, round trip, migration, conflict handling, failure recovery, and remount proof below are implemented.

### 11.1 User flow

1. The default-off R2 entry loads or creates one Championship-local profile through an in-memory save port during development.
2. The lazy router loads the Raising Home route and one CM field bundle; no Hunt, Battle, movie, ending, or network bundle is fetched.
3. The runtime validates one resident creature instance and its placement in the active CM field.
4. The player inspects condition through accessible DOM HUD and selects one care or training intent.
5. The deterministic Raising Home reducer accepts or rejects the command and emits a project-authored outcome. Until source semantics are verified, the action, costs, timing, and condition effects are labelled `NEXUS_ADAPTATION`.
6. DOM reports the outcome; Pixi may mirror movement and feedback but cannot decide it.
7. An explicit critical save commits the plain-data snapshot through `ChampionshipSavePort`.
8. The route is disposed, remounted, and reloaded from the port. The same resident, placement, condition, revision, and digest are restored.

### 11.2 Slice acceptance

- One CM definition uses the common field envelope and declares its variable dimensions; it does not pretend to verify source tile semantics.
- Keyboard, controller, touch, screen-reader, reduced-motion, and 200% text paths can inspect and execute the action.
- The same command vector produces the same result at 30, 60, and 120 render Hz.
- Renderer absence, initialization failure, and context loss retain a fully operable DOM flow.
- Twenty enter/action/save/exit/remount cycles leave one active shell, no extra canvases/listeners/tickers, and no stale asset references.
- A failed commit preserves the dirty snapshot in memory, presents retry/export choices, and does not claim success.
- No R1 fixture, production root state, production companion relationship, Standoff, Orbit, RaphaelCore, storage, cloud, or network call is mutated by the slice.

## 12. Implementation packages

The eventual code should be divided by authority, not by screen:

```text
src/championship-r2/
  catalog/          immutable validated definitions
  core/             state, commands, reducers, invariants, transactions
  fields/           CM/HM/BM field schemas and collision queries
  raising/          Raising Home rules and selectors
  hunt/             Hunt rules and selectors
  collection/       ownership, cages, database projection
  economy/          inventory and shop transactions
  arena/            teams, eligibility, tournament projection
  battle/           deterministic autonomous simulation
  progression/      exactly-once result settlement
  navigation/       lazy route and overlay manifests
  presentation/     read-only view models and DOM contracts
  ports/            clock, RNG, catalog, save, asset, audio interfaces
  adapters/         separately gated bindings
```

This is a target seam, not authorization to create these files in the documentation lane.

## 13. Delivery order

1. Land schemas, evidence labels, field registries, and negative validators without product routes.
2. Land the Raising Home vertical slice with an in-memory save port and project-native CM art.
3. Resolve and test all 40 CM records and their variable dimensions.
4. Land HM routing, fixed 128 × 128 fields, bit-0/OOB collision, Hunt and collection settlement.
5. Resolve the BM 12-versus-11 blocker before claiming complete Battle field coverage.
6. Land arena and autonomous Battle on the full BM registry.
7. Add shop, calendar/season, database, help, ending, and movie families only at verified or explicitly adapted scope.
8. Authorize a production save adapter and production entry point in a separate integration gate.
9. Authorize network functionality only in a separate backend/security gate.

No milestone may remove an unknown from the ledger merely because a plausible implementation exists.
