# NEXUS_LINK_MULTI_RUNTIME_TECHNICAL_CONSTITUTION
## 跨工作區技術架構憲法

## 5.1 權限層級
1. **Product Constitution**
   - Design Bible
   - 情感契約
   - 安全紅線

2. **Cross-Runtime Technical Constitution**
   - 本次新增文件
   - 管 Web／Moonlake Source／Unity 的責任邊界

3. **Repository-Specific Operating Rules**
   - Web CLAUDE.md／AGENTS.md
   - Moonlake Source 規則
   - Unity repo 規則

4. **Runtime Canon／Acceptance**
   - 描述現在實作狀態與驗收方法

5. **TASK_PACK**
   - 不得推翻以上文件

*Raphael Constitution 只管理人格與輸出，不管理 renderer 或 3D pipeline。*

## 5.2 四個 Authority Domain

### A. Product Canon
負責：
- 產品本質
- 情感契約
- 安全紅線
- 世界觀
- 玩法意義
- 角色主體性

### B. Moonlake 3D Source
負責：
- 場景來源資產
- 模組 ID
- 物件座標
- 地形與 walkable surface
- Anchor
- collision proxy
- material semantic ID
- Blender／場景資料
- GLB／JSON export source

### C. Web Runtime
負責：
- Web-first 遊戲版本
- Vanilla JavaScript
- DOM UI
- Three.js environment and projection
- PixiJS companion sprite
- PixiJS 現有 2D／特效／legacy layer
- Error containment (catch block is not a functional fallback)
- localStorage 與現有 gameplay runtime

### D. Unity Runtime
負責：
- Unity 原生版本
- C#
- URP
- Unity Shader／Shader Graph
- NavMesh／AI Navigation
- Prefab
- Native build
- App／Steam 原生執行
- Unity-specific performance profile

*不得讓其中任何一個 domain 成為其他 domain 的人工 fork。*

## 5.3 正式架構

Moonlake 3D Source
        │
        ├─ Canonical scene semantics
        ├─ Module IDs
        ├─ Transforms
        ├─ Anchors
        ├─ Walkable surfaces
        ├─ Collision proxies
        ├─ Material IDs
        └─ Source hashes
        │
        ├──────── Web Export Profile
        │          ├─ Web GLB
        │          ├─ Web scene JSON
        │          ├─ texture compression
        │          └─ Three.js runtime
        │
        └──────── Unity Import Profile
                   ├─ source meshes
                   ├─ generated prefabs
                   ├─ Unity materials
                   ├─ colliders
                   └─ NavMesh data

正式原則：
**Same semantic package, not necessarily the same optimized binary bytes.**

## 5.4 Web 技術邊界

Web repo 的限制必須被「限定在 Web repo」，不能再誤套到 Unity 或 Blender。

**Web 現行允許：**
- HTML
- CSS
- Vanilla JavaScript ES Modules
- DOM UI
- localStorage
- PixiJS
- Three.js
- GLB／glTF
- Billboard Sprite
- WebGL
- GitHub Pages 或現有靜態部署方式
- current repo 已核准且實際存在的 loader／renderer

**Web 預設仍禁止，除非 Human 另行批准：**
- React／Vue／Svelte
- TypeScript
- 無理由加入 bundler
- 無理由加入 npm dependency
- 後端與資料庫
- LLM API
- 擅自重寫現有 gameplay runtime
- 擅自移除 PixiJS
- 擅自把 Unity build 嵌入取代現有 Web 版本

*「無 build step」是 Web current runtime 的限制，不是全 Nexus Link 專案的永久宇宙法則。*

## 5.5 Unity 技術邊界

Unity repo 是正式、已核准的平行原生執行環境。

**允許：**
- Unity 專案現有版本
- C#
- URP
- Shader／Shader Graph
- AI Navigation／NavMesh
- Editor Script
- Prefab
- Animator
- SpriteRenderer／Billboard
- Command-line batch mode
- Native build pipeline

**限制：**
- 不得自行安裝新 package。
- 不得自行升級 Unity version。
- 不得自行變更 Render Pipeline。
- 不得把 Unity 狀態反向寫成 Web gameplay 唯一真相。
- Unity build step 不受 Web「no build step」條款禁止。

## 5.6 Blender／Moonlake Source 技術邊界

**允許：**
- Blender
- Blender Python
- glTF／GLB export
- source mesh
- collision proxy
- LOD source
- material semantic mapping
- Anchor／scene JSON generation

**限制：**
- 第三方 Blender add-on 需 Human 核准。
- 不可讓匯出後的 GLB 成為唯一可編輯 source。
- 不可直接在 Web 或 Unity 中手動改 module 座標形成第二份真相。
- 不可在本次 docs-only 任務中匯出任何 GLB。

## 5.7 Web-first 並不等於 Web-only

- Web 版是目前商業級垂直切片與主要公開入口。
- Unity 是原生版本與更高品質執行環境。
- 這不是「放棄 Web，改做 Unity」。
- 也不是「Unity 永遠只是實驗」。
- 兩者共用產品邏輯與場景語意，但允許 renderer-specific implementation。

## 5.8 Full Conflict Matrix (Audit Verified)

在多運行時整合審查中，我們確認並解決了以下舊文件與實際程式碼庫的衝突：

| 衝突點 / 舊認知 | Repo 實際驗證狀況 (Audit) | 憲法更正決策 |
|---|---|---|
| **Web 渲染全由 PixiJS 負責** | 錯誤。`src/app.js` 與 `src/three/` 證明 Web 已經是以 Three.js (Habitat 3D) 結合 PixiJS (UI/2D) 的雙引擎架構。 | 確認雙引擎為合法 Web 規格，不將 PixiJS 視為唯一 renderer，也不會移除 PixiJS。 |
| **Unity 是當前完整實作版** | 錯誤。實際 Unity 專案位於 `C:\NexusLinkUnity\NexusLink-unity-habitat-slice` (`feat/moonlake-greybox-phase4a` 分支)，其內部僅有 `MoonlakeGreybox.unity` 場景與基本材質，並無任何玩法 C# 腳本。 | Unity 定位修正為「loadable greybox scene / tool-validation prototype」，不是已完成或取代 Web 的完整主體。 |
| **Moonlake 已經是 Production Art** | 錯誤。`moonlake_clay_resin_r3.glb` 是單一的工程原型（Engineering Prototype），非正式量產等級資產。 | Moonlake 3D Source v2 is the canonical scene-authoring workspace. Web `assets/3d/moonlake` contains runtime-exported or candidate assets and is not the complete source workspace. |
| **Web 即將被廢棄** | 錯誤。Web 版本（Root White Lab）仍是目前的 Current active commercial Web runtime。 | 確認 Web-first 商業化路徑，不把 Web 標示為過渡期或即將廢棄。 |
| **R2 僅為過期代碼** | 錯誤。目前的 Web 主架構繼承自 R2，並已 promote 至 root。 | 統一使用「R2-derived Web Runtime」或「Root White Lab」取代模糊的 R2 名稱。 |
