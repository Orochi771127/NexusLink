# Championship Web Parity R2 — Fields and Presentation

Status: canonical field, route-family, art, UI, renderer, and lifecycle contract

Companion documents: [CHAMPIONSHIP_PRODUCT_ARCHITECTURE_R2.md](./CHAMPIONSHIP_PRODUCT_ARCHITECTURE_R2.md) and [CHAMPIONSHIP_EVIDENCE_AND_RELEASE_GATES_R2.md](./CHAMPIONSHIP_EVIDENCE_AND_RELEASE_GATES_R2.md)

## 1. Verified structural baseline

R2 accepts these bounded structural facts:

- 40 physical CM raising/home environments with variable dimensions;
- 30 physical HM Hunt environments with a 128 × 128 field structure;
- 12 physical BM battle presentation assets;
- only 11 BM fields are currently selectable/addressable in the accepted catalog, creating a hard 12-versus-11 blocker;
- 22 high-level overlay/page-family clusters;
- 216 regular creature resources associated with 40 animation slots each; and
- HM collision evidence that out-of-bounds coordinates block and DATR bit 0 blocks, while other DATR bits and higher-level terrain semantics remain unknown.

These counts do not prove detailed screen behavior, exact transitions, visual semantics, tile size, world scale, camera behavior, field effects, animation meanings, or save rules.

## 2. Common field envelope

All field families use one strict envelope so the engine, router, asset loader, validator, save serializer, and QA tools agree about identity.

```ts
type ChampionshipFieldDefinitionR2 = {
  schemaVersion: number;
  id: string;
  family: "CM" | "HM" | "BM";
  ordinal: number;
  width: number;
  height: number;
  coordinateSpace: "logical-cell";
  layerRefs: readonly ProjectAssetRef[];
  collision: ChampionshipCollisionDescriptor;
  anchors: readonly ChampionshipFieldAnchor[];
  cameraPolicy: ChampionshipCameraPolicy;
  presentation: ChampionshipFieldPresentation;
  evidence: readonly EvidenceClaim[];
};
```

Required invariants:

- `id` is a project-native stable ID; `ordinal` is metadata and is never the durable identity.
- `width` and `height` are positive bounded integers. They describe logical coordinates only.
- Every layer and asset reference resolves through a sanitized manifest entry with digest, dimensions, license/provenance, and bundle key.
- Collision is queried by a pure domain function. The renderer may visualize the result but cannot supply it.
- Anchors are typed as project-authored or verified at exact scope. An unknown source trigger cannot be inferred from a visible prop.
- A field definition contains no mutable player state, creature instance, DOM/Pixi object, filesystem path, URL chosen at runtime, or raw private evidence.
- The validator rejects extra/hidden keys, accessors, non-plain records, hostile or revoked proxies, prototype-pollution keys, absolute/UNC/file-URL paths, and invalid references without throwing across the public boundary.

## 3. CM field family

CM is the Raising Home field family.

| Property | R2 contract |
|---|---|
| Physical definitions | Exactly 40 |
| Dimensions | Variable; each record must declare its own verified or deliberately project-authored dimensions |
| Primary product owner | Raising Home |
| Collision | Must be authored and labelled per field until exact source collision semantics are verified |
| Placements | Creature residents and interactive objects are mutable instance state, not catalog definition state |
| Release rule | A 40-record count alone is insufficient; every definition needs dimensions, asset manifest, collision status, and evidence grade |

R2 must not normalize all CM fields to one convenient size or derive their size from an image element at runtime. It also must not claim that project-authored care stations, training affordances, exits, or object interactions reproduce source semantics.

The Raising Home vertical slice starts with one project-native CM field and one explicit adaptation rule. Completing that slice proves architecture, not 40-field parity.

## 4. HM field family

HM is the Hunt field family.

| Property | R2 contract |
|---|---|
| Physical definitions | Exactly 30 |
| Field structure | Exactly 128 × 128 logical coordinates per accepted structural evidence |
| Boundary | Any `x < 0`, `y < 0`, `x >= 128`, or `y >= 128` is blocked before any cell read |
| Verified collision bit | `(datrCell & 0x01) !== 0` is blocked |
| Other DATR bits | Opaque/reserved; they cannot affect movement, encounter, terrain, damage, visuals, or triggers without new evidence |
| Primary product owner | Hunt |

