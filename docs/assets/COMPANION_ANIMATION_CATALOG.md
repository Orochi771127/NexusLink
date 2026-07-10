# COMPANION_ANIMATION_CATALOG.md — Nexus Link 29 Animation Catalog

This catalog is the shared animation taxonomy for Nexus Link companion production.

Shared means shared `animation_id`, meaning, frame count, FPS, loop policy, category, and priority. It does not mean every character shares the same acting. Each companion must adapt motion style through its approved Character Lock Spec.

For the formal Heartspark Council five-seat roster, `docs/art/SPECIES_MOTION_TRANSLATION.md` is mandatory. Bird, aquatic-hover, cervid, vulpine, and feline bodies must not share a generic quadruped pose template.

New companion animation uses illustrated / painterly / high-detail `512x512` master frames. Do not use 64x64, 96x96, 16-bit pixel art, clean pixel art, no anti-aliasing, or nearest-neighbor as the new companion standard. `greyshade-cat` current 443/444 frames are legacy accepted and must never be upscaled.

Final runtime assets must be transparent PNG sheets.

---

## Sheet Layout Policy

| Frame count | Required layout |
|-------------|-----------------|
| 8 frames | 2x4 |
| 6 frames | 2x3 |
| 4 frames | 2x2 |
| 3 frames | 1x3, allowed only for blink / very short non-loop clips |

All sheets must satisfy:

- sheet edge `<= 4096`
- grid exactly divisible
- body centered in each cell
- bottom-center baseline stable
- full body inside safe area
- no cropping
- no baked-in white background, UI, text, scene, pedestal, or codex frame
- VFX / projectile / impact not mixed into the body sheet unless the action config explicitly allows it

Filename pattern for new companions:

```text
assets/characters/{character-id}/runtime/sheets/{category}/{character-id}_{animation_id}_512x512_{frame-count}f.png
```

Example:

```text
assets/characters/thunder-pup/runtime/sheets/emotion/thunder-pup_idle_calm_512x512_8f.png
```

---

## 29 Animation IDs

| ID | 中文名稱 | Category | Frames | FPS | Loop | Priority | Meaning |
|----|----------|----------|--------|-----|------|----------|---------|
| idle_calm | 平靜待機 | emotion | 8 | 8 | true | P1 | Quiet breathing, grounded companion presence. |
| idle_happy | 開心待機 | emotion | 8 | 8 | true | P1 | Warm uplift without becoming hyper-obedient. |
| idle_angry | 生氣待機 | emotion | 6 | 8 | true | P1 | Boundary tension, controlled irritation, no domination. |
| idle_sad | 悲傷待機 | emotion | 6 | 8 | true | P1 | Low energy, inward posture, still alive and responsive. |
| idle_sick | 不適待機 | emotion | 8 | 7 | true | P2 | Fragile body language, fatigue, needs space. |
| idle_defensive | 防衛待機 | emotion | 8 | 8 | true | P1 | Guarded distance, body says no. |
| idle_distant | 疏離待機 | emotion | 8 | 7 | true | P2 | Present but emotionally far, avoids clingy framing. |
| idle_enjoy | 享受待機 | emotion | 8 | 8 | true | P2 | Relaxed pleasure, small trust signal. |
| blink | 眨眼 | micro | 3 | 10 | false | P1 | Very short eye-life clip. 1x3 layout allowed. |
| right_walk | 向右行走 | movement | 8 | 10 | true | P1 | Stable locomotion to the right, foot baseline locked. |
| left_walk | 向左行走 | movement | 8 | 10 | true | P1 | Stable locomotion to the left, foot baseline locked. |
| sit | 坐下 | movement | 6 | 8 | false | P2 | Settling into a seated boundary / rest posture. |
| sleep | 睡眠 | movement | 8 | 6 | true | P2 | Rest state, no FOMO pressure, peaceful absence. |
| idle_dance | 輕舞待機 | special | 8 | 10 | true | P3 | Playful loop, personality-specific expression. |
| idle_wake | 醒來待機 | special | 8 | 8 | false | P2 | Gentle wake-up, re-entering awareness. |
| idle_wash | 梳理待機 | special | 8 | 8 | true | P3 | Self-care loop, creature-specific grooming. |
| special_angry | 生氣特寫動作 | special | 6 | 10 | false | P2 | Brief boundary flare, then recover. |
| special_sad | 悲傷特寫動作 | special | 6 | 8 | false | P2 | Short sadness emphasis without punishment. |
| special_dance | 特殊舞動 | special | 8 | 10 | false | P3 | A non-essential expressive flourish. |
| touch_accept | 接受觸碰 | touch | 6 | 10 | false | P1 | Consent response, small approach / softening. |
| touch_guarded | 保留觸碰 | touch | 6 | 10 | false | P1 | Hesitation response, partial boundary. |
| touch_reject | 拒絕觸碰 | touch | 6 | 10 | false | P1 | Clear refusal, no punishment language. |
| hug | 擁抱 | touch | 6 | 8 | false | P2 | Careful closeness, never forced intimacy. |
| attack_basic | 基礎對峙動作 | battle | 6 | 10 | false | P3 | Restrained standoff gesture, not HP-zero aggression. |
| skill_cast | 技能施放 | battle | 8 | 10 | false | P3 | Boundary / resonance expression, not domination. |
| defend | 防衛 | battle | 6 | 10 | false | P3 | Self-protection, stabilizing boundary. |
| hit | 受衝擊 | battle | 4 | 12 | false | P3 | Brief emotional impact, no gore, no defeat framing. |
| faint | 心核過載 | battle | 6 | 8 | false | P3 | Core overload / temporary collapse / low-energy disconnect, not death. |
| victory | 穩定恢復 | battle | 8 | 8 | false | P3 | Stabilization / emotional recovery, not domination. |

---

## Priority Phases

- P1: MVP runtime essentials for baseline presence, consent, and movement.
- P2: emotional depth and companion self-care.
- P3: polish, special expression, and prototype standoff compatibility.

Battle remains a prototype compatibility category. Its semantics must stay compatible with Nexus Link standoff / boundary conflict language. Do not describe outcomes as HP-zero death or domination.

---

## Personality Differentiation

The catalog shares animation IDs, not identical acting. Character motion must be adapted from the Character Lock Spec.

| Personality style | Acting direction |
|-------------------|------------------|
| 防衛型 | Keeps distance, small retreats, guarded shoulders, refusal reads clearly. |
| 熱情型 | Larger approach arcs, brighter timing, but still respects boundaries. |
| 高傲型 | Upright posture, precise head turns, controlled reactions. |
| 膽小型 | Smaller motion, delayed starts, careful eye and body protection. |
| 沉穩型 | Slow timing, low amplitude, grounded center of mass. |
| 戰鬥型 | Readiness and restraint, never mindless attack obedience. |
| 療癒型 | Soft rhythm, gentle recovery gestures, low threat silhouette. |
| 混沌型 | Irregular timing and expressive arcs, but identity remains locked. |

---

## Generation Rule

High-value companion animation must not be generated frame-by-frame. Generate one full action sheet at once, then run QC.

If a result drifts in species, silhouette, palette, face, eyes, markings, material language, or personality, do not force it into runtime. Return to the Character Lock Spec and prompt.

---

## Legacy Examples

Legacy examples may use older naming or 64x64 terminology only when clearly marked legacy. These are not new companion standards.

```text
assets/characters/greyshade-cat/spritesheets/emotion/greyshade-cat_idle_calm_64x64_8f.png
```

Use legacy examples only to understand old runtime wiring or historical assets. Do not upscale `greyshade-cat` to 512.
