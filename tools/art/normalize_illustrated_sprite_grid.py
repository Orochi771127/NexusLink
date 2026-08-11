"""Normalize an illustrated sprite grid into 512 frames and one runtime strip.

This complements the installed Sprite Pipeline for high-resolution illustrated
assets when the generator's landscape output cannot fit eight 512-grade frames
in a single row. One shared scale and one bottom-center anchor are mandatory.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--sheet-out", required=True)
    parser.add_argument("--report-out", required=True)
    parser.add_argument("--cols", type=int, default=4)
    parser.add_argument("--rows", type=int, default=2)
    parser.add_argument("--frames", type=int, default=8)
    parser.add_argument("--frame-size", type=int, default=512)
    parser.add_argument("--alpha-threshold", type=int, default=8)
    parser.add_argument("--bottom-margin", type=int, default=18)
    parser.add_argument("--occupancy", type=float, default=0.9)
    parser.add_argument(
        "--keep-largest-alpha-component",
        action="store_true",
        help="For body-only sprites, remove detached chroma-key specks before normalization.",
    )
    return parser.parse_args()


def alpha_bbox(image: Image.Image, threshold: int):
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > threshold else 0)
    return mask.getbbox()


def keep_largest_alpha_component(image: Image.Image, threshold: int) -> tuple[Image.Image, int]:
    """Keep one 4-connected body silhouette while preserving its soft alpha."""
    alpha = image.getchannel("A")
    width, height = alpha.size
    values = bytes(alpha.get_flattened_data())
    visited = bytearray(width * height)
    largest: list[int] = []
    opaque_before = 0

    for start, value in enumerate(values):
        if value <= threshold:
            continue
        opaque_before += 1
        if visited[start]:
            continue
        visited[start] = 1
        stack = [start]
        component: list[int] = []
        while stack:
            current = stack.pop()
            component.append(current)
            x = current % width
            for neighbor in (
                current - 1 if x > 0 else -1,
                current + 1 if x + 1 < width else -1,
                current - width if current >= width else -1,
                current + width if current + width < width * height else -1,
            ):
                if neighbor >= 0 and not visited[neighbor] and values[neighbor] > threshold:
                    visited[neighbor] = 1
                    stack.append(neighbor)
        if len(component) > len(largest):
            largest = component

    keep = bytearray(width * height)
    for index in largest:
        keep[index] = values[index]
    cleaned = image.copy()
    cleaned.putalpha(Image.frombytes("L", (width, height), bytes(keep)))
    return cleaned, max(0, opaque_before - len(largest))


def main() -> None:
    args = parse_args()
    source_path = Path(args.input)
    out_dir = Path(args.out_dir)
    sheet_path = Path(args.sheet_out)
    report_path = Path(args.report_out)
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    source = Image.open(source_path).convert("RGBA")
    cell_width = source.width // args.cols
    cell_height = source.height // args.rows
    if args.frames > args.cols * args.rows:
        raise SystemExit("frames exceed grid capacity")

    cells = []
    source_boxes = []
    removed_component_pixels = []
    for index in range(args.frames):
        col = index % args.cols
        row = index // args.cols
        crop_box = (
            col * cell_width,
            row * cell_height,
            (col + 1) * cell_width if col < args.cols - 1 else source.width,
            (row + 1) * cell_height if row < args.rows - 1 else source.height,
        )
        cell = source.crop(crop_box)
        removed = 0
        if args.keep_largest_alpha_component:
            cell, removed = keep_largest_alpha_component(cell, args.alpha_threshold)
        bbox = alpha_bbox(cell, args.alpha_threshold)
        if bbox is None:
            raise SystemExit(f"frame {index + 1} has no opaque content")
        cells.append(cell)
        source_boxes.append(bbox)
        removed_component_pixels.append(removed)

    max_width = max(box[2] - box[0] for box in source_boxes)
    max_height = max(box[3] - box[1] for box in source_boxes)
    available_width = args.frame_size * args.occupancy
    available_height = args.frame_size - args.bottom_margin - 8
    shared_scale = min(available_width / max_width, available_height / max_height)

    normalized = []
    frame_reports = []
    for index, (cell, bbox) in enumerate(zip(cells, source_boxes, strict=True)):
        sprite = cell.crop(bbox)
        target_width = max(1, round(sprite.width * shared_scale))
        target_height = max(1, round(sprite.height * shared_scale))
        sprite = sprite.resize((target_width, target_height), Image.Resampling.LANCZOS)
        post_resize_removed = 0
        if args.keep_largest_alpha_component:
            sprite, post_resize_removed = keep_largest_alpha_component(
                sprite,
                args.alpha_threshold,
            )
        frame = Image.new("RGBA", (args.frame_size, args.frame_size), (0, 0, 0, 0))
        x = round((args.frame_size - target_width) / 2)
        y = args.frame_size - args.bottom_margin - target_height
        frame.alpha_composite(sprite, (x, y))
        frame_path = out_dir / f"frame-{index + 1:02d}.png"
        frame.save(frame_path)
        normalized.append(frame)
        frame_reports.append(
            {
                "frame": index + 1,
                "sourceCell": {
                    "col": index % args.cols,
                    "row": index // args.cols,
                    "bbox": list(bbox),
                },
                "normalizedSize": [target_width, target_height],
                "removedDetachedOpaquePixels": removed_component_pixels[index],
                "removedPostResizeOpaquePixels": post_resize_removed,
                "anchor": {"x": 0.5, "y": 1.0, "bottomMargin": args.bottom_margin},
                "output": str(frame_path).replace("\\", "/"),
            }
        )

    sheet = Image.new(
        "RGBA",
        (args.frame_size * args.frames, args.frame_size),
        (0, 0, 0, 0),
    )
    for index, frame in enumerate(normalized):
        sheet.alpha_composite(frame, (index * args.frame_size, 0))
    sheet.save(sheet_path)

    corner_alpha = [
        source.getpixel((0, 0))[3],
        source.getpixel((source.width - 1, 0))[3],
        source.getpixel((0, source.height - 1))[3],
        source.getpixel((source.width - 1, source.height - 1))[3],
    ]
    report = {
        "schemaVersion": 1,
        "source": str(source_path).replace("\\", "/"),
        "sourceSize": [source.width, source.height],
        "grid": {"cols": args.cols, "rows": args.rows, "frames": args.frames},
        "frameSize": args.frame_size,
        "sheetSize": [sheet.width, sheet.height],
        "sharedScale": shared_scale,
        "bottomCenterAnchor": {"x": 0.5, "y": 1.0},
        "keptLargestAlphaComponent": args.keep_largest_alpha_component,
        "cornerAlpha": corner_alpha,
        "transparentCorners": all(value == 0 for value in corner_alpha),
        "frameReports": frame_reports,
        "artStatus": "candidate-awaiting-human",
    }
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
