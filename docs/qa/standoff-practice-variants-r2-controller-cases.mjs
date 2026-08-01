import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const controllerSource = await readFile(
  new URL("../../src/ui/battleController.js", import.meta.url),
  "utf8"
);

const cases = [
  ["controller imports the pure practice authority", () => {
    assert.match(controllerSource, /applyStandoffPracticeVariant/);
    assert.match(controllerSource, /advanceStandoffPracticeIntent/);
    assert.match(controllerSource, /listAvailableStandoffPracticeVariants/);
  }],
  ["practice choices are derived from the existing cleared node", () => {
    assert.match(
      controllerSource,
      /listAvailableStandoffPracticeVariants\(\s*state,\s*pendingBattle\.nodeId\s*\)/
    );
  }],
  ["solo witness clears explicit invitations before session creation", () => {
    assert.match(controllerSource, /choice\.id === "solo_witness"\) selectedInviteIds = \[\]/);
  }],
  ["inviting a supporter after solo witness explicitly returns to standard", () => {
    const preparationSection = controllerSource.slice(
      controllerSource.indexOf("function renderPreparation"),
      controllerSource.indexOf("function clearPreparationState")
    );
    assert.match(
      preparationSection,
      /selectedPracticeVariantId === "solo_witness"\) selectedPracticeVariantId = null/
    );
  }],
  ["shared breath cannot be selected without a participating supporter", () => {
    assert.match(controllerSource, /choice\.id === "shared_breath" && !hasParticipatingSupport/);
    assert.match(controllerSource, /selectedPracticeVariantId === "shared_breath" && !hasParticipatingSupport/);
  }],
  ["the engine transforms the existing battle session rather than creating a stage", () => {
    assert.match(controllerSource, /applyStandoffPracticeVariant\(session,/);
    assert.doesNotMatch(controllerSource, /practiceStageId|recordPracticeStage|unlockPractice/);
  }],
  ["practice validation failure aborts instead of falling through to standard settlement", () => {
    const beginSection = controllerSource.slice(
      controllerSource.indexOf("function beginBattle"),
      controllerSource.indexOf("function handleAction")
    );
    assert.match(beginSection, /if \(!practiceResult\.ok\)/);
    assert.match(beginSection, /session\s*=\s*null/);
    assert.match(beginSection, /panelManager\.closePanel\(\{ force: true \}\)/);
    assert.match(beginSection, /return false/);
    assert.doesNotMatch(beginSection, /if \(practiceResult\.ok\) session = practiceResult\.session/);
  }],
  ["cross current advances only after the existing noise turn returns control", () => {
    const noiseSection = controllerSource.slice(
      controllerSource.indexOf("function scheduleNoiseTurn"),
      controllerSource.indexOf("function snapshotCircleBreath")
    );
    assert.match(noiseSection, /session = applyNoiseTurn\(session, rng\)/);
    assert.match(noiseSection, /session\.turn === "player"/);
    assert.match(noiseSection, /advanceStandoffPracticeIntent\(session\)/);
  }],
  ["practice settlement cannot write state, save, reward, memory, or Growth", () => {
    const settlementSection = controllerSource.slice(
      controllerSource.indexOf("function endStandoff"),
      controllerSource.indexOf("function render()")
    );
    assert.match(settlementSection, /const practiceOnly = session\.practiceVariant\?\.sessionOnly === true/);
    assert.match(settlementSection, /const persistenceExcluded = safetyTerminal \|\| practiceOnly/);
    assert.match(settlementSection, /if \(!persistenceExcluded\) store\.updateState/);
    assert.match(settlementSection, /if \(!persistenceExcluded\) saveCurrentState\?\.\(\)/);
  }],
  ["the preparation copy states the zero-persistence contract", () => {
    assert.match(controllerSource, /不寫入關係、記憶或成長/);
    assert.match(controllerSource, /沒有獎勵，也不寫入關係、記憶、進度或成長/);
  }]
];

let passed = 0;
for (const [name, run] of cases) {
  try {
    await run();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    console.error(error);
  }
}

console.log(`\n${passed}/${cases.length} cases passed`);
if (passed !== cases.length) process.exitCode = 1;
