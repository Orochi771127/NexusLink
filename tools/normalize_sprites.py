#!/usr/bin/env python
"""Normalize transparent PNG sprite frames to a fixed bottom-center anchor.

Install before use:
    pip install pillow

Example:
    python tools/normalize_sprites.py --input ./raw_frames --output ./processing/normalized --canvas_size 128
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Extract visible sprite bounds from PNG frames, align every frame to "
            "a fixed bottom-center anchor, and emit normalized frames plus a strip."
        )
    )
    parser.add_argument("--input", required=True, help="Directory containing raw PNG frames.")
    parser.add_argument(
        "--output",
        default="processing/normalized",
        help="Directory for normalized frame PNGs and generated metadata.",
    )
    parser.add_argument(
        "--canvas_size",
        type=int,
        default=128,
        help="Square output canvas size in pixels. Example: 128 creates 128x128 frames.",
    )
    parser.add_argument(
        "--animation_name",
        help="Animation id and strip prefix. Defaults to the input directory name.",
    )
    parser.add_argument(
        "--alpha_threshold",
        type=int,
        default=1,
        help="Pixels with alpha below this value are treated as transparent.",
    )
    parser.add_argument(
        "--frame_prefix",
        help="Optional normalized frame filename prefix. Defaults to animation_name.",
    )
    parser.add_argument(
        "--json",
        default="animations.json",
        help="Metadata filename written inside --output.",
    )
    parser.add_argument(
        "--report",
        default="normalization_report.json",
        help="QC report filename written inside --output.",
    )
    return parser.parse_args()


def natural_key(path: Path) -> list[int | str]:
    parts = re.split(r"(\d+)", path.stem.lower())
    return [int(part) if part.isdigit() else part for part in parts]


def png_frames(input_dir: Path) -> list[Path]:
    return sorted(
        [path for path in input_dir.iterdir() if path.is_file() and path.suffix.lower() == ".png"],
        key=natural_key,
    )


def alpha_bbox(image: Image.Image, threshold: int) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A")
    if threshold <= 1:
        return alpha.getbbox()

    mask = alpha.point(lambda value: 255 if value >= threshold else 0)
    return mask.getbbox()


def clip_box(
    paste_x: int,
    paste_y: int,
    width: int,
    height: int,
    canvas_size: int,
) -> tuple[tuple[int, int, int, int], tuple[int, int], bool] | None:
    src_left = max(0, -paste_x)
    src_top = max(0, -paste_y)
    src_right = min(width, canvas_size - paste_x)
    src_bottom = min(height, canvas_size - paste_y)

    if src_left >= src_right or src_top >= src_bottom:
        return None

    dst = (max(0, paste_x), max(0, paste_y))
    was_clipped = src_left > 0 or src_top > 0 or src_right < width or src_bottom < height
    return (src_left, src_top, src_right, src_bottom), dst, was_clipped


def normalize_frame(
    frame_path: Path,
    output_path: Path,
    canvas_size: int,
    alpha_threshold: int,
) -> tuple[Image.Image, dict[str, Any]]:
    image = Image.open(frame_path).convert("RGBA")
    bbox = alpha_bbox(image, alpha_threshold)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    if bbox is None:
        canvas.save(output_path)
        return canvas, {
            "source": str(frame_path),
            "output": str(output_path),
            "sourceSize": [image.width, image.height],
            "bbox": None,
            "anchorSource": None,
            "paste": None,
            "clipped": False,
            "empty": True,
        }

    left, top, right, bottom = bbox
    bbox_width = right - left
    bbox_height = bottom - top
    anchor_x = canvas_size / 2
    anchor_y = canvas_size
    source_anchor_x = (left + right) / 2
    source_anchor_y = bottom

    sprite = image.crop(bbox)
    paste_x = int(round(anchor_x - (bbox_width / 2)))
    paste_y = int(round(anchor_y - bbox_height))
    clipped = clip_box(paste_x, paste_y, bbox_width, bbox_height, canvas_size)

    if clipped is not None:
        src_box, dst, was_clipped = clipped
        canvas.alpha_composite(sprite.crop(src_box), dst)
    else:
        was_clipped = True

    canvas.save(output_path)
    normalized_bbox = alpha_bbox(canvas, alpha_threshold)
    return canvas, {
        "source": str(frame_path),
        "output": str(output_path),
        "sourceSize": [image.width, image.height],
        "bbox": [left, top, right, bottom],
        "contentSize": [bbox_width, bbox_height],
        "anchorSource": [source_anchor_x, source_anchor_y],
        "anchorTarget": [anchor_x, anchor_y],
        "paste": [paste_x, paste_y],
        "normalizedBbox": list(normalized_bbox) if normalized_bbox else None,
        "clipped": was_clipped,
        "empty": False,
    }


def build_strip(frames: list[Image.Image], output_path: Path) -> None:
    if not frames:
        raise ValueError("Cannot build a sprite strip without frames.")

    frame_width, frame_height = frames[0].size
    strip = Image.new("RGBA", (frame_width * len(frames), frame_height), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * frame_width, 0))
    strip.save(output_path)


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input)
    output_dir = Path(args.output)

    if not input_dir.is_dir():
        raise SystemExit(f"Input directory does not exist: {input_dir}")
    if args.canvas_size <= 0:
        raise SystemExit("--canvas_size must be greater than 0.")
    if not 0 <= args.alpha_threshold <= 255:
        raise SystemExit("--alpha_threshold must be between 0 and 255.")

    frame_paths = png_frames(input_dir)
    if not frame_paths:
        raise SystemExit(f"No PNG frames found in: {input_dir}")

    animation_name = args.animation_name or input_dir.name
    frame_prefix = args.frame_prefix or animation_name
    output_dir.mkdir(parents=True, exist_ok=True)

    normalized_frames: list[Image.Image] = []
    frame_reports: list[dict[str, Any]] = []
    padding = max(2, len(str(len(frame_paths))))

    for index, frame_path in enumerate(frame_paths, start=1):
        output_path = output_dir / f"{frame_prefix}_{index:0{padding}d}.png"
        frame, report = normalize_frame(
            frame_path=frame_path,
            output_path=output_path,
            canvas_size=args.canvas_size,
            alpha_threshold=args.alpha_threshold,
        )
        normalized_frames.append(frame)
        frame_reports.append(report)

    strip_path = output_dir / f"{animation_name}_strip.png"
    build_strip(normalized_frames, strip_path)

    animation_block = {
        animation_name: {
            "id": animation_name,
            "sheet": str(strip_path),
            "frameWidth": args.canvas_size,
            "frameHeight": args.canvas_size,
            "frameCount": len(normalized_frames),
        }
    }
    report = {
        "animation": animation_name,
        "input": str(input_dir),
        "output": str(output_dir),
        "strip": str(strip_path),
        "frameWidth": args.canvas_size,
        "frameHeight": args.canvas_size,
        "frameCount": len(normalized_frames),
        "alphaThreshold": args.alpha_threshold,
        "anchor": {"x": args.canvas_size / 2, "y": args.canvas_size, "mode": "bottom-center"},
        "clippedFrames": [
            index + 1 for index, frame_report in enumerate(frame_reports) if frame_report["clipped"]
        ],
        "emptyFrames": [
            index + 1 for index, frame_report in enumerate(frame_reports) if frame_report["empty"]
        ],
        "frames": frame_reports,
    }

    json_path = output_dir / args.json
    report_path = output_dir / args.report
    json_path.write_text(json.dumps(animation_block, indent=2) + "\n", encoding="utf-8")
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(animation_block, indent=2))
    if report["clippedFrames"]:
        print(f"Warning: clipped frames detected: {report['clippedFrames']}")


if __name__ == "__main__":
    main()