The canonical query is conceptually:

```ts
function isHmBlocked(field, x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return true;
  if (x < 0 || y < 0 || x >= 128 || y >= 128) return true;
  return (field.datr[y][x] & 0x01) !== 0;
}
```

This function states only the verified rule. It does not assign names to other bits or prove diagonal policy, slope behavior, dynamic collision, encounter zones, exits, gates, water, hazards, or tile art meaning.

The earlier R1 distinction remains important: 16 logical Gates, 33 runtime field records, and 30 physical HM environments are separate cardinalities. R2 may not collapse them into one list or assume a one-to-one relation until a sanitized mapping is accepted.

## 5. BM field family and hard blocker

BM is the battle field family.

| Property | R2 contract |
|---|---|
| Physical presentation assets | Exactly 12 verified |
| Currently selectable/addressable records | 11 |
| Gap | One physical asset lacks an accepted addressability/selection mapping |
| Runtime consequence | Full BM selection and complete Battle field parity are blocked |

Forbidden workarounds include:

- dropping the twelfth asset;
- aliasing it to an existing field;
- duplicating a field record to make the count equal 12;
- selecting it by guessed ordinal or filename;
- treating “random field” as proof it is reachable;
- claiming the physical asset is merely unused; or
- shipping 11 selectable fields while describing the family as complete.

Before the blocker can close, a sanitized accepted finding must identify the missing mapping or prove the intended non-selectable status, and the catalog/router tests must encode that result. Until then, R2 Battle work may use an explicitly partial fixture but must display and report `BM_ADDRESSABILITY_BLOCKED`.

No verified field modifier, battle collision rule, camera rule, hazard, or arena effect is implied by the existence of a BM asset.

## 6. Overlay and page-family registry

The family index is verified only as a high-level cluster. Slash-separated labels preserve a cluster name; they do not prove that every named sub-screen exists or shares one transition graph.

| Index | Verified high-level family | R2 route policy | Unresolved semantics |
|---:|---|---|---|
| 0 | Hunt | Lazy Hunt page/overlay bundle | Exact sub-screens, transitions, and field binding |
| 1 | Today/calendar/season | Lazy informational bundle | Calendar rules, season effects, time authority |
| 2 | winner/interstitial | Lazy modal bundle | Trigger, duration, dismissal, settlement authority |
| 3 | boot/logo | Shell-only, no gameplay authority | Ordering, timing, skip behavior |
| 4 | Tamer/hunt result/name edit | Lazy form/result bundle | Whether these are separate screens and what persists |
| 5 | Help | Lazy accessible document bundle | Exact topics and context routing |
| 6 | battle common | Shared Battle presentation bundle | Exact common components and state binding |
| 7 | generic list | Shared virtualized DOM list bundle | Contents, callers, selection behavior |
| 8 | battle result/rewards/rank | Lazy result projection | Reward/rank rules and exactly-once settlement |
| 9 | network | Disabled placeholder only | All protocol, matchmaking, account, failure, and security behavior |
| 10 | battle menu/tutorial/match | Lazy Battle setup bundle | Sub-screen boundaries, tutorial and matchmaking semantics |
| 11 | ending | Lazy only after progression authorization | Eligibility, variants, persistence, post-ending state |
| 12 | gate/world/loadout | Lazy Hunt setup bundle | Gate-to-field mapping, loadout rules, transitions |
| 13 | title/login | Product shell; login behavior disabled unless separately authorized | Authentication, profile selection, online dependency |
| 14 | training | Lazy Raising bundle | Training formula, timing, costs, outcomes |
| 15 | cage edit | Lazy Collection bundle | Capacity, move rules, validation, persistence |
| 16 | database | Lazy DOM-first catalog bundle | Discovery rules, filtering, hidden entries |
| 17 | shop | Lazy Economy bundle | Price, stock, unlock, and purchase rules |
| 18 | raising/training | Lazy Raising Home page bundle | Exact relationship between raising and family 14 |
| 19 | battle runtime | Lazy Battle runtime bundle | Simulation-to-animation mapping and HUD details |
| 20 | stub | Non-routable; validator must reject activation | Purpose and any future behavior |
| 21 | movie | Lazy media bundle with accessible fallback | Trigger, media mapping, skip/resume behavior |

Registry invariants:

