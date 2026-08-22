# Championship Web Parity R2 — Evidence, Unknowns, and Release Gates

Status: canonical evidence and stop/go contract

Companion documents: [CHAMPIONSHIP_PRODUCT_ARCHITECTURE_R2.md](./CHAMPIONSHIP_PRODUCT_ARCHITECTURE_R2.md) and [CHAMPIONSHIP_FIELDS_AND_PRESENTATION_R2.md](./CHAMPIONSHIP_FIELDS_AND_PRESENTATION_R2.md)

## 1. Purpose

This document prevents a technically polished R2 build from turning structural observations, R1 fixture behavior, plausible genre assumptions, or copied source expression into a false parity claim.

It defines:

- which evidence grades may authorize runtime rules;
- the currently accepted structural facts;
- the unresolved questions that must remain visible;
- the blockers that invalidate a full-content claim; and
- the automated and human gates required before implementation, integration, or release.

It never contains raw binary data, private paths, offsets, source assets, extracted payloads, or private forensic screenshots. Detailed private findings remain outside the product and public documentation boundary.

## 2. Evidence grades

| Grade | Meaning | May do | Must not do |
|---|---|---|---|
| `VERIFIED_BINARY` | A sanitized accepted finding proves an exact bounded fact | Authorize a rule only at the finding’s exact scope | Generalize into adjacent bits, screens, fields, entities, formulas, or transitions |
| `VERIFIED_CROSSCHECK` | Independent accepted evidence corroborates the same bounded fact | Strengthen confidence and regression coverage | Broaden the fact beyond the overlap |
| `VERIFIED_STRUCTURE_ONLY` | Count, shape, association, or existence is verified but meaning is not | Define capacity, schema, registry, validation, or a blocked placeholder | Name behavior, assign semantics, or claim a playable parity rule |
| `NEXUS_ADAPTATION` | R2 deliberately authors a project-native behavior | Execute after design review with explicit non-parity label | Present it as discovered source behavior |
| `UNKNOWN_REQUIRES_TRACE` | Evidence is absent, ambiguous, or not sanitized | Remain in the ledger, instrumentation, or non-executable UI | Become an implicit default or guessed fallback |
| `CONFLICT_BLOCKED` | Accepted facts do not yet reconcile | Stop affected completeness/release claims | Alias, delete, duplicate, average, or guess to remove the mismatch |

Only `VERIFIED_BINARY`, `VERIFIED_CROSSCHECK`, and explicitly approved `NEXUS_ADAPTATION` rules may execute. `VERIFIED_STRUCTURE_ONLY` may shape data and validation but not semantic behavior. Every executable rule must carry a sanitized evidence/adaptation reference, scope, version, and tests.

Evidence promotion is a review act. Passing tests proves conformance to a rule; it does not prove the rule’s source accuracy.

## 3. Accepted R2 fact register

The following inputs are accepted for R2 architecture. Stable sanitized finding IDs still need to be attached by the evidence-owner lane before executable parity rules are promoted.

| Fact | Grade and permitted scope | Required regression |
|---|---|---|
| CM has 40 physical raising/home environments | `VERIFIED_STRUCTURE_ONLY`; registry capacity | Exactly 40 unique CM definitions; each supplies its own dimensions/evidence status |
| CM dimensions vary | `VERIFIED_STRUCTURE_ONLY`; per-record dimensions are required | Reject a catalog that hardcodes or assumes one common CM size |
| HM has 30 physical Hunt environments | `VERIFIED_STRUCTURE_ONLY`; registry capacity | Exactly 30 unique HM definitions |
| HM field structure is 128 × 128 | `VERIFIED_BINARY` at logical-bound scope | Every HM record validates as 128 × 128; all OOB coordinates reject before cell access |
| HM DATR bit 0 blocks | `VERIFIED_BINARY` at single-bit collision scope | Bit 0 clear/pass and set/block vectors; other bits cannot influence outcomes |
| Other DATR bits are unknown | `UNKNOWN_REQUIRES_TRACE` | Metamorphic vectors vary other bits while movement result stays unchanged |
| BM has 12 physical presentation assets | `VERIFIED_STRUCTURE_ONLY`; physical asset capacity | Asset manifest count and unique digests equal 12 when private-to-public art replacement is ready |
| Only 11 BM fields are selectable/addressable | `CONFLICT_BLOCKED` against the 12-asset fact | Full BM/Battle field parity gate fails until mapping/status is resolved |
| 22 overlay/page-family clusters exist | `VERIFIED_STRUCTURE_ONLY`; indexed registry | Indices 0–21 unique and complete; family 20 is non-routable |
| Family 20 is a stub | `VERIFIED_STRUCTURE_ONLY`; disablement | Any route activation or enable flag is rejected |
| 216 regular creature resources associate with 40 animation slots each | `VERIFIED_STRUCTURE_ONLY`; association matrix | 216 unique regular-resource IDs and 40 slot indices, with missing/unknown semantics explicit |
| Slot semantics are mostly unknown | `UNKNOWN_REQUIRES_TRACE` | Unmapped slots cannot acquire semantic labels through defaults |

