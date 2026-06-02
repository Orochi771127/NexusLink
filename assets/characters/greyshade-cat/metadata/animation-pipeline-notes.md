# Greyshade Cat Animation Pipeline Notes

Generated and validated sheets now exist for:

- Emotion: `idle_calm`, `idle_defensive`, `idle_distant`
- Touch: `touch_guarded`, `touch_accept`, `touch_reject`

Remaining planned missing sheets:

- Emotion: `blink`
- Touch: `hug`
- Movement: `sit`, `sleep`
- Battle: `attack_basic`, `defend`, `hit`

To add generated sheets later:

1. Run Generate 2D Sprite from the prompt templates in `docs/prompts/greyshade-cat-sprite-prompts.md`.
2. Process the raw sheet into transparent PNG output and extracted frames.
3. Place final sheets under `assets/characters/greyshade-cat/spritesheets/{category}/`.
4. Place extracted frames under `assets/characters/greyshade-cat/frames/{category}/{animation_id}/`.
5. Add or update `assets/characters/greyshade-cat/metadata/animations.json` with frame size, frame count, fps, loop, anchor, and source sheet.
6. Preview the animation locally with `?devPanel=1`.

Testing notes:

- Use the dev panel only with `?devPanel=1`.
- Confirm that the normal homepage does not expose the dev panel.
- Check the generated animation in Safari and Chrome before merging the PR.
- Reject sheets that jitter, crop the body, lose transparency, or fail metadata frame-count checks.
