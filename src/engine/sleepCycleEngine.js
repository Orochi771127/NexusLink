// 夥伴生理時鐘（circadian sleep）。
//
// 安全紅線聲明：
// - 不違反紅線 #1：入睡與否只由「裝置本地時間」決定，絕不偵測玩家上線頻率／孤獨／依賴程度。
// - 不違反紅線 #6：睡眠永遠可被任何互動打斷、無懲罰、無 FOMO；牠只是回到自己的作息，
//   呼應契約 #2（敢於無聊、會留白）與 #3（你能影響牠但不能支配牠）。
//
// 設計：夜間時段內，最後一次互動超過寬限期即入睡；任何互動會更新時間戳 → 立即醒來，
//      之後若再無動作達寬限期就自然接著睡。單一時間戳即可滿足「打斷後 N 分鐘無動作回去睡」。

export const SLEEP_START_HOUR = 22; // 22:00 入睡
export const SLEEP_END_HOUR = 7;    // 07:00 起床
export const WAKE_GRACE_MS = 5 * 60 * 1000; // 被打斷後 5 分鐘無動作則回去睡

export function isWithinSleepWindow(now = Date.now(), startHour = SLEEP_START_HOUR, endHour = SLEEP_END_HOUR) {
  const hour = new Date(now).getHours();
  // 跨午夜的窗（例：22 → 隔天 7）
  if (startHour <= endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

export function shouldSleep(
  now = Date.now(),
  lastInteractionAt = 0,
  { graceMs = WAKE_GRACE_MS, startHour = SLEEP_START_HOUR, endHour = SLEEP_END_HOUR } = {}
) {
  if (!isWithinSleepWindow(now, startHour, endHour)) return false;
  return now - (Number(lastInteractionAt) || 0) >= graceMs;
}
