export function createChampionshipScreenStack() {
  const stack = [];
  return Object.freeze({
    replace(screenId) {
      stack.splice(0, stack.length, screenId);
      return screenId;
    },
    push(screenId) {
      stack.push(screenId);
      return screenId;
    },
    pop() {
      return stack.length > 1 ? stack.pop() : stack.at(-1) ?? null;
    },
    top() {
      return stack.at(-1) ?? null;
    },
    snapshot() {
      return [...stack];
    },
    clear() {
      stack.length = 0;
    }
  });
}
