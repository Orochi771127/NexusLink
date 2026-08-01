/**
 * 心核迴旋戰 — 單軌道 session 引擎（純邏輯，不碰 DOM）
 *
 * 狀態：aiming → spinning → resolved
 * R2：支援 stage 目標 clear / survive / reach_anchor 與護盾柱。
 */

import {
  AVATAR_RADIUS,
  DEFAULT_FRICTION,
  DEFAULT_SPIN_DECAY,
  DUMMY_RADIUS,
  HYBRID_SPIN_PHASES,
  ORBIT_PHYSICS_MODELS,
  PHYSICS_FIXED_DT,
  collideBodies,
  collidePillars,
  createBody,
  launchVelocityFromPull,
  planFixedPhysicsSteps,
  stepBody
} from "./orbitPhysics.js";
import { getOrbitPathLabel } from "../data/orbit/stages/index.js";
import { companionLineForOutcome, mapOrbitResultToOutcome } from "./orbitOutcomes.js";
import { applyOrbitBoundaryResonance } from "./orbitBoundaryResonance.js";

const MAX_SPIN_SECONDS = 45; // R6：場次更短促，避免長時間漂移感

function deriveObjectives(stage, goal) {
  if (Array.isArray(stage?.objectives) && stage.objectives.length > 0) {
    return stage.objectives.map((entry) => ({ ...entry }));
  }
  if (goal === "collect_then_resonate") {
    return [
      { type: "collect_motes", ordered: true },
      { type: "resonate_zone" }
    ];
  }
  if (goal === "survive") {
    return [{ type: "survive", seconds: stage?.surviveSeconds || 0 }];
  }
  if (goal === "reach_anchor") return [{ type: "reach_anchor" }];
  return [{ type: "clear_noise" }];
}

function cloneOrbitEmbodiment(input) {
  if (!input || !Array.isArray(input.options) || input.options.length === 0) {
    return null;
  }
  const options = input.options
    .filter((option) => option?.id && option?.normalizedPhysicsProfile)
    .map((option) => ({
      ...option,
      normalizedPhysicsProfile: {
        ...option.normalizedPhysicsProfile
      }
    }));
  if (options.length === 0) return null;
  const selectedMode = options.some(
    (option) => option.id === input.selectedMode
  )
    ? input.selectedMode
    : options[0].id;
  return {
    ...input,
    selectedMode,
    options
  };
}

function applyEmbodimentToPlayer(basePlayer, embodimentBase, option) {
  const profile = option?.normalizedPhysicsProfile || {};
  return {
    ...basePlayer,
    radius:
      embodimentBase.radius *
      Math.max(0.7, Math.min(1.35, Number(profile.collisionRadius) || 1)),
    inertiaScale:
      embodimentBase.inertiaScale *
      Math.max(0.5, Math.min(1.5, Number(profile.inertia) || 1)),
    speedCap:
      embodimentBase.speedCap *
      Math.max(0.65, Math.min(1.25, Number(profile.speedCap) || 1)),
    spinRetentionScale: Math.max(
      0.65,
      Math.min(1.35, Number(profile.spinRetention) || 1)
    ),
    turnAuthorityScale: Math.max(
      0.65,
      Math.min(1.35, Number(profile.turnAuthority) || 1)
    ),
    signalReachScale: Math.max(
      0.65,
      Math.min(1.35, Number(profile.signalReach) || 1)
    )
  };
}

/**
 * @param {{
 *  stats: { impact: number, spin: number, guard: number, burst: number, overheat: number },
 *  stage?: object,
 *  arena?: { id?: string, pathLabel?: string, dummyName?: string, dummyGuardBonus?: number },
 *  personaBias?: 'comfort' | 'eager',
 *  sandbox?: boolean,
 *  prototypeSlice?: boolean,
 *  nonPersistent?: boolean,
 *  attunement?: object,
 *  embodiment?: object
 * }} opts
 */
