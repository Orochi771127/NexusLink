# GAP-1 Rift Silhouette Batch QC

Status: `REVIEW-CANDIDATE COMPLETE` — not runtime-promoted.

All ten outputs are static 512 x 512 sRGB RGBA PNGs. Every image has four transparent corners, a non-empty centered alpha bounding box, and no alpha touching the canvas edge. The batch is intentionally scoped as small/minor standoff opponents; runtime scale and breathing remain code-driven.

| Enemy | Emotion | Alpha bbox | Visual self-review |
| --- | --- | --- | --- |
| `static_wisp` | sadness | 142,46–369,466 | Wispy blue core; readable day/night; abstract and faceless. |
| `tearveil_wisp` | sadness | 157,56–354,456 | Narrow dissolving tear veil; distinct from Static Wisp. |
| `crystal_golemite` | anger | 77,46–434,466 | Faceted heavy minor opponent; most concrete member, still faceless. |
| `spite_ember` | anger | 67,56–444,456 | Compact outward tension; no anatomy or mascot read. |
| `rift_shade` | anxiety | 78,56–433,456 | Ambiguous dark purple presence; deliberately least resolved. |
| `dread_coil` | anxiety | 62,56–449,456 | Tight inward spiral; visually distinct from Rift Shade. |
| `weary_husk` | fatigue | 87,56–424,456 | Hollow drooping shell; strong empty-center read. |
| `sink_weight` | fatigue | 117,56–395,456 | Compact downward-heavy mass; distinct from Weary Husk. |
| `hollow_echo` | loneliness | 56,59–456,452 | Open concentric echo rings; clear empty-center silhouette. |
| `drift_murmur` | loneliness | 68,56–443,456 | Broken drifting rings; looser than Hollow Echo. |

## Batch checks

- PASS: exact 512 x 512 RGBA output for all ten.
- PASS: transparent corners and no edge-touch pixels for all ten.
- PASS: five emotion color families match `ART_PRODUCTION_INDEX.json`.
- PASS: ten silhouettes remain distinguishable in the contact sheet.
- PASS: no face, eyes, mouth, limbs, animal/humanoid anatomy, text, UI, border, pedestal, or baked scene.
- PASS: minor-opponent scale and threat read; none is framed as a boss.
- PASS: day/night compositing reviewed before packaging.
- NOTE: chroma-key removal necessarily neutralizes some translucent outer mist toward grey; no visible magenta fringe remains in the packaged finals.

Human acceptance in chat: both pilots were approved as suitable small standoff opponents, with authorization to complete the batch without per-image gates.
