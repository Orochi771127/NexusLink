#!/usr/bin/env python
"""Repack manually-transparent greyshade-cat grids into 128x128 runtime sheets."""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CAT_ROOT = ROOT / "assets" / "characters" / "greyshade-cat"
INBOX = CAT_ROOT / "inbox_manual_transparent"
METADATA = CAT_ROOT / "metadata"
ANIMATIONS_JSON = METADATA / "animations.json"
PREVIEWS = METADATA / "previews"
REPORT_JSON = METADATA / "greyshade-cat_128_repack_report.json"

FRAME_SIZE = 128
ANCHOR = {"x": 0.5, "y": 1}
ALPHA_THRESHOLD = 8
SAFETY_PAD = 4


@dataclass(frozen=True)
class Spec:
    category: str
    fallback_fps: float
    loop: bool


SPECS: dict[str, Spec] = {
    "idle_calm": Spec("emotion", 8, True),
    "idle_defensive": Spec("emotion", 8, True),
    "idle_distant": Spec("emotion", 7, True),
    "blink": Spec("emotion", 10, False),
    "touch_guarded": Spec("touch", 10, False),
    "touch_accept": Spec("touch", 10, False),
    "touch_reject": Spec("touch", 10, False),
    "hug": Spec("touch", 10, False),
    "sit": Spec("movement", 8, True),
    "sleep": Spec("movement", 6, True),
    "right_walk": Spec("movement", 6, True),
    "attack_basic": Spec("battle", 12, False),
    "defend": Spec("battle", 10, False),
    "hit": Spec("battle", 12, False),
    "idle_sick": Spec("emotion", 4, True),
    "idle_angry": Spec("emotion", 6, True),
    "idle_sad": Spec("emotion", 5, True),
    "idle_dance": Spec("special", 8, True),
    "idle_wash": Spec("special", 8, True),
    "idle_wake": Spec("special", 7, False),
    "idle_happy": Spec("emotion", 7, True),
    "special_wake": Spec("special", 7, False),
    "left_walk": Spec("movement", 6, True),
    "special_left_walk": Spec("special", 6, False),
    "special_angry": Spec("special", 8, False),
    "idle_enjoy": Spec("emotion", 7, True),
    "special_sad": Spec("special", 6, False),
    "special_dance": Spec("special", 8, True),
    "special_wash": Spec("special", 8, False),
}


def natural_key(path: Path) -> list[int | str]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def parse_source_name(path: Path) -> tuple[str, int, int, int, list[dict[str, str]]]:
    stem = re.sub(r"\s+\(\d+\)$", "", path.stem)
    match = re.match(r"^\d+_(?P<anim>.+?)_(?P<rows>\d+)x(?P<cols>\d+)_(?P<count>\d+)f$", stem)
    if not match:
        raise ValueError(f"Cannot parse inbox filename: {path.name}")

    raw_animation_id = match.group("anim").replace("-", "_")
    typo_normalized: list[dict[str, str]] = []
    animation_id = raw_animation_id
    if raw_animation_id == "spcial_wash":
        animation_id = "special_wash"
        typo_normalized.append({"from": "spcial_wash", "to": "special_wash"})

    return (
        animation_id,
        int(match.group("rows")),
        int(match.group("cols")),
        int(match.group("count")),
        typo_normalized,
    )


def alpha_bbox(image: Image.Image, threshold: int = ALPHA_THRESHOLD) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= threshold else 0)
    return mask.getbbox()


def pad_to_grid(image: Image.Image, rows: int, columns: int) -> tuple[Image.Image, dict[str, Any]]:
    padded_width = math.ceil(image.width / columns) * columns
    padded_height = math.ceil(image.height / rows) * rows
    if (padded_width, padded_height) == image.size:
        return image, {"padded": False, "from": list(image.size), "to": list(image.size)}

    padded = Image.new("RGBA", (padded_width, padded_height), (0, 0, 0, 0))
    padded.alpha_composite(image, (0, 0))
    return padded, {"padded": True, "from": list(image.size), "to": [padded_width, padded_height]}


