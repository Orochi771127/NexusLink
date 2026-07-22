# Ironflow Hackers Stage 1 Species Motion Translation

The shared 29 animation IDs are semantic intents, not shared poses. This Owner-confirmed Ironflow Hackers roster uses five distinct anatomy families and an all-eight-frame production contract. Owner authorized the selected catalogs for GROUNDWORK runtime promotion on 2026-07-22.

## Production override

- Every action is eight frames.
- Every raw body sheet is generated as a `2×4` grid, then deterministically converted into eight transparent `512×512` frames and a `2048×1024` delivery sheet.
- `sleep` is deep-sleep-only in every frame: eyes closed, already settled, low-amplitude breathing and tiny species-specific secondary motion. No lying-down, waking, eye-opening, standing, or return-to-idle frames.
- `idle_wake` owns all waking motion.
- Body sheets contain no detached projectiles, impact bursts, wide trails, text, UI, scenery, pedestals, or codex framing.

## Motion families

| Family | Character | Datum | Core acting language | Never do |
|---|---|---|---|---|
| Canine signal tracker | ThunderPup | four paws / bottom-center | shoulder-led wolf-pup gait, ear/nose tracking, crystal-ridge pressure, tail-bolt balance | happy-dog panting, feline pounce, adult war-wolf heaviness |
| Feline current scout | WaveCub | four paws / bottom-center | soft shoulder roll, ripple weight shift, dart/pounce restraint, slim wisp-tail steering | canine bounce, adult lion dominance, tiger guard template |
| Grounded avian firebird | Starflame Phoenix | talons / bottom-center | two-leg hop/waddle, head bob, wing mantle, flame-plume fan and settle | four-leg gait, mammal sit, sustained flight at Stage 1 |
| Equine stabilizer | Star Foal | four hooves / bottom-center | hoof cadence, neck arc, ear rotation, mane/crest and star-tail timing | paw gait, cervid bound, feline crouch, saddle/tack |
| Saurian gear-tail analyst | Goldenspark Wyrm | four feet / bottom-center | low deliberate steps, hip/tail counterbalance, rigid dorsal ridge, gear-tail spin | mammal cub bounce, wing flight, fire-dragon aggression |

## Required semantic translations

