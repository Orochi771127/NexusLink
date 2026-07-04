# Linkara Habitat Layering And Visual Locks

Status: `PLANNING / VISUAL LOCK`
Scope: seven Linkara habitat backgrounds, layered art production, scene-profile drafts, and generation task packs.
Runtime status: no runtime wiring. No save schema change. No `pixiApp.js` change. No `assets/**` mutation in this task.

This document turns the staged Linkara region images into a production contract for later image generation and runtime integration. A habitat is not a single background image. It is a layered spatial contract: sky, terrain, water, ground, camp/structure layers, runtime props, trace FX, foreground occlusion, companion anchor, and UI-safe placement all need explicit ownership before any asset is promoted.

Global art target: `docs/assets/NEXUS_LINK_ART_STYLE_TARGET.md`.

## Source Assets

Staged sources live under:

```text
assets/backgrounds/linkara/
assets/backgrounds/linkara/regions/
assets/audio/linkara/
```

Current caution:

- The staged region JPG files are useful references and preview sources.
- The seven region backgrounds are landscape `1280x720`.
- Current Moonlake runtime art is mobile-first vertical art.
- Directly wiring these `16:9` scenes into the current habitat renderer would require crop anchors, vertical redraws, or a profile-aware background resolver.
- The world map image is atlas/reference content, not a live habitat base.
- The source-image fields in `manifest.json` should be rechecked before any provenance-sensitive generation pass; use visual inspection and file dimensions as the authority for the locks below.

## Global Display And Art-Direction Lock

Production habitat generation should use `1080x1920` mobile art-space first, then project into the runtime viewport. For the current `390x844` safe viewport, a `1080x1920` artboard cover-scales by height to `474.75x844` CSS px. That crops `42.38` CSS px per side, equivalent to about `96.4` art px or `8.93%` of the art width per side. The visible art-space x range is approximately `0.089..0.911`.

Placement must be computed in art-space and projected to screen-space:

```text
screenX = artX * coverScale - cropX
screenY = artY * coverScale - cropY
```

Do not bind sun, moon, stars, or time-moving celestial bodies to viewport-fixed x/y points. Celestial objects must ride a Scene Profile `celestialArc` derived from the painted horizon. Sky base layers may carry atmosphere and color only; active time-of-day bodies belong in runtime `celestial_bodies` or a dedicated generated celestial pass.

Default mobile zones:

| Zone | Normalized rect | Role |
| --- | --- | --- |
| `hud_top_static` | `{ x: 0.00, y: 0.00, w: 1.00, h: 0.12 }` | Forbidden for traces, props, companion, and celestial bodies. |
| `sky_celestial` | `{ x: 0.10, y: 0.12, w: 0.80, h: 0.30 }` | Celestial arc and sky-only atmosphere. |
| `lake_or_mid_plane` | `{ x: 0.12, y: 0.38, w: 0.76, h: 0.24 }` | Water-plausible traces, ripples, mist, reflection. |
| `companion_reserved` | `{ x: 0.38, y: 0.49, w: 0.24, h: 0.25 }` | No opaque layer or prop may cover the companion body. |
| `platform_ground` | `{ x: 0.24, y: 0.62, w: 0.52, h: 0.14 }` | Companion floor and ground/platform traces. |
| `foreground_occlusion_band` | `{ x: 0.00, y: 0.73, w: 1.00, h: 0.07 }` | Low foot occlusion only. |
| `bottom_ui_static` | `{ x: 0.00, y: 0.80, w: 1.00, h: 0.20 }` | Forbidden for habitat traces and props. |

Art direction is project-native premium 3D storybook diorama: cozy fantasy, soft stylized forms, realistic material response, cinematic moonlit lighting, controlled magical glow, and mobile-first readability. Generated layers must preserve Nexus Link's clean HD readability while adding diorama depth and believable materials: wet stone with contact shadows, water with reflection/ripple structure, cliffs with atmospheric depth, foliage with leaf translucency, carved wood, soft fur where companions appear, metal/crystal with controlled specular highlights, and restrained bloom. Reject flat anime concept art, photoreal animal/photo treatment, chunky pixel art, plastic surfaces, over-smoothed painterly gradients, generic photobash, noisy AI texture, one-note blue palettes, or baked glow that hides material form.

## Production Source Model

High-quality habitat bases should use a 3D-assisted 2.5D source pipeline. The Nexus Link runtime remains PixiJS / DOM; the 3D or DCC scene is an offline art-production source, not a runtime engine change.

Required source discipline:

- Lock one mobile portrait camera at `1080x1920` before final pass export.
- Separate major forms in source: sky, celestial bodies, celestial occlusion, far terrain/city, water or atmosphere plane, shore/platform, structures, foreground occlusion, and runtime props.
- Use believable material response before paintover: water reflection and ripple structure, wet stone contact shadows, atmospheric depth, carved wood, soft foliage, controlled crystal/metal specular, and restrained bloom.
- Preserve the premium 3D storybook diorama target in `NEXUS_LINK_ART_STYLE_TARGET.md`; do not let the source drift toward flat anime, photorealism, or chunky pixel art.
- Export or document masks/depth references when they help water cleanup, foreground occlusion, or future Pixi FX placement.
- Use `imagegen` only for concept targets, paintover proposals, small prop candidates, or texture exploration unless the output passes the same source-pass, layer-separation, and human approval gates.
- Do not introduce Three.js, GLB runtime loading, TypeScript, Vite, npm, or a new build step as part of habitat art production.

## Global Layer Model

Every Linkara habitat should be planned as this layered stack:

```text
sky_atmosphere
distant_clouds_back
celestial_bodies
celestial_occlusion
distant_mountains_or_city
water_or_atmosphere_plane
shore_ground_platform
camp_or_region_structures
runtime_props
trace_fx
foreground_occlusion
companion
ui_dom
```

