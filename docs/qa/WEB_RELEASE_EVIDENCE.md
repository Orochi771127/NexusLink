# Nexus Link Release-Candidate Evidence

This document records evidence for the current web release candidate. Automated
green gates are necessary but do not constitute human launch approval, legal
approval, a Steam build approval, or proof of open-domain conversation quality.

## Candidate identity and decision

| Field | Current truth |
| --- | --- |
| Runtime commit | `c7563379af9989d852a0df259787e2416590f4f5` |
| RC Docs/QA closure commit | `220e2fdbefaa4a2a7ecc2e853f68869bc4560d81` |
| Release-engineering bootstrap commit | `71dcc937f717b4292664576549d0117feef3777c` |
| Release-engineering final pin commit | `0539cfa8f4b92f7024d6e3400d4efaade38b4bf1` |
| Branch | `main` |
| Publication | Owner-authorized bootstrap completed; this truth-sync uses the protected PR path and changes no runtime |
| Current release-engineering package | Pages payload exclusion plus repo-native CI; unrelated protected `output/**` remains out of scope and on disk |
| Automated RC gate | `PASS` |
| GitHub `web-release-gate` | `PASS` on exact final pin SHA; Actions app `15368`; annotations 0 |
| Pages payload | `PASS` at `788,619,492 bytes` (`<850 MB` target) |
| `main` ruleset | `ACTIVE`: `main-release-protection` ID `19037733`, no bypass |
| GitHub Pages deployment | `DEPLOYED` |
| Public launch | `NOT APPROVED` |
| Steam build | `NOT READY / NOT IN THIS PACKAGE` |

The automated result is therefore **`AUTOMATED_RC_PASS`**, not
`LAUNCH_READY`. Public launch remains blocked by the human gates listed below.

## Local automated gate

### Exact closure-commit verification

- Commit: `220e2fdbefaa4a2a7ecc2e853f68869bc4560d81`
- Generated: `2026-07-16T15:27:55+0800`
- Result: **17/17 required checks passed** from a clean tracked tree;
  `untrackedOutsideOutput: []`, `protectedOutputUntrackedCount: 886`,
  `runtimeTreeClean: true`, and `runtimeChanges: []`.
- Command used the runner's external evidence destination:

```powershell
python docs/qa/_run_web_release_gate.py --base http://127.0.0.1:5238 --port 5238 --output $env:TEMP\nexuslink-220e2fd-web.json
```

- Temporary evidence SHA-256:
  `5B04D0CC8DFF3A8EA2261A3D36001749CF8F184BA21E820FB65E320EB5C595C1`.

### Tracked pre-commit evidence

- Generated: `2026-07-16T15:21:55+0800`
- Command:

```powershell
python docs/qa/_run_web_release_gate.py --base http://127.0.0.1:5237 --port 5237
```

- Raw evidence: `docs/qa/_web_release_gate_output.json`
- Result: **17/17 required checks passed**, zero accessibility warnings.
- Provenance recorded by the runner: local `HEAD` and `origin/main` both
  `c7563379af9989d852a0df259787e2416590f4f5`; tracked Docs/QA files were dirty,
  `untrackedOutsideOutput: []`, `protectedOutputUntrackedCount: 886`,
  `runtimeTreeClean: true`, and `runtimeChanges: []`.

| Gate | Result |
| --- | ---: |
| JavaScript syntax | 254/254 |
| State/onboarding migration | 33/33 |
| Canonical storage consolidation | 13/13 |
| Companion renderer lifecycle | 26/26 |
| First-session map browser gate | 42/42 |
| Dialogue policy | 21/21 |
| Constitution policy | 5/5 |
| D2 safety terminal invariant | 18/18 |
| D2 live Soul Talk UI | 6/6 |
| Live Soul Talk gate | 11/11 |
| Live HUD gate | 13/13 |
| Asset integrity / restricted agent / remaining browser gates | PASS |
| Console and accessibility blockers | 0 |

The map gate includes fresh/veteran K9 behavior, four phase-search choices,
close/Escape/panel-switch encounter cancellation, persistence, reduced motion,
and the 390x844 viewport path.

## GitHub release-gate bootstrap evidence

- Workflow: `.github/workflows/release-gate.yml`
- Exact commit: `71dcc937f717b4292664576549d0117feef3777c`
- Run: <https://github.com/Orochi771127/NexusLink/actions/runs/29485275670>
- Required check context: `web-release-gate`
- Result: **PASS** in **3m40s**; the repo-native Web gate step passed and one
  compact `web-release-gate.json` artifact was uploaded.
- Runtime contract: read-only repository permission, Python 3.12, Node 24,
  Playwright 1.60.0, 30-minute timeout, PR/main/manual triggers, no repository
  artifact upload, and sparse exclusion of the two non-runtime Pages paths.

The initial run exposed a deprecation annotation because the previously
approved action majors still declared Node 20. The current follow-up pins the
official Node 24 action releases by immutable commit SHA. Exact final pin commit
`0539cfa8f4b92f7024d6e3400d4efaade38b4bf1` passed run
<https://github.com/Orochi771127/NexusLink/actions/runs/29486173817> in **4m0s**
with check app ID `15368`, conclusion `success`, and 0 annotations.

