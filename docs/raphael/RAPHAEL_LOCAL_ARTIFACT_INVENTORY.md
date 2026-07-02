# Raphael Local Artifact Inventory

Status: Phase A handoff inventory  
Scope: local Raphael / Rafael / RaphaelCore related artifacts found under
`C:\Users\User\NexusLink_RaphaelAI_Workspace` and adjacent known worktrees.

## Inventory Rules

- `current authority`: use for current NexusLink decisions.
- `current runtime`: live or staging source used by this checkout.
- `sibling engine`: reusable standalone Raphael engine work.
- `lab`: mock-only or experimental backend/gateway work.
- `historical reference`: useful for intent and lineage, not direct runtime
  source.
- `needs encoding repair`: readable status is degraded in this environment;
  do not copy visible corrupted strings into new runtime code.

## Current Authority

| Path | Status | Notes |
|---|---|---|
| `AGENTS.md` | current authority | Multi-agent rules, protected files, RaphaelCore boundary, execution ledger requirement. |
| `CLAUDE.md` | current authority | Companion, safety, UI/runtime collaboration rules. |
| `ACCEPTANCE.md` | current authority / needs encoding repair | Acceptance gates; L9 defines RaphaelCore restricted-agent boundary. |
| `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` | current authority / verify readability before use | Highest canon; do not replace with legacy docs. |
| `docs/raphael/RAPHAEL_CONSTITUTION.md` | current authority / needs encoding repair | Persona constitution and boundary contract. |
| `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md` | current authority | Stable readable source for Core vs Gateway and Stateful Companion Cognition Agent wording. |
| `docs/architecture/RAPHAEL_CORE_JS_V1.md` | current authority | Local core architecture. |
| `docs/architecture/RAPHAEL_GATEWAY_SERVER_V1.md` | current authority | Gateway boundary reference. |
| `docs/handoff/RAPHAEL_AI_HANDOFF.md` | current authority / needs encoding repair | Existing Raphael handoff; use with caution because visible text is degraded. |
| `docs/handoff/RAPHAEL_AI_STATUS.yaml` | current authority | Machine-readable status reference. |
| `docs/agent/AI_EXECUTION_LEDGER.md` | current authority | Required cross-agent handoff log. |

## Current NexusLink Runtime

| Path | Status | Notes |
|---|---|---|
| `src/ai/raphaelCore.js` | current runtime | Orchestrator; final authority entry point. |
| `src/ai/applyCoreResult.js` | current runtime | Approved state/chat/memory/trace application path. |
| `src/ui/soulTalkController.js` | current runtime | Live Soul Talk UI boundary. |
| `src/ai/persona/PersonaConstitution.js` | current runtime | Persona constraints in code. |
| `src/ai/safetyShield.js` | current runtime | High-risk routing; must precede gameplay/advisor/training. |
| `src/ai/forbiddenPhrases.js` | current runtime | Anti-drift phrase guard. |
| `src/ai/inputGateway.js` | current runtime | Input normalization. |
| `src/ai/intentClassifier.js` | current runtime | Intent classification. |
| `src/ai/emotionInterpreter.js` | current runtime | Emotion interpretation. |
| `src/ai/semanticSoulModel.js` | current runtime | Derived internal soul vectors. |
| `src/ai/reactionPlanner.js` | current runtime | Boundary reaction planning. |
| `src/ai/responseStrategySelector.js` | current runtime | Response strategy selection. |
| `src/ai/responseComposer.js` | current runtime | Deterministic reply composition. |
| `src/ai/memoryRetriever.js` | current runtime | Memory recall. |
| `src/ai/memoryWriter.js` | current runtime | Memory write policy gate. |
| `src/ai/memoryRecallPolicy.js` | current runtime | Recall policy. |
| `src/ai/habitatTraceMapper.js` | current runtime | Trace intent mapping. |
| `src/ai/animationMapper.js` | current runtime | Animation intent mapping. |
| `src/ai/nlu/*` | current runtime | NLU pipeline, topic/detail/entity extraction, reply support. |
| `src/ai/dialogue/*` | current runtime | Dialogue state, anti-loop, quick replies, variants. |
| `src/ai/eval/*` | current runtime | Safety, boundary, persona, memory, reply critics. |
| `src/ai/autonomy/*` | current runtime | Bounded action/goal/reflection loop. |
| `src/ai/evolution/*` | current runtime scaffold | Proposal/eval path only; no auto-merge. |
| `src/ai/external/*` | current runtime scaffold | External intelligence is default off; advisors only. |
| `src/ai/raphaelTrainingAdapter.js` | current runtime advisory | Static training bundle adapter; advisory only. |
| `src/data/ai/raphaelTrainingBundle.js` | current runtime data | Static training bundle data. |
| `src/data/ai/raphaelCorpusBundle.js` | current runtime data | Canon/corpus bundle. |

## Current QA And Reports

| Path | Status | Notes |
|---|---|---|
| `docs/qa/RAPHAEL_CORE_JS_V1_TEST_PROTOCOL.md` | current QA | Core test protocol. |
| `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md` | current QA | Historical runs. |
| `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md` | current QA | Static training adapter staging report. |
| `docs/qa/RAPHAEL_PREVIEW_STAGING_REPORT.md` | current QA | Preview staging report. |
| `docs/qa/_run_raphael_main_readiness.py` | current QA | Raphael readiness gate. |
| `docs/qa/_run_nlu_smoke.py` | current QA | NLU smoke gate. |
| `docs/qa/_run_raphael_training_bundle.py` | current QA | Training bundle gate. |
| `docs/qa/_run_raphael_preview_staging.mjs` | current QA | Preview staging runner. |
| `src/ai/testHarness/*` | current QA | Raphael smoke, NLU, training, preview, event, growth, and preference cases. |

