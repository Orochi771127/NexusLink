/**
 * EVO-01 — Reflection provenance verifier／consumer and sealed Stage 3 fixture.
 *
 * 這份測試證明：資料完整的 sealed fixture 可以成為合法 Growth evidence；
 * 缺主人／缺安全 provenance／舊資料則 fail closed，不准用 active companion 去猜。
 * 這不是 live Soul Talk production source creation。
 */

import { createDefaultState, normalizeState } from "../../src/state/store.js";
import { sanitizeEmotionalMemory, sanitizeTrace } from "../../src/engine/storageGuard.js";
import {
  evaluateCompanionGrowthReadiness,
  writeCompanionGrowthEvidence,
  createCompletedGrowthEvent
} from "../../src/engine/companionGrowthEngine.js";
import {
  createOwnedSafeReflectionSource,
  createReflectionGrowthWriteInput,
  findReflectableCanonicalSource
} from "../../src/engine/reflectionGrowthOwner.js";
import {
  createCompanionGrowthController,
  createGrowthSafetyFacts
} from "../../src/ui/companionGrowthController.js";

const COMPANION_ID = "greyshade-cat";
const OTHER_ID = "auriowl";
const BASE_TIME = 1785542400000;
const controller = createCompanionGrowthController();
const cases = [];

await runCase("owned source stamps companionId at creation and rejects activeCompanion inference", () => {
  const created = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_owned_01",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  });
  assertEqual(created.ok, true, "owned source created");
  assertEqual(created.record.companionId, COMPANION_ID, "owner sealed at creation");
  assertEqual(created.record.growthSafetyExcluded, false, "safe source");
  assertEqual(created.record.excerpt, "", "no player text");

  const inferred = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_owned_02",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts(),
    activeCompanionId: OTHER_ID,
    state: { activeCompanionId: OTHER_ID }
  });
  assertEqual(inferred.ok, false, "inference payload rejected");
  assertEqual(inferred.reason, "active_companion_inference_forbidden", "inference reason");
});

await runCase("complete sealed fixture memory becomes legal reflection evidence via consumer", () => {
  const state = freshState();
  const owned = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_owned_01",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  });
  state.emotionalMemories.push(owned.record);
  const before = snapshotRelationship(state);

  const written = controller.writeReflectionPracticeIntoDraft(state, {
    companionId: COMPANION_ID,
    memoryId: "emem_owned_01",
    resolutionId: "shared_understanding",
    createdAt: BASE_TIME + 10,
    safetyFacts: createGrowthSafetyFacts(state)
  });

  assertEqual(written.accepted, true, "accepted");
  assertEqual(written.changed, true, "changed");
  const growth = state.companionStates.byId[COMPANION_ID].growth;
  assertEqual(growth.evidence[0].sourceType, "reflection", "source family");
  assertEqual(growth.stage, "initial_awakened", "no stage advance");
  assertEqual(growth.offeredStage, null, "no offer");
  assertDeepEqual(snapshotRelationship(state), before, "no relationship/reward mutation");
  assertForbiddenText(JSON.stringify(growth.evidence));
});

await runCase("legacy memory without owner fails closed even if active companion matches", () => {
  const state = freshState();
  state.emotionalMemories.push({
    id: "emem_legacy",
    status: "settled",
    createdAt: BASE_TIME,
    excerpt: "private player wording"
  });
  const before = JSON.stringify(state.companionStates);
  const written = controller.writeReflectionPracticeIntoDraft(state, {
    companionId: COMPANION_ID,
    memoryId: "emem_legacy",
    createdAt: BASE_TIME + 10,
    safetyFacts: createGrowthSafetyFacts(state)
  });
  assertEqual(written.accepted, false, "legacy rejected");
  assertEqual(written.reason, "source_owner_unverifiable", "legacy reason");
  assertEqual(JSON.stringify(state.companionStates), before, "zero evidence");
});

