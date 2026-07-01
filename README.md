# Nexus Link / 心核連結

> 這不是電子寵物，這是你的夥伴。  
> An emotional habitat game about a companion who remembers, keeps boundaries, and changes through shared experience.

---

## Current Status

**Nexus Link** is a Web-first pre-commercial vertical slice built around one core loop:

```text
First Session Opening
→ First Soul Talk
→ First Trace / Habitat Trace
→ Return Echo
→ Boundary-aware companion reactions
```

The active runtime is the **root White Lab**:

```text
/
  index.html
  styles.css
  src/
  assets/
```

`/r2/` is legacy reference only and is not the current development entry.

---

## Product Identity

Nexus Link is a **narrative emotional habitat game**.

It is not:

- a digital pet
- a gacha / character collection game
- a pure AI chatbot
- an AI girlfriend product
- a traditional RPG combat game
- a FOMO / streak / login reward system

Its central promise:

> A heart-core companion remembers how you approached, how you left, and how you returned — but it never belongs to you.

---

## Current Runtime Highlights

- Mobile-first Web prototype
- PixiJS v8 renderer via CDN
- Vanilla JS / ES Modules
- localStorage persistence through `nexusLinkR2State:v1`
- Greyshade Cat as primary runtime companion
- Five runtime-ready Heart Radiance guardian companions
- Soul Talk emotional input
- emotional memories and habitat traces
- Return Echo with non-guilt return lines
- companion animation cues for return, map, touch, and emotional standoff
- boundary-aware touch reactions: accept / guarded / hesitate / reject
- RaphaelCore JS v1 local companion AI layer for Soul Talk safety, intent, emotion, boundary, and response planning
- Emotional Standoff as relationship repair, not traditional combat

---

## RaphaelCore JS v1

`src/ai/` contains the first Web-native RaphaelCore layer.

```text
src/ai/
  safetyShield.js
  emotionInterpreter.js
  intentClassifier.js
  semanticSoulModel.js
  reactionPlanner.js
  responseComposer.js
  raphaelCore.js
```

Soul Talk now routes player input through:

```text
safetyShield
→ emotionInterpreter
→ intentClassifier
→ semanticSoulModel
→ reactionPlanner
→ responseComposer
→ existing memory / trace / state update path
```

This layer is local and deterministic. It does **not** use an LLM, backend, database, or external API.

Design rule:

```text
NexusCore decides emotion, intent, memory, boundary, reaction, trace, and animation.
LLM, if added later, may only be an optional language rendering layer.
```

Detailed architecture note:

```text
docs/architecture/RAPHAEL_CORE_JS_V1.md
```

---

## Run Locally

Use any static file server.

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

If your system uses `python` instead of `python3`:

```bash
python -m http.server 5173
```

---

## GitHub Pages

Expected Pages URL:

```text
https://orochi771127.github.io/NexusLink/
```

Deployment is from:

```text
main / root
```

---

## Canon and Research Documents

### Core Bible

```text
docs/bible/01_DESIGN_BIBLE.md
docs/bible/02_WORLD_BIBLE.md
docs/bible/03_CHARACTER_BIBLE.md
docs/bible/04_RUNTIME_CANON.md
docs/bible/README.md
```

### Strategic Canon

```text
docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md
```

The strategic canon defines why the project exists, what it sells, and what it must never become. It does **not** replace `CLAUDE.md`, `AGENTS.md`, or `ACCEPTANCE.md`.

### Market Evidence

```text
docs/research/MARKET_EVIDENCE_AI_COMPANION.md
```

This file is an internal evidence memo for AI companion / emotional habitat market assumptions. It is not external pitch material until source URLs are verified.

### Raphael / Heart-core Brain

```text
docs/raphael/
tools/raphael/
src/ai/
```

`src/ai/` is the active Web-native RaphaelCore v1 layer. Older Raphael Constitution and sandbox materials remain design references until integrated through reviewed task packs.

---

## Development Constraints

Allowed stack:

- HTML
- CSS
- Vanilla JavaScript / ES Modules
- PixiJS v8 via CDN
- localStorage
- GitHub Pages

Do not add without explicit approval:

- React / Vue / Svelte
- TypeScript
- npm dependencies
- build step
- backend / database / API
- LLM API
- second Pixi app
- new ticker
- gacha / streak / daily reward / red dot systems

---

## Current Development Focus

```text
Make one habitat feel alive.
Make one companion feel present.
Make one relationship worth returning to.
```

Next planning target:

```text
Initial Bond / 開場定情 — PLAN ONLY
```

Do not directly change `unlockedCompanionIds`, `defaultState.js`, or companion selection behavior until the Initial Bond migration plan is approved.

---

## Acceptance Question

Every feature must answer:

> Does this make the companion feel more clearly bounded, remembered, and changed by shared experience?

If not, it should not expand the root runtime.
