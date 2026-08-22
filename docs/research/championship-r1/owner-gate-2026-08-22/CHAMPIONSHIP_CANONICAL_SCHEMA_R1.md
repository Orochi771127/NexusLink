# CHAMPIONSHIP CANONICAL SCHEMA R1

Status: schema contract proposal; no runtime files created
Runtime convention: ES modules plus JSON Schema-compatible documents
Public/private boundary: mandatory

## Canonical model

R1 uses two non-interchangeable catalogs:

```text
Private Forensic Catalog
  ROM addresses + raw bytes + decoded original text + source bundle references
  -> reverse, diff, golden evidence
  -> never committed to public NexusLink main

Public Championship Product Catalog
  project-native IDs + names + text + assets + rules
  -> may cite finding IDs, hashes, counts and verified structure
  -> contains no copyrighted payload or bulk original catalog text
```

A source record's existence and boundaries may be verified while individual field meanings remain unknown. Confidence is stored per field or rule, not inherited from the parent record.

## Shared envelope

Every public catalog has:

```text
CatalogEnvelope {
  schemaVersion: positive integer,
  catalogKind: namespaced string,
  authority: "NEXUS_PRODUCT",
  generatorVersion: string,
  expectedForensicRecordCount: integer | null,
  recordStrideBytes: integer | null,
  recordsDigestSha256: hex string,
  records: Record[]
}
```

The verified counts are forensic expectations and schema test fixtures, not permanent product maximums.

Private evidence, outside the public repository, may use:

```text
ForensicFieldEvidence {
  jsonPointer,
  sourceOffset,
  widthBytes,
  rawHex,
  semanticName: string | null,
  status:
    "VERIFIED_BINARY"
    | "VERIFIED_CROSSCHECK"
    | "HIGH_CONFIDENCE"
    | "UNKNOWN_REQUIRES_TRACE",
  findingIds,
  sourceArtifactDigests,
  reader,
  writer,
  callerChain,
  remainingUnknowns
}
```

For `UNKNOWN_REQUIRES_TRACE`, `semanticName` is `null`. Names such as `possibleDamage` or `likelyPersonality` are invalid because they smuggle an unverified claim into the schema.

## Product manifest

```text
ChampionshipContentManifest {
  schemaVersion: 1,
  rulesetId: "championship-research-r1",
  forensicCatalogExpectations: {
    forensicEntities: 224,
    forensicActions: 596,
    huntGates: 16,
    cageEnvironments: 40,
    shopRecords: 118,
    titleMatches: 62,
    opponentTeams: 152,
    battlePresets: 456,
    eligibilityRules: 45,
    battleFields: 11,
    regularMainAnimationSlots: 40
  },
  productScaleTargets: {
    minimumAddressableCapacity: {
      entities: 224,
      actions: 596,
      gates: 16,
      cages: 40,
      shopRecords: 118,
      titleMatches: 62,
      opponentTeams: 152,
      battlePresets: 456
    },
    maximumRecords: null
  },
  initialSlice: {
    creatureSpeciesIds: string[3],
    huntGateIds: string[1],
    shopRecordIds: string[],
    arenaMatchIds: string[1],
    battleActionIds: string[2..3]
  },
  catalogDigests: object
}
```

Proposed initial project-native creature IDs:

```text
nexus:creature:greyshade-cat
nexus:creature:blazetail-kit
nexus:creature:crystalfin-seahorse
```

These are content definitions. They do not unlock or activate companions in player state. Wild research fixtures are not changes to `unlockedCompanionIds`.

## Public catalog contracts

### Creature species

```text
CreatureSpeciesDefinition {
  speciesId,
  displayNameKey,
  assetRef,
  formKind,
  huntProfileRef: string | null,
  arenaFixtureRef: string | null,
  sourceAuthority: "NEXUS_PRODUCT"
}
```

The private source catalog can validate 224 records, including an 8 + 216 split and verified runtime-bundle topology. Original names, sprites, evolution metadata, and untraced gameplay stats are not product fields.

### Battle action

Every behavior-bearing clause uses one reusable wrapper:

```text
EvidenceBoundExecutableRule<T> {
  value: T | null,
  ruleAuthority: "NEXUS_ADAPTATION" | "VERIFIED_YDIJ_RULE",
  evidenceStatus:
    "NEXUS_RESEARCH_RULE"
    | "VERIFIED_BINARY"
    | "VERIFIED_CROSSCHECK",
  executable: boolean,
  originalParityClaim: boolean,
  evidenceRefs: string[]
}
```

Legal matrix:

