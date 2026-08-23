import { clonePlainData, deepFreeze } from "../contracts/championshipContracts.js";
import {
  RAISING_HOME_FIELD,
  canEnterRaisingHome,
  createRaisingHomeInitialState
} from "./raisingHomeDefinition.js";

export const RAISING_HOME_SAVE_SCHEMA_VERSION_R2 = 2;
export const RAISING_HOME_SAVE_KIND_R2 = "CHAMPIONSHIP_R2_RAISING_HOME_SAVE";
export const RAISING_HOME_ADAPTATION_REF_R2 = "NEXUS_ADAPTATION:RAISING_HOME_R2";

export const RAISING_HOME_PERSISTENCE_LIMITS_R2 = deepFreeze({
  maxDepth: 20,
  maxNodes: 4096,
  maxArrayLength: 256,
  maxObjectKeys: 64,
  maxStringLength: 4096,
  maxTotalStringLength: 131072,
  maxSerializedBytes: 262144
});

const RUNTIME_STATE_KEYS = Object.freeze([
  "schemaVersion", "modeId", "sessionId", "revision", "tick", "paused",
  "clockMinutes", "caretakerPosition", "selectedResidentId", "residents",
  "field", "feedback", "eventLog"
]);
const RUNTIME_RESIDENT_KEYS = Object.freeze([
  "residentId", "speciesId", "name", "position", "temperament", "satiety",
  "energy", "ease", "readiness", "facing", "intent", "lastResponse"
]);
const DURABLE_STATE_KEYS_V1 = Object.freeze([
  "stateRevision", "tick", "clockMinutes", "caretakerPosition",
  "selectedResidentId", "residents"
]);
const DURABLE_STATE_KEYS_V2 = Object.freeze([...DURABLE_STATE_KEYS_V1, "paused"]);
const DURABLE_RESIDENT_KEYS = Object.freeze([
  "residentId", "position", "satiety", "energy", "ease", "readiness",
  "facing", "intent", "lastResponse"
]);
const POSITION_KEYS = Object.freeze(["x", "y"]);
const EVENT_KEYS = Object.freeze(["sequence", "tick", "type", "message"]);
const V1_KEYS = Object.freeze(["schemaVersion", "saveKind", "revision", "payload"]);
const V2_KEYS = Object.freeze([
  "schemaVersion", "saveKind", "adaptationRef", "revision", "payload", "payloadDigest"
]);
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const RESIDENT_IDS = new Set([
  "resident:greyshade-cat",
  "resident:blazetail-kit",
  "resident:crystalfin-seahorse"
]);
const DIRECTION_IDS = new Set(["up", "down", "left", "right"]);
const FIELD_SERIALIZATION = JSON.stringify(clonePlainData(RAISING_HOME_FIELD));
const SESSION_ID_PATTERN = /^[a-z0-9:_-]{3,96}$/i;
const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,127}$/i;
const UTF8 = new TextEncoder();
const SHA256_INITIAL = Object.freeze([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);
const SHA256_ROUND = Object.freeze([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function persistenceError(message) {
  return new TypeError(`Championship R2 save validation failed: ${message}`);
}

function safePrototype(value, path) {
  try {
    return Object.getPrototypeOf(value);
  } catch {
    throw persistenceError(`${path} prototype is not safely inspectable`);
  }
}

function safeOwnKeys(value, path) {
  try {
    return Reflect.ownKeys(value);
  } catch {
    throw persistenceError(`${path} keys are not safely inspectable`);
  }
}

function safeDescriptor(value, key, path) {
  try {
    return Object.getOwnPropertyDescriptor(value, key);
  } catch {
    throw persistenceError(`${path}.${String(key)} descriptor is not safely inspectable`);
  }
}

function cloneBoundedPlainData(value, limits = RAISING_HOME_PERSISTENCE_LIMITS_R2) {
  const seen = new WeakSet();
  const budget = { nodes: 0, stringLength: 0 };

  function capture(entry, path, depth) {
    budget.nodes += 1;
    if (budget.nodes > limits.maxNodes) throw persistenceError("plain-data node budget exceeded");
    if (depth > limits.maxDepth) throw persistenceError("plain-data depth budget exceeded");
    if (entry === null || typeof entry === "boolean") return entry;
    if (typeof entry === "string") {
      if (entry.length > limits.maxStringLength) throw persistenceError(`${path} string is too long`);
      budget.stringLength += entry.length;
      if (budget.stringLength > limits.maxTotalStringLength) throw persistenceError("plain-data string budget exceeded");
      return entry;
    }
    if (typeof entry === "number") {
      if (!Number.isFinite(entry) || Object.is(entry, -0)) throw persistenceError(`${path} must be a finite number other than -0`);
      return entry;
    }
    if (!entry || typeof entry !== "object") throw persistenceError(`${path} must be plain serializable data`);
    if (seen.has(entry)) throw persistenceError(`${path} contains a cycle or shared object reference`);
    seen.add(entry);

    const prototype = safePrototype(entry, path);
    const ownKeys = safeOwnKeys(entry, path);
    if (Array.isArray(entry)) {
      if (prototype !== Array.prototype) throw persistenceError(`${path} must use the standard array prototype`);
      const lengthDescriptor = safeDescriptor(entry, "length", path);
      const length = lengthDescriptor?.value;
      if (!Number.isSafeInteger(length) || length < 0 || length > limits.maxArrayLength) {
        throw persistenceError(`${path} array length is invalid`);
      }
      const expectedKeys = new Set(["length", ...Array.from({ length }, (_, index) => String(index))]);
      if (ownKeys.length !== expectedKeys.size || ownKeys.some((key) => typeof key !== "string" || !expectedKeys.has(key))) {
        throw persistenceError(`${path} must be a dense array without extra or symbol keys`);
      }
      const output = [];
      for (let index = 0; index < length; index += 1) {
        const descriptor = safeDescriptor(entry, String(index), path);
        if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable || !("value" in descriptor)) {
          throw persistenceError(`${path}.${index} must be an enumerable data property`);
        }
        output.push(capture(descriptor.value, `${path}.${index}`, depth + 1));
      }
      return output;
    }

    if (prototype !== Object.prototype && prototype !== null) throw persistenceError(`${path} must be a plain object`);
    if (ownKeys.length > limits.maxObjectKeys) throw persistenceError(`${path} has too many keys`);
    const stringKeys = ownKeys.map((key) => {
      if (typeof key !== "string") throw persistenceError(`${path} cannot contain symbol keys`);
      if (FORBIDDEN_KEYS.has(key)) throw persistenceError(`${path} contains forbidden key ${key}`);
      return key;
    }).sort();
    const output = {};
    for (const key of stringKeys) {
      const descriptor = safeDescriptor(entry, key, path);
      if (!descriptor || descriptor.get || descriptor.set || !descriptor.enumerable || !("value" in descriptor)) {
        throw persistenceError(`${path}.${key} must be an enumerable data property`);
      }
      output[key] = capture(descriptor.value, `${path}.${key}`, depth + 1);
    }
    return output;
  }

  return capture(value, "save", 0);
}

function assertExactKeys(value, expectedKeys, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw persistenceError(`${path} must be an object`);
  const keys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw persistenceError(`${path} fields are not exact`);
  }
}

function assertSafeInteger(value, path, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum || Object.is(value, -0)) {
    throw persistenceError(`${path} must be a bounded safe integer`);
  }
}

