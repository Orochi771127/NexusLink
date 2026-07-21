import {
  COMPANION_GROWTH_SOURCE_TYPES,
  COMPANION_GROWTH_TENDENCIES,
  MAX_GROWTH_EVIDENCE_DETAILS,
  createCompletedGrowthEvent,
  createGrowthEvidenceIdentity,
  evaluateCompanionGrowthReadiness,
  evaluateCompanionGrowthWillingness,
  normalizeGrowthSourceType,
  normalizeGrowthTendency,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../../src/engine/companionGrowthEngine.js";

const COMPANION_ID = "greyshade-cat";
const BASE_TIME = 1784227200000;
const cases = [];

await runCase("fixed source and tendency aliases normalize before identity creation", () => {
  assertDeepEqual(COMPANION_GROWTH_SOURCE_TYPES, [
    "care", "exploration", "reflection", "standoff", "chapter", "boundary", "recovery"
  ], "source enum");
  assertDeepEqual(COMPANION_GROWTH_TENDENCIES, [
    "attunement", "boundary_respect", "pathfinding", "steadfastness"
  ], "tendency enum");
  assertEqual(normalizeGrowthSourceType(" Map-Exploration "), "exploration", "source alias");
  assertEqual(normalizeGrowthTendency("Path Finding"), "pathfinding", "tendency alias");
  assertEqual(normalizeGrowthSourceType("daily_mission"), null, "unknown source");
  assertEqual(normalizeGrowthTendency("attack"), null, "unknown tendency");

  const canonical = createGrowthEvidenceIdentity("exploration", {
    chapterNo: 1,
    nodeId: "Starwood-Trail",
    choiceId: "Anchor Read"
  });
  const alias = createGrowthEvidenceIdentity("map-exploration", {
    chapterNo: 1,
    nodeId: "starwood_trail",
    choiceId: "anchor_read"
  });
  assertEqual(canonical.ok, true, "canonical identity");
  assertEqual(alias.ok, true, "alias identity");
  assertDeepEqual(alias.identity, canonical.identity, "alias identity equality");
  assertEqual(canonical.identity.key, "exploration:1:starwood_trail:anchor_read", "key contract");
  assertEqual(canonical.identity.rootContextKey, "exploration:1:starwood_trail", "root contract");
});

await runCase("all seven deterministic factories produce the contract keys", () => {
  const table = [
    ["care", { chapterNo: 1, originEventId: "touch_01", practiceId: "co_breath" }, "care:1:touch_01:co_breath", "care:1:touch_01"],
    ["exploration", { chapterNo: 1, nodeId: "starwood_trail", choiceId: "anchor_read" }, "exploration:1:starwood_trail:anchor_read", "exploration:1:starwood_trail"],
    ["reflection", { memoryId: "emem_01", resolutionId: "accepted_revision" }, "reflection:emem_01:accepted_revision", "reflection:emem_01"],
    ["standoff", { chapterNo: 1, nodeId: "rift_01", outcomeFamily: "steady" }, "standoff:1:rift_01:stabilized", "standoff:1:rift_01"],
    ["chapter", { chapterNo: 2, eventId: "lake_vow", branchFamily: "listen" }, "chapter:2:lake_vow:listen", "chapter:2:lake_vow"],
    ["boundary", { originKey: "care:1:touch_01" }, "boundary:care:1:touch_01:respected", "care:1:touch_01"],
    ["recovery", { originKey: "standoff:1:rift_01" }, "recovery:standoff:1:rift_01:completed", "standoff:1:rift_01"]
  ];
  for (const [sourceType, context, expectedKey, expectedRoot] of table) {
    const result = createGrowthEvidenceIdentity(sourceType, context);
    assertEqual(result.ok, true, `${sourceType} identity`);
    assertEqual(result.identity.key, expectedKey, `${sourceType} key`);
    assertEqual(result.identity.rootContextKey, expectedRoot, `${sourceType} root`);
  }
});

await runCase("same normalized action replayed 50 times records one immutable root", () => {
  let growth = createGrowth();
  const untouchedInput = growth;
  const firstInput = {
    sourceType: "map-exploration",
    tendency: "path-finding",
    context: { chapterNo: 1, nodeId: "Starwood Trail", choiceId: "Anchor-Read" }
  };
  let accepted = 0;
  for (let index = 0; index < 50; index += 1) {
    const event = makeEvent({
      ...firstInput,
      createdAt: BASE_TIME + index + 1
    });
    const outcome = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event });
    if (outcome.result.accepted) accepted += 1;
    if (index === 0) {
      assertEqual(outcome.growth === untouchedInput, false, "accepted write returns a new growth object");
      assertEqual(flatRootCount(untouchedInput), 0, "accepted write leaves input untouched");
    }
    growth = outcome.growth;
  }
  assertEqual(accepted, 1, "accepted replay count");
  assertEqual(growth.evidence.length, 1, "detail count");
  assertEqual(growth.coverage.rootsBySourceType.exploration.length, 1, "coverage root count");
  assertEqual(growth.consumedRootKeys.length, 1, "consumed root count");
});

