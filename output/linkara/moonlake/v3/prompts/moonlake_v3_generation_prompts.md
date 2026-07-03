# Moonlake V3 Generation Prompts

Status: `STAGING PROMPT LOG`
Runtime status: not integrated.
Mode: built-in `imagegen` plus local chroma-key removal and deterministic `1080x1920` normalization.

## Shared V3 Lock

All V3 prompts used V2 only as composition evidence. Final art direction target:

```text
Clean HD semi-realistic fantasy game environment, project-native Nexus Link aesthetic.
Preserve realistic material response and plausible cinematic lighting: contact shadows, water reflection and ripple structure, atmospheric depth, wet stone, foliage translucency, controlled specular highlights, and restrained bloom.
Avoid flat anime concept art, plastic surfaces, over-smoothed painterly gradients, noisy AI texture, and glow that hides surface form.
```

## Direction Preview

```text
Use visible Moonlake V2 as composition reference only. Create a vertical 9:16 semi-realistic Ethereal Moon Lakefront direction preview with broad lake, distant cliffs and waterfalls, lower-center wet pale stone platform, blue-hour/night lighting, realistic water reflection, wet stone roughness, contact shadows, atmospheric depth, controlled bloom, no UI, no companion, no runtime props, no large baked moon.
```

## Sky Atmosphere

```text
Generate `sky_atmosphere` only: deep blue night-to-blue-hour sky atmosphere, soft cloud masses, subtle atmospheric gradient, full opaque 9:16 sky base. Do not include moon, sun, stars, planets, cliffs, mountains, waterfalls, lake, platform, trees, props, UI, text, companion, or transparency.
```

## Celestial Bodies

```text
Generate `celestial_bodies` on solid #ff00ff for chroma-key removal: one restrained crescent moon, one small warm sun disk for day mode, and sparse star glints arranged along the upper sky arc. No sky gradient, clouds, scenery, lake, props, UI, text, or companion.
```

## Celestial Occlusion

```text
Generate `celestial_occlusion` on solid #ff00ff: sparse upper-sky occluders only, including cloud wisps, small dark tree canopy edges, and subtle far cliff-edge silhouettes that can pass in front of runtime celestial bodies. Keep center arc mostly clear and lower 55% empty.
```

## Mountains

```text
Generate `mountains` on solid #ff00ff: distant layered rock cliffs, waterfalls, far shoreline silhouettes, far pine silhouettes, and atmospheric mist attached to cliffs. No sky gradient, no lake water plane, no platform, no foreground flowers, no runtime props.
```

## Lake Water

```text
Generate `lake_water` on solid #ff00ff: realistic moonlit lake surface, coherent reflection path, subtle ripples, darker near-water depth, and low water mist. No sky, cliffs, shore, platform, plants, docks, tents, crystals, lanterns, UI, text, or companion.
```

Rejected retry:

```text
Generate `lake_water` on solid #00ff00 to avoid purple edge bands.
```

The green-key retry was not accepted because visual review found stronger green spill at the water boundary than the magenta-key version.

## Shore Ground Platform

```text
Generate `shore_ground_platform` on solid #ff00ff: wet pale stone circular platform, engraved rings, shore path stones, small steps, low ground edge, restrained gold inlay, realistic wet stone, bevels, roughness variation, contact shadows, clear companion floor. No lake plane, sky, cliffs, tents, runtime props, UI, text, or companion.
```

## Foreground Occlusion

```text
Generate `foreground_occlusion` on solid #ff00ff: sparse bottom and side-edge low wet stones, blue flowers, dark green leaves, tiny grass clusters, low platform-edge plants. Keep center lower platform mostly transparent and keep companion reserved area clear of opaque objects.
```

## Postprocessing Notes

- Built-in image generation returned `941x1672` sources.
- V3 layer candidates in `v3/layers/` were normalized to `1080x1920`.
- Chroma-key removal used the installed `imagegen` helper with soft matte and despill.
- The green-key lake retry is preserved as source evidence but is not the accepted `lake_water` layer.
- V3 remains staging only and is not runtime-approved.