function assertString(value, path, { pattern = null, minimum = 1, maximum = 256 } = {}) {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum || (pattern && !pattern.test(value))) {
    throw persistenceError(`${path} is invalid`);
  }
}

function assertPosition(position, path, field) {
  assertExactKeys(position, POSITION_KEYS, path);
  assertSafeInteger(position.x, `${path}.x`, 0, field.width - 1);
  assertSafeInteger(position.y, `${path}.y`, 0, field.height - 1);
  if (!canEnterRaisingHome(position, field)) throw persistenceError(`${path} is blocked or out of bounds`);
}

function assertMutableResident(resident, path, keys = DURABLE_RESIDENT_KEYS, field = RAISING_HOME_FIELD) {
  assertExactKeys(resident, keys, path);
  assertString(resident.residentId, `${path}.residentId`, { pattern: SAFE_ID_PATTERN, maximum: 96 });
  if (!RESIDENT_IDS.has(resident.residentId)) throw persistenceError(`${path}.residentId is unknown`);
  assertPosition(resident.position, `${path}.position`, field);
  for (const key of ["satiety", "energy", "ease", "readiness"]) assertSafeInteger(resident[key], `${path}.${key}`, 0, 100);
  if (!DIRECTION_IDS.has(resident.facing)) throw persistenceError(`${path}.facing is invalid`);
  assertString(resident.intent, `${path}.intent`, { pattern: SAFE_ID_PATTERN, maximum: 64 });
  assertString(resident.lastResponse, `${path}.lastResponse`, { pattern: SAFE_ID_PATTERN, maximum: 64 });
}

