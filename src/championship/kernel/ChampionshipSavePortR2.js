import { deepFreeze } from "../contracts/championshipContracts.js";
import {
  RAISING_HOME_PERSISTENCE_LIMITS_R2,
  deserializeRaisingHomeSaveR2,
  digestCanonicalRaisingHomeDataR2,
  serializeRaisingHomeSaveR2
} from "../raising/raisingHomePersistenceR2.js";

export const CHAMPIONSHIP_SAVE_PORT_R2_KIND = "CHAMPIONSHIP_R2_VERSIONED_MEMORY_SAVE_PORT";
export const CHAMPIONSHIP_SAVE_PORT_R2_POLICY = "MEMORY_ONLY_RESET_ON_REALM_RELOAD";

const FAILURE_STATES = new WeakMap();
const SLOT_ID_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,95}$/i;
const REQUEST_ID_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,127}$/i;
const FAILURE_CODE_PATTERN = /^CHAMPIONSHIP_R2_SAVE_(?:[A-Z0-9_]*FAILURE|[A-Z0-9_]*FAILED)$/;
const WRITE_KEYS = Object.freeze(["requestId", "expectedRevision", "slotId", "snapshot"]);
const READ_KEYS = Object.freeze(["slotId"]);

function freezeResult(result) {
  return deepFreeze({
    accepted: false,
    memoryCommitted: false,
    persistenceAttempted: false,
    persistentWrite: false,
    browserStorageWrite: false,
    networkMutation: false,
    ...result
  });
}