export function createOrbitSession(opts = {}) {
  const stats = opts.stats || {
    impact: 40,
    spin: 40,
    guard: 40,
    burst: 20,
    overheat: 10
  };
  const stage = opts.stage || null;
  const arena = opts.arena || {};
  const physicsModel =
    opts.physicsModel || ORBIT_PHYSICS_MODELS.baseline;

  const pathLabel = stage
    ? getOrbitPathLabel(stage.regionId)
    : arena.pathLabel || "月湖路徑";
  const dummyName = stage?.dummyName || arena.dummyName || "訓練雜訊結";
  const arenaRadius = stage?.arenaRadius ?? 1;
  const pillars = Array.isArray(stage?.pillars) ? stage.pillars : [];
  const goal = stage?.goal || "clear";
  const objectives = deriveObjectives(stage, goal);
  const usesObjectiveSequence =
    (Array.isArray(stage?.objectives) && stage.objectives.length > 0) ||
    goal === "collect_then_resonate";
  const surviveSeconds = stage?.surviveSeconds || 0;
  const anchor = stage?.anchor || null;
  const playerStart = stage?.playerStart || { x: 0, y: 0.55 };
  const dummyStart = stage?.dummyStart || { x: 0, y: -0.25 };
  const dummyEnabled = stage?.dummyEnabled !== false;
  const physicsTuning = stage?.physicsTuning || {};
  const collisionTuning = stage?.collisionTuning || {};
  const memoryMotes = Array.isArray(stage?.memoryMotes)
    ? stage.memoryMotes.map((mote, index) => ({
        ...mote,
        order: index,
        collected: false
      }))
    : [];
  const launchStances = Array.isArray(stage?.launchStances)
    ? stage.launchStances
        .filter((stance) => stance?.id && stance?.label)
        .map((stance) => ({ ...stance }))
    : [];
  const attunement =
    opts.attunement?.canStart === true
      ? { ...opts.attunement }
      : null;
  const defaultLaunchStanceId =
    launchStances.find(
      (stance) => stance.id === attunement?.proposedStanceId
    )?.id ||
    launchStances.find(
      (stance) => stance.id === stage?.defaultLaunchStanceId
    )?.id ||
    launchStances[0]?.id ||
    null;
  const resonancePulse =
    stage?.resonancePulse?.enabled === true
      ? { ...stage.resonancePulse }
      : null;
  const boundaryResonance =
    stage?.boundaryResonance?.chargeBudget > 0
      ? {
          ...stage.boundaryResonance,
          rails: Array.isArray(stage.boundaryResonance.rails)
            ? stage.boundaryResonance.rails.map((rail) => ({ ...rail }))
            : []
        }
      : null;
  const boundaryChargeBudget = Math.max(
    0,
    Math.floor(boundaryResonance?.chargeBudget || 0)
  );
  const sandbox = opts.sandbox === true;
  const prototypeSlice = opts.prototypeSlice === true;
  const nonPersistent =
    opts.nonPersistent === true || sandbox || prototypeSlice;

  const playerStability = Math.round(72 + stats.guard * 0.22 - stats.overheat * 0.12);
  const baseDummy = stage?.dummyStability ?? 78;
  const dummyStability = Math.round(baseDummy + (stage?.dummyGuardBonus || arena.dummyGuardBonus || 0));
  const embodiment = cloneOrbitEmbodiment(opts.embodiment);
  const basePlayer = createBody({
    id: "avatar",
    x: playerStart.x,
    y: playerStart.y,
    spin: stats.spin,
    stability: Math.max(40, Math.min(100, playerStability)),
    radius: AVATAR_RADIUS,
    team: "player",
    physicsModel,
    spinDirection: 1,
    tilt: physicsModel === ORBIT_PHYSICS_MODELS.hybridSpin ? 0.08 : 0.06,
    driveScale:
      Number.isFinite(physicsTuning.driveScale)
        ? physicsTuning.driveScale
        : 1,
    driveTargetSpeed:
      Number.isFinite(physicsTuning.driveTargetSpeed)
        ? physicsTuning.driveTargetSpeed
        : undefined,
    speedCap:
      Number.isFinite(physicsTuning.speedCap)
        ? physicsTuning.speedCap
        : undefined
  });
  const embodimentBase = Object.freeze({
    radius: basePlayer.radius,
    inertiaScale: basePlayer.inertiaScale,
    speedCap: basePlayer.speedCap
  });
  const selectedEmbodimentOption = embodiment?.options.find(
    (option) => option.id === embodiment.selectedMode
  ) || null;
  const player = selectedEmbodimentOption
    ? applyEmbodimentToPlayer(
        basePlayer,
        embodimentBase,
        selectedEmbodimentOption
      )
    : basePlayer;

  return {
    phase: "aiming",
    elapsed: 0,
    physicsAccumulator: 0,
    physicsModel,
    sandbox,
    prototypeSlice,
    nonPersistent,
    hits: 0,
    stageId: stage?.id || arena.id || null,
    stageTitle: stage?.title || arena.title || "訓練軌道",
    goalLabel: stage?.goalLabel || "清掉雜訊結",
    pathLabel,
    dummyName,
    goal,
    objectives,
    usesObjectiveSequence,
    objectiveIndex: 0,
    objectiveElapsed: 0,
    anchorHold: 0,
    maxSeconds: stage?.maxSeconds || MAX_SPIN_SECONDS,
    surviveSeconds,
    anchor,
    arenaRadius,
    pillars,
    launchOrigin: { ...playerStart },
    dummyEnabled,
    containedArena: stage?.containedArena === true,
    collisionTuning: { ...collisionTuning },
    playerPhysics: {
      spinDecay:
        Number.isFinite(physicsTuning.spinDecay)
          ? physicsTuning.spinDecay
          : null,
      friction:
        Number.isFinite(physicsTuning.friction)
          ? physicsTuning.friction
          : null
    },
    launchStances,
    launchStanceId: defaultLaunchStanceId,
    attunement,
    attunementConfirmed: attunement ? attunement.confirmed === true : true,
    confirmedLaunchPlan: null,
    embodiment,
    embodimentMode: selectedEmbodimentOption?.id || "core",
    embodimentBase,
    resonancePulse,
    resonancePulseUsed: false,
    lastPulseFlash: 0,
    boundaryResonance,
    boundaryChargeBudget,
    boundaryChargesRemaining: boundaryChargeBudget,
    boundaryChargeSpent: 0,
    boundaryResonanceCount: 0,
    lastBoundaryFlash: 0,
    lastBoundaryRailId: null,
    boundaryResonanceTrace: null,
    memoryMotes,
    nextMemoryMoteIndex: 0,
    softWell: stage?.softWell || null,
    driftField: stage?.driftField || null,
    resonanceZone: stage?.resonanceZone || null,
    resonanceHold: 0,
    resonanceReady: false,
    lastMoteFlash: 0,
    clearNarrative: stage?.clearNarrative || null,
    stageCompanionLine: stage?.companionLine || null,
    sessionTrace: stage?.sessionTrace || null,
    stats: { ...stats },
    personaBias: opts.personaBias || "comfort",
    player,
    dummy: {
      ...createBody({
        id: "dummy",
        x: dummyStart.x,
        y: dummyStart.y,
        vx: 0.12,
        vy: 0.05,
        spin: 36,
        stability: Math.max(50, Math.min(140, dummyStability)),
        radius: DUMMY_RADIUS,
        team: "dummy",
        physicsModel,
        spinDirection: -1,
        tilt: 0.06,
        driveScale:
          Number.isFinite(physicsTuning.dummyDriveScale)
            ? physicsTuning.dummyDriveScale
            : 0.35,
        driveTargetSpeed:
          Number.isFinite(physicsTuning.dummyDriveTargetSpeed)
            ? physicsTuning.dummyDriveTargetSpeed
            : 1.6,
        speedCap:
          Number.isFinite(physicsTuning.dummySpeedCap)
            ? physicsTuning.dummySpeedCap
            : 2.2
      }),
      out: !dummyEnabled,
      spinPhase: dummyEnabled
        ? HYBRID_SPIN_PHASES.launch
        : HYBRID_SPIN_PHASES.stopped
    },
    outcome: null,
    companionLine: null,
    lastHitFlash: 0,
    progressEligible: false
  };
}

