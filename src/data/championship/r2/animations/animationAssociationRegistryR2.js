import {
  deepFreeze,
  isPlainRecord
} from "../../../../championship/contracts/championshipContracts.js";

const REGISTRY_ID = "nexus:championship:r2:animation-associations";
const RESOURCE_ID = /^nexus:championship:r2:regular-resource:[0-9]{3}$/;
const STRUCTURAL_EVIDENCE_REF = "ANIM-R1-STRUCT-001";
const STRUCTURAL_EVIDENCE_SCOPE = "RESOURCE_COUNT_AND_SLOT_CARDINALITY_ONLY";
const TOP_LEVEL_KEYS = Object.freeze([
  "associationCount",
  "authority",
  "evidence",
  "executable",
  "originalContentIncluded",
  "registryId",
  "resourceCount",
  "resources",
  "schemaVersion",
  "slotsPerResource"
]);
const RESOURCE_KEYS = Object.freeze([
  "creatureDefinitionId",
  "evidence",
  "executable",
  "identityStatus",
  "originalContentIncluded",
  "recordStatus",
  "resourceOrdinal",
  "slots"
]);
const ASSOCIATION_KEYS = Object.freeze([
  "evidence",
  "executable",
  "mappingStatus",
  "originalContentIncluded",
  "projectClipId",
  "sourceSlot"
]);
const EVIDENCE_KEYS = Object.freeze([
  "evidenceGrade",
  "evidenceRef",
  "evidenceScope",
  "originalParityClaim",
  "sourceFindingStatus"
]);

export const CHAMPIONSHIP_R2_ANIMATION_COUNTS = deepFreeze({
  REGULAR_RESOURCES: 216,
  STRUCTURAL_SLOTS_PER_RESOURCE: 40,
  STRUCTURAL_ASSOCIATIONS: 8_640
});

export const CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS = deepFreeze(
  Array.from(
    { length: CHAMPIONSHIP_R2_ANIMATION_COUNTS.REGULAR_RESOURCES },
    (_, index) => `nexus:championship:r2:regular-resource:${String(index + 1).padStart(3, "0")}`
  )
);

const STRUCTURAL_EVIDENCE_CLAIM = deepFreeze({
  evidenceGrade: "VERIFIED_STRUCTURE_ONLY",
  evidenceRef: STRUCTURAL_EVIDENCE_REF,
  evidenceScope: STRUCTURAL_EVIDENCE_SCOPE,
  originalParityClaim: true,
  sourceFindingStatus: "VERIFIED_BINARY"
});
const STRUCTURAL_EVIDENCE = deepFreeze([STRUCTURAL_EVIDENCE_CLAIM]);

function association(sourceSlot) {
  return {
    evidence: STRUCTURAL_EVIDENCE,
    executable: false,
    mappingStatus: "UNKNOWN",
    originalContentIncluded: false,
    projectClipId: null,
    sourceSlot
  };
}

function resourceRecord(creatureDefinitionId, resourceOrdinal) {
  return {
    creatureDefinitionId,
    evidence: STRUCTURAL_EVIDENCE,
    executable: false,
    identityStatus: "SANITIZED_PROJECT_ORDINAL_ONLY",
    originalContentIncluded: false,
    recordStatus: "SANITIZED_STRUCTURAL_RESOURCE_ONLY",
    resourceOrdinal,
    slots: Array.from(
      { length: CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_SLOTS_PER_RESOURCE },
      (_, sourceSlot) => association(sourceSlot)
    )
  };
}

export const CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY = deepFreeze({
  associationCount: CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_ASSOCIATIONS,
  authority: "SANITIZED_STRUCTURE_ONLY",
  evidence: STRUCTURAL_EVIDENCE,
  executable: false,
  originalContentIncluded: false,
  registryId: REGISTRY_ID,
  resourceCount: CHAMPIONSHIP_R2_ANIMATION_COUNTS.REGULAR_RESOURCES,
  resources: CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS.map((creatureDefinitionId, index) => (
    resourceRecord(creatureDefinitionId, index + 1)
  )),
  schemaVersion: 1,
  slotsPerResource: CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_SLOTS_PER_RESOURCE
});

