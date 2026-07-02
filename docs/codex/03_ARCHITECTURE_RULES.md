# 03 — Architecture Rules

This file gives Codex a compact rule layer for Nexus Link architecture work.

## Runtime Stack

Current approved runtime stack:

- HTML
- CSS
- Vanilla JavaScript ES Modules
- PixiJS v8 through CDN
- localStorage through the approved save layer
- GitHub Pages-compatible static hosting

Current prohibited stack changes unless the human explicitly approves:

- React
- Vue
- Svelte
- TypeScript
- CSS frameworks
- backend services
- databases
- LLM APIs inside the product runtime
- npm dependencies
- build steps

## High-Risk Groundwork Files

Treat these as high-risk and do not modify without explicit task scope:

- `index.html`
- `src/pixi/pixiApp.js`
- `src/state/saveManager.js`
- `src/state/store.js`
- `assets/**`
- `tools/**`
- `scripts/**`

When a task touches any of these, state:

- why the change is required
- exact files touched
- safety red-line check
- rollback plan
- manual verification steps

## RaphaelCore Boundary

RaphaelCore must remain:

- safety-gated
- memory-bearing
- boundary-aware
- companion-agnostic
- game-integrated

RaphaelCore must not become:

- a generic chatbot
- a sycophantic assistant
- a therapy or crisis bot
- a tool-using web agent
- a customer-service assistant
- an unbounded NPC dialogue bot

Gateway, routing, classification, or model-choice layers may advise, but they cannot override RaphaelCore safety, boundary, memory, state-delta, or response policy.

## Save-State Rule

Do not mutate save state directly outside approved state/store/saveManager paths.

If state shape changes are necessary:

1. inspect existing default state and normalization
2. add backward-compatible normalization
3. preserve old saves
4. document migration behavior
5. test first-load and existing-save paths

## Companion Runtime Rule

Runtime model:

- single active companion
- no party system
- no multi-companion same-scene lineup
- no multi-companion combat team
- no dispatch system
- no offline farming
- no ranking pressure

Future companion unlocks should be chapter-gated or story-gated, not gacha, rarity, streak, or power-progression pressure.

## Visual Asset Rule

New companion runtime assets should use the current illustrated/high-detail direction unless the human explicitly requests legacy pixel work.

Baseline companion asset expectations:

- clean transparent PNG
- no baked-in background
- no UI frame
- no display pedestal
- no text
- bottom-center anchor
- avoid foot sliding across animation swaps
- respect mobile GPU memory constraints

## Unity/Pipeline Rule

Unity/UModeler may be used as an external asset-production pipeline.

Do not assume Unity is the main runtime.

Any repeatable Unity action should become a deterministic Editor Script and, where possible, a batchmode command.

Allowed Unity pipeline output examples:

- layered PNGs
- PixiJS scene manifests
- prefab validation reports
- sprite anchor reports
- asset readiness reports

## Dependency Rule

Do not introduce external dependencies merely for convenience.

If a task seems to require a dependency, first provide a no-dependency alternative. Only proceed with dependency introduction after explicit human approval.

## Scope Rule

Do not expand tasks opportunistically.

Bad pattern:

> While touching the scene loader, also refactor saveManager, UI routing, and companion state.

Correct pattern:

> Complete the requested layer loader change only. Record adjacent risks as follow-up tasks.

## Verification Rule

For every code change, provide at least one verification path:

- browser manual test
- static check
- targeted smoke test
- asset validation script
- before/after screenshot checklist
- diff review instructions

If automated tests do not exist for the touched area, say so explicitly.
