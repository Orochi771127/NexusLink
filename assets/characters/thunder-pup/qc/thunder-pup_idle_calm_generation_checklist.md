# ThunderPup idle_calm Generation Checklist

This checklist is for the human-facing image generation package. It does not approve runtime integration, does not generate images, and does not replace human visual review.

## Reference Images Needed

Recommended reference count: **1-3 images**.

Highest-priority references:
- Priority A: approved front seated ThunderPup reference. Use it for face identity, face proportions, expression baseline, seated / idle animation baseline, forehead lightning crest, chest V/Y glow, and front-leg lightning markings.
- Priority B: approved side standing ThunderPup reference. Use it for body proportions, four-leg stance, side silhouette, wolf muzzle profile, side lightning mark distribution, and the tail crystal construction.
- Optional extra reference: only if it matches the approved lock spec and does not conflict with Priority A / B.

Reference hierarchy rules:
- The front seated reference and side standing reference together form final canon.
- Do not let the front reference replace the side-body proportions or tail crystal construction.
- Do not let the side reference replace the front face, expression, seated idle identity, or chest / foreleg markings.

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
- light gray / silver-gray muzzle and inner chest
- central forehead lightning crest
- chest V/Y-shaped electric cyan-blue glow
- blue-purple lightning markings
- irregular side-body lightning energy cracks
- short front-leg and rear-leg lightning marks
- large multi-shard violet-blue lightning crystal cluster on the rear half of the fluffy wolf tail
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
- chunky super-deformed toy look
- white wolf / mint green / gold palette variants
- fire, leaf, or ice-only marking language
- mechanical beast redesign
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
- drifting forehead crest, chest V/Y mark, leg marks, or side lightning marks
- shrinking, removing, or simplifying the tail crystal cluster

## Codex Validation Command

After the image generation tool produces the sheet, Codex should run:

```bash
node scripts/validate_companion_asset.js --file <generated-sheet.png> --character-id thunder-pup --cols 4 --rows 2 --expected-frames 8
```

If local `node` is unavailable, use the bundled Codex Node executable and keep the same arguments.

## Human Review Checklist

- [ ] Does every frame look like the same ThunderPup?
- [ ] Are proportions consistent across all 8 frames?
- [ ] Does the face stay wolf-pup shaped, not fox / rabbit / cat / generic dog?
- [ ] Is the slightly large pup head proportion preserved without becoming babyish or toy-like?
- [ ] Are large upright pointed ears preserved?
- [ ] Is the light gray / silver-gray muzzle and inner chest preserved?
- [ ] Is the central forehead lightning crest preserved?
- [ ] Is the chest V/Y-shaped glow preserved?
- [ ] Is the large multi-shard electric tail crystal cluster preserved and stable in size?
- [ ] Are the eyes consistently bright electric blue?
- [ ] Do the blue-purple lightning markings stay coherent and avoid drifting?
- [ ] Do front-leg / rear-leg marks remain stable and not jump between frames?
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
