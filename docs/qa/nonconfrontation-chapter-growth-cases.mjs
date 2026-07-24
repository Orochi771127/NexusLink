/**
 * Pack B — Non-confrontation chapter growth (life-event trial path)
 * Run: node docs/qa/nonconfrontation-chapter-growth-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function ok(name) {
  console.log(`PASS  ${name}`);
}

const {
  isChapterLifeEventNode,
  resolveChapterTrialAdvance,
  resolveChapterLifeEventAdvance,
  applyChapterTrialAdvance,
  buildChapterLifeEventGrowthInput,
  buildChapterAdvanceLine
} = await import(pathToFileURL(path.join(repoRoot, "src/engine/chapterTrialEngine.js")).href);

const { createCompletedGrowthEvent } = await import(
  pathToFileURL(path.join(repoRoot, "src/engine/companionGrowthEngine.js")).href
);

assert.equal(isChapterLifeEventNode({ id: "x", eventType: "reflective" }), true);
assert.equal(isChapterLifeEventNode({ id: "x", eventType: "peaceful" }), true);
assert.equal(isChapterLifeEventNode({ id: "x", eventType: "discovery" }), true);
assert.equal(isChapterLifeEventNode({ id: "x", eventType: "danger" }), false);
assert.equal(isChapterLifeEventNode({ id: "x", eventType: "rest" }), false);
ok("life-event node types");

const progressCh1 = { current: 1, completed: [] };
const advanceMist = resolveChapterLifeEventAdvance(
  progressCh1,
  { id: "misttide_shore", eventType: "reflective" },
  { encounter: false }
);
assert.ok(advanceMist?.from?.chapter === 1);
assert.ok(advanceMist?.to?.chapter === 2);

const blockedEncounter = resolveChapterLifeEventAdvance(
  progressCh1,
  { id: "misttide_shore", eventType: "reflective" },
  { encounter: true }
);
assert.equal(blockedEncounter, null);

const wrongChapter = resolveChapterLifeEventAdvance(
  { current: 2, completed: [1] },
  { id: "misttide_shore", eventType: "reflective" },
  { encounter: false }
);
assert.equal(wrongChapter, null);

const alreadyDone = resolveChapterLifeEventAdvance(
  { current: 1, completed: [1] },
  { id: "misttide_shore", eventType: "reflective" },
  { encounter: false }
);
assert.equal(alreadyDone, null);
ok("life-event advance anti-farm matches standoff rules");

const after = applyChapterTrialAdvance(progressCh1, advanceMist);
assert.deepEqual(after, { current: 2, completed: [1] });
const standoffSame = resolveChapterTrialAdvance(after, "rift_observatory");
assert.equal(standoffSame, null, "standoff cannot re-advance completed chapter");
ok("standoff and life-event share completed gate");

const growthInput = buildChapterLifeEventGrowthInput({
  companionId: "greyshade-cat",
  node: { id: "harbor_quayside", eventType: "reflective" },
  chapterNo: 4,
  createdAt: 1_700_000_000_000
});
assert.equal(growthInput.sourceType, "chapter");
assert.equal(growthInput.tendency, "attunement");
assert.equal(growthInput.context.eventId, "life_harbor_quayside");
assert.equal(growthInput.context.branchFamily, "reflective");
const created = createCompletedGrowthEvent(growthInput);
assert.equal(created.ok, true, created.reason);
ok("chapter growth evidence identity validates");

assert.match(buildChapterAdvanceLine(advanceMist), /【旅程】/);
ok("advance line remains quiet journey copy");

const mapSrc = fs.readFileSync(path.join(repoRoot, "src/ui/mapController.js"), "utf8");
assert.match(mapSrc, /resolveChapterLifeEventAdvance/);
assert.match(mapSrc, /buildChapterLifeEventGrowthInput/);
assert.match(mapSrc, /applyChapterTrialAdvance/);
ok("mapController wires life-event path");

const battleSrc = fs.readFileSync(path.join(repoRoot, "src/ui/battleController.js"), "utf8");
assert.match(battleSrc, /resolveChapterTrialAdvance/);
assert.match(battleSrc, /applyChapterTrialAdvance/);
assert.doesNotMatch(battleSrc, /function buildChapterAdvanceLine/);
ok("battleController uses shared trial engine");

console.log("\nAll non-confrontation chapter growth cases passed.");