- `NEXUS_ADAPTATION` requires `NEXUS_RESEARCH_RULE`, `executable:true`, `originalParityClaim:false`.
- `VERIFIED_YDIJ_RULE` may be executable and claim parity only with `VERIFIED_BINARY` or `VERIFIED_CROSSCHECK` plus accepted evidence references.
- `HIGH_CONFIDENCE` and `UNKNOWN_REQUIRES_TRACE` are invalid in every public `EvidenceBoundExecutableRule`; they remain private `ForensicFieldEvidence` only and cannot be projected into a public rule, even as non-executable metadata.
- Every `executable:true` rule requires a non-null, schema-valid `value`. A null rule is always non-executable.
- No parent record can upgrade a child rule.

Aggregate state is also typed:

```text
AggregateParity {
  status: "RESEARCH_NON_PARITY" | "VERIFIED_BEHAVIOR" | "BLOCKED_UNKNOWN",
  blockingFindingIds: string[]
}
```

`BLOCKED_UNKNOWN` requires at least one non-sensitive `blockingFindingId`. The other statuses require an empty list. The IDs disclose no private payload.

```text
BattleActionDefinition {
  actionId,
  displayNameKey,
  targetRule: EvidenceBoundExecutableRule<TargetContract>,
  timelineRules: EvidenceBoundExecutableRule<TimelineCommand>[],
  effectRules: EvidenceBoundExecutableRule<EffectCommand>[],
  aggregateParity: AggregateParity
}
```

The forensic catalog verifies 596 records at 104 bytes, partitioned 31 common/system + 565 species-specific. Script-pointer fields may be addressed by offsets, but must not be renamed as damage/status/effect semantics without consumer traces. R1's two or three actions remain `NEXUS_ADAPTATION / RESEARCH_NON_PARITY` until formulas and AI are closed.

Confidence does not inherit from the action record. `aggregateParity.status` can be `VERIFIED_BEHAVIOR` only if every executable child rule is independently `VERIFIED_BINARY` or `VERIFIED_CROSSCHECK`, carries accepted evidence references, and makes no broader claim than that evidence. Any executable adaptation makes the aggregate non-parity; any unknown executable child is rejected.

### Hunt gate

```text
HuntGateDefinition {
  gateId,
  fieldDefinitionId,
  displayNameKey,
  ecologyTags,
  presentationRef,
  admissionRule: EvidenceBoundExecutableRule<AdmissionContract>,
  fieldSelectionRule: EvidenceBoundExecutableRule<FieldSelectionContract>
}
```

The public schema supports 16 project-native gates separately from physical field variants. Gate fields that drive behavior must be project-native or individually verified, evidence-bound, and executable. Source indexes, raw selectors, addresses, unknown flags, and offset-addressed placeholders remain only in the private join catalog.

### Cage environment and ownership

```text
CageEnvironmentDefinition {
  environmentId,
  fieldDefinitionId,
  projectNativePresentationRef,
  topologyRule: EvidenceBoundExecutableRule<TopologyContract>,
  dynamicSurfaceRules: EvidenceBoundExecutableRule<SurfaceContract>[]
}

ChampionshipResearchCageOwnershipState {
  authority: "RESEARCH_FIXTURE",
  sourcePlayerState: false,
  persistencePolicy: "MEMORY_ONLY_DISCARD_ON_EXIT",
  ownedEnvironmentIds,
  activeEnvironmentId: string | null
}
```

Forty environments, 35 shop cage records, inventory, ownership, acquisition, and raising effects are not one array and may not be collapsed into a single count or state object.

### Shop record

```text
ShopRecordDefinition {
  shopRecordId,
  category: "TRAINING_GOOD" | "HUNT_ITEM" | "PLUGIN" | "CAGE",
  subcategory,
  itemId,
  availabilityRule: EvidenceBoundExecutableRule<AvailabilityPredicate>,
  initialStockRule: EvidenceBoundExecutableRule<InitialStockContract>,
  capacityRule: EvidenceBoundExecutableRule<InventoryCapacityContract>,
  priceRule: EvidenceBoundExecutableRule<PriceContract>,
  commitDomain: "INVENTORY" | "CAGE_OWNERSHIP",
  nameKey,
  descriptionKey,
  evidenceRefs
}
```

The public schema scales to 118 records. `HIGH_CONFIDENCE` and `UNKNOWN_REQUIRES_TRACE` availability hypotheses remain in the private forensic catalog and are not projected into `availabilityRule`. Type-1 hypotheses, unresolved offsets, source indexes, and persistence flush timing likewise remain private. R1 uses project-native, initial-available research fixtures.

