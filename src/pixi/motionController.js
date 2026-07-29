import { getTouchMotionState } from "../engine/touchReactionEngine.js";
import { getAmbientWalkAnimation, getMoodIdleAnimationName } from "../engine/animationProfile.js";
import {
  createMoonlakeRoamingState,
  getMoonlakeFishingOption,
  getMoonlakeWalkPlaybackRate,
  getMoonlakeRoamingSnapshot,
  resetMoonlakeRoamingState,
  snapMoonlakeRoamingToWaypoint,
  stageMoonlakeRoamingSegment,
  updateMoonlakeRoaming
} from "./moonlakeRoamingController.js";
import { getMoonlakePresentationScale } from "./moonlakeNavigationSafety.js";
import EventBus from "../utils/eventBus.js";

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";
const AMBIENT_WALK_STATE = "ambient_walk";
const AMBIENT_COOLDOWN_MIN_MS = 60_000;
const AMBIENT_COOLDOWN_MAX_MS = 180_000;
const AMBIENT_DURATION_MIN_MS = 1_200;
const AMBIENT_DURATION_MAX_MS = 2_500;
const AMBIENT_RANGE_X = 60;
const AMBIENT_RANGE_Y = 15;
// 偶發日常動作（坐下/理毛/伸懶腰/打盹），原地播放、不位移。
const AMBIENT_ACTION_COOLDOWN_MIN_MS = 24_000;
const AMBIENT_ACTION_COOLDOWN_MAX_MS = 70_000;
const AMBIENT_ACTION_DURATION_MIN_MS = 3_500;
const AMBIENT_ACTION_DURATION_MAX_MS = 6_500;
const AMBIENT_ACTION_MOODS = new Set(["calm", "warm", "happy"]);
const TOUCH_ACCEPT_ENVIRONMENT_EVENT_PROGRESS = 0.5;
const FISHING_WAIT_MIN_MS = 8_500;
const FISHING_WAIT_MAX_MS = 14_000;
const FISHING_BITE_DURATION_MS = 950;
const FISHING_SETTLE_DURATION_MS = 850;
const FISHING_VISIBILITY_PAUSE_REASON = "visibility";
const FISHING_INTERACTION_PAUSE_REASON = "interaction_lock";

export function createCompanionMotion(companion, initialMood) {
  const motion = {
    state: getIdleMotionState(initialMood, companion.__animationProfile),
    temporaryState: null,
    temporaryStartedAt: 0,
    temporaryUntil: 0,
    temporaryResolve: null,
    temporaryEnvironmentEventEmitted: false,
    ambientState: null,
    ambientStartedAt: 0,
    ambientUntil: 0,
    ambientNextAt: 0,
    ambientFromOffsetX: 0,
    ambientFromOffsetY: 0,
    ambientTargetOffsetX: 0,
    ambientTargetOffsetY: 0,
    baseX: companion.x,
    baseY: companion.y,
    baseScale: companion.scale.x || 1,
    baseAlpha: companion.alpha,
    baseRotation: companion.rotation || 0,
    devForcedState: null,
    devForcedUntil: 0,
    devForcedMirrorX: false,
    devForcedWaterSide: null,
    devForcedRailOffsetX390: 0,
    ambientActionState: null,
    ambientActionUntil: 0,
    ambientActionNextAt: 0,
    ambientActionMirrorX: false,
    ambientActionWaterSide: null,
    ambientActionRailOffsetX390: 0,
    fishingSequence: null,
    fishingSequenceSerial: 0,
    lastFishingLifecycle: null,
    moonlakeRoaming: createMoonlakeRoamingState(performance.now()),
    moonlakeRoamingResult: null,
    fallbackMotionActive: true,
    getAnimationDurationMs: (animationName) => companion.__animationController?.getAnimationDurationMs(animationName),
    getAnimationController: () => companion.__animationController || null
  };
  scheduleNextAmbientWalk(motion, performance.now(), initialMood);
  scheduleNextAmbientAction(motion, performance.now());
  return motion;
}

export function rebaseCompanionMotion(motion, companion) {
  if (!motion || !companion) return motion;

  motion.baseX = companion.x;
  motion.baseY = companion.y;
  motion.baseScale = companion.scale.x || motion.baseScale || 1;
  motion.baseAlpha = companion.alpha;
  motion.baseRotation = companion.rotation || 0;
  resetMoonlakeRoamingState(motion.moonlakeRoaming, performance.now());
  motion.moonlakeRoamingResult = null;
  return motion;
}

