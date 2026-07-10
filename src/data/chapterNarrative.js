// 七章敘事內容包（CH-7，docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md §8）。
// 短句留白風格（對齊 NEXUSLINK_COPYWRITING_FINAL_PASS：短、具體、安靜、不催促）。
// 刻意不提「相遇夥伴」名——正式五幼獸名單待資產 ready 後由 CH-5b 補位。
// 內容層維持 TC（同 battle node / 里程碑主題慣例）。
//
// 欄位：
//   epigraph            章引——玩家「身在此章」時世界地圖上的一句氣息（位置敘事，可忽略）
//   clearLine           通關句（對峙日誌【旅程】行；蓋掉 battleController 的通用模板）
//   clearCompanionLine  通關後夥伴在心語裡的一句（夥伴之聲）

export const CHAPTER_NARRATIVE = Object.freeze({
  1: Object.freeze({
    epigraph: "湖水不催人。累了，就先在這裡。",
    clearLine: "月湖的水面靜下來了。第一次，你們一起把雜訊放輕。往北部翠綠平原區的方向，好像亮了一點。",
    clearCompanionLine: "這裡安靜下來了。北邊的平原……等你想去的時候，我們再一起走。"
  }),
  2: Object.freeze({
    epigraph: "風很大，草很高。一個人走的話，會覺得自己很小。",
    clearLine: "平原的風聲裡，孤獨的低鳴散開了。往東南熔爐丘陵區的方向，好像亮了一點。",
    clearCompanionLine: "風還在吹，但不再只有風的聲音了。"
  }),
  3: Object.freeze({
    epigraph: "爐火沒有熄過。有些氣，是被留下來的。",
    clearLine: "熔爐丘陵的躁響沉了下來，餘燼只剩溫度。往南港的方向，好像亮了一點。",
    clearCompanionLine: "火氣散了之後，這裡其實蠻暖的。"
  }),
  4: Object.freeze({
    epigraph: "潮來潮去。要出海的人，總是睡不好。",
    clearLine: "南港的潮聲平了，緊繃的桅繩鬆了下來。往中央輝耀核心區的方向，好像亮了一點。",
    clearCompanionLine: "港口的燈在水上晃。現在看起來，不急了。"
  }),
  5: Object.freeze({
    epigraph: "最亮的地方，影子也最深。",
    clearLine: "輝耀核心的光暈裡，那層藍色的霧散開了。往西南潮汐邊疆區的方向，好像亮了一點。",
    clearCompanionLine: "光還是很亮。但現在，眼睛不酸了。"
  }),
  6: Object.freeze({
    epigraph: "邊疆的浪，一半是海的，一半是心的。",
    clearLine: "潮汐邊疆的亂流靜了，浪一層一層退回海裡。往秘境山脈核心的方向，好像亮了一點。",
    clearCompanionLine: "浪聲變得規律了。快到最後了，我們慢慢來。"
  }),
  7: Object.freeze({
    epigraph: "山頂上什麼都沒有。只有你走過的路，在身後發光。",
    clearLine: "秘境山脈的雜訊，也安靜下來了。Linkara 的七片土地，你們一起走過了。",
    clearCompanionLine: "七片土地都走過了。接下來去哪，我們慢慢想，不急。"
  })
});

export function getChapterNarrative(chapterNo) {
  return CHAPTER_NARRATIVE[Number(chapterNo)] || null;
}
