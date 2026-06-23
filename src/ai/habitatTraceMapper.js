import { createHabitatTraceFromMemory } from "../engine/habitatTraceEngine.js";

const TRACE_INTENT_MAP = Object.freeze({
  fatigue: { visualMotif: "campfire_dim", anchor: "white_ash", traceFamily: "dim_warmth" },
  sadness: { visualMotif: "blue_lantern", anchor: "lake_surface", traceFamily: "soft_blue" },
  anxiety: { visualMotif: "glitch_mist", anchor: "sky_air", traceFamily: "static_mist" },
  loneliness: { visualMotif: "faint_spark", anchor: "shore_side", traceFamily: "lonely_spark" },
  anger: { visualMotif: "star_iron_ore", anchor: "lake_bottom", traceFamily: "heated_stone" },
  gratitude: { visualMotif: "golden_rune", anchor: "magic_circle", traceFamily: "warm_gold" },
  respected_boundary: { visualMotif: "soft_ripple", anchor: "lake_surface", traceFamily: "boundary_ripple" },
  apology: { visualMotif: "repaired_crack", anchor: "stone_path", traceFamily: "repair_line" },
  calm: { visualMotif: "faint_glow", anchor: "lake_surface", traceFamily: "quiet_glow" }
});

export function mapHabitatTraceIntent(memoryDecision = {}, plan = {}, analysis = {}) {
  if (!memoryDecision?.shouldWrite || !memoryDecision.memoryObject) {
    return {
      traceObject: null,
      traceIntent: null,
      shouldApplyTrace: false
    };
  }

  const memory = memoryDecision.memoryObject;
  const emotion = memory.emotion || analysis.emotionKey || "calm";
  let intentKey = emotion;

  if (memoryDecision.memoryType === "apology") intentKey = "apology";
  if (plan.mode === "withdraw" || plan.mode === "reject") intentKey = "respected_boundary";

  const traceIntent = TRACE_INTENT_MAP[intentKey] || TRACE_INTENT_MAP.calm;
  const traceObject = createHabitatTraceFromMemory(memory, Date.now());

  return {
    traceObject,
    traceIntent: {
      ...traceIntent,
      emotion,
      memoryId: memory.id,
      memoryType: memoryDecision.memoryType
    },
    shouldApplyTrace: Boolean(traceObject)
  };
}