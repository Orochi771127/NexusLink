/**
 * 遠征記憶事件：抵達探索點時觸發的短敘事（非 LLM，可選寫入 emotionalMemories）。
 */
export const EXPEDITION_MEMORY_EVENTS = Object.freeze({
  plains_windrest: Object.freeze({
    ep_crystal: Object.freeze({
      id: "exp_mem_windrest_crystal",
      label: { zh: "風中的晶鳴", en: "Crystal Hum in the Wind" },
      excerpt: "草葉間有一枚碎晶在輕響，像遠方有人用指尖敲了敲你的記憶。",
      echo: "那輕響停了。牠仍歪著頭，像在等下一拍。",
      emotion: "calm",
      theme: "wonder"
    }),
    ep_flower: Object.freeze({
      id: "exp_mem_windrest_flower",
      label: { zh: "未名的花叢", en: "Nameless Flowers" },
      excerpt: "牠在花叢邊停了很久，沒有採摘，只是把鼻尖埋進去聞了聞。",
      echo: "花香留在牠的鬍鬚上。牠沒有解釋什麼。",
      emotion: "warm",
      theme: "bond"
    }),
    ep_hidden: Object.freeze({
      id: "exp_mem_windrest_hidden",
      label: { zh: "草叢下的低鳴", en: "Low Hum in the Grass" },
      excerpt: "風停的一瞬，你聽見草叢深處有什麼在輕輕回應——不是敵意，更像孤單。",
      echo: "回應散了。牠把身體靠你近了一點。",
      emotion: "calm",
      theme: "loneliness"
    }),
    ep_rest: Object.freeze({
      id: "exp_mem_windrest_rest",
      label: { zh: "風歇之處", en: "Where the Wind Rests" },
      excerpt: "這裡的風真的會停。夥伴趴下來，耳朵卻仍朝著來時的路。",
      echo: "片刻之後，牠站起來，像說「可以繼續了」。",
      emotion: "calm",
      theme: "rest"
    })
  }),
  forge_emberpath: Object.freeze({
    ep_forge_glow: Object.freeze({
      id: "exp_mem_forge_glow",
      label: { zh: "餘燼微光", en: "Ember Glow" },
      excerpt: "鍛爐早已熄火，但地面仍透著一層不燙人的暖。夥伴把腳掌抬了又放。",
      echo: "暖意夠了。牠決定不再踩進更熱的縫。",
      emotion: "warm",
      theme: "wonder"
    }),
    ep_rust_flower: Object.freeze({
      id: "exp_mem_forge_rust",
      label: { zh: "鐵鏽花叢", en: "Rust Blossoms" },
      excerpt: "鏽色的小花在廢鐵縫裡開著。牠沒有碰，只是用鼻尖量了量這裡的溫度。",
      echo: "花不燙。牠記下來，然後離開。",
      emotion: "calm",
      theme: "curiosity"
    }),
    ep_heat_veil: Object.freeze({
      id: "exp_mem_forge_heat",
      label: { zh: "熱霧邊緣", en: "Heat Veil" },
      excerpt: "熱霧像一層薄紗掛在小徑盡頭。你聽見裡面有什麼在輕敲，像遠古的錘聲。",
      echo: "錘聲遠了。牠沒有走進霧裡。",
      emotion: "anxiety",
      theme: "echo"
    }),
    ep_cinder_rest: Object.freeze({
      id: "exp_mem_forge_rest",
      label: { zh: "燼灰歇腳處", en: "Cinder Rest" },
      excerpt: "燼灰上還留著餘溫。夥伴在這裡歇了一會，尾巴輕輕掃過地面。",
      echo: "歇夠了。牠抖了抖灰，看向出口。",
      emotion: "calm",
      theme: "rest"
    })
  }),
  harbor_quayside: Object.freeze({
    ep_mooring: Object.freeze({
      id: "exp_mem_harbor_mooring",
      label: { zh: "纜樁低語", en: "Mooring Whisper" },
      excerpt: "纜繩被潮水拉緊又放鬆。夥伴把耳朵貼近木樁，像在聽很遠的霧笛。",
      echo: "沒有霧笛。牠仍把這節奏記在心裡。",
      emotion: "calm",
      theme: "patience"
    }),
    ep_tide_line: Object.freeze({
      id: "exp_mem_harbor_tide",
      label: { zh: "潮線記號", en: "Tide Line" },
      excerpt: "退潮留下一道濕亮的線。牠沿著線走，腳掌濕濕的，卻沒有著急。",
      echo: "線外是更深的水。牠停在線上。",
      emotion: "warm",
      theme: "bond"
    }),
    ep_foghorn: Object.freeze({
      id: "exp_mem_harbor_fog",
      label: { zh: "霧笛一聲", en: "Single Foghorn" },
      excerpt: "霧笛在很遠的地方響了一下，像有人說「還早，慢慢來」。",
      echo: "回音散進霧裡。牠的肩線鬆了一點。",
      emotion: "calm",
      theme: "anxiety_ease"
    }),
    ep_quay_rest: Object.freeze({
      id: "exp_mem_harbor_rest",
      label: { zh: "碼頭歇腳", en: "Quay Rest" },
      excerpt: "你們坐在碼頭邊，數了七下浪。數完，肩膀鬆了一點。",
      echo: "第八下浪來時，牠已經準備好再走。",
      emotion: "calm",
      theme: "rest"
    })
  })
});

export function getMemoryEventForExplorePoint(regionId, explorePointId) {
  const region = EXPEDITION_MEMORY_EVENTS[regionId];
  return region?.[explorePointId] || null;
}
