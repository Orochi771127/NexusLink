import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const resizeListeners = new Set();
const frames = new Map();
let nextFrameId = 1;

globalThis.window = {
  addEventListener(type, listener) {
    if (type === "resize") resizeListeners.add(listener);
  },
  removeEventListener(type, listener) {
    if (type === "resize") resizeListeners.delete(listener);
  },
  requestAnimationFrame(callback) {
    const id = nextFrameId++;
    frames.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id) {
    frames.delete(id);
  }
};

const { positionCompanion } = await import("../../src/pixi/companionRenderer.js");
const checks = [];
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const appSource = readFileSync(`${repoRoot}/src/app.js`, "utf8");
const app = { screen: { width: 390, height: 844 } };
const retired = [];
let active = null;
let activeCleanup = null;

for (let index = 0; index < 20; index += 1) {
  activeCleanup?.();
  if (active) retired.push(active);
  active = createCompanion(index);
  activeCleanup = positionCompanion(active, app);
  check(`swap ${index + 1} keeps one resize listener`, resizeListeners.size === 1);
}

const duplicateCleanup = positionCompanion(active, app);
check("repositioning the active companion reuses cleanup", duplicateCleanup === activeCleanup);
check("repositioning does not add a listener", resizeListeners.size === 1);

const retiredCounts = retired.map((item) => item.layoutCount);
const activeCountBefore = active.layoutCount;
for (const listener of [...resizeListeners]) listener();
flushAnimationFrames();
check("only the active companion is repositioned", active.layoutCount === activeCountBefore + 1);
check(
  "retired companions stay untouched after resize",
  retired.every((item, index) => item.layoutCount === retiredCounts[index])
);

activeCleanup();
check("cleanup removes the final resize listener", resizeListeners.size === 0);
check("cleanup cancels pending animation frames", frames.size === 0);

const swapStart = appSource.indexOf("async function swapCompanion");
const swapEnd = appSource.indexOf("async function switchHabitat", swapStart);
const swapBody = appSource.slice(swapStart, swapEnd);
check(
  "async companion swap has a latest-request generation guard",
  swapBody.includes("const swapVersion = ++companionSwapVersion")
    && swapBody.indexOf("swapVersion !== companionSwapVersion") < swapBody.indexOf("attachCompanion")
);
check(
  "stale async companion nodes are destroyed before attach",
  swapBody.indexOf("nextCompanion.destroy") >= 0
    && swapBody.indexOf("nextCompanion.destroy") < swapBody.indexOf("attachCompanion")
);
check(
  "tap binding captures its own interaction controller",
  appSource.includes("nodeInteractionController.handleTouch(touchType)")
);

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;

function createCompanion(id) {
  const companion = {
    id,
    destroyed: false,
    children: [],
    x: 0,
    y: 0,
    roundPixels: false,
    layoutCount: 0,
    scale: {
      x: 1,
      y: 1,
      set(x, y = x) {
        this.x = x;
        this.y = y;
        companion.layoutCount += 1;
      }
    }
  };
  return companion;
}

function flushAnimationFrames() {
  const pending = [...frames.entries()];
  frames.clear();
  for (const [, callback] of pending) callback();
}

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}
