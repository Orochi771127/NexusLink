# Raphael Preview Staging Integration Report

Date: 2026-07-02

## Scope

Phase 9 adds QA-only preview comparison between NexusLink live `runRaphaelCore()` and the sibling `raphael-ai-engine`.

Preview output is advisory only:

- `trusted: false`
- `appliedToLive: false`
- no `statePatch`
- no chat write
- no memory write
- no trace write
- no animation trigger
- no save schema change

## Files Changed

- `src/app.js`
- `src/ai/external/raphaelPreviewAdapter.js`
- `src/ai/testHarness/raphaelPreviewStagingCases.js`
- `docs/qa/_run_raphael_preview_staging.mjs`

## QA Results

Passed:

- NexusLink preview staging runner: 6/6
- NexusLink state onboarding migration: 8/8
- Syntax checks for changed NexusLink JavaScript: passed
- `raphael-ai-engine` gateway legacy contract: 3/3
- `raphael-ai-engine` gateway maturity: 7/7
- `raphael-ai-engine` full local regression:
  - engine contract: 8 assertions
  - image-derived knowledge: 5/5
  - local learning sidecar: 18 assertions
  - canon retrieval: 12/12
  - critic policy: 6/6
  - NexusLink adapter probe: 9/9
  - base eval: 11/11
  - Phase 4 expanded eval: 167/167
  - canon eval: 12/12
  - critic eval: 6/6
  - gateway eval: 7/7

Blocked / limited:

- Existing Python browser wrappers (`_run_harness_smoke.py`, `_run_nlu_smoke.py`, `_run_stage4_human_playtest.py`, `_run_raphael_main_readiness.py`, `_run_web_release_gate.py`) could not run in the bundled Python environment because `playwright.sync_api` is unavailable.
- In-app browser local smoke loaded the page and confirmed `canvas=1`, Soul Talk launcher exists, and message input exists. It could not conclusively verify `window.__RAPHAEL_PREVIEW_REPORT__` because the in-app browser retained an older module graph during this session. HTTP file reads and Node runner verified the current source.

## Self Review

- No external LLM/API key was added.
- No package dependency was added to NexusLink.
- No save schema, Pixi renderer, assets, companion data, or runtime companion registry files were changed.
- Live Soul Talk still uses existing `runRaphaelCore()` output.
- Preview comparison is only loaded when `?raphaelPreview=1` is present.
- `mock_gateway` unavailable failures are converted to fallback reports and do not affect player-facing behavior.

Recommendation: `READY_FOR_STAGING`, not `READY_FOR_MAIN_LIVE_ROUTING`.
