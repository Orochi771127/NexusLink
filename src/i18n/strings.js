// UI chrome 字串字典：key -> { tc, sc, en, jp }。
// 範圍：靜態/動態「介面外框」字串（nav、HUD、設定、開場、頁標、面板標籤、按鈕），
// 以及四大頁（pageRouter）內容文案與行動回饋、心情標籤、狀態列文字。
// 不含：夥伴對話（Soul Talk 回應池）、Raphael 敘事、地圖結果文、區域/里程碑專有名詞 —— 維持繁中（另開內容翻譯 pack）。
// 簡/英/日 由 AI 生成，建議人工校對（尤其日文語氣）。

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
  "fl.hintTouch": { tc: "輕觸畫面裡的牠——牠會回應你。", sc: "轻触画面里的牠——牠会回应你。", en: "Tap the companion on screen — it will respond.", jp: "画面の中のあの子にそっと触れて——応えてくれる。" },
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
  "care.calmSync": { tc: "心核共息", sc: "心核共息", en: "Calm Sync", jp: "心核の共息" },

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

  // ---- Page status line（狀態列）----
  "page.status.home": { tc: "回到月湖棲地。", sc: "回到月湖栖地。", en: "Back at the Moonlake habitat.", jp: "月湖の棲み処に戻った。" },
  "page.status.explore": { tc: "月湖就在眼前。", sc: "月湖就在眼前。", en: "The Moonlake lies before you.", jp: "月湖はすぐそこに。" },
  "page.status.care": { tc: "陪伴、休息、觀察。", sc: "陪伴、休息、观察。", en: "Stay, rest, observe.", jp: "寄り添い、休み、見守る。" },
  "page.status.grow": { tc: "關係章節翻開了。", sc: "关系章节翻开了。", en: "A relationship chapter opens.", jp: "関係の章がひらいた。" },
  "page.status.memory": { tc: "已保存的回憶在這裡。", sc: "已保存的回忆在这里。", en: "Saved memories live here.", jp: "保存された思い出はここに。" },

  // ---- Mood labels（心情標籤）----
  "mood.calm": { tc: "平靜", sc: "平静", en: "Calm", jp: "おだやか" },
  "mood.warm": { tc: "靠近", sc: "靠近", en: "Close", jp: "そばにいる" },
  "mood.distant": { tc: "保持距離", sc: "保持距离", en: "Keeping distance", jp: "距離を保つ" },
  "mood.defensive": { tc: "需要邊界", sc: "需要边界", en: "Needs boundaries", jp: "境界がほしい" },
  "mood.tired": { tc: "疲倦", sc: "疲倦", en: "Tired", jp: "つかれぎみ" },
  "mood.happy": { tc: "明亮", sc: "明亮", en: "Bright", jp: "あかるい" },

  // ---- HUD mood labels（HUD/夥伴狀態面板用詞，與四大頁 tendency 用詞分開維護）----
  "hudMood.defensive": { tc: "防備", sc: "防备", en: "Guarded", jp: "身構え" },
  "hudMood.tired": { tc: "疲倦", sc: "疲倦", en: "Tired", jp: "つかれぎみ" },
  "hudMood.calm": { tc: "平靜", sc: "平静", en: "Calm", jp: "おだやか" },
  "hudMood.warm": { tc: "溫暖", sc: "温暖", en: "Warm", jp: "あたたか" },
  "hudMood.happy": { tc: "開心", sc: "开心", en: "Happy", jp: "うれしい" },
  "hudMood.distant": { tc: "疏離", sc: "疏离", en: "Distant", jp: "よそよそしい" },
  "hudMood.sad": { tc: "低落", sc: "低落", en: "Low", jp: "しずみがち" },
  "hudMood.angry": { tc: "生氣", sc: "生气", en: "Upset", jp: "おこりぎみ" },
  "hudMood.sleeping": { tc: "睡眠", sc: "睡眠", en: "Sleeping", jp: "ねむり" },
  "hudMood.balanced": { tc: "平衡", sc: "平衡", en: "Steady", jp: "おちつき" },

  // ---- Explore page content ----
  "explore.cardCopy": {
    tc: "月湖周邊已醒來。牠願意靠近的距離，會慢慢改變。",
    sc: "月湖周边已醒来。牠愿意靠近的距离，会慢慢改变。",
    en: "The Moonlake's edge has woken. How close it is willing to come will change, slowly.",
    jp: "月湖のほとりは目を覚ました。近づいてくれる距離は、ゆっくり変わっていく。"
  },
  "explore.stateAria": { tc: "探索狀態", sc: "探索状态", en: "Exploration state", jp: "探索の状態" },
  "explore.openMapSub": { tc: "看看月湖的小路。", sc: "看看月湖的小路。", en: "Walk the small paths of the Moonlake.", jp: "月湖の小道を歩いてみる。" },
  "explore.atlasSub": { tc: "遠望整片大陸。", sc: "远望整片大陆。", en: "Gaze at the wider continent.", jp: "大陸を遠くから眺める。" },
  "explore.lakeGlowSub": { tc: "安靜觀察牠留下的回應。", sc: "安静观察牠留下的回应。", en: "Quietly watch the response it leaves.", jp: "残された応えを静かに見つめる。" },
  "explore.lakeGlowStatus": { tc: "湖面留下了一圈柔和微光。", sc: "湖面留下了一圈柔和微光。", en: "A soft ring of light lingers on the lake.", jp: "湖面にやわらかな光の輪が残った。" },
  "explore.crystalSub": { tc: "留下可見的棲地痕跡。", sc: "留下可见的栖地痕迹。", en: "Leave a visible trace in the habitat.", jp: "棲み処に見える痕跡を残す。" },
  "explore.crystalStatus": { tc: "晶簇亮起微光，空氣變得穩定。", sc: "晶簇亮起微光，空气变得稳定。", en: "The crystals glow faintly; the air settles.", jp: "晶簇がほのかに灯り、空気が落ち着いた。" },

  // ---- Care page content ----
  "care.hintBoundary": { tc: "牠是否需要更多空間", sc: "牠是否需要更多空间", en: "Whether it needs more space", jp: "もっと空間が要るかどうか" },
  "care.hintTrust": { tc: "牠是否願意靠近", sc: "牠是否愿意靠近", en: "Whether it is willing to come close", jp: "近づきたい気持ちがあるか" },
  "care.hintEnergy": { tc: "目前活動餘裕", sc: "目前活动余裕", en: "Room for activity right now", jp: "いまの活動の余裕" },
  "care.softNote": {
    tc: "這裡不交換、不討好。陪伴牠，也讓牠選擇距離。",
    sc: "这里不交换、不讨好。陪伴牠，也让牠选择距离。",
    en: "No trading, no pleasing here. Stay with it, and let it choose the distance.",
    jp: "ここでは取引も機嫌取りもしない。寄り添いながら、距離は相手に選ばせる。"
  },
  "care.keepDistanceStatus": { tc: "你放慢靠近的速度，讓牠保有自己的距離。", sc: "你放慢靠近的速度，让牠保有自己的距离。", en: "You slow your approach, letting it keep its own distance.", jp: "近づく足を緩め、相手の距離を守った。" },
  "care.sitQuietStatus": { tc: "你沒有要求牠回應，只是安靜地待在旁邊。", sc: "你没有要求牠回应，只是安静地待在旁边。", en: "You ask nothing of it — you simply stay nearby, quietly.", jp: "応えを求めず、ただ静かにそばにいた。" },
  "care.primarySub": { tc: "尊重牠此刻的邊界。", sc: "尊重牠此刻的边界。", en: "Respect the boundary it holds right now.", jp: "いまの境界を尊重する。" },
  "care.restSub": { tc: "讓棲地慢下來。", sc: "让栖地慢下来。", en: "Let the habitat slow down.", jp: "棲み処をゆっくりさせる。" },
  "care.restStatus": { tc: "棲地安靜下來，適合一起休息。", sc: "栖地安静下来，适合一起休息。", en: "The habitat grows quiet — a good time to rest together.", jp: "棲み処が静かになり、一緒に休むのにいい頃合い。" },
  "care.calmSyncSub": { tc: "和牠一起把節奏放慢。", sc: "和牠一起把节奏放慢。", en: "Slow the rhythm down together.", jp: "一緒にリズムをゆっくりにする。" },
  "care.observeSub": { tc: "看牠的身體語言。", sc: "看牠的身体语言。", en: "Read its body language.", jp: "からだの言葉を見る。" },

  // ---- Calm Sync session ----
  "cs.hint": { tc: "慢一點。看著光圈就好。", sc: "慢一点。看着光圈就好。", en: "Slowly. Just stay with the ring.", jp: "ゆっくり。輪を見ているだけでいい。" },
  "cs.leave": { tc: "先離開", sc: "先离开", en: "Step away", jp: "いったん離れる" },
  "cs.leftEarly": { tc: "你們先停在這裡。這不是失敗。", sc: "你们先停在这里。这不是失败。", en: "You stop here for now. That is not failure.", jp: "ここでいったん止めた。失敗ではない。" },
  "cs.doneQuiet": { tc: "你沒有急著說話。節奏在你們之間安定下來。", sc: "你没有急着说话。节奏在你们之间安定下来。", en: "You do not hurry to speak. The rhythm settles between you.", jp: "急いで話さない。ふたりの間のリズムが落ち着いた。" },
  "cs.doneSynced": { tc: "牠的呼吸慢了下來，湖面也安靜了一些。", sc: "牠的呼吸慢了下来，湖面也安静了一些。", en: "Its breathing slows, and the lake quiets a little.", jp: "相手の呼吸がゆっくりになり、湖面も少し静まった。" },
  "cs.ringAria": { tc: "心核共息光圈", sc: "心核共息光圈", en: "Calm Sync heart-core ring", jp: "心核共息の光の輪" },

  // ---- Growth page content ----
  "growth.nextPrefix": { tc: "下一段：", sc: "下一段：", en: "Next: ", jp: "次の章：" },
  "growth.chapterEnd": { tc: "已抵達目前章節終點", sc: "已抵达目前章节终点", en: "You've reached the end of this chapter", jp: "いまの章はここで終わり" },
  "growth.nextCopy": { tc: "不是能力排行，是關係慢慢往前。", sc: "不是能力排行，是关系慢慢往前。", en: "Not a power ranking — a relationship moving forward, slowly.", jp: "能力の順位ではなく、関係がゆっくり進んでいく。" },
  "growth.endCopy": { tc: "這一章先到這裡。不用追。", sc: "这一章先到这里。不用追。", en: "This chapter rests here. No need to chase.", jp: "この章はここまで。急がなくていい。" },
  "growth.progressAria": { tc: "關係章節進度", sc: "关系章节进度", en: "Relationship chapter progress", jp: "関係の章の進み" },
  "growth.trustTuneSub": { tc: "把節奏調回來。", sc: "把节奏调回来。", en: "Bring the rhythm back.", jp: "リズムを取り戻す。" },
  "growth.trustTuneStatus": { tc: "信任回路略微對齊。", sc: "信任回路略微对齐。", en: "The trust loop aligns a little.", jp: "信頼の回路が少し揃った。" },
  "growth.balanceSub": { tc: "整理現在的狀態。", sc: "整理现在的状态。", en: "Settle how things are now.", jp: "いまの状態をととのえる。" },
  "growth.balanceStatus": { tc: "心核回到更穩定的節奏。", sc: "心核回到更稳定的节奏。", en: "The heart-core returns to a steadier rhythm.", jp: "心核がより安定したリズムに戻った。" },
  "growth.reviewSub": { tc: "翻翻牠的圖鑑。", sc: "翻翻牠的图鉴。", en: "Leaf through its codex.", jp: "図鑑をめくってみる。" },

  // ---- Memory page content ----
  "memory.evidenceAria": { tc: "記憶證據", sc: "记忆证据", en: "Memory evidence", jp: "記憶の証" },
  "memory.listAria": { tc: "已保存的記憶與痕跡", sc: "已保存的记忆与痕迹", en: "Saved memories and traces", jp: "保存された記憶と痕跡" },
  "memory.echoSub": { tc: "回聽你們說過的話。", sc: "回听你们说过的话。", en: "Listen back to what you said to each other.", jp: "交わした言葉を聴き返す。" },
  "memory.echoStatus": { tc: "最近的記憶被輕輕回看了一次。", sc: "最近的记忆被轻轻回看了一次。", en: "A recent memory was gently revisited.", jp: "最近の記憶がそっと見返された。" },
  "memory.openSoulSub": { tc: "想說什麼都可以。", sc: "想说什么都可以。", en: "Say anything you like.", jp: "何を話してもいい。" },
  "memory.emptyTitle": { tc: "還沒有保存的記憶或痕跡", sc: "还没有保存的记忆或痕迹", en: "No memories or traces saved yet", jp: "保存された記憶や痕跡はまだない" },
  "memory.emptyCopy": {
    tc: "等你和灰影貓留下真實互動後，這裡才會出現內容。",
    sc: "等你和灰影猫留下真实互动后，这里才会出现内容。",
    en: "Once you and Greyshade share real moments, they will appear here.",
    jp: "灰影と本当のやり取りを重ねたら、ここに現れてくる。"
  },
  "memory.fallbackEmotionalTitle": { tc: "情緒記憶", sc: "情绪记忆", en: "Emotional memory", jp: "感情の記憶" },
  "memory.fallbackEmotionalCopy": { tc: "牠把這段感受留在棲地裡。", sc: "牠把这段感受留在栖地里。", en: "It left this feeling in the habitat.", jp: "その気持ちは棲み処に残された。" },
  "memory.fallbackInteractionTitle": { tc: "互動記憶", sc: "互动记忆", en: "Interaction memory", jp: "やり取りの記憶" },
  "memory.fallbackInteractionCopy": { tc: "這是一段已保存的互動。", sc: "这是一段已保存的互动。", en: "A saved moment between you.", jp: "保存されたひとときのやり取り。" },
  "memory.intensityFmt": { tc: "（強度 {pct}%）", sc: "（强度 {pct}%）", en: " (intensity {pct}%)", jp: "（強さ {pct}%）" },
  "memory.reviewAria": { tc: "回看", sc: "回看", en: "Revisit", jp: "見返す" },

  // ---- Time ----
  "time.unmarked": { tc: "未標記時間", sc: "未标记时间", en: "No timestamp", jp: "時刻の記録なし" },

  // ---- Document / brand ----
  "meta.title": { tc: "Nexus Link · 心核連結", sc: "Nexus Link · 心核连结", en: "Nexus Link", jp: "Nexus Link · 心核連結" },

  // ---- Static aria labels（index.html 靜態層）----
  "aria.appShell": { tc: "Nexus Link 心核連結主畫面", sc: "Nexus Link 心核连结主画面", en: "Nexus Link main view", jp: "Nexus Link メイン画面" },
  "aria.habitatStage": { tc: "Nexus Link 第一棲地", sc: "Nexus Link 第一栖地", en: "Nexus Link first habitat", jp: "Nexus Link 最初の棲み処" },
  "aria.gameRoot": { tc: "心核連結棲地場景與夥伴層", sc: "心核连结栖地场景与伙伴层", en: "Habitat scene and companion layer", jp: "棲み処のシーンと相棒レイヤー" },
  "aria.pageLayer": { tc: "核心行動頁面", sc: "核心行动页面", en: "Core action pages", jp: "主要アクションページ" },
  "aria.onboardingRoot": { tc: "心核引導", sc: "心核引导", en: "Heart-Core Guidance", jp: "心核ガイダンス" },
  "aria.coreHud": { tc: "夥伴心核狀態", sc: "伙伴心核状态", en: "Companion heart-core status", jp: "相棒の心核ステータス" },
  "aria.openCompanion": { tc: "開啟夥伴狀態", sc: "打开伙伴状态", en: "Open companion status", jp: "相棒の状態を開く" },
  "aria.quickHud": { tc: "快速設定", sc: "快速设置", en: "Quick settings", jp: "クイック設定" },
  "aria.openSoulTalk": { tc: "開啟心語對話", sc: "打开心语对话", en: "Open Soul Talk", jp: "心の声を開く" },
  "aria.mainNav": { tc: "主要行動", sc: "主要行动", en: "Main actions", jp: "メインアクション" },
  "aria.homeNav": { tc: "回到心核棲地", sc: "回到心核栖地", en: "Return to the heart-core habitat", jp: "心核の棲み処へ戻る" },
  "aria.closePanel": { tc: "關閉面板", sc: "关闭面板", en: "Close panel", jp: "パネルを閉じる" },
  "aria.closeCharacter": { tc: "關閉夥伴狀態", sc: "关闭伙伴状态", en: "Close companion status", jp: "相棒の状態を閉じる" },
  "aria.coreStats": { tc: "夥伴詳細狀態", sc: "伙伴详细状态", en: "Companion detailed stats", jp: "相棒の詳細ステータス" },
  "aria.closeRoster": { tc: "關閉夥伴選擇", sc: "关闭伙伴选择", en: "Close companion select", jp: "相棒選択を閉じる" },
  "aria.closeMap": { tc: "關閉探索地圖", sc: "关闭探索地图", en: "Close exploration map", jp: "探索マップを閉じる" },
  "aria.mapCanvas": { tc: "探索節點地圖", sc: "探索节点地图", en: "Exploration node map", jp: "探索ノードマップ" },
  "aria.closeAtlas": { tc: "關閉世界地圖", sc: "关闭世界地图", en: "Close world atlas", jp: "世界地図を閉じる" },
  "aria.atlasLegend": { tc: "Linkara 區域", sc: "Linkara 区域", en: "Linkara regions", jp: "Linkara の地域" },
  "aria.noiseMeter": { tc: "雜訊濃度", sc: "杂讯浓度", en: "Noise level", jp: "ノイズの濃さ" },
  "aria.stabilityMeter": { tc: "心核穩定度", sc: "心核稳定度", en: "Heart-core stability", jp: "心核の安定度" },
  "aria.fatigue": { tc: "對峙疲勞", sc: "对峙疲劳", en: "Standoff fatigue", jp: "対峙の疲労" },
  "aria.battleActions": { tc: "對峙行動", sc: "对峙行动", en: "Standoff actions", jp: "対峙のアクション" },
  "aria.closeCodex": { tc: "關閉圖鑑", sc: "关闭图鉴", en: "Close codex", jp: "図鑑を閉じる" },
  "aria.codexBody": { tc: "圖鑑內容", sc: "图鉴内容", en: "Codex contents", jp: "図鑑の内容" },
  "aria.closeSettings": { tc: "關閉設定", sc: "关闭设置", en: "Close settings", jp: "設定を閉じる" },
  "aria.settingsBody": { tc: "設定內容", sc: "设置内容", en: "Settings contents", jp: "設定の内容" },
  "aria.quickReplyRow": { tc: "快速回覆選項", sc: "快速回复选项", en: "Quick reply options", jp: "クイック返信の選択肢" },
  "aria.closeActionSheet": { tc: "關閉棲地行動", sc: "关闭栖地行动", en: "Close habitat actions", jp: "棲み処アクションを閉じる" },
  "aria.actionList": { tc: "行動選項", sc: "行动选项", en: "Action options", jp: "アクションの選択肢" },

  // ---- Home presence / onboarding statics ----
  "habitat.moonlakeName": { tc: "月湖棲地", sc: "月湖栖地", en: "Moonlake Habitat", jp: "月湖の棲み処" },
  "habitat.moonlakeQuip": {
    tc: "灰影會記得痕跡，也會保留自己的距離。",
    sc: "灰影会记得痕迹，也会保留自己的距离。",
    en: "Greyshade remembers traces, and keeps its own distance.",
    jp: "灰影は痕跡を覚え、自分の距離も保つ。"
  },
  "ob.kicker": { tc: "Nexus Link ・ 心核連結", sc: "Nexus Link ・ 心核连结", en: "Nexus Link", jp: "Nexus Link ・ 心核連結" },
  "ob.namePlaceholder": { tc: "星夜旅人", sc: "星夜旅人", en: "Star-Night Traveler", jp: "星夜の旅人" },
  "hud.levelPill": { tc: "等級 01", sc: "等级 01", en: "Level 01", jp: "レベル 01" },
  "hud.soulPlaceholderNamed": { tc: "對 {name} 輕聲說些什麼...", sc: "对 {name} 轻声说些什么...", en: "Say something softly to {name}...", jp: "{name}にそっと話しかけて..." },
  "char.descFallback": { tc: "心核夥伴資料尚未完成。", sc: "心核伙伴资料尚未完成。", en: "Companion profile not ready yet.", jp: "相棒のデータはまだ準備中。" },
  "roster.kicker": { tc: "心核連結 ・ 已締結", sc: "心核连结 ・ 已缔结", en: "Nexus Link ・ Bonded", jp: "心核連結 ・ 結ばれた仲間" },

  // ---- Map / codex / action sheet panel statics ----
  "map.kicker": { tc: "心核路徑 ・ 夜湖周邊", sc: "心核路径 ・ 夜湖周边", en: "Heart-core paths ・ Around the night lake", jp: "心核の道 ・ 夜の湖のほとり" },
  "map.title": { tc: "探索地圖", sc: "探索地图", en: "Exploration Map", jp: "探索マップ" },
  "codex.kicker": { tc: "心核圖鑑", sc: "心核图鉴", en: "Heart-Core Codex", jp: "心核図鑑" },
  "codex.title": { tc: "夥伴圖鑑", sc: "伙伴图鉴", en: "Companion Codex", jp: "相棒図鑑" },
  "actionSheet.kicker": { tc: "棲地行動", sc: "栖地行动", en: "Habitat actions", jp: "棲み処アクション" },

  // ---- Standoff（心核對峙）statics + controller templates ----
  "battle.title": { tc: "心核對峙", sc: "心核对峙", en: "Heart-Core Standoff", jp: "心核の対峙" },
  "battle.noiseHint": { tc: "雜訊濃度——放輕它，而不是消滅它", sc: "杂讯浓度——放轻它，而不是消灭它", en: "Noise level — soften it, don't destroy it", jp: "ノイズの濃さ——消すのではなく、やわらげる" },
  "battle.sync": { tc: "同步", sc: "同步", en: "Sync", jp: "同調" },
  "battle.fatigue": { tc: "疲勞", sc: "疲劳", en: "Fatigue", jp: "疲労" },
  "battle.shards": { tc: "記憶微光", sc: "记忆微光", en: "Memory glimmers", jp: "記憶の微光" },
  "battle.barrierName": { tc: "邊界", sc: "边界", en: "Boundary", jp: "境界" },
  "battle.barrierHint": { tc: "立起柔光・穩定心核", sc: "立起柔光・稳定心核", en: "Raise soft light · steady the core", jp: "柔光を立て・心核を安定させる" },
  "battle.pulseName": { tc: "脈衝", sc: "脉冲", en: "Pulse", jp: "パルス" },
  "battle.pulseHint": { tc: "耗 2 同步・快速擊退", sc: "耗 2 同步・快速击退", en: "Costs 2 sync · quick push-back", jp: "同調2消費・素早く押し返す" },
  "battle.retreatName": { tc: "先撤退", sc: "先撤退", en: "Step away", jp: "いったん退く" },
  "battle.retreatHint": { tc: "懂得離開也是照顧", sc: "懂得离开也是照顾", en: "Knowing when to leave is also care", jp: "離れることも、いたわりのひとつ" },
  "battle.returnHome": { tc: "回到棲地", sc: "回到栖地", en: "Back to the habitat", jp: "棲み処へ戻る" },
  "battle.nodeUnstable": { tc: "場域不安定", sc: "场域不安定", en: "Field unstable", jp: "場が不安定" },
  "battle.stabilityOwner": { tc: "{name}的心核", sc: "{name}的心核", en: "{name}'s heart-core", jp: "{name}の心核" },
  "battle.noiseOf": { tc: "{name}的雜訊", sc: "{name}的杂讯", en: "Noise of {name}", jp: "{name}のノイズ" },
  "battle.resonanceHintDefault": { tc: "回收記憶・放輕雜訊", sc: "回收记忆・放轻杂讯", en: "Recover memories · soften the noise", jp: "記憶を拾い・ノイズをやわらげる" },
  "battle.resonanceHintEmotion": { tc: "心相共鳴・特別能安撫這片{emotion}", sc: "心相共鸣・特别能安抚这片{emotion}", en: "Heart resonance · especially soothes this {emotion}", jp: "心の共鳴・この{emotion}をとくに鎮める" }
};
