const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 72 * 60 * 60 * 1000;
export const TIME_TRAVEL_TOLERANCE_MS = 1000 * 60 * 5;
const SEVEN_DAYS_MS = 7 * DAY_MS;

function createTrace(type, intensity, now, ttlMs = SEVEN_DAYS_MS) {
  return {
    id: `trace_${now}_${type}`,
    type,
    intensity,
    createdAt: now,
    expiresAt: ttlMs === null ? null : now + ttlMs
  };
}

export function evaluateOfflineTrace(currentState, now = Date.now()) {
  const lastSeenAt = Number.isFinite(currentState.lastSeenAt) ? currentState.lastSeenAt : now;
  const traces = [];
  const statePatch = { lastSeenAt: now };
  let statusMessage = "";

  if (now + TIME_TRAVEL_TOLERANCE_MS < lastSeenAt) {
    return {
      statePatch: {
        lastSeenAt: now,
        timeAnomalyCount: (currentState.timeAnomalyCount || 0) + 1
      },
      traces,
      statusMessage: "棲地的時間訊號短暫偏移了一下。"
    };
  }

  const elapsedMs = Math.max(0, now - lastSeenAt);

  if (elapsedMs < SIX_HOURS_MS) {
    return { statePatch, traces, statusMessage };
  }

  // L4：旅痕只記敘事痕跡，不因離線扣 energy／升 defense／改 mood（BH-002）
  if (elapsedMs < DAY_MS) {
    traces.push(createTrace("small_silence", 0.28, now));
    statusMessage = "湖邊比上次安靜了一點。";
  } else if (elapsedMs < THREE_DAYS_MS) {
    traces.push(createTrace("fallen_leaf", 0.42, now));
    statusMessage = "一片落葉停在心核旁。";
  } else {
    traces.push(createTrace("campfire_dim", 0.5, now));
    statusMessage = "營火暗了一些，但還留著微溫。";
  }

  return { statePatch, traces, statusMessage };
}
