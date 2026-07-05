# Branch Reconciliation Report (TP-1A)

Date: 2026-07-05
Author: Claude Fable 5 (TP-1A review session)
Status: analysis + recommendation only — all git actions below are
human-executed or human-instructed (standing no-commit/no-push rule).

## 1. Current branch state

| Fact | Value |
| --- | --- |
| Checked-out branch | `chore/install-ai-workflow-tools` |
| Ahead of `main` | 1 commit: `f7a72fb` — `.gitignore` only (+11 lines, GSD Core install artifacts) |
| Behind `main` | 1 commit: `0e448ae` — art style target docs (5 doc files, incl. `docs/agent/AI_EXECUTION_LEDGER.md` +12) |
| `main` vs `origin/main` | In sync (0/0) |
| File overlap between the two divergent commits | None (`.gitignore` vs docs) — rebase/merge of the **commits** is conflict-free |

## 2. Dirty files after this review (all uncommitted)

**Nuwa v0.1 package (Codex, classification KEEP_CANDIDATE — see
`NUWA_ADVISORY_PACKAGE_REVIEW.md`):**

- `src/ai/raphaelTrainingAdapter.js` (M)
- `src/ai/testHarness/raphaelTrainingBundleCases.js` (M)
- `docs/raphael/RAPHAEL_NUWA_DISTILLATION_SPEC.md` (untracked)
- `src/data/ai/raphaelNuwaDistillationBundle.js` (untracked)
- `docs/agent/AI_EXECUTION_LEDGER.md` (M — shared file, contains the Codex Nuwa entry)

**FABLE5-P0 audit package (Claude Fable 5, 2026-07-05, keep):**

- `docs/agent/FABLE5_CURRENT_STATE_RECONCILIATION.md` (untracked)
- `docs/agent/AI_MODEL_USAGE_LEDGER.md` (untracked)
- `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md` (untracked)
- `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` (untracked)
- `docs/agent/AI_EXECUTION_LEDGER.md` (M — shared file, contains the FABLE5-P0 entry)

**TP-1A review package (this session):**

- `docs/agent/NUWA_ADVISORY_PACKAGE_REVIEW.md` (untracked)
- `docs/agent/BRANCH_RECONCILIATION_REPORT.md` (untracked, this file)
- `docs/agent/AI_EXECUTION_LEDGER.md` (M — TP-1A entry appended)

No unknown dirty files. Backups of the tracked diff and the two untracked
Nuwa files exist in the workspace root (see review doc §9).

## 3. Is the branch safe to continue on?

Yes, short-term. The divergence is two innocuous commits with no file
overlap, and `main` is not moving underneath us (matches `origin/main`).
But the project convention is single-line development on `main`, so the
branch should be reconciled at the next commit point rather than allowed to
drift further.

## 4. Recommended reconciliation sequence (human-executed)

1. **Commit on the current branch** (keeps all work anchored; nothing left
   floating):
   - Commit A: Nuwa v0.1 package (5 files incl. ledger as-of-Nuwa-entry) —
     or a single combined commit if the human prefers; separate commits give
     cleaner revert lines.
   - Commit B: FABLE5-P0 docs (4 files + ledger entry).
   - Commit C: TP-1A review docs (2 files + ledger entry).
2. **Rebase onto main:** `git rebase main` — expected clean for code/docs
   (no file overlap between the divergent commits). One caveat: `0e448ae`
   and our commits both append entries to `AI_EXECUTION_LEDGER.md`; the
   entries insert at different lane positions (Lane 2 art vs Lane 1/Lane 3),
   so auto-merge is likely but a small manual conflict in that one file is
   possible. Resolution rule if it happens: keep BOTH entries, ours above or
   below the art entry by date within each lane; never delete either.
3. **Fast-forward main:** `git checkout main && git merge --ff-only
   chore/install-ai-workflow-tools` (or `git push origin
   chore/install-ai-workflow-tools:main` after local FF), then push per the
   human's release habit. `origin/main` drives the GitHub Pages demo, so
   pushing publishes — separate explicit approval per standing rules.
4. Optionally delete the side branch after FF to restore the
   single-branch convention.

Merge (instead of rebase) is also acceptable but pollutes the linear
history the repo has kept so far. Switching to `main` and cherry-picking
would strand the branch's `f7a72fb`; not recommended.

## 5. Exact next safe action

Human reviews `NUWA_ADVISORY_PACKAGE_REVIEW.md` (verdict: KEEP_CANDIDATE →
commit) and, if accepted, executes §4 steps 1–3. After reconciliation,
TP-1B (Product Quality / Fun Factor Audit) and the rest of
`docs/agent/NEXT_AI_TASK_PACK_QUEUE.md` (TP-2 status refresh, TP-3 eval
pack incl. the F1 collision fix) unblock. Until the human commits, no AI
should edit the five Nuwa files; docs-only additions elsewhere remain safe.
