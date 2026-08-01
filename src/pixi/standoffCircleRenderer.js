import { getCompanionById, isKnownCompanionId } from "../data/companionRegistry.js";
import { resolveAnimationIntent } from "../engine/animationProfile.js";
import {
  createAnimatedCompanionNode,
  loadCompanionAnimationPack
} from "./spriteSheetAnimationLoader.js";

const MAX_VISIBLE_MEMBERS = 3;
const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 300;
const DEFAULT_MEMBER_BREATH = 3;
const STANDOFF_INTENTS = new Set([
  "standoff.resonance",
  "standoff.barrier",
  "standoff.pulse",
  "standoff.overwhelmed",
  "standoff.stabilized",
  "standoff.recovered",
  "standoff.retreat"
]);

const INTENT_LABELS = Object.freeze({
  "standoff.resonance": "牠正聽清這道回聲",
  "standoff.barrier": "牠先把界線立穩",
  "standoff.pulse": "牠把這一拍放輕",
  "standoff.overwhelmed": "牠退到安全的位置喘息",
  "standoff.stabilized": "牠陪著雜訊慢慢沉下來",
  "standoff.recovered": "牠接住了散落的回聲",
  "standoff.retreat": "牠選擇先退到圈外"
});

const REASON_LABELS = Object.freeze({
  surge_without_boundary: "牠先把界線立穩",
  low_stability: "牠察覺彼此需要先站穩",
  fatigue_near_limit: "牠放慢了這一拍",
  gather_invites_resonance: "牠正聽清這道回聲",
  safe_lull_for_pulse: "牠把這一拍放輕",
  request_accepted: "牠聽見請託，決定一起試試",
  request_rewritten: "牠用自己的方式接住請託",
  request_resting: "牠現在需要在圈邊休息",
  request_declined: "牠搖搖頭，仍留在安全距離"
});

/**
 * A session-only Pixi surface for one lead companion and up to two supports.
 *
 * This renderer is deliberately presentation-only: callers provide the circle
 * snapshot and dedicated animation intents. It never imports or writes the
 * store, save state, Growth evidence, settlement, RaphaelCore or Nuwa.
 */
