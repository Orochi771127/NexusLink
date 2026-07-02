# Nexus Link Next Gameplay Systems Spec

Status: `CONSOLIDATED PLANNING SPEC`
Date: `2026-07-02`
Scope: Visible standoff, memory traces, care, exploration, adventure, and
resonance-care direction for the next gameplay slice.
Runtime authorization: none in this document. Any implementation still needs a
TASK_PACK and the normal GROUNDWORK / EXPERIENCE approval rules.

This is the single consolidated planning file for the ideas captured in this
thread. Do not create additional scattered planning docs for the same topic.

## 1. Product Frame

Nexus Link is still an emotional habitat companion game, not a traditional RPG
combat loop, medical tool, prophecy product, task dashboard, or idle farming
game.

The next systems should make the player understand:

- the companion has boundaries and fatigue;
- exploration and standoff events are emotional pressure, not HP combat;
- important moments can leave visible traces in the habitat;
- care is concrete and low-pressure;
- the companion can act autonomously without becoming an offline resource
  generator.

## 2. Safety Translation Rules

Some external inspiration can fit Nexus Link only after translation into
fictional world mechanics. Keep the psychological mechanism and metaphor; remove
real-world mystical claims.

| Source concept | Nexus Link translation | System surface |
| --- | --- | --- |
| Information overload | noise buildup / heart-core reception overload | Care, Memory, Standoff |
| Frequency mismatch | sync drop / relationship phase drift | Soul Talk, Boundary |
| Collective field pressure | group-field noise / rift resonance | Explore location effects |
| Dimension gate | thinning boundary of the Chaotic Rift | world event / map node |
| Anchor | habitat anchor object | scene interaction |
| Deep breath | heart-core co-breathing | Care action / Standoff action |
| Body signal monitoring | heart-core state cue | low-pressure UI feedback |
| Withdrawal | set boundary / temporary retreat | retreat is not failure |
| Clearing | noise sedimentation / echo sorting | Memory / Care action |

Hard rules:

- Do not frame any system as a real-world prediction or warning.
- Do not diagnose the player as anxious, low-frequency, blocked, dependent, or
  in need of healing.
- Describe companion and habitat state, not the player's mental health.
- Avoid medical, therapy, energy-healing, and spiritual-authority language.
- Keep retreat, rest, and slowing down as valid play choices, not failure.

Preferred fictional wording:

- "The lake has become noisy. We can slow down first."
- "The boundary is thin here. Leaving now keeps both of you steady."
- "The echo did not disappear; it settled somewhere quieter."

Forbidden direction:

- real-world prophecy framing;
- claims that the game heals the player;
- guilt language such as daily breathing reminders;
- reward loops for safety or self-care actions.

## 3. Visible Standoff

Battle must become visible, but it should remain an emotional standoff rather
than ordinary HP combat.

A standoff screen should show:

- companion body language;
- rift, memory knot, noisy echo, or emotional pressure;
- synchronization;
- fatigue;
- selected action and visible result;
- outcome and recovered memory glimmer when applicable.

Core actions:

- `Resonate`: realign with the companion, raises sync, costs some fatigue.
- `Stabilize`: calm the scene, raises stability, low fatigue cost.
- `Set Boundary`: blocks incoming noise, protects fatigue and boundary.
- `Retreat`: leaves safely; this is not failure.

Recommended outcome labels:

- `stabilized`: boundary became stable;
- `recovered`: an echo was sorted or a glimmer was recovered;
- `retreated`: the pair left in time;
- `overwhelmed_but_safe`: pressure was too high, but return is safe.

First event profile:

- Name: `Boundary Thinning`
- Concept: the semantic boundary around a location becomes thin and old echoes
  rise up.
- Copy direction: "The boundary is thin here. Nothing has to be defeated; the
  echo only needs distance, shape, or rest."

## 4. Synchronization And Fatigue

`Synchronization` is temporary alignment between player and active companion. It
exists because the player supports the companion rather than puppeting it.

Sync is affected by:

- trust and bond;
- recent care quality;
- Soul Talk consistency;
- respect for boundaries;
- mood, stamina, and heart-core energy;
- standoff choices matching companion state.

Sync affects:

- action clarity;
- response stability;
- warmth or guardedness in body language;
- quality and clarity of recovered glimmers.

