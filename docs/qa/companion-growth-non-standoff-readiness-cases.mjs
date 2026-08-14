/**
 * Non-standoff readiness proof — G4 precondition.
 *
 * `docs/handoff/RAPHAEL_AI_STATUS.yaml` gates G4 offer/stage-advance on a
 * *proven* non-standoff readiness path. `companion-growth-g3-engine-cases.mjs`
 * already proves the readiness arithmetic, but it used to reach the required
 * family count using unwired `reflection` / `recovery`. EVO-01 wires reflection
 * through the Growth controller and owner; this suite now treats reflection as
 * a live source family while still excluding standoff from the product path.
 *
 * This suite closes that gap. It only uses source families that are written
 * from a real gameplay path today, and it asserts those call sites still exist
 * rather than trusting a comment. If someone deletes a writer, or wires
 * `reflection` in, this file fails and must be re-read.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  COMPANION_GROWTH_SOURCE_TYPES,
  createCompletedGrowthEvent,
  evaluateCompanionGrowthReadiness,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../../src/engine/companionGrowthEngine.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const COMPANION_ID = "greyshade-cat";
const BASE_TIME = 1784227200000;

/**
 * Source families reachable from a live gameplay path, with the writer that
 * makes them reachable. `standoff` is listed so the suite can prove it is
 * deliberately excluded, not accidentally missing.
 */
const RUNTIME_WRITERS = Object.freeze([
  { sourceType: "care", file: "src/ui/companionGrowthController.js", standoff: false },
  { sourceType: "exploration", file: "src/orbit/orbitSettlement.js", standoff: false },
  { sourceType: "exploration", file: "src/ui/mapController.js", standoff: false },
  { sourceType: "chapter", file: "src/engine/chapterTrialEngine.js", standoff: false },
  { sourceType: "reflection", file: "src/engine/reflectionGrowthOwner.js", standoff: false },
  { sourceType: "standoff", file: "src/ui/battleController.js", standoff: true }
]);

/** Built as data families, but not yet called from a gameplay source owner. */
const UNWIRED_SOURCE_TYPES = Object.freeze(["boundary", "recovery"]);

const cases = [];

await runCase("live runtime writers include the non-standoff families plus standoff", () => {
  for (const { sourceType, file } of RUNTIME_WRITERS) {
    const source = readFileSync(join(REPO_ROOT, file), "utf8");
    assert(
      source.includes(`sourceType: "${sourceType}"`),
      `${file} no longer writes sourceType "${sourceType}"`
    );
  }

  const live = [...new Set(RUNTIME_WRITERS.map((entry) => entry.sourceType))].sort();
  assertDeepEqual(live, ["care", "chapter", "exploration", "reflection", "standoff"], "live source families");

  for (const sourceType of UNWIRED_SOURCE_TYPES) {
    assert(
      COMPANION_GROWTH_SOURCE_TYPES.includes(sourceType),
      `${sourceType} vanished from the source enum`
    );
  }
});

await runCase("reflection production writer is wired and no longer unreachable", () => {
  const owner = readFileSync(join(REPO_ROOT, "src/engine/reflectionGrowthOwner.js"), "utf8");
  const controller = readFileSync(join(REPO_ROOT, "src/ui/companionGrowthController.js"), "utf8");
  assert(
    owner.includes("export function createReflectionGrowthWriteInput"),
    "reflection writer builder disappeared"
  );
  assert(
    controller.includes("writeReflectionPracticeIntoDraft"),
    "reflection production writer missing from Growth controller"
  );
  assert(
    controller.includes("createReflectionGrowthWriteInput"),
    "controller no longer calls the owner"
  );
  const router = readFileSync(join(REPO_ROOT, "src/ui/pageRouter.js"), "utf8");
  assert(
    router.includes("recordCompletedReflectionPractice"),
    "Memory Echo production caller missing from pageRouter"
  );
  assert(
    router.includes("writeReflectionPracticeIntoDraft"),
    "pageRouter no longer forwards Memory Echo to the Growth writer"
  );
});

await runCase("care + exploration + chapter reaches resonant_mature without any standoff", () => {
  const { growth, families } = buildNonStandoffGrowth();

  assert(!families.includes("standoff"), "standoff leaked into the non-standoff fixture");

  const readiness = evaluateCompanionGrowthReadiness({
    growth,
    companionId: COMPANION_ID,
    chapterNo: 2,
    profile: profile(2, 5)
  });

  assertEqual(readiness.integrityOk, true, "growth integrity");
  assertEqual(readiness.ready, true, "resonant_mature reachable without standoff");
  assertEqual(readiness.reason, "ready", "readiness reason");
  assertEqual(readiness.familyCount, 3, "family count");
  assertEqual(readiness.requiredFamilyCount, 3, "required families for resonant_mature");
  assertEqual(readiness.consentAnchorObserved, true, "consent anchor sealed by the care path");
  assert(!readiness.families.includes("standoff"), "readiness counted a standoff family");
});

