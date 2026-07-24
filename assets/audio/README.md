# Audio Assets

This folder stores ambient audio and sound effects for Nexus Link.

> Runtime mapping SSOT for multi-scene BGM: `docs/audio/BGM_ASSET_MAP.md`
> Code registry: `src/data/bgmRegistry.js` · Manager: `src/audio/audioManager.js`

## Current multi-scene BGM (Task Pack 0)

| Runtime scene ID | Relative path | Notes |
|---|---|---|
| `screen:start` | `linkara/bgm_login_page.mp3` | Title / onboarding start–guidance |
| `screen:companion-select` | `linkara/bgm_linkara_lofi.mp3` | Owner-confirmed companion select / Initial Bond |
| `habitat:moonlake` | `linkara/bgm_ethereal_moon_lakefront.mp3` | Owner-corrected default home habitat |
| `habitat:plains` | `linkara/bgm_northern_verdant_plains.mp3` | |
| `habitat:forge` | `linkara/bgm_southeast_forge_hills.mp3` | |
| `habitat:harbor` | `linkara/bgm_southern_harbor_nexus.mp3` | |
| `habitat:core` | `linkara/bgm_central_radiant_core.mp3` | |
| `habitat:tidal` | `linkara/bgm_southwest_tidal_frontier.mp3` | |
| `habitat:mystic` | `linkara/bgm_eastern_mystic_mountains.mp3` | |
| `fallback:legacy` | `bgm_nexuslink.m4a` | Unknown scene fallback only |

## Unmapped (do not auto-assign)

```text
bgm_lakefront.mp3
```

Legacy lakefront kept on disk as an alternate. Canonical
`habitat:moonlake` is `linkara/bgm_ethereal_moon_lakefront.mp3` (Owner-corrected 2026-07-24).

## Runtime volume

- implemented runtime volume cap: `MAX_BGM_VOLUME = 0.42`
- effective level: `master × bgm × mute` via existing settings (`volMaster` / `volBgm` / `audioMuted`)
- keep UI SFX quieter than BGM

## Browser notes

- iOS Safari blocks autoplay until a user gesture; pending scene starts on first unlock click/touch.
- Paths are relative (`./assets/...`) for GitHub Pages.
- Do not rename/convert/delete assets without Owner approval.

## Planned / future files

```text
campfire-loop.mp3
lake-night-ambience.mp3
fox-soft-reaction.wav
ui-soft-confirm.wav
```

## General recommendations

- low-volume ambient loops
- subtle companion reactions
- lightweight files suitable for GitHub Pages
- avoid large uncompressed audio files
- keep music, UI SFX, and companion voice in separate mixer groups