### Title match and eligibility

```text
TitleMatchDefinition {
  matchId,
  nameKey,
  descriptionKey,
  entryRule: EvidenceBoundExecutableRule<EligibilityRuleReference>,
  opponentSelectionRule: EvidenceBoundExecutableRule<TeamReference>,
  fieldSelectionRule: EvidenceBoundExecutableRule<BattleFieldReference>,
  resultContractRule: EvidenceBoundExecutableRule<ResearchResultContract>,
  tutorialRule: EvidenceBoundExecutableRule<TutorialContract>,
  aggregateParity: AggregateParity
}

EligibilityRuleDefinition {
  ruleId,
  conditionTextKey,
  predicateRule: EvidenceBoundExecutableRule<EligibilityPredicate>
}
```

The product match catalog scales to 62 records without copying private raw fields. Rank/season/calendar/difficulty hypotheses, badge/source indexes, unknown offsets, and all `HIGH_CONFIDENCE` or `UNKNOWN_REQUIRES_TRACE` eligibility hypotheses remain in the private forensic catalog. They cannot be projected into a public predicate. Eligibility is its own referenced catalog rather than duplicated logic.

### Opponent team and battle preset

```text
OpponentTeamDefinition {
  teamId,
  nameKey,
  descriptionKey,
  memberPresetIds: [string | null, string | null, string | null],
  evidenceRefs
}

BattlePresetDefinition {
  presetId,
  speciesId,
  displayNameKey,
  arenaStatRules: EvidenceBoundExecutableRule<ArenaStatContract>[],
  actionLoadoutRules: EvidenceBoundExecutableRule<ActionLoadoutContract>[],
  opponentPolicyRule: EvidenceBoundExecutableRule<OpponentPolicyContract>,
  aggregateParity: AggregateParity
}
```

The public schema scales to 152 teams and 456 project-native preset definitions. Teams reference stable preset IDs; they do not duplicate creature records. R1 fixture stats and opponent policy are explicitly `NEXUS_ADAPTATION / RESEARCH_NON_PARITY`.

The corresponding private forensic preset can retain source index, raw species-like reference, nickname pointer/text, 11-value raw vector, raw flags, unknown offsets, and reader/caller evidence. None of those raw/pointer/unknown fields is part of the public `BattlePresetDefinition`, and none is projected into combat or AI meaning before reader/consumer traces.

### Battle field

```text
BattleFieldDefinition {
  battleFieldId,
  projectNativePresentationRef,
  topologyRule: EvidenceBoundExecutableRule<TopologyContract>,
  presentationLayerRules: EvidenceBoundExecutableRule<PresentationLayerContract>[]
}
```

This public supporting catalog scales to 11 project-native playable fields and keeps shared presentation layers separate. Private source file references, indexes, and flags remain outside the public product definition; unknown flags are not projected.

## Research-only runtime state

```text
ChampionshipResearchState {
  schemaVersion: 1,
  session: {
    sessionId,
    rulesetId: "championship-research-r1",
    seed,
    sequence,
    phase:
      "PROFILE" | "GATE_SELECT" | "HUNT" | "COLLECTION"
      | "SHOP" | "ARENA" | "RESULT" | "COMPLETE" | "ABORTED",
    committable: false,
    persistencePolicy: "MEMORY_ONLY_DISCARD_ON_EXIT"
  },
  sourceProfileProjection: {
    sourceDigest,
    activeCompanionId,
    unlockedCompanionIds,
    presentationRefs
  },
  economy: {
    source: "RESEARCH_FIXTURE",
    wallet,
    inventoryByItemId,
    cageOwnershipById,
    shopAvailabilityByRecordId
  },
  hunt: {
    gateId,
    fieldId,
    encounter,
    selectedToolIds,
    stroke,
    eventLog
  },
  collection: {
    instanceOrder,
    instancesById
  },
  database: {
    seenSpeciesIds
  },
  arena: {
    matchId,
    battleSession,
    battleResult
  },
  results
}
```

The profile projection whitelist is limited to active companion ID, legally visible/unlocked companion IDs needed for presentation, locale/low-motion preference, and project-native presentation references. It explicitly excludes production wallet/inventory, battle record, Growth, chapter progression, bond, trust, relationship, memory, emotional memory, Standoff, Orbit, and Raphael state.

Collection instances and database sightings are separate. Residents, visible actors, unlocked product definitions, and captured instances must not share one array or object.

## Pure transactions

Each transaction has this shape:

```text
(inputState, command, deterministicContext)
  -> { nextState, events, result }
```

Required transaction families:

