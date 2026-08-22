# PHASE 1 REVERSE WORKPACKS

Status: prepared only; execution requires the next Owner Gate
Shared evidence ledger: Lead Integrator only
Public repository: no ROM payload, raw table dump, original assets, or bulk original text

## Coordination contract

- Agents A, B, C, and D own non-overlapping reverse/schema-proposal domains.
- Each agent writes only proposal artifacts in its own lane.
- No agent modifies `MASTER_EVIDENCE_LEDGER.*`, shared contracts, or another lane.
- The Lead Integrator validates hashes, reproduction commands, caller/writer chains, confidence level, and conflicts before adopting a delta.
- Agent G is read-only and may not repair its own findings.
- A conflict creates a new conflict finding and stops promotion; existing evidence is never silently overwritten.

All reverse outputs are rooted at a mandatory checkout-external directory:

```text
<PRIVATE_RE_ROOT> = an absolute path outside every Git worktree/repository
```

Before a reverse task runs, the Lead verifies that the resolved `<PRIVATE_RE_ROOT>` is not contained by `git rev-parse --show-toplevel`, is not a symlink/junction back into the repository, and is excluded from publication tooling. The relative paths below are always relative to `<PRIVATE_RE_ROOT>`, never to the NexusLink checkout. A public commit gate rejects ROMs, ROM slices, raw table dumps, original text/assets, golden payload bytes, or private forensic paths.

## Agent A — Reverse Evidence / Battle

### Scope

- OVL19 battle-action record readers and consumers;
- Battle VM/native bridge;
- base damage, hit/miss, critical, TP, status, resistance, targeting;
- action AI, initiative/order, RNG consumption/tie-breaks;
- OVL8 Battle Result and reward/rank/badge writer chains;
- original serializer/reload trace as evidence only.

### Accepted anchors

```text
ROM SHA-256  = 8AD375BA0BD9B652A25F72DEAD2B47F78DA401E188A8F3E1B7A6F2867EE0C5D1
table base   = 0x020CFF9C
stride       = 0x68 / 104 bytes
count        = 596
partition    = 31 common/system + 565 species-specific
species base = 0x020D0C34
end exclusive= 0x020DF1BC
```

Accepted private artifact digests:

```text
battle_action_full_596.bin  858E14B20A8605647A6B04EE8D30290E382B69CB11300D84FC390DF2B49AA54B
battle_action_first_31.bin  FEE381CD29DE63E1E915B8665847A4C194F36861D3E4F38C18BEF419B5AA3C1D
ovl19 selector              DE2F0FD93DFC6A8A64B8EB21C1E359D722C77159253E8086D2C9864A4F5A51EF
```

### Subtasks

```text
A1  104-byte action-field consumer map
A2  VM/native combat-call and combatant provenance closure; excludes animation actor/bank provenance
A3  damage/hit/critical/TP/status/resistance formulas
A4  targeting/initiative/CPU action selection
A5  Battle Result -> runtime PlayerData writers
A6  result -> serializer/reload trace, evidence only
```

### Private outputs

```text
<PRIVATE_RE_ROOT>/reverse/battle/findings/<finding-id>.json
<PRIVATE_RE_ROOT>/reverse/battle/traces/<trace-id>.json
<PRIVATE_RE_ROOT>/reverse/battle/generated/action-field-usage.json
<PRIVATE_RE_ROOT>/reverse/battle/generated/native-call-graph.json
<PRIVATE_RE_ROOT>/reverse/battle/golden/<vector-id>.json
<PRIVATE_RE_ROOT>/reverse/battle/ledger-delta-proposal.json
<PRIVATE_RE_ROOT>/reverse/battle/UNKNOWN_BACKLOG.md
```

Each golden vector records ROM/overlay hashes, initial combatant data, injected RNG state, selected action/target, pre/post state, timeline, emulator trace, and reader/writer/caller chain.

### Stop conditions

- an offset has multiple plausible meanings;
- only correlation exists, with no reader/consumer;
- a coefficient would need genre/RPG convention to fill a gap;
- RNG order or tie-break is untraced;
- a result is displayed but its writer is not proven;
- a `HIGH_CONFIDENCE` field is about to become an original-parity rule;
- work would require NexusLink save, RaphaelCore, Emotional Standoff, or Heartcore Orbit changes.

## Agent B — Animation Forensics

### Scope

