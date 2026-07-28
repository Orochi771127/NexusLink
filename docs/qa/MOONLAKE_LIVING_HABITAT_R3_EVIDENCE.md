# Moonlake Living Habitat R3 Evidence

## Status

- Task: `TP-MOONLAKE-LIVING-HABITAT-R3`
- Branch: `codex/moonlake-living-habitat-r3`
- Base: `origin/main`
- Runtime integration: verified locally
- Commit, push and publication: Owner authorized after the touch-affordance
  alignment correction; protected-main PR flow is required

R3 keeps the approved fixed-camera clay/resin Moonlake visual master and
strengthens the living 2.5D runtime around it. It does not replace the scene
with a flat 2D screen, add a free camera or claim that every visible detail is
freely explorable geometry.

## Completed scope

- Synchronized four-direction walk playback with measured projected travel
  speed for all sixteen runtime companions.
- Added species-aware stride profiles for feline, canine, deer, horse, bird,
  rabbit, seahorse and wyrm silhouettes.
- Replaced short repeated fishing loops with an interruptible
  `cast -> wait -> bite -> reel -> settle` sequence.
- Kept the fishing line visible during the wait and extended its endpoint past
  the selected bridge rail into the water.
- Added touch responses for two lanterns, four crystals, two waterfall pools
  and the center lake.
- Added restrained lantern glow, crystal sparkle/particle bursts and water
  ripple feedback without reward or persistence writes.
- Strengthened the visual-master waterfall shader with downward-moving streaks,
  bands and foam pulses.
- Retained the existing bridge-clearance scale contract instead of enlarging
  companions beyond the safe deck width.
- Replaced the first-touch affordance's fixed viewport coordinate with the
  active companion's live Pixi bounds. The ring now follows roaming and bridge
  projection and scales from `68px` to `128px` with the visible silhouette.

No new binary art, dependency, save schema, relationship state, reward,
progression, Growth, unlock, Safety, RaphaelCore or battle logic was added.
Repository slimming and asset deletion remain a separate later task.

## Automated verification

All browser checks used a `390x844` mobile viewport.

| Check | Result |
| --- | --- |
| R3 living-habitat contract | PASS: 16 companions, 16 stride profiles, 9 interaction hotspots, 5 fishing phases |
| Four-direction roaming | PASS: left/right/front/back, one bridge traversal, fishing stop and reduced-motion fallback |
| Fishing orientation asset matrix | PASS: 16 companions x 5 placements = 80 cases |
| Live fishing orientation browser matrix | PASS: 80/80, maximum bound `59.48px`, rail-offset drift `0px`, maximum anchor datum drift `2.50px` |
| Live bridge and back-fishing browser matrix | PASS: 32/32, maximum bridge bound `59.42px`, maximum fishing bound `55.50px` |
| Stage 1 directional/fishing promotion | PASS: 68 promoted sheets across 16 companions |
| R3 real-touch interaction proof | PASS: lantern, crystal and water taps reached their authored hotspots |
| First-touch affordance at initial spawn | PASS: center aligned to the companion bounds within `1px`, size `126.02px` |
| First-touch affordance at bridge fishing | PASS: center aligned within `1px`, size `69.20px` |
| Fishing line placement | PASS: `43.96px` line, `extendsBeyondRail: true` |
| Walk cadence sample | PASS: `31.69px/s` projected travel with `3.0x` playback at near ground |
| Waterfall pixel motion | PASS: mean RGB-channel delta `0.797` after `650ms` |
| Browser runtime errors | PASS: zero page errors and zero console errors |
| JavaScript syntax | PASS: 364 JS/MJS/CJS files, zero failures |
| `git diff --check` | PASS |
| Complete repo-native web release gate | PASS: `28/28`, no accessibility warnings |

The protected-main remote `web-release-gate` must still pass on the exact
published commit. Physical iOS/Safari and representative mobile-GPU review
remain human gates.

## Visual proof

- `output/playwright/moonlake-r3-living-habitat-mobile.png`
- `output/playwright/moonlake-r3-fishing-zoom.png`

Generated Playwright captures remain ignored QA output and are not runtime
assets.
