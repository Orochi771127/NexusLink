# Nexus Link Commercial UI/UX Handoff

> Status: CURRENT commercial UI/UX handoff
> Audience: Claude Code / Fable 5, Codex, ChatGPT, and any agent preparing the next commercial vertical-slice UI/UX TASK_PACK.
> Scope: Documentation authority, readable canon summary, and Fable 5 execution boundary for the commercial First Session Flow and V3 UI/UX slice.

This document is the working entry point for commercial UI/UX execution. It does
not replace `AGENTS.md`, `CLAUDE.md`, or `ACCEPTANCE.md`. It exists because the
repo contains many useful older planning files, and the next agent needs one
clear route through them.

## 1. Product Position

Nexus Link is a Web-first emotional habitat game. The first commercial proof is
not a collection game, RPG battle loop, chatbot, AI girlfriend, therapy product,
or daily-task product.

Current commercial focus:

- First-session companion: `greyshade-cat`.
- First-session place: Moonlake / Moon Lakefront habitat.
- Runtime shape: one active companion at a time.
- Player promise: the companion remembers, has boundaries, and the habitat shows
  relationship traces without guilt, streak pressure, or FOMO.
- Delivery path: canonical Web runtime first; Steam/demo wrapper decisions come
  only after web release gates and human approval.

The next UI/UX implementation should make a first-time player understand:

1. who they are in this world,
2. who Greyshade Cat is,
3. what can be done now,
4. what changed because of the player,
5. why returning later matters without pressure.

## 2. Readable Canon Summary

Use this section as the compact execution summary for commercial UI/UX work. It
does not replace `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`; it condenses
the current practical constraints from the Master Canon, `CLAUDE.md`,
`AGENTS.md`, `ACCEPTANCE.md`, and
`docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`.

### Emotional Contracts

- The companion remembers the player, but does not belong to the player.
- The companion can move closer, but must not consume the player's life or
  become a guilt-driven dependency object.
- The player can influence the companion, but cannot command, force, or own it.

### Safety And Product Red Lines

The next UI/UX work must not add:

- dependency-detection-driven behavior,
- irreversible bad endings,
- safety or crisis content as gameplay reward,
- FOMO, red dots, streaks, countdowns, daily pressure, absence blame, or task
  anxiety,
- gacha, rarity, store currencies, power bundles, loot loops, or character
  collection pressure,
- romantic dependency, medical claims, therapy claims, or "always waiting"
  language,
- backend, database, external LLM, tool-calling agent, npm dependency, framework,
  TypeScript, or build step.

### RaphaelCore Boundary

RaphaelCore is a Stateful Companion Cognition Agent: safety-gated,
memory-bearing, boundary-aware, companion-agnostic, and game-integrated. It is
not a task agent, web/tool agent, therapy/crisis agent, customer-service
assistant, sycophantic chatbot, generic NPC dialogue bot, or autonomous gameplay
controller.

Any gateway, LangGraph layer, or training bundle may advise only. It cannot
override RaphaelCore safety, boundary, memory, state delta, response policy, or
companion shell rules.

## 3. Document Authority Table

| Status | Document or folder | Use |
| --- | --- | --- |
| CURRENT | `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` | Highest strategic canon. Use this handoff as the practical UI/UX execution entry, but resolve strategic conflicts against the Master Canon. |
| CURRENT | `AGENTS.md` | Cross-agent rules, file authorization levels, red lines, and ledger protocol. |
| CURRENT | `CLAUDE.md` | Development constitution, current stage, technical boundaries, and task authorization. |
| CURRENT | `ACCEPTANCE.md` | Human-checkable acceptance criteria, including safety, art, runtime, and First Session Flow. |
| CURRENT | `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md` | Approved commercial sequencing, V3 direction, package gates, and release path. |
| CURRENT | `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md` | Current V3 visual grammar and UI/UX screen behavior. |
| CURRENT | `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md` | NexusLink player-facing copy final pass, adapted from anti-vibe-writing principles. |
| CURRENT | `docs/production/ANTI_AI_SLOP_UX_GATE.md` | Decision prompts, truthful-affordance rules, edge-state matrix, and evidence gate for the First Session Flow. |
| CURRENT | `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md` | Web release gate and private-test evidence rules. |
| CURRENT | `docs/testing/PRIVATE_TEST_SCRIPT.md` | Moderated private-test script and pass criteria. |
| CURRENT | `docs/qa/WEB_RELEASE_EVIDENCE.md` | Current evidence record; automated pass does not mean public release approval. |
| CURRENT | `docs/agent/AI_EXECUTION_LEDGER.md` | Operational handoff history; not product canon. |
| NEEDS UPDATE | `docs/architecture/RUNTIME_MAP.md` | Useful architecture map, but contains stale storage/runtime facts; verify against code before using. |
| NEEDS UPDATE | `docs/asset-pipeline.md` | Useful pipeline base, but the 64x64 sprite flow must be separated from the current 512 illustrated companion policy. |
| REFERENCE ONLY | `docs/legacy-bible/**` | Historical product memory. It cannot override current commercial canon. |
| REFERENCE ONLY | `docs/r2-canon/**` | R2 prototype and reference material. It cannot override current commercial UI/UX direction. |
| REFERENCE ONLY | Early v0.3/v1 docs under `docs/` | Planning archive. Use only when a current file points to it. |