R1’s accepted catalog counts, deterministic Hunt/Battle vectors, state/event digests, security negatives, default-off proof, DOM fallback, Pixi lifecycle, and zero-write boundary remain regression fixtures. They are not evidence that R2 product behavior, routes, field counts, persistence, or presentation are complete.

## 4. Unknown ledger

Every row remains open until it has a sanitized accepted finding or a separately approved `NEXUS_ADAPTATION` decision. “Implemented” is not a closure reason.

### 4.1 CM and Raising Home

| Unknown | Product consequence | Closure evidence |
|---|---|---|
| Exact dimensions and layout meaning for each of 40 CM fields | Only records with accepted dimensions may claim structural parity | Sanitized per-field dimension/mapping table |
| Collision, exits, anchors, interactive objects, residents, and camera semantics | Project-authored vertical slice cannot be called source parity | Bounded collision/transition/object findings |
| Care, feeding, training, rest, timing, condition, lifecycle, and failure effects | Rules must remain adaptation-labelled | Verified formulas/state traces or approved design decision |
| Relationship between overlay families 14 and 18 | Router cannot infer shared or separate flows | Screen call/transition trace |
| Calendar/season effects on Raising Home | Calendar is project-authored or informational only | State/transition traces across boundary cases |

### 4.2 HM and Hunt

| Unknown | Product consequence | Closure evidence |
|---|---|---|
| Meanings of all DATR bits other than bit 0 | Bits remain opaque and behaviorally ignored | Independent bit-isolation traces |
| Tile art, terrain taxonomy, water/slope/hazard/dynamic blocker semantics | Renderer cannot turn visual categories into rules | Bounded tile-to-rule mapping |
| Relationship among 16 logical Gates, 33 runtime fields, and 30 physical HM environments | Gate/world/loadout selection is incomplete | Sanitized mapping with exceptional cases |
| Spawn, encounter, capture, exit, trigger, diagonal, and pathing rules | R1 Hunt fixture remains an adaptation/research vector | Deterministic traces and boundary vectors |
| HM camera and world-to-screen scale | Presentation remains project-native | Accepted layout/camera observations or adaptation decision |

### 4.3 BM, Arena, and Battle

| Unknown | Product consequence | Closure evidence |
|---|---|---|
| The twelfth physical BM asset’s addressability/selectability status | Full BM registry and complete Battle field claim are blocked | Accepted mapping or accepted proof of intentional non-selection |
| Field modifiers, collision, hazards, camera, and presentation semantics | BM assets are visual structure only | Bounded field-rule and presentation traces |
| Team, preset, eligibility, autonomous action, targeting, timing, damage, result, reward, and rank formulas | R1 sample battle is a fixture, not product parity | Verified rule tables and golden traces |
| Relationship among families 6, 8, 10, and 19 | Router cannot invent exact Battle transition graph | Screen call/state transition trace |
| Exactly-once reward/rank settlement and interruption recovery | Durable progression cannot ship | Accepted save/state traces plus R2 transaction design approval |

### 4.4 Overlay/page families

For all 22 indices, detailed sub-screen membership, input handling, focus order, close/back behavior, transition source/target, persistence timing, and error states remain unknown unless separately recorded. Specifically:

- slash-separated names are cluster labels, not a claim that every sub-screen exists;
- family 9 does not prove any network protocol or authorize online behavior;
- family 13 does not prove production authentication requirements;
- families 2, 4, 8, and 11 do not by themselves authorize result or progression writes;
- family 20 remains a non-routable stub; and
- family 21 proves a movie/media family, not a media-to-state mapping.

### 4.5 Creatures and animation

