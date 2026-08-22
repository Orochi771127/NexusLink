import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createChampionshipScreenStack } from "../../src/championship/presentation/createChampionshipScreenStack.js";
import { createChampionshipViewModel } from "../../src/championship/presentation/createChampionshipViewModel.js";
import { createChampionshipInitialState } from "../../src/championship/core/championshipReducer.js";

const catalog = JSON.parse(fs.readFileSync(new URL("../../src/data/championship/fixtures/championship-r1-content.json", import.meta.url), "utf8"));
const profile = { activeCompanionId: "greyshade-cat", unlockedCompanionIds: ["greyshade-cat"], locale: "en", reducedMotion: false, presentationRefs: {}, sourceDigest: "fixture" };

test("screen stack has one authoritative top and deterministic replacement", () => {
  const stack = createChampionshipScreenStack();
  assert.equal(stack.top(), null);
  stack.replace("HEARTLAKE_PROFILE");
  stack.push("PAUSE_MODAL");
  assert.deepEqual(stack.snapshot(), ["HEARTLAKE_PROFILE", "PAUSE_MODAL"]);
  assert.equal(stack.pop(), "PAUSE_MODAL");
  assert.equal(stack.top(), "HEARTLAKE_PROFILE");
  stack.replace("GATE_SELECT");
  assert.deepEqual(stack.snapshot(), ["GATE_SELECT"]);
  stack.clear();
  assert.deepEqual(stack.snapshot(), []);
});

test("view model exposes phase-specific semantic controls and never persistence controls", () => {
  const base = createChampionshipInitialState({ profile, catalog, seed: 1, sessionId: "presentation-r1" });
  const phases = ["HEARTLAKE_PROFILE", "GATE_SELECT", "HUNT_FIELD", "WILD_ENCOUNTER", "CAPTURE", "COLLECTION", "SHOP", "ARENA", "BATTLE_RESULT", "COMPLETE"];
  for (const phase of phases) {
    const state = structuredClone(base);
    state.session.phase = phase;
    if (phase === "HUNT_FIELD") {
      const definition = catalog.battleFields[0];
      state.hunt.field = { ...structuredClone(definition), fieldId: definition.battleFieldId, ...structuredClone(definition.topologyRule.value) };
      state.hunt.hunterPosition = structuredClone(definition.topologyRule.value.playerStart);
    }
    if (phase === "WILD_ENCOUNTER" || phase === "CAPTURE") state.hunt.encounter = { status: "AVAILABLE" };
    if (phase === "BATTLE_RESULT") state.arena.battleResult = { outcome: "PLAYER_WIN" };
    const model = createChampionshipViewModel(state, catalog);
    assert.equal(model.phase, phase);
    assert.doesNotMatch(JSON.stringify(model.actions), /save|persist|reward|rank|badge/i);
  }
  const hunt = structuredClone(base);
  hunt.session.phase = "HUNT_FIELD";
  const definition = catalog.battleFields[0];
  hunt.hunt.field = { ...structuredClone(definition), fieldId: definition.battleFieldId, ...structuredClone(definition.topologyRule.value) };
  hunt.hunt.hunterPosition = structuredClone(definition.topologyRule.value.playerStart);
  assert.deepEqual(createChampionshipViewModel(hunt, catalog).actions.map((entry) => entry.payload.direction), ["up", "left", "down", "right"]);
});

test("presentation contract keeps DOM authoritative and Pixi decorative", () => {
  const dom = fs.readFileSync(new URL("../../src/championship/presentation/createChampionshipDomRenderer.js", import.meta.url), "utf8");
  const pixi = fs.readFileSync(new URL("../../src/championship/presentation/createChampionshipPixiPresenter.js", import.meta.url), "utf8");
  const input = fs.readFileSync(new URL("../../src/championship/presentation/createChampionshipInputAdapter.js", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../../research/championship-r1/styles.css", import.meta.url), "utf8");
  assert.match(dom, /aria-live/);
  assert.match(dom, /button/);
  assert.match(pixi, /aria-hidden/);
  assert.match(pixi, /webglcontextlost/);
  assert.doesNotMatch(pixi, /dispatch\s*\(/);
  assert.match(input, /event\.repeat/);
  assert.match(input, /gamepadDirectionLatch/);
  assert.match(css, /env\(safe-area-inset-/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-height:\s*3rem/);
  assert.doesNotMatch(css, /body\s*\{[^}]*min-width/s);
});