- All 22 indices exist exactly once in the catalog, including the non-routable stub.
- A family may project to several R2 routes, and a route may use several shared families, but the mapping must be explicit.
- The registry never fabricates a transition graph. Transitions require a verified finding or a named adaptation rule.
- Families 9 and 20 are disabled by default. Family 20 cannot be enabled by configuration.
- Every modal declares focus trap, close/back policy, focus return, save policy, and screen-reader announcement.
- Text-heavy families 1, 5, 7, 13, 15, 16, and 17 are DOM-first. Pixi cannot be their sole representation.

## 7. Animation structure

Accepted structure identifies 216 regular creature resources and 40 animation slots per resource. This establishes a maximum regular-resource slot matrix of 8,640 associations. It does not establish 40 human-readable animation meanings.

R2 represents the structure as:

```ts
type CreatureAnimationAssociation = {
  creatureDefinitionId: string;
  sourceSlot: number; // 0..39 structural identity only
  projectClipId: string | null;
  mappingStatus: "VERIFIED" | "ADAPTED" | "UNKNOWN";
  evidence: readonly EvidenceClaim[];
};
```

Rules:

- `sourceSlot` remains evidence metadata and is not displayed as an animation name.
- Unknown slots do not inherit names such as idle, run, attack, hurt, sleep, eat, victory, or evolution from adjacent projects or genre expectation.
- A project-native clip may be assigned as `ADAPTED` for a specific R2 presentation need, without upgrading the source slot semantics.
- Structural tuples and mirrored relationships already accepted in R1 remain regression fixtures at their exact scope; they do not name every slot.
- A missing clip degrades to a static project-native pose and accessible DOM status. It cannot block domain simulation.
- Animation clocks are presentation-only. A clip completion may request an intent, but the domain clock decides whether the intent is valid.

## 8. Presentation layers

Every active route composes four layers with one-way data flow:

1. **Domain projection:** pure selectors produce immutable view models.
2. **Accessible DOM:** authoritative text, actions, forms, lists, status, dialogs, focus, and fallback.
3. **Pixi scene:** project-native field, creatures, particles, camera, and non-authoritative visual feedback.
4. **Platform adapters:** input, audio, asset loading, visibility, context-loss, and resize events converted to typed intents.

DOM actions dispatch the same typed intents as keyboard/controller/touch bindings. Pixi hit targets may mirror those actions but cannot create a hidden Pixi-only action. HUD values come from one view model; the Pixi scene never calculates a competing value.

The game canvas does not own headings, long instructions, inventory tables, name-edit inputs, help content, save failures, network-disabled status, or legal/accessibility text.

## 9. HUD and responsive UI contract

### 9.1 Safe layout

- Respect CSS safe-area insets on all four sides.
- Minimum interactive target is 44 × 44 CSS pixels; the preferred game-control target is 48 × 48.
- Critical HUD content stays out of the active movement/battle focus area and must not cover the controlled creature at the minimum viewport.
- Long localized labels wrap or reflow; they never reduce body text below the project minimum.
- At 200% browser text/zoom, all actions remain reachable without two-dimensional scrolling in a modal.
- Landscape and portrait may recompose HUD regions, but must not change domain rules or available actions.

Required viewport checks are 320 × 568, 320 × 640, 390 × 844, 844 × 390, 768 × 1024, 1280 × 900, and 1366 × 768 CSS pixels.

### 9.2 Focus and input

- Keyboard and controller navigation use a deterministic focus graph with visible, non-color-only focus.
- Opening a route focuses its declared target; opening a modal traps focus; closing restores the prior target when possible.
- `Escape`/back behavior is explicit for every route and modal and cannot discard an unsaved critical action without confirmation.
- Held directional input is rate-limited and suppressed across route transitions; it cannot generate unbounded domain commands.
- Touch gestures have button equivalents. Hover is never required.
- Screen-reader live regions distinguish domain outcomes from decorative animation.

### 9.3 Motion and sensory settings

- `prefers-reduced-motion` removes camera shake, parallax drift, pulsing, rapid transitions, and nonessential particles.
- Essential state change remains visible through text/icon changes and is never communicated by motion or color alone.
- Flashing content is prohibited. Contrast and focus styling follow the production accessibility gate.
- Audio is user-initiated, independently adjustable, captioned/described where it conveys information, and never required for timing.

