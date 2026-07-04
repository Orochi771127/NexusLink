# NexusLink Multi-Agent Office Pilot Prompt

Paste this into Claude Code / Fable 5, Cursor Agent, or Codex when running the
first small multi-agent development-mode pilot.

```text
You are working in:
C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink

Task name:
NexusLink Multi-Agent Office Pilot A - Research To TASK_PACK

Goal:
Run a docs-only, no-dependency pilot for the NexusLink AI development mode.
The output is one bounded TASK_PACK and one review note. Do not implement the
runtime task yet.

Primary authority:
1. AGENTS.md
2. CLAUDE.md
3. ACCEPTANCE.md
4. docs/agent/AI_EXECUTION_LEDGER.md
5. docs/agent/AI_WORKFLOW.md
6. docs/agent/TASK_TEMPLATE.md
7. docs/agent/REVIEW_CHECKLIST.md
8. docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md
9. docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md

Role model:
- A1 Canon Steward: confirm product identity and red lines.
- A2 Repo Cartographer: inspect code graph and current file ownership.
- A3 Gameplay Systems Architect: write the TASK_PACK.
- A7 QA Evidence Verifier: define the verification plan.

Layer:
Docs-only planning. This is not runtime integration.

Allowed files:
- docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md, only if the development-mode
  rules need clarification.
- docs/handoff/NEXUSLINK_MULTI_AGENT_OFFICE_PILOT_PROMPT.md, only if this
  prompt needs clarification.
- docs/agent/AI_EXECUTION_LEDGER.md, only for the final docs-only ledger entry
  if files are changed.
- A new docs-only TASK_PACK draft, only if the human explicitly asks for a saved
  artifact.

Forbidden files:
- index.html
- src/state/saveManager.js
- src/state/store.js
- src/state/defaultState.js
- src/pixi/pixiApp.js
- src/**
- assets/**
- tools/**
- scripts/**
- package files
- dashboard, backend, Streamlit, Gradio, LangGraph, or CrewAI scaffolds inside
  this repo

Red-line check:
Confirm the pilot does not add FOMO, red dots, streaks, daily pressure,
dependency copy, therapy claims, gacha, currency, external LLM, backend, API
keys, npm, build step, React, TypeScript, direct state mutation, or RaphaelCore
gateway override.

Procedure:
1. Check current branch and git status.
2. Use codebase-memory-mcp first for code discovery:
   - list indexed projects
   - get architecture
   - use search_graph / trace_path / get_code_snippet only if a symbol-level
     question is needed
3. Read the latest relevant execution-ledger entries.
4. Read the authority files above.
5. Choose one small product/development question.
6. Produce one TASK_PACK using docs/agent/TASK_TEMPLATE.md.
7. Review it using docs/agent/REVIEW_CHECKLIST.md.
8. Stop before implementation.

Recommended first product question:
What is the next safest First Session Flow improvement that can be implemented
without touching GROUNDWORK?

Required output:
1. Current branch and dirty/clean state.
2. Documents and graph context read.
3. Proposed TASK_PACK:
   - Task name
   - Layer
   - Allowed files
   - Forbidden files
   - Red-line check
   - Non-goals
   - Acceptance refs
   - Verification plan
4. Review note:
   - scope risk
   - safety risk
   - GROUNDWORK risk
   - verification gaps
5. Explicit statement: no implementation, no dependency install, no commit, and
   no push were performed.

Do not build the dashboard yet.
Do not install LangGraph, CrewAI, Streamlit, or Gradio in this repo.
If the human later approves a dashboard, create it in a sibling workspace:
C:\Users\User\NexusLink_RaphaelAI_Workspace\nexuslink-ai-office
```
