// UI chrome 字串字典：key -> { tc, sc, en, jp }。
// 範圍：靜態/動態「介面外框」字串（nav、HUD、設定、開場、頁標、面板標籤、按鈕），
// 以及四大頁（pageRouter）內容文案與行動回饋、心情標籤、狀態列文字。
// 不含：夥伴對話（Soul Talk 回應池）、Raphael 敘事、地圖結果文、區域/里程碑專有名詞 —— 維持繁中（另開內容翻譯 pack）。
// 簡/英/日 由 AI 生成，建議人工校對（尤其日文語氣）。
// 註：EN 內容 pack（2026-07-02）新增的 key 僅含 tc + en；sc/jp 由 t() 回退繁中，待後續補齊。

export const LANGUAGES = [
  { id: "tc", label: "繁體中文", htmlLang: "zh-Hant" },
  { id: "sc", label: "简体中文", htmlLang: "zh-Hans" },
  { id: "en", label: "English", htmlLang: "en" },
  { id: "jp", label: "日本語", htmlLang: "ja" }
];

export const STRINGS = {
  // ---- Bottom nav ----
  "nav.explore": { tc: "探索", sc: "探索", en: "Explore", jp: "探索" },
  "nav.care": { tc: "照顧", sc: "照顾", en: "Care", jp: "世話" },
  "nav.home": { tc: "心核", sc: "心核", en: "Core", jp: "心核" },
  "nav.growth": { tc: "成長", sc: "成长", en: "Growth", jp: "成長" },
  "nav.memory": { tc: "記憶", sc: "记忆", en: "Memory", jp: "記憶" },

  // ---- HUD ----
  "hud.companion": { tc: "心核夥伴", sc: "心核伙伴", en: "Heart-Core Companion", jp: "心核の相棒" },
  "hud.soulKicker": { tc: "心語", sc: "心语", en: "Soul Talk", jp: "心の声" },
  "hud.talk": { tc: "對話", sc: "对话", en: "Talk", jp: "話す" },
  "hud.settings": { tc: "開啟設定", sc: "打开设置", en: "Open settings", jp: "設定を開く" },

  // ---- Onboarding ----
  "ob.startTitle": { tc: "這不是電子寵物。", sc: "这不是电子宠物。", en: "This is not a virtual pet.", jp: "これは電子ペットではない。" },
  "ob.startCopy": {
    tc: "這是一段會留下痕跡的陪伴。灰影會靠近，也會保留自己的邊界。",
    sc: "这是一段会留下痕迹的陪伴。灰影会靠近，也会保留自己的边界。",
    en: "This is companionship that leaves traces. Greyshade will draw near, and also keep its own boundaries.",
    jp: "これは痕跡を残す寄り添い。灰影は近づくが、自分の境界も保つ。"
  },
  "ob.startBtn": { tc: "開始連結", sc: "开始连结", en: "Begin the Link", jp: "つながりを始める" },
  "ob.identityKicker": { tc: "本地身份", sc: "本地身份", en: "Local Identity", jp: "ローカルの名前" },
  "ob.identityTitle": { tc: "你希望我們怎麼稱呼你？", sc: "你希望我们怎么称呼你？", en: "What should we call you?", jp: "なんと呼べばいい？" },
  "ob.nameLabel": { tc: "稱呼", sc: "称呼", en: "Name", jp: "呼び名" },
  "ob.skipBtn": { tc: "稍後決定", sc: "稍后决定", en: "Decide later", jp: "あとで決める" },
  "ob.continueBtn": { tc: "繼續", sc: "继续", en: "Continue", jp: "続ける" },
  "ob.identityNote": {
    tc: "資料只保存在此裝置的既有存檔中。",
    sc: "资料只保存在此装置的既有存档中。",
    en: "Your data stays only in the save on this device.",
    jp: "データはこの端末のセーブ内だけに保存されます。"
  },
  "ob.guidanceTitle": { tc: "三件事先說清楚。", sc: "三件事先说清楚。", en: "Three things, up front.", jp: "先に三つだけ。" },
  "ob.contract1": { tc: "牠會記得你，但牠不屬於你。", sc: "牠会记得你，但牠不属于你。", en: "It will remember you, but it is not yours.", jp: "あなたを覚えているが、あなたのものではない。" },
  "ob.contract2": { tc: "牠會靠近你，但不會吞掉你。", sc: "牠会靠近你，但不会吞掉你。", en: "It will draw near, but never consume you.", jp: "近づくけれど、あなたを呑み込まない。" },
  "ob.contract3": { tc: "你能影響牠，但不能支配牠。", sc: "你能影响牠，但不能支配牠。", en: "You can influence it, but not control it.", jp: "影響はできても、支配はできない。" },
  "ob.guidanceBtn": { tc: "我明白", sc: "我明白", en: "I understand", jp: "わかった" },
  "ob.meetTitle": { tc: "灰影在月湖邊等你。", sc: "灰影在月湖边等你。", en: "Greyshade waits by the Moonlake.", jp: "灰影が月湖のほとりで待っている。" },
  "ob.meetCopy": {
    tc: "你不用立刻說很多話。靠近、停下、或只是看一會兒，都可以。",
    sc: "你不用立刻说很多话。靠近、停下、或只是看一会儿，都可以。",
    en: "You don't have to say much right away. Approach, pause, or just watch a while.",
    jp: "すぐに多くを語らなくていい。近づくのも、止まるのも、ただ眺めるのもいい。"
  },
  "ob.meetBtn": { tc: "進入心核棲地", sc: "进入心核栖地", en: "Enter the Heart-Core Habitat", jp: "心核の棲み処へ" },

  // ---- First Loop（Meet 後首輪閉環提示；K6：單行、可跳過、無壓迫）----
  "fl.hintTouch": { tc: "可以先輕輕碰碰牠。", sc: "可以先轻轻碰碰牠。", en: "Try a gentle touch first.", jp: "まずはそっと触れてみて。" },
  "fl.hintTalk": { tc: "想說話時，點開心語。", sc: "想说话时，点开心语。", en: "When ready, open Soul Talk.", jp: "話したくなったら、心の声を。" },
  "fl.hintTrace": { tc: "牠在聽。慢慢說就好。", sc: "牠在听。慢慢说就好。", en: "It's listening. Take your time.", jp: "聞いているよ。ゆっくりでいい。" },
  "fl.reveal": { tc: "棲地的其他角落也醒了。", sc: "栖地的其他角落也醒了。", en: "Other corners of the habitat have woken.", jp: "棲み処のほかの場所も目を覚ました。" },
  "fl.skip": { tc: "先自己逛", sc: "先自己逛", en: "Explore on my own", jp: "自分で見て回る" },

  // ---- Page headers ----
  "page.explore.title": { tc: "探索", sc: "探索", en: "Explore", jp: "探索" },
  "page.explore.pill": { tc: "月湖首輪", sc: "月湖首轮", en: "Moonlake, first round", jp: "月湖・序章" },
  "page.care.title": { tc: "照顧", sc: "照顾", en: "Care", jp: "世話" },
  "page.care.pill": { tc: "陪伴與邊界", sc: "陪伴与边界", en: "Presence & boundaries", jp: "寄り添いと境界" },
  "page.growth.title": { tc: "成長", sc: "成长", en: "Growth", jp: "成長" },
  "page.growth.pill": { tc: "關係章節", sc: "关系章节", en: "Relationship chapters", jp: "関係の章" },
  "page.memory.title": { tc: "記憶", sc: "记忆", en: "Memory", jp: "記憶" },
  "page.memory.pill": { tc: "已保存資料", sc: "已保存资料", en: "Saved data", jp: "保存データ" },

  // ---- Explore page body ----
  "explore.cardTitle": { tc: "月湖營地", sc: "月湖营地", en: "Moonlake Camp", jp: "月湖の野営地" },
  "explore.openMap": { tc: "查看月湖路徑", sc: "查看月湖路径", en: "View Moonlake paths", jp: "月湖の小道を見る" },
  "explore.atlas": { tc: "世界地圖", sc: "世界地图", en: "World Atlas", jp: "世界地図" },
  "explore.lakeGlow": { tc: "靠近湖面微光", sc: "靠近湖面微光", en: "Approach the lake glow", jp: "湖面の微光に近づく" },
  "explore.crystal": { tc: "觀察靜默晶簇", sc: "观察静默晶簇", en: "Observe the quiet crystals", jp: "静かな晶簇を眺める" },
  "explore.evTraces": { tc: "可見痕跡", sc: "可见痕迹", en: "Visible traces", jp: "見える痕跡" },
  "explore.evMemories": { tc: "情緒記憶", sc: "情绪记忆", en: "Emotional memories", jp: "感情の記憶" },

  // ---- Care page body ----
  "care.boundary": { tc: "邊界", sc: "边界", en: "Boundary", jp: "境界" },
  "care.trust": { tc: "信任", sc: "信任", en: "Trust", jp: "信頼" },
  "care.energy": { tc: "精力", sc: "精力", en: "Energy", jp: "活力" },
  "care.sitQuiet": { tc: "靜靜陪伴", sc: "静静陪伴", en: "Sit quietly together", jp: "静かに寄り添う" },
  "care.keepDistance": { tc: "保持距離陪伴", sc: "保持距离陪伴", en: "Stay near, at a distance", jp: "距離を保って寄り添う" },
  "care.restTogether": { tc: "一起休息", sc: "一起休息", en: "Rest together", jp: "一緒に休む" },
  "care.observe": { tc: "觀察狀態", sc: "观察状态", en: "Observe its state", jp: "様子を見る" },

  // ---- Growth page body ----
  "growth.trustTune": { tc: "信任校準", sc: "信任校准", en: "Tune trust", jp: "信頼を整える" },
  "growth.emotionBalance": { tc: "情緒穩定", sc: "情绪稳定", en: "Steady emotions", jp: "感情を落ち着ける" },
  "growth.review": { tc: "回看資料", sc: "回看资料", en: "Review records", jp: "記録を見返す" },

  // ---- Memory page body ----
  "memory.evInteractions": { tc: "互動記憶", sc: "互动记忆", en: "Interaction memories", jp: "やり取りの記憶" },
  "memory.evEmotional": { tc: "情緒記憶", sc: "情绪记忆", en: "Emotional memories", jp: "感情の記憶" },
  "memory.evTraces": { tc: "棲地痕跡", sc: "栖地痕迹", en: "Habitat traces", jp: "棲み処の痕跡" },
  "memory.echo": { tc: "回聽最近共鳴", sc: "回听最近共鸣", en: "Echo recent resonance", jp: "最近の共鳴を聴き返す" },
  "memory.openSoul": { tc: "開啟心語", sc: "打开心语", en: "Open Soul Talk", jp: "心の声を開く" },

  // ---- Character modal ----
  "char.kicker": { tc: "心核夥伴", sc: "心核伙伴", en: "Heart-Core Companion", jp: "心核の相棒" },
  "char.title": { tc: "夥伴狀態", sc: "伙伴状态", en: "Companion Status", jp: "相棒の状態" },
  "char.moodTitle": { tc: "今日心情共鳴", sc: "今日心情共鸣", en: "Today's Mood Resonance", jp: "今日の心の共鳴" },
  "char.bond": { tc: "羈絆", sc: "羁绊", en: "Bond", jp: "絆" },
  "char.mood": { tc: "心情", sc: "心情", en: "Mood", jp: "気分" },
  "char.energy": { tc: "能量", sc: "能量", en: "Energy", jp: "エネルギー" },
  "char.trust": { tc: "信任", sc: "信任", en: "Trust", jp: "信頼" },
  "char.boundary": { tc: "邊界", sc: "边界", en: "Boundary", jp: "境界" },
  "char.roster": { tc: "夥伴名錄", sc: "伙伴名录", en: "Companion roster", jp: "相棒の名簿" },
  "char.codex": { tc: "開啟圖鑑", sc: "打开图鉴", en: "Open codex", jp: "図鑑を開く" },

  // ---- Companion select ----
  "roster.title": { tc: "已締結的夥伴", sc: "已缔结的伙伴", en: "Bonded Companions", jp: "結ばれた相棒" },
  "roster.subcopy": {
    tc: "這裡只顯示已締結或已解鎖的夥伴。灰影仍是第一位心核夥伴。",
    sc: "这里只显示已缔结或已解锁的伙伴。灰影仍是第一位心核伙伴。",
    en: "Only bonded or unlocked companions appear here. Greyshade remains your first.",
    jp: "ここには結ばれた・解放された相棒だけが出る。灰影は今も最初の相棒。"
  },
  "roster.active": { tc: "同行中", sc: "同行中", en: "Walking with you", jp: "同行中" },
  "status.available": { tc: "可同行", sc: "可同行", en: "Available", jp: "同行できる" },
  "status.preparing": { tc: "準備中", sc: "准备中", en: "Preparing", jp: "準備中" },
  "status.locked": { tc: "章節未解鎖", sc: "章节未解锁", en: "Chapter locked", jp: "章は未開放" },
  "status.unavailable": { tc: "暫不可同行", sc: "暂不可同行", en: "Not yet available", jp: "今は同行できない" },

  // ---- World Atlas ----
  "atlas.title": { tc: "世界地圖", sc: "世界地图", en: "World Atlas", jp: "世界地図" },
  "atlas.intro": {
    tc: "「聯結之河」串起 Linkara 的各個區域。你與灰影現在停在月湖一帶；其餘地方仍在遠處，會在之後的旅程裡慢慢靠近。",
    sc: "“联结之河”串起 Linkara 的各个区域。你与灰影现在停在月湖一带；其余地方仍在远处，会在之后的旅程里慢慢靠近。",
    en: "The River of Linking threads Linkara's regions together. You and Greyshade rest near the Moonlake; the rest remains far off, drawing closer on journeys to come.",
    jp: "「連結の河」が Linkara の各地をつなぐ。あなたと灰影は今、月湖のあたりに。ほかの地はまだ遠く、これからの旅で少しずつ近づく。"
  },
  "atlas.note": {
    tc: "這是一張遠景示意圖，不是任務清單，也沒有要趕著抵達的地方。",
    sc: "这是一张远景示意图，不是任务清单，也没有要赶着抵达的地方。",
    en: "This is a distant overview, not a quest list — there is nowhere you must rush to reach.",
    jp: "これは遠景の概略図で、任務一覧ではない。急いで着くべき場所はない。"
  },
  "atlas.here": { tc: "你在這裡", sc: "你在这里", en: "You are here", jp: "現在地" },
  "atlas.far": { tc: "遠方", sc: "远方", en: "Far away", jp: "遠方" },

  // ---- Soul Talk drawer ----
  "soul.kicker": { tc: "心語對話", sc: "心语对话", en: "Soul Talk", jp: "心の対話" },
  "soul.send": { tc: "送出", sc: "发送", en: "Send", jp: "送る" },
  "soul.placeholder": { tc: "輕聲說些什麼...", sc: "轻声说些什么...", en: "Say something softly...", jp: "そっと話しかけて..." },
  "soul.collapse": { tc: "收合心語", sc: "收起心语", en: "Collapse Soul Talk", jp: "心の声を閉じる" },

  // ---- Settings ----
  "set.title": { tc: "設定", sc: "设置", en: "Settings", jp: "設定" },
  "set.audio": { tc: "音效", sc: "音效", en: "Audio", jp: "サウンド" },
  "set.master": { tc: "主音量", sc: "主音量", en: "Master", jp: "全体音量" },
  "set.bgm": { tc: "背景音樂", sc: "背景音乐", en: "Music", jp: "BGM" },
  "set.sfx": { tc: "音效", sc: "音效", en: "Sound FX", jp: "効果音" },
  "set.soundToggle": { tc: "聲音開關", sc: "声音开关", en: "Sound on/off", jp: "サウンド オン/オフ" },
  "set.audioNote": {
    tc: "背景音樂會即時隨「主音量／背景音樂」變化（首次需輕觸畫面以啟用聲音）。音效素材仍在準備中。",
    sc: "背景音乐会即时随“主音量／背景音乐”变化（首次需轻触画面以启用声音）。音效素材仍在准备中。",
    en: "Music responds live to Master / Music (tap the screen once to enable sound). Sound FX assets are still in preparation.",
    jp: "BGM は「全体音量／BGM」に即時反応します（最初に画面を一度タップして音を有効化）。効果音の素材は準備中です。"
  },
  "set.display": { tc: "畫面", sc: "画面", en: "Display", jp: "画面" },
  "set.quality": { tc: "畫質", sc: "画质", en: "Quality", jp: "画質" },
  "set.qualityLow": { tc: "低", sc: "低", en: "Low", jp: "低" },
  "set.qualityMed": { tc: "中", sc: "中", en: "Mid", jp: "中" },
  "set.qualityHigh": { tc: "高", sc: "高", en: "High", jp: "高" },
  "set.textSize": { tc: "文字大小", sc: "文字大小", en: "Text size", jp: "文字サイズ" },
  "set.textSmall": { tc: "小", sc: "小", en: "S", jp: "小" },
  "set.textMed": { tc: "中", sc: "中", en: "M", jp: "中" },
  "set.textLarge": { tc: "大", sc: "大", en: "L", jp: "大" },
  "set.lowMotion": { tc: "低動態模式", sc: "低动态模式", en: "Reduced motion", jp: "モーション軽減" },
  "set.language": { tc: "語言", sc: "语言", en: "Language", jp: "言語" },
  "set.saveTitle": { tc: "存檔與引導", sc: "存档与引导", en: "Save & guidance", jp: "セーブと案内" },
  "set.saveNote": {
    tc: "目前進度保存在這台裝置。若要在手機重看開始、身份與心核引導，可從這裡重新播放，不會刪除記憶或痕跡。",
    sc: "目前进度保存在这台装置。若要在手机重看开始、身份与心核引导，可从这里重新播放，不会删除记忆或痕迹。",
    en: "Progress is saved on this device. Replay the start, identity, and guidance here without deleting memories or traces.",
    jp: "進行状況はこの端末に保存されます。開始・名前・案内をここから再生できます（記憶や痕跡は消えません）。"
  },
  "set.restart": { tc: "重新播放引導", sc: "重新播放引导", en: "Replay guidance", jp: "案内を再生" },
  "set.export": { tc: "匯出存檔", sc: "导出存档", en: "Export save", jp: "セーブを書き出す" },
  "set.delete": { tc: "刪除存檔", sc: "删除存档", en: "Delete save", jp: "セーブを削除" },
  "set.deleteNote": {
    tc: "刪除後會清空這台裝置上的記憶與痕跡，回到最開始的開場與輸入名字流程，無法復原。",
    sc: "删除后会清空这台装置上的记忆与痕迹，回到最开始的开场与输入名字流程，无法复原。",
    en: "Deleting clears this device's memories and traces and returns to the opening and name-entry flow. This cannot be undone.",
    jp: "削除するとこの端末の記憶と痕跡が消え、最初の開始と名前入力に戻ります。元には戻せません。"
  },

  // ---- Page status line（狀態列；EN pack：tc+en，sc/jp 回退）----
  "page.status.home": { tc: "回到月湖棲地。", en: "Back at the Moonlake habitat." },
  "page.status.explore": { tc: "月湖就在眼前。", en: "The Moonlake lies before you." },
  "page.status.care": { tc: "陪伴、休息、觀察。", en: "Stay, rest, observe." },
  "page.status.grow": { tc: "關係章節翻開了。", en: "A relationship chapter opens." },
  "page.status.memory": { tc: "已保存的回憶在這裡。", en: "Saved memories live here." },

  // ---- Mood labels（心情標籤）----
  "mood.calm": { tc: "平靜", en: "Calm" },
  "mood.warm": { tc: "靠近", en: "Close" },
  "mood.distant": { tc: "保持距離", en: "Keeping distance" },
  "mood.defensive": { tc: "需要邊界", en: "Needs boundaries" },
  "mood.tired": { tc: "疲倦", en: "Tired" },
  "mood.happy": { tc: "明亮", en: "Bright" },

  // ---- Explore page content ----
  "explore.cardCopy": {
    tc: "月湖周邊已醒來。牠願意靠近的距離，會慢慢改變。",
    en: "The Moonlake's edge has woken. How close it is willing to come will change, slowly."
  },
  "explore.stateAria": { tc: "探索狀態", en: "Exploration state" },
  "explore.openMapSub": { tc: "看看月湖的小路。", en: "Walk the small paths of the Moonlake." },
  "explore.atlasSub": { tc: "遠望整片大陸。", en: "Gaze at the wider continent." },
  "explore.lakeGlowSub": { tc: "安靜觀察牠留下的回應。", en: "Quietly watch the response it leaves." },
  "explore.lakeGlowStatus": { tc: "湖面留下了一圈柔和微光。", en: "A soft ring of light lingers on the lake." },
  "explore.crystalSub": { tc: "留下可見的棲地痕跡。", en: "Leave a visible trace in the habitat." },
  "explore.crystalStatus": { tc: "晶簇亮起微光，空氣變得穩定。", en: "The crystals glow faintly; the air settles." },

  // ---- Care page content ----
  "care.hintBoundary": { tc: "牠是否需要更多空間", en: "Whether it needs more space" },
  "care.hintTrust": { tc: "牠是否願意靠近", en: "Whether it is willing to come close" },
  "care.hintEnergy": { tc: "目前活動餘裕", en: "Room for activity right now" },
  "care.softNote": {
    tc: "這裡不交換、不討好。陪伴牠，也讓牠選擇距離。",
    en: "No trading, no pleasing here. Stay with it, and let it choose the distance."
  },
  "care.keepDistanceStatus": { tc: "你放慢靠近的速度，讓牠保有自己的距離。", en: "You slow your approach, letting it keep its own distance." },
  "care.sitQuietStatus": { tc: "你沒有要求牠回應，只是安靜地待在旁邊。", en: "You ask nothing of it — you simply stay nearby, quietly." },
  "care.primarySub": { tc: "尊重牠此刻的邊界。", en: "Respect the boundary it holds right now." },
  "care.restSub": { tc: "讓棲地慢下來。", en: "Let the habitat slow down." },
  "care.restStatus": { tc: "棲地安靜下來，適合一起休息。", en: "The habitat grows quiet — a good time to rest together." },
  "care.observeSub": { tc: "看牠的身體語言。", en: "Read its body language." },

  // ---- Growth page content ----
  "growth.nextPrefix": { tc: "下一段：", en: "Next: " },
  "growth.chapterEnd": { tc: "已抵達目前章節終點", en: "You've reached the end of this chapter" },
  "growth.nextCopy": { tc: "不是能力排行，是關係慢慢往前。", en: "Not a power ranking — a relationship moving forward, slowly." },
  "growth.endCopy": { tc: "這一章先到這裡。不用追。", en: "This chapter rests here. No need to chase." },
  "growth.progressAria": { tc: "關係章節進度", en: "Relationship chapter progress" },
  "growth.trustTuneSub": { tc: "把節奏調回來。", en: "Bring the rhythm back." },
  "growth.trustTuneStatus": { tc: "信任回路略微對齊。", en: "The trust loop aligns a little." },
  "growth.balanceSub": { tc: "整理現在的狀態。", en: "Settle how things are now." },
  "growth.balanceStatus": { tc: "心核回到更穩定的節奏。", en: "The heart-core returns to a steadier rhythm." },
  "growth.reviewSub": { tc: "翻翻牠的圖鑑。", en: "Leaf through its codex." },

  // ---- Memory page content ----
  "memory.evidenceAria": { tc: "記憶證據", en: "Memory evidence" },
  "memory.listAria": { tc: "已保存的記憶與痕跡", en: "Saved memories and traces" },
  "memory.echoSub": { tc: "回聽你們說過的話。", en: "Listen back to what you said to each other." },
  "memory.echoStatus": { tc: "最近的記憶被輕輕回看了一次。", en: "A recent memory was gently revisited." },
  "memory.openSoulSub": { tc: "想說什麼都可以。", en: "Say anything you like." },
  "memory.emptyTitle": { tc: "還沒有保存的記憶或痕跡", en: "No memories or traces saved yet" },
  "memory.emptyCopy": {
    tc: "等你和灰影貓留下真實互動後，這裡才會出現內容。",
    en: "Once you and Greyshade share real moments, they will appear here."
  },
  "memory.fallbackEmotionalTitle": { tc: "情緒記憶", en: "Emotional memory" },
  "memory.fallbackEmotionalCopy": { tc: "牠把這段感受留在棲地裡。", en: "It left this feeling in the habitat." },
  "memory.fallbackInteractionTitle": { tc: "互動記憶", en: "Interaction memory" },
  "memory.fallbackInteractionCopy": { tc: "這是一段已保存的互動。", en: "A saved moment between you." },
  "memory.intensityFmt": { tc: "（強度 {pct}%）", en: " (intensity {pct}%)" },
  "memory.reviewAria": { tc: "回看", en: "Revisit" },

  // ---- Time ----
  "time.unmarked": { tc: "未標記時間", en: "No timestamp" }
};
