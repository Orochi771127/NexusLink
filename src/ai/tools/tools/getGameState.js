export const getGameStateTool = Object.freeze({
  name: "getGameState",
  risk: "low",
  requiresUserConsent: false,
  allowedInRuntime: true,
  execute(_input, context = {}) {
    const state = context.state || {};
    return {
      ok: true,
      data: {
        mood: state.mood,
        bond: state.bond,
        trust: state.trust,
        defense: state.defense,
        energy: state.energy,
        safeHarborMode: state.safeHarborMode,
        memoryCount: (state.emotionalMemories || []).length
      }
    };
  }
});