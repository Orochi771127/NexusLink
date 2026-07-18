import { createRaphaelAgentIntent } from "../raphaelAgentAdapter.js";
import {
  reduceRaphaelAgentIntent,
  validateRaphaelAgentIntent
} from "../../engine/raphaelIntentReducer.js";
import { validateRestrictedHabitatAgentActions } from "../autonomy/actionPolicy.js";

const BASE_STATE = Object.freeze({
  activeCompanionId: "greyshade-cat",
  habitatTraces: [],
  emotionalMemories: [],
  explorationProgress: {
    totalExplorations: 0,
    lastNodeId: "moonlake-camp"
  },
  battleRecord: {
    lastBattleAt: null,
    lastResult: null
  }
});

const BASE_COMPANION = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓"
});

function makeCoreResult(overrides = {}) {
  return {
    output: {
      reply: "我在這裡聽著。",
      shouldSpeak: true
    },
    perception: {
      safety: {
        isHighRisk: false,
        action: "allow"
      }
    },
    plan: {
      mode: "normal",
      selectedAction: "say_reply"
    },
    memoryDecision: {
      shouldWrite: true,
      reason: "ordinary_reflection"
    },
    traceDecision: {
      shouldWrite: true,
      shouldApplyTrace: true,
      reason: "ordinary_reflection"
    },
    animationDecision: {
      intent: "presence.listen"
    },
    ...overrides
  };
}

