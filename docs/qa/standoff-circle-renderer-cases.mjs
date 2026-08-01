import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const checks = [];
const windowListeners = new Map();
const animationFrames = new Map();
const resizeObservers = new Set();
const assetLoads = [];
let nextFrameId = 1;
let slowFetchRelease = null;

class MockPoint {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y = x) {
    this.x = x;
    this.y = y;
  }
}

class MockDisplayObject {
  constructor() {
    this.parent = null;
    this.destroyed = false;
    this.x = 0;
    this.y = 0;
    this.alpha = 1;
    this.visible = true;
    this.zIndex = 0;
    this.scale = new MockPoint(1, 1);
    this.pivot = new MockPoint(0, 0);
    this.rotation = 0;
  }

  destroy() {
    this.parent?.removeChild?.(this);
    this.destroyed = true;
  }
}

class MockContainer extends MockDisplayObject {
  constructor() {
    super();
    this.children = [];
    this.sortableChildren = false;
  }

  addChild(...children) {
    for (const child of children) {
      child.parent?.removeChild?.(child);
      child.parent = this;
      this.children.push(child);
    }
    return children.at(-1);
  }

  addChildAt(child, index) {
    child.parent?.removeChild?.(child);
    child.parent = this;
    this.children.splice(index, 0, child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    if (child?.parent === this) child.parent = null;
    return child;
  }

  sortChildren() {
    this.children.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }

  getLocalBounds() {
    return { x: -70, y: -150, width: 140, height: 150 };
  }

  destroy(options = {}) {
    if (this.destroyed) return;
    if (options?.children) {
      for (const child of [...this.children]) child.destroy?.({ children: true });
    }
    this.children.length = 0;
    super.destroy();
  }
}

class MockSprite extends MockContainer {
  constructor(texture) {
    super();
    this.texture = texture;
    this.width = texture?.width || texture?.frame?.width || 512;
    this.height = texture?.height || texture?.frame?.height || 512;
    this.anchor = new MockPoint(0, 0);
    this.roundPixels = false;
  }
}

class MockAnimatedSprite extends MockSprite {
  constructor(textures = []) {
    super(textures[0]);
    this.textures = textures;
    this.loop = true;
    this.playing = false;
    this.currentFrame = 0;
    this.animationSpeed = 0;
    this.onComplete = null;
  }

  play() {
    this.playing = true;
  }

  gotoAndPlay(frame) {
    this.currentFrame = frame;
    this.playing = true;
  }

  gotoAndStop(frame) {
    this.currentFrame = frame;
    this.playing = false;
  }
}

class MockGraphics extends MockContainer {
  ellipse() { return this; }
  circle() { return this; }
  roundRect() { return this; }
  moveTo() { return this; }
  lineTo() { return this; }
  quadraticCurveTo() { return this; }
  closePath() { return this; }
  fill() { return this; }
  stroke() { return this; }
}

class MockText extends MockContainer {
  constructor(options, legacyStyle) {
    super();
    this.text = typeof options === "object" ? options.text : options;
    this.style = typeof options === "object" ? options.style : legacyStyle;
    this.anchor = new MockPoint(0, 0);
  }
}

class MockRectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class MockTexture {
  constructor({ source, frame }) {
    this.source = source;
    this.frame = frame;
    this.width = frame.width;
    this.height = frame.height;
    this.scaleMode = "";
  }
}

class MockApplication {
  constructor() {
    this.stage = new MockContainer();
    this.screen = { width: 0, height: 0 };
    this.canvas = createCanvas();
    this.renderer = {
      resize: (width, height) => {
        this.screen.width = width;
        this.screen.height = height;
      }
    };
    this.destroyed = false;
  }

  async init(options) {
    this.screen.width = options.width;
    this.screen.height = options.height;
  }

  destroy(_removeView, options = {}) {
    if (this.destroyed) return;
    this.stage.destroy({ children: Boolean(options?.children) });
    this.canvas.remove();
    this.destroyed = true;
  }
}

class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.target = null;
    resizeObservers.add(this);
  }

  observe(target) {
    this.target = target;
  }

  disconnect() {
    this.target = null;
    resizeObservers.delete(this);
  }
}