await runCase("missing safety provenance, unknown id, and cross-companion records fail closed", () => {
  const state = freshState();
  const owned = createOwnedSafeReflectionSource({
    companionId: OTHER_ID,
    originType: "memory",
    id: "emem_other",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  });
  state.emotionalMemories.push(owned.record);
  state.emotionalMemories.push({
    id: "emem_no_safety",
    companionId: COMPANION_ID,
    status: "settled",
    createdAt: BASE_TIME,
    growthSafetyExcluded: false
  });

  const cross = controller.writeReflectionPracticeIntoDraft(state, {
    companionId: COMPANION_ID,
    memoryId: "emem_other",
    createdAt: BASE_TIME + 10,
    safetyFacts: createGrowthSafetyFacts(state)
  });
  assertEqual(cross.reason, "source_owner_unverifiable", "cross companion");

  const missingSafety = controller.writeReflectionPracticeIntoDraft(state, {
    companionId: COMPANION_ID,
    memoryId: "emem_no_safety",
    createdAt: BASE_TIME + 10,
    safetyFacts: createGrowthSafetyFacts(state)
  });
  assertEqual(missingSafety.reason, "source_safety_unverifiable", "missing safety");

  const unknown = createReflectionGrowthWriteInput({
    state,
    companionId: "not-a-companion",
    memoryId: "emem_other",
    resolutionId: "shared_understanding",
    completedAt: BASE_TIME + 10,
    safetyFacts: safeFacts()
  });
  assertEqual(unknown.reason, "unknown_companion", "unknown companion");
});

await runCase("high-risk and safeHarbor stay excluded and cannot be washed later", () => {
  const highRisk = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_risk",
    createdAt: BASE_TIME,
    safetyFacts: { ...safeFacts(), isHighRisk: true }
  });
  assertEqual(highRisk.ok, false, "high-risk source not created");
  assertEqual(highRisk.reason, "source_safety_unverifiable", "high-risk reason");

  const state = freshState();
  state.safeHarborMode = true;
  const owned = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_harbor",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  });
  state.emotionalMemories.push(owned.record);
  const before = JSON.stringify(state.companionStates);
  const written = controller.writeReflectionPracticeIntoDraft(state, {
    companionId: COMPANION_ID,
    memoryId: "emem_harbor",
    createdAt: BASE_TIME + 10,
    safetyFacts: {
      ...createGrowthSafetyFacts(state),
      safeHarborModeActive: false,
      isHighRisk: false
    }
  });
  assertEqual(written.accepted, false, "safeHarbor rejected");
  assertEqual(written.reason, "safe_harbor_zero_evidence", "safeHarbor reason");
  assertEqual(JSON.stringify(state.companionStates), before, "harbor zero mutation");
});

await runCase("duplicate legal reflection is idempotent", () => {
  const state = seedOwnedMemory();
  const first = controller.writeReflectionPracticeIntoDraft(state, reflectionInput(state));
  const second = controller.writeReflectionPracticeIntoDraft(state, reflectionInput(state));
  assertEqual(first.accepted, true, "first write");
  assertEqual(second.accepted, false, "duplicate rejected");
  assertEqual(second.reason, "reflection_origin_already_consumed", "duplicate reason");
  assertEqual(state.companionStates.byId[COMPANION_ID].growth.evidence.length, 1, "one root");
});

await runCase("storageGuard still strips live memory owner, so save-roundtrip sources fail closed", () => {
  const owned = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_owned_01",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  }).record;
  const sanitized = sanitizeEmotionalMemory(owned, BASE_TIME);
  assertEqual(sanitized.companionId, undefined, "memory owner stripped");
  assertEqual(sanitized.safetyProvenance, undefined, "memory provenance stripped");

  const trace = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "trace",
    id: "htrace_owned_01",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  }).record;
  const sanitizedTrace = sanitizeTrace(trace, BASE_TIME);
  assertEqual(sanitizedTrace.companionId, undefined, "trace owner stripped");

  const state = freshState();
  state.emotionalMemories = [owned];
  const written = controller.writeReflectionPracticeIntoDraft(state, reflectionInput(state));
  assertEqual(written.accepted, true, "in-session sealed write works");
  const roundTrip = normalizeState(structuredClone(state));
  assertEqual(
    roundTrip.companionStates.byId[COMPANION_ID].growth.evidence[0].sourceType,
    "reflection",
    "growth evidence survives normalize"
  );
  const found = findReflectableCanonicalSource({
    state: roundTrip,
    companionId: COMPANION_ID,
    at: BASE_TIME + 20
  });
  assertEqual(found.ok, false, "sanitized source no longer reflectable");
  assertEqual(found.reason, "source_owner_unverifiable", "post-normalize fail closed");
});

