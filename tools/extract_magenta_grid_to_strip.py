#!/usr/bin/env python
"""Extract a magenta-background animation grid into a transparent strip."""

from __future__ import annotations

import argparse
import json
import statistics
from collections import deque
from pathlib import Path

from PIL import Image

from cleanup_magenta_spill import decontaminate_magenta_image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a raw magenta grid into a transparent horizontal strip."
    )
    parser.add_argument("--input", required=True, help="Raw magenta grid PNG.")
    parser.add_argument("--output", required=True, help="Transparent horizontal strip PNG.")
    parser.add_argument("--rows", required=True, type=int)
    parser.add_argument("--cols", required=True, type=int)
    parser.add_argument("--report", required=True, help="QC JSON output path.")
    parser.add_argument("--strictness", type=float, default=0.92)
    parser.add_argument("--edge-softness", type=float, default=0.18)
    parser.add_argument("--decontam-strength", type=float, default=1.0)
    return parser.parse_args()


def is_gridline(r: int, g: int, b: int) -> bool:
    return r > 235 and g > 220 and b > 235


def remove_gridline_contamination(slot: Image.Image) -> Image.Image:
    slot = slot.copy()
    pixels = slot.load()
    width, height = slot.size
    queue: deque[tuple[int, int]] = deque()
    seen = [[False] * width for _ in range(height)]

    def enqueue(x: int, y: int) -> None:
        if seen[y][x]:
            return
        r, g, b, a = pixels[x, y]
        if a == 0 or is_gridline(r, g, b):
            seen[y][x] = True
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    return slot


def clean_slot(slot: Image.Image, args: argparse.Namespace) -> Image.Image:
    clean, _report = decontaminate_magenta_image(
        slot,
        strictness=args.strictness,
        edge_softness=args.edge_softness,
        decontam_strength=args.decontam_strength,
    )
    return remove_gridline_contamination(clean)


def keep_largest_component(slot: Image.Image) -> Image.Image:
    pixels = slot.load()
    width, height = slot.size
    mask = [[pixels[x, y][3] > 8 for x in range(width)] for y in range(height)]
    seen = [[False] * width for _ in range(height)]
    components: list[list[tuple[int, int]]] = []

    for y in range(height):
        for x in range(width):
            if not mask[y][x] or seen[y][x]:
                continue
            queue: deque[tuple[int, int]] = deque([(x, y)])
            seen[y][x] = True
            points: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                points.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if 0 <= nx < width and 0 <= ny < height and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        queue.append((nx, ny))
            components.append(points)

    if len(components) <= 1:
        return slot

    components.sort(key=len, reverse=True)
    keep = set(components[0])
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] > 0 and (x, y) not in keep:
                pixels[x, y] = (0, 0, 0, 0)
    return slot


def main() -> None:
    args = parse_args()
    raw = Path(args.input)
    out = Path(args.output)
    image = Image.open(raw).convert("RGBA")
    cell_w = image.width / args.cols
    cell_h = image.height / args.rows
    frames: list[Image.Image] = []
    bboxes: list[tuple[int, int, int, int] | None] = []
    edge_touches: list[bool] = []

    for row in range(args.rows):
        for col in range(args.cols):
            left = int(round(col * cell_w))
            upper = int(round(row * cell_h))
            right = int(round((col + 1) * cell_w))
            lower = int(round((row + 1) * cell_h))
            slot = image.crop((left, upper, right, lower))
            slot = keep_largest_component(clean_slot(slot, args))
            bbox = slot.getchannel("A").getbbox()
            bboxes.append(bbox)
            if bbox:
                edge_touches.append(
                    bbox[0] <= 1 or bbox[1] <= 1 or bbox[2] >= slot.width - 1 or bbox[3] >= slot.height - 1
                )
            else:
                edge_touches.append(True)
            frames.append(slot)

    strip = Image.new("RGBA", (frames[0].width * len(frames), frames[0].height), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * frame.width, 0))
    out.parent.mkdir(parents=True, exist_ok=True)
    strip.save(out)

    widths = [bbox[2] - bbox[0] for bbox in bboxes if bbox]
    heights = [bbox[3] - bbox[1] for bbox in bboxes if bbox]
    report = {
        "raw_grid": str(raw),
        "raw_grid_size": image.size,
        "layout": {"columns": args.cols, "rows": args.rows, "frames": len(frames)},
        "temp_transparent_strip": str(out),
        "temp_strip_size": strip.size,
        "content_widths": widths,
        "content_heights": heights,
        "width_range": [min(widths), max(widths)] if widths else None,
        "height_range": [min(heights), max(heights)] if heights else None,
        "height_drift_ratio": (max(heights) - min(heights)) / statistics.mean(heights) if heights else None,
        "edge_touch_frames": [i + 1 for i, touched in enumerate(edge_touches) if touched],
        "magenta_cleanup": {
            "strictness": args.strictness,
            "edge_softness": args.edge_softness,
            "decontam_strength": args.decontam_strength,
        },
    }
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
