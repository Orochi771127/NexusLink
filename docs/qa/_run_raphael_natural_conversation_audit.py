"""Small real-UI audit for Raphael natural-conversation handoffs."""

import json
import time

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
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


PROMPTS = [
    "最近有個朋友回訊息變得很慢",
    "我知道他可能只是忙",
    "你覺得我要直接問嗎",
    "lol 我今天的會議根本災難片",
    "你先不要安慰我，我只是想吐槽",
    "算了換個話題，你今天在湖邊做什麼",
    "嗯？",
    "對了，我晚餐還不知道吃什麼",
    "你有什麼想法嗎",
    "但我不想吃太油",
]


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
        time.sleep(1)
        open_soul_talk(page)

        for prompt in PROMPTS:
            before = get_state(page).get("chatHistory") or []
            page.locator("#message-input").fill(prompt)
            page.locator("#send-button").click()
            time.sleep(1.2)
            after = get_state(page).get("chatHistory") or []
            reply = next(
                (entry.get("text", "") for entry in reversed(after) if entry.get("role") == "companion"),
                "",
            )
            ui_lines = page.locator("#chat-log .chat-line").all_text_contents()
            report["turns"].append(
                {
                    "input": prompt,
                    "reply": reply,
                    "chat_entries_added": len(after) - len(before),
                    "input_visible": any(prompt in line for line in ui_lines),
                    "reply_visible": bool(reply) and any(reply[:12] in line for line in ui_lines),
                }
            )

        browser.close()

    report["summary"] = {
        "total": len(report["turns"]),
        "visible": sum(
            1 for turn in report["turns"] if turn["input_visible"] and turn["reply_visible"]
        ),
        "console_error_count": len(report["console_errors"]),
    }
    return report


def goto_ready(page, url):
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
    except PlaywrightTimeoutError:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_selector("#game-root", timeout=30000)


def reload_ready(page):
    try:
        page.reload(wait_until="networkidle", timeout=30000)
    except PlaywrightTimeoutError:
        page.reload(wait_until="domcontentloaded", timeout=30000)
    page.wait_for_selector("#game-root", timeout=30000)


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
