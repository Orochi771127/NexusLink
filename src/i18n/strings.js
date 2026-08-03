// UI chrome 字串字典：key -> { tc, sc, en, jp }。
// 範圍：靜態/動態「介面外框」字串（nav、HUD、設定、開場、頁標、面板標籤、按鈕），
// 以及四大頁（pageRouter）內容文案與行動回饋、心情標籤、狀態列文字。
// 不含：夥伴對話（Soul Talk 回應池）、Raphael 敘事、地圖結果文、區域/里程碑專有名詞 —— 維持繁中（另開內容翻譯 pack）。
// 例外（2026-08-03 Owner 核准）：`worldBark.*` 是棲地環境短句（8–24 字、身體語言優先），
// 不是 Soul Talk 深層對話，因此進本字典並四語齊全。深層對話仍維持繁中。
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
    // 初遇選角（CH-2）在本句之後——開場不得預告特定夥伴（2026-07-10 新玩家檢測 #1）。
    tc: "這是一段會留下痕跡的陪伴。牠會靠近，也會保留自己的邊界。",
    sc: "这是一段会留下痕迹的陪伴。它会靠近，也会保留自己的边界。",
    en: "This is companionship that leaves traces. They will draw near, and also keep their own boundaries.",
    jp: "これは痕跡を残す寄り添い。その子は近づくが、自分の境界も保つ。"
  },
  "ob.startBtn": { tc: "開始連結", sc: "开始连结", en: "Begin the Link", jp: "つながりを始める" },
  "ob.identityKicker": { tc: "本地身份", sc: "本地身份", en: "Local Identity", jp: "ローカルの名前" },
  "ob.identityTitle": { tc: "你希望我們怎麼稱呼你？", sc: "你希望我们怎么称呼你？", en: "What should we call you?", jp: "なんと呼べばいい？" },
  "ob.nameLabel": { tc: "稱呼", sc: "称呼", en: "Name", jp: "呼び名" },
  "ob.skipBtn": { tc: "稍後決定", sc: "稍后决定", en: "Decide later", jp: "あとで決める" },
  "ob.continueBtn": { tc: "繼續", sc: "继续", en: "Continue", jp: "続ける" },
  "ob.identityNote": {
    tc: "你的稱呼只會安靜留在這台手機裡，不被傳往任何地方。",
    sc: "你的称呼只会安静留在这台手机里，不被传往任何地方。",
    en: "Your name stays quietly on this device and is never uploaded anywhere.",
    jp: "あなたの呼び名は、この端末にそっと残るだけ。どこへも送信されません。"
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
  "fl.retrySkip": { tc: "再試一次", sc: "再试一次", en: "Try again", jp: "もう一度試す" },
  "fl.recoverableError": {
    tc: "剛才那一拍沒對上。沒關係，你還停在月湖邊，想再試試或先停下都可以，這不會影響你們的關係。",
    sc: "刚才那一拍没对上。没关系，你还停在月湖边，想再试试或先停下都可以，这不会影响你们的关系。",
    en: "That moment didn't quite catch. No worries—you're still at Moonlake, free to try again or pause.",
    jp: "さっきの一拍はうまく合いませんでした。月湖にいるまま、もう一度試すのも休むのも自由です。"
  },
  "rt.kicker": { tc: "共鳴線索", sc: "共鸣线索", en: "Resonance Thread", jp: "共鳴の手がかり" },
  "rt.whyLabel": { tc: "為什麼：", sc: "为什么：", en: "Why:", jp: "なぜ：" },
  "rt.consequenceLabel": { tc: "可能留下：", sc: "可能留下：", en: "May leave:", jp: "残ること：" },
  "rt.dismiss": { tc: "先這樣", sc: "先这样", en: "That's enough for now", jp: "いまはこれで" },
  "onboarding.busy": {
    tc: "正在把這一步，安靜留在你手心裡...",
    sc: "正在把这一步，安静留在你手心里...",
    en: "Placing this small step quietly into your hands...",
    jp: "この一歩を、そっと手元に残しています..."
  },
  "onboarding.recoverableError": {
    tc: "這一拍還沒安放好。你還停在這裡，想休息或重新開始都可以，別擔心。",
    sc: "这一拍还没安放好。你还停在这里，想休息或重新开始都可以，别担心。",
    en: "This moment hasn't settled yet. You're still right here; rest or try again whenever you like.",
    jp: "この一拍はまだ静まっていません。あなたはここにいるので、休むのもやり直すのも自由です。"
  },
  "fr.kicker": { tc: "初響", sc: "初响", en: "First Resonance", jp: "はじめの共鳴" },
  "fr.title": {
    tc: "兩道心核光，第一次試著聽見彼此。",
    sc: "两道心核光，第一次试着听见彼此。",
    en: "Two heart-core lights try to hear each other for the first time.",
    jp: "二つの心核の光が、初めて互いの声を聴こうとする。"
  },
  "fr.phaseListening": {
    tc: "你先靠近了。而牠不需要立刻回應你。",
    sc: "你先靠近。牠没有被要求立刻回应。",
    en: "You draw near first. It is not asked to answer at once.",
    jp: "あなたが先に近づく。すぐ応えることは求められていない。"
  },
  "fr.responseDistance": {
    tc: "牠留在月光外緣，安靜看著你。這也是回應。",
    sc: "牠留在月光外缘，安静看着你。这也是回应。",
    en: "It stays at the moonlight's edge and quietly watches. This, too, is an answer.",
    jp: "月明かりの縁に留まり、静かに見つめる。それもひとつの応え。"
  },
  "fr.responseApproach": {
    tc: "牠照著自己的步調，向你的光靠近了些。",
    sc: "牠按自己的步调，向你的光靠近了一点。",
    en: "At its own pace, it moves a little closer to your light.",
    jp: "自分の歩調で、あなたの光へ少しだけ近づく。"
  },
  "fr.responseHesitate": {
    tc: "牠的光停了一會兒，才輕輕給了回音。想猶豫一下也沒關係。",
    sc: "牠的光停了一会儿，才轻轻回响。迟疑也被允许。",
    en: "Its light pauses before softly answering. Hesitation is welcome here.",
    jp: "光はしばらく留まり、そっと響き返す。ためらいも許されている。"
  },
  "fr.phaseSettled": {
    tc: "這不是為了佔有，只是一句簡單的：我們可以從這裡開始。",
    sc: "这不是拥有的印记，只是一句：我们可以从这里开始。",
    en: "This is not a mark of ownership—only: we can begin here.",
    jp: "これは所有の印ではない。ただ、ここから始められるということ。"
  },
  "fr.skip": { tc: "略過演出", sc: "略过演出", en: "Skip presentation", jp: "演出をスキップ" },
  "fr.fallbackName": { tc: "這道心核光", sc: "这道心核光", en: "This heart-core light", jp: "この心核の光" },

  // ---- Living Habitat Moments V2 ----
  "hm.offer": { tc: "回應這個時刻", sc: "回应这个时刻", en: "Respond to this moment", jp: "このひとときに応える" },
  "hm.kicker": { tc: "棲地微時刻", sc: "栖地微时刻", en: "Habitat moment", jp: "棲み処のひととき" },
  "hm.close": { tc: "先不回應", sc: "先不回应", en: "Leave it unanswered", jp: "今は応えない" },
  "hm.quiet.title": { tc: "安靜靠近", sc: "安静靠近", en: "A quiet approach", jp: "静かな歩み寄り" },
  "hm.quiet.copy": {
    tc: "牠先靠近了一點。你可以回應、一起等，或讓這個邀請自然散去。",
    sc: "牠先靠近了一点。你可以回应、一起等，或让这个邀请自然散去。",
    en: "It comes a little closer first. You may respond, wait together, or let the invitation pass.",
    jp: "相棒が先に少し近づいた。応える、一緒に待つ、そのまま過ぎさせる、どれでもいい。"
  },
  "hm.moon.title": { tc: "共同看月", sc: "共同看月", en: "Watching the moon", jp: "一緒に月を見る" },
  "hm.moon.copy": {
    tc: "牠望向湖上的月光，沒有要求你把沉默填滿。",
    sc: "牠望向湖上的月光，没有要求你把沉默填满。",
    en: "It watches the moonlight on the lake without asking you to fill the silence.",
    jp: "湖面の月明かりを見つめている。沈黙を埋める必要はない。"
  },
  "hm.crystal.title": { tc: "心晶微光", sc: "心晶微光", en: "A crystal glimmer", jp: "心晶の微光" },
  "hm.crystal.copy": {
    tc: "牠在火光旁休息，遠處的心晶只亮了一下。這不是任務。",
    sc: "牠在火光旁休息，远处的心晶只亮了一下。这不是任务。",
    en: "It rests beside the fire while a distant heart crystal glimmers once. This is not a task.",
    jp: "火のそばで休む相棒の向こうで、心晶が一度だけ光る。これは任務ではない。"
  },
  "hm.choice.respond": { tc: "回應", sc: "回应", en: "Respond", jp: "応える" },
  "hm.choice.respondSub": { tc: "給一個很輕的回應，不替牠決定距離。", sc: "给一个很轻的回应，不替牠决定距离。", en: "Offer a small response without choosing its distance.", jp: "距離を決めず、そっと応える。" },
  "hm.choice.wait": { tc: "一起等一會兒", sc: "一起等一会儿", en: "Wait together", jp: "一緒に少し待つ" },
  "hm.choice.waitSub": { tc: "不催促，也不把等待變成進度。", sc: "不催促，也不把等待变成进度。", en: "Do not hurry it or turn waiting into progress.", jp: "急かさず、待つことを進捗にしない。" },
  "hm.choice.leave": { tc: "安靜離開", sc: "安静离开", en: "Leave quietly", jp: "静かに離れる" },
  "hm.choice.leaveSub": { tc: "離開也是完整選擇，不會失去任何東西。", sc: "离开也是完整选择，不会失去任何东西。", en: "Leaving is a complete choice. Nothing is lost.", jp: "離れることも完全な選択。失うものはない。" },
  "hm.resultFallback": { tc: "這個時刻安靜地結束了。", sc: "这个时刻安静地结束了。", en: "The moment ends quietly.", jp: "ひとときは静かに終わった。" },
  "hm.result.quiet_approach.respond": { tc: "你回了一個很輕的動作；牠停在自己選的距離。", sc: "你回了一个很轻的动作；牠停在自己选择的距离。", en: "You answer with a small gesture; it stays at a distance of its choosing.", jp: "そっと仕草を返す。相手は自分で選んだ距離に留まる。" },
  "hm.result.quiet_approach.wait": { tc: "你沒有催促。牠把這段安靜留在你們之間。", sc: "你没有催促。牠把这段安静留在你们之间。", en: "You do not hurry it. The quiet remains between you.", jp: "急かさずにいる。静けさがふたりの間に残る。" },
  "hm.result.quiet_approach.leave": { tc: "你先離開。這個邀請沒有變成欠下的事。", sc: "你先离开。这个邀请没有变成欠下的事。", en: "You leave first. The invitation does not become a debt.", jp: "先に離れる。この誘いが借りになることはない。" },
  "hm.result.fireside_settle.respond": { tc: "你在火光外側坐下，沒有要求牠靠近。", sc: "你在火光外侧坐下，没有要求牠靠近。", en: "You sit at the edge of the firelight without asking it to come closer.", jp: "火の光の外側に座り、近づくことを求めない。" },
  "hm.result.fireside_settle.wait": { tc: "你讓火光自己呼吸；牠照自己的節奏休息。", sc: "你让火光自己呼吸；牠照自己的节奏休息。", en: "You let the firelight breathe; it rests at its own pace.", jp: "火の光をそのまま揺らがせ、相手は自分の歩調で休む。" },
  "hm.result.fireside_settle.leave": { tc: "你把空間留給牠。離開也是完整的回應。", sc: "你把空间留给牠。离开也是完整的回应。", en: "You leave it space. Leaving is a complete response too.", jp: "相手のために空間を残す。離れることも完全な応えだ。" },
  "hm.result.moon_gaze.respond": { tc: "你也抬頭看月亮；沒有誰需要把沉默填滿。", sc: "你也抬头看月亮；没有谁需要把沉默填满。", en: "You look up at the moon too; neither of you has to fill the silence.", jp: "あなたも月を見上げる。沈黙を埋める必要はない。" },
  "hm.result.moon_gaze.wait": { tc: "你安靜等著。牠仍能決定要停留多久。", sc: "你安静等着。牠仍能决定要停留多久。", en: "You wait quietly. It still decides how long to stay.", jp: "静かに待つ。どれだけ留まるかは相手が決められる。" },
  "hm.result.moon_gaze.leave": { tc: "你讓牠獨自看完月色。這不是錯過。", sc: "你让牠独自看完月色。这不是错过。", en: "You let it finish watching the moon alone. Nothing was missed.", jp: "相手がひとりで月を見終える時間を残す。これは見逃しではない。" },
  "hm.result.invalid": { tc: "這個片刻已經散去。", sc: "这个片刻已经散去。", en: "The moment has already drifted away.", jp: "そのひとときは、もう静かに去った。" },
  "hm.result.safetyPause": { tc: "此刻先留白；不需要完成任何互動。", sc: "此刻先留白；不需要完成任何互动。", en: "Leave this moment open. Nothing needs to be completed.", jp: "いまは余白のままでいい。何かを完了する必要はない。" },
  "hm.result.expired": { tc: "這個片刻已經自然結束。", sc: "这个片刻已经自然结束。", en: "The moment has ended on its own.", jp: "そのひとときは自然に終わった。" },

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
  "explore.openOrbit": { tc: "月湖路徑・迴旋", sc: "月湖路径・回旋", en: "Moonlake path · Orbit", jp: "月湖の道・回旋" },

  // ---- Heartcore Orbit Battle chrome（R5 關鍵字；關卡正文仍可為內容語）----
  "orbit.dialogLabel": { tc: "心核迴旋戰", sc: "心核回旋战", en: "Heartcore Orbit Battle", jp: "心核回旋戦" },
  "orbit.kicker": { tc: "心核迴旋戰 ・ Resonance Orbit", sc: "心核回旋战 ・ Resonance Orbit", en: "Heartcore Orbit · Resonance", jp: "心核回旋戦 ・ Resonance Orbit" },
  "orbit.hint": { tc: "拉開微光化身，放手讓它順勢出發。隨時按 Esc 或退一步，這不是退縮。", sc: "拉开微光化身，放手让它顺势出发。随时按 Esc 或退一步，这不是退缩。", en: "Pull back the glowing avatar and let it leap forth. Press Esc or step back anytime—leaving is always okay.", jp: "光の化身を引き、手を放して解き放つ。Esc や退くことでいつでも離れられます。" },
  "orbit.retreat": { tc: "先撤退", sc: "先撤退", en: "Retreat", jp: "いったん退く" },
  "orbit.toMap": { tc: "回路徑圖", sc: "回路径图", en: "Back to path map", jp: "道の図へ戻る" },
  "orbit.again": { tc: "再挑戰本關", sc: "再挑战本关", en: "Retry this stage", jp: "この関に再挑戦" },
  "orbit.canvasLabel": { tc: "迴旋軌道", sc: "回旋轨道", en: "Orbit arena", jp: "回旋の軌道" },
  "orbit.mapKicker": { tc: "心核路徑 ・ 節點", sc: "心核路径 ・ 节点", en: "Heartcore paths · Nodes", jp: "心核の道 ・ 節点" },
  "orbit.mapTitle": { tc: "選擇路徑關卡", sc: "选择路径关卡", en: "Choose a path stage", jp: "道の関を選ぶ" },
  "orbit.mapNodesSuffix": { tc: "節點", sc: "节点", en: "Nodes", jp: "節点" },
  "orbit.mapNote": { tc: "這段路的步調留在這次相聚；蒐集的微光會安穩存入倉庫——這是你們走過的痕跡，不是冷冰冰的戰利品。即使受挫，走過的路也不會被抹去。", sc: "这段路的步调留在这次相聚；搜集的微光会安稳存入仓库——这是你们走过的痕迹，不是冷冰冰的战利品。即使受挫，走过的路也不会被抹去。", en: "Path progress rests in this gathering. Gathered motes stay in your vault as shared memories, not cold loot. Setbacks never erase your path.", jp: "道の歩みは今回のもの。集めた微光は倉庫に収まります——戦利品ではなく同行の痕跡です。つまずいても歩んだ過去は消えません。" },
  "orbit.mapRegions": { tc: "路徑區域", sc: "路径区域", en: "Path regions", jp: "道の区域" },
  "orbit.mapNodes": { tc: "關卡節點", sc: "关卡节点", en: "Stage nodes", jp: "関の節点" },
  "orbit.mapFar": { tc: "遠方", sc: "远方", en: "Far", jp: "遠方" },
  "orbit.nodeCleared": { tc: "已走過", sc: "已走过", en: "Walked", jp: "歩いた" },
  "orbit.nodeOpen": { tc: "可進入", sc: "可进入", en: "Open", jp: "入れる" },
  "orbit.nodeLocked": { tc: "尚未亮起", sc: "尚未亮起", en: "Not yet lit", jp: "まだ灯っていない" },
  "orbit.duelOpen": { tc: "迴旋對決", sc: "回旋对决", en: "Orbit duel", jp: "回旋の対局" },
  "orbit.closeExplore": { tc: "回到探索", sc: "回到探索", en: "Back to Explore", jp: "探索へ戻る" },
  "orbit.duelKicker": { tc: "迴旋對決 ・ 人機／幽靈", sc: "回旋对决 ・ 人机／幽灵", en: "Orbit duel · CPU / Ghost", jp: "回旋対局 ・ CPU／ゴースト" },
  "orbit.duelTitle": { tc: "選擇對手", sc: "选择对手", en: "Choose an opponent", jp: "相手を選ぶ" },
  "orbit.duelNote": { tc: "勝負只是過程，不會動搖你們的信任與羈絆。步調若太急切，心核會需要稍作沉靜休息。", sc: "胜负只是过程，不会动摇你们的信任与羁绊。步调若太急切，心核会需要稍作沉静休息。", en: "Wins or losses never shake your bond or trust. If the pace grows intense, take a quiet pause together.", jp: "勝敗でふたりの絆が揺らぐことはありません。急ぎすぎた時は、少し心を休めましょう。" },
  "orbit.duelArenaKicker": { tc: "迴旋對決", sc: "回旋对决", en: "Orbit duel", jp: "回旋対局" },
  "orbit.duelHint": { tc: "拉動發射你的化身；對手稍後進場。Esc 可撤退。", sc: "拉动发射你的化身；对手稍后进场。Esc 可撤退。", en: "Pull to launch your avatar; the foe enters shortly. Esc to retreat.", jp: "引いて化身を放つ。相手は少し遅れて入場。Esc で退ける。" },
  "orbit.duelCanvas": { tc: "對決軌道", sc: "对决轨道", en: "Duel arena", jp: "対局の軌道" },
  "orbit.pickerAgain": { tc: "再選對手", sc: "再选对手", en: "Pick again", jp: "相手を選び直す" },
  "orbit.duelAgain": { tc: "再來一場", sc: "再来一场", en: "One more bout", jp: "もう一局" },
  "orbit.statImpact": { tc: "衝擊", sc: "冲击", en: "Impact", jp: "衝撃" },
  "orbit.statSpin": { tc: "旋轉", sc: "旋转", en: "Spin", jp: "回転" },
  "orbit.statGuard": { tc: "韌性", sc: "韧性", en: "Guard", jp: "靭性" },
  "orbit.statBurst": { tc: "爆發", sc: "爆发", en: "Burst", jp: "爆発" },
  "orbit.statOverheat": { tc: "過熱", sc: "过热", en: "Overheat", jp: "過熱" },
  "orbit.goalPrefix": { tc: "目標", sc: "目标", en: "Goal", jp: "目標" },
  "orbit.motesPrefix": { tc: "遠征微光", sc: "远征微光", en: "Expedition motes", jp: "遠征の微光" },
  "orbit.refused": { tc: "夥伴拒絕了這次迴旋。", sc: "伙伴拒绝了这次回旋。", en: "Your companion refused this orbit.", jp: "相棒はこの回旋を拒んだ。" },
  "orbit.pathLit": { tc: "{path}亮起來了。你可以換路徑。", sc: "{path}亮起来了。你可以换路径。", en: "{path} lit up. You can switch paths.", jp: "{path}が灯った。道を変えられる。" },
  "orbit.mapLooking": { tc: "{name}看著路徑節點。想轉哪一關？", sc: "{name}看着路径节点。想转哪一关？", en: "{name} watches the path nodes. Which stage?", jp: "{name}が道の節点を見ている。どの関にする？" },

  "explore.atlas": { tc: "世界地圖", sc: "世界地图", en: "World Atlas", jp: "世界地図" },
  "explore.lakeGlow": { tc: "與夥伴走近湖畔", sc: "与伙伴走近湖畔", en: "Walk to the shore together", jp: "相棒と湖畔へ近づく" },
  "explore.crystal": { tc: "對準靜默錨點", sc: "对准静默锚点", en: "Attune the silent anchor", jp: "静かな錨に合わせる" },
  "explore.evTraces": { tc: "可見痕跡", sc: "可见痕迹", en: "Visible traces", jp: "見える痕跡" },
  "explore.evMemories": { tc: "情緒記憶", sc: "情绪记忆", en: "Emotional memories", jp: "感情の記憶" },

  "explore.nodeActions.open": { tc: "選擇月湖玩法", sc: "选择月湖玩法", en: "Choose a Moonlake activity", jp: "月湖での過ごし方を選ぶ" },
  "explore.nodeActions.openSub": { tc: "迴旋是主路徑；遠征與對峙依世界狀態開放。", sc: "回旋是主路径；远征与对峙依世界状态开放。", en: "Orbit is the main path; Expedition and Standoff open with the world.", jp: "迴旋が主な道。遠征と対峙は世界の状態に応じて開く。" },
  "explore.nodeActions.title": { tc: "這次想怎麼走進月湖？", sc: "这次想怎么走进月湖？", en: "How do you want to enter Moonlake?", jp: "今回は、どう月湖へ入る？" },
  "explore.nodeActions.copy": { tc: "就算在同一個地方，也可以看你們現在的心情來決定想做什麼。", sc: "同一个探索节点，依你们此刻的状态选择玩法。", en: "Choose a mode for this node based on where you both are now.", jp: "同じ探索ノードから、今のふたりに合う遊び方を選ぶ。" },
  "explore.nodeActions.close": { tc: "關閉玩法選擇", sc: "关闭玩法选择", en: "Close activity choices", jp: "選択を閉じる" },
  "explore.nodeActions.primary": { tc: "主要玩法", sc: "主要玩法", en: "Main activity", jp: "メイン" },
  "explore.nodeActions.orbit": { tc: "心核迴旋", sc: "心核回旋", en: "Heartcore Orbit", jp: "心核迴旋" },
  "explore.nodeActions.orbitSub": { tc: "決定啟動條件，陪夥伴完成一段可讀的共鳴軌跡。", sc: "决定启动条件，陪伙伴完成一段可读的共鸣轨迹。", en: "Set the launch, then follow your companion's readable resonance path.", jp: "起動を決め、仲間が描く共鳴の軌跡を見届ける。" },
  "explore.nodeActions.expedition": { tc: "心域遠征", sc: "心域远征", en: "Heart-domain Expedition", jp: "心域遠征" },
  "explore.nodeActions.expeditionSub": { tc: "前往已亮起的區域，讓夥伴自主取材。", sc: "前往已亮起的区域，让伙伴自主取材。", en: "Visit a lit region and let your companion gather impressions.", jp: "灯った地域へ向かい、仲間自身の取材を見守る。" },
  "explore.nodeActions.expeditionLocked": { tc: "更遠的區域尚未亮起；先沿月湖主路徑前進。", sc: "更远的区域尚未亮起；先沿月湖主路径前进。", en: "Farther regions are not lit yet. Follow Moonlake's main path first.", jp: "遠い地域はまだ灯っていない。まず月湖の主な道を進もう。" },
  "explore.nodeActions.standoff": { tc: "裂隙對峙", sc: "裂隙对峙", en: "Rift Standoff", jp: "裂隙対峙" },
  "explore.nodeActions.standoffSub": { tc: "回到路徑圖，選擇已出現的裂隙節點。", sc: "回到路径图，选择已出现的裂隙节点。", en: "Return to the path map and choose a rift that has appeared.", jp: "経路図へ戻り、現れた裂隙ノードを選ぶ。" },
  "explore.nodeActions.standoffLocked": { tc: "等你們留下可見痕跡後，裂隙才會成為可讀的選項。", sc: "等你们留下可见痕迹后，裂隙才会成为可读的选项。", en: "A rift becomes readable only after you have left a visible trace together.", jp: "ふたりの痕跡が見えるようになってから、裂隙は選べる形になる。" },

  // ---- Care page body ----
  "care.boundary": { tc: "邊界", sc: "边界", en: "Boundary", jp: "境界" },
  "care.trust": { tc: "信任", sc: "信任", en: "Trust", jp: "信頼" },
  "care.energy": { tc: "精力", sc: "精力", en: "Energy", jp: "活力" },
  "care.sitQuiet": { tc: "靜靜陪伴", sc: "静静陪伴", en: "Sit quietly together", jp: "静かに寄り添う" },
  "care.softComfort": { tc: "輕聲安撫", sc: "轻声安抚", en: "Soft comfort", jp: "やさしくなだめる" },
  "care.keepDistance": { tc: "靜靜陪伴", sc: "静静陪伴", en: "Sit quietly nearby", jp: "静かに寄り添う" },
  "care.restTogether": { tc: "一起休息", sc: "一起休息", en: "Rest together", jp: "一緒に休む" },
  "care.observe": { tc: "觀察牠的動作", sc: "读身体语言", en: "Read its body language", jp: "からだの言葉を読む" },
  "care.calmSync": { tc: "心核共息", sc: "心核共息", en: "Calm Sync", jp: "心核の共息" },

  // ---- Growth page body ----
  "growth.trustTune": { tc: "回顧信任時刻", sc: "回顾信任时刻", en: "Recall a trust moment", jp: "信頼のときを振り返る" },
  "growth.emotionBalance": { tc: "心核共息", sc: "心核共息", en: "Calm Sync", jp: "心核の共息" },
  "growth.review": { tc: "翻開關係圖鑑", sc: "翻开关系图鉴", en: "Open the bond codex", jp: "関係の図鑑をひらく" },

  // ---- Memory page body ----
  "memory.evInteractions": { tc: "互動記憶", sc: "互动记忆", en: "Interaction memories", jp: "やり取りの記憶" },
  "memory.evEmotional": { tc: "情緒記憶", sc: "情绪记忆", en: "Emotional memories", jp: "感情の記憶" },
  "memory.evTraces": { tc: "棲地痕跡", sc: "栖地痕迹", en: "Habitat traces", jp: "棲み処の痕跡" },
  "memory.evAnchors": { tc: "關係錨點", sc: "关系锚点", en: "Relationship anchors", jp: "関係の錨" },
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
    tc: "「聯結之河」串起 Linkara 的各個區域。你與{name}現在停在{region}一帶；其餘地方仍在遠處，會在之後的旅程裡慢慢靠近。",
    sc: "“联结之河”串起 Linkara 的各个区域。你与{name}现在停在{region}一带；其余地方仍在远处，会在之后的旅程里慢慢靠近。",
    en: "The River of Linking threads Linkara's regions together. You and {name} rest near {region}; the rest remains far off, drawing closer on journeys to come.",
    jp: "「連結の河」が Linkara の各地をつなぐ。あなたと{name}は今、{region}のあたりに。ほかの地はまだ遠く、これからの旅で少しずつ近づく。"
  },
  "atlas.note": {
    tc: "這是一張遠景示意圖，不是任務清單，也沒有要趕著抵達的地方。",
    sc: "这是一张远景示意图，不是任务清单，也没有要赶着抵达的地方。",
    en: "This is a distant overview, not a quest list — there is nowhere you must rush to reach.",
    jp: "これは遠景の概略図で、任務一覧ではない。急いで着くべき場所はない。"
  },
  "atlas.here": { tc: "你在這裡", sc: "你在这里", en: "You are here", jp: "現在地" },
  "atlas.far": { tc: "遠方", sc: "远方", en: "Far away", jp: "遠方" },
  "atlas.walked": { tc: "走過", sc: "走过", en: "Walked", jp: "歩んだ道" },
  "atlas.chapterOf": { tc: "第 {no} 章", sc: "第 {no} 章", en: "Chapter {no}", jp: "第 {no} 章" },

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
    tc: "隨時調成你最舒服的音量（第一次輕觸畫面時，棲地的聲音就會醒來）。",
    sc: "随时调成你最舒服的音量（第一次轻触画面时，栖地的声音就会醒来）。",
    en: "Adjust volume to whatever feels most comfortable (tap once on screen to awaken the audio).",
    jp: "一番心地よい音量に調整できます（画面を一度タップすると、棲み処の音が目覚めます）。"
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
    tc: "你的旅程記憶保存在這台手機裡。想重溫初遇、稱呼或棲地引導時，隨時可以重新播放，這不會抹去任何回憶或痕跡。",
    sc: "你的旅程记忆保存在这台手机里。想重温初遇、称呼或栖地引导时，随时可以重新播放，这不会抹去任何回忆或痕迹。",
    en: "Your memories stay safe on this device. Replay the opening, identity, or guidance anytime without losing any memories or traces.",
    jp: "旅の記憶はこの端末に大切に保管されています。出会いや案内をいつでも再再生できます（思い出や痕跡は消えません）。"
  },
  "set.restart": { tc: "重新播放引導", sc: "重新播放引导", en: "Replay guidance", jp: "案内を再生" },
  "set.export": { tc: "匯出存檔", sc: "导出存档", en: "Export save", jp: "セーブを書き出す" },
  "set.exportTranscript": {
    tc: "匯出心語對話",
    sc: "导出心语对话",
    en: "Export Soul Talk log",
    jp: "心の声ログを書き出す"
  },
  "set.exportTranscriptNote": {
    tc: "對話紀錄只珍藏在這台手機中。匯出僅供你自己留存細看，絕不會被上傳或作為任何自動訓練。",
    sc: "对话纪录只珍藏在这台手机中。导出仅供你自己留存细看，绝不会被上传或作为任何自动训练。",
    en: "Conversation logs belong solely to this device. Exporting is strictly for your personal review—no uploads, no auto-training.",
    jp: "対話の記憶はこの端末だけのもの。ご自身での振り返り用に書き出せます（アップロードや自動学習はありません）。"
  },
  "set.delete": { tc: "刪除存檔", sc: "删除存档", en: "Delete save", jp: "セーブを削除" },
  "set.deleteNote": {
    tc: "這會抹去這台手機裡所有的記憶與走過的痕跡，回到最初相遇的時刻。此動作無法復原，請溫柔決定。",
    sc: "这会抹去这台手机里所有的记忆与走过的痕迹，回到最初相遇的时刻。此动作无法复原，请温柔决定。",
    en: "This clears all memories and traces on this device and returns to your very first meeting. This cannot be undone.",
    jp: "この端末のすべての記憶と痕跡を消去し、最初の出会いに戻ります。元に戻せませんので、慎重にお選びください。"
  },

  // ---- Page status line（狀態列）----
  "page.status.home": { tc: "回到月湖棲地。", sc: "回到月湖栖地。", en: "Back at the Moonlake habitat.", jp: "月湖の棲み処に戻った。" },
  "page.status.explore": { tc: "月湖就在眼前。", sc: "月湖就在眼前。", en: "The Moonlake lies before you.", jp: "月湖はすぐそこに。" },
  "page.status.care": { tc: "陪伴、休息、觀察。", sc: "陪伴、休息、观察。", en: "Stay, rest, observe.", jp: "寄り添い、休み、見守る。" },
  "page.status.grow": { tc: "關係章節翻開了。", sc: "关系章节翻开了。", en: "A relationship chapter opens.", jp: "関係の章がひらいた。" },
  "page.status.memory": { tc: "已保存的回憶在這裡。", sc: "已保存的回忆在这里。", en: "Saved memories live here.", jp: "保存された思い出はここに。" },
  "page.status.busy": {
    tc: "陪伴正在發生，先放慢腳步，留在此刻...",
    sc: "陪伴正在发生，先放慢脚步，留在此刻...",
    en: "This quiet moment is taking shape. Stay right here...",
    jp: "静かな時間が流れています。どうぞそのまま..."
  },
  "page.status.unavailable": {
    tc: "這條路此刻還在沉睡。別急，你們隨時可以換個安穩的步調。",
    sc: "这条路此刻还在沉睡。别急，你们随时可以换个安稳的步调。",
    en: "That path slumbers for now. No hurry—feel free to choose another comfortable action.",
    jp: "その道はまだ眠っています。焦らず、別の心地よい動作を選んでみましょう。"
  },
  "page.status.recoverableError": {
    tc: "剛才的呼吸沒完全對上。別擔心，這一頁還安好，你們可以再試試或先回心核。",
    sc: "刚才的呼吸没完全对上。别担心，这一页还安好，你们可以再试试或先回心核。",
    en: "That motion didn't quite sync. No worries—this page remains open. Feel free to retry or head back.",
    jp: "さっきの息合いは未完了でした。大丈夫、この画面は残っています。再試行するか心核へ戻れます。"
  },

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
  "explore.openOrbitSub": { tc: "放出心核化身，短局轉一場。", sc: "放出心核化身，短局转一场。", en: "Release a heartcore avatar for a short orbit bout.", jp: "心核の化身を放ち、短く一巡する。" },
  "explore.atlasSub": { tc: "遠望整片大陸。", sc: "远望整片大陆。", en: "Gaze at the wider continent.", jp: "大陸を遠くから眺める。" },
  "explore.lakeGlowSub": { tc: "一起走到岸邊，看牠怎麼回應。", sc: "一起走到岸边，看牠怎么回应。", en: "Walk to the shore together and watch how it responds.", jp: "岸まで一緒に行き、応え方を見る。" },
  "explore.lakeGlowStatus": { tc: "你們一起走近湖岸。湖面留下一圈柔和微光。", sc: "你们一起走近湖岸。湖面留下一圈柔和微光。", en: "You walk to the shore together. A soft ring of light lingers on the lake.", jp: "一緒に岸へ近づいた。湖面にやわらかな光の輪が残った。" },
  "explore.crystalSub": { tc: "把散落的微光收成可回看的晶簇。", sc: "把散落的微光收成可回看的晶簇。", en: "Gather scattered glimmers into a crystal you can revisit.", jp: "散った微光を、見返せる晶簇にまとめる。" },
  "explore.crystalStatus": { tc: "散落的微光被收進晶簇。空氣安定下來。", sc: "散落的微光被收进晶簇。空气安定下来。", en: "Scattered glimmers gather into the crystal. The air settles.", jp: "散った微光が晶簇に収まり、空気が落ち着いた。" },

  // ---- Care page content ----
  "care.hintBoundary": { tc: "牠是否需要更多空間", sc: "牠是否需要更多空间", en: "Whether it needs more space", jp: "もっと空間が要るかどうか" },
  "care.hintTrust": { tc: "牠是否願意靠近", sc: "牠是否愿意靠近", en: "Whether it is willing to come close", jp: "近づきたい気持ちがあるか" },
  "care.hintEnergy": { tc: "目前還有的精力", sc: "目前活动余裕", en: "Room for activity right now", jp: "いまの活動の余裕" },
  "care.softNote": {
    tc: "這裡不交換、不討好。陪伴牠，也讓牠選擇距離。",
    sc: "这里不交换、不讨好。陪伴牠，也让牠选择距离。",
    en: "No trading, no pleasing here. Stay with it, and let it choose the distance.",
    jp: "ここでは取引も機嫌取りもしない。寄り添いながら、距離は相手に選ばせる。"
  },
  "care.keepDistanceStatus": { tc: "你只是待在牠身邊，沒有伸手。牠的肩膀慢慢鬆了。", sc: "你只是待在牠身边，没有伸手。牠的肩膀慢慢松了。", en: "You stay nearby without reaching out. Its shoulders slowly ease.", jp: "手を伸ばさず、そばにいるだけ。肩がゆっくりゆるんだ。" },
  "care.sitQuietStatus": { tc: "你沒有要求牠回應，只是安靜地待在旁邊。", sc: "你没有要求牠回应，只是安静地待在旁边。", en: "You ask nothing of it — you simply stay nearby, quietly.", jp: "応えを求めず、ただ静かにそばにいた。" },
  "care.softComfortStatus": { tc: "你放輕聲音。夥伴稍微放鬆了一點。", sc: "你放轻声音。伙伴稍微放松了一点。", en: "You soften your voice. It eases a little.", jp: "声をやわらげた。少し肩の力が抜けた。" },
  "care.primarySub": { tc: "尊重牠此刻的邊界。", sc: "尊重牠此刻的边界。", en: "Respect the boundary it holds right now.", jp: "いまの境界を尊重する。" },
  "care.restSub": { tc: "依牠的精力，一起把節奏放慢。", sc: "依牠的精力，一起把节奏放慢。", en: "Slow the rhythm together, matching its energy.", jp: "相手の余裕に合わせて、一緒にゆっくりする。" },
  "care.restStatus": { tc: "你們一起休息，棲地安靜下來。", sc: "你们一起休息，栖地安静下来。", en: "You rest together. The habitat grows quiet.", jp: "一緒に休み、棲み処が静かになった。" },
  "care.calmSyncSub": { tc: "和牠一起把節奏放慢。", sc: "和牠一起把节奏放慢。", en: "Slow the rhythm down together.", jp: "一緒にリズムをゆっくりにする。" },
  "care.observeSub": { tc: "讀懂耳朵、肩線與距離。", sc: "读懂耳朵、肩线与距离。", en: "Read its ears, shoulders, and distance.", jp: "耳・肩・距離を読み取る。" },

  // ---- Calm Sync session ----
  "cs.hint": { tc: "慢一點。看著光圈就好。", sc: "慢一点。看着光圈就好。", en: "Slowly. Just stay with the ring.", jp: "ゆっくり。輪を見ているだけでいい。" },
  "cs.leave": { tc: "先離開", sc: "先离开", en: "Step away", jp: "いったん離れる" },
  "cs.leftEarly": { tc: "你們先停在這裡。這不是失敗。", sc: "你们先停在这里。这不是失败。", en: "You stop here for now. That is not failure.", jp: "ここでいったん止めた。失敗ではない。" },
  "cs.doneQuiet": { tc: "你沒有急著說話。節奏在你們之間安定下來。", sc: "你没有急着说话。节奏在你们之间安定下来。", en: "You do not hurry to speak. The rhythm settles between you.", jp: "急いで話さない。ふたりの間のリズムが落ち着いた。" },
  "cs.doneSynced": { tc: "牠的呼吸慢了下來，湖面也安靜了一些。", sc: "牠的呼吸慢了下来，湖面也安静了一些。", en: "Its breathing slows, and the lake quiets a little.", jp: "相手の呼吸がゆっくりになり、湖面も少し静まった。" },
  "cs.ringAria": { tc: "心核共息光圈", sc: "心核共息光圈", en: "Calm Sync heart-core ring", jp: "心核共息の光の輪" },

  // ---- Growth page content ----
  "growth.session.kicker": { tc: "心相練習 · 當下觀察", sc: "心相练习 · 当下观察", en: "Heart Phase · This moment", jp: "心相練習・今の観察" },
  "growth.session.companionFallback": { tc: "夥伴", sc: "伙伴", en: "Companion", jp: "パートナー" },
  "growth.session.phase.resting.label": { tc: "收息", sc: "收息", en: "Drawing breath", jp: "息を収める" },
  "growth.session.phase.resting.copy": { tc: "牠把重心放低；今天的節奏可以更慢。", sc: "牠把重心放低；今天的节奏可以更慢。", en: "It lowers its center. Today's rhythm can be slower.", jp: "重心を低くしている。今日はもっとゆっくりでいい。" },
  "growth.session.phase.guarded.label": { tc: "守界", sc: "守界", en: "Holding a boundary", jp: "境界を守る" },
  "growth.session.phase.guarded.copy": { tc: "牠留出一段距離，也讓你看見哪裡可以停下。", sc: "牠留出一段距离，也让你看见哪里可以停下。", en: "It keeps some distance and shows you where to stop.", jp: "少し距離を取り、どこで止まれるかを見せている。" },
  "growth.session.phase.curious.label": { tc: "探光", sc: "探光", en: "Following light", jp: "光を探す" },
  "growth.session.phase.curious.copy": { tc: "牠正注意湖面的微光，像是在等一個可以一起讀的方向。", sc: "牠正注意湖面的微光，像是在等一个可以一起读的方向。", en: "It watches the lake glow, waiting for a direction you can read together.", jp: "湖面の微光を見つめ、一緒に読める方向を待っている。" },
  "growth.session.phase.steady.label": { tc: "承光", sc: "承光", en: "Holding the light", jp: "光を受け止める" },
  "growth.session.phase.steady.copy": { tc: "牠的姿態很穩；不必證明什麼，也能一起留在這裡。", sc: "牠的姿态很稳；不必证明什么，也能一起留在这里。", en: "Its posture is steady. You can stay without proving anything.", jp: "姿勢は穏やかだ。何かを証明しなくても、一緒にここにいられる。" },
  "growth.session.waitingTitle": { tc: "先讀牠的姿態", sc: "先读牠的姿态", en: "Read its posture first", jp: "まず姿勢を読む" },
  "growth.session.waitingCopy": { tc: "選一種共同練習。牠可以接受、改寫、休息或不做。", sc: "选一种共同练习。牠可以接受、改写、休息或不做。", en: "Choose a shared practice. It may accept, adapt, rest, or decline.", jp: "共同練習をひとつ選ぶ。受け入れる、変える、休む、断る、どれも選べる。" },
  "growth.session.observedTitle": { tc: "這次觀察到的感覺", sc: "这一幕看见的倾向", en: "Tendencies seen in this moment", jp: "この場面で見えた傾向" },
  "growth.session.observedNote": { tc: "這只是一種感覺，不是進度條。當下的氣氛會慢慢淡去，只有真正一起度過的片刻，才會留下痕跡。", sc: "是质性观察，不是进度；当下相位会淡去，只有确实完成的共同片刻可能留下痕迹。", en: "A qualitative observation, not progress. The phase fades; only a shared moment truly completed may leave a trace.", jp: "進捗ではない質的な観察。相位は薄れ、実際に終えた共同の瞬間だけが痕跡になることがある。" },
  "growth.session.observedEmpty": { tc: "還沒留下什麼觀察。休息或拒絕本來就不需要當作進度來記錄。", sc: "还没有留下观察；休息与拒绝不需要被记成进度。", en: "Nothing observed yet. Rest and refusal do not need to become progress.", jp: "まだ観察はない。休息や拒否を進捗にする必要はない。" },
  "growth.session.tendency.attunement": { tc: "共息", sc: "共息", en: "Attunement", jp: "共息" },
  "growth.session.tendency.boundary_respect": { tc: "守界", sc: "守界", en: "Boundary respect", jp: "境界尊重" },
  "growth.session.tendency.pathfinding": { tc: "探路", sc: "探路", en: "Pathfinding", jp: "道探し" },
  "growth.session.tendency.steadfastness": { tc: "承光", sc: "承光", en: "Steadfastness", jp: "承光" },
  "growth.session.practiceAria": { tc: "當下可選的四種共同練習", sc: "当下可选的四种共同练习", en: "Four shared practices available now", jp: "いま選べる四つの共同練習" },
  "growth.session.practice.attunement.label": { tc: "一起共息", sc: "一起共息", en: "Breathe together", jp: "一緒に息を合わせる" },
  "growth.session.practice.attunement.copy": { tc: "先聽彼此的停頓，不急著得到答案。", sc: "先听彼此的停顿，不急着得到答案。", en: "Listen to each pause without hurrying toward an answer.", jp: "答えを急がず、互いの間を聴く。" },
  "growth.session.practice.boundaryRespect.label": { tc: "讀牠的界線", sc: "读牠的界线", en: "Read its boundary", jp: "境界を読む" },
  "growth.session.practice.boundaryRespect.copy": { tc: "讓距離也成為一種可以被尊重的回答。", sc: "让距离也成为一种可以被尊重的回答。", en: "Let distance be an answer worthy of respect.", jp: "距離も尊重できる答えとして受け取る。" },
  "growth.session.practice.pathfinding.label": { tc: "沿微光探路", sc: "沿微光探路", en: "Follow the faint light", jp: "微光に沿って探る" },
  "growth.session.practice.pathfinding.copy": { tc: "一起讀一個方向，也容許暫時未知。", sc: "一起读一个方向，也容许暂时未知。", en: "Read one direction together, while allowing the unknown.", jp: "ひとつの方向を一緒に読み、未知もそのまま許す。" },
  "growth.session.practice.steadfastness.label": { tc: "陪牠承接痕跡", sc: "陪牠承接痕迹", en: "Stay with the trace", jp: "痕跡と共にいる" },
  "growth.session.practice.steadfastness.copy": { tc: "不抹去發生過的事，只陪它安穩地留下。", sc: "不抹去发生过的事，只陪它安稳地留下。", en: "Do not erase what happened; help it remain safely.", jp: "起きたことを消さず、穏やかに残るのを支える。" },
  "growth.session.outcome.accept": { tc: "一起做", sc: "一起做", en: "Together", jp: "一緒にする" },
  "growth.session.outcome.modify": { tc: "換一種做", sc: "换一种做", en: "Adapted", jp: "やり方を変える" },
  "growth.session.outcome.rest": { tc: "先休息", sc: "先休息", en: "Rest", jp: "先に休む" },
  "growth.session.outcome.decline": { tc: "今天不做", sc: "今天不做", en: "Not today", jp: "今日はしない" },
  "growth.session.response.accept.attunement": { tc: "牠跟上你的呼吸，停頓逐漸對齊。", sc: "牠跟上你的呼吸，停顿逐渐对齐。", en: "It follows your breathing, and the pauses begin to align.", jp: "呼吸が重なり、間が少しずつ揃っていく。" },
  "growth.session.response.accept.boundary_respect": { tc: "牠保留距離，也讓你看見「現在可以到這裡」。", sc: "牠保留距离，也让你看见“现在可以到这里”。", en: "It keeps its distance and shows you: this is far enough for now.", jp: "距離を保ちながら、『いまはここまで』と見せてくれる。" },
  "growth.session.response.accept.pathfinding": { tc: "牠先看向微光，再邀你一起走一小段。", sc: "牠先看向微光，再邀你一起走一小段。", en: "It looks toward the glow, then invites you a little way forward.", jp: "微光を見つめてから、少しだけ一緒に進もうと誘う。" },
  "growth.session.response.accept.steadfastness": { tc: "牠沒有抹去痕跡，只和你一起把它承住。", sc: "牠没有抹去痕迹，只和你一起把它承住。", en: "It does not erase the trace; it holds it with you.", jp: "痕跡を消さず、あなたと一緒に受け止める。" },
  "growth.session.response.modify.boundary": { tc: "牠沒有照原本方式靠近，而是把練習改成彼此留出距離。", sc: "牠没有照原本方式靠近，而是把练习改成彼此留出距离。", en: "It does not approach as proposed, and reshapes the practice around distance.", jp: "提案どおりには近づかず、互いに距離を残す練習へ変えた。" },
  "growth.session.response.modify.curiosity": { tc: "牠把停留改成先讀一段湖光，再決定要不要繼續。", sc: "牠把停留改成先读一段湖光，再决定要不要继续。", en: "It changes staying still into reading the lake light before deciding what comes next.", jp: "留まる代わりに湖の光を読み、その先を決めることにした。" },
  "growth.session.response.rest": { tc: "牠把身體收低，今天先休息。這不是失敗。", sc: "牠把身体收低，今天先休息。这不是失败。", en: "It settles low and rests today. This is not failure.", jp: "身体を低くして、今日は休む。失敗ではない。" },
  "growth.session.response.decline": { tc: "牠沒有跟上這個提議。你們可以停在這裡，關係不會因此倒退。", sc: "牠没有跟上这个提议。你们可以停在这里，关系不会因此倒退。", en: "It does not take up this invitation. You can stop here; the relationship does not recede.", jp: "この誘いには応じない。ここで止めても、関係が後退することはない。" },
  "growth.session.response.rewriteAccepted": { tc: "你照牠改過的節奏走完這一小段；改寫被當成完整的回答。", sc: "你照牠改过的节奏走完这一小段；改写被当成完整的回答。", en: "You complete this small practice in its revised rhythm. The rewrite is received as a complete answer.", jp: "この子が変えたリズムで短い練習を終えた。書き換えを完全な答えとして受け取った。" },
  "growth.session.response.rewriteDeferred": { tc: "你們停在改寫之前。沒有失敗，也沒有任何痕跡被扣除。", sc: "你们停在改写之前。没有失败，也没有任何痕迹被扣除。", en: "You stop before taking up the rewrite. Nothing failed, and no trace is taken away.", jp: "書き換えを受け取る前で止まった。失敗はなく、痕跡も失われない。" },
  "growth.session.resultTendencyPrefix": { tc: "這次看見：", sc: "这次看见：", en: "Seen here: ", jp: "ここで見えたもの：" },
  "growth.session.evidenceRecorded": { tc: "這段共同練習已留下質性痕跡；沒有數值獎勵，也不必重複刷取。", sc: "这段共同练习已留下质性痕迹；没有数值奖励，也不必重复刷取。", en: "This shared practice leaves a qualitative trace, with no numeric reward and nothing to farm.", jp: "この共同練習は質的な痕跡を残した。数値報酬はなく、繰り返し稼ぐ必要もない。" },
  "growth.session.rewritePendingNote": { tc: "牠先改寫了做法；只有你明示接受後，這一段才算共同完成。", sc: "牠先改写了做法；只有你明示接受后，这一段才算共同完成。", en: "It has revised the practice. This becomes shared only if you explicitly accept that revision.", jp: "この子がやり方を変えた。あなたが明確に受け入れた時だけ、共同で完了したことになる。" },
  "growth.session.rewriteActionsAria": { tc: "回應夥伴改寫的練習", sc: "回应伙伴改写的练习", en: "Respond to the companion's revised practice", jp: "パートナーが変えた練習への応答" },
  "growth.session.rewriteAccept.label": { tc: "照牠的方式繼續", sc: "照牠的方式继续", en: "Follow its revision", jp: "この子のやり方で続ける" },
  "growth.session.rewriteAccept.copy": { tc: "接受牠改過的節奏，一起走完這一小段。", sc: "接受牠改过的节奏，一起走完这一小段。", en: "Accept its changed rhythm and complete this small moment together.", jp: "変えられたリズムを受け入れ、この短い時間を一緒に終える。" },
  "growth.session.rewriteDefer.label": { tc: "今天先停在這裡", sc: "今天先停在这里", en: "Stop here today", jp: "今日はここで止める" },
  "growth.session.rewriteDefer.copy": { tc: "不形成證據、不扣關係；之後仍可再提。", sc: "不形成证据、不扣关系；之后仍可再提。", en: "No evidence and no relationship loss. You may return another time.", jp: "証拠にも罰にもならない。また別の時に提案できる。" },
  "growth.session.zeroEvidence": { tc: "沒有進度，也沒有懲罰；不用勉強留下任何證明的痕跡。", sc: "零进度、零惩罚；不留下养成证据。", en: "No progress, no penalty, and no growth evidence.", jp: "進捗も罰もなく、成長の証拠も残さない。" },
  "growth.session.safetyLabel": { tc: "暫停記錄", sc: "养成暂停", en: "Growth paused", jp: "成長を一時停止" },
  "growth.session.safetyCopy": { tc: "現在不會顯示結果，也不會做任何紀錄。我們可以先回到有安全感的地方。", sc: "目前不显示练习结果，也不建立任何养成观察。可以先回到安全停泊。", en: "No practice result or growth observation is created here. Return to safe harbor first.", jp: "ここでは練習結果も成長観察も作らない。まず安全な停泊へ戻れる。" },
  "growth.session.safetyStatus": { tc: "安全感還在；這次我們沒有記錄任何東西。", sc: "安全停泊保持完整；养成没有记录任何内容。", en: "Safe harbor remains intact; Growth records nothing.", jp: "安全な停泊を保ち、成長には何も記録しない。" },
  "growth.persisted.stageLabel": { tc: "正式階段", sc: "正式阶段", en: "Formal stage", jp: "正式段階" },
  "growth.persisted.signalLabel": { tc: "關係訊號", sc: "关系讯号", en: "Relationship signal", jp: "関係の合図" },
  "growth.persisted.stage.initial_awakened": { tc: "初醒夥伴", sc: "初醒伙伴", en: "Initial awakened", jp: "初醒のパートナー" },
  "growth.persisted.stage.resonant_mature": { tc: "共鳴成熟體", sc: "共鸣成熟体", en: "Resonant mature", jp: "共鳴成熟体" },
  "growth.persisted.stage.final_awakened": { tc: "終局覺醒體", sc: "终局觉醒体", en: "Final awakened", jp: "終局覚醒体" },
  "growth.persisted.signal.forming": { tc: "共同經歷還在長出自己的節奏；不用追著完成。", sc: "共同经历还在长出自己的节奏；不用追着完成。", en: "Your shared experiences are still finding their own rhythm. There is nothing to chase.", jp: "共同の経験は、まだふたりだけのリズムを育てている。追いかけなくていい。" },
  "growth.persisted.signal.possible.open": { tc: "下一段已成為可能；牠會在願意時自己提出。", sc: "下一段已成为可能；牠会在愿意时自己提出。", en: "Another stage has become possible. It will bring it up when willing.", jp: "次の段階は可能になった。提案する時は、この子自身が選ぶ。" },
  "growth.persisted.signal.possible.resting": { tc: "下一段已成為可能；牠現在想先休息，痕跡不會因此失效。", sc: "下一段已成为可能；牠现在想先休息，痕迹不会因此失效。", en: "Another stage is possible, but it wants to rest first. Your shared traces will not expire.", jp: "次の段階は可能だが、いまは先に休みたい。共有した痕跡は失われない。" },
  "growth.persisted.signal.possible.repairing": { tc: "下一段已成為可能；牠想先讓未完的界線被安放。", sc: "下一段已成为可能；牠想先让未完的界线被安放。", en: "Another stage is possible, but it wants an unfinished boundary to be respected first.", jp: "次の段階は可能だが、まず未完の境界を大切に置き直したい。" },
  "growth.persisted.signal.possible.notNow": { tc: "下一段已成為可能；牠現在仍選擇不提出，且不會過期。", sc: "下一段已成为可能；牠现在仍选择不提出，而且不会过期。", en: "Another stage is possible, but it chooses not to ask now. The possibility will not expire.", jp: "次の段階は可能だが、いまは提案しないことを選んでいる。この可能性に期限はない。" },
  "growth.persisted.signal.complete": { tc: "目前沒有下一段需要追趕；已留下的痕跡仍會保留。", sc: "目前没有下一段需要追赶；已经留下的痕迹仍会保留。", en: "There is no next stage to chase. The traces already shared will remain.", jp: "追いかける次の段階はない。すでに共有した痕跡は残り続ける。" },
  "growth.persisted.evidenceTitle": { tc: "共同留下的痕跡", sc: "共同留下的痕迹", en: "Traces left together", jp: "一緒に残した痕跡" },
  "growth.persisted.evidenceNote": { tc: "只顯示確實發生過的共同經歷；不是清單，也不必集滿。", sc: "只显示确实发生过的共同经历；不是清单，也不必集满。", en: "Only shared experiences that truly happened appear here. This is not a checklist to complete.", jp: "実際に起きた共同の経験だけを映す。埋めるための一覧ではない。" },
  "growth.persisted.evidenceEmpty": { tc: "目前還沒有需要被記成痕跡的共同片刻；不必為了填滿它而行動。", sc: "目前还没有需要被记成痕迹的共同片刻；不必为了填满它而行动。", en: "No shared moment needs to become a trace yet. You do not need to act just to fill this space.", jp: "まだ痕跡として残す共同の瞬間はない。ここを埋めるために行動しなくていい。" },
  "growth.persisted.evidenceTendencyPrefix": { tc: "這裡看見：", sc: "这里看见：", en: "Seen here: ", jp: "ここで見えたもの：" },
  "growth.persisted.source.care.label": { tc: "照顧", sc: "照顾", en: "Care", jp: "ケア" },
  "growth.persisted.source.care.copy": { tc: "你們曾一起調整節奏，讓照顧保留彼此的回應。", sc: "你们曾一起调整节奏，让照顾保留彼此的回应。", en: "You adjusted the rhythm together, leaving room for both of you to respond.", jp: "一緒にリズムを整え、互いの応答を残したままケアした。" },
  "growth.persisted.source.exploration.label": { tc: "探索", sc: "探索", en: "Exploration", jp: "探索" },
  "growth.persisted.source.exploration.copy": { tc: "你們曾一起讀過一個方向，也容許一段未知。", sc: "你们曾一起读过一个方向，也容许一段未知。", en: "You read a direction together and allowed part of it to remain unknown.", jp: "一緒にひとつの方向を読み、わからない部分もそのまま許した。" },
  "growth.persisted.source.reflection.label": { tc: "回顧", sc: "回顾", en: "Reflection", jp: "振り返り" },
  "growth.persisted.source.reflection.copy": { tc: "你們曾回看共同經歷，也保留牠修正理解的空間。", sc: "你们曾回看共同经历，也保留牠修正理解的空间。", en: "You revisited a shared experience and left room for its understanding to differ.", jp: "共同の経験を振り返り、この子が理解を直す余白も残した。" },
  "growth.persisted.source.standoff.label": { tc: "情緒對峙", sc: "情绪对峙", en: "Emotional standoff", jp: "感情の対峙" },
  "growth.persisted.source.standoff.copy": { tc: "你們曾一起走完一場裂隙對峙；不同結局沒有高低。", sc: "你们曾一起走完一场裂隙对峙；不同结局没有高低。", en: "You completed a rift standoff together. Its different endings carry no rank.", jp: "裂隙との対峙を一緒に終えた。異なる結末に優劣はない。" },
  "growth.persisted.source.chapter.label": { tc: "章節同行", sc: "章节同行", en: "Chapter journey", jp: "章の同行" },
  "growth.persisted.source.chapter.copy": { tc: "這段同行已在章節裡留下可被辨認的共同痕跡。", sc: "这段同行已经在章节里留下可以辨认的共同痕迹。", en: "This journey left a shared trace that can be recognized within the chapter.", jp: "この同行は、章の中に互いがわかる共有の痕跡を残した。" },
  "growth.persisted.source.boundary.label": { tc: "守界", sc: "守界", en: "Boundary respected", jp: "境界の尊重" },
  "growth.persisted.source.boundary.copy": { tc: "一段界線曾被尊重，距離也被當成完整的回答。", sc: "一段界线曾被尊重，距离也被当成完整的回答。", en: "A boundary was respected, and distance was received as a complete answer.", jp: "ひとつの境界が尊重され、距離も完全な答えとして受け取られた。" },
  "growth.persisted.source.recovery.label": { tc: "修復", sc: "修复", en: "Repair", jp: "修復" },
  "growth.persisted.source.recovery.copy": { tc: "你們曾完成一段不抹除舊痕的修復。", sc: "你们曾完成一段不抹除旧痕的修复。", en: "You completed a repair without erasing the older trace.", jp: "古い痕跡を消さずに、ひとつの修復を終えた。" },
  "growth.nextPrefix": { tc: "下一段：", sc: "下一段：", en: "Next: ", jp: "次の章：" },
  "growth.chapterEnd": { tc: "已抵達目前章節終點", sc: "已抵达目前章节终点", en: "You've reached the end of this chapter", jp: "いまの章はここで終わり" },
  "growth.nextCopy": { tc: "不是能力排行，是關係慢慢往前。", sc: "不是能力排行，是关系慢慢往前。", en: "Not a power ranking — a relationship moving forward, slowly.", jp: "能力の順位ではなく、関係がゆっくり進んでいく。" },
  "growth.endCopy": { tc: "這一章先到這裡。不用追。", sc: "这一章先到这里。不用追。", en: "This chapter rests here. No need to chase.", jp: "この章はここまで。急がなくていい。" },
  "growth.progressAria": { tc: "關係章節進度", sc: "关系章节进度", en: "Relationship chapter progress", jp: "関係の章の進み" },
  "growth.trustTuneSub": { tc: "回看你們一起度過的安靜片刻。", sc: "回看你们一起度过的安静片刻。", en: "Look back on quiet moments you shared.", jp: "一緒に過ごした静かなときを見返す。" },
  "growth.trustTuneStatus": { tc: "信任在安靜裡往前了一點。", sc: "信任在安静里往前了一点。", en: "Trust moves forward a little in the quiet.", jp: "静けさの中で、信頼が少し進んだ。" },
  "growth.balanceSub": { tc: "一起把節奏放慢，比按鈕更靠近牠。", sc: "一起把节奏放慢，比按钮更靠近牠。", en: "Slow the rhythm together — closer than a button.", jp: "一緒にリズムを落とす。ボタンより近い。" },
  "growth.balanceStatus": { tc: "節奏在你們之間安定下來。", sc: "节奏在你们之间安定下来。", en: "The rhythm settles between you.", jp: "ふたりの間のリズムが落ち着いた。" },
  "growth.reviewSub": { tc: "查閱牠的關係紀錄與圖鑑。", sc: "查阅牠的关系纪录与图鉴。", en: "Browse its bond record and codex.", jp: "関係の記録と図鑑をひらく。" },

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
  "memory.fallbackAnchorTitle": { tc: "關係錨點", sc: "关系锚点", en: "Relationship anchor", jp: "関係の錨" },
  "memory.fallbackTraceTitle": { tc: "棲地痕跡", sc: "栖地痕迹", en: "Habitat trace", jp: "棲み処の痕跡" },
  "memory.archiveMeta": { tc: "已釋放・仍留在關係檔案", sc: "已释放・仍留在关系档案", en: "Released · kept in the relationship record", jp: "手放した・関係の記録に残る" },
  "memory.intensityFmt": { tc: "（強度 {pct}%）", sc: "（强度 {pct}%）", en: " (intensity {pct}%)", jp: "（強さ {pct}%）" },
  "memory.reviewAria": { tc: "回看", sc: "回看", en: "Revisit", jp: "見返す" },
  "memory.review": { tc: "回望", sc: "回望", en: "Revisit", jp: "見返す" },
  "memory.crystalKicker": { tc: "心晶織痕", sc: "心晶织痕", en: "Crystal weaving", jp: "心晶の織痕" },
  "memory.crystalObserve": { tc: "觀察微光", sc: "观察微光", en: "Observe the glow", jp: "微光を観察する" },
  "memory.crystalObserveSub": { tc: "只看它此刻的樣子，不改變記錄。", sc: "只看它此刻的样子，不改变记录。", en: "See it as it is without changing the record.", jp: "記録を変えず、いまの姿を見る。" },
  "memory.crystalObserveStatus": { tc: "你只是看著心晶的光。", sc: "你只是看着心晶的光。", en: "You simply watch the crystal's light.", jp: "ただ心晶の光を見つめる。" },
  "memory.crystalNoDaily": {
    tc: "心晶會隨共同經歷自然沉澱；不需要每日回來，也沒有錯過懲罰。",
    sc: "心晶会随共同经历自然沉淀；不需要每日回来，也没有错过惩罚。",
    en: "Heart crystals settle through shared experience. There is no daily return or penalty for absence.",
    jp: "心晶は共に過ごした経験から自然に沈殿する。毎日戻る必要も、欠席の罰もない。"
  },
  "memory.crystalRelease": { tc: "一起放下", sc: "一起放下", en: "Let it go together", jp: "一緒に手放す" },
  "memory.crystalReleasePrompt": { tc: "再確認一次：記錄會保留，光只是不再停在棲地。", sc: "再确认一次：记录会保留，光只是不再停在栖地。", en: "Confirm once more: the record stays; only its light leaves the habitat.", jp: "もう一度確認。記録は残り、光だけが棲み処を離れる。" },
  "memory.crystalReleaseConfirmAria": { tc: "確認是否一起放下這枚心晶", sc: "确认是否一起放下这枚心晶", en: "Confirm whether to let this crystal go", jp: "この心晶を手放すか確認" },
  "memory.crystalReleaseConfirmCopy": { tc: "這不會刪除共同經歷，也不會改變關係數值。", sc: "这不会删除共同经历，也不会改变关系数值。", en: "This does not erase the shared experience or change relationship values.", jp: "共に過ごした経験は消えず、関係の値も変わらない。" },
  "memory.crystalReleaseConfirm": { tc: "確認放下", sc: "确认放下", en: "Let it go", jp: "手放す" },
  "memory.crystalReleaseKeep": { tc: "先留著", sc: "先留着", en: "Keep it for now", jp: "今は残す" },
  "memory.crystalReleaseKept": { tc: "心晶仍留在原處。", sc: "心晶仍留在原处。", en: "The crystal remains where it was.", jp: "心晶はそのまま残っている。" },
  "memory.crystalReleaseStatus": { tc: "光離開棲地，共同經歷仍完整保留。", sc: "光离开栖地，共同经历仍完整保留。", en: "The light leaves the habitat; the shared experience remains.", jp: "光は棲み処を離れ、共に過ごした経験は残る。" },
  "memory.crystalReleaseReady": { tc: "有 {count} 枚完成沉澱的心晶可以一起放下。", sc: "有 {count} 枚完成沉淀的心晶可以一起放下。", en: "{count} settled crystal(s) can be let go together.", jp: "沈殿を終えた心晶が {count} 個、手放せる。" },
  "memory.crystalNoRelease": { tc: "目前沒有適合放下的完成心晶；觀察就足夠。", sc: "目前没有适合放下的完成心晶；观察就足够。", en: "No completed crystal is ready to leave. Observation is enough.", jp: "いま手放せる心晶はない。観察するだけで十分。" },
  "memory.crystalResult.safetyPause": { tc: "現在不需要整理任何心晶；先把空間留給夥伴。", sc: "现在不需要整理任何心晶；先把空间留给伙伴。", en: "No crystal needs tending now. Leave the space with your companion.", jp: "いま心晶を整える必要はない。まず相手のために空間を残そう。" },
  "memory.crystalResult.observeUnavailable": { tc: "這枚心晶目前沒有可觀察的光。", sc: "这枚心晶目前没有可观察的光。", en: "This crystal has no visible light to observe right now.", jp: "この心晶には、いま観察できる光がない。" },
  "memory.crystalResult.protected": { tc: "這段記憶仍承載關係、邊界或修復，不能由整理動作移走。", sc: "这段记忆仍承载关系、边界或修复，不能由整理动作移走。", en: "This memory still carries relationship, boundary, or repair work and cannot be moved by tidying.", jp: "この記憶には関係、境界、修復が残っているため、整理で移すことはできない。" },
  "memory.crystalResult.alreadyReleased": { tc: "這枚心晶的光已經離開棲地；記錄仍然保留。", sc: "这枚心晶的光已经离开栖地；记录仍然保留。", en: "This crystal's light has left the habitat; its record remains.", jp: "この心晶の光は棲み処を離れたが、記録は残っている。" },
  "memory.crystalResult.notVisible": { tc: "這枚心晶目前不在棲地中。", sc: "这枚心晶目前不在栖地中。", en: "This crystal is not present in the habitat.", jp: "この心晶はいま棲み処にない。" },
  "memory.crystalResult.notTransformed": { tc: "這段經歷仍在沉澱，現在只適合觀察。", sc: "这段经历仍在沉淀，现在只适合观察。", en: "This experience is still settling; observation is enough for now.", jp: "この経験はまだ沈殿の途中。いまは観察するだけでいい。" },
  "memory.crystalResult.notFound": { tc: "找不到可放下的心晶。", sc: "找不到可放下的心晶。", en: "No crystal ready to be let go was found.", jp: "手放せる心晶が見つからない。" },
  "memory.crystalResult.busy": { tc: "心晶仍在整理中；這次不會重複寫入。", sc: "心晶仍在整理中；这次不会重复写入。", en: "The crystal is still being tended; this action will not be written twice.", jp: "心晶を整えている途中。この操作は重複して記録されない。" },
  "memory.crystalResult.saveFailed": { tc: "心晶狀態沒有成功保存；原本的共同經歷仍保持不變。", sc: "心晶状态没有成功保存；原本的共同经历仍保持不变。", en: "The crystal state could not be saved; the shared experience remains unchanged.", jp: "心晶の状態を保存できなかった。共に過ごした経験は変わらず残っている。" },
  "memory.crystalResult.failed": { tc: "心晶整理暫時無法完成；原本的狀態沒有改變。", sc: "心晶整理暂时无法完成；原本的状态没有改变。", en: "Crystal tending could not finish; the previous state was left unchanged.", jp: "心晶の整理を完了できなかった。元の状態は変わっていない。" },
  "memory.status.fresh": { tc: "初凝", sc: "初凝", en: "Fresh", jp: "初凝" },
  "memory.status.settled": { tc: "沉定", sc: "沉定", en: "Settled", jp: "沈定" },
  "memory.status.transformed": { tc: "轉化完成", sc: "转化完成", en: "Transformed", jp: "変容済み" },
  "memory.status.archived": { tc: "收藏", sc: "收藏", en: "Archived", jp: "保管" },
  "memory.status.released": { tc: "已釋放", sc: "已释放", en: "Released", jp: "解放済み" },
  "memory.crystalState.glimmer.title": { tc: "湖畔微光", sc: "湖畔微光", en: "Lakeside glimmer", jp: "湖畔の微光" },
  "memory.crystalState.glimmer.copy": { tc: "還沒有心晶需要整理。留白也是棲地的一部分。", sc: "还没有心晶需要整理。留白也是栖地的一部分。", en: "There is no crystal to tend. Empty space belongs here too.", jp: "整える心晶はまだない。余白も棲み処の一部。" },
  "memory.crystalState.seed.title": { tc: "初凝心晶", sc: "初凝心晶", en: "A forming crystal", jp: "初凝の心晶" },
  "memory.crystalState.seed.copy": { tc: "一段共同經歷剛開始凝光，現在只需要被看見。", sc: "一段共同经历刚开始凝光，现在只需要被看见。", en: "A shared experience has begun to gather light. It only needs to be seen.", jp: "共に過ごした経験が光を集め始めた。いまは見守るだけでいい。" },
  "memory.crystalState.cluster.title": { tc: "共鳴晶簇", sc: "共鸣晶簇", en: "Resonant cluster", jp: "共鳴の晶簇" },
  "memory.crystalState.cluster.copy": { tc: "幾段經歷在棲地裡並存，沒有哪一段需要被比較。", sc: "几段经历在栖地里并存，没有哪一段需要被比较。", en: "Several experiences coexist here; none needs to be ranked.", jp: "いくつもの経験が共にある。比べる必要はない。" },
  "memory.crystalState.attuned.title": { tc: "沉定共振", sc: "沉定共振", en: "Settled resonance", jp: "沈定した共鳴" },
  "memory.crystalState.attuned.copy": { tc: "心晶正依自己的時間沉澱，不需要加速。", sc: "心晶正依自己的时间沉淀，不需要加速。", en: "The crystal is settling in its own time. It needs no acceleration.", jp: "心晶は自分の時間で沈殿している。急がせなくていい。" },
  "memory.crystalState.transformed.title": { tc: "轉化之光", sc: "转化之光", en: "Transformed light", jp: "変容の光" },
  "memory.crystalState.transformed.copy": { tc: "有些經歷已完成沉澱；你們可以保留，也可以一起放下它的棲地光。", sc: "有些经历已完成沉淀；你们可以保留，也可以一起放下它的栖地光。", en: "Some experiences have settled. Keep them, or let their habitat light go together.", jp: "沈殿を終えた経験がある。残すことも、棲み処の光を一緒に手放すこともできる。" },
  "memory.crystalState.released.title": { tc: "釋放殘光", sc: "释放余光", en: "Released afterglow", jp: "解放の残光" },
  "memory.crystalState.released.copy": { tc: "光已離開棲地，但記錄沒有被刪除。", sc: "光已离开栖地，但记录没有被删除。", en: "The light has left the habitat, but the record was not erased.", jp: "光は棲み処を離れたが、記録は消えていない。" },

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
  "char.descFallback": { tc: "夥伴的資料還沒準備好。", sc: "心核伙伴资料尚未完成。", en: "Companion profile not ready yet.", jp: "相棒のデータはまだ準備中。" },
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
  "battle.resonanceHintEmotion": { tc: "心相共鳴・特別能安撫這片{emotion}", sc: "心相共鸣・特别能安抚这片{emotion}", en: "Heart resonance · especially soothes this {emotion}", jp: "心の共鳴・この{emotion}をとくに鎮める" },
  "battle.objective": {
    tc: "本次目標：在你們累倒之前，陪著夥伴把裂隙的雜訊穩定下來。",
    sc: "本次目标：在疲惫达到上限前，协助伙伴稳定裂隙杂讯。",
    en: "Goal: help your companion steady rift noise before fatigue peaks.",
    jp: "今回の目標：疲労が上限に達する前に、裂け目のノイズを鎮める。"
  },
  "battle.actMeaning.resonance": {
    tc: "輕聲呼吸能拉近你們的共鳴，雖然會耗點精神；趁牠還願意靠近時，這份心意最能傳遞。",
    sc: "轻声呼吸能拉近你们的共鸣，虽然会耗点精神；趁牠还愿意靠近时，这份心意最能传递。",
    en: "Breathing softly deepens your resonance, though it costs energy; most effective while your companion is open to coming closer.",
    jp: "呼吸を合わせることで共鳴を深めます。少し消耗しますが、相棒が近づきたいと思っている時に特に響きます。"
  },
  "battle.actMeaning.barrier": {
    tc: "站穩邊界，替牠擋開混濁的雜訊；當牠有些退縮時，先給牠一處安穩的空間。",
    sc: "站稳边界，替牠挡开混浊的杂讯；当牠有些退缩时，先给牠一处安稳的空间。",
    en: "Hold your ground to shield against turbulent noise; offer a safe sanctuary when your companion hesitates.",
    jp: "境界をしっかり保ち、ノイズを跳ね返します。相手が身を引こうとしている時、まずは安心できる空間を作りましょう。"
  },
  "battle.actMeaning.pulse": {
    tc: "用較強的共振迅速平息雜訊，但會比較耗神——不必每次都選擇硬碰硬。",
    sc: "用较强的共振迅速平息杂讯，但会比较耗神——不必每次都选择硬碰硬。",
    en: "Calms the noise rapidly with a strong burst, but uses more sync—you don't always need to force your way.",
    jp: "強い共振で素早くノイズを鎮めますが、消費も大きめです。毎回力押しする必要はありません。"
  },
  "battle.actMeaning.retreat": {
    tc: "轉身先休息一會兒。懂得適時離場也是一種溫柔，不會有任何負擔或懲罰。",
    sc: "转身先休息一会儿。懂得适时离场也是一种温柔，不会有任何负担或惩罚。",
    en: "Step back and take a pause. Knowing when to step away is a form of gentleness, free of penalties.",
    jp: "そっと退いてひと休みします。離れる判断も優しさのひとつ。罰やペナルティはありません。"
  },
  "battle.guideTitle": { tc: "第一次面對裂隙", sc: "第一次面对裂隙", en: "First time facing a rift", jp: "はじめての裂け目" },
  "battle.guideBody": {
    tc: "先感受這片場域與每個行動的脈絡。這些引導只是溫柔的建議——究竟該如何前進，始終由你決定。",
    sc: "先感受这片场域与每个行动的脉络。这些引导只是温柔的建议——究竟该如何前进，始终由你决定。",
    en: "Sense the rhythm of this domain and the flow of each action. These tips are gentle thoughts—how to proceed remains entirely your choice.",
    jp: "場の空気と行動の意味をじっくり味わってください。助言は提案にすぎず、選ぶのはいつでもあなたです。"
  },
  "battle.guideContinue": { tc: "我明白了", sc: "我明白了", en: "I understand", jp: "わかった" },
  "battle.layerImmediate": { tc: "此刻：", sc: "此刻：", en: "Now:", jp: "いま：" },
  "battle.layerEvent": { tc: "這次：", sc: "这次：", en: "This time:", jp: "今回：" },
  "battle.layerLong": { tc: "留下：", sc: "留下：", en: "Left behind:", jp: "残る：" },
  "battle.returnPreview": {
    tc: "回到棲地時，可能看見新的留痕，或聽到牠如何記得這次同行。",
    sc: "回到栖地时，可能看见新的留痕，或听到牠如何记得这次同行。",
    en: "Back home, you may see a new trace or hear how it remembers this walk.",
    jp: "棲み処に戻ると、新しい痕跡や、今回をどう覚えたかを感じられるかも。"
  },
  "map.standoffDeferredTitle": { tc: "裂隙還在遠處", sc: "裂隙还在远处", en: "The rift can wait", jp: "裂け目はまだ遠く" },
  "map.exploreReturnPreview": {
    tc: "回到棲地時，看看這段同行有沒有留下可讀的痕跡。",
    sc: "回到栖地时，看看这段同行有没有留下可读的痕迹。",
    en: "When you return home, see whether this walk left a readable trace.",
    jp: "棲み処に戻ったら、この同行が痕跡を残したか見てみよう。"
  },

  // ---- World barks（棲地自主行動短句 / World Autonomy）----
  // 規格見 src/data/worldBarkPacks.js：繁中 8–24 字、最多兩句、提示是邀請不是命令、
  // 禁止 FOMO／內疚／依賴施壓／登入壓力（紅線 6）。只反映當下 Needs，不改寫人格。
  "worldBark.rest.high.0": {
    tc: "我有點撐不住了，火堆旁坐一下。",
    sc: "我有点撑不住了，火堆旁坐一下。",
    en: "I'm running low. Going to sit by the fire.",
    jp: "少し限界かも。焚き火のそばに座るね。"
  },
  "worldBark.rest.high.1": {
    tc: "累了。火光那邊也許適合歇著。",
    sc: "累了。火光那边也许适合歇着。",
    en: "Tired. The firelight looks like a good place to rest.",
    jp: "疲れた。灯りのそばなら休めそう。"
  },
  "worldBark.rest.mid.0": {
    tc: "腳步慢下來了，先找個地方坐。",
    sc: "脚步慢下来了，先找个地方坐。",
    en: "My steps are slowing. I'll find somewhere to sit.",
    jp: "歩みが遅くなってきた。座れる場所を探すよ。"
  },
  "worldBark.rest.mid.1": {
    tc: "不趕路了。這裡的光剛剛好。",
    sc: "不赶路了。这里的光刚刚好。",
    en: "No more hurrying. The light here is just right.",
    jp: "急ぐのはやめた。ここの光がちょうどいい。"
  },
  "worldBark.rest.low.0": {
    tc: "不特別累，只是想靠一會兒。",
    sc: "不特别累，只是想靠一会儿。",
    en: "Not especially tired — just want to lean a while.",
    jp: "特に疲れてはない。少し寄りかかりたいだけ。"
  },
  "worldBark.rest.low.1": {
    tc: "先坐著。沒有要去哪裡。",
    sc: "先坐着。没有要去哪里。",
    en: "Sitting for now. Not headed anywhere.",
    jp: "とりあえず座る。どこへも行かないよ。"
  },

  "worldBark.eat.high.0": {
    tc: "終於有東西吃了。",
    sc: "终于有东西吃了。",
    en: "Something to eat at last.",
    jp: "やっと食べられるものがある。"
  },
  "worldBark.eat.high.1": {
    tc: "餓很久了，這個看起來能吃。",
    sc: "饿很久了，这个看起来能吃。",
    en: "Hungry for a while now — this looks edible.",
    jp: "ずっとお腹が空いてた。これは食べられそう。"
  },
  "worldBark.eat.mid.0": {
    tc: "找到吃的了。看起來還不錯。",
    sc: "找到吃的了。看起来还不错。",
    en: "Found some food. Looks decent.",
    jp: "食べ物を見つけた。悪くなさそう。"
  },
  "worldBark.eat.mid.1": {
    tc: "這邊有東西可以吃。",
    sc: "这边有东西可以吃。",
    en: "There's something to eat over here.",
    jp: "こっちに食べられるものがある。"
  },
  "worldBark.eat.low.0": {
    tc: "不太餓，但先嚐一口。",
    sc: "不太饿，但先尝一口。",
    en: "Not very hungry, but I'll take a bite.",
    jp: "そんなに空腹じゃないけど、ひと口だけ。"
  },
  "worldBark.eat.low.1": {
    tc: "隨手撿了一點，不急著吃完。",
    sc: "随手捡了一点，不急着吃完。",
    en: "Picked a little up. No rush to finish it.",
    jp: "少しだけ拾った。急いで食べなくていい。"
  },

  "worldBark.inspect.high.0": {
    tc: "那邊有東西在動，我去看看。",
    sc: "那边有东西在动，我去看看。",
    en: "Something moved over there. I'll go look.",
    jp: "あそこで何か動いた。見てくる。"
  },
  "worldBark.inspect.high.1": {
    tc: "這個之前不在。我靠近一點。",
    sc: "这个之前不在。我靠近一点。",
    en: "This wasn't here before. Moving closer.",
    jp: "これ、さっきまで無かった。近づいてみる。"
  },
  "worldBark.inspect.mid.0": {
    tc: "有點在意那邊，先看一眼。",
    sc: "有点在意那边，先看一眼。",
    en: "That's been on my mind — just one look.",
    jp: "あそこが少し気になる。ひと目だけ見る。"
  },
  "worldBark.inspect.mid.1": {
    tc: "這東西的形狀有點奇怪。",
    sc: "这东西的形状有点奇怪。",
    en: "The shape of this is a little odd.",
    jp: "これ、形がちょっと変わってる。"
  },
  "worldBark.inspect.low.0": {
    tc: "隨便看看，沒什麼特別的。",
    sc: "随便看看，没什么特别的。",
    en: "Just looking around. Nothing special.",
    jp: "なんとなく見てるだけ。特に何も。"
  },
  "worldBark.inspect.low.1": {
    tc: "路過的時候瞄了一眼。",
    sc: "路过的时候瞄了一眼。",
    en: "Caught a glance while passing by.",
    jp: "通りすがりにちらっと見た。"
  },

  "worldBark.approach.high.0": {
    tc: "我走近一點，不會擋著你。",
    sc: "我走近一点，不会挡着你。",
    en: "Coming a bit closer. I won't get in your way.",
    jp: "少し近づくね。邪魔はしないよ。"
  },
  "worldBark.approach.high.1": {
    tc: "靠過來一些。你忙你的。",
    sc: "靠过来一些。你忙你的。",
    en: "Drawing a little nearer. Carry on with what you're doing.",
    jp: "ちょっとだけ寄る。そっちはそのままでいい。"
  },
  "worldBark.approach.mid.0": {
    tc: "我在這附近，不遠不近。",
    sc: "我在这附近，不远不近。",
    en: "I'm around here — not too close, not too far.",
    jp: "この辺にいる。近すぎず遠すぎず。"
  },
  "worldBark.approach.mid.1": {
    tc: "走過來看看，沒別的意思。",
    sc: "走过来看看，没别的意思。",
    en: "Wandered over to see. Nothing more than that.",
    jp: "様子を見に来ただけ。他意はない。"
  },
  "worldBark.approach.low.0": {
    tc: "順路經過你這邊。",
    sc: "顺路经过你这边。",
    en: "Just passing by your side.",
    jp: "ついでにそっちを通っただけ。"
  },
  "worldBark.approach.low.1": {
    tc: "就站這裡，不打擾。",
    sc: "就站这里，不打扰。",
    en: "Just standing here. I won't interrupt.",
    jp: "ここに立ってるだけ。邪魔しないよ。"
  },

  "worldBark.blocked.cooldown.0": {
    tc: "剛才才做過，先緩一緩。",
    sc: "刚才才做过，先缓一缓。",
    en: "Just did that. Giving it a moment.",
    jp: "さっきやったばかり。少し置いておく。"
  },
  "worldBark.blocked.cooldown.1": {
    tc: "這件事得等一下再說。",
    sc: "这件事得等一下再说。",
    en: "This one will have to wait a bit.",
    jp: "これはもう少し後にする。"
  },
  "worldBark.blocked.resource.0": {
    tc: "這裡沒有可以吃的了。",
    sc: "这里没有可以吃的了。",
    en: "Nothing left to eat here.",
    jp: "ここにはもう食べられるものがない。"
  },
  "worldBark.blocked.resource.1": {
    tc: "東西不夠，先算了。",
    sc: "东西不够，先算了。",
    en: "Not enough for that. Never mind.",
    jp: "足りないみたい。今はやめておく。"
  },
  "worldBark.blocked.unknown.0": {
    tc: "這個動作我還做不出來。",
    sc: "这个动作我还做不出来。",
    en: "I can't do that one yet.",
    jp: "その動きはまだできない。"
  },
  "worldBark.blocked.unknown.1": {
    tc: "我不太確定怎麼做這件事。",
    sc: "我不太确定怎么做这件事。",
    en: "I'm not quite sure how to do this.",
    jp: "これのやり方がよく分からない。"
  }
};
