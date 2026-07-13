/**
 * STRINGS 四語言完整度驗證（機械式，不含語氣審）
 * 用法（repo root）：node docs/qa/verify_i18n_strings.mjs
 */
import { STRINGS } from "../../src/i18n/strings.js";

const LANGS = ["tc", "sc", "en", "jp"];
const missing = { sc: [], jp: [], en: [], tc: [] };

for (const [key, entry] of Object.entries(STRINGS)) {
  for (const lang of LANGS) {
    const val = entry?.[lang];
    if (val === undefined || val === null || String(val).trim() === "") {
      missing[lang].push(key);
    }
  }
}

let ok = true;
for (const lang of LANGS) {
  if (missing[lang].length > 0) {
    ok = false;
    console.error(`[FAIL] ${lang}: ${missing[lang].length} missing keys`);
    missing[lang].slice(0, 20).forEach((k) => console.error(`  - ${k}`));
    if (missing[lang].length > 20) {
      console.error(`  ... and ${missing[lang].length - 20} more`);
    }
  } else {
    console.log(`[OK] ${lang}: ${Object.keys(STRINGS).length} keys complete`);
  }
}

if (!ok) process.exit(1);
console.log(`\nTotal keys: ${Object.keys(STRINGS).length}`);
process.exit(0);
