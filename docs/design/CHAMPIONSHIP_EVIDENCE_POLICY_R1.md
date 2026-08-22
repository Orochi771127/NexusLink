# Championship Evidence Policy and Phase 1 Delta R1

Status: sanitized public evidence report

Private source artifacts: excluded from this repository
Executable parity readiness: partial structural findings only

## Public evidence policy

Public executable behavior may use only these states:

- `NEXUS_RESEARCH_RULE` under `NEXUS_ADAPTATION`, with `originalParityClaim:false`;
- `VERIFIED_BINARY` under `VERIFIED_YDIJ_RULE`, with one or more accepted finding IDs;
- `VERIFIED_CROSSCHECK` under `VERIFIED_YDIJ_RULE`, with one or more accepted finding IDs.

`HIGH_CONFIDENCE`, `HIGH_CONFIDENCE_STRUCTURE`, `UNKNOWN_SEMANTIC`, and `UNKNOWN_REQUIRES_TRACE` remain private-only. They cannot become executable rules, AI scores, target selection, eligibility, rewards, persistence, or public semantic names.

Finding IDs are short sanitized identifiers. They cannot contain paths, byte payloads, source text, callbacks, original assets, or private evidence objects. Aggregate `BLOCKED_UNKNOWN` requires at least one sanitized blocking ID; all other aggregate states require an empty blocking list.

## Sanitized Battle evidence delta

- `BATTLE-A-R1-001 — VERIFIED_BINARY`: the accepted action catalog structure reproduces as 596 fixed-stride records at 104 bytes each, partitioned into 31 common or system records and 565 species-specific records. Fourteen field-consumer records now have bounded register provenance, including VM entry pointers, raw VM argument groups, an action-resource consumer, timing inputs, an execution-class input, and a candidate-source selector. Human target and effect semantics do not inherit from these structures.
- `BATTLE-A-R1-006 — VERIFIED_CROSSCHECK`: the 565-record crosscheck covered 37 numeric fields and 20,905 values with zero mismatch. Decoded source names and bulk text were excluded.
- `BATTLE-A-R1-002 — VERIFIED_BINARY`: the VM dispatch has 52 slots spanning `0x00..0x33`; each slot is an 8-byte handler/reserved-zero pair. A bounded indirect-call bridge and five VM contexts were reproduced.
- `BATTLE-A-R1-003 — VERIFIED_BINARY`: the positive-damage critical transform is exact integer `15 / 10`, and a current-HP-like runtime value is subtracted and clamped at zero. This finding does not establish base damage or critical probability.
- `BATTLE-A-R1-004 — VERIFIED_BINARY_STRUCTURE_ONLY`: action selection is table-driven and consumes an RNG helper. AI buckets, scoring, targets, order, probability, RNG state, and tie-break remain non-executable unknowns.
- `BATTLE-A-R1-005 — VERIFIED_BINARY_WRITER_CHAIN_ONLY`: a capped currency-like result writer chain was reproduced. Reward calculation, ranks, badges, serialization, flush, reload, and migration remain unknown. R1 intentionally does not reproduce the writer.

The executable R1 battle uses only project-native `NEXUS_ADAPTATION / RESEARCH_NON_PARITY` damage and opponent-policy rules. The accepted Battle golden vector is therefore a deterministic R1 implementation vector, not an emulator parity claim.

## Sanitized Animation and UI evidence delta

- `ANIM-R1-STRUCT-001 — VERIFIED_BINARY`: 216 regular Main resources each expose 40 raw sequences, for 8,640 structural slots.
- `ANIM-R1-SLOT12-001 — VERIFIED_BINARY`: raw Slot 12 has one rigid structural tuple across 216 of 216 records: two frames, playback mode 2, timing `37|37`.
- `ANIM-R1-SLOT26-001 — VERIFIED_BINARY`: raw Slot 26 has one rigid structural tuple across 216 of 216 records: four frames, playback mode 1, timing `6|3|9|9`.
- `ANIM-R1-MIRROR-001 — VERIFIED_CROSSCHECK`: ten mirror families reproduce with zero mismatch. Their human motion semantics remain unknown.
- `ANIM-R1-WRAPPER-001 — VERIFIED_BINARY`: 125 packaged SetAnimation call sites target the reproduced native wrapper.
- `ANIM-R1-PRIMARY-ACTOR-001` and `ANIM-R1-ACTOR-FIREWALL-001 — VERIFIED_CROSSCHECK`: three primary-actor sites are separated from 122 secondary or effect-actor sites, preventing the latter from naming Main creature slots.
- `ANIM-R1-BATTLE-SLOT33 — VERIFIED_CROSSCHECK`: one bounded battle sequence maps to raw Main Slot 33. Its human action semantic remains unknown.
- `ANIM-R1-HUNT-SLOT39` and `ANIM-R1-CALLPC-XCHECK-001 — VERIFIED_CROSSCHECK`: two Hunt teardown-related callers pass raw sequence 39 through the reproduced actor router. It cannot be named disappear, flee, death, capture, or another human semantic without further trace evidence.
- `ANIM-R1-UI-TOPOLOGY-001 — VERIFIED_BINARY`: Gate Select, Hunt World, Hunt Setup, Hunt Field, Hunt Result, Shop, Battle Menu, Battle, and Battle Result use separable resource families rather than one generic panel. The 28 relevant screen-map structures include 20 at 256 by 256, two at 256 by 512, four at 512 by 256, and two at 512 by 512. Exact scrolling, panel rectangles, physical screen assignment, focus order, palette semantics, and transition timing remain unknown.

