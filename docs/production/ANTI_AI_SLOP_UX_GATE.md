# Nexus Link Anti-AI-Slop UX Gate

> Status: CURRENT commercial UX quality gate
> Scope: First Session Flow from Start through Return Echo
> Authority: subordinate to the Master Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md`

## Purpose

This gate prevents a visually polished Nexus Link build from shipping with
generic styling, false affordances, or missing edge states. It does not replace
the V3 visual system. It tests whether that system communicates a real,
recoverable product experience.

## Decision Prompt

Before changing a first-session surface, answer all six questions:

1. What is the player deciding here?
2. What might make that decision uncertain or emotionally difficult?
3. What is the single primary action?
4. What can be removed without hiding necessary context?
5. What visible result proves the action worked?
6. If it cannot complete, what remains safe and what can the player do next?

"Clean", "modern", "premium", and similar aesthetic prompts are not design
decisions. A proposal that cannot answer these questions is not implementation
ready.

## Release Blockers

### Generic aesthetic

- Repeated card stacks, emoji decoration, glow, glass, pills, round corners, or
  shadows without information hierarchy or interaction purpose.
- UI chrome competing with the habitat or covering the companion focal zone.
- Copy, component structure, or feedback that could be transplanted unchanged
  into a generic wellness app, dashboard, or RPG.

### False affordance

- Hover, focus, scale, glow, cursor, or pressed styling on an element that has
  no user-visible result.
- A callback that is absent or fails while the interface stays silent.
- A disabled action with no readable reason or alternative.
- A control whose label describes a result the runtime does not produce.

### Missing edge state

- Blank or placeholder content where a first-use empty state is expected.
- Repeated input while an action is already being processed.
- A failure that does not say what was not completed, whether current-session
  state remains available, and what the player can do next.
- Generic messages such as "Something went wrong" without a recovery action.
- Offline language that implies a network dependency in this local-first build.

## First Session State Matrix

| Surface | Player decision | Required proof | Empty / unavailable behavior |
| --- | --- | --- | --- |
| Start | Enter the Moonlake now or leave | One start action changes the visible step | No countdown, reward, or blocked exit |
| Identity | Name this local presence or skip | Enter and skip both reach Guidance | Explain that blank/skip is valid and local |
| Guidance | Continue with choice and boundaries understood | The next step is visible and reload-safe | No checklist, score, or completion reward |
| Home | Approach, speak, or observe | Companion/body-language or status feedback | Habitat remains usable without pressure |
| Explore | Choose a place or observation | Map, atlas, or a real habitat trace opens/changes | Missing handler reports unavailable and preserves place |
| Care | Offer presence while respecting distance | The companion/status visibly responds | Refusal is agency, not punishment |
| Growth | Review relationship change | Real persisted evidence precedes metrics | No milestone pressure when little data exists |
| Memory | Revisit a real trace | Only existing memory/trace can open | Explain how real content appears; do not fabricate it |
| Soul Talk | Speak, pause, retry, or leave | Input has listening/thinking/idle feedback | Failure preserves the typed intent and offers retry/exit |
| Return Echo | Notice continuity without obligation | Show one real persisted trace | No missed-day count, blame, streak, or invented memory |

Every interactive surface uses the view-state vocabulary `ready`, `busy`,
`empty`, `recoverable-error`, `unavailable`, and `completed`. These are
controller/view states only and must not be added to the persisted save schema.

## Evidence Required

- 390x844 and desktop screenshots for each important first-session step.
- Keyboard completion, visible focus, dialog exit, and accessible status output.
- Fresh, interrupted, skipped, mature-save, refusal, empty-memory, and return
  scenarios.
- A check that every hover/focus/glow affordance has a real observable result.
- Honest notes for real-device Safari or Chrome checks that were not performed.