const mockWindow = {
  devicePixelRatio: 3,
  ResizeObserver: MockResizeObserver,
  addEventListener(type, listener) {
    if (!windowListeners.has(type)) windowListeners.set(type, new Set());
    windowListeners.get(type).add(listener);
  },
  removeEventListener(type, listener) {
    windowListeners.get(type)?.delete(listener);
  },
  requestAnimationFrame(callback) {
    const id = nextFrameId++;
    animationFrames.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id) {
    animationFrames.delete(id);
  },
  getComputedStyle(target) {
    return { position: target.style.position || "static" };
  },
  matchMedia() {
    return { matches: false };
  }
};

globalThis.window = mockWindow;
globalThis.ResizeObserver = MockResizeObserver;
globalThis.PIXI = mockWindow.PIXI = {
  Application: MockApplication,
  Container: MockContainer,
  Sprite: MockSprite,
  AnimatedSprite: MockAnimatedSprite,
  Graphics: MockGraphics,
  Text: MockText,
  Texture: MockTexture,
  Rectangle: MockRectangle,
  Assets: {
    async load(path) {
      assetLoads.push(path);
      if (path.includes("portrait-fail")) throw new Error("portrait missing");
      if (path.includes("portrait")) return createTexture(512, 512);
      return createTexture(1024, 1024);
    }
  },
  SCALE_MODES: { LINEAR: "linear" },
  MIPMAP_MODES: { ON: "on" }
};

globalThis.fetch = async (path) => {
  if (path === "/slow.json") {
    await new Promise((resolve) => {
      slowFetchRelease = resolve;
    });
  }
  return {
    ok: true,
    async json() {
      return createAnimationMetadata(String(path).replace(/[^a-z]/gi, ""));
    }
  };
};

const { createStandoffCircleRenderer } = await import(
  "../../src/pixi/standoffCircleRenderer.js"
);

const host = createHost(390, 300);
const lead = createMember("lead-cat", "lead", "/lead.json", "/lead-portrait.png");
const supportA = createMember("support-owl", "support", "/owl.json", "/owl-portrait.png", {
  breath: 3
});
const supportB = createMember("support-deer", "support", null, "/deer-portrait.png", {
  breath: 2
});
const renderer = createStandoffCircleRenderer({
  host,
  sessionKey: "session-r2",
  members: [supportA, lead, supportB], // Explicit lead may arrive out of order.
  reducedMotion: true
});

check("renderer ready resolves true", await renderer.ready === true);
let diagnostics = renderer.getDiagnostics();
check("renderer mounts one transparent canvas", host.children.length === 1
  && host.children[0].attributes["data-standoff-circle-canvas"] === "true"
  && host.children[0].attributes["aria-hidden"] === "true"
  && host.children[0].style.pointerEvents === "none");
check("renderer shows one lead and two supports", diagnostics.memberCount === 3
  && diagnostics.members[0].role === "lead"
  && diagnostics.members.filter((member) => member.role === "support").length === 2);
check("lead is central/front and supports are behind", diagnostics.members[0].x === 195
  && diagnostics.members[0].y > diagnostics.members[1].y
  && diagnostics.members[1].x < diagnostics.members[0].x
  && diagnostics.members[2].x > diagnostics.members[0].x);
check("animated members load only idle at first paint", assetLoads.filter((path) => path.includes("idle_calm")).length === 2
  && !assetLoads.some((path) => /skill_cast|defend|attack_basic|sleep/.test(path)));
check("static fallback stays on the same companion portrait", diagnostics.members.find(
  (member) => member.companionId === "support-deer"
)?.source === "portrait" && assetLoads.includes("/deer-portrait.png"));
check("renderer owns one resize listener and observer", diagnostics.resizeListenerCount === 1
  && diagnostics.resizeObserverCount === 1
  && listenerCount("resize") === 1
  && resizeObservers.size === 1);