- Human meanings for most of the 40 slots are unknown.
- The 216 regular-resource set does not by itself prove the complete playable roster, lifecycle forms, eligibility, or player ownership rules.
- Mirroring, timing, frame order, event markers, hit timing, layering, offsets, and fallback behavior need bounded evidence.
- No source association authorizes reuse of source art, pose, silhouette, palette, frame, sound, or wording.

### 4.6 Persistence and integration

- The original serializer, slot policy, migration behavior, failure recovery, and online sync are not verified R2 rules.
- R2’s versioned save model is a project architecture decision, not a source parity claim.
- Binding `ChampionshipSavePort` to production storage/cloud requires a separate integration and privacy review.
- Network, matchmaking, accounts, remote authority, and backend reconciliation remain out of scope until separately authorized.

## 5. Hard STOP conditions

The lead must issue STOP rather than PASS if any of the following is true:

- the BM 12-versus-11 conflict is hidden, aliased, duplicated, dropped, or described as resolved without accepted evidence;
- any non-bit-0 DATR value changes HM collision without an accepted finding;
- any animation slot is given source-semantic wording by assumption;
- an overlay cluster label is treated as proof of detailed screens or transitions;
- family 20 is routable, or family 9 performs network work without a separate gate;
- a domain module imports DOM, Pixi, browser storage, production save manager, cloud sync, authentication, or a network client;
- a renderer, route, or animation completion mutates authoritative state directly;
- R1 memory-only fixture state is migrated into product persistence or described as a product save;
- R2 writes production navigation/root state, Standoff, Orbit, RaphaelCore, companion relationship state, or backend data without an explicit integration gate;
- runtime/public output contains raw evidence, private paths, binary offsets/payloads, source assets, or extracted identifiers that failed sanitization;
- source expression is shipped, traced, redrawn, sampled, or used as generation input;
- save validation reads an accessor, accepts hidden/prototype-polluting keys, or throws on hostile boundary input;
- a save failure is shown as success or a stale debounced write can overwrite a newer critical write;
- default-off boot performs route, asset, Pixi, storage, or network work; or
- lifecycle, accessibility, deterministic, security, or performance gates below are missing or red.

## 6. Automated gate matrix

### 6.1 Scope and static safety

| Gate | PASS requirement |
|---|---|
| Change manifest | Only authorized R2 files; protected production domains unchanged unless a later gate names exact files |
| Syntax and schema | All JS/JSON/schema files parse; every required key and kind has negative tests |
| Plain-data boundary | Null, arrays, dates, maps, sets, functions, accessors, non-enumerable/hidden keys, hostile/revoked proxies, `__proto__`, `prototype`, and `constructor` fail closed without throwing |
| Path firewall | Windows forward/backslash absolute paths, UNC paths, file URLs, POSIX absolute paths, traversal, and control characters are rejected from catalog/save/public output |
| Repository safety | No forbidden binaries/source assets, symlinks, junctions, or reparse points in the R2 package |
| Whitespace | No trailing whitespace, conflict markers, malformed links, or unintended generated output |

### 6.2 Catalog and evidence

| Gate | PASS requirement |
|---|---|
| CM registry | 40 unique physical definitions; variable dimensions explicit; no global fixed-size assumption |
| HM registry | 30 unique physical definitions; every field 128 × 128 |
| HM collision | OOB blocks before lookup; bit 0 clear/set vectors; all other-bit metamorphic vectors leave collision unchanged |
| BM registry | 12 physical asset entries and an accepted selectable/addressable status for all 12; until then expected result is `BLOCKED`, never false PASS |
| Overlay registry | 22 unique indices, exact 0–21 coverage, family 20 disabled/non-routable, family 9 network-disabled |
| Animation registry | 216 regular resources × 40 structural slots; semantic status explicit for every mapping; no guessed default labels |
| Evidence linkage | Every executable rule has accepted evidence or adaptation reference, scope, version, and positive/negative tests |
| Leakage | Public/runtime artifacts contain sanitized references only and none of the private/raw patterns |

### 6.3 Domain correctness

| Gate | PASS requirement |
|---|---|
| Atomicity | Invalid/stale/duplicate commands leave state and revision unchanged |
| Determinism | Golden state/event digests match for identical seed, clock, catalog, and command vectors |
| Render-rate independence | Golden outcomes match at 30, 60, and 120 render Hz |
| Ownership | Definition/instance, Battle/result settlement, capture/collection, and route/domain boundaries cannot be bypassed |
| History bounds | Command/event/diagnostic histories stay within declared limits under held and adversarial input |
| Settlement | Capture, purchase, Battle result, rewards, rank, and unlocks are exactly once by transaction/result ID |
| Unknown isolation | Varying an unknown field cannot alter a runtime result |

