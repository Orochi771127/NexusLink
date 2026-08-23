import { deepFreeze } from "../contracts/championshipContracts.js";
import { createRaisingHomeRuntime } from "../raising/createRaisingHomeRuntime.js";
import {
  deserializeRaisingHomeSaveR2,
  digestCanonicalRaisingHomeDataR2,
  projectRaisingHomeDurableStateR2,
  restoreRaisingHomeSnapshotR2,
  serializeRaisingHomeSaveR2
} from "../raising/raisingHomePersistenceR2.js";
import {
  assertChampionshipSavePortR2,
  createChampionshipSavePortR2
} from "./ChampionshipSavePortR2.js";

const SESSION_ID_PATTERN = /^[a-z0-9:_-]{3,96}$/i;
const SLOT_ID_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,95}$/i;
const STATUS_LISTENER_LIMIT = 32;
const NON_RETRYABLE_WRITE_CODES = new Set([
  "CHAMPIONSHIP_R2_SAVE_INVALID_WRITE",
  "CHAMPIONSHIP_R2_SAVE_IDEMPOTENCY_CONFLICT",
  "CHAMPIONSHIP_R2_SAVE_REVISION_CONFLICT"
]);

function validateId(value, pattern, name) {
  if (typeof value !== "string" || !pattern.test(value)) throw new TypeError(`Championship R2 ${name} is invalid`);
  return value;
}

function result(overrides = {}) {
  return deepFreeze({
    accepted: false,
    code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_REJECTED",
    memoryCommitted: false,
    persistenceAttempted: false,
    browserStorageWrite: false,
    networkMutation: false,
    ...overrides
  });
}

function stateIdentity(snapshot) {
  const durable = projectRaisingHomeDurableStateR2(snapshot);
  return deepFreeze({
    revision: durable.stateRevision,
    digest: digestCanonicalRaisingHomeDataR2(durable, "raising-payload-v2")
  });
}

