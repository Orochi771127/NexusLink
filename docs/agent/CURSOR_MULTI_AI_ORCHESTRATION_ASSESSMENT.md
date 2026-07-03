# Cursor Multi-AI Orchestration Assessment for Nexus Link

Date: 2026-07-04
Project: Nexus Link / 心核連結
Purpose: Archive and operationalize the ChatGPT assessment on using Cursor as the multi-AI orchestration lead for Nexus Link.

---

## 1. What should be stored in Cursor

Cursor should not only receive a pasted conversation. It should receive durable project rules that can be loaded automatically during repo work.

Recommended file:

```text
.cursor/rules/nexus-ai-orchestrator.mdc
```

This rule file defines:

- Nexus Link project identity
- RaphaelCore safety boundaries
- Fable 5 usage boundaries
- Cursor role as orchestrator, not final authority
- TASK_PACK workflow
- Verification requirements
- Multi-AI role assignment
- Commercial-grade development priorities

---

## 2. Cursor as multi-AI orchestration lead: conclusion

Cursor is suitable as the AI collaboration dispatch center, but not as the highest decision-maker.

Precise role split:

```text
Cursor = engineering-site coordinator / task dispatcher / repo-aware coordinator
Human owner = product, canon, safety, and merge authority
Fable 5 = high-cost hard-task specialist
Codex = implementation worker
Claude Code = architecture-sensitive implementer and reviewer
Fresh-context verifier = safety and quality auditor
```

Cursor's advantage is that it lives close to the repo. It can read files, inspect diffs, follow rules, create task packs, and coordinate code-facing agents.

Its risk is also clear: if it becomes an unchecked autonomous project manager, it may over-refactor, pollute architecture, or create hidden technical debt.

Final judgment:

```text
Cursor can lead Nexus Link multi-AI collaboration only as a controlled engineering coordinator.
Cursor must not become an autonomous project owner.
```

---

## 3. Effectiveness evaluation

| Evaluation Area | Score | Judgment |
|---|---:|---|
| Repo context awareness | 8.5 / 10 | Strong because Cursor operates inside the IDE and repo. |
| Task dispatching | 7.5 / 10 | Good for TASK_PACK generation, but human priority-setting remains required. |
| Multi-AI coordination | 7 / 10 | Useful as a dispatch layer, but not a full enterprise agent orchestrator. |
| Safety boundary discipline | 6.5 / 10 | Needs `.cursor/rules`, AGENTS.md, acceptance checks, and verifier review. |
| Commercial-grade quality control | 6.5 / 10 | Can accelerate work, but may create maintainability debt without review. |
| Nexus Link fit | 8 / 10 | Strong fit for Web-first vertical slice development if constrained. |

Overall:

```text
Cursor is suitable as Nexus Link's AI engineering coordination center.
But it must be a controlled dispatcher, not an autopilot.
```

---

## 4. Tasks Cursor should dispatch

### Suitable tasks

| Task | Cursor dispatch method |
|---|---|
| UI/HUD bug | Cursor creates TASK_PACK, Codex patches, verifier audits diff. |
| RaphaelCore eval harness | Fable designs architecture, Codex implements, verifier reviews. |
| Raphael corpus JSON cleanup | Fable defines schema, cheaper model classifies, Cursor integrates. |
| Mobile viewport issue | Cursor gathers context, Fable identifies root cause, Codex patches. |
| Character/faction data integration | Cursor scopes files, Codex structures data, verifier checks canon. |
| Commercial-grade gap audit | Fable runs read-only audit, Cursor converts result into TASK_PACKs. |
| PR review | Cursor / Claude Code / verifier perform two-stage review. |

### Unsuitable tasks

| Task | Reason |
|---|---|
| “Make the whole project commercial-grade” | Too broad; high risk of uncontrolled changes. |
| “Automatically decide the game's core direction” | Product and canon decisions must remain human-owned. |
| “Directly refactor RaphaelCore” | Too risky without explicit task boundaries. |
| “Let all AIs freely edit together” | Causes conflicts, duplication, and architecture drift. |
| “Generate many new systems at once” | High risk of technical debt. |

---

## 5. Best architecture for Cursor-led collaboration

Recommended repo structure:

