# Raphael Sovereign Review Remediation R1

Date: 2026-08-09

Branch: `codex/raphael-sovereign-platform-v1`

Evidence class: implementation regression plus sealed holdout; not a human or clinical launch approval

## Outcome

The Claude Code review identified two release-blocking defects and one CI governance gap. All three are repaired in the isolated Sovereign Platform branches. The Gemini review correctly recognized the overall repository split and governance direction, but its PASS conclusion was too broad and several operational details were inaccurate.

No hosted model, database, authentication provider, live Soul Talk cutover, merge, deployment, or public launch is included in this remediation.

## Review assessment

### Valid findings repaired

1. Cross-repository V1 authority mismatch
   - `raphael-ai-engine` emitted `authority.gameMutation: "ClientReducer"`.
   - Nexus Link's strict V1 validator required `"NexusLinkReducer"`.
   - Because both used `1.0.0-draft.1`, an Engine decision could not pass the first-party client validator.
   - Resolution: the V1 contract remains Nexus Link specific and all three runtimes now report `NexusLinkReducer`. A generic reducer identifier is deferred to a versioned future contract instead of silently changing V1.

2. Policy terminals did not fail closed through the full Core pipeline
   - Diagnosis/therapist-role, medication, reality-grounding, and memory-refusal routes intentionally retain `riskLevel: "none"` because they are not acute emergencies.
   - The Core previously treated only `isHighRisk` as terminal. Policy routes could therefore reach memory recall, dialogue/evolution session caches, debug input, animation, and the asynchronous external-advice path.
   - Resolution: all terminal decisions now use the canonical `isSafetyTerminalDecision()` predicate. Policy terminals produce the deterministic system response while blocking recall, session caches, raw-input debug, animation, memory/trace/reward/relationship mutation, Hermes shadow, and external advice.

3. CI executed syntax checks but not the new sovereign safety suites
   - Nexus Link now explicitly executes the psychological-safety and runtime-contract suites in the required release workflow.
   - `raphael-ai-engine`, `raphael-HMAX`, and `aiforge-raphael-corpus` now have dependency-free Node CI workflows using the repositories' real commands and paths.

### Gemini review corrections

- The corpus validation paths are `corpus/concepts/A_concepts.json`, `corpus/sentences/F_sentences.json`, and `corpus/mappings/G_mappings.json`; the shorter paths proposed in the review do not exist.
- The uppercase legacy corpus repository was already archived; no additional archive action is required.
- The old Unity prototype and current Unity scripts contain same-named files with different content hashes. They remain preserved and are not safe deletion candidates.
- `npm install` is unnecessary for these repositories' current dependency-free checks.
- Merge, release tagging, Phase 4 shadow rollout, and production readiness remain premature until their explicit human, clinical, privacy, legal, security, and parity gates are complete.

## Files changed by repository

### Nexus Link

- `src/ai/raphaelCore.js`
- `docs/qa/raphael-psychological-safety-v1-cases.mjs`
- `docs/qa/raphael-runtime-contract-v1-cases.mjs`
- `.github/workflows/release-gate.yml`
- `ACCEPTANCE.md`
- this report and the Raphael lane execution-ledger entry

### raphael-ai-engine

- `contracts/runtimeContract.js`
- `tests/sovereign-runtime-v1.test.mjs`
- `.github/workflows/engine-ci.yml`

### raphael-HMAX

- `tests/hosted-runtime-boundaries.test.mjs`
- `.github/workflows/hmax-ci.yml`

### aiforge-raphael-corpus

- `.github/workflows/corpus-ci.yml`

## Verification

| Scope | Result |
|---|---:|
| Nexus policy/high-risk psychological safety | 14/14 PASS |
| Nexus sovereign runtime contract | 12/12 PASS |
| Existing Nexus safety-terminal invariant | 56/56 PASS |
| Sealed conversation holdout v1 | 48/48 hard PASS; 0 quality flags; 0 console errors |
| Full Nexus Web release gate | 28/28 required PASS; JS syntax 439/439; accessibility warnings 0 |
| Engine sovereign contract | 18 assertions PASS |
| Engine existing contract | 8/8 PASS |
| Engine shadow runner | PASS |
| Engine Nexus adapter probe | 9/9 PASS |
| HMAX hosted boundaries | 15 assertions PASS |
| Corpus JSON validation | 3/3 PASS |
| Git diff whitespace check | PASS in all four repositories |

The full Web release gate was run against a dirty candidate tree because it was validating the uncommitted remediation itself. Its evidence records the exact pre-commit HEAD and the scoped runtime diff. Generated QA output churn was not retained in the patch.

## Publication proof

The reviewed foundations were published through protected pull requests in dependency order on 2026-08-09:

| Repository | Pull request | Published `main` commit | Post-merge workflow |
|---|---|---|---|
| `aiforge-raphael-corpus` | `#2` | `1b6be1fc5c2b1f6fb281335dd9119f5590b0d745` | Corpus Integrity PASS |
| `raphael-ai-engine` | `#1` | `42f6bbbd3e395861d3aa17a51fc1a5db8e4f4387` | Sovereign Engine CI PASS |
| `raphael-HMAX` | `#1` | `30c368ec4921d6311d5a36fc960ef169429d4c83` | HMAX Boundary CI PASS |
| `NexusLink` | `#186` | `92df13d9ea08a9b21439cde4c17efcabcca1b928` | Web Release Gate and Pages deployment PASS |

All four local `main` refs match `origin/main` at `0/0`. Post-merge Codebase MCP indexes were refreshed from trees proven byte-identical to the published `main` trees.

Public Nexus Link verification returned HTTP 200 for `src/ai/raphaelCore.js` and `src/ui/soulTalkController.js`. The public controller imports and calls synchronous embedded `runRaphaelCore()` for the visible Soul Talk turn. It has no `runRaphaelCoreWithExternal` call; the hosted shadow client and async external entry remain module-only with zero live callers. HMAX was merged as a boundary foundation and was not deployed as a public service.

## Remaining non-automated gates

- Raphael private blind review: `not_run` (minimum 3 testers x 20 turns).
- Real-device/browser matrix D1/D2/D3/D6: `not_run` for this package.
- Qualified psychological-professional review and specialist red-team: open.
- Privacy, legal, security, and store-copy reviews: open.
- Hosted infrastructure, OIDC/PKCE, persistent database, KMS, rate limiting, and private model serving: not implemented.
- Owner approval for merge, hosted rollout, and public launch: open.

Automated PASS therefore means the bounded remediation is regression-clean; it does not mean the Sovereign Platform is production-ready.