await runCase("valid chapter branches are readiness-equal and share one event root", () => {
  const branchShapes = [];
  for (const branchFamily of ["listen", "step-back", "leave-space"]) {
    const event = makeEvent({
      sourceType: "chapter",
      tendency: "boundary_respect",
      context: { chapterNo: 2, eventId: "lake_vow", branchFamily },
      createdAt: BASE_TIME + 1
    });
    const outcome = writeCompanionGrowthEvidence({
      growth: createGrowth(), companionId: COMPANION_ID, event
    });
    assertEqual(outcome.result.accepted, true, `${branchFamily} accepted`);
    branchShapes.push({
      roots: outcome.growth.coverage.rootsBySourceType.chapter.length,
      consumed: outcome.growth.consumedRootKeys.length
    });
  }
  assertEqual(new Set(branchShapes.map(JSON.stringify)).size, 1, "chapter branches have equal root weight");

  let growth = createGrowth();
  const first = makeEvent({
    sourceType: "chapter", tendency: "attunement",
    context: { chapterNo: 2, eventId: "same_moment", branchFamily: "listen" },
    createdAt: BASE_TIME + 1
  });
  growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: first }).growth;
  const alternate = makeEvent({
    sourceType: "chapter", tendency: "boundary_respect",
    context: { chapterNo: 2, eventId: "same_moment", branchFamily: "leave_space" },
    createdAt: BASE_TIME + 2
  });
  const replay = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: alternate });
  assertEqual(replay.result.reason, "duplicate_root", "alternate chapter branch dedupe");
  assertEqual(replay.growth.evidence.length, 1, "one chapter detail");
});

await runCase("sealed high-risk provenance survives delayed UI clearing and descendants", () => {
  const excludedResult = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType: "reflection",
    tendency: "attunement",
    context: { traceId: "trace_safety", resolutionId: "heard" },
    createdAt: BASE_TIME + 1,
    completed: true,
    completionStatus: "completed",
    safetyProvenance: safetyFacts({ isHighRisk: true })
  });
  assertEqual(excludedResult.ok, true, "excluded source created");
  assertEqual(excludedResult.event.growthSafetyExcluded, true, "origin excluded");
  assertEqual(Object.isFrozen(excludedResult.event.safetyProvenance), true, "provenance frozen");

  const washedTopLevel = {
    ...excludedResult.event,
    growthSafetyExcluded: false
  };
  const washedOutcome = writeCompanionGrowthEvidence({
    growth: createGrowth(),
    companionId: COMPANION_ID,
    event: washedTopLevel
  });
  assertEqual(washedOutcome.result.accepted, false, "top-level wash rejected");
  assertEqual(washedOutcome.result.reason, "safety_provenance_mismatch", "wash reason");

  const tamperedProvenance = {
    ...excludedResult.event,
    growthSafetyExcluded: false,
    safetyProvenance: {
      ...excludedResult.event.safetyProvenance,
      isHighRisk: false,
      excluded: false
    }
  };
  const tamperedOutcome = writeCompanionGrowthEvidence({
    growth: createGrowth(),
    companionId: COMPANION_ID,
    event: tamperedProvenance
  });
  assertEqual(tamperedOutcome.result.accepted, false, "sealed provenance tamper rejected");
  assertEqual(tamperedOutcome.result.reason, "safety_provenance_invalid", "tamper reason");

  const child = makeEvent({
    sourceType: "care",
    tendency: "attunement",
    context: { chapterNo: 1, originEventId: "queued_child", practiceId: "co_breath" },
    createdAt: BASE_TIME + 2,
    parentEvent: excludedResult.event
  });
  assertEqual(child.safetyProvenance.inheritedExcluded, true, "child inherits exclusion");
  const childOutcome = writeCompanionGrowthEvidence({
    growth: createGrowth(), companionId: COMPANION_ID, event: child
  });
  assertEqual(childOutcome.result.reason, "safety_excluded", "descendant rejected after mode clear");
});

