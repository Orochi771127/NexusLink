/**
 * 心核迴旋戰 — 對決引擎（R3）
 *
 * 雙化身同場：玩家拉動發射後，CPU／幽靈延遲發射，以出場或核散決勝負。
 * 不改 bond／trust；結局只回 session 短評。
 */

import {
  AVATAR_RADIUS,
  collideBodies,
  createBody,
  launchVelocityFromPull,
  stepBody
} from "./orbitPhysics.js";
import { companionLineForOutcome, mapOrbitResultToOutcome } from "./orbitOutcomes.js";
import { scaleStatsForOpponent, CPU_DUEL_PROFILES, DUEL_MODES } from "../data/orbit/duelProfiles.js";
import { getOrbitGhostRecording } from "./orbitGhostRecorder.js";

const MAX_DUEL_SECONDS = 70;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * @param {{
 *  playerStats: object,
 *  profile: object,
 *  personaBias?: 'comfort' | 'eager'
 * }} opts
 */
export function createOrbitDuelSession(opts = {}) {
  const playerStats = opts.playerStats || {
    impact: 40,
    spin: 40,
    guard: 40,
    burst: 20,
    overheat: 10
  };
  const profile = opts.profile || CPU_DUEL_PROFILES.mirror;
  const foeStats = scaleStatsForOpponent(playerStats, profile);

  const playerStability = Math.round(74 + playerStats.guard * 0.2 - playerStats.overheat * 0.1);
  const foeStability = Math.round(74 + foeStats.guard * 0.2 - foeStats.overheat * 0.08);

  return {
    mode: "duel",
    phase: "aiming",
    elapsed: 0,
    hits: 0,
    profileId: profile.id,
    profileName: profile.name,
    profileCopy: profile.copy,
    duelMode: profile.mode || DUEL_MODES.cpu,
    playerStats: { ...playerStats },
    foeStats,
    launchDelaySec: profile.launchDelaySec ?? 0.35,
    pullStrength: profile.pullStrength ?? 0.38,
    aimJitter: profile.aimJitter ?? 0.08,
    foeLaunchAt: null,
    foeLaunched: false,
    personaBias: opts.personaBias || "comfort",
    player: createBody({
      id: "player-avatar",
      x: 0,
      y: 0.55,
      spin: playerStats.spin,
      stability: clamp(playerStability, 45, 100),
      radius: AVATAR_RADIUS,
      team: "player"
    }),
    foe: createBody({
      id: "foe-avatar",
      x: 0,
      y: -0.55,
      spin: foeStats.spin,
      stability: clamp(foeStability, 45, 100),
      radius: AVATAR_RADIUS,
      team: "foe"
    }),
    outcome: null,
    companionLine: null,
    lastHitFlash: 0,
    winner: null // 'player' | 'foe' | 'none'
  };
}

export function launchOrbitDuelPlayer(session, pullDx, pullDy) {
  if (!session || session.phase !== "aiming") return session;
  const { vx, vy } = launchVelocityFromPull(pullDx, pullDy, session.playerStats.impact);
  return {
    ...session,
    phase: "spinning",
    elapsed: 0,
    foeLaunchAt: session.launchDelaySec,
    foeLaunched: false,
    player: {
      ...session.player,
      vx,
      vy,
      spin: Math.min(100, session.playerStats.spin + Math.hypot(pullDx, pullDy) * 40)
    },
    lastPlayerPull: { pullDx, pullDy }
  };
}

function computeCpuPull(session) {
  // 朝玩家當前位置方向「往後拉」（發射會反向）
  const dx = session.player.x - session.foe.x;
  const dy = session.player.y - session.foe.y;
  const len = Math.hypot(dx, dy) || 1;
  const jitter = session.aimJitter || 0;
  const jx = (Math.random() * 2 - 1) * jitter;
  const jy = (Math.random() * 2 - 1) * jitter;
  // 往後拉＝遠離目標的方向
  const pullDx = (-dx / len) * session.pullStrength + jx;
  const pullDy = (-dy / len) * session.pullStrength + jy;
  return { pullDx, pullDy };
}

function computeGhostPull(session) {
  const ghost = getOrbitGhostRecording();
  if (!ghost) return computeCpuPull(session);
  // 幽靈站在北側，翻轉上一場拉動的 Y，讓方向語意接近「朝南打」
  return {
    pullDx: ghost.pullDx,
    pullDy: -Math.abs(ghost.pullDy) || -session.pullStrength
  };
}

