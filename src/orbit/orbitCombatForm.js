/**
 * Session-only Orbit combat-form state machine.
 *
 * `base ↔ resonance` is not Companion Growth or a persistent unlock. Player
 * and opponent use this same module and equal-budget validation.
 */

export const ORBIT_COMBAT_FORMS = Object.freeze({
  base: "base",
  resonance: "resonance"
});

const PROFILE_KEYS = Object.freeze([
  "collisionRadius",
  "inertia",
  "speedCap",
  "spinRetention",
  "turnAuthority",
  "signalReach"
]);

const BUDGET_TOLERANCE = 1e-6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readMultiplier(profile, key) {
  const value = Number(profile?.[key]);
  return Number.isFinite(value) ? clamp(value, 0.65, 1.35) : 1;
}

export function orbitCombatFormBudget(profile) {
  return PROFILE_KEYS.reduce(
    (sum, key) => sum + readMultiplier(profile, key),
    0
  );
}

export function hasEqualOrbitCombatFormBudget(forms) {
  if (!forms?.base?.physics || !forms?.resonance?.physics) return false;
  return (
    Math.abs(
      orbitCombatFormBudget(forms.base.physics) -
        orbitCombatFormBudget(forms.resonance.physics)
    ) <= BUDGET_TOLERANCE
  );
}

function captureBodyBase(body) {
  return Object.freeze({
    radius: body.radius,
    inertiaScale: body.inertiaScale,
    speedCap: body.speedCap,
    spinRetentionScale: body.spinRetentionScale || 1,
    turnAuthorityScale: body.turnAuthorityScale || 1,
    signalReachScale: body.signalReachScale || 1
  });
}

function applyBodyProfile(body, base, profile) {
  const previousInertia = Math.max(
    0.5,
    Number.isFinite(body.inertiaScale) ? body.inertiaScale : 1
  );
  const nextInertia =
    base.inertiaScale * readMultiplier(profile, "inertia");
  const nextSpeedCap =
    base.speedCap * readMultiplier(profile, "speedCap");
  // A form switch is a redistribution, not a launch impulse. Rescale the
  // translational velocity when effective mass changes so the transition can
  // dissipate energy at a lower speed cap, but can never create it.
  const energyNeutralScale = Math.sqrt(previousInertia / nextInertia);
  let vx = body.vx * energyNeutralScale;
  let vy = body.vy * energyNeutralScale;
  const speed = Math.hypot(vx, vy);
  if (speed > nextSpeedCap && speed > 1e-12) {
    const capScale = nextSpeedCap / speed;
    vx *= capScale;
    vy *= capScale;
  }
  return {
    ...body,
    vx,
    vy,
    radius: base.radius * readMultiplier(profile, "collisionRadius"),
    inertiaScale: nextInertia,
    speedCap: nextSpeedCap,
    spinRetentionScale:
      base.spinRetentionScale * readMultiplier(profile, "spinRetention"),
    turnAuthorityScale:
      base.turnAuthorityScale * readMultiplier(profile, "turnAuthority"),
    signalReachScale:
      base.signalReachScale * readMultiplier(profile, "signalReach")
  };
}

function createActorState(config, body, durationSeconds) {
  const valid =
    config &&
    body &&
    hasEqualOrbitCombatFormBudget(config.forms);
  if (!valid) {
    return {
      enabled: false,
      disabledReason: config ? "unequal_form_budget" : "missing_profile",
      current: ORBIT_COMBAT_FORMS.base,
      chargesRemaining: 0,
      elapsedInForm: 0,
      durationSeconds: 0,
      baseBody: body ? captureBodyBase(body) : null,
      profileId: config?.profileId || null,
      forms: null,
      windowOpensAt: Infinity,
      autoActivateAt: null
    };
  }
  return {
    enabled: true,
    disabledReason: null,
    current: ORBIT_COMBAT_FORMS.base,
    chargesRemaining: 1,
    elapsedInForm: 0,
    durationSeconds: Math.max(0.5, Number(durationSeconds) || 4),
    baseBody: captureBodyBase(body),
    profileId: config.profileId || null,
    forms: {
      base: {
        ...config.forms.base,
        physics: { ...config.forms.base.physics }
      },
      resonance: {
        ...config.forms.resonance,
        physics: { ...config.forms.resonance.physics }
      }
    },
    windowOpensAt: Math.max(0, Number(config.windowOpensAt) || 0),
    autoActivateAt: Number.isFinite(Number(config.autoActivateAt))
      ? Math.max(0, Number(config.autoActivateAt))
      : null
  };
}

