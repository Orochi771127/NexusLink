# Moonlake V2 Generation Prompts

Status: `STAGING PROMPT LOG`
Runtime status: not integrated.
Mode: built-in `imagegen` plus local chroma-key removal and deterministic 1080x1920 normalization.

## Direction Preview

```text
Use case: stylized-concept
Asset type: Nexus Link Moonlake habitat v2 direction preview, staging only
Primary request: Create a vertical 9:16 clean HD illustrated 2.5D game habitat concept for Ethereal Moon Lakefront, target composition for 1080x1920 mobile.
Scene/backdrop: moonlit magical lakefront camp in a calm fantasy region, crescent moon sky, distant pale cliffs and waterfalls, luminous lake in the middle, lower-center pale stone circular platform and shore threshold for a companion to stand on.
Style/medium: clean hand-painted HD 2D game environment, painterly but readable, Cyber-Taoism fantasy, polished mobile game background, not pixel art.
Composition/framing: vertical mobile composition, horizon/lake around upper-middle, companion-safe platform centered around 70% height, bottom area filled with intentional stone shore and sparse flowers rather than blank space. Leave a clear companion reserved area in the lower center; no character.
Lighting/mood: serene blue moonlight, soft cyan reflections, gentle white-gold platform highlights, quiet emotional habitat, not horror.
Color palette: deep moonlit blues, pale cyan lake glow, soft white stone, small blue flowers, restrained warm gold accents.
Materials/textures: smooth water reflections, pale stone platform, distant cliffs, light mist, sparse camp tents at far side only.
Constraints: staging concept only; no UI, no labels, no text, no watermark, no companion, no animals, no people. Do not include large foreground props, lantern posts, crystals, shrine marker, campfire, or clickable/stateful objects baked into the base. Keep center-lower platform readable and uncluttered.
Avoid: empty lower half, fake transparency checkerboard, annotations, dense clutter, overbright white, pixel art, isometric board-game tiles.
```

## Sky Layer

```text
Use case: stylized-concept
Asset type: Moonlake v2 habitat layer candidate - SKY ONLY
Input images: Use the visible Moonlake v2 direction preview in this conversation as style and composition reference only.
Primary request: Create a vertical 9:16 opaque sky-only layer for the Ethereal Moon Lakefront habitat, matching the direction preview's moonlit blue fantasy style.
Scene/backdrop: deep starry night sky with a luminous crescent moon, soft clouds, subtle celestial glow, calm magical atmosphere.
Style/medium: clean HD illustrated 2D game environment layer, painterly but readable, project-native Nexus Link habitat style, not pixel art.
Composition/framing: vertical mobile 9:16 composition. Sky fills the entire canvas as an opaque background layer. Keep the crescent moon in the upper-left/upper-center area and star field readable. Lower half may be atmospheric blue gradient only, with no terrain.
Lighting/mood: serene moonlight, soft blue atmospheric glow, quiet reflective mood.
Constraints: SKY ONLY. Do not include mountains, cliffs, waterfalls, lake water, shore, stone platform, tents, plants, props, companion, people, animals, UI, labels, text, watermark, checkerboard pattern, or transparency. No runtime props baked in.
Avoid: ground, water, structures, foreground foliage, platform rings, overbright white bloom, noisy texture, pixel art.
```

## Mountains Layer

```text
Use case: stylized-concept
Asset type: Moonlake v2 habitat layer candidate - DISTANT MOUNTAINS / CLIFFS ONLY for chroma-key removal
Input images: Use the visible Moonlake v2 direction preview in this conversation as style reference only.
Primary request: Create a vertical 9:16 distant mountains and cliffs layer for Ethereal Moon Lakefront on a perfectly flat solid #00ff00 chroma-key background.
Scene/backdrop: moonlit pale blue cliffs, distant mountain silhouettes, waterfalls, far shoreline silhouettes, subtle mist along the horizon.
Subject: ONLY distant mountains, cliffs, waterfalls, and far horizon silhouettes. No sky fill except the flat green background.
Style/medium: clean HD illustrated 2D game environment layer, painterly but readable, matching the direction preview.
Composition/framing: vertical mobile 9:16. Place the distant cliff and waterfall shapes in the upper-middle and side areas, leaving the lower-center companion/platform area empty green. Preserve a similar scenic valley/lake horizon feeling from the reference.
Lighting/mood: cool moonlight, blue-cyan waterfall highlights, soft mist.
Constraints: The background must be one uniform #00ff00 color with no gradients, shadows, texture, reflections, floor plane, or lighting variation. Do not use #00ff00 anywhere in the mountains or waterfalls. Do not include crescent moon, star sky, lake water plane, shore, stone platform, tents, camp props, foreground flowers, companion, people, animals, UI, text, watermark, checkerboard pattern.
Avoid: full-scene painting, baked platform, runtime props, foreground occlusion, fake transparency.
```

## Lake Water Layer

