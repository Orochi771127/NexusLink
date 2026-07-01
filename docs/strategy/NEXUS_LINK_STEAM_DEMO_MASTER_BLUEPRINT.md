# Nexus Link Steam Demo Master Blueprint

> Status: approved execution blueprint
> Scope: commercial Web vertical slice through a downloadable Steam Demo
> This document governs sequencing and approval gates. It is not authority above `NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, `CLAUDE.md`, or `ACCEPTANCE.md`.

## Product decision

Nexus Link ships its first commercial proof as a Web-first emotional habitat game. The demo proves one living habitat, one irreplaceable companion, remembered interaction, visible boundaries, and non-punitive return. A desktop Steam build is a later delivery vehicle, not a reason to fork or replace the canonical Web runtime.

The commercial focus is Greyshade Cat and Moonlake. The demo must not become a character collection game, a traditional RPG, an AI girlfriend, a healing or diagnostic service, a daily-task product, or a generic AI chatbot.

## Non-negotiable constraints

- Keep the root Vanilla JS, PixiJS v8, DOM UI, and `nexusLinkR2State:v1` runtime canonical.
- Do not introduce React, Vue, Svelte, TypeScript, npm packages, a build step, a backend, a database, or a runtime LLM during the Web demo path.
- Keep a single active companion. New saves begin with Greyshade Cat only; migration must not remove any previously unlocked companion, active companion, memory, trace, or player progress.
- Do not add gacha, stores, currencies, red dots, streaks, login punishment, FOMO, dependency detection, romantic dependency, medical claims, or safety-as-reward mechanics.
- Generated images and supplied reference images are visual references until a human approves an asset through the existing asset readiness process. Do not bake UI, text, or scenes into runtime companion frames.
- Every task pack must define files touched, risk, rollback, acceptance criteria, red-line review, non-goals, and test plan before human approval. Do not commit or push without explicit human instruction.

## V3 visual direction

The V3 direction preserves the language of the approved references while rewriting their product semantics:

- Illustrated moonlake habitats, deep indigo night, moon-white copy, muted cyan heart-core light, mist-gold framing, and low-contrast translucent surfaces.
- Greyshade Cat remains a high-detail illustrated, bottom-center companion and the visual focal point. Companion rendering uses linear sampling and mipmaps; legacy pixel assets remain reference-only unless separately accepted.
- Start, Local Identity, Heart-Core Guidance, Home, Explore, Care, Growth, Memory, Return Echo, and Settings use one visual system. UI, scene, and companion art remain separately composable.
- Preserve the four core actions: Explore, Care, Growth, and Memory. Home is the default habitat, not a fifth resource-heavy tab.
- Reject source-reference elements that conflict with canon: stores, currency purchase controls, all-character opening selection, high-pressure level/loot displays, forced gifts, and dependency-oriented copy.

## Raphael restricted habitat agent

Raphael is a local deterministic companion agent, not an external chatbot and not an autonomous gameplay controller.

- Its permitted outputs are a bounded reply or silence, body-language/animation intent, boundary behavior, rest or exploration suggestion, approved memory/trace decision, and safety exit.
- It can respond to Soul Talk, touch results, return, meaningful habitat transitions, exploration results, and standoff outcomes.
- It cannot navigate, open gameplay, force progression, push tasks, fetch, call the tool registry, alter the storage schema, import the store, call `updateState`, or directly mutate state.
- The agent produces serializable intents. A runtime-owned reducer applies approved state patches through the existing store path; visual cues travel through the existing EventBus bridge.
- External intelligence remains disabled. No LLM may become Raphael's authority; any future language-rendering advisor must be optional, privacy-limited, post-filtered, and separately approved after the required QA gates.

## Delivery sequence

### 1. Blueprint Lock / No Code

Create this document and record the package in the execution ledger. No runtime, asset, state, dependency, or release changes.

**Gate:** Blueprint agrees with current canon and collaboration rules.

### 2. V3 Visual System Tokens

Create a design-only visual system, token sheet, and 390×844 static preview. Define the visual language and the screen grammar for the first-session and core page surfaces without changing the runtime.

**Gate:** Human visual approval. No store, FOMO, all-character opening, or dependency copy enters the system.

### 3. State / Onboarding Migration

Add the smallest compatible `playerProfile` and `onboarding` data necessary for a quiet first session. New saves unlock Greyshade Cat only; legacy saves remain exactly as capable as before.

**Gate:** Explicit GROUNDWORK approval; new, legacy, partial, and malformed save cases pass.

### 4. Start / Identity / Guidance / Home

Implement a skippable local name, a brief non-task-like prologue, Heart-Core Guidance, Greyshade's initial encounter, and the V3 Home. The player may speak or simply remain present; no forced long dialogue or collection choice is introduced.

**Gate:** Explicit approval for `index.html`; 390×844 and desktop first-session checks pass.

### 5. Explore / Care / Growth / Memory full pages

Replace action-sheet-only entry points with full DOM content pages while preserving the existing engine boundaries.

- Explore begins with Moonlake, not an RPG world map expansion.
- Care expresses respectful presence, rest, and observation, not resource feeding or gift loops.
- Growth shows relationship chapters and observed tendencies, not combat power or grinding levels.
- Memory shows persisted memories, traces, and return evidence only.

**Gate:** Navigation does not regress existing map, codex, action, or Soul Talk behavior; no full-page surface behaves as a dismissible modal.

### 6. First Trace / Return Echo loop

Make First Touch, First Soul Talk, First Trace, leaving, and Return Echo legible as one persisted relationship loop. Existing non-guilt return behavior remains the fallback.

**Gate:** No duplicate memory/trace writes; high-risk safety routing never produces ordinary progression evidence; return copy remains non-punitive.

### 7. Illustrated runtime asset audit

Audit all active manifest entries, source/approval status, sprite sheet dimensions, sampling, anchoring, and simultaneous texture load. Fix only approved runtime mismatches; do not delete legacy assets until the reference audit is passed.

**Gate:** Explicit asset/renderer GROUNDWORK approval; live scene has no illustrated/pixel-style collision and no visible companion placement regression.

### 8. Raphael Restricted Habitat Agent

Connect the existing bounded autonomy loop to approved game events through a pure agent adapter and a runtime-owned intent reducer. Add visible but quiet agent presence only after an action the player can understand; never use a background timer to demand attention.

**Gate:** Action whitelist, no-fetch, no-store-import, no-direct-mutation, safety, boundary, memory, animation, and all existing Raphael regression suites pass.

### 9. Web release gate / private test pack

Publish a repeatable evidence package for desktop, 390×844 mobile, real-device checks, accessibility, save migration, asset integrity, Raphael safety, and moderated human playtests.

**Gate:** Testers understand remembered interaction, companion boundaries, and habitat change without interpreting refusal as punishment. Console has no blocking errors.

### 10. Desktop wrapper ADR

Only after the Web demo and private test gate pass, compare Tauri and Electron in an ADR. Evaluate canonical runtime reuse, save backup, offline behavior, keyboard/controller input, updates, crash handling, package size, SteamPipe reproducibility, privacy, and legal copy. This package creates no wrapper.

**Gate:** Human selects a single desktop path before any wrapper dependency or Steam build work begins.

## Release path

```text
Approved V3 visual system
  → Web first-session loop
  → full core pages and asset audit
  → restricted Raphael agent
  → Web release gate and private test
  → desktop wrapper ADR
  → desktop prototype and Steam build
  → Steam demo
```

The Steam demo is not ready until the Web runtime is stable, the private test evidence is acceptable, the desktop wrapper is approved, and asset/license/privacy/controller/update requirements are verified for the chosen distribution path.
