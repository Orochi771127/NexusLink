#!/usr/bin/env python
"""Process greyshade-cat inbox animation grids into 128x128 runtime assets."""

from __future__ import annotations

import json
import math
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
CAT_ROOT = ROOT / "assets" / "characters" / "greyshade-cat"
INBOX = CAT_ROOT / "inbox"
METADATA = CAT_ROOT / "metadata"
ANIMATIONS_JSON = METADATA / "animations.json"
PREVIEWS = METADATA / "previews"
REPORT_JSON = METADATA / "greyshade-cat_128_processing_report.json"

FRAME_SIZE = 128
ANCHOR = {"x": 0.5, "y": 1}


@dataclass(frozen=True)
class Spec:
    category: str
    frame_count: int
    fps: int
    loop: bool


SPECS: dict[str, Spec] = {
    "idle_calm": Spec("emotion", 8, 8, True),
    "idle_defensive": Spec("emotion", 8, 8, True),
    "idle_distant": Spec("emotion", 8, 7, True),
    "blink": Spec("emotion", 3, 10, False),
    "touch_guarded": Spec("touch", 6, 10, False),
    "touch_accept": Spec("touch", 6, 10, False),
    "touch_reject": Spec("touch", 6, 10, False),
    "hug": Spec("touch", 6, 10, False),
    "sit": Spec("movement", 6, 8, True),
    "sleep": Spec("movement", 8, 6, True),
    "right_walk": Spec("movement", 8, 6, True),
    "attack_basic": Spec("battle", 6, 12, False),
    "defend": Spec("battle", 6, 10, False),
    "hit": Spec("battle", 4, 12, False),
    "idle_sick": Spec("emotion", 8, 4, True),
    "idle_angry": Spec("emotion", 6, 6, True),
    "idle_sad": Spec("emotion", 6, 5, True),
    "idle_dance": Spec("special", 8, 8, True),
    "idle_wash": Spec("special", 8, 8, True),
    "idle_wake": Spec("special", 8, 7, False),
    "idle_happy": Spec("emotion", 8, 7, True),
    "special_wake": Spec("special", 8, 7, False),
    "left_walk": Spec("movement", 8, 6, True),
    "special_left_walk": Spec("special", 8, 6, False),
    "special_angry": Spec("special", 6, 8, False),
    "idle_enjoy": Spec("emotion", 8, 7, True),
    "special_sad": Spec("special", 6, 6, False),
    "special_dance": Spec("special", 8, 8, True),
    "special_wash": Spec("special", 8, 8, False),
}


def natural_key(path: Path) -> list[int | str]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def parse_source_name(path: Path) -> tuple[str, int, int, int]:
    stem = re.sub(r"\s+\(\d+\)$", "", path.stem)
    match = re.match(r"^\d+_(?P<anim>.+?)_(?P<rows>\d+)x(?P<cols>\d+)_(?P<count>\d+)f$", stem)
    if not match:
        raise ValueError(f"Cannot parse inbox filename: {path.name}")

    animation_id = match.group("anim").replace("-", "_")
    if animation_id == "spcial_wash":
        animation_id = "special_wash"

    return animation_id, int(match.group("rows")), int(match.group("cols")), int(match.group("count"))


def source_has_alpha(image: Image.Image) -> bool:
    if image.mode in ("RGBA", "LA"):
        alpha = image.getchannel("A")
        return alpha.getextrema()[0] < 255
    if image.mode == "P" and "transparency" in image.info:
        return True
    return False


def choose_layout(image: Image.Image, rows: int, cols: int, frame_count: int) -> tuple[int, int, str]:
    expected_ratio = cols / rows
    actual_ratio = image.width / image.height
    if abs(actual_ratio - expected_ratio) <= 0.35:
        return rows, cols, "filename"

    candidates: list[tuple[float, int, int]] = []
    for candidate_rows in range(1, frame_count + 1):
        if frame_count % candidate_rows:
            continue
        candidate_cols = frame_count // candidate_rows
        ratio_delta = abs(actual_ratio - (candidate_cols / candidate_rows))
        shape_penalty = abs(candidate_rows - rows) + abs(candidate_cols - cols)
        candidates.append((ratio_delta + shape_penalty * 0.01, candidate_rows, candidate_cols))

    _, inferred_rows, inferred_cols = min(candidates, key=lambda item: item[0])
    if inferred_rows == rows and inferred_cols == cols:
        return rows, cols, "filename_non_square_cells"
    return inferred_rows, inferred_cols, "inferred_from_image_ratio"