## 4. Fable 5 UI/UX Execution Boundary

The first Fable 5 commercial TASK_PACK should focus on the UI/UX vertical slice:

- Start
- Local Identity
- Heart-Core Guidance
- Home
- Explore
- Care
- Growth
- Memory
- Soul Talk
- Return Echo

The implementation goal is not to add more systems. The goal is to make the
existing commercial first-session loop understandable, visually coherent,
emotionally safe, and usable on mobile.

### Allowed UI/UX Direction

- Use the V3 moonlake visual system: restrained night/dawn habitat, moon-white
  copy, muted cyan heart-core focus, mist-gold framing, low-contrast glass, and
  clear companion focal zone.
- Keep text-heavy and accessibility-sensitive surfaces in DOM.
- Keep Pixi responsible for habitat, companion, motion, and traces.
- Keep copy short and concrete.
- Run player-facing copy through `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md`
  before final handoff. This is a final-pass writing guide only; it does not add
  an external dependency or change runtime behavior.
- Show relationship evidence through traces, body language, remembered lines, or
  quiet state changes before exposing numbers.
- Preserve the four core destinations: Explore, Care, Growth, and Memory. Home
  is the default habitat, not a fifth resource-heavy tab.

### Forbidden Scope Without A New Approval

Do not implement or imply:

- party system, multi-companion same-scene play, or team battle,
- battle/RPG expansion beyond current approved standoff language,
- chapter unlock economy, store, currency, gacha, rarity, or skins shop,
- real backend, accounts, database, external LLM, API keys, npm packages, build
  tools, React, Vue, Svelte, TypeScript, or CSS frameworks,
- Steam desktop wrapper, Tauri/Electron project, SteamPipe, public release, or
  deployment.

### Groundwork Files

These files remain GROUNDWORK or locked. Fable 5 must not modify them unless a
separate human-approved plan explicitly authorizes that file:

- `index.html`
- `src/state/saveManager.js`
- `src/state/store.js`
- `src/state/defaultState.js`
- `src/pixi/pixiApp.js`
- `assets/**`
- `tools/**`
- `scripts/**`

If the UI/UX work genuinely needs any of these, stop and open a GROUNDWORK
TASK_PACK with migration and rollback notes.

## 5. Acceptance References

The next UI/UX TASK_PACK must self-check against:

- `ACCEPTANCE.md` D: safety red lines,
- `ACCEPTANCE.md` G: companion art policy,
- `ACCEPTANCE.md` H: technical foundation,
- `ACCEPTANCE.md` I: smoke regression,
- `ACCEPTANCE.md` K: First Session Flow / Vertical Slice,
- `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`: mobile, accessibility,
  release-blocking, private-test, and evidence rules.

Minimum commercial UI/UX pass:

- Fresh player can understand the first-session path without coaching.
- Greyshade Cat is visibly the first companion and not a collection entry point.
- Boundary/refusal does not read as punishment.
- Return Echo does not blame absence.
- Soul Talk remains readable and usable on mobile.
- Player-facing copy has passed the NexusLink copywriting final pass: no generic
  AI scaffolding, business jargon, FOMO/reward phrasing, dependency copy, or
  decorative Markdown.
- Explore, Care, Growth, and Memory are true product surfaces or clearly scoped
  transitional surfaces, not shop/task dashboards.
- No blocked GROUNDWORK file is changed without explicit approval.
- Every visible affordance has a real result, and every unavailable action gives
  a concrete reason and safe next step.
- Fresh, busy, empty, recoverable-error, unavailable, and completed states are
  either implemented or explicitly ruled out for each first-session surface.

## 6. Required Final Report For The Next Agent

The next agent must report:

1. changed files,
2. what each change does and why,
3. acceptance refs checked,
4. verification commands and browser/device checks,
5. unresolved risks,
6. updated `docs/agent/AI_EXECUTION_LEDGER.md` entries in the relevant lanes,
7. explicit statement that no commit or push was performed unless the human
   separately requested it.
