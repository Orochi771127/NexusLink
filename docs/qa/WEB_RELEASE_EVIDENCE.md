# Nexus Link Release-Candidate Evidence

This document records evidence for the current web release candidate. Automated
green gates are necessary but do not constitute human launch approval, legal
approval, a Steam build approval, or proof of open-domain conversation quality.

## Candidate identity and decision

| Field | Current truth |
| --- | --- |
| Runtime commit | `c7563379af9989d852a0df259787e2416590f4f5` |
| RC Docs/QA closure commit | `220e2fdbefaa4a2a7ecc2e853f68869bc4560d81` |
| Branch | `main` |
| Publication | Owner-authorized direct-main publication; current status-sync commit changes no runtime |
| Current closure package | Committed tracked Docs/QA-only changes; runtime tree clean; unrelated protected `output/**` remains out of scope |
| Automated RC gate | `PASS` |
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
- Deployed runtime commit: `c7563379af9989d852a0df259787e2416590f4f5`
- Pages action: <https://github.com/Orochi771127/NexusLink/actions/runs/29442524898>
- Generated deployed QA: `2026-07-16T14:04:34+08:00`
- Raw evidence: `docs/qa/_github_pages_qa_output.json`

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

The deployment is reachable and its automated probes pass. It is not yet a
release approval. The latest Pages artifact was reported as 1,741,503,156 bytes,
above the platform's 1 GB warning threshold. Payload reduction is a separate
GROUNDWORK/release-engineering package. The repository also has no committed
GitHub Actions release workflow or branch/ruleset enforcement that makes this
local gate mandatory, so these checks are currently evidence, not enforced CI.

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
- Deployed Pages automated probes: **PASS**.
- Independent private-blind, moderated first-session, real-device, and
  legal/privacy gates: **OPEN**.
- Public launch: **NOT APPROVED**.