function safeExactRecord(value, expectedKeys, boundaryName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${boundaryName} must be a plain object`);
  let prototype;
  let ownKeys;
  try {
    prototype = Object.getPrototypeOf(value);
    ownKeys = Reflect.ownKeys(value);
  } catch {
    throw new TypeError(`${boundaryName} cannot be inspected safely`);
  }
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError(`${boundaryName} must be a plain object`);
  const expected = new Set(expectedKeys);
  if (ownKeys.length !== expected.size || ownKeys.some((key) => typeof key !== "string" || !expected.has(key))) {
    throw new TypeError(`${boundaryName} fields are not exact`);
  }
  const captured = Object.create(null);
  for (const key of expectedKeys) {
    let descriptor;
    try {
      descriptor = Object.getOwnPropertyDescriptor(value, key);
    } catch {
      throw new TypeError(`${boundaryName}.${key} cannot be inspected safely`);
    }
    if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable || !("value" in descriptor)) {
      throw new TypeError(`${boundaryName}.${key} must be an enumerable data property`);
    }
    captured[key] = descriptor.value;
  }
  return captured;
}

function validateIdentifier(value, pattern, boundaryName) {
  if (typeof value !== "string" || !pattern.test(value)) throw new TypeError(`${boundaryName} is invalid`);
  return value;
}

function validateRevision(value, boundaryName) {
  if (!Number.isSafeInteger(value) || value < 0 || Object.is(value, -0)) throw new TypeError(`${boundaryName} is invalid`);
  return value;
}

function validateFailureCode(code) {
  if (typeof code !== "string" || !FAILURE_CODE_PATTERN.test(code)) throw new TypeError("Injected save failure code is invalid");
  return code;
}

function failureStateFor(controller) {
  const state = FAILURE_STATES.get(controller);
  if (!state) throw new TypeError("Championship R2 save failure controller is invalid");
  return state;
}

export function createChampionshipSaveFailureControllerR2({ quotaBytes = RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes } = {}) {
  validateRevision(quotaBytes, "quotaBytes");
  if (quotaBytes > RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes) {
    throw new RangeError("quotaBytes exceeds the R2 serialization limit");
  }
  const state = {
    quotaBytes,
    writeFailures: [],
    readFailures: [],
    corruptPrimarySlots: new Set(),
    injectedWriteFailures: 0,
    injectedReadFailures: 0,
    injectedCorruptions: 0
  };
  const controller = Object.freeze({
    failNextWrite(code = "CHAMPIONSHIP_R2_SAVE_INJECTED_FAILURE") {
      state.writeFailures.push(validateFailureCode(code));
    },
    failNextRead(code = "CHAMPIONSHIP_R2_SAVE_INJECTED_READ_FAILURE") {
      state.readFailures.push(validateFailureCode(code));
    },
    corruptPrimaryOnNextRead(slotId) {
      state.corruptPrimarySlots.add(validateIdentifier(slotId, SLOT_ID_PATTERN, "slotId"));
    },
    setQuotaBytes(nextQuotaBytes) {
      validateRevision(nextQuotaBytes, "quotaBytes");
      if (nextQuotaBytes > RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes) {
        throw new RangeError("quotaBytes exceeds the R2 serialization limit");
      }
      state.quotaBytes = nextQuotaBytes;
    },
    reset() {
      state.writeFailures.length = 0;
      state.readFailures.length = 0;
      state.corruptPrimarySlots.clear();
      state.quotaBytes = RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes;
    },
    inspect() {
      return deepFreeze({
        quotaBytes: state.quotaBytes,
        pendingWriteFailures: state.writeFailures.length,
        pendingReadFailures: state.readFailures.length,
        pendingCorruptions: state.corruptPrimarySlots.size,
        injectedWriteFailures: state.injectedWriteFailures,
        injectedReadFailures: state.injectedReadFailures,
        injectedCorruptions: state.injectedCorruptions
      });
    }
  });
  FAILURE_STATES.set(controller, state);
  return controller;
}

function createSlot() {
  return {
    revision: 0,
    current: null,
    lastGood: null
  };
}

function cloneRecord(record) {
  return record === null ? null : { ...record };
}

function verifyRecord(record) {
  if (!record || typeof record.serialized !== "string" || typeof record.digest !== "string") return null;
  try {
    const decoded = deserializeRaisingHomeSaveR2(record.serialized);
    if (decoded.serialized !== record.serialized || decoded.digest !== record.digest) return null;
    if (decoded.document.revision !== record.documentRevision) return null;
    return decoded;
  } catch {
    return null;
  }
}

function writeFailure(code, slotRevision, extra = {}) {
  return freezeResult({
    code,
    revision: slotRevision,
    idempotentReplay: false,
    ...extra
  });
}

export function assertChampionshipSavePortR2(port) {
  if (!port || typeof port !== "object") throw new TypeError("Championship R2 save port is required");
  if (port.kind !== CHAMPIONSHIP_SAVE_PORT_R2_KIND || port.policy !== CHAMPIONSHIP_SAVE_PORT_R2_POLICY) {
    throw new TypeError("Championship R2 save port identity is invalid");
  }
  if (
    !port.capabilities
    || port.capabilities.memoryRead !== true
    || port.capabilities.memoryWrite !== true
    || port.capabilities.persistentRead !== false
    || port.capabilities.persistentWrite !== false
    || port.capabilities.network !== false
  ) throw new Error("Championship R2 save port capabilities are invalid");
  for (const method of ["issueWriterToken", "readSnapshot", "requestWrite", "exportRecovery", "inspect"]) {
    if (typeof port[method] !== "function") throw new TypeError(`Championship R2 save port is missing ${method}()`);
  }
  const inspection = port.inspect();
  if (inspection.persistentWrites !== 0 || inspection.browserStorageWrites !== 0 || inspection.networkMutations !== 0) {
    throw new Error("Championship R2 save port reports a forbidden mutation");
  }
  return true;
}

export function createChampionshipSavePortR2({
  quotaBytes = RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes,
  failureController = null
} = {}) {
  const controller = failureController ?? createChampionshipSaveFailureControllerR2({ quotaBytes });
  const failures = failureStateFor(controller);
  if (failureController === null && failures.quotaBytes !== quotaBytes) failures.quotaBytes = quotaBytes;
  const slots = new Map();
  const acceptedRequests = new Map();
  let readRequests = 0;
  let writeRequests = 0;
  let exportRequests = 0;
  let memoryCommits = 0;
  let idempotentReplays = 0;
  let revisionConflicts = 0;
  let quotaFailures = 0;
  let injectedFailures = 0;
  let lastGoodRecoveries = 0;
  let writerTokensIssued = 0;

  const capabilities = deepFreeze({
    memoryRead: true,
    memoryWrite: true,
    deterministicSerialization: true,
    schemaMigration: true,
    lastGoodRecovery: true,
    persistentRead: false,
    persistentWrite: false,
    persistentDelete: false,
    browserStorage: false,
    network: false
  });

  function slotFor(slotId, create = false) {
    let slot = slots.get(slotId) ?? null;
    if (!slot && create) {
      slot = createSlot();
      slots.set(slotId, slot);
    }
    return slot;
  }

  function corruptPrimaryIfRequested(slotId, slot) {
    if (!slot || !slot.current || !failures.corruptPrimarySlots.delete(slotId)) return;
    failures.injectedCorruptions += 1;
    slot.current = { ...slot.current, serialized: `${slot.current.serialized.slice(0, -1)}!` };
  }

  function readVerified(slotId, { consumeFailures = true } = {}) {
    const slot = slotFor(slotId);
    if (!slot) return { slot: null, decoded: null, source: null };
    if (consumeFailures) corruptPrimaryIfRequested(slotId, slot);
    const current = verifyRecord(slot.current);
    if (current) return { slot, decoded: current, source: "CURRENT", record: slot.current };
    const lastGood = verifyRecord(slot.lastGood);
    if (lastGood) {
      lastGoodRecoveries += 1;
      return { slot, decoded: lastGood, source: "LAST_GOOD", record: slot.lastGood };
    }
    return { slot, decoded: null, source: null, record: null };
  }

  const port = {
    kind: CHAMPIONSHIP_SAVE_PORT_R2_KIND,
    policy: CHAMPIONSHIP_SAVE_PORT_R2_POLICY,
    capabilities,
    issueWriterToken() {
      if (writerTokensIssued >= Number.MAX_SAFE_INTEGER) throw new Error("Championship R2 writer token budget is exhausted");
      writerTokensIssued += 1;
      return `writer:${writerTokensIssued}`;
    },
    readSnapshot(input = {}) {
      readRequests += 1;
      let request;
      try {
        request = safeExactRecord(input, READ_KEYS, "Championship R2 read request");
        validateIdentifier(request.slotId, SLOT_ID_PATTERN, "slotId");
      } catch (error) {
        return freezeResult({ code: "CHAMPIONSHIP_R2_SAVE_INVALID_READ", message: error instanceof Error ? error.message : String(error), snapshot: null });
      }
      const slot = slotFor(request.slotId);
      const injected = failures.readFailures.shift();
      if (injected) {
        failures.injectedReadFailures += 1;
        return freezeResult({ code: injected, revision: slot?.revision ?? 0, snapshot: null });
      }
      const verified = readVerified(request.slotId);
      if (!verified.decoded) {
        return freezeResult({
          code: verified.slot ? "CHAMPIONSHIP_R2_SAVE_UNRECOVERABLE" : "CHAMPIONSHIP_R2_SAVE_EMPTY",
          revision: verified.slot?.revision ?? 0,
          snapshot: null,
          source: null
        });
      }
      return freezeResult({
        accepted: true,
        code: verified.source === "LAST_GOOD" ? "CHAMPIONSHIP_R2_SAVE_RECOVERED_LAST_GOOD" : "CHAMPIONSHIP_R2_SAVE_READ_OK",
        revision: verified.slot.revision,
        documentRevision: verified.decoded.document.revision,
        document: verified.decoded.document,
        durableState: verified.decoded.durableState,
        digest: verified.decoded.digest,
        source: verified.source,
        recovered: verified.source === "LAST_GOOD",
        memoryCommitted: true
      });
    },
    requestWrite(input = {}) {
      writeRequests += 1;
      let request;
      let encoded;
      let fingerprint;
      try {
        request = safeExactRecord(input, WRITE_KEYS, "Championship R2 write request");
        validateIdentifier(request.requestId, REQUEST_ID_PATTERN, "requestId");
        validateIdentifier(request.slotId, SLOT_ID_PATTERN, "slotId");
        validateRevision(request.expectedRevision, "expectedRevision");
        const snapshotEncoding = serializeRaisingHomeSaveR2(request.snapshot, { revision: request.expectedRevision + 1 });
        fingerprint = digestCanonicalRaisingHomeDataR2({
          expectedRevision: request.expectedRevision,
          slotId: request.slotId,
          payloadDigest: snapshotEncoding.document.payloadDigest
        }, "save-request-v2");
        encoded = snapshotEncoding;
      } catch (error) {
        return writeFailure("CHAMPIONSHIP_R2_SAVE_INVALID_WRITE", 0, { message: error instanceof Error ? error.message : String(error) });
      }

      const idempotencyKey = `${request.slotId}\u0000${request.requestId}`;
      const previousRequest = acceptedRequests.get(idempotencyKey);
      if (previousRequest) {
        if (previousRequest.fingerprint !== fingerprint) {
          return writeFailure("CHAMPIONSHIP_R2_SAVE_IDEMPOTENCY_CONFLICT", slotFor(request.slotId)?.revision ?? 0);
        }
        idempotentReplays += 1;
        return freezeResult({ ...previousRequest.result, idempotentReplay: true });
      }

      const existingSlot = slotFor(request.slotId);
      const slot = existingSlot ?? createSlot();
      if (request.expectedRevision !== slot.revision) {
        revisionConflicts += 1;
        return writeFailure("CHAMPIONSHIP_R2_SAVE_REVISION_CONFLICT", slot.revision, { expectedRevision: request.expectedRevision });
      }

      const injected = failures.writeFailures.shift();
      if (injected) {
        failures.injectedWriteFailures += 1;
        injectedFailures += 1;
        return writeFailure(injected, slot.revision);
      }
      if (encoded.bytes > failures.quotaBytes) {
        quotaFailures += 1;
        return writeFailure("CHAMPIONSHIP_R2_SAVE_QUOTA_EXCEEDED", slot.revision, {
          bytes: encoded.bytes,
          quotaBytes: failures.quotaBytes
        });
      }

      const previousCurrent = cloneRecord(slot.current);
      const verifiedPrevious = verifyRecord(previousCurrent);
      const nextRevision = slot.revision + 1;
      if (encoded.document.revision !== nextRevision) throw new Error("Championship R2 save revision encoding drifted");
      const nextRecord = Object.freeze({
        serialized: encoded.serialized,
        digest: encoded.digest,
        documentRevision: nextRevision,
        stateRevision: encoded.document.payload.stateRevision,
        requestId: request.requestId
      });
      const success = freezeResult({
        accepted: true,
        code: "CHAMPIONSHIP_R2_SAVE_OK",
        memoryCommitted: true,
        revision: nextRevision,
        stateRevision: nextRecord.stateRevision,
        digest: nextRecord.digest,
        bytes: encoded.bytes,
        idempotentReplay: false
      });

      // The swap is last: validation, conflict, injected failure, and quota all complete first.
      slot.lastGood = verifiedPrevious ? previousCurrent : slot.lastGood;
      slot.current = nextRecord;
      slot.revision = nextRevision;
      if (!existingSlot) slots.set(request.slotId, slot);
      memoryCommits += 1;
      acceptedRequests.set(idempotencyKey, Object.freeze({ fingerprint, result: success }));
      return success;
    },
    exportRecovery(input = {}) {
      exportRequests += 1;
      let request;
      try {
        request = safeExactRecord(input, READ_KEYS, "Championship R2 recovery export request");
        validateIdentifier(request.slotId, SLOT_ID_PATTERN, "slotId");
      } catch (error) {
        return freezeResult({ code: "CHAMPIONSHIP_R2_SAVE_INVALID_EXPORT", message: error instanceof Error ? error.message : String(error) });
      }
      const slot = slotFor(request.slotId);
      const verifiedCurrent = slot ? verifyRecord(slot.current) : null;
      const verifiedLastGood = slot ? verifyRecord(slot.lastGood) : null;
      const recovery = verifiedCurrent ?? verifiedLastGood;
      const source = verifiedCurrent ? "CURRENT" : verifiedLastGood ? "LAST_GOOD" : null;
      if (!recovery) {
        return freezeResult({
          code: "CHAMPIONSHIP_R2_SAVE_NO_LAST_GOOD_EXPORT",
          revision: slot?.revision ?? 0,
          source: null,
          serialized: null,
          digest: null,
          committed: false
        });
      }
      return freezeResult({
        accepted: true,
        code: "CHAMPIONSHIP_R2_SAVE_RECOVERY_EXPORT_READY",
        memoryCommitted: true,
        revision: slot.revision,
        documentRevision: recovery.document.revision,
        source,
        serialized: recovery.serialized,
        digest: recovery.digest,
        committed: true,
        mediaType: "application/json"
      });
    },
    inspect(input = null) {
      let selectedSlot = null;
      if (input !== null) {
        const request = safeExactRecord(input, READ_KEYS, "Championship R2 inspection request");
        validateIdentifier(request.slotId, SLOT_ID_PATTERN, "slotId");
        const slot = slotFor(request.slotId);
        selectedSlot = slot ? {
          slotId: request.slotId,
          revision: slot.revision,
          hasCurrent: Boolean(slot.current),
          currentVerified: Boolean(verifyRecord(slot.current)),
          hasLastGood: Boolean(slot.lastGood),
          lastGoodVerified: Boolean(verifyRecord(slot.lastGood))
        } : {
          slotId: request.slotId,
          revision: 0,
          hasCurrent: false,
          currentVerified: false,
          hasLastGood: false,
          lastGoodVerified: false
        };
      }
      return deepFreeze({
        kind: CHAMPIONSHIP_SAVE_PORT_R2_KIND,
        policy: CHAMPIONSHIP_SAVE_PORT_R2_POLICY,
        slotCount: slots.size,
        readRequests,
        writeRequests,
        exportRequests,
        memoryCommits,
        idempotentReplays,
        revisionConflicts,
        quotaFailures,
        injectedFailures,
        lastGoodRecoveries,
        writerTokensIssued,
        persistentWrites: 0,
        browserStorageWrites: 0,
        networkMutations: 0,
        selectedSlot
      });
    }
  };

  assertChampionshipSavePortR2(port);
  return Object.freeze(port);
}