/**
 * Select the visible embodiment before the attunement plan is confirmed.
 * Both modes keep the same normalized total budget and never touch Growth.
 */
export function selectOrbitEmbodiment(session, modeId) {
  if (
    !session ||
    session.phase !== "aiming" ||
    (session.attunement && session.attunementConfirmed) ||
    !session.embodiment ||
    !session.embodimentBase
  ) {
    return session;
  }
  const option = session.embodiment.options?.find(
    (candidate) => candidate.id === modeId
  );
  if (!option || option.id === session.embodimentMode) return session;
  const player = applyEmbodimentToPlayer(
    session.player,
    session.embodimentBase,
    option
  );
  return {
    ...session,
    player,
    embodimentMode: option.id,
    embodiment: {
      ...session.embodiment,
      selectedMode: option.id
    }
  };
}

/**
 * 只在發射前切換姿態。正式五關沒有 launchStances，因此完全不受影響。
 */
export function selectOrbitLaunchStance(session, stanceId) {
  if (
    !session ||
    session.phase !== "aiming" ||
    (session.attunement && session.attunementConfirmed)
  ) {
    return session;
  }
  const stance = session.launchStances?.find(
    (candidate) => candidate.id === stanceId
  );
  if (!stance || stance.id === session.launchStanceId) return session;
  return {
    ...session,
    launchStanceId: stance.id,
    attunement: session.attunement
      ? {
          ...session.attunement,
          proposedStanceId: stance.id
        }
      : session.attunement
  };
}

