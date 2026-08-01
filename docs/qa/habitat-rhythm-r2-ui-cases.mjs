import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  deriveHabitatPracticeInvitation,
  projectHabitatPracticeResult
} from "../../src/engine/habitatRhythmEngine.js";

const { createActionSheetController } = await import("../../src/ui/actionSheetController.js");
const actionSource = await readFile(new URL("../../src/ui/actionSheetController.js", import.meta.url), "utf8");
const appSource = await readFile(new URL("../../src/app.js", import.meta.url), "utf8");
const cases = [];

const BASE_STATE = Object.freeze({
  activeCompanionId: "greyshade-cat",
  activeHabitatId: "moonlake",
  energy: 6,
  touchFatigue: 0,
  mood: "calm",
  lastTouchReaction: "accept",
  safeHarborMode: false,
  chapterProgress: Object.freeze({ current: 3 }),
  onboarding: Object.freeze({ firstLoop: Object.freeze({ completedAt: 100 }) })
});

runCase("action-sheet controller and habitat projection modules import", () => {
  assert.equal(typeof createActionSheetController, "function");
  assert.equal(typeof deriveHabitatPracticeInvitation, "function");
  assert.equal(typeof projectHabitatPracticeResult, "function");
});

runCase("hotspot entry requires an interaction id, tap event, Moonlake, and post-first-loop state", () => {
  const handler = section(actionSource, "  function handleHabitatPracticeEvent(", "  function openHabitatPractice(");
  assert.match(handler, /event\?\.interactionId/);
  assert.match(handler, /endsWith\("_tap"\)/);
  assert.match(handler, /state\.activeHabitatId\s*!==\s*"moonlake"/);
  assert.match(handler, /firstLoop\.completedAt\s*\|\|\s*firstLoop\.skippedAt/);
  assert.match(handler, /state\.safeHarborMode\s*===\s*true/);
  assert.match(handler, /hotspotId:\s*event\.interactionId/);
});

runCase("Moonlake emits the environment identity needed by the practice projection", () => {
  const eventIndex = appSource.indexOf("type: `${interaction.type}_tap`");
  assert.notEqual(eventIndex, -1, "missing Moonlake tap event");
  const eventBlock = appSource.slice(eventIndex, eventIndex + 520);
  assert.match(eventBlock, /interactionId:\s*interaction\.id/);
  assert.match(eventBlock, /timePhaseId:\s*getEnvironmentState\(\)\.sceneTimePhase/);
  assert.match(eventBlock, /weatherId:\s*getHabitatWeather\(\)/);
  assert.match(eventBlock, /EventBus\.emit\(ENVIRONMENT_INTERACTION_EVENT, event\)/);
});

runCase("the existing Heart Phase matrix produces all four canonical outcomes", () => {
  const fixtures = [
    [{ ...BASE_STATE, mood: "calm" }, "water", "accept"],
    [{ ...BASE_STATE, mood: "defensive" }, "water", "modify"],
    [{ ...BASE_STATE, energy: 2 }, "quiet-ground", "rest"],
    [{ ...BASE_STATE, mood: "defensive" }, "crystal", "decline"]
  ];
  for (const [state, hotspotType, expectedOutcome] of fixtures) {
    const projected = deriveHabitatPracticeInvitation({
      state,
      environment: { chapterNo: 3, hotspotId: `${hotspotType}-integration` },
      hotspotType
    });
    assert.equal(projected.ok, true, expectedOutcome);
    assert.equal(projected.invitation.outcomeId, expectedOutcome);
  }
});

runCase("UI exposes completion only for accept or an explicitly accepted rewrite", () => {
  const renderSection = section(actionSource, "  function renderHabitatPractice(", "  function createPracticeButton(");
  assert.match(renderSection, /invitation\.outcomeId\s*===\s*"accept"/);
  assert.match(renderSection, /completeHabitatPractice\(null\)/);
  assert.match(renderSection, /invitation\.outcomeId\s*===\s*"modify"/);
  assert.match(renderSection, /completeHabitatPractice\("accept"\)/);
  assert.match(renderSection, /completeHabitatPractice\("defer"\)/);
  assert.match(renderSection, /invitation\.outcomeId\s*===\s*"rest"\s*\|\|\s*invitation\.outcomeId\s*===\s*"decline"/);
});

