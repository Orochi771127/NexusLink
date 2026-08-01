import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../../src/ui/codexController.js", import.meta.url),
  "utf8"
);

const cases = [
  ["Codex reads the canonical lived-path projection", () => {
    assert.match(source, /import \{ projectCodexLivedPaths \}/);
    assert.match(source, /projectCodexLivedPaths\(\{ state, companionId \}\)/);
  }],
  ["projection stays scoped to the selected companion record", () => {
    assert.doesNotMatch(source, /activeCompanionId.*projectCodexLivedPaths/);
  }],
  ["UI renders only qualitative source and tendency fields", () => {
    assert.match(source, /echo\.sourceType/);
    assert.match(source, /echo\.tendencyId/);
    assert.doesNotMatch(source, /echo\.(?:sourceId|rootContextKey|memoryId|traceId|createdAt)/);
  }],
  ["UI explicitly refuses completion and optimization framing", () => {
    assert.match(source, /不顯示完成率、門檻或最佳路線/);
    assert.match(source, /不是待辦清單，也不需要追趕/);
  }],
  ["lived paths do not establish unlock or runtime eligibility", () => {
    const projectionIndex = source.indexOf("projectCodexLivedPaths({ state, companionId })");
    const unlockIndex = source.indexOf("getCompanionRuntimeEligibility(companion, state)");
    assert.ok(projectionIndex >= 0 && unlockIndex >= 0);
    assert.doesNotMatch(source, /livedPaths\.(?:isUnlocked|eligible|ready|readiness|reward)/);
  }],
  ["quiet state reveals no missing count or threshold", () => {
    assert.doesNotMatch(source, /livedPaths\.(?:percent|percentage|remaining|missing|required|threshold|count)/);
    assert.match(source, /livedPaths\.pathEchoes\.length > 0/);
  }],
  ["Codex projection remains read-only", () => {
    const detailSection = source.slice(
      source.indexOf("function renderDetail"),
      source.indexOf("function renderCanonDetail")
    );
    assert.doesNotMatch(detailSection, /store\.(?:updateState|replaceState)|saveCurrentState|writeIntoDraft/);
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
