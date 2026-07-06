import EventBus from "../utils/eventBus.js";
import AudioManager from "../audio/audioManager.js";

// 音訊提示（TP-6 感官回饋包 v1）：監聽**既有** EventBus 事件，為觸碰回饋與
// 夥伴主動微時刻補上極輕的合成音。零新事件、零狀態寫入。
//
// 守則：
//   - 音色極輕短促（見 audioManager SFX_DEFS）；不是通知鈴聲，沒有徽章語意（紅線 6）。
//   - 心語與對峙的音在各自 controller 內呼叫（需要 per-turn safety 判斷）；
//     這裡只接「已經語意化」的回饋事件。
//   - AudioManager.playSfx 自帶靜音/音量/節流防護，此處不重複判斷。

const COMPANION_REACTION_FEEDBACK_EVENT = "COMPANION_REACTION_FEEDBACK";
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";

const TONE_TO_SFX = Object.freeze({
  accept: "touch_accept",
  guarded: "touch_guarded",
  refusal: "touch_refusal",
  calm: "touch_calm"
});

export function createAudioCueController() {
  function onReactionFeedback({ tone } = {}) {
    const sfx = TONE_TO_SFX[tone] || TONE_TO_SFX.calm;
    AudioManager.playSfx(sfx);
  }

  function onAnimationIntent({ source } = {}) {
    // 只為 TP-7 主動微時刻配音；其他動畫意圖（地圖/對峙/回歸）各有語境，不在此加聲。
    if (source === "companion-initiative") {
      AudioManager.playSfx("initiative_breath");
    }
  }

  function bind() {
    EventBus.on(COMPANION_REACTION_FEEDBACK_EVENT, onReactionFeedback);
    EventBus.on(COMPANION_ANIMATION_INTENT_EVENT, onAnimationIntent);
  }

  return { bind };
}
