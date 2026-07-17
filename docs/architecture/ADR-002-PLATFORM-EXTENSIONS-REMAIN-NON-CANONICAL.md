# ADR-002: Platform Extensions Remain Non-Canonical Until Validated

- **Status:** Accepted
- **Date:** 2026-07-17
- **Decision owners:** Nexus Link project owner
- **Related:** `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`

## Context

Nexus Link may eventually support broadly useful companion-mediated tools such as reflection, grounding, weather ambience, walking memories, learning support, personal knowledge retrieval, or productivity utilities.

These ideas vary greatly in fit. Some directly strengthen the emotional habitat game. Others would require unrelated interfaces, permissions, infrastructure, compliance, and support. Treating all ideas as one committed Life OS roadmap would conflict with the current product identity and create uncontrolled scope expansion.

The repository already serves as the source of truth for product strategy, runtime constraints, world design, and commercial planning. Moving early ideas to a separate repository would reduce context, increase drift, and imply product independence before validation.

## Decision

1. Broad-market tool ideas will remain in the existing `Orochi771127/NexusLink` repository.
2. They will be stored under a clearly labeled non-canonical product-opportunity layer.
3. The Master Canon remains authoritative. Opportunity documents cannot authorize runtime changes.
4. Every idea must be classified as native ritual, optional integration, external utility, rejection, or spinout hypothesis.
5. Promotion into an implementation roadmap requires evidence, Canon review, owner approval, and a reviewed task pack.
6. A separate repository will be considered only when the concept has an independent product promise and operating model.

## Consequences

### Positive

- strategy and implementation context remain colocated;
- AI agents can see both opportunity and constraints;
- speculative ideas do not silently become requirements;
- future product splits can be based on evidence;
- Canon conflicts are explicit and reviewable.

### Negative

- the main repository contains documents unrelated to immediate implementation;
- AI agents may still over-read speculative material unless authority labels are respected;
- opportunity documents require periodic pruning and state updates;
- the contents API may create multiple documentation commits rather than one atomic commit.

## Safeguards

- every file must identify its authority and state;
- README reading order must place Canon above opportunity documents;
- implementation agents must not act on `IDEA`, `RESEARCH`, or `EXPERIMENT` entries without a task pack;
- high-risk health, finance, legal, surveillance, and dependency features are vetoed or isolated for specialist governance;
- no changes to active runtime, saves, APIs, permissions, or monetization are included in this ADR.

## Repository Split Review

Reconsider this decision when at least three of the following become true:

- the tool has an independent product name and target market;
- most use happens outside the game;
- the tool requires a different runtime or backend;
- the tool retains most of its value without Nexus Link characters and world-building;
- it needs independent permissions, billing, compliance, support, or release cadence;
- its roadmap materially competes with the game roadmap.