Ruleset <https://github.com/Orochi771127/NexusLink/rules/19037733> is active for
`refs/heads/main`. It has no bypass actors, requires an up-to-date
`web-release-gate`, requires the PR path with 0 approvals for the sole-owner
repository, and blocks branch deletion plus non-fast-forward updates.

## Raphael conversation evidence

### Sealed holdout — supporting machine evidence

- Generated: `2026-07-16T13:42:59+0800`
- Raw evidence: `docs/qa/_raphael_conversation_holdout_output.json`
- Result: 12 sessions, 48 turns, **48/48 hard checks passed**, 0 quality flags,
  0 console errors.
- `humanBlindReview`: `not_run`.

This sealed deterministic holdout is regression evidence. Its `hardGateOk`
field cannot replace the repo-native D2 mutation/UI gates or the independent
private-blind review.

Exact closure-commit rerun `220e2fd` generated at
`2026-07-16T15:27:58+0800`: **48/48**, 0 quality flags, 0 console errors,
`humanBlindReview: not_run`. Temporary evidence SHA-256:
`AE5DD7C521AA39A69F204F786932C694CCAB0A4DE2E222EA4744CD301164E2A7`.

### Independent private-blind review — human evidence

- Protocol: `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`
- Required sample: at least 3 independent testers x 20 scored turns each.
- Current status: **`NOT_RUN`**.

The historical `RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md` is provenance only.
It is explicitly invalidated as current launch evidence and cannot be counted
as the private-blind sample.

## Deployed GitHub Pages evidence

- Public URL: <https://orochi771127.github.io/NexusLink/>
- Deployed release-engineering commit: `0539cfa8f4b92f7024d6e3400d4efaade38b4bf1`
- Runtime code remains frozen at: `c7563379af9989d852a0df259787e2416590f4f5`
- Pages action: <https://github.com/Orochi771127/NexusLink/actions/runs/29486171482>
- Generated deployed QA: `2026-07-16T17:04:30+08:00`
- Temporary deployed evidence SHA-256:
  `B04BF7B9502A2F9044501BA1B734011E2AE01B35AA0BE6C387F5C693E2A35600`

| Deployed probe | Result |
| --- | ---: |
| Raphael harness smoke | 17/17 |
| NLU smoke | 8/8 |
| Stage 4 automated cases | 12/12 |
| D2 safety terminal invariant | 18/18 |
| First-session map browser gate | 42/42 |
| Initial Bond through live Soul Talk and main-save persistence | PASS |
| Pixi canvas count | 1 |
| Console errors | 0 |

The deployment is reachable and its automated probes pass. Jekyll loaded the
root `_config.yml`; the Pages artifact is **788,619,492 bytes**, down from
**1,741,516,299 bytes** and below the `<850 MB` target. A representative runtime
asset and the app root returned HTTP 200; representative `output/**` and
`assets/reference/**` URLs returned HTTP 404 as intended. This is not yet a
release approval. The committed CI produces the required check context and the
approved `main-release-protection` ruleset now enforces it on `main`.

## Human launch gates still open

| Gate | Status | Required evidence |
| --- | --- | --- |
| Real-device D1/D2/D3/D6 matrix | `NOT_RUN` | iPhone Safari, Android Chrome, iPhone LINE webview, and desktop Chrome coverage recorded in `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md` |
| Moderated first-session comprehension | `NOT_RUN` | 3 independent participants using `docs/testing/PRIVATE_TEST_SCRIPT.md`; product comprehension and non-punitive boundary findings recorded |
| Raphael private-blind | `NOT_RUN` | 3 independent testers x 20 scored turns; thresholds in `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md` met |
| Legal, privacy, store copy, and material-rights review | `NOT_RUN` | Human approval of user-facing claims, consent/privacy handling, safety wording, and distributable assets |
| Public launch approval | `NOT_GRANTED` | Owner reviews all evidence above and explicitly approves release |

## Evidence taxonomy

- `automated_regression`: deterministic code, policy, mutation, and browser checks.
- `sealed_holdout`: deterministic hidden-case conversation regression; supporting
  evidence only.
- `deployed_automated_regression`: probes against the public Pages build.
- `moderated_product_comprehension`: human first-session UX evidence.
- `private_blind`: independent human conversation-quality evidence.
- `real_device` and `legal_review`: human release evidence.

No automated Stage 4 case, sealed holdout, or historical review worksheet may be
relabeled as private-blind, real-device, legal, or public-launch approval.

## Release decision

- Exact runtime candidate: **frozen at `c756337`**.
- Local automated RC gate: **PASS**.
- GitHub `web-release-gate` bootstrap: **PASS**.
- Pages payload target and deployed probes: **PASS**.
- `main` ruleset: **ACTIVE AND API-VERIFIED**.
- Deployed Pages automated probes: **PASS**.
- Independent private-blind, moderated first-session, real-device, and
  legal/privacy gates: **OPEN**.
- Public launch: **NOT APPROVED**.
