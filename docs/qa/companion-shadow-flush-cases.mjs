/**
 * 影子貼齊腳底：不依賴瀏覽器 canvas，只驗 sync 把 Graphics 移到錨點。
 */
import assert from "node:assert/strict";

class FakeGraphics {
  constructor() {
    this.name = "";
    this.x = 0;
    this.y = 0;
    this.visible = true;
    this.destroyed = false;
    this._ops = [];
  }
  ellipse(x, y, rx, ry) {
    this._ops.push(["ellipse", x, y, rx, ry]);
    return this;
  }
  fill(style) {
    this._ops.push(["fill", style]);
    return this;
  }
}

class FakeSprite {
  constructor() {
    this.texture = { frame: { width: 10, height: 10 }, source: { resource: null } };
    this.x = 0;
    this.y = 0;
    this.scale = { x: 1, y: 1 };
    this.pivot = { x: 0, y: 0 };
    this.rotation = 0;
    this.anchor = { x: 0.5, y: 1 };
  }
}

globalThis.PIXI = {
  Graphics: FakeGraphics,
  Sprite: FakeSprite
};

const {
  attachCompanionGroundShadow,
  syncCompanionGroundShadow,
  invalidateCompanionFootCache
} = await import("../../src/pixi/companionFootAndShadow.js");

const checks = [];

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}

// --- Case 1：opaque-foot cache 在負 Y（透明 padding）時，影子必須跟上 ---
{
  const companion = {
    children: [],
    addChildAt(child, index) {
      this.children.splice(index, 0, child);
      return child;
    },
    getLocalBounds() {
      return { x: -40, y: -120, width: 80, height: 120 };
    }
  };
  const sprite = new FakeSprite();
  attachCompanionGroundShadow(companion, { radiusX: 20, radiusY: 6, alpha: 0.3 });
  companion.children.push(sprite);
  companion.__opaqueFoot = { x: 3, y: -28 };
  const foot = syncCompanionGroundShadow(companion);
  check("shadow follows opaque-foot y", companion.__groundShadow.y === -28);
  check("shadow follows opaque-foot x", companion.__groundShadow.x === 3);
  check("shadowFoot frozen matches", foot?.x === 3 && foot?.y === -28);
  check("ellipse drawn at local origin (flush)", companion.__groundShadow._ops.some(
    (op) => op[0] === "ellipse" && op[1] === 0 && op[2] === 0
  ));
}

// --- Case 2：無貼圖 placeholder → 用內容底緣 ---
{
  const companion = {
    children: [],
    addChildAt(child, index) {
      this.children.splice(index, 0, child);
      return child;
    },
    getLocalBounds() {
      // 影子隱藏後才被呼叫；底緣 y=42
      return { x: -42, y: -104, width: 84, height: 146 };
    }
  };
  attachCompanionGroundShadow(companion);
  const foot = syncCompanionGroundShadow(companion);
  check("placeholder shadow at content bottom", foot?.y === 42);
  check("placeholder shadow centered", foot?.x === 0);
}

// --- Case 3：resync 會清 cache ---
{
  const companion = {
    children: [],
    addChildAt(child, index) {
      this.children.splice(index, 0, child);
      return child;
    },
    getLocalBounds() {
      return { x: -10, y: -20, width: 20, height: 20 };
    }
  };
  attachCompanionGroundShadow(companion);
  companion.__opaqueFoot = { x: 9, y: -9 };
  companion.__resyncGroundShadow();
  check("resync clears opaque cache", companion.__opaqueFoot === undefined);
}

invalidateCompanionFootCache(null);
check("invalidate tolerates null", true);

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
if (failed.length) {
  process.exitCode = 1;
}
assert.equal(failed.length, 0);