## 10. Project-native art and IP firewall

R2 reproduces structure and verified mechanics, not source expression.

Required policy:

- All runtime creatures, fields, objects, icons, typography, HUD frames, particles, logos, movies, and audio are original NexusLink assets or correctly licensed project assets.
- Do not ship, trace, redraw, recolor, crop, upscale, interpolate, vectorize, or sample source sprites, maps, UI frames, logos, fonts, video, or audio.
- Do not use extracted assets as image-generation inputs, style references, training data, texture palettes, or composition overlays.
- A structural observation may guide an abstract requirement such as “variable-size home field” or “fixed 128 × 128 Hunt collision grid”; it may not prescribe copied layout, ornament, silhouette, palette, pose, timing, or wording.
- Asset manifests record creator/provenance, license, creation date, dimensions, digest, intended route bundles, and human art approval.
- Runtime packages and public documentation contain no raw binary payload, private path, offset, extracted filename inventory, private evidence image, or private tool transcript.
- Creature animation clips follow NexusLink’s own character identity and art direction. A source slot association never authorizes a copied pose.

Visual completion requires human art review. Mechanical asset checks can reject an asset but cannot approve IP safety or project-native quality on their own.

## 11. Pixi v8 lifecycle

Pixi is optional presentation. Each scene bundle follows this lifecycle:

1. Mount the accessible DOM route and fallback status.
2. Dynamically import the approved Pixi module and the route asset manifest.
3. Create `new Application()` and await `app.init(options)`.
4. Verify the route load epoch is still current before appending the canvas.
5. Bind resize, visibility, context-loss, ticker, and input adapters with route-owned disposers.
6. Synchronize immutable view models or snapshots; do not hand the scene a mutable store.
7. On exit, abort loads, stop input, stop ticker, remove observers/listeners, destroy scene objects, and call `app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true, texture: true, textureSource: true })` where ownership permits.
8. Release route asset references and remove the route DOM.

Shared textures must use explicit reference ownership so one route cannot destroy assets still used by another. A failed Pixi import/init or lost context leaves the DOM path operable and reports a bounded diagnostic. Remount must create exactly one canvas.

No renderer is loaded when the R2 feature is off, and no arbitrary pre-existing `window.PIXI` object is accepted as a trusted runtime. The eventual loader must use a pinned approved source with integrity verification or a bundled dependency governed by the build.

## 12. 60 fps and asset budgets

Sixty frames per second is the target on the named release-device matrix. The render target is 16.67 ms per frame after route warm-up; profiling evidence must include median, p95, p99, long tasks, input latency, draw calls, texture memory, and route bundle transfer size.

Hard architecture rules:

- Simulation results are render-rate independent and golden-tested at 30, 60, and 120 render Hz.
- No domain reducer, collision parser, save serialization, catalog validation, or dynamic import runs in a ticker callback.
- No text object is recreated every frame. DOM or cached text updates only when its value changes.
- Static art is atlased where appropriate; atlases stay within the supported 4096 × 4096 limit.
- Offscreen animation and particles pause or cull only after profiling proves correctness and benefit.
- Mobile resolution scaling, particle density, and purely visual effects may adapt to measured load; domain state, collision, action timing, and eligibility may not.
- Initial boot loads the shell and active route only. CM, HM, BM, movie, database, and network-related bundles are independently lazy.
- Hidden tabs stop rendering and audio. Resume does not fast-forward missed renderer time or issue catch-up domain commands.
- Long lists use DOM virtualization or pagination with stable focus and screen-reader semantics.

The implementation team must establish numeric asset, draw-call, and memory ceilings from measurements on the agreed minimum device before release. This document does not invent a source-game performance claim or an unsupported universal GPU budget.

## 13. Presentation acceptance

A route family is presentation-ready only when:

- its registry mapping, evidence status, transition authority, input policy, focus policy, save policy, and fallback are explicit;
- all visible art passes manifest, provenance, dimensions, transparency, safe-zone, and human project-native review;
- DOM-only operation completes every domain action;
- Pixi initialization failure and context loss preserve that operation;
- minimum viewports, 200% text, keyboard, controller, touch, screen reader, reduced motion, and high-contrast checks pass;
- route entry/exit/remount is leak-free; and
- performance measurements meet the agreed release budgets without changing deterministic outcomes.
