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
- Greyshade Cat as default / fallback companion; **Initial Bond** now lets a fresh save pick one of three starters (Greyshade Cat / Blazetail Kit / Crystalfin Seahorse) instead of always defaulting
- Formal Heartspark Council five-seat roster (金羽小梟 Auriowl · 芽角小鹿 Sprigfawn · 晶鰭小海馬 Crystalfin Seahorse · 焰尾小狐 Blazetail Kit · 星紋小虎 Starstripe Cub) is **canon-locked and asset-specced, not yet runtime-ready** — separate from the five animated `full-runtime` test-carrier creatures (ember fox / frost wolf / stone bear / vine stag / crystal rabbit), which exist as animation test carriers and are not the canon roster
- Companion Growth: G1 (session-only growth) and G2 (per-companion persistent relationship/growth state, offline recovery, multi-companion isolation) are **implemented and QA-passing**; G3 (companion-tagged readiness/evidence/willingness) is **not implemented**
- Soul Talk emotional input
- emotional memories and habitat traces
- Return Echo with non-guilt return lines
- companion animation cues for return, map, touch, and emotional standoff
- boundary-aware touch reactions: accept / guarded / hesitate / reject
- RaphaelCore JS local companion AI layer for Soul Talk safety, intent, emotion, boundary, memory, and response planning (see below)
- Emotional Standoff ("穩住裂隙") as relationship repair, not traditional combat — this fully replaced the old HP battle loop; current work is deepening it (telegraph, phase arcs), not rebuilding it

---

## RaphaelCore

`src/ai/` (100+ modules) is the current Web-native RaphaelCore layer, now at internal **Stage 7**. `soulTalkController.js` calls `runRaphaelCore()` and applies the result through `applyRaphaelCoreResult()` — this is the live runtime path, not a design draft.

The pipeline is deterministic and rule-based, not an LLM call:

```text
inputGateway → safetyShield → intentClassifier → emotionInterpreter → semanticSoulModel
→ reactionPlanner → responseStrategySelector → responseComposer
→ memory (retriever / writer / recall policy) → trace / animation mapping → state update
```

Around that core sit: an NLU sub-pipeline (`src/ai/nlu/*`), dialogue management (`src/ai/dialogue/*`, anti-loop / quick replies / variants), eval critics for safety / boundary / persona / memory / reply / constitution (`src/ai/eval/*`), a bounded autonomy loop (`src/ai/autonomy/*`), and a self-evolution proposal pipeline (`src/ai/evolution/*`) that can *propose* patches but **cannot auto-merge them** — every change still needs human approval.

This layer is local and deterministic. It does **not** use an LLM, backend, database, or external API (`external_llm_in_runtime: false`). Any advisory bundle (e.g. the Nuwa distillation bundle) is `trusted:false` — advisory only, never authoritative over RaphaelCore's safety, memory, boundary, or reply decisions.

Design rule:

```text
NexusCore decides emotion, intent, memory, boundary, reaction, trace, and animation.
LLM, if added later, may only be an optional language rendering layer.
```

Detailed architecture note: `docs/architecture/RAPHAEL_CORE_JS_V1.md`
Machine-readable current status: `docs/handoff/RAPHAEL_AI_STATUS.yaml`
Cross-agent work log (source of truth for "what's actually done"): `docs/agent/AI_EXECUTION_LEDGER.md`

---

## Release / Validation Status

Automated QA is extensive and currently green: full web-release gate, safety terminal invariant, sealed holdout conversation suite, dialogue policy, constitution policy, and Companion Growth state/browser suites all pass on the current `main` tree (see `docs/handoff/RAPHAEL_AI_STATUS.yaml` for exact counts and commit SHAs).

**None of that is human validation, and this project is not public-launch-approved.** The following gates are explicitly `not_run` and are required before any public-launch claim:

- Independent private-blind review (3+ testers × 20 scored turns each)
- Moderated first-session product-comprehension test (3+ independent participants)
- Required real-device / browser matrix (D1/D2/D3/D6)
- Legal / privacy / store-copy review
- Explicit Owner public-launch approval

None of the above require a public release to run — they are normally done against a private build or an unlisted link shared with invited testers, before any public launch decision. Treat this repository as a pre-commercial vertical slice until those gates close.

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

### Core Bible (historical reference; strategic canon below is authoritative)

```text
docs/legacy-bible/01_DESIGN_BIBLE.md
docs/legacy-bible/02_WORLD_BIBLE.md
docs/legacy-bible/03_CHARACTER_BIBLE.md
docs/legacy-bible/04_RUNTIME_CANON.md
docs/legacy-bible/README.md
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
docs/architecture/RAPHAEL_CORE_JS_V1.md
docs/handoff/RAPHAEL_AI_STATUS.yaml
src/ai/
```

`src/ai/` is the active, current-runtime RaphaelCore layer (see Release / Validation Status above). `docs/raphael/RAPHAEL_CONSTITUTION.md` is the persona/boundary contract; other historical Raphael sandbox material remains design reference only until integrated through reviewed task packs. A separate, intentionally decoupled standalone engine and gateway-lab prototypes live outside this repository under the shared workspace root — they are not part of this runtime.

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

Current focus:

```text
First Session Flow hardening — Safe Moonlake Exploration and the D2 safety terminal
```

**Initial Bond has shipped**: fresh saves already pick one of three starters (Greyshade Cat / Blazetail Kit / Crystalfin Seahorse); veteran saves keep their existing unlocks. Do not re-plan Initial Bond from scratch — the next work is hardening what comes *after* it (safe first exploration, D2 safety terminal), not the starter-choice step itself.

---

## Acceptance Question

Every feature must answer:

> Does this make the companion feel more clearly bounded, remembered, and changed by shared experience?

If not, it should not expand the root runtime.
