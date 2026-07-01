# RaphaelCore JS v1

## Status

Branch: `feature/raphael-core-js-v1`

This document records the first Web-native RaphaelCore implementation for Nexus Link.

RaphaelCore JS v1 is a local, deterministic companion AI layer. It does **not** connect to an LLM, backend, database, or external API.

## Purpose

The goal is to keep Nexus Link from becoming a generic AI chat product.

RaphaelCore decides:

- safety routing;
- emotional interpretation;
- player intent;
- derived soul state;
- Soul Talk boundary reaction;
- bounded companion reply.

It does not replace:

- localStorage persistence;
- PixiJS runtime;
- touch reaction engine;
- habitat trace engine;
- memory lifecycle engine;
- companion renderer.

## Source lineage

This Web implementation extracts concepts from the Unity / Node prototypes in `AIForgeNexusCOSMOS`:

| Legacy concept | Web v1 target |
|---|---|
| `DialogueAnalyzer.cs` | `src/ai/emotionInterpreter.js`, `src/ai/intentClassifier.js` |
| `SemanticSoulEngine.cs` | `src/ai/semanticSoulModel.js` |
| `RaphaelEngineAdapter.cs` | `src/ai/raphaelCore.js` orchestration |
| `mockLLM.js` | `src/ai/responseComposer.js`, renamed because it is not an LLM |
| `raphael_corpus.json` | future corpus bundle from `aiforge-raphael-corpus` |

## Files added

```text
src/ai/
  safetyShield.js
  emotionInterpreter.js
  intentClassifier.js
  semanticSoulModel.js
  reactionPlanner.js
  responseComposer.js
  raphaelCore.js
```

## Files integrated

```text
src/ui/soulTalkController.js
```

Soul Talk now routes player input through:

```text
runRaphaelCore()
→ safetyShield
→ emotionInterpreter
→ intentClassifier
→ semanticSoulModel
→ reactionPlanner
→ responseComposer
→ existing memory / trace / state update path
```

## Boundary reaction modes

Soul Talk now has a text-side boundary layer separate from touch interaction:

```text
acknowledge
guarded_acknowledge
hesitate
reject
withdraw
safety_redirect
```

This mirrors the product rule:

```text
Player wants closeness ≠ companion must accept closeness.
```

## Safety routing

High-risk input is routed before ordinary companion response.

High-risk routing must not:

- write ordinary emotional memory;
- reward bond / trust;
- trigger intimacy milestone;
- roleplay the danger as a game event;
- make the companion replace real-world support.

Dependency pressure is treated as boundary pressure, not as romance, loyalty, or progression.

## State policy

This implementation deliberately avoids changing `defaultState.js`, `saveManager.js`, `store.js`, `pixiApp.js`, or storage keys.

New concepts such as `boundaryPressure`, `joySorrow`, `fearCourage`, and `bondAffinity` are derived from existing state instead of being persisted directly.

This keeps the patch inside the experience layer and avoids a storage migration.

## LLM policy

RaphaelCore JS v1 is not an LLM adapter.

Correct architecture:

```text
NexusCore decides emotion, intent, memory, boundary, reaction, trace, and animation.
LLM, if added later, may only be an optional language rendering layer.
```

## Known limitations

- No animation dispatch from Soul Talk yet; the planner only returns `animationKey` for future use.
- No imported external corpus bundle yet.
- Response packs are local and small.
- Safety shield is rule-based and should be reviewed before public use.
- Corpus sync with `aiforge-raphael-corpus` is still future work.

## Next suggested tasks

1. Add smoke tests for RaphaelCore sample inputs.
2. Review safety copy and dependency-pressure patterns.
3. Export a proper `raphael_corpus.bundle.json` from `aiforge-raphael-corpus`.
4. Map Soul Talk `animationKey` to companion animation once Greyshade animated sheets are stable.
5. Let Grok Build clone the branch locally only after this PR is reviewed.
