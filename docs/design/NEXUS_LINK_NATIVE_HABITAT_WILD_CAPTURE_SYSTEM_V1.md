# Nexus Link — Native Habitat / Wild Capture / Moonlake Residency System V1

**Status:** Owner design direction / implementation reference  
**Runtime authority:** NONE — this document does not change production behavior by itself  
**Canonical product runtime:** Web-first Nexus Link (PixiJS + Moonlake Three.js hybrid)  
**Unity status:** parallel greybox / asset prototype only; not the production path  
**Primary audience:** Codex / Cursor / Claude Code / future gameplay agents  
**Reference inspiration:** Nintendo DS *Digimon World Championship* gameplay structure and user-provided ROM reverse-engineering, translated into original Nexus Link systems and terminology  
**Repository baseline when written:** `Orochi771127/NexusLink` main around `3b9624e` (2026-08-15)

---

## 0. Why this document exists

The goal is to preserve the part of *Digimon World Championship* that is mechanically compelling:

> **home habitat → world map → native wild habitat → find a creature → circle it → tether/drag it → bring it home → watch it live freely**

Nexus Link adds a layer the reference game did not have:

> **the captured companion remains an autonomous individual with memory, willingness, the ability to leave, and Soul Talk conversations.**

This document intentionally does **not** reduce the design to an abstract “First Link button.”  
The tactile **circle → tether → drag → capture** gameplay is part of the intended game feel.

At the same time, capture must not silently become permanent ownership.

Canonical design principle:

> **The player can capture a companion. The player cannot guarantee that the companion will stay.**

---

# 1. Product thesis

Nexus Link should combine four loops:

```text
NATIVE HABITAT
    ↓
WILD ENCOUNTER
    ↓
CIRCLE / TETHER / DRAG / CAPTURE
    ↓
MOONLAKE RESIDENCY
    ↓
CARE / SOUL TALK / MEMORY / GROWTH
    ↓
STAY / LEAVE / RE-ENCOUNTER
```

The important distinction:

```text
CAPTURED ≠ OWNED
CAPTURED ≠ BONDED
CAPTURED ≠ PERMANENT RESIDENT
```

Capture is a gameplay event.

Relationship, trust, residency and growth are separate systems.

---

# 2. Reference-game findings worth preserving

## 2.1 Native habitat fantasy

Wild creatures should live in their **original ecological habitat**, not spawn from a menu.

A region should feel like somewhere that species already belong:

- lake / wetland
- grassland
- forest edge
- volcanic / warm region
- coast
- ruins
- highland
- night biome
- faction-altered biome

The player enters their world as an outsider.

Wild companions:

- roam
- eat
- sleep/rest
- investigate
- hide
- flee
- react to nearby creatures
- react to terrain
- react to player approach
- sometimes approach voluntarily

The zone should continue feeling alive even if the player does not attempt a capture.

---

## 2.2 World map loop

The world map is the navigation layer between Moonlake and native habitats.

Target flow:

```text
Moonlake
↓
World Map
↓
Choose Region
↓
Region Preview
↓
Enter Native Habitat
↓
Explore / Track / Encounter
↓
Capture or Leave
↓
Return to Moonlake
```

The map is not required to become a giant open world.

Small, dense, replayable diorama zones are preferred.

---

## 2.3 Capture gesture

The reference interaction that Nexus Link should preserve is:

```text
find target
↓
draw a closed loop around target
↓
tether becomes active
↓
target resists / changes direction
↓
player drags while managing tension
↓
target reaches capture/transfer condition
↓
capture result
```

This is valuable because capture success is not only RNG.

The player's hand movement matters.

---

## 2.4 Character animation lesson from ROM forensics

The reference game uses Nintendo DS Nitro 2D resources rather than modern fixed-grid PNG sheets:

```text
NCGR / NCBR  pixel/tile data
NCLR         palette
NCER         Cell/OAM pose composition
NANR         animation banks + frame timing
```

