/**
 * TP-WORLD-BARK-AND-DIALOGUE-DIRECTOR-R1 — DialogueDirector + world grounding
 * Run: node docs/qa/dialogue-director-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const load = (rel) => import(pathToFileURL(path.join(repoRoot, rel)).href);

let passed = 0;
function ok(name) {
  console.log(`PASS  ${name}`);
  passed += 1;
}

const { DIALOGUE_MODES, DIALOGUE_DIRECTOR_BLOCKS, selectDialogueDirection } =
  await load("src/ai/dialogue/dialogueDirector.js");
const { buildWorldGrounding, listGroundedFields, hasAnyGrounding, GROUNDING_FIELDS } =
  await load("src/ai/worldAutonomy/worldObservationGrounding.js");
const { WORLD_AVAILABILITY } = await load("src/ai/worldAutonomy/worldStateAdapter.js");

const groundedState = { energy: 8, activeHabitatId: "moonlake" };
const groundedEnv = { sceneTimePhase: "night" };
const groundedTick = { statePatch: { actionId: "rest_at_spot" }, lastCompletedActionId: "wander_safe_area" };

const grounding = buildWorldGrounding({
  state: groundedState,
  environment: groundedEnv,
  worldTick: groundedTick
});
const emptyGrounding = buildWorldGrounding({ state: {}, environment: null, worldTick: null });

const plainNlu = {
  topic: "daily_life",
  dialogueAct: "describing_event",
  nuances: [],
  semanticFrame: { topic: "daily_life", constraints: [], specificDetail: { text: "今天下班很晚" } }
};

// ------------------------------------------------------------------ grounding

{
  assert.equal(grounding.timeOfDay, "night");
  assert.equal(grounding.habitatId, "moonlake");
  assert.equal(grounding.companionEnergy, "high");
  assert.equal(grounding.currentWorldAction, "rest_at_spot");
  assert.equal(grounding.lastCompletedWorldAction, "wander_safe_area");
  // No canonical source exists for these two yet — they must stay unavailable.
  assert.equal(grounding.weather, null);
  assert.equal(grounding.availability.weather, WORLD_AVAILABILITY.UNAVAILABLE);
  assert.equal(grounding.nearbyInteractableSummary, null);
  assert.equal(grounding.availability.nearbyInteractableSummary, WORLD_AVAILABILITY.UNAVAILABLE);
  ok("grounding reports real fields and marks the rest unavailable");
}

{
  const invented = buildWorldGrounding({
    state: { activeHabitatId: "not_a_place", energy: "banana" },
    environment: { sceneTimePhase: "eclipse", weatherId: "meteors" },
    worldTick: { statePatch: { actionId: "idle" } }
  });
  for (const field of GROUNDING_FIELDS) {
    assert.equal(invented[field], null, `${field} must not be invented from junk input`);
    assert.equal(invented.availability[field], WORLD_AVAILABILITY.UNAVAILABLE);
  }
  assert.equal(hasAnyGrounding(invented), false);
  ok("grounding never invents world information from unknown values");
}

{
  const before = JSON.stringify({ groundedState, groundedEnv, groundedTick });
  buildWorldGrounding({ state: groundedState, environment: groundedEnv, worldTick: groundedTick });
  assert.equal(JSON.stringify({ groundedState, groundedEnv, groundedTick }), before);
  ok("grounding does not mutate its inputs");
}

// ------------------------------------------------------------------- director

{
  const args = { nlu: plainNlu, worldGrounding: grounding, recentModes: [], seed: 5 };
  const a = selectDialogueDirection(args);
  const b = selectDialogueDirection(args);
  assert.equal(a.mode, b.mode, "same input must yield the same mode");
  assert.deepEqual([...a.groundingRefs], [...b.groundingRefs]);
  ok("deterministic: same input yields the same dialogue mode");
}

{
  const state = { nlu: plainNlu, worldGrounding: grounding, recentModes: ["follow"], seed: 2 };
  const before = JSON.stringify(state);
  selectDialogueDirection(state);
  assert.equal(JSON.stringify(state), before, "director must not mutate its inputs");
  ok("director does not mutate input state");
}

{
  const result = selectDialogueDirection({
    nlu: plainNlu,
    worldGrounding: emptyGrounding,
    recentModes: [],
    seed: 0
  });
  assert.equal(result.allowWorldTopic, false);
  assert.ok(result.blocks.includes(DIALOGUE_DIRECTOR_BLOCKS.NO_WORLD_GROUNDING));
  assert.ok(
    [DIALOGUE_MODES.QUESTION, DIALOGUE_MODES.FOLLOW].includes(result.mode),
    `expected a safe degrade, got ${result.mode}`
  );
  assert.deepEqual([...result.groundingRefs], []);
  ok("missing worldObservation degrades safely to a non-world mode");
}

{
  // Walk several turns; the same mode may never appear twice in a row.
  let recent = [];
  const seen = [];
  for (let turn = 0; turn < 8; turn += 1) {
    const result = selectDialogueDirection({
      nlu: plainNlu,
      worldGrounding: grounding,
      recentModes: recent,
      seed: turn
    });
    seen.push(result.mode);
    recent = [result.mode, ...recent].slice(0, 4);
  }
  for (let i = 1; i < seen.length; i += 1) {
    assert.notEqual(seen[i], seen[i - 1], `mode repeated on consecutive turns: ${seen.join(" → ")}`);
  }
  const questionTurns = seen.filter((mode) => mode === DIALOGUE_MODES.QUESTION).length;
  assert.ok(questionTurns < seen.length, "must not ask a question every turn");
  for (let i = 1; i < seen.length; i += 1) {
    if (seen[i] === DIALOGUE_MODES.QUESTION) {
      assert.notEqual(seen[i - 1], DIALOGUE_MODES.QUESTION);
    }
  }
  ok(`no consecutive duplicate mode and not a question every turn (${seen.join(" → ")})`);
}

{
  const blocked = selectDialogueDirection({
    nlu: plainNlu,
    worldGrounding: grounding,
    recentModes: ["question", "follow"],
    seed: 0
  });
  assert.equal(blocked.allowQuestion, false);
  assert.ok(blocked.blocks.includes(DIALOGUE_DIRECTOR_BLOCKS.QUESTION_RATE_LIMIT));
  assert.notEqual(blocked.mode, DIALOGUE_MODES.QUESTION);
  ok("a question in either of the last two turns blocks another question");
}

{
  const unanchored = selectDialogueDirection({
    nlu: { topic: "unknown", nuances: [], semanticFrame: { topic: "unknown", constraints: [] } },
    worldGrounding: grounding,
    recentModes: [],
    seed: 1
  });
  assert.equal(unanchored.allowQuestion, false);
  assert.ok(unanchored.blocks.includes(DIALOGUE_DIRECTOR_BLOCKS.QUESTION_NOT_GROUNDED));
  ok("a question needs an anchor in what the player actually said");
}

{
  for (const [label, safety, nlu] of [
    ["high risk", { isHighRisk: true }, plainNlu],
    ["boundary pressure", { isBoundaryPressure: true }, plainNlu],
    ["dependency pressure", {}, { ...plainNlu, dialogueAct: "dependency_pressure" }]
  ]) {
    const result = selectDialogueDirection({
      nlu,
      safety,
      worldGrounding: grounding,
      recentModes: [],
      seed: 3
    });
    assert.equal(result.mode, DIALOGUE_MODES.FOLLOW, `${label} must stay with the player`);
    assert.equal(result.allowWorldTopic, false, `${label} must not be diluted by world chatter`);
    assert.equal(result.allowQuestion, false);
    assert.deepEqual([...result.groundingRefs], []);
  }
  ok("safety / boundary turns are never diluted by world topics");
}

{
  const closed = selectDialogueDirection({
    nlu: { ...plainNlu, dialogueAct: "requesting_silence" },
    worldGrounding: grounding,
    recentModes: [],
    seed: 0
  });
  assert.ok([DIALOGUE_MODES.FOLLOW, DIALOGUE_MODES.SILENCE].includes(closed.mode));
  assert.equal(closed.allowWorldTopic, false);
  assert.ok(closed.blocks.includes(DIALOGUE_DIRECTOR_BLOCKS.TOPIC_CLOSED));

  const closedAgain = selectDialogueDirection({
    nlu: { ...plainNlu, dialogueAct: "requesting_silence" },
    worldGrounding: grounding,
    recentModes: ["follow"],
    seed: 0
  });
  assert.equal(closedAgain.mode, DIALOGUE_MODES.SILENCE);
  ok("player closing the topic yields follow or silence only");
}

{
  const base = { nlu: plainNlu, worldGrounding: grounding, recentModes: ["share"], seed: 6 };
  const repaired = selectDialogueDirection({ ...base, repeatedReply: true });
  assert.notEqual(repaired.mode, DIALOGUE_MODES.FOLLOW, "a repeated reply must break the template");
  assert.match(repaired.reason, /^repeated_reply_switch_to_/);
  ok("repeatedReply forces a strategy switch away from plain follow");
}

{
  const result = selectDialogueDirection({
    nlu: plainNlu,
    worldGrounding: grounding,
    recentModes: ["follow"],
    seed: 0
  });
  const allowed = new Set(listGroundedFields(grounding));
  for (const ref of result.groundingRefs) {
    assert.ok(allowed.has(ref), `groundingRefs leaked an unavailable field: ${ref}`);
  }
  assert.equal(result.groundingRefs.includes("weather"), false);
  assert.equal(result.groundingRefs.includes("nearbyInteractableSummary"), false);
  ok("groundingRefs never expose unavailable fields");
}

console.log(`\n${passed}/${passed} PASS`);
