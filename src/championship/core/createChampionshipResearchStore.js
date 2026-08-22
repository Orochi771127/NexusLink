import {
  clonePlainData,
  createResearchResultEnvelope,
  deepFreeze,
  stableDigest
} from "../contracts/championshipContracts.js";
import { assertChampionshipCommand } from "./championshipCommands.js";
import { assertChampionshipStateInvariants } from "./invariants.js";
import { runAtomicChampionshipTransition } from "./transaction.js";

export const CHAMPIONSHIP_SESSION_LIMITS = Object.freeze({
  acceptedCommands: 128,
  eventLogEntries: 256
});

function rejection(snapshot, code, message) {
  return deepFreeze({
    accepted: false,
    snapshot,
    events: [],
    result: createResearchResultEnvelope({
      accepted: false,
      code,
      message,
      sessionEventDigest: stableDigest(snapshot?.eventLog ?? [])
    })
  });
}

export function createChampionshipResearchStore({ initialState, reducer, catalog, clockPort }) {
  if (!clockPort || typeof clockPort.now !== "function") throw new TypeError("An injected deterministic clock port is required");
  let snapshot = deepFreeze(clonePlainData(initialState));
  let disposed = false;
  const acceptedCommandIds = new Set();
  const listeners = new Set();
  assertChampionshipStateInvariants(snapshot);

  function dispatch(command) {
    if (disposed) return rejection(snapshot, "CHAMPIONSHIP_DISPOSED", "Research session is disposed");
    try {
      command = clonePlainData(command);
      assertChampionshipCommand(command);
    } catch (error) {
      return rejection(snapshot, "CHAMPIONSHIP_INVALID_COMMAND", error.message);
    }
    if (acceptedCommandIds.has(command.commandId)) return rejection(snapshot, "CHAMPIONSHIP_DUPLICATE_COMMAND", "Duplicate command ID");
    if (command.expectedRevision !== snapshot.revision) return rejection(snapshot, "CHAMPIONSHIP_STALE_REVISION", "Stale Championship revision");
    if (
      acceptedCommandIds.size >= CHAMPIONSHIP_SESSION_LIMITS.acceptedCommands
      || snapshot.eventLog.length >= CHAMPIONSHIP_SESSION_LIMITS.eventLogEntries
    ) {
      return rejection(snapshot, "CHAMPIONSHIP_SESSION_LIMIT", "Disposable research session command budget is exhausted");
    }

    const transaction = runAtomicChampionshipTransition(snapshot, command, reducer, { catalog });
    if (!transaction.accepted) return deepFreeze({ ...transaction, snapshot });
    if (snapshot.eventLog.length + transaction.events.length > CHAMPIONSHIP_SESSION_LIMITS.eventLogEntries) {
      return rejection(snapshot, "CHAMPIONSHIP_SESSION_LIMIT", "Disposable research session event budget is exhausted");
    }

    let sequence = snapshot.session.sequence;
    const events = transaction.events.map((descriptor) => {
      sequence += 1;
      return {
        eventId: `${snapshot.session.sessionId}:${sequence}`,
        sessionId: snapshot.session.sessionId,
        sequence,
        at: clockPort.now(),
        domain: "championship",
        type: descriptor.type,
        payload: clonePlainData(descriptor.payload ?? {}),
        evidenceRefs: [...(descriptor.evidenceRefs ?? [])],
        parityStatus: descriptor.parityStatus ?? "RESEARCH_NON_PARITY"
      };
    });
    const nextState = {
      ...transaction.nextState,
      revision: snapshot.revision + 1,
      session: { ...transaction.nextState.session, sequence },
      eventLog: [...snapshot.eventLog, ...events]
    };
    assertChampionshipStateInvariants(nextState);
    const result = createResearchResultEnvelope({
      ...transaction.result,
      sessionEventDigest: stableDigest(nextState.eventLog)
    });
    snapshot = deepFreeze(clonePlainData(nextState));
    acceptedCommandIds.add(command.commandId);
    const publication = deepFreeze({ accepted: true, snapshot, events: deepFreeze(clonePlainData(events)), result });
    for (const listener of [...listeners]) listener(publication);
    return publication;
  }

  return Object.freeze({
    dispatch,
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      if (disposed) throw new Error("Cannot subscribe to a disposed research session");
      if (typeof listener !== "function") throw new TypeError("Listener must be a function");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      listeners.clear();
      acceptedCommandIds.clear();
      snapshot = null;
      disposed = true;
    }
  });
}
