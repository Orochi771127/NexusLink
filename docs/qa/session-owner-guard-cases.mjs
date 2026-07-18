import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  inspectSessionOwner,
  isSessionOwnerCurrent
} from "../../src/engine/sessionOwnerGuard.js";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const battleSource = readFileSync(`${repoRoot}/src/ui/battleController.js`, "utf8");
const expeditionSource = readFileSync(`${repoRoot}/src/ui/expeditionController.js`, "utf8");

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
}

function functionBody(source, functionName, nextFunctionName) {
  const start = source.indexOf(`function ${functionName}`);
  const end = source.indexOf(`function ${nextFunctionName}`, start + 1);
  assert.ok(start >= 0, `${functionName} must exist`);
  assert.ok(end > start, `${nextFunctionName} must follow ${functionName}`);
  return source.slice(start, end);
}

test("matching session owner is accepted", () => {
  const verdict = inspectSessionOwner(
    { companionId: "greyshade-cat" },
    { activeCompanionId: "greyshade-cat" }
  );
  assert.deepEqual(verdict, {
    ok: true,
    reason: "owner_current",
    sessionCompanionId: "greyshade-cat",
    activeCompanionId: "greyshade-cat"
  });
  assert.equal(isSessionOwnerCurrent(
    { companionId: "greyshade-cat" },
    { activeCompanionId: "greyshade-cat" }
  ), true);
});

test("different active companion fails closed", () => {
  const verdict = inspectSessionOwner(
    { companionId: "greyshade-cat" },
    { activeCompanionId: "blazetail-kit" }
  );
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reason, "companion_changed");
});

test("missing or malformed owner IDs fail closed", () => {
  assert.equal(inspectSessionOwner({}, { activeCompanionId: "greyshade-cat" }).reason, "missing_session_companion");
  assert.equal(inspectSessionOwner({ companionId: "greyshade-cat" }, {}).reason, "missing_active_companion");
  assert.equal(inspectSessionOwner(
    { companionId: " greyshade-cat " },
    { activeCompanionId: "greyshade-cat" }
  ).ok, false);
  assert.equal(inspectSessionOwner(
    { companionId: "unknown-companion" },
    { activeCompanionId: "unknown-companion" }
  ).ok, false);
});

test("battle settlement validates owner before summary or state mutation", () => {
  const body = functionBody(battleSource, "endStandoff", "render");
  const guardAt = body.indexOf("guardCurrentSessionOwner()");
  assert.ok(guardAt >= 0, "endStandoff must call owner guard");
  assert.ok(guardAt < body.indexOf("summarizeStandoffOutcome"));
  assert.ok(guardAt < body.indexOf("store.updateState"));
  assert.ok(guardAt < body.indexOf("buildEventReflection"));
  assert.ok(guardAt < body.indexOf("saveCurrentState"));
});

test("battle delayed noise turn validates owner before applying a turn", () => {
  const start = battleSource.indexOf("noiseTurnTimer = window.setTimeout");
  const end = battleSource.indexOf("}, NOISE_TURN_DELAY_MS)", start);
  const body = battleSource.slice(start, end);
  assert.ok(body.indexOf("guardCurrentSessionOwner()") >= 0);
  assert.ok(body.indexOf("guardCurrentSessionOwner()") < body.indexOf("applyNoiseTurn"));
});

test("battle mismatch abort only tears down UI state", () => {
  const body = functionBody(battleSource, "abortStandoffForOwnerMismatch", "guardCurrentSessionOwner");
  assert.match(body, /clearTimeout/);
  assert.match(body, /closePanel/);
  assert.doesNotMatch(body, /store\.updateState|addChat|saveCurrentState/);
});

test("expedition settlement validates owner before building or publishing settlement", () => {
  const body = functionBody(expeditionSource, "finishExpedition", "teardownScene");
  const guardAt = body.indexOf("guardCurrentSessionOwner(stateBefore)");
  assert.ok(guardAt >= 0, "finishExpedition must call owner guard");
  assert.ok(guardAt < body.indexOf("buildExpeditionSettlement"));
  assert.ok(guardAt < body.indexOf("store.updateState"));
  assert.ok(guardAt < body.indexOf("publishExpeditionSettlementVoice"));
  assert.ok(guardAt < body.indexOf("saveCurrentState"));
});

test("expedition update validates owner before simulation advances", () => {
  const body = functionBody(expeditionSource, "update", "isActive");
  assert.ok(body.indexOf("guardCurrentSessionOwner()") >= 0);
  assert.ok(body.indexOf("guardCurrentSessionOwner()") < body.indexOf("engine.tick"));
});

test("expedition mismatch abort only tears down the scene and UI", () => {
  const body = functionBody(expeditionSource, "abortExpeditionForOwnerMismatch", "guardCurrentSessionOwner");
  assert.match(body, /teardownScene/);
  assert.match(body, /expedition-active/);
  assert.doesNotMatch(body, /store\.updateState|addChat|saveCurrentState/);
});

const passed = results.filter((entry) => entry.ok).length;
const failed = results.length - passed;

for (const entry of results) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : `: ${entry.error}`}`);
}
console.log(`SESSION_OWNER_GUARD_SUMMARY ${passed}/${results.length}`);

if (failed > 0) process.exitCode = 1;
