# Linkara Six-Region Diorama R2 — QC

Status: `promoted_runtime`. Owner approval was confirmed by continuation, and the pack is promoted to `assets/**` and wired to runtime.

## Automated checks

- 12 R2 foundation candidates are normalized to `1080x1920`, RGBA.
- 12 mobile previews and 12 companion-placement previews are `390x844`.
- Six depth masks and six placement masks retain the R1 camera/anchor contract.
- Manifest, Scene Profile staging and dimension/alignment report parse as JSON.
- Day/night pairs share one composition; night is a lighting-only relight.
- No actors, text, UI, baked rain, sun, moon or stars were introduced into the foundations.

## R2 material review

| Region | Anchor | Material and placement review |
|---|---:|---|
| Central Radiant Core | `(0.50, 0.69)` | Ivory clay towers, gold-painted trim and turquoise resin water read as a built scale model. Character is centered on the foreground rune plaza. |
| Eastern Mystic Mountains | `(0.50, 0.52)` | Charcoal clay rock modules and translucent amethyst resin accents replace the painterly R1 look. The runtime anchor was corrected after 390×844 review so the character sits at the rune-plaza centre rather than on the lower stairs. |
| Northern Verdant Plains | `(0.50, 0.66)` | Rounded plasticine foliage, hand-built cottages and a glossy resin river create the clearest playful miniature read. Character is grounded on the circular plaza. |
| Southeast Forge Hills | `(0.50, 0.62)` | Soot-dark clay machinery, copper paint and orange/cobalt resin channels read as a physical model kit. Character stays inside the octagonal platform. |
| Southern Harbor Nexus | `(0.50, 0.68)` | Ivory clay city, blue-painted roofs, model ships and turquoise resin water preserve the harbor identity. Character occupies the compass plaza without blocking the docks. |
| Southwest Tidal Frontier | `(0.50, 0.63)` | Dark clay cliffs, model piers, violet resin seams and a glossy ocean preserve the dangerous frontier mood. Character remains readable on the compass platform. |

## Layering contract

1. coherent R2 day/night foundation pair;
2. depth mask for far/mid haze and runtime parallax treatment;
3. placement mask for HUD, Dock and companion reservation;
4. transparent foreground occlusion and placeable props only after Owner foundation approval;
5. runtime weather/time effects remain Pixi layers and are not baked into art.

The R2 images intentionally strengthen physical materials without adding loose props to the companion plaza. This prevents the active character from appearing pasted over scenery and preserves future map-editing space for emotion crystals.

## Final gate

- `humanApproved: true`
- `referenceAuditPassed: true`
- `runtimeIntegrated: true`
- Browser QA: all seven atlas nodes selectable without changing chapter progression; six R2 regions plus Moonlake verified at 390×844 in day and night phases.
- Placement QA: every active companion anchor visually lands on the region's plaza centre; Moonlake and Mystic Mountains were corrected during runtime review.
- Persistence QA: selected habitat and its visible name survive reload.