await runCase("missing safety provenance and incomplete events fail closed", () => {
  const incomplete = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType: "care",
    tendency: "attunement",
    context: { chapterNo: 1, originEventId: "open", practiceId: "idle" },
    createdAt: BASE_TIME + 1,
    completed: false,
    completionStatus: "completed",
    safetyProvenance: safetyFacts()
  });
  assertEqual(incomplete.ok, false, "incomplete event creation");
  assertEqual(incomplete.reason, "event_not_completed", "incomplete reason");

  const missingSafety = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType: "care",
    tendency: "attunement",
    context: { chapterNo: 1, originEventId: "finished", practiceId: "co_breath" },
    createdAt: BASE_TIME + 1,
    completed: true,
    completionStatus: "completed"
  });
  assertEqual(missingSafety.ok, true, "missing safety event remains inspectable");
  assertEqual(missingSafety.event.growthSafetyExcluded, true, "missing safety excluded");
  const outcome = writeCompanionGrowthEvidence({
    growth: createGrowth(), companionId: COMPANION_ID, event: missingSafety.event
  });
  assertEqual(outcome.result.accepted, false, "missing safety write");
  assertEqual(outcome.result.reason, "safety_excluded", "missing safety reason");
});

await runCase("all standoff outcomes are readiness-equal and share one encounter root", () => {
  const outcomes = ["stabilized", "recovered", "retreated", "overwhelmed-but-safe"];
  const readinessShapes = [];
  for (let index = 0; index < outcomes.length; index += 1) {
    const event = makeEvent({
      sourceType: "standoff",
      tendency: index % 2 === 0 ? "steadfast" : "boundary-respect",
      context: { chapterNo: 2, nodeId: "rift_echo", outcomeFamily: outcomes[index] },
      createdAt: BASE_TIME + 1
    });
    const result = writeCompanionGrowthEvidence({
      growth: createGrowth(), companionId: COMPANION_ID, event
    });
    assertEqual(result.result.accepted, true, `${outcomes[index]} accepted`);
    readinessShapes.push({
      roots: result.growth.coverage.rootsBySourceType.standoff.length,
      consumed: result.growth.consumedRootKeys.length
    });
  }
  assertEqual(new Set(readinessShapes.map(JSON.stringify)).size, 1, "outcomes have equal root weight");

  let growth = createGrowth();
  const first = makeEvent({
    sourceType: "standoff",
    tendency: "steadfastness",
    context: { chapterNo: 2, nodeId: "same_rift", outcomeFamily: "stabilized" },
    createdAt: BASE_TIME + 1
  });
  growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: first }).growth;
  const replayedOutcome = makeEvent({
    sourceType: "standoff",
    tendency: "boundary_respect",
    context: { chapterNo: 2, nodeId: "same_rift", outcomeFamily: "recovered" },
    createdAt: BASE_TIME + 2
  });
  const replay = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: replayedOutcome });
  assertEqual(replay.result.reason, "duplicate_root", "alternate outcome root dedupe");
  assertEqual(replay.growth.evidence.length, 1, "one standoff detail");
});

