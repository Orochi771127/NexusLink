# Raphael Memory Consent Contract V1

## Storage classes and quotas

| Class | Scope | Limit | Default |
|---|---|---:|---|
| working context | session | 8 turns, 2-hour inactivity TTL | ephemeral only |
| shared profile | linked subject | 32 | name, language and explicit shared preferences only |
| semantic facts | product + companion | 64 | minimal structured summaries |
| episodic summaries | product + companion | 128 | complete-turn-only summaries |
| open threads | product + companion | 8 | only when the player explicitly invites a later question |

Each summary is at most 200 Traditional Chinese characters. Recall returns at most three authorized items. A new memory becomes visible only to a later safe turn.

## Eligibility

Non-sensitive daily preferences and shared events may produce a minimal proposal after a completed turn. The UI says Raphael remembered and offers immediate undo. Sensitive health, trauma, sexuality, abuse or diagnosis-related material is session-only unless a non-crisis player explicitly says to remember a minimal summary.

Self/other harm, overdose, acute medical danger, active violence, crisis content and diagnostic inference are never durable even on request. Care memory cannot cross products, drive proactive prompts, or affect gameplay progression.

## Lifecycle

Recall and write are separate. Proposals are immutable, scoped and idempotent. A single FIFO writer validates consent, sensitivity, quota, dedupe and supersession before commit. Write failure is closed; recall failure is soft. Delete removes the canonical row, embedding and cache, and applies the documented backup-retention marker. Search indexes are rebuildable.

Players can list, correct, forget, delete and export. `forgetMemory(memoryId)` must not claim success for an unknown item. Natural-language “do not remember this” blocks the current proposal immediately; deletion of an older record requires an identified record or memory-management flow.

## Account-link migration

After account binding, only eligible non-sensitive structured anchors and episodic summaries are imported. The player is notified immediately and can undo. Raw `chatHistory`, transcript journals, Care, safety and crisis content remain local and are not uploaded. Existing raw transcripts are not destroyed automatically; new persistent raw transcript writes must stop in the separately approved GROUNDWORK migration.

## Prohibited sinks

Raw turns and memory summaries cannot enter application logs, audit text, analytics payloads, crash reports, training bundles or external model providers. Audit records contain identifiers, policy/category codes, versions, latency and fallback reasons only.
