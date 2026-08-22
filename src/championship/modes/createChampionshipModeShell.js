import { clonePlainData, deepFreeze } from "../contracts/championshipContracts.js";

export const CHAMPIONSHIP_MODE_SHELL_STATES = deepFreeze([
  "CREATED",
  "ACTIVE",
  "SUSPENDED",
  "EXITED",
  "DISPOSED"
]);

const ALLOWED_FROM = deepFreeze({
  enter: ["CREATED", "EXITED"],
  suspend: ["ACTIVE"],
  resume: ["SUSPENDED"],
  exit: ["ACTIVE", "SUSPENDED"],
  dispose: ["CREATED", "ACTIVE", "SUSPENDED", "EXITED"]
});

const NEXT_STATE = deepFreeze({
  enter: "ACTIVE",
  suspend: "SUSPENDED",
  resume: "ACTIVE",
  exit: "EXITED",
  dispose: "DISPOSED"
});

function assertModeId(modeId) {
  if (typeof modeId !== "string" || !/^championship:mode:[a-z0-9-]+$/.test(modeId)) {
    throw new TypeError("Championship mode ID must be project-native and sanitized");
  }
}

export function createChampionshipModeShell({ modeId }) {
  assertModeId(modeId);
  let lifecycle = "CREATED";
  let revision = 0;

  function transition(action, context = {}) {
    const safeContext = deepFreeze(clonePlainData(context));
    if (!ALLOWED_FROM[action].includes(lifecycle)) {
      throw new Error(`Cannot ${action} ${modeId} from ${lifecycle}`);
    }
    const previousLifecycle = lifecycle;
    lifecycle = NEXT_STATE[action];
    revision += 1;
    return deepFreeze({
      modeId,
      action,
      previousLifecycle,
      lifecycle,
      revision,
      context: safeContext,
      simulationAttached: false,
      rendererAttached: false
    });
  }

  return Object.freeze({
    modeId,
    enter: (context) => transition("enter", context),
    suspend: (context) => transition("suspend", context),
    resume: (context) => transition("resume", context),
    exit: (context) => transition("exit", context),
    dispose: (context) => transition("dispose", context),
    getSnapshot() {
      return deepFreeze({
        modeId,
        lifecycle,
        revision,
        simulationAttached: false,
        rendererAttached: false
      });
    }
  });
}