Observed standard contract:

- Main: 40 semantic animation banks
- Sub: 13-bank reduced semantic subset
- most clips are very short (often 1–2 cell frames)
- dedicated restrained/capture poses exist
- effect/presentation layers are separate from many character poses

Important lesson for Nexus Link:

> Do not make 40 independent 8-frame sheets for every companion.

Prefer:

```text
semantic animation state
+
short 1–4 frame clip
+
selected dedicated key poses
+
flip / scale / shake / squash
+
VFX overlay
```

See separate reverse-engineering notes if available:
`DIGIMON_CHAMPIONSHIP_ANIMATION_FORENSICS_V2.md`

---

# 3. Nexus Link canonical interpretation

## 3.1 Native Habitat

A Native Habitat is the companion's original ecosystem.

It is **not** the player's property.

Each zone owns:

```text
regionId
habitatId
biomeTags
timeRules
weatherRules
speciesTable
rareEncounterTable
spawnRules
terrainRules
trackingClues
captureModifiers
ambientEvents
musicProfile
```

Species should have ecological preferences rather than arbitrary spawn lists.

Example:

```text
speciesProfile:
  preferredBiome
  preferredTime
  preferredWeather
  foodTags
  socialPattern
  territorialRadius
  curiosity
  caution
  flightResponse
```

---

## 3.2 Moonlake

Moonlake is the player's shared living habitat.

After capture, a companion may be transported to Moonlake.

Moonlake is **not a cage**.

Captured companions must still be able to:

- walk freely
- rest
- sleep
- eat
- play
- observe scenery
- approach the player
- avoid the player
- interact with other companions
- use authored walkable space
- form preferences
- refuse contact
- leave

Existing Moonlake roaming / world-autonomy systems should be reused where possible.

Do not create `HabitatV2`, `NewHabitatGame`, or a second resident-AI stack.

---

# 4. Companion lifecycle

Use a persistent individual identity.

Suggested conceptual lifecycle:

```text
WILD
↓
SEEN
↓
ENCOUNTERED
↓
TETHERED
↓
CAPTURED
↓
TRANSPORTED
↓
ACCLIMATING
↓
┌─────────────────────┐
│                     │
RESIDENT           ESCAPED
│                     │
BONDED             RE-ENCOUNTERABLE
│                     │
GROWTH             RECOGNITION
```

Exact enum names must be reconciled with current Nexus Link state contracts before implementation.

Do not create a second relationship authority if one already exists.

---

# 5. Capture is allowed; ownership is not implied

This design intentionally keeps **literal capture gameplay**.

The player may:

- chase
- circle
- tether
- drag
- transport

The system must not automatically interpret this as:

- permanent ownership
- automatic trust
- automatic bond
- automatic obedience
- automatic Growth
- automatic memory intimacy

A newly captured individual may have:

```text
trust = low
stress = high
curiosity = variable
comfort = unknown
willingnessToStay = unresolved
recognitionOfPlayer = true
```

The player has achieved a successful capture.

They have **not** completed a relationship.

---

# 6. Wild AI

Minimum wild state machine:

```text
Idle
Wander
Forage
Observe
Curious
Alert
Hide
Flee
TerritorialDisplay
Tethered
Struggle
ExhaustedOrCalm
Escape
CaptureTransition
```

Temperament profiles:

```text
timid
curious
territorial
social
playful
heavy
clever
nocturnal
flying
predatory
```

The same capture mechanic should feel different because the creature's behavior differs.

Examples:

### Timid
- keeps distance
- sudden burst escape
- high Alert gain

### Curious
- may approach
- easier initial loop
- may reverse direction unexpectedly

### Territorial
- may charge rather than flee
- strong resistance
- less distance avoidance

### Clever
- lateral feints
- changes direction
- attempts to cross player's gesture path

### Heavy
- slow
- high drag resistance
- stable but difficult to reposition

