# Habitat Environment Rendering Contract (staging)

## Decision

Moonlake is the reference implementation for every Linkara habitat. The target
runtime model is:

`scene_mode + layered_raster + separate_props + dynamic_2d_lighting + weather_fx`

The other six habitats inherit this contract only after Moonlake passes mobile
QA. This staging note does not promote assets or modify the runtime.

## Stable Art Inputs

- One approved neutral/day terrain foundation per habitat.
- Independent bottom-center RGBA props for movable or stateful structures.
- Independent emissive plates for lamps, crystals, beacons and fire.
- Foreground occluders remain separate and may cover feet only.
- Existing baked night foundations remain rollback and low-quality fallbacks;
  they are not the long-term source of day/night lighting.

## Shared Environment State

```js
environment: {
  phase: "day | dusk | night | dawn",
  lighting: {
    mode: "dynamic-2d",
    ambientColor: 0xffffff,
    ambientIntensity: 1,
    keyDirection: { x: -0.45, y: 0.55 },
    keyColor: 0xfff1d0,
    keyIntensity: 1,
    shadowLength: 0.5,
    pointLightBudget: 4
  },
  weather: {
    preset: "clear | rain | mist | quiet_after_talk | rift_pressure | after_repair",
    rain: 0,
    fog: 0,
    cloudShadow: 0,
    wetness: 0,
    ripple: 0,
    reflection: 0
  }
}
```

Time changes light parameters continuously. Weather modifies the same lighting
state and material response; it does not replace the habitat with another full
background image.

## Runtime Layers

1. neutral terrain foundation
2. far atmospheric depth and cloud shadow
3. water response (ripple, reflection, wet tint)
4. far and mid props
5. companion and traces
6. near props and generated contact shadows
7. foreground occlusion
8. bounded weather particles and mist
9. final ambient/color grade

## Lighting Model

- One ambient color grade for the habitat.
- One directional key-light vector shared by terrain, props and shadows.
- Prop contact shadows are cached ellipse sprites generated from each slot's
  `shadowFootprint`; their offset and scale follow the key-light vector.
- Local point lights are cached radial sprites using additive/screen blending.
- Emissive plates reuse the base prop geometry, preventing day/night silhouette
  drift.
- A future high-quality path may use normal maps through one bounded custom
  Pixi filter. It must not create a separate full-screen filter per prop.

## Weather Coupling

- `clear`: clean key light, low ripple, optional motes.
- `rain`: cooler ambient, softer key light, rain band, stronger ripple,
  wetness/reflection and reduced shadow contrast.
- `mist`: atmospheric-depth fog concentrated over far and water zones; no
  uniform blur over the companion or UI.
- `quiet_after_talk`: warm low-contrast local light and slow motes only.
- `rift_pressure`: cool directional falloff, denser horizon fog and restrained
  pulse; no reward or urgency mechanic.
- `after_repair`: warm recovery grade, calm water and soft emissive response.

## Quality Budget

- low: ambient tint plus static fog fallback; no animated rain, point lights or
  dynamic prop shadows.
- medium: ambient/key lighting, up to eight prop shadows and four local lights,
  rain/mist within profile zones.
- high: medium plus one bounded normal-map lighting filter if mobile QA passes.
- Never rebuild Graphics every frame. Update uniforms/transforms on cached
  sprites instead.
- `prefers-reduced-motion` disables flicker, moving fog and rain animation but
  retains static readable lighting.

## Rollout Gate

1. Finish and approve Moonlake corrected dressed reference.
2. Generate and approve eight separate Moonlake props.
3. Implement hidden placement slots and the object renderer.
4. Add the shared dynamic-lighting and weather renderer to Moonlake.
5. Pass 390x844, 390x664 and iPhone Safari QA.
6. Reuse the proven renderer/profile contract for the remaining six habitats.
