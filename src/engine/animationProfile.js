const warnedFallbacks = new Set();

export const GREYSHADE_CAT_ANIMATION_PROFILE = Object.freeze({
  moodIdle: Object.freeze({
    calm: "idle_calm",
    warm: "idle_calm",
    happy: "idle_happy",
    defensive: "idle_defensive",
    distant: "idle_distant",
    sad: "idle_sad",
    soft: "idle_sad",
    alert: "idle_distant",
    safe_harbor: "idle_calm",
    tired: "idle_sick",
    sleeping: "sleep",
    angry: "idle_angry"
  }),
  touchMotion: Object.freeze({
    accept: "touch_accept",
    guarded_accept: "touch_guarded",
    hesitate: "touch_guarded",
    reject: "touch_reject",
    spam_angry: "special_angry",
    wake: "idle_wake"
  }),
  fallbackIdle: "idle_calm",
  ambientWalk: Object.freeze({
    left: "left_walk",
    right: "right_walk",
    mirrorFallback: "right_walk"
  })
});

// 心輝議會・五元守護專屬 profile：比灰影貓多用三個情緒待機圖
// （alert→idle_alert、tired→idle_downcast、safe_harbor→idle_resonance）。
// 這些角色沒有走路幀，故關閉 ambient 走動避免無動畫滑步。
export const GUARDIAN_ANIMATION_PROFILE = Object.freeze({
  moodIdle: Object.freeze({
    calm: "idle_calm",
    warm: "idle_calm",
    happy: "idle_happy",
    defensive: "idle_defensive",
    distant: "idle_distant",
    sad: "idle_sad",
    soft: "idle_sad",
    alert: "idle_alert",
    safe_harbor: "idle_resonance",
    tired: "idle_downcast",
    sleeping: "idle_calm",
    angry: "idle_angry"
  }),
  touchMotion: Object.freeze({
    accept: "touch_accept",
    guarded_accept: "touch_guarded",
    hesitate: "touch_guarded",
    reject: "touch_reject",
    spam_angry: "idle_angry",
    wake: "idle_alert"
  }),
  fallbackIdle: "idle_calm",
  ambientWalkEnabled: false,
  // 偶發日常動作（原地）：讓五元守護有「自己的生活」。
  ambientActions: Object.freeze(["sit", "groom", "stretch", "dance"]),
  ambientWalk: Object.freeze({
    left: "left_walk",
    right: "right_walk",
    mirrorFallback: "right_walk"
  })
});

export function getAnimationProfileForCreature(creature) {
  if (creature?.animationProfile === "guardian") return GUARDIAN_ANIMATION_PROFILE;
  return GREYSHADE_CAT_ANIMATION_PROFILE;
}

export function getMoodIdleAnimationName(mood, profile = GREYSHADE_CAT_ANIMATION_PROFILE) {
  return profile.moodIdle[mood] || profile.fallbackIdle;
}

export function resolveMoodIdleAnimationName(mood, hasAnimation, profile = GREYSHADE_CAT_ANIMATION_PROFILE) {
  const preferred = getMoodIdleAnimationName(mood, profile);
  if (!hasAnimation || hasAnimation(preferred)) return preferred;

  const warningKey = `${mood}:${preferred}`;
  if (!warnedFallbacks.has(warningKey)) {
    warnedFallbacks.add(warningKey);
    console.warn(`Mood animation unavailable: ${preferred}; falling back to ${profile.fallbackIdle}`);
  }
  return profile.fallbackIdle;
}

export function getTouchAnimationName(reaction, profile = GREYSHADE_CAT_ANIMATION_PROFILE) {
  return profile.touchMotion[reaction] || "touch_guarded";
}

// ======================================================================
// Body Cue：夥伴邊界的身體語言（資料結構先行）。
// 目前以既有動畫 + 文字提示表現；drift（位移）欄位為未來 motion 升級預留，
// sprite 不足的夥伴由 placeholder/transform 路徑沿用同一份資料。
// ======================================================================
export const BODY_CUE_PROFILE = Object.freeze({
  neutral: Object.freeze({ animation: null, hint: "牠安靜地待在原地。", drift: null }),
  ears_back: Object.freeze({ animation: "idle_defensive", hint: "牠的耳朵向後壓低了。", drift: null }),
  step_back: Object.freeze({ animation: "touch_reject", hint: "牠往後退了半步。", drift: Object.freeze({ x: -14, durationMs: 520 }) }),
  look_away: Object.freeze({ animation: "idle_distant", hint: "牠別開了視線。", drift: null }),
  resting: Object.freeze({ animation: "sit", hint: "牠正安靜地休息，先別打擾。", drift: null }),
  approach_softly: Object.freeze({ animation: "touch_accept", hint: "牠正輕輕地向你靠近。", drift: Object.freeze({ x: 10, durationMs: 640 }) })
});