### 6.4 Lazy routing and lifecycle

| Gate | PASS requirement |
|---|---|
| Default-off | Zero Championship route imports, asset requests, canvases, listeners, storage calls, and network calls |
| Lazy route | Boot loads shell plus active route only; inactive CM/HM/BM/database/movie bundles remain unloaded |
| Stale load | Rapid route A→B cannot mount A after B; aborted assets cannot append DOM/canvas |
| DOM fallback | Every route action remains operable without Pixi or after Pixi initialization/context failure |
| Pixi trust | Approved pinned/bundled Pixi only; arbitrary pre-existing global rejected; integrity policy proven |
| Dispose/remount | Twenty full cycles leave one expected shell, zero extra canvases/listeners/tickers/observers, and zero stale route assets |
| Visibility | Hidden tab stops renderer/audio; resume produces no catch-up commands or state divergence |

### 6.5 Save port

| Gate | PASS requirement |
|---|---|
| Isolation | Domain imports only `ChampionshipSavePort` types/commands; test spy records zero direct storage/cloud/network calls |
| Round trip | Valid snapshot commit/load preserves canonical digest and invariants |
| Migration | Fixture for every supported `vN -> vN+1`; old input unchanged; result validates and can re-save |
| Future/invalid version | Fails with recoverable explicit result; does not overwrite durable save |
| Concurrency | Revision conflict rejected; stale debounce cannot overwrite critical save |
| Quota/failure | Last durable save remains readable; dirty state, retry, and export recovery shown |
| Lifecycle | Critical exit flush is bounded and reported; pagehide does not claim guaranteed async cloud success |
| Canary | Production save and Championship fake/save slot stay byte-for-byte unchanged by each other’s tests |

### 6.6 Browser, UI, and accessibility

| Gate | PASS requirement |
|---|---|
| Viewports | 320×568, 320×640, 390×844, 844×390, 768×1024, 1280×900, and 1366×768 have reachable non-overlapping actions |
| Text/zoom | 200% text/zoom preserves content, focus, actions, dialogs, and no two-dimensional modal scroll |
| Input | Keyboard, controller, touch, and screen-reader paths execute identical domain intents |
| Focus | Visible non-color-only focus, modal trap, route entry target, and close/back restoration all pass |
| Reduced motion | No shake/parallax/pulse/nonessential particles; state remains understandable |
| Targets/safe areas | Minimum 44×44 CSS px, preferred 48×48 controls, safe-area insets respected |
| HUD authority | DOM and Pixi show the same values from one view model; no Pixi-only action/status |

### 6.7 Performance

| Gate | PASS requirement |
|---|---|
| Frame pacing | After warm-up, representative routes meet the agreed 60 fps/16.67 ms target on the named minimum-device matrix; median/p95/p99 attached |
| Input latency | Measured against an agreed release threshold with no hidden input queue growth |
| Long tasks | Catalog parsing, save serialization, collision decoding, and bundle load do not execute inside frame callbacks |
| Assets | Route bundle transfer, texture memory, draw calls, atlas dimensions, and release after exit stay within measured approved budgets |
| Adaptive quality | Resolution/particles/effects may scale; domain outcome, collision, timing, and eligibility digests remain identical |

Performance ceilings beyond the 60 fps target must be set from actual minimum-device measurement. A desktop-only trace cannot satisfy the mobile gate.

## 7. Human gates

Automation cannot close these:

- legal/IP review of the reverse-reproduction method and public artifacts;
- human art-direction confirmation that fields, creatures, HUD, icons, movies, and audio are project-native rather than source-expression derivatives;
- playtest confirmation that the Raising Home, Hunt, collection, shop, arena, and autonomous Battle loop is understandable and faithful only at claimed scope;
- accessibility review with keyboard, controller, touch, screen reader, reduced motion, 200% text, and representative color-vision needs;
- product-owner approval of each `NEXUS_ADAPTATION` rule;
- evidence-owner acceptance of sanitized findings that close unknowns;
- security/privacy approval before storage, cloud, authentication, or network integration; and
- product-owner resolution of the BM 12-versus-11 blocker before a complete-content claim.

