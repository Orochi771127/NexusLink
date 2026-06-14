# ThunderPup idle_calm Generation Checklist

This checklist is for the human-facing image generation package. It does not approve runtime integration, does not generate images, and does not replace human visual review.

## Reference Images Needed

Recommended reference count: **1-3 images**.

Useful references:
- One primary ThunderPup identity reference showing the whole body.
- One close-up or crop that clarifies face, eyes, markings, and tail crystal.
- Optional one pose or personality reference if it matches the approved lock spec.

Do not use references that contain:
- UI
- text
- pedestal
- white background
- multiple characters mixed together
- inconsistent design versions
- presentation sheet elements that could be copied into the runtime sheet

Reference images are identity guidance only. They are not runtime sprites.

## Generation Target

- character_id: `thunder-pup`
- action_id: `idle_calm`
- motion: calm seated idle breathing / quiet observation
- frame_count: 8 frames
- layout: 2 rows x 4 columns
- per-frame size: 512x512
- total sheet size: 2048x1024
- output: transparent PNG
- baseline: bottom-center stable across all frames
- generation mode: one full action sheet at once
- no frame-by-frame generation

## Do Not Let The Design Drift

ThunderPup must remain:
- wolf pup
- bright electric blue eyes
- dark fur palette
- blue-purple lightning markings
- compact crystal-like electric tail tip
- black-iron / cyber thunder faction language
- alert but companion-like
- protective but not aggressive

Reject drift toward:
- fox
- rabbit
- cat
- generic dog
- giant adult wolf
- heart-council fantasy style
- chunky pixel art
- armored redesign unless explicitly requested

## Forbidden In The Generated Sheet

- white background
- UI
- text
- scene
- pedestal
- codex frame
- detached FX inside the body sheet unless explicitly requested
- cropped body parts
- inconsistent scale between frames

## Codex Validation Command

After the image generation tool produces the sheet, Codex should run:

```bash
node scripts/validate_companion_asset.js --file <generated-sheet.png> --character-id thunder-pup --cols 4 --rows 2 --expected-frames 8
```

If local `node` is unavailable, use the bundled Codex Node executable and keep the same arguments.

## Human Review Checklist

- [ ] Does every frame look like the same ThunderPup?
- [ ] Are proportions consistent across all 8 frames?
- [ ] Is the crystal electric tail tip preserved?
- [ ] Are the eyes consistently bright electric blue?
- [ ] Do the blue-purple lightning markings stay coherent and avoid drifting?
- [ ] Is there no white background?
- [ ] Is there no UI?
- [ ] Is there no text?
- [ ] Is there no scene or pedestal?
- [ ] Is the bottom-center baseline stable?
- [ ] Is the motion calm idle breathing, not a dramatic pose change?
- [ ] Is ThunderPup still protective but not aggressive?

## Decision

- Human verdict:
- Required fixes:
- Approved for validation:
- Approved for runtime asset handoff:
