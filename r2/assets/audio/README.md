# Audio Assets

This folder stores ambient audio and sound effects for Nexus Link.

## Current BGM

```text
bgm_lakefront.mp3
```

Purpose: current main background music for the Nexus Link base map / Nexus Core lakefront ambience.

Recommended in-game usage:

- scene: base map / home habitat / lakefront companion screen
- role: main ambient BGM
- playback: looped background music
- implemented runtime volume cap: `0.42`
- suggested tuning range: 35%–55%, then balance against UI SFX and companion voice
- keep UI confirmation sounds and companion reactions quieter than the BGM's upper-mid shimmer

## Audio analysis

| Item | Value |
|---|---:|
| File | `bgm_lakefront.mp3` |
| Format | MP3 |
| Duration | 02:43.104 |
| File size | 4,052,886 bytes (~3.87 MiB) |
| Sample rate | 48,000 Hz |
| Channels | Stereo |
| Approx. bitrate | 198.8 kbps |
| Integrated loudness | -11.73 LUFS |
| True peak | -0.86 dBTP |
| Loudness range | 5.70 LU |
| Estimated tempo | ~133.93 BPM |
| Estimated tonal center | F# major, with B major / D# minor ambiguity |
| SHA-256 | `5a58b3d324fbed237028bc15e5a1ad4f00f53a162ae4540318342421458e8980` |

### Production notes

The track is already compact enough for GitHub Pages use, but it is mastered fairly loud for background music. For a browser-based companion game, apply runtime gain reduction rather than editing the source file directly.

Recommended implementation setting:

```js
const MAX_BGM_VOLUME = 0.42;
```

For longer sessions, avoid playing it at full volume. A target perceived loudness around `-16 LUFS` to `-18 LUFS` is usually more comfortable for persistent ambient BGM.

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
