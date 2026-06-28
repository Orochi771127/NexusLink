# Nexus Link UI / HUD Architecture Handoff For Claude Code

Date: 2026-06-28  
Current branch: `integrate/ui-v2-raphael-main`  
Current baseline commit: `25b9944` (`fix: refine mobile v2 hud icons`)  
Owner of this handoff: Codex  
Intended next implementer: Claude Code

This file is a runtime handoff, not product canon. It is meant to let Claude Code continue the HUD/UI work from the current checkout without reconstructing the architecture from chat history.

## 1. Required reading before editing

Read these in order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `ACCEPTANCE.md`
4. `NEXUS_LINK_MASTER_CANON_v3.1.md`
5. `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`
6. `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`
7. This file
8. The V2 UI design handoff / screenshots supplied by the human

If a V2 design file conflicts with the Master Canon, `AGENTS.md`, or the no-FOMO/no-shop/no-dependency rules, keep the canon and report the conflict.

## 2. Current UI direction

The target direction is the supplied Nexus Link UI V2 / HUD look:

- moonlit or deep-blue glass HUD;
- thin mist-gold / ice-blue borders;
- readable but low-pressure companion habitat;
- bottom nav with five clear emotional verbs:
  - `探索`
  - `照顧`
  - `心核`
  - `成長`
  - `記憶`
- live companion area must stay visually protected;
- settings and long controls should be inside panels/pages, not persistent HUD buttons.

Important product rule: do not add shop, FOMO, red-dot pressure, currency purchase prompts, multi-companion party logic, or ordinary RPG combat framing even if the visual references contain store/currency-like UI.

## 3. Runtime constraints

This repo is intentionally simple:

- HTML
- plain CSS
- Vanilla JS ES modules
- PixiJS v8 from CDN
- localStorage through existing state/save paths
- no build step
- no React / Vue / Svelte / TypeScript
- no CSS framework
- no npm dependency
- no backend / database / LLM API

High-risk / groundwork files:

- `index.html`
- `src/state/**`
- `src/state/saveManager.js`
- `src/state/store.js`
- `assets/**`
- `tools/**`
- `scripts/**`

Changing `index.html` is allowed only after a clear plan because it is a Groundwork file in `AGENTS.md`.

Do not modify `assets/**` unless the human explicitly approves asset changes. New generated icons or images must be human-approved before entering `assets/`.

## 4. Current HUD / UI file map

### DOM skeleton

`index.html`

Main structures:

- `<html data-ui="v2" data-variant="B">`
- `.app-shell`
- `.habitat-stage`
- `.scene-layer`
- `#game-root`: Pixi-owned canvas root
- `.companion-focal-zone`: visual budget marker / focal zone
- `.v3-home-presence`: small Moonlake Habitat chip
- `.core-hud`: top-left companion card
- `.quick-hud`: top-right settings-only cluster
- `.soul-talk-launcher.soul-strip`: bottom Soul Talk strip
- `.bottom-nav.bottom-nav--aurora`: five-button persistent nav
- `#page-layer`: true Explore/Care/Growth/Memory page surface
- `.panel-layer`: modal/dialog layer for settings, companion status, codex, map, Soul Talk drawer, etc.

Current top-right HUD intentionally has only Settings. The standalone speaker button was removed; audio belongs in Settings.

### CSS load order

From `index.html`:

1. `styles.css`
2. `styles/ui-v1.css`
3. `styles/layout-shell.css`
4. `styles/soul-talk-drawer.css`
5. `styles/page-full-nav.css`
6. `styles/page-content.css`
7. `styles/settings-page.css`
8. `styles/mobile-safari-polish.css`
9. `styles/ui-v2-aurora.css`
10. `styles/ui-v3-tokens.css`
11. `styles/ui-v3-onboarding.css`

Current responsibility split:

- `styles.css`: older global/base runtime CSS. Be careful; it still owns many legacy selectors.
- `styles/ui-v1.css`: older component layer.
- `styles/layout-shell.css`: DOM/Pixi shell boundary, overlay layout, z-index groups.
- `styles/soul-talk-drawer.css`: Soul Talk drawer/modal presentation.
- `styles/page-full-nav.css`: bottom nav and page-nav shell.
- `styles/page-content.css`: Explore/Care/Growth/Memory true page layout.
- `styles/settings-page.css`: Settings panel.
- `styles/mobile-safari-polish.css`: small-screen/Safari tuning.
- `styles/ui-v2-aurora.css`: late V2 glass/HUD overrides.
- `styles/ui-v3-tokens.css`: V3 tokens plus current Moonlake presence chip.
- `styles/ui-v3-onboarding.css`: Start / Identity / Guidance / onboarding surfaces.

Known CSS debt: several files now override the same selectors. If doing a serious UI pass, prefer consolidating V2 HUD ownership into a clear file boundary instead of adding more high-specificity patches.