- reproduce the 216 x 40 Main NANR structural matrix;
- verify mirror-pair families and exceptions;
- trace Battle/Hunt caller -> actor identity -> sequence argument -> bank provenance;
- keep main creature actors separate from secondary effect actors;
- propose, but not perform, semantic promotions.

### Accepted structural anchors

```text
regular entities             = 216
Main slots per entity        = 40
parsed Main sequence records = 8,640

slot 12: 2 frames, mode 2, timing 37|37 for 216/216
slot 26: 4 frames, mode 1, timing 6|3|9|9 for 216/216
slot 12 and 26 semantics = UNKNOWN_REQUIRES_TRACE

root 0x02120900 -> sequence 34 -> raw Main slot 33 = VERIFIED_BINARY
slot 39 -> OVL0 Hunt terminal-disappearance-related path = VERIFIED_BINARY association
```

Strong structural mirror families:

```text
0<->16  1<->17  2<->18  3<->19  4<->20
11<->21 12<->22 13<->23 14<->24 15<->25
```

They remain `HIGH_CONFIDENCE_STRUCTURE / UNKNOWN_SEMANTIC`; they cannot be named idle/walk/attack/hurt/direction without runtime proof.

### Subtasks and private outputs

```text
B1  reproduce structural matrix
B2  mirror families and exceptions
B3  classify SetAnimation calls by actor provenance
B4  OVL19 primary-actor consumers
B5  OVL0 animation-only consumers; consumes C-provided behavioral caller IDs and does not own Hunt state/geometry/tool semantics
B6  semantic promotion proposals

<PRIVATE_RE_ROOT>/reverse/animation/generated/main-slot-structure.json
<PRIVATE_RE_ROOT>/reverse/animation/generated/mirror-pairs.json
<PRIVATE_RE_ROOT>/reverse/animation/actor-provenance/<root>.json
<PRIVATE_RE_ROOT>/reverse/animation/slot-findings/<slot>.json
<PRIVATE_RE_ROOT>/reverse/animation/golden/<vector>.json
<PRIVATE_RE_ROOT>/reverse/animation/ledger-delta-proposal.json
<PRIVATE_RE_ROOT>/reverse/animation/UNKNOWN_BACKLOG.md
```

### Stop conditions

- semantics are inferred from sprites/contact sheets alone;
- actor provenance does not prove a Main creature actor;
- a sequence value above 40 is forced into the Main slot table;
- a secondary effect actor is treated as the creature;
- caller, actor, sequence, and bank do not all agree;
- original animation payload would enter the public repository.

## Agent C — Hunt Forensics

### Scope

- OVL0 Hunt runtime and OVL12 Gate Select/loadout contract;
- 16 formal Gate records and physical field-variant mapping;
- map topology/collision/dynamic-surface decoding;
- circle/rope/tether geometry;
- raw Wild AI state transitions/guards/RNG;
- tool/equipment branch matrix;
- capture into a 456-byte individual record;
- result/return and original persistence writer trace as evidence only.

Agent C owns OVL0 behavioral callers, states, geometry, tools, capture, and return flow. It hands the exact animation-call-site IDs to Agent B; it does not assign NANR bank/slot semantics. Agent B returns animation provenance findings without changing C's behavioral graph.

### Accepted geometry anchors

```text
segment length < 5 px -> ignored
gap > 20 px           -> interpolate
point capacity        = 20
minimum close points  = 6
minimum extent        = 25 px
closure tolerance     = 15 px
tether bands          = <40 / 40-80 / 80-160 / >160
```

Boundary ownership at exactly 40, 80, and 160 remains unresolved until trace evidence removes the textual overlap. R1 must not guess inclusivity.

### Subtasks

```text
C1  16-record GateCatalog raw/decoded map
C2  formal Gate -> physical variant grouping
C3  topology/collision/dynamic surfaces
C4  deterministic circle/rope/tether recognizer
C5  Wild AI raw state graph, guards and RNG consumption
C6  tool/equipment branch matrix
C7  capture -> individual record -> collection writer
C8  result/return flow; persistence evidence only
```

### Private outputs