`Fatigue` is the cost of emotional effort and physical action under pressure.
It exists because the companion has limits.

Fatigue comes from:

- intense standoff actions;
- long encounters;
- repeated failed alignment;
- entering pressure while low on stamina or energy;
- memory retrieval and rift pressure.

Fatigue recovers through:

- rest;
- calm habitat time;
- care actions;
- low-pressure Soul Talk;
- heart-core co-breathing;
- successful retreat or boundary-setting.

Red lines:

- Sync is not obedience.
- Fatigue is not a punishment for absence.
- Neither should create daily pressure, monetized recovery, or irreversible bad
  endings.

## 5. Care And Relationship Values

Care should remain a compact low-pressure page. Do not add many permanent care
buttons. If the current UI already has five care actions, keep that density and
upgrade one action instead of adding a sixth.

Recommended v1 action:

- Chinese label: `心核共息`
- English label: `Calm Sync`
- Placement: Care page.
- Implementation choice: replace or upgrade `Clear Noise` / `清理雜訊`.
- Duration: 30 to 60 seconds.
- Interaction: the player may lightly tap with the rhythm or simply watch.
- Visual: companion slow breathing plus heart-core ring expanding and fading.
- Trace: may create `calm_breath_trace`.

Short description:

> Slow down with the companion and let the lake noise settle.

State effects, small and cooldown-limited:

- energy +2 to +5;
- mood +1 to +3;
- touch fatigue -2;
- defense -1 only when not in a refusal state;
- trust +1 only with cooldown and only if boundaries are respected.

Allowed result copy:

- "Its breathing slowed, and the lake became quieter."
- "You did not rush to speak. The rhythm settled between you."
- "This is enough. Slower is okay."

Forbidden result copy:

- curative claims about the player's anxiety or mental state;
- energy-field repair claims;
- the player has not completed today's breathing exercise.

Relationship value definitions:

- `Boundary`: current comfort limit and ability to say no. Improves when refusal
  is respected. Strains when repeated unwanted input continues.
- `Trust`: confidence that the player listens and returns without control.
  Grows through consistency, not direct gift purchase.
- `Stamina`: short-term readiness for movement, play, exploration, adventure,
  and visible actions.
- `Heart-core energy`: deeper emotional capacity for Soul Talk, memory work,
  synchronization, and standoff pressure.
- `Injury`: a visible, treatable state from story, standoff, or adventure. It
  must remain recoverable and never punish late return.

Future care actions can include gift, species-appropriate food/care, treatment,
play props, and contextual rest, but they should rotate or unlock by context
instead of all becoming permanent buttons.

## 6. Explore Surface

Explore should become the main entry point for local routes, world navigation,
standoff records, crystal work, anchors, phase search, and adventure.

Primary entries:

- `View <Current Region> Path`: local story route, progress, next trigger, and
  standoff pressure points.
- `World Map`: scene and chapter switching, gradual unlocks.
- `Standoff Record`: cross-map replacement for lake-specific glimmer wording;
  shows past encounters, sync/fatigue state, outcome, and recovered glimmers.
- `Silent Crystal Cluster`: condenses important glimmers and traces into
  stable inspectable crystals.
- `Adventure`: manual or autonomous route activity, owned by Explore.

Map-specific prototype wording such as `Approach Lake Surface Glimmer` should
not become final terminology because it breaks outside Moon Lake.

### Silent Anchor

`Silent Anchor` is a scene object that helps the companion align before or
during exploration. It turns "anchor" into world interaction, not doctrine.

Possible objects:

- old lake lamp;
- glowing root;
- cracked heart-core stele;
- abandoned server core;
- old observation pillar.

Effects:

- slows fatigue gain during exploration;
- improves sync stability;
- unlocks anchor echoes in Memory;
- reveals subtle local visual traces.

Possible locations:

- Moonlake camp edge;
- starglass corridor entrance;
- mystery mountain foothill;
- abandoned sync station;
- old heart-core observation pillar.

### Phase Search

`Phase Search` is the cost of entering unfamiliar or noisy places. It should
control pacing, not punish the player.

Triggers:

- first entry into a new map node;
- high rift noise;
- low companion energy;
- exploration immediately after emotionally intense Soul Talk.

Visual language:

- slight edge blur;
- faster particles;
- alert ears, tail, eyes, or posture;
- low-key HUD copy: "aligning with local phase."

