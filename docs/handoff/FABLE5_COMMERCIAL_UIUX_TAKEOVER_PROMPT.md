# Fable 5 Commercial UI/UX Takeover Prompt

Paste this prompt into Claude Code / Fable 5 when starting the next commercial
UI/UX vertical-slice implementation.

```text
You are working in:
C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink

Task:
Prepare and execute the next Nexus Link commercial UI/UX TASK_PACK for the Web
first-session vertical slice.

Primary goal:
Make the commercial First Session Flow and V3 UI/UX feel coherent, readable,
mobile-safe, and production-directed without expanding product scope.

Required pre-read:
1. docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md
2. AGENTS.md
3. CLAUDE.md
4. ACCEPTANCE.md
5. docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md
6. docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md
7. docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md
8. docs/agent/AI_EXECUTION_LEDGER.md, latest relevant lane entries

Important source status:
- docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md is the highest strategic canon.
- Use docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md as the practical
  commercial UI/UX execution entry and compact canon summary.
- docs/architecture/RUNTIME_MAP.md and docs/asset-pipeline.md are useful but
  NEED UPDATE; verify stale facts against current files before relying on them.
- legacy-bible/**, r2-canon/**, and early v0.3/v1 docs are REFERENCE ONLY.

Before editing, report this TASK_PACK:

Task name:
  <commercial UI/UX slice name>

Layer:
  EXPERIENCE unless touching any GROUNDWORK file. If touching GROUNDWORK, stop
  and request explicit human approval first.

Files touched:
  <exact expected files>

Groundwork check:
  State whether this touches any of:
  index.html, src/state/saveManager.js, src/state/store.js,
  src/state/defaultState.js, src/pixi/pixiApp.js, assets/**, tools/**,
  scripts/**.

Red-line check:
  Confirm the plan does not add FOMO, red dots, streaks, daily pressure, absence
  blame, gacha, stores, currency, party systems, dependency copy, therapy claims,
  external LLM, backend, npm, build step, React, TypeScript, or direct state
  mutation.

Non-goals:
  Do not implement battle expansion, party/team play, Steam wrapper, backend,
  external LLM, asset generation, public deployment, or monetization systems.

Acceptance refs:
  ACCEPTANCE.md D, G, H, I, K, plus
  docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md mobile/private-test gates.

First implementation target:
  Start, Local Identity, Heart-Core Guidance, Home, Explore, Care, Growth,
  Memory, Soul Talk, and Return Echo as one commercial UI/UX vertical slice.

Design rules:
  - Use the V3 moonlake visual system.
  - Preserve Greyshade Cat and Moonlake as the first-session focus.
  - Keep one active companion.
  - Keep text-heavy UI in DOM.
  - Keep Pixi responsible for habitat, companion, motion, and traces.
  - Protect the companion focal zone on 390x844 mobile.
  - Use short, concrete copy.
  - Make boundary and refusal readable as companion agency, not punishment.
  - Make return continuity warm but non-blaming.

Forbidden without separate human approval:
  - index.html
  - src/state/saveManager.js
  - src/state/store.js
  - src/state/defaultState.js
  - src/pixi/pixiApp.js
  - assets/**
  - tools/**
  - scripts/**

Verification expectation:
  - Run syntax checks for changed JS.
  - Run docs/qa/state-onboarding-migration-cases.mjs if onboarding or state-adjacent
    behavior is touched.
  - Run python docs/qa/_run_web_release_gate.py when the environment supports it.
  - Browser-check 390x844 and desktop viewports.
  - Record any real-device Safari/Chrome gaps honestly.
  - Append ledger entries to each affected lane before final report.

Do not commit or push unless the human explicitly asks.
```
