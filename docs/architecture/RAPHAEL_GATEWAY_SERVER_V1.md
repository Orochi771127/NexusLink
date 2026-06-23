# Raphael Gateway Server v1

## Positioning

```text
NexusLink Web Client
  → RaphaelCore (local soul / final authority)
  → Raphael Gateway Server (bounded tool layer)
  → Tool whitelist (corpus / memory / web / advisor / eval / patch)
  → External networks & models (Phase B+)
```

**Server = toolbox. RaphaelCore = soul.**

GitHub Pages static client cannot hold API keys or run server-side safety. The gateway is a **separate process/repo**:

```text
raphael-gateway-server/
```

## Phase roadmap

| Phase | Scope |
|-------|-------|
| **A (now)** | Local mock server, structured responses, permission policy, audit log |
| B | External model advisor (keys on server only) |
| C | Web search (default OFF, consent required) |
| D | Cloud memory sync |
| E | VPS / edge production deploy |

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/health` | Liveness |
| GET | `/v1/audit` | Recent audit entries (dev) |
| POST | `/v1/gateway` | Unified tool dispatch |

### Request shape

```json
{
  "requestId": "rgw_...",
  "companionId": "greyshade-cat",
  "tool": "ask_model_advisor",
  "payload": { "emotion": "fatigue", "intent": "vent", "inputSummary": "..." },
  "context": {
    "userConsent": false,
    "webAccessEnabled": false,
    "humanApproval": false,
    "sessionId": "local",
    "playerId": "local"
  }
}
```

### Response shape (never raw companion speech as authority)

```json
{
  "ok": true,
  "requestId": "rgw_...",
  "tool": "ask_model_advisor",
  "advisor": {
    "emotion": "anxiety",
    "boundaryRisk": 0.22,
    "suggestedReaction": "guarded_acknowledge",
    "replyCandidates": ["..."],
    "warnings": [],
    "trusted": false
  },
  "metadata": { "source": "model_advisor", "confidence": 0.72, "auditId": "..." }
}
```

## Tool whitelist

| Tool | Risk | Default |
|------|------|---------|
| `search_corpus` | low | ON |
| `retrieve_memory` | low | ON |
| `summarize_session` | low | ON |
| `evaluate_reply_safety` | low | ON |
| `ask_model_advisor` | medium | mock only |
| `web_search_public_info` | high | OFF |
| `sync_memory` | high | consent |
| `propose_corpus_patch` | high | consent + approval |

## Client integration (NexusLink)

| File | Role |
|------|------|
| `src/ai/external/raphaelGatewayClient.js` | HTTP client |
| `src/ai/external/externalIntelligencePolicy.js` | Defaults + gateway routing policy |
| `src/ai/external/externalModelGateway.js` | Advisor entry (gateway or local mock) |

Enable explicitly:

```javascript
runRaphaelCoreWithExternal(input, state, {
  externalIntelligence: {
    gatewayEnabled: true,
    advisorEnabled: true,
    gatewayUrl: "http://127.0.0.1:8787"
  }
});
```

RaphaelCore **always** validates advisor output; `trusted: false` by default.

## Run locally

```bash
cd raphael-gateway-server
npm start          # Node.js 18+ (canonical)
# or
python scripts/server.py   # stdlib fallback (same API)
# → http://127.0.0.1:8787
```

Smoke:

```bash
python scripts/smoke_test.py
python ../NexusLink/docs/qa/_run_gateway_client_smoke.py
```

## Security rules

1. `privacyRedactor` on server before any external call (Phase B+)
2. High-risk input blocked at `safetyGate`
3. No API keys in NexusLink frontend
4. Audit log for every tool invocation
5. Structured responses only — RaphaelCore composes final reply