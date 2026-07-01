export function critiqueReply({ reply = "", actionPlan = {}, output = {} } = {}) {
  const issues = [];

  if (output.shouldSpeak && !reply?.trim()) {
    issues.push("should_speak_but_reply_empty");
  }

  if (!output.shouldSpeak && reply?.trim() && actionPlan.selectedAction === "body_cue_only") {
    issues.push("body_cue_has_verbal_reply");
  }

  if (reply && reply.split(/\n/).length > 6) {
    issues.push("reply_too_verbose");
  }

  return {
    pass: issues.length === 0,
    critic: "reply",
    issues,
    repairHint: issues.length ? "Align speak/silence with selectedAction." : ""
  };
}