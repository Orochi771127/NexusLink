import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";

const REACTION_ANIMATION_MAP = Object.freeze({
  [SOUL_TALK_REACTIONS.ACKNOWLEDGE]: { animationKey: "idle_calm", fallbackKey: "idle_calm" },
  [SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE]: { animationKey: "touch_guarded", fallbackKey: "idle_calm" },
  [SOUL_TALK_REACTIONS.HESITATE]: { animationKey: "idle_distant", fallbackKey: "idle_calm" },
  [SOUL_TALK_REACTIONS.REJECT]: { animationKey: "idle_defensive", fallbackKey: "idle_defensive" },
  [SOUL_TALK_REACTIONS.WITHDRAW]: { animationKey: "idle_defensive", fallbackKey: "idle_distant" },
  [SOUL_TALK_REACTIONS.SAFETY_REDIRECT]: { animationKey: "idle_distant", fallbackKey: "idle_calm" }
});

const EMOTION_ANIMATION_MAP = Object.freeze({
  fatigue: { animationKey: "sleep", fallbackKey: "idle_tired" },
  anger: { animationKey: "idle_angry", fallbackKey: "idle_defensive" },
  gratitude: { animationKey: "idle_happy", fallbackKey: "idle_calm" }
});

export function mapSoulTalkAnimation({ plan = {}, analysis = {}, intent = {} } = {}) {
  const reaction = plan.mode || SOUL_TALK_REACTIONS.ACKNOWLEDGE;
  const reactionMap = REACTION_ANIMATION_MAP[reaction] || REACTION_ANIMATION_MAP.acknowledge;
  const emotionMap = EMOTION_ANIMATION_MAP[analysis.emotionKey];

  const animationKey = plan.animationKey || emotionMap?.animationKey || reactionMap.animationKey;
  const fallbackKey = emotionMap?.fallbackKey || reactionMap.fallbackKey || "idle_calm";

  return {
    animationKey,
    fallbackKey,
    shouldDispatchNow: false,
    reaction,
    intent: intent.intent || "unknown"
  };
}