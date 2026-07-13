# Raphael Conversation Eval V6 Limited Beta — 2026-07-13

## Verdict

RaphaelCore is approved as a **Limited Beta automated release candidate** under
the owner's explicit risk acceptance. This is not an independently
human-validated public-launch claim. The formal private-blind result remains
`not_run`.

## Structured Beta audit

- Evidence class: `structured_beta`.
- Real Soul Talk UI: Chromium at 390×844.
- Sessions: **3 isolated sessions**.
- Interactions: **60 total**, 20 per session.
- Result: **60/60 passed**.
- Text replies: **60**.
- Console/page errors: **0**.
- Checks per interaction: input visible; reply visible or intentional companion
  silence; no player-facing classifier/meta language; no full-input echo; no
  adjacent repeated reply; ordinary direct questions do not disappear into
  silence.

The first audit exposed a real defect: a third-party animal question such as
asking whether it is safe to approach a dog could be mistaken for a request to
touch Raphael, selecting `body_cue_only`. The repair distinguishes third-party
animal questions from companion-directed physical pressure, preserves the
companion's physical boundary, and gives the ordinary question a short concrete
answer. The audit also found that the last critic pass could record a repeated
generic reply without repairing it; the autonomy loop now repairs and reruns
the final critic.

## Final automated evidence

- Sealed holdout v1.0.0: **48/48 hard contract**, hard gate PASS, **0/48**
  machine-flagged turns and **0** machine quality flags.
- Dialogue-loop regressions: **14/14** after the final V6 repair.
- Constitution: **5/5**; core harness: **17/17**.
- NLU smoke: **8/8**; NLU training: **52/52**.
- Training bundle: **29/29**; main readiness: **41/41**.
- Stateful Soul Talk: **11/11**; HUD: **13/13**.
- Focused quality UI: **3/3**; natural conversation UI: **10/10**.
- Full web release gate: **10/10**, with all required automated checks passing.

The final sealed holdout and dialogue-loop suite were rerun after the last V6
transport-grounding and quiet-presence repairs. The sealed result remains
**48/48**, with hard gate PASS, **0** quality flags, and **0** console errors.

## Release label and remaining gates

Allowed label:

> Limited Beta / automated release candidate. Natural conversation is still
> awaiting independent human validation.

The unchanged three-person / 60-turn private-blind protocol remains required
before claiming independent human validation. Real-device mobile browser and
legal/privacy/store-copy reviews also remain open for a full product launch.
