# Nexus Link V3 Visual System

> Package: V3 Visual System Tokens
> Status: design-only, not yet integrated with the runtime
> Canon: `NEXUS_LINK_MASTER_CANON_v3.1.md` and `NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md` take precedence.

## Intent

V3 presents Nexus Link as an illustrated emotional habitat: a quiet moonlake, a companion with agency, and a relationship visible through light, distance, and traces. The UI must frame the habitat instead of turning it into a dashboard.

The selected visual language is:

- Deep indigo night or restrained dawn habitat backdrops.
- Moon-white text, muted cyan heart-core light, mist-gold line work, and occasional soft violet.
- Low-contrast translucent panels with thin ornamental edges, never opaque card stacks.
- High-detail illustrated companion art with bottom-center anchoring.
- Generous negative space around the companion and short, quiet copy.

## Reference use

The user-supplied June 23 reference set establishes the visual language for Start, Identity, Guidance, Home, Care, Growth, Memory, Explore, and Return Echo. It is reference-only: no supplied image is a runtime asset, UI texture, companion sheet, or store asset.

The following reference semantics are explicitly rejected even where they appear in the imagery:

- Stores, purchase controls, currencies, plus icons, gacha, and loot.
- Opening character selection, multi-companion party framing, and collection pressure.
- Combat levels, stat grinding, locked progress used for FOMO, or red notifications.
- "Always waiting", dependency, romance-first, diagnosis, or therapeutic claims.

## Tokens

The companion and scene remain illustrated assets. These tokens only define DOM chrome, readable text, and CSS light effects.

| Token family | Use |
| --- | --- |
| `--v3-ink-*` | Midnight / indigo scene support and panel depth. |
| `--v3-moon-*` | Main text and quiet dividers. |
| `--v3-cyan-*` | Heart-core focus, selected state, and accessible emphasis. |
| `--v3-gold-*` | Restrained ritual framing and primary action emphasis. |
| `--v3-violet-*` | Memory and reflection accents, never error states. |
| `--v3-surface-*` | Glass layers that preserve habitat visibility. |

Use cyan for the current focus, gold for an intentional primary action, and violet for memory/reflection. Do not use these colours to create urgency or reward pressure.

## Layering and layout

```text
0  habitat scene           Pixi / illustrated background
1  companion focal zone    Pixi companion and approved world FX
2  relationship traces     Pixi visual evidence, never UI
3  DOM content             page copy, controls, panels, accessibility labels
4  persistent navigation   Explore / Care / Growth / Memory
5  transient overlay       Soul Talk, safe exit, non-blocking toast
```

- Reference viewport: 390 × 844 CSS pixels.
- Safe margins: 16px horizontal, 20px top safe area, 16px above navigation.
- Companion focal zone: centered between the HUD and Soul Talk / navigation; no persistent control may cover the baseline.
- The four action destinations are true pages. Home is the default habitat and does not need a fifth tab.
- Text-heavy controls stay in DOM. Pixi owns the habitat, companion, animation, and traces.

## Component rules

### Core identity card

Show Greyshade Cat's name, a small current-state signal, and a concise relationship descriptor. Do not show gold, gems, levels, combat power, or a collection count.

### Soul Talk

The collapsed strip is a low-pressure invitation, not a notification. The expanded drawer uses a short status line, readable chat history, and an input. It never claims the companion is the player's only support.

### Bottom navigation

Explore, Care, Growth, and Memory use one consistent icon-and-label treatment. The selected destination can receive a cyan or mist-gold focus glow; inactive actions remain quiet and legible.

### Panels and calls to action

Panels preserve scene visibility. One primary action is enough; secondary actions are text or quiet outline controls. No cards-inside-cards, endless rows, countdowns, or forced confirmations.

### Relationship evidence

Use a trace, remembered line, observed tendency, or body-language cue before exposing a number. When a value is necessary for developer or accessibility clarity, describe its meaning rather than gamifying it.

## Screen grammar

| Surface | Purpose | Required visual behavior |
| --- | --- | --- |
| Start | Establish the moonlake as a place, not a product dashboard. | Large scene, one start action, no currency or player pressure. |
| Local Identity | Let the player choose a local name or continue quietly. | Privacy copy states data remains on this device; skip remains valid. |
| Guidance | Explain choice, distance, and presence. | Two brief panels maximum; no task checklist or reward. |
| Home | Let the companion and habitat be seen first. | Focal zone remains clear; HUD and navigation are peripheral. |
| Explore | Present Moonlake as a safe first place. | No party, battle-power, or world-map completion pressure. |
| Care | Offer respectful actions. | Rest, observe, and gentle presence; no feeding or gift economy. |
| Growth | Show a relationship's slow shape. | Chapters and observed tendencies; no grindable levels. |
| Memory | Show actual relationship evidence. | Render persisted memories, traces, and return echoes only. |
| Return Echo | Welcome without blame. | Quiet scene change and evidence of continuity; no absence penalty. |
| Settings | Give player control. | Audio, motion, text size, and local-data explanation only until separately approved. |

## Copy rules

- Preferred: "你可以說話，也可以只是待著。"
- Preferred: "牠把距離留在自己覺得安心的地方。"
- Preferred: "湖面還留著一點上次的光。"
- Avoid: "我會一直等你。"
- Avoid: "你不在我就不完整。"
- Avoid: "完成這件事才能證明你在乎。"

## Runtime handoff

Package 4 may introduce `styles/ui-v3-tokens.css` by adapting the approved token values below. Package 2 must not link it from `index.html`, change current CSS, change any asset, or claim the preview is the live product.

Before implementation, the next package must validate:

1. Existing DOM ID compatibility.
2. Safe-area and keyboard behavior at 390 × 844.
3. Greyshade's illustrated sampling and focal-zone visibility.
4. A single-active-companion first-session flow.
5. No visual element that violates the product red lines.
