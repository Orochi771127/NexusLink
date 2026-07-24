# Nexus Link First Session Motivation Review

- **Status:** Proposed Review / Not Yet Canon
- **Source:** Human-requested product and architecture review
- **Purpose:** Preserve decisions and findings for MCP/codebase retrieval
- **Authority:** Does not override `CLAUDE.md`, `AGENTS.md`, `ACCEPTANCE.md`, Design Bible, or Runtime Canon until approved
- **Last updated:** 2026-07-24

---

## Observed playtest result

- The atmosphere and BGM were noticed positively.
- Players reported that they did not know what to do next.
- They could not identify a reason to continue.

## Primary diagnosis

> 「Nexus Link 的氛圍成立了，但遊戲循環沒有被玩家理解。」

This is **not merely a tutorial problem**.

Players currently lack clear answers to:

1. What can I do now?
2. Why should I do it?
3. What changes after I do it?
4. Why should I return later?

---

## A. Anti-FOMO was incorrectly allowed to become anti-direction

### Clarify

Low pressure does **not** mean:

- no next step,
- no understandable progress,
- no explanation of consequences,
- no future anticipation,
- forcing the player to guess the game loop.

### Core ruling

> 「低壓力，不等於低方向性。」

---

## B. “Daring to be boring” is being used too early

Quietness becomes meaningful only after the player:

- knows the companion,
- understands the relationship mechanics,
- has seen actions leave traces,
- has formed anticipation.

Before emotional investment, quietness reads as **lack of content**.

### Core ruling

> 「先清楚，後留白。」

---

## C. The interface presents actions without communicating intent

Especially audit the current Emotional Standoff screen.

The screen must explain:

- the current objective,
- what each action is intended to change,
- why one action may be appropriate now,
- how the result affects the companion,
- what is preserved if the player retreats,
- what long-term trace may remain.

Abstract labels alone are not sufficient.

---

## D. Missing visible causality

Every meaningful action needs three levels of feedback:

1. **Immediate:** posture, animation, dialogue, visual effect, or readable state change.
2. **Event-level:** how the action changed the current situation.
3. **Long-term:** which memory, habitat trace, boundary response, or relationship tendency was created.

Do **not** reduce this to “+2 trust”.

Example form:

> 「焰尾沒有立刻靠近，但耳朵不再向後壓。  
> 牠記住了你沒有強迫牠繼續。  
> 月湖新增記憶留痕：被尊重的退後。」

---

## E. Missing medium-term promise

The player must be able to anticipate possibilities such as:

- the companion voluntarily approaching for the first time,
- the companion recalling an earlier conversation,
- a new habitat trace appearing,
- discovering why the companion is guarded,
- meeting another heart-core lifeform,
- unlocking a shared exploration area,
- entering a companion-specific relationship chapter.

Do **not** expose exact grind requirements.

---

## F. First-principles motivation model

At least one of these must be understandable:

- **Mastery:** I am learning how this system works.
- **Change:** My action visibly changed the companion or world.
- **Anticipation:** I want to know what happens next.

Current risk:

- mastery is blocked by abstract terminology,
- change is hidden in state variables,
- anticipation is not communicated.

---

## G. Recommended feature: Resonance Thread（共鳴線索）

Chinese product name: **共鳴線索** / Resonance Thread.

It is **not** a quest list.

### Rules

- show at most one meaningful next direction,
- optional,
- dismissible,
- no countdown,
- no daily reset,
- no streak,
- no red dot,
- no currency reward,
- no absence penalty,
- must explain why the action matters,
- must show the resulting consequence.

### Examples

> 「灰影仍在觀察你。  
> 先讓牠知道你今天的狀態。」

Then:

> 「牠記住了你今天的疲憊。  
> 帶牠到月湖走一段，看看這段情緒會留下什麼。」

Then:

> 「月湖留下了一道暗淡的藍光。  
> 回到棲地，看看牠如何理解這次同行。」

Completion:

> 「今天已經留下足夠的痕跡。  
> 你不必繼續做任何事。」

---

## H. Recommended first 12-minute experience

| Minutes | Intent |
|---|---|
| 0–2 | Meet the companion. Understand it is not a pet and may not immediately accept the player. |
| 2–4 | First approach or Soul Talk. Understand choice changes reaction. |
| 4–6 | Create the first visible memory or trace. Prove the system remembers. |
| 6–9 | Complete one safe exploration event. Show relationship exists outside chat. |
| 9–11 | Return to habitat. Show environmental or behavioral consequence. |
| 11–12 | Preview a future relationship possibility. Give one reason to return. |

Full Emotional Standoff should **not** appear before the player understands noise, stability, synchronization, boundary, and retreat.

---

## I. Emotional Standoff onboarding requirements

Before an early standoff, show one readable objective, for example:

> 「本次目標：在疲憊達到上限前，協助焰尾穩定裂隙雜訊。」

Each action needs an expected consequence.

| Action | Expected meaning |
|---|---|
| 共鳴 | increases synchronization; slightly increases fatigue; useful while the companion is still willing to approach |
| 設界 | reduces noise or pressure; useful when the companion starts withdrawing |
| 穩定 | restores stability; does not directly resolve the rift |
| 先撤退 | preserves current progress where applicable; exits without relationship punishment; retreat is not failure |

The first encounter may provide recommendations. Later encounters should not permanently choose for the player.

---

## J. Required product acceptance targets

For the next unassisted playtest:

- A new player understands the first action within **90 seconds**.
- Within **10 minutes**, the player can name one visible change caused by their own action.
- At session end, the player can name one future event or relationship change they expect.
- No developer explanation is required.
- The game does not use rewards, red dots, login pressure, or guilt to create motivation.

Use at least **five** new players who have not previously seen Nexus Link.

Ask them:

1. 這隻角色和普通電子寵物有什麼不同？
2. 你現在知道下一步可以做什麼嗎？
3. 剛才哪個行動改變了角色或世界？
4. 你知道為什麼下次可能值得回來嗎？
5. 你剛才有沒有感到被逼著繼續？

---

## K. Priority ruling

- **P0-A:** First Session Motivation Repair.
- **P0-B:** Per-companion relationship-state authority.
- **P1:** Memory truth projection.
- **P1:** Dynamic chapter encounters.

### Core conclusion

> 「玩家看不到自己行動與夥伴關係之間的因果，也看不到下一段值得期待的關係變化。」
