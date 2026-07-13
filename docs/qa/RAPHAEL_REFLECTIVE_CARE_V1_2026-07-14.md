# Raphael Reflective Care V1 — 2026-07-14

## Verdict

`Reflective Care V1` is verified as an EXPERIENCE-layer companion-care policy
for the existing Limited Beta. It improves listening and self-reflection without
classifying RaphaelCore as a therapist, counsellor, diagnostic system, or crisis
agent.

## Evidence-informed design

The policy is based on a narrow translation of public guidance rather than a
copy of counselling scripts:

- WHO Psychological First Aid: humane, supportive, practical help; respect
  dignity, culture, ability, privacy, silence, and the person's own pace.
  <https://www.who.int/publications/i/item/9789241548205>
- SAMHSA trauma-informed principles: safety, trust, collaboration, empowerment,
  voice, and choice.
  <https://www.samhsa.gov/mental-health/trauma-violence/trauma-informed-approaches-programs>
- APA listening research summary: attentive, empathic, non-judgmental listening
  is more than generic acknowledgement.
  <https://www.apa.org/news/podcasts/speaking-of-psychology/deep-listening.html>
- IAAP individuation overview: Jungian individuation is a lifelong process of
  self-realization, not a label or a short dialogue outcome.
  <https://www.iaap.org/wp-content/uploads/2021/04/Individuation.pdf>

## Runtime contract

- Ordinary emotion can receive a grounded, tentative reflection.
- `reflective_care` activates when the player explicitly asks to be heard or to
  organize feelings.
- `symbolic_reflection` activates only after explicit player language about a
  dream, shadow, mask, image, colour, weather, room, or related symbolic frame.
- Care quick replies preserve choice: continue speaking, find one small step,
  become quiet, describe the image, decline interpretation, or return to daily
  conversation.
- Raphael asks for the player's own association and never states that a dream or
  symbol has one authoritative meaning.
- `no_questions` and quiet-presence requests override reflective questioning.
- Safety, dependency pressure, command pressure, and boundary handling remain
  upstream overrides.
- Explicit reflective-care and symbolic-reflection turns create no relationship
  reward, milestone, or long-term memory write.

## Forbidden drift

- No diagnosis or symptom classification.
- No claim to be a therapist or to provide Jungian psychotherapy.
- No authoritative dream, shadow, archetype, or personality interpretation.
- No false reassurance, forever promise, exclusivity, or dependency language.
- No automatic training or raw private-conversation persistence.
- No external model, API, backend, package, or build step.

## Verification

- Reflective dialogue-loop suite: **21/21**, including six care/symbolic cases
  and one safety-precedence case; forbidden phrases **0**, console errors **0**.
- Sealed holdout v1.0.0: **48/48**, hard gate PASS, machine quality flags **0**,
  console errors **0**, human blind review `not_run`.
- Full web release gate: **10/10** required automated checks,
  `allAutomatedRequiredOk: true`.
- JavaScript syntax: **204/204**.
- State migration: **30/30**.
- Live Soul Talk: **11/11**; HUD: **13/13**; console errors **0**.

The unchanged manual gates remain: real-device mobile review, moderated private
testers, and legal/privacy/store-copy review. This package does not convert the
Limited Beta into an independently human-validated public launch.