/**
 * Lock the exact visible pre-launch plan. Once confirmed, stance selection is
 * immutable and the simulation reads no live Mood/Trust/Energy values.
 */
export function confirmOrbitAttunement(session) {
  if (
    !session ||
    session.phase !== "aiming" ||
    !session.attunement ||
    session.attunementConfirmed ||
    session.attunement.canStart !== true
  ) {
    return session;
  }
  const stance = session.launchStances?.find(
    (candidate) => candidate.id === session.launchStanceId
  );
  if (!stance) return session;

  const confirmedLaunchPlan = Object.freeze({
    version: "orbit-launch-plan-v2",
    stanceId: stance.id,
    embodimentMode: session.embodimentMode || "core",
    formalStage:
      session.embodimentMode === "formal_stage"
        ? session.embodiment?.formalStage || null
        : null,
    maxPullDistance: session.attunement.maxPullDistance,
    mood: session.attunement.mood,
    moodLabel: session.attunement.moodLabel
  });
  return {
    ...session,
    attunementConfirmed: true,
    confirmedLaunchPlan,
    attunement: {
      ...session.attunement,
      confirmed: true,
      confirmedStanceId: stance.id,
      confirmedEmbodimentMode: session.embodimentMode || "core"
    }
  };
}

/**
 * 發射：從 aiming 進入 spinning。
 */
export function launchOrbitSession(session, pullDx, pullDy) {
  if (!session || session.phase !== "aiming") return session;
  if (session.attunement && !session.attunementConfirmed) return session;
  const rawPullLength = Math.hypot(pullDx, pullDy);
  const planPullLimit = Number(session.confirmedLaunchPlan?.maxPullDistance);
  const pullLimit = Number.isFinite(planPullLimit)
    ? Math.max(0.04, planPullLimit)
    : rawPullLength;
  const pullScale =
    rawPullLength > pullLimit && rawPullLength > 1e-8
      ? pullLimit / rawPullLength
      : 1;
  const effectivePullDx = pullDx * pullScale;
  const effectivePullDy = pullDy * pullScale;
  const stance =
    session.launchStances?.find(
      (candidate) => candidate.id === session.launchStanceId
    ) || null;
  const { vx, vy } = launchVelocityFromPull(
    effectivePullDx,
    effectivePullDy,
    session.stats.impact
  );
  const speedScale = Number.isFinite(stance?.speedScale)
    ? Math.max(0.1, stance.speedScale)
    : 1;
  const spinScale = Number.isFinite(stance?.spinScale)
    ? Math.max(0.1, stance.spinScale)
    : 1;
  const stanceDriveScale = Number.isFinite(stance?.driveScale)
    ? Math.max(0, stance.driveScale)
    : 1;
  const launchSpin =
    session.stats.spin + 18 + Math.hypot(effectivePullDx, effectivePullDy) * 72;
  const rawLaunchVx = vx * speedScale;
  const rawLaunchVy = vy * speedScale;
  const rawLaunchSpeed = Math.hypot(rawLaunchVx, rawLaunchVy);
  const launchSpeedLimit = session.player.speedCap || rawLaunchSpeed;
  const launchVelocityScale =
    rawLaunchSpeed > launchSpeedLimit
      ? launchSpeedLimit / rawLaunchSpeed
      : 1;
  const player = {
    ...session.player,
    vx: rawLaunchVx * launchVelocityScale,
    vy: rawLaunchVy * launchVelocityScale,
    // 發射當下灌一波轉速：沒有「轉起來」就不像陀螺
    spin: Math.min(100, launchSpin * spinScale),
    spinDirection: Number.isFinite(stance?.spinDirection)
      ? stance.spinDirection < 0
        ? -1
        : 1
      : session.player.spinDirection,
    tilt: Number.isFinite(stance?.tilt)
      ? Math.max(0, Math.min(1, stance.tilt))
      : session.player.tilt,
    wobble: Number.isFinite(stance?.wobble)
      ? Math.max(0, Math.min(1, stance.wobble))
      : session.player.wobble,
    driveScale: session.player.driveScale * stanceDriveScale,
    spinAge: 0,
    spinPhase:
      session.physicsModel === ORBIT_PHYSICS_MODELS.hybridSpin
        ? HYBRID_SPIN_PHASES.launch
        : session.player.spinPhase
  };
  return {
    ...session,
    phase: "spinning",
    player,
    elapsed: 0,
    physicsAccumulator: 0,
    launchInput: Object.freeze({
      pullDx: effectivePullDx,
      pullDy: effectivePullDy,
      pullDistance: Math.hypot(effectivePullDx, effectivePullDy),
      wasClamped: pullScale < 1
    })
  };
}