Choices:

- explore directly: faster progress, higher fatigue;
- find anchor: slower progress, steadier state;
- heart-core co-breathing: lowers noise;
- retreat: preserves state and returns home.

## 7. Memory, Glimmers, And Crystals

Battle/standoff resolution can bring back `memory glimmers`. Important Soul Talk
moments can also become visible traces. Stable traces may condense into
`memory crystals`.

Types:

- `battle glimmer`: recovered from standoff or rift pressure;
- `conversation trace`: born from Soul Talk;
- `travel trace`: returned from adventure;
- `condensed crystal`: stable inspectable memory object;
- `ambient trace`: small habitat mark showing something happened.

Crystal quality means memory clarity, emotional stability, and trace
completeness. It must not mean combat power, gacha rarity, market value, or
status value.

Possible quality labels:

- `faint`;
- `clear`;
- `resonant`;
- `luminous`.

Desktop and mobile behavior:

- desktop hover shows concise information;
- mobile tap opens the same information;
- touch targets must be large enough;
- traces must not hide behind UI, labels, or the companion.

Trace information should include:

- source;
- title;
- emotional tone;
- chapter or region context;
- one short memory line;
- state: fragile, stable, or condensed.

### Echo Sorting

`Echo Sorting` is the Memory-page form of post-event clearing.

After exploration or standoff, Memory can show a new echo. Sorting it can:

- classify it as calm, tired, uneasy, grateful, sad, or similar;
- place a visible habitat trace;
- let the companion add one short line;
- turn a loose glimmer into a crystal when stable enough.

Example copy:

> That sound is still there, but it is not as close now.

## 8. Adventure And Autonomy

Companion autonomy can include manual adventure and small offline adventure
reports, but it must never become dispatch farming.

Placement:

- Explore owns adventure launch and route selection.
- Care prepares and recovers the companion through food, treatment, rest, play,
  and co-breathing.
- Soul Talk or the home return moment owns the report.

Manual adventure:

- player chooses an available route or asks the companion to investigate;
- result can create a travel trace, memory glimmer, or short report;
- deeper than offline adventure.

Offline/autonomous adventure:

- may happen while the player is away;
- must respect mood, trust, stamina, energy, injury, fatigue, chapter, and
  boundary state;
- on return, the companion may say where it went, what it noticed, what it
  avoided, or what it brought back emotionally;
- report should connect to the last remembered player context.

Red lines:

- no daily dispatch pressure;
- no offline resource farming;
- no important story loss while away;
- no punishment for absence;
- no party system or multi-companion combat implication.

Habitat idle examples:

- Moonlake: fish, watch ripples, nap near the campfire, inspect a glimmer.
- Future regions: choose behavior by scene, species, fatigue, and trust.

## 9. New Location Set

Use these as future nodes, not immediate runtime commitments.

| Location | Role | Function |
| --- | --- | --- |
| Moonlake Co-Breathing Spot | early safe zone | Calm Sync, return ritual, low-stimulus care |
| Starglass Corridor | phase-search tutorial | align before unfamiliar exploration |
| Silent Crystal Cluster | anchor location | reduce exploration fatigue, unlock memory echo |
| Mistline Ruins | early boundary-thinning zone | triggers standoff without boss framing |
| Abandoned Sync Station | Iron Hacker trace | shows the cost of control-style protection |

## 10. Priority Order

1. `Heart-core Co-Breathing v1`
   - Cheapest and safest first implementation.
   - Uses Care page.
   - No new map, character, LLM, dependency, or save schema required for v1.
   - Strengthens care as boundary-respecting presence.

2. `Silent Anchor`
   - Turns scenes into meaningful interaction surfaces.
   - Connects Explore to Memory traces.
   - Makes exploration more than tapping forward.

3. `Boundary Thinning Standoff`
   - Most dramatic, but highest risk.
   - Must keep retreat as valid.
   - Must not drift into boss battle or HP victory.

## 11. Data Direction

This is implementation guidance, not a required runtime patch.

Recommended data modules when implementation is approved:

- `src/data/careActions.js`
- `src/data/explorationNodes.js`
- `src/data/standoffProfiles.js`

Minimal care action shape:

