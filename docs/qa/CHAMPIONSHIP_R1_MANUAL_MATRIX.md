# Championship R1 Phase 1A + 1B QA Handoff

Status: candidate-preparation evidence; Owner Gate required before any production integration or publication

Base: `origin/main@e3d5ceca08c9cf89f4e36ade4100363b6cc1e5db`

Ruleset: `championship-research-r1`
ROM input digest: `8AD375BA0BD9B652A25F72DEAD2B47F78DA401E188A8F3E1B7A6F2867EE0C5D1`

## 1. Working slice

The standalone research entry is:

```text
research/championship-r1/index.html?championshipResearch=r1
```

It runs the complete disposable flow:

```text
HEARTLAKE_PROFILE -> GATE_SELECT -> HUNT_FIELD -> WILD_ENCOUNTER
-> CAPTURE -> COLLECTION -> SHOP -> ARENA -> BATTLE
-> BATTLE_RESULT -> COMPLETE
```

The slice has a 12 by 8 collision field, keyboard/touch/gamepad input, a semantic DOM HUD and controls, optional injected Pixi 2D presentation, and a full DOM fallback. It is not linked from production navigation. With the flag absent it requests no Championship runtime module, production state reader, Pixi script, or canvas.

## 2. Reverse delta accepted into the public contract

Only sanitized finding IDs and bounded structures crossed the private/public boundary. No ROM bytes, decoded bulk text, original assets, disassembly, private paths, or private confidence objects are included.

Battle:

- 596 action records of 104 bytes, partitioned 31 plus 565; 14 bounded field consumers;
- 52 VM slots, each an eight-byte handler/reserved-zero pair;
- exact positive-damage critical transform `15 / 10` and subtract/clamp current-HP-like behavior;
- selection/RNG and result-writer chains remain structural only;
- executable R1 damage, action choice, timing, targets, and battle results are explicitly authored `NEXUS_ADAPTATION / RESEARCH_NON_PARITY` rules.

Animation and UI:

- 216 regular Main resources times 40 raw slots equals 8,640 structural slots;
- rigid raw Slot 12 and raw Slot 26 tuples;
- ten mirror families, 125 wrapper call sites, three primary-actor sites, and a 122-site secondary/effect firewall;
- raw Slot 33 battle association and raw Slot 39 Hunt teardown association without human semantic promotion;
- phase-specific UI families and 28 bounded screen-map structures;
- executable R1 presentation uses only project-native semantic presentation IDs.

Hunt, Cage, capture, and Shop:

- 16 logical Gates, 33 runtime fields, and 30 physical Hunt maps stay separate;
- 40 physical Cage maps stay separate from 35 raw Shop category rows;
- bounded candidate-position terrain-bit collision and out-of-bounds rejection;
- raw encounter/tool/AI graph remains structure-only;
- successful capture makes a separate 456-byte instance copy, but no persistence chain was established;
- executable R1 topology, encounter point, capture outcome, tools, Shop values, and economy are authored non-parity fixtures.

The complete finding matrix and unknown list are in `docs/design/CHAMPIONSHIP_EVIDENCE_POLICY_R1.md`.

## 3. Schema and scale report

The product bundle and ten split catalog envelopes use schema version 1, strict top-level and record allowlists, project-native namespaced IDs, typed evidence rules, full cross-reference validation, canonical key ordering, finite-number enforcement, and sealed SHA-256 record digests.

Thirteen JSON Schema documents parse as Draft 2020-12 documents. The executable JavaScript validator additionally fails closed on duplicate IDs, broken references, future versions, digest drift, duplicate animation slots, executable/cyclic/accessor-bearing object graphs, forbidden forensic fields, private paths, aggregate parity contradictions, and invalid evidence references.

Synthetic capacity proof validates exactly:

| Catalog | Records |
| --- | ---: |
| Entities | 224 |
| Actions | 596 |
| Gates | 16 |
| Cages | 40 |
| Shop records | 118 |
| Title matches | 62 |
| Teams | 152 |
| Battle presets | 456 |
| Eligibility rules | 45 |
| Battle fields | 11 |
| Regular Main animation slots | 40 |

Canonical R1 split-catalog SHA-256 record digests:

| Catalog | SHA-256 |
| --- | --- |
| entities | `2eb3599d46106a1aa4456beac333ca92acbba0a7f30a77b90d3623648a93fbd1` |
| actions | `21cad4bed516526b57470f73102211fde7119e6e2b9bd02bc715079023c61592` |
| gates | `e0e0eb0d719ef01758d4bd5736b79cd8cf171039177eb859e3869a0c8ef0ac7c` |
| cages | `365c668d5e3436ea99bf429cf4d7d00453b2d078bc882cf5e7099ab61c2437d3` |
| shopRecords | `0ecd5f374c05c74d4c4d0987530b144968ee30e3bd02e879522cc8ab2235534e` |
| titleMatches | `8eecef7dcd9fd9c3a48957f9647c37bffc516d5bde41a36f9ad4f028b3d7bf60` |
| eligibilityRules | `8ff827e7bcd333e1de5ad07138705b2ff30c66283078f4ba6b80fce2f4cb8685` |
| teams | `80019563f9bf6fdabbd1fbe775889a08d59ac17285f095c55fd63f2531689593` |
| battlePresets | `6319e927ef005be8c6579fb5b361795ddfdd8df2e5c3e85bc2839cf2f213e26c` |
| battleFields | `9339e1338d8ec5a083bcdd5021560f5afe5a093a12c0d3d02fc27c41e8794d73` |

