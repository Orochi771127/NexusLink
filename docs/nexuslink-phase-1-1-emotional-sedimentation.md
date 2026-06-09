# NexusLink Phase 1.1 Emotional Sedimentation Data Layer

Version: RC2
Scope: Pure front-end MVP
Stack: HTML / CSS / JavaScript ES Modules / PixiJS CDN / localStorage / GitHub Pages

---

## 1. Goal

Phase 1.1 upgrades Soul Talk from simple chat plus repeated-input punishment into a structured emotional sedimentation data layer.

The first acceptance target is:

```text
Player input
→ emotion classification
→ intensity calculation
→ emotionalMemory creation
→ memory lifecycle support
→ localStorage persistence
→ SafeHarborMode bypasses spam punishment when the input is emotionally high pressure
```

This phase does not render memory symbols in PixiJS yet. Rendering belongs to Phase 1.2.

---

## 2. Product Rule

NexusLink is not a generic chat bot and not a hard RPG system at this stage.

It is an emotional habitat where a player can leave an emotional trace, let it settle, and return later to a world that remembers the shape of that trace.

The rule for Phase 1.1:

> Do not preserve the whole wound. Preserve a short emotional excerpt and its symbolic shape.

---

## 3. New Concepts

### emotionalMemory

A compact structured object generated from Soul Talk input.

```js
{
  id: "emem_1780940000000_381",
  theme: "疲憊",
  label: "疲憊的回聲",
  emotion: "fatigue",
  intensity: 0.82,
  symbol: "white_ash",
  place: "campfire_side",
  status: "fresh",
  source: "soul_talk",
  excerpt: "我今天真的好累...",
  createdAt: 1780940000000,
  lastUpdatedAt: 1780940000000,
  isVisibleInHabitat: true
}
```

### Lifecycle

```text
fresh → settled → transformed → archived → released
```

- `fresh`: newly created emotional trace.
- `settled`: emotional trace has cooled down after 12 hours.
- `transformed`: emotional trace has become habitat material after 3 days.
- `archived`: hidden from the primary habitat layer.
- `released`: intentionally released by player or system.

### SafeHarborMode

SafeHarborMode prevents emotionally repetitive or high-pressure input from being punished as spam.

It must not:

- Increase spamScore.
- Lower trust.
- Increase defense.
- Use mocking or corrective language.

It may:

- Lower defense slightly.
- Increase trust slightly.
- Give quiet support.
- Store an emotionalMemory unless Safety Shield is high risk.

---

## 4. New Files

```text
src/data/emotionDictionary.js
src/data/safetyShieldDictionary.js
src/engine/emotionalSedimentationEngine.js
src/engine/memoryLifecycleEngine.js
src/engine/safeHarborMode.js
```

---

## 5. Modified Files

```text
src/state/defaultState.js
src/state/store.js
src/engine/storageGuard.js
src/ui/soulTalkController.js
```

---

## 6. Architecture Rules

### emotionalSedimentationEngine

Must stay deterministic and testable.

Do not call `Date.now()` or `Math.random()` inside the core creation path. Runtime values must be injected by the controller:

```js
processEmotionInput(message, state, {
  now: Date.now(),
  idSuffix: "123"
});
```

### memoryLifecycleEngine

Must accept `now` as a parameter for time-travel debugging.

```js
updateMemoryLifecycles(emotionalMemories, futureNow);
```

### Safety Shield

High-risk messages should not become gameplay memory. The response is a system message, not a companion roleplay reward.

---

## 7. DevTools Time Travel Debugging

Use dynamic import from browser DevTools:

```js
const lifecycle = await import("./src/engine/memoryLifecycleEngine.js");
const now = Date.now();

const memories = [
  {
    id: "test_fresh_to_settled",
    theme: "疲憊",
    label: "疲憊的回聲",
    emotion: "fatigue",
    intensity: 0.8,
    symbol: "white_ash",
    place: "campfire_side",
    status: "fresh",
    source: "debug",
    excerpt: "我真的好累...",
    createdAt: now - 13 * 60 * 60 * 1000,
    lastUpdatedAt: now - 13 * 60 * 60 * 1000,
    isVisibleInHabitat: true
  }
];

const result = lifecycle.updateMemoryLifecycles(memories, now);
console.table(result.updatedMemories);
```

Expected status: `settled`.

---

## 8. Acceptance Criteria

1. Input `我好累` creates a `fatigue` emotionalMemory.
2. Repeated high-pressure emotional input enters SafeHarborMode and does not increase spamScore.
3. Noise input does not create emotionalMemory.
4. High-risk Safety Shield input does not create emotionalMemory.
5. emotionalMemory includes `excerpt` but not full rawText.
6. Reloading the page preserves emotionalMemories through localStorage.
7. Missing emotionalMemories in old saves does not crash the app.
8. `fresh` becomes `settled` after 12 hours when `now` is injected.
9. `settled` becomes `transformed` after 3 days when `now` is injected.
10. More than 12 visible memories archives the oldest visible active memories.

---

## 9. Phase Boundary

Phase 1.1 ends when the data layer is stable.

Phase 1.2 may add:

- PixiJS memory symbol rendering.
- Memory object click interaction.
- system_alert UI treatment.
- Optional object pooling only if performance requires it.
