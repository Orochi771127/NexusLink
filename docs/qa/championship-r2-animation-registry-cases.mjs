import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY,
  CHAMPIONSHIP_R2_ANIMATION_COUNTS,
  CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS,
  validateCreatureAnimationAssociationRegistryR2
} from "../../src/data/championship/r2/animations/animationAssociationRegistryR2.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const registrySourcePath = path.join(
  repoRoot,
  "src/data/championship/r2/animations/animationAssociationRegistryR2.js"
);
const STRUCTURAL_EVIDENCE = {
  evidenceGrade: "VERIFIED_STRUCTURE_ONLY",
  evidenceRef: "ANIM-R1-STRUCT-001",
  evidenceScope: "RESOURCE_COUNT_AND_SLOT_CARDINALITY_ONLY",
  originalParityClaim: true,
  sourceFindingStatus: "VERIFIED_BINARY"
};
const VALID_RESULT = { code: "OK", valid: true };
const INVALID_RESULT = { code: "INVALID_R2_ANIMATION_REGISTRY", valid: false };

function plainClone(value = CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY) {
  return structuredClone(value);
}

function expectInvalid(candidate, label = "candidate") {
  let result;
  assert.doesNotThrow(() => {
    result = validateCreatureAnimationAssociationRegistryR2(candidate);
  }, `${label} must fail closed without throwing`);
  assert.deepEqual(result, INVALID_RESULT, `${label} must return the generic invalid result`);
  assert.equal(Object.isFrozen(result), true, `${label} result must be immutable`);
}

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectStrings(entry, output));
  else if (value && typeof value === "object") Object.values(value).forEach((entry) => collectStrings(entry, output));
  return output;
}

test("R2 registry exposes the exact sanctioned 216 by 40 structural matrix", () => {
  assert.deepEqual(CHAMPIONSHIP_R2_ANIMATION_COUNTS, {
    REGULAR_RESOURCES: 216,
    STRUCTURAL_SLOTS_PER_RESOURCE: 40,
    STRUCTURAL_ASSOCIATIONS: 8_640
  });
  const expectedIds = Array.from(
    { length: 216 },
    (_, index) => `nexus:championship:r2:regular-resource:${String(index + 1).padStart(3, "0")}`
  );
  assert.deepEqual(CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS, expectedIds);

  const registry = CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY;
  assert.equal(registry.resourceCount, 216);
  assert.equal(registry.slotsPerResource, 40);
  assert.equal(registry.associationCount, 8_640);
  assert.equal(registry.resources.length, 216);
  assert.deepEqual(registry.resources.map((resource) => resource.creatureDefinitionId), expectedIds);

  const tuples = new Set();
  let associationCount = 0;
  registry.resources.forEach((resource, resourceIndex) => {
    assert.equal(resource.resourceOrdinal, resourceIndex + 1);
    assert.equal(resource.slots.length, 40);
    resource.slots.forEach((slot, sourceSlot) => {
      assert.equal(slot.sourceSlot, sourceSlot);
      tuples.add(`${resource.creatureDefinitionId}:${sourceSlot}`);
      associationCount += 1;
    });
  });
  assert.equal(associationCount, 8_640);
  assert.equal(tuples.size, 8_640);
});

test("every resource and association stays sanitized, non-executable, and structurally evidenced", () => {
  const registry = CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY;
  assert.equal(registry.authority, "SANITIZED_STRUCTURE_ONLY");
  assert.equal(registry.executable, false);
  assert.equal(registry.originalContentIncluded, false);
  assert.deepEqual(registry.evidence, [STRUCTURAL_EVIDENCE]);

  const evidenceRefs = new Set();
  for (const resource of registry.resources) {
    assert.equal(resource.identityStatus, "SANITIZED_PROJECT_ORDINAL_ONLY");
    assert.equal(resource.recordStatus, "SANITIZED_STRUCTURAL_RESOURCE_ONLY");
    assert.equal(resource.executable, false);
    assert.equal(resource.originalContentIncluded, false);
    assert.deepEqual(resource.evidence, [STRUCTURAL_EVIDENCE]);
    for (const slot of resource.slots) {
      assert.equal(slot.mappingStatus, "UNKNOWN");
      assert.equal(slot.projectClipId, null);
      assert.equal(slot.executable, false);
      assert.equal(slot.originalContentIncluded, false);
      assert.deepEqual(slot.evidence, [STRUCTURAL_EVIDENCE]);
      evidenceRefs.add(slot.evidence[0].evidenceRef);
    }
  }
  assert.deepEqual([...evidenceRefs], ["ANIM-R1-STRUCT-001"]);
});

