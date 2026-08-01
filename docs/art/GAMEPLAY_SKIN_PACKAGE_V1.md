# Gameplay Skin Package V1

Status: `OWNER APPROVED / RUNTIME PROMOTED`

Pack: `assets/gameplay/GameplaySkins_r3/`

Material family: `nexus-clay-resin-miniature-v1`

## Decision

Heartcore Orbit and Nexus Expedition use one project-native visual family:
premium handcrafted 3D miniature scenes, rounded matte polymer clay, physical
contact shadows, and selective translucent resin for water, crystal, memory,
and authored energy. Realistic fantasy painting, chunky pixel art, generic
asset-pack heroes, and glossy toy plastic are rejects.

The package does not install a complete UI/game module. It promotes two clean
environment foundations derived from the Owner-approved V3 direction images,
then keeps gameplay entities, companion art, FX, HUD, simulation, and state in
their existing owners.

## Layer contract

| Order | Layer | Owner | Swap unit | Failure behavior |
|---|---|---|---|---|
| 1 | Authored environment foundation | gameplay visual profile | one file path per map | procedural clay fallback |
| 2 | Collision-aligned fallback/decor | Canvas or Pixi renderer | palette/profile data | remains available, fades after foundation load |
| 3 | Objective, anchor, loot, rift and trajectory | renderer from session snapshot | runtime state | unchanged |
| 4 | Active companion | canonical illustrated 2D asset manifest | companion id | same-companion procedural silhouette only |
| 5 | HUD and controls | DOM/CSS | mode chrome | unchanged semantics |

`src/data/gameplayVisualProfiles.js` is the swap seam. A new visual-only map
adds a profile and foundation path. A different collision field remains a
separate `expeditionRegions.js` change. Neither path moves objective, outcome,
reward, relationship, Growth, RaphaelCore, or save authority into art code.

## Promoted assets

- `orbit_moonlake_foundation.png` (`852x1846`): bright Moonlake resin arena,
  clay cliffs and foliage, waterfalls, shrine island, lanterns and quiet center.
- `expedition_windrest_foundation.png` (`853x1844`): elevated Windrest Meadow,
  branching clay-stone paths, rounded cliffs, shrubs and open runtime clearings.

Both foundations intentionally exclude UI, text, characters, companion
substitutes, objectives, enemies, loot and interaction indicators. Exact hashes,
provenance, ownership and license declarations are in the pack manifest.

## Generation prompts

Built-in image generation used the Owner-approved V3 images as edit targets.
Orbit preserved the camera, arena, Moonlake geology and resin/clay material
language while removing both glass panels, progress nodes, anchor, projection,
waypoints, labels and all dynamic marks. Expedition preserved the elevated
three-quarter meadow and forked route while removing the status panel, action
bar, companion proxy, two rifts, crystal and all UI/dynamic marks. In both
edits the uncovered environment was reconstructed naturally and central safe
areas were kept readable for runtime overlays.

## Onboarding another map

1. Produce an Owner-approved clean foundation with the same camera and no UI or
   dynamic entities.
2. Add the asset plus provenance/hash/license entry to a versioned pack.
3. Add or update one pure-data visual profile and declare focal crop metadata.
4. If navigation/collision changes, update the region data in a separate change.
5. Run the gameplay-skin gate, mode regressions, `390x844`, short-phone,
   desktop, reduced-motion, asset-failure fallback and human visual QA.

No npm package, renderer migration, second game state, backend, or Three.js
expansion is required for a normal map skin update.
