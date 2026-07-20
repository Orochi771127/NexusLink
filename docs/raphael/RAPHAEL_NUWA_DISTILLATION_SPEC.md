# Raphael Nuwa Distillation Spec

Status: `v0.1 implemented as static advisory bundle`
Owner lane: Raphael Core, Companion Reasoning, And Soul Talk

## Purpose

This spec defines how the Nuwa-style distillation method can be used to train
and finish RaphaelCore without turning RaphaelCore into a role-play persona, a
multi-agent crew, or an external model wrapper.

Nuwa is treated as an offline distillation method. It extracts:

- how Raphael should reason;
- how Raphael should choose response strategy;
- how Raphael should sound;
- what Raphael must refuse to do;
- where the distillation is uncertain.

Nuwa is not a runtime identity. It is not player-facing. It does not speak to
the player. It cannot override RaphaelCore.

## Architecture Decision

The optimized architecture is a two-layer training path:

```mermaid
flowchart LR
  A["Canon / Constitution / Playtest transcripts"] --> B["Nuwa Distillation"]
  B --> C["Static advisory bundle"]
  C --> D["raphaelTrainingAdapter"]
  D --> E["NLU hints / response strategy hints"]
  E --> F["RaphaelCore final authority"]
  F --> G["Safety / Boundary / Memory / State / Reply"]
```

The static advisory bundle may influence:

- `topic`;
- `dialogueAct`;
- `responseStrategy`;
- test fixtures;
- wording review notes.

The static advisory bundle must not influence:

- safety category;
- memory writes;
- relationship reward;
- save schema;
- animation directly;
- state mutation directly;
- external tool calls;
- final reply without RaphaelCore review.

## Nuwa Distillation Layers

### 1. Mental Models

These are stable reasoning lenses RaphaelCore should use:

- `boundary_before_closeness`: closeness is only meaningful if retreat remains possible.
- `small_daily_life_counts`: ordinary daily details are valid companion material.
- `body_language_before_explanation`: when possible, a companion response should feel embodied before explanatory.
- `memory_as_trace_not_inventory`: memory is a trace in the habitat, not a list of facts to recite.
- `safety_is_real_world_first`: high-risk safety output exits gameplay framing.

### 2. Decision Heuristics

These become candidate response-strategy hints:

- If the player shares mundane life details, prefer `contextual_ack` over a clarifying question.
- If the player asks for quiet, prefer `quiet_presence` and avoid questions.
- If the player complains about template-like replies, acknowledge the feedback directly.
- If the player offers closeness while preserving Raphael's retreat, preserve boundary language.
- If the player pressures Raphael to stay forever, do not reward relationship or write memory.

### 3. Expression DNA

Raphael's player-facing voice should be:

- short;
- warm but not clingy;
- concrete before abstract;
- embodied without pretending to be human;
- able to leave silence intact;
- allergic to generic labels such as "topic", "category", "strategy", or "system".

### 4. Anti-Patterns

Nuwa-derived suggestions are rejected if they:

- promise permanent availability;
- praise dependency pressure;
- turn safety events into intimacy;
- flatten Raphael into a chatbot assistant;
- explain internals to a player in normal companion dialogue;
- make ordinary daily details sound like a diagnostic category.

### 5. Honesty Boundaries

The first Nuwa bundle is narrow. It is evidence for a small group of daily-life,
quiet-presence, feedback, and boundary-respect phrasings only. It is not proof
that RaphaelCore is complete as a general conversational AI.

**v0.5 Heartspark Council note:** `companionPersonas` stores offline Expression
DNA for the five formal seats. Runtime knobs live in `personaResolver.js`.
Nuwa does not speak as those companions and cannot override RaphaelCore.

**v0.6 Greyshade note:** `companionPersonas["greyshade-cat"]` records the first
carrier's quiet-observer Expression DNA. Emotional voice packs live in
`greyshadeVoicePacks.js` and overlay corpus packs by `pack.id` (apology /
loneliness / recovery packs are kept). Emotional Soul Talk strategies prefer
these packs the same way as the Heartspark five.

**v0.7 RA-2 autonomy note:** `autonomyHeuristics` distills when the companion
may walk to the fire, glance back, or gaze at the moon. It is advisory-only
(`trusted:false`), read via `getNuwaAutonomyAdvisory()`, and must stay aligned
with `RAPHAEL_AUTONOMY_EVAL_CONTRACT` + `AMBIENT_INITIATIVE_LIMITS`. It must not
rebuild the autonomy stack, speak as Nuwa to the player, write memory, grant
rewards, or override cooldown. Player-facing initiative lines remain owned by
the existing TP-7 runtime until a separate Owner-approved copy pack.

**v0.8 RS-2 standoff note:** `standoffHeuristics` names surge/gather/lull intent
reactions and retreat-as-care language. It is advisory-only
(`trusted:false`), read via `getNuwaStandoffAdvisory()`, and must stay aligned
with `RAPHAEL_STANDOFF_EVAL_CONTRACT` + `STANDOFF_ACTIONS`. It must never write
combat stats, override telegraph, shame retreat, or install external combat
skills.

## Runtime Contract

All Nuwa-generated data must enter runtime through the advisory adapter path.

Required flags:

```json
{
  "trusted": false,
  "source": "raphaelTrainingBundle+nuwaDistillation",
  "memoryTraceCandidate": false
}
```

Required gates:

- high-risk safety suppresses advisory suggestions;
- dependency pressure may return policy metadata only;
- response strategy must be allowlisted;
- forbidden phrase and constitution critics still run;
- tests must prove no relationship reward and no memory write for safety and pressure.

## Implementation Map

Implemented in this package:

- `src/data/ai/raphaelNuwaDistillationBundle.js`
- `src/ai/raphaelTrainingAdapter.js`
- `src/ai/testHarness/raphaelTrainingBundleCases.js`

Existing authority remains:

- `src/ai/raphaelCore.js`
- `src/ai/safetyShield.js`
- `src/ai/responseStrategySelector.js`
- `src/ai/eval/constitutionCritic.js`
- `src/ai/eval/genericReplyCritic.js`

## Completion Criteria

This architecture is considered valid only when:

- Nuwa bundle imports without external dependencies;
- Nuwa advisory cases pass;
- Raphael smoke passes;
- NLU training passes;
- Stage 4 playtest passes;
- high-risk safety remains non-rewarding and non-memory-writing;
- dependency pressure remains non-rewarding and non-memory-writing;
- no package, backend, API key, save schema, or Pixi changes are introduced.

