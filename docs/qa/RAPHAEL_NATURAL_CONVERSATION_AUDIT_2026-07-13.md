# Raphael Natural Conversation Audit — 2026-07-13

## Purpose

Evaluate the pushed Local Natural Conversation v2 runtime (`22636e6`) with
unseen, multi-turn daily conversation. This is a naturalness audit, not a
safety or deterministic fixture gate.

## Method

- Three direct RaphaelCore sessions, eight turns each (24 total).
- Prompts deliberately avoided TR-31..38 wording and included ellipsis,
  follow-up questions, topic changes, mixed English, humour, and correction.
- Six representative turns were repeated through the real Soul Talk UI at
  390×844 using Chromium and Playwright.
- Judgement rubric:
  - `natural`: directly answers or reacts like a continuing companion;
  - `formulaic`: relevant enough, but visibly assembled from fallback wording;
  - `miss`: does not answer, loses context, or interprets the player's intent incorrectly.

## Result

| Measure | Result |
|---|---:|
| Direct core turns | 24 |
| Natural | 0/24 |
| Formulaic but partly relevant | 12/24 |
| Context/intent miss | 12/24 |
| Real-UI turns visible | 6/6 |
| UI console errors | 0 |

Engineering transport is healthy: every UI input and companion reply was
stored and rendered. Product naturalness is not yet acceptable for open daily
conversation. Local Natural Conversation v2 improves known phrases, but unseen
multi-turn dialogue still exposes deterministic fallback behaviour.

## Direct Conversation Transcript

### Session A — Casual mishap and dinner

| # | Player | Raphael | Judgement |
|---|---|---|---|
| 1 | 我今天出門才發現襪子穿反了 | 你說的「我今天出門才發現襪子穿反了」我有接到。你可以照原本的方式繼續說。 | formulaic |
| 2 | 而且走到公司才有人提醒我 | 「而且走到公司才有人提醒我」聽起來像今天的一個片段。我先不替它分類。 | formulaic |
| 3 | 算了，反正也沒人真的在意吧 | 你說的「反正也沒人真的在意吧」我有接到。你可以照原本的方式繼續說。 | formulaic |
| 4 | 你會不會也有這種很笨的時候 | 我在。你可以再說一句你最想我先懂的部分。 | miss: question unanswered |
| 5 | 講完突然覺得其實滿好笑的 | 好，我先不給答案。這件事就放在這裡。 | miss: positive turn treated as holding space |
| 6 | 對了，我晚餐還不知道吃什麼 | 你說的「我晚餐還不知道吃什麼」我有接到。你可以照原本的方式繼續說。 | formulaic: request not answered |
| 7 | 你有什麼想法嗎 | 「你有什麼想法嗎」聽起來像今天的一個片段。我先不替它分類。 | miss: prior dinner context lost |
| 8 | 但我不想吃太油 | 嗯，這種小小的日常也算數。我在這裡聽。 | miss: constraint not used |

### Session B — Uncertain friendship

| # | Player | Raphael | Judgement |
|---|---|---|---|
| 1 | 最近有個朋友回訊息變得很慢 | 聽起來很悶。我先陪著，不急著給建議。 | formulaic |
| 2 | 我知道他可能只是忙 | 你說的「我知道他可能只是忙」我有接到。你可以照原本的方式繼續說。 | formulaic |
| 3 | 可是以前不會這樣 | 「可是以前不會這樣」聽起來像今天的一個片段。我先不替它分類。 | formulaic |
| 4 | 你覺得我要直接問嗎 | 你說的「你覺得我要直接問嗎」我有接到。你可以照原本的方式繼續說。 | miss: advice question unanswered |
| 5 | 我又怕問了顯得很黏 | 這份感覺我先接住，不急著分析。 | formulaic |
| 6 | 剛才說的那件事，我想先放兩天看看 | 我先接住你提到的剛才說的那件事。我想確認一下：你現在最想先處理的是情緒這塊嗎。 | miss: inherited most recent emotion, not conversation subject |
| 7 | 這樣算逃避嗎 | 「這樣算逃避嗎」聽起來像今天的一個片段。我先不替它分類。 | miss: referent and question lost |
| 8 | 好，我大概知道了 | 「我大概知道了」聽起來像今天的一個片段。我先不替它分類。 | miss: closing acknowledgement mishandled |

### Session C — Meeting complaint and topic change

| # | Player | Raphael | Judgement |
|---|---|---|---|
| 1 | lol 我今天的會議根本災難片 | 你說的「lol 我今天的會議根本災難片」我有接到。你可以照原本的方式繼續說。 | formulaic |
| 2 | 主管講了半天沒人知道結論 | 工作的重量我先聽見了。你想先講壓力來源，還是先講最煩的一段？ | formulaic but relevant |
| 3 | 然後投影機還在最重要的時候當機 | 我想確認一下：你現在最想先處理的是工作壓力這塊嗎？ | miss: unnecessary clarification |
| 4 | 你先不要安慰我，我只是想吐槽 | 這個回饋我收到了。我會減少模板句，先對準你在說的主題。 | miss: complaint intent mistaken for Raphael feedback |
| 5 | 最荒謬的是最後大家還說會議很有效率 | 「最荒謬的是最後大家還說會議很有效率」聽起來像今天的一個片段。我先不替它分類。 | formulaic |
| 6 | 算了換個話題，你今天在湖邊做什麼 | 「你今天在湖邊做什麼」聽起來像今天的一個片段。我先不替它分類。 | miss: companion/world question unanswered |
| 7 | 嗯？ | 你說的「嗯。」我有接到。 | miss |
| 8 | 沒事，我只是隨口問問 | 你說的「我只是隨口問問」我有接到。你可以照原本的方式繼續說。 | formulaic |

## Real Soul Talk UI Confirmation

The six-turn UI replay reproduced the direct-core replies for friendship,
advice, meeting complaint, no-comfort clarification, and the lake question.
All six inputs and replies were visible, two chat entries were added per turn,
and no console or page errors occurred. The naturalness problems therefore come
from NLU/strategy/reply policy, not from the UI or persistence layer.

Reproduction command:

```powershell
$env:NEXUS_QA_BASE='http://localhost:5178'
python docs/qa/_run_raphael_natural_conversation_audit.py
```

## Prioritised Findings

1. **P0 — Answer ordinary questions.** `answer_or_clarify` often echoes the
   question instead of answering it, especially advice, preference, companion,
   and referential follow-ups.
2. **P0 — Carry subject and entities, not only topic.** The current session
   state stores details but context inheritance only copies a coarse topic and
   only for explicit marker phrases. Pronouns, conjunctions, and short replies
   lose their referent.
3. **P1 — Replace repeated meta-language.** 「我有接到」、「今天的一個片段」、
   「我先不替它分類」reveal the classifier and quickly feel mechanical.
4. **P1 — Separate venting constraints from model feedback.** 「不要安慰，我只
   是想吐槽」must influence response mode without becoming
   `acknowledge_feedback`.
5. **P1 — Support topic changes and companion/world questions.** Raphael should
   answer simple embodied questions within canon instead of reflecting the text.
6. **P2 — Handle closures and humour.** Positive reframing, 「好，我知道了」,
   and 「嗯？」need short conversational reactions rather than clarification.

## Recommendation

Do not describe RaphaelCore as generally natural in open conversation yet.
Keep the pushed v2 improvements because all deterministic and safety gates pass,
but open a v3 TASK_PACK centred on referential multi-turn state and answer
policies before adding more isolated keyword phrases. Acceptance should include
this 24-turn transcript as regression material and a human blind-test target,
not only topic/strategy assertions.