function scheduleNextAmbientAction(motion, nowMs) {
  motion.ambientActionNextAt = nowMs + randomBetween(AMBIENT_ACTION_COOLDOWN_MIN_MS, AMBIENT_ACTION_COOLDOWN_MAX_MS);
}

export function getIdleMotionState(mood, profile) {
  return getMoodIdleAnimationName(mood, profile);
}

export function triggerCompanionTouchMotion(motion, interactionResult = {}) {
  if (!motion) return Promise.resolve();

  const touchState = interactionResult.motionState || getTouchMotionState(interactionResult.reaction);
  resolveTemporaryMotion(motion);
  stopAmbientWalk(motion);
  motion.temporaryState = touchState;
  motion.temporaryStartedAt = performance.now();
  motion.temporaryUntil = motion.temporaryStartedAt + getMotionDurationMs(motion, touchState, 850);
  motion.temporaryEnvironmentEventEmitted = false;
  return new Promise((resolve) => {
    motion.temporaryResolve = resolve;
  });
}

export function playDevMotion(motion, motionState, options = {}) {
  if (!motion || !motionState) return;
  const now = performance.now();
  if (motionState === AMBIENT_WALK_STATE) {
    startAmbientWalk(motion, "calm", now, { forced: true });
    return;
  }
  if (motionState.startsWith("touch_")) {
    stopAmbientWalk(motion);
    motion.temporaryState = motionState;
    motion.temporaryStartedAt = now;
    motion.temporaryUntil = now + getMotionDurationMs(motion, motionState, 950);
    motion.temporaryEnvironmentEventEmitted = false;
    return;
  }
  const mirrorX = Boolean(options.mirrorX);
  const fishingOption = motionState.startsWith("fishing_")
    ? getMoonlakeFishingOption(
      motion.moonlakeRoaming?.currentId,
      motionState,
      mirrorX
    )
    : null;
  if (fishingOption || motionState.startsWith("fishing_")) {
    startFishingSequence(
      motion,
      {
        animationName: motionState,
        mirrorX,
        waterSide: options.waterSide || fishingOption?.waterSide || null,
        railOffsetX390: Number(options.railOffsetX390 ?? fishingOption?.railOffsetX390) || 0
      },
      now,
      {
        waitDurationMs: Number(options.durationMs) || 10_000,
        durationScale: Number(options.lifecycleScale) || 1
      }
    );
    return;
  }
  motion.devForcedState = motionState;
  motion.devForcedMirrorX = mirrorX;
  motion.devForcedWaterSide = options.waterSide || fishingOption?.waterSide || null;
  motion.devForcedRailOffsetX390 = Number(
    options.railOffsetX390 ?? fishingOption?.railOffsetX390
  ) || 0;
  motion.devForcedUntil = now + (
    Number(options.durationMs)
    || (motionState === "blink" ? getMotionDurationMs(motion, motionState, 700) : 3000)
  );
}

