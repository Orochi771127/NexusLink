import { deepFreeze } from "../contracts/championshipContracts.js";
import { createChampionshipModeRouter } from "../kernel/ChampionshipModeRouter.js";
import { createChampionshipSaveCoordinatorR2 } from "../kernel/ChampionshipSaveCoordinatorR2.js";
import { CHAMPIONSHIP_MODE_IDS } from "../modes/championshipModeRegistry.js";

export function createChampionshipR2Session({
  sessionId = "championship-r2-session",
  savePort,
  raisingSavePort,
  raisingSaveSlotId = "raising-home",
  modeRegistry
} = {}) {
  const modeRouter = createChampionshipModeRouter({
    ...(savePort ? { savePort } : {}),
    ...(modeRegistry ? { registry: modeRegistry } : {})
  });
  const raisingSave = createChampionshipSaveCoordinatorR2({
    sessionId,
    slotId: raisingSaveSlotId,
    ...(raisingSavePort ? { savePort: raisingSavePort } : {})
  });
  let commandSequence = 0;
  let opened = false;
  let disposing = false;
  let disposed = false;

  function disposingRejection(code = "CHAMPIONSHIP_R2_DISPOSING") {
    return deepFreeze({
      accepted: false,
      code,
      persistenceAttempted: false,
      browserStorageWrite: false,
      networkMutation: false
    });
  }

  function nextCommandId(action) {
    commandSequence += 1;
    return `${sessionId}:${action}:${commandSequence}`;
  }

  async function open() {
    if (disposing) throw new Error("Championship R2 session is disposing");
    if (disposed) throw new Error("Championship R2 session is disposed");
    if (opened) return deepFreeze({ accepted: true, code: "CHAMPIONSHIP_R2_ALREADY_OPEN", snapshot: getSnapshot() });
    const publication = await modeRouter.enter({
      commandId: nextCommandId("open"),
      expectedRevision: modeRouter.getSnapshot().revision,
      modeId: CHAMPIONSHIP_MODE_IDS.RAISING_HOME,
      payload: { sessionId, runtimePort: "raising-home-session" }
    });
    if (!publication.accepted) throw new Error(publication.message ?? publication.code);
    opened = true;
    return publication;
  }

  function getSnapshot() {
    return deepFreeze({
      sessionId,
      opened,
      disposing,
      disposed,
      mode: modeRouter.getSnapshot(),
      raisingHome: raisingSave.getRaisingHomeSnapshot(),
      saveBoundary: modeRouter.inspectSaveBoundary(),
      raisingSave: raisingSave.getSaveStatus()
    });
  }

  return Object.freeze({
    open,
    getSnapshot,
    listModes() {
      return deepFreeze(modeRouter.listModes().map((entry) => ({
        modeId: entry.modeId,
        activationPolicy: entry.activationPolicy,
        authority: entry.authority,
        parityScope: entry.parityScope
      })));
    },
    getRaisingHomeSnapshot() {
      return raisingSave.getRaisingHomeSnapshot();
    },
    dispatchRaisingHome(command) {
      if (disposing || disposed) return disposingRejection(disposed ? "CHAMPIONSHIP_R2_DISPOSED" : undefined);
      return raisingSave.dispatchRaisingHome(command);
    },
    subscribeRaisingHome(listener) {
      if (disposing || disposed) throw new Error(`Championship R2 session is ${disposed ? "disposed" : "disposing"}`);
      return raisingSave.subscribeRaisingHome(listener);
    },
    getSaveStatus() {
      return raisingSave.getSaveStatus();
    },
    subscribeSaveStatus(listener) {
      if (disposing || disposed) throw new Error(`Championship R2 session is ${disposed ? "disposed" : "disposing"}`);
      return raisingSave.subscribeSaveStatus(listener);
    },
    saveRaisingHome() {
      if (disposing || disposed) return disposingRejection(disposed ? "CHAMPIONSHIP_R2_DISPOSED" : undefined);
      return raisingSave.save();
    },
    retryRaisingHomeSave() {
      if (disposing || disposed) return disposingRejection(disposed ? "CHAMPIONSHIP_R2_DISPOSED" : undefined);
      return raisingSave.retry();
    },
    exportRaisingHomeRecovery() {
      if (disposing || disposed) return disposingRejection(disposed ? "CHAMPIONSHIP_R2_DISPOSED" : undefined);
      return raisingSave.exportRecovery();
    },
    inspectRaisingSaveBoundary(input = null) {
      return raisingSave.inspectPort(input);
    },
    async dispose() {
      if (disposed) return deepFreeze({ accepted: true, code: "CHAMPIONSHIP_R2_ALREADY_DISPOSED" });
      if (disposing) return disposingRejection("CHAMPIONSHIP_R2_DISPOSE_IN_PROGRESS");
      disposing = true;
      raisingSave.dispose();
      if (["ACTIVE", "SUSPENDED"].includes(modeRouter.getSnapshot().lifecycle)) {
        const exited = await modeRouter.exit({
          commandId: nextCommandId("exit"),
          expectedRevision: modeRouter.getSnapshot().revision
        });
        if (!exited.accepted) return exited;
      }
      const publication = await modeRouter.dispose({
        commandId: nextCommandId("dispose"),
        expectedRevision: modeRouter.getSnapshot().revision
      });
      if (publication.accepted) {
        disposed = true;
        disposing = false;
        opened = false;
      }
      return publication;
    }
  });
}
