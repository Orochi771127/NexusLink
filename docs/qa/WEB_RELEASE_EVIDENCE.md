# Nexus Link Web Release Evidence

This file records the current Package 9 web-demo release evidence. It is not a
desktop wrapper approval, Steam build approval, legal approval, or public release
approval.

## Current release-candidate run

- Date: 2026-06-28 01:04 +0800
- Branch: `integrate/ui-v2-raphael-main`
- Baseline before Package 9: `a667853`
- Command:

```powershell
python docs/qa/_run_web_release_gate.py
```

- Raw local output: `docs/qa/_web_release_gate_output.json`
- Result: `PASS` for automated required web gate, with manual follow-up required.

## Automated gate summary

| Gate | Status | Evidence |
| --- | --- | --- |
| JS syntax | `PASS` | 168 checked files, 0 failures |
| Save / onboarding migration | `PASS` | 7 cases, 0 failures |
| Asset integrity | `PASS` | active manifests present; sheet grids exact; anchors bottom-center; no `>4096` sheet edge failures |
| Raphael restricted habitat agent | `PASS` | 7 cases, whitelist/forbidden-key checks pass |
| Raphael core smoke | `PASS` | 17/17 pass, 0 console errors |
| NLU smoke | `PASS` | 8/8 pass, 0 console errors |
| Stage 4 human-feel harness | `PASS` | 10/10 pass, 0 console errors |
| Live UI gate | `PASS` | Soul Talk 10/10; HUD 13/13; awakening/touch/storage/Pixi OK; 0 console errors |
| Responsive/browser probe | `PASS WITH WARNING` | 390x844 and 1280x900 pass: 1 canvas, 5 nav buttons, Soul Talk input visible, no unlabeled buttons, no horizontal overflow |

## Active runtime asset evidence

| Companion | Animations | Unique sheets |
| --- | ---: | ---: |
| `greyshade-cat` | 34 | 26 |
| `flame-flicker` | 29 | 29 |
| `ice-talon` | 29 | 29 |
| `stone-shard` | 29 | 29 |
| `vine-twist` | 29 | 29 |
| `crystal-rabbit` | 29 | 29 |

## Accessibility warning

The automated probe found focusable controls inside `aria-hidden` scope in both
viewports:

- `mobile_390x844`: 15 focusable hidden entries
- `desktop_1280x900`: 15 focusable hidden entries

This Package 9 pass does not change runtime focus management. Before public web
release, open a separate runtime/accessibility task to review modal/panel
`aria-hidden`, focusability, and possibly `inert` handling.

## Manual gates still required

| Gate | Status | Required evidence |
| --- | --- | --- |
| Real mobile device | `PENDING HUMAN` | iPhone Safari/Chrome or Android Chrome pass with no safe-area, nav, or Soul Talk input blocker |
| Desktop browser pass | `PENDING HUMAN` | Desktop Chrome/Edge/Safari at 1280x800+ with no blocking console/runtime issue |
| Moderated private test | `PENDING HUMAN` | 3 testers minimum using `docs/testing/PRIVATE_TEST_SCRIPT.md`; at least 2/3 understand memory, boundary, and habitat change; 0/3 read boundary/refusal as punishment |
| Legal/privacy/store copy | `PENDING HUMAN` | Human approval of privacy, safety wording, and store-facing claims |
| `aria-hidden` focus-management review | `PENDING HUMAN` | Runtime accessibility follow-up resolves or explicitly accepts current warning |

## Release decision

- Automated web release gate: `PASS`.
- Public web release: `NOT APPROVED YET`.
- Steam desktop demo / wrapper: `N/A` for Package 9; remains blocked until
  Package 10 Desktop Wrapper ADR after web demo and private test approval.

## Rollback

Package 9 is QA/release documentation only. Revert the Package 9 commit to
remove the checklist, private-test script, evidence record, release runner, and
ledger entries. No runtime rollback is required.
