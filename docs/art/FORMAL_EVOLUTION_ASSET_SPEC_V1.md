# Formal Evolution Asset Spec V1

> Package: `FORMAL_EVOLUTION_ROSTER_11_R2`
> Status: art／index foundation for Owner review; not runtime form-swap authority.

## 1. What this package means

Nexus Link has three persistent formal companion stages. They describe a
relationship-supported change in how the same companion chooses to appear;
they are not levels, rarity, equipment tiers, battle upgrades or collectible
duplicates.

| Order | Stable stage ID | Chinese label | English label |
| --- | --- | --- | --- |
| 1 | `initial_awakened` | 初醒夥伴 | Initial Awakened |
| 2 | `resonant_mature` | 共鳴成熟體 | Resonant Mature |
| 3 | `final_awakened` | 終局覺醒體 | Final Awakened |

An egg／origin form in an Owner reference sheet is `originState` reference
material. It does not become a fourth formal stage and does not shift the three
stage IDs.

## 2. Visual progression contract

All three forms must read as the same individual at a glance. Each design board
therefore preserves species, face geometry, key colors, heart-core location and
one or two signature silhouette cues across the whole line.

- Stage 1 is cute, compact and emotionally readable.
- Stage 2 becomes a little taller or more composed, adds one clear functional
  motif and remains approachable.
- Stage 3 becomes the most resolved and visually cool form, but stays
  companion-scale and keeps the face readable on a phone.
- Cute and cool are simultaneous requirements. A controlled anthropomorphic
  later form is allowed when it preserves the original animal head, face,
  palette, heart-core and signature anatomy. Stage 3 is not permission for an
  unrelated human, adult boss, giant armor shell, crown-and-throne deity or
  visual-noise overload.
- Except for Owner-reference-locked Blazetail, every later-form concept must be
  practical to translate into an eight-direction sprite sheet: compact body,
  clear joints, separable limbs and tail, bold color blocks, and no dense loose
  particles or overlapping transparent ornament.
- Companion boundaries remain visible in ears, wings, fins, tail, stance and
  distance language. A later form is not more obedient.

The character layer remains project-native illustrated／painterly high-detail
2D. The approved 3D miniature resin-clay direction applies to environment and
3D gameplay staging; it does not silently replace the established companion
sprite art contract.

## 3. Folder and index contract

The machine-readable root is:

```text
assets/characters/formal-evolution-index.json
```

Each of the 11 formal characters owns:

```text
assets/characters/<character-id>/
├── portrait/                         # approved Stage 1 identity authority
├── formal-stages/
│   ├── resonant_mature/              # Stage 2, same owner only
│   └── final_awakened/               # Stage 3, same owner only
└── metadata/
    └── formal-stages.json            # names, intent, status and future paths
```

Owner-supplied review material and cross-lineage design boards stay in the
non-runtime staging root:

```text
assets/reference/formal-evolution-r1/
├── attachment-catalog/source/
├── blazetail-kit/
│   ├── resonant_mature/
│   └── final_awakened/
└── lineage-boards/<character-id>/
```

This separation prevents an attractive concept sheet from being mistaken for a
transparent production master or being loaded by the game accidentally.

## 4. Status ladder

1. `reference-only` — Owner/source reference; never load directly.
2. `concept-draft` — generated exploration with no approval claim.
3. `owner-review` — coherent candidate submitted for visual and naming review.
4. `owner-approved` — identity/silhouette approved, but animation and runtime
   gates may still be incomplete.
5. `runtime-ready` — transparent production masters, required 512 animation
   set, species translation, mobile memory budget, reduced-motion behavior and
   reference audit are all complete.

No tool or agent may skip from a design board to `runtime-ready`.

## 5. Surface-specific production after approval

After the Owner approves one lineage board, production proceeds in small
same-owner packages:

- `portrait`: clean 512×512 transparent master for Stage 2, then Stage 3.
- `expedition`: eight-direction top-down／three-quarter sprite pipeline, with
  species-correct walking, attack／action and recovery vocabulary.
- `orbit`: a separately designed spinning-top embodiment per formal stage; the
  character portrait is not wrapped around a generic top.
- `animationSet`: required shared actions translated through the character's
  avian, feline, canine, cervid, equine, saurian or aquatic motion family.

Until a surface is complete, it uses the same character's approved Stage 1
asset. Cross-character fallback is forbidden.

## 6. Acceptance for this R2 review package

- 11 character IDs, each with exactly three ordered formal-stage records.
- Current Stage 1 identity files are unchanged.
- All new Stage 2／3 records are `owner-review`, `humanApproved:false` and
  `runtimeFormSwapReady:false`.
- The two Blazetail references are fingerprinted and explicitly assigned to
  Stage 2／Stage 3.
- The seven earlier sheets are fingerprinted and classified as reference-only;
  probable overlaps are recorded without creating registry entries.
- Each review board contains three fully visible forms with no baked UI or
  claim of transparent runtime readiness. The R2 board must show structural
  evolution beyond scaling, tint and VFX while remaining the same lineage.
