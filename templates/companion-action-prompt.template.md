# Companion Action Sheet Prompt Template

Use this prompt with the approved Character Lock Spec and one Action Config. Replace bracketed fields before sending to the image generation tool.

## Prompt

Create one complete Nexus Link companion action sheet for `[character_id]`, action `[action_id]`.

Follow the approved Character Lock Spec exactly:
- same character identity
- same silhouette
- same palette
- same face / eyes / markings
- same material language
- no species change
- no redesign

Use the animation catalog meaning for `[action_id]` and follow these motion notes:
`[motion_notes]`

Generate the entire action sheet at once:
- one full action sheet at once
- no frame-by-frame generation
- `[frame_count]` frames arranged as `[rows]` rows x `[cols]` columns
- each frame is 512x512 px
- total sheet size is `[total_width]`x`[total_height]` px
- transparent PNG
- bottom-center baseline stable in every frame
- stable scale across frames
- full body inside safe area
- no cropping
- body centered in each cell

Do not include:
- no UI
- no text
- no scene
- no pedestal
- no white background
- no baked-in codex frame
- no detached FX inside body sheet unless explicitly requested
- no species change
- no redesign

Style:
- illustrated / painterly / high-detail
- project-native Nexus Link Cyber-Taoism mood
- clean runtime-ready companion body sheet
- preserve character personality from the Character Lock Spec

Output only the transparent PNG action sheet. Do not output a presentation sheet, concept sheet, mockup, background scene, or UI card.
