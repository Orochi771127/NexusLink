# Moonlake 3D-Assisted 2.5D Source Brief

Status: `SOURCE BRIEF / NO RUNTIME WIRING`
Region id: `ethereal_moon_lakefront`
Task pack: `TP-HAB-MOON-3D-1`

This brief replaces the failed direct 2D background-generation line. The goal is not to build a 3D runtime. The goal is to use a 3D/DCC-style source scene to lock camera, proportions, materials, lighting, and render-pass separation before exporting Pixi-friendly 2.5D layers.

## Runtime Boundary

- Runtime remains PixiJS / DOM.
- No Three.js, GLB runtime loader, TypeScript, Vite, npm, backend, database, or build step.
- No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, or save schema mutation in this task pack.
- Generated or rendered files stay under `output/linkara/moonlake/` until human approval and a separate GROUNDWORK runtime-promotion task.

## Camera And Canvas

- Target artboard: `1080x1920`.
- Camera: mobile portrait, fixed for every pass.
- Projection goal: lower-center companion platform remains readable at `390x844` safe viewport after cover-height projection.
- Top HUD forbidden zone: normalized `y < 0.12`.
- Bottom UI forbidden zone: normalized `y > 0.80`.
- Companion reserved rect: `{ x: 0.38, y: 0.45, w: 0.24, h: 0.27 }`.

## Source Scene Blockout

- Sky and cloud mass occupy the upper third; no sun, moon, or stars in the sky base.
- Cliff and waterfall silhouettes frame the lake without crowding the companion area.
- Lake water is a distinct plane with believable reflection, ripple direction, and clean near/far edges.
- Shore/platform sits lower center with wet pale stone, contact shadows, and enough quiet area for Greyshade Cat.
- Camp tents, docks, and shoreline structures stay behind or beside the companion zone unless planned as runtime props.
- Foreground occlusion is low and sparse: flowers, grass, dock lip, near posts, or leaves may cover feet lightly only.

## Material And Lighting Lock

- Semi-realistic fantasy, clean HD Nexus Link readability.
- Wet stone needs contact shadows and surface variation.
- Water needs plausible reflection and ripple structure, not a flat blue gradient.
- Crystal and metal accents need controlled specular highlights, not bloom that hides form.
- Mist and atmospheric depth should separate cliffs, lake, and platform.
- Avoid flat anime concept art, plastic surfaces, noisy AI texture, over-smoothed painterly gradients, and generic photobash.

## Approval Gates

- Human approval of source composition.
- Human approval of material and lighting quality.
- Celestial bodies separated from `sky_atmosphere`.
- Companion readability passes with Greyshade Cat.
- UI forbidden zones remain visually quiet.
- Layer stack and optional masks/depth references are documented before any runtime promotion.
