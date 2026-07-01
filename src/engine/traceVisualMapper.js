import { EmotionDict } from "../data/emotionDictionary.js";

const POSITION_POOLS = Object.freeze({
  lake: Object.freeze([
    { xRatio: 0.42, yRatio: 0.53 },
    { xRatio: 0.58, yRatio: 0.56 },
    { xRatio: 0.35, yRatio: 0.6 }
  ]),
  platform: Object.freeze([
    { xRatio: 0.42, yRatio: 0.72 },
    { xRatio: 0.58, yRatio: 0.72 },
    { xRatio: 0.5, yRatio: 0.76 }
  ]),
  crystal: Object.freeze([
    { xRatio: 0.82, yRatio: 0.68 },
    { xRatio: 0.88, yRatio: 0.74 }
  ]),
  pier: Object.freeze([
    { xRatio: 0.22, yRatio: 0.67 },
    { xRatio: 0.29, yRatio: 0.7 }
  ]),
  foreground: Object.freeze([
    { xRatio: 0.72, yRatio: 0.8 },
    { xRatio: 0.28, yRatio: 0.79 }
  ])
});

const VISUAL_HINT_TO_KIND = Object.freeze({
  faint_glow: "glow",
  soft_mist: "mist",
  repaired_light: "repaired_light"
});

const TRACE_TYPE_TO_KIND = Object.freeze({
  fallen_leaf: "leaf",
  small_silence: "ripple",
  campfire_dim: "ember"
});

const STATUS_TO_KIND = Object.freeze({
  fresh: "glow",
  settled: "mist",
  transformed: "repaired_light"
});

// 新鮮情緒痕跡的專屬視覺：藍燈籠／白燼／雜訊／金符文／漣漪。
// 沉積後仍回到 settled→mist、transformed→repaired_light 的弧線。
const EMOTION_TO_KIND = Object.freeze({
  sadness: "blue_lantern",
  fatigue: "white_ash",
  anxiety: "glitch_noise",
  gratitude: "golden_rune",
  calm: "ripple"
});

const KIND_CONFIG = Object.freeze({
  glow: Object.freeze({
    layer: "fx",
    pool: "lake",
    maxAlpha: 0.32,
    pulseSpeed: 0.9,
    scale: 1
  }),
  mist: Object.freeze({
    layer: "fx",
    pool: "lake",
    maxAlpha: 0.2,
    pulseSpeed: 0.5,
    scale: 1.15
  }),
  repaired_light: Object.freeze({
    layer: "platform",
    pool: "platform",
    maxAlpha: 0.26,
    pulseSpeed: 1.1,
    scale: 1
  }),
  leaf: Object.freeze({
    layer: "foreground",
    pool: "pier",
    maxAlpha: 0.4,
    pulseSpeed: 0.4,
    scale: 1
  }),
  ripple: Object.freeze({
    layer: "fx",
    pool: "lake",
    maxAlpha: 0.22,
    pulseSpeed: 0.7,
    scale: 1
  }),
  ember: Object.freeze({
    layer: "foreground",
    pool: "foreground",
    maxAlpha: 0.34,
    pulseSpeed: 1.3,
    scale: 1
  }),
  blue_lantern: Object.freeze({
    layer: "fx",
    pool: "lake",
    maxAlpha: 0.34,
    pulseSpeed: 0.6,
    scale: 1
  }),
  white_ash: Object.freeze({
    layer: "foreground",
    pool: "foreground",
    maxAlpha: 0.3,
    pulseSpeed: 0.45,
    scale: 1
  }),
  glitch_noise: Object.freeze({
    layer: "fx",
    pool: "crystal",
    maxAlpha: 0.36,
    pulseSpeed: 1.6,
    scale: 1
  }),
  golden_rune: Object.freeze({
    layer: "platform",
    pool: "platform",
    maxAlpha: 0.3,
    pulseSpeed: 0.8,
    scale: 1
  })
});