test("registry is deeply frozen and the public validator accepts an unchanged plain-data copy", () => {
  const registry = CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY;
  assert.equal(Object.isFrozen(registry), true);
  assert.equal(Object.isFrozen(registry.resources), true);
  assert.equal(Object.isFrozen(registry.resources[0]), true);
  assert.equal(Object.isFrozen(registry.resources[0].slots), true);
  assert.equal(Object.isFrozen(registry.resources[0].slots[0]), true);
  assert.equal(Object.isFrozen(registry.resources[0].slots[0].evidence), true);
  assert.equal(Object.isFrozen(registry.resources[0].slots[0].evidence[0]), true);
  assert.equal(Object.isFrozen(CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS), true);

  const candidate = plainClone();
  const before = JSON.stringify(candidate);
  const result = validateCreatureAnimationAssociationRegistryR2(candidate);
  assert.deepEqual(result, VALID_RESULT);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(JSON.stringify(candidate), before, "validation must not mutate caller-owned data");
});

test("resource count, identity, ordinal, and ordering drift fail closed", () => {
  const missing = plainClone();
  missing.resources.pop();
  expectInvalid(missing, "missing resource");

  const extra = plainClone();
  extra.resources.push(structuredClone(extra.resources.at(-1)));
  expectInvalid(extra, "extra resource");

  for (const [label, mutate] of [
    ["declared resource count", (candidate) => { candidate.resourceCount = 215; }],
    ["declared association count", (candidate) => { candidate.associationCount = 8_639; }],
    ["duplicate resource ID", (candidate) => { candidate.resources[1].creatureDefinitionId = candidate.resources[0].creatureDefinitionId; }],
    ["resource ID order", (candidate) => { candidate.resources.reverse(); }],
    ["resource ordinal", (candidate) => { candidate.resources[0].resourceOrdinal = 2; }],
    ["source-like filename identity", (candidate) => { candidate.resources[0].creatureDefinitionId = "regular-resource-001.bin"; }],
    ["path-like identity", (candidate) => { candidate.resources[0].creatureDefinitionId = "file:///private/regular-resource-001"; }]
  ]) {
    const candidate = plainClone();
    mutate(candidate);
    expectInvalid(candidate, label);
  }
});

test("slot gaps, duplicates, order drift, and invalid scalar values fail closed", () => {
  for (const [label, mutate] of [
    ["missing slot", (candidate) => { candidate.resources[0].slots.pop(); }],
    ["extra slot", (candidate) => { candidate.resources[0].slots.push(structuredClone(candidate.resources[0].slots[0])); }],
    ["duplicate slot", (candidate) => { candidate.resources[0].slots[1].sourceSlot = 0; }],
    ["slot order", (candidate) => { candidate.resources[0].slots.reverse(); }],
    ["negative slot", (candidate) => { candidate.resources[0].slots[0].sourceSlot = -1; }],
    ["out-of-range slot", (candidate) => { candidate.resources[0].slots[39].sourceSlot = 40; }],
    ["fractional slot", (candidate) => { candidate.resources[0].slots[0].sourceSlot = 0.5; }],
    ["string slot", (candidate) => { candidate.resources[0].slots[0].sourceSlot = "0"; }],
    ["non-finite slot", (candidate) => { candidate.resources[0].slots[0].sourceSlot = Number.NaN; }]
  ]) {
    const candidate = plainClone();
    mutate(candidate);
    expectInvalid(candidate, label);
  }
});

