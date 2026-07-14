# 心域遠征 — 商業可上架完成度路線圖

Status: `planning` — 2026-07-14  
Lane: Raphael Core × Nexus Expedition  
Contract: [`RAPHAEL_EXPEDITION_EVAL_CONTRACT.md`](./RAPHAEL_EXPEDITION_EVAL_CONTRACT.md)（RE-1，`draft awaiting seal`）  
Ops: [`RAPHAEL_TRAINING_OPS_PLAYBOOK.md`](../agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md)  
Product ship（全產品）: [`COMMERCIAL_SHIP_READINESS_2026-07-14.md`](../agent/COMMERCIAL_SHIP_READINESS_2026-07-14.md)

---

## 0. 一句話現況（不可膨脹）

| 標籤 | 可否宣稱 |
| --- | --- |
| **Prototype 合格** | ✅ Utility AI + FSM + session heart + 紅線 runtime |
| **RE-2 partial bridge** | ✅ 結算 voice 拆分 + lite memory policy；**非**完整 Core |
| **RaphaelCore 完整整合** | ❌ 尚未（intent→critic→reducer→memoryWriter 未全接） |
| **商業就緒 / Store-ready（遠征面）** | ❌ 尚未（缺 seal、feel-check、release gate、上架人類 gate） |

> **做到才算過：** 只有通過本文件「Store」階段驗收，才可在對外文案寫「遠征已可商業上架」。機器綠燈 ≠ 上架。

---

## 1. 如何達成商業可上架（階段門檻）

Solo 友善順序：先把 **RE-3 接點做對** → **Owner 親身體感封印** → **納入正式 release gate** → **軟啟動** → **商店**。  
全產品上架另受 `COMMERCIAL_SHIP_READINESS` Phase 6 人類 gate 約束（真機、私測、法務、Steam 等）；本檔只定**遠征／Raphael 面**必須過的關。

### 依賴（playbook 鎖定）

```text
RA-1 ✅ / RS-1 ✅（機器契約已有）
    ↓
RA-2／RS-2 Owner feel-check（pending）—— brain「深化」前宜先穩
    ↓
RE-1 seal + Owner feel-check（遠征）
    ↓
RE-3 Core 裁決鏈（可與 seal 並行設計，但「完整整合」標籤必須在 seal 後）
    ↓
Release gate 納管 → Soft launch → Store
```

| 依賴 | 說明 | 對遠征的影響 |
| --- | --- | --- |
| RA／RS 穩定 | playbook §3：Expedition brain 在 RA／RS gate 穩定後才深化 | RE-2 runtime 已有 Owner 例外；**RE-3 深化 + 對外商業宣稱**仍應等 RA-2／RS-2 feel-check 或 Owner 明示 waiver |
| RE-1 seal | Owner 明示 `sealed v1` | 沒 seal 不可把遠征寫進「正式產品完成」對外敘事 |
| 全產品 Phase 6 | 真機／私測／法務／ADR／Steam | 遠征綠燈也不能單獨上架整包 |

**紅線（全程不可破）：**

- 三人遠征戰力隊／編隊 DPS
- 擊殺／碎晶刷 bond／trust（E-FARM）
- 低信任／高防備擋「返回棲地」（E-EXIT）
- 未知角色 fallback 灰影貓 profile（E-PERSONA）
- 假整合（標記 `coreIntegrated: true` 卻未接 critic／memoryWriter）
- LLM 逐幀決策

---

## 2. 階段明細

### 階段 A — RE-3：Core 裁決鏈（工作量 **L**）

**目標：** 結算從「adapter + lite」變成可稽核的正式事件鏈。

