# Moonlake Production Pack R1

**Status:** `PLANNED / NO RUNTIME WIRING / HUMAN ART APPROVAL REQUIRED`  
**Habitat:** `moonlake`  
**Target runtime:** Three.js environment + PixiJS illustrated companion + DOM UI  
**Purpose:** structured GPT Image 2.5-assisted production plan for Moonlake visual assets

> This document defines what should be produced and how it should be integrated. It does **not** claim that the listed R1 assets already exist, are approved, or are wired into the shipping runtime.

## 1. Goal

Moonlake Production Pack R1 turns habitat art production from “generate a pretty scene image” into a controlled game-asset pipeline.

The pack must improve:

- Ragnarok Online-like 2.5D spatial readability;
- foreground / background depth and companion occlusion;
- walkable-space readability without heavy UI arrows;
- reusable environment props;
- mobile-first companion focal-zone clarity;
- deterministic asset naming and future replacement;
- GPT Image 2.5-assisted visual production without making generated art the runtime authority by itself.

The current Moonlake architecture remains authoritative:

- Three.js owns live 3D habitat presentation;
- PixiJS owns the illustrated active companion and authored 2D effects;
- DOM owns HUD, Soul Talk, navigation and accessibility;
- renderer layers do not own save state, RaphaelCore, reward, Growth or gameplay authority.

## 2. Non-goals

R1 does **not**:

- rewrite Moonlake runtime architecture;
- change RaphaelCore, relationship logic or Safety;
- change the save schema;
- add rewards, FOMO, progression or survival systems;
- turn Nexus Link into a large open-world / MMO map project;
- treat a single generated background as a complete playable habitat;
- replace the existing approved Moonlake assets before human visual review.

## 3. Production principle

A habitat is a **spatial asset pack**, not one flattened background image.

Every runtime-facing visual must have a clear role:

```text
master / style authority
        +
world props
        +
walkable-surface readability
        +
foreground occluders
        +
atmosphere overlays / accents
        +
spatial metadata
```

Generated concept art may guide the pack, but runtime integration must preserve existing walkability, depth, interaction and focal-zone rules.

## 4. Naming convention

Pattern:

```text
[habitat]_[category]_[subject]_[variant]_[revision].[ext]
```

Examples:

```text
moonlake_master_day_r01.webp
moonlake_occluder_tent_left_front_r01.png
moonlake_prop_crystal_cluster_small_a_r01.png
moonlake_overlay_mist_near_r01.png
```

Rules:

- lowercase only;
- snake_case only;
- revision format is `r01`, `r02`, `r03`, ...;
- do not use `final`, `final2`, `new`, `use_this_one` or similar ambiguous suffixes;
- transparent standalone objects use PNG;
- flattened master / fallback images prefer WebP when alpha is unnecessary.

## 5. Planned directory layout

The following paths are targets for **future approved generated assets**. Empty directories do not need to be committed.

```text
assets/
  backgrounds/
    MoonlakeDiorama_r3/

  props/
    moonlake/

  layers/
    MoonlakeDiorama_r3/
      depth_occluders/
      overlays/
      debug/
```

R3 is a new production candidate namespace. Existing R2 assets remain valid and must not be deleted or overwritten merely because this plan exists.

## 6. Deliverable group A — master visuals

Master visuals are composition and style authorities. They are **not automatically shipping backgrounds**.

### Must-have

| Asset ID | Planned file | Role |
|---|---|---|
| `moonlake_master_day` | `moonlake_master_day_r01.webp` | Primary day composition / style authority |
| `moonlake_master_night` | `moonlake_master_night_r01.webp` | Primary night composition / lighting authority |
| `moonlake_static_fallback` | `moonlake_static_fallback_r01.webp` | Candidate reduced-capability / renderer-failure presentation |

### Nice-to-have

- `moonlake_master_dusk_r01.webp`
- `moonlake_master_dawn_r01.webp`

### Generation rules

- preserve the existing Moonlake miniature / clay-resin habitat identity;
- preserve a clearly readable central companion zone;
- do not bake HUD, text, character sprites or UI into the scene image;
- environment density may frame the scene but cannot consume the walkable focal zone;
- the master must visually support the existing bridge / platform / lake spatial concept rather than inventing an incompatible layout.

## 7. Deliverable group B — foreground occluders

Foreground occluders are the highest-value R1 assets because Moonlake already has authored occlusion logic.

### Must-have

1. `moonlake_occluder_bridge_rails_r01.png`
2. `moonlake_occluder_tent_left_front_r01.png`
3. `moonlake_occluder_tent_right_front_r01.png`
4. `moonlake_occluder_lantern_front_left_r01.png`
5. `moonlake_occluder_lantern_front_right_r01.png`
6. `moonlake_occluder_rocks_front_left_r01.png`
7. `moonlake_occluder_rocks_front_right_r01.png`

### Nice-to-have

8. `moonlake_occluder_grass_front_left_r01.png`
9. `moonlake_occluder_grass_front_right_r01.png`
10. `moonlake_occluder_shrub_front_center_r01.png`

### Rules

- transparent PNG only;
- include only the visible foreground portion that may cover the companion;
- no baked background;
- do not treat the full object silhouette as the occluder when only a canopy / rail / front lip should cover the companion;
- generated occluders must be aligned against an approved Moonlake visual master before runtime integration.

## 8. Deliverable group C — world props

Props are standalone reusable environment objects with an unambiguous ground contact point.

### Core props

