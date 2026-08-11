#!/usr/bin/env python3
"""Build walk/attack/hit contact sheets for strict Blazetail R3 visual QA."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


DIRECTIONS = (
    ("north", "N"), ("northeast", "NE"), ("east", "E"), ("southeast", "SE"),
    ("south", "S"), ("southwest", "SW"), ("west", "W"), ("northwest", "NW"),
)


def font(size: int, bold: bool = False):
    for name in (("arialbd.ttf", "segoeuib.ttf") if bold else ("arial.ttf", "segoeui.ttf")):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def checker(width: int, height: int) -> Image.Image:
    image = Image.new("RGBA", (width, height), (25, 42, 45, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, height, 18):
        for x in range(0, width, 18):
            if (x // 18 + y // 18) % 2:
                draw.rectangle((x, y, x + 18, y + 18), fill=(39, 57, 60, 255))
    return image


def build(root: Path, action: str, frame_count: int, output: Path) -> None:
    canvas = Image.new("RGB", (1800, 2100), (8, 24, 29))
    draw = ImageDraw.Draw(canvas)
    draw.text((58, 38), f"Blazetail Kit R3 — {action} — strict runtime review", font=font(38, True), fill=(255, 224, 157))
    draw.text((58, 92), "8 directions | transparent master-512 | bottom-center | exactly one flame tail", font=font(22), fill=(177, 222, 214))
    stem_action = "walk" if action == "walk" else action
    filename_width = 512 * frame_count
    y = 140
    for direction, label in DIRECTIONS:
        filename = f"blazetail-{stem_action}-{direction}-master-{filename_width}x512-{frame_count}f.png"
        source = Image.open(root / filename).convert("RGBA")
        viewport = checker(1640, 180)
        preview = source.copy()
        preview.thumbnail((1580, 158), Image.Resampling.LANCZOS)
        viewport.alpha_composite(preview, ((viewport.width - preview.width) // 2, (viewport.height - preview.height) // 2))
        draw.rounded_rectangle((48, y, 1752, y + 202), radius=18, fill=(16, 37, 42), outline=(100, 166, 155), width=2)
        draw.text((66, y + 12), label, font=font(24, True), fill=(255, 224, 157))
        canvas.paste(viewport.convert("RGB"), (100, y + 12))
        y += 216
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=95)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset-root", required=True)
    parser.add_argument("--output-dir", required=True)
    args = parser.parse_args()
    root = Path(args.asset_root) / "master-512"
    output = Path(args.output_dir)
    build(root, "walk", 8, output / "blazetail-r3-walk-review.jpg")
    build(root, "attack", 6, output / "blazetail-r3-attack-review.jpg")
    build(root, "hit", 4, output / "blazetail-r3-hit-review.jpg")
    print(output)


if __name__ == "__main__":
    main()
