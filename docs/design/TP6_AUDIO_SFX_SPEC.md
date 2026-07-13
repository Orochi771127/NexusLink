# TP-6 音效規格書（SFX Spec — 供 Owner 授權音檔用）

> Status: **v1 SHIPPED（Web Audio 合成）** / CC0 錄音升級列 v1.1 polish
> Date: 2026-07-14（更新）
> 依據：`docs/agent/NEXT_AI_TASK_PACK_QUEUE.md` TP-6
> 憲法紅線：safety-redirect **保持靜默**；無通知音；無獎勵 fanfare（紅線 7）；音量預設保守、可完全關閉。

---

## 1. 為什麼是體感最大跳升

**v1 已出貨（2026-07-13 前後）**：`src/audio/audioManager.js` 內建 10 種 Web Audio 程序化合成 SFX + BGM（`bgm_nexuslink.m4a`），呼叫點已接線；safety 回合靜音已驗證（`soulTalkController.js`）。

**v1.1 可選升級**：Owner 已授權 CC0 來源；可將各 SFX key 疊加真實 sample 檔（載入成功則播 sample，失敗則 fallback 合成），不改呼叫端 API。

---

## 1b. 原始動機（歷史紀錄）

遊戲在 TP-6 前**完全靜音**；合成 SFX 解決了「零回饋」問題。

## 2. 需要的音檔清單（10 SFX + 1 ambient）

| # | 檔名建議 | 觸發點（程式接線位置） | 情感基調 | 長度 |
|---|---------|----------------------|----------|------|
| S1 | `touch_accept.ogg` | `interactionController.js` 觸碰被接受 | 柔軟、溫暖的短音 | <0.5s |
| S2 | `touch_guarded.ogg` | 觸碰被防備地接受 | 遲疑、低一點 | <0.5s |
| S3 | `touch_reject.ogg` | 觸碰被拒絕 | 中性退避音，**不刺耳不像錯誤音** | <0.5s |
| S4 | `soultalk_send.ogg` | `soulTalkController.js` 心語送出 | 輕、像水滴 | <0.3s |
| S5 | `soultalk_reply.ogg` | 夥伴回覆抵達 | 柔和提示，**不是通知音**（不能像手機推播） | <0.5s |
| S6 | `trace_bloom.ogg` | 痕跡生成/綻放 | 細微、結晶感 | <1s |
| S7 | `standoff_action.ogg` | `battleController.js` 四鍵任一執行 | 穩定、低頻 | <0.5s |
| S8 | `standoff_telegraph.ogg` | 裂隙蓄能/湧動預告 | 低鳴、非恐怖 | <1s |
| S9 | `standoff_settle.ogg` | 對峙收場（四結局共用或各微變體） | 舒張、放下 | 1–2s |
| S10 | `milestone_soft.ogg` | 關係里程碑 | 溫暖但克制，**不是勝利號角** | <1s |
| A1 | `ambient_moonlake_loop.ogg` | 月湖棲地背景（可無縫 loop） | 夜湖、蟲鳴水聲、極低存在感 | 30–60s loop |

格式：OGG（web 相容、體積小）；取樣 44.1kHz；響度統一（先 -18 LUFS 左右，實機再調）。

## 3. 來源選項（Owner 決策）

| 選項 | 成本 | 授權風險 | 品質一致性 | 備註 |
|------|------|----------|-----------|------|
| A. CC0 素材庫（freesound.org CC0 區、kenney.nl、sonniss GDC 包） | 免費 | 低（逐檔記錄來源與授權證明） | 中（要挑） | 最快可行；每檔留 `*.license.txt` |
| B. AI 音效生成（ElevenLabs SFX / Stability Audio 等）＋人審 | 低 | 中（需確認商用條款＋Steam AI 揭露加註音效） | 中 | 若採用，`docs/legal/PRIVACY_AND_STORE_COPY_DRAFT.md` §2 的 pre-generated 揭露要加上 audio |
| C. 委外音效師 | 高 | 低 | 高 | 商業版長線最優，demo 階段可後補 |

建議：**demo 用 A（CC0）先讓遊戲發聲，正式版視回饋升級 C**。混用亦可（ambient 用 A、關鍵觸碰音用 C）。

## 4. 接線設計（授權後的 TASK_PACK 範圍）

- Allowed：`src/audio/audioManager.js`（載入/播放 API 擴充）、`src/ui/settingsController.js`（SFX slider 誠實化）、發聲點四檔（`interactionController.js` / `soulTalkController.js` / `battleController.js` / trace-echo 路徑）、`assets/audio/**`（新檔，GROUNDWORK 經授權）、ledger。
- Forbidden：`index.html`（除非一行 script 經核可）、`src/state/**`、`pixiApp.js`。
- 行為約束：
  - 預設音量保守（0.5 以下），初次進入不轟玩家；
  - iOS 需在首次使用者手勢後才解鎖 AudioContext（在 Start 畫面第一次點擊時 resume）；
  - **safety-redirect 路徑一律靜音**：`safetyShield` 命中時不播任何音（含 S5）；
  - 拒絕音（S3）不得設計成「懲罰音效」——牠只是說不，不是你做錯事。
- 驗收：web release gate 重跑全綠；手動確認 10 個觸發點發聲、safety 路徑靜音；Settings slider 即時生效並持久化。

## 5. Atlas 佔位鈕 gate（隨包處理）

Atlas 頁若仍有無功能的音效佔位鈕，本包一併 gate 掉（隱藏或接真）。
