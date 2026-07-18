const HABITAT_MOMENT_SOURCE_IDS = Object.freeze([
  "quiet_approach",
  "fireside_settle",
  "moon_gaze"
]);

const HABITAT_MOMENT_SOURCE_ID_SET = new Set(HABITAT_MOMENT_SOURCE_IDS);

export const HABITAT_MOMENT_CHOICES = Object.freeze([
  Object.freeze({ id: "respond", label: "hm.choice.respond" }),
  Object.freeze({ id: "wait", label: "hm.choice.wait" }),
  Object.freeze({ id: "leave", label: "hm.choice.leave" })
]);

const HABITAT_MOMENT_CHOICE_IDS = new Set(HABITAT_MOMENT_CHOICES.map((choice) => choice.id));

const OUTCOMES = Object.freeze({
  quiet_approach: Object.freeze({
    respond: Object.freeze({
      outcomeKind: "habitat_moment_shared",
      message: "hm.result.quiet_approach.respond",
      encounter: Object.freeze({
        kind: "companion_animation",
        animationIntent: "soul.acknowledge"
      })
    }),
    wait: Object.freeze({
      outcomeKind: "habitat_moment_witnessed",
      message: "hm.result.quiet_approach.wait"
    }),
    leave: Object.freeze({
      outcomeKind: "habitat_moment_left",
      message: "hm.result.quiet_approach.leave"
    })
  }),
  fireside_settle: Object.freeze({
    respond: Object.freeze({
      outcomeKind: "habitat_moment_shared",
      message: "hm.result.fireside_settle.respond",
      encounter: createCrystalGlimmerEncounter("soul.rest")
    }),
    wait: Object.freeze({
      outcomeKind: "habitat_moment_witnessed",
      message: "hm.result.fireside_settle.wait",
      encounter: createCrystalGlimmerEncounter()
    }),
    leave: Object.freeze({
      outcomeKind: "habitat_moment_left",
      message: "hm.result.fireside_settle.leave",
      encounter: createCrystalGlimmerEncounter()
    })
  }),
  moon_gaze: Object.freeze({
    respond: Object.freeze({
      outcomeKind: "habitat_moment_shared",
      message: "hm.result.moon_gaze.respond",
      encounter: Object.freeze({
        kind: "companion_animation",
        animationIntent: "soul.acknowledge"
      })
    }),
    wait: Object.freeze({
      outcomeKind: "habitat_moment_witnessed",
      message: "hm.result.moon_gaze.wait"
    }),
    leave: Object.freeze({
      outcomeKind: "habitat_moment_left",
      message: "hm.result.moon_gaze.leave"
    })
  })
});

export function createHabitatMomentSession(state = {}, momentDef, now = Date.now()) {
  const sourceId = normalizeSourceId(momentDef);
  if (!sourceId || !isMomentLifecycleReady(state) || isProtectiveState(state)) return null;

  const companionId = normalizeCompanionId(state.activeCompanionId);
  const createdAt = normalizeNow(now);

  return Object.freeze({
    id: `habitat_moment:${sourceId}:${companionId || "unknown"}:${createdAt}`,
    sourceId,
    companionId,
    createdAt,
    terminal: false,
    choiceIds: Object.freeze(HABITAT_MOMENT_CHOICES.map((choice) => choice.id))
  });
}

export function resolveHabitatMomentChoice(state = {}, session, choiceId, now = Date.now()) {
  const sourceId = normalizeSourceId(session?.sourceId);
  const companionId = session?.companionId || normalizeCompanionId(state.activeCompanionId);
  const resolvedChoiceId = String(choiceId || "").trim().toLowerCase();
  void now;

  if (!sourceId || !HABITAT_MOMENT_CHOICE_IDS.has(resolvedChoiceId)) {
    return createEnvelope({
      outcomeKind: "habitat_moment_invalid",
      sourceId: sourceId || null,
      companionId,
      message: "hm.result.invalid",
      terminal: true
    });
  }

  if (isProtectiveState(state)) {
    return createEnvelope({
      outcomeKind: "habitat_moment_safety_pause",
      sourceId,
      companionId,
      message: "hm.result.safetyPause",
      terminal: true
    });
  }

  if (
    session?.terminal === true
    || (session?.companionId && normalizeCompanionId(state.activeCompanionId) !== session.companionId)
  ) {
    return createEnvelope({
      outcomeKind: "habitat_moment_expired",
      sourceId,
      companionId,
      message: "hm.result.expired",
      terminal: true
    });
  }

  const outcome = OUTCOMES[sourceId][resolvedChoiceId];

  return createEnvelope({
    outcomeKind: outcome.outcomeKind,
    sourceId,
    companionId,
    message: outcome.message,
    encounter: outcome.encounter || null,
    terminal: true
  });
}

function createEnvelope({
  outcomeKind,
  sourceId,
  companionId,
  message,
  encounter = null,
  raphaelEvent = null,
  terminal
}) {
  return {
    outcomeKind,
    sourceId,
    companionId: companionId || null,
    statePatch: {},
    message,
    memoryObject: null,
    traceIntent: null,
    encounter,
    raphaelEvent,
    terminal: Boolean(terminal)
  };
}

function createCrystalGlimmerEncounter(animationIntent = null) {
  return Object.freeze({
    kind: "environment",
    animationIntent,
    environmentEvent: Object.freeze({
      type: "crystal_touch",
      color: "#8deeff",
      x: 260,
      y: 500
    })
  });
}

function normalizeSourceId(momentDef) {
  const candidate = typeof momentDef === "string"
    ? momentDef
    : momentDef?.sourceId || momentDef?.id;
  const sourceId = String(candidate || "").trim().toLowerCase();
  return HABITAT_MOMENT_SOURCE_ID_SET.has(sourceId) ? sourceId : null;
}

function normalizeCompanionId(companionId) {
  const normalized = String(companionId || "").trim();
  return normalized || null;
}

function normalizeNow(now) {
  return Number.isFinite(now) ? now : Date.now();
}

function isProtectiveState(state = {}) {
  const mood = String(state.mood || "").trim().toLowerCase();
  return Boolean(
    state.safeHarborMode
    || mood === "defensive"
    || mood === "distant"
    || Number(state.touchFatigue) >= 6
    || Number(state.defense) >= 70
  );
}

function isMomentLifecycleReady(state = {}) {
  if (!normalizeCompanionId(state.activeCompanionId)) return false;
  if (!state.onboarding?.completed) return false;
  const firstLoop = state.onboarding?.firstLoop || {};
  return Boolean(firstLoop.completedAt || firstLoop.skippedAt);
}