export function updateCompanionMotion(companion, motion, timeSeconds, nowMs, mood, onStateChange = () => {}, options = {}) {
  const interactionLocked = Boolean(
    companion.__interactionController?.isAnimationLocked?.()
  );
  setCompanionFishingPaused(
    motion,
    FISHING_VISIBILITY_PAUSE_REASON,
    options.lifecycleActive === false,
    nowMs
  );
  setCompanionFishingPaused(
    motion,
    FISHING_INTERACTION_PAUSE_REASON,
    interactionLocked,
    nowMs
  );
  if (interactionLocked) {
    stopAmbientWalk(motion);
    motion.temporaryState = null;
    motion.devForcedState = null;
    motion.devForcedMirrorX = false;
    motion.devForcedWaterSide = null;
    motion.devForcedRailOffsetX390 = 0;
    motion.fallbackMotionActive = false;
    const lockedAnimationName = companion.__animationController?.getCurrentAnimationName?.()
      || motion.state;
    const roamingResult = motion.moonlakeRoamingResult;
    const projectedX = Number(roamingResult?.projected?.x);
    const projectedY = Number(roamingResult?.projected?.y);
    if (
      roamingResult?.projectionReady
      && Number.isFinite(projectedX)
      && Number.isFinite(projectedY)
    ) {
      companion.scale.set(
        motion.baseScale
        * roamingResult.scaleMultiplier
        * getMoonlakePresentationScale(
          options.companionId,
          roamingResult.area,
          lockedAnimationName
        )
      );
      placeCompanionAtOpaqueFoot(companion, projectedX, projectedY);
    }
    onStateChange(lockedAnimationName);
    return;
  }

  motion.state = getIdleMotionState(mood, companion.__animationProfile);
  if (motion.temporaryState && nowMs >= motion.temporaryUntil) {
    motion.temporaryState = null;
    motion.temporaryStartedAt = 0;
    motion.temporaryUntil = 0;
    resolveTemporaryMotion(motion);
  }
  if (motion.devForcedState && nowMs >= motion.devForcedUntil) {
    motion.devForcedState = null;
    motion.devForcedUntil = 0;
    motion.devForcedMirrorX = false;
    motion.devForcedWaterSide = null;
    motion.devForcedRailOffsetX390 = 0;
  }

  const canAmbientWalk = options.canAmbientWalk !== false;
  const isBattleActive = Boolean(options.isBattleActive);
  const isSleeping = Boolean(options.isSleeping);
  const animationController = companion.__animationController;
  const canResolveAnimation = (name) => animationController?.canResolve
    ? animationController.canResolve(name)
    : animationController?.hasAnimation?.(name);
  const canRoam = options.activeHabitatId === "moonlake"
    && canAmbientWalk
    && !motion.temporaryState
    && !motion.devForcedState
    && !motion.ambientActionState
    && !motion.fishingSequence
    && !isBattleActive
    && !isSleeping;
  const roamingResult = updateMoonlakeRoaming(motion.moonlakeRoaming, {
    deltaMs: options.deltaMs,
    nowMs,
    mood,
    canRoam,
    reducedMotion: Boolean(options.reducedMotion),
    companionId: options.companionId,
    canResolve: canResolveAnimation,
    projectWorldPoint: options.projectWorldPoint
  });
  motion.moonlakeRoamingResult = roamingResult;
  const isRoamingReady = roamingResult.ready
    && roamingResult.projectionReady
    && (
      roamingResult.enabled
      || roamingResult.reason === "reduced_motion"
      || roamingResult.reason === "blocked"
    );
  const isAmbientBlocked = !canAmbientWalk
    || Boolean(motion.temporaryState)
    || isBattleActive
    || isSleeping
    || mood === "tired"
    || isRoamingReady
    || companion.__animationProfile?.ambientWalkEnabled === false;

  if (motion.ambientState && (isAmbientBlocked || nowMs >= motion.ambientUntil)) {
    stopAmbientWalk(motion);
    scheduleNextAmbientWalk(motion, nowMs, mood);
  }
  if (!motion.ambientState && !motion.devForcedState && !isAmbientBlocked && nowMs >= motion.ambientNextAt) {
    maybeStartAmbientWalk(motion, mood, nowMs);
  }

  // 偶發日常動作（原地、不位移）：閒置且心情平穩時，偶爾坐下/理毛/伸懶腰/打盹。
  const profileAmbientActions = companion.__animationProfile?.ambientActions || [];
  const configuredFishingOptions = roamingResult.isFishingSpot
    && Array.isArray(roamingResult.fishingOptions)
    ? roamingResult.fishingOptions
    : [];
  const legacyHabitatActions = roamingResult.isFishingSpot
    && configuredFishingOptions.length === 0
    && Array.isArray(options.ambientActions)
    ? options.ambientActions.map((animationName) => ({
      animationName,
      mirrorX: false,
      waterSide: null
    }))
    : [];
  const habitatAmbientActions = configuredFishingOptions.length > 0
    ? configuredFishingOptions
    : legacyHabitatActions;
  const ambientActions = habitatAmbientActions.length > 0
    ? [...profileAmbientActions, ...habitatAmbientActions]
    : profileAmbientActions;
  const isBusy = !canAmbientWalk
    || Boolean(motion.temporaryState)
    || isBattleActive
    || isSleeping
    || Boolean(motion.ambientState)
    || Boolean(roamingResult.moving);
  if (motion.fishingSequence && isBusy) {
    const interruptionReason = !canAmbientWalk
      ? "ambient_walk_disabled"
      : motion.temporaryState
        ? "touch_motion"
        : isBattleActive
          ? "battle"
          : isSleeping
            ? "sleep"
            : motion.ambientState
              ? "ambient_walk"
              : "roaming";
    stopFishingSequence(motion, nowMs, "interrupted", interruptionReason);
  } else if (motion.fishingSequence) {
    advanceFishingSequence(motion, nowMs);
  }
  if (motion.ambientActionState && (isBusy || nowMs >= motion.ambientActionUntil)) {
    motion.ambientActionState = null;
    motion.ambientActionMirrorX = false;
    motion.ambientActionWaterSide = null;
    motion.ambientActionRailOffsetX390 = 0;
    scheduleNextAmbientAction(motion, nowMs);
  }
  if (
    !motion.ambientActionState && !motion.fishingSequence && !motion.devForcedState && !isBusy &&
    ambientActions.length > 0 && AMBIENT_ACTION_MOODS.has(mood) && nowMs >= motion.ambientActionNextAt
  ) {
    const candidate = ambientActions[Math.floor(Math.random() * ambientActions.length)];
    const action = normalizeAmbientActionCandidate(candidate);
    if (action.animationName.startsWith("fishing_")) {
      startFishingSequence(motion, action, nowMs);
    } else {
      motion.ambientActionState = action.animationName;
      motion.ambientActionMirrorX = action.mirrorX;
      motion.ambientActionWaterSide = action.waterSide;
      motion.ambientActionRailOffsetX390 = action.railOffsetX390;
      motion.ambientActionUntil = nowMs + randomBetween(AMBIENT_ACTION_DURATION_MIN_MS, AMBIENT_ACTION_DURATION_MAX_MS);
      scheduleNextAmbientAction(motion, nowMs);
    }
  }

  const ambientAnimation = motion.ambientState
    ? getAmbientWalkAnimation(
      motion.ambientTargetOffsetX,
      motion.ambientTargetOffsetY,
      (name) => companion.__animationController?.canResolve?.(name),
      companion.__animationProfile
    )
    : null;
  const activeState = motion.temporaryState ||
    (isBattleActive ? "battle" : null) ||
    (isSleeping ? "sleep" : null) ||
    motion.fishingSequence?.animationName ||
    motion.devForcedState ||
    motion.ambientActionState ||
    roamingResult.animationName ||
    ambientAnimation?.animationName ||
    motion.state;
  let spriteAnimationPlayed = false;
  if (animationController?.hasAnimation?.(activeState)) {
    const mirrorX = motion.devForcedState
      ? motion.devForcedMirrorX
      : motion.fishingSequence
        ? motion.fishingSequence.mirrorX
      : motion.ambientActionState
        ? motion.ambientActionMirrorX
        : Boolean(ambientAnimation?.mirrorX);
    const fishingPlayback = getFishingPlaybackOptions(motion.fishingSequence);
    const walkPlaybackRate = roamingResult.moving && activeState.endsWith("_walk")
      ? getMoonlakeWalkPlaybackRate({
        companionId: options.companionId,
        animationDurationMs: animationController.getAnimationDurationMs?.(activeState),
        projectedSpeedPxPerSecond: roamingResult.projectedSpeedPxPerSecond,
        projectedScale: roamingResult.projected?.scale,
        referenceScale390: roamingResult.projected?.referenceScale390
      })
      : 1;
    spriteAnimationPlayed = animationController.play(activeState, {
      mood,
      mirrorX,
      playbackRate: fishingPlayback?.playbackRate || walkPlaybackRate,
      ...(fishingPlayback || {})
    });
  } else {
    animationController?.loadAnimation?.(activeState).catch((error) => {
      console.warn(`Companion motion lazy load failed: ${activeState}`, error);
    });
  }
  const transform = motion.temporaryState
    ? getTemporaryMotionTransform(activeState, motion, nowMs)
    : isRoamingReady
      ? getMoonlakeRoamingTransform(roamingResult, activeState, timeSeconds, motion)
      : motion.ambientState
      ? getAmbientWalkTransform(motion, nowMs)
      : getIdleMotionTransform(activeState, timeSeconds);

  companion.scale.set(motion.baseScale * transform.scaleMultiplier);
  if (
    Number.isFinite(transform.footTargetX)
    && Number.isFinite(transform.footTargetY)
  ) {
    placeCompanionAtOpaqueFoot(
      companion,
      transform.footTargetX,
      transform.footTargetY
    );
  } else {
    companion.x = motion.baseX + transform.offsetX;
    companion.y = motion.baseY + transform.offsetY;
  }
  companion.alpha = motion.baseAlpha * transform.alphaMultiplier;
  companion.rotation = motion.baseRotation + transform.rotation;
  maybeEmitTemporaryEnvironmentInteraction(activeState, motion, companion, nowMs);
  motion.fallbackMotionActive = !spriteAnimationPlayed;
  onStateChange(activeState);
}

