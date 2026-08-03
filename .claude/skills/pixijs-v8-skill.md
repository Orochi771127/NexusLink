# PixiJS v8 Game Renderer Skill

This skill provides design patterns and implementation guidelines for PixiJS v8 in Nexus Link.

## Core Principles
1. Use `Application.init()` for PixiJS v8 lifecycle.
2. Manage 2D companion animations using `AnimatedSprite` or Container composition.
3. Keep render loop synchronized with `app.ticker` or main RAF.
4. Clean up textures and containers using `destroy({ children: true, texture: true })` to prevent memory leaks.

## Code Pattern: 2D Sprite Billboarding & Animation
```javascript
import * as PIXI from 'pixi.js';

export async function createCompanionSprite(texturePath) {
  const texture = await PIXI.Assets.load(texturePath);
  const sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(0.5, 1.0); // Bottom-center anchor for grounding
  return sprite;
}
```