await runCase("same-root optional repair can seal consent without adding readiness weight", () => {
  let growth = createGrowth();
  const standoff = makeEvent({
    sourceType: "standoff",
    tendency: "steadfastness",
    context: { chapterNo: 1, nodeId: "shared_rift", outcomeFamily: "retreated" },
    createdAt: BASE_TIME + 1
  });
  growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: standoff }).growth;
  const repair = makeEvent({
    sourceType: "recovery",
    tendency: "steadfastness",
    context: { originKey: "standoff:1:shared_rift" },
    createdAt: BASE_TIME + 2
  });
  const repaired = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: repair });
  assertEqual(repaired.result.reason, "consent_anchor_observed", "repair annotates existing root");
  assertEqual(repaired.growth.coverage.consentAnchorRootKey, "standoff:1:shared_rift", "anchor root");
  assertEqual(repaired.growth.coverage.rootsBySourceType.recovery.length, 0, "no second recovery domain");
  assertEqual(repaired.growth.consumedRootKeys.length, 1, "no second consumed root");
  assertEqual(repaired.growth.evidence.length, 1, "no second detail");
});

await runCase("reserved capacity prevents one-family soft lock and remains reachable", () => {
  let growth = createGrowth();
  let acceptedCareRoots = 0;
  for (let index = 0; index < 30; index += 1) {
    const event = makeEvent({
      sourceType: "care",
      tendency: "attunement",
      context: { chapterNo: 1, originEventId: `care_${index}`, practiceId: "listen" },
      createdAt: BASE_TIME + index + 1
    });
    const outcome = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event });
    if (outcome.result.accepted) acceptedCareRoots += 1;
    growth = outcome.growth;
  }
  assertEqual(acceptedCareRoots, 21, "care cap reserves two families and anchor");
  assertEqual(growth.coverage.rootsBySourceType.care.length, 21, "care roots");

  for (const event of [
    makeEvent({
      sourceType: "exploration", tendency: "pathfinding",
      context: { chapterNo: 1, nodeId: "trail", choiceId: "read" }, createdAt: BASE_TIME + 40
    }),
    makeEvent({
      sourceType: "reflection", tendency: "attunement",
      context: { traceId: "trace_01", resolutionId: "revised" }, createdAt: BASE_TIME + 41
    }),
    makeEvent({
      sourceType: "recovery", tendency: "steadfastness",
      context: { originKey: "care:1:repair_anchor" }, createdAt: BASE_TIME + 42
    })
  ]) {
    growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event }).growth;
  }
  assertEqual(flatRootCount(growth), 24, "full root window");
  const readiness = evaluateCompanionGrowthReadiness({
    growth,
    companionId: COMPANION_ID,
    chapterNo: 2,
    profile: profile(2, 5)
  });
  assertEqual(readiness.ready, true, "reserved route remains ready");
  assertEqual(readiness.familyCount, 4, "family diversity");
});

await runCase("detail 25 compacts deterministically while preserving references and coverage", () => {
  const evidence = [];
  const consumedRootKeys = [];
  for (let index = 0; index < MAX_GROWTH_EVIDENCE_DETAILS; index += 1) {
    const root = `care:1:old_${String(index).padStart(2, "0")}`;
    consumedRootKeys.push(root);
    evidence.push(createDetail({
      key: `${root}:listen`,
      root,
      createdAt: BASE_TIME - 1000 + index,
      memoryId: index === 0 ? "emem_keep" : null
    }));
  }
  const growth = createGrowth({
    stage: "resonant_mature",
    evidence,
    consumedRootKeys,
    windowOpenedAt: BASE_TIME
  });
  const event = makeEvent({
    sourceType: "exploration",
    tendency: "pathfinding",
    context: { chapterNo: 5, nodeId: "new_path", choiceId: "listen" },
    createdAt: BASE_TIME + 1
  });
  const outcome = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event });
  assertEqual(outcome.result.reason, "evidence_recorded_compacted", "compaction result");
  assertEqual(outcome.growth.evidence.length, 24, "detail bound");
  assertEqual(outcome.growth.evidence.some((item) => item.memoryId === "emem_keep"), true, "memory reference kept");
  assertEqual(outcome.growth.evidence.some((item) => item.key === event.key), true, "new family detail kept");
  assertEqual(outcome.growth.evidence.some((item) => item.key === "care:1:old_01:listen"), false, "oldest removable detail replaced");
  assertEqual(outcome.growth.coverage.rootsBySourceType.exploration.length, 1, "coverage added");
  assertEqual(outcome.growth.consumedRootKeys.length, 25, "consumed root monotonic");

  const repeat = writeCompanionGrowthEvidence({ growth: outcome.growth, companionId: COMPANION_ID, event });
  assertEqual(repeat.result.reason, "duplicate_key", "compacted root replay blocked");
  assertDeepEqual(repeat.growth, outcome.growth, "replay does not roll coverage back");
});

