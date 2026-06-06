const warnedFallbacks = new Set();

export const GREYSHADE_CAT_ANIMATION_PROFILE = Object.freeze({
  moodIdle: Object.freeze({
    calm: "idle_calm",
    warm: "idle_calm",
    happy: "idle_happy",
    defensive: "idle_defensive",
    distant: "idle_distant",
    sad: "idle_sad",
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