---

# 7. Circle detection

Mobile portrait is the primary control target.

The player draws a freehand gesture.

A valid circle attempt should evaluate:

```text
closureDistance
enclosedTarget
minimumArea
maximumArea
strokeLength
gestureDuration
selfIntersection
targetMovementDuringGesture
```

Do not require a geometrically perfect circle.

The intended feeling is:

> “I managed to loop around it.”

not:

> “I passed a handwriting-recognition exam.”

Potential reuse candidate already in repo:

- `src/engine/resonanceCircleEngine.js`
- `docs/design/STANDOFF_RESONANCE_CIRCLE_R2_CONTRACT.md`

Codex must audit whether its geometry/determinism can be reused without inheriting inappropriate battle semantics.

Do not duplicate circle math unless necessary.

---

# 8. Tether / drag system

Once the loop succeeds:

```text
CIRCLE_SUCCESS
↓
TETHER_ACTIVE
```

Player finger position becomes a control input.

Core variables:

```text
tension
stability
targetResistance
targetVelocity
playerPullVector
escapePressure
terrainResistance
tetherIntegrity
```

Recommended feedback:

```text
LOW TENSION
target can gain distance

IDEAL TENSION
player can influence direction

HIGH TENSION
stress rises / tether integrity drops / target may break free
```

The system should not be a disguised HP bar.

There is no requirement to damage the creature to zero health.

---

# 9. Capture completion

Preferred spatial version:

The player must guide the tethered companion toward an authored:

```text
Capture Gate
Transfer Point
Resonance Gate
```

Exact terminology remains an Owner naming decision.

Possible completion contract:

```text
insideCaptureZone
AND
stability >= threshold
AND
tetherIntegrity > 0
AND
target not in hard-break state
```

Then:

```text
CAPTURE_SUCCESS
```

The capture may still influence the companion's initial emotional state.

Example:

```text
gentle stable capture
→ lower initial stress

repeated high-tension capture
→ higher initial stress
→ lower early willingness to stay
```

This creates a connection between capture skill and later relationship behavior without turning capture into Bond XP.

---

# 10. Tools

Tools can modify capture space but should not become “better gear = guaranteed ownership.”

Candidate tool families:

```text
Tether
Lure
Barrier
Signal Pulse
Scanner
Food/Scent Attractor
Stabilizer
```

Effects can include:

- reduce burst movement
- reveal temperament
- reduce Alert
- modify pathing
- temporarily create a route constraint
- improve tether tolerance

Avoid permanent hard-control tools in Moonlake.

---

# 11. Moonlake acclimation

After transport, the companion enters an acclimation period.

Suggested state variables:

```text
stress
comfort
trust
curiosity
willingness
familiarity
socialComfort
habitatAffinity
escapeIntent
```

Do not expose all of them as numeric HUD bars.

They may remain deterministic internal state and be communicated by behavior.

Player-visible signals:

- keeps distance
- sleeps near exit
- watches player
- refuses touch
- eats only when player moves away
- starts using central plaza
- approaches voluntarily
- initiates Soul Talk
- chooses to stay close

---

# 12. Escape / leave system

This is not optional flavor.

If capture is part of Nexus Link, **real ability to leave is the mechanism that prevents capture from becoming permanent ownership.**

Do not implement escape as a flat:

```text
5% random chance per day
```

Use a deterministic/weighted intention model.

Concept:

```text
escapeIntent =
  stressPressure
+ lowComfortPressure
+ lowTrustPressure
+ habitatMismatch
+ repeatedCoercion
- familiarity
- voluntaryPositiveExperience
- socialAttachment
```

Before leaving, the companion should show behavior.

Example:

```text
stays near edge
↓
checks exit
↓
avoids interaction
↓
moves toward exit
↓
leaves
```

The player should have the ability to improve conditions.

The player should **not** have a permanent “lock the door” action.

---

# 13. Persistent identity after escape

