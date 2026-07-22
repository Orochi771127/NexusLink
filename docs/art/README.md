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

Art documentation alone does not grant runtime readiness. Image generation,
asset writes, registry changes and runtime promotion require an explicit
approval-gated task; after promotion, current runtime truth lives in
`src/data/assetManifest.js` and `src/data/companionRegistry.js`.

## Ironflow Hackers Stage 1 (canon and runtime promotion approved)

`BLACK_IRON_HACKERS_STAGE1_CHARACTER_ASSET_INDEX.md` tracks the
Owner-supplied 2026-07-14 five-character visual lock for the
Wood/Water/Fire/Earth/Metal seats. On 2026-07-22 the Owner approved the five
selected 29-action catalogs and portraits for canon plus GROUNDWORK runtime
promotion. Public English uses `Ironflow Hackers`; the historical filename is
kept for stable links. Selected runtime PNGs live under each character's own
`assets/characters/<id>/` root, while GIFs, rejected candidates and production
provenance remain under `output/**`. Runtime-ready does not auto-unlock a
companion or alter Initial Bond.

## Production / habitat index

- `ART_PRODUCTION_INDEX.json` — Codex generation queue (`batches[]`) + habitat inventory (`habitats[]`, e.g. Moonlake Vivarium v3).
- `ART_ASSET_GAP_AUDIT.md` — human-readable gap audit aligned with the index.
- Staging notes for Moonlake incremental layers: `output/linkara/moonlake/v5/`.
