# Moonlake Stateful Object And Emotional Crystal Plan

Status: `HISTORICAL / SUPERSEDED IN PART`. This file records the planning path;
it does not authorize new runtime or `assets/**` changes. The active Scene
Profile and R2 object pack are the current implementation truth.

## Architecture Lock

The default path is **AI-generated layered PNG art + Scene Profile data + PixiJS v8 composition/FX**. Unity UModeler and Blender remain optional offline orthographic authoring tools. Unity WebGL, Three.js runtime, a replacement engine, new dependencies, and build steps are excluded.

The canonical Moonlake reference controls geography and landmark identity. The Owner's `390x844` placement audit controls UI and companion avoidance. The three earlier images control only miniature/clay/resin or premium 2.5D presentation.

## Layer Stack

1. Stable foundation: sky, cliffs, waterfalls, lake, shore, main plaza and interaction plane.
2. Structural plates: camps, docks, islands and landmark architecture where separation is useful.
3. Placeable transparent props: lanterns, small shrines, care objects, crystal sockets and low foliage.
4. Stateful emotional crystals: one visual family with staged growth/transformation.
5. Runtime traces/FX: ripple, mist, reflection, rain, motes, tint and repaired light.
6. Sparse foreground occlusion: edge-only depth elements that never hide the companion's face/body/core.

## Atmospheric Depth Lock

- Far cliffs, remote waterfall mouths and the farthest crystal towers use stronger atmospheric haze, lower contrast/saturation, softer edges and reduced texture detail.
- Midground islands and camp silhouettes remain recognizable; haze increases by depth band rather than uniformly.
- The rune plaza, companion reserved area and placeable-object plane remain sharp.
- Extreme foreground may use restrained depth-of-field softness only at the side edges.
- Night preserves the same depth ordering with cooler haze and controlled emissive falloff. Weather fog is a separate FX layer and must not erase interaction readability.

## Safe Placement Rules

- HUD forbidden: `y < .12`.
- Dock / Soul Talk forbidden: `y > .80`.
- Companion reserved: use the current value from
  `src/data/sceneProfiles/moonlakeProfile.js`; do not copy a static fallback.
- Landscape occlusion line: approximately `y=.73`; tall foreground objects stay outside the companion corridor.
- Lake zone: only ripple, mist, reflection, floating lantern/light, or a solid object rooted to an authored island/pier/float base.
- Sun and moon share one horizon-derived arc and remain runtime-controlled.
- Runtime UI insets override these static fallback bands at each viewport.

## Historical Proposed Moonlake Slot Families

The table below is preserved as design provenance. It has been superseded by
the eight typed slots in `src/data/sceneProfiles/moonlakeObjectPack.js`.

| Slot family | Intended content | Depth rule | Exclusions |
|---|---|---|---|
| `plaza_left_edge`, `plaza_right_edge` | low crystal, lantern, rune marker | companion plane edge | no axial-path or reserved-rect overlap |
| `dock_left`, `dock_right` | posts, lanterns, tied offerings | mid/ground | keep entry path open |
| `camp_left`, `camp_right` | care props, shelter details | midground | stay outside companion corridor |
| `island_near_left/right` | beacon or rooted crystal | near lake | requires visible land base |
| `island_mid`, `island_far` | smaller beacon/crystal | mid/far lake | reduced size and contrast |
| `lake_surface` | ripple, mist, reflection, floating light | water FX | no fire, ash, rune slab or unrooted crystal |
| `foreground_edge_left/right` | low foliage/rail/stone | foreground | opacity/height cap; never over companion/UI |

Each future slot records normalized rect/anchor, layer, depth band, capacity, max display size, allowed kinds, water rule, companion/UI clearance, shadow footprint, day/night policy and emotion affinity.

## Emotional Crystal Transformation

One crystal identity progresses through compatible states:

`glimmer -> seed -> cluster -> attuned -> transformed -> released`

The object may change only its local environment through separate masks or FX: rune brightness, nearby foliage color, water ripple, reflected light, mist hue or small repaired-light traces. It must not require full background replacement.

State changes remain expressive, not extractive: no currency ladder, rarity pressure, countdown, daily check-in, dependency detection or safety-help reward. High-tension repair remains reliably reachable and the map never becomes an irreversible punishment state.

## Day/Night Contract

- Geometry, camera, slot anchors, collision belief and silhouettes are identical.
- Night variants change emission, reflection, mist visibility and shadow color only.
- Foundation day/night remains one composition; independently lit props may have paired transparent plates.
- Dusk/dawn should first use tint/celestial/FX rather than requiring four separate foundations.

## Task-Pack Outcome

- Scene Profile reconciliation, the typed eight-slot R2 object pack, weather,
  time phases, the profile-driven renderer and approved asset promotion are
  complete and runtime-integrated.
- The emotional crystal visual family is promoted as R1 assets, but formal
  state-driven lifecycle switching remains deferred.
- Any new object family still requires a separate task pack and the normal
  EXPERIENCE/GROUNDWORK approvals.

No later pack is authorized by this historical planning file.