check("wrong session intent is ignored", await renderer.consumeIntent({
  sessionKey: "another-session",
  beatIndex: 1,
  companionId: "lead-cat",
  role: "lead",
  intent: "standoff.barrier"
}) === false);
check("wrong member role is ignored", await renderer.consumeIntent({
  sessionKey: "session-r2",
  beatIndex: 1,
  companionId: "lead-cat",
  role: "support",
  intent: "standoff.barrier"
}) === false);
check("non-standoff intent is ignored", await renderer.consumeIntent({
  sessionKey: "session-r2",
  beatIndex: 1,
  companionId: "lead-cat",
  role: "lead",
  intent: "battle.attack"
}) === false);
check("matching dedicated intent is consumed", await renderer.consumeIntent({
  sessionKey: "session-r2",
  beatIndex: 1,
  companionId: "lead-cat",
  role: "lead",
  intent: "standoff.barrier",
  reasonId: "surge_without_boundary"
}) === true);
diagnostics = renderer.getDiagnostics();
const leadDiagnostic = diagnostics.members.find((member) => member.companionId === "lead-cat");
check("intent lazy-loads only the requested animation", leadDiagnostic.animationName === "defend"
  && assetLoads.some((path) => path.includes("defend"))
  && !assetLoads.some((path) => path.includes("skill_cast")));
check("reduced motion preserves pose and reason without playback", leadDiagnostic.playbackState?.currentFrame === 0
  && leadDiagnostic.playbackState?.playing === false
  && leadDiagnostic.intentLabel === "牠先把界線立穩");
check("duplicate or older beat is ignored", await renderer.consumeIntent({
  sessionKey: "session-r2",
  beatIndex: 1,
  companionId: "lead-cat",
  role: "lead",
  intent: "standoff.resonance"
}) === false);

check("session circle update preserves the existing lead", await renderer.updateMembers([
  {
    id: "support-owl",
    name: "Support Owl",
    breath: 0,
    resting: true,
    intentLabel: "牠決定先在圈邊喘息"
  }
]) === true);
diagnostics = renderer.getDiagnostics();
check("circle snapshot updates breath and resting presentation", diagnostics.memberCount === 2
  && diagnostics.members[0].companionId === "lead-cat"
  && diagnostics.members[1].companionId === "support-owl"
  && diagnostics.members[1].resting === true
  && diagnostics.members[1].breathLabel.includes("○○○")
  && diagnostics.members[1].intentLabel === "牠決定先在圈邊喘息");

check("unknown companion falls back to its own neutral silhouette", await renderer.updateMembers([
  {
    id: "support-owl",
    name: "Support Owl",
    breath: 2
  },
  {
    id: "unknown-witness",
    name: "Unknown Witness",
    image: "/portrait-fail.png",
    breath: 1,
    placeholder: { bodyColor: 0x112233, accentColor: 0xabcdef }
  }
]) === true);
diagnostics = renderer.getDiagnostics();
check("unknown fallback never borrows another character asset", diagnostics.members.find(
  (member) => member.companionId === "unknown-witness"
)?.source === "silhouette" && !assetLoads.includes("./assets/characters/greyshade-cat/portrait/greyshade-cat_portrait_512x512.png"));

const oldLeadX = diagnostics.members[0].x;
host.width = 480;
host.height = 360;
emitWindow("resize");
flushAnimationFrames();
diagnostics = renderer.getDiagnostics();
check("resize relayouts the stage without adding listeners", diagnostics.members[0].x !== oldLeadX
  && listenerCount("resize") === 1
  && resizeObservers.size === 1);

host.width = 390;
host.height = 132;
emitWindow("resize");
flushAnimationFrames();
diagnostics = renderer.getDiagnostics();
check("short mobile stage keeps intent and breath cues inside the canvas", diagnostics.members.every(
  (member) => member.intentY >= 8 && member.breathY <= 120
));

renderer.destroy();
renderer.destroy();
diagnostics = renderer.getDiagnostics();
check("destroy is idempotent and clears canvas/nodes", diagnostics.destroyed === true
  && diagnostics.memberCount === 0
  && diagnostics.canvasAttached === false
  && host.children.length === 0);
check("destroy clears resize listener observer and frame", listenerCount("resize") === 0
  && resizeObservers.size === 0
  && animationFrames.size === 0
  && diagnostics.resizeListenerCount === 0
  && diagnostics.resizeObserverCount === 0);
check("destroy restores host positioning", host.style.position === "");
check("destroyed renderer rejects later updates and intents", await renderer.updateMembers([]) === false
  && await renderer.consumeIntent({
    sessionKey: "session-r2",
    beatIndex: 2,
    companionId: "lead-cat",
    role: "lead",
    intent: "standoff.barrier"
  }) === false);

