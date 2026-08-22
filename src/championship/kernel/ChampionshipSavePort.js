import { clonePlainData, deepFreeze } from "../contracts/championshipContracts.js";

export const CHAMPIONSHIP_SAVE_PORT_KIND = "CHAMPIONSHIP_ZERO_WRITE_SAVE_PORT";

export const ChampionshipSavePort = deepFreeze({
  kind: CHAMPIONSHIP_SAVE_PORT_KIND,
  policy: "MEMORY_ONLY_DISCARD_ON_EXIT",
  requiredMethods: ["readSnapshot", "requestWrite", "requestDelete", "inspect"],
  committedWrites: 0
});

function denied(code, request = null) {
  return deepFreeze({
    accepted: false,
    code,
    committable: false,
    persistenceAttempted: false,
    request: request === null ? null : clonePlainData(request)
  });
}

export function assertChampionshipSavePort(port) {
  if (!port || typeof port !== "object") throw new TypeError("Championship save port is required");
  if (port.kind !== CHAMPIONSHIP_SAVE_PORT_KIND) throw new TypeError("Championship save port kind is invalid");
  if (port.policy !== "MEMORY_ONLY_DISCARD_ON_EXIT") throw new Error("Championship save port must discard on exit");
  if (
    !port.capabilities
    || port.capabilities.persistentRead !== false
    || port.capabilities.persistentWrite !== false
    || port.capabilities.persistentDelete !== false
  ) {
    throw new Error("Championship save port must deny persistent reads, writes, and deletes");
  }
  for (const method of ChampionshipSavePort.requiredMethods) {
    if (typeof port[method] !== "function") throw new TypeError(`Championship save port is missing ${method}()`);
  }
  const inspection = port.inspect();
  if (inspection.committedWrites !== 0 || inspection.committedDeletes !== 0) {
    throw new Error("Championship save port reports a persistent mutation");
  }
  return true;
}

export function createNoopChampionshipSavePort() {
  let readRequests = 0;
  let writeRequests = 0;
  let deleteRequests = 0;

  const capabilities = deepFreeze({
    persistentRead: false,
    persistentWrite: false,
    persistentDelete: false
  });

  const port = {
    kind: CHAMPIONSHIP_SAVE_PORT_KIND,
    policy: "MEMORY_ONLY_DISCARD_ON_EXIT",
    capabilities,
    readSnapshot(request = {}) {
      readRequests += 1;
      return denied("CHAMPIONSHIP_PERSISTENT_READ_DISABLED", request);
    },
    requestWrite(request = {}) {
      writeRequests += 1;
      return denied("CHAMPIONSHIP_PERSISTENT_WRITE_DISABLED", request);
    },
    requestDelete(request = {}) {
      deleteRequests += 1;
      return denied("CHAMPIONSHIP_PERSISTENT_DELETE_DISABLED", request);
    },
    inspect() {
      return deepFreeze({
        kind: CHAMPIONSHIP_SAVE_PORT_KIND,
        policy: "MEMORY_ONLY_DISCARD_ON_EXIT",
        readRequests,
        writeRequests,
        deleteRequests,
        committedWrites: 0,
        committedDeletes: 0
      });
    }
  };

  assertChampionshipSavePort(port);
  return Object.freeze(port);
}