## 4. Deterministic golden vectors

Hunt vector:

- start `(1, 4)`;
- two right moves reach `(3, 4)`;
- the next right candidate `(4, 4)` is blocked without moving the hunter;
- the accepted full path reaches encounter coordinate `(10, 3)`;
- the capture remains `CAPTURED_RESEARCH_ONLY` and produces no player ownership.

Battle vector:

| Round | Actor | Action | Damage | Target HP |
| ---: | --- | --- | ---: | ---: |
| 1 | Player | Comet Pounce | 18 | 40 |
| 1 | Opponent | Tide Arc | 14 | 58 |
| 2 | Player | Comet Pounce | 18 | 22 |
| 2 | Opponent | Tide Arc | 14 | 44 |
| 3 | Player | Comet Pounce | 18 | 4 |
| 3 | Opponent | Tide Arc | 14 | 30 |
| 4 | Player | Comet Pounce | 18 | 0 |

Full-run invariants:

- final revision 27 and event count 28;
- event digest `fnv1a32:92e19b47`;
- final snapshot digest `fnv1a32:9f018910` for the canonical profile;
- fixture wallet 120 to 100, one research-only capture, four battle rounds;
- 30/60/120 Hz, paused presentation, locale, and reduced-motion variants cannot change the event vector or battle timeline.

## 5. Automated and visual QA

Championship Node matrix:

- core, golden-vector, profile-projection, transaction, evidence, boundary, schema-scale, and presentation suites;
- expected final count: 34 passing, zero failing after the final combined rerun;
- all 13 schema JSON files parse;
- all existing tracked files must remain byte-identical before staging.

Championship real-browser gate:

- 320 by 640, 390 by 844, 1280 by 900, and 390 by 844 at 200 percent font with reduced motion;
- Pixi CDN success plus forced DOM fallback;
- 66 of 66 checks pass after adding enabled-notice visibility, HUD text-overlap, SRI, and pre-existing-Pixi rejection assertions;
- no horizontal overflow, no HUD text intersection, and all initial controls at least 44 CSS pixels high;
- exactly one accessibility-hidden decorative Pixi canvas across three reloads; dispose removes it;
- the pinned Pixi script carries the reviewed SHA-384 SRI, anonymous CORS, and no-referrer policy;
- an arbitrary pre-existing `window.PIXI` is rejected without a CDN request or canvas and falls back to the safe DOM flow;
- default-off performs zero conditional runtime/state/Pixi/canvas work;
- no console errors.

Manual screenshot review found and repaired two issues that the initial automation missed:

1. the disabled notice remained visible after enabled boot because a CSS display rule overrode `hidden`;
2. 200 percent text caused HUD label/value overlap even without page overflow.

The final screenshots were re-reviewed after both repairs.

Security self-review found and repaired six candidate-blocking defects before commit:

1. the dynamic Pixi loader lacked SRI and trusted an arbitrary pre-existing global;
2. the Owner Gate change-manifest test ignored staged and committed changes;
3. plain-data cloning allowed an own `__proto__` data property to alter the clone prototype;
4. record validation allowed schema-required keys and runtime rule arrays to be omitted;
5. private-path rejection did not cover forward-slash drives, UNC, `file:` URLs, or POSIX absolute paths;
6. accepted command IDs and event history had no disposable-session bound, while held input could repeat movement.

Each repair has a deterministic negative vector. The final independent Agent G review remains mandatory on the exact committed candidate.

Repository web release gate:

- first combined run: 32 of 33 automated required checks passed;
- the sole failure was an existing `map_first_session_ui` 30-second readiness timeout during the long combined run;
- isolated rerun with the expected local server: 32 of 32 checks passed in 8.3 seconds;
- the combined report correctly does not mark the uncommitted candidate worktree release-clean;
- real-device, moderated comprehension, private blind, legal/privacy/store-copy, and public launch approvals remain manual and out of scope.

## 6. Save and protected-domain proof

The browser gate seeds the production storage key with a canary and compares raw bytes before and after every complete Championship run. The before and after SHA-256 value is identical:

```text
c8709e807242c8af6528dfbaa32c7717b936135f5dd9a4f2caf14ea885f9b730
```

Instrumented calls remain empty for local/session storage writes, Fetch, XHR, IndexedDB, and Beacon. Every result forces `committable:false`, `playerStatePatch:null`, and `persistenceAttempted:false`.

