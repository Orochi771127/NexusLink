# Raphael HMAX Soul Talk Shadow Canary V1

## 中文摘要

這一包建立的是「預設關閉、僅 Owner、僅本機 loopback」的心語可見文字
canary，不是一般玩家的 HMAX 上線，也不是公開 Soul Talk cutover。

既有 embedded RaphaelCore 仍先完成本機 safety、boundary、Care 路由、
記憶資格與所有合法 gameplay mutation。只有一般 companion speech 回合，且
Owner 明確開啟全部 gate 時，Nexus Link 才會送出一次 HMAX turn request；通過
response schema、角色限制、依賴語言、constitution 與 stale-state 檢查後，最多
原子替換同一回合的最後一行夥伴文字。

HMAX 不得寫入 Nexus Link store、memory、reward、Growth、effect 或 reducer。
高風險 system terminal、boundary、Reflective Care、timeout、abort、kill switch、
頁面關閉、夥伴切換或 state 改變都保留 embedded 回覆，且不得追補舊結果。

## English summary

This package adds a disabled-by-default, Owner-only, loopback-only visible-speech
canary. It is not a public HMAX launch and it does not cut normal players over
from the embedded Soul Talk runtime.

The embedded RaphaelCore always completes local safety, boundary, Care routing,
memory eligibility, and allowed gameplay mutation first. A single HMAX turn may
be attempted only for an ordinary companion-speech turn when every Owner gate is
explicitly enabled. The hosted candidate may replace only the exact current
companion line after strict response, role-limit, dependency-language,
constitution, and stale-state checks.

HMAX cannot write Nexus Link state, memory, rewards, Growth, effects, or reducers.
Safety terminals, boundary turns, Reflective Care, timeout, abort, kill switch,
panel exit, companion changes, and state changes retain the embedded result and
never replay a late candidate.

## Upstream publication evidence

- HMAX PR [#9](https://github.com/Orochi771127/raphael-HMAX/pull/9) merged to
  `main` as `0d88041cf8361be44d891f5822165c7eadda4b21`; post-main workflow
  [31481421683](https://github.com/Orochi771127/raphael-HMAX/actions/runs/31481421683)
  passed.
- Nexus Link PR [#196](https://github.com/Orochi771127/NexusLink/pull/196)
  merged to `main` as `ba4b94c407bcedf75ada79f4be74d62a12e19df1`;
  post-main Web workflow
  [31482048084](https://github.com/Orochi771127/NexusLink/actions/runs/31482048084)
  and Pages workflow
  [31482046644](https://github.com/Orochi771127/NexusLink/actions/runs/31482046644)
  passed.

These merges establish compatible foundations only. Neither merge, nor this
candidate package, enables public visible HMAX speech.

## Runtime modes

| Mode | Player-visible source | Network | Default |
|---|---|---|---|
| Embedded | Nexus Link `runRaphaelCore()` | none | yes |
| Shadow | embedded RaphaelCore | one eligible loopback observation; hosted speech ignored | off |
| Owner canary | embedded first; one exact line may be replaced after all gates | one eligible loopback turn | off |

If the canary configuration object is present, the controller does not also run
the older shadow request. One turn therefore has at most one HMAX request.

## Owner-only configuration contract

The browser runtime reads `globalThis.__NEXUS_RAPHAEL_HMAX_CANARY__`. Absence is
the production default. The example below is an operator test shape, not public
site configuration:

```js
globalThis.__NEXUS_RAPHAEL_HMAX_CANARY__ = {
  enabled: true,
  ownerOnly: true,
  cloudProcessingConsent: true,
  visibleSpeechApproved: true,
  killSwitch: false,
  baseUrl: "http://127.0.0.1:8787",
  timeoutMs: 8000,
  getAccessToken: async () => inMemoryOwnerSessionToken,
  onResult: (diagnostic) => operatorSink(diagnostic)
};
```

Required constraints:

- `baseUrl` must resolve to loopback; remote origins are rejected.
- The access token is supplied by an in-memory function. It must not be written
  to localStorage, URL parameters, save data, logs, or the repository.
- `timeoutMs` is bounded to a maximum of eight seconds.
- `killSwitch:true`, a replaced configuration object, or an aborted/stale turn
  invalidates an in-flight candidate.
- Diagnostics contain identifiers, booleans, reason codes, and error codes only;
  they omit player input, embedded speech, hosted speech, and response payloads.

## Authority and data boundary

The request is immutable and contains the current message plus the already
projected, bounded contract context required by the local HMAX turn seam. The
response remains `trusted:false`. A candidate is rejected if it contains memory
or effect proposals, remote boundary authority, a non-final/non-companion speech
shape, blank or overlong speech, professional-role claims, cure promises,
exclusivity/dependency language, or a constitution violation.

The canary does not make hosted speech durable. PR #196 raw-data closure strips
raw chat fields from persisted and cloud-projected state. The session transcript
journal retains the embedded reply rather than the hosted candidate and remains
outside gameplay authority.

## Automated evidence

- `node docs/qa/raphael-hmax-soul-talk-canary-cases.mjs`: `28/28 PASS`, including
  client-side rejection of acute-danger and medication-advice candidates.
- `python docs/qa/_run_raphael_hmax_soul_talk_canary_browser.py`: `15/15 PASS`
  in Chromium at `390x844`, zero console errors.
- Existing local shadow contract: `21/21 PASS`.
- Existing local shadow Chromium suite: `8/8 PASS`.
- Full Web release gate: `32/32` required, JavaScript syntax `462/462`,
  `allAutomatedRequiredOk:true`; canonical evidence generated
  `2026-08-11T19:29:43+0800` with a single-writer HTTP/1.1 keep-alive loopback
  server.

The prior Windows/Python HTTP/1.0 reload failure was reproduced as a transport
resource error without application console errors. Assertions were not relaxed;
the same Growth browser suite passed `156/156` under the clean HTTP/1.1 run.

## Non-goals and remaining gates

- No public player traffic, remote production endpoint, or general visible
  speech cutover.
- No model training or learning from player conversation.
- No external LLM provider fallback.
- No durable hosted memory, effect proposal application, or direct game state
  mutation.
- No Care or high-risk hosted request.
- No player API token UX.

Real-device D1/D2/D3/D6, Owner feel-check, private blind review, qualified
psychological review, privacy/legal/store-copy review, and explicit public-launch
approval remain separate human gates. A later public shadow/canary rollout needs
its own authorized package and cannot be inferred from this merge.