export function createStandoffCircleRenderer({
  host,
  sessionKey,
  members = [],
  lead = null,
  reducedMotion = readReducedMotionPreference(),
  onStatus = null
} = {}) {
  const pixi = globalThis.PIXI || globalThis.window?.PIXI;
  const normalizedSessionKey = sessionKey == null ? "" : String(sessionKey);
  let currentMembers = normalizeMembers(lead ? [lead, ...asMemberArray(members)] : members);
  let app = null;
  let initialized = false;
  let destroyed = false;
  let initError = null;
  let revision = 0;
  let resizeFrameId = null;
  let resizeObserver = null;
  let resizeTarget = null;
  let changedHostPosition = false;
  let originalHostPosition = "";
  let resizeListenerAttached = false;
  const entries = new Map();
  const pendingLoads = new Map();
  const lastBeatByCompanion = new Map();

  const ready = initialize().catch((error) => {
    initError = error instanceof Error ? error.message : String(error);
    reportStatus("error", initError);
    teardownRuntime();
    return false;
  });

  async function initialize() {
    if (!host || typeof host.appendChild !== "function") {
      throw new Error("standoff circle renderer requires a DOM host");
    }
    if (!pixi?.Application || !pixi?.Container) {
      throw new Error("PixiJS is unavailable for the standoff circle renderer");
    }

    prepareHost();
    const size = readHostSize(host);
    const nextApp = new pixi.Application();
    await nextApp.init({
      width: size.width,
      height: size.height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: clampResolution(globalThis.window?.devicePixelRatio)
    });

    if (destroyed) {
      destroyPixiApplication(nextApp);
      return false;
    }

    app = nextApp;
    app.stage.sortableChildren = true;
    configureCanvas(app.canvas);
    host.appendChild(app.canvas);
    bindResizeLifecycle();
    initialized = true;
    await reconcileMembers();
    if (destroyed) return false;
    applyLayout();
    reportStatus("ready", "三心同場的共鳴畫面已就緒");
    return true;
  }

  function prepareHost() {
    const style = host.style || null;
    if (!style) return;
    originalHostPosition = style.position || "";
    const view = host.ownerDocument?.defaultView || globalThis.window;
    const computedPosition = view?.getComputedStyle?.(host)?.position;
    if (!style.position && (!computedPosition || computedPosition === "static")) {
      style.position = "relative";
      changedHostPosition = true;
    }
  }

  function configureCanvas(canvas) {
    if (!canvas) return;
    canvas.setAttribute?.("data-standoff-circle-canvas", "true");
    canvas.setAttribute?.("aria-hidden", "true");
    if (!canvas.style) return;
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "1"
    });
  }

  function bindResizeLifecycle() {
    resizeTarget = host.ownerDocument?.defaultView || globalThis.window;
    if (resizeTarget?.addEventListener) {
      resizeTarget.addEventListener("resize", scheduleResize);
      resizeListenerAttached = true;
    }

    const ResizeObserverCtor = resizeTarget?.ResizeObserver || globalThis.ResizeObserver;
    if (typeof ResizeObserverCtor === "function") {
      resizeObserver = new ResizeObserverCtor(scheduleResize);
      resizeObserver.observe(host);
    }
  }

  function scheduleResize() {
    if (destroyed || !initialized) return;
    if (!resizeTarget?.requestAnimationFrame) {
      applyLayout();
      return;
    }
    if (resizeFrameId !== null) resizeTarget.cancelAnimationFrame?.(resizeFrameId);
    resizeFrameId = resizeTarget.requestAnimationFrame(() => {
      resizeFrameId = null;
      applyLayout();
    });
  }

  function applyLayout() {
    if (destroyed || !initialized || !app) return false;
    const size = readHostSize(host);
    app.renderer?.resize?.(size.width, size.height);

    const supportMembers = currentMembers.filter((member) => member.role === "support");
    currentMembers.forEach((member) => {
      const entry = entries.get(member.companionId);
      if (!entry) return;
      const supportIndex = supportMembers.findIndex(
        (support) => support.companionId === member.companionId
      );
      const slot = resolveMemberSlot(member.role, supportIndex, size);
      entry.root.x = slot.x;
      entry.root.y = slot.y;
      entry.root.zIndex = slot.zIndex;
      entry.visual.scale?.set?.(slot.scale);
      entry.intentText.y = slot.intentY;
      entry.breathText.y = slot.breathY;
      entry.layout = slot;
    });
    app.stage.sortChildren?.();
    return true;
  }

  async function updateMembers(nextMembers = []) {
    if (destroyed) return false;
    currentMembers = normalizeMembers(nextMembers, currentMembers);
    revision += 1;
    cancelRemovedPendingLoads();
    const didInitialize = await ready;
    if (!didInitialize || destroyed) return false;
    await reconcileMembers();
    return !destroyed;
  }

  async function reconcileMembers() {
    if (!initialized || destroyed || !app) return false;
    const desiredIds = new Set(currentMembers.map((member) => member.companionId));

    for (const companionId of [...entries.keys()]) {
      if (!desiredIds.has(companionId)) removeEntry(companionId);
    }

    const work = currentMembers.map(async (member) => {
      let entry = entries.get(member.companionId);
      if (!entry) entry = await ensureEntry(member);
      const latest = currentMembers.find(
        (candidate) => candidate.companionId === member.companionId
      );
      if (entry && latest) updateEntry(entry, latest);
    });
    await Promise.all(work);
    if (destroyed) return false;
    applyLayout();
    return true;
  }

  function ensureEntry(member) {
    const existingPending = pendingLoads.get(member.companionId);
    if (existingPending) return existingPending.promise;

    const token = { cancelled: false, revision };
    const promise = createMemberEntry(member)
      .then((entry) => {
        const stillWanted = currentMembers.some(
          (candidate) => candidate.companionId === member.companionId
        );
        if (destroyed || token.cancelled || !stillWanted || !entry) {
          destroyDisplayObject(entry?.root);
          return null;
        }
        app.stage.addChild(entry.root);
        entries.set(member.companionId, entry);
        return entry;
      })
      .catch((error) => {
        reportStatus("fallback", `無法建立 ${member.companionId} 的同場畫面：${error.message}`);
        return null;
      })
      .finally(() => {
        if (pendingLoads.get(member.companionId)?.token === token) {
          pendingLoads.delete(member.companionId);
        }
      });
    pendingLoads.set(member.companionId, { token, promise });
    return promise;
  }

  async function createMemberEntry(member) {
    const creature = resolveMemberCreature(member);
    const visual = await loadMemberVisual(pixi, creature, member, reportStatus);
    const root = new pixi.Container();
    root.name = `standoff_circle_${member.role}_${member.companionId}`;
    root.eventMode = "none";
    root.addChild(visual);

    const intentText = createCanvasText(pixi, "", {
      fontSize: member.role === "lead" ? 13 : 12,
      fill: 0xf3f0ff,
      stroke: { color: 0x171326, width: 4 },
      align: "center",
      wordWrap: true,
      wordWrapWidth: member.role === "lead" ? 180 : 130
    });
    intentText.anchor?.set?.(0.5, 1);
    root.addChild(intentText);

    const breathText = createCanvasText(pixi, "", {
      fontSize: 11,
      fill: 0xd9cdfc,
      stroke: { color: 0x171326, width: 3 },
      align: "center"
    });
    breathText.anchor?.set?.(0.5, 0);
    root.addChild(breathText);

    return {
      companionId: member.companionId,
      role: member.role,
      root,
      visual,
      intentText,
      breathText,
      source: visual.__standoffSource || "silhouette",
      lastIntent: null,
      lastReasonId: null,
      layout: null,
      member
    };
  }

  function updateEntry(entry, member) {
    entry.member = member;
    entry.role = member.role;
    entry.root.name = `standoff_circle_${member.role}_${member.companionId}`;
    entry.visual.alpha = member.resting ? 0.42 : 1;
    entry.intentText.text = member.intentLabel
      || (member.resting
        ? "牠在圈邊休息"
        : (member.role === "lead" ? "主夥伴正在領拍" : "牠在聽下一道預示"));
    entry.breathText.text = formatBreath(member);
  }

  async function consumeIntent(intentEvent = {}) {
    if (destroyed || !(await ready) || destroyed) return false;
    if (String(intentEvent.sessionKey ?? "") !== normalizedSessionKey) return false;
    if (!STANDOFF_INTENTS.has(intentEvent.intent)) return false;

    const companionId = String(intentEvent.companionId || "");
    const entry = entries.get(companionId);
    if (!entry) return false;
    if (intentEvent.role && intentEvent.role !== entry.role) return false;

    const beatIndex = Number(intentEvent.beatIndex);
    if (!Number.isInteger(beatIndex) || beatIndex < 0) return false;
    const previousBeat = lastBeatByCompanion.get(companionId);
    if (Number.isInteger(previousBeat) && beatIndex <= previousBeat) return false;

    lastBeatByCompanion.set(companionId, beatIndex);
    entry.lastIntent = intentEvent.intent;
    entry.lastReasonId = intentEvent.reasonId || null;
    entry.intentText.text = resolveIntentLabel(intentEvent, entry.member);

    const controller = entry.visual.__animationController;
    if (!controller) return true;
    const animationName = resolveAnimationIntent(
      intentEvent.intent,
      (candidate) => controller.canResolve(candidate)
    );

    try {
      await controller.loadAnimation(animationName);
    } catch (error) {
      reportStatus(
        "fallback",
        `${companionId} 的 ${animationName} 動畫不可用，保留同角色靜態姿態`
      );
      return true;
    }

    if (destroyed || entries.get(companionId) !== entry) return false;
    controller.play(animationName, reducedMotion
      ? {
          loop: false,
          holdFrame: 0,
          restartKey: `${normalizedSessionKey}:${beatIndex}:reduced`
        }
      : {
          loop: false,
          restartKey: `${normalizedSessionKey}:${beatIndex}`
        });
    return true;
  }

  function resize() {
    return applyLayout();
  }

  function getIntentDurationMs(companionId) {
    const entry = entries.get(String(companionId || ""));
    const controller = entry?.visual?.__animationController;
    const animationName = controller?.getCurrentAnimationName?.();
    const duration = Number(controller?.getAnimationDurationMs?.(animationName));
    if (!Number.isFinite(duration) || duration <= 0 || reducedMotion) return 0;
    return Math.min(2200, Math.max(0, Math.round(duration)));
  }

  function getDiagnostics() {
    return {
      sessionKey: normalizedSessionKey,
      initialized,
      destroyed,
      initError,
      reducedMotion: Boolean(reducedMotion),
      canvasAttached: Boolean(app?.canvas?.parentNode === host),
      memberCount: entries.size,
      pendingLoads: pendingLoads.size,
      resizeListenerCount: resizeListenerAttached ? 1 : 0,
      resizeObserverCount: resizeObserver ? 1 : 0,
      resizeFramePending: resizeFrameId !== null,
      members: currentMembers.map((member) => {
        const entry = entries.get(member.companionId);
        return {
          companionId: member.companionId,
          role: member.role,
          breath: member.breath,
          resting: member.resting,
          source: entry?.source || "pending",
          lastIntent: entry?.lastIntent || null,
          lastReasonId: entry?.lastReasonId || null,
          animationName: entry?.visual?.__animationController?.getCurrentAnimationName?.() || null,
          playbackState: entry?.visual?.__animationController?.getPlaybackState?.() || null,
          x: Number(entry?.root?.x) || 0,
          y: Number(entry?.root?.y) || 0,
          scale: Number(entry?.visual?.scale?.x) || 0,
          intentY: (Number(entry?.root?.y) || 0) + (Number(entry?.intentText?.y) || 0),
          breathY: (Number(entry?.root?.y) || 0) + (Number(entry?.breathText?.y) || 0),
          intentLabel: entry?.intentText?.text || "",
          breathLabel: entry?.breathText?.text || ""
        };
      })
    };
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    teardownRuntime();
    reportStatus("destroyed", "三心同場的共鳴畫面已清除");
  }

  function teardownRuntime() {
    if (resizeFrameId !== null) {
      resizeTarget?.cancelAnimationFrame?.(resizeFrameId);
      resizeFrameId = null;
    }
    if (resizeListenerAttached) {
      resizeTarget?.removeEventListener?.("resize", scheduleResize);
      resizeListenerAttached = false;
    }
    resizeObserver?.disconnect?.();
    resizeObserver = null;

    for (const pending of pendingLoads.values()) pending.token.cancelled = true;
    pendingLoads.clear();
    for (const companionId of [...entries.keys()]) removeEntry(companionId);
    lastBeatByCompanion.clear();

    const canvas = app?.canvas || null;
    if (app) destroyPixiApplication(app);
    app = null;
    if (canvas?.parentNode === host) host.removeChild?.(canvas);
    canvas?.remove?.();
    initialized = false;

    if (changedHostPosition && host?.style) {
      host.style.position = originalHostPosition;
      changedHostPosition = false;
    }
  }

  function cancelRemovedPendingLoads() {
    const desiredIds = new Set(currentMembers.map((member) => member.companionId));
    for (const [companionId, pending] of pendingLoads.entries()) {
      if (desiredIds.has(companionId)) continue;
      pending.token.cancelled = true;
      pendingLoads.delete(companionId);
    }
  }

  function removeEntry(companionId) {
    const entry = entries.get(companionId);
    if (!entry) return;
    entry.root.parent?.removeChild?.(entry.root);
    destroyDisplayObject(entry.root);
    entries.delete(companionId);
    lastBeatByCompanion.delete(companionId);
  }

  function reportStatus(kind, message) {
    if (typeof onStatus !== "function") return;
    try {
      onStatus({ kind, message, sessionKey: normalizedSessionKey });
    } catch {
      // Presentation diagnostics must never interrupt the standoff authority.
    }
  }

  return Object.freeze({
    ready,
    updateMembers,
    consumeIntent,
    getIntentDurationMs,
    resize,
    destroy,
    getDiagnostics
  });
}