Never treat escape as deleting the companion.

Maintain identity:

```text
companionInstanceId
speciesId
personalitySeed
temperament
encounterHistory
captureHistory
escapeHistory
relationshipHistory
memoryRefs
lastKnownRegion
recognitionState
```

After escape:

```text
status = wild_or_escaped
lastKnownRegion = ...
```

The same individual can later reappear.

Second encounter can reflect history:

```text
recognizesPlayer = true
alert differs
trust differs
fleeDistance differs
approachChance differs
```

A companion that left may eventually return voluntarily.

This is a signature Nexus Link difference.

---

# 14. Soul Talk integration

Once a companion is in Moonlake and the current relationship/safety contract permits interaction, Soul Talk may be available.

Soul Talk adds:

- conversation
- remembered history
- personality expression
- reaction to capture experience
- reaction to Moonlake
- reaction to leaving/returning
- relationship continuity

LLM output must not directly decide deterministic gameplay truth.

Raphael / hosted model may describe or respond.

The deterministic game layer must own:

```text
capture success
tether state
escape state
residency state
Growth evidence
Bond mutation
Trust mutation
map unlock
spawn
inventory
```

---

# 15. Relationship and Growth boundary

Do not create:

```text
Capture XP
Training XP
Stay XP
Pet ownership level
```

Capture may produce an encounter/event record.

Growth must continue to use the existing canonical Growth/evidence/readiness architecture.

Relevant existing systems to audit:

- `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`
- `src/ui/companionGrowthController.js`
- `src/engine/reflectionGrowthOwner.js`
- current Growth QA suites

A wild capture must not silently become a shortcut around Growth sovereignty.

---

# 16. World map and region progression

The map should communicate ecology and discovery.

Region preview may show:

```text
biome
time
weather
knownSpecies
unknownSilhouettes
environmentDifficulty
recommendedToolTier
discoveryProgress
```

Do not reveal the full encounter table immediately.

Possible unlock inputs:

- exploration
- chapter progression
- discovery
- companion ability
- Growth milestone
- world event
- faction/world-state change

Avoid one-dimensional Battle Rank gating.

---

# 17. Native habitat persistence

A captured companion should not make its species disappear from the ecosystem.

Native habitats remain living populations.

Distinguish:

```text
species population
```

from:

```text
individual companion instance
```

If one individual is captured, other members of the species can still appear.

If that same individual escapes Moonlake, it may be reinserted into an appropriate region pool.

---

# 18. Multi-companion Moonlake

As roster size increases, Moonlake needs population rules.

Do not render an unlimited number of companions simultaneously.

Separate:

```text
known companions
resident companions
active visible residents
away / roaming residents
escaped companions
```

Possible visual population budget:

- small number actively rendered
- others represented as elsewhere in Moonlake / off-scene activity
- deterministic rotation based on schedules/preferences

Do not fake deletion merely for performance.

---

# 19. Animation contract for Nexus Link

The wild/capture/residency loop should request semantic animations.

Suggested base contract:

```text
locomotion:
  idle
  blink
  walk
  run
  flee

life:
  sleep
  eat
  rest
  happy
  angry
  alert
  observe

wild:
  forage
  curious
  territorialDisplay
  hide

capture:
  tetherIdle
  tetherWalk
  tetherRun
  tetherStruggle
  tetherBreak
  captureTransition

moonlake:
  acclimating
  approach
  avoid
  careReaction
  leave
  return

optional:
  hit
  guard
  down
  training
  combatAttack
```

Species-specific AnimationSets can fulfill these with:

- dedicated frames
- reused short clips
- mirror
- transform
- shader/palette
- VFX

Gameplay code should not know raw sprite-frame indices.

---

# 20. Existing Nexus Link systems to reuse before creating anything new

Codex must inspect current main first.

Known likely reuse points include:

