# Habitat Mobile Composition Design QA

## Scope

- Task: `TP-HAB-COMPASS-CENTER-ALIGN-2` (correction pass after mobile composition review)
- State: post-onboarding home habitat, active companion visible, bottom navigation and Soul Talk launcher visible.
- Viewports: `390x844` and short Safari-like `390x664`.
- Source visuals: `C:\Users\User\.codex\codex-remote-attachments\019f64ac-cfb4-7e40-9123-87dafe4f37c8\69DA9091-7455-49F7-891F-00D2B226EF9A\1-照片-1.jpg` through `7-照片-7.jpg`.
- Implementation captures: `C:\Users\User\.codex\visualizations\2026\07\15\019f64ac-cfb4-7e40-9123-87dafe4f37c8\habitat-mobile-composition\`.

## Combined comparisons

Each comparison places the supplied iPhone screenshot on the left and the repaired local implementation on the right at the same normalized habitat viewport.

1. `compare-1-forge.png`
2. `compare-2-tidal.png`
3. `compare-3-harbor.png`
4. `compare-4-radiant.png`
5. `compare-5-verdant.png`
6. `compare-6-mystic.png`
7. `compare-7-moonlake.png`

The comparison run selects 焰尾小狐 to match the supplied screenshots. Character art and scale were intentionally left unchanged; this review compares composition, anchoring, and UI surfaces.

## Findings and iteration history

1. The initial screenshots showed the companion at nearly the same low screen position in every habitat. Code tracing confirmed that `positionCompanion()` applied each Scene Profile anchor, but the next motion tick restored the stale Moonlake `baseX/baseY`.
2. The first correction still treated the Scene Profile anchor as a foot/plaza anchor. The user correctly rejected that result: the requirement is that the rendered companion's visual center, not its feet, lands on the visible compass/cross center. This was tracked as a P1 visual mismatch and the earlier pass was not accepted as final.
3. Each Scene Profile now records the compass/cross as a point in the `1080x1920` background artwork. The renderer projects that point through the same responsive cover transform as the background, then offsets the bottom-center sprite frame so the companion's measured opaque visual center lands on the point. This keeps the asset anchor contract intact while making placement responsive.
4. The habitat switch still rebases motion coordinates, scale, alpha, and rotation immediately after applying the selected Scene Profile. Seven real atlas switches were left running for at least one second before capture; the companion remained centered after switching and idle animation.
5. The gentle invitation remains in the upper habitat band with transparent background, zero border, no box shadow, and multi-layer text shadow for contrast. The lower-left habitat name likewise remains unframed and transparent.
6. The seven updated combined comparisons show the supplied low/foot-biased placement on the left and visual-center-on-compass placement on the right. No invitation/companion overlap, habitat-name/companion overlap, or visible pill surface remains.

## Validation

- `node --check src/app.js`: passed.
- `node --check src/pixi/motionController.js`: passed.
- `node --check src/pixi/companionRenderer.js`: passed.
- `node --check src/data/sceneProfiles/linkaraRegionProfiles.js`: passed.
- `node --check src/data/sceneProfiles/moonlakeProfile.js`: passed.
- Full `src/**/*.js` syntax sweep: `239/239` passed.
- Onboarding/Codex regression cases: `4/4` passed.
- Motion rebase assertion with a mocked companion: passed.
- `git diff --check`: passed.
- In-app browser interaction flow `探索 -> 世界地圖 -> 選區 -> 心核`: passed for all seven habitats at `390x664`.
- Responsive visual-center projection: passed at `390x664`; representative core, mystic, tidal, and Moonlake scenes also passed at `390x844`.
- Horizontal overflow at `390x664`: none (`bodyScrollWidth === bodyClientWidth === 390`).
- Browser console warnings/errors for the final uncached origin at `390x844` and `390x664`: none.
- Full web release gate: blocked before report generation by an existing asset-integrity runner type error (`dict` passed to `startswith`); no release-gate output file was changed.

final result: passed
