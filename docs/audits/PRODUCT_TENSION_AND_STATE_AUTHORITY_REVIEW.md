# Nexus Link Product Tension and State Authority Review

- **Status:** Proposed Review / Not Yet Canon
- **Source:** Human-requested product and architecture review
- **Purpose:** Preserve decisions and findings for MCP/codebase retrieval
- **Authority:** Does not override `CLAUDE.md`, `AGENTS.md`, `ACCEPTANCE.md`, Design Bible, or Runtime Canon until approved
- **Last updated:** 2026-07-24

---

## Core finding

Cursor correctly found real design tensions, but the highest risks need to be **reclassified**.

The true **P0** issues are:

1. **Per-companion relationship-state authority.**
2. **Dynamic chapter encounter resolution.**
3. **A player-visible single truth for memory.**
4. **Product-language separation** between psychologically safe design and medical/therapeutic claims.

Medium/high tensions (HUD numbers, expedition loot tone, first-touch, standoff HP skeleton) remain real, but they should not block the identity-critical P0 sequence above.

---

## A. Remembered / proactive × no dependency detection × non-medical product

### Clarification

This is primarily a **terminology and product-claim** problem, not a requirement to delete memory or autonomy.

- Nexus Link **may** use psychologically safe, trauma-informed, low-pressure, and boundary-aware design principles.
- Nexus Link **must not** claim to treat loneliness, attachment disorders, trauma, anxiety, depression, or any clinical condition.
- It **must not** infer player dependency, loneliness, attachment, or mental state from login frequency, session duration, return cadence, or message volume.

Runtime may still detect **utterance-level dependency pressure** in a single message (e.g. “不准拒絕 / 永遠陪我”) and apply boundary redirects. That is **not** the same as profiling the player as “dependent.”

### Recommended terminology migration

| Avoid (clinical / overclaim) | Prefer |
|---|---|
| 治療性設計 | 心理安全導向設計 |
| 療癒玩家 | 提供低壓力、具邊界的體驗 |
| 安全依附機制 | 不責備式回歸設計 |
| 啟動催產素系統 | 提升被記得與可預期感的產品假設 |
| 治療性依附 | 有邊界的長期關係設計 |

### Product ruling

> 「Nexus Link 可以採用心理安全、創傷知情與尊重邊界的設計原則，但不宣稱治療、改善依附型態、降低孤獨或產生任何臨床效果。」

---

## B. Relationship-state sovereignty

### Core ruling

> 「所有代表某隻夥伴如何看待玩家的狀態，一律屬於該 companionId；只有代表玩家對世界做過什麼的進度才可全域化。」

### Per-companion state (target; subject to code audit before migration)

- bond, trust, mood
- energy where companion-specific
- defense, touch fatigue, blocked touch state
- scars (when implemented)
- companion-scoped memories / emotional memories / anchors
- boundary pressure
- persona or long-term personality drift
- relationship stage
- invitation eligibility

### Global state (allowed)

- player identity
- completed chapters / discovered regions
- account-wide settings
- world-event flags
- encountered-companion IDs
- total journey metadata

### Failure mode (explicit)

A bond/trust value earned with Companion A **must not** make Companion B automatically accept an invitation.

**Current risk:** `resonanceInviteEngine` (and similar) may read top-level `state.bond` / `state.trust` mirrors while Growth contracts treat per-companion `companionStates.byId` as truth.

### This task

Do **not** implement migration here. Produce ADR-ready proposal and migration risk list only (see Repair Sequence Task Pack 2).

---

## C. Dynamic chapter encounters

### Problem

A chapter registry that hardcodes meeting Flametail Fox or Crystal Seahorse will break when:

- that character was already selected at first encounter,
- the character was already met through another route,
- an old save already has the character unlocked,
- a runtime variant and canon alias are treated as different companions,
- the same event is replayed.

### Recommended architecture