async function loadMemberVisual(pixi, creature, member, reportStatus) {
  if (creature.animationsManifest) {
    const pack = await loadCompanionAnimationPack(creature.animationsManifest, {
      bootOnly: true,
      animationNames: ["idle_calm"],
      warmup: false
    });
    const animated = createAnimatedCompanionNode(pack, creature);
    if (animated) {
      animated.__standoffSource = "animation";
      reportStatus("member-ready", `${member.companionId} 使用自己的動態姿態`);
      return animated;
    }
  }

  if (creature.image) {
    try {
      const texture = await pixi.Assets.load(creature.image);
      const portrait = createPortraitNode(pixi, texture, creature);
      portrait.__standoffSource = "portrait";
      reportStatus("member-fallback", `${member.companionId} 使用自己的靜態圖`);
      return portrait;
    } catch (error) {
      reportStatus("member-fallback", `${member.companionId} 的靜態圖不可用：${error.message}`);
    }
  }

  const silhouette = createMemberSilhouette(pixi, creature);
  silhouette.__standoffSource = "silhouette";
  reportStatus("member-fallback", `${member.companionId} 使用自己的色彩輪廓`);
  return silhouette;
}

function createPortraitNode(pixi, texture, creature) {
  applyLinearTexturePolicy(pixi, texture);
  const node = new pixi.Container();
  const sprite = new pixi.Sprite(texture);
  sprite.anchor?.set?.(0.5, 1);
  const width = Math.max(1, Number(sprite.width || texture.width) || 512);
  const height = Math.max(1, Number(sprite.height || texture.height) || 512);
  const renderScale = clamp(Number(creature.renderScale) || 1, 0.75, 1.3);
  sprite.scale?.set?.(Math.min(150 / width, 150 / height) * renderScale);
  node.addChild(sprite);
  return node;
}