// 記憶回廊用：情緒 → 強調色 / 字符（重用 EMOTION_TO_KIND，與棲地光痕同一套語彙）。
const KIND_ACCENT = Object.freeze({
  blue_lantern: "#6db4f0", // sadness
  white_ash: "#cdd6e2", // fatigue
  glitch_noise: "#b48bd6", // anxiety
  golden_rune: "#f4d77d", // gratitude / bond
  ripple: "#7fd6c2", // calm
  glow: "#8fa6c4" // fallback
});

const EMOTION_GLYPH = Object.freeze({
  sadness: "○", // 藍燈籠
  fatigue: "·", // 白燼
  anxiety: "≋", // 雜訊
  gratitude: "✦", // 金符文
  calm: "◡", // 漣漪
  loneliness: "☆",
  anger: "✸"
});

export function getMemoryAccentColor(emotion) {
  const kind = EMOTION_TO_KIND[emotion] || "glow";
  return KIND_ACCENT[kind] || KIND_ACCENT.glow;
}

export function getMemoryGlyph(emotion) {
  return EMOTION_GLYPH[emotion] || "◇";
}

// 記憶頁的「棲地痕跡」清單用：情緒類痕跡重用 EmotionDict 的詩意標籤與 textHint 敘事句；
// 無 emotion 的 action-effect 類痕跡（如 crystal_trace）走通用文案，不暴露內部 type/emotion 原始字串。
export function getTraceDisplayCopy(trace = {}) {
  const dictEntry = EmotionDict[trace.emotion];
  if (dictEntry) {
    return {
      title: dictEntry.label,
      copy: trace.textHint || `${dictEntry.theme}留下的痕跡，仍在棲地裡。`
    };
  }

  return {
    title: "棲地痕跡",
    copy: "牠在棲地裡留下的安靜痕跡。"
  };
}

export function mapHabitatTracesToVisuals(traces = []) {
  if (!Array.isArray(traces)) return [];

  return traces.map((trace) => mapHabitatTraceToVisual(trace)).filter(Boolean);
}

export function mapHabitatTraceToVisual(trace) {
  if (!trace?.id) return null;

  const kind = resolveVisualKind(trace);
  const config = KIND_CONFIG[kind] || KIND_CONFIG.glow;
  const pool = POSITION_POOLS[config.pool] || POSITION_POOLS.lake;
  const slot = pool[stablePoolIndex(trace.id, pool.length)] || pool[0];
  const intensity = clamp01(Number(trace.intensity) || 0.4);
  const alpha = clamp01(config.maxAlpha * (0.55 + intensity * 0.45));

  return {
    id: trace.id,
    kind,
    layer: config.layer,
    xRatio: slot.xRatio,
    yRatio: slot.yRatio,
    alpha,
    scale: config.scale,
    pulseSpeed: config.pulseSpeed,
    intensity,
    createdAt: Number.isFinite(trace.createdAt) ? trace.createdAt : 0
  };
}

function resolveVisualKind(trace) {
  const type = String(trace.type || "").trim();

  // 新鮮情緒痕跡優先採用專屬視覺（金符文/藍燈籠/白燼/雜訊/漣漪），
  // 不被通用的 visualHint(faint_glow) 蓋掉；沉積後再回到 mist / repaired_light 的弧線。
  if (type.startsWith("em_") && trace.status === "fresh" && EMOTION_TO_KIND[trace.emotion]) {
    return EMOTION_TO_KIND[trace.emotion];
  }

  const visualHint = String(trace.visualHint || "").trim();
  if (VISUAL_HINT_TO_KIND[visualHint]) {
    return VISUAL_HINT_TO_KIND[visualHint];
  }

  if (TRACE_TYPE_TO_KIND[type]) {
    return TRACE_TYPE_TO_KIND[type];
  }

  if (type.startsWith("em_")) {
    if (STATUS_TO_KIND[trace.status]) {
      return STATUS_TO_KIND[trace.status];
    }
    return "glow";
  }

  if (visualHint) {
    return "glow";
  }

  return "glow";
}

function stablePoolIndex(id, poolLength) {
  if (!poolLength) return 0;

  let hash = 0;
  const key = String(id || "");
  for (let charIndex = 0; charIndex < key.length; charIndex += 1) {
    hash = (hash * 31 + key.charCodeAt(charIndex)) >>> 0;
  }

  return hash % poolLength;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}