### JS controllers

`src/app.js`

- bootstraps state, scene, HUD, panels, onboarding, pages, settings, Soul Talk, and audio;
- calls `AudioManager.initUnlock()`;
- still has `bindAudioControls()` compatibility code that looks for `#btn-audio-toggle`, but that button no longer exists. This is currently harmless because the function returns early.

`src/ui/panelManager.js`

- single modal panel authority;
- sets `hidden`, `aria-hidden`, and `inert`;
- prevents active pages from staying interactable beneath modal panels;
- important for avoiding the previous overlap bug where companion card and Care page stacked visually.

`src/ui/pageRouter.js`

- owns true-page navigation for `home`, `explore`, `care`, `grow`, `memory`;
- toggles `body.page-open`;
- routes bottom nav actions;
- renders page content through `innerHTML`;
- currently contains serious mojibake in user-facing copy. See unresolved issues.

`src/ui/actionSheetController.js`

- still owns many underlying relationship action handlers;
- `pageRouter` calls it for actual action commits;
- do not bypass it unless the action model is explicitly redesigned.

`src/ui/hudController.js`

- renders core HUD values and companion status modal.

`src/ui/soulTalkController.js`

- owns Soul Talk strip/drawer behavior and Raphael/Soul Talk runtime path;
- do not change Raphael behavior as part of pure HUD work unless the task explicitly includes Raphael.

`src/ui/settingsController.js`

- owns Settings panel input and restart-onboarding action;
- now routes volume ranges to `AudioManager.setVolume()`;
- does not persist volume range values yet.

`src/audio/audioManager.js`

- owns unlock/mute/BGM volume;
- current persisted audio state is still only `nexusLinkAudioMuted:v1`;
- current range values are in-memory only by design to avoid schema/storage expansion during the HUD fix.

## 5. Current bottom nav status

The bottom nav is in `index.html` lines near `.bottom-nav--aurora`.

Current state:

- Explore/Care/Growth/Memory use existing assets:
  - `assets/ui/nav/nav_explore_default.png`
  - `assets/ui/nav/nav_explore_active.png`
  - `assets/ui/nav/nav_care_default.png`
  - `assets/ui/nav/nav_care_active.png`
  - `assets/ui/nav/nav_grow_default.png`
  - `assets/ui/nav/nav_grow_active.png`
  - `assets/ui/nav/nav_memory_default.png`
  - `assets/ui/nav/nav_memory_active.png`
- Center `心核` is currently CSS-drawn with `.nav-core-gem`, not an asset.
- Text spans still exist for accessibility/backward compatibility, but V2 image buttons visually hide labels for the four non-core actions.

If replacing iconography:

- prefer CSS/SVG/DOM if the task is pure code;
- if adding bitmap images, ask human approval before writing to `assets/**`;
- keep button accessible names in `aria-label`;
- keep exactly five actions unless the human opens a new scope.

## 6. Current known fixed issues

These were fixed before this handoff:

- Start / Identity / Guidance / Settings visibility was restored.
- Settings panel route was added.
- Modal panels now hide/inert inactive content to avoid overlapping with page content.
- Standalone HUD speaker button was removed.
- Settings audio sliders now affect in-session audio volume.
- Bottom nav now uses V2-style repo nav images for four actions.
- Moonlake Habitat presence block was reduced into a smaller chip.
- Automated web release gate passes 9/9 required automated checks on the baseline commit.

## 7. Known unresolved issues / do not silently ignore

### P0 / P1 for Claude UI pass

1. **Mojibake / corrupted Traditional Chinese copy**
   - Seen in `index.html` metadata/title/aria labels and especially `src/ui/pageRouter.js`.
   - Some visible page copy can render as corrupted text.
   - Needs a deliberate UTF-8 text recovery/rewrite pass.
   - Do not try to guess high-stakes safety/Raphael copy; keep Raphael safety copy unchanged unless the task includes Raphael QA.

2. **V2 visual parity is still incomplete**
   - Current HUD is functional and closer to V2, but not a faithful V2 reconstruction.
   - Bottom nav uses existing image tiles for four items but center Heart/Core is CSS-only.
   - Glass depth, spacing, typography, and icon semantics need a cohesive pass against the supplied V2 design file.

3. **CSS ownership is fragmented**
   - `page-full-nav.css`, `ui-v2-aurora.css`, `ui-v3-tokens.css`, `mobile-safari-polish.css`, and older base CSS all affect HUD.
   - Avoid adding another layer of overrides unless it is a small emergency fix.
   - A better pass should define which file owns:
     - persistent HUD;
     - bottom nav;
     - Soul Talk strip;
     - page panels;
     - onboarding.

4. **Real-device Safari fit remains human-only**
   - Automated 390x844 checks passed, but Safari browser chrome and device safe areas can still shift the usable viewport.
   - Human phone screenshots remain required.

