# Nexus Link Version Naming

## Black Build / B版 / 黑版

* Path: `/`
* Role: Stable public demo / 主展示版 / Stable Snapshot
* Source: promoted snapshot from White Lab
* Rule: 不直接做實驗性修改；只接收已在白版驗收過的內容
* Promotion Source: White Lab
* 用途：手機測試、對外展示、主要 GitHub Pages 入口

## White Lab / W版 / 白版

* Path: `/r2/`
* Role: Fable experiment lab / 實驗室 / 新功能試驗區
* Rule: 新功能、新 UI、新 VFX、先在這裡實驗
* Promotion Target: Black Build
* 用途：UI polish、探索地圖、戰鬥、Codex、夥伴互動、VFX、實驗功能

## Promotion Rule

* White Lab 通過 smoke check / visual review 後，才可 promotion 到 Black Build
* Promotion 只做受控同步，不做順手重構
* Black Build 和 White Lab 是兩份檔案，不會自動同步
* 黑版 B 來源於白版 W 的 promotion snapshot

## Naming Rule

* 對外展示請稱 Black Build / B版 / 黑版
* 實驗開發請稱 White Lab / W版 / 白版
* 只有在描述歷史時才使用 R1/R2
* 不要把 Black Build 稱為舊 R1
* 雖然 `/r2/` 路徑名稱維持不變，文件與溝通定位上一律稱「白版 W / White Lab」
* root `/` 雖然過去可能被稱為 R1，現在文件與溝通定位上稱「黑版 B / Black Build」

## 歷史說明

R1 / R2 僅為早期盤點與 promotion 規劃時使用的臨時稱呼。

目前已正式更正為 Black Build (黑版 B) 與 White Lab (白版 W)。

- root `/` = Black Build (黑版 B)：主展示版
- `/r2/` = White Lab (白版 W)：實驗室

詳細盤點歷史請參考 `docs/R1_R2_POSITIONING_ANALYSIS.md`（該文件保留原始內容，並新增命名更正說明）。