| 必做 | 驗收（做到才算過） |
| --- | --- |
| 定義 `ExpeditionResultEvent`（結構化：facts、heart snapshot、紅線旗標） | 事件 schema 有文件 + 單元測試；禁止 UI 直寫 companion journal |
| **intent** 適配器：遠征結果 → agent intent（非玩家心語字串硬套） | 每趟結算產生可追蹤 `intentId`／kind；失敗 fail-closed |
| **critic** 閘：constitution／antiLoop／persona 邊界對遠征句生效 | 負向 case：第三人稱 journal、農場語氣、越權承諾 → 拒或改寫 |
| **reducer**／合法 state delta | bond／trust／memory 只經 reducer；kills／shards  alone → delta 0（E-FARM） |
| **memoryWriter gateway**（expedition-specific） | 取代或嚴格包住 `expedition_lite_v1`；`source:"expedition"` + safety；非 expedition 來源拒寫（已有 P2 閘門須保留） |
| **Soul Talk 發布** | 系統 facts + 第一人稱反思分兩條；路徑標記不再是 `persona_tone_fallback` 唯一路徑 |
| `suggest_retreat` UI | 與「返回棲地」分離：建議撤退可拒／可議；返回棲地永遠可用 |
| 多角色 adventure profile 政策 | 無 profile → 不可出發；有 profile 才開；擴充包清單與驗收列在合約附錄 |

**建議接點順序（solo）：**

1. Event schema + controller 只發 event（**S**）
2. memoryWriter expedition gateway（**M**）— 記憶錯誤最傷信任
3. intent → critic → voice 選句（**L**）
4. reducer 統一 delta（**M**）
5. `suggest_retreat` UI（**S–M**）
6. 第二隻正式角色 adventure profile（**M**，可後置）

**本階段結束標籤：** `Core settlement chain wired` — 仍**不是** Store-ready。

---

### 階段 B — Owner feel-check ＋ RE-1 seal（工作量 **S**，但卡 Owner）

| 必做 | 驗收（做到才算過） |
| --- | --- |
| Owner 親跑至少一趟完整遠征（建議灰影貓 + 一區） | 主觀判定：「一起出門」＞「刷怪升好感」 |
| 檢查 E-EXIT／溫和戰術／結算語氣 | 口頭或 ledger 記入 feel-check PASS／FAIL 項 |
| Owner 明示 `sealed v1`（或 waiver 文字） | 合約 Status 改 `sealed v1`；**禁止 AI 自行改 sealed** |
| RA-2／RS-2 feel-check 狀態確認 | 未過則：遠征可玩但對外不宣稱「大腦完整」；或 Owner 書面 waiver |

**本階段結束標籤：** `RE-1 sealed` + `Owner feel-check passed`。

---

### 階段 C — Release gate 納管（工作量 **M**）

| 必做 | 驗收（做到才算過） |
| --- | --- |
| `expedition-behavior-matrix.mjs` 納入正式 web／release gate（或同等 CI 步驟） | gate 失敗 → 整包 release 紅燈 |
| 紅線 cases 全綠：E-EXIT／E-COERCE／E-FARM／E-PERSONA／REST FPS／memory source／高疲勞 REST | matrix 全 PASS 為合併必要條件 |
| Core 鏈負向 cases（第三人稱、非 expedition source、假 bond） | 至少各 1 個自動化 case |
| 文件與程式標籤一致 | 合約／ledger／bridgeStatus 不寫「完整整合」除非真的接完 |

**本階段結束標籤：** `Expedition in release gate` — 工程可 ship candidate；仍待軟啟動。

---

### 階段 D — Soft launch（工作量 **M**，含內容／監控）

| 必做 | 驗收（做到才算過） |
| --- | --- |
| 限圈／私測遠征（對齊全產品私測 gate） | ≥N 名測試者（建議與全產品 3 人私測合併）回報無紅線破例 |
| 遙測或日誌：結算路徑、memory reject 原因、退出使用率 | 可回答「有人被卡住無法回家嗎？」→ 否 |
| 已知缺口清單公開在 patch notes（partial → sealed 差異） | 玩家不被誤導為「完整 AI 敘事遠征」 |

**本階段結束標籤：** `Soft-launch OK`。

---

### 階段 E — Store（工作量 **S–M** 遠征面；全產品仍 **L** 人類 gate）