No existing tracked file is intentionally changed. In particular, production navigation, state/save, Emotional Standoff, Heartcore Orbit, and Raphael runtime files remain byte-identical to the base. The new Championship source is statically rejected if it names save authority, storage/network APIs, Standoff, Orbit authority, or RaphaelCore.

## 7. Independent QA and candidate identity

The candidate SHA is reported at the STOP gate because a commit cannot contain its own SHA. After the local candidate commit is created, independent Agent G must inspect that exact commit from a separate clean detached worktree and report PASS or actionable findings without editing it. No push or merge is authorized in this phase.

## 8. Changed-file manifest

This candidate adds 76 files and modifies zero existing tracked files.

Design and QA:

```text
docs/design/CHAMPIONSHIP_DOMAIN_ARCHITECTURE_R1.md
docs/design/CHAMPIONSHIP_EVIDENCE_POLICY_R1.md
docs/design/CHAMPIONSHIP_PRESENTATION_CONTRACT_R1.md
docs/qa/CHAMPIONSHIP_R1_MANUAL_MATRIX.md
docs/qa/_run_championship-r1-browser-gate.py
docs/qa/championship-r1-boundary-cases.mjs
docs/qa/championship-r1-core-cases.mjs
docs/qa/championship-r1-evidence-cases.mjs
docs/qa/championship-r1-presentation-cases.mjs
docs/qa/championship-r1-schema-scale-cases.mjs
docs/qa/championship-r1-transaction-cases.mjs
```

Standalone research route:

```text
research/championship-r1/entry.js
research/championship-r1/index.html
research/championship-r1/styles.css
```

Championship runtime:

```text
src/championship/adapters/createCanonicalCatalogAdapter.js
src/championship/adapters/createNexusProfileReadAdapter.js
src/championship/arena/createArenaMatch.js
src/championship/battle/buildResearchBattleResult.js
src/championship/battle/createResearchBattle.js
src/championship/battle/resolveResearchTurn.js
src/championship/battle/selectResearchOpponentAction.js
src/championship/capture/resolveCaptureTransaction.js
src/championship/collection/collectionSelectors.js
src/championship/contracts/championshipContracts.js
src/championship/contracts/evidencePolicy.js
src/championship/core/championshipCommands.js
src/championship/core/championshipEvents.js
src/championship/core/championshipReducer.js
src/championship/core/championshipSelectors.js
src/championship/core/championshipStateMachine.js
src/championship/core/createChampionshipResearchStore.js
src/championship/core/invariants.js
src/championship/core/seededRng.js
src/championship/core/transaction.js
src/championship/encounter/createWildEncounter.js
src/championship/flags/championshipResearchFlag.js
src/championship/gate/selectGate.js
src/championship/heartlake/projectHeartlakeProfile.js
src/championship/hunt/startHunt.js
src/championship/index.js
src/championship/presentation/createChampionshipController.js
src/championship/presentation/createChampionshipDomRenderer.js
src/championship/presentation/createChampionshipFocusController.js
src/championship/presentation/createChampionshipInputAdapter.js
src/championship/presentation/createChampionshipPixiPresenter.js
src/championship/presentation/createChampionshipScreenStack.js
src/championship/presentation/createChampionshipViewModel.js
src/championship/shop/resolveShopTransaction.js
```

Catalogs, fixtures, schemas, and validators:

```text
src/data/championship/catalogs/battle-actions.r1.json
src/data/championship/catalogs/battle-fields.r1.json
src/data/championship/catalogs/battle-presets.r1.json
src/data/championship/catalogs/cages.r1.json
src/data/championship/catalogs/eligibility-rules.r1.json
src/data/championship/catalogs/entities.r1.json
src/data/championship/catalogs/gates.r1.json
src/data/championship/catalogs/shop-records.r1.json
src/data/championship/catalogs/teams.r1.json
src/data/championship/catalogs/title-matches.r1.json
src/data/championship/fixtures/championship-r1-content.json
src/data/championship/fixtures/championship-r1-profile.json
src/data/championship/schemas/battle-action.schema.json
src/data/championship/schemas/battle-field.schema.json
src/data/championship/schemas/battle-preset.schema.json
src/data/championship/schemas/cage.schema.json
src/data/championship/schemas/catalog-bundle.schema.json
src/data/championship/schemas/eligibility-rule.schema.json
src/data/championship/schemas/entity.schema.json
src/data/championship/schemas/gate.schema.json
src/data/championship/schemas/research-event.schema.json
src/data/championship/schemas/research-state.schema.json
src/data/championship/schemas/shop-record.schema.json
src/data/championship/schemas/team.schema.json
src/data/championship/schemas/title-match.schema.json
src/data/championship/testing/createSyntheticScaleCatalog.js
src/data/championship/validation/validateChampionshipCatalog.js
src/data/championship/validation/validateChampionshipRecord.js
```

## 9. STOP boundary

This handoff is not authorization to publish, merge, expose the route to players, copy ROM assets, enable original-parity claims, write saves, add progression/rewards, or integrate Championship into production NexusLink systems. The next change requires a new Owner Gate.