```text
Use case: stylized-concept
Asset type: Moonlake v2 habitat layer candidate - LAKE WATER ONLY for magenta chroma-key removal
Input images: Use the visible Moonlake v2 direction preview in this conversation as style reference only.
Primary request: Create a vertical 9:16 luminous lake water plane layer for Ethereal Moon Lakefront on a perfectly flat solid #ff00ff chroma-key background.
Scene/backdrop: moonlit blue lake surface, clean cyan reflection path, subtle ripples, faint low mist, small natural water glimmers.
Subject: ONLY lake water and water reflection/mist plane. No sky, no mountains, no cliffs, no shore, no stone platform, no tents, no props.
Style/medium: clean HD illustrated 2D game environment layer, painterly but readable, matching the direction preview.
Composition/framing: vertical mobile 9:16. Water occupies the middle band only, roughly from upper-middle to just above the lower platform zone. Leave the lower-center platform area fully magenta. Leave the top sky/cliff area fully magenta except a subtle distant water horizon edge if needed.
Lighting/mood: serene cyan-blue moon reflection, quiet magical lake, low-alpha mist feeling.
Constraints: The background must be one uniform #ff00ff color with no gradients, shadows, texture, floor plane, or lighting variation. Do not use #ff00ff in the water. Do not include land, rocks, plants, dock posts, camp tents, crystals, lanterns, shrine markers, companion, people, animals, UI, text, watermark, checkerboard pattern.
Avoid: green color spill, full-scene painting, baked shore, baked platform, props, thick fog that hides companion area, pixel art.
```

## Shore Ground Platform Layer

```text
Use case: stylized-concept
Asset type: Moonlake v2 habitat layer candidate - SHORE GROUND PLATFORM ONLY for chroma-key removal
Input images: Use the visible Moonlake v2 direction preview in this conversation as style reference only.
Primary request: Create a vertical 9:16 lower shore ground and pale stone circular platform layer for Ethereal Moon Lakefront on a perfectly flat solid #ff00ff chroma-key background.
Scene/backdrop: lower-center moonlit stone shore, pale circular ritual platform with subtle gold inlay, small stone steps, natural shore stones, sparse low blue flowers at the edges.
Subject: ONLY the companion-safe ground/platform/shore layer. No water plane except tiny edge contact, no sky, no mountains, no tents, no runtime props.
Style/medium: clean HD illustrated 2D game environment layer, painterly but readable, matching the direction preview.
Composition/framing: vertical mobile 9:16. Main circular stone platform centered in the lower-middle around 65-75% height; companion reserved area stays clear and uncluttered. Fill the lower canvas with intentional stone path, low shore ground, and sparse edge foliage so there is no blank empty lower half. Keep the center platform readable and not too bright.
Lighting/mood: serene blue moonlight with restrained white-gold platform highlights.
Constraints: The background must be one uniform #ff00ff color with no gradients, texture, shadows, floor plane, or lighting variation outside the subject. Do not use #ff00ff in the subject. Do not include lantern posts, crystals, shrine marker, dock posts, campfire, tents, companion, people, animals, UI, labels, text, watermark, checkerboard pattern.
Avoid: full-scene painting, lake water filling the platform area, tall props, foreground occlusion that covers companion body, empty lower half, pixel art.
```

## Foreground Occlusion Layer

```text
Use case: stylized-concept
Asset type: Moonlake v2 habitat layer candidate - FOREGROUND OCCLUSION ONLY for chroma-key removal
Input images: Use the visible Moonlake v2 direction preview in this conversation as style reference only.
Primary request: Create a vertical 9:16 sparse foreground occlusion layer for Ethereal Moon Lakefront on a perfectly flat solid #ff00ff chroma-key background.
Scene/backdrop: low edge flowers, small shoreline stones, dark blue leaves, tiny grass clusters at bottom corners and side edges.
Subject: ONLY sparse foreground occlusion elements near the bottom edge and side edges. Low enough to cover companion feet or platform edge subtly, not the body.
Style/medium: clean HD illustrated 2D game environment foreground layer, painterly but readable, matching the direction preview.
Composition/framing: vertical mobile 9:16. Keep the center lower platform area mostly transparent/magenta. Place sparse clusters along bottom-left, bottom-right, side edges, and a few low stones near the very bottom. Do not fill the middle.
Lighting/mood: moonlit blue foliage with small pale-blue flowers, subtle edge depth.
Constraints: The background must be one uniform #ff00ff color with no gradients, texture, shadows, floor plane, or lighting variation outside the subject. Do not use #ff00ff in the subject. Do not include stone platform surface, circular rune, lake water, sky, mountains, tents, lantern posts, crystals, shrine marker, campfire, companion, people, animals, UI, labels, text, watermark, checkerboard pattern.
Avoid: large plants blocking companion, platform baked into occlusion, full-scene painting, empty fake checkerboard, dense clutter, pixel art.
```

## Postprocessing Notes

- Built-in image generation returned `941x1672` sources.
- V2 layer candidates in `v2/layers/` were deterministically normalized to `1080x1920`.
- Green-key lake source was replaced by magenta-key lake source because the green-key version left visible edge spill.
- V2 remains staging only and is not runtime-approved.
