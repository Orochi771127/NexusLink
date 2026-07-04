# NexusLink Copywriting Final Pass

Status: CURRENT copywriting guide
Audience: Codex, Claude Code / Fable 5, Cursor Agent, human reviewer
Source inspiration: `weijt606/anti-vibe-writing` under MIT license

This document adapts the public
[`anti-vibe-writing`](https://github.com/weijt606/anti-vibe-writing) approach
for NexusLink copy. It is a writing standard, not a dependency, submodule, skill
install, runtime feature, or permission to add external packages.

## 1. Purpose

Use this after the design or runtime behavior is already correct.

The goal is not to make NexusLink sound more literary. The goal is to remove
generic AI copy while preserving the companion contract:

- The companion remembers, but does not belong to the player.
- The companion can come closer, but cannot guilt the player into returning.
- The player can influence the companion, but cannot command or own it.

Copy should feel selected, quiet, and concrete. It should not feel generated,
inflated, promotional, or like a tutorial checklist.

## 2. Where This Applies

Apply this guide to:

- first-session UI copy,
- Start / Identity / Guidance / Home / Explore / Care / Growth / Memory /
  Soul Talk / Return Echo surfaces,
- onboarding copy,
- empty states,
- action labels,
- release notes,
- store/demo page drafts,
- agent handoff documents when they include player-facing language.

Do not use it to invent product claims, emotional events, safety behavior,
monetization language, or lore facts.

## 2.1 External Writing And Persona References

External writing skills and persona-skill collections can be useful research
material, but they do not become NexusLink authority by being linked.

Use this rule for links such as the referenced X post about "人物 Skill" /
persona-skill collections:

- Treat them as optional advisory lenses only.
- Audit each source repository, license, and claims before adding it to docs.
- Do not install third-party skills into this repo without explicit approval.
- Do not imitate a living person's voice for player-facing copy.
- Do not let a persona skill override NexusLink canon, safety red lines,
  RaphaelCore boundaries, or the copy voice in this document.
- If a source page cannot be fully read, record it as unverified and do not
  promote it to a current reference.

For NexusLink, persona skills may help critique strategy or writing from a
specific angle. They should not become the voice of Greyshade Cat, RaphaelCore,
or the product.

Reviewed external references:

| Reference | License | Allowed NexusLink use | Not allowed |
| --- | --- | --- | --- |
| [`weijt606/anti-vibe-writing`](https://github.com/weijt606/anti-vibe-writing) | MIT | Final-pass editing lens for removing generic AI copy and preserving meaning. | Installing as a dependency or letting it override NexusLink canon. |
| [`alchaincyf/paul-graham-skill`](https://github.com/alchaincyf/paul-graham-skill) | MIT | Optional product/writing/startup critique lens for commercial positioning and sharpness. | First-person roleplay, imitating Paul Graham in player-facing copy, or importing its voice into RaphaelCore. |
| [`alchaincyf/karpathy-skill`](https://github.com/alchaincyf/karpathy-skill) | MIT | Optional AI engineering reliability lens for agent workflows, demo-vs-deployment checks, and "suit not robot" thinking. | First-person roleplay, treating vibe coding as release proof, or using it to weaken NexusLink's safety/review gates. |
| [`alchaincyf/steve-jobs-skill`](https://github.com/alchaincyf/steve-jobs-skill) | MIT | Optional product focus, taste, and "say no" critique lens for UI/UX scope control. | First-person roleplay, harsh persona imitation in player-facing copy, or using taste arguments to bypass accessibility/safety gates. |
| [`alchaincyf/elon-musk-skill`](https://github.com/alchaincyf/elon-musk-skill) | MIT | Optional first-principles and cost/complexity critique lens for sidecar tooling, build scope, and process bloat. | First-person roleplay, using speed pressure to bypass GROUNDWORK approval, or treating aggressive iteration as release evidence. |
| [`alchaincyf/nuwa-skill`](https://github.com/alchaincyf/nuwa-skill) | MIT | Optional method reference for how persona-skill repositories are structured and audited. | Auto-generating NexusLink character voices, RaphaelCore personas, or third-party skills inside this repo without explicit approval. |

## 3. NexusLink Copy Voice

Prefer:

- short concrete sentences,
- one clear image at a time,
- direct verbs,
- quiet emotional texture,
- player permission without pressure,
- companion agency,
- visible relationship evidence instead of numbers.

Avoid:

- "always waiting" language,
- dependency framing,
- romance-first framing,
- therapy or diagnosis claims,
- reward pressure,
- FOMO, streak, countdown, daily-task, or red-dot language,
- gacha, rarity, power, currency, or collection pressure,
- generic encouragement that could fit any app.

Good examples:

- "你可以說話，也可以只是待著。"
- "牠把距離留在自己覺得安心的地方。"
- "湖面還留著一點上次的光。"
- "今天不用完成什麼。先看牠願不願意靠近。"

Bad examples:

- "完成每日互動，提升你們的羈絆。"
- "牠一直在等你回來。"
- "解鎖更多稀有夥伴，打造最強心核隊伍。"
- "透過沉浸式情感陪伴，賦能你的內在療癒旅程。"

## 4. Anti-AI-Smell Rules

These rules are adapted for NexusLink from anti-vibe-writing. They are applied
as a final pass after substance and safety are already correct.

### Remove generic setup

Cut openings that announce the topic instead of saying the thing.

Avoid:

- "接下來讓我們..."
- "在這個快速變化的時代..."
- "值得注意的是..."
- "首先 / 其次 / 最後" when there is no real sequence.

Use the scene or action directly.

### Remove business and marketing jargon

For player-facing copy, ban the following unless quoted from a source:

- 賦能
- 打通
- 閉環
- 抓手
- 鏈路
- 底層邏輯
- 一站式
- 全方位
- 全鏈路
- 端到端
- 打造
- 助力
- 致力於
- 革命性
- 顛覆性
- 極致
- 絲滑
- 無縫
- 干貨

If a sentence needs one of these words, the sentence probably needs a concrete
object, action, or consequence instead.

### Remove translationese

Chinese NexusLink copy should not read like English syntax translated into
Chinese.

Avoid:

- "作為一個..."
- "對...進行..."
- "使...得到..."
- "不僅...而且..." when it becomes a list of benefits,
- overusing "被",
- unnecessary "們" plural markers,
- abstract nouns as subjects.

Prefer active, plain Chinese:

- Weak: "我們對流程進行了優化，使玩家體驗得到提升。"
- Better: "玩家少點兩次，就能回到湖邊。"

### Reduce machine-shaped structure

Use headings and bullets only when they help scanning. Player-facing copy should
usually be prose, short labels, or small groups of actions.

Avoid:

- every two sentences having a heading,
- "核心功能 / 主要特色 / 總結",
- decorative bold labels,
- `>` callouts for ordinary text,
- tables for two or three simple ideas,
- emoji or icon-led section titles.

### Watch punctuation tells

For NexusLink docs and player-facing Chinese copy:

- avoid dense `--`, `...`, `->`, and decorative separators,
- use Chinese full-width quotes normally when needed,
- do not use punctuation to create fake drama,
- do not turn UI copy into slogan fragments.

One deliberate pause can work. Repeated dramatic punctuation usually reads like
a model trying to sound profound.

## 5. Surface Presets

### First Session Flow

Goal: clarity without pressure.

Rules:

- The first line should tell the player what is happening now, not what the
  product promises globally.
- Avoid tutorial tone.
- Avoid "complete", "claim", "unlock", "daily", and "reward".
- Let the player skip, pause, observe, or return without guilt.

Example direction:

- "先告訴牠你想被怎麼稱呼。也可以先略過。"
- "這裡的記憶只留在這台裝置。"

### Soul Talk

Goal: companion presence without dependency.

Rules:

- No "I am your only support" framing.
- No safety or crisis line can become relationship progress.
- No praise for dependency pressure.
- Keep replies short enough for mobile reading.

Example direction:

- "牠沒有馬上靠近，只是把尾巴收回腳邊。"
- "你可以慢慢說。牠會先聽這一句。"

### Return Echo

Goal: continuity without absence blame.

Rules:

- Never imply the player hurt the companion by leaving.
- Do not count missed days.
- Show one quiet trace from before.

Example direction:

- "湖面還留著一點上次的光。"
- "牠看見你，先眨了一下眼。"

### Care

Goal: respectful action, not pet-command control.

Rules:

- Do not frame care as feeding, farming, or obedience.
- Offer presence, observation, rest, and gentle repair.
- Boundary refusal must read as agency, not punishment.

Example direction:

- "先坐近一點。牠如果退開，就讓牠退開。"

### Growth And Memory

Goal: evidence before metrics.

Rules:

- Prefer traces, remembered lines, tendencies, and small changes.
- Avoid grind, levels, rarity, power, and completionist language.
- If a number is required for developer clarity, explain meaning before reward.

Example direction:

- "牠比較常在湖邊停下來。不是任務完成，是牠記得那裡安全。"

## 6. Final Pass Checklist

Before returning or committing player-facing copy, check:

- Does the first sentence reach the point quickly?
- Can this sentence belong only to NexusLink, not any wellness app or RPG?
- Is the companion allowed to have distance?
- Is the player allowed to leave without guilt?
- Did we remove FOMO, streak, reward, red-dot, unlock, and task pressure?
- Did we remove business jargon and AI scaffolding?
- Are headings, bullets, tables, and bold labels actually needed?
- Does warmth come from a concrete image or action?
- Did facts, safety behavior, and product scope remain unchanged?
- Is the result shorter or sharper, not just more ornate?

If any item fails, revise only that spot and re-check once.

## 7. Deterministic Copy Scan

When reviewing a saved draft, this PowerShell scan catches common AI-smell terms.
Hits are review locations, not automatic deletions.

```powershell
rg -n "賦能|打通|閉環|抓手|鏈路|底層邏輯|一站式|全鏈路|端到端|打造|助力|致力於|革命性|顛覆性|極致|絲滑|無縫|干貨|值得注意的是|綜上所述|總而言之|歸根結底|說到底|讓我們|在這個.*的時代|--|\\.\\.\\.|->" <target-file>
```

Use this scan on UI copy drafts, release notes, store copy, and handoff prompts
that contain player-facing language.

## 8. Attribution

This guide is an original NexusLink adaptation of ideas from
[`weijt606/anti-vibe-writing`](https://github.com/weijt606/anti-vibe-writing),
which is published under the MIT license. The external repository remains a
reference and writing aid only. NexusLink agents must still obey `AGENTS.md`,
`CLAUDE.md`, `ACCEPTANCE.md`, and the Master Canon first.
