# BGM Asset Map

- **Status:** Active inventory for Task Pack 0 (BGM)
- **Last updated:** 2026-07-24
- **Rule:** Do not rename/convert/delete assets in this pack. Unmapped ≠ deletable.

---

## Inventory

| Relative path | Ext | Size (bytes) | Intended scene (evidence) | Runtime scene ID | Loop | Integration | Issues |
|---|---|---:|---|---|---|---|---|
| `assets/audio/linkara/bgm_login_page.mp3` | mp3 | 3959486 | Title / first-session start (filename `login_page`) | `screen:start` | yes | **wired** | iOS cannot autoplay before gesture |
| `assets/audio/linkara/bgm_linkara_lofi.mp3` | mp3 | 2330696 | Companion selection / Initial Bond | `screen:companion-select` | yes | **wired (Owner-confirmed 2026-07-24)** | Soft UI tone; no dedicated select filename |
| `assets/audio/linkara/bgm_ethereal_moon_lakefront.mp3` | mp3 | 4070794 | Moonlake home / lakefront | `habitat:moonlake` | yes | **wired (Owner-corrected 2026-07-24)** | Canonical Moonlake BGM |
| `assets/audio/bgm_lakefront.mp3` | mp3 | 4052886 | Legacy lakefront | — | yes | **unmapped (alternate)** | Kept on disk; not auto-assigned |
| `assets/audio/linkara/bgm_northern_verdant_plains.mp3` | mp3 | 4819141 | Northern Verdant Plains | `habitat:plains` | yes | **wired** | Loudness varies vs other maps |
| `assets/audio/linkara/bgm_southeast_forge_hills.mp3` | mp3 | 4460406 | Southeast Forge Hills | `habitat:forge` | yes | **wired** | |
| `assets/audio/linkara/bgm_southern_harbor_nexus.mp3` | mp3 | 6583124 | Southern Harbor Nexus | `habitat:harbor` | yes | **wired** | Larger file; lazy-load only |
| `assets/audio/linkara/bgm_central_radiant_core.mp3` | mp3 | 1484502 | Central Radiant Core | `habitat:core` | yes | **wired** | |
| `assets/audio/linkara/bgm_southwest_tidal_frontier.mp3` | mp3 | 6510296 | Southwest Tidal Frontier | `habitat:tidal` | yes | **wired** | Larger file; lazy-load only |
| `assets/audio/linkara/bgm_eastern_mystic_mountains.mp3` | mp3 | 5558737 | Eastern Mystic Mountains | `habitat:mystic` | yes | **wired** | |
| `assets/audio/bgm_nexuslink.m4a` | m4a | 10413992 | Legacy single global BGM (`ASSET_MANIFEST.audio.bgm`) | `fallback:legacy` | yes | **wired as fallback only** | Large; Safari m4a usually OK; do not preload at boot |

Paths use exact relative URLs from repo root (`./assets/...`) for GitHub Pages.

---

## Scene resolution table

| Scene / map | Runtime ID | BGM path | Status |
|---|---|---|---|
| Title / onboarding start–guidance | `screen:start` | `./assets/audio/linkara/bgm_login_page.mp3` | mapped |
| Companion select / onboarding bond | `screen:companion-select` | `./assets/audio/linkara/bgm_linkara_lofi.mp3` | mapped (Owner-confirmed) |
| Moonlake home habitat | `habitat:moonlake` | `./assets/audio/linkara/bgm_ethereal_moon_lakefront.mp3` | mapped (Owner-corrected) |
| Plains | `habitat:plains` | `./assets/audio/linkara/bgm_northern_verdant_plains.mp3` | mapped |
| Forge | `habitat:forge` | `./assets/audio/linkara/bgm_southeast_forge_hills.mp3` | mapped |
| Harbor | `habitat:harbor` | `./assets/audio/linkara/bgm_southern_harbor_nexus.mp3` | mapped |
| Core | `habitat:core` | `./assets/audio/linkara/bgm_central_radiant_core.mp3` | mapped |
| Tidal | `habitat:tidal` | `./assets/audio/linkara/bgm_southwest_tidal_frontier.mp3` | mapped |
| Mystic | `habitat:mystic` | `./assets/audio/linkara/bgm_eastern_mystic_mountains.mp3` | mapped |
| Unknown / missing map | `fallback:legacy` | `./assets/audio/bgm_nexuslink.m4a` | fallback |
| — | — | `./assets/audio/bgm_lakefront.mp3` | **unmapped alternate** |

---

## Browser / deployment notes

- **iOS Safari:** autoplay blocked until user gesture. Pending scene must start on first click/touch unlock (single gesture).
- **GitHub Pages:** always relative `./assets/...`; never absolute localhost.
- **Case sensitivity:** filenames are lowercase as listed; Linux Pages hosts are case-sensitive.
- **Mastering:** tracks differ in loudness; runtime still caps with `MAX_BGM_VOLUME` (0.42). Do not edit source loudness in this pack.