```js
{
  id: 'heartcore_breath',
  label: '心核共息',
  labelEn: 'Calm Sync',
  type: 'care',
  description: '和夥伴一起放慢呼吸，讓湖面的雜訊沉下去。',
  effects: {
    energy: 3,
    mood: 2,
    touchFatigue: -2,
    defense: -1
  },
  cooldownMs: 10 * 60 * 1000,
  trace: 'calm_breath_trace',
  animationCue: 'companion_breath_slow',
  vfxCue: 'heartcore_breath_ring'
}
```

Minimal exploration node shape:

```js
{
  id: 'silent_crystal_anchor',
  name: '靜默晶簇',
  region: 'starglass_corridor',
  type: 'anchor',
  actions: ['attune_anchor'],
  effects: {
    sync: 3,
    noise: -2
  },
  memoryTrace: 'silent_anchor_echo'
}
```

Minimal standoff profile shape:

```js
{
  id: 'boundary_thinning_low',
  title: '邊界薄化',
  gauges: {
    stability: 55,
    sync: 45,
    fatigue: 20,
    shards: 12
  },
  actions: ['resonate', 'stabilize', 'setBoundary', 'retreat'],
  safeOutcomes: ['stabilized', 'recovered', 'retreated', 'overwhelmed_but_safe']
}
```

## 12. Completion Levels

### Level 1: Spec Lock

Done when:

- standoff, sync, fatigue, care, memory, explore, adventure, and resonance-care
  terms are defined;
- safety translation rules are accepted;
- Care does not add permanent button bloat;
- crystal quality means clarity/stability, not rarity or power;
- offline adventure is bounded narrative, not farming;
- implementation is split into approved TASK_PACKs.

### Level 2: Vertical Slice Prototype

Done when:

- Care has `心核共息 / Calm Sync` or equivalent v1;
- one visible trace can appear from care, Soul Talk, standoff, or adventure;
- Explore has local path, world map, standoff record, crystal cluster, and
  adventure roles in prototype form;
- one visual standoff can show sync, fatigue, and safe retreat;
- desktop hover and mobile tap can inspect a trace or crystal;
- no save schema or GROUNDWORK file changes occur without approval.

### Level 3: First Playable Integration

Done when:

- battle/standoff, care, memory, exploration, and autonomy form one coherent
  loop;
- players can understand why sync, fatigue, trust, boundary, stamina, energy, or
  injury changed;
- recovered glimmers and condensed crystals remain visible and findable;
- adventure return reports connect to region, state, and remembered context;
- mobile 390x844 layout remains usable;
- no FOMO, diagnosis, prophecy, dependency loop, pet obedience, or idle-farming
  pattern is introduced.

## 13. TASK_PACK Split

1. `Heart-core Co-Breathing v1`
   - Layer: `EXPERIENCE`.
   - Scope: Care action, small state deltas, animation/VFX cue hooks, safe copy.
   - Non-goal: save schema changes.

2. `Explore Surface Rename And Flow`
   - Layer: `EXPERIENCE`.
   - Scope: local path, world map, standoff record, crystal cluster, adventure
     entry labels and UX.

3. `Memory Trace And Crystal UX`
   - Layer: `EXPERIENCE`, `GROUNDWORK` only if persistence changes.
   - Scope: glimmer, trace, crystal, quality, inspect behavior, findability.

4. `Silent Anchor And Phase Search`
   - Layer: `EXPERIENCE`, `GROUNDWORK` only if scene data or assets change.
   - Scope: anchor nodes, phase-search state, low-pressure choices.

5. `Boundary Thinning Standoff`
   - Layer: `EXPERIENCE`.
   - Scope: first visible standoff profile with safe retreat and non-HP
     outcomes.

6. `Adventure And Return Report`
   - Layer: `EXPERIENCE`, `GROUNDWORK` only if persistent report storage is
     introduced.
   - Scope: manual adventure, bounded offline report, travel trace.

## 14. Open Decisions

- Should `Standoff Record`, `Battle Record`, or another shorter label be final?
- Should sync and fatigue be numeric, visual-only, or hybrid?
- Should crystal quality use plain labels or more Cyber-Taoism terms?
- Should stamina and heart-core energy both be visible to players?
- Should adventure launch only from Explore, or should Care show a prepare state?
- Which first autonomous Moonlake behavior should be built first: fishing,
  ripple watching, napping, glimmer inspection, or campfire wandering?