5. **Page content is structurally true-page but not V2-complete**
   - Explore/Care/Growth/Memory pages are generated by `pageRouter.js`.
   - They need V2 copy/layout polish and mojibake cleanup.
   - Care must not become feeding/gift economy.
   - Growth must not become combat power leveling.
   - Memory must show actual saved data only.

### Lower-priority cleanup

6. `src/app.js` still contains harmless dead compatibility code for the removed `#btn-audio-toggle`.
   - Can be removed in a cleanup pass if approved.

7. Settings volume ranges are not persisted.
   - This is intentional for now.
   - Persisting volume settings would need an explicit storage plan and acceptance criteria.

8. `index.html` title currently appears corrupted in source.
   - Visible browser title / accessibility metadata should be corrected during the text cleanup pass.

9. Local QA output files may exist as untracked files:
   - `docs/qa/_live_playtest_gate_output.json`
   - `docs/qa/_nlu_smoke_output.json`
   - `docs/qa/_web_release_gate_output.json`
   - Do not stage them unless the human explicitly asks.

## 8. Suggested Claude Code task shape

Before implementation, Claude Code should present a plan with:

- Task name
- Layer: `EXPERIENCE`, and explicitly mark any `index.html` edits as Groundwork touch
- Files touched
- Risk
- Rollback
- Red-line check
- Non-goals
- Test plan

Recommended implementation sequence:

1. Read the V2 design handoff/screenshots.
2. Capture current runtime screenshots at:
   - 390x844
   - 430x932
   - 1280x900
3. Produce a small UI delta plan:
   - HUD spacing and z-index;
   - nav icon system;
   - Soul Talk strip and Moonlake chip budget;
   - settings route;
   - page panel proportions;
   - text/mojibake cleanup.
4. Get human approval.
5. Implement in a narrow staged set.
6. Verify:
   - `node --check` for changed JS files;
   - `git diff --check`;
   - `node docs/qa/state-onboarding-migration-cases.mjs` if any onboarding/state-adjacent code is touched;
   - `python docs/qa/_run_web_release_gate.py`;
   - browser screenshots at mobile and desktop sizes.

## 9. Acceptance criteria for the next UI/HUD pass

Minimum acceptance:

- no standalone speaker icon in HUD;
- Settings remains reachable and audio controls remain inside Settings;
- companion center/lower-middle display is not blocked by persistent HUD;
- Moonlake chip is readable but does not dominate the companion zone;
- bottom five actions are visually and semantically recognizable;
- no overlapping page + companion modal bug;
- no horizontal overflow at 390x844;
- no focusable controls hidden under `aria-hidden`;
- no corrupted visible Traditional Chinese copy on Start/Home/Explore/Care/Growth/Memory/Settings;
- Web Release Gate automated checks still pass.

## 10. Explicit non-goals

Do not do these in the UI/HUD pass unless the human separately approves:

- no desktop wrapper / Steam build;
- no package manager or build step;
- no React/TypeScript migration;
- no Pixi renderer rewrite;
- no new companion assets;
- no generated image import into `assets/**`;
- no localStorage schema expansion unless specifically approved;
- no Raphael autonomy / safety policy changes;
- no shop, FOMO, daily check-in pressure, or paid currency flow;
- no multi-companion party system.

## 11. Future 2.5D Habitat Direction

Added by the Aurora World Atlas pass (2026-06-28). The human-supplied 2.5D isometric
habitat mockup is adopted as **visual language and HUD framing only**:

- Only the visual direction and HUD framing are taken from the mockup.
- Do NOT change the Pixi renderer (`src/pixi/pixiApp.js` stays as-is).
- No multi-companion-on-screen / party rendering; the single-active-companion model is preserved.
- Do NOT introduce currency, daily reward, level grind, or FOMO, even though the mockup shows them.
- A real 2.5D habitat prototype (true isometric scene) must be opened as a **separate TASK_PACK**
  and is GROUNDWORK because it touches the Pixi renderer.

## 12. Read-only Nexus Area / Linkara World Atlas

Added by the Aurora World Atlas pass (2026-06-28). The human-supplied Linkara world map is
adopted as a **read-only World Atlas** reachable from the Explore page:

- It is a read-only World Atlas inside Explore
  (`data-panel="atlas"` in `index.html`, `src/ui/atlasController.js`, `styles/world-atlas.css`).
- It only expresses "月湖 (Moonlake / region 5) is the current location; the other regions are still far away."
- No completion percentage, no unlock tasks, no countdown, no collection pressure
  (canon red line 6 / `ACCEPTANCE.md` D6 and K9).
- No PNG is imported. The atlas is a CSS/SVG placeholder; the real map asset requires a
  **separate `assets/**` GROUNDWORK pack** with explicit human approval.