- Chapters define **encounter slots**, not fixed companion IDs as the only possible meet.
- An **Encounter Resolver** selects the first eligible unmet candidate.
- Already-met characters never replay the first-meeting or first-bonding flow.
- When no candidate remains, the chapter resolves to a meaningful **fallback event** (not an empty encounter).
- Encounter resolution must be **idempotent**.

### Suggested fields

- `metAt`, `meetEventId`, `bondedAt`
- `encounterVersion`, `resolvedCompanionId`
- `rewardGrantedAt` (if any reward exists)

### Core ruling

> 「章節只決定這裡會發生一場相遇，由 Encounter Resolver 根據玩家既有關係動態決定遇見誰；已相遇角色永不再次走初遇流程。」

Do **not** implement this resolver in the BGM/docs task.

---

## D. Memory single truth

### Problem

Current memory-related systems may include:

- `emotionalMemories`
- `memories` (manual / Memory page)
- `companionAnchors` (Soul Talk dual-track; may be invisible on Memory page)
- `habitatTraces`
- archived or released memories

A companion must not explicitly claim to remember a concrete event that the player cannot find any evidence of in the Memory experience.

### Recommended direction

- Keep separate storage systems if runtime purposes differ.
- Build one player-facing **MemoryViewModel / memory projection** layer.
- The Memory page should project all player-visible memory evidence into one coherent timeline or relationship record.
- Internal anchors may remain hidden **only** when they affect tone, preference, or recall weighting **without** making unverifiable concrete claims.

### Release semantics

- `released` must **not** equal deleted.
- `released` means the memory no longer drives the current emotional state.
- It may be removed from the active habitat but remain visible in archive/history.
- It may retain a lower recall weight.
- No array splice or irreversible deletion should represent “release” unless explicitly approved by canon.

### Core ruling

> 「釋放不是刪除歷史，而是讓記憶退出當前情緒作用；它仍留在關係檔案中，但不再主導夥伴狀態。」

---

## E. Reclassification of medium/high tensions

| Tension | Decision |
|---|---|
| Single soul vs resonance circle / codex | Can coexist if each relationship is independently meaningful and UI avoids collection/gacha language. |
| Proactive life vs anti-clinginess | Solve through an **initiative budget**, not by removing autonomy. |
| Anchors list vs organic memory | Primarily a **projection and language** problem. |
| Expedition loot vs anti-farming | High product-drift risk. Prefer journey traces, world memories, habitat materials, and narrative evidence over repeatable power currency. |
| Growth without confrontation | Must provide alternate paths so confrontation-averse players are not progression-blocked. |
| Numeric bond HUD vs “do not tell the player they need three more points” | Real UX contradiction. Prefer qualitative relationship stages over exact grindable numbers. |
| First Touch forced `guarded_accept` vs genuine refusal | Audit current main. Newer intended rule: allow normal boundary resolution, with a gentle first-session rejection that does not create permanent scars. |
| Emotional Standoff vs HP skeleton | Audit actual engine. Renaming HP to “noise” is insufficient if play remains “repeat actions until one bar depletes.” |

---

## F. Required implementation order

1. Multi-Companion Relationship State Authority — Decision and Migration Plan.
2. Memory Single Truth / Memory Projection.
3. Dynamic Chapter Encounter Resolver.
4. Product terminology and UI-language alignment.
5. Initiative budget, loot semantics, qualitative bond presentation, and non-confrontation growth routes.

**Note:** First Session Motivation Repair is sequenced as an overlapping P0 for commercial readiness (see companion review). It does not replace items 1–3 for architecture integrity.

---

## References (runtime / docs evidence)

- `docs/raphael/RAPHAEL_CONSTITUTION.md`, Nuwa `memory_as_trace_not_inventory`
- `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`
- `src/ai/dialogue/companionAnchorPolicy.js`, `src/ui/pageRouter.js` Memory rendering
- `src/engine/touchReactionEngine.js` first-touch override (audit target)