const slowHost = createHost(390, 300);
const slowRenderer = createStandoffCircleRenderer({
  host: slowHost,
  sessionKey: "slow-session",
  members: [createMember("slow-cat", "lead", "/slow.json", "/slow-portrait.png")]
});
await waitFor(() => slowFetchRelease !== null);
slowRenderer.destroy();
slowFetchRelease();
check("destroy during async member load resolves safely", await slowRenderer.ready === false);
check("async teardown leaves no late canvas/listener/node", slowHost.children.length === 0
  && slowRenderer.getDiagnostics().memberCount === 0
  && listenerCount("resize") === 0
  && resizeObservers.size === 0);

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const rendererSource = readFileSync(`${repoRoot}/src/pixi/standoffCircleRenderer.js`, "utf8");
const loaderSource = readFileSync(`${repoRoot}/src/pixi/spriteSheetAnimationLoader.js`, "utf8");
check("renderer has no state AI or Growth authority imports", !/from\s+["'][^"']*(?:state|saveManager|companionGrowth|raphael|nuwa)/i.test(rendererSource));
check("focused animation loader supports allowlist without warmup", loaderSource.includes("animationNames = null")
  && loaderSource.includes("bootOnly && warmup")
  && rendererSource.includes("animationNames: [\"idle_calm\"]")
  && rendererSource.includes("warmup: false"));

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;

function createMember(id, role, animationsManifest, image, extra = {}) {
  return {
    id,
    companionId: id,
    role,
    name: id,
    breath: extra.breath,
    creature: {
      id,
      name: id,
      animationsManifest,
      image,
      defaultMood: "calm",
      renderScale: 1,
      placeholder: { bodyColor: 0x565069, accentColor: 0xc8b9ee }
    },
    ...extra
  };
}

function createAnimationMetadata(prefix) {
  const definition = (name, loop = false) => ({
    id: name,
    category: "qa",
    sheet: `/${prefix}_${name}.png`,
    frameWidth: 512,
    frameHeight: 512,
    frameCount: 4,
    rows: 2,
    columns: 2,
    fps: 4,
    loop,
    anchor: { x: 0.5, y: 1 }
  });
  return {
    idle_calm: definition("idle_calm", true),
    idle_defensive: definition("idle_defensive", true),
    idle_happy: definition("idle_happy", true),
    idle_sad: definition("idle_sad", true),
    idle_distant: definition("idle_distant", true),
    sleep: definition("sleep", true),
    skill_cast: definition("skill_cast"),
    defend: definition("defend"),
    attack_basic: definition("attack_basic"),
    back_walk: definition("back_walk"),
    defeated: definition("defeated"),
    victory: definition("victory")
  };
}

function createTexture(width, height) {
  return {
    width,
    height,
    scaleMode: "",
    source: {
      resource: null,
      scaleMode: "",
      mipmap: "",
      autoGenerateMipmaps: false
    }
  };
}

function createCanvas() {
  const canvas = {
    style: {},
    attributes: {},
    parentNode: null,
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    remove() {
      this.parentNode?.removeChild?.(this);
    }
  };
  return canvas;
}

function createHost(width, height) {
  const host = {
    width,
    height,
    style: { position: "" },
    children: [],
    ownerDocument: { defaultView: mockWindow },
    get clientWidth() { return this.width; },
    get clientHeight() { return this.height; },
    getBoundingClientRect() {
      return { width: this.width, height: this.height };
    },
    appendChild(child) {
      child.parentNode?.removeChild?.(child);
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) this.children.splice(index, 1);
      if (child.parentNode === this) child.parentNode = null;
      return child;
    }
  };
  return host;
}

function listenerCount(type) {
  return windowListeners.get(type)?.size || 0;
}

function emitWindow(type) {
  for (const listener of [...(windowListeners.get(type) || [])]) listener();
}

function flushAnimationFrames() {
  const pending = [...animationFrames.values()];
  animationFrames.clear();
  for (const callback of pending) callback();
}

async function waitFor(predicate, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) return true;
    await Promise.resolve();
  }
  return false;
}

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}
