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
  })
});

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
  const visualHint = String(trace.visualHint || "").trim();
  if (VISUAL_HINT_TO_KIND[visualHint]) {
    return VISUAL_HINT_TO_KIND[visualHint];
  }

  const type = String(trace.type || "").trim();
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