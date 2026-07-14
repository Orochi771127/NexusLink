# Six Linkara Region Diorama R1 — Generation Prompt Record

Generation used the built-in `imagegen` path. Every daytime master used two image roles:

1. The matching `assets/backgrounds/linkara/regions/*.jpg` file was the authoritative geography and landmark reference.
2. `assets/backgrounds/MoonlakeDiorama_r1/bg_day_base.png` was the style, camera, depth, material and companion-stage reference only.

## Shared daytime contract

- Project-native premium 3D clay-and-resin miniature habitat diorama with premium 2.5D storybook depth.
- Vertical mobile 9:16, slightly elevated three-quarter / orthographic-like camera.
- One broad, unobstructed companion plaza in the lower middle; top 12% calm for HUD and bottom 20% simple for Dock/Soul Talk.
- Sharp companion plane, readable midground landmarks, progressively softer/desaturated/misted far scenery.
- Hand-shaped clay terrain and architecture, polished translucent resin water/crystal/lava, restrained gold/cyan Cyber-Taoist accents.
- No baked character, people, UI, text, logo, border, sun/moon disc, portal, tent or well.

## Region-specific daytime locks

- `central_radiant_core`: radiant ivory-and-gold capital, cyan canals, bridges, terraced gardens, crystal towers and central citadel.
- `eastern_mystic_mountains`: jagged black-violet plateaus, amethyst seams, bridges, waterfalls into mist and remote crystalline citadel.
- `northern_verdant_plains`: rolling farms, winding resin river, watermill, cottages, fences, flowers and distant windmills.
- `southeast_forge_hills`: volcanic coastal forge city, basalt, iron pipes/cranes, orange resin lava and restrained cobalt energy.
- `southern_harbor_nexus`: turquoise harbor, ivory/blue domed city, tall ships, stairs, docks, banners and compass plaza.
- `southwest_tidal_frontier`: rugged storm coast, fractured piers, dark sea, cliff citadel, violet seams and distant vortex.

## Shared night edit contract

Each night candidate used its matching day image as the edit target and `bg_night_base.png` as illumination reference. The prompt locked camera, crop, terrain, landmarks, plaza, approach, scale and silhouettes; only sky/ambient light, emission, reflection, shadow color and mist intensity were allowed to change. No visible moon/sun disc and no runtime weather particles were allowed.

## Targeted correction

The first Southwest Tidal Frontier night candidate introduced baked rain. It was preserved under `rejected/southwest_tidal_frontier_night_baked-rain.png`. A second edit removed only precipitation streaks while preserving the storm-night lighting and composition. The corrected no-rain version is the active staging night master.