## Sibling Standalone Engine

Root: `C:\Users\User\NexusLink_RaphaelAI_Workspace\raphael-ai-engine`

| Path | Status | Notes |
|---|---|---|
| `README.md` | sibling engine | Standalone engine overview. |
| `contracts/raphael-engine.schema.json` | sibling engine | Game-neutral request/response contract. |
| `core/index.js` | sibling engine | Engine entry point. |
| `core/nluPolicy.js` | sibling engine | NLU policy. |
| `core/localLearningSidecar.js` | sibling engine | Local player learning sidecar. |
| `core/criticPolicy.js` | sibling engine | Critic/reflection policy. |
| `corpus/nexuslink-canon-cards.json` | sibling engine | Approved canon cards. |
| `corpus/creature-body-language.json` | sibling engine | Image-derived / body-language knowledge. |
| `corpus/wellbeing-soft-context.json` | sibling engine | Soft wellbeing context; not medical authority. |
| `adapters/nexuslink/index.js` | sibling engine | NexusLink adapter. |
| `adapters/generic-game/index.js` | sibling engine | Future game adapter reference. |
| `gateway/mock-gateway.js` | sibling engine | Mock gateway. |
| `gateway/worker-skeleton.js` | sibling engine | Gateway worker skeleton. |
| `gateway/langgraph-flow.md` | sibling engine | Advisory LangGraph-style flow. |
| `training/*` | sibling engine | Eval packs, scripts, agentic pattern map, local-learning and gateway maturity data. |
| `docs/PHASE_*_REPORT.md` | sibling engine | Phase reports from standalone engine work. |
| `tests/*.test.mjs` | sibling engine | Contract, local learning, canon, critic, gateway tests. |

## LangGraph And Gateway Labs

Root: `C:\Users\User\NexusLink_RaphaelAI_Workspace\raphael-gateway-server-langgraph`

| Path | Status | Notes |
|---|---|---|
| `README.md` | lab | Mock-only LangGraph lab overview. |
| `contracts/gateway.schema.json` | lab | Shared gateway contract. |
| `fixtures/gateway-fixtures.json` | lab | Parity fixtures. |
| `datasets/raphael-training-cases.json` | lab | Training cases. |
| `outputs/raphaelTrainingBundle.js` | lab output | Generated static bundle. |
| `node-js/src/gatewayGraph.js` | lab | LangGraph.js prototype. |
| `node-js/src/server.js` | lab | Node mock server. |
| `python/src/gateway_graph.py` | lab | Python LangGraph prototype. |
| `python/src/server.py` | lab | Python mock server. |
| `integration/ONLINE_STATIC_INTEGRATION.md` | lab | Static integration notes. |

Root: `C:\Users\User\NexusLink_RaphaelAI_Workspace\raphael-gateway-server`

| Path | Status | Notes |
|---|---|---|
| `schemas/*.schema.json` | lab | Request/response schema. |
| `src/server.js` | lab | Server prototype. |
| `src/routes/gatewayRouter.js` | lab | Gateway route. |
| `src/core/*` | lab | Request policy, safety gate, redaction, validation. |
| `src/tools/*` | lab | Model/corpus/eval/patch/web-search tools; do not live-wire by default. |
| `src/storage/*` | lab | Mock memory/session/audit stores. |

## Historical Raphael Corpus And Unity Prototype

Root: `C:\Users\User\NexusLink_RaphaelAI_Workspace\aiforge-raphael-corpus`

| Path | Status | Notes |
|---|---|---|
| `README.md` | historical reference | Corpus overview. |
| `CORPUS_MANIFEST.md` | historical reference | Corpus manifest. |
| `docs/migration/AiforgeNEXUS-raphael-corpus.md` | historical reference | Migration notes. |
| `ai/prompts/ChatGPT.md` | historical reference | Prompt history. |
| `unity-scripts/RaphaelSaveSystem.cs` | historical reference | Old save concept. |
| `unity-scripts/RaphaelMemoryCompressor.cs` | historical reference | Old memory compression concept. |
| `unity-scripts/RaphaelEngineAdapter.cs` | historical reference | Old engine adapter concept. |
| `unity-scripts/RaphaelDialogueVisualizer.cs` | historical reference | Old dialogue visualization concept. |
| `unity-scripts/SemanticSoulEngine.cs` | historical reference | Old semantic soul concept. |
| `unity-scripts/DialogueAnalyzer.cs` | historical reference | Old analyzer concept. |
| `legacy-unity-prototype/*` | historical reference | Legacy copies; never direct web runtime source. |

## Older Or Parallel Worktrees

| Root | Status | Notes |
|---|---|---|
| `C:\Users\User\AIForgeNexus2\NexusLink` | historical / parallel checkout | Contains duplicate/older Raphael docs and runtime files. Verify against current checkout before reuse. |
| `C:\Users\User\AIForgeNexus2\NexusLink-hab0-worktree` | historical / parallel checkout | Reference only unless explicitly selected. |
| `C:\Users\User\AIForgeNexus2\NexusLink-docs-worktree` | historical / parallel checkout | Reference only unless explicitly selected. |

## Immediate Gaps

1. Several older Chinese authority docs need an encoding/readability repair pass.
2. The standalone engine and NexusLink runtime are intentionally separated; a
   future adapter task must not collapse them into one mutable frontend blob.
3. No live external model, Telegram, n8n, voice, or robot connector is approved.
4. Global training requires consent, redaction, summarization, human review, and
   eval pass; raw player text is not a global training source.

