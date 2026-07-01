export const MEMORY_ACTIVE_STATUSES = Object.freeze(["fresh", "settled", "transformed"]);

export const MEMORY_STATUS_VISUAL_CONTRACT = Object.freeze({
  fresh: Object.freeze({
    baseAlpha: 0.94,
    baseScale: 1,
    pulseAmount: 0.025,
    pulseSpeed: 5.2,
    driftAmount: 1,
    driftSpeed: 4.2,
    alphaFlicker: 0.04,
    transitionMs: 420,
    description: "Raw and recently placed emotional trace. Bright, sharp, but spatially restrained."
  }),

  settled: Object.freeze({
    baseAlpha: 0.64,
    baseScale: 0.92,
    pulseAmount: 0.018,
    pulseSpeed: 2.2,
    driftAmount: 2,
    driftSpeed: 0.85,
    alphaFlicker: 0.015,
    transitionMs: 720,
    description: "Settled emotional trace. Softer, slower, and visually calmer."
  }),

  transformed: Object.freeze({
    baseAlpha: 0.34,
    baseScale: 0.84,
    pulseAmount: 0,
    pulseSpeed: 0,
    driftAmount: 1,
    driftSpeed: 0.35,
    alphaFlicker: 0,
    transitionMs: 960,
    description: "Transformed emotional trace. Faint habitat material, nearly merged with the environment."
  })
});

export const MEMORY_SYMBOL_VISUALS = Object.freeze({
  white_ash: Object.freeze({
    tint: 0xe8e3d6,
    accentTint: 0xfff1c2,
    shadowTint: 0x9b9b94,
    pixelSize: 3
  }),

  blue_lantern: Object.freeze({
    tint: 0x74d6ff,
    accentTint: 0xe7f8ff,
    shadowTint: 0x2a6ea6,
    pixelSize: 3
  }),

  glitch_noise: Object.freeze({
    tint: 0x8deeff,
    accentTint: 0xffffff,
    shadowTint: 0x5876ff,
    pixelSize: 3
  }),

  faint_spark: Object.freeze({
    tint: 0xffd071,
    accentTint: 0xfff3b0,
    shadowTint: 0xd67b3c,
    pixelSize: 3
  }),

  star_iron_ore: Object.freeze({
    tint: 0xc54848,
    accentTint: 0xff9a6b,
    shadowTint: 0x5c2d39,
    pixelSize: 3
  }),

  golden_rune: Object.freeze({
    tint: 0xf6d56f,
    accentTint: 0xffffff,
    shadowTint: 0xb8842f,
    pixelSize: 3
  }),

  soft_ripple: Object.freeze({
    tint: 0x9ae7f0,
    accentTint: 0xffffff,
    shadowTint: 0x5daebc,
    pixelSize: 3
  }),

  fallback: Object.freeze({
    tint: 0xc8d2e8,
    accentTint: 0xffffff,
    shadowTint: 0x73809a,
    pixelSize: 3
  })
});

export function getStatusVisualContract(status) {
  return MEMORY_STATUS_VISUAL_CONTRACT[status] || MEMORY_STATUS_VISUAL_CONTRACT.fresh;
}

export function getSymbolVisual(symbol) {
  return MEMORY_SYMBOL_VISUALS[symbol] || MEMORY_SYMBOL_VISUALS.fallback;
}
