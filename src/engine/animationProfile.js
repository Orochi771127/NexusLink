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