function createMemberSilhouette(pixi, creature) {
  const node = new pixi.Container();
  const bodyColor = creature.placeholder?.bodyColor ?? 0x555268;
  const accentColor = creature.placeholder?.accentColor ?? 0xa9a3bf;
  const shadow = new pixi.Graphics();
  shadow.ellipse(0, -2, 44, 10).fill({ color: 0x000000, alpha: 0.24 });
  node.addChild(shadow);

  const body = new pixi.Graphics();
  body.ellipse(0, -54, 42, 50).fill({ color: bodyColor, alpha: 0.94 });
  body.circle(0, -105, 34).fill({ color: bodyColor, alpha: 0.98 });
  body.circle(-12, -106, 4).fill({ color: accentColor, alpha: 0.9 });
  body.circle(12, -106, 4).fill({ color: accentColor, alpha: 0.9 });
  body.circle(0, -74, 7).fill({ color: accentColor, alpha: 0.82 });
  node.addChild(body);
  return node;
}

function createCanvasText(pixi, text, style) {
  try {
    return new pixi.Text({ text, style });
  } catch {
    return new pixi.Text(text, style);
  }
}

function resolveMemberCreature(member) {
  if (member.creature?.id === member.companionId) return member.creature;
  if (isKnownCompanionId(member.companionId)) return getCompanionById(member.companionId);
  return {
    id: member.companionId,
    name: member.name || "未辨識的夥伴",
    defaultMood: "calm",
    image: member.image || null,
    animationsManifest: member.animationsManifest || null,
    renderScale: member.renderScale || 1,
    placeholder: member.placeholder || null
  };
}