/**
 * 每次發射一次的 deterministic 共鳴脈衝。
 *
 * 脈衝只把現有速度「稍微轉向」下一個可見目標；記憶仍須實際碰觸，
 * 營火仍須低速停留。它不直接改 objective、outcome 或結算資格。
 */
export function triggerOrbitResonancePulse(session) {
  if (
    !session ||
    session.phase !== "spinning" ||
    !session.resonancePulse ||
    session.resonancePulseUsed ||
    session.player.out
  ) {
    return session;
  }

  const target =
    session.memoryMotes?.[session.nextMemoryMoteIndex] ||
    (session.resonanceReady ? session.resonanceZone : null);
  if (!target) return session;

  const dx = target.x - session.player.x;
  const dy = target.y - session.player.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= 1e-8) return session;

  const speed = Math.hypot(session.player.vx, session.player.vy);
  const currentX = speed > 1e-8 ? session.player.vx / speed : dx / distance;
  const currentY = speed > 1e-8 ? session.player.vy / speed : dy / distance;
  const targetX = dx / distance;
  const targetY = dy / distance;
  const steerStrength = Math.max(
    0,
    Math.min(
      1,
      (session.resonancePulse.steerStrength || 0) *
        (session.player.turnAuthorityScale || 1)
    )
  );
  let directionX =
    currentX * (1 - steerStrength) + targetX * steerStrength;
  let directionY =
    currentY * (1 - steerStrength) + targetY * steerStrength;
  const directionLength = Math.hypot(directionX, directionY) || 1;
  directionX /= directionLength;
  directionY /= directionLength;

  const speedScale = session.resonanceReady
    ? session.resonancePulse.settleSpeedScale
    : session.resonancePulse.travelSpeedScale;
  const nextSpeed =
    speed *
    Math.max(
      0,
      Number.isFinite(speedScale)
        ? speedScale
        : 1
    );
  const player = {
    ...session.player,
    vx: directionX * nextSpeed,
    vy: directionY * nextSpeed,
    spin: Math.min(
      100,
      session.player.spin +
        Math.max(0, session.resonancePulse.spinBoost || 0)
    ),
    tilt: Math.max(
      0,
      session.player.tilt -
        Math.max(0, session.resonancePulse.tiltRecovery || 0)
    ),
    wobble: Math.max(
      0,
      session.player.wobble -
        Math.max(0, session.resonancePulse.wobbleRecovery || 0)
    )
  };

  return {
    ...session,
    player,
    resonancePulseUsed: true,
    lastPulseFlash: Math.max(
      0.01,
      session.resonancePulse.flashSeconds || 0.36
    )
  };
}

/**
 * 主動撤退。
 */
export function retreatOrbitSession(session) {
  if (!session || session.phase === "resolved") return session;
  return resolveSession(session, "retreat");
}

