#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function usage(exitCode) {
  const text = [
    "Usage:",
    "  node scripts/validate_companion_asset.js --file path/to/sheet.png --character-id thunderpup --cols 4 --rows 2 --expected-frames 8",
    "",
    "Options:",
    "  --file              PNG sheet path",
    "  --character-id      Companion character id",
    "  --cols              Sheet columns",
    "  --rows              Sheet rows",
    "  --expected-frames   Expected frame count",
    "  --help              Show this help"
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

function positiveInteger(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return parsed;
}

function readChunks(buffer) {
  const chunks = [];
  let offset = 8;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcEnd = dataEnd + 4;
    if (crcEnd > buffer.length) {
      chunks.push({ type, length, malformed: true });
      break;
    }
    chunks.push({ type, length, dataStart, dataEnd, malformed: false });
    offset = crcEnd;
    if (type === "IEND") {
      break;
    }
  }
  return chunks;
}

function parsePng(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signatureOk = buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
  if (!signatureOk) {
    return { signatureOk, bufferLength: buffer.length };
  }

  const chunks = readChunks(buffer);
  const ihdr = chunks.find((chunk) => chunk.type === "IHDR");
  if (!ihdr || ihdr.malformed || ihdr.length < 13) {
    return { signatureOk, chunks, ihdrOk: false, bufferLength: buffer.length };
  }

  const width = buffer.readUInt32BE(ihdr.dataStart);
  const height = buffer.readUInt32BE(ihdr.dataStart + 4);
  const bitDepth = buffer.readUInt8(ihdr.dataStart + 8);
  const colorType = buffer.readUInt8(ihdr.dataStart + 9);
  const hasTrns = chunks.some((chunk) => chunk.type === "tRNS" && !chunk.malformed);
  const alphaCapable = colorType === 4 || colorType === 6 || hasTrns;

  return {
    signatureOk,
    ihdrOk: true,
    width,
    height,
    bitDepth,
    colorType,
    hasTrns,
    alphaCapable,
    chunks: chunks.map((chunk) => ({ type: chunk.type, length: chunk.length, malformed: chunk.malformed })),
    bufferLength: buffer.length
  };
}

function addCheck(report, name, pass, details, severity) {
  report.checks.push({ name, pass, severity: severity || (pass ? "info" : "error"), details });
  if (!pass && (severity || "error") === "error") {
    report.pass = false;
  }
}

function isGreyshadeLegacy(characterId, frameWidth, frameHeight) {
  if (characterId !== "greyshade-cat") {
    return false;
  }
  return [443, 444].includes(frameWidth) && [443, 444].includes(frameHeight);
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (!args.file || !args["character-id"] || !args.cols || !args.rows || !args["expected-frames"]) {
      usage(1);
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n\n`);
    usage(1);
  }

  const filePath = path.resolve(args.file);
  const characterId = args["character-id"];
  const cols = positiveInteger(args.cols, "cols");
  const rows = positiveInteger(args.rows, "rows");
  const expectedFrames = positiveInteger(args["expected-frames"], "expected-frames");

  const report = {
    tool: "validate_companion_asset",
    version: 1,
    file: filePath,
    character_id: characterId,
    inputs: { cols, rows, expected_frames: expectedFrames },
    pass: true,
    checks: [],
    png: null,
    frame: null,
    limitations: {
      transparent_background_check: "limited / metadata-only",
      edge_touch_warning: "not_checked",
      aesthetic_match: "not_checked; human review required",
      character_identity_match: "not_checked; human review required"
    }
  };

  addCheck(report, "file_exists", fs.existsSync(filePath), filePath);
  if (!fs.existsSync(filePath)) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(1);
  }

  const png = parsePng(filePath);
  report.png = {
    signature_ok: !!png.signatureOk,
    ihdr_ok: !!png.ihdrOk,
    width: png.width || null,
    height: png.height || null,
    bit_depth: png.bitDepth || null,
    color_type: Number.isInteger(png.colorType) ? png.colorType : null,
    has_trns_chunk: !!png.hasTrns,
    alpha_capable: !!png.alphaCapable,
    bytes: png.bufferLength
  };

  addCheck(report, "png_signature", !!png.signatureOk, "PNG signature must match");
  addCheck(report, "png_ihdr", !!png.ihdrOk, "IHDR width / height must be readable");

  if (png.signatureOk && png.ihdrOk) {
    addCheck(report, "sheet_edge_max", png.width <= 4096 && png.height <= 4096, `${png.width}x${png.height}, max edge 4096`);
    const gridDivisible = png.width % cols === 0 && png.height % rows === 0;
    addCheck(report, "grid_exactly_divisible", gridDivisible, `${png.width} / ${cols}, ${png.height} / ${rows}`);

    const frameWidth = gridDivisible ? png.width / cols : null;
    const frameHeight = gridDivisible ? png.height / rows : null;
    report.frame = {
      width: frameWidth,
      height: frameHeight,
      count_from_grid: cols * rows
    };

    addCheck(report, "expected_frame_count", cols * rows === expectedFrames, `${cols} * ${rows} = ${cols * rows}; expected ${expectedFrames}`);

    if (gridDivisible) {
      const isNewCompanion512 = frameWidth === 512 && frameHeight === 512;
      const isLegacy = isGreyshadeLegacy(characterId, frameWidth, frameHeight);
      addCheck(
        report,
        "frame_size_policy",
        isNewCompanion512 || isLegacy,
        isLegacy
          ? "greyshade-cat legacy 443/444 accepted; never upscale"
          : `new companion frame must be 512x512, got ${frameWidth}x${frameHeight}`
      );
    }

    addCheck(
      report,
      "alpha_capable_png",
      !!png.alphaCapable,
      `color_type=${png.colorType}, tRNS=${!!png.hasTrns}; transparent-background check remains metadata-only`,
      png.alphaCapable ? "info" : "warning"
    );
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(report.pass ? 0 : 1);
}

main();