export function getBodyCueProfile(cue) {
  return BODY_CUE_PROFILE[cue] || BODY_CUE_PROFILE.neutral;
}

export function getAmbientWalkAnimation(targetOffsetX, hasAnimation, profile = GREYSHADE_CAT_ANIMATION_PROFILE) {
  const isLeft = targetOffsetX < 0;
  const preferred = isLeft ? profile.ambientWalk.left : profile.ambientWalk.right;
  if (!hasAnimation || hasAnimation(preferred)) {
    return { animationName: preferred, mirrorX: false };
  }

  const fallback = profile.ambientWalk.mirrorFallback;
  return {
    animationName: fallback,
    mirrorX: isLeft && (!hasAnimation || hasAnimation(fallback))
  };
}

// ======================================================================
// Animation intent resolver：gameplay 呼叫「動畫意圖」，而非硬寫動畫名。
// 讓戰鬥/探索/對峙結算可以說 "standoff.stabilized"，由這層解析到實際存在的
// animation ID，並在角色缺該動畫時走 fallback 鏈（最終一定落到 idle_calm）。
// 純資料 + 純函數；hasAnimation 探針由呼叫端提供（通常是 controller.canResolve）。
// ======================================================================
const ANIMATION_INTENT_MAP = Object.freeze({
  "move.left": "left_walk",
  "move.right": "right_walk",
  "move.front": "front_walk",
  "move.back": "back_walk",
  "battle.attack": "attack_basic",
  "battle.skill": "skill_cast",
  "battle.defend": "defend",
  "battle.hit": "hit",
  "battle.defeated": "defeated",
  "battle.victory": "victory",
  "standoff.resonance": "skill_cast",
  "standoff.barrier": "defend",
  "standoff.pulse": "attack_basic",
  "standoff.overwhelmed": "defeated",
  "standoff.stabilized": "victory",
  "standoff.recovered": "victory",
  "standoff.retreat": "back_walk",
  // Return Echo：回歸時播一次的情緒待機 cue（依 tier/state 由 returnBehaviorEngine 決定）。
  "return.calm": "idle_calm",
  "return.happy": "idle_happy",
  "return.distant": "idle_distant",
  "return.sad": "idle_sad",
  "return.rest": "sleep",
  "soul.awaken": "idle_wake",
  "soul.acknowledge": "idle_calm",
  "soul.guarded": "touch_guarded",
  "soul.defensive": "idle_defensive",
  "soul.distant": "idle_distant",
  "soul.happy": "idle_happy",
  "soul.rest": "sleep"
});

const ANIMATION_FALLBACK_CHAINS = Object.freeze({
  left_walk: ["idle_calm"],
  right_walk: ["idle_calm"],
  front_walk: ["right_walk", "idle_calm"],
  back_walk: ["left_walk", "idle_calm"],
  attack_basic: ["skill_cast", "idle_calm"],
  skill_cast: ["attack_basic", "idle_calm"],
  defend: ["idle_defensive", "idle_calm"],
  hit: ["idle_sad", "idle_distant", "idle_calm"],
  defeated: ["idle_sad", "idle_distant", "idle_calm"],
  victory: ["idle_happy", "idle_calm"],
  // Return Echo 情緒待機的安全鏈（缺該圖的夥伴最終一定落到 idle_calm）。
  idle_happy: ["idle_calm"],
  idle_distant: ["idle_calm"],
  idle_sad: ["idle_distant", "idle_calm"],
  sleep: ["idle_distant", "idle_calm"],
  idle_wake: ["idle_calm"],
  touch_guarded: ["idle_calm"]
});

export const ANIMATION_INTENTS = Object.freeze(Object.keys(ANIMATION_INTENT_MAP));

export function resolveAnimationIntent(intent, hasAnimation) {
  const primary = ANIMATION_INTENT_MAP[intent];
  if (!primary) return "idle_calm";
  const candidates = [primary, ...(ANIMATION_FALLBACK_CHAINS[primary] || []), "idle_calm"];
  for (const candidate of candidates) {
    if (!hasAnimation || hasAnimation(candidate)) return candidate;
  }
  return "idle_calm";
}
