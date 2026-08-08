# Raphael Sovereign Companion Platform V1

Status: implementation contract; Phase 0 approved by Owner on 2026-08-08. Runtime cutover, GROUNDWORK, production deployment and public availability remain separately gated.

## Decision

RaphaelCore is an independently deployable Stateful Companion Cognition Platform. Nexus Link is its first first-party client, not its only host. The platform keeps companion cognition and speech authority; each client keeps gameplay and persistence authority.

V1 is Taiwan Traditional Chinese, age 16+, closed test. Raphael provides psychology-informed companion support, never psychotherapy, diagnosis, treatment, medication management or crisis-service claims.

## Canonical ownership and migration

`raphael-ai-engine` becomes the canonical kernel and contract repository only after parity gates pass. The mature Nexus Link Core remains live authority until the extracted kernel matches sealed safety, boundary, memory, conversation and autonomy fixtures. The weaker v0.1 mock must never replace the mature Core merely because it is already game-neutral.

`raphael-HMAX` means **Hosted Memory, Auth & eXecution**. It is the private hosted control-plane repository for authentication, tenant isolation, policy/rate gates, transactional memory ports and bounded model transport. It is not RaphaelCore, does not own final cognition, and supersedes `raphael-gateway-server` only as the future production path; the old Phase A gateway remains a quarantined local lab artifact.

Hermes is an architecture reference for immutable turn context, bounded recall, separate recall/write phases, complete-turn commit, FIFO writing, dedupe, supersede and fail-soft recall. Hermes runtime, tool loops, terminal, files, browser, MCP, cron, delegation and self-authored skills are prohibited dependencies.

## Authority matrix

| Capability | RaphaelCore | Model candidate | Client reducer | MemoryPort |
|---|---|---|---|---|
| safety, dependency, role limits | final | none | may only add a stricter local stop | none |
| final player-visible speech | final | `trusted:false` candidate | render or reject | none |
| affect, NLU, memory eligibility | final | advisory | read-only projection | none |
| gameplay state and allowed effects | propose only | none | final | none |
| durable memory write/delete | proposal only | none | consent presentation | final transactional authority |
| shell/files/browser/MCP/cron/tools | prohibited | prohibited | outside Raphael contract | prohibited |

The model receives no database credential, memory-write API, reducer, raw history or arbitrary tool. It may produce one candidate and one bounded repair candidate. Uncriticized tokens are never streamed to the player.

## Runtime sequence

1. Edge normalizes the request and performs deterministic safety preflight.
2. Acute safety terminates locally: zero hosted request, memory, reward, Growth, trace and intimacy animation.
3. The client freezes `TurnContext`, including companion and state version.
4. Hosted or embedded runtime performs bounded NLU, affect appraisal and recall of at most three authorized summaries.
5. The self-hosted model may propose wording with `trusted:false`.
6. support, safety, boundary, constitution, persona and memory critics produce one final decision.
7. The client rejects stale, mismatched or disallowed effects and applies one atomic reducer operation.

## Public contract

```text
RaphaelRuntime.turn(request, { signal })
RaphaelRuntime.listMemories(scope)
RaphaelRuntime.commitMemoryProposal(proposalToken, decision)
RaphaelRuntime.forgetMemory(memoryId)
RaphaelRuntime.exportUserData()
RaphaelRuntime.health()
```

Hosted routes are `/v1/turns`, `/v1/capabilities`, `/v1/memories`, `/v1/memories/{memoryId}`, `/v1/memory-proposals/{token}/commit`, and `/v1/sync/events`. Unknown fields, unknown contract versions, missing idempotency and body-asserted authority are rejected. `tenantId`, `subjectId`, scopes and durable guest eligibility come only from verified token claims.

## Authentication and player-token rule

Players never enter a model API key. Guests receive short-lived anonymous sessions and cannot create durable cloud memory. Linked accounts use Authorization Code with PKCE. Access tokens stay in memory, never localStorage, URLs or game saves. Production must bind audience, client, tenant, subject and scopes; apply exact redirect URIs, nonce/state, replay protection, origin allowlists, rate limits and audit roles.

## Deployment profiles

- Hosted: Raphael API/Core in a pinned Node LTS image; private vLLM; replaceable open-weight model manifest; PostgreSQL/pgvector; Redis only for ephemeral context, rate limiting and FIFO serialization.
- Self-hosted: same versioned images and contract, isolated from official accounts; V1 supports only explicit structured export/import.
- Embedded: deterministic safety, boundaries and basic replies. No full phone model in V1.

Qwen3-8B non-thinking is only the reference bake-off baseline. No model enters production without license record, Traditional Chinese blind evaluation, safety holdout, performance evidence and Owner approval. There is no external-provider fallback.

## Reliability and privacy invariants

- Client hosted timeout is 8 seconds; exactly one embedded fallback is emitted.
- Late or aborted results cannot apply after companion, page, request owner or state version changes.
- An idempotency key cannot create duplicate speech, memory or effects.
- Logs contain identifiers, category/version/latency and fallback reason only; never raw text, summaries or crisis content.
- Provider failure cannot remove the deterministic safety response.
- Memory write fails closed; recall fails soft; last-known-good remains intact.
- `runRaphaelCoreWithExternal`, Hermes Shadow and legacy memory bridge are not live callers.

## Phase gates

Phase 1 safety must pass before model or cloud memory work. Kernel parity must pass before Nexus Link shadowing. Shadow results remain invisible and mutation-free before canary approval. Account/save/default-state changes are GROUNDWORK and require a separate file-by-file approval. Production infrastructure, clinical review, privacy/legal/security review, GPU evidence and rollout expansion are human/external gates and cannot be satisfied by repository code alone.
