# NexusLink AI Development Mode

Status: current development workflow proposal, docs-only
Audience: human operator, Cursor, Claude Code / Fable 5, Codex, and future
sidecar automation.
Scope: how to coordinate AI tools around this repository without turning the
NexusLink game runtime into a backend, API, framework, or autonomous agent
platform.

This document does not replace `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`,
`docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, or
`docs/architecture/RAPHAEL_AGENT_SYSTEM_ARCHITECTURE_V1.md`.

## 1. Core Position

NexusLink should use AI agents as a development office around the game, not as
new runtime systems inside the game.

Allowed now:

- AI-assisted planning, review, implementation, QA, and art-pipeline staging.
- Cursor as the human-controlled IDE and diff review surface.
- Codex as repo cartographer, architecture reviewer, file-scope gatekeeper, and
  execution-ledger maintainer.
- Claude Code / Fable 5 as long-form implementer for approved TASK_PACKs.
- codebase-memory-mcp as the first code-discovery layer before grep or manual
  file walking.
- Browser and computer-use tools for local QA, screenshots, and UI inspection
  when a task needs them.
- Image generation, sprite, and product-design skills for staging artifacts
  that remain outside runtime asset paths until human approval.

Not allowed inside the live NexusLink runtime without a separate future
approval:

- LangGraph or CrewAI runtime dependency.
- Streamlit or Gradio app inside the game repo as a product dependency.
- Backend server, database, hosted API, external LLM call, API key, npm
  dependency, build step, React, TypeScript, or framework.
- Any tool or agent writing directly to localStorage, save schema, memories,
  `assets/**`, Pixi core, or GROUNDWORK files.

The correct shape is a sidecar development office:

```text
Human + Cursor
  -> assign bounded TASK_PACK
  -> Claude Code / Fable 5 implements in an isolated worktree
  -> Codex reviews boundaries, tests, ledger, and release gates
  -> human approves commit / push / runtime promotion
```

## 2. Authority Stack

Every AI development flow starts by reading the relevant current files:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `ACCEPTANCE.md`
4. `docs/agent/AI_EXECUTION_LEDGER.md`
5. `docs/agent/AI_WORKFLOW.md`
6. `docs/agent/TASK_TEMPLATE.md`
7. `docs/agent/REVIEW_CHECKLIST.md`
8. Task-specific handoff, architecture, QA, or art-pipeline documents.
9. `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md` when a task includes
   player-facing copy, commercial copy, release copy, or handoff text that may
   be pasted into another agent.

The execution ledger is operational memory only. It cannot override the Master
Canon, `AGENTS.md`, `CLAUDE.md`, or `ACCEPTANCE.md`.

## 3. Eight Development Agents

These are development roles, not in-game autonomous agents. They may be run by
Codex, Claude Code, Cursor Agent, or a future sidecar orchestrator.

| ID | Agent | Primary owner | Responsibility | May modify |
| --- | --- | --- | --- | --- |
| A1 | Canon Steward | Codex / human | Protect product identity, red lines, commercial canon, and no-FOMO rules. | Docs only unless a TASK_PACK allows more. |
| A2 | Repo Cartographer | Codex + codebase-memory-mcp | Read architecture, trace call paths, identify file ownership, and produce safe file scopes. | Docs/reports only. |
| A3 | Gameplay Systems Architect | Codex / Claude | Convert product intent into bounded TASK_PACKs for care, exploration, standoff, memory, and first-session flow. | Docs first; runtime only after approval. |
| A4 | Experience Implementer | Claude Code / Fable 5 | Implement approved EXPERIENCE tasks in isolated worktrees. | Only allowed files in the TASK_PACK. |
| A5 | RaphaelCore Safety Steward | Codex / Claude | Guard safety, boundary, memory, response policy, advisory-gateway limits, and eval cases. | Raphael docs/evals or approved files only. |
| A6 | Art Pipeline Orchestrator | Codex + image/art skills | Create lock specs, generation jobs, QC reports, and review packages. | Staging/output/docs only until approval. |
| A7 | QA Evidence Verifier | Codex / browser tools | Run syntax, smoke, browser, mobile viewport, visual, and release-gate checks. | Reports/ledger only unless approved. |
| A8 | Release Coordinator | Human + Codex | Decide branch, staged files, commit readiness, push readiness, and public verification. | Git actions only after explicit human request. |

No agent owns final approval. Human approval remains the gate for GROUNDWORK,
runtime promotion, commits, pushes, asset approval, and public release.

## 4. Tool And Skill Routing

Use the smallest tool set that fits the task.

| Need | Preferred capability | Rule |
| --- | --- | --- |
| Code discovery | codebase-memory-mcp `search_graph`, `trace_path`, `get_code_snippet`, `get_architecture` | Use before grep for code symbols. |
| Repo state | `git status`, `git diff`, ledger | Always inspect before scoped edits or review. |
| Product/canon planning | Codex + local docs | Keep one authoritative planning file rather than scattered drafts. |
| Copywriting final pass | NexusLink copywriting guide + anti-vibe-writing reference | Preserve meaning, remove generic AI copy, and keep red-line-safe wording. |
| External persona skills | Read-only source audit first | PG, Karpathy, Jobs, Musk, and Nuwa-style skills may inform critique or methodology lenses, but must not be installed, roleplayed, distilled into NexusLink characters, or used as player-facing voices without explicit approval. |
| Long implementation | Claude Code / Fable 5 | Use isolated branch/worktree and a TASK_PACK. |
| Cursor use | Cursor Rules + diff review | Cursor is the operator surface, not the source of authority. |
| Visual QA | Browser/computer-use/Gemini-style review | Review screenshots and mobile viewports; do not mutate runtime from visual review alone. |
| Art generation | imagegen / sprite / product-design skills | Generated images stay in staging until human approval. |
| Raphael maturity | Raphael architecture docs and evals | LangGraph/Gateway output is advisory and `trusted:false`. |
| External research | Web/GitHub/X search | Convert findings into repo-safe docs; do not import frameworks by default. |

## 5. Worktree Model

Use one active editor per worktree.

Recommended shape:

```text
NexusLink main checkout
  - human review, Codex review, small docs-only changes

NexusLink worktree: codex/<task>
  - Codex scoped docs/review or small implementation

NexusLink worktree: fable/<task>
  - Claude Code / Fable 5 implementation

sibling workspace: raphael-gateway-server-langgraph
  - mock-only gateway / LangGraph lab

sibling workspace: nexuslink-ai-office
  - optional future Streamlit/Gradio dashboard and orchestration logs
```

Do not let multiple agents freely edit the same dirty worktree. If the worktree
is dirty, the next agent first classifies whether the changes are related,
protected, or unrelated.

## 6. Development Gates

All AI work follows the existing Gate 0-6 model:

1. Gate 0 - Read-only scan: current branch, git status, ledger, graph index,
   relevant docs, and file ownership.
2. Gate 1 - TASK_PACK: allowed files, forbidden files, red-line check,
   acceptance refs, non-goals.
3. Gate 2 - Human approval when required, especially for GROUNDWORK.
4. Gate 3 - Edit only allowed files.
5. Gate 4 - Local verification: syntax, smoke, browser, release gate, or visual
   checks as appropriate.
6. Gate 5 - Diff review against `docs/agent/REVIEW_CHECKLIST.md`.
7. Gate 6 - Human approval before commit or push.

For short docs-only tasks, Gate 1 and Gate 3 may happen in one Codex turn, but
the final report still states scope, verification, and changed files.

## 7. Sidecar Multi-Agent Office Roadmap

The sidecar office is optional and must not be built inside the live game
runtime.

### Phase A - Manual Small Pilot

Goal: prove the workflow without any API keys, framework, dashboard, or new
dependencies.

Run three roles manually:

1. Research Scout reads local docs, code graph, current ledger, and external
   references if requested.
2. Task-Pack Writer turns the findings into one bounded NexusLink TASK_PACK.
3. Review Gate checks file scope, red lines, acceptance refs, and verification
   plan before implementation.

Output:

- One TASK_PACK.
- One review note.
- One ledger entry if files changed.

### Phase B - Structured Local Logs

Goal: make agent work observable before adding orchestration frameworks.

Each role writes one JSONL event per action to a sidecar or staging log:

```json
{
  "timestamp": "2026-07-04T00:00:00+08:00",
  "agentId": "A2",
  "agentName": "Repo Cartographer",
  "lane": "Game Engineering And Architecture",
  "phase": "Gate 0",
  "status": "completed",
  "inputRefs": ["AGENTS.md", "docs/agent/AI_EXECUTION_LEDGER.md"],
  "outputRefs": ["docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md"],
  "filesTouched": [],
  "redLineRisk": "none",
  "nextAction": "write TASK_PACK"
}
```

Do not write these logs into runtime code paths or save data.

### Phase C - Dashboard Sidecar

Goal: optional operator dashboard after the manual pilot works.

Allowed location:

```text
C:\Users\User\NexusLink_RaphaelAI_Workspace\nexuslink-ai-office
```

Allowed surfaces:

- Streamlit or Gradio dashboard.
- Local JSONL log viewer.
- Pipeline visualization.
- TASK_PACK queue.
- Agent status board.
- Diff and verification evidence summary.
- Link back to files in the NexusLink repo.

Forbidden:

- Installing dashboard dependencies into the NexusLink game repo.
- Writing to `src/**`, `assets/**`, state files, or Pixi files.
- Storing API keys in the frontend repo.
- Applying patches automatically without the human/Codex gate.

### Phase D - LangGraph / CrewAI Sidecar

Goal: orchestrate the eight development roles after Phase A and B pass.

Allowed:

- Mock-only orchestration.
- Local contracts.
- Read-only repo inspection.
- TASK_PACK draft generation.
- Review notes.
- QA command suggestions.

Forbidden:

- Direct runtime patching.
- Direct commits or pushes.
- Live external LLM calls from the NexusLink frontend.
- RaphaelCore override.
- Memory or save mutation.

## 8. Dashboard Panels If Built Later

A future sidecar dashboard should be utilitarian, not a product-facing NexusLink
screen.

Recommended panels:

- Current TASK_PACK and approval state.
- Eight-agent lane status.
- File-scope matrix: allowed, forbidden, touched.
- Red-line checklist.
- Pipeline graph: Gate 0 through Gate 6.
- Live JSONL log stream.
- codebase-memory architecture snapshot.
- Diff summary.
- Verification evidence.
- Open risks and human gates.

It should not be a new game UI, player dashboard, or RaphaelCore console inside
the shipped frontend.

## 9. Cursor Project Rule Seed

If Cursor rules are added later, start from this seed:

```text
Always follow AGENTS.md, CLAUDE.md, ACCEPTANCE.md, and
docs/agent/AI_EXECUTION_LEDGER.md.

Do not modify GROUNDWORK files without explicit human approval:
index.html, src/state/saveManager.js, src/state/store.js,
src/state/defaultState.js, src/pixi/pixiApp.js, assets/**, tools/**,
scripts/**.

Do not add React, TypeScript, npm packages, backend, database, build step,
external LLM calls, API keys, or dashboard dependencies to the NexusLink game
runtime.

Use TASK_TEMPLATE.md for work packages, REVIEW_CHECKLIST.md for diff review,
and append AI_EXECUTION_LEDGER.md before final handoff.
```

## 10. First Recommended Pilot

Run Pilot A before building any Streamlit, Gradio, LangGraph, or CrewAI
implementation.

Pilot A:

- Task: turn a local product question into one approved TASK_PACK.
- Suggested question: "What is the next safest First Session Flow improvement?"
- Agents used: A1 Canon Steward, A2 Repo Cartographer, A3 Gameplay Systems
  Architect, A7 QA Evidence Verifier.
- Output: one TASK_PACK with allowed files, forbidden files, non-goals,
  acceptance refs, and verification plan.
- Success condition: the TASK_PACK can be pasted into Claude Code / Fable 5
  without giving it permission to touch GROUNDWORK.

Only after Pilot A succeeds should the project consider a sidecar dashboard.