await runCase("the same evidence cannot reach final_awakened — it needs a fourth family", () => {
  const { growth } = buildNonStandoffGrowth({ stage: "resonant_mature" });

  const readiness = evaluateCompanionGrowthReadiness({
    growth,
    companionId: COMPANION_ID,
    chapterNo: 6,
    profile: profile(2, 5)
  });

  assertEqual(readiness.targetStage, "final_awakened", "target stage");
  assertEqual(readiness.ready, false, "three live families still cannot open Stage 3");
  assertEqual(readiness.reason, "source_family_diversity_incomplete", "blocking reason");
  assertEqual(readiness.familyCount, 3, "families available without sealed reflection");
  assertEqual(readiness.requiredFamilyCount, 4, "required families for final_awakened");
});

await runCase("chapter gate still holds independently of family diversity", () => {
  const { growth } = buildNonStandoffGrowth();

  const tooEarly = evaluateCompanionGrowthReadiness({
    growth,
    companionId: COMPANION_ID,
    chapterNo: 1,
    profile: profile(2, 5)
  });

  assertEqual(tooEarly.ready, false, "chapter minimum must still gate readiness");
  assertEqual(tooEarly.reason, "chapter_minimum_not_met", "chapter reason");
});

report();

/**
 * Growth carrying one event from each live non-standoff family. The consent
 * anchor is sealed on the care event, mirroring
 * `companionGrowthController.js` where an accepted rewrite sets
 * `consentKind: "respected_rewrite"`.
 */
function buildNonStandoffGrowth({ stage = "initial_awakened" } = {}) {
  const events = [
    makeEvent({
      sourceType: "care",
      tendency: "attunement",
      context: { chapterNo: 1, originEventId: "care_non_standoff", practiceId: "listen" },
      consentKind: "respected_rewrite",
      createdAt: BASE_TIME + 1
    }),
    makeEvent({
      sourceType: "exploration",
      tendency: "pathfinding",
      context: { chapterNo: 1, nodeId: "moonlake_trail", choiceId: "read" },
      createdAt: BASE_TIME + 2
    }),
    makeEvent({
      // Mirrors buildChapterLifeEventGrowthInput() in chapterTrialEngine.js:
      // a chapter identity needs chapterNo + eventId + branchFamily.
      sourceType: "chapter",
      tendency: "steadfastness",
      context: { chapterNo: 1, eventId: "life_moonlake_still", branchFamily: "presence" },
      createdAt: BASE_TIME + 3
    })
  ];

  let growth = createGrowth({ stage });
  for (const event of events) {
    growth = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event }).growth;
  }

  const families = COMPANION_GROWTH_SOURCE_TYPES.filter(
    (sourceType) => growth.coverage.rootsBySourceType[sourceType].length > 0
  );
  return { growth, families };
}

function makeEvent({ sourceType, tendency, context, createdAt, consentKind = null }) {
  const result = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType,
    tendency,
    context,
    createdAt,
    completed: true,
    completionStatus: "completed",
    consentKind,
    parentEvent: null,
    safetyProvenance: sealGrowthSafetyProvenance({
      isHighRisk: false,
      strategyId: null,
      actionId: null,
      systemRoleSafetyReply: false,
      safetyModeActive: false,
      safeHarborModeActive: false
    })
  });
  if (!result.ok) throw new Error(`event creation failed: ${result.reason}`);
  return result.event;
}

function createGrowth({ stage = "initial_awakened" } = {}) {
  const targetStage = stage === "initial_awakened"
    ? "resonant_mature"
    : stage === "resonant_mature"
      ? "final_awakened"
      : null;
  return {
    stage,
    evidence: [],
    coverage: {
      targetStage,
      windowOpenedAt: BASE_TIME,
      rootsBySourceType: Object.fromEntries(
        COMPANION_GROWTH_SOURCE_TYPES.map((sourceType) => [sourceType, []])
      ),
      consentAnchorRootKey: null
    },
    consumedRootKeys: [],
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

function profile(resonantMinimum, finalMinimum) {
  return {
    minimumChapterByStage: {
      resonant_mature: resonantMinimum,
      final_awakened: finalMinimum
    }
  };
}

async function runCase(name, callback) {
  try {
    await callback();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error?.message || String(error) });
  }
}

function assert(condition, label) {
  if (!condition) throw new Error(label);
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

function report() {
  const failed = cases.filter((entry) => !entry.ok);
  for (const entry of cases) {
    console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : ` — ${entry.error}`}`);
  }
  console.log(`\nnon-standoff readiness: ${cases.length - failed.length}/${cases.length}`);
  if (failed.length > 0) process.exitCode = 1;
}
