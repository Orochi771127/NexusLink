# Formal Evolution Lineage Board QC R1

> Superseded on 2026-08-12. The Owner rejected R1 as insufficiently distinct
> evolution design. This file records the earlier mechanical review only and
> must not be used as current visual approval. Use
> `FORMAL_EVOLUTION_LINEAGE_BOARD_QC_R2.md` and the `_r2.png` boards.

## Verdict

All 11 boards pass the mechanical and visual gate for **Owner review**. None is
a transparent production master, Expedition sprite, Orbit top or runtime-ready
animation set.

## Shared checks

- Exactly three same-character forms appear left-to-right on every board.
- Species stays correct: feline, avian, cervid, aquatic hover, canine, equine
  and saurian silhouettes do not borrow incompatible limbs or locomotion.
- The supplied Stage 1 portrait remains identifiable in every lineage.
- Faces stay emotionally readable; no permanent snarl, empty boss glare or
  obedience pose was introduced.
- No board contains labels, generated text, game UI, card frame or weapon.
- All major ears, antlers, fins, wings, paws／hooves／talons and tails are inside
  the image boundary.
- Stage 2 and Stage 3 add silhouette and motif information rather than merely
  tinting or scaling Stage 1.
- All files decode successfully and have recorded dimensions and SHA-256 in
  `assets/reference/formal-evolution-r1/lineage-board-manifest.json`.

## Board-specific review notes

| Character | Review result | Production caution |
| --- | --- | --- |
| Greyshade Cat | Pass | Lakeglow traces stay restrained and may become separate VFX. |
| Auriowl | Pass | Build a folded-wing Stage 3 idle for the mobile silhouette. |
| Sprigfawn | Pass | Freeze antler count／shape before animation and test the 390 px safe area. |
| Crystalfin Seahorse | Pass | Freeze attached fin groups; preserve one tail and zero limbs. |
| Blazetail Kit | Pass | The two Owner references are clearly translated; robe overlap needs animation-specific redraw and exactly one tail. |
| Starstripe Cub | Pass | Crystal ridges stay attached and secondary to fur/stripes. |
| ThunderPup | Pass with caution | Stage 3 is intentionally cool but is the set's most adult read; production must retain the large eyes and companion-scale body. |
| WaveCub | Pass | The route halo is external VFX and must not be baked into the master. |
| Starflame Phoenix | Pass | Open-wing Stage 3 is a display pose; runtime also needs compact grounded folded wings. |
| Star Foal | Pass | Ground constellation is external VFX; star tip must remain physically joined to one tail. |
| Goldenspark Wyrm | Pass | Tail gear stays attached; circular analyzer field is external VFX; no wings. |

## Human gate requested

The Owner should approve or revise:

1. the five proposed Black Iron Stage 2／3 names;
2. each Stage 2 silhouette;
3. each Stage 3 silhouette;
4. whether ThunderPup Stage 3 should be made slightly rounder／younger;
5. whether Auriowl and Phoenix Stage 3 wing scale should be reduced for their
   default portrait pose.

Only approved lineages proceed to individual 512×512 transparent masters. That
next package then produces and validates Expedition and Orbit forms separately,
instead of shrinking this wide review board into gameplay.
