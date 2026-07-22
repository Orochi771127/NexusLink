# Sprite Assets

This folder stores character sprite sheets and animation assets.

Recommended usage:

- one subfolder per companion or creature
- one file per animation state
- transparent PNG sprite sheets for PixiJS

Example:

```text
assets/characters/blazetail-kit/spritesheets/emotion/blazetail-kit_idle_calm_512x512_8f.png
assets/characters/blazetail-kit/spritesheets/emotion/blazetail-kit_idle_happy_512x512_8f.png
assets/characters/blazetail-kit/spritesheets/emotion/blazetail-kit_idle_sad_512x512_6f.png
assets/characters/blazetail-kit/spritesheets/emotion/blazetail-kit_idle_defensive_512x512_8f.png
```

`flametail-fox` is the legacy save alias for the same 焰尾狐 identity. Do not
create a second sprite directory; the canonical runtime root is
`assets/characters/blazetail-kit/`.