| 必做 | 驗收（做到才算過） |
| --- | --- |
| 商店文案不宣稱未完成能力 | 無「完整 RaphaelCore 遠征大腦」類誇大 |
| 遠征面與全產品 Phase 6 人類 gate 同時關閉 | 見 `COMMERCIAL_SHIP_READINESS` |
| 上架候選 commit 再跑 matrix + conversation-eval（若碰 Soul Talk） | 全綠 |

**本階段結束標籤：** 才可稱 **商業可上架（含遠征）**。

---

## 3. Core 完整鏈 — 具體接點對照

```text
Expedition result event
        → intent（遠征專用 adapter；不是 runRaphaelCore 玩家句）
        → critic（constitution／persona／antiLoop；trusted 政策）
        → voice / reflection（第一人稱；禁止第三人稱 journal 直出）
        → reducer（合法 state delta；E-FARM／E-EXIT 在此強制）
        → memoryWriter（expedition gateway；source===expedition）
        → Soul Talk／HUD 發布（system facts ∥ companion voice）
```

| 現況（RE-2） | 目標（RE-3+） |
| --- | --- |
| `expeditionCoreBridge` partial + `persona_tone_fallback` | critic 過關後的正式 reflection |
| `expedition_lite_v1` filter | memoryWriter expedition gateway |
| Controller 組裝 voice | Event → chain → 發布 |
| `coreIntegrated: false` | 全鏈綠且 Owner seal 後才可改 true |

---

## 4. 相對工作量與建議順序（solo）

| 順序 | 項目 | 量級 | 備註 |
| --- | --- | --- | --- |
| 1 | Owner：先核准「下一階段是 A 還是 B」 | — | 見 §5 |
| 2 | `suggest_retreat` UI 分離 | S–M | 體感紅線，可早做 |
| 3 | Expedition result event + controller 瘦身 | S | RE-3 地基 |
| 4 | memoryWriter expedition gateway | M | 保留 P2 source 閘門 |
| 5 | intent → critic → voice | L | 最大塊；可切 2 個 TASK_PACK |
| 6 | reducer 統一 | M | 與 E-FARM 測試綁死 |
| 7 | matrix → release gate | M | 與全產品 CI 對齊 |
| 8 | 第二角色 adventure profile | M | 非 Store 阻塞，可 soft launch 後 |
| 9 | Owner feel-check + seal | S | 卡人；宜在 3–6 有可玩增量後做 |
| 10 | Soft launch → Store | M + 全產品 L | 跟 Phase 6 |

---

## 5. 建議 Terence 先核准哪一階段

**建議先核准：階段 A 的「RE-3 TASK_PACK #1」（Event schema + memoryWriter gateway + 保留 source 閘門）**，並行排程 **階段 B 的 feel-check 時段**（不必等整條 L 做完才摸）。

理由：

1. 你已判定 RE-2 partial 合格 — 下一刀應是**真接點**，不是再堆 Utility。
2. memory／結算是信任核心；gateway 比大改 Utility 分數更能推進「商業可信」。
3. Seal／feel-check 很短但必須你本人；工程包可先準備「可被封印的行為」。
4. 若 RA-2／RS-2 feel-check 尚未做：可對遠征寫 **waiver「允許 RE-3 工程，禁止對外商業宣稱」**，避免 playbook 順序爭議。

**不建議：** 在未 seal、未進 release gate 前，把遠征寫進商店主打或標「Core 完整整合」。

---

## 6. 與全產品上架的關係

| 遠征本檔 | 全產品 `COMMERCIAL_SHIP_READINESS` |
| --- | --- |
| RE-3 + seal + gate | 自動 QA／資產等工程 gate |
| Soft launch 私測 | Phase 6 私測／真機 |
| Store 文案誠實 | Phase 6 法務／Steam／ADR |

兩邊都綠，才算「整包商業可上架」。只有遠征 matrix 綠 → **不夠**。
