# Raphael HMAX Owner Session Canary Run V1

## 結論

本包已完成第一個真實瀏覽器、loopback-only 的 HMAX Owner session 自動化
canary：Chromium 以一次性配對碼換取短效 opaque broker session，經
`127.0.0.1:8790` 呼叫 HMAX、通過 pinned RaphaelCore 0.2.1 critics，最後只替換
目前 Soul Talk 的同一筆 companion speech。

這是 `synthetic_owner_session` 證據，不是真實玩家、真實模型或公開上線證據。
一般玩家的 HMAX 設定仍不存在／預設關閉；公開網站的 Soul Talk 預設仍使用
embedded RaphaelCore。

## Exact baselines

- Nexus Link merged baseline:
  `cbab82dc79c6c9477f5554262ece603b82e3a919` (PR #199 merge).
- HMAX baseline used by the canary run:
  `0d88041cf8361be44d891f5822165c7eadda4b21`.
- Current HMAX `main` after publishing the lifecycle closure:
  `4ae1af2f06fce64abf813a907945904bb23da3bd` (PR #10 merge; post-main
  workflow `31503394192 PASS`).
- Canonical Core source:
  `b0a12512e03fa977e06b62881ffefdfa1be237a1`.
- Core version: `0.2.1-safety-closure-v2`.
- Core artifact digest:
  `sha256:0f87b9cf05518d19ebcdf1267ed98ba035cd07fe78dd4840cbd2a4e391245f22`.

The HMAX stack remained synthetic and loopback-only: PostgreSQL/pgvector,
Redis, TLS OIDC, deterministic OpenAI-compatible model, API and local session
broker ran in the private Docker topology. Only ports 8787 and 8790 were bound
to `127.0.0.1`.

## Owner browser evidence

The tracked metadata-only report is
`docs/qa/_raphael_hmax_owner_session_canary_output.json` and is reproduced by:

```powershell
python docs\qa\_run_raphael_hmax_owner_session_canary.py `
  --output docs\qa\_raphael_hmax_owner_session_canary_output.json
```

Successful evidence:

- Chromium `390x844`, console errors `0`;
- exact network sequence: one `/v1/local-session/pair`, then one `/v1/turns`;
- one HMAX candidate selected and applied in approximately 1.12 seconds on the
  local synthetic stack;
- response `modelTrusted:false`, `directGameMutation:false`, raw input
  persistence/export false, memory proposals `0`, effect proposals `0`;
- runtime diagnostics contain no input or speech;
- raw ordinary input and selected hosted speech are absent from durable local
  storage;
- overdose/high-risk, diagnosis role-limit, dependency boundary and private
  Care probes each produced `0` HMAX requests;
- the one-time pairing artifact was consumed and neither upstream HMAX bearer
  nor persistent browser credential was exposed.

The first neutral-looking synthetic prompt explicitly requested quiet presence.
The deterministic model returned a question, so the Nexus constitution critic
correctly rejected it with `hosted_constitution_rejected`. The passing run used
an ordinary synthetic prompt that explicitly allowed one question. No critic,
safety route or acceptance rule was weakened.

## HMAX lifecycle blockers found and closed locally

The canary reproduced three repeat-run defects in HMAX persistent synthetic
staging:

1. TLS bootstrap rotated the CA/certificate while old OIDC/API/broker processes
   could remain alive, leaving OIDC unhealthy.
2. The operator probe reused fixed request/idempotency identifiers against
   durable Redis and received its own prior-run `409 idempotency_conflict`.
3. `compose run probe` could reuse another worktree's stale probe image.

The isolated HMAX branch
`codex/hmax-owner-session-canary-tls-lifecycle-v1` now recreates the bounded TLS
consumer set together, namespaces probe identifiers per run and builds the
probe image before execution. Local evidence: HMAX tests `37/37`, persistent
policy `8/8`, static check `40 code / 8 JSON`, dependency audit `0`, two
consecutive fixed `persistent:up` runs PASS, persistence verification PASS and
broker verification PASS.

Nexus regression evidence also remained green: HMAX canary contract `28/28`,
local broker contract `4/4`, HMAX shadow contract `21/21`, sealed conversation
holdout `48/48` with `humanBlindReview:not_run`, and the full Web release gate
`32/32` required PASS with JavaScript syntax `462/462` and
`runtimeTreeClean:true`.

The HMAX fixes were published through protected PR #10 and merged as
`4ae1af2f06fce64abf813a907945904bb23da3bd`; post-main workflow `31503394192`
passed both `hosted-boundaries` and `operator-private-infrastructure`. This
Nexus evidence package is published separately and still does not enable a
player-facing canary.

## Authority and rollout boundary

- Local embedded Core still handles safety, policy, boundary, Care, memory
  eligibility and gameplay mutation before any hosted request.
- HMAX cannot write Nexus memory, reward, Growth, relationship, effect, reducer
  or save authority.
- Candidate speech remains `trusted:false` and can replace only the exact
  current companion line after all stale and constitution checks.
- There is no public endpoint, player traffic, real vLLM/Qwen model, cloud
  identity, cloud memory, general Soul Talk cutover or model training.
- Automated owner-session proof is not a human Owner feel-check. Human
  subjective review, private blind review, real-device D1/D2/D3/D6,
  psychological review and legal/privacy review remain `not_run`.

The HMAX lifecycle closure gate is complete. This Nexus QA/handoff package is
the second protected PR. Even after both merges, the public canary remains
absent/disabled until a separately approved real-model Owner feel-check package.
