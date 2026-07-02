# Fable 5 Raphael Agent Handoff Prompt

Paste this prompt into Claude Code / Fable 5 when starting Raphael AI work.
This is separate from the commercial UI/UX takeover prompt.

```text
You are working in:
C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink

Task name:
Raphael Agent System Phase A

Goal:
Help mature Raphael into a reusable AI companion / creature engine while
preserving RaphaelCore as the final authority for safety, boundary, memory,
state proposals, and player-facing response policy.

This is not a generic autonomous agent project.
This is not a chatbot upgrade.
This is not a therapy, crisis, customer-service, web-search, or tool-using
assistant.

Required pre-read:
1. AGENTS.md
2. CLAUDE.md
3. ACCEPTANCE.md
4. docs/agent/AI_EXECUTION_LEDGER.md, latest Raphael lane entries
5. docs/raphael/RAPHAEL_CONSTITUTION.md
6. docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md
7. docs/handoff/RAPHAEL_AI_HANDOFF.md
8. docs/architecture/RAPHAEL_AGENT_SYSTEM_ARCHITECTURE_V1.md
9. docs/raphael/RAPHAEL_LOCAL_ARTIFACT_INVENTORY.md

Known source-quality note:
- Some older Raphael Chinese docs may render as mojibake in this checkout.
  Treat those files as authority references but do not copy corrupted visible
  text into runtime code or new docs. Prefer stable English boundary wording
  from RAPHAEL_SOUL_ARCHITECTURE_V1.md and the artifact inventory.

Before editing, report this TASK_PACK:

Task name:
  <specific Raphael work package>

Layer:
  EXPERIENCE/docs/eval unless touching any GROUNDWORK file. If touching
  GROUNDWORK, stop and request explicit human approval first.

Files touched:
  <exact expected files>

Groundwork check:
  State whether this touches any of:
  index.html, src/state/saveManager.js, src/state/store.js,
  src/state/defaultState.js, src/pixi/pixiApp.js, assets/**, tools/**,
  scripts/**.

Red-line check:
  Confirm the plan does not add FOMO, red dots, streaks, daily pressure,
  dependency copy, therapy claims, external LLM live routing, API keys,
  backend dependency, npm, build step, React, TypeScript, direct state mutation,
  auto-memory writes, or gateway override of RaphaelCore.

Non-goals:
  Do not deploy.
  Do not commit or push.
  Do not connect external APIs.
  Do not alter save schema.
  Do not alter companion data.
  Do not alter Pixi renderer.
  Do not implement Telegram, n8n, voice, robot, or live gateway connectors in
  NexusLink runtime during Phase A.

Phase A allowed work:
1. Improve Raphael local artifact inventory and architecture docs.
2. Expand Soul Talk naturalness eval cases.
3. Design, but do not live-wire, a Raphael Agent Console.
4. Design player-teaches-Raphael local learning UX.
5. Add mock-only QA cases for daily conversation, life conversation, boundary
   pressure, high-risk safety, canon known/unknown questions, and preference
   adaptation.
6. Propose adapter boundaries for the sibling raphael-ai-engine repo.

Hard rules:
1. RaphaelCore remains final authority.
2. safetyShield always wins before gameplay, reward, memory, trace, animation,
   external advice, or training suggestions.
3. Training bundles, LangGraph, Gateway, and model outputs are advisory only.
4. Advisor output must be treated as trusted:false unless a future human
   approved contract says otherwise.
5. No raw player text may enter global training.
6. Local player learning can persist only in an approved sidecar or existing
   local policy path, never through a surprise save schema change.
7. Memory proposals are proposals; auto-write requires existing RaphaelCore
   memory policy gates.
8. High-risk input must not become gameplay, reward, challenge, task, or
   relationship progress.
9. Dependency pressure must route to boundary support, not intimacy reward.
10. Any connector to Telegram, n8n, voice, robot, external LLM, or backend must
    stay outside the live NexusLink frontend until separately approved.

Preferred first outputs:
- docs/raphael/RAPHAEL_LOCAL_ARTIFACT_INVENTORY.md updates if new sources are
  found.
- docs/architecture/RAPHAEL_AGENT_SYSTEM_ARCHITECTURE_V1.md updates if the
  architecture changes.
- docs/qa or src/ai/testHarness eval cases only if runtime code remains
  untouched or minimally touched.
- A final report with changed files, tests, risks, rollback, and
  READY_FOR_CODEX_REVIEW / NOT_READY_FOR_CODEX_REVIEW.

Verification expectation for docs-only work:
- git diff --check
- Confirm no src/state, src/pixi, assets, package, or deployment files changed.
- Append a ledger entry to the Raphael lane before final report.

Verification expectation for eval/runtime-adjacent work:
- Syntax check changed JS.
- Run relevant Raphael smoke / NLU / training / preview cases.
- Run state onboarding migration if state-adjacent behavior is touched.
- Run web release gate only when environment supports it.
- Browser-check Soul Talk if UI behavior is touched.

Do not commit or push unless the human explicitly asks.
```