function resolveSession(session, reason) {
  const mapped = mapOrbitResultToOutcome({
    reason,
    playerStability: session.player.stability,
    dummyStability: session.dummy.stability,
    hits: session.hits,
    overheat: session.stats.overheat
  });
  const companionLine =
    reason === "camp_resonated" && session.stageCompanionLine
      ? session.stageCompanionLine
      : companionLineForOutcome(mapped.key, {
          personaBias: session.personaBias
        });
  const isWin =
    reason === "dummy_burst" ||
    reason === "noise_cleared" ||
    reason === "anchor_reached" ||
    reason === "survived" ||
    reason === "camp_resonated" ||
    reason === "stage_completed";
  return {
    ...session,
    phase: "resolved",
    outcome: { ...mapped, reason },
    companionLine,
    // Sandbox / proof slices may reuse real stage geometry, but they never
    // become eligible for path progress or settlement writes.
    progressEligible: isWin && !session.nonPersistent
  };
}

function checkStageWin(session) {
  if (
    session.usesObjectiveSequence &&
    Array.isArray(session.objectives) &&
    session.objectives.length > 0
  ) {
    if (session.objectiveIndex < session.objectives.length) return null;
    return session.goal === "collect_then_resonate"
      ? "camp_resonated"
      : "stage_completed";
  }
  if (session.goal === "collect_then_resonate") {
    const holdSeconds = session.resonanceZone?.holdSeconds || 0.4;
    if (
      session.resonanceReady &&
      session.resonanceHold >= holdSeconds &&
      !session.player.out
    ) {
      return "camp_resonated";
    }
    return null;
  }
  if (session.goal === "survive") {
    if (session.elapsed >= session.surviveSeconds && !session.player.out && session.player.stability > 0) {
      return "survived";
    }
    return null;
  }
  if (session.goal === "reach_anchor" && session.anchor) {
    const d = Math.hypot(
      session.player.x - session.anchor.x,
      session.player.y - session.anchor.y
    );
    if (d <= session.anchor.r + session.player.radius * 0.5) {
      return "anchor_reached";
    }
    return null;
  }
  // clear
  if (session.dummy.out || session.dummy.stability <= 0) {
    return "dummy_burst";
  }
  return null;
}

function applyDriftField(body, field, elapsed, dt) {
  if (!body || body.out || !field) return body;
  const reverseEvery = Math.max(0, Number(field.reverseEverySeconds) || 0);
  const direction = reverseEvery > 0 && Math.floor(elapsed / reverseEvery) % 2 === 1
    ? -1
    : 1;
  const strength = Math.max(0, Number(field.strength) || 0);
  return {
    ...body,
    vx: body.vx + (Number(field.x) || 0) * strength * direction * dt,
    vy: body.vy + (Number(field.y) || 0) * strength * direction * dt
  };
}

function applySoftWell(body, well, dt) {
  if (!body || body.out || !well) return body;
  const dx = (well.x || 0) - body.x;
  const dy = (well.y || 0) - body.y;
  const distance = Math.hypot(dx, dy);
  const radius = Math.max(0.01, well.radius || 0.01);
  if (distance <= 1e-6 || distance >= radius) return body;

  const falloff = 1 - distance / radius;
  const acceleration = Math.max(0, well.strength || 0) * falloff;
  const damping = Math.exp(
    -Math.max(0, well.damping || 0) * falloff * dt
  );
  return {
    ...body,
    vx: (body.vx + (dx / distance) * acceleration * dt) * damping,
    vy: (body.vy + (dy / distance) * acceleration * dt) * damping
  };
}

