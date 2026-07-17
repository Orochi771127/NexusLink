# Nexus Link Platform Extension Framework

> **Status:** Strategy support document; non-canonical until explicitly promoted  
> **Owner decision required:** Any change to product identity, monetization, core loop, data policy, or runtime architecture  
> **Primary authority:** `NEXUS_LINK_MASTER_CANON_v3.1.md`

## 1. Purpose

This framework defines how Nexus Link may investigate broadly useful tools without allowing feature expansion to dissolve the product into an undifferentiated AI assistant.

The central question is not:

> Can an AI companion perform this task?

It is:

> Does performing this task make the companion relationship, habitat, memory, ritual, or story meaningfully stronger than a normal app would?

## 2. First-Principles Boundary

A tool has four separable layers:

1. **Utility:** What practical job does it perform?
2. **Companion value:** Why should the heart-core companion mediate it?
3. **Game value:** How does it create a meaningful in-world consequence?
4. **Operational cost:** What data, permissions, APIs, safety obligations, maintenance, and support burden does it introduce?

A feature should not enter the core product merely because utility is high. It must also have distinctive companion value and acceptable operational cost.

## 3. Extension Modes

### Mode A — Native Ritual

The utility is transformed into a small, emotionally coherent in-world ritual.

Examples:

- short emotional check-in
- breathing together
- return reflection
- focus preparation
- memory capsule

This is the preferred mode because it reinforces the existing product identity.

### Mode B — Optional Companion Integration

The game reads a narrowly scoped external signal and converts it into companion context without becoming the source of truth.

Examples:

- calendar availability used only to suggest a quiet moment
- weather used to alter habitat ambience
- step count used to create a journey memory, not a fitness score

This mode requires explicit permission, graceful degradation, and no punishment for missing data.

### Mode C — External Companion Utility

A capability is useful but would distort the game interface. It may live in a separate surface, service, desktop helper, or future SDK while preserving the same companion identity.

Examples:

- file search
- meeting summarization
- email triage
- developer workflow assistant

This mode should be treated as a possible spinout, not silently inserted into the habitat game.

### Mode D — Rejected General Utility

The concept is generic, easily copied, operationally expensive, unsafe, or unrelated to the product's emotional contract.

Examples:

- full financial advice
- medical diagnosis
- unlimited notification dashboard
- surveillance-like behavioral scoring
- generic AI super-app features with no companion differentiation

## 4. Admission Gates

A proposal may become a prototype only after passing all gates.

### Gate 1 — Canon Fit

- Does it preserve the companion's autonomy and boundaries?
- Does it avoid ownership, coercion, streak pressure, and FOMO?
- Does it reinforce rather than replace the emotional habitat core?

### Gate 2 — User Job

- Is there a recurring, observable user problem?
- Is the job frequent enough to matter?
- Would users choose this over an existing specialized app?

### Gate 3 — Companion Advantage

- Is the experience substantially better because the same companion remembers context?
- Can the benefit be explained in one sentence?
- Is the companion doing more than decorating a standard utility?

### Gate 4 — Data and Safety

- What personal data is required?
- Can the feature work with minimal or local data?
- What happens when inference is wrong?
- Could the feature create dependency, shame, manipulation, medical risk, financial harm, or privacy harm?

### Gate 5 — Product Economics

- Is this a retention feature, paid feature, acquisition feature, or platform bet?
- What ongoing API and support costs exist?
- Does the feature increase maintenance faster than user value?

### Gate 6 — Reversibility

- Can it be tested behind a flag or isolated prototype?
- Can it be removed without corrupting saves, memories, or Canon?
- Are success and kill criteria defined before implementation?

## 5. Strategic Priority Order

1. Strengthen the existing habitat and companion loop.
2. Add low-risk native rituals with clear emotional value.
3. Test narrow integrations that enrich context.
4. Explore external utilities only after the commercial game loop is stable.
5. Consider a separate product or repository when the utility no longer depends on the game.

## 6. Required Proposal Template

Every extension proposal must include:

```text
Name:
Decision state:
Target user:
User job:
Current workaround:
Companion advantage:
Game-world consequence:
Required data and permissions:
Safety and privacy risks:
Technical dependencies:
Expected retention or revenue effect:
Prototype scope:
Success metrics:
Kill criteria:
Canon conflicts:
Recommended mode: Native / Integration / External / Reject
```

## 7. Repository Split Trigger

A concept should be considered for a separate repository when at least three conditions are true:

- it has an independent product name and user promise;
- most usage occurs outside the habitat game;
- it requires a different runtime, backend, release cadence, or compliance model;
- more than half of its value remains if all Nexus Link characters and world-building are removed;
- it needs independent permissions, billing, support, or enterprise deployment;
- its roadmap would compete with the game roadmap for ownership and priority.

Until then, preserve the idea in this repository as non-canonical research.

## 8. Anti-Patterns

Reject or redesign proposals that:

- add a generic feature only because competitors have it;
- use the companion as a mascot over a conventional dashboard;
- reward compulsive checking, streaks, red dots, or guilt;
- infer mental or physical health conditions as facts;
- centralize large volumes of private data without a necessary product reason;
- create notifications that make the companion feel demanding;
- turn emotional vulnerability into a monetization trigger;
- require permanent infrastructure before validating user demand.

## 9. Current Strategic Interpretation

The broad-market opportunity is not "put every life tool inside Nexus Link." The stronger thesis is:

> Build a companion relationship and emotional habitat distinctive enough that selected real-world signals can become shared memories, rituals, and atmosphere.

That direction preserves differentiation. A general Life OS remains an exploratory spinout hypothesis, not the current identity of Nexus Link.
