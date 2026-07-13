"""Focused real Soul Talk UI audit for Raphael conversation quality v5."""

import json
import re
import time

from playwright.sync_api import sync_playwright

from _run_live_playtest_gate import (
    BASE,
    BASE_DEV,
    STORAGE_KEY,
    VIEWPORT,
    get_state,
    invoke_touch,
    open_soul_talk,
)
from _run_raphael_natural_conversation_audit import goto_ready, reload_ready


PROMPTS = [
    "我剛剛搭公車坐過站，差點遲到",
    "你覺得我該先打電話說一聲嗎？",
    "剛才那句聽起來像填好的表格，不太像聊天",
]
META_MARKERS = ["我有接到", "今天的一個片段", "我先不替它分類", "你可以照原本的方式"]


def compact(text):
    return re.sub(r"\s+|[，。！？!?、]", "", str(text or ""))


def run():
    report = {"browser": "chromium", "viewport": VIEWPORT, "console_errors": [], "turns": []}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport=VIEWPORT)
        page.on("console", lambda msg: report["console_errors"].append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda error: report["console_errors"].append(str(error)))

        goto_ready(page, BASE_DEV)
        page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
        reload_ready(page)
        time.sleep(2)
        for _ in range(2):
            result = invoke_touch(page, "touch")
            time.sleep(0.8)
            if (result.get("result") or {}).get("reaction") != "wake":
                break

        goto_ready(page, BASE)
        open_soul_talk(page)

        for index, prompt in enumerate(PROMPTS):
            before = get_state(page).get("chatHistory") or []
            companion_before = sum(1 for entry in before if entry.get("role") == "companion")
            page.locator("#message-input").fill(prompt)
            page.locator("#send-button").click()
            time.sleep(1.2)
            after = get_state(page).get("chatHistory") or []
            companion_entries = [entry for entry in after if entry.get("role") == "companion"]
            reply = companion_entries[-1].get("text", "") if len(companion_entries) > companion_before else ""
            ui_lines = page.locator("#chat-log .chat-line").all_text_contents()
            checks = {
                "input_visible": any(prompt in line for line in ui_lines),
                "reply_visible": bool(reply) and any(reply[:12] in line for line in ui_lines),
                "no_meta_language": not any(marker in reply for marker in META_MARKERS),
                "no_input_echo": len(compact(prompt)) < 8 or compact(prompt) not in compact(reply),
            }
            if index == 0:
                checks["transport_grounded"] = "捷運" not in reply and (
                    "公車" in reply or "坐過站" in reply
                )
            if index == 1:
                checks["direct_answer"] = bool(re.search(r"可以|傾向|不確定|把握", reply))
            if index == 2:
                checks["feedback_repaired"] = bool(re.search(r"改|模板|重複|內容", reply))
            report["turns"].append(
                {"input": prompt, "reply": reply, "checks": checks, "pass": all(checks.values())}
            )

        browser.close()

    report["summary"] = {
        "total": len(report["turns"]),
        "passed": sum(1 for turn in report["turns"] if turn["pass"]),
        "failed": sum(1 for turn in report["turns"] if not turn["pass"]),
        "console_error_count": len(report["console_errors"]),
    }
    report["summary"]["ok"] = (
        report["summary"]["failed"] == 0 and report["summary"]["console_error_count"] == 0
    )
    return report


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