function placeCompanionAtOpaqueFoot(companion, targetX, targetY) {
  const opaqueFoot = companion.__opaqueFoot || { x: 0, y: 0 };
  companion.x = targetX - Number(opaqueFoot.x || 0) * companion.scale.x;
  companion.y = targetY - Number(opaqueFoot.y || 0) * companion.scale.y;
}

export function getCompanionRoamingSnapshot(motion) {
  if (!motion) return null;
  const fishingAnimationName = motion.fishingSequence?.animationName
    || (motion.devForcedState?.startsWith("fishing_")
    ? motion.devForcedState
    : motion.ambientActionState?.startsWith("fishing_")
      ? motion.ambientActionState
      : null);
  const fishingPhaseProgress = motion.fishingSequence
    ? getFishingPhaseProgress(motion.fishingSequence, performance.now())
    : null;
  return {
    ...getMoonlakeRoamingSnapshot(motion.moonlakeRoaming),
    ...(motion.moonlakeRoamingResult || {}),
    lastFishingLifecycle: motion.lastFishingLifecycle
      ? {
        ...motion.lastFishingLifecycle,
        phases: [...motion.lastFishingLifecycle.phases]
      }
      : null,
    fishing: fishingAnimationName
      ? {
        animationName: fishingAnimationName,
        mirrorX: motion.fishingSequence
          ? Boolean(motion.fishingSequence.mirrorX)
          : motion.devForcedState
          ? Boolean(motion.devForcedMirrorX)
          : Boolean(motion.ambientActionMirrorX),
        waterSide: motion.fishingSequence
          ? motion.fishingSequence.waterSide
          : motion.devForcedState
          ? motion.devForcedWaterSide
          : motion.ambientActionWaterSide,
        railOffsetX390: motion.fishingSequence
          ? motion.fishingSequence.railOffsetX390
          : motion.devForcedState
          ? motion.devForcedRailOffsetX390
          : motion.ambientActionRailOffsetX390,
        phase: motion.fishingSequence?.phase || "legacy",
        phaseProgress: fishingPhaseProgress,
        paused: Boolean(motion.fishingSequence?.pausedAt),
        pauseReasons: [...(motion.fishingSequence?.pauseReasons || [])]
      }
      : null
  };
}

