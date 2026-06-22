# Habitat Scene Profile Spec

*Status: PROPOSAL · Scope: architecture only (no implementation) · Stack: HTML / CSS / Vanilla JS / PixiJS v8 / localStorage / GitHub Pages*

> Builds on the Moonlake / LakeNightCamp_v2 browser audit. Audit finding: the background is `cover`-scaled + screen-centered while companion / props / traces / sun / moon all use the bottom-anchored 390×844 safe-zone → cross-aspect coordinate drift; traces currently lack UI-safe, companion-safe, and lake-aware placement rules. This spec defines a reusable per-habitat spatial contract so the same runtime code works across many backgrounds.
>
> This document is design-only. It defines no runtime behavior and changes no code. See §8 for the implementation split.

## 1. Why this exists

A background image alone cannot tell the runtime **where things are allowed to be**. The Moonlake audit proved this: emotional traces, the sun/moon, and the companion are all placed by hardcoded pools/arcs that assume one specific painting and one specific aspect ratio. The moment the viewport changes shape — or a *new* background is introduced — those assumptions break (sun on the water, traces behind the dock, embers floating on a lake).

Every runtime habitat is a **spatial contract**, not just an image. A Scene Profile makes that contract explicit and data-driven, so the same placement/celestial/trace code works across many backgrounds without per-background `if (id === ...)` branching.

A habitat profile must declare:

- **art size** — the master image dimensions (for cover/contain math).
- **sky region** — does this scene even have sky, and where.
- **horizon** — the line celestial bodies rise to / set behind.
- **celestial rules** — enabled? one arc? bounds? twilight length?
- **water zones** — where water-plausible traces (and reflections) may live.
- **ground zones** — walkable shoreline / floor where ground traces live.
- **companion anchor** — the creature's bottom-center baseline.
- **companion reserved area** — the rect nothing opaque may cover.
- **UI forbidden zones** — derived from the DOM overlay (HUD, dock, Soul-Talk).
- **trace placement zones** — named rects traces map into.
- **allowed trace kinds per zone** — water-only vs ground-only vs affinity.
- **viewport QA rules** — what must stay true across aspect ratios.

Without this, every new background is a fresh round of manual coordinate guessing and regression risk. With it, onboarding a background = filling in one data object + passing a checklist.

## 2. Scene Profile Schema

A plain ES-module data object. No classes, no build step, no new deps. All positions are **normalized 0..1 in safe-zone space** (`referenceWidth × referenceHeight`), the same space props/traces already use — except `background` which is governed by `mode`.

```js
// src/data/sceneProfiles/moonlakeProfile.js   (future location; not created this round)
export const moonlakeProfile = {
  id: "moonlake",
  version: 1,
  label: "Moonlake / 心湖夜營",

  artSize: { width: 1080, height: 1920 },

  background: {
    mode: "cover",                 // "cover" | "contain" | "fitHeight"
    day:   "assets/backgrounds/LakeNightCamp_v2/bg_day_base.png",
    night: "assets/backgrounds/LakeNightCamp_v2/bg_night_base.png",
    sameComposition: true          // day & night MUST share layout for zones to be valid
  },

  safeZone: { referenceWidth: 390, referenceHeight: 844 },

  // Sky in safe-zone-normalized space; at runtime the celestial layer is
  // re-anchored to the background's VISIBLE rect so the arc rides the
  // painted horizon regardless of aspect (fixes the audit's core drift).
  sky: {
    exists: true,
    rect: { x: 0.08, y: 0.06, w: 0.84, h: 0.30 },
    horizonY: 0.34
  },

  celestial: {
    enabled: true,
    anchor: "background",          // "background" rides painted horizon; "safeZone" = legacy
    mode: "sharedHorizonArc",      // ONE arc; sun & moon are the same path offset by phase
    xRange: [0.12, 0.88],
    yRange: [0.12, 0.34],          // [noon clamp, horizon]
    twilightMinutes: 45,           // dawn/dusk blend window (replaces binary cutoff)
    fallback: {                    // used if skyRect is too small (extreme aspect)
      sun:  { x: 0.30, y: 0.18 },
      moon: { x: 0.66, y: 0.16 }
    }
  },

  companion: {
    anchor:       { x: 0.50, y: 0.70 },                 // bottom-center baseline (matches runtime 195/588)
    reservedRect: { x: 0.38, y: 0.45, w: 0.24, h: 0.27 } // nothing opaque/large may intersect
  },

  // UI forbidden zones are DYNAMIC: computed at runtime from CSS vars
  // (--top-safe, --bottom-safe, --nav-height, launcher height, --edge).
  // The profile only declares whether to subtract them + any static extras.
  ui: {
    subtractTopInset: true,
    subtractBottomInset: true,
    sideInset: true,
    extraForbidden: []             // optional static rects, e.g. a permanent corner badge
  },

  zones: {
    forbidden: [
      // Static safety net; dynamic UI insets are added on top at runtime.
      { id: "hud_top",    rect: { x: 0.00, y: 0.00, w: 1.00, h: 0.12 }, reason: "HUD" },
      { id: "dock_bottom",rect: { x: 0.00, y: 0.80, w: 1.00, h: 0.20 }, reason: "dock+soulTalk (portrait fallback)" }
    ],
    water: [
      { id: "lake_main", rect: { x: 0.30, y: 0.45, w: 0.36, h: 0.17 }, maxTraces: 4 }
    ],
    ground: [
      { id: "shoreline", rect: { x: 0.30, y: 0.62, w: 0.40, h: 0.12 } },
      { id: "fg_left",   rect: { x: 0.10, y: 0.70, w: 0.20, h: 0.10 } },
      { id: "fg_right",  rect: { x: 0.70, y: 0.70, w: 0.20, h: 0.10 } }
    ],
    affinity: [
      { id: "pier",        kind: "pier",     rect: { x: 0.16, y: 0.55, w: 0.16, h: 0.15 } },
      { id: "crystal",     kind: "crystal",  rect: { x: 0.70, y: 0.58, w: 0.20, h: 0.14 } },
      { id: "campfire",    kind: "campfire", rect: { x: 0.14, y: 0.70, w: 0.18, h: 0.10 } },
      { id: "magicCircle", kind: "platform", rect: { x: 0.40, y: 0.66, w: 0.20, h: 0.08 } }
    ]
  },

  placement: {
    minDistance: 0.06,             // normalized anti-stack spacing
    avoidCompanion: true,
    avoidUiInsets: true
  }
};
```

