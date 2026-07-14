/**
 * 離線把洋紅底 props / platforms 轉成真透明 PNG。
 * 流程：邊緣 flood-fill → alpha 侵蝕清 fringe → despill → 輕微羽化
 *
 * 用法：node tools/preprocess-magenta-props.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("需要 sharp：請在 NexusLink 根目錄執行 npm install sharp");
  process.exit(1);
}

const KEY = { r: 255, g: 0, b: 255 };
const HARD_TOLERANCE = 64;
const EDGE_TOLERANCE = 145;
const DESPILL = 1.0;
const ERODE_PASSES = 1;

const TARGETS = [
  "assets/props/MoonlakeVivarium_v3/lantern_post.png",
  "assets/props/MoonlakeVivarium_v3/stone_arch.png",
  "assets/props/MoonlakeVivarium_v3/campfire.png",
  "assets/props/MoonlakeVivarium_v3/crystal_cluster.png",
  "assets/platforms/MoonlakeVivarium_v3/magic_circle.png"
];

function dist(r, g, b) {
  return Math.hypot(r - KEY.r, g - KEY.g, b - KEY.b);
}

function despill(r, g, b, strength) {
  const excess = Math.min(r, b) - g;
  if (excess <= 0) return [r, g, b];
  const pull = excess * strength;
  return [
    Math.max(0, Math.round(r - pull)),
    g,
    Math.max(0, Math.round(b - pull))
  ];
}

function chromaKeyRgba(data, width, height) {
  const out = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const o = i * 4;
    const r = out[o];
    const g = out[o + 1];
    const b = out[o + 2];
    const a = out[o + 3];
    const d = dist(r, g, b);

    if (a === 0 || d <= EDGE_TOLERANCE) {
      out[o] = 0;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = 0;
      const x = i % width;
      const y = (i / width) | 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx || dy) push(x + dx, y + dy);
        }
      }
    }
  }

  // 全圖硬切仍偏洋紅的像素（不依賴 flood，清殘留色塊）
  for (let o = 0; o < out.length; o += 4) {
    if (out[o + 3] === 0) continue;
    if (dist(out[o], out[o + 1], out[o + 2]) <= HARD_TOLERANCE) {
      out[o] = 0;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = 0;
    }
  }

  // 侵蝕：與透明相鄰的 fringe 像素直接砍掉（清紅邊最有效）
  for (let pass = 0; pass < ERODE_PASSES; pass += 1) {
    const kill = [];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = y * width + x;
        const o = i * 4;
        if (out[o + 3] === 0) continue;
        let touchesClear = false;
        for (let dy = -1; dy <= 1 && !touchesClear; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            if (out[((y + dy) * width + (x + dx)) * 4 + 3] === 0) {
              touchesClear = true;
              break;
            }
          }
        }
        if (!touchesClear) continue;
        const r = out[o];
        const g = out[o + 1];
        const b = out[o + 2];
        const spill = Math.min(r, b) - g;
        const d = dist(r, g, b);
        // 邊緣且帶洋紅 spill，或仍偏 key 色 → 刪
        if (spill > 8 || d < EDGE_TOLERANCE * 0.92) {
          kill.push(o);
        }
      }
    }
    for (const o of kill) {
      out[o] = 0;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = 0;
    }
  }

  // despill + 邊緣羽化
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4;
      if (out[o + 3] === 0) continue;

      let nearClear = false;
      for (let dy = -2; dy <= 2 && !nearClear; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (out[(ny * width + nx) * 4 + 3] === 0) {
            nearClear = true;
            break;
          }
        }
      }

      const r = out[o];
      const g = out[o + 1];
      const b = out[o + 2];
      const strength = nearClear ? DESPILL : DESPILL * 0.35;
      const [nr, ng, nb] = despill(r, g, b, strength);
      out[o] = nr;
      out[o + 1] = ng;
      out[o + 2] = nb;

      if (nearClear) {
        // 再砍一次殘留高 spill
        const spill = Math.min(nr, nb) - ng;
        if (spill > 18) {
          out[o + 3] = Math.round(out[o + 3] * 0.35);
        } else if (spill > 8) {
          out[o + 3] = Math.round(out[o + 3] * 0.7);
        }
      }
    }
  }

  return out;
}

async function processFile(relPath) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) {
    console.warn(`skip missing: ${relPath}`);
    return;
  }

  // 洋紅底備份放 output，避免污染 runtime assets/
  const backupDir = path.join(root, "output/linkara/moonlake/v4/source_backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backup = path.join(backupDir, path.basename(abs).replace(/\.png$/i, ".magenta-src.png"));
  // 若已有 magenta-src，從它重跑（避免對已透明圖再處理）
  const sourcePath = fs.existsSync(backup) ? backup : abs;
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(abs, backup);
  }

  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cleaned = chromaKeyRgba(data, info.width, info.height);
  await sharp(cleaned, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png()
    .toFile(abs);

  console.log(`ok ${relPath} (${info.width}x${info.height}) from ${path.basename(sourcePath)}`);
}

for (const target of TARGETS) {
  await processFile(target);
}

console.log("done — runtime 可直接載透明 PNG，不必再依 chroma。");