export function setCompanionFishingPaused(
  motion,
  reason,
  paused,
  nowMs = performance.now()
) {
  const sequence = motion?.fishingSequence;
  if (!sequence || !reason) return false;
  const pauseReasons = sequence.pauseReasons instanceof Set
    ? sequence.pauseReasons
    : new Set(sequence.pauseReasons || []);
  sequence.pauseReasons = pauseReasons;

  if (paused) {
    pauseReasons.add(reason);
    if (!sequence.pausedAt) sequence.pausedAt = nowMs;
    return true;
  }

  pauseReasons.delete(reason);
  if (pauseReasons.size > 0 || !sequence.pausedAt) return true;
  const pausedDurationMs = Math.max(0, nowMs - sequence.pausedAt);
  sequence.phaseStartedAt += pausedDurationMs;
  sequence.phaseUntil += pausedDurationMs;
  sequence.pausedAt = 0;
  return true;
}

export function snapCompanionRoamingToWaypoint(motion, waypointId, nowMs = performance.now()) {
  if (!motion?.moonlakeRoaming) return false;
  const snapped = snapMoonlakeRoamingToWaypoint(
    motion.moonlakeRoaming,
    waypointId,
    nowMs
  );
  if (snapped) motion.moonlakeRoamingResult = null;
  return snapped;
}

export function stageCompanionRoamingSegment(
  motion,
  fromWaypointId,
  toWaypointId,
  progress = 0
) {
  if (!motion?.moonlakeRoaming) return false;
  const staged = stageMoonlakeRoamingSegment(
    motion.moonlakeRoaming,
    fromWaypointId,
    toWaypointId,
    progress
  );
  if (staged) motion.moonlakeRoamingResult = null;
  return staged;
}

function getMotionDurationMs(motion, motionState, fallbackDurationMs) {
  return motion?.getAnimationDurationMs?.(motionState) || fallbackDurationMs;
}

function normalizeAmbientActionCandidate(candidate) {
  if (typeof candidate === "string") {
    return {
      animationName: candidate,
      mirrorX: false,
      waterSide: null,
      railOffsetX390: 0
    };
  }
  return {
    animationName: candidate?.animationName || "idle_calm",
    mirrorX: Boolean(candidate?.mirrorX),
    waterSide: candidate?.waterSide || null,
    railOffsetX390: Number(candidate?.railOffsetX390) || 0
  };
}