Supporting structures (also data, no logic in the profile):

```js
// src/data/sceneProfiles/index.js   (future)
import { moonlakeProfile } from "./moonlakeProfile.js";
export const SCENE_PROFILES = { moonlake: moonlakeProfile };
export const ACTIVE_PROFILE_ID = "moonlake";
export function getSceneProfile(id) { return SCENE_PROFILES[id] || GENERIC_FALLBACK_PROFILE; }
```

Design rules for the schema:
- **Normalized everywhere** (except `artSize`/`background`) so it is aspect-independent.
- **Rects, not points**, for any zone (points are zero-area and can't be "avoided").
- **UI forbidden is dynamic** — the profile never hardcodes pixel UI heights; it opts in to runtime-computed insets.
- **Profiles are pure data** — all interpretation lives in a future resolver (`TP-B`), keeping profiles authorable by a non-programmer / art auditor.

## 3. Moonlake First Draft

Derived from the audit's measured runtime coordinates (safe-zone 390×844): companion/magic-circle ≈ (0.50, 0.70); campfire ≈ (0.236, 0.734); crystal ≈ (0.728, 0.737); sun arc x 0.154→0.897 horizon y0.343; moon arc x 0.231→0.949.

| Region | Rect (normalized) | Role |
|---|---|---|
| **HUD forbidden band** | x0–1, y0–0.12 | core-hud + quick-hud; no traces, clamp celestial below it |
| **Bottom dock forbidden band** | x0–1, y0.80→1.0 (portrait) / **y0.73→1.0 (landscape)** | dock + Soul-Talk launcher; **compute from CSS at runtime**, static y0.80 is only a fallback |
| **Sky / celestial arc** | rect x0.08 y0.06 w0.84 h0.30; horizon y0.34 | sun/moon ride this; arc x[0.12,0.88], y[0.12,0.34] |
| **Lake-only zone** | x0.30 y0.45 w0.36 h0.17 | water-plausible traces only; cap ≤4 |
| **Pier zone** | x0.16 y0.55 w0.16 h0.15 | left wooden pier; leaf affinity |
| **Campfire / ember zone** | x0.14 y0.70 w0.18 h0.10 | left foreground fire; ember/ash affinity |
| **Crystal affinity zone** | x0.70 y0.58 w0.20 h0.14 | right shrine/crystal; anxiety/glitch affinity |
| **Companion reserved area** | x0.38 y0.45 w0.24 h0.27 | the cat body + shadow; nothing opaque covers it |
| **Shoreline / ground zone** | x0.30 y0.62 w0.40 h0.12 (+fg corners) | walkable path; ground/boundary traces |
| **Magic-circle platform** | x0.40 y0.66 w0.20 h0.08 | golden_rune / repaired_light |

> Note: the audit found the legacy pools sat *below* their painted features (pier pool below the pier, platform pool below the magic circle). The draft above re-anchors zones to the **real prop/art positions**, not the legacy pools.

## 4. Trace Type Rules

A global taxonomy shared by all profiles; a profile only decides which **zone ids** exist, the taxonomy decides which **zone classes** a kind may occupy. Aliases resolve to real kinds before placement.

```js
// src/data/traceRules.js   (future)
export const TRACE_ALIASES = {
  return_glow:    "glow",
  floating_light: "glow",
  quiet_mist:     "mist",
  calm_trace:     "ripple",
  sadness_trace:  "blue_lantern",
  dim_ember:      "ember",
  boundary_trace: "boundary"   // no current kind; see note below
};

export const TRACE_KIND_RULES = {
  // kind:          placementClass,        lakeAllowed,        companionRule
  glow:           { place: ["any-safe"],   lake: true,         companion: "halo-low-alpha" },
  ripple:         { place: ["water"],      lake: true,         companion: "forbidden" },
  blue_lantern:   { place: ["water"],      lake: true,         companion: "forbidden" },
  mist:           { place: ["water","ground"], lake: true,     companion: "halo-low-alpha" },
  repaired_light: { place: ["platform","ground"], lake: false, companion: "forbidden" },
  golden_rune:    { place: ["platform"],   lake: false,        companion: "forbidden" },
  glitch_noise:   { place: ["affinity:crystal"], lake: false,  companion: "forbidden" },
  white_ash:      { place: ["affinity:campfire","ground"], lake: false, companion: "forbidden" },
  ember:          { place: ["affinity:campfire"], lake: false, companion: "forbidden" },
  leaf:           { place: ["affinity:pier","ground"], lake: "floating-only", companion: "forbidden" },
  boundary:       { place: ["ground"],     lake: false,        companion: "adjacent-only" } // future kind
};
```

Classification summary:

| Property | Kinds |
|---|---|
| **Water-only** | ripple (calm_trace), blue_lantern (sadness_trace) |
| **Water-capable (also shore)** | mist (quiet_mist), glow (return_glow / floating_light) |
| **Ground-only** | repaired_light, golden_rune (platform), white_ash, boundary (boundary_trace) |
| **Crystal-affinity** | glitch_noise (anxiety) |
| **Campfire-affinity** | ember (dim_ember), white_ash |
| **Pier-affinity** | leaf (floating-leaf may drift onto lake edge) |
| **Forbidden near companion** | all except `glow`/`mist` (low-alpha halo) and `boundary` (adjacent-only) |
| **Safe as low-alpha background** | glow, mist |

> `boundary_trace` has **no existing visual kind**. Interim: treat as a low-alpha shoreline marker placed at the edge of the companion-reserved rect (a "threshold", never mid-lake). A dedicated `boundary` kind is deferred to TP-C.

## 5. Lake Rules

- **May appear on the lake:** `ripple` (calm), `blue_lantern` (sadness — the canonical floating water lantern), `mist`/`quiet_mist` (low fog), `glow`/`floating_light`/`return_glow` (soft reflected light), and *floating* `leaf` only. These read as reflections, fog, or floating light.
- **Must NEVER appear on the lake:** `ember`/`dim_ember`, `white_ash` (fire/ash cannot rest on water), `golden_rune`/`repaired_light` (belong on the magic-circle ground), `glitch_noise` (belongs by the crystal), and any `boundary` marker (a boundary is a shore/threshold concept).
- **Why water is not a generic placement zone:** the lake is the scene's calmest "留白" surface and a reflective plane — dropping fire, ash, runes, or dense markers on it instantly breaks immersion and the Cyber-Taoism stillness. Water also has a different physics-of-belief than ground: only things that float, reflect, or mist are believable. Treating water as "just another rect" is the single most common way placement looks wrong. Cap simultaneous lake traces (≤4) so the surface stays quiet.

## 6. Future Background Checklist

Every new background must answer, before it ships a profile:

1. Does this habitat have **sky**? (sets `sky.exists`)
2. Does it have a visible **horizon**? (sets `sky.horizonY` + celestial anchoring)
3. Does it have **water**? (whether a `water` zone class exists at all)
4. Does it have **walkable ground**? (ground zone; if not, traces fall back to a minimal safe rect)
5. Where is the **companion anchor**? (`companion.anchor`)
6. What is the **companion reserved area**? (`companion.reservedRect`)
7. Which zones are **forbidden by UI**? (confirm dynamic insets are correct for this layout)
8. Which **trace kinds** are allowed, and in which zones? (which zone ids exist)
9. Are **day and night** images the **same composition**? (sets `background.sameComposition`; if false, zones are invalid and must be authored per-phase or celestial/traces disabled)
10. Should **celestial** be enabled or disabled? (indoor/void/cave → usually disabled)

## 7. Fallback Rules

If a habitat has **no profile** (or `getSceneProfile` misses):

- **Do not crash.** Return a `GENERIC_FALLBACK_PROFILE`.
- **Warn once** in console (`console.warn("[sceneProfile] no profile for <id>; using generic fallback")`) — once per session, not per frame.
- **Disable celestial** (or use a single conservative fixed sky anchor) — never run the horizon arc without a declared horizon.
- **Allow traces only in a generic safe ground zone** — a central rect inside the UI insets and outside the companion reserved area (e.g. x0.25 y0.55 w0.50 h0.15), with conservative count caps.
- **Do not use lake-specific or prop-specific placement** — no water rules, no pier/crystal/campfire affinity, no magic-circle. Affinity and water require an explicit, audited profile.

```js
export const GENERIC_FALLBACK_PROFILE = {
  id: "__fallback__", version: 1,
  safeZone: { referenceWidth: 390, referenceHeight: 844 },
  background: { mode: "cover", sameComposition: true },
  sky: { exists: false },
  celestial: { enabled: false },
  companion: { anchor: { x: 0.5, y: 0.70 }, reservedRect: { x: 0.38, y: 0.45, w: 0.24, h: 0.27 } },
  ui: { subtractTopInset: true, subtractBottomInset: true, sideInset: true, extraForbidden: [] },
  zones: { forbidden: [], water: [], ground: [{ id: "safe_ground", rect: { x: 0.25, y: 0.55, w: 0.50, h: 0.15 } }], affinity: [] },
  placement: { minDistance: 0.08, avoidCompanion: true, avoidUiInsets: true }
};
```

## 8. Implementation Split (future — not now)

| Pack | Title | Layer | Depends on | Summary |
|---|---|---|---|---|
| **TP-HAB-0** | Scene Profile Spec + data | Docs + data (EXPERIENCE) | — | This spec → `docs/architecture/...`; then `src/data/sceneProfiles/*` + `traceRules.js` (pure data, no runtime wiring) |
| **TP-A** | Celestial ↔ background coupling | **GROUNDWORK (gated)** | TP-HAB-0 | `pixiApp.js` emits live skyRect/horizonY; one shared arc + twilight; reads `celestial` from active profile |
| **TP-B** | Placement resolver runtime | EXPERIENCE | TP-HAB-0 | `tracePlacement.js` consumes profile zones + dynamic UI insets + companion rect; integrate at `traceVisualMapper.js`; anti-stack |
| **TP-C** | Trace alias taxonomy | EXPERIENCE | TP-HAB-0 | wire `TRACE_ALIASES`/`TRACE_KIND_RULES`; add `boundary` kind |
| **TP-D** | Future-background onboarding | Process/docs | TP-A/B/C | checklist tooling + a dev overlay that draws a profile's zones for QA (no new editor) |

Recommended order: **TP-HAB-0 → TP-A (gated) → TP-B → TP-C → TP-D**.

## 9. Non-goals

- ❌ No parallax / no background repainting / no re-cutting art into layers.
- ❌ No new scene editor (a dev `__NEXUS_SCENE_EDITOR_OBJECTS` path already exists — do not expand it; TP-D's QA overlay is read-only draw, not an editor).
- ❌ No second PixiJS app, no framework/TS/CSS-framework, no build step, no new deps.
- ❌ No multi-habitat expansion now — Moonlake is the only authored profile this round.
- ❌ No trace implementation / no placement runtime in this task.
- ❌ No localStorage key, no save-schema migration (profiles are static data, not saved state).
- ❌ No edits to `pixiApp.js`, `defaultState.js`, or `assets/**` this round.

---

## Final Answers

1. **Is this architecture map necessary before future backgrounds?** **Yes.** Without a profile contract, every new background re-introduces the exact coordinate-drift and bad-placement class of bugs the audit found, and forces per-background special-casing. The spec is the prerequisite that makes backgrounds pluggable.
2. **Can Moonlake use this as the first profile?** **Yes.** The §3 first draft is derived from measured runtime coordinates and is ready to be authored as `moonlakeProfile` (data only) under TP-HAB-0.
3. **Should TP-B wait until this spec is approved?** **Yes.** TP-B (placement resolver) consumes the profile schema; building it before the schema is locked risks rework. TP-B depends on TP-HAB-0. (TP-A also depends on the `celestial`/`sky` shape but can start in parallel once the schema is approved, behind its groundwork gate.)
4. **Minimum document/file to create now:** exactly one doc — **`docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`** (this file). No code, no data modules, no runtime files yet.