function assertCase(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function inspectCase(name, intent) {
  const validation = validateRaphaelAgentIntent(intent);
  const actionValidation = validateRestrictedHabitatAgentActions(intent.actions);
  const reduction = reduceRaphaelAgentIntent(intent, BASE_STATE);

  assertCase(validation.allowed, `${name}: intent failed validation: ${validation.violations.join(",")}`);
  assertCase(actionValidation.allowed, `${name}: action whitelist failed`);
  assertCase(reduction.accepted, `${name}: reducer rejected intent`);
  assertCase(!("statePatch" in reduction), `${name}: reducer must not expose statePatch`);

  return {
    name,
    actions: intent.actions,
    safetyExit: intent.safetyExit,
    presenceState: reduction.presenceState,
    chatEntries: reduction.chatEntries.length,
    statusText: reduction.statusText || null
  };
}

function runSoulTalkCase(now) {
  const intent = createRaphaelAgentIntent({
    eventType: "soul_talk",
    coreResult: makeCoreResult(),
    state: BASE_STATE,
    companion: BASE_COMPANION,
    now,
    options: {
      speechAlreadyApplied: true,
      animationAlreadyApplied: true
    }
  });

  assertCase(intent.speech === null, "soul_talk: speech should be suppressed after core application");
  return inspectCase("soul_talk", intent);
}

function runSafetyExitCase(now) {
  const intent = createRaphaelAgentIntent({
    eventType: "soul_talk",
    coreResult: makeCoreResult({
      output: {
        reply: "先離開遊戲判定，我們把安全放前面。",
        shouldSpeak: true
      },
      perception: {
        safety: {
          isHighRisk: true,
          action: "safety_redirect"
        }
      },
      plan: {
        mode: "safety_redirect",
        selectedAction: "enter_safe_harbor"
      },
      memoryDecision: {
        shouldWrite: true,
        reason: "must_be_blocked"
      },
      traceDecision: {
        shouldWrite: true,
        shouldApplyTrace: true,
        reason: "must_be_blocked"
      }
    }),
    state: BASE_STATE,
    companion: BASE_COMPANION,
    now,
    options: {
      suppressSpeech: true
    }
  });

  assertCase(intent.safetyExit, "safety_exit: safetyExit flag should be true");
  assertCase(intent.memory.allowed === false, "safety_exit: memory must be blocked");
  assertCase(intent.trace.allowed === false, "safety_exit: trace must be blocked");
  assertCase(intent.suggestion === null, "safety_exit: suggestions must be blocked");

  return inspectCase("safety_exit", intent);
}

function runTouchBoundaryCase(now) {
  const intent = createRaphaelAgentIntent({
    eventType: "touch",
    event: {
      touchType: "pat",
      touchResult: {
        reaction: "reject",
        blocked: true
      }
    },
    state: BASE_STATE,
    companion: BASE_COMPANION,
    now,
    options: {
      suppressSpeech: true,
      animationAlreadyApplied: true
    }
  });

  assertCase(intent.boundary?.mode === "soft_boundary", "touch: boundary should be soft_boundary");
  return inspectCase("touch_boundary", intent);
}

function runReturnEchoCase(now) {
  const intent = createRaphaelAgentIntent({
    eventType: "return_echo",
    event: {
      message: "你回來了。"
    },
    state: BASE_STATE,
    companion: BASE_COMPANION,
    now,
    options: {
      suppressSpeech: true,
      animationAlreadyApplied: true
    }
  });

  assertCase(intent.silence, "return_echo: runtime event should stay silent");
  return inspectCase("return_echo", intent);
}

function runExplorationCase(now) {
  const intent = createRaphaelAgentIntent({
    eventType: "exploration_result",
    event: {
      nodeId: "moonlake-camp",
      totalExplorations: 1
    },
    state: BASE_STATE,
    companion: BASE_COMPANION,
    now,
    options: {
      suppressSpeech: true,
      animationAlreadyApplied: true
    }
  });

  assertCase(intent.suggestion?.type === "exploration", "exploration: suggestion must be passive exploration");
  return inspectCase("exploration_result", intent);
}

function runStandoffCase(now) {
  let inspected = null;
  for (const [index, result] of ["retreat", "retreated", "boundary"].entries()) {
    const intent = createRaphaelAgentIntent({
      eventType: "standoff_result",
      event: {
        result,
        battleAt: now + index
      },
      state: BASE_STATE,
      companion: BASE_COMPANION,
      now: now + index,
      options: {
        suppressSpeech: true,
        animationAlreadyApplied: true
      }
    });

    assertCase(intent.actions.includes("set_boundary"), `standoff: ${result} must stay boundary-scoped`);
    assertCase(intent.boundary?.mode === "soft_boundary", `standoff: ${result} must expose a soft boundary`);
    assertCase(intent.memory?.allowed === false, `standoff: ${result} must not write adapter memory`);
    assertCase(intent.trace?.allowed === false, `standoff: ${result} must not write adapter trace`);
    const current = inspectCase(`standoff_result:${result}`, intent);
    assertCase(current.presenceState === "boundary", `standoff: ${result} must reduce to boundary presence`);
    if (result === "boundary") inspected = current;
  }
  return { ...inspected, name: "standoff_result" };
}

function runForbiddenKeyCase(now) {
  const intent = {
    ...createRaphaelAgentIntent({
      eventType: "touch",
      state: BASE_STATE,
      companion: BASE_COMPANION,
      now,
      options: {
        suppressSpeech: true
      }
    }),
    navigateTo: "memory"
  };
  const validation = validateRaphaelAgentIntent(intent);
  assertCase(!validation.allowed, "forbidden_keys: navigateTo should be rejected");
  assertCase(validation.violations.some((item) => item.startsWith("forbidden_keys:")), "forbidden_keys: missing violation");

  return {
    name: "forbidden_keys",
    rejected: true,
    violations: validation.violations
  };
}

export function runRaphaelAgentEventCases({ now = 1719504000000 } = {}) {
  const cases = [
    runSoulTalkCase(now),
    runSafetyExitCase(now + 1),
    runTouchBoundaryCase(now + 2),
    runReturnEchoCase(now + 3),
    runExplorationCase(now + 4),
    runStandoffCase(now + 5),
    runForbiddenKeyCase(now + 6)
  ];

  return {
    ok: true,
    total: cases.length,
    cases
  };
}

export function installRaphaelAgentEventHarness(target = globalThis) {
  target.__NEXUS_RUN_RAPHAEL_AGENT_EVENT_CASES__ = runRaphaelAgentEventCases;
  return target.__NEXUS_RUN_RAPHAEL_AGENT_EVENT_CASES__;
}

if (typeof window !== "undefined") {
  installRaphaelAgentEventHarness(window);
}
