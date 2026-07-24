# Pack 5 — Product Terminology Glossary (Player-facing)

- **Status:** Applied to player-facing runtime strings / companion presentation (2026-07-24)
- **Source:** `docs/audits/PRODUCT_TENSION_AND_STATE_AUTHORITY_REVIEW.md` §A
- **Non-goal:** Master Canon wholesale rewrite (Owner strategy approval required later)

## Product ruling

> Nexus Link 可以採用心理安全、創傷知情與尊重邊界的設計原則，但不宣稱治療、改善依附型態、降低孤獨或產生任何臨床效果。

## Glossary (UI / player-visible)

| Avoid (clinical / overclaim) | Prefer |
|---|---|
| 治療／治療性設計 | 心理安全導向設計（僅內部文件） |
| 療癒玩家／牠的療癒 | 低壓力陪伴；願意陪你慢慢生長 |
| 療癒者（battleRole） | 安撫者 |
| Healer（battleRole EN） | Soother |
| 治癒（codex 雷達軸標籤） | 安撫 |
| 治癒／淨化／持續回復（canon 角色摘要） | 安撫／淨化／持續回復 |
| 診斷／焦慮症／憂鬱症／臨床效果 | 禁止出現在玩家可見 UI 與回覆宣稱 |

## Applied files (Phase 1)

- `src/data/companionRegistry.js` — vine-twist / sprigfawn roles + descriptions
- `src/ui/codexController.js` — radar axis label
- `src/data/heartsparkCouncilCanon.js` — Sprigfawn role line (presentation)
- `src/i18n/strings.js` — already clean of banned clinical claims (verified by harness)

## Explicitly deferred

- `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` section titles that still use 「療癒設計」— strategy-lane Owner approval required.
- Internal radar key `healing` remains a data field name (not player copy).
- Player **utterance** keywords like「被治癒」in emotion dictionaries stay (we recognize player language; we do not claim treatment).

## Acceptance

`docs/qa/terminology-ui-language-cases.mjs` fails if player-facing scanned files contain banned claim patterns.
