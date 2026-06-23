# Raphael Soul Architecture v1.2

Branch: `feature/raphael-soul-architecture-v1`

## Design principle

```text
Raphael is not GPT.
Raphael is the soul core of Nexus Link.
External models advise only — RaphaelCore retains final authority.
```

## Four-layer architecture

```text
Layer 1: RaphaelCore (local soul core)
Layer 2: Autonomy Agent Loop (bounded decision)
Layer 3: Learning / Evolution Pipeline (controlled self-iteration)
Layer 4: External Intelligence Gateway (optional advisors)
```

### Full pipeline

```text
Player input / game events / return / touch / exploration
        ↓
InputGateway → SafetyShield
        ↓
RaphaelCore Perception
  emotion / intent / semanticSoul / memory / persona
        ↓
AutonomyLoop
  needs → goals → allowed actions → execute → reflect
        ↓
Critic Layer
  safety / boundary / persona / memory / reply
        ↓
External Intelligence Gateway (optional, default OFF)
  mock / OpenAI / Grok advisor modes
        ↓
RaphaelCore Final Authority
        ↓
Runtime Output
  reply / statePatch / memory / trace / animation
        ↓
Learning Pipeline
  trace → eval → patch proposal → human approval → PR
```

## Layer 1 — RaphaelCore

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

## Layer 2 — Autonomy (`src/ai/autonomy/`)

```text
Observe → Evaluate → Choose Goal → Plan Action → Execute → Reflect
```

| Module | Responsibility |
|--------|----------------|
| `needModel.js` | Companion need scores 0–1 |
| `goalManager.js` | Whitelisted goals + priority |
| `actionPolicy.js` | Allowed / forbidden world actions |
| `actionPlanner.js` | Goal → selectedAction mapping |
| `actionExecutor.js` | Runtime patch + policy validation |
| `reflectionEngine.js` | Post-interaction reflection |
| `initiativeCooldown.js` | Anti-spam initiative guard |
| `autonomyLoop.js` | Loop orchestrator + critic repair |

Raphael has no unbounded agency — all actions pass `actionPolicy` + `forbiddenPhrases`.

## Layer 3 — Critic + Evolution

### Critic (`src/ai/eval/`)

Pre-output self-check. Failures trigger repair in `autonomyLoop.js`.

| Module | Checks |
|--------|--------|
| `safetyCritic.js` | High-risk routing, safe harbor |
| `boundaryCritic.js` | Dependency pressure, affection under boundary |
| `personaCritic.js` | Greyshade-cat tone, generic-chatbot drift |
| `memoryCritic.js` | Memory write gates under pressure / crisis |
| `replyCritic.js` | Speak/silence alignment, verbosity |
| `runCritics.js` | Aggregator |

### Evolution (`src/ai/evolution/`)

Proposes patches only — **never auto-merges production code**.

| Module | Responsibility |
|--------|----------------|
| `interactionTraceCollector.js` | Session trace buffer |
| `failurePatternDetector.js` | Detect recurring failure patterns |
| `patchProposers.js` | Corpus / policy patch candidates |
| `humanApprovalGate.js` | Format proposals for human review |
| `evalRunner.js` | Smoke eval summary |
| `selfEvolutionPipeline.js` | trace → eval → proposal orchestrator |

## Layer 4 — External Intelligence (`src/ai/external/`)

Default: **disabled**. Enable via `runtime.externalIntelligence` only.

| Module | Responsibility |
|--------|----------------|
| `externalModelGateway.js` | `askAdvisor()` entry — Raphael validates output |
| `privacyRedactor.js` | Strip sensitive fields before external call |
| `promptFirewall.js` | Mode / payload gate |
| `modelRouter.js` | Route to provider adapter |
| `mockAdvisorAdapter.js` | Offline mock (default) |
| `openaiAdapter.js` | Stub — no API key |
| `grokAdapter.js` | Stub — no API key |

External call modes (future):

| Mode | Purpose | Shown to player |
|------|---------|-----------------|
| `advisor` | Complex semantics critique | No |
| `renderer` | Polish Raphael decision into natural language | After safety check |
| `critic` | Boundary / persona validation | No |

Sync path: `runRaphaelCore()` — `externalAdvice: { used: false }`  
Async path: `runRaphaelCoreWithExternal()` — calls `askAdvisor()` when enabled.

## Agent tools (`src/ai/tools/`)

Whitelist registry with permission policy.

| Tool | Auto-execute | Risk |
|------|-------------|------|
| `retrieveMemory` | Yes | low |
| `searchCorpus` | Yes | low |
| `getGameState` | Yes | low |
| `evaluateReply` | Yes | low |
| `proposePatch` | Human approval | medium |
| `webSearch` | User consent required | medium — **default OFF** |

## UI boundary

`soulTalkController.js` only handles UI wiring:

- player chat entry
- `runRaphaelCore()`
- `applyRaphaelCoreResult()`
- render + save

## Learning levels (roadmap)

| Level | Name | Status |
|-------|------|--------|
| 1 | Runtime adaptation | **Active** |
| 2 | Persistent preference profile | Planned (session-only, no schema change) |
| 3 | Corpus evolution via PR | Scaffolded |
| 4 | Model fine-tuning | Deferred |

## Development phases

```text
Phase 1: RaphaelCore local agent loop          ✓
Phase 2: Memory retrieval + stateMutation      ✓
Phase 3: Critic / Evaluator                    ✓
Phase 4: SelfEvolutionPipeline                 ✓ (scaffold)
Phase 5: ExternalModelGateway mock adapter     ✓ (scaffold)
Phase 6: OpenAI / Grok advisor mode            — not started
Phase 7: Web access (default OFF)              — scaffold only
Phase 8: Corpus evolution PR pipeline          — not started
Phase 9: Fine-tuning / dedicated small model   — deferred
```

## Smoke harness

```text
http://localhost:5173/?raphaelSmoke=1
```

Console:

```js
const m = await import('./src/ai/testHarness/raphaelCoreSmokeCases.js');
console.table(m.runAllRaphaelSmokeCases());
```

QA runner: `docs/qa/_run_harness_smoke.py` (10 cases, headless Playwright).