def pad_to_grid(image: Image.Image, rows: int, cols: int) -> tuple[Image.Image, dict[str, int | bool]]:
    width, height = image.size
    cell_width = math.ceil(width / cols)
    cell_height = math.ceil(height / rows)
    padded_width = cell_width * cols
    padded_height = cell_height * rows
    if padded_width == width and padded_height == height:
        return image, {
            "padded": False,
            "padRight": 0,
            "padBottom": 0,
            "cellWidth": cell_width,
            "cellHeight": cell_height,
        }

    padded = Image.new("RGBA", (padded_width, padded_height), (0, 0, 0, 0))
    padded.alpha_composite(image.convert("RGBA"), (0, 0))
    return padded, {
        "padded": True,
        "padRight": padded_width - width,
        "padBottom": padded_height - height,
        "cellWidth": cell_width,
        "cellHeight": cell_height,
    }


def background_mask(array: np.ndarray) -> np.ndarray:
    rgb = array[..., :3].astype(np.int16)
    r = rgb[..., 0]
    g = rgb[..., 1]
    b = rgb[..., 2]
    max_channel = rgb.max(axis=2)
    min_channel = rgb.min(axis=2)
    neutral_light = (min_channel >= 232) & ((max_channel - min_channel) <= 28)
    near_white = min_channel >= 246
    pink_or_magenta = (r >= 205) & (b >= 175) & (g <= 205) & ((r - g) >= 18)
    pale_pink = (r >= 230) & (b >= 220) & (g >= 205) & ((r - g) >= 8)
    black_baked = max_channel <= 8
    return neutral_light | near_white | pink_or_magenta | pale_pink | black_baked