Layer responsibilities:

- `sky_atmosphere`: sky, cloud mass, atmospheric color, storm or dawn base. No baked sun, moon, stars, or time-moving celestial bodies in active habitats.
- `distant_clouds_back`: optional slow cloud mass or far cloud silhouettes that do not need independent hit testing.
- `celestial_bodies`: sun, moon, stars, rift eyes, and time-of-day bodies positioned by Scene Profile arc rules.
- `celestial_occlusion`: clouds, tree canopy, cliff silhouettes, or shrine edges that can draw over celestial bodies.
- `distant_mountains_or_city`: far cliffs, skyline, distant buildings, far waterfalls, far volcanoes, horizon silhouettes.
- `water_or_atmosphere_plane`: lake, sea, harbor water, lava haze, mist pools, reflective planes. Keep trace-compatible surfaces separate where possible.
- `shore_ground_platform`: the companion's stable floor, plaza, dock apron, platform ring, or stone threshold.
- `camp_or_region_structures`: tents, city walls, ships, cranes, towers, docks, bridges, camps, distant shrines. If stateful or clickable, demote to `runtime_props`.
- `runtime_props`: crystals, lanterns, campfire, lamps, pylons, banners, dock posts, shrine markers, cargo, railings, interactable objects.
- `trace_fx`: memory glimmers, dialogue traces, water ripples, mists, return glow, boundary markers, repaired light, glitch noise.
- `foreground_occlusion`: low grass, flowers, posts, tree branches, railings, ropes, platform lips, near rocks that may draw over companion feet/body.
- `companion`: single active companion, bottom-center anchor, never baked into habitat art.
- `ui_dom`: all UI and labels remain DOM/UI, never baked into habitat art.

## Global Scene Profile Defaults

Unless a region overrides them:

```js
{
  artSize: { width: 1280, height: 720 },
  targetMobileArtSize: { width: 1080, height: 1920 },
  background: {
    mode: "profiled-cover-or-redraw",
    sameComposition: true,
    mobileProjection: {
      artSize: { width: 1080, height: 1920 },
      safeViewport: { width: 390, height: 844 },
      coverMode: "cover-height",
      visibleArtXRange: [0.089, 0.911]
    }
  },
  safeZone: { referenceWidth: 390, referenceHeight: 844 },
  ui: {
    subtractTopInset: true,
    subtractBottomInset: true,
    sideInset: true,
    extraForbidden: [
      { id: "hud_top_static", rect: { x: 0.00, y: 0.00, w: 1.00, h: 0.12 } },
      { id: "bottom_nav_static", rect: { x: 0.00, y: 0.80, w: 1.00, h: 0.20 } }
    ]
  },
  companion: {
    anchor: { x: 0.50, y: 0.70 },
    reservedRect: { x: 0.38, y: 0.45, w: 0.24, h: 0.27 }
  },
  placement: {
    minDistance: 0.06,
    avoidCompanion: true,
    avoidUiInsets: true
  }
}
```

Trace taxonomy:

- Water-only: `ripple`, `blue_lantern`.
- Water-capable: `glow`, `mist`.
- Ground/platform: `golden_rune`, `repaired_light`, `boundary`.
- Fire/ash affinity: `ember`, `white_ash`.
- Crystal/rift affinity: `glitch_noise`.
- Plant/pier affinity: `leaf`.

Never place `ember`, `white_ash`, `golden_rune`, `repaired_light`, `boundary`, or dense `glitch_noise` on open water unless a profile explicitly defines a non-water surface there.

## Region 1: Southeast Forge Hills

Profile id: `southeast_forge_hills`
Canon role: Black Iron Hacker forge/industrial region, fire and unstable machine energy.
Current reference: staged region JPG, landscape `1280x720`.

### Visual Lock

