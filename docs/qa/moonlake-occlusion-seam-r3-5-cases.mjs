import assert from "node:assert/strict";

import {
  getMoonlakeOccluderColorMatrix,
  measureOpaquePixelBounds,
  shouldMoonlakeOccluderCover
} from "../../src/pixi/moonlakeDepthOcclusion.js";

const pixels = new Uint8ClampedArray(4 * 3 * 4);
const setAlpha = (x, y, alpha) => {
  pixels[(y * 4 + x) * 4 + 3] = alpha;
};
setAlpha(1, 0, 15);
setAlpha(2, 1, 16);
setAlpha(3, 2, 255);

assert.deepEqual(
  measureOpaquePixelBounds(pixels, 4, 3),
  {
    left: 2,
    top: 1,
    right: 4,
    bottom: 3,
    width: 2,
    height: 2
  },
  "transparent sprite padding is excluded from Moonlake depth bounds"
);
assert.equal(
  measureOpaquePixelBounds(new Uint8ClampedArray(16), 2, 2),
  null,
  "a fully transparent frame has no opaque occlusion bounds"
);
assert.equal(
  measureOpaquePixelBounds(new Uint8ClampedArray(3), 2, 2),
  null,
  "invalid pixel input fails closed"
);

const day = getMoonlakeOccluderColorMatrix(0);
assert.deepEqual(
  day,
  [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0
  ],
  "day occluders preserve the exact master-art pixels"
);

const night = getMoonlakeOccluderColorMatrix(1);
assert.ok(Math.abs(night[0] - 0.34 * 0.78) < 1e-12);
assert.ok(Math.abs(night[6] - 0.46 * 0.78) < 1e-12);
assert.ok(Math.abs(night[12] - 0.68 * 0.78) < 1e-12);
assert.equal(night[4], 0.006);
assert.equal(night[9], 0.014);
assert.equal(night[14], 0.045);

const dusk = getMoonlakeOccluderColorMatrix(0.5);
assert.ok(Math.abs(dusk[0] - (1 + 0.34 * 0.78) / 2) < 1e-12);
assert.equal(dusk[4], 0.003);
assert.equal(dusk[9], 0.007);
assert.equal(dusk[14], 0.0225);

const lamp = {
  projectedRect: { left: 100, top: 100, right: 160, bottom: 220 },
  projectedBaselineY: 215,
  foot: { x: 190, y: 205 }
};
assert.equal(
  shouldMoonlakeOccluderCover({
    ...lamp,
    companionBounds: { left: 120, top: 120, right: 230, bottom: 220 }
  }),
  true,
  "legacy full-frame bounds reproduce the false lamp activation"
);
assert.equal(
  shouldMoonlakeOccluderCover({
    ...lamp,
    companionBounds: { left: 170, top: 120, right: 225, bottom: 220 }
  }),
  false,
  "opaque-frame bounds prevent a lamp from covering transparent sprite padding"
);
assert.equal(
  shouldMoonlakeOccluderCover({
    ...lamp,
    companionBounds: { left: 145, top: 120, right: 225, bottom: 220 }
  }),
  true,
  "a genuine opaque silhouette overlap still receives RO-style occlusion"
);

console.log(JSON.stringify({
  pass: true,
  package: "TP-MOONLAKE-OCCLUSION-SEAM-R3.5",
  opaqueBounds: true,
  exactDayPixels: true,
  shaderMatchedNightBase: true,
  transparentPaddingRejected: true,
  genuineOverlapPreserved: true
}, null, 2));
