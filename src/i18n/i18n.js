import { STRINGS, LANGUAGES } from "./strings.js";

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

// 套用語言：設 html lang、更新所有 data-i18n / -placeholder / -aria 靜態節點。
// 動態渲染（pageRouter/atlas/roster 等）在各自 render 時呼叫 t()，由 state 變更觸發重繪。
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
}