function stepCollectMotes(session, objective, dt) {
  let player = session.player;
  let memoryMotes = session.memoryMotes;
  let nextMemoryMoteIndex = session.nextMemoryMoteIndex;
  let lastMoteFlash = Math.max(0, session.lastMoteFlash - dt);
  const candidates = objective.ordered === false
    ? memoryMotes
        .map((mote, index) => ({ mote, index }))
        .filter(({ mote }) => !mote.collected)
    : memoryMotes[nextMemoryMoteIndex]
      ? [{ mote: memoryMotes[nextMemoryMoteIndex], index: nextMemoryMoteIndex }]
      : [];
  const hit = candidates.find(({ mote }) => {
    if (player.out) return false;
    const distance = Math.hypot(
      player.x - mote.x,
      player.y - mote.y
    );
    return distance <=
      mote.r +
        player.radius * 0.8 * (player.signalReachScale || 1);
  });
  if (hit) {
      memoryMotes = memoryMotes.map((mote, index) =>
        index === hit.index
          ? { ...mote, collected: true }
          : mote
      );
      nextMemoryMoteIndex = memoryMotes.filter((mote) => mote.collected).length;
      lastMoteFlash = 0.24;
  }
  const resonanceReady =
    memoryMotes.length > 0 &&
    nextMemoryMoteIndex >= memoryMotes.length;
  return {
    ...session,
    player,
    memoryMotes,
    nextMemoryMoteIndex,
    resonanceReady,
    lastMoteFlash
  };
}

function stepResonanceZone(session, dt) {
  let player = session.player;
  let resonanceHold = session.resonanceHold;
  const zone = session.resonanceZone;

  if (zone && !player.out) {
    const zoneDistance = Math.hypot(
      player.x - zone.x,
      player.y - zone.y
    );
    const insideZone =
      zoneDistance <= Math.max(0.01, zone.r - player.radius * 0.1);
    if (insideZone) {
      const brake = Math.exp(-Math.max(0, zone.brake || 0) * dt);
      player = {
        ...player,
        vx: player.vx * brake,
        vy: player.vy * brake
      };
      const speed = Math.hypot(player.vx, player.vy);
      resonanceHold =
        speed <= (zone.maxSpeed || 0.5)
          ? resonanceHold + dt
          : Math.max(0, resonanceHold - dt * 0.5);
    } else {
      resonanceHold = 0;
    }
  } else {
    resonanceHold = 0;
  }
  return {
    ...session,
    player,
    resonanceHold
  };
}

function stepObjectiveSequence(session, dt) {
  if (
    !session.usesObjectiveSequence ||
    !Array.isArray(session.objectives) ||
    session.objectives.length === 0
  ) {
    return session;
  }
  const objective = session.objectives[session.objectiveIndex];
  if (!objective) return session;

  let next = {
    ...session,
    objectiveElapsed: session.objectiveElapsed + dt,
    lastMoteFlash: Math.max(0, session.lastMoteFlash - dt),
    lastPulseFlash: Math.max(0, session.lastPulseFlash - dt)
  };
  let completed = false;

  if (objective.type === "collect_motes") {
    next = stepCollectMotes(next, objective, dt);
    completed =
      next.memoryMotes.length > 0 &&
      next.memoryMotes.every((mote) => mote.collected);
  } else if (objective.type === "survive") {
    completed =
      next.objectiveElapsed >= Math.max(0.1, Number(objective.seconds) || 0) &&
      !next.player.out &&
      next.player.stability > 0;
  } else if (objective.type === "clear_noise") {
    completed = next.dummy.out || next.dummy.stability <= 0;
  } else if (objective.type === "reach_anchor" && next.anchor) {
    const distance = Math.hypot(
      next.player.x - next.anchor.x,
      next.player.y - next.anchor.y
    );
    const speed = Math.hypot(next.player.vx, next.player.vy);
    const inside = distance <= next.anchor.r + next.player.radius * 0.5;
    const slowEnough =
      !Number.isFinite(objective.maxSpeed) || speed <= objective.maxSpeed;
    const holdSeconds = Math.max(0, Number(objective.holdSeconds) || 0);
    const anchorHold = inside && slowEnough ? next.anchorHold + dt : 0;
    next = { ...next, anchorHold };
    completed = inside && slowEnough && anchorHold >= holdSeconds;
  } else if (objective.type === "resonate_zone") {
    next = stepResonanceZone(next, dt);
    completed =
      next.resonanceHold >= Math.max(
        0.01,
        next.resonanceZone?.holdSeconds || 0.4
      );
  }

  if (!completed) return next;
  return {
    ...next,
    objectiveIndex: next.objectiveIndex + 1,
    objectiveElapsed: 0,
    anchorHold: 0,
    resonanceHold: 0,
    resonanceReady: next.objectiveIndex + 1 >= next.objectives.length
      ? next.resonanceReady
      : next.objectives[next.objectiveIndex + 1]?.type === "resonate_zone"
  };
}

