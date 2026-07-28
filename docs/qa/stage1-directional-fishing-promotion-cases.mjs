import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import {
  GREYSHADE_CAT_ANIMATION_PROFILE,
  GUARDIAN_ANIMATION_PROFILE,
  getAmbientWalkAnimation,
  resolveAnimationIntent
} from "../../src/engine/animationProfile.js";
import { ANIMATION_NAMES } from "../../src/engine/interactionController.js";
import {
  createCompanionMotion,
  updateCompanionMotion
} from "../../src/pixi/motionController.js";

const ROOT = process.cwd();
const COMPANION_IDS = Object.freeze([
  "greyshade-cat",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm"
]);
const FORMAL_DIRECTIONAL_PROMOTION_IDS = new Set(COMPANION_IDS.slice(6));
const FISHING_ACTIONS = Object.freeze([
  "fishing_side",
  "fishing_front",
  "fishing_back"
]);
const DIRECTIONAL_ACTIONS = Object.freeze([
  "left_walk",
  "right_walk",
  "front_walk",
  "back_walk"
]);

function localPath(webPath) {
  return path.join(ROOT, ...webPath.replace(/^\.\//, "").split("/"));
}

function readPngRgba(filePath) {
  const png = fs.readFileSync(filePath);
  assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a", `${filePath}: PNG signature`);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const bitDepth = png[24];
  const colorType = png[25];
  assert.equal(bitDepth, 8, `${filePath}: must be 8-bit PNG`);
  assert.equal(colorType, 6, `${filePath}: must be RGBA PNG`);

  const idat = [];
  let offset = 8;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT") idat.push(png.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const encoded = zlib.inflateSync(Buffer.concat(idat));
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const rgba = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = encoded[sourceOffset];
    sourceOffset += 1;
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = encoded[sourceOffset + x];
      const left = x >= bytesPerPixel ? rgba[rowOffset + x - bytesPerPixel] : 0;
      const up = y > 0 ? rgba[rowOffset - stride + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel
        ? rgba[rowOffset - stride + x - bytesPerPixel]
        : 0;
      let value;
      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upLeft);
      else throw new Error(`${filePath}: unsupported PNG filter ${filter}`);
      rgba[rowOffset + x] = value & 0xff;
    }
    sourceOffset += stride;
  }
  return { width, height, rgba };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function inspectFrames(filePath) {
  const { width, height, rgba } = readPngRgba(filePath);
  assert.equal(width, 2048, `${filePath}: exact sheet width`);
  assert.equal(height, 1024, `${filePath}: exact sheet height`);
  const bounds = [];
  for (let frameIndex = 0; frameIndex < 8; frameIndex += 1) {
    const frameX = (frameIndex % 4) * 512;
    const frameY = Math.floor(frameIndex / 4) * 512;
    let minX = 512;
    let minY = 512;
    let maxX = -1;
    let maxY = -1;
    let opaque = 0;
    let transparent = 0;
    const xCounts = new Uint32Array(512);
    for (let y = 0; y < 512; y += 1) {
      for (let x = 0; x < 512; x += 1) {
        const alpha = rgba[((frameY + y) * width + frameX + x) * 4 + 3];
        if (alpha > 32) {
          opaque += 1;
          xCounts[x] += 1;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        } else {
          transparent += 1;
        }
      }
    }
    assert.ok(opaque > 1_000, `${filePath}: frame ${frameIndex} is visibly populated`);
    assert.ok(transparent > 1_000, `${filePath}: frame ${frameIndex} preserves transparency`);
    assert.ok(minX >= 8 && maxX <= 503, `${filePath}: frame ${frameIndex} horizontal safety margin`);
    assert.ok(minY >= 8 && maxY <= 503, `${filePath}: frame ${frameIndex} vertical safety margin`);
    const robustMinX = findColumnQuantile(xCounts, opaque * 0.1);
    const robustMaxX = findColumnQuantile(xCounts, opaque * 0.9);
    const centerX = (robustMinX + robustMaxX) / 2;
    assert.ok(centerX >= 190 && centerX <= 322, `${filePath}: frame ${frameIndex} stays centered`);
    assert.ok(maxY >= 430 && maxY <= 490, `${filePath}: frame ${frameIndex} foot datum`);
    bounds.push({ centerX, maxY });
  }
  assert.ok(
    Math.max(...bounds.map((entry) => entry.maxY))
      - Math.min(...bounds.map((entry) => entry.maxY)) <= 10,
    `${filePath}: foot datum drift (${bounds.map((entry) => entry.maxY).join(",")})`
  );
}

function findColumnQuantile(counts, target) {
  let total = 0;
  for (let x = 0; x < counts.length; x += 1) {
    total += counts[x];
    if (total >= target) return x;
  }
  return counts.length - 1;
}

const promotedSheets = new Set();
for (const companionId of COMPANION_IDS) {
  const manifestPath = path.join(
    ROOT,
    "assets",
    "characters",
    companionId,
    "metadata",
    "animations.json"
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const action of [...DIRECTIONAL_ACTIONS, ...FISHING_ACTIONS]) {
    const definition = manifest[action];
    assert.ok(definition, `${companionId}: ${action} metadata exists`);
    assert.equal(definition.frameWidth, 512, `${companionId}/${action}: frame width`);
    assert.equal(definition.frameHeight, 512, `${companionId}/${action}: frame height`);
    assert.equal(definition.frameCount, 8, `${companionId}/${action}: frame count`);
    assert.equal(definition.rows, 2, `${companionId}/${action}: rows`);
    assert.equal(definition.columns, 4, `${companionId}/${action}: columns`);
    assert.deepEqual(definition.anchor, { x: 0.5, y: 1 }, `${companionId}/${action}: anchor`);
    assert.equal(definition.loop, true, `${companionId}/${action}: loop`);
    assert.ok(
      definition.sheet.startsWith(`./assets/characters/${companionId}/`),
      `${companionId}/${action}: no cross-character fallback`
    );
    assert.ok(fs.existsSync(localPath(definition.sheet)), `${companionId}/${action}: sheet exists`);
    if (
      FISHING_ACTIONS.includes(action)
      || FORMAL_DIRECTIONAL_PROMOTION_IDS.has(companionId)
        && (action === "front_walk" || action === "back_walk")
    ) {
      promotedSheets.add(localPath(definition.sheet));
    }
  }
}

assert.equal(promotedSheets.size, 68, "20 directional + 48 fishing sheets promoted");
for (const filePath of promotedSheets) inspectFrames(filePath);

for (const fishingAction of FISHING_ACTIONS) {
  assert.ok(ANIMATION_NAMES.includes(fishingAction), `${fishingAction}: registered runtime action`);
}
assert.equal(GUARDIAN_ANIMATION_PROFILE.ambientWalkEnabled, true, "15 guardian-profile companions can roam");

const allAnimations = () => true;
assert.deepEqual(
  getAmbientWalkAnimation(-40, 2, allAnimations, GUARDIAN_ANIMATION_PROFILE),
  { animationName: "left_walk", mirrorX: false },
  "left travel uses left walk"
);
assert.deepEqual(
  getAmbientWalkAnimation(40, -2, allAnimations, GUARDIAN_ANIMATION_PROFILE),
  { animationName: "right_walk", mirrorX: false },
  "right travel uses right walk"
);
assert.deepEqual(
  getAmbientWalkAnimation(10, 10, allAnimations, GUARDIAN_ANIMATION_PROFILE),
  { animationName: "front_walk", mirrorX: false },
  "down-screen travel uses front walk"
);
assert.deepEqual(
  getAmbientWalkAnimation(-10, -10, allAnimations, GUARDIAN_ANIMATION_PROFILE),
  { animationName: "back_walk", mirrorX: false },
  "up-screen travel uses back walk"
);

for (const view of ["side", "front", "back"]) {
  assert.equal(
    resolveAnimationIntent(`habitat.fishing.${view}`, allAnimations),
    `fishing_${view}`,
    `fishing ${view} intent resolves`
  );
}

const played = [];
const companion = {
  x: 100,
  y: 100,
  alpha: 1,
  rotation: 0,
  scale: {
    x: 1,
    set(value) {
      this.x = value;
    }
  },
  __animationProfile: GREYSHADE_CAT_ANIMATION_PROFILE,
  __animationController: {
    canResolve: allAnimations,
    hasAnimation: allAnimations,
    play(name) {
      played.push(name);
      return true;
    },
    loadAnimation: async () => null,
    getAnimationDurationMs: () => 1_000
  },
  __interactionController: {
    isAnimationLocked: () => false
  }
};
const motion = createCompanionMotion(companion, "calm");
motion.ambientNextAt = Number.POSITIVE_INFINITY;
motion.ambientActionNextAt = 0;
Object.assign(motion.moonlakeRoaming, {
  currentId: "far_bank_center",
  targetId: null,
  x: 0.75,
  y: 0.1,
  z: -12.55,
  dwellUntil: Number.POSITIVE_INFINITY
});
updateCompanionMotion(companion, motion, 1, 1_000, "calm", () => {}, {
  activeHabitatId: "moonlake",
  ambientActions: ["fishing_back"],
  deltaMs: 16,
  projectWorldPoint: ({ x, z }) => ({ x, y: z, scale: 1, depth: 0 })
});
assert.equal(motion.ambientActionState, "fishing_back", "Moonlake action candidate starts bounded fishing");
assert.equal(played.at(-1), "fishing_back", "Moonlake action candidate plays fishing sheet");

console.log(`stage1-directional-fishing-promotion: PASS (${promotedSheets.size} promoted sheets, ${COMPANION_IDS.length} companions)`);
