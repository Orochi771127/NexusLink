#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const REQUIRED_ACTION_FIELDS = [
  "character_id",
  "action_id",
  "frame_count",
  "rows",
  "cols",
  "frame_width",
  "frame_height",
  "total_width",
  "total_height",
  "facing",
  "motion_notes",
  "safety_notes",
  "reference_policy",
  "lock_frame_1",
  "expected_output",
  "qc_requirements"
];

function usage(exitCode) {
  const text = [
    "Usage:",
    "  node scripts/build_companion_prompt.js --lock path/to/lock.md --action path/to/action.json --out path/to/prompt.txt",
    "",
    "Options:",
    "  --lock     Character Lock Spec markdown path",
    "  --action   Companion action config JSON path",
    "  --out      Output prompt text path, or '-' for stdout",
    "  --help     Show this help"
  ].join("\n");
  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write(`${text}\n`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage(0);
    }
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function readText(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath, label) {
  const raw = readText(filePath, label);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function asPositiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return value;
}

function validateActionConfig(config) {
  for (const field of REQUIRED_ACTION_FIELDS) {
    if (!(field in config)) {
      throw new Error(`Action config missing required field: ${field}`);
    }
  }

  const frameCount = asPositiveInteger(config.frame_count, "frame_count");
  const rows = asPositiveInteger(config.rows, "rows");
  const cols = asPositiveInteger(config.cols, "cols");
  const frameWidth = asPositiveInteger(config.frame_width, "frame_width");
  const frameHeight = asPositiveInteger(config.frame_height, "frame_height");
  const totalWidth = asPositiveInteger(config.total_width, "total_width");
  const totalHeight = asPositiveInteger(config.total_height, "total_height");

  if (rows * cols !== frameCount) {
    throw new Error(`frame_count (${frameCount}) must equal rows * cols (${rows * cols})`);
  }
  if (cols * frameWidth !== totalWidth) {
    throw new Error(`total_width (${totalWidth}) must equal cols * frame_width (${cols * frameWidth})`);
  }
  if (rows * frameHeight !== totalHeight) {
    throw new Error(`total_height (${totalHeight}) must equal rows * frame_height (${rows * frameHeight})`);
  }
  if (totalWidth % cols !== 0 || totalHeight % rows !== 0) {
    throw new Error("Sheet grid must be exactly divisible by rows and cols");
  }
  if (totalWidth > 4096 || totalHeight > 4096) {
    throw new Error(`Sheet edge must be <= 4096, got ${totalWidth}x${totalHeight}`);
  }
}

function formatList(values) {
  if (!Array.isArray(values)) {
    return "- none";
  }
  return values.map((value) => `- ${value}`).join("\n");
}

function buildPrompt(lockSpec, config) {
  return [
    "# Nexus Link Companion Action Prompt",
    "",
    "Create one complete runtime-ready companion action sheet.",
    "",
    "## Character Lock Spec",
    "",
    lockSpec.trim(),
    "",
    "## Action Config",
    "",
    `- character_id: ${config.character_id}`,
    `- action_id: ${config.action_id}`,
    `- animation_catalog_ref: ${config.animation_catalog_ref || "not provided"}`,
    `- frame_count: ${config.frame_count}`,
    `- layout: ${config.rows} rows x ${config.cols} cols`,
    `- per_frame: ${config.frame_width}x${config.frame_height}`,
    `- total_sheet: ${config.total_width}x${config.total_height}`,
    `- facing: ${config.facing}`,
    `- motion_notes: ${config.motion_notes}`,
    `- safety_notes: ${config.safety_notes}`,
    `- reference_policy: ${config.reference_policy}`,
    `- lock_frame_1: ${config.lock_frame_1}`,
    "",
    "## Generation Requirements",
    "",
    "- same character identity",
    "- same silhouette",
    "- same palette",
    "- same face / eyes / markings",
    "- same material language",
    "- no species change",
    "- no redesign",
    "- no UI",
    "- no text",
    "- no scene",
    "- no pedestal",
    "- no white background",
    "- transparent PNG",
    "- 512x512 per frame for new companions",
    "- bottom-center baseline",
    "- one full action sheet at once",
    "- no frame-by-frame generation",
    "- stable scale across frames",
    "- full body inside safe area",
    "- no cropping",
    "- no detached FX inside body sheet unless explicitly requested",
    "- illustrated / painterly / high-detail Nexus Link companion style",
    "",
    "## Expected Output",
    "",
    JSON.stringify(config.expected_output, null, 2),
    "",
    "## QC Requirements",
    "",
    JSON.stringify(config.qc_requirements, null, 2),
    "",
    "## Forbidden",
    "",
    formatList(config.expected_output && config.expected_output.forbidden),
    ""
  ].join("\n");
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (!args.lock || !args.action || !args.out) {
      usage(1);
    }
    const lockPath = path.resolve(args.lock);
    const actionPath = path.resolve(args.action);
    const lockSpec = readText(lockPath, "Character lock spec");
    const actionConfig = readJson(actionPath, "Action config");
    validateActionConfig(actionConfig);
    const prompt = buildPrompt(lockSpec, actionConfig);
    if (args.out === "-") {
      process.stdout.write(prompt);
      if (!prompt.endsWith("\n")) {
        process.stdout.write("\n");
      }
      return;
    }
    fs.writeFileSync(path.resolve(args.out), prompt, "utf8");
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n\n`);
    usage(1);
  }
}

main();
