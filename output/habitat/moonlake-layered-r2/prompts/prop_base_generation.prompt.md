# Moonlake R2 Base Prop Generation Prompts

Shared contract for every generation:

- Use `corrected_dressed_reference_night_v2.png` only as the visual design and
  material reference.
- Produce exactly one isolated object on a genuinely transparent background.
- Square composition intended for a `512x512` RGBA runtime export.
- Fixed three-quarter orthographic camera matching the reference scene.
- Hand-sculpted 3D miniature / clay-resin material with softened bevels,
  readable blue-white and cyan-gold shapes, and no photoreal micro-noise.
- Neutral diffuse studio lighting. Do not bake the night blue grade, cast
  shadow, ground, island, water, foliage, UI, text or frame into the object.
- Entire silhouette and every rope, finial, stair and pedestal must stay at
  least 32 pixels away from the square image boundary.
- Visual bottom center is the intended runtime anchor.

## Asset prompts

1. `tent_near_left_base`: large blue-white moon-camp pavilion tent; open warm
   doorway shape but no emitted glow; asymmetrical left-side rope and brass
   crescent ornament; complete footprint.
2. `tent_near_right_base`: large companion pavilion tent from the same kit;
   mirrored-but-not-identical canopy seams, right-side rope and compass medallion;
   complete footprint.
3. `tent_mid_left_base`: medium compact moon-camp tent, simpler canopy, small
   rolled bedroll and one unlit lantern bracket integrated into the prop.
4. `tent_mid_right_base`: medium compact moon-camp tent, faceted canopy, small
   supply pouch and one unlit lantern bracket; distinct from mid-left.
5. `tent_far_base`: small simple moon-camp scout tent, strong readable silhouette,
   minimal fine detail so it remains legible when scaled down.
6. `beacon_main_base`: tall cyan-crystal beacon tower with a broad stone-and-brass
   pedestal, four stable feet and complete stairs; unlit cyan crystal geometry.
7. `beacon_far_base`: shorter secondary cyan-crystal beacon with a compact complete
   pedestal and stairs, simpler silhouette than the main beacon.
8. `crescent_shrine_base`: complete upright crescent-moon stone/brass sculpture
   with a clearly intentional circular stepped pedestal; both crescent tips,
   hanging lantern housing and entire base fully visible; must never resemble a
   cropped or half-submerged moon.
