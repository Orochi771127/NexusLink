# Nexus Link Art Style Target

Status: `PROJECT-NATIVE ART STYLE TARGET / V2`
Scope: global visual target for habitats, companions, UI illustration, generated references, DCC/3D-assisted source scenes, and future runtime-ready art.
Runtime status: no runtime wiring. This document does not approve or promote any asset.

## Reference Analysis

The target style is a premium mobile cozy-fantasy diorama, not flat anime, not photorealism, and not chunky pixel art.

Primary traits:

- Stylized 3D storybook rendering with soft, rounded forms.
- High-detail material response, but simplified enough for mobile readability.
- Moonlit blue atmosphere balanced by warm lantern/gold accents.
- Strong depth layering: sharp companion/platform in front, atmospheric lake and village in midground, softened mountains/sky in the distance.
- Controlled magical glow: cyan crystals, blue firefly lights, gold rune rings, and soft UI halos.
- Companion is the emotional focal point, placed clearly on a readable platform.
- UI uses translucent dark glass panels, rounded corners, soft borders, and restrained glow.

This should replace vague wording such as "semi-realistic" when describing the desired final visual direction. The better target phrase is:

```text
project-native premium 3D storybook diorama, cozy fantasy, soft stylized forms, realistic material response, cinematic moonlit lighting, controlled magical glow, mobile-first readability
```

## Global Style Pillars

1. Diorama depth
   - Every habitat should feel like a handcrafted miniature world with clear foreground, companion stage, midground, and background.
   - Use depth of field and atmospheric perspective carefully; never blur the companion or interactive read area.

2. Soft physical materials
   - Stone, wood, fur, water, crystal, metal, foliage, cloth, and glass must have plausible light response.
   - Forms can be rounded and stylized, but surfaces cannot look flat, plastic, or unlit.

3. Moonlit blue plus warm care light
   - Core palette: deep navy, moon blue, lake cyan, crystal blue, soft violet shadow, warm lantern amber, pale gold rune light.
   - Avoid one-note blue. Every cool scene needs small warm anchors.

4. Companion-first framing
   - The active companion is the focus of the scene, not an afterthought.
   - Background landmarks must support the companion's emotional state without competing with the face/body silhouette.

5. Controlled magic
   - Glow must reveal material shape, not erase it.
   - Magical light should appear in crystals, glyphs, water reflections, fireflies, and UI focus states.
   - Memory traces, dialogue traces, and state FX remain runtime layers, not baked background decoration.

6. Mobile-first legibility
   - Scene composition must read at `390x844`.
   - Main subject, active UI, and trace zones must survive compression, crop, and one-handed phone viewing.

## Habitat Art Rules

Target:

- 3D/DCC-assisted 2.5D source first for final-quality bases.
- `1080x1920` portrait artboard.
- Layered render passes for PixiJS, not one flattened painting.
- Foreground occlusion used for depth, not for hiding the companion.

Required layer feeling:

- `sky_atmosphere`: deep, luminous, soft cloud volume; no baked sun/moon/stars when celestial bodies move.
- `celestial_bodies`: crisp moon/sun/star bodies on a separate movable pass.
- `mountains_or_city`: softened by distance, strong silhouette, lower contrast than companion stage.
- `water_or_atmosphere_plane`: reflective, rippled, readable; not a flat gradient.
- `shore_ground_platform`: clean stage for companion, clear contact shadows, quiet enough for body readability.
- `runtime_props`: crystals, lanterns, gates, posts, campfire, benches, and markers are separate when clickable, stateful, tall, or useful for depth sorting.
- `foreground_occlusion`: low flowers, grass, dock lips, posts, or leaves; foot-only unless human-approved.

Reject habitat art when:

- It looks like flat anime background art.
- It looks like generic photobash or AI noise.
- It is too realistic and loses cozy mobile game readability.
- It bakes companion, UI, labels, traces, weather, dialogue, or stateful props into the base.
- It hides the companion focal area with crystals, trees, gates, or glow.

## Companion Art Rules

Target:

- Illustrated companion with 3D storybook material cues.
- Fur/skin/scale/feather texture should be soft but readable.
- Eyes and face must stay expressive at runtime scale.
- Body proportions may be stylized and rounded, but species identity cannot drift.
- Companion frame remains transparent PNG, bottom-center anchor, no scene/pedestal/UI baked in.

Reject companion art when:

- It becomes chunky pixel art.
- It becomes flat sticker art with no material response.
- It becomes a realistic animal photo.
- It includes a baked background, platform, UI card, labels, or display frame.
- The body or face no longer matches the approved character lock.

## UI Art Direction

Target:

- Translucent glass-like panels over the habitat.
- Dark blue/navy panel cores with subtle blur or depth impression.
- Soft rounded corners and thin luminous borders.
- Active states use warm gold or moon-cyan glow.
- Icons should feel like polished 3D tokens or softly beveled app icons, not line-only debug icons.
- Text-heavy UI remains DOM for accessibility and localization; it is not baked into background art.

Avoid:

- Busy sci-fi HUD grids.
- Harsh neon outlines.
- Fully opaque panels that kill scene depth.
- Overly ornate fantasy frames that compete with companion emotion.

## Agent Handoff Description

Use this description when giving art generation, DCC, or visual-production agents the project style:

```text
Create Nexus Link art in a project-native premium 3D storybook diorama style. The scene should feel like a cozy fantasy miniature world built for a vertical mobile companion game. Use soft stylized forms with believable materials: wet stone contact shadows, reflective lake water, soft fur, carved wood, crystal glow, moonlit clouds, and warm lantern accents. Keep the companion as the emotional focal point. Use deep navy and moon-blue atmosphere with cyan magical highlights and small warm gold lights. Maintain clear foreground, companion platform, midground, and background depth. Do not make flat anime art, photoreal animal photos, chunky pixel art, noisy AI texture, plastic surfaces, or glow that hides material form. Do not bake UI, labels, dialogue, memory traces, weather effects, or stateful props into base layers.
```

## QA Checklist

- Reads clearly at `390x844`.
- Companion face and body silhouette remain readable.
- Main habitat platform has believable contact shadows.
- Water, stone, wood, crystal, foliage, and fur have distinct material response.
- Cool moonlit atmosphere includes controlled warm accents.
- Glows are restrained and reveal form.
- UI art, if present, uses glassy rounded panels and soft active-state glow.
- No baked UI, labels, traces, companion, or stateful props in base layers.
- Style matches premium 3D storybook diorama rather than flat anime, photorealism, or pixel art.