function startFishingSequence(motion, action, nowMs, {
  waitDurationMs = null,
  durationScale = 1
} = {}) {
  const normalizedDurationScale = Math.min(1, Math.max(0.02, durationScale));
  const castDurationMs = getMotionDurationMs(
    motion,
    action.animationName,
    1_350
  ) * normalizedDurationScale;
  const baseWaitDurationMs = Math.max(
    FISHING_WAIT_MIN_MS,
    Number(waitDurationMs) || randomBetween(FISHING_WAIT_MIN_MS, FISHING_WAIT_MAX_MS)
  );
  motion.devForcedState = null;
  motion.devForcedUntil = 0;
  motion.devForcedMirrorX = false;
  motion.devForcedWaterSide = null;
  motion.devForcedRailOffsetX390 = 0;
  motion.ambientActionState = null;
  motion.ambientActionUntil = 0;
  motion.fishingSequence = {
    id: ++motion.fishingSequenceSerial,
    animationName: action.animationName,
    mirrorX: Boolean(action.mirrorX),
    waterSide: action.waterSide || null,
    railOffsetX390: Number(action.railOffsetX390) || 0,
    phase: "cast",
    phaseStartedAt: nowMs,
    phaseUntil: nowMs + castDurationMs,
    phaseDurationMs: castDurationMs,
    durationScale: normalizedDurationScale,
    pausedAt: 0,
    pauseReasons: new Set(),
    phases: ["cast"],
    waitDurationMs: baseWaitDurationMs * normalizedDurationScale
  };
}

function advanceFishingSequence(motion, nowMs) {
  const sequence = motion.fishingSequence;
  if (
    !sequence
    || sequence.pausedAt
    || sequence.pauseReasons?.size > 0
    || nowMs < sequence.phaseUntil
  ) {
    return;
  }
  if (sequence.phase === "cast") {
    setFishingPhase(sequence, "wait", nowMs, sequence.waitDurationMs);
    return;
  }
  if (sequence.phase === "wait") {
    setFishingPhase(
      sequence,
      "bite",
      nowMs,
      FISHING_BITE_DURATION_MS * sequence.durationScale
    );
    return;
  }
  if (sequence.phase === "bite") {
    setFishingPhase(
      sequence,
      "reel",
      nowMs,
      getMotionDurationMs(motion, sequence.animationName, 1_350)
        * sequence.durationScale
    );
    return;
  }
  if (sequence.phase === "reel") {
    setFishingPhase(
      sequence,
      "settle",
      nowMs,
      FISHING_SETTLE_DURATION_MS * sequence.durationScale
    );
    return;
  }
  stopFishingSequence(motion, nowMs);
}

function setFishingPhase(sequence, phase, nowMs, durationMs) {
  sequence.phase = phase;
  sequence.phases.push(phase);
  sequence.phaseStartedAt = nowMs;
  sequence.phaseDurationMs = Math.max(1, durationMs);
  sequence.phaseUntil = nowMs + sequence.phaseDurationMs;
}

function stopFishingSequence(
  motion,
  nowMs,
  status = "completed",
  reason = null
) {
  if (!motion.fishingSequence) return;
  const sequence = motion.fishingSequence;
  motion.lastFishingLifecycle = {
    id: sequence.id,
    animationName: sequence.animationName,
    mirrorX: sequence.mirrorX,
    waterSide: sequence.waterSide,
    phases: [...sequence.phases, status === "completed" ? "idle" : status],
    status,
    reason,
    completedAt: nowMs
  };
  motion.fishingSequence = null;
  scheduleNextAmbientAction(motion, nowMs);
}

function getFishingPhaseProgress(sequence, nowMs) {
  if (!sequence) return 0;
  const duration = Math.max(1, sequence.phaseDurationMs);
  const effectiveNow = sequence.pausedAt || nowMs;
  return Math.min(1, Math.max(0, (effectiveNow - sequence.phaseStartedAt) / duration));
}

function getFishingPlaybackOptions(sequence) {
  if (!sequence) return null;
  const restartKey = `fishing:${sequence.phase}:${sequence.phaseStartedAt}`;
  if (sequence.phase === "cast") {
    return {
      loop: false,
      holdOnComplete: true,
      playbackRate: 1,
      restartKey
    };
  }
  if (sequence.phase === "reel") {
    return {
      loop: false,
      reverse: true,
      holdOnComplete: true,
      playbackRate: 1.05,
      restartKey
    };
  }
  return {
    loop: false,
    holdFrame: "last",
    playbackRate: 1,
    restartKey
  };
}