await runCase("explicit safetyFacts cannot be synthesized from empty or partial data", () => {
  const base = {
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_owned_01",
    createdAt: BASE_TIME
  };
  const empty = createOwnedSafeReflectionSource({ ...base, safetyFacts: {} });
  assertEqual(empty.ok, false, "empty facts");
  assertEqual(empty.reason, "source_safety_unverifiable", "empty reason");

  const missingBoolean = createOwnedSafeReflectionSource({
    ...base,
    safetyFacts: {
      isHighRisk: false,
      strategyId: null,
      actionId: null,
      systemRoleSafetyReply: false,
      safetyModeActive: false
    }
  });
  assertEqual(missingBoolean.ok, false, "missing boolean");

  const missingStrategy = createOwnedSafeReflectionSource({
    ...base,
    safetyFacts: {
      isHighRisk: false,
      actionId: null,
      systemRoleSafetyReply: false,
      safetyModeActive: false,
      safeHarborModeActive: false
    }
  });
  assertEqual(missingStrategy.ok, false, "missing strategyId");

  const missingAction = createOwnedSafeReflectionSource({
    ...base,
    safetyFacts: {
      isHighRisk: false,
      strategyId: null,
      systemRoleSafetyReply: false,
      safetyModeActive: false,
      safeHarborModeActive: false
    }
  });
  assertEqual(missingAction.ok, false, "missing actionId");

  const stringBoolean = createOwnedSafeReflectionSource({
    ...base,
    safetyFacts: { ...safeFacts(), isHighRisk: "false" }
  });
  assertEqual(stringBoolean.ok, false, "string boolean");

  const extraField = createOwnedSafeReflectionSource({
    ...base,
    safetyFacts: { ...safeFacts(), guessedOwner: COMPANION_ID }
  });
  assertEqual(extraField.ok, false, "unknown extra field");

  const complete = createOwnedSafeReflectionSource({ ...base, safetyFacts: safeFacts() });
  assertEqual(complete.ok, true, "complete safe facts");
  assertEqual(complete.record.safetyProvenance.complete, true, "sealed complete");
  assertEqual(complete.record.safetyProvenance.excluded, false, "sealed safe");
});

await runCase("Care + Exploration + Reflection + Chapter Stage 3 is a sealed fixture proof", () => {
  const state = seedOwnedMemory();
  writeFamily(state, "care", {
    chapterNo: 1,
    originEventId: "care_non_standoff",
    practiceId: "listen"
  }, "attunement", "respected_rewrite", BASE_TIME + 1);
  writeFamily(state, "exploration", {
    nodeId: "moonlake_trail",
    choiceId: "read",
    chapterNo: 1
  }, "pathfinding", null, BASE_TIME + 2);
  writeFamily(state, "chapter", {
    chapterNo: 1,
    eventId: "life_moonlake_still",
    branchFamily: "presence"
  }, "steadfastness", null, BASE_TIME + 3);
  const reflection = controller.writeReflectionPracticeIntoDraft(state, reflectionInput(state, BASE_TIME + 4));
  assertEqual(reflection.accepted, true, "sealed fixture reflection write");

  const growth = state.companionStates.byId[COMPANION_ID].growth;
  assertEqual(growth.offeredStage, null, "fixture creates no offer");
  const families = Object.entries(growth.coverage.rootsBySourceType)
    .filter(([, roots]) => roots.length > 0)
    .map(([sourceType]) => sourceType)
    .sort();
  assertDeepEqual(families, ["care", "chapter", "exploration", "reflection"], "four non-standoff families");
  assertEqual(families.includes("standoff"), false, "standoff absent");

  const resonant = evaluateCompanionGrowthReadiness({
    growth,
    companionId: COMPANION_ID,
    chapterNo: 2,
    profile: profile(2, 5)
  });
  assertEqual(resonant.ready, true, "resonant_mature ready");

  const advanced = {
    ...growth,
    stage: "resonant_mature",
    coverage: {
      ...growth.coverage,
      targetStage: "final_awakened",
      windowOpenedAt: BASE_TIME,
      rootsBySourceType: growth.coverage.rootsBySourceType
    }
  };
  const finalReady = evaluateCompanionGrowthReadiness({
    growth: advanced,
    companionId: COMPANION_ID,
    chapterNo: 6,
    profile: profile(2, 5)
  });
  assertEqual(finalReady.ready, true, "final_awakened ready without standoff");
  assertEqual(finalReady.familyCount, 4, "four families");
  assertEqual(finalReady.requiredFamilyCount, 4, "stage 3 minimum");
});

