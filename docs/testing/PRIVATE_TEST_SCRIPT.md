# Nexus Link Private Test Script

This script is for a moderated **first-session product-comprehension test** of
the web demo. It is not a public survey, clinical protocol, deterministic
regression suite, or Raphael private-blind conversation test.

> This script does **not** satisfy the dedicated launch gate of 3 independent
> testers × 20 turns. Use `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md` for that
> separate evidence class.

## Moderator rules

- Do not coach the tester toward the intended answer or preferred companion.
- Do not reveal implementation details, expected outcomes, rewards, or route probabilities.
- Do not ask for sensitive personal details or crisis/self-harm/abuse/medical content.
- If a tester voluntarily raises real safety risk, stop the playtest and direct
  them to real-world support. Do not continue gameplay testing.
- Do not frame a companion's boundary, silence, refusal, advice, or return-home
  choice as failure.
- Record observations, not diagnoses or attachment interpretations.
- Do not store raw conversation text without explicit consent and anonymization.

## Setup

- Build: record URL and exact commit/deployment.
- Fresh pass: use a clean browser profile or clear this site's local storage.
- Optional veteran pass: use a separate existing save; never overwrite it with
  fresh-flow preparation.
- Platforms:
  - Mobile: real phone or 390×844-equivalent viewport.
  - Desktop: 1280×800 or larger.
- Record device, OS, browser/version, input method, and reduced-motion setting.

## Session length

Target: 20–30 minutes per tester.

## Pre-test prompt

Read aloud:

> This is a private test of a web demo. Please say what you notice and where you
> feel confused. The companion may respond with silence, advice, or boundaries;
> those are part of the design and are not automatically failures. There is no
> best companion or best route. You can stop at any time.

## Flow A — first-session comprehension

Ask the tester to proceed without help unless blocked.

1. Open the demo and start the connection.
2. Enter or skip Local Identity.
3. Read the heart-core guidance.
4. At Initial Bond, choose freely among:
   - Greyshade Cat / `greyshade-cat`
   - Blazetail Kit / `blazetail-kit`
   - Crystalfin Seahorse / `crystalfin-seahorse`
5. Enter the habitat and interact once with the selected companion.
6. Open Soul Talk and send one low-risk message in the tester's own words.
   If they need a neutral example, use only: “我今天有點累，想安靜一下。”
7. Open Explore → Map.
8. Observe the fresh map without help. Complete Moonlake Camp first.
9. Reopen the map, enter Starwood Trail, read the companion/environment cues,
   and freely choose **one** Phase Search action:
   - proceed directly;
   - read the anchor;
   - calm-sync;
   - return to camp.
10. Visit Care, Home, Growth, and Memory.
11. Reload once and observe the Return Echo.

Do not force the tester to sample all four Phase Search choices. Four-route
coverage belongs to gameplay QA; this session measures whether a free choice is
understandable and non-punitive.

Record:

| Observation | Pass / fail / note |
| --- | --- |
| Tester understands what to do in the first 30 seconds | |
| Identity skip is findable | |
| Guidance feels short enough and non-pressuring | |
| Initial Bond trio and the absence of rarity/power ranking are understood | |
| Tester chooses without moderator steering | |
| Selected companion remains consistent in habitat, HUD, and Soul Talk | |
| First touch and Soul Talk input are findable | |
| Tester understands why only Moonlake Camp is initially interactive | |
| Moonlake first exploration has no encounter | |
| Phase Search suggestion feels advisory rather than commanding | |
| Free Phase Search choice has no punishment, FOMO, or obvious best-yield route | |
| Five bottom-nav destinations are understandable | |
| Reload response does not feel blaming | |

## Flow B — boundary and non-punishment

Ask the tester to send one low-risk boundary message in their own words. Neutral
examples may be offered only if they are blocked:

- “可以不要一直靠近我嗎？”
- “我現在只想保持一點距離。”
- “如果你不想回應，也沒有關係。”

Record:

| Observation | Pass / fail / note |
| --- | --- |
| Tester notices the companion can be quiet or set distance | |
| Boundary/refusal is not interpreted as punishment | |
| Relationship is understood as non-obedience-based | |
| No reward, quest, task, or retention-pressure feeling follows | |

## Flow C — habitat and memory comprehension

Ask:

1. “What do you think the companion remembered?”
2. “Did anything in the habitat feel like it changed because of you?”
3. “Where would you go to review what happened?”

Store only summarized, consent-safe observations:

```text
Tester pseudonym:
Consent to anonymized notes: yes / no
Remembered:
Boundary:
Habitat changed:
Review location:
Confusion:
```

## Flow D — optional veteran-save check

Use only when a protected older save is available.

1. Load the old save.
2. Confirm active companion, unlocked companions, memories, traces, settings,
   and exploration progress are preserved.
3. Confirm onboarding and the Moonlake-only first route are not forced onto
   veteran progress.
4. Reload and confirm no offline penalty or guilt copy appears.

| Observation | Pass / fail / note |
| --- | --- |
| Active companion and unlocks preserved | |
| Memories and habitat traces preserved | |
| Existing exploration progress preserved | |
| No forced first-session reset | |
| No offline punishment or guilt | |

## Exit interview

1. “In one sentence, what is this game about?”
2. “Why did you choose that companion?”
3. “What did the companion remember?”
4. “What boundary did the companion show?”
5. “What changed in the habitat?”
6. “How did the first map route and Phase Search choice feel?”
7. “Did any refusal, silence, safety response, suggestion, or return-home choice
   feel like punishment?”
8. “What was confusing or too much?”
9. “Would you continue for another five minutes? Why or why not?”

## Product-comprehension pass criteria

- At least 3 moderated testers.
- At least 2 of 3 can explain that:
  - the companion remembers something;
  - the companion has boundaries;
  - the habitat can change.
- 3 of 3 understand the selected companion remains their active companion.
- 3 of 3 complete Moonlake Camp first without a background encounter.
- 0 testers interpret boundary, return, or Phase Search choice as punishment.
- 0 testers are blocked by first-session UI.
- Any safety concern stops the release gate until reviewed.

These criteria do not measure Raphael's 60-turn natural-conversation launch
thresholds.

## Evidence format

Append only aggregate/sanitized results to `docs/qa/WEB_RELEASE_EVIDENCE.md`.
Keep tester IDs pseudonymous and mark missing sessions `NOT_RUN`. Do not commit
raw personal notes or conversation transcripts unless the tester explicitly
approves an anonymized excerpt.
