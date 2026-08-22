import { deepFreeze } from "../contracts/championshipContracts.js";
import { createChampionshipModeRouter } from "../kernel/ChampionshipModeRouter.js";
import { CHAMPIONSHIP_MODE_IDS } from "../modes/championshipModeRegistry.js";
import { createRaisingHomeRuntime } from "../raising/createRaisingHomeRuntime.js";

export function createChampionshipR2Session({ sessionId = "championship-r2-session", savePort, modeRegistry } = {}) {
  const modeRouter = createChampionshipModeRouter({
    ...(savePort ? { savePort } : {}),
    ...(modeRegistry ? { registry: modeRegistry } : {})
  });
  const raisingHome = createRaisingHomeRuntime({ sessionId });
  let commandSequence = 0;
  let opened = false;
  let disposed = false;

  function nextCommandId(action) {
    commandSequence += 1;
    return `${sessionId}:${action}:${commandSequence}`;
  }

  async function open() {
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
      disposed,
      mode: modeRouter.getSnapshot(),
      raisingHome: raisingHome.getSnapshot(),
      saveBoundary: modeRouter.inspectSaveBoundary()
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
      return raisingHome.getSnapshot();
    },
    dispatchRaisingHome(command) {
      return raisingHome.dispatch(command);
    },
    subscribeRaisingHome(listener) {
      return raisingHome.subscribe(listener);
    },
    async dispose() {
      if (disposed) return deepFreeze({ accepted: true, code: "CHAMPIONSHIP_R2_ALREADY_DISPOSED" });
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
        raisingHome.dispose();
        disposed = true;
        opened = false;
      }
      return publication;
    }
  });
}