function resolveSessionIfFinished(session) {
  const winReason = checkStageWin(session);
  if (winReason) {
    if (winReason === "stage_completed") {
      return resolveSession(
        { ...session, hits: Math.max(session.hits, 2) },
        winReason
      );
    }
    if (winReason === "survived" || winReason === "anchor_reached") {
      return resolveSession(
        { ...session, hits: Math.max(session.hits, 2) },
        winReason === "anchor_reached" ? "anchor_reached" : "survived"
      );
    }
    return resolveSession(session, winReason);
  }

  if (session.player.out && session.player.stability > 0) {
    return resolveSession(session, "player_out");
  }
  if (session.player.stability <= 0) {
    return resolveSession(session, "player_burst");
  }
  if (
    session.elapsed >= session.maxSeconds
  ) {
    return resolveSession(session, "timeout");
  }
  return session;
}

/**
 * 推進一幀。
 * @param {ReturnType<typeof createOrbitSession>} session
 * @param {number} dt 秒
 */
export function stepOrbitSession(session, dt) {
  if (!session || session.phase !== "spinning") return session;

  const arenaRadius = session.arenaRadius ?? 1;
  const pillars = session.pillars || [];
  const physicsPlan = planFixedPhysicsSteps(session.physicsAccumulator, dt);

  let next = {
    ...session,
    physicsAccumulator: physicsPlan.accumulator
  };

  // 畫面更新頻率只決定本次補幾個固定步；物理永遠以 1/120s 推進。
  for (let i = 0; i < physicsPlan.steps; i++) {
    next = {
      ...next,
      elapsed: next.elapsed + PHYSICS_FIXED_DT
    };

    // 假對手緩慢繞場。放在固定步內，避免 30／60／120 Hz 觸發時機不同。
    if (
      next.dummyEnabled &&
      !next.dummy.out &&
      Math.hypot(next.dummy.vx, next.dummy.vy) < 0.08
    ) {
      const ang = next.elapsed * 0.9;
      next = {
        ...next,
        dummy: {
          ...next.dummy,
          vx: Math.cos(ang) * 0.22,
          vy: Math.sin(ang) * 0.18
        }
      };
    }

    const playerWithField = applyDriftField(
      applySoftWell(
        next.player,
        next.softWell,
        PHYSICS_FIXED_DT
      ),
      next.driftField,
      next.elapsed,
      PHYSICS_FIXED_DT
    );
    next = {
      ...next,
      player: stepBody(playerWithField, PHYSICS_FIXED_DT, {
        spinDecay:
          (next.playerPhysics.spinDecay ??
            DEFAULT_SPIN_DECAY + next.stats.overheat * 0.03) /
          (next.player.spinRetentionScale || 1),
        friction: next.playerPhysics.friction ?? DEFAULT_FRICTION,
        arenaRadius,
        containAtBoundary: next.containedArena
      }),
      dummy: stepBody(next.dummy, PHYSICS_FIXED_DT, {
        spinDecay: DEFAULT_SPIN_DECAY - 1,
        friction: DEFAULT_FRICTION + 0.02,
        arenaRadius,
        containAtBoundary: next.containedArena
      })
    };

    next = applyOrbitBoundaryResonance(next, playerWithField);

    next = {
      ...next,
      player: collidePillars(next.player, pillars),
      dummy: collidePillars(next.dummy, pillars)
    };

    const collision = next.dummyEnabled
      ? collideBodies(
          next.player,
          next.dummy,
          next.stats.impact,
          38,
          next.stats.guard,
          42,
          next.collisionTuning
        )
      : {
          a: next.player,
          b: next.dummy,
          hit: false
        };
    if (collision.hit) {
      next = {
        ...next,
        player: collision.a,
        dummy: collision.b,
        hits: next.hits + 1,
        lastHitFlash: 0.18
      };
    } else {
      next = {
        ...next,
        lastHitFlash: Math.max(0, next.lastHitFlash - PHYSICS_FIXED_DT)
      };
    }

    next = stepObjectiveSequence(next, PHYSICS_FIXED_DT);
    next = resolveSessionIfFinished(next);
    if (next.phase === "resolved") break;
  }

  return next;
}
