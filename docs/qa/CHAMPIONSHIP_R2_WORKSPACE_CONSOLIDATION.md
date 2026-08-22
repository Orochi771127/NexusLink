# Championship R2 Workspace Consolidation

Audit date: 2026-08-23 (Asia/Taipei)

## Decision

The only active implementation workspace for the Championship web-parity lane is:

- Workspace: `C:\Users\User\Documents\Playground\NexusLink-championship-web-parity-r2`
- Branch: `codex/championship-web-parity-r2`
- Local checkpoint: `b3f5a5099420fc7f2a5df5089a246601a6d69599`
- Comparison base: `origin/main` at `e3d5ceca08c9cf89f4e36ade4100363b6cc1e5db`

Do not create `R3`, `final`, `new`, `new2`, or another Championship implementation
directory to continue this lane. New bounded work must land in the active workspace
above and must pass its release gates before publication.

## Safety boundary

- No worktree, branch, file, commit, or remote reference was deleted by this audit.
- No stash, reset, clean, branch rewrite, push, PR, merge, or deployment was performed.
- Cursor is not an active implementer for this lane. Codex and explicitly selected
  bounded subagents own implementation and review until the Owner changes that rule.
- An archive or removal label is an audit classification, not deletion authority.

## Live inventory snapshot

The shared repository currently exposes 32 local worktrees, 42 local branches, and
38 `origin/*` remote-tracking branches after a live `git fetch --prune origin`.
Twenty-eight worktrees belong to other NexusLink lanes and are outside this
Championship consolidation decision; they remain untouched and require their own
owner-specific audit before any cleanup.

The four Championship worktrees are classified as follows:

| Workspace | Branch / state | HEAD | Audit classification | Action |
| --- | --- | --- | --- | --- |
| `NexusLink-championship-web-parity-r2` | `codex/championship-web-parity-r2` | `b3f5a50` | `ACTIVE_CANONICAL_WORKSPACE` | Continue R2-A, R2-B, and R2-C here only. |
| `NexusLink-championship-domain-r1` | `codex/championship-domain-r1` | `3264be8` | `ARCHIVE_READ_ONLY` | Do not implement here; retain until Owner approves cleanup. |
| `NexusLink-championship-agent-g` | detached | `3264be8` | `ARCHIVE_READ_ONLY` | Do not implement here; retain until Owner approves cleanup. |
| `NexusLink-championship-r1-owner-gate` | `codex/championship-r1-owner-gate` | `36a5cd7` | `MERGED_REMOVAL_CANDIDATE` | PR #220 is merged and its tree equals live `origin/main`; removal still requires explicit Owner approval. |

All four Championship worktrees were clean at this inventory snapshot. The active
R2 workspace may become intentionally dirty again only for one bounded, reviewed
implementation slice at a time.

## Open GitHub pull requests

Live GitHub inspection found two open pull requests:

| PR | State | Scope relationship | Championship action |
| --- | --- | --- | --- |
| [#216](https://github.com/Orochi771127/NexusLink/pull/216) | Draft / needs review | Cursor Cloud development-environment instructions | Not an R2 dependency; do not use it to authorize Cursor or merge environment changes. |
| [#219](https://github.com/Orochi771127/NexusLink/pull/219) | Open / needs review | Native habitat and wild-capture design document | Product-adjacent reference only; it grants no R2 runtime, save, navigation, or publication authority. |

## Single-workspace operating rule

1. Start from the active R2 workspace and record the current immutable checkpoint.
2. Give each subagent a bounded role and non-overlapping owned paths.
3. Keep runtime authority, presentation, save, evidence, and QA boundaries explicit.
4. Run negative tests and browser playtests before every checkpoint commit.
5. Commit only the reviewed slice. Do not push or merge without the next explicit
   publication gate.
6. If external implementation help is later needed, prepare one SHA-pinned task
   pack rather than creating another local version directory.

## Next bounded sequence

- R2-A: build the sanitized 216-resource by 40-slot structural animation registry;
  unknown mappings remain `UNKNOWN` and no source asset is imported or executed.
- R2-B: add a versioned in-memory save contract only after loading the save-system
  governance skill; production persistence remains separately gated.
- R2-C: implement one HM Hunt/collection vertical slice with deterministic map
  collision and game-first browser playtesting; it must not infer unknown ROM
  semantics or unlock blocked BM/Arena/network families.