function assertResidentSet(residents, path, validator) {
  if (!Array.isArray(residents) || residents.length !== RESIDENT_IDS.size) {
    throw persistenceError(`${path} must contain the exact R2 resident count`);
  }
  const seenResidents = new Set();
  for (const [index, resident] of residents.entries()) {
    validator(resident, `${path}.${index}`);
    if (seenResidents.has(resident.residentId)) throw persistenceError(`${path}.${index}.residentId is duplicated`);
    seenResidents.add(resident.residentId);
  }
  for (const residentId of RESIDENT_IDS) {
    if (!seenResidents.has(residentId)) throw persistenceError(`${path} is missing ${residentId}`);
  }
  return seenResidents;
}

function assertRaisingHomeRuntimeState(state) {
  assertExactKeys(state, RUNTIME_STATE_KEYS, "raisingHome");
  if (state.schemaVersion !== 2) throw persistenceError("raisingHome.schemaVersion must be 2");
  if (state.modeId !== "raising-home") throw persistenceError("raisingHome.modeId is invalid");
  assertString(state.sessionId, "raisingHome.sessionId", { pattern: SESSION_ID_PATTERN, minimum: 3, maximum: 96 });
  assertSafeInteger(state.revision, "raisingHome.revision");
  assertSafeInteger(state.tick, "raisingHome.tick", 0, state.revision);
  if (typeof state.paused !== "boolean") throw persistenceError("raisingHome.paused must be boolean");
  assertSafeInteger(state.clockMinutes, "raisingHome.clockMinutes", 0, 1439);
  if (JSON.stringify(state.field) !== FIELD_SERIALIZATION) throw persistenceError("raisingHome.field is not the current R2 field");
  assertPosition(state.caretakerPosition, "raisingHome.caretakerPosition", state.field);
  assertString(state.selectedResidentId, "raisingHome.selectedResidentId", { pattern: SAFE_ID_PATTERN, maximum: 96 });
  const residentIds = assertResidentSet(state.residents, "raisingHome.residents", (resident, path) => {
    assertExactKeys(resident, RUNTIME_RESIDENT_KEYS, path);
    assertMutableResident({
      residentId: resident.residentId,
      position: resident.position,
      satiety: resident.satiety,
      energy: resident.energy,
      ease: resident.ease,
      readiness: resident.readiness,
      facing: resident.facing,
      intent: resident.intent,
      lastResponse: resident.lastResponse
    }, path);
    assertString(resident.speciesId, `${path}.speciesId`, { pattern: SAFE_ID_PATTERN, maximum: 96 });
    if (resident.residentId !== `resident:${resident.speciesId}`) throw persistenceError(`${path}.speciesId does not match residentId`);
    assertString(resident.name, `${path}.name`, { maximum: 64 });
    assertString(resident.temperament, `${path}.temperament`, { pattern: SAFE_ID_PATTERN, maximum: 64 });
  });
  if (!residentIds.has(state.selectedResidentId)) throw persistenceError("raisingHome.selectedResidentId is missing");
  assertString(state.feedback, "raisingHome.feedback", { maximum: 512 });
  if (!Array.isArray(state.eventLog) || state.eventLog.length > 48) throw persistenceError("raisingHome.eventLog exceeds its bound");
  let previousSequence = 0;
  for (const [index, event] of state.eventLog.entries()) {
    const path = `raisingHome.eventLog.${index}`;
    assertExactKeys(event, EVENT_KEYS, path);
    assertSafeInteger(event.sequence, `${path}.sequence`, 1, state.revision);
    if (event.sequence <= previousSequence) throw persistenceError(`${path}.sequence must increase`);
    previousSequence = event.sequence;
    assertSafeInteger(event.tick, `${path}.tick`, 0, state.tick);
    assertString(event.type, `${path}.type`, { pattern: /^[A-Z][A-Z0-9_]{1,63}$/, maximum: 64 });
    assertString(event.message, `${path}.message`, { maximum: 512 });
  }
  return state;
}