runCase("only accept and accepted rewrite can reach the care evidence writer", () => {
  const guarded = { ...BASE_STATE, mood: "defensive" };
  const invitation = invite(guarded, "water");
  const pending = projectHabitatPracticeResult({ state: guarded, invitation });
  const deferred = projectHabitatPracticeResult({ state: guarded, invitation, rewriteDecision: "defer" });
  const accepted = projectHabitatPracticeResult({ state: guarded, invitation, rewriteDecision: "accept" });
  assert.equal(pending.result.completed, false);
  assert.equal(deferred.result.completed, false);
  assert.equal(accepted.result.completed, true);

  const acceptedDirectly = projectHabitatPracticeResult({
    state: BASE_STATE,
    invitation: invite(BASE_STATE, "water")
  });
  assert.equal(acceptedDirectly.result.completed, true);

  const completeSection = section(actionSource, "  async function completeHabitatPractice(", "  function ensureHabitatPracticeStyles(");
  assertOrdered(completeSection, [
    "if (!result.completed)",
    "const candidateState = cloneState(store.getState())",
    "writeCarePracticeIntoDraft",
    "await saveCandidateState?.(candidateState)",
    "store.replaceState(candidateState)"
  ]);
});

runCase("care integration is candidate-first and rolls back by omission on save failure", () => {
  const completeSection = section(actionSource, "  async function completeHabitatPractice(", "  function ensureHabitatPracticeStyles(");
  assert.match(completeSection, /const candidateState\s*=\s*cloneState\(store\.getState\(\)\)/);
  assert.match(completeSection, /writeCarePracticeIntoDraft\?\.\(candidateState/);
  assert.match(completeSection, /const saveResult\s*=\s*await saveCandidateState\?\.\(candidateState\)/);
  assert.match(completeSection, /if \(saveResult\?\.ok\s*!==\s*true\)[\s\S]*?return;/);
  assert.match(completeSection, /store\.replaceState\(candidateState\)/);
  assert.equal(
    completeSection.indexOf("store.replaceState(candidateState)")
      > completeSection.indexOf("if (saveResult?.ok !== true)"),
    true,
    "replacement must occur only after the successful-save guard"
  );
});

runCase("safeHarbor blocks invitation and completion before any evidence or persistence", () => {
  const safeState = { ...BASE_STATE, safeHarborMode: true };
  const projection = deriveHabitatPracticeInvitation({ state: safeState, hotspotType: "water" });
  assert.equal(projection.ok, false);
  assert.equal(projection.reason, "safety-paused");

  const handler = section(actionSource, "  function handleHabitatPracticeEvent(", "  function openHabitatPractice(");
  assert.match(handler, /state\.safeHarborMode\s*===\s*true/);
  const completeSection = section(actionSource, "  async function completeHabitatPractice(", "  function ensureHabitatPracticeStyles(");
  assertOrdered(completeSection, [
    "projectHabitatPracticeResult",
    "if (!projected.ok || !projected.result)",
    "writeCarePracticeIntoDraft"
  ]);
});

runCase("P2 integration does not directly write bond, trust, or generic state rewards", () => {
  const p2Scope = section(actionSource, "  function handleHabitatPracticeEvent(", "  function ensureHabitatPracticeStyles(");
  assert.doesNotMatch(p2Scope, /\b(?:candidateState|result|writeResult)\.(?:bond|trust)\b/);
  assert.doesNotMatch(p2Scope, /\b(?:bond|trust)\s*[+\-]?=/);
  assert.doesNotMatch(p2Scope, /store\.updateState|saveCurrentState/);
  assert.match(p2Scope, /writeCarePracticeIntoDraft/);
});

runCase("projected practice remains session-only and does not mutate relationship state", () => {
  const state = {
    ...BASE_STATE,
    relationship: { bond: 41, trust: 62 },
    companionStates: {
      byId: {
        "greyshade-cat": {
          companionId: "greyshade-cat",
          relationship: { bond: 41, trust: 62, mood: "calm", energy: 6, touchFatigue: 0 }
        }
      }
    }
  };
  const before = structuredClone(state);
  const result = projectHabitatPracticeResult({ state, invitation: invite(state, "water") });
  assert.equal(result.ok, true);
  assert.equal(result.result.sessionOnly, true);
  assert.deepEqual(state, before);
});

report();

function invite(state, hotspotType) {
  const output = deriveHabitatPracticeInvitation({
    state,
    environment: { chapterNo: state.chapterProgress?.current || 3 },
    hotspotType
  });
  assert.equal(output.ok, true);
  return output.invitation;
}

function section(fullSource, startMarker, endMarker) {
  const start = fullSource.indexOf(startMarker);
  assert.notEqual(start, -1, `missing source marker: ${startMarker}`);
  const end = fullSource.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing source marker: ${endMarker}`);
  return fullSource.slice(start, end);
}

function assertOrdered(text, markers) {
  let previous = -1;
  for (const marker of markers) {
    const current = text.indexOf(marker);
    assert.notEqual(current, -1, `missing ordered marker: ${marker}`);
    assert.equal(current > previous, true, `out-of-order marker: ${marker}`);
    previous = current;
  }
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