## 8. Milestone gates

The first executable R2 checkpoint is intentionally partial. Its sanitized CM/HM/BM inventories, Field Kernel, 22 lazy lifecycle shells, and session-only project-native Raising Home are evidence toward R2-A and R2-B; they do not pass either milestone. R2-A still requires the complete 216 × 40 structural animation registry and the full hostile-boundary/evidence-linkage suite. R2-B still requires the versioned in-memory save port, migration/conflict/failure recovery, remount proof, and the full input/accessibility matrix.

### Gate R2-A — Schemas and registries

Required:

- strict common field schema;
- 40 CM, 30 HM, 12 BM physical-asset, 22 overlay-family, and 216 × 40 animation structural registries;
- evidence grade on every record;
- hostile boundary, path, leakage, and count tests; and
- BM result explicitly blocked while addressability remains 11.

No gameplay or product integration is authorized by this gate.

### Gate R2-B — Raising Home vertical slice

Required:

- one CM field with project-native art;
- deterministic inspect/care-or-training adaptation rule;
- accessible DOM authority and optional Pixi presentation;
- lazy route and leak-free lifecycle;
- in-memory `ChampionshipSavePort` round trip, migration, conflict, and failure recovery; and
- zero production state/storage/network mutation.

Passing proves product architecture, not full Raising Home parity.

### Gate R2-C — Hunt and collection

Required:

- 30 HM fields at 128 × 128;
- exact OOB/bit-0 collision plus other-bit non-interference;
- accepted or adaptation-labelled Gate/field mapping, encounters, capture, and settlement;
- deterministic golden vectors and held-input suppression; and
- complete DOM/Pixi/mobile lifecycle proof.

### Gate R2-D — Arena and Battle

Required before PASS:

- BM 12-versus-11 conflict resolved by accepted evidence;
- all 12 physical assets have explicit addressability/selectability status;
- autonomous Battle, field, eligibility, result, reward, and rank rules are verified or adaptation-labelled;
- exactly-once result settlement and interruption/reload recovery; and
- families 6, 8, 10, and 19 have explicit, tested transition mappings.

### Gate R2-E — Full overlay and content coverage

Required:

- all enabled high-level families have explicit route, transition, focus, save, fallback, and evidence policies;
- family 20 remains non-routable;
- family 9 remains network-disabled unless a separate approved network implementation exists;
- help, database, shop, calendar/season, cage editing, ending, and movie behavior is verified or adaptation-labelled; and
- complete art, accessibility, lifecycle, mobile performance, and IP human gates.

### Gate R2-F — Production integration

Required:

- a dedicated, reviewed Championship production entry point;
- default-off and rollback behavior;
- approved production save adapter with migration/recovery and privacy policy;
- production save canary unchanged outside the dedicated namespace;
- protected navigation/state/Standoff/Orbit/RaphaelCore domains unchanged except exact pre-authorized seams;
- full repository release gate plus targeted Championship gates; and
- commit, push, review, merge, and post-merge/deployment proof owned by the integration lane.

Network is not implicitly authorized by R2-F.

## 9. Claim language

Allowed statements are narrow and testable:

- “R2 implements a project-native Raising Home slice on one CM field.”
- “All 30 HM definitions use the verified 128 × 128 structure.”
- “HM collision implements verified out-of-bounds and DATR-bit-0 blocking only.”
- “R2 preserves a 216 × 40 structural animation association registry; most slot semantics remain unknown.”
- “R2 Battle field completeness is blocked by the 12-physical-versus-11-addressable mismatch.”

Disallowed until all relevant gates close:

- “The full original game has been reproduced.”
- “All animations behave like the source.”
- “All 22 screens are implemented.”
- “There are only 11 Battle fields.”
- “The network/login system matches the source.”
- “R1 is the product foundation” when that wording implies its research state, UI, or no-write fixture is production architecture.

## 10. Owner gate handoff

Every implementation handoff must report:

- exact commit and comparison base;
- exact added/modified/deleted path manifest;
- evidence/adaptation references added or changed;
- automated commands with exact pass counts;
- browser/device matrix and artifacts;
- current unknown and blocker delta;
- BM addressability status;
- private/public leakage and IP review result;
- save canary, storage, cloud, and network call counts;
- lifecycle and performance measurements;
- protected-domain diff proof;
- residual limitations; and
- clean worktree status.

A green test suite does not override an open hard STOP condition.