report();

function freshState() {
  const state = createDefaultState();
  state.chapterProgress.current = 2;
  state.emotionalMemories = [];
  state.habitatTraces = [];
  // Default growth windows open at Date.now(). This fixture uses a fixed
  // BASE_TIME so the writer can stay deterministic without depending on the
  // clock of the test runner.
  const growth = state.companionStates?.byId?.[COMPANION_ID]?.growth;
  if (growth?.coverage) growth.coverage.windowOpenedAt = BASE_TIME;
  return state;
}

function seedOwnedMemory() {
  const state = freshState();
  const owned = createOwnedSafeReflectionSource({
    companionId: COMPANION_ID,
    originType: "memory",
    id: "emem_owned_01",
    createdAt: BASE_TIME,
    safetyFacts: safeFacts()
  });
  state.emotionalMemories.push(owned.record);
  return state;
}

function reflectionInput(state, createdAt = BASE_TIME + 10) {
  return {
    companionId: COMPANION_ID,
    memoryId: "emem_owned_01",
    resolutionId: "shared_understanding",
    createdAt,
    safetyFacts: createGrowthSafetyFacts(state)
  };
}

function writeFamily(state, sourceType, context, tendency, consentKind, createdAt) {
  const created = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType,
    tendency,
    context,
    createdAt,
    completed: true,
    completionStatus: "completed",
    consentKind,
    safetyProvenance: createGrowthSafetyFacts(state)
  });
  if (!created.ok) throw new Error(`family ${sourceType} failed: ${created.reason}`);
  const written = writeCompanionGrowthEvidence({
    growth: state.companionStates.byId[COMPANION_ID].growth,
    companionId: COMPANION_ID,
    event: created.event
  });
  if (written.result.changed) {
    state.companionStates.byId[COMPANION_ID].growth = written.growth;
  }
}

function snapshotRelationship(state) {
  const record = state.companionStates.byId[COMPANION_ID];
  return {
    bond: state.bond,
    trust: state.trust,
    energy: state.energy,
    mood: state.mood,
    stage: record.growth.stage,
    offeredStage: record.growth.offeredStage
  };
}

function safeFacts() {
  return {
    isHighRisk: false,
    strategyId: null,
    actionId: null,
    systemRoleSafetyReply: false,
    safetyModeActive: false,
    safeHarborModeActive: false
  };
}

function profile(resonantMinimum, finalMinimum) {
  return {
    minimumChapterByStage: {
      resonant_mature: resonantMinimum,
      final_awakened: finalMinimum
    }
  };
}

function assertForbiddenText(text) {
  if (/private player wording|想死|自殺/.test(text)) {
    throw new Error("raw player or crisis text leaked into growth");
  }
}

async function runCase(name, callback) {
  try {
    await callback();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error?.message || String(error) });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${label}: expected ${right}, got ${left}`);
}

function report() {
  const failed = cases.filter((entry) => !entry.ok);
  for (const entry of cases) {
    console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : ` — ${entry.error}`}`);
  }
  console.log(`\nevo-01 reflection production: ${cases.length - failed.length}/${cases.length}`);
  if (failed.length > 0) process.exitCode = 1;
}
