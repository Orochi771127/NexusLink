import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const metadataPath = path.join(
  repoRoot,
  "assets",
  "characters",
  "greyshade-cat",
  "metadata",
  "animations.json"
);
const EXPECTED_FRAME_SIZE = 128;

const errors = [];
const warnings = [];

function main() {
  const metadata = readJson(metadataPath);
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    fail("animations.json must contain an object keyed by animation id.");
    return finish(0);
  }

  const entries = Object.entries(metadata);
  for (const [animationId, definition] of entries) {
    validateDefinition(animationId, definition);
  }

  finish(entries.length);
}

function validateDefinition(animationId, definition) {
  if (!definition || typeof definition !== "object") {
    fail(`${animationId}: definition must be an object.`);
    return;
  }

  if (definition.id !== animationId) {
    fail(`${animationId}: metadata id must match object key.`);
  }

  if (definition.frameWidth !== EXPECTED_FRAME_SIZE || definition.frameHeight !== EXPECTED_FRAME_SIZE) {
    fail(`${animationId}: frame size must be ${EXPECTED_FRAME_SIZE}x${EXPECTED_FRAME_SIZE}.`);
  }

  if (!Number.isInteger(definition.frameCount) || definition.frameCount <= 0) {
    fail(`${animationId}: frameCount must be a positive integer.`);
  }

  const rows = Number.isInteger(definition.rows) && definition.rows > 0 ? definition.rows : 1;
  const columns = Number.isInteger(definition.columns) && definition.columns > 0 ? definition.columns : definition.frameCount;
  if (rows * columns < definition.frameCount) {
    fail(`${animationId}: rows x columns must contain frameCount frames.`);
  }

  if (!Number.isFinite(definition.fps) || definition.fps <= 0) {
    fail(`${animationId}: fps must be a positive number.`);
  }

  const sheetPath = resolveRepoPath(definition.sheet);
  if (!sheetPath) {
    fail(`${animationId}: sheet path is required.`);
    return;
  }

  if (!fs.existsSync(sheetPath)) {
    fail(`${animationId}: missing sheet ${toRepoPath(sheetPath)}.`);
    return;
  }

  let dimensions;
  try {
    dimensions = readPngDimensions(sheetPath);
  } catch (error) {
    fail(`${animationId}: ${error.message}`);
    return;
  }

  const expectedWidth = definition.frameWidth * columns;
  const expectedHeight = definition.frameHeight * rows;
  if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
    fail(
      `${animationId}: sheet is ${dimensions.width}x${dimensions.height}, expected ${expectedWidth}x${expectedHeight}.`
    );
  }

  validateOptionalPath(animationId, "preview", definition.preview, false);
  validateOptionalPath(animationId, "framesDir", definition.framesDir, true);
}

function validateOptionalPath(animationId, label, rawPath, isDirectory) {
  if (!rawPath) {
    warnings.push(`${animationId}: ${label} path is not set.`);
    return;
  }

  const resolvedPath = resolveRepoPath(rawPath);
  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    warnings.push(`${animationId}: ${label} path is missing: ${rawPath}.`);
    return;
  }

  const stats = fs.statSync(resolvedPath);
  if (isDirectory && !stats.isDirectory()) {
    warnings.push(`${animationId}: ${label} should be a directory.`);
  } else if (!isDirectory && !stats.isFile()) {
    warnings.push(`${animationId}: ${label} should be a file.`);
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Failed to parse ${toRepoPath(filePath)}: ${error.message}`);
    return null;
  }
}

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error(`${toRepoPath(filePath)} is not a valid PNG file.`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function resolveRepoPath(rawPath) {
  if (typeof rawPath !== "string" || rawPath.trim() === "") return null;
  const normalized = rawPath.replaceAll("\\", "/").replace(/^\.\//, "");
  return path.resolve(repoRoot, normalized);
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function fail(message) {
  errors.push(message);
}

function finish(animationCount) {
  console.log(`Greyshade asset validation checked ${animationCount} animations.`);

  if (warnings.length > 0) {
    console.warn(`Warnings (${warnings.length}):`);
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`Errors (${errors.length}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("Greyshade asset validation passed.");
}

main();
