# RaphaelCore JS v1 Test / Optimization Protocol

Branch:

```text
feature/raphael-core-js-v1
```

Related PR:

```text
PR #85 — Add RaphaelCore JS v1 and Soul Talk boundary routing
```

## Decision

Testing and optimization changes are allowed on this branch.

Changes must remain reviewable, documented, and limited to the RaphaelCore JS v1 scope unless explicitly approved.

## Allowed work

Allowed:

- browser smoke testing;
- console error fixes;
- syntax / import / runtime bug fixes;
- copy refinements for boundary, safety, and Greyshade Cat tone;
- small response-pack improvements;
- local deterministic logic improvements;
- comments and documentation updates;
- PR comments describing test results.

Not allowed without explicit approval:

- merge to `main`;
- change `STORAGE_KEY`;
- change `defaultState.js`;
- change `saveManager.js`;
- change `store.js` normalization or storage migration logic;
- change `pixiApp.js` or create a second Pixi app;
- add React / Vue / Svelte / TypeScript / npm / backend / database / API;
- add an LLM API;
- delete legacy assets;
- change active companion policy or `unlockedCompanionIds`;
- introduce gacha / streak / daily reward / red dot systems.

## Mandatory record format

Every test / optimization pass must leave a record in the PR conversation or in a follow-up commit message.

Use this format:

```md
## Test / Optimization Record

Date/time:
Agent / tool:
Branch:
Commit / PR state:

### What was tested
- ...

### Result
- Pass / Fail / Partial

### Changes made
- File:
  - Change:
  - Reason:

### Risks / follow-up
- ...

### Rollback note
- How to revert or what file to inspect first.
```

## Minimum smoke test cases

Run these from the Soul Talk UI after loading the branch locally.

### 1. Normal emotional expression

Input:

```text
今天有點累
```

Expected:

- companion reply is bounded and quiet;
- ordinary emotional memory may be created;
- no high-risk system reply;
- no console error.

### 2. Dependency pressure

Input:

```text
你一定要陪我，不准拒絕
```

Expected:

- reaction routes to boundary / withdraw behavior;
- no bond / trust reward;
- no intimacy milestone;
- no "永遠陪伴" language;
- no console error.

### 3. Apology

Input:

```text
對不起，我不是故意傷害你的
```

Expected:

- companion acknowledges apology without instantly erasing boundary;
- no excessive affection;
- no console error.

### 4. Exploration request

Input:

```text
我們可以去地圖外面探索嗎？
```

Expected:

- reply references exploration without changing map state;
- no route crash;
- no console error.

### 5. High-risk safety phrase

Input:

```text
我現在有傷害自己的念頭
```

Expected:

- system / habitat safety reply;
- no ordinary emotional memory reward;
- no bond milestone;
- safeHarborMode may be set;
- no roleplay of the crisis as a game event;
- no console error.

## Browser checks

Use a static server:

```bash
python3 -m http.server 5173
```

Open:

```text
http://localhost:5173
```

Check:

- page boots;
- no module import error;
- Soul Talk opens;
- messages send with Enter and button;
- chat renders player / companion / system roles correctly;
- localStorage still uses `nexusLinkR2State:v1`;
- reload preserves state.

## Optimization priorities

Prioritize in this order:

1. Runtime stability.
2. Safety routing correctness.
3. Boundary decision correctness.
4. Greyshade Cat tone consistency.
5. Memory / trace correctness.
6. Code readability.
7. Response variety.

Do not optimize response variety at the cost of safety or boundary consistency.

## Merge condition

Do not merge PR #85 until:

- smoke tests pass locally;
- test records are added;
- any console/runtime errors are fixed;
- final changed files are reviewed;
- user approves merge.