1. `moonlake_prop_tent_left_r01.png`
2. `moonlake_prop_tent_right_r01.png`
3. `moonlake_prop_crystal_cluster_small_a_r01.png`
4. `moonlake_prop_crystal_cluster_medium_a_r01.png`
5. `moonlake_prop_campfire_small_r01.png`
6. `moonlake_prop_stone_lantern_r01.png`
7. `moonlake_prop_bridge_post_r01.png`
8. `moonlake_prop_rope_pillar_r01.png`
9. `moonlake_prop_lake_rock_small_a_r01.png`
10. `moonlake_prop_lake_rock_medium_a_r01.png`
11. `moonlake_prop_low_shrub_a_r01.png`
12. `moonlake_prop_low_shrub_b_r01.png`
13. `moonlake_prop_grass_clump_a_r01.png`
14. `moonlake_prop_grass_clump_b_r01.png`

### Optional extension props

- `moonlake_prop_small_banner_r01.png`
- `moonlake_prop_ritual_basin_r01.png`
- `moonlake_prop_platform_marker_r01.png`
- `moonlake_prop_wooden_crate_r01.png`

### Rules

- transparent PNG;
- bottom-center ground contact must be visually obvious unless a different anchor is explicitly authored;
- avoid inconsistent camera perspective across the prop family;
- no text, UI or presentation card baked into the image;
- silhouette must remain legible after mobile downscaling;
- props do not become interactive merely because they look important; interaction remains an authored runtime decision.

## 9. Deliverable group D — walkable-surface readability

These assets help the player understand where the companion can move without turning navigation into UI arrows.

### Must-have candidates

- `moonlake_surface_stone_plaza_center_detail_r01.png`
- `moonlake_surface_bridge_deck_overlay_r01.png`
- `moonlake_surface_bridge_entry_ground_blend_r01.png`
- `moonlake_surface_platform_edge_stone_detail_r01.png`

### Nice-to-have

- `moonlake_surface_shoreline_path_hint_r01.png`

These visuals may clarify existing walkable routes but must not redefine runtime walkability by themselves.

## 10. Deliverable group E — interactive accents

Accent assets provide readable visual origins for existing / future authored interactions.

### Planned

- `moonlake_accent_lantern_glow_core_r01.png`
- `moonlake_accent_waterfall_pool_highlight_r01.png`
- `moonlake_accent_magic_circle_anchor_r01.png`
- `moonlake_accent_crystal_pulse_node_r01.png`

### Optional

- `moonlake_accent_lake_ripple_origin_r01.png`

Accent visuals are presentation only and cannot create reward or progression behavior.

## 11. Deliverable group F — atmosphere overlays

### Must-have

- `moonlake_overlay_mist_near_r01.png`
- `moonlake_overlay_moonlight_bloom_r01.png`

### Nice-to-have

- `moonlake_overlay_water_glimmer_r01.png`
- `moonlake_overlay_warm_lantern_bloom_r01.png`
- `moonlake_overlay_rain_streak_soft_r01.png`

Rules:

- transparent PNG;
- soft edge / low contrast;
- cannot obscure the companion focal zone;
- cannot become the only representation of weather if the live renderer already owns that presentation.

## 12. Deliverable group G — spatial debug references

Debug images are developer-facing references, not player assets.

### Planned

- `moonlake_debug_walkable_mask_r01.png`
- `moonlake_debug_occlusion_map_r01.png`
- `moonlake_debug_hotspot_map_r01.png`
- `moonlake_debug_surface_zone_map_r01.png`

These should be derived from or reconciled against runtime spatial data. They must not silently become a second source of truth.

## 13. Manifest contract

Runtime-facing candidate assets must eventually have manifest metadata covering at least:

```text
id
file
habitat
category
status
anchor
usage
renderLayer
collision
occlusion
walkable
interactive
shadowPolicy
notes
```

The companion foot point / world position remains the spatial reference for depth, movement and collision decisions. Visual centers are not authoritative gameplay positions.

## 14. Production order

R1 production should proceed in this order:

1. `moonlake_master_day`
2. `moonlake_master_night`
3. `moonlake_static_fallback`
4. seven core occluders
5. eight highest-priority props
6. two atmosphere overlays
7. spatial debug references
8. manifest promotion from `planned` to `candidate`
9. human visual review
10. separate runtime-integration task

Do **not** generate the full optional catalog before the first master + occlusion set is visually approved.

## 15. Human approval gate

AI-generated visual output must not be treated as approved production art automatically.

Promotion states:

```text
planned
  -> generated-candidate
  -> human-approved
  -> integration-candidate
  -> runtime-wired
  -> verified
```

No generated image may skip directly from `generated-candidate` to `runtime-wired`.

## 16. Acceptance criteria for this asset pack

Pack R1 is ready for a separate integration task only when:

1. required candidate files exist at declared paths;
2. naming rules are consistent;
3. transparent assets have clean edges and no baked background;
4. props have clear ground contact;
5. occluders isolate only foreground-covering regions;
6. master composition preserves the mobile companion focal zone;
7. generated assets visually agree with the approved Moonlake style authority;
8. manifest entries match real files rather than placeholders;
9. human review explicitly approves the candidate set;
10. existing Moonlake R2 / runtime assets remain recoverable until the replacement is verified.

## 17. Relationship to spatial architecture

This pack intentionally separates **art production** from **spatial authority**.

The art pack may provide visible trunks, rails, canopies, rocks, bridges and walkable clues, but runtime spatial behavior must continue to come from authored world positions, walkable surfaces, footprints, occlusion rules, projections and the future shared Habitat Spatial Contract.

The purpose is not to make a larger world. The purpose is to make the companion feel physically present in a coherent habitat.