def connected_background_mask(mask: np.ndarray) -> np.ndarray:
    height, width = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    result = np.zeros_like(mask, dtype=bool)
    stack: list[tuple[int, int]] = []

    for x in range(width):
        if mask[0, x]:
            stack.append((x, 0))
        if mask[height - 1, x]:
            stack.append((x, height - 1))
    for y in range(height):
        if mask[y, 0]:
            stack.append((0, y))
        if mask[y, width - 1]:
            stack.append((width - 1, y))

    while stack:
        x, y = stack.pop()
        if visited[y, x] or not mask[y, x]:
            continue

        left = x
        while left - 1 >= 0 and mask[y, left - 1] and not visited[y, left - 1]:
            left -= 1
        right = x
        while right + 1 < width and mask[y, right + 1] and not visited[y, right + 1]:
            right += 1

        visited[y, left : right + 1] = True
        result[y, left : right + 1] = True

        for next_y in (y - 1, y + 1):
            if next_y < 0 or next_y >= height:
                continue
            in_run = False
            run_start = left
            for nx in range(left, right + 1):
                candidate = mask[next_y, nx] and not visited[next_y, nx]
                if candidate and not in_run:
                    in_run = True
                    run_start = nx
                elif not candidate and in_run:
                    stack.append(((run_start + nx - 1) // 2, next_y))
                    in_run = False
            if in_run:
                stack.append(((run_start + right) // 2, next_y))

    return result


def remove_connected_background(tile: Image.Image, do_background_removal: bool) -> tuple[Image.Image, dict[str, Any]]:
    image = tile.convert("RGBA")
    if not do_background_removal:
        return image, {
            "backgroundPixelsRemoved": 0,
            "fringePixelsRemoved": 0,
            "hadBackgroundOrFringe": False,
            "backgroundRemovalApplied": False,
        }

    array = np.array(image)
    initial_alpha = array[..., 3] > 0
    rgb = array[..., :3].astype(np.int16)
    max_channel = rgb.max(axis=2)
    min_channel = rgb.min(axis=2)
    connected_gray = (min_channel >= 170) & ((max_channel - min_channel) <= 18)
    removable = (background_mask(array) | connected_gray) & initial_alpha
    bg = connected_background_mask(removable)
    removed = int(bg.sum())
    array[..., 3][bg] = 0
    image = Image.fromarray(array, "RGBA")

    alpha = image.getchannel("A")
    transparent_neighbors = alpha.filter(ImageFilter.MinFilter(size=3))
    fringe_array = np.array(image)
    fringe_bg = background_mask(fringe_array)
    near_transparent = np.array(transparent_neighbors) == 0
    fringe = (fringe_array[..., 3] > 0) & near_transparent & fringe_bg
    fringe_removed = int(fringe.sum())
    fringe_array[..., 3][fringe] = 0

    return Image.fromarray(fringe_array, "RGBA"), {
        "backgroundPixelsRemoved": removed,
        "fringePixelsRemoved": fringe_removed,
        "hadBackgroundOrFringe": removed > 0 or fringe_removed > 0,
        "backgroundRemovalApplied": True,
    }


def alpha_bbox(image: Image.Image, threshold: int = 8) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= threshold else 0)
    return mask.getbbox()


def remove_tiny_components(image: Image.Image, min_pixels: int = 10) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    pixels = image.load()
    width, height = image.size
    visited: set[tuple[int, int]] = set()

    for start_y in range(height):
        for start_x in range(width):
            if (start_x, start_y) in visited or alpha.getpixel((start_x, start_y)) == 0:
                continue
            stack = [(start_x, start_y)]
            visited.add((start_x, start_y))
            component: list[tuple[int, int]] = []
            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for ny in range(max(0, y - 1), min(height, y + 2)):
                    for nx in range(max(0, x - 1), min(width, x + 2)):
                        point = (nx, ny)
                        if point in visited or alpha.getpixel(point) == 0:
                            continue
                        visited.add(point)
                        stack.append(point)

            if len(component) < min_pixels:
                for x, y in component:
                    r, g, b, _ = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)

    return image


def remove_background_like_pixels(image: Image.Image) -> Image.Image:
    array = np.array(image.convert("RGBA"))
    bg = background_mask(array) & (array[..., 3] > 0)
    low_alpha = array[..., 3] <= 24
    array[..., 3][bg | low_alpha] = 0
    return Image.fromarray(array, "RGBA")


def residual_fringe_pixels(image: Image.Image) -> int:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    transparent_neighbors = alpha.filter(ImageFilter.MinFilter(size=3))
    array = np.array(image)
    near_transparent = np.array(transparent_neighbors) == 0
    suspicious = (array[..., 3] > 0) & near_transparent & background_mask(array)
    return int(suspicious.sum())


def extract_grid_cell(image: Image.Image, row: int, col: int, rows: int, cols: int) -> Image.Image:
    cell_width = image.width // cols
    cell_height = image.height // rows
    left = col * cell_width
    top = row * cell_height
    return image.crop((left, top, left + cell_width, top + cell_height))


def normalize_frame(tile: Image.Image, shared_scale: float, do_background_removal: bool) -> tuple[Image.Image, dict[str, Any]]:
    cleaned, cleanup_report = remove_connected_background(tile, do_background_removal)
    bbox = alpha_bbox(cleaned)
    canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    if bbox is None:
        return canvas, {
            **cleanup_report,
            "empty": True,
            "sourceBbox": None,
            "normalizedBbox": None,
            "scaledSize": None,
            "paste": None,
            "clipped": False,
            "edgePixels": 0,
            "residualFringePixels": 0,
        }

    sprite = cleaned.crop(bbox)
    scaled_size = (
        max(1, int(round(sprite.width * shared_scale))),
        max(1, int(round(sprite.height * shared_scale))),
    )
    sprite = sprite.resize(scaled_size, Image.Resampling.NEAREST)
    sprite = remove_background_like_pixels(sprite)
    sprite = remove_tiny_components(sprite)

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
    if normalized_bbox:
        alpha = canvas.getchannel("A")
        for x in range(FRAME_SIZE):
            edge_pixels += alpha.getpixel((x, 0)) > 0
        for y in range(FRAME_SIZE):
            edge_pixels += alpha.getpixel((0, y)) > 0
            edge_pixels += alpha.getpixel((FRAME_SIZE - 1, y)) > 0

    return canvas, {
        **cleanup_report,
        "empty": False,
        "sourceBbox": list(bbox),
        "scaledSize": list(scaled_size),
        "paste": [paste_x, paste_y],
        "normalizedBbox": list(normalized_bbox) if normalized_bbox else None,
        "clipped": clipped,
        "edgePixels": edge_pixels,
        "residualFringePixels": residual_fringe_pixels(canvas),
    }


def content_boxes(tiles: list[Image.Image], do_background_removal: bool) -> tuple[list[tuple[int, int]], list[dict[str, Any]]]:
    sizes: list[tuple[int, int]] = []
    cleanup_reports: list[dict[str, Any]] = []
    for tile in tiles:
        cleaned, report = remove_connected_background(tile, do_background_removal)
        cleanup_reports.append(report)
        bbox = alpha_bbox(cleaned)
        if bbox:
            sizes.append((bbox[2] - bbox[0], bbox[3] - bbox[1]))
    return sizes, cleanup_reports


def build_strip(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * len(frames), FRAME_SIZE), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * FRAME_SIZE, 0))
    return sheet


