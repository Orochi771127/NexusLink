# Species Motion Translation for the Formal Five

The shared 29 animation IDs are semantic intents, not identical poses. Each formal Heartspark Council member must express the same emotional/gameplay meaning through its own anatomy.

## Motion families

| Family | Character | Locomotion datum | Core acting language | Never do |
|---|---|---|---|---|
| Vulpine quadruped | 焰尾狐（Stage 1 幼態：焰尾小狐） | four paws / bottom-center | springy steps, tail-led arcs, ear and shoulder anticipation | generic wolf heaviness, permanent flame smear, dog-like panting |
| Feline quadruped | 星紋小虎 | four paws / bottom-center | grounded weight shifts, shoulder-led steps, tail balance, deliberate paw placement | fox bounce, bear lumber, submissive pet obedience |
| Cervid hoofed | 芽角小鹿 | four hooves / bottom-center | light hoof steps, neck and ear phrasing, cautious lateral retreat, antler clearance | canine sit, paw grooming, feline pounce, antler rubber-bending |
| Avian | 金羽小梟 | talons when grounded; controlled return datum in flight | head turns, feather compression, wing mantle, hop, short low flight | four-leg walk, mammal hug, wing-arms with fingers, continuous hovering by default |
| Aquatic hover | 晶鰭小海馬 | stable hover datum at lowest tail-curl point | fin waves, tail coil/uncoil, buoyant vertical drift, water-resistance timing | feet, floor impacts, walking, sitting on haunches, gravity-only collapse |

All exports keep a bottom-center Pixi anchor. For the seahorse this is a stable invisible hover datum, not a foot baseline. For airborne owl frames the animated body may rise, but the action must return to the same grounded/perched datum without snapping.

## Required semantic translations

| Animation ID | Fox | Seahorse | Deer | Owl | Tiger cub |
|---|---|---|---|---|---|
| `idle_calm` | quiet breath; slow flame-tail flicker | gentle fin pulse; tiny buoyant rise/fall | soft breath; ear turn; still hooves | settled stance/perch; feather breathing; small head turn | grounded breath; slow tail balance |
| `idle_happy` | brighter tail plume; short forepaw lift | brighter crystal pulse; open fin fan | lifted neck; leaf flutter; one light hoof step | feather fluff; half-spread wings; bright chirp posture | softened shoulders; tail-tip lift |
| `idle_angry` | ears back; flame compresses then flares | tight tail coil; fins rigid; crystals pulse sharply | lowered neck; hooves brace; antlers held clear | feather compression; wing mantle; fixed stare | lowered center; planted paws; restrained shoulder tension |
| `idle_sad` | flame dims; head and tail lower | slow sink; fins narrow; tail curls inward | neck lowers; ears turn away; leaves settle | feathers close; head tucks; gaze turns aside | shoulders lower; tail rests close |
| `idle_sick` | unstable flame and cautious weight shift | uneven buoyancy; reduced fin cadence | unsteady hoof load; drooping leaves | asymmetric feather set; low wing support | guarded stance; shallow breath |
| `idle_defensive` | side-on distance; tail barrier | tail and crystal fins form a shielded curl | step back; body angled away; antlers protect space | wings mantle around body; one backward hop | broad planted stance; shoulder barrier |
| `idle_distant` | looks away; tail closes the approach line | drifts slightly deeper/back; gaze avoids | neck turns away while body stays present | rotates body/head away; feathers closed | sits or stands offset; tail between spaces, not legs |
| `idle_enjoy` | relaxed flame ripple; soft ear movement | slow spiral drift; crystal shimmer | gentle leaf sway; relaxed jaw | comfortable feather fluff and slow blink | relaxed paw shift and tail curl |
| `blink` | eyelid only; markings fixed | eyelid only; no crystal popping | eyelid only; antlers fixed | avian blink/readable nictitating suggestion without realism shock | eyelid only; stripes fixed |
| `right_walk` / `left_walk` | true fox walk/trot | horizontal swim with tail steering | hoofed walk with clean gait | ground hop/step for short range; low flight only when action config says so | deliberate feline walk |
| `sit` | haunch sit, flame tail arranged safely | stationary hover with tail forming a stable spiral | fold legs into cervid rest or stand-rest; never dog sit | perch/ground settle with wings closed | feline sit with forepaws planted |
| `sleep` | curl with flame reduced, never extinguished | suspended sleep; tail anchored to invisible current or gentle coil | legs folded, neck relaxed, antlers uncropped | head tucked, wings closed, stable perch/ground nest pose | curled or sphinx-like rest |
| `idle_dance` | playful step and tail arc | spiral swim loop | light hoof cadence and leaf rhythm | hop-turn with controlled wing flourish | cub-like paw step and tail rhythm |
| `idle_wake` | ear-first wake; flame brightens | crystal pulse resumes; fins open | ears then neck rise; leaves revive | eyes/head first, then feather shake | ears/eyes then shoulder rise |
| `idle_wash` | species-correct paw/shoulder grooming | fin and tail self-cleaning current pass | muzzle/shoulder rub or leaf shake; no paw wash | beak preening along breast/wing | feline forepaw/face grooming |
| `touch_accept` | small approach; tail opens | swims closer; tail loosens | neck inclines; one hoof step closer | small hop closer; wing edge softens | head/shoulder lean without surrendering stance |
| `touch_guarded` | half-step pause; ears monitor | freezes drift; tail partly coils | weight shifts back; ears split attention | feathers tighten; one talon/hop retreat prepared | shoulder tension; head turns to monitor |
| `touch_reject` | clear step back; tail/flame marks distance | sharp backward current; closed fins and coiled tail | hoof step back; neck/antler boundary line | wing mantle plus backward hop; no attack dive | planted paw and shoulder block; short retreat |
| `hug` | side lean only after consent | protective spiral proximity; no mammal embrace | neck/shoulder proximity with safe antler angle | wing shelter beside player/companion; not arm-like squeezing | side/body lean with stable paws |
| `attack_basic` | restrained flame-tail pulse or forward feint | focused current pulse | hoof brace plus antler/leaf resonance projection | marked wingbeat/cry that reveals the rift | paw brace and earth pulse; no mauling |
| `skill_cast` | chest gem and flame spiral resonance | crystal-fin wave and memory-current ring | antler/leaf growth resonance | golden feather scan / wing sigil | chest star and ground-boundary field |
| `defend` | tail/flame arcs into boundary | curled tail and fins form water shield | antlers and planted hooves define safe space | wing mantle / feather ward | broad stance and starcore barrier |
| `hit` | brief recoil, flame stutter | displaced current and momentary sink | hoof slide/neck recoil with antlers safe | feather burst and wing catch | shoulder recoil; paws retain ground |
| `faint` | low protected curl; flame ember remains | slow controlled sink with living fin movement | kneel/fold safely; never antler impact | wings close and body settles safely | low sphinx/curl; never corpse pose |
| `victory` | flame returns to warm steady glow | calm upward spiral and crystal clarity | leaves open and posture returns | wings open once, then settle to watch | grounded exhale and relaxed boundary stance |

## Production consequences

- Do not generate all five characters from one quadruped prompt template.
- Prepare separate action configs for each motion family even when the `animation_id` is shared.
- Pilot order for this roster: fox locomotion/consent, owl perch/flight, seahorse hover/current, deer hoof/antler clearance, tiger grounded boundary.
- The owl and seahorse require dedicated baseline/hover-datum QC before broad animation production.
- The deer requires antler safe-area tests at 390x844 before any full catalog run.
- The five formal companions should begin with P1 identity and boundary actions; P2/P3 bulk generation waits for human approval of the pilot sheets.