```text
.cursor/
  rules/
    nexus-ai-orchestrator.mdc
    nexus-raphaelcore-safety.mdc
    nexus-ui-mobile.mdc

docs/
  agent/
    AI_EXECUTION_LEDGER.md
    AI_MODEL_USAGE_LEDGER.md
    TASK_PACK_TEMPLATE.md
    FABLE5_RAPHAEL_CORE_WORKFLOW.md
    VERIFIER_CHECKLIST.md

scripts/
  evalRaphaelCore.mjs
  validateRaphaelCorpus.mjs
```

The most important file is:

```text
.cursor/rules/nexus-ai-orchestrator.mdc
```

It ensures Cursor knows:

- Nexus Link is post-MVP.
- The Web version is the commercial-grade vertical slice path.
- RaphaelCore must not be casually rewritten.
- No backend, database, API routes, or new framework should be added without approval.
- No FOMO, streak punishment, shop pressure, social comparison pressure, or emotional dependency loops are allowed.
- All work must use TASK_PACKs.
- All implementation must be verified.
- All risky patches require fresh-context review.

---

## 6. Recommended multi-AI workflow

```text
Human owner proposes need
  ↓
Cursor Orchestrator reads rules + repo
  ↓
Cursor produces TASK_PACK
  ↓
Human approves
  ↓
Cursor assigns:
  ├─ Fable 5: read-only audit / complex root cause / safety design
  ├─ Codex: narrow implementation
  ├─ Claude Code: architecture-sensitive implementation
  └─ Verifier: fresh-context diff review
  ↓
Cursor integrates result
  ↓
Tests / diff / ledger update
  ↓
Human decides merge or rollback
```

Core rule:

```text
One task must have only one implementation owner.
Other AIs may audit, review, or test, but should not edit the same files in parallel.
```

This avoids cross-agent contamination and duplicated architecture changes.

---

## 7. Recommended landing order for Nexus Link

### Step 1: Add Cursor rules

Add:

```text
.cursor/rules/nexus-ai-orchestrator.mdc
```

Later add:

```text
.cursor/rules/nexus-raphaelcore-safety.mdc
.cursor/rules/nexus-mobile-ui.mdc
```

### Step 2: Add ledger files

Add:

```text
docs/agent/AI_MODEL_USAGE_LEDGER.md
```

Suggested ledger format:

```md
# AI Model Usage Ledger

| Date | Task | Model | Role | Cost | Fallback | Files Changed | Verified | Human Rework | Decision |
|---|---|---|---|---:|---|---|---|---|---|
| 2026-07-04 | RaphaelCore audit | Fable 5 | Audit | UNKNOWN | UNKNOWN | None | Read-only | TBD | Pending |
```

### Step 3: Run first read-only Cursor audit

Suggested prompt:

```text
Read .cursor/rules/nexus-ai-orchestrator.mdc first.

Run a READ-ONLY Nexus Link AI orchestration audit.

Do not modify files.
Do not create files.
Do not delete files.
Do not commit.
Do not push.

Goal:
Evaluate whether the repo has enough rules, docs, and verification structure for Cursor to act as the multi-AI orchestration lead.

Output:
- Current AI governance files
- Missing rules
- Missing ledgers
- Missing TASK_PACK templates
- Risks if Cursor starts assigning tasks now
- Recommended next 3 setup patches
- Files allowed to add
- Files forbidden to touch

Mark unknowns as UNKNOWN.
Mark untested claims as NOT VERIFIED.
```

---

## 8. Final judgment

Cursor can act as the multi-AI collaboration lead for Nexus Link, but only under strict limits.

Best positioning:

```text
Cursor = controlled engineering coordinator
Fable 5 = high-cost hard-task specialist
Codex = implementation worker
Claude Code = architecture-sensitive engineer
Verifier = quality auditor
Human owner = product, canon, safety, and merge authority
```

Dangerous positioning:

```text
Cursor = autonomous project boss
Other AIs = free-editing workers
Human owner = only reviews at the end
```

Three hard rules:

```text
1. Cursor may only dispatch TASK_PACKs, not vague wishes.
2. Every implementation must have a verifier.
3. RaphaelCore, save schema, runtime safety, and canon terminology always require human approval.
```

This makes Cursor useful as a multi-AI collaboration center rather than another high-speed source of project disorder.