- Identity: volcanic industrial harbor city, blue furnace technology, orange lava heat, distant sea edge.
- Mood: dangerous but controlled industrial pressure, not horror, not ordinary factory sim.
- Palette: iron black, ember orange, lava gold, cobalt-blue reactor light, smoke violet-gray.
- Camera: elevated scenic platform, companion on a metal or stone octagonal deck in lower center.
- Material language: dark metal, rivets, furnace stone, pipes, blue glass reactor cores, lava-lit cliffs.
- Must avoid: RPG combat arena framing, cluttered machinery over companion, hard UI text, modern sci-fi panels that break Cyber-Taoism.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky` | Smoky dusk sky, volcanic plume glow, far cloud deck. |
| `mountains_city` | Volcano ridge, forge city silhouette, far cranes, far bridges. |
| `atmosphere_plane` | Heat haze, distant lava glow, smoke veils; no trace gameplay. |
| `ground_platform` | Lower-center metal/stone deck, readable companion floor, low contrast center. |
| `structures` | Distant foundries, far towers, noninteractive bridges. |
| `runtime_props` | Foreground crane hook, blue reactor tanks, rail posts, banners, pipe clusters, furnace vents. |
| `trace_fx` | Ember near vents, `glitch_noise` around blue reactors, repaired light on platform seams. |
| `foreground_occlusion` | Low pipes, deck lip, rail silhouettes at bottom corners only. |

### Do Not Bake Into Base

Foreground crane, large blue tanks, pipe clusters, banners, deck lamps, animated lava drips, sparks, glowing vents, clickable reactor crystals.

### Scene Profile Draft

```js
{
  id: "southeast_forge_hills",
  label: "Southeast Forge Hills",
  sky: { exists: true, rect: { x: 0.00, y: 0.04, w: 1.00, h: 0.27 }, horizonY: 0.34 },
  celestial: { enabled: false, reason: "volcanic smoke and industrial glow dominate sky" },
  companion: {
    anchor: { x: 0.50, y: 0.70 },
    reservedRect: { x: 0.37, y: 0.45, w: 0.26, h: 0.27 }
  },
  zones: {
    water: [],
    ground: [
      { id: "main_deck", rect: { x: 0.30, y: 0.54, w: 0.40, h: 0.18 }, maxTraces: 4 },
      { id: "deck_rim_left", rect: { x: 0.16, y: 0.64, w: 0.18, h: 0.10 }, maxTraces: 2 },
      { id: "deck_rim_right", rect: { x: 0.66, y: 0.64, w: 0.18, h: 0.10 }, maxTraces: 2 }
    ],
    affinity: [
      { id: "forge_vents", kind: "campfire", rect: { x: 0.18, y: 0.68, w: 0.18, h: 0.10 } },
      { id: "blue_reactor", kind: "crystal", rect: { x: 0.70, y: 0.56, w: 0.18, h: 0.16 } },
      { id: "platform_runes", kind: "platform", rect: { x: 0.40, y: 0.60, w: 0.20, h: 0.08 } }
    ]
  }
}
```

### Generation Pack

1. Generate `sky` / `mountains_city` / `atmosphere_plane` / `ground_platform` as separate concept layers or a layer-planning composite.
2. Generate one-by-one transparent props for crane hook, reactor tank, deck lamp, furnace vent.
3. Generate trace FX only after the scene profile is approved.
4. Do not generate companion art in this pack.

## Region 2: Central Radiant Core

Profile id: `central_radiant_core`
Canon role: Heart Radiance Council city and chapter hub.

### Visual Lock

- Identity: luminous white-gold city, sacred civic plaza, fountain light, ceremonial but calm.
- Mood: main hub, safe council threshold, not marketplace clutter, not gacha lobby.
- Palette: white stone, warm gold, clean blue glass, soft greenery, clear daylight.
- Camera: elevated plaza looking toward radiant city, companion on lower-center round stone platform.
- Material language: polished stone, gold inlay, blue crystal water, gardens, arches.
- Must avoid: overbright unreadable white, casino gold, UI-like banners, dense tiny architecture near companion.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky` | Clear daylight sky and soft clouds. |
| `city_mountains` | Main palace, towers, far mountains, distant harbor. |
| `water_plane` | Fountain pools and channel reflections; optional separate if animated. |
| `ground_platform` | Round council plaza, central floor inlay, companion-safe floor. |
| `structures` | Noninteractive far colonnades, city gates, terraces. |
| `runtime_props` | Small crystal beacons, fountain glows, side gold ornaments, banners if stateful. |
| `trace_fx` | `golden_rune`, `repaired_light`, soft gratitude glow on plaza seams. |
| `foreground_occlusion` | Low flowers, small rail edges, leaf canopy at top-left if crop-safe. |

### Do Not Bake Into Base

Foreground crystal beacons, animated fountain spouts, side banners, strong rune glows, readable ceremonial markers, clickable council lamps.

### Scene Profile Draft

```js
{
  id: "central_radiant_core",
  label: "Central Radiant Core",
  sky: { exists: true, rect: { x: 0.00, y: 0.02, w: 1.00, h: 0.30 }, horizonY: 0.35 },
  celestial: {
    enabled: true,
    anchor: "background",
    mode: "sharedHorizonArc",
    xRange: [0.14, 0.86],
    yRange: [0.10, 0.34]
  },
  companion: {
    anchor: { x: 0.50, y: 0.69 },
    reservedRect: { x: 0.37, y: 0.44, w: 0.26, h: 0.27 }
  },
  zones: {
    water: [
      { id: "fountain_left", rect: { x: 0.20, y: 0.43, w: 0.18, h: 0.10 }, maxTraces: 2 },
      { id: "fountain_right", rect: { x: 0.62, y: 0.43, w: 0.18, h: 0.10 }, maxTraces: 2 }
    ],
    ground: [
      { id: "main_plaza", rect: { x: 0.29, y: 0.55, w: 0.42, h: 0.18 }, maxTraces: 5 }
    ],
    affinity: [
      { id: "plaza_rune", kind: "platform", rect: { x: 0.39, y: 0.60, w: 0.22, h: 0.08 } },
      { id: "blue_beacon_left", kind: "crystal", rect: { x: 0.18, y: 0.58, w: 0.12, h: 0.12 } },
      { id: "blue_beacon_right", kind: "crystal", rect: { x: 0.70, y: 0.58, w: 0.12, h: 0.12 } }
    ]
  }
}
```

### Generation Pack

1. Generate clean daylight `sky`, `city_mountains`, `water_plane`, and `ground_platform`.
2. Keep council props sparse; generate beacon and fountain-glow props one-by-one.
3. Use `golden_rune` and `repaired_light` trace placement only on plaza/platform.

## Region 3: Northern Verdant Plains

Profile id: `northern_verdant_plains`
Canon role: growth, repair, low-pressure travel traces.

### Visual Lock