await runCase("consumed roots cannot cross a new target window after detail compaction", () => {
  const oldRoot = "exploration:1:old_path";
  const growth = createGrowth({
    stage: "resonant_mature",
    consumedRootKeys: [oldRoot],
    windowOpenedAt: BASE_TIME
  });
  const replay = makeEvent({
    sourceType: "exploration",
    tendency: "pathfinding",
    context: { chapterNo: 1, nodeId: "old_path", choiceId: "new_alias" },
    createdAt: BASE_TIME + 1
  });
  const outcome = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event: replay });
  assertEqual(outcome.result.reason, "consumed_root", "past root blocked");
  assertEqual(flatRootCount(outcome.growth), 0, "no current coverage");
});

await runCase("corrupt growth, event identities, timestamps and companion ownership fail closed", () => {
  const validEvent = makeEvent({
    sourceType: "care",
    tendency: "attunement",
    context: { chapterNo: 1, originEventId: "valid", practiceId: "listen" },
    createdAt: BASE_TIME + 1
  });
  const corruptions = [
    [createGrowth({ windowOpenedAt: 0 }), validEvent, "invalid_growth_window"],
    [{ ...createGrowth(), coverage: { ...createGrowth().coverage, consentAnchorRootKey: "care:1:missing" } }, validEvent, "invalid_consent_anchor"],
    [{ ...createGrowth(), consumedRootKeys: ["care:1:dup", "care:1:dup"] }, validEvent, "invalid_consumed_roots"],
    [createGrowth(), { ...validEvent, companionId: "blazetail-kit" }, "companion_mismatch"],
    [createGrowth(), { ...validEvent, key: "care:1:forged:listen" }, "event_identity_mismatch"],
    [createGrowth(), { ...validEvent, createdAt: Number.NaN }, "invalid_created_at"]
  ];
  for (const [growth, event, expectedReason] of corruptions) {
    const outcome = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event });
    assertEqual(outcome.result.accepted, false, expectedReason);
    assertEqual(outcome.result.reason, expectedReason, `${expectedReason} reason`);
  }
});

await runCase("readiness requires 3 then 4 families, consent anchor and chapter profile", () => {
  let resonant = createGrowth();
  for (const event of readinessEvents(BASE_TIME + 1).slice(0, 4)) {
    resonant = writeCompanionGrowthEvidence({ growth: resonant, companionId: COMPANION_ID, event }).growth;
  }
  const tooEarly = evaluateCompanionGrowthReadiness({
    growth: resonant, companionId: COMPANION_ID, chapterNo: 1, profile: profile(2, 5)
  });
  assertEqual(tooEarly.ready, false, "chapter holds resonant");
  assertEqual(tooEarly.reason, "chapter_minimum_not_met", "chapter reason");
  const ready = evaluateCompanionGrowthReadiness({
    growth: resonant, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5)
  });
  assertEqual(ready.ready, true, "resonant ready");
  assertEqual(ready.requiredFamilyCount, 3, "resonant family minimum");

  let finalGrowth = createGrowth({ stage: "resonant_mature", windowOpenedAt: BASE_TIME });
  for (const event of readinessEvents(BASE_TIME + 1)) {
    finalGrowth = writeCompanionGrowthEvidence({ growth: finalGrowth, companionId: COMPANION_ID, event }).growth;
  }
  const finalReady = evaluateCompanionGrowthReadiness({
    growth: finalGrowth, companionId: COMPANION_ID, chapterNo: 5, profile: profile(2, 5)
  });
  assertEqual(finalReady.ready, true, "final ready");
  assertEqual(finalReady.requiredFamilyCount, 4, "final family minimum");

  const noAnchorGrowth = {
    ...resonant,
    coverage: { ...resonant.coverage, consentAnchorRootKey: null }
  };
  const noAnchor = evaluateCompanionGrowthReadiness({
    growth: noAnchorGrowth, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5)
  });
  assertEqual(noAnchor.ready, false, "anchor required");
  assertEqual(noAnchor.reason, "consent_anchor_missing", "anchor reason");
});

