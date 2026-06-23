import { createHabitatTraceFromMemory } from "../../engine/habitatTraceEngine.js";
import { canTriggerFirstAwakening } from "./raphaelAwakeningGate.js";

const AWAKENING_LINES = Object.freeze([
  "我聽見了。",
  "不是很清楚，但我知道你在這裡。",
  "先別急著叫醒我太多。",
  "我們慢慢來。"
]);

export function buildFirstAwakeningPayload({ state = {}, companion = null, now = Date.now() } = {}) {
  if (!canTriggerFirstAwakening(state)) {
    return { shouldApply: false, reason: "already_awakened" };
  }

  const idSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const memoryId = `emem_${now}_awakening_${idSuffix}`;

  const memoryObject = {
    id: memoryId,
    type: "awakening_memory",
    theme: "心核初醒",
    label: "初醒",
    emotion: "calm",
    intensity: 0.62,
    symbol: "core_glow",
    place: "lake_surface",
    status: "fresh",
    source: "first_awakening",
    excerpt: "心核在月湖邊第一次睜眼。",
    createdAt: now,
    lastUpdatedAt: now,
    isVisibleInHabitat: true
  };

  const traceObject = {
    ...createHabitatTraceFromMemory(memoryObject, now),
    type: "core_awakening_glow",
    visualHint: "faint_glow",
    textHint: "月湖中心浮起一道心核微光，像有什麼慢慢睜開了眼。",
    intensity: 0.55
  };

  const displayName = companion?.name || "灰影貓";
  const awakeningLine = AWAKENING_LINES.join("\n");

  return {
    shouldApply: true,
    reason: "first_awakening",
    memoryObject,
    traceObject,
    awakeningLine,
    reactionPreview: `${displayName}的耳朵動了一下，像從很深的安靜裡回來。`,
    animationKey: "idle_wake",
    animationIntent: "soul.awaken",
    statePatch: {
      mood: "calm",
      reactionPreview: `${displayName}的耳朵動了一下，像從很深的安靜裡回來。`,
      lastEmotionTag: "calm"
    },
    chatEntry: {
      role: "companion",
      text: awakeningLine
    }
  };
}