test("semantic names, clip promotion, timing, frames, layers, and fallback fields are rejected", () => {
  for (const [label, mutate] of [
    ["verified mapping", (candidate) => { candidate.resources[0].slots[0].mappingStatus = "VERIFIED"; }],
    ["adapted mapping", (candidate) => { candidate.resources[0].slots[0].mappingStatus = "ADAPTED"; }],
    ["project clip", (candidate) => { candidate.resources[0].slots[0].projectClipId = "nexus:clip:unknown"; }],
    ["semantic label", (candidate) => { candidate.resources[0].slots[0].semanticName = "idle"; }],
    ["frame count", (candidate) => { candidate.resources[0].slots[0].frameCount = 2; }],
    ["timing", (candidate) => { candidate.resources[0].slots[0].timing = [1, 1]; }],
    ["layer", (candidate) => { candidate.resources[0].slots[0].layer = 0; }],
    ["fallback", (candidate) => { candidate.resources[0].slots[0].fallback = "static"; }]
  ]) {
    const candidate = plainClone();
    mutate(candidate);
    expectInvalid(candidate, label);
  }

  const semanticStrings = collectStrings(CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY);
  const guessedSemantic = /(?:^|[:_-])(idle|walk|run|attack|hurt|sleep|eat|victory|evolution)(?:$|[:_-])/i;
  assert.equal(semanticStrings.some((value) => guessedSemantic.test(value)), false);
});

test("evidence linkage cannot broaden beyond the accepted cardinality claim", () => {
  for (const [label, mutate] of [
    ["slot-specific finding", (candidate) => { candidate.resources[0].slots[0].evidence[0].evidenceRef = "ANIM-R1-SLOT12-001"; }],
    ["digest-shaped finding", (candidate) => { candidate.resources[0].slots[0].evidence[0].evidenceRef = "a".repeat(64); }],
    ["R1 finding status used as R2 record grade", (candidate) => { candidate.resources[0].slots[0].evidence[0].evidenceGrade = "VERIFIED_BINARY"; }],
    ["R2 record grade used as R1 finding status", (candidate) => { candidate.resources[0].slots[0].evidence[0].sourceFindingStatus = "VERIFIED_STRUCTURE_ONLY"; }],
    ["missing source finding status", (candidate) => { delete candidate.resources[0].slots[0].evidence[0].sourceFindingStatus; }],
    ["extra finding status alias", (candidate) => { candidate.resources[0].slots[0].evidence[0].findingStatus = "VERIFIED_BINARY"; }],
    ["semantic scope", (candidate) => { candidate.resources[0].slots[0].evidence[0].evidenceScope = "SLOT_SEMANTICS"; }],
    ["missing parity scope", (candidate) => { candidate.resources[0].slots[0].evidence[0].originalParityClaim = false; }],
    ["second finding", (candidate) => { candidate.resources[0].slots[0].evidence.push(structuredClone(candidate.resources[0].slots[0].evidence[0])); }]
  ]) {
    const candidate = plainClone();
    mutate(candidate);
    expectInvalid(candidate, label);
  }
});