await runCase("typed willingness is separate and ignores bond, defense and elapsed time", () => {
  let growth = createGrowth();
  for (const event of readinessEvents(BASE_TIME + 1).slice(0, 4)) {
    growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event }).growth;
  }
  const readiness = evaluateCompanionGrowthReadiness({
    growth, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5)
  });
  const safe = sealGrowthSafetyProvenance(safetyFacts());
  const baseContext = {
    growthSafetyExcluded: false,
    safetyProvenance: safe,
    fatigue: { kind: "touch", state: "regulated" },
    boundaryState: "clear",
    chapterRhythm: "open",
    companionIntent: "accept"
  };
  const willing = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: { ...baseContext, bond: 0, defense: 100, currentTime: BASE_TIME }
  });
  const numericMutation = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: { ...baseContext, bond: 100, defense: 0, currentTime: BASE_TIME + 30 * 86400000 }
  });
  assertDeepEqual(numericMutation, willing, "numeric/time invariance");
  assertEqual(willing.state, "willing", "willing state");

  const rewrite = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: { ...baseContext, companionIntent: "rewrite" }
  });
  assertEqual(rewrite.state, "rewrite", "rewrite state");
  assertEqual(rewrite.canProceed, true, "rewrite can proceed");

  const overfatigued = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: { ...baseContext, fatigue: { kind: "touch", state: "overfatigued" } }
  });
  assertEqual(overfatigued.reason, "typed_overfatigue", "typed fatigue holds");
  const unresolved = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: { ...baseContext, boundaryState: "unresolved" }
  });
  assertEqual(unresolved.reason, "boundary_unresolved", "boundary holds");

  const staleForOtherCompanion = evaluateCompanionGrowthWillingness({
    growth: createGrowth(),
    companionId: "blazetail-kit",
    readiness: { ...readiness, companionId: "blazetail-kit" },
    context: baseContext
  });
  assertEqual(
    staleForOtherCompanion.reason,
    "readiness_stale_or_mismatched",
    "A readiness cannot authorize fresh B growth"
  );
});

await runCase("deferred willingness needs a new typed context, never a timer", () => {
  let growth = createGrowth();
  for (const event of readinessEvents(BASE_TIME + 1).slice(0, 4)) {
    growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event }).growth;
  }
  growth = { ...growth, deferredAt: BASE_TIME + 100 };
  const readiness = evaluateCompanionGrowthReadiness({
    growth, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5)
  });
  const context = willingContext();
  const afterThirtyDays = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: { ...context, currentTime: BASE_TIME + 30 * 86400000 }
  });
  assertEqual(afterThirtyDays.reason, "awaiting_new_context", "waiting does not wash deferral");
  const fabricatedRepair = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness,
    context: {
      ...context,
      reevaluation: { kind: "repair_completed", rootContextKey: "care:1:repair_again" }
    }
  });
  assertEqual(fabricatedRepair.reason, "awaiting_new_context", "typed label alone is not provenance");

  const repairEvent = makeEvent({
    sourceType: "recovery",
    tendency: "steadfastness",
    context: { originKey: "recovery:after_defer" },
    createdAt: BASE_TIME + 101
  });
  growth = writeCompanionGrowthEvidence({
    growth,
    companionId: COMPANION_ID,
    event: repairEvent
  }).growth;
  const refreshedReadiness = evaluateCompanionGrowthReadiness({
    growth, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5)
  });
  const withRepair = evaluateCompanionGrowthWillingness({
    growth, companionId: COMPANION_ID, readiness: refreshedReadiness,
    context: {
      ...context,
      reevaluation: {
        kind: "repair_completed",
        rootContextKey: repairEvent.rootContextKey,
        event: repairEvent
      }
    }
  });
  assertEqual(withRepair.state, "willing", "new repair re-evaluates");
});