def extract_grid_cell(image: Image.Image, row: int, column: int, rows: int, columns: int) -> Image.Image:
    cell_width = image.width // columns
    cell_height = image.height // rows
    left = column * cell_width
    top = row * cell_height
    return image.crop((left, top, left + cell_width, top + cell_height))


def alpha_status(image: Image.Image) -> dict[str, Any]:
    alpha = image.getchannel("A")
    extrema = alpha.getextrema()
    array = np.array(alpha)
    opaque_or_visible = int((array >= ALPHA_THRESHOLD).sum())
    total = int(array.size)
    edge = np.concatenate([array[0, :], array[-1, :], array[:, 0], array[:, -1]])
    return {
        "mode": image.mode,
        "hasAlpha": image.mode == "RGBA",
        "alphaExtrema": list(extrema),
        "visiblePixelRatio": round(opaque_or_visible / total, 6),
        "visibleEdgePixelRatio": round(float((edge >= ALPHA_THRESHOLD).sum()) / float(edge.size), 6),
    }


def assert_clean_transparency(image: Image.Image, path: Path) -> None:
    if image.mode != "RGBA":
        raise ValueError(f"{path.name}: expected RGBA, got {image.mode}")

    status = alpha_status(image)
    if status["alphaExtrema"][0] != 0 or status["alphaExtrema"][1] == 0:
        raise ValueError(f"{path.name}: alpha channel is missing transparent and visible pixels: {status}")

    if status["visiblePixelRatio"] > 0.9:
        raise ValueError(f"{path.name}: alpha coverage is suspiciously high; refusing to clean or repack background.")


def source_bboxes(tiles: list[Image.Image]) -> list[dict[str, Any]]:
    boxes: list[dict[str, Any]] = []
    for index, tile in enumerate(tiles, start=1):
        bbox = alpha_bbox(tile)
        if bbox is None:
            boxes.append({"frame": index, "bbox": None, "width": 0, "height": 0})
            continue
        boxes.append({
            "frame": index,
            "bbox": list(bbox),
            "width": bbox[2] - bbox[0],
            "height": bbox[3] - bbox[1],
        })
    return boxes


def normalize_frame(tile: Image.Image, shared_scale: float) -> tuple[Image.Image, dict[str, Any]]:
    bbox = alpha_bbox(tile)
    canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    if bbox is None:
        return canvas, {
            "empty": True,
            "sourceBbox": None,
            "scaledSize": [0, 0],
            "paste": [0, 0],
            "normalizedBbox": None,
            "clipped": False,
            "edgePixels": 0,
        }

    sprite = tile.crop(bbox)
    scaled_size = (
        max(1, int(round(sprite.width * shared_scale))),
        max(1, int(round(sprite.height * shared_scale))),
    )
    sprite = sprite.resize(scaled_size, Image.Resampling.LANCZOS)

    paste_x = int(round((FRAME_SIZE - sprite.width) / 2))
    paste_y = FRAME_SIZE - sprite.height
    clipped = paste_x < 0 or paste_y < 0 or paste_x + sprite.width > FRAME_SIZE or paste_y + sprite.height > FRAME_SIZE

    src_left = max(0, -paste_x)
    src_top = max(0, -paste_y)
    src_right = min(sprite.width, FRAME_SIZE - paste_x)
    src_bottom = min(sprite.height, FRAME_SIZE - paste_y)
    if src_left < src_right and src_top < src_bottom:
        canvas.alpha_composite(sprite.crop((src_left, src_top, src_right, src_bottom)), (max(0, paste_x), max(0, paste_y)))

    normalized_bbox = alpha_bbox(canvas)
    edge_pixels = 0
    bottom_edge_pixels = 0
    if normalized_bbox:
        alpha = canvas.getchannel("A")
        alpha_array = np.array(alpha)
        edge_pixels = int(
            (alpha_array[0, :] >= ALPHA_THRESHOLD).sum()
            + (alpha_array[:, 0] >= ALPHA_THRESHOLD).sum()
            + (alpha_array[:, -1] >= ALPHA_THRESHOLD).sum()
        )
        bottom_edge_pixels = int((alpha_array[-1, :] >= ALPHA_THRESHOLD).sum())

    return canvas, {
        "empty": False,
        "sourceBbox": list(bbox),
        "scaledSize": list(scaled_size),
        "paste": [paste_x, paste_y],
        "normalizedBbox": list(normalized_bbox) if normalized_bbox else None,
        "clipped": clipped,
        "edgePixels": edge_pixels,
        "bottomEdgePixels": bottom_edge_pixels,
    }


