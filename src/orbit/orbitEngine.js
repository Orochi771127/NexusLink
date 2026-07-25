/**
 * 心核迴旋戰 — 單軌道 session 引擎（純邏輯，不碰 DOM）
 *
 * 狀態：aiming → spinning → resolved
 * R2：支援 stage 目標 clear / survive / reach_anchor 與護盾柱。
 */

import {
  AVATAR_RADIUS,
  DUMMY_RADIUS,
  collideBodies,
  collidePillars,
  createBody,
  launchVelocityFromPull,
  stepBody
} from "./orbitPhysics.js";
import { getOrbitPathLabel } from "../data/orbit/stages/index.js";
import { companionLineForOutcome, mapOrbitResultToOutcome } from "./orbitOutcomes.js";

const MAX_SPIN_SECONDS = 75;

/**
 * @param {{
 *  stats: { impact: number, spin: number, guard: number, burst: number, overheat: number },
 *  stage?: object,
 *  arena?: { id?: string, pathLabel?: string, dummyName?: string, dummyGuardBonus?: number },
 *  personaBias?: 'comfort' | 'eager'
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

  const pathLabel = stage
    ? getOrbitPathLabel(stage.regionId)
    : arena.pathLabel || "月湖路徑";
  const dummyName = stage?.dummyName || arena.dummyName || "訓練雜訊結";
  const arenaRadius = stage?.arenaRadius ?? 1;
  const pillars = Array.isArray(stage?.pillars) ? stage.pillars : [];
  const goal = stage?.goal || "clear";
  const surviveSeconds = stage?.surviveSeconds || 0;
  const anchor = stage?.anchor || null;
  const playerStart = stage?.playerStart || { x: 0, y: 0.55 };
  const dummyStart = stage?.dummyStart || { x: 0, y: -0.25 };

  const playerStability = Math.round(72 + stats.guard * 0.22 - stats.overheat * 0.12);
  const baseDummy = stage?.dummyStability ?? 78;
  const dummyStability = Math.round(baseDummy + (stage?.dummyGuardBonus || arena.dummyGuardBonus || 0));

  return {
    phase: "aiming",
    elapsed: 0,
    hits: 0,
    stageId: stage?.id || arena.id || null,
    stageTitle: stage?.title || arena.title || "訓練軌道",
    goalLabel: stage?.goalLabel || "清掉雜訊結",
    pathLabel,
    dummyName,
    goal,
    surviveSeconds,
    anchor,
    arenaRadius,
    pillars,
    clearNarrative: stage?.clearNarrative || null,
    stats: { ...stats },
    personaBias: opts.personaBias || "comfort",
    player: createBody({
      id: "avatar",
      x: playerStart.x,
      y: playerStart.y,
      spin: stats.spin,
      stability: Math.max(40, Math.min(100, playerStability)),
      radius: AVATAR_RADIUS,
      team: "player"
    }),
    dummy: createBody({
      id: "dummy",
      x: dummyStart.x,
      y: dummyStart.y,
      vx: 0.12,
      vy: 0.05,
      spin: 36,
      stability: Math.max(50, Math.min(140, dummyStability)),
      radius: DUMMY_RADIUS,
      team: "dummy"
    }),
    outcome: null,
    companionLine: null,
    lastHitFlash: 0,
    progressEligible: false
  };
}

/**
 * 發射：從 aiming 進入 spinning。
 */
export function launchOrbitSession(session, pullDx, pullDy) {
  if (!session || session.phase !== "aiming") return session;
  const { vx, vy } = launchVelocityFromPull(pullDx, pullDy, session.stats.impact);
  const player = {
    ...session.player,
    vx,
    vy,
    spin: Math.min(100, session.stats.spin + Math.hypot(pullDx, pullDy) * 40)
  };
  return { ...session, phase: "spinning", player, elapsed: 0 };
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
  const companionLine = companionLineForOutcome(mapped.key, {
    personaBias: session.personaBias
  });
  const isWin =
    reason === "dummy_burst" ||
    reason === "noise_cleared" ||
    reason === "anchor_reached" ||
    reason === "survived";
  return {
    ...session,
    phase: "resolved",
    outcome: { ...mapped, reason },
    companionLine,
    progressEligible: isWin
  };
}

function checkStageWin(session) {
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

/**
 * 推進一幀。
 * @param {ReturnType<typeof createOrbitSession>} session
 * @param {number} dt 秒
 */
export function stepOrbitSession(session, dt) {
  if (!session || session.phase !== "spinning") return session;

  const arenaRadius = session.arenaRadius ?? 1;
  const pillars = session.pillars || [];

  let next = {
    ...session,
    elapsed: session.elapsed + dt,
    player: stepBody(session.player, dt, {
      spinDecay: 6.2 + session.stats.overheat * 0.035,
      friction: 0.15,
      arenaRadius
    }),
    dummy: stepBody(session.dummy, dt, {
      spinDecay: 5.8,
      friction: 0.14,
      arenaRadius
    })
  };

  next = {
    ...next,
    player: collidePillars(next.player, pillars),
    dummy: collidePillars(next.dummy, pillars)
  };

  // 假對手緩慢繞場
  if (!next.dummy.out && Math.hypot(next.dummy.vx, next.dummy.vy) < 0.08) {
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

  const collision = collideBodies(
    next.player,
    next.dummy,
    next.stats.impact,
    38,
    next.stats.guard,
    42
  );
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
      lastHitFlash: Math.max(0, next.lastHitFlash - dt)
    };
  }

  const winReason = checkStageWin(next);
  if (winReason) {
    // survive / anchor 用 recovered／stabilized 語意
    if (winReason === "survived" || winReason === "anchor_reached") {
      return resolveSession(
        { ...next, hits: Math.max(next.hits, 2) },
        winReason === "anchor_reached" ? "anchor_reached" : "survived"
      );
    }
    return resolveSession(next, winReason);
  }

  // clear 關：雜訊清掉已在 checkStageWin
  if (next.player.out && next.player.stability > 0) {
    return resolveSession(next, "player_out");
  }
  if (next.player.stability <= 0) {
    return resolveSession(next, "player_burst");
  }

  // survive 關逾時前失敗才算 timeout；survive 成功已在上面處理
  if (next.goal === "survive" && next.elapsed >= (next.surviveSeconds || MAX_SPIN_SECONDS)) {
    // 若到秒數卻因 out 沒贏，走安全結局
    return resolveSession(next, "timeout");
  }

  if (next.goal !== "survive" && next.elapsed >= MAX_SPIN_SECONDS) {
    return resolveSession(next, "timeout");
  }

  return next;
}