export function createChampionshipSaveCoordinatorR2({
  sessionId = "championship-r2-session",
  slotId = "raising-home",
  savePort = createChampionshipSavePortR2()
} = {}) {
  validateId(sessionId, SESSION_ID_PATTERN, "sessionId");
  validateId(slotId, SLOT_ID_PATTERN, "save slotId");
  assertChampionshipSavePortR2(savePort);
  const writerToken = savePort.issueWriterToken();

  const restoreRead = savePort.readSnapshot({ slotId });
  if (!restoreRead.accepted && restoreRead.code !== "CHAMPIONSHIP_R2_SAVE_EMPTY") {
    throw new Error(`Championship R2 restore failed: ${restoreRead.code}`);
  }
  const restoredSnapshot = restoreRead.accepted
    ? restoreRaisingHomeSnapshotR2(restoreRead.document, { sessionId })
    : null;
  const runtime = createRaisingHomeRuntime({
    sessionId,
    ...(restoredSnapshot ? { initialSnapshot: restoredSnapshot } : {})
  });
  const statusListeners = new Set();
  let disposed = false;
  let notifying = false;
  let operationSequence = 0;
  let observerFailures = 0;
  let pendingRetry = null;
  let portRevision = restoreRead.revision ?? 0;
  let savedStateRevision = restoreRead.accepted ? restoredSnapshot.revision : null;
  let savedStateDigest = restoreRead.accepted
    ? digestCanonicalRaisingHomeDataR2(restoreRead.document.payload, "raising-payload-v2")
    : null;
  let requiresRepair = restoreRead.source === "LAST_GOOD";
  let dirty = !restoreRead.accepted || requiresRepair;
  let phase = restoreRead.source === "LAST_GOOD"
    ? "RECOVERED"
    : restoreRead.accepted
      ? "RESTORED"
      : "DIRTY";
  let lastCode = restoreRead.accepted ? restoreRead.code : "CHAMPIONSHIP_R2_SAVE_UNSAVED";
  let lastDigest = restoreRead.accepted ? restoreRead.digest : null;
  let recoverySource = restoreRead.source ?? null;
  let lastRuntimeIdentity = stateIdentity(runtime.getSnapshot());

  function getSaveStatus() {
    const inspectedSlot = savePort.inspect({ slotId }).selectedSlot;
    return deepFreeze({
      schemaVersion: 2,
      phase,
      dirty,
      disposed,
      runtimeRevision: lastRuntimeIdentity.revision,
      runtimeDigest: lastRuntimeIdentity.digest,
      savedStateRevision,
      savedStateDigest,
      portRevision,
      canRetry: Boolean(pendingRetry) && !disposed,
      canExportRecovery: dirty || inspectedSlot.currentVerified || inspectedSlot.lastGoodVerified,
      recoverySource,
      lastCode,
      lastDigest,
      observerFailures,
      persistenceAttempted: false,
      browserStorageWrites: 0,
      networkMutations: 0
    });
  }

  function notifyStatus() {
    if (notifying || statusListeners.size === 0) return;
    notifying = true;
    const status = getSaveStatus();
    try {
      for (const listener of [...statusListeners]) {
        try {
          listener(status);
        } catch {
          observerFailures = Math.min(STATUS_LISTENER_LIMIT, observerFailures + 1);
        }
      }
    } finally {
      notifying = false;
    }
  }

  function markRuntimeDirty(publication) {
    if (!publication?.accepted || disposed) return;
    lastRuntimeIdentity = stateIdentity(publication.snapshot);
    dirty = requiresRepair
      || savedStateDigest === null
      || lastRuntimeIdentity.digest !== savedStateDigest
      || lastRuntimeIdentity.revision !== savedStateRevision;
    if (phase !== "SAVE_FAILED") phase = dirty ? "DIRTY" : "CLEAN";
    notifyStatus();
  }

  const unsubscribeRuntime = runtime.subscribe(markRuntimeDirty);

  function nextRequestId(stateRevision) {
    operationSequence += 1;
    return `${writerToken}:save:${portRevision + 1}:${stateRevision}:${operationSequence}`;
  }

  function captureWrite(requestId = null) {
    const snapshot = runtime.getSnapshot();
    const identity = stateIdentity(snapshot);
    return Object.freeze({
      requestId: requestId ?? nextRequestId(identity.revision),
      expectedRevision: portRevision,
      slotId,
      snapshot,
      identity
    });
  }

  function applyWrite(attempt) {
    const publication = savePort.requestWrite({
      requestId: attempt.requestId,
      expectedRevision: attempt.expectedRevision,
      slotId: attempt.slotId,
      snapshot: attempt.snapshot
    });
    if (!publication.accepted) {
      const retryable = !NON_RETRYABLE_WRITE_CODES.has(publication.code);
      pendingRetry = retryable ? attempt : null;
      dirty = true;
      phase = "SAVE_FAILED";
      lastCode = publication.code;
      recoverySource = "PENDING_DIRTY";
      notifyStatus();
      return result({
        ...publication,
        accepted: false,
        dirty: true,
        canRetry: retryable,
        recoverySource: "PENDING_DIRTY"
      });
    }

    portRevision = publication.revision;
    savedStateRevision = attempt.identity.revision;
    savedStateDigest = attempt.identity.digest;
    lastDigest = publication.digest;
    lastCode = publication.code;
    recoverySource = "CURRENT";
    requiresRepair = false;
    pendingRetry = null;
    const currentSnapshot = runtime.getSnapshot();
    lastRuntimeIdentity = stateIdentity(currentSnapshot);
    dirty = lastRuntimeIdentity.revision !== savedStateRevision || lastRuntimeIdentity.digest !== savedStateDigest;
    phase = dirty ? "DIRTY" : "SAVED";
    notifyStatus();
    return result({
      ...publication,
      accepted: true,
      dirty,
      canRetry: false,
      exactStateSaved: !dirty,
      recoverySource: "CURRENT"
    });
  }

  function save() {
    if (disposed) return result({ code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_DISPOSED", dirty });
    if (!dirty) {
      return result({
        accepted: true,
        code: "CHAMPIONSHIP_R2_SAVE_ALREADY_CURRENT",
        memoryCommitted: true,
        dirty: false,
        canRetry: false,
        exactStateSaved: true,
        recoverySource
      });
    }
    return applyWrite(captureWrite());
  }

  function retry() {
    if (disposed) return result({ code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_DISPOSED", dirty });
    if (!pendingRetry) return result({ code: "CHAMPIONSHIP_R2_SAVE_RETRY_UNAVAILABLE", dirty });
    return applyWrite(pendingRetry);
  }

  function exportRecovery() {
    if (disposed) return result({ code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_DISPOSED", dirty, serialized: null });
    if (dirty) {
      try {
        const encoded = serializeRaisingHomeSaveR2(runtime.getSnapshot(), { revision: portRevision + 1 });
        const verified = deserializeRaisingHomeSaveR2(encoded.serialized);
        if (verified.digest !== encoded.digest || verified.serialized !== encoded.serialized) {
          throw new Error("Championship R2 pending recovery round-trip verification failed");
        }
        recoverySource = "PENDING_DIRTY";
        lastCode = "CHAMPIONSHIP_R2_SAVE_PENDING_DIRTY_EXPORT_READY";
        lastDigest = verified.digest;
        notifyStatus();
        return result({
          accepted: true,
          code: lastCode,
          source: "PENDING_DIRTY",
          committed: false,
          dirty: true,
          serialized: verified.serialized,
          digest: verified.digest,
          bytes: verified.bytes,
          mediaType: "application/json",
          fileName: "championship-r2-raising-home-recovery.json"
        });
      } catch (error) {
        lastCode = "CHAMPIONSHIP_R2_SAVE_PENDING_DIRTY_EXPORT_FAILED";
        phase = "SAVE_FAILED";
        notifyStatus();
        return result({
          code: lastCode,
          committed: false,
          dirty: true,
          serialized: null,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
    const exported = savePort.exportRecovery({ slotId });
    if (!exported.accepted) return result({ ...exported, accepted: false, dirty: false });
    recoverySource = exported.source;
    lastCode = exported.code;
    lastDigest = exported.digest;
    notifyStatus();
    return result({
      ...exported,
      accepted: true,
      dirty: false,
      fileName: "championship-r2-raising-home-recovery.json"
    });
  }

  return Object.freeze({
    getRaisingHomeSnapshot() {
      return runtime.getSnapshot();
    },
    dispatchRaisingHome(command) {
      if (disposed) return result({ code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_DISPOSED", snapshot: null });
      return runtime.dispatch(command);
    },
    subscribeRaisingHome(listener) {
      if (disposed) throw new Error("Championship R2 save coordinator is disposed");
      return runtime.subscribe(listener);
    },
    subscribeSaveStatus(listener) {
      if (disposed) throw new Error("Championship R2 save coordinator is disposed");
      if (typeof listener !== "function") throw new TypeError("Championship R2 save status listener must be a function");
      if (statusListeners.size >= STATUS_LISTENER_LIMIT) throw new Error("Championship R2 save status listener budget is exhausted");
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    getSaveStatus,
    save,
    retry,
    exportRecovery,
    inspectPort(input = null) {
      return input === null ? savePort.inspect() : savePort.inspect(input);
    },
    dispose() {
      if (disposed) return result({ accepted: true, code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_ALREADY_DISPOSED" });
      lastRuntimeIdentity = stateIdentity(runtime.getSnapshot());
      unsubscribeRuntime();
      statusListeners.clear();
      runtime.dispose();
      disposed = true;
      phase = "DISPOSED";
      pendingRetry = null;
      return result({ accepted: true, code: "CHAMPIONSHIP_R2_SAVE_COORDINATOR_DISPOSED", dirty });
    }
  });
}