function resolveTemporaryMotion(motion) {
  if (!motion?.temporaryResolve) return;
  const resolve = motion.temporaryResolve;
  motion.temporaryResolve = null;
  resolve();
}

function maybeEmitTemporaryEnvironmentInteraction(activeState, motion, companion, nowMs) {
  if (
    activeState !== "touch_accept" ||
    !motion.temporaryState ||
    motion.temporaryEnvironmentEventEmitted
  ) {
    return;
  }

  if (getTemporaryMotionProgress(motion, nowMs) < TOUCH_ACCEPT_ENVIRONMENT_EVENT_PROGRESS) {
    return;
  }

  motion.temporaryEnvironmentEventEmitted = true;
  EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, {
    type: "crystal_touch",
    color: "#00CED1",
    x: companion.x,
    y: companion.y
  });
}

function getTemporaryMotionProgress(motion, nowMs) {
  const duration = Math.max(1, motion.temporaryUntil - motion.temporaryStartedAt);
  return Math.min(1, Math.max(0, (nowMs - motion.temporaryStartedAt) / duration));
}

function scheduleNextAmbientWalk(motion, nowMs, mood) {
  if (mood === "tired") {
    motion.ambientNextAt = Number.POSITIVE_INFINITY;
    return;
  }
  motion.ambientNextAt = nowMs + randomBetween(AMBIENT_COOLDOWN_MIN_MS, AMBIENT_COOLDOWN_MAX_MS);
}

function maybeStartAmbientWalk(motion, mood, nowMs) {
  const moodPolicy = getAmbientMoodPolicy(mood);
  if (moodPolicy.chance <= 0 || Math.random() > moodPolicy.chance) {
    scheduleNextAmbientWalk(motion, nowMs, mood);
    return;
  }
  startAmbientWalk(motion, mood, nowMs);
}

function startAmbientWalk(motion, mood, nowMs, { forced = false } = {}) {
  const moodPolicy = getAmbientMoodPolicy(mood);
  if (!forced && moodPolicy.chance <= 0) {
    scheduleNextAmbientWalk(motion, nowMs, mood);
    return;
  }

  motion.ambientState = AMBIENT_WALK_STATE;
  motion.ambientStartedAt = nowMs;
  motion.ambientUntil = nowMs + randomBetween(AMBIENT_DURATION_MIN_MS, AMBIENT_DURATION_MAX_MS);
  motion.ambientFromOffsetX = 0;
  motion.ambientFromOffsetY = 0;
  motion.ambientTargetOffsetX = randomBetween(-AMBIENT_RANGE_X, AMBIENT_RANGE_X) * moodPolicy.rangeMultiplier;
  motion.ambientTargetOffsetY = randomBetween(-AMBIENT_RANGE_Y, AMBIENT_RANGE_Y) * moodPolicy.rangeMultiplier;
}

function stopAmbientWalk(motion) {
  motion.ambientState = null;
  motion.ambientStartedAt = 0;
  motion.ambientUntil = 0;
  motion.ambientFromOffsetX = 0;
  motion.ambientFromOffsetY = 0;
  motion.ambientTargetOffsetX = 0;
  motion.ambientTargetOffsetY = 0;
}

function getAmbientMoodPolicy(mood) {
  const policies = {
    calm: { chance: 0.45, rangeMultiplier: 1 },
    happy: { chance: 0.65, rangeMultiplier: 1 },
    warm: { chance: 0.65, rangeMultiplier: 1 },
    defensive: { chance: 0.08, rangeMultiplier: 0.65 },
    distant: { chance: 0.18, rangeMultiplier: 0.55 },
    sad: { chance: 0.18, rangeMultiplier: 0.55 },
    tired: { chance: 0, rangeMultiplier: 0 }
  };
  return policies[mood] || policies.calm;
}

function getAmbientWalkTransform(motion, nowMs) {
  const duration = Math.max(1, motion.ambientUntil - motion.ambientStartedAt);
  const progress = Math.min(1, Math.max(0, (nowMs - motion.ambientStartedAt) / duration));
  const easedProgress = easeInOutSine(progress);
  const returnProgress = Math.sin(progress * Math.PI);
  return {
    offsetX: motion.ambientFromOffsetX + (motion.ambientTargetOffsetX - motion.ambientFromOffsetX) * returnProgress,
    offsetY: motion.ambientFromOffsetY + (motion.ambientTargetOffsetY - motion.ambientFromOffsetY) * returnProgress - 1.5 * easedProgress,
    scaleMultiplier: 1,
    alphaMultiplier: 1,
    rotation: 0.006 * Math.sin(easedProgress * Math.PI * 2)
  };
}

