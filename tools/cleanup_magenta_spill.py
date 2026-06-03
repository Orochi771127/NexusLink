#!/usr/bin/env python
"""Remove magenta key pixels and edge spill from transparent sprite PNGs."""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

from PIL import Image


MAGENTA = (255, 0, 255)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Clean exact/near-magenta key pixels and magenta edge spill."
    )
    parser.add_argument("paths", nargs="+", help="PNG files or directories to clean.")
    parser.add_argument(
        "--report",
        help="Optional JSON report path with before/after magenta-like counts.",
    )
    return parser.parse_args()


def png_paths(paths: list[str]) -> list[Path]:
    results: list[Path] = []
    for raw_path in paths:
        path = Path(raw_path)
        if path.is_dir():
            results.extend(sorted(path.glob("*.png")))
        elif path.suffix.lower() == ".png":
            results.append(path)
    return results


def color_distance_to_magenta(r: int, g: int, b: int) -> float:
    return ((r - MAGENTA[0]) ** 2 + (g - MAGENTA[1]) ** 2 + (b - MAGENTA[2]) ** 2) ** 0.5


def is_near_magenta(r: int, g: int, b: int) -> bool:
    high_rb_low_g = r > 180 and b > 180 and g < 120
    close_to_key = color_distance_to_magenta(r, g, b) < 135
    return high_rb_low_g or close_to_key


def is_pink_spill(r: int, g: int, b: int) -> bool:
    if g >= 150 or r <= 130 or b <= 130:
        return False
    magenta_bias = min(r, b) - g
    rb_balance = abs(r - b)
    return magenta_bias > 45 and rb_balance < 95


def visible_magenta_like_count(image: Image.Image) -> int:
    image = image.convert("RGBA")
    mask = alpha_mask(image)
    count = 0
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a > 0 and is_near_magenta(r, g, b) and transparent_adjacent(mask, x, y, radius=2):
                count += 1
    return count


def alpha_mask(image: Image.Image) -> list[list[bool]]:
    width, height = image.size
    alpha = image.getchannel("A")
    return [[alpha.getpixel((x, y)) > 0 for x in range(width)] for y in range(height)]


def transparent_adjacent(mask: list[list[bool]], x: int, y: int, radius: int = 2) -> bool:
    height = len(mask)
    width = len(mask[0])
    for ny in range(max(0, y - radius), min(height, y + radius + 1)):
        for nx in range(max(0, x - radius), min(width, x + radius + 1)):
            if not mask[ny][nx]:
                return True
    return False


def keep_largest_component(image: Image.Image) -> Image.Image:
    width, height = image.size
    mask = alpha_mask(image)
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
        return image

    components.sort(key=len, reverse=True)
    keep = set(components[0])
    cleaned = image.copy()
    pixels = cleaned.load()
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] > 0 and (x, y) not in keep:
                pixels[x, y] = (0, 0, 0, 0)
    return cleaned


def decontaminate_border_pixel(r: int, g: int, b: int, a: int) -> tuple[int, int, int, int]:
    neutral = int(round((r + g + b) / 3))
    red = min(r, max(g + 35, neutral + 35))
    blue = min(b, max(g + 35, neutral + 35))
    return red, g, blue, a


def clean_image(path: Path) -> dict[str, object]:
    image = Image.open(path).convert("RGBA")
    before = visible_magenta_like_count(image)
    pixels = image.load()
    width, height = image.size
    mask = alpha_mask(image)

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            is_exact_or_close_key = color_distance_to_magenta(r, g, b) < 70
            is_border_near_key = is_near_magenta(r, g, b) and transparent_adjacent(mask, x, y, radius=2)
            if is_exact_or_close_key or is_border_near_key:
                pixels[x, y] = (0, 0, 0, 0)

    image = keep_largest_component(image)
    pixels = image.load()
    mask = alpha_mask(image)

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if not transparent_adjacent(mask, x, y, radius=2):
                continue
            if is_pink_spill(r, g, b):
                if a < 220 or color_distance_to_magenta(r, g, b) < 170:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    pixels[x, y] = decontaminate_border_pixel(r, g, b, a)

    image = keep_largest_component(image)
    after = visible_magenta_like_count(image)
    image.save(path)
    return {
        "path": str(path),
        "size": image.size,
        "before": before,
        "after": after,
        "alpha_extrema": image.getchannel("A").getextrema(),
    }


def main() -> None:
    args = parse_args()
    files = png_paths(args.paths)
    if not files:
        raise SystemExit("No PNG files found.")

    report = [clean_image(path) for path in files]
    print(json.dumps(report, indent=2))
    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
