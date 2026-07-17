# Tool Evaluation Matrix

> **Status:** Decision support only  
> **Rule:** A high score does not authorize implementation. Canon fit and owner approval remain mandatory.

## 1. Scoring Model

Score each dimension from 0 to 5.

| Dimension | Weight | 0 | 5 |
|---|---:|---|---|
| Canon fit | 25% | Contradicts core emotional contract | Directly reinforces it |
| Companion advantage | 20% | Companion is decorative | Memory/autonomy materially improve the job |
| User frequency | 10% | Rare or hypothetical | Weekly or daily recurring job |
| Differentiation | 10% | Commodity feature | Difficult to copy without Nexus Link systems |
| Retention value | 10% | No credible return effect | Builds durable voluntary return behavior |
| Revenue or acquisition value | 5% | No strategic value | Clear, ethical commercial or acquisition role |
| Technical reuse | 5% | Requires unrelated architecture | Reuses existing state, animation, memory, habitat |
| Privacy and safety | 10% | High harm or sensitive-data burden | Minimal data and low downside |
| Reversibility | 5% | Hard to remove | Isolated, flaggable, disposable experiment |

### Weighted Score

```text
Total = Σ(score / 5 × weight)
```

The result is expressed as a percentage.

## 2. Hard Vetoes

A proposal is rejected regardless of score when it:

- violates the Master Canon's autonomy, boundary, anti-FOMO, or anti-ownership rules;
- requires deceptive emotional manipulation;
- makes medical, legal, or financial authority claims without a separately governed specialist product;
- creates unacceptable privacy or security exposure;
- cannot fail safely;
- converts the companion into a notification or productivity enforcement mechanism;
- requires a major architecture commitment before user demand is validated.

## 3. Decision Bands

| Score | Default interpretation |
|---:|---|
| 80–100 | Strong candidate for a scoped prototype, subject to veto review |
| 65–79 | Research or technical spike; unresolved risks remain |
| 50–64 | Incubator only; likely needs redesign or external mode |
| 0–49 | Reject for core product or consider spinout |

## 4. Example Assessment

| Concept | Fit | Companion | Frequency | Diff. | Retention | Commercial | Reuse | Safety | Reversible | Result | Disposition |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Emotional check-in | 5 | 5 | 5 | 4 | 5 | 3 | 5 | 3 | 5 | 91% | Prototype candidate |
| Shared grounding | 5 | 5 | 4 | 4 | 4 | 3 | 5 | 3 | 5 | 87% | Prototype candidate |
| Weather ambience | 5 | 4 | 5 | 3 | 3 | 2 | 4 | 5 | 5 | 83% | Integration candidate |
| Focus preparation | 4 | 3 | 5 | 2 | 3 | 2 | 4 | 5 | 5 | 72% | Small experiment |
| Walking companion | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 3 | 4 | 74% | Research / experiment |
| Language tutor | 2 | 3 | 5 | 2 | 4 | 4 | 2 | 4 | 4 | 57% | External-mode research |
| Email triage | 1 | 1 | 5 | 1 | 3 | 4 | 0 | 2 | 2 | 30% | Spinout only |
| Financial coach | 1 | 1 | 4 | 1 | 2 | 3 | 0 | 0 | 2 | 19% | Reject for Nexus Link |

These scores are illustrative hypotheses, not evidence.

## 5. Experiment Contract

Before implementation, define:

```text
Hypothesis:
Target cohort:
Prototype boundary:
Maximum engineering time:
Data collected:
Success threshold:
Failure threshold:
Safety stop condition:
Removal plan:
Owner who decides continuation:
```

## 6. Evidence Requirements by Stage

| Stage | Minimum evidence |
|---|---|
| IDEA | Clear user job and Canon analysis |
| RESEARCH | Competitor scan, user evidence, risk map |
| EXPERIMENT | Testable hypothesis, prototype, kill criteria |
| CANDIDATE | Demonstrated user value and manageable cost |
| APPROVED | Owner decision, authoritative roadmap entry, task pack |

## 7. Portfolio Constraint

Do not evaluate tools independently only. Every approved feature consumes product attention, interface complexity, maintenance capacity, and user comprehension.

A proposal can be individually useful and still be strategically harmful when it:

- weakens the core loop;
- competes with more important commercial work;
- adds a new permission or data category;
- creates another surface users must understand;
- teaches users to perceive Nexus Link as a generic assistant.

The portfolio should prefer a small number of mutually reinforcing rituals over a large catalog of unrelated utilities.
