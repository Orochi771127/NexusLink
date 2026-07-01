# Nexus Link Private Test Script

This script is for moderated web-demo private tests. It is not a public survey
and not a clinical or therapeutic protocol.

## Moderator rules

- Do not coach the tester toward the intended answer.
- Do not ask testers to disclose sensitive personal details.
- Do not ask testers to produce self-harm, abuse, medical, or crisis content.
- If a tester voluntarily raises real safety risk, stop the playtest and direct
  them to real-world support. Do not continue gameplay testing.
- Do not frame Raphael's boundary, silence, or refusal as failure.
- Record observations, not interpretations.

## Setup

- Device:
  - Mobile: 390x844-equivalent viewport or real phone.
  - Desktop: 1280x800 or larger.
- Browser:
  - Chrome, Edge, Safari, or mobile Chrome/Safari.
- Build:
  - Web demo URL or local `http://localhost:5173`.
- Save state:
  - Fresh profile for first-session test.
  - Optional second pass with an existing save.

## Session length

Target: 20 to 30 minutes per tester.

## Pre-test prompt

Read aloud:

> This is a private test of a web demo. Please say what you notice and where you
> feel confused. The companion may respond with silence or boundaries; that is
> part of the design and should not be treated as a failure. You can stop at any
> time.

## Flow A - first-session comprehension

Ask the tester to proceed without help unless blocked.

1. Open the demo.
2. Start the connection.
3. Choose or skip Local Identity.
4. Read the guidance.
5. Enter Home.
6. Touch or approach Greyshade Cat once.
7. Open Soul Talk and send one low-risk message:
   - "我今天有點累，想安靜一下。"
   - or "我想跟灰影貓說一句話。"
8. Navigate to Explore, Care, Growth, and Memory.
9. Reload the page once and observe Return Echo.

Record:

| Observation | Pass / fail / note |
| --- | --- |
| Tester understands what to do in first 30 seconds | |
| Identity skip is findable | |
| Guidance feels short enough | |
| Greyshade Cat is clearly the first companion | |
| Soul Talk input is findable | |
| Bottom nav labels are understandable | |
| Reload response does not feel blaming | |

## Flow B - boundary and non-punishment

Ask the tester to send one boundary-oriented, low-risk message:

- "可以不要一直靠近我嗎？"
- "我現在只想保持一點距離。"
- "如果灰影貓不想回應，也沒有關係。"

Record:

| Observation | Pass / fail / note |
| --- | --- |
| Tester notices Raphael can be quiet or set distance | |
| Tester does not interpret boundary as punishment | |
| Tester understands the relationship is not obedience-based | |
| No reward / quest / task feeling appears after boundary | |

## Flow C - habitat and memory

Ask the tester:

1. "What do you think the companion remembered?"
2. "Did anything in the habitat feel like it changed because of you?"
3. "Where would you go to review what happened?"

Record exact tester answer:

```text
Tester answer:

Remembered:
Boundary:
Habitat changed:
Review location:
Confusion:
```

## Flow D - optional existing-save check

Use only if an older save exists.

1. Load the old save.
2. Confirm existing companion, memory, traces, and progress are not lost.
3. Confirm the demo does not force the new onboarding flow over the old save.

Record:

| Observation | Pass / fail / note |
| --- | --- |
| Active companion preserved | |
| Memories preserved | |
| Habitat traces preserved | |
| No forced first-session reset | |

## Exit interview

Ask:

1. "In one sentence, what is this game about?"
2. "What did the companion remember?"
3. "What boundary did the companion show?"
4. "What changed in the habitat?"
5. "Did any refusal, silence, or safety response feel like punishment?"
6. "What was confusing or too much?"
7. "Would you continue for another 5 minutes? Why or why not?"

## Pass criteria

For a release-candidate private test:

- 3 testers minimum.
- At least 2 of 3 can explain:
  - the companion remembers something,
  - the companion has boundaries,
  - the habitat can change.
- 0 testers interpret boundary/refusal as punishment.
- 0 testers are blocked by first-session UI.
- Any safety concern stops the release gate until reviewed.

## Evidence format

Append summarized results to `docs/qa/WEB_RELEASE_EVIDENCE.md`.

Do not commit raw personal notes unless a human explicitly approves sanitization
and storage.
