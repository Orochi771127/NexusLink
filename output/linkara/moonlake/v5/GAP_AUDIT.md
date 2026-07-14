# Moonlake Habitat Art Gap Audit (2026-07-14)

Contract: `HABITAT_SYSTEM_MASTER_SPEC.md` + `moonlakeProfile.js`

Indexed in: `docs/art/ART_PRODUCTION_INDEX.json` → `habitats[HAB-MOONLAKE-V3]`

| Slot | Spec expectation | Before | After this pass |
|------|------------------|--------|-----------------|
| sky / mountains / lake / ground | Incremental far/mid split | Baked into full-bleed day/night | Still baked (not blocking) |
| campStructures | Static camp layer | Missing | **Generated + wired locally** (`assets/layers/.../camp_structures.png`; dir still untracked until commit) |
| runtime props | Lantern / fire / crystal / arch | Present + wired | Unchanged (tracked under `MoonlakeVivarium_v3`) |
| magic circle platform | Runtime platform | Present + wired | Unchanged |
| celestial sun/moon | Runtime sprites | Present + wired | Unchanged (`LakeNightCamp_v2`) |
| dusk / dawn plates | Tint-only OK day one | Via `nightAlpha` blend | No new plates (by design) |
| weather FX art | Procedural OK | Code-only | No art needed |
| foregroundOcclusion | Above companion | Missing as separate layer | **Generated + wired locally** (`assets/layers/.../foreground_occlusion.png`; dir still untracked until commit) |
| GAP-3 region habitats | Blocked | Not started | Skipped (blocked) |

Git honesty (verified 2026-07-14): base bg/platform/props tracked; `assets/layers/` untracked; `assetManifest.js` / `pixiApp.js` / `moonlakeProfile.js` layer wiring present in working tree but may be uncommitted.