```text
src/ai/worldAutonomy/
src/ui/mapController.js
src/engine/resonanceCircleEngine.js
src/engine/resonanceInviteEngine.js
src/ui/companionGrowthController.js
src/engine/reflectionGrowthOwner.js
src/state/
Moonlake PixiJS + Three.js habitat pipeline
current Soul Talk / Raphael runtime
```

Also inspect:

```text
docs/architecture/RUNTIME_MAP.md
docs/architecture/HABITAT_SYSTEM_MASTER_SPEC.md
docs/design/STANDOFF_RESONANCE_CIRCLE_R2_CONTRACT.md
docs/design/COMPANION_GROWTH_CONTRACT_V1.md
docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md
AGENTS.md
CLAUDE.md
ACCEPTANCE.md
```

This design must integrate with the canonical runtime instead of becoming a parallel minigame repo.

---

# 21. Save/schema implications

This feature likely requires persistent state for:

```text
individual wild companion identity
capture history
residency status
escape status
last known region
recognition
habitat affinity
possibly acclimation variables
```

Do **not** add these fields directly until current save governance is audited.

If persistent schema changes are required:

> follow the repository's GROUNDWORK / schema-change governance first.

Do not change `STORAGE_KEY` casually.

No fake migration.

Old saves must remain loadable or fail under an explicitly approved migration contract.

---

# 22. Vertical Slice V1

Do not build the entire world first.

Minimum proof:

## Home
- current Moonlake
- one existing companion can roam normally
- one newly captured companion can be introduced

## World map
- one new native-habitat entry

## Native Habitat
- one small 2.5D zone
- 1–3 minute exploration session
- 3 temperament archetypes if assets allow, otherwise 1 fully proven species

## Capture
- touch-drawn circle
- tether
- drag
- tension
- escape/break
- capture success

## Return
- captured individual appears in Moonlake
- walks freely
- has acclimation behavior
- Soul Talk can address that individual if relationship/safety rules allow

## Leave
- one deterministic test path that can make the individual leave Moonlake
- same `companionInstanceId` remains persisted
- re-encounter path is demonstrable

---

# 23. Required player test

The vertical slice is not complete because automated tests pass.

Human/mobile questions:

1. Can a player understand where to find a native habitat?
2. Does the wild zone feel inhabited rather than like a capture menu?
3. Is drawing the loop satisfying on 390×844?
4. Can the player tell why the loop failed?
5. Is dragging skillful rather than tiring?
6. Does each temperament feel different?
7. Does capture success feel earned?
8. Does the companion feel different after arriving at Moonlake?
9. Does free roaming make it feel alive?
10. If it leaves, does the player understand that it was not deleted?
11. Does re-encountering the same individual feel meaningful?
12. Does Soul Talk make that individual feel continuous rather than like a generic species template?

The retention question:

> **After returning to Moonlake, does the player want to go back out and meet another individual?**

---

# 24. QA contracts

## Geometry
- loop closure
- target enclosure
- multi-touch rejection
- pointer cancel
- offscreen gesture
- very small loop
- huge loop
- target crosses boundary during draw

## Tether
- low tension
- ideal tension
- high tension
- target burst
- tether break
- capture-zone entry

## Wild AI
- flee
- hide
- curious approach
- territorial behavior
- no impossible pathing

## Persistence
- capture → reload
- Moonlake residency → reload
- escape → reload
- re-encounter same instance → reload

## Relationship
- capture does not auto-max Bond/Trust
- capture does not produce free Growth
- escape does not erase memory identity
- re-encounter preserves allowed continuity

## Safety
- high-risk Soul Talk remains governed by existing Raphael safety rules
- wild/capture state does not bypass safety terminal behavior

## Regression
- First Session
- Moonlake roaming
- current map
- Soul Talk
- Growth
- Reflection
- save/load
- mobile layout

---

# 25. Implementation phases

## Phase 0 — Read-only reconciliation
Codex audits current main and this document against actual runtime.

