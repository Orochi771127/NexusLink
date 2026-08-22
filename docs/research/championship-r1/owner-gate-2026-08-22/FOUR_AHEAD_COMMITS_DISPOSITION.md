# FOUR AHEAD COMMITS DISPOSITION

Date: 2026-08-22 (Asia/Taipei)
Compared refs: `origin/main@3b9624e8` and `feature/2d5-ro-habitat-agent-skills@7a18031a`

## Executive decision

No ahead commit is required in the Championship R1 baseline. Do not cherry-pick the four commits as a group or individually into `codex/championship-domain-r1`.

This is a scope and ancestry decision, not a judgment that all historical ideas in those commits are valueless. Any still-desired Raphael or mobile behavior must first be reproduced against current `main`, then handled in a separate focused issue/branch/PR.

## Patch-equivalence evidence

`git cherry -v origin/main HEAD` reported:

```text
+ 2b7c193ef96b3a0edfb5499c2d9fb4457f866122 docs: formalize multi-runtime technical constitution
- cb38c6e0e4fd369bdef0bb625e7e794c794d7c05 fix(web): resolve five mobile layout defects reported from private playtest
+ 28d3a1a99f064da6d7c86c5932538a9cf7954d70 fix(ai): ground coffee talk and vary consecutive boundary refusals
+ 7a18031a28c92548eff535a69da86a5cd6b87dc0 fix(ai): ground boss-scolding vents instead of empty lake pack
```

`-` means an equivalent patch is already upstream. `+` means no patch-equivalent commit was found; it does not mean the commit is appropriate to port.

## Per-commit disposition

| Commit | Subject | Evidence on current main | Disposition |
|---|---|---|---|
| `2b7c193` | docs: formalize multi-runtime technical constitution | Current main already carries a later multi-runtime constitution and Master Canon amendments that permit bounded TypeScript/npm/build tools while retaining deployment and dependency controls. Cherry-picking the older document would risk reintroducing stale or conflicting governance. | **DO NOT PORT.** Treat current-main governance as authoritative. |
| `cb38c6e` | fix(web): resolve five mobile layout defects reported from private playtest | `git cherry` marks it patch-equivalent upstream. Current-main history includes the later mobile layout fix (`fd1e015`). | **ALREADY UPSTREAM BY PATCH. DO NOT PORT.** |
| `28d3a1a` | fix(ai): ground coffee talk and vary consecutive boundary refusals | This is Raphael conversation behavior, unrelated to Championship. A current-main live probe still routes the coffee case through a generic response and repeats the same dependency-refusal wording on consecutive boundary requests. The historical patch applies cleanly to the clean snapshot, but it touches shared Raphael reply paths. | **PRESERVE SEPARATELY; DO NOT PORT TO CHAMPIONSHIP.** If the owner wants the fix, create a dedicated Raphael branch/PR from current main and re-run the full AI/release gates. |
| `7a18031` | fix(ai): ground boss-scolding vents instead of empty lake pack | This is Raphael conversation behavior, unrelated to Championship. A current-main live probe still gives the generic lake response for the boss-scolding case. Its QA change depends on the preceding `28d3a1a` test context; the ordered cumulative pair applies cleanly to the clean snapshot. | **PRESERVE WITH `28d3a1a`; DO NOT PORT TO CHAMPIONSHIP.** Keep the fixed order `28d3a1a` then `7a18031`; handle only in a separate Raphael branch/PR. |

For `2b7c193`, the later main commit `92df13d` produces identical result trees for `AGENTS.md`, `CLAUDE.md`, the multi-runtime constitution, the legacy runtime canon, and Master Canon. Its `ACCEPTANCE.md` is a later superset, and subsequent main governance also contains the TypeScript/build-policy amendment. This is why `git cherry` can show `+` while the safe content disposition is still functionally incorporated/superseded rather than missing.

## Verification of the non-port decision

The clean current-main snapshot passed:

- `raphael-vent-work-relationship-life-cases.mjs`: all 13 reported cases;
- `storage-consolidation-cases.mjs`: 22 checks, 0 failed.

These tests do not cover the three live-probed historical cases above; the probes show those gaps still exist on current main. The tests do prove that storage is stable and that the broader current vent suite remains green. Most importantly for this gate, the two fixes are not prerequisites for a Championship baseline, and mixing shared Raphael reply-policy changes into this domain would violate the locked authority boundary.

## Safe follow-up rule

If an owner later wants one of the non-ported behaviors:

1. reproduce the behavior on the then-current `origin/main`;
2. capture a failing focused test;
3. compare against later main implementations before reusing old code;
4. create a separate `codex/` branch and PR;
5. do not combine it with Championship contracts, schemas, reverse tooling, or research UI.

## Gate result

`MUST_PORT_TO_CHAMPIONSHIP_COUNT = 0`
`PATCH_EQUIVALENT_UPSTREAM_COUNT = 1`
`FUNCTIONALLY_INCORPORATED_OR_SUPERSEDED_COUNT = 1`
`PRESERVE_IN_SEPARATE_RAPHAEL_FIX_PAIR_COUNT = 2`
