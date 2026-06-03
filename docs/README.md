# NexusLink Docs Index

This folder contains the planning and production references for NexusLink.

## Start Here

1. `nexuslink-design-brief.md`
   - One-page product and design orientation.
   - Use this to understand the north star, player promise, design pillars, MVP loop, and first release gate.

2. `nexuslink-game-plan.md`
   - Implementation-facing game plan.
   - Use this to understand the current runtime baseline, state model, companion motion priorities, UI surface, and acceptance criteria.

3. `nexuslink-implementation-roadmap.md`
   - Ordered milestones for the first complete habitat loop.
   - Use this to sequence engineering and asset work without expanding scope too early.

4. `nexuslink-production-backlog.md`
   - Concrete work packages.
   - Use this to pick the next implementation or production task.

5. `nexuslink-sprint-01.md`
   - First execution slice.
   - Use this to run the baseline verification sprint before generating new art.

6. `nexuslink-first-habitat-qa.md`
   - First-loop QA checklist.
   - Use this before deciding the habitat is ready for broader feature expansion.

7. `asset-pipeline.md`
   - Official local art and animation pipeline.
   - Use this before generating, processing, registering, or QAing any visual asset.

## Legacy And Reference Docs

- `Asset_Generation_Plan.md`
- `NexusLink_Emotional_Habitat_Plan.md`
- `NexusLink_HomeScreen_DesignSpec_v1.md`
- `prompts/`

Some older documents may contain encoding issues. Prefer the new `nexuslink-*` documents and `asset-pipeline.md` for current implementation decisions.

## Current Scope Rule

The active target is the first complete emotional habitat loop:

- One habitat
- One companion
- Touch, hug, Soul Talk, and care actions
- Persistent emotional state
- Trustworthy registered animations
- At least one separated habitat FX layer

Do not expand into battle, inventory, large maps, multiplayer, or full AI memory until the first loop passes the QA gate in `nexuslink-production-backlog.md`.
