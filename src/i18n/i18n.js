import { STRINGS, LANGUAGES } from "./strings.js";
import EventBus from "../utils/eventBus.js";

// 語言切換事件：靜態 [data-i18n] 由 applyLanguage 直接掃描更新；
// 已渲染的動態內容（pageRouter 分頁、roster 等以 t() baked 進 innerHTML）
// 不在 DOM 掃描範圍內，必須監聽此事件後自行重畫。
export const LANGUAGE_CHANGED_EVENT = "LANGUAGE_CHANGED";

const LANG_IDS = new Set(LANGUAGES.map((lang) => lang.id));
let currentLang = "tc";

export function getLanguage() {
  return currentLang;
}

// 取字串：缺該語言時退回繁中，再退回 key 本身（避免空白）。
export function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[currentLang] || entry.tc || key;
}

// 套用語言：設 html lang、更新所有 data-i18n / -placeholder / -aria 靜態節點，
// 最後發出 LANGUAGE_CHANGED_EVENT，讓以 t() 動態 render 的 controller（pageRouter/roster 等）重畫。
export function applyLanguage(lang) {
  currentLang = LANG_IDS.has(lang) ? lang : "tc";
  const meta = LANGUAGES.find((item) => item.id === currentLang);
  const root = document.documentElement;
  if (meta) root.setAttribute("lang", meta.htmlLang);
  root.dataset.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });

  EventBus.emit(LANGUAGE_CHANGED_EVENT, { lang: currentLang });
}
