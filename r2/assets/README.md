# Assets

This folder stores GitHub Pages-loadable runtime assets for the Nexus Link prototype.

Use this folder for:

- companion character images
- sprite sheets
- backgrounds
- UI elements
- visual effects
- audio assets

Current required runtime asset:

```text
assets/flametail-fox.png
```

If `assets/flametail-fox.png` exists, `src/pixi/companionRenderer.js` will load it as the companion image. If it does not exist, the prototype falls back to the PixiJS Graphics placeholder.