function launchFoe(session) {
  const pull =
    session.duelMode === DUEL_MODES.ghost ? computeGhostPull(session) : computeCpuPull(session);
  const { vx, vy } = launchVelocityFromPull(pull.pullDx, pull.pullDy, session.foeStats.impact);
  return {
    ...session,
    foeLaunched: true,
    foe: {
      ...session.foe,
      vx,
      vy,
      spin: Math.min(100, session.foeStats.spin + Math.hypot(pull.pullDx, pull.pullDy) * 36)
    }
  };
}

export function retreatOrbitDuel(session) {
  if (!session || session.phase === "resolved") return session;
  return resolveDuel(session, "retreat");
}

function resolveDuel(session, reason) {
  let winner = "none";
  if (reason === "foe_out" || reason === "foe_burst") winner = "player";
  else if (reason === "player_out" || reason === "player_burst") winner = "foe";

  const mapped = mapOrbitResultToOutcome({
    reason:
      reason === "foe_out" || reason === "foe_burst"
        ? "dummy_burst"
        : reason === "retreat"
          ? "retreat"
          : reason === "player_out" || reason === "player_burst"
            ? "player_burst"
            : "timeout",
    playerStability: session.player.stability,
    dummyStability: session.foe.stability,
    hits: session.hits,
    overheat: session.playerStats.overheat
  });

  // 對決文案微調（不羞辱）
  let title = mapped.title;
  let summary = mapped.summary;
  if (winner === "player") {
    title = "對手核散／退場";
    summary = "對方化身散了。你們的合拍在這一場站得住。";
  } else if (winner === "foe") {
    title = "我方化身失穩";
    summary = "這場沒稳住，可是沒有人被懲罰。想休息就休息。";
  } else if (reason === "retreat") {
    title = "先撤退";
    summary = "你們選擇先離開軌道。懂得離開，也是照顧。";
  }

  const companionLine = companionLineForOutcome(
    winner === "player" ? "stabilized" : mapped.key,
    { personaBias: session.personaBias }
  );

  return {
    ...session,
    phase: "resolved",
    winner,
    outcome: { ...mapped, title, summary, reason },
    companionLine
  };
}

/**
 * @param {ReturnType<typeof createOrbitDuelSession>} session
 * @param {number} dt
 */
export function stepOrbitDuel(session, dt) {
  if (!session || session.phase !== "spinning") return session;

  let next = {
    ...session,
    elapsed: session.elapsed + dt,
    player: stepBody(session.player, dt, {
      spinDecay: 6.2 + session.playerStats.overheat * 0.035,
      friction: 0.15,
      arenaRadius: 1
    }),
    foe: stepBody(session.foe, dt, {
      spinDecay: 5.9,
      friction: 0.145,
      arenaRadius: 1
    }),
    foeLaunchAt:
      session.foeLaunched || session.foeLaunchAt == null
        ? session.foeLaunchAt
        : session.foeLaunchAt - dt
  };

  if (!next.foeLaunched && next.foeLaunchAt != null && next.foeLaunchAt <= 0) {
    next = launchFoe(next);
  }

  // 對手尚未發射時略微蠕動，避免完全呆站
  if (!next.foeLaunched && !next.foe.out) {
    next = {
      ...next,
      foe: {
        ...next.foe,
        vx: Math.sin(next.elapsed * 2) * 0.05,
        vy: Math.cos(next.elapsed * 1.6) * 0.04
      }
    };
  }

  const collision = collideBodies(
    next.player,
    next.foe,
    next.playerStats.impact,
    next.foeStats.impact,
    next.playerStats.guard,
    next.foeStats.guard
  );
  if (collision.hit) {
    next = {
      ...next,
      player: collision.a,
      foe: collision.b,
      hits: next.hits + 1,
      lastHitFlash: 0.18
    };
  } else {
    next = { ...next, lastHitFlash: Math.max(0, next.lastHitFlash - dt) };
  }

  if (next.foe.out || next.foe.stability <= 0) {
    return resolveDuel(next, next.foe.stability <= 0 ? "foe_burst" : "foe_out");
  }
  if (next.player.out || next.player.stability <= 0) {
    return resolveDuel(next, next.player.stability <= 0 ? "player_burst" : "player_out");
  }
  if (next.elapsed >= MAX_DUEL_SECONDS) {
    // 逾時比穩定性，不羞辱
    if (next.player.stability > next.foe.stability + 5) {
      return resolveDuel(next, "foe_out");
    }
    if (next.foe.stability > next.player.stability + 5) {
      return resolveDuel(next, "player_out");
    }
    return resolveDuel(next, "timeout");
  }

  return next;
}
