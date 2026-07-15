# Nexus Link Art Docs

This directory holds Stage 1 character identity locks **and** the machine-readable art production / habitat index.

## Character locks

Reading order:

1. `STAGE1_CHARACTER_ASSET_INDEX.md`
2. `SPECIES_MOTION_TRANSLATION.md`
3. The relevant file under `character-locks/`
4. `../assets/COMPANION_ANIMATION_CATALOG.md`
5. `../assets/COMPANION_ASSET_AUTOMATION.md`

The five Owner-supplied reference images dated 2026-07-10 define the formal Heartspark Council Stage 1 roster. They are identity references only. Their white backgrounds, shadows, and presentation framing must not enter runtime assets.

No file in this directory grants runtime readiness. Image generation, asset writes, registry changes, and runtime promotion require later approval-gated tasks.

## Black Iron Hackers Stage 1 (visual lock confirmed; canon integration pending)

`BLACK_IRON_HACKERS_STAGE1_CHARACTER_ASSET_INDEX.md` tracks the Owner-supplied 2026-07-14 five-character visual lock for the Wood/Water/Fire/Earth/Metal seats. The review-production task uses the existing Tier 3 `thunder-pup` identity for the Wood seat and keeps all generated work under `output/**`; formal faction/canon integration remains a separate task. Read the index's resolved-decision and remaining-debt sections before promotion.

## Production / habitat index

- `ART_PRODUCTION_INDEX.json` — Codex generation queue (`batches[]`) + habitat inventory (`habitats[]`, e.g. Moonlake Vivarium v3).
- `ART_ASSET_GAP_AUDIT.md` — human-readable gap audit aligned with the index.
- Staging notes for Moonlake incremental layers: `output/linkara/moonlake/v5/`.
