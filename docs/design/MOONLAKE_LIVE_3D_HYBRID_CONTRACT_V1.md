# Moonlake Live 3D Hybrid Contract V1

*Status: OWNER APPROVED · IMPLEMENTED AND AUTOMATED-VERIFIED · 2026-07-28 · TP-MOONLAKE-LIVE-3D-R1*

## 1. Product decision

Moonlake is a real-time 3D clay/resin miniature habitat. The player sees a
spatial GLB/glTF environment with live water, waterfalls, vegetation, weather
and day/night lighting. The active companion remains a 2D illustrated animated
sprite, presented in the 3D world with Ragnarok Online-like 2.5D staging.

This contract replaces the former Moonlake raster-only plan. Raster day/night
art may be kept only as loading, reduced-capability or renderer-failure fallback.

## 2. Runtime ownership

```text
Three.js canvas (environment, below)
  GLB/glTF terrain, tents, bridge, water and props
  waterfalls, grass sway, weather and day/night lighting
  walkable world positions and world-to-screen projection

PixiJS canvas (characters and authored FX, above)
  one active 2D illustrated companion
  front/back/left/right walk and directional fishing animation
  interaction, trace and companion-readable FX

DOM UI (top)
  HUD, navigation, modals, Soul Talk and accessibility
```

The Three renderer is presentation-only. It cannot own or mutate gameplay,
save, relationship, Growth, reward, Safety, RaphaelCore or battle state.
Cross-layer commands use the existing event bus or narrow renderer APIs.

## 3. Allowed technology

- Vanilla JavaScript ES Modules.
- A fixed, reviewed Three.js version loaded from a CDN as ES Modules.
- `GLTFLoader` from the matching Three.js release.
- Blender-authored GLB/glTF.
- Existing PixiJS v8 and DOM UI.
- Static GitHub Pages deployment.

The exception does not allow React Three Fiber, React, Vue, Svelte, TypeScript,
npm packages, a bundler, a build step, backend services, databases or LLM APIs.

## 4. Visual and motion contract

- Style: polished 3D miniature / clay-resin diorama; matte-satin surfaces,
  rounded readable silhouettes, Cyber-Taoism blue/cyan accents and restrained
  warm gold.
- Composition: two close framing cliff masses, two readable waterfalls,
  a central circular camp platform, ornate blue/ivory tents, a traversable
  bridge connecting platform and far bank, original low shrub language and a
  readable lake edge.
- Waterfall flow is continuous and subtle. It cannot read as a frozen decal or
  a high-speed particle hose.
- Lake motion is low-amplitude and must preserve companion readability.
- Wind produces gentle asynchronous grass and foliage sway. Whole islands or
  rigid props must not wobble.
- Time phases are `day`, `dusk`, `night`, `dawn`; existing environment time is
  the only clock authority. Sun/moon direction, ambient color, emissive accents
  and exposure may change, but no real-time reward window is created.
- Weather supports at minimum `clear`, `rain` and `mist`. Weather is atmosphere
  only: no reward, streak, scarcity, punishment or dependency behavior.

## 5. Companion and navigation contract

- Exactly one active companion in normal habitat life.
- Companion art remains 2D, linear-sampled, bottom-center anchored and never
  replaced by a generic 3D model.
- The runtime maps a 3D ground position to the Pixi character position each
  frame. Scale and occlusion may respond to depth within conservative bounds.
- Navigation uses explicit walkable polygons/waypoints; no physics engine is
  required.
- The bridge is walkable only when the route is continuous, both endpoints meet
  land, no plank gap exceeds the accepted traversal threshold, and the 2D
  companion projection remains on the visible deck.
- All sixteen current runtime companions, including `greyshade-cat`, must keep
  their own declared animation/fallback policy.
- Directional travel selects `walk`, `front_walk` or `back_walk` from projected
  movement; fishing uses the lake-facing directional fishing action.
- Roaming and fishing remain interruptible expressions. They create no catch,
  reward, progression, memory or persistence writes.

## 6. Performance and accessibility

- Mobile-first target viewport: 390x844 CSS pixels.
- Clamp device pixel ratio by quality tier; do not render unbounded native DPR.
- Desktop target: stable 60 fps where hardware allows. Mobile acceptance:
  median frame time at or below 25 ms during the standard 30-second Moonlake
  probe, with no repeated long-task spiral.
- Initial Moonlake GLB target: at or below 15 MB and approximately 75k rendered
  triangles or less before separately approved exceptions.
- Weather particles, grass instances, shadow maps and post effects scale down by
  explicit quality tier.
- `prefers-reduced-motion` disables or substantially reduces grass, waterfall
  texture scroll, weather and idle camera motion without removing information.
- WebGL/context failure shows the static fallback and leaves UI, Soul Talk,
  companion interaction and save flow usable.
- Context loss/restoration must not create duplicate canvases, event listeners
  or animation loops.

## 7. Input and camera

- The camera is a bounded elevated three-quarter view; no free orbit in the
  shipping habitat.
- Pointer/touch navigation is resolved against the 3D walkable surface and must
  ignore DOM controls and open modals.
- The camera may use subtle deterministic breathing only when reduced motion is
  not requested. It must not induce motion sickness or obscure the companion.
- Resize and orientation changes preserve the companion focal zone and the
  bridge/lake interaction targets.

## 8. Release gate

Release requires:

1. GLB import and structure audit; asset size/triangle/material report.
2. Bridge traversal proof from both directions.
3. Day, night, rain and mist screenshots at desktop and 390x844.
4. All sixteen companion action-load coverage; representative projected walk
   and fishing recordings.
5. No blocking console errors, duplicate loops or context-loss leak.
6. Static fallback proof with Three.js or GLB deliberately unavailable.
7. Existing web release gate, H1-H6, I and G1-G7 passing.
8. Human visual review before claiming commercial-ready or launch-ready.

## 9. Non-goals

- Converting companions to 3D.
- Free-camera exploration, physics sandbox or open world.
- Weather gameplay, timed rewards or survival mechanics.
- New save schema, unlocks, relationship rules, reward tables or fishing loot.
- Rewriting the full Pixi runtime or unrelated habitats.
