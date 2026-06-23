export function requiresHumanApproval(patch = {}) {
  return Boolean(patch.requiresHumanApproval !== false);
}

export function formatPatchForReview(patches = []) {
  return patches
    .filter((patch) => patch.file && patch.change && patch.change !== "No corpus patch suggested")
    .map((patch) => ({
      type: patch.type,
      file: patch.file,
      change: patch.change,
      status: "pending_human_approval"
    }));
}