```text
<PRIVATE_RE_ROOT>/reverse/hunt/generated/gate-catalog.json
<PRIVATE_RE_ROOT>/reverse/hunt/generated/field-variant-map.json
<PRIVATE_RE_ROOT>/reverse/hunt/generated/wild-ai-raw-state-graph.json
<PRIVATE_RE_ROOT>/reverse/hunt/generated/tool-branch-matrix.json
<PRIVATE_RE_ROOT>/reverse/hunt/traces/capture-instance-copy.json
<PRIVATE_RE_ROOT>/reverse/hunt/golden/geometry/*.json
<PRIVATE_RE_ROOT>/reverse/hunt/golden/ai/*.json
<PRIVATE_RE_ROOT>/reverse/hunt/ledger-delta-proposal.json
<PRIVATE_RE_ROOT>/reverse/hunt/UNKNOWN_BACKLOG.md
```

Required boundary vectors include 4/5 px segments, 20/21 px gaps, 20/21 accepted points, 5/6 close points, 24/25 px extents, 14/16 px endpoint distance, and tether samples around every band boundary.

A capture vector must prove that the target individual snapshot is copied without changing the encounter source and without conflating species sightings, collection instances, or persistence. The public product schema records this transferable structure, not the original raw 456-byte payload.

### Stop conditions

- raw Wild AI state IDs are given behavioral names without transition callers;
- Nexus-specific refuge/cave behavior is presented as original behavior;
- fixed-point/world-coordinate scale is unproven;
- collision/surface semantics come from visual guessing;
- capture reload parity is claimed before writer/reload closure;
- existing player collection, unlocks, wallet, save, or original assets would be modified.

## Agent D — Canonical Data Schema Proposals

### Scope

- propose public product schemas, validators, and project-native minimal fixtures;
- propose private forensic envelope schemas without copying their payload into the public checkout;
- generate synthetic scale fixtures for 224/596/16/40/118/62/152/456 capacity tests plus 45 eligibility rules, 11 battle fields, and 40 regular Main animation-slot references;
- define stable-ID/cross-reference/evidence-status validation;
- submit a contract-adoption request to the Lead.

### Proposal lane

Agent D does not write shared contracts, manifests, or ledgers directly. Its checkout-external proposal lane is:

```text
<PRIVATE_RE_ROOT>/workpacks/agent-d/schema-proposals/**
<PRIVATE_RE_ROOT>/workpacks/agent-d/validator-proposals/**
<PRIVATE_RE_ROOT>/workpacks/agent-d/generated-fixture-proposals/**
<PRIVATE_RE_ROOT>/workpacks/agent-d/contract-adoption-request.md
```

Only project-native, IP-safe files selected by the Lead may later be applied to the exact public paths in `PROPOSED_PHASE1_FILE_TREE.md`. Agent D cannot promote evidence, name unknown fields, make a record-level confidence inheritance, or put raw pointers/bytes/original text/private paths in a public product definition.

### Stop conditions

- an executable rule depends on `HIGH_CONFIDENCE` or `UNKNOWN_REQUIRES_TRACE`;
- a product catalog contains raw pointers, raw source vectors/flags, private paths, or original payload/text;
- a synthetic capacity fixture is about to be committed as canonical reverse content;
- a proposed migration writes production state or guesses a higher schema version;
- a shared contract would be changed without Lead adoption.

## Lead reverse-delta adoption gate

A delta is adoptable only when it contains:

- exact source hashes and reproduction command;
- a minimal golden vector;
- reader/consumer and, when relevant, writer/caller chain;
- per-field proposed status;
- remaining unknowns and conflicting evidence;
- proof that no copyrighted payload is entering the public repository.

Only the Lead may update the shared evidence ledger. `UNKNOWN_REQUIRES_TRACE` is a valid final result, not a failure to be patched with assumptions.

## Lead schema-proposal adoption gate

Agent D proposals use a different gate and are not required to invent a reader/consumer for project-native product rules. Adoption requires:

- schema version and exact public/private classification for every field;
- public-schema lint rejecting raw pointers/bytes/original text/private paths and arbitrary evidence objects;
- the legal authority/evidence/executable/parity matrix;
- minimal project-native fixture validation;
- synthetic capacity and cross-reference tests, including 45/11/40 supporting catalogs;
- migration/rejection behavior for older/newer schema versions;
- no write/save/cloud/cross-domain authority;
- Lead approval of the exact shared-contract diff.

If a proposal claims original parity, the individual executable rule still needs an accepted A/B/C evidence reference within its exact proven scope. Project-native `NEXUS_ADAPTATION` rules do not require a reverse reader chain and cannot claim original parity.
