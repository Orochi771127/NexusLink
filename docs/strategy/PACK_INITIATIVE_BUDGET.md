# Initiative Budget (Product Pack C)

- **Status:** Phase 1 shipped
- **Owner authorized:** 2026-07-25

## Objective

Name and export the existing ambient initiative limits as an **Initiative Budget**
contract so designers / gates / future UI share one vocabulary — without adding
daily caps, streaks, or FOMO persistence.

## Contract (session-only)

| Field | Meaning |
|---|---|
| `sessionCap` | Max ambient moments per app session (`2`) |
| `used` / `remaining` | Moments spent / left this session |
| `blocks` / `blockReasons` | Why initiative is held back |
| `nextEligibleAt` | Earliest retry time for boot quiet / interval (else `null`) |
| `persistence` | Always `"session_only"` |
| `dailyCap` | Always `null` (explicit non-goal) |

Limits remain `AMBIENT_INITIATIVE_LIMITS`:
- boot quiet 90s
- min interval 4 min
- session cap 2

## API

- `getAmbientInitiativeBudget(input)` in `src/ai/autonomy/initiativeCooldown.js`
- `companionInitiativeController.getBudgetView()`

## Acceptance

`node docs/qa/initiative-budget-cases.mjs`

## Out of scope

- Daily / calendar persistence
- Player HUD counter (optional later; would be qualitative, not FOMO)
- Changing numeric caps without Owner approval