test("hostile plain-data inputs fail closed without invoking accessors or leaking exceptions", () => {
  for (const [label, candidate] of [
    ["null", null],
    ["array", []],
    ["date", new Date(0)],
    ["map", new Map()],
    ["set", new Set()],
    ["function", () => {}]
  ]) expectInvalid(candidate, label);

  let accessorReads = 0;
  const accessor = plainClone();
  Object.defineProperty(accessor.resources[0], "slots", {
    enumerable: true,
    get() {
      accessorReads += 1;
      return [];
    }
  });
  expectInvalid(accessor, "accessor");
  assert.equal(accessorReads, 0, "validator must reject accessors without invoking them");

  let unexpectedScalarReads = 0;
  const unexpectedScalar = plainClone();
  unexpectedScalar.resources[0].identityStatus = {};
  Object.defineProperty(unexpectedScalar.resources[0].identityStatus, "value", {
    enumerable: true,
    get() {
      unexpectedScalarReads += 1;
      return "SANITIZED_PROJECT_ORDINAL_ONLY";
    }
  });
  expectInvalid(unexpectedScalar, "unexpected object in scalar field");
  assert.equal(unexpectedScalarReads, 0, "scalar validation must stop before structured clone reads nested accessors");

  const cycle = plainClone();
  cycle.resources[0].cycle = cycle;
  expectInvalid(cycle, "cycle");

  const sparse = plainClone();
  sparse.resources[0].slots = new Array(40);
  expectInvalid(sparse, "sparse array");

  const symbol = plainClone();
  symbol[Symbol("hidden")] = true;
  expectInvalid(symbol, "symbol key");

  const hidden = plainClone();
  Object.defineProperty(hidden.resources[0], "hidden", { enumerable: false, value: true });
  expectInvalid(hidden, "hidden key");

  const poisoned = plainClone();
  Object.defineProperty(poisoned.resources[0], "__proto__", { enumerable: true, value: {} });
  expectInvalid(poisoned, "prototype-polluting key");

  expectInvalid(new Proxy({}, { getPrototypeOf() { throw new Error("hostile detail"); } }), "hostile proxy");
  const revocable = Proxy.revocable({}, {});
  revocable.revoke();
  expectInvalid(revocable.proxy, "revoked proxy");

  const nestedProxy = plainClone();
  nestedProxy.resources[0] = new Proxy({}, { ownKeys() { throw new Error("nested hostile detail"); } });
  expectInvalid(nestedProxy, "nested hostile proxy");

  const transparentProxy = plainClone();
  transparentProxy.resources[0] = new Proxy(transparentProxy.resources[0], {});
  expectInvalid(transparentProxy, "transparent nested proxy");
});

test("array-index accessors fail closed without being read at every registry depth", () => {
  for (const [label, selectArray] of [
    ["resources[0] accessor", (candidate) => candidate.resources],
    ["slots[0] accessor", (candidate) => candidate.resources[0].slots],
    ["evidence[0] accessor", (candidate) => candidate.resources[0].slots[0].evidence]
  ]) {
    const candidate = plainClone();
    const array = selectArray(candidate);
    const originalValue = array[0];
    let reads = 0;
    Object.defineProperty(array, "0", {
      configurable: true,
      enumerable: true,
      get() {
        reads += 1;
        return originalValue;
      }
    });
    expectInvalid(candidate, label);
    assert.equal(reads, 0, `${label} must be rejected by descriptor without invoking its getter`);
  }
});

test("very-large resource arrays fail at the bounded length gate before index traversal", () => {
  const candidate = plainClone();
  const hugeResources = new Array(1_000_000);
  let reads = 0;
  Object.defineProperty(hugeResources, "999999", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return candidate.resources[0];
    }
  });
  candidate.resources = hugeResources;
  expectInvalid(candidate, "very-large resource array");
  assert.equal(reads, 0, "length mismatch must stop before any large-array index read");
});

test("raw payload, digest, private path, and extracted filename fields fail closed", () => {
  for (const [key, value] of [
    ["romBytes", [0]],
    ["contentHash", "a".repeat(64)],
    ["privatePath", ["C:", "private", "resource"].join("\\")],
    ["extractedFilename", "regular-resource-001.bin"],
    ["binaryOffset", 1],
    ["sourceAsset", "file:///private/resource.bin"]
  ]) {
    const candidate = plainClone();
    candidate.resources[0][key] = value;
    expectInvalid(candidate, key);
  }
});

test("owned registry source has no renderer, runtime, save, asset, DOM, or network integration", async () => {
  const source = await readFile(registrySourcePath, "utf8");
  const forbidden = [
    /[A-Za-z]:[\\/]/,
    /file:\/\//i,
    /\.(?:nds|srl|bin|dat|png|jpg|gif|wav|mp3|ogg)\b/i,
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/,
    /\bsaveQueue\b/,
    /\brequestAnimationFrame\b/,
    /\b(?:window|document)\b/,
    /\b(?:RaphaelCore|Standoff|heartcoreOrbit)\b/i,
    /(?:src[\\/])?(?:pixi|ui|state)[\\/]/i,
    /\b[0-9a-f]{64}\b/i
  ];
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern, `registry source violates isolation: ${pattern}`);
  }
  assert.match(source, /from "\.\.\/\.\.\/\.\.\/\.\.\/championship\/contracts\/championshipContracts\.js"/);
});