function validateDurableState(input, { version = 2 } = {}) {
  const state = cloneBoundedPlainData(input);
  assertExactKeys(state, version === 1 ? DURABLE_STATE_KEYS_V1 : DURABLE_STATE_KEYS_V2, `saveV${version}.payload`);
  assertSafeInteger(state.stateRevision, `saveV${version}.payload.stateRevision`);
  assertSafeInteger(state.tick, `saveV${version}.payload.tick`, 0, state.stateRevision);
  if (version === 2 && typeof state.paused !== "boolean") throw persistenceError("saveV2.payload.paused must be boolean");
  assertSafeInteger(state.clockMinutes, `saveV${version}.payload.clockMinutes`, 0, 1439);
  assertPosition(state.caretakerPosition, `saveV${version}.payload.caretakerPosition`, RAISING_HOME_FIELD);
  assertString(state.selectedResidentId, `saveV${version}.payload.selectedResidentId`, { pattern: SAFE_ID_PATTERN, maximum: 96 });
  const residentIds = assertResidentSet(state.residents, `saveV${version}.payload.residents`, assertMutableResident);
  if (!residentIds.has(state.selectedResidentId)) throw persistenceError(`saveV${version}.payload.selectedResidentId is missing`);
  return deepFreeze(state);
}

function rotateRight(value, bits) {
  return (value >>> bits) | (value << (32 - bits));
}

function sha256Hex(bytes) {
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const bitLength = bytes.length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  const hash = [...SHA256_INITIAL];
  const words = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
      const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choice + SHA256_ROUND[index] + words[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }
  return hash.map((value) => value.toString(16).padStart(8, "0")).join("");
}

export function captureRaisingHomeSnapshotR2(input) {
  const captured = cloneBoundedPlainData(input);
  assertRaisingHomeRuntimeState(captured);
  return deepFreeze(captured);
}

export function projectRaisingHomeDurableStateR2(snapshot) {
  const state = captureRaisingHomeSnapshotR2(snapshot);
  return validateDurableState({
    stateRevision: state.revision,
    tick: state.tick,
    paused: state.paused,
    clockMinutes: state.clockMinutes,
    caretakerPosition: state.caretakerPosition,
    selectedResidentId: state.selectedResidentId,
    residents: state.residents.map((resident) => ({
      residentId: resident.residentId,
      position: resident.position,
      satiety: resident.satiety,
      energy: resident.energy,
      ease: resident.ease,
      readiness: resident.readiness,
      facing: resident.facing,
      intent: resident.intent,
      lastResponse: resident.lastResponse
    }))
  });
}

export function serializeCanonicalRaisingHomeDataR2(input) {
  const captured = cloneBoundedPlainData(input);
  const serialized = JSON.stringify(captured);
  if (UTF8.encode(serialized).byteLength > RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes) {
    throw persistenceError("serialized byte budget exceeded");
  }
  return serialized;
}

export function digestCanonicalRaisingHomeDataR2(input, domain = "raising-home") {
  assertString(domain, "digest domain", { pattern: /^[a-z0-9:-]+$/i, maximum: 96 });
  const serialized = typeof input === "string" ? input : serializeCanonicalRaisingHomeDataR2(input);
  const serializedBytes = UTF8.encode(serialized);
  if (serializedBytes.byteLength > RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes) {
    throw persistenceError("digest input exceeds the serialized byte budget");
  }
  const domainBytes = UTF8.encode(`championship-r2:${domain}\u0000`);
  const digestInput = new Uint8Array(domainBytes.length + serializedBytes.length);
  digestInput.set(domainBytes);
  digestInput.set(serializedBytes, domainBytes.length);
  return `championship-r2:${domain}:sha256:${sha256Hex(digestInput)}`;
}

export function migrateRaisingHomeSaveV1ToV2(input) {
  const source = cloneBoundedPlainData(input);
  assertExactKeys(source, V1_KEYS, "saveV1");
  if (source.schemaVersion !== 1) throw persistenceError("v1 migration requires schemaVersion 1");
  if (source.saveKind !== RAISING_HOME_SAVE_KIND_R2) throw persistenceError("v1 saveKind is invalid");
  assertSafeInteger(source.revision, "saveV1.revision");
  const legacy = validateDurableState(source.payload, { version: 1 });
  const payload = validateDurableState({ ...legacy, paused: false });
  return deepFreeze({
    schemaVersion: RAISING_HOME_SAVE_SCHEMA_VERSION_R2,
    saveKind: RAISING_HOME_SAVE_KIND_R2,
    adaptationRef: RAISING_HOME_ADAPTATION_REF_R2,
    revision: source.revision,
    payload,
    payloadDigest: digestCanonicalRaisingHomeDataR2(payload, "raising-payload-v2")
  });
}

