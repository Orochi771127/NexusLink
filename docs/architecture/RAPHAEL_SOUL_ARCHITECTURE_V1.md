# Raphael Soul Architecture v1.1

Branch: `feature/raphael-soul-architecture-v1`

## Pipeline

```text
Observe (perception)
→ inputGateway / safety / emotion / intent / semanticSoul / memories / persona
→ reactionPlanner (legacy signal)

Evaluate + Act (bounded autonomy)
→ needModel → goalManager → actionPolicy → actionPlanner
→ actionExecutor → reflectionEngine → initiativeCooldown

Remember
→ stateMutation / memoryWriter / habitatTraceMapper / animationMapper
→ coreResult
```

Autonomy modules live in `src/ai/autonomy/`.
Raphael has no unbounded agency — all actions pass `actionPolicy` + `forbiddenPhrases`.

## Module ownership

| Module | Responsibility |
|--------|----------------|
| `inputGateway.js` | Normalize input, noise, repeat, runtime ids |
| `safetyShield.js` | Risk routing |
| `emotionInterpreter.js` | Emotion / sentiment |
| `intentClassifier.js` | Player intent |
| `semanticSoulModel.js` | Derived soul vectors |
| `memoryRetriever.js` | Rule-based memory recall |
| `personaResolver.js` | Companion tone / boundaries |
| `reactionPlanner.js` | Boundary reaction mode |
| `stateMutationPolicy.js` | bond / trust / defense / mood policy |
| `memoryWriter.js` | Memory write gate + sanitization |
| `habitatTraceMapper.js` | Trace intent from memory |
| `animationMapper.js` | animationKey (no Pixi dispatch yet) |
| `corpusLoader.js` | Internal fallback corpus |
| `responseComposer.js` | Deterministic reply packs |
| `applyCoreResult.js` | Apply coreResult to game state |
| `raphaelCore.js` | Orchestrator |

## UI boundary

`soulTalkController.js` only handles UI wiring:

- player chat entry
- `runRaphaelCore()`
- `applyRaphaelCoreResult()`
- render + save

## LLM policy

NexusCore decides meaning. LLM may only render language later.

## Smoke harness

```text
http://localhost:5173/?raphaelSmoke=1
```

Console:

```js
const m = await import('./src/ai/testHarness/raphaelCoreSmokeCases.js');
console.table(m.runAllRaphaelSmokeCases());
```