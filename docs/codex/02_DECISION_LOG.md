# 02 — Nexus Link Decision Log

This file records stable architecture and product decisions for coding agents. It should be updated when the human approves a directional change.

## 2026-07-03 — GitHub is the shared project brain

Decision:

Nexus Link project context should live in GitHub as structured documents, not as raw chat logs.

Reason:

Raw conversations contain obsolete ideas, emotional exploration, partial drafts, and conflicting intermediate decisions. Coding agents need concise, stable, executable context.

Implementation:

- Keep `AGENTS.md` as the top-level AI collaboration rulebook.
- Keep compact Codex-facing context under `docs/codex/`.
- Use decision logs, task files, architecture rules, and acceptance criteria instead of copying full ChatGPT conversations into prompts.

Codex instruction:

Read `AGENTS.md`, then this `docs/codex/` folder, before making architectural changes.

## 2026-07-03 — Web/PixiJS remains the active runtime

Decision:

The Web / PixiJS version remains the active product runtime and commercial vertical-slice path.

Reason:

The project already has a working Web-first direction. Rebuilding the whole game in Unity now would increase scope risk and fragment the product.

Implementation:

- Preserve the current Web / PixiJS architecture.
- Do not introduce a new framework or build system without explicit approval.
- Treat runtime changes to `index.html`, `src/pixi/pixiApp.js`, `src/state/saveManager.js`, `src/state/store.js`, `assets/**`, `tools/**`, and `scripts/**` as high-risk groundwork work.

Codex instruction:

Do not migrate the runtime from PixiJS to Unity unless a future decision log entry explicitly says so.

## 2026-07-03 — Unity/UModeler is an asset production pipeline, not the main runtime

Decision:

Unity / UModeler may be used to produce layered habitat scenes and asset exports for the Web runtime, but Unity is not currently the main runtime replacement.

Reason:

Unity is useful for scene composition, camera staging, parallax-ready rendering, and visual production. The active product remains Web/PixiJS.

Implementation:

Unity-generated scenes should export Web-friendly files such as:

- `Background.png`
- `Midground.png`
- `Foreground.png`
- `Overlay.png`
- `manifest.json`

Codex instruction:

When implementing Unity-related work, prefer Editor Scripts and batchmode automation. Do not hand-edit large `.unity` scene YAML files unless explicitly required.

## 2026-07-03 — Do not sync raw ChatGPT conversations into Codex

Decision:

ChatGPT discussion outcomes should be summarized into context patches, not pasted wholesale into Codex prompts.

Reason:

Full chat logs increase context noise and can make agents follow outdated branches of thought.

Implementation:

Preferred handoff format:

- summary
- decisions
- constraints
- files to touch
- non-goals
- acceptance checks
- rollback plan

Codex instruction:

Treat `docs/codex/` as curated context. If a user prompt contradicts this folder, report the conflict and ask for explicit direction before changing high-risk files.

## 2026-07-03 — Single-active-companion remains the runtime model

Decision:

Nexus Link may contain many companion candidates, but the active runtime model remains one active companion at a time.

Reason:

The emotional contract is stronger when the relationship stays focused. Multi-companion or party systems risk turning the game into collection pressure or generic RPG team-building.

Implementation:

- Greyshade Cat remains the default active companion.
- Runtime-ready companions can be selectable only through approved flows.
- No party system.
- No multi-companion same-scene lineup.
- No multi-companion combat team.

Codex instruction:

Do not add party, squad, dispatch, offline farming, ranking, or team-combat semantics unless a future approved decision changes this.