Deliver:

- REUSE
- MODIFY
- CREATE
- DO NOT TOUCH
- CONTRACT CONFLICT
- SAVE IMPACT

No production changes yet.

## Phase 1 — Data contracts
Define Region / WildIndividual / Encounter / Tether / Residency contracts.

## Phase 2 — Native Habitat vertical zone
One playable zone with autonomous wild movement.

## Phase 3 — Circle gesture
Reuse or adapt existing deterministic circle engine.

## Phase 4 — Tether and drag
Implement tension/stability/resistance and mobile feedback.

## Phase 5 — Capture transition
One capture gate and deterministic outcome.

## Phase 6 — Moonlake residency
Integrate the same individual into existing Moonlake autonomy.

## Phase 7 — Escape and re-encounter
Persistent identity, leave flow, reinsertion into native habitat.

## Phase 8 — Soul Talk continuity
Allow the existing dialogue stack to address that individual without giving the model gameplay authority.

## Phase 9 — Animation / VFX polish
Short semantic clips, dedicated restrained poses where necessary, resonance effects.

## Phase 10 — Full QA + human mobile playtest

---

# 26. Explicit non-goals for V1

Do not build all of these at once:

- dozens of regions
- full day/night encounter matrix
- full weather ecosystem
- hundreds of species
- breeding
- procedural open world
- MMO persistence
- permanent capture inventory
- trainable XP cage
- second Unity product
- second relationship authority
- second Growth economy
- second Soul Talk implementation

---

# 27. Copyright / reference boundary

Use the reference game to understand:

- interaction topology
- pacing
- state-machine ideas
- animation efficiency
- habitat/world-loop design

Do not ship:

- Digimon names
- Digimon sprites
- original maps
- original UI art
- original sounds/music
- ROM-extracted assets
- copied source code
- original proprietary text

Nexus Link should reproduce the **mechanical insight**, not the copyrighted content.

---

# 28. Owner decisions already captured in this document

The current design intent is:

1. Wild companions live freely in their **native habitats**.
2. The player can enter those habitats through the **world map**.
3. The game should preserve a tactile **circle → tether → drag → capture** interaction.
4. Captured companions can be brought to **Moonlake**.
5. In Moonlake they continue to **walk and live freely**, rather than becoming inventory objects.
6. They can use **Soul Talk** and participate in relationship/memory systems.
7. They may **leave/escape Moonlake**.
8. Escaped companions retain identity and can be encountered again.
9. Capture does not automatically equal ownership, trust, Bond or Growth.
10. Web remains the production runtime; Unity remains a greybox/prototype path unless separately promoted through governance.

---

# 29. Instruction for Codex

When this document is handed to Codex:

> Do not implement from this document alone.

First inspect current `main`, repository governance and existing engines.

Start with:

```text
PHASE 0 — READ-ONLY RECONCILIATION
```

Answer:

1. Which existing circle/resonance code can be reused?
2. Which existing map/habitat/autonomy code can be reused?
3. What state already exists for multi-companion identity?
4. What persistence additions would be required?
5. What exact save-governance gate applies?
6. Does current Moonlake support multiple independent residents safely?
7. What is the smallest vertical slice that proves the entire:
   `native habitat → capture → Moonlake → leave → re-encounter`
   loop?
8. Which current contract would this design violate if implemented literally?
9. What changes are necessary to reconcile those contracts without creating duplicate sources of truth?
10. Which files would be `REUSE / MODIFY / CREATE / DO NOT TOUCH`?

Then stop at the Owner gate.

Do not start broad implementation until the reconciliation plan is approved.

---

# 30. Product sentence

The intended emotional/gameplay identity of this system is:

> **你可以抓住牠一次，但你不能保證牠永遠留下。**

In English:

> **You may capture them once. You cannot guarantee they will stay.**

That tension — tactile capture plus genuine autonomy — is the core differentiator of the Nexus Link version.
