# NexusLink Docs Index

This folder contains the planning and production references for NexusLink.

本資料夾即為《Nexus Link / 心核連結》目前的正式企劃案、工程規格、製作流程與留存文件集合。

## Start Here

0. `agent/AI_EXECUTION_LEDGER.md`
   - The current cross-AI operational handoff. Read the relevant lane before
     starting work and append the final status, problems, and next safe action.

1. `nexuslink-development-direction.md`
   - Current product direction and emotional habitat north star.
   - Use this to understand the core positioning, emotional sedimentation system, companion principles, MVP scope guard, and current companion direction.

2. `nexuslink-design-brief.md`
   - One-page product and design orientation.
   - Use this to understand the north star, player promise, design pillars, MVP loop, and first release gate.

3. `nexuslink-game-plan.md`
   - Implementation-facing game plan.
   - Use this to understand the current runtime baseline, state model, companion motion priorities, UI surface, and acceptance criteria.

4. `nexuslink-implementation-roadmap.md`
   - Ordered milestones for the first complete habitat loop.
   - Use this to sequence engineering and asset work without expanding scope too early.

5. `nexuslink-production-backlog.md`
   - Concrete work packages.
   - Use this to pick the next implementation or production task.

6. `nexuslink-sprint-01.md`
   - First execution slice.
   - Use this to run the baseline verification sprint before generating new art.

7. `nexuslink-first-habitat-qa.md`
   - First-loop QA checklist.
   - Use this before deciding the habitat is ready for broader feature expansion.

8. `asset-pipeline.md`
   - Official local art and animation pipeline.
   - Use this before generating, processing, registering, or QAing any visual asset.

## Full Planning Documents / 中文完整企劃留存

- `NexusLink_Full_Game_Architecture_v1.md`
  - 《Nexus Link》企劃案 v1.0：情緒棲地型 AI 夥伴養成遊戲完整架構書。
  - Use this as the full Chinese planning archive for product vision, player target, companion personality matrix, memory, care, exploration, purification, AI direction, and version roadmap.

- `NexusLink_Phase1_Engine_Refactor_Report.md`
  - 《Nexus Link 心核連結》第一階段：物理棲地與底層引擎架構重構總結報告。
  - Use this as the retained architecture summary for DOM/PixiJS separation, fixed projection, environment time engine, 2.5D layers, UI/audio foundation, state trust boundary, and next route decision.

## Legacy And Reference Docs

- `Asset_Generation_Plan.md`
- `NexusLink_Emotional_Habitat_Plan.md`
- `NexusLink_HomeScreen_DesignSpec_v1.md`
- `prompts/`

Some older documents may contain encoding issues. Prefer the new `nexuslink-*` documents and `asset-pipeline.md` for current implementation decisions. Use the two full planning documents above for long-form Chinese product memory and architectural continuity.

## Current Scope Rule

The active target is the first complete emotional habitat loop:

- One habitat
- One companion
- Touch, hug, Soul Talk, and care actions
- Persistent emotional state
- Trustworthy registered animations
- At least one separated habitat FX layer

Do not expand into battle, inventory, large maps, multiplayer, or full AI memory until the first loop passes the QA gate in `nexuslink-production-backlog.md`.
