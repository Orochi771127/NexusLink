import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { createResonanceWeaveController } = await import("../../src/ui/resonanceWeaveController.js");
const controllerSource = await readFile(
  new URL("../../src/ui/resonanceWeaveController.js", import.meta.url),
  "utf8"
);
const actionSource = await readFile(
  new URL("../../src/ui/actionSheetController.js", import.meta.url),
  "utf8"
);
const appSource = await readFile(new URL("../../src/app.js", import.meta.url), "utf8");
const cases = [];

runCase("controller exports a focused session-only UI factory", () => {
  assert.equal(typeof createResonanceWeaveController, "function");
  const importBlock = controllerSource.slice(0, controllerSource.indexOf("const PHASE_PRESENTATION"));
  assert.match(importBlock, /from "\.\.\/engine\/resonanceWeaveEngine\.js"/);
  assert.doesNotMatch(importBlock, /state\/|saveManager|store|Growth|reward/i);
});

runCase("preview, replay, and exit stay outside persistence and progression APIs", () => {
  assert.doesNotMatch(controllerSource, /store\.|saveCurrentState|saveCandidateState|localStorage|sessionStorage/);
  assert.doesNotMatch(controllerSource, /writeCarePractice|writeGrowth|bond\s*[+\-]?=|trust\s*[+\-]?=/);
  assert.match(controllerSource, /timerCount:\s*0/);
  assert.match(controllerSource, /permanentWriteCount:\s*0/);
});

runCase("all four ecology phases are always-present 48px controls", () => {
  for (const phaseId of ["dawn", "day", "dusk", "night"]) {
    assert.match(controllerSource, new RegExp(`${phaseId}:\\s*Object\\.freeze`));
  }
  assert.match(controllerSource, /RESonance/i, "source should retain Resonance naming");
  assert.match(controllerSource, /aria-pressed/);
  assert.match(controllerSource, /內容與回報相同/);
  assert.match(controllerSource, /min-block-size:\s*48px/);
  assert.match(appSource, /setTimePhase:\s*setSceneTimePhaseOverride/);
  assert.match(appSource, /getTimePhase:\s*\(\)\s*=>\s*getEnvironmentState\(\)\.sceneTimePhase/);
});

runCase("mouse, touch, and pen share Pointer Events without selecting a companion", () => {
  for (const eventName of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) {
    assert.match(controllerSource, new RegExp(`addEventListener\\("${eventName}"`));
  }
  assert.match(controllerSource, /targetType:\s*"environment"/);
  assert.match(controllerSource, /data-weave-knot/);
  assert.doesNotMatch(controllerSource, /createElement(?:NS)?\([^\n]+companion/i);
  assert.match(controllerSource, /companionTargetCount:\s*0/);
});

runCase("keyboard can focus and complete every semantic step", () => {
  assert.match(controllerSource, /focus_previous/);
  assert.match(controllerSource, /focus_next/);
  assert.match(controllerSource, /drag_against_current/);
  assert.match(controllerSource, /event\.key\s*===\s*"Enter"/);
  assert.match(controllerSource, /event\.key\s*===\s*" "/);
  assert.match(controllerSource, /ArrowRight/);
  assert.match(controllerSource, /ArrowLeft/);
  assert.match(controllerSource, /aria-describedby/);
  assert.match(controllerSource, /aria-live/);
});

runCase("reduced motion removes displacement animation without changing event order", () => {
  assert.match(controllerSource, /reducedMotion:\s*Boolean\(isReducedMotion\?\.\(\)\)/);
  assert.match(controllerSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(controllerSource, /animation:\s*none\s*!important/);
  assert.match(controllerSource, /transition:\s*none\s*!important/);
});

runCase("Action Sheet exposes the weave only after the existing Moonlake practice gate", () => {
  const handler = section(actionSource, "  function handleHabitatPracticeEvent(", "  function openHabitatPractice(");
  assert.match(handler, /state\.safeHarborMode\s*===\s*true/);
  assert.match(handler, /state\.activeHabitatId\s*!==\s*"moonlake"/);
  assert.match(handler, /firstLoop\.completedAt\s*\|\|\s*firstLoop\.skippedAt/);
  const render = section(actionSource, "  function renderHabitatPractice(", "  function openResonanceWeave(");
  assert.match(render, /整理一段環境微光/);
  const open = section(actionSource, "  function openResonanceWeave(", "  function createPracticeButton(");
  assert.match(open, /state\.safeHarborMode\s*===\s*true/);
  assert.match(open, /resonanceWeaveController\.open/);
  assert.match(open, /companionId:\s*invitation\.companionId/);
  assert.match(open, /這不是捕捉/);
});

runCase("panel close and route replacement tear down the UI without global listeners", () => {
  assert.match(actionSource, /registerOnClose\("actionSheet"/);
  assert.match(actionSource, /resonanceWeaveController\?\.destroy\?\.\(\)/);
  assert.match(controllerSource, /if \(root\?\.isConnected\) root\.remove\(\)/);
  assert.doesNotMatch(controllerSource, /window\.addEventListener|document\.addEventListener/);
});

runCase("short mobile, text scaling, and overflow constraints are encoded in the component", () => {
  assert.match(controllerSource, /inline-size:\s*min\(100%,\s*680px\)/);
  assert.match(controllerSource, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(controllerSource, /overflow-wrap:\s*anywhere/);
  assert.match(controllerSource, /@media \(max-height:\s*700px\)/);
  assert.doesNotMatch(controllerSource, /min-inline-size:\s*[1-9]\d{2,}px/);
});

report();

function section(fullSource, startMarker, endMarker) {
  const start = fullSource.indexOf(startMarker);
  assert.notEqual(start, -1, `missing source marker: ${startMarker}`);
  const end = fullSource.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing source marker: ${endMarker}`);
  return fullSource.slice(start, end);
}

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error });
  }
}

function report() {
  const failed = cases.filter(({ ok }) => !ok);
  for (const testCase of cases) {
    console.log(`${testCase.ok ? "PASS" : "FAIL"}  ${testCase.name}`);
    if (!testCase.ok) console.error(`      ${testCase.error?.stack || testCase.error}`);
  }
  console.log(`\n${cases.length - failed.length}/${cases.length} cases passed`);
  if (failed.length) process.exitCode = 1;
}