No human-readable raw-slot semantic promotion is accepted in this phase. The R1 renderer uses only project-native semantic presentation IDs.

## Sanitized Hunt evidence delta

- `HUNT-GATE-CATALOG-001`, `HUNT-FIELD-RUNTIME-001`, and `HUNT-PHYSICAL-FIELD-COUNT-001 — VERIFIED_BINARY_STRUCTURE_ONLY`: 16 logical Gate records, 33 runtime field records, and 30 physical Hunt map structures are distinct catalogs and must not be collapsed into one count.
- `CAGE-COUNT-DISTINCTION-001 — VERIFIED_BINARY_STRUCTURE_ONLY`: 40 physical Cage environments are distinct from the 35 Shop records in the relevant raw Shop category; environment definitions, Shop records, ownership, acquisition, and raising behavior require separate schemas.
- `HUNT-MAP-STRUCTURE-001`, `HUNT-ATR-COLLISION-001`, and `HUNT-GEOMETRY-BOUNDARIES-001 — VERIFIED_BINARY`: a candidate-position collision consumer reads one bounded terrain bit before accepting movement, and out-of-bounds movement is rejected. Tile meaning, terrain taxonomy, diagonal policy, actor radius, dynamic blockers, and trigger priority remain unknown.
- `HUNT-ESC-VECTOR-001`, `HUNT-TOOL-BRANCH-001`, and `HUNT-WILD-AI-RAW-GRAPH-001 — VERIFIED_BINARY_STRUCTURE_ONLY`: the encounter selector dispatches through a raw vector and bounded tool/AI branches. Tool effect semantics, weighting, AI policy, probability, and RNG consumption order remain unknown.
- `HUNT-CAPTURE-INSTANCE-001 — VERIFIED_BINARY`: successful capture creates a separate 456-byte instance copy rather than promoting a catalog definition in place. Field semantics and production persistence remain unknown.
- `HUNT-ANIM-RAW39-CALLERS-001 — VERIFIED_CROSSCHECK`: teardown-related raw sequence 39 callers agree with the independent Animation lane. Human animation semantics remain unknown.
- `HUNT-PERSISTENCE-RELOAD-001 — UNKNOWN_REQUIRES_TRACE`: no serializer, flush, restart, reload, or migration chain has been established. This identifier is backlog-only and is never executable in R1.

The executable R1 Hunt collision grid, path, encounter point, capture outcome, tool availability, Shop content, and economy are authored `NEXUS_ADAPTATION / RESEARCH_NON_PARITY` fixtures. Its golden vector validates deterministic web behavior only.

## Current unknown backlog

### Battle

- base damage, hit and miss, critical probability;
- full resource cost and recovery rules;
- status application, duration, clearing, resistance, and field modifiers;
- AI scoring, target selection, initiative, order, timing, RNG consumption, and tie-break;
- title progression, rank, badge, reward calculation, serializer, flush, reload, and migration;
- maximum-HP field identity on the same proven runtime object;
- emulator or injected-RNG parity vectors.

### Animation and presentation

- human semantics for all 40 raw Main slots;
- original screen scrolling, widget rectangles, draw order, touch regions, focus order, palette meaning, and transition duration;
- original physical top/bottom screen assignment where names alone are insufficient;
- effect-actor semantics and safe project-native presentation mapping.

### Hunt, Cage, capture, and Shop

- exact terrain-bit semantics and full collision precedence;
- Gate-to-field selection behavior beyond structural references;
- encounter weights, tool behavior, AI, probability, RNG state, and retry policy;
- capture field meanings, success formula, failure behavior, capacity, replacement, and lifecycle;
- Cage ownership, active-environment behavior, raising effects, and production persistence;
- Shop availability, category semantics, stock refresh, capacity, pricing, currency source, commit timing, and reload behavior.

## Promotion rule

Any future promotion must cite a sanitized accepted finding, state the exact bounded behavior, add positive and negative deterministic vectors, preserve public/private separation, and pass the complete boundary and release gates. Conflicts block promotion; they never overwrite earlier evidence silently.
