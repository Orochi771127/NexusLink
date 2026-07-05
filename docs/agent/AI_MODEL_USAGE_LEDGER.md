# AI Model Usage Ledger

Created: 2026-07-05 (FABLE5-P0 reconciliation audit)
Purpose: track which model did which work, at what cost, with what fallback,
and how much human rework it caused — so model routing decisions (Fable 5 vs
Codex vs cheaper models) are made on evidence instead of habit.

This ledger complements `docs/agent/AI_EXECUTION_LEDGER.md` (operational
handoff). The execution ledger answers "what happened in the repo"; this
ledger answers "was the model choice worth it".

## Rules

1. One row per TASK_PACK (or per model attempt, if a fallback occurred).
2. Never invent values. If a field was not measured, write `UNKNOWN`.
3. `Cost` is whatever unit the human tracks (USD, credits, subscription
   quota). Do not estimate.
4. `Human rework` = follow-up human/AI time spent fixing that task's output
   (`none` / `minor` / `major` / `UNKNOWN`).
5. `Decision` = keep using this model for this task class, downgrade to a
   cheaper model, or upgrade (`keep` / `downgrade` / `upgrade` / `pending`).
6. Backfilling historical rows is allowed only from execution-ledger
   evidence; every unevidenced field stays `UNKNOWN`.

## Ledger

| Date | Task | Model | Role | Cost | Fallback | Files changed | Verification | Human rework | Decision |
|---|---|---|---|---:|---|---|---|---|---|
| YYYY-MM-DD | <task name> | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | pending |
| 2026-07-05 | FABLE5-P0 reconciliation audit | Claude Fable 5 | Development auditor (docs-only) | UNKNOWN | none used | 4 new docs + execution-ledger entry (see entry) | `git diff --check`; scope check only — no runtime claim | UNKNOWN | pending |

## Historical backlog awaiting backfill

The execution ledger records these model attributions but no cost/fallback/
rework data. Backfill rows above only if the human can supply the missing
fields; otherwise leave listed here with `UNKNOWN` economics.

| Ledger date | Model label in execution ledger | Task |
|---|---|---|
| 2026-07-05 | Codex | Nuwa Distillation Advisory Layer (uncommitted) |
| 2026-07-04 | Codex | Raphael Natural Daily-Life Replies v1; Anti-Vibe Copywriting; NexusLink AI Development Mode |
| 2026-07-04 | Claude Opus 4.8 | Soul Talk keyboard rebuild; content line fill (A2/A4/A5) |
| 2026-07-03 | Claude Opus 4.8 | Phase 2 combat (B1–B4, A3); First-Session legibility pillars; docs SSOT |
| 2026-07-03 | Claude Fable 5 | Soul Talk single-panel rebuild + HUD V3 alignment |
| 2026-07-02 | Claude Fable 5 | First Session UX Repair A + B; Commercial RC pass; i18n P4 |
| 2026-06-28..30 | Claude Code | UI/HUD V2 Aurora pass; keyboard/i18n/settings packs |
| 2026-06-24..07-02 | Codex | ~40 entries across all three lanes (audits, packages 1–9, QA gates, canon syncs) |
| 2026-06-24 | Grok Agent | Stage 4 human playtest pack (PR #87) |

Model-label hygiene note: the execution ledger mixes `Claude Fable 5`,
`Claude Opus 4.8`, `Claude Code`, and `Claude` as agent names. From
2026-07-05 onward, entries should name the actual model (and the surface,
e.g. "Claude Code CLI / Fable 5") so this ledger can be kept accurate.