const VALID_RESULT = deepFreeze({ code: "OK", valid: true });
const INVALID_RESULT = deepFreeze({ code: "INVALID_R2_ANIMATION_REGISTRY", valid: false });

function assertExactKeys(value, expected, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label} must be a plain object`);
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (actual.length !== allowed.length || actual.some((key, index) => key !== allowed[index])) {
    throw new Error(`${label} contains missing or unsupported fields`);
  }
}

function readExactOwnDataRecord(value, expectedKeys, label) {
  if (!isPlainRecord(value)) throw new TypeError(`${label} must be a plain object`);
  const expected = new Set(expectedKeys);
  const ownKeys = Reflect.ownKeys(value);
  if (
    ownKeys.length !== expected.size
    || ownKeys.some((key) => typeof key !== "string" || !expected.has(key))
  ) {
    throw new Error(`${label} contains missing, hidden, symbolic, or unsupported fields`);
  }

  const values = new Map();
  for (const key of ownKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (
      !descriptor
      || descriptor.enumerable !== true
      || descriptor.get
      || descriptor.set
      || !("value" in descriptor)
    ) {
      throw new TypeError(`${label}.${key} must be an enumerable own data property`);
    }
    values.set(key, descriptor.value);
  }
  return values;
}

function readDenseOwnDataArray(value, expectedLength, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);

  // Reject an abnormal or huge real array before enumerating any of its indexes.
  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (
    !lengthDescriptor
    || lengthDescriptor.enumerable !== false
    || lengthDescriptor.configurable !== false
    || lengthDescriptor.get
    || lengthDescriptor.set
    || !("value" in lengthDescriptor)
    || lengthDescriptor.value !== expectedLength
  ) {
    throw new Error(`${label} length mismatch`);
  }

  const ownKeys = Reflect.ownKeys(value);
  const expectedKeys = new Set([
    "length",
    ...Array.from({ length: expectedLength }, (_, index) => String(index))
  ]);
  if (
    ownKeys.length !== expectedKeys.size
    || ownKeys.some((key) => typeof key !== "string" || !expectedKeys.has(key))
  ) {
    throw new Error(`${label} must be dense and cannot contain hidden, symbolic, or extra fields`);
  }

  const values = [];
  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (
      !descriptor
      || descriptor.enumerable !== true
      || descriptor.get
      || descriptor.set
      || !("value" in descriptor)
    ) {
      throw new TypeError(`${label}[${index}] must be an enumerable own data property`);
    }
    values.push(descriptor.value);
  }
  return values;
}

function preflightStructuralEvidence(evidence, label) {
  const [claim] = readDenseOwnDataArray(evidence, 1, label);
  const claimValues = readExactOwnDataRecord(claim, EVIDENCE_KEYS, `${label} claim`);
  if (
    claimValues.get("evidenceGrade") !== "VERIFIED_STRUCTURE_ONLY"
    || claimValues.get("evidenceRef") !== STRUCTURAL_EVIDENCE_REF
    || claimValues.get("evidenceScope") !== STRUCTURAL_EVIDENCE_SCOPE
    || claimValues.get("originalParityClaim") !== true
    || claimValues.get("sourceFindingStatus") !== "VERIFIED_BINARY"
  ) {
    throw new Error(`${label} exceeds the accepted structural evidence scope`);
  }
}

function preflightAnimationAssociationRegistry(candidateDraft) {
  const registry = readExactOwnDataRecord(candidateDraft, TOP_LEVEL_KEYS, "R2 animation registry");
  if (
    registry.get("schemaVersion") !== 1
    || registry.get("registryId") !== REGISTRY_ID
    || registry.get("authority") !== "SANITIZED_STRUCTURE_ONLY"
    || registry.get("executable") !== false
    || registry.get("originalContentIncluded") !== false
  ) {
    throw new Error("R2 animation registry authority boundary changed");
  }
  if (
    registry.get("resourceCount") !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.REGULAR_RESOURCES
    || registry.get("slotsPerResource") !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_SLOTS_PER_RESOURCE
    || registry.get("associationCount") !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_ASSOCIATIONS
  ) {
    throw new Error("R2 animation registry declared count mismatch");
  }

  preflightStructuralEvidence(registry.get("evidence"), "R2 animation registry evidence");
  const resources = readDenseOwnDataArray(
    registry.get("resources"),
    CHAMPIONSHIP_R2_ANIMATION_COUNTS.REGULAR_RESOURCES,
    "R2 animation resources"
  );

  let associationCount = 0;
  for (let resourceIndex = 0; resourceIndex < resources.length; resourceIndex += 1) {
    const resource = readExactOwnDataRecord(
      resources[resourceIndex],
      RESOURCE_KEYS,
      `R2 animation resource ${resourceIndex}`
    );
    if (
      resource.get("resourceOrdinal") !== resourceIndex + 1
      || resource.get("creatureDefinitionId") !== CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS[resourceIndex]
      || resource.get("identityStatus") !== "SANITIZED_PROJECT_ORDINAL_ONLY"
      || resource.get("recordStatus") !== "SANITIZED_STRUCTURAL_RESOURCE_ONLY"
      || resource.get("executable") !== false
      || resource.get("originalContentIncluded") !== false
    ) {
      throw new Error(`R2 animation resource ${resourceIndex} exceeds its sanitized structural boundary`);
    }
    preflightStructuralEvidence(resource.get("evidence"), `R2 animation resource ${resourceIndex} evidence`);
    const slots = readDenseOwnDataArray(
      resource.get("slots"),
      CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_SLOTS_PER_RESOURCE,
      `R2 animation resource ${resourceIndex} slots`
    );

    for (let sourceSlot = 0; sourceSlot < slots.length; sourceSlot += 1) {
      const association = readExactOwnDataRecord(
        slots[sourceSlot],
        ASSOCIATION_KEYS,
        `R2 animation resource ${resourceIndex} slot ${sourceSlot}`
      );
      if (
        association.get("sourceSlot") !== sourceSlot
        || association.get("mappingStatus") !== "UNKNOWN"
        || association.get("projectClipId") !== null
        || association.get("executable") !== false
        || association.get("originalContentIncluded") !== false
      ) {
        throw new Error(`R2 animation resource ${resourceIndex} slot ${sourceSlot} inferred unsupported semantics`);
      }
      preflightStructuralEvidence(
        association.get("evidence"),
        `R2 animation resource ${resourceIndex} slot ${sourceSlot} evidence`
      );
      associationCount += 1;
    }
  }

  if (associationCount !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_ASSOCIATIONS) {
    throw new Error("R2 animation association preflight count mismatch");
  }
}

function assertStructuralEvidence(evidence, label) {
  if (!Array.isArray(evidence) || evidence.length !== 1) {
    throw new Error(`${label} must contain exactly one sanitized structural claim`);
  }
  const claim = evidence[0];
  assertExactKeys(claim, EVIDENCE_KEYS, `${label} claim`);
  if (
    claim.evidenceGrade !== "VERIFIED_STRUCTURE_ONLY"
    || claim.evidenceRef !== STRUCTURAL_EVIDENCE_REF
    || claim.evidenceScope !== STRUCTURAL_EVIDENCE_SCOPE
    || claim.originalParityClaim !== true
    || claim.sourceFindingStatus !== "VERIFIED_BINARY"
  ) {
    throw new Error(`${label} exceeds the accepted structural evidence scope`);
  }
}

function assertAnimationAssociationRegistry(candidate) {
  assertExactKeys(candidate, TOP_LEVEL_KEYS, "R2 animation registry");
  if (
    candidate.schemaVersion !== 1
    || candidate.registryId !== REGISTRY_ID
    || candidate.authority !== "SANITIZED_STRUCTURE_ONLY"
    || candidate.executable !== false
    || candidate.originalContentIncluded !== false
  ) {
    throw new Error("R2 animation registry authority boundary changed");
  }
  if (
    candidate.resourceCount !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.REGULAR_RESOURCES
    || candidate.slotsPerResource !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_SLOTS_PER_RESOURCE
    || candidate.associationCount !== CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_ASSOCIATIONS
  ) {
    throw new Error("R2 animation registry declared count mismatch");
  }
  assertStructuralEvidence(candidate.evidence, "R2 animation registry evidence");
  if (!Array.isArray(candidate.resources) || candidate.resources.length !== candidate.resourceCount) {
    throw new Error("R2 animation resource count mismatch");
  }

  let associationCount = 0;
  candidate.resources.forEach((resource, resourceIndex) => {
    assertExactKeys(resource, RESOURCE_KEYS, "R2 animation resource");
    const resourceOrdinal = resourceIndex + 1;
    const expectedId = CHAMPIONSHIP_R2_SANITIZED_REGULAR_RESOURCE_IDS[resourceIndex];
    if (
      resource.resourceOrdinal !== resourceOrdinal
      || typeof resource.creatureDefinitionId !== "string"
      || !RESOURCE_ID.test(resource.creatureDefinitionId)
      || resource.creatureDefinitionId !== expectedId
    ) {
      throw new Error("R2 animation resource identity or order mismatch");
    }
    if (
      resource.identityStatus !== "SANITIZED_PROJECT_ORDINAL_ONLY"
      || resource.recordStatus !== "SANITIZED_STRUCTURAL_RESOURCE_ONLY"
      || resource.executable !== false
      || resource.originalContentIncluded !== false
    ) {
      throw new Error("R2 animation resource exceeds the sanitized structural boundary");
    }
    assertStructuralEvidence(resource.evidence, "R2 animation resource evidence");
    if (!Array.isArray(resource.slots) || resource.slots.length !== candidate.slotsPerResource) {
      throw new Error("R2 animation structural slot count mismatch");
    }

    resource.slots.forEach((slot, sourceSlot) => {
      assertExactKeys(slot, ASSOCIATION_KEYS, "R2 animation association");
      if (
        slot.sourceSlot !== sourceSlot
        || !Number.isInteger(slot.sourceSlot)
        || slot.sourceSlot < 0
        || slot.sourceSlot >= CHAMPIONSHIP_R2_ANIMATION_COUNTS.STRUCTURAL_SLOTS_PER_RESOURCE
      ) {
        throw new Error("R2 animation sourceSlot coverage mismatch");
      }
      if (
        slot.mappingStatus !== "UNKNOWN"
        || slot.projectClipId !== null
        || slot.executable !== false
        || slot.originalContentIncluded !== false
      ) {
        throw new Error("R2 animation association inferred unsupported semantics or execution");
      }
      assertStructuralEvidence(slot.evidence, "R2 animation association evidence");
      associationCount += 1;
    });
  });

  if (associationCount !== candidate.associationCount) {
    throw new Error("R2 animation association traversal count mismatch");
  }
}

export function validateCreatureAnimationAssociationRegistryR2(candidateDraft) {
  try {
    preflightAnimationAssociationRegistry(candidateDraft);
    // A behaviorally transparent Proxy cannot be identified portably during
    // reflection. structuredClone is the final rejection gate and also ensures
    // accepted validation never retains caller-owned wrappers. Proxy reflection
    // traps may already have run during the bounded descriptor preflight.
    const candidate = structuredClone(candidateDraft);
    assertAnimationAssociationRegistry(candidate);
    return VALID_RESULT;
  } catch {
    return INVALID_RESULT;
  }
}

assertAnimationAssociationRegistry(CHAMPIONSHIP_R2_ANIMATION_ASSOCIATION_REGISTRY);