| Animation ID | ThunderPup | WaveCub | Starflame Phoenix | Star Foal | Goldenspark Wyrm |
|---|---|---|---|---|---|
| `idle_calm` | quiet breath, ear scan, slow tail-bolt pulse | soft ripple weight shift, wisp-tail sway | settled talons, feather breath, low plume flicker | even hoof load, slow neck breath, star-tail glow | low stable breath, slow gear turn |
| `idle_happy` | eyes soften, ridge light opens, restrained tail lift | light paw lift and current-like tail curl | bright bob, half-wing opening, plume warms | ears forward, one light hoof step, crest brightens | head lifts, gear turns smoothly, plates warm |
| `idle_angry` | ears back, ridge rises, circuit lines sharpen | shoulders lower, wisp flares, paws plant | wings mantle, plume compresses then flares | ears pin, neck arches, hooves brace | ridge lifts, gear accelerates, stance lowers |
| `idle_sad` | head lowers, tail-bolt dims, gaze turns away | mane settles, tail-wisp drops, shoulders soften | head tucks, wings close, plume lowers | neck lowers, ears turn aside, star-tail dims | head lowers, gear slows, plates settle |
| `idle_sick` | uneven paw load, flickering circuits, guarded breath | cautious stance, weak wisp, reduced shoulder motion | asymmetric wing support, unstable plume | careful hoof load, lowered neck, crest flicker | low body, irregular gear rotation, dim core |
| `idle_defensive` | body angles away, ridge barrier, tail marks distance | side-on planted paws, mane/wisp barrier | wing mantle and one backward hop | neck raises, ears back, hooves define space | side-on ridge and tail-gear boundary |
| `idle_distant` | gaze tracks elsewhere, tail closes approach | looks past player, wisp forms separation line | rotates head/body away, feathers closed | stands offset, neck turns away | precise half-turn, gear slows, core narrows |
| `idle_enjoy` | relaxed ears, quiet chest pulse, loose tail | relaxed shoulders, soft wisp loop | feather fluff, slow blink, warm plume | gentle neck sway, soft hoof shift | polished plate shimmer, easy gear rhythm |
| `blink` | eyes only; markings fixed | eyes only; mane fixed | avian blink; plume stable | eyes only; crest fixed | eyes only; plate seams fixed |
| `right_walk` / `left_walk` | true canine walk with shoulder lead | true feline walk with shoulder roll | two-leg ground hop/step | true foal walk with hoof cadence | low saurian walk with active tail balance |
| `sit` | haunch sit, ridge/tail arranged safely | feline sit with forepaws planted | grounded perch-settle, wings closed | square stand-rest or species-safe folded rest, not dog sit | low folded-leg saurian rest |
| `sleep` | curled deep sleep, eyes closed, slow ridge pulse | curled deep sleep, eyes closed, tiny wisp drift | compact deep sleep, head tucked, plume breathing only | folded-leg deep sleep, neck supported, eyes closed | low curled deep sleep, gear nearly still |
| `idle_dance` | precise stepping pattern and tail-bolt rhythm | playful paw cadence and wisp spiral | hop-turn with wing/plume flourish | light hoof cadence and star-tail arc | measured foot pattern with gear rhythm |
| `idle_wake` | ears first, eyes open, ridge relights | ears/eyes then shoulders and wisp rise | eyes/head then feather shake and wing settle | ears then head/neck rise, hooves reset | core relights, gear resumes, head lifts |
| `idle_wash` | paw/shoulder grooming around circuits | feline forepaw/face grooming | beak preening across breast/wing | muzzle/shoulder rub and mane shake | careful claw/plate polish, gear inspection |
| `special_angry` | compact ridge flare and warning step | short mane/wisp burst and retreat line | sharp mantle/plume fan without dive | hoof brace, pinned ears, neck warning | ridge flare and fast gear warning |
| `special_sad` | small recoil inward, circuits dim then steady | inward curl and low wisp recovery | wings close around body, plume settles | neck folds inward then regains support | plates close visually, gear pauses then restarts |
| `special_dance` | signal-tracing step pattern | current-loop pounce-free flourish | contained wing-and-plume display | controlled hoof/star-tail flourish | gear-synchronized saurian turn |
| `touch_accept` | one cautious step closer, ears soften | head/shoulder lean, forepaw settles | small hop closer, wing edge softens | neck inclines, one hoof step closer | head inclines, gear slows, stance opens |
| `touch_guarded` | pause, split-ear attention, half-step reserve | shoulder tension and partial retreat | feathers tighten, hop retreat prepared | weight shifts back, ears divide attention | ridge stiffens, tail creates reserve space |
| `touch_reject` | clear step back, ridge/tail boundary | planted paw and shoulder block, short retreat | wing mantle plus backward hop | hoof step back and raised-neck boundary | rigid ridge, tail-gear barrier, step away |
| `hug` | side lean only after consent | stable side/body lean, wisp controlled | wing shelter beside, never arm-like squeeze | neck/shoulder proximity with safe hoof stance | side proximity with tail/gear kept clear |
| `attack_basic` | restrained signal-break feint, body-only | focused current-paw brace, no mauling | marked wingbeat/cry, no projectile | hoof brace and earth-field gesture | forward scan/plate brace, no bite/fire breath |
| `skill_cast` | chest/back node and circuit resonance | chest core and current-ring body pose | chest core, wings and plume resonance | chest core, hoof/ground and star-tail resonance | chest core, back plate and gear synchronization |
| `defend` | ridge/tail arc defines safe space | broad planted stance and wisp shield line | wing mantle/feather ward | raised neck and planted hooves form boundary | ridge, plates and tail gear form barrier |
| `hit` | brief shoulder recoil, paws retain ground | brief current-displaced recoil | feather burst and wing catch | hoof slide and neck recoil | plate jolt, tail counterbalance, no breakage |
| `faint` | protected low curl, core still alive | low sphinx/curl, wisp remains lit | wings close and body settles safely | controlled fold/kneel, no corpse pose | low protected settle, gear/core faintly active |
| `victory` | circuits return to steady scan, calm exhale | current settles, tail-wisp returns to soft loop | wings open once, plume warms, then settles | posture returns, ears forward, star-tail steadies | gear completes one smooth turn, plates/core stabilize |

## QC gates

- Preserve every identity marker across all eight frames.
- Keep complete tails, wings, crests, ears, paws/hooves/talons, dorsal ridges, and gear tips inside each cell.
- Maintain shared scale and stable species datum; frameHeight, not opaque-pixel bounds, governs later runtime scale.
- Reject generic quadruped template leakage, invented weapons, detached effects, text, platforms, or action semantics that punish refusal.
- The selected portrait and 29-action catalogs are approved for the 2026-07-22 runtime promotion package. Future regeneration, Stage 2／3 motion or sustained-flight authority still requires a separate art and GROUNDWORK gate.