def build_grid_sheet(frames: list[Image.Image], rows: int, columns: int) -> Image.Image:
    sheet = Image.new("RGBA", (columns * FRAME_SIZE, rows * FRAME_SIZE), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        x = (index % columns) * FRAME_SIZE
        y = (index // columns) * FRAME_SIZE
        sheet.alpha_composite(frame, (x, y))
    return sheet


def build_preview(frames: list[Image.Image], rows: int, columns: int) -> Image.Image:
    scale = 2
    preview = Image.new("RGBA", (columns * FRAME_SIZE * scale, rows * FRAME_SIZE * scale), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        enlarged = frame.resize((FRAME_SIZE * scale, FRAME_SIZE * scale), Image.Resampling.NEAREST)
        x = (index % columns) * FRAME_SIZE * scale
        y = (index // columns) * FRAME_SIZE * scale
        preview.alpha_composite(enlarged, (x, y))
    return preview


def load_metadata() -> dict[str, Any]:
    if not ANIMATIONS_JSON.exists():
        return {}
    return json.loads(ANIMATIONS_JSON.read_text(encoding="utf-8"))


def save_metadata(data: dict[str, Any]) -> None:
    METADATA.mkdir(parents=True, exist_ok=True)
    ANIMATIONS_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def relative_asset_path(path: Path) -> str:
    return "./" + path.relative_to(ROOT).as_posix()


def process_one(path: Path, metadata: dict[str, Any]) -> dict[str, Any]:
    animation_id, rows, columns, frame_count, typo_normalized = parse_source_name(path)
    if animation_id not in SPECS:
        raise ValueError(f"Unknown animation id from {path.name}: {animation_id}")

    image = Image.open(path)
    assert_clean_transparency(image, path)
    image = image.convert("RGBA")
    image, padding = pad_to_grid(image, rows, columns)

    tiles = [
        extract_grid_cell(image, index // columns, index % columns, rows, columns)
        for index in range(frame_count)
    ]
    boxes = source_bboxes(tiles)
    non_empty_boxes = [box for box in boxes if box["bbox"]]
    max_width = max((box["width"] for box in non_empty_boxes), default=1)
    max_height = max((box["height"] for box in non_empty_boxes), default=1)
    shared_scale = min((FRAME_SIZE - SAFETY_PAD * 2) / max_width, (FRAME_SIZE - SAFETY_PAD) / max_height, 1.0)

    frames: list[Image.Image] = []
    frame_reports: list[dict[str, Any]] = []
    for tile in tiles:
        frame, frame_report = normalize_frame(tile, shared_scale)
        frames.append(frame)
        frame_reports.append(frame_report)

    spec = SPECS[animation_id]
    previous = metadata.get(animation_id, {})
    fps = previous.get("fps", spec.fallback_fps)
    loop = previous.get("loop", spec.loop)
    category = spec.category
    sheet_path = CAT_ROOT / "spritesheets" / category / f"greyshade-cat_{animation_id}_128x128_{frame_count}f.png"
    frames_dir = CAT_ROOT / "frames" / category / animation_id
    preview_path = PREVIEWS / f"greyshade-cat_{animation_id}_preview.png"

    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    frames_dir.mkdir(parents=True, exist_ok=True)
    preview_path.parent.mkdir(parents=True, exist_ok=True)

    for index, frame in enumerate(frames, start=1):
        frame.save(frames_dir / f"frame_{index:02d}.png")
    build_grid_sheet(frames, rows, columns).save(sheet_path)
    build_preview(frames, rows, columns).save(preview_path)

    metadata[animation_id] = {
        "id": animation_id,
        "category": category,
        "type": category,
        "sheet": relative_asset_path(sheet_path),
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "rows": rows,
        "columns": columns,
        "frameCount": frame_count,
        "fps": fps,
        "loop": loop,
        "anchor": ANCHOR,
        "preview": relative_asset_path(preview_path),
        "framesDir": relative_asset_path(frames_dir),
    }

    bottoms = [item["normalizedBbox"][3] for item in frame_reports if item.get("normalizedBbox")]
    bottom_range = [min(bottoms), max(bottoms)] if bottoms else None
    baseline_warning = bool(bottoms and (max(bottoms) - min(bottoms) > 1))
    suspicious = []
    for index, item in enumerate(frame_reports, start=1):
        if item["empty"] or item["clipped"] or item["edgePixels"] > 0:
            suspicious.append(index)

    output_size = [columns * FRAME_SIZE, rows * FRAME_SIZE]
    return {
        "inputFile": str(path.relative_to(ROOT)).replace("\\", "/"),
        "outputSheet": str(sheet_path.relative_to(ROOT)).replace("\\", "/"),
        "id": animation_id,
        "category": category,
        "rows": rows,
        "columns": columns,
        "frameCount": frame_count,
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "outputSheetSize": output_size,
        "alphaStatus": alpha_status(image),
        "padding": padding,
        "sharedScale": round(shared_scale, 6),
        "bboxSummary": {
            "source": boxes,
            "maxSourceSize": [max_width, max_height],
            "normalized": [item["normalizedBbox"] for item in frame_reports],
            "baselineBottomRange": bottom_range,
        },
        "baselineConsistencyWarning": baseline_warning,
        "skippedFrames": [],
        "suspiciousFrames": suspicious,
        "typoNormalized": typo_normalized,
        "frameReports": frame_reports,
    }


def validate_outputs(metadata: dict[str, Any], processed: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    for item in processed:
        path = ROOT / item["outputSheet"]
        image = Image.open(path)
        expected_size = tuple(item["outputSheetSize"])
        if image.size != expected_size:
            errors.append(f'{item["id"]}: sheet size {image.size} != {expected_size}')
        if image.mode != "RGBA":
            errors.append(f'{item["id"]}: sheet mode {image.mode} != RGBA')
        alpha = image.getchannel("A").getextrema()
        if alpha[1] == 0:
            errors.append(f'{item["id"]}: sheet alpha has no visible pixels')

        definition = metadata.get(item["id"], {})
        if definition.get("rows") != item["rows"] or definition.get("columns") != item["columns"]:
            errors.append(f'{item["id"]}: metadata grid does not match output report')
    return errors


def main() -> None:
    if not INBOX.exists():
        raise SystemExit(f"Input folder not found: {INBOX}")

    files = sorted(INBOX.glob("*.png"), key=natural_key)
    metadata = load_metadata()
    processed = [process_one(path, metadata) for path in files]
    save_metadata(metadata)

    validation_errors = validate_outputs(metadata, processed)
    report = {
        "inputDirectory": str(INBOX.relative_to(ROOT)).replace("\\", "/"),
        "inputPngCount": len(files),
        "allInputsRgbaTransparent": all(item["alphaStatus"]["hasAlpha"] for item in processed),
        "generationOrCleanupPerformed": False,
        "frameSize": [FRAME_SIZE, FRAME_SIZE],
        "updatedAnimations": [item["id"] for item in processed],
        "typoNormalized": [
            typo
            for item in processed
            for typo in item["typoNormalized"]
        ],
        "validationErrors": validation_errors,
        "manualReviewFrames": [
            {"id": item["id"], "suspiciousFrames": item["suspiciousFrames"], "baselineConsistencyWarning": item["baselineConsistencyWarning"]}
            for item in processed
            if item["suspiciousFrames"] or item["baselineConsistencyWarning"]
        ],
        "processed": processed,
    }

    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "inputPngCount": report["inputPngCount"],
        "updatedAnimations": len(report["updatedAnimations"]),
        "validationErrors": validation_errors,
        "manualReviewCount": len(report["manualReviewFrames"]),
        "report": str(REPORT_JSON.relative_to(ROOT)).replace("\\", "/"),
    }, indent=2))

    if validation_errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
