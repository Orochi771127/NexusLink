# Six Linkara Region Diorama R1 — QC

Status: `candidate_review`. Nothing in this pack is approved for `assets/**` or wired to runtime.

## Automated checks

- 12 normalized foundations are `1080x1920`, RGBA.
- 12 mobile previews and 12 companion-placement previews are `390x844`.
- Six depth masks and six placement masks are present.
- Manifest, Scene Profile staging and dimension/alignment report parse as JSON.
- Day/night pairs preserve the same major landmark order, plaza, approach and camera. The edge-correlation number is diagnostic only because night relighting suppresses many daytime edges; it is not used as a pass/fail geometry gate.

## Visual review

| Region | Companion anchor | Review |
|---|---:|---|
| Central Radiant Core | `(0.50, 0.69)` | Cat is centered on the gold rune plaza; no tower, crystal or bridge covers face/body/core. Far city is hazed while the plaza remains crisp. |
| Eastern Mystic Mountains | `(0.50, 0.62)` | Cat sits inside the main stone circle above the approach bridge; crystal clusters remain outside the body silhouette. Far peaks/citadel soften through mist. |
| Northern Verdant Plains | `(0.50, 0.66)` | Cat is grounded on the grass-stone circle; river, watermill and cottages remain readable behind it. No fence or flower cluster blocks the body. |
| Southeast Forge Hills | `(0.50, 0.62)` | Cat is on the forged octagonal platform with machinery kept to the perimeter. The plaza remains readable against lava/cobalt lighting. |
| Southern Harbor Nexus | `(0.50, 0.68)` | Cat is centered on the compass plaza; ships, stairs and banners stay lateral. Harbor and city retain depth without competing with the character. |
| Southwest Tidal Frontier | `(0.50, 0.63)` | Cat is on the large upper compass plaza rather than the lower approach seal. Piers/crystals remain outside the silhouette. Baked rain was rejected and removed. |

## Layering decision

This review pack follows the Moonlake seam-safe structure:

1. coherent day/night foundation pair;
2. per-region depth mask for far/mid haze treatment;
3. per-region placement mask for HUD, Dock and companion reservation;
4. transparent foreground occlusion, camp structures and placeable props only after the Owner selects the final foundations.

The pack intentionally does not pretend that independently regenerated sky/mountain/ground plates are production-ready: that method creates shoreline and architecture seams. Visible transparent layers remain a later human-gated extraction/prop task.

## Human gate

- `humanApproved: false`
- `referenceAuditPassed: false`
- `runtimeIntegrated: false`

Before promotion, the Owner should review both contact sheets at full size and either approve all six or request per-region corrections. Promotion must be a separate GROUNDWORK task.