def build_preview(frames: list[Image.Image]) -> Image.Image:
    scale = 3
    columns = min(4, len(frames))
    rows = math.ceil(len(frames) / columns)
    cell = FRAME_SIZE * scale
    preview = Image.new("RGBA", (columns * cell, rows * cell), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        enlarged = frame.resize((cell, cell), Image.Resampling.NEAREST)
        x = (index % columns) * cell
        y = (index // columns) * cell
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
    animation_id, source_rows, source_cols, source_count = parse_source_name(path)
    if animation_id not in SPECS:
        raise ValueError(f"Unknown animation id from {path.name}: {animation_id}")

    spec = SPECS[animation_id]
    source_image = Image.open(path)
    has_alpha = source_has_alpha(source_image)
    input_mode = source_image.mode
    do_background_removal = not has_alpha
    image = source_image.convert("RGBA")
    rows, cols, layout_source = choose_layout(image, source_rows, source_cols, source_count)
    padded_image, padding_report = pad_to_grid(image, rows, cols)

    tiles: list[Image.Image] = []
    for index in range(source_count):
        row = index // cols
        col = index % cols
        if row >= rows:
            break
        tiles.append(extract_grid_cell(padded_image, row, col, rows, cols))

    boxes, preflight_cleanup = content_boxes(tiles, do_background_removal)
    max_width = max((width for width, _ in boxes), default=1)
    max_height = max((height for _, height in boxes), default=1)
    shared_scale = min((FRAME_SIZE - 8) / max_width, (FRAME_SIZE - 4) / max_height, 1.0)

    frames: list[Image.Image] = []
    frame_reports: list[dict[str, Any]] = []
    for tile in tiles:
        frame, frame_report = normalize_frame(tile, shared_scale, do_background_removal)
        frames.append(frame)
        frame_reports.append(frame_report)

    category = spec.category
    sheet_path = CAT_ROOT / "spritesheets" / category / f"greyshade-cat_{animation_id}_128x128_{len(frames)}f.png"
    frames_dir = CAT_ROOT / "frames" / category / animation_id
    preview_path = PREVIEWS / f"greyshade-cat_{animation_id}_preview.png"

    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    frames_dir.mkdir(parents=True, exist_ok=True)
    preview_path.parent.mkdir(parents=True, exist_ok=True)

    for index, frame in enumerate(frames, start=1):
        frame.save(frames_dir / f"frame_{index:02d}.png")
    sheet = build_strip(frames)
    sheet.save(sheet_path)
    build_preview(frames).save(preview_path)

    metadata[animation_id] = {
        "id": animation_id,
        "category": category,
        "sheet": relative_asset_path(sheet_path),
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "frameCount": len(frames),
        "fps": spec.fps,
        "loop": spec.loop,
        "anchor": ANCHOR,
        "preview": relative_asset_path(preview_path),
        "framesDir": relative_asset_path(frames_dir),
    }

    bottoms = [
        item["normalizedBbox"][3]
        for item in frame_reports
        if item.get("normalizedBbox")
    ]
    clipped_frames = [index + 1 for index, item in enumerate(frame_reports) if item["clipped"]]
    empty_frames = [index + 1 for index, item in enumerate(frame_reports) if item["empty"]]
    edge_frames = [index + 1 for index, item in enumerate(frame_reports) if item["edgePixels"] > 0]
    residual_frames = [index + 1 for index, item in enumerate(frame_reports) if item["residualFringePixels"] > 0]
    had_cleanup = any(item["hadBackgroundOrFringe"] for item in frame_reports) or any(
        item["hadBackgroundOrFringe"] for item in preflight_cleanup
    )
    layout_issue = layout_source == "inferred_from_image_ratio"
    alignment_issue = bool(clipped_frames or empty_frames or (bottoms and (max(bottoms) - min(bottoms) > 1)))
    suspicious = bool(layout_issue or alignment_issue or residual_frames or edge_frames or not boxes)
    expected_sheet_size = [FRAME_SIZE * len(frames), FRAME_SIZE]
    actual_sheet_size = [sheet.width, sheet.height]

    return {
        "fileName": path.name,
        "isPng": path.suffix.lower() == ".png",
        "inputMode": input_mode,
        "hasAlpha": has_alpha,
        "backgroundType": "rgba_alpha" if has_alpha else "rgb_or_baked_background",
        "backgroundRemovalApplied": do_background_removal,
        "animationId": animation_id,
        "category": category,
        "sourceGrid": f"{source_rows}x{source_cols}",
        "usedGrid": f"{rows}x{cols}",
        "usedGridSource": layout_source,
        "gridPadding": padding_report,
        "sourceFrameCount": source_count,
        "expectedFrameCount": spec.frame_count,
        "actualFrameCount": len(frames),
        "sheet": str(sheet_path.relative_to(ROOT)).replace("\\", "/"),
        "framesDir": str(frames_dir.relative_to(ROOT)).replace("\\", "/"),
        "preview": str(preview_path.relative_to(ROOT)).replace("\\", "/"),
        "sharedScale": round(shared_scale, 6),
        "hadResidualEdgeOrBackground": had_cleanup,
        "residualEdgeFixed": had_cleanup and not residual_frames,
        "residualFringeFrames": residual_frames,
        "alignmentIssue": alignment_issue,
        "layoutIssue": layout_issue,
        "suspicious": suspicious,
        "baselineBottomRange": [min(bottoms), max(bottoms)] if bottoms else None,
        "clippedFrames": clipped_frames,
        "edgeTouchFrames": edge_frames,
        "emptyFrames": empty_frames,
        "expectedSheetSize": expected_sheet_size,
        "actualSheetSize": actual_sheet_size,
        "sheetSizeValid": expected_sheet_size == actual_sheet_size,
        "frameReports": frame_reports,
    }


def git_status_short() -> list[str]:
    try:
        completed = subprocess.run(
            ["git", "status", "--short"],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    except OSError as exc:
        return [f"git status failed: {exc}"]
    return [line for line in completed.stdout.splitlines() if line]


def main() -> None:
    files = sorted([path for path in INBOX.iterdir() if path.is_file() and path.suffix.lower() == ".png"], key=natural_key)
    metadata = load_metadata()
    processed: list[dict[str, Any]] = []

    for path in files:
        processed.append(process_one(path, metadata))

    save_metadata(metadata)
    updated_animations = [item["animationId"] for item in processed]
    report = {
        "inputCount": len(files),
        "frameWidth": FRAME_SIZE,
        "frameHeight": FRAME_SIZE,
        "runtimeSheetLayout": "horizontal_strip",
        "animationsJsonUpdated": True,
        "updatedAnimations": updated_animations,
        "processedAllExpected29": len(files) == 29 and len(updated_animations) == 29,
        "processed": processed,
        "imagesWithResidualIssues": [
            item for item in processed if item["residualFringeFrames"] or item["alignmentIssue"] or item["clippedFrames"]
        ],
        "frameCountDifferences": [
            item
            for item in processed
            if item["actualFrameCount"] != item["expectedFrameCount"]
        ],
        "layoutDifferences": [
            item
            for item in processed
            if item["usedGrid"] != item["sourceGrid"] or item["usedGridSource"] == "inferred_from_image_ratio"
        ],
        "sheetSizeValidation": [
            {
                "animationId": item["animationId"],
                "sheet": item["sheet"],
                "expected": item["expectedSheetSize"],
                "actual": item["actualSheetSize"],
                "valid": item["sheetSizeValid"],
            }
            for item in processed
        ],
        "gitStatus": git_status_short(),
    }
    METADATA.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