await runCase("readiness and coverage remain unchanged after a 30-day clock jump", () => {
  let growth = createGrowth();
  for (const event of readinessEvents(BASE_TIME + 1).slice(0, 4)) {
    growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event }).growth;
  }
  const before = evaluateCompanionGrowthReadiness({
    growth, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5), now: BASE_TIME
  });
  const after = evaluateCompanionGrowthReadiness({
    growth, companionId: COMPANION_ID, chapterNo: 2, profile: profile(2, 5), now: BASE_TIME + 30 * 86400000
  });
  assertDeepEqual(after, before, "readiness time invariance");
  assertEqual(growth.stage, "initial_awakened", "engine does not advance stage");
  assertEqual(growth.offeredStage, null, "engine does not create offer");
});

const failures = cases.filter((entry) => !entry.ok);
console.log(`Companion Growth G3 engine cases: ${cases.length - failures.length}/${cases.length} passed`);
for (const entry of cases) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.error ? ` — ${entry.error}` : ""}`);
}
if (failures.length > 0) process.exitCode = 1;

function createGrowth({
  stage = "initial_awakened",
  evidence = [],
  consumedRootKeys = [],
  windowOpenedAt = BASE_TIME,
  rootsBySourceType = null,
  consentAnchorRootKey = null
} = {}) {
  const targetStage = stage === "initial_awakened"
    ? "resonant_mature"
    : stage === "resonant_mature"
      ? "final_awakened"
      : null;
  return {
    stage,
    evidence: evidence.map((item) => ({ ...item })),
    coverage: {
      targetStage,
      windowOpenedAt,
      rootsBySourceType: rootsBySourceType || Object.fromEntries(
        COMPANION_GROWTH_SOURCE_TYPES.map((sourceType) => [sourceType, []])
      ),
      consentAnchorRootKey
    },
    consumedRootKeys: [...consumedRootKeys],
    offeredStage: null,
    deferredAt: null,
    lastGrowthEventAt: null,
    migration: {
      appliedVersion: 0,
      legacyStageFloor: null,
      legacyCodexRevealFloor: null,
      legacyBaselineKey: null
    }
  };
}

function makeEvent({
  sourceType,
  tendency,
  context,
  createdAt,
  consentKind = null,
  parentEvent = null
}) {
  const result = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType,
    tendency,
    context,
    createdAt,
    completed: true,
    completionStatus: "completed",
    consentKind,
    parentEvent,
    safetyProvenance: safetyFacts()
  });
  if (!result.ok) throw new Error(`event creation failed: ${result.reason}`);
  return result.event;
}

function safetyFacts(overrides = {}) {
  return {
    isHighRisk: false,
    strategyId: null,
    actionId: null,
    systemRoleSafetyReply: false,
    safetyModeActive: false,
    safeHarborModeActive: false,
    ...overrides
  };
}

function readinessEvents(startAt) {
  return [
    makeEvent({
      sourceType: "care", tendency: "attunement",
      context: { chapterNo: 1, originEventId: "care_ready", practiceId: "listen" },
      createdAt: startAt
    }),
    makeEvent({
      sourceType: "exploration", tendency: "pathfinding",
      context: { chapterNo: 1, nodeId: "trail_ready", choiceId: "read" },
      createdAt: startAt + 1
    }),
    makeEvent({
      sourceType: "reflection", tendency: "attunement",
      context: { traceId: "trace_ready", resolutionId: "revision" },
      createdAt: startAt + 2
    }),
    makeEvent({
      sourceType: "recovery", tendency: "steadfastness",
      context: { originKey: "care:1:repair_ready" },
      createdAt: startAt + 3
    })
  ];
}

function createDetail({ key, root, createdAt, memoryId = null }) {
  return {
    key,
    rootContextKey: root,
    companionId: COMPANION_ID,
    tendency: "attunement",
    sourceType: "care",
    sourceId: key.slice("care:1:".length),
    chapterNo: 1,
    memoryId,
    traceId: null,
    createdAt,
    growthSafetyExcluded: false,
    legacyAttributed: false
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

function willingContext() {
  return {
    growthSafetyExcluded: false,
    safetyProvenance: sealGrowthSafetyProvenance(safetyFacts()),
    fatigue: { kind: "touch", state: "regulated" },
    boundaryState: "clear",
    chapterRhythm: "open",
    companionIntent: "accept"
  };
}

function flatRootCount(growth) {
  return Object.values(growth.coverage.rootsBySourceType).flat().length;
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
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}