- Identity: pastoral valley, windmills, river, stone circle, warm field path.
- Mood: low-pressure rest, open air, repair and growth, no urgent quest pressure.
- Palette: fresh green, wheat gold, pale blue sky, soft flower accents.
- Camera: scenic meadow viewpoint, companion on lower-center stone circle.
- Material language: mossy stone, grass, wooden fences, cottage roofs, watermill, flowers.
- Must avoid: crowded village UI, harvest-sim task board, daily-farm pressure, red-dot reward feel.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky` | Blue sky, daylight clouds. |
| `mountains_fields` | Far mountains, windmills, farms, cottages. |
| `water_plane` | River and small waterfall, separate for ripples. |
| `ground_platform` | Stone circle and meadow path. |
| `structures` | Distant cottages, watermill, fences that are not foreground blockers. |
| `runtime_props` | Lantern, small fence gates, flower clusters, low stones, rest marker. |
| `trace_fx` | `leaf`, `mist`, `glow`, calm `ripple` near river only. |
| `foreground_occlusion` | Tree canopy, flowers, fence posts, grass corners. |

### Do Not Bake Into Base

Right lantern, near fence posts, large foreground flower clusters, interactable rest stone, companion-near tree branch occluder.

### Scene Profile Draft

```js
{
  id: "northern_verdant_plains",
  label: "Northern Verdant Plains",
  sky: { exists: true, rect: { x: 0.00, y: 0.02, w: 1.00, h: 0.31 }, horizonY: 0.36 },
  celestial: { enabled: true, anchor: "background", mode: "sharedHorizonArc", xRange: [0.12, 0.88], yRange: [0.10, 0.35] },
  companion: {
    anchor: { x: 0.50, y: 0.71 },
    reservedRect: { x: 0.37, y: 0.46, w: 0.26, h: 0.27 }
  },
  zones: {
    water: [
      { id: "river_right", rect: { x: 0.62, y: 0.48, w: 0.26, h: 0.10 }, maxTraces: 3 }
    ],
    ground: [
      { id: "stone_circle", rect: { x: 0.30, y: 0.58, w: 0.40, h: 0.17 }, maxTraces: 4 },
      { id: "meadow_left", rect: { x: 0.12, y: 0.64, w: 0.20, h: 0.10 }, maxTraces: 2 },
      { id: "meadow_right", rect: { x: 0.68, y: 0.64, w: 0.20, h: 0.10 }, maxTraces: 2 }
    ],
    affinity: [
      { id: "leaf_path", kind: "pier", rect: { x: 0.18, y: 0.58, w: 0.20, h: 0.12 } },
      { id: "rest_stone", kind: "platform", rect: { x: 0.42, y: 0.61, w: 0.16, h: 0.08 } }
    ]
  }
}
```

### Generation Pack

1. Generate pastoral sky, far fields, river, and stone platform layers.
2. Generate compact prop pack for flowers, low stones, grass tufts, small lanterns only.
3. Generate tree/fence occlusion separately; do not include tall tree trunk in runtime base.

## Region 4: Southern Harbor Nexus

Profile id: `southern_harbor_nexus`
Canon role: trade, travel, chapter departure, outside-world contact.

### Visual Lock

- Identity: bright blue-white harbor city, sail ships, dock plaza, travel threshold.
- Mood: departure and return, not commerce grind, not loot market.
- Palette: sea blue, white stone, gold trim, sailcloth blue, warm dock wood.
- Camera: plaza foreground leading to docks and water city.
- Material language: stone plaza, wooden docks, ropes, crates, canvas, brass lamps.
- Must avoid: cluttered shop inventory vibe, pirate battle mood, text signage.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky` | Clear harbor sky and clouds. |
| `city_mountains` | Far harbor city, cliffs, distant ships. |
| `water_plane` | Harbor water, reflections, wake/ripple plane. |
| `ground_platform` | Stone plaza and dock apron. |
| `structures` | Large ship and city structures if noninteractive; hero ship should be separate if used for travel. |
| `runtime_props` | Crates, rope coils, dock posts, lanterns, banners, gangway, cargo. |
| `trace_fx` | Blue lanterns and ripples on water; route glows on dock edges. |
| `foreground_occlusion` | Barrels, crates, rope, low rail posts. |

### Do Not Bake Into Base

Large foreground ship if travel-stateful, dock posts, cargo piles, lanterns, banners, market crates, rope coils, gangway blockers.

### Scene Profile Draft

```js
{
  id: "southern_harbor_nexus",
  label: "Southern Harbor Nexus",
  sky: { exists: true, rect: { x: 0.00, y: 0.02, w: 1.00, h: 0.28 }, horizonY: 0.36 },
  celestial: { enabled: true, anchor: "background", mode: "sharedHorizonArc", xRange: [0.12, 0.88], yRange: [0.10, 0.35] },
  companion: {
    anchor: { x: 0.50, y: 0.70 },
    reservedRect: { x: 0.37, y: 0.45, w: 0.26, h: 0.27 }
  },
  zones: {
    water: [
      { id: "harbor_left", rect: { x: 0.12, y: 0.38, w: 0.24, h: 0.14 }, maxTraces: 3 },
      { id: "harbor_center", rect: { x: 0.36, y: 0.38, w: 0.30, h: 0.12 }, maxTraces: 3 }
    ],
    ground: [
      { id: "plaza_apron", rect: { x: 0.29, y: 0.57, w: 0.42, h: 0.18 }, maxTraces: 4 },
      { id: "dock_threshold", rect: { x: 0.38, y: 0.50, w: 0.24, h: 0.10 }, maxTraces: 2 }
    ],
    affinity: [
      { id: "travel_marker", kind: "platform", rect: { x: 0.42, y: 0.60, w: 0.16, h: 0.08 } },
      { id: "cargo_left", kind: "pier", rect: { x: 0.14, y: 0.66, w: 0.20, h: 0.10 } },
      { id: "lantern_right", kind: "crystal", rect: { x: 0.70, y: 0.58, w: 0.14, h: 0.14 } }
    ]
  }
}
```

### Generation Pack

1. Generate sea/sky/city/water/plaza layers.
2. Generate dock/cargo/lantern objects separately; wide dock pieces should use one-by-one or strip generation, not square prop packs.
3. Keep water trace rules strict: only `ripple`, `blue_lantern`, `mist`, `glow`.

