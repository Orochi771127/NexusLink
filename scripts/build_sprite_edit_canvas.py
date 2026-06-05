#!/usr/bin/env python
"""Build a repeated seed-frame edit canvas for sprite inpainting passes."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Repeat a seed sprite into fixed slots on a transparent or magenta edit canvas."
    )
    parser.add_argument("--seed", required=True, help="Seed PNG to repeat into each slot.")
    parser.add_argument("--out", required=True, help="Output edit-canvas PNG.")
    parser.add_argument("--frames", type=int, required=True, help="Number of frame slots to fill.")
    parser.add_argument("--slot-size", type=int, required=True, help="Square slot size in pixels.")
    parser.add_argument(
        "--canvas-size",
        type=int,
        required=True,
        help="Canvas width in pixels. Columns are canvas-size / slot-size.",
    )
    parser.add_argument(
        "--background",
        default="#FF00FF",
        help="Canvas background as #RRGGBB or 'transparent'. Defaults to magenta.",
    )
    return parser.parse_args()


def parse_background(value: str) -> tuple[int, int, int, int]:
    if value.lower() == "transparent":
        return (0, 0, 0, 0)
    if len(value) == 7 and value.startswith("#"):
        return (
            int(value[1:3], 16),
            int(value[3:5], 16),
            int(value[5:7], 16),
            255,
        )
    raise SystemExit("--background must be #RRGGBB or transparent.")


def fit_seed(seed: Image.Image, slot_size: int) -> Image.Image:
    seed = seed.convert("RGBA")
    alpha_bbox = seed.getchannel("A").getbbox()
    if alpha_bbox:
        seed = seed.crop(alpha_bbox)
    scale = min(slot_size / seed.width, slot_size / seed.height, 1.0)
    size = (max(1, round(seed.width * scale)), max(1, round(seed.height * scale)))
    return seed.resize(size, Image.Resampling.NEAREST)


def main() -> None:
    args = parse_args()
    if args.frames <= 0 or args.slot_size <= 0 or args.canvas_size <= 0:
        raise SystemExit("--frames, --slot-size, and --canvas-size must be positive.")
    if args.canvas_size % args.slot_size != 0:
        raise SystemExit("--canvas-size must be divisible by --slot-size.")

    columns = args.canvas_size // args.slot_size
    rows = math.ceil(args.frames / columns)
    canvas_height = rows * args.slot_size

    seed = fit_seed(Image.open(args.seed), args.slot_size)
    canvas = Image.new("RGBA", (args.canvas_size, canvas_height), parse_background(args.background))

    for index in range(args.frames):
        col = index % columns
        row = index // columns
        x = col * args.slot_size + (args.slot_size - seed.width) // 2
        y = row * args.slot_size + (args.slot_size - seed.height)
        canvas.alpha_composite(seed, (x, y))

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out)
    print(f"Wrote {out} ({args.canvas_size}x{canvas_height}, {columns}x{rows})")


if __name__ == "__main__":
    main()