function normalizeMembers(value, previousMembers = []) {
  let rawMembers = asMemberArray(value);
  const priorLead = previousMembers.find((member) => member.role === "lead") || null;
  const hasExplicitLead = rawMembers.some((member) => member?.role === "lead");
  if (priorLead && !hasExplicitLead) rawMembers = [priorLead, ...rawMembers];
  if (hasExplicitLead) {
    rawMembers = [
      ...rawMembers.filter((member) => member?.role === "lead"),
      ...rawMembers.filter((member) => member?.role !== "lead")
    ];
  }

  const normalized = [];
  const seen = new Set();
  for (const rawMember of rawMembers) {
    const companionId = String(rawMember?.companionId || rawMember?.id || "").trim();
    if (!companionId || seen.has(companionId)) continue;
    const role = rawMember?.role === "lead"
      ? "lead"
      : (normalized.some((member) => member.role === "lead") ? "support" : "lead");
    const maxBreath = normalizeBreath(rawMember?.maxBreath, DEFAULT_MEMBER_BREATH);
    normalized.push({
      ...rawMember,
      companionId,
      role,
      name: rawMember?.name || rawMember?.displayName?.zh || companionId,
      maxBreath,
      breath: role === "support"
        ? normalizeBreath(rawMember?.breath, maxBreath)
        : null,
      resting: Boolean(rawMember?.resting || rawMember?.state === "resting"),
      intentLabel: typeof rawMember?.intentLabel === "string" ? rawMember.intentLabel : ""
    });
    seen.add(companionId);
    if (normalized.length >= MAX_VISIBLE_MEMBERS) break;
  }

  // A malformed update may mark multiple records as lead through object spread.
  // Keep the first lead authoritative and normalize all later records to support.
  let leadSeen = false;
  return normalized.map((member) => {
    if (member.role === "lead" && !leadSeen) {
      leadSeen = true;
      return member;
    }
    return { ...member, role: "support" };
  });
}

function asMemberArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.members)) return value.members;
  if (Array.isArray(value?.circle)) return value.circle;
  return [];
}

function normalizeBreath(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.max(0, Math.round(Number(fallback) || 0));
  return Math.max(0, Math.round(parsed));
}

function formatBreath(member) {
  if (member.role === "lead") return "領拍";
  const maxBreath = Math.max(1, member.maxBreath || DEFAULT_MEMBER_BREATH);
  const breath = clamp(member.breath ?? maxBreath, 0, maxBreath);
  const pips = `${"●".repeat(breath)}${"○".repeat(maxBreath - breath)}`;
  return member.resting ? `${pips} · 休息` : `呼吸 ${pips}`;
}

function resolveIntentLabel(intentEvent, member) {
  if (typeof intentEvent.intentLabel === "string" && intentEvent.intentLabel.trim()) {
    return intentEvent.intentLabel.trim();
  }
  if (REASON_LABELS[intentEvent.reasonId]) return REASON_LABELS[intentEvent.reasonId];
  if (INTENT_LABELS[intentEvent.intent]) return INTENT_LABELS[intentEvent.intent];
  return member?.intentLabel || "牠正在聽下一道預示";
}

function resolveMemberSlot(role, supportIndex, size) {
  const compact = size.width < 360 || size.height < 250;
  if (role === "lead") {
    const scale = compact ? clamp(size.height / 220, 0.58, 0.78) : 0.94;
    const y = Math.round(size.height * 0.92);
    return {
      x: Math.round(size.width * 0.5),
      y,
      scale,
      zIndex: 3,
      // Keep the lead's explanation on its own upper band. With three long
      // localized labels, sharing the supporters' band makes otherwise valid
      // word-wrapped text visually collide on phone widths.
      intentY: -Math.min(Math.round(205 * scale + 6), Math.max(0, y - 8)),
      breathY: Math.min(6, size.height - y - 18)
    };
  }
  const isLeft = supportIndex <= 0;
  const scale = compact ? clamp(size.height / 244, 0.5, 0.6) : 0.66;
  const y = Math.round(size.height * 0.81);
  return {
    x: Math.round(size.width * (isLeft ? 0.23 : 0.77)),
    y,
    scale,
    zIndex: isLeft ? 1 : 2,
    // Stagger the two supporter captions so their wrapped lines never form one
    // unreadable sentence across the center of the circle.
    intentY: -Math.min(
      Math.round((isLeft ? 150 : 120) * scale + 8),
      Math.max(0, y - 8)
    ),
    breathY: Math.min(5, size.height - y - 17)
  };
}

function readHostSize(host) {
  const bounds = host?.getBoundingClientRect?.() || {};
  const width = Math.round(Number(bounds.width || host?.clientWidth) || DEFAULT_WIDTH);
  const height = Math.round(Number(bounds.height || host?.clientHeight) || DEFAULT_HEIGHT);
  return {
    width: Math.max(1, width),
    height: Math.max(1, height)
  };
}

function applyLinearTexturePolicy(pixi, texture) {
  const source = texture?.source || texture?.baseTexture;
  const linear = pixi?.SCALE_MODES?.LINEAR ?? "linear";
  try {
    if (source && "scaleMode" in source) source.scaleMode = linear;
    if (texture && "scaleMode" in texture) texture.scaleMode = linear;
  } catch {
    // Older Pixi texture wrappers can expose these fields as readonly.
  }
}

function readReducedMotionPreference() {
  try {
    return Boolean(globalThis.window?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  } catch {
    return false;
  }
}

function clampResolution(value) {
  return clamp(Number(value) || 1, 1, 2);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function destroyDisplayObject(displayObject) {
  if (!displayObject || displayObject.destroyed) return;
  displayObject.parent?.removeChild?.(displayObject);
  displayObject.destroy?.({ children: true });
}

function destroyPixiApplication(application) {
  if (!application || application.destroyed) return;
  try {
    application.destroy(true, {
      children: true,
      texture: false,
      textureSource: false
    });
  } catch {
    try {
      application.destroy(true);
    } catch {
      // A renderer teardown failure must not block the battle modal cleanup.
    }
  }
}