## Region 5: Ethereal Moon Lakefront

Profile id: `ethereal_moon_lakefront`
Canon role: Demo and Chapter 1 first habitat, Greyshade Cat first-session focus.

### Visual Lock

- Identity: sacred quiet lake camp, luminous water, soft blue-gold memory light.
- Mood: safe Moonlake threshold, gentle first-session coherence, not a busy theme park.
- Palette: moonlit blue, soft daylight gold, pale stone, white-blue tents, crystal cyan.
- Camera: mobile-first vertical lakefront, companion lower-center on clean stone/platform threshold.
- Material language: semi-realistic lake water, wet pale stone, layered cliff faces, waterfall mist, linen tents, low wood dock, controlled crystal specular accents, physically plausible moon/day light and contact shadows.
- Must avoid: combat arena, dense prop clutter, strong UI-like symbols, large foreground crystals blocking companion.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky_atmosphere` | Soft sky and cloud mass only; no baked moon, sun, stars, or time-moving celestial body. |
| `celestial_bodies` | Runtime or separately generated moon/sun/star pass riding `sharedHorizonArc`. |
| `celestial_occlusion` | Optional cloud, tree canopy, or cliff-edge masks that can pass in front of celestial bodies. |
| `mountains` | Cliffs, waterfalls, distant shrine, distant camp. |
| `lake_water` | Main lake water as independent plane for ripples, reflection, mist, glimmers. |
| `shore_ground_platform` | Lower-center stone circle and dock threshold; companion floor. |
| `camp_structures` | Tents, far docks, shoreline camp structures. |
| `runtime_props` | Blue crystal clusters, lantern posts, campfire/firefly glow, shrine marker, dock posts. |
| `trace_fx` | Lake ripples, blue lanterns, low mist, return glow, boundary traces on shore/platform only. |
| `foreground_occlusion` | Low flowers, grass, dock lip, near posts, subtle tree leaves. |

### Do Not Bake Into Base

Large foreground crystals, lantern posts, campfire, firefly clusters, dock posts, shrine marker, memory crystal clusters, strong platform glow, dialogue traces.

### Scene Profile Draft

```js
{
  id: "ethereal_moon_lakefront",
  label: "Ethereal Moon Lakefront",
  sky: { exists: true, rect: { x: 0.00, y: 0.02, w: 1.00, h: 0.28 }, horizonY: 0.35 },
  celestial: {
    enabled: true,
    anchor: "background",
    mode: "sharedHorizonArc",
    xRange: [0.12, 0.88],
    yRange: [0.10, 0.35],
    twilightMinutes: 45
  },
  companion: {
    anchor: { x: 0.50, y: 0.70 },
    reservedRect: { x: 0.38, y: 0.45, w: 0.24, h: 0.27 }
  },
  zones: {
    water: [
      { id: "lake_main", rect: { x: 0.24, y: 0.34, w: 0.52, h: 0.22 }, maxTraces: 5 },
      { id: "lake_near_edge", rect: { x: 0.30, y: 0.53, w: 0.40, h: 0.08 }, maxTraces: 3 }
    ],
    ground: [
      { id: "stone_platform", rect: { x: 0.32, y: 0.60, w: 0.36, h: 0.14 }, maxTraces: 4 },
      { id: "shore_left", rect: { x: 0.12, y: 0.64, w: 0.18, h: 0.10 }, maxTraces: 2 },
      { id: "shore_right", rect: { x: 0.70, y: 0.64, w: 0.18, h: 0.10 }, maxTraces: 2 }
    ],
    affinity: [
      { id: "left_crystal", kind: "crystal", rect: { x: 0.12, y: 0.60, w: 0.16, h: 0.14 } },
      { id: "right_crystal", kind: "crystal", rect: { x: 0.72, y: 0.58, w: 0.16, h: 0.14 } },
      { id: "dock_threshold", kind: "pier", rect: { x: 0.42, y: 0.52, w: 0.16, h: 0.10 } },
      { id: "platform_rune", kind: "platform", rect: { x: 0.42, y: 0.62, w: 0.16, h: 0.08 } }
    ]
  }
}
```

### Moonlake Replacement Protocol

1. Treat new Moonlake art as a replacement candidate, not an automatic runtime swap.
2. Build or block out Moonlake in a 3D/DCC-style source first, with camera locked to `1080x1920`.
3. Produce layered reference/render passes: `sky_atmosphere`, `celestial_bodies`, `celestial_occlusion`, `mountains`, `lake_water`, `shore_ground_platform`, `camp_structures`, `foreground_occlusion`, plus optional mask/depth references.
4. Do not bake moon, sun, or star bodies into `sky_atmosphere`; time-of-day bodies must be separate so their positions can follow the profile arc.
5. Produce runtime props separately: crystal clusters, lantern posts, dock posts, campfire/firefly glow, shrine marker.
6. Require semi-realistic material and lighting review before any asset-readiness promotion; painterly composition references are not enough.
7. Require companion readability review against Greyshade Cat before approval; foreground occlusion may lightly cover feet but not body/face silhouette.
8. Do not delete `LakeNightCamp_v2` or legacy Moonlake assets until a reference audit and runtime QA pass approve the replacement.
9. Keep Greyshade Cat as the first-session focus. Do not introduce a visual fallback to another companion.
10. Any runtime swap touching `assets/**`, `assetManifest.js`, `pixiApp.js`, or scene switching is a separate approved GROUNDWORK task.

### Generation Pack

1. Start here before other regions.
2. Produce a 3D/DCC blockout or equivalent source scene before any final layer export.
3. Export vertical mobile-first render passes, not a complete baked painting.
4. Generate dressed reference only after a foundation render-pass stack exists.
5. Use one-by-one transparent prop generation for crystals, lanterns, dock posts, and shrine marker.
6. Use trace FX only as metadata/planning until placement resolver exists.

## Region 6: Eastern Mystic Mountains

Profile id: `eastern_mystic_mountains`
Canon role: Mundun Rift pressure, high-tension memory region, endgame foreshadowing.

### Visual Lock

- Identity: purple crystalline mountain citadel, ritual arena threshold, rift pressure.
- Mood: tense and uncanny but still companion-safe; not evil ending, not horror dungeon.
- Palette: obsidian rock, violet crystal glow, silver fog, muted gold floor inlay.
- Camera: elevated circular platform before distant rift citadel.
- Material language: cracked stone, violet crystal, mist, ancient pylons, reflective void water.
- Must avoid: permanent bad ending implication, impossible repair mood, combat-only boss arena.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky` | Stormy violet sky and cloud layers. |
| `mountains_citadel` | Jagged black mountains, distant citadel, bridges, rift glow. |
| `mist_void_plane` | Low mist or void water plane, reflections, purple haze. |
| `ground_platform` | Circular stone platform, companion-safe center. |
| `structures` | Distant towers, bridges, citadel silhouette. |
| `runtime_props` | Purple crystals, pylons, cracked glyph stones, low beacon lamps. |
| `trace_fx` | `glitch_noise` near crystals, boundary traces on platform edge, repaired light after calm states. |
| `foreground_occlusion` | Low rock shards, platform lip, crystal tips at corners. |

### Do Not Bake Into Base

Large purple crystals near platform, pylons, crack lightning, active portal glyphs, boundary markers, interactive rift shards.

### Scene Profile Draft

```js
{
  id: "eastern_mystic_mountains",
  label: "Eastern Mystic Mountains",
  sky: { exists: true, rect: { x: 0.00, y: 0.02, w: 1.00, h: 0.28 }, horizonY: 0.38 },
  celestial: { enabled: false, reason: "rift sky dominates; celestial path would fight the rift lock" },
  companion: {
    anchor: { x: 0.50, y: 0.70 },
    reservedRect: { x: 0.37, y: 0.45, w: 0.26, h: 0.27 }
  },
  zones: {
    water: [],
    ground: [
      { id: "rift_platform", rect: { x: 0.27, y: 0.55, w: 0.46, h: 0.20 }, maxTraces: 5 },
      { id: "left_stone_edge", rect: { x: 0.12, y: 0.64, w: 0.20, h: 0.10 }, maxTraces: 2 },
      { id: "right_stone_edge", rect: { x: 0.68, y: 0.64, w: 0.20, h: 0.10 }, maxTraces: 2 }
    ],
    affinity: [
      { id: "purple_crystal_left", kind: "crystal", rect: { x: 0.12, y: 0.56, w: 0.18, h: 0.18 } },
      { id: "purple_crystal_right", kind: "crystal", rect: { x: 0.70, y: 0.56, w: 0.18, h: 0.18 } },
      { id: "boundary_rim", kind: "platform", rect: { x: 0.34, y: 0.66, w: 0.32, h: 0.08 } }
    ]
  }
}
```

### Generation Pack

1. Generate rift sky, mountains/citadel, mist plane, and platform separately.
2. Generate purple crystal and pylon props one-by-one because they are tall/large and identity-sensitive.
3. Keep all high-tension FX reversible and non-failure-framed.

## Region 7: Southwest Tidal Frontier

Profile id: `southwest_tidal_frontier`
Canon role: water, drifting memory, rift boundaries, isolated coast settlements.

### Visual Lock

- Identity: storm coast, broken quay, purple rift mountains, rough sea.
- Mood: exposed boundary and drifting memory, not shipwreck horror, not combat defeat.
- Palette: storm navy, violet rift glow, wet stone gray, lantern amber, sea foam cyan.
- Camera: stone quay foreground looking over dark water toward rift island.
- Material language: wet stone, wood posts, ropes, storm banners, sea spray, cracked purple rift veins.
- Must avoid: unreadable darkness, horror coastline, pirate raid, too many lightning bolts over UI area.

### Layer Plan

| Layer | Contents |
| --- | --- |
| `sky` | Dark storm clouds, distant vortex or rift glow. |
| `mountains_coast` | Purple cliffs, far island citadel, rocky coast. |
| `sea_water` | Sea plane, waves, foam, water trace surface. |
| `ground_platform` | Broken quay / stone platform for companion. |
| `structures` | Distant docks, ship silhouettes, far posts. |
| `runtime_props` | Lanterns, banners, broken posts, ropes, small dock objects. |
| `trace_fx` | Blue lanterns and ripples on sea; boundary/glitch at rift cracks only. |
| `foreground_occlusion` | Broken posts, ropes, dead branch, quay lip. |

### Do Not Bake Into Base

Lightning strikes, lantern posts, banners, broken foreground posts, rope rails, active rift cracks, dock lamps, companion-near debris.

### Scene Profile Draft

```js
{
  id: "southwest_tidal_frontier",
  label: "Southwest Tidal Frontier",
  sky: { exists: true, rect: { x: 0.00, y: 0.02, w: 1.00, h: 0.30 }, horizonY: 0.39 },
  celestial: { enabled: false, reason: "storm/rift sky uses authored FX instead of normal sun/moon arc" },
  companion: {
    anchor: { x: 0.50, y: 0.71 },
    reservedRect: { x: 0.37, y: 0.46, w: 0.26, h: 0.27 }
  },
  zones: {
    water: [
      { id: "sea_left", rect: { x: 0.08, y: 0.38, w: 0.32, h: 0.18 }, maxTraces: 3 },
      { id: "sea_right", rect: { x: 0.60, y: 0.38, w: 0.32, h: 0.18 }, maxTraces: 3 }
    ],
    ground: [
      { id: "stone_quay", rect: { x: 0.30, y: 0.58, w: 0.40, h: 0.18 }, maxTraces: 4 },
      { id: "left_quay_edge", rect: { x: 0.12, y: 0.64, w: 0.18, h: 0.10 }, maxTraces: 2 },
      { id: "right_quay_edge", rect: { x: 0.70, y: 0.64, w: 0.18, h: 0.10 }, maxTraces: 2 }
    ],
    affinity: [
      { id: "rift_crack_left", kind: "crystal", rect: { x: 0.08, y: 0.52, w: 0.18, h: 0.20 } },
      { id: "dock_lanterns", kind: "pier", rect: { x: 0.68, y: 0.58, w: 0.18, h: 0.14 } },
      { id: "boundary_threshold", kind: "platform", rect: { x: 0.40, y: 0.64, w: 0.20, h: 0.08 } }
    ]
  }
}
```

### Generation Pack

1. Generate storm sky, distant coast, sea water, and quay platform as separate layers.
2. Generate lanterns, banners, broken posts, and ropes as one-by-one or small compact prop pack where safe.
3. Keep sea trace rules strict; no fire/ash/rune on water.

## Atlas Reference: Linkara World Map

Profile id: `linkara_world_map`
Runtime role: atlas/reference only.

Visual lock:

- Keep as reference master until a UI-specific redraw exists.
- Do not use as habitat background.
- Do not rely on baked labels or paragraphs for mobile runtime.
- Future atlas UI should use DOM/SVG labels and region buttons over a cleaner map image.

Next pack:

- `TP-ATLAS-MOBILE-REDRAW` if the atlas should become live on mobile.
- No companion anchor, trace placement, or habitat layer stack applies.

## Cross-Region Generation Order

Recommended order:

1. `ethereal_moon_lakefront` because it replaces or evolves the current first habitat.
2. `central_radiant_core` because it is the cleanest hub reference.
3. `northern_verdant_plains` because it validates calm growth/repair traces.
4. `southern_harbor_nexus` because it validates water + travel props.
5. `southeast_forge_hills` because it validates fire/industrial affinity.
6. `eastern_mystic_mountains` because it validates high-tension/rift traces.
7. `southwest_tidal_frontier` because it validates storm sea and boundary placement.

## Prompt Template: Layered Habitat Foundation

Use this template in the generation window. Replace bracketed fields.

```text
Use case: stylized-concept
Asset type: Nexus Link habitat layered raster layer, preview candidate only
Primary request: Generate the [layer_name] layer for [region_id].
Reference role: Use the approved Linkara region reference, this Visual Lock, and the current DCC/3D render pass or approved source layer as the style and composition source.
Scene/backdrop: [region visual lock summary].
Style/medium: project-native premium 3D storybook diorama, cozy fantasy, soft stylized forms, realistic material response, mobile-first readability, not pixel art, not flat anime concept art, not photorealism.
Material/lighting lock: cinematic moonlit lighting with controlled cyan and warm gold magical accents. Preserve wet stone, water reflection/ripple structure, atmospheric depth, leaf translucency, carved wood, controlled crystal/metal specular highlights, contact shadows, and restrained bloom. Avoid plastic surfaces, over-smoothed painterly gradients, noisy AI texture, one-note blue palettes, or glow that hides surface form.
Composition/framing: mobile-first 9:16 portrait habitat composition, compatible with 390x844 safe-zone runtime. Keep the companion reserved area readable where this layer overlaps the lower center.
Layer responsibility: This layer contains only [allowed contents].
Layer separation constraints: Do not include [forbidden contents]. No UI, no text, no labels, no characters, no animals, no companion sprite, no trace FX unless this is a trace layer. Do not bake sun, moon, stars, or time-moving celestial bodies into `sky_atmosphere`.
Runtime readability: Preserve top HUD and bottom nav/Soul Talk quiet zones. Keep lower-center companion platform visually clear.
Avoid: baked-in interactables, baked-in memory traces, chunky pixel art, clutter, combat-only framing, water/fire placement contradictions.
```

## Prompt Template: Transparent Runtime Prop

Use `imagegen` built-in first with chroma-key cleanup, or `generate2dsprite` if pack/extraction/QC is needed.

```text
Use case: stylized-concept
Asset type: Nexus Link transparent runtime habitat prop
Primary request: Create a single [prop_name] prop matching [region_id].
Reference role: Match the approved [region_id] visual lock and layer reference.
Style/medium: project-native premium 3D storybook diorama prop style, crisp silhouette, soft stylized forms, realistic material response, controlled accent lighting, mobile-first readability. Do not make pixel art, flat anime prop art, or photoreal isolated product art.
View: mostly front-facing 3/4 top-down RPG object view; upright object centered, only a small visible top face.
Background: perfectly flat solid #FF00FF magenta for background removal.
Constraints: full object visible, generous magenta margin on all sides, no part touches image edge, no floor plane, no cast shadow, no text, no UI, no labels, no watermark.
Avoid: scenery, companion, characters, baked trace FX unless this prop is explicitly an FX asset, plastic material, noisy AI texture, or glow that hides the object's form.
```

## TASK_PACK: TP-HAB-RESET-1 Rejected Moonlake Image Cleanup

Layer: `GROUNDWORK staging cleanup`, not runtime integration.

Expected outputs:

```text
output/linkara/moonlake/**/*.png removed
output/linkara/moonlake/**/*.jpg removed
output/linkara/moonlake/**/*.jpeg removed
output/linkara/moonlake/**/*.webp removed
```

Preserve:

```text
output/linkara/moonlake/**/*.json
output/linkara/moonlake/**/*.md
output/linkara/moonlake/**/*.txt
```

Non-goals:

- No `assets/**` deletion.
- No source runtime deletion.
- No `assetManifest.js` update.
- No `pixiApp.js` update.
- No save/schema change.

## TASK_PACK: TP-HAB-PIPE-1 3D-Assisted 2.5D Production Reset

Layer: `PLANNING / VISUAL PRODUCTION`, not runtime integration.

Expected outputs:

- Habitat workflow marks direct 2D generation as concept/paintover support, not the default final-background source.
- Moonlake uses an offline 3D/DCC source package for camera, material, lighting, render-pass, mask, and depth discipline.
- PixiJS remains the runtime target; Three.js is not introduced.

## TASK_PACK: TP-HAB-MOON-3D-1 Moonlake 3D/DCC Render-Pass Brief

Layer: `GROUNDWORK asset generation/staging`, not runtime integration.

Expected outputs:

```text
output/linkara/moonlake/source-brief.md
output/linkara/moonlake/profile-draft-3d-assisted.json
output/linkara/moonlake/render-pass-manifest.json
```

Required render-pass plan:

- `sky_atmosphere`: sky and cloud mass only; no celestial bodies.
- `celestial_bodies`: sun, moon, stars, or time-of-day bodies as movable pass candidates.
- `celestial_occlusion`: clouds, canopy, cliff edges, or shrine edges that can pass in front of celestial bodies.
- `mountains`: cliffs, waterfalls, distant shrine, atmospheric depth.
- `lake_water`: believable water reflection and ripple structure, clean near/far edges.
- `shore_ground_platform`: companion platform with wet stone, contact shadows, and no opaque body blockers.
- `camp_structures`: tents, docks, and shoreline structures only when not runtime-stateful.
- `foreground_occlusion`: low flowers, grass, dock lip, near posts, and subtle leaves for foot-depth only.
- Optional `masks/depth`: water mask, companion reserved mask, foreground occlusion mask, and depth reference for later Pixi FX.

Approval gate:

- Human approval of composition and visual quality.
- Companion readability passes.
- UI forbidden zones remain quiet.
- Celestial separation passes.
- Material/lighting realism passes.

## TASK_PACK: TP-HAB-1 Moonlake Layered Art Generation

Layer: `GROUNDWORK asset generation/staging`, not runtime integration.

Status: superseded for final-quality work by `TP-HAB-MOON-3D-1`. Use only for historical context or low-risk concept exploration.

Expected outputs:

```text
output/linkara/moonlake/layers/moonlake_sky.png
output/linkara/moonlake/layers/moonlake_mountains.png
output/linkara/moonlake/layers/moonlake_lake_water.png
output/linkara/moonlake/layers/moonlake_shore_ground_platform.png
output/linkara/moonlake/layers/moonlake_camp_structures.png
output/linkara/moonlake/layers/moonlake_foreground_occlusion.png
output/linkara/moonlake/props/*.png
output/linkara/moonlake/prompts/*.txt
output/linkara/moonlake/profile-draft.json
output/linkara/moonlake/layered-preview.png
```

Non-goals:

- No copy into `assets/**` without human approval.
- No `assetManifest.js` update.
- No `pixiApp.js` update.
- No save/schema change.
- No scene switching.
- No BGM routing.

Approval gate:

- Human visual approval of base layers.
- Human approval of transparent prop candidates.
- Reference audit against current Moonlake before runtime promotion.

## TASK_PACK: TP-HAB-2 Seven Region Layer Sets

Layer: `GROUNDWORK asset generation/staging`, after TP-HAB-1 validates the process.

Expected outputs per region:

```text
output/linkara/<region_id>/layers/
output/linkara/<region_id>/props/
output/linkara/<region_id>/prompts/
output/linkara/<region_id>/profile-draft.json
output/linkara/<region_id>/layered-preview.png
```

Batching rule:

- Do not generate all regions in one uncontrolled batch.
- Use one region at a time, inspect, then continue.
- Start with `central_radiant_core` or `northern_verdant_plains` after Moonlake.

## TASK_PACK: TP-HAB-3 Scene Profile Data Authoring

Layer: `EXPERIENCE data-only` unless it touches protected runtime wiring.

Expected outputs:

```text
src/data/sceneProfiles/<region_id>Profile.js
src/data/sceneProfiles/index.js
src/data/traceRules.js
```

Non-goals:

- No runtime resolver wiring.
- No background manifest switch.
- No save/schema change.
- No assets copied into live runtime paths.

## TASK_PACK: TP-HAB-4 Runtime Resolver And Pixi Wiring

Layer: `GROUNDWORK` when touching `pixiApp.js`, `assetManifest.js`, `assets/**`, or renderer architecture.

Expected scope:

- Background crop/profile resolver.
- Scene profile loader.
- Trace placement resolver.
- Optional dynamic UI inset subtraction.
- BGM routing only if separately approved.

This pack must open with a fresh human-approved plan before implementation.

## QA Checklist Before Runtime Promotion

- Layer files preserve expected dimensions and composition.
- Companion anchor remains bottom-center and readable.
- Reserved rect has no opaque prop or foreground blocker.
- UI forbidden zones are visually quiet.
- Water-only traces appear only on water zones.
- Fire/ash/rune/glitch traces stay in declared affinity zones.
- Foreground occlusion adds depth without hiding companion face/body.
- Props have alpha and no edge touch.
- Prompt metadata exists for every generated asset.
- Layered preview matches scene profile zones.
- No generated image contains UI, labels, text, watermarks, characters, animals, or companion sprites.
- Runtime promotion has human visual approval.
