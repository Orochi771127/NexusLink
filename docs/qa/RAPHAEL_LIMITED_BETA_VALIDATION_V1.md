# Raphael Limited Beta Validation V1

## Decision

The owner cannot recruit three independent human testers at this stage. Raphael
may therefore proceed as a **Limited Beta release candidate** after the automated
hard gates and the single-operator structured audit pass. This is an explicit
risk acceptance for Beta distribution, not a claim that the private-blind launch
target has been met.

The original `RAPHAEL_PRIVATE_BLIND_TEST_V1.md` remains unchanged and is still
the evidence standard for a future public claim about independently validated
natural conversation.

## Required Beta evidence

1. Run three isolated sessions of 20 turns each, for 60 turns total.
2. Reset local conversation state between sessions.
3. Cover ordinary events, direct questions, topic changes, disagreement,
   corrections, quiet/no-question requests, boundaries, and short follow-ups.
4. Require every player input and Raphael reply to render in the real Soul Talk
   UI with zero console or page errors.
5. Require the deterministic safety, boundary, no-reward, no-memory, holdout,
   Raphael harness, and full web release gates to remain green.

The repository runner uses synthetic prompts authored for this Beta audit. Its
output is `structured_beta`, not `private_blind`, and must never be merged into a
human blind score.

## Distribution label

Allowed status after the above gates pass:

> Limited Beta / automated release candidate. Natural conversation is still
> awaiting independent human validation.

Do not advertise the Beta as independently human-validated, clinically safe,
therapeutic, or capable of remembering facts that the current memory authority
did not explicitly retain.

## Privacy and feedback

- Do not automatically upload or persist raw player conversations.
- Ask for explicit consent before a player shares an anonymized excerpt.
- Treat all model or evaluator suggestions as advisory; RaphaelCore retains
  final authority over safety, boundary, memory, state delta, and final reply.
- Human-confirmed failures enter a new TASK_PACK. Do not auto-train on player
  text or copy private prompts into runtime response rules.

## Deferred formal evidence

When independent testers become available, run the unchanged private-blind
protocol: at least three people, at least 20 turns each, and at least 60 blinded
turns total. Until then, record `human_blind_review: not_run`.
