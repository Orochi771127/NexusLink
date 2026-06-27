# Nexus Link Steam Demo Web Release Checklist

Package 9 owns the web demo release gate and private-test evidence pack. It does
not approve a desktop wrapper, SteamPipe build, legal copy, store page, or public
release by itself.

## Release scope

- Target: web demo / private test build.
- Runtime: current canonical web runtime, no wrapper.
- Storage: existing `nexusLinkR2State:v1` key.
- Companion model: single active companion; Greyshade Cat is the first-session
  focus.
- Raphael: restricted habitat agent only. No external LLM, fetch, tool registry,
  auto-navigation, task pushing, or direct state mutation.

## Hard no-ship conditions

- Any blocking browser console error.
- More than one Pixi canvas, blank first screen, or companion hidden by HUD.
- New save cannot complete Start / Identity / Guidance / Home.
- Existing save loses active companion, memories, traces, or progress.
- High-risk safety input creates ordinary memory, trace, bond reward, task, or
  achievement.
- Raphael opens navigation, fetches, calls tools, or mutates state directly.
- Visible painterly / chunky-pixel conflict in the same first-session scene.
- 390x844 mobile viewport has unusable bottom nav, Soul Talk input, or safe-area
  overlap.
- Private tester interprets boundary/refusal as punishment.

## Automated gate

Run from repo root:

```powershell
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
python docs/qa/_run_web_release_gate.py
```

The runner starts a local `http.server` on port `5173` unless that server is
already running. It writes machine output to:

```text
docs/qa/_web_release_gate_output.json
```

The JSON output is generated evidence and does not need to be committed unless a
human explicitly wants raw QA artifacts checked in.

Required automated checks:

| Gate | Source | Required result |
| --- | --- | --- |
| JS syntax | `src/**/*.js`, `docs/qa/*.mjs` | 0 syntax failures |
| Save migration | `docs/qa/state-onboarding-migration-cases.mjs` | 0 failed cases |
| Asset integrity | `src/data/assetManifest.js` + active animation manifests | all active sheets exist, exact grid, bottom-center anchors, `<=4096` edges |
| Raphael restricted agent | `src/ai/testHarness/raphaelAgentEventCases.js` | 7/7 pass |
| Raphael smoke | `docs/qa/_run_harness_smoke.py` | 17/17 pass, 0 console errors |
| NLU smoke | `docs/qa/_run_nlu_smoke.py` | 8/8 pass, 0 console errors |
| Stage 4 human-feel harness | `docs/qa/_run_stage4_human_playtest.py` | 10/10 pass |
| Live UI gate | `docs/qa/_run_live_playtest_gate.py` | Soul Talk 10/10, HUD 13/13, awakening/storage/touch/pixi OK |
| Responsive/accessibility probe | `docs/qa/_run_web_release_gate.py` | 390x844 and 1280x900 pass; no unlabeled buttons or horizontal overflow; focusable controls under `aria-hidden` are reported as a manual follow-up warning |

## Manual real-device gate

At least one real mobile device must be checked before public release:

- iPhone Safari or Chrome at a narrow viewport.
- Android Chrome if available.
- Desktop Chrome at 1280x800 or larger.

Manual checks:

- Start screen is readable and tappable.
- Local Identity can be skipped.
- Guidance is understandable within 30 seconds.
- First touch and first Soul Talk are legible.
- Bottom nav does not cover Soul Talk launcher/input.
- Explore, Care, Growth, and Memory pages open and return predictably.
- Return Echo after reload is non-blaming.
- Safety or boundary response is not framed as punishment.

## Private test gate

Use `docs/testing/PRIVATE_TEST_SCRIPT.md`.

Minimum private test evidence before release:

- 3 testers minimum.
- Each tester completes fresh first-session flow.
- Each tester answers the three comprehension questions:
  - What does the companion remember?
  - What boundary did the companion show?
  - What changed in the habitat?
- At least 2 of 3 testers must understand all three ideas without coaching.
- No tester should report that refusal/boundary felt like punishment.

## Evidence record

Update `docs/qa/WEB_RELEASE_EVIDENCE.md` after each release-candidate run.

Status labels:

- `PASS`: verified in the current run.
- `FAIL`: verified and failed; release blocked.
- `PENDING HUMAN`: requires a real tester, real device, or non-automated review.
- `N/A`: explicitly out of web-demo scope.

## Rollback

Package 9 is QA/docs-only. Revert the Package 9 commit or remove:

- `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`
- `docs/testing/PRIVATE_TEST_SCRIPT.md`
- `docs/qa/WEB_RELEASE_EVIDENCE.md`
- `docs/qa/_run_web_release_gate.py`
- Package 9 ledger entries

No product runtime rollback is required.