- `CaptureResearchTransaction`;
- `ShopPurchaseResearchTransaction`;
- `ArenaStepResearchTransaction`;
- `BattleResultResearchTransaction`.

Forbidden outputs:

```text
playerStatePatch
saveCommand
cloudCommand
relationshipDelta
growthDelta
productionRewardWrite
```

Final result:

```text
ResearchResultEnvelope {
  committable: false,
  playerStatePatch: null,
  persistenceAttempted: false,
  sessionEventDigest,
  findingIds: string[]
}
```

`findingIds` contains stable, non-sensitive evidence identifiers only. It cannot contain raw evidence objects, byte payloads, original text, file-system paths to private artifacts, or serializable callbacks/commands.

## Version and validation policy

- A lower fixture version may be accepted only through an explicit, pure, tested migration that returns a new object.
- A fixture newer than the runtime is rejected with a typed error; the runtime must not guess.
- Catalog IDs are stable, namespaced strings. Array indexes are forensic provenance, not permanent product identity.
- Unknown fields can be preserved privately but cannot enter formulas, AI scoring, eligibility, target selection, rewards, or persistence.
- A conflicting trace creates a conflict finding and blocks promotion; it does not overwrite older evidence.
- `seed` and `clock` are injected. `sessionId` is injected or excluded from the gameplay digest. Digest serialization uses canonical key ordering and locale-independent number formatting; `NaN` and infinities are rejected.

## Mandatory schema tests

1. Validate minimal R1 fixtures and manifests at exact schema version.
2. Validate synthetic capacity fixtures for 224/596/16/40/118/62/152/456 plus 45 eligibility rules, 11 battle fields, and 40 regular Main animation slots without requiring every item in minimal content.
3. Reject duplicate IDs and broken cross-catalog references.
4. Reject unknown evidence fields used by an executable rule.
5. Enforce the complete `ruleAuthority` x `evidenceStatus` x `executable` x `originalParityClaim` matrix; require non-null schema-valid `value` whenever `executable:true`; reject `VERIFIED_YDIJ_RULE` without accepted evidence references; reject `HIGH_CONFIDENCE` or `UNKNOWN_REQUIRES_TRACE` in every public rule wrapper.
6. Reject original-content asset/text references in public product catalogs.
7. Prove profile projection is cloned and deeply frozen.
8. Prove all research transitions preserve the input object.
9. Prove deterministic replay digest equality.
10. Prove fixture version upgrade/downgrade behavior is explicit.
11. Prove collection, database, residents, visible actors, inventory, and cage ownership remain distinct.
12. Prove no output can be interpreted as a root-store/save patch.
13. Prove the research economy always originates from a `RESEARCH_FIXTURE`, never the production wallet/inventory.
14. Prove a full flow invokes `localStorage.setItem/removeItem/clear`, session-storage writes, IndexedDB open/write, `fetch`, XHR, `sendBeacon`, cloud sync, and background sync exactly zero times.
15. Statically reject Championship imports/calls of `saveState`, `saveQueue`, cloud sync, root-store setters, Emotional Standoff, Heartcore Orbit, and RaphaelCore; allow only the standalone entry's named `loadState` import.
16. Prove existing raw and normalized player-state digests are identical before and after full flow, rejection paths, disposal, and reload.
17. Prove `findingIds` cannot embed raw evidence, original text, private paths, or executable objects.
18. Public-schema lint rejects `rawHex`, `romOffset`, `ramAddress`, `nicknamePointer`, `sourceIndex`, `forensicIndex`, `sourceOriginalText`, `originalAssetRef`, `unknownFields`, raw vectors/flags, or arbitrary evidence objects.
19. Cross-reference tests prove matches reference the 45-rule and 11-field catalogs, and verified animation references use raw slots 0 through 39 only in sanitized finding metadata.
20. Digest tests inject/fix seed, clock, and session identity; use canonical serialization; reject `NaN`/infinity; and prove gameplay digest equality across locale and presentation modes.
21. `AggregateParity.status:BLOCKED_UNKNOWN` requires one or more sanitized `blockingFindingIds`; other aggregate statuses require an empty list, and no ID may embed a private path or payload.

## Gate result

`FULL_CAPACITY_SCHEMA_FEASIBLE = YES`
`FULL_ORIGINAL_SEMANTIC_PARITY_READY = NO`
`RESEARCH_ONLY_ADAPTATION_FEASIBLE = YES`
`PLAYER_PERSISTENCE_ALLOWED = NO`
`PUBLIC_ROM_DERIVED_PAYLOAD_ALLOWED = NO`
