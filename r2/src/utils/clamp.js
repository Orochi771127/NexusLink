export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function clampPercent(value, max) {
  return clamp((Number(value) / max) * 100, 0, 100);
}
