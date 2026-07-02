# 01 — Nexus Link Project Brief

This document gives Codex and other coding agents a compact project-level context. It does not replace `NEXUS_LINK_MASTER_CANON_v3.1.md`, `CLAUDE.md`, `AGENTS.md`, or runtime source code.

## Project Identity

**Nexus Link / 心核連結** is an emotional habitat AI companion game.

Core promise:

> This is not an electronic pet. This is your companion.

The game centers on a boundary-aware companion lifeform that remembers, reacts, and changes through player interaction. The companion should feel like a living partner with agency, not a generic chatbot, task assistant, vending machine, or RPG stat unit.

## Current Product Stage

Current stage: **Pre-Commercial Vertical Slice / 商業化前垂直切片期**.

The current Web version is the active product path. Treat it as the commercial vertical slice, not a throwaway MVP.

The near-term goal is first-session coherence:

- the player understands what the companion is
- the companion has visible presence and boundary
- the habitat feels alive but not noisy
- Soul Talk / RaphaelCore behavior stays safe and game-integrated
- UI polish supports calm companionship instead of pressure loops

## Runtime Direction

Current runtime direction:

- Web-first
- PixiJS-first
- HTML / CSS / Vanilla JavaScript
- no React / Vue / Svelte
- no TypeScript
- no npm package dependency or build step unless the human explicitly authorizes it
- GitHub Pages-compatible static deployment

## Companion Model

RaphaelCore is companion-agnostic. It is not the visual animal itself.

Greyshade Cat remains the default active companion and first validated runtime carrier. The runtime model is **single-active-companion only**.

Multiple runtime-ready companions may exist, but the player should not have a party, multi-companion same-scene lineup, or combat team unless a future approved decision changes this.

## Emotional Contract

Every feature should reinforce these contracts:

1. The companion remembers the player, but does not belong to the player.
2. The companion can approach, but must not engulf the player.
3. The player can influence the companion, but cannot dominate it.

Do not create mechanics that flatten the companion into obedience, rewards, chores, streak pressure, daily checklists, or generic stat farming.

## Canonical World Model

World: **Linkara**.

Fixed major regions:

- 東南熔爐丘陵區
- 中央輝耀核心區
- 北部翠綠平原區
- 南港
- 月湖營地
- 秘境山脈核心
- 西南潮汐邊疆區

Main factions:

- 心輝議會
- 黑鐵駭客
- 混頓裂隙

Formal canon uses **混頓裂隙**. Player-facing casual language may use **混沌裂隙** when appropriate.

## AI Role Boundary

Codex should mainly help with:

- architecture review
- task-pack decomposition
- code changes within stated boundaries
- automated validation
- Codex handoff documents
- Unity/PixiJS pipeline specifications when explicitly requested

Codex must not silently change product direction, add dependencies, change the runtime stack, or bypass the human approval gates defined in `AGENTS.md`.
