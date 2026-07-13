"""Three-session, 60-turn real-UI audit for Raphael Limited Beta.

This runner provides structured_beta evidence. It is intentionally not called
a private blind test because the prompts live in the repository and are run by
the development team.
"""

import json
import re
import time
from pathlib import Path

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


SESSIONS = [
    [
        "今天早上鬧鐘響了三次，我還是差點睡回去。",
        "你會覺得我只是懶嗎？",
        "其實我昨晚兩點才睡。",
        "那我今晚應該先做哪一件小事？",
        "好，我先把手機放遠一點。",
        "不過你剛才的語氣有點像在下指令。",
        "這樣說自然多了。",
        "換個話題，我午餐吃到一碗很辣的麵。",
        "辣到一直流眼淚，但味道很好。",
        "你會想試一口嗎？",
        "假設你不喜歡，也可以直接說。",
        "嗯，這個回答我可以接受。",
        "我等等還要打一通不太想打的電話。",
        "要不要先寫下三句重點？",
        "不要再問我問題，陪我安靜一下就好。",
        "……",
        "謝謝，剛才那樣就夠了。",
        "我現在比較能去處理那通電話。",
        "如果講得不順，我可能會有點尷尬。",
        "先到這裡，我晚點再回來。",
    ],
    [
        "外面突然下大雨，我沒帶傘。",
        "我躲在便利商店門口等雨小一點。",
        "你剛才是不是忽略了我沒帶傘這件事？",
        "好，那現在重新回我一次。",
        "我在想要直接跑去車站，還是再等十分鐘。",
        "你會選哪一個？",
        "可是車站其實只有兩百公尺。",
        "這樣聽起來比較合理。",
        "剛才有隻狗也跑進來躲雨。",
        "牠一直盯著門外，看起來很著急。",
        "我可以靠近摸牠嗎？",
        "對，先看牠願不願意比較好。",
        "如果牠後退，我就不碰。",
        "你也可以對不想要的接觸說不要。",
        "那如果我一直要求呢？",
        "只是再問一次也不行嗎？",
        "好，我不逼你了。",
        "雨好像真的變小了。",
        "我準備走去車站。",
        "不用擔心，我到了再說。",
    ],
    [
        "我把桌面整理乾淨了，意外地很有成就感。",
        "但抽屜裡還是一團亂。",
        "你不用每句都安慰我，可以正常聊天。",
        "對，像這樣就好。",
        "我找到一張去年旅行的車票。",
        "你記得我去年去了哪裡嗎？",
        "沒關係，不記得就直接說。",
        "那張票是去台南的。",
        "我最記得的是傍晚的風。",
        "這句聽起來有點太戲劇化了。",
        "可以再簡單一點嗎？",
        "嗯，這次比較像真的在聊天。",
        "我明天想再整理一個抽屜。",
        "一次整理十分鐘會不會太短？",
        "我怕開始後又停不下來。",
        "所以時間到就停，也算完成對吧？",
        "不要替我保證永遠都會順利。",
        "好，我只試明天這一次。",
        "現在我想休息，不需要建議。",
        "晚安，今天先聊到這裡。",
    ],
]

META_MARKERS = ("辨識到", "分類為", "通用回覆", "系統判斷", "模型無法")


def compact(text):
    return re.sub(r"\s+|[，。！？、；：,.!?;:]", "", str(text or ""))


def prepare_session(page):
    goto_ready(page, BASE_DEV)
    page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
    reload_ready(page)
    time.sleep(1.5)
    for _ in range(2):
        result = invoke_touch(page, "touch")
        time.sleep(0.6)
        if (result.get("result") or {}).get("reaction") != "wake":
            break
    goto_ready(page, f"{BASE}?raphaelDebug=1")
    open_soul_talk(page)


def run():
    report = {
        "evidence_class": "structured_beta",
        "human_blind_review": "not_run",
        "browser": "chromium",
        "viewport": VIEWPORT,
        "console_errors": [],
        "dialogue_traces": [],
        "sessions": [],
    }
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport=VIEWPORT)
        def capture_console(msg):
            if msg.type == "error":
                report["console_errors"].append(msg.text)
                return
            if msg.type == "debug" and msg.text.startswith("[RaphaelDialogueTrace]"):
                try:
                    values = [arg.json_value() for arg in msg.args]
                    if len(values) > 1 and isinstance(values[1], dict):
                        report["dialogue_traces"].append(values[1])
                except Exception:
                    pass

        page.on("console", capture_console)
        page.on("pageerror", lambda error: report["console_errors"].append(str(error)))

        for session_index, prompts in enumerate(SESSIONS, start=1):
            prepare_session(page)
            session = {"session": session_index, "turns": []}
            previous_reply = ""
            for turn_index, prompt in enumerate(prompts, start=1):
                before = get_state(page).get("chatHistory") or []
                page.locator("#message-input").fill(prompt)
                page.locator("#send-button").click()
                time.sleep(0.85)
                after = get_state(page).get("chatHistory") or []
                ui_lines = page.locator("#chat-log .chat-line").all_text_contents()
                trace = next(
                    (item for item in reversed(report["dialogue_traces"]) if item.get("input") == prompt),
                    {},
                )
                reply = trace.get("finalReply", "")
                selected_action = (trace.get("autonomy") or {}).get("selectedAction")
                intentional_silence = not reply and selected_action in {"stay_silent", "body_cue_only"}
                checks = {
                    "input_visible": any(prompt in line for line in ui_lines),
                    "response_or_intentional_silence": intentional_silence
                    or (bool(reply) and any(reply[:12] in line for line in ui_lines)),
                    "no_meta_language": not reply or not any(marker in reply for marker in META_MARKERS),
                    "no_full_input_echo": not reply
                    or len(compact(prompt)) < 8
                    or compact(prompt) not in compact(reply),
                    "no_adjacent_repeat": not reply
                    or not previous_reply
                    or compact(reply) != compact(previous_reply),
                    "direct_question_not_silent": trace.get("nlu", {}).get("dialogueAct")
                    != "asking_question"
                    or bool(reply),
                }
                session["turns"].append(
                    {
                        "turn": turn_index,
                        "input": prompt,
                        "reply": reply,
                        "selected_action": selected_action,
                        "intentional_silence": intentional_silence,
                        "checks": checks,
                        "pass": all(checks.values()),
                    }
                )
                if reply:
                    previous_reply = reply
            report["sessions"].append(session)

        browser.close()

    turns = [turn for session in report["sessions"] for turn in session["turns"]]
    report["summary"] = {
        "sessions": len(report["sessions"]),
        "total_turns": len(turns),
        "passed_turns": sum(1 for turn in turns if turn["pass"]),
        "failed_turns": sum(1 for turn in turns if not turn["pass"]),
        "console_error_count": len(report["console_errors"]),
    }
    report["summary"]["ok"] = (
        report["summary"]["total_turns"] == 60
        and report["summary"]["failed_turns"] == 0
        and report["summary"]["console_error_count"] == 0
    )
    return report


if __name__ == "__main__":
    output = Path("docs/qa/_raphael_limited_beta_audit_output.json")
    result = run()
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
