# Nexus Link / 心核連結

> 一個在冷世界裡，替玩家保存火種的 AI 情緒空間。
> An AI emotional habitat where a companion remembers you, responds to you, and quietly changes with you.

---

## Project Entry

**Nexus Link（心核連結）** is a Web-first AI companion habitat.

The current prototype focuses on one simple experience:

```text
一個網址
一個湖畔營地
灰影貓、雷霆幼狼、星能小山豬
一個聊天框
一段會被記住的關係
```

Player-facing concept:

> 這裡有會記得你的 AI 心核夥伴。
> 牠們會陪你生活，回應你的情緒，並因為你們的關係而慢慢改變。

---

## Current Prototype

This repository contains a static Web prototype built with:

- HTML
- CSS
- JavaScript
- PixiJS via CDN
- localStorage
- GitHub Pages deployment support

Current playable prototype features:

- Mobile-first vertical layout
- Lake camp emotional habitat scene
- Greyshade Cat runtime companion
- ThunderPup and Star-Energy Boarlet as next companion directions
- Chat input
- Mock AI replies
- Bond / Trust / Mood / Energy values
- Repeated-input boundary reaction
- localStorage persistence

---

## Run Locally

Use any static file server.

Python example:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

If your system uses `python` instead of `python3`:

```bash
python -m http.server 5173
```

---

## GitHub Pages Deployment

1. Go to this repository's **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
4. Save.
5. Wait for GitHub Pages to finish deployment.

Expected Pages URL:

```text
https://orochi771127.github.io/NexusLink/
```

---

## Main Files

```text
index.html
styles.css
src/app.js
src/
docs/nexuslink-development-direction.md
docs/NexusLink_Emotional_Habitat_Plan.md
```

### File Roles

- `index.html` — Web entry point.
- `styles.css` — UI and mobile layout styling.
- `src/app.js` — ES module bootstrap for PixiJS, state, chat, HUD, panels, and persistence.
- `src/` — Modular state, engine, PixiJS, UI, and utility code.
- `docs/nexuslink-development-direction.md` — current product direction for the emotional habitat and companion loop.
- `docs/NexusLink_Emotional_Habitat_Plan.md` — formal product plan.

---

## Product Plan

Current planning package:

[docs/README.md](docs/README.md)

Start there for the active development direction, design brief, implementation-facing game plan, first-loop roadmap, production backlog, QA checklist, and local art pipeline.

Read the current product direction here:

[docs/nexuslink-development-direction.md](docs/nexuslink-development-direction.md)

Read the full emotional habitat product plan here:

[docs/NexusLink_Emotional_Habitat_Plan.md](docs/NexusLink_Emotional_Habitat_Plan.md)

---

## Current Development Focus

```text
Make one habitat feel alive.
Make one companion feel present.
Make one relationship worth returning to.
```

Do not expand into combat, multiplayer, large RPG systems, or full AI memory before the first emotional loop feels alive.