function validateV2Document(input) {
  const document = cloneBoundedPlainData(input);
  assertExactKeys(document, V2_KEYS, "saveV2");
  if (document.schemaVersion !== RAISING_HOME_SAVE_SCHEMA_VERSION_R2) throw persistenceError("saveV2.schemaVersion is invalid");
  if (document.saveKind !== RAISING_HOME_SAVE_KIND_R2) throw persistenceError("saveV2.saveKind is invalid");
  if (document.adaptationRef !== RAISING_HOME_ADAPTATION_REF_R2) throw persistenceError("saveV2.adaptationRef is invalid");
  assertSafeInteger(document.revision, "saveV2.revision");
  const payload = validateDurableState(document.payload);
  const expectedDigest = digestCanonicalRaisingHomeDataR2(payload, "raising-payload-v2");
  if (document.payloadDigest !== expectedDigest) throw persistenceError("saveV2 payloadDigest does not match");
  return deepFreeze({
    schemaVersion: RAISING_HOME_SAVE_SCHEMA_VERSION_R2,
    saveKind: RAISING_HOME_SAVE_KIND_R2,
    adaptationRef: RAISING_HOME_ADAPTATION_REF_R2,
    revision: document.revision,
    payload,
    payloadDigest: expectedDigest
  });
}

export function createRaisingHomeSaveDocumentR2(snapshot, { revision = 0 } = {}) {
  assertSafeInteger(revision, "save revision");
  const payload = projectRaisingHomeDurableStateR2(snapshot);
  return validateV2Document({
    schemaVersion: RAISING_HOME_SAVE_SCHEMA_VERSION_R2,
    saveKind: RAISING_HOME_SAVE_KIND_R2,
    adaptationRef: RAISING_HOME_ADAPTATION_REF_R2,
    revision,
    payload,
    payloadDigest: digestCanonicalRaisingHomeDataR2(payload, "raising-payload-v2")
  });
}

export function serializeRaisingHomeSaveR2(snapshot, { revision = 0 } = {}) {
  const document = createRaisingHomeSaveDocumentR2(snapshot, { revision });
  const serialized = serializeCanonicalRaisingHomeDataR2(document);
  return deepFreeze({
    document,
    serialized,
    digest: digestCanonicalRaisingHomeDataR2(serialized, "save-document-v2"),
    bytes: UTF8.encode(serialized).byteLength
  });
}

export function deserializeRaisingHomeSaveR2(serialized) {
  if (typeof serialized !== "string" || serialized.length === 0) throw persistenceError("serialized save must be a non-empty string");
  if (UTF8.encode(serialized).byteLength > RAISING_HOME_PERSISTENCE_LIMITS_R2.maxSerializedBytes) {
    throw persistenceError("serialized save exceeds its byte budget");
  }
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw persistenceError("serialized save is not valid JSON");
  }
  const captured = cloneBoundedPlainData(parsed);
  if (!Number.isSafeInteger(captured.schemaVersion)) throw persistenceError("serialized save schemaVersion is invalid");
  if (captured.schemaVersion > RAISING_HOME_SAVE_SCHEMA_VERSION_R2) throw persistenceError("serialized save is from a newer schema");
  if (captured.schemaVersion < 1) throw persistenceError("serialized save schemaVersion is unsupported");
  const document = captured.schemaVersion === 1 ? migrateRaisingHomeSaveV1ToV2(captured) : validateV2Document(captured);
  const canonical = serializeCanonicalRaisingHomeDataR2(document);
  return deepFreeze({
    document,
    durableState: document.payload,
    serialized: canonical,
    digest: digestCanonicalRaisingHomeDataR2(canonical, "save-document-v2"),
    migratedFrom: captured.schemaVersion === 1 ? 1 : null,
    bytes: UTF8.encode(canonical).byteLength
  });
}

export function restoreRaisingHomeSnapshotR2(documentInput, { sessionId } = {}) {
  assertString(sessionId, "restore sessionId", { pattern: SESSION_ID_PATTERN, minimum: 3, maximum: 96 });
  const document = validateV2Document(documentInput);
  const base = createRaisingHomeInitialState({ sessionId });
  const byResidentId = new Map(document.payload.residents.map((resident) => [resident.residentId, resident]));
  return captureRaisingHomeSnapshotR2({
    ...base,
    revision: document.payload.stateRevision,
    tick: document.payload.tick,
    paused: document.payload.paused,
    clockMinutes: document.payload.clockMinutes,
    caretakerPosition: document.payload.caretakerPosition,
    selectedResidentId: document.payload.selectedResidentId,
    residents: base.residents.map((resident) => ({ ...resident, ...byResidentId.get(resident.residentId) })),
    feedback: "Raising Home state restored from this JavaScript realm's Championship R2 save.",
    eventLog: []
  });
}