function getMoonlakeRoamingTransform(roamingResult, activeState, timeSeconds, motion) {
  const idle = roamingResult.moving
    ? { offsetX: 0, offsetY: 0, scaleMultiplier: 1, alphaMultiplier: 1, rotation: 0 }
    : getIdleMotionTransform(activeState, timeSeconds);
  const projectedX = Number(roamingResult.projected?.x);
  const projectedY = Number(roamingResult.projected?.y);
  const referenceScale390 = Number(roamingResult.projected?.referenceScale390) || 1;
  const railOffsetX390 = motion.devForcedState?.startsWith("fishing_")
    ? motion.devForcedRailOffsetX390
    : motion.fishingSequence
      ? motion.fishingSequence.railOffsetX390
    : motion.ambientActionState?.startsWith("fishing_")
      ? motion.ambientActionRailOffsetX390
      : 0;
  return {
    offsetX: (Number.isFinite(projectedX) ? projectedX - motion.baseX : 0)
      + railOffsetX390 * referenceScale390
      + idle.offsetX,
    offsetY: (Number.isFinite(projectedY) ? projectedY - motion.baseY : 0) + idle.offsetY,
    footTargetX: Number.isFinite(projectedX)
      ? projectedX + railOffsetX390 * referenceScale390 + idle.offsetX
      : null,
    footTargetY: Number.isFinite(projectedY)
      ? projectedY + idle.offsetY
      : null,
    scaleMultiplier: roamingResult.scaleMultiplier
      * getMoonlakePresentationScale(
        roamingResult.companionId,
        roamingResult.area,
        activeState
      )
      * idle.scaleMultiplier,
    alphaMultiplier: idle.alphaMultiplier,
    rotation: idle.rotation
  };
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getIdleMotionTransform(motionState, timeSeconds) {
  if (motionState === "idle_defensive") {
    const breath = Math.sin(timeSeconds * 1.7);
    return {
      offsetX: 0,
      offsetY: 2 + breath * 1.6,
      scaleMultiplier: 0.985 + breath * 0.004,
      alphaMultiplier: 1,
      rotation: 0
    };
  }

  if (motionState === "idle_distant") {
    const breath = Math.sin(timeSeconds * 0.9);
    return {
      offsetX: 0,
      offsetY: -5 + breath * 1.05,
      scaleMultiplier: 0.955 + breath * 0.0025,
      alphaMultiplier: 0.9,
      rotation: 0
    };
  }

  const breath = Math.sin(timeSeconds * 1.55);
  return {
    offsetX: 0,
    offsetY: breath * 2.5,
    scaleMultiplier: 1 + breath * 0.007,
    alphaMultiplier: 1,
    rotation: 0
  };
}

function getTemporaryMotionTransform(motionState, motion, nowMs) {
  const progress = getTemporaryMotionProgress(motion, nowMs);
  const pulse = Math.sin(progress * Math.PI);
  const settle = 1 - progress;

  if (motionState === "touch_accept") {
    const relaxedReturn = Math.sin(Math.min(1, progress * 0.82) * Math.PI);
    return {
      offsetX: 0,
      offsetY: -7 * relaxedReturn + 1 * settle,
      scaleMultiplier: 1 + 0.018 * relaxedReturn,
      alphaMultiplier: 1,
      rotation: 0.007 * Math.sin(progress * Math.PI * 1.5)
    };
  }

  if (motionState === "touch_reject") {
    const shake = Math.sin(progress * Math.PI * 8) * settle;
    const flicker = progress < 0.55 ? Math.sin(progress * Math.PI * 12) * 0.035 : 0;
    return {
      offsetX: -6 * pulse + 1.6 * shake,
      offsetY: 5 * pulse + 2 * settle,
      scaleMultiplier: 0.97 - 0.01 * pulse,
      alphaMultiplier: 0.96 + flicker,
      rotation: -0.012 * pulse + 0.004 * shake
    };
  }

  const pause = progress < 0.28 ? 1 : settle;
  return {
    offsetX: -2.5 * pulse,
    offsetY: 2.5 * pulse + 1.5 * pause,
    scaleMultiplier: 0.986 + 0.004 * pulse,
    alphaMultiplier: 1,
    rotation: -0.004 * pulse
  };
}