export function createOrbitCombatFormState(config, bodies) {
  if (config?.enabled !== true) return null;
  const durationSeconds = config.resonanceDurationSeconds;
  return {
    enabled: true,
    player: createActorState(config.player, bodies?.player, durationSeconds),
    dummy: createActorState(config.dummy, bodies?.dummy, durationSeconds),
    transitionIndex: 0,
    lastTransition: null
  };
}

function actorBodyKey(actorKey) {
  return actorKey === "dummy" ? "dummy" : "player";
}

export function canActivateOrbitCombatForm(session, actorKey = "player") {
  const key = actorBodyKey(actorKey);
  const actor = session?.combatForms?.[key];
  const body = session?.[key];
  return Boolean(
    session?.phase === "spinning" &&
      actor?.enabled &&
      actor.current === ORBIT_COMBAT_FORMS.base &&
      actor.chargesRemaining > 0 &&
      session.elapsed >= actor.windowOpensAt &&
      body &&
      !body.out
  );
}

export function activateOrbitCombatForm(
  session,
  actorKey = "player",
  source = "manual"
) {
  const key = actorBodyKey(actorKey);
  if (!canActivateOrbitCombatForm(session, key)) return session;
  const actor = session.combatForms[key];
  const body = applyBodyProfile(
    session[key],
    actor.baseBody,
    actor.forms.resonance.physics
  );
  const transitionIndex = session.combatForms.transitionIndex + 1;
  return {
    ...session,
    [key]: body,
    combatForms: {
      ...session.combatForms,
      transitionIndex,
      lastTransition: Object.freeze({
        index: transitionIndex,
        actor: key,
        to: ORBIT_COMBAT_FORMS.resonance,
        at: session.elapsed,
        source
      }),
      [key]: {
        ...actor,
        current: ORBIT_COMBAT_FORMS.resonance,
        chargesRemaining: actor.chargesRemaining - 1,
        elapsedInForm: 0
      }
    }
  };
}

function returnActorToBase(session, key) {
  const actor = session.combatForms[key];
  if (actor.current !== ORBIT_COMBAT_FORMS.resonance) return session;
  const transitionIndex = session.combatForms.transitionIndex + 1;
  return {
    ...session,
    [key]: applyBodyProfile(
      session[key],
      actor.baseBody,
      actor.forms.base.physics
    ),
    combatForms: {
      ...session.combatForms,
      transitionIndex,
      lastTransition: Object.freeze({
        index: transitionIndex,
        actor: key,
        to: ORBIT_COMBAT_FORMS.base,
        at: session.elapsed,
        source: "duration_complete"
      }),
      [key]: {
        ...actor,
        current: ORBIT_COMBAT_FORMS.base,
        elapsedInForm: 0
      }
    }
  };
}

export function stepOrbitCombatForms(session, dt) {
  if (!session?.combatForms?.enabled || session.phase !== "spinning") {
    return session;
  }
  let next = session;
  for (const key of ["player", "dummy"]) {
    let actor = next.combatForms[key];
    if (!actor?.enabled) continue;
    if (
      actor.current === ORBIT_COMBAT_FORMS.base &&
      actor.autoActivateAt !== null &&
      next.elapsed >= actor.autoActivateAt
    ) {
      next = activateOrbitCombatForm(next, key, "deterministic_auto");
      actor = next.combatForms[key];
    }
    if (actor.current === ORBIT_COMBAT_FORMS.resonance) {
      const elapsedInForm = actor.elapsedInForm + dt;
      next = {
        ...next,
        combatForms: {
          ...next.combatForms,
          [key]: { ...actor, elapsedInForm }
        }
      };
      if (elapsedInForm >= actor.durationSeconds) {
        next = returnActorToBase(next, key);
      }
    }
  }
  return next;
}
