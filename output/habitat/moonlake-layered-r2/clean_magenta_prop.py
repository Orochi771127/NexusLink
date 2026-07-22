#!/usr/bin/env python3
"""Deterministic staging-only chroma cleanup for Moonlake R2 props.

The creative pixels originate from image generation. Adobe supplies a solid
magenta diagnostic background. This script removes only border-connected
magenta, decontaminates antialiased edge RGB, and normalizes the visible
bottom-center anchor into a 512x512 transparent runtime candidate.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


MAGENTA = np.array([255.0, 0.0, 255.0], dtype=np.float32)


def smoothstep(value: np.ndarray) -> np.ndarray:
    value = np.clip(value, 0.0, 1.0)
    return value * value * (3.0 - 2.0 * value)


def background_connected_mask(eligible: np.ndarray, core: np.ndarray) -> np.ndarray:
    mask = Image.fromarray(np.where(eligible, 255, 0).astype(np.uint8), mode="L")
    draw = ImageDraw.Draw(mask)
    width, height = mask.size
    pixels = mask.load()

    for x in range(width):
        if pixels[x, 0] == 255:
            ImageDraw.floodfill(mask, (x, 0), 128)
        if pixels[x, height - 1] == 255:
            ImageDraw.floodfill(mask, (x, height - 1), 128)
    for y in range(height):
        if pixels[0, y] == 255:
            ImageDraw.floodfill(mask, (0, y), 128)
        if pixels[width - 1, y] == 255:
            ImageDraw.floodfill(mask, (width - 1, y), 128)

    # Adobe's subject cutout can enclose flat magenta pockets between a rope and
    # the tent canvas. Seed every coarse core-magenta pocket, not only the outer
    # canvas, so those holes become transparent without globally deleting blue
    # fabric or cyan crystal pixels that happen to be chromatically nearby.
    for y in range(0, height, 8):
        for x in range(0, width, 8):
            if core[y, x] and pixels[x, y] == 255:
                ImageDraw.floodfill(mask, (x, y), 128)

    remaining = core & (np.asarray(mask) == 255)
    for y, x in zip(*np.where(remaining)):
        if pixels[int(x), int(y)] == 255:
            ImageDraw.floodfill(mask, (int(x), int(y)), 128)

    return np.asarray(mask) == 128


def premultiplied_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.float32)
    alpha = rgba[..., 3:4] / 255.0
    premult = np.concatenate((rgba[..., :3] * alpha, rgba[..., 3:4]), axis=2)
    resized = Image.fromarray(np.clip(premult, 0, 255).astype(np.uint8), "RGBA").resize(
        size, Image.Resampling.LANCZOS
    )
    result = np.asarray(resized, dtype=np.float32).copy()
    out_alpha = result[..., 3:4]
    safe_alpha = np.maximum(out_alpha / 255.0, 1.0 / 255.0)
    result[..., :3] = np.where(out_alpha > 0, result[..., :3] / safe_alpha, 0)
    result[..., :3] = np.clip(result[..., :3], 0, 255)
    edge_pixels = out_alpha[..., 0] < 254
    edge_spill = np.maximum(
        0.0,
        np.minimum(result[..., 0], result[..., 2]) - result[..., 1],
    )
    result[..., 0][edge_pixels] -= edge_spill[edge_pixels]
    result[..., 2][edge_pixels] -= edge_spill[edge_pixels]
    result[..., :3] = np.clip(result[..., :3], 0, 255)
    result[..., 3:4] = np.where(out_alpha < 2, 0, out_alpha)
    result[..., :3] = np.where(result[..., 3:4] > 0, result[..., :3], 0)
    return Image.fromarray(result.astype(np.uint8), "RGBA")


def clean(input_path: Path, output_path: Path, report_path: Path) -> dict:
    source = np.asarray(Image.open(input_path).convert("RGB"), dtype=np.float32)
    distance = np.linalg.norm(source - MAGENTA, axis=2)

    low_distance = 90.0
    high_distance = 165.0
    connected = background_connected_mask(distance < high_distance, distance < low_distance)

    alpha = np.full(distance.shape, 255.0, dtype=np.float32)
    edge_alpha = smoothstep((distance - low_distance) / (high_distance - low_distance)) * 255.0
    alpha[connected] = edge_alpha[connected]
    alpha[alpha < 2.0] = 0.0

    alpha_unit = alpha[..., None] / 255.0
    safe_alpha = np.maximum(alpha_unit, 1.0 / 255.0)
    foreground = (source - (1.0 - alpha_unit) * MAGENTA) / safe_alpha
    foreground = np.clip(foreground, 0, 255)
    magenta_spill = np.maximum(
        0.0,
        np.minimum(foreground[..., 0], foreground[..., 2]) - foreground[..., 1],
    )
    foreground[..., 0][connected] -= magenta_spill[connected]
    foreground[..., 2][connected] -= magenta_spill[connected]
    foreground = np.clip(foreground, 0, 255)
    foreground[alpha == 0] = 0

    rgba = np.dstack((foreground, alpha)).astype(np.uint8)
    isolated = Image.fromarray(rgba, "RGBA")
    alpha_image = isolated.getchannel("A")
    bbox = alpha_image.point(lambda value: 255 if value > 4 else 0).getbbox()
    if bbox is None:
        raise ValueError(f"No foreground survived chroma cleanup: {input_path}")

    cropped = isolated.crop(bbox)
    max_extent = 452
    scale = min(max_extent / cropped.width, max_extent / cropped.height)
    target_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    resized = premultiplied_resize(cropped, target_size)

    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    visual_bottom = 488
    paste_x = (512 - target_size[0]) // 2
    paste_y = visual_bottom - target_size[1] + 1
    if paste_y < 8:
        raise ValueError(f"Normalized prop lacks top safety margin: {input_path}")
    canvas.alpha_composite(resized, (paste_x, paste_y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)

    out = np.asarray(canvas)
    out_alpha = out[..., 3]
    ys, xs = np.where(out_alpha > 8)
    if len(xs) == 0:
        raise ValueError(f"Output is empty: {output_path}")
    bounds = {
        "minX": int(xs.min()),
        "minY": int(ys.min()),
        "maxX": int(xs.max()),
        "maxY": int(ys.max()),
    }
    margins = {
        "left": bounds["minX"],
        "top": bounds["minY"],
        "right": 511 - bounds["maxX"],
        "bottom": 511 - bounds["maxY"],
    }
    edge_touch = int(
        np.count_nonzero(out_alpha[0, :] > 8)
        + np.count_nonzero(out_alpha[-1, :] > 8)
        + np.count_nonzero(out_alpha[:, 0] > 8)
        + np.count_nonzero(out_alpha[:, -1] > 8)
    )
    out_distance = np.linalg.norm(out[..., :3].astype(np.float32) - MAGENTA, axis=2)
    magenta_residue = int(np.count_nonzero((out_alpha > 8) & (out_distance < 115.0)))
    report = {
        "input": str(input_path),
        "output": str(output_path),
        "sourceSize": [int(source.shape[1]), int(source.shape[0])],
        "outputSize": [512, 512],
        "alphaBounds": bounds,
        "margins": margins,
        "edgeTouchAlphaGt8": edge_touch,
        "cornerAlpha": [
            int(out_alpha[0, 0]),
            int(out_alpha[0, -1]),
            int(out_alpha[-1, 0]),
            int(out_alpha[-1, -1]),
        ],
        "magentaResidueAlphaGt8DistanceLt115": magenta_residue,
        "visibleAnchor": {
            "x": round(((bounds["minX"] + bounds["maxX"]) / 2) / 512, 6),
            "y": round(bounds["maxY"] / 512, 6),
        },
        "chroma": {
            "lowDistance": low_distance,
            "highDistance": high_distance,
            "connectivity": "outer-border-and-enclosed-core-magenta-pockets",
            "resize": "premultiplied-lanczos",
        },
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def clean_rgba_largest(input_path: Path, output_path: Path, report_path: Path) -> dict:
    image = Image.open(input_path).convert("RGBA")
    if image.size != (512, 512):
        raise ValueError(f"RGBA component cleanup expects 512x512, got {image.size}")
    rgba = np.asarray(image).copy()
    foreground = rgba[..., 3] > 8
    visited = np.zeros(foreground.shape, dtype=bool)
    component_sizes: list[int] = []
    best_mask: np.ndarray | None = None
    best_size = 0

    height, width = foreground.shape
    for start_y, start_x in np.argwhere(foreground):
        start_y = int(start_y)
        start_x = int(start_x)
        if visited[start_y, start_x]:
            continue
        queue: deque[tuple[int, int]] = deque([(start_y, start_x)])
        visited[start_y, start_x] = True
        coordinates: list[tuple[int, int]] = []
        while queue:
            y, x = queue.popleft()
            coordinates.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < height and 0 <= nx < width and foreground[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        queue.append((ny, nx))
        size = len(coordinates)
        component_sizes.append(size)
        if size > best_size:
            best_size = size
            best_mask = np.zeros(foreground.shape, dtype=bool)
            ys, xs = zip(*coordinates)
            best_mask[np.asarray(ys), np.asarray(xs)] = True

    if best_mask is None:
        raise ValueError(f"No alpha component found: {input_path}")

    expanded = Image.fromarray((best_mask.astype(np.uint8) * 255), "L").filter(ImageFilter.MaxFilter(5))
    keep = np.asarray(expanded) > 0
    removed_pixels = int(np.count_nonzero((rgba[..., 3] > 0) & ~keep))
    rgba[..., 3] = np.where(keep, rgba[..., 3], 0)
    rgba[..., :3] = np.where(rgba[..., 3:4] > 0, rgba[..., :3], 0)
    cleaned = Image.fromarray(rgba, "RGBA")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(output_path)

    ys, xs = np.where(rgba[..., 3] > 8)
    bounds = {"minX": int(xs.min()), "minY": int(ys.min()), "maxX": int(xs.max()), "maxY": int(ys.max())}
    margins = {
        "left": bounds["minX"],
        "top": bounds["minY"],
        "right": 511 - bounds["maxX"],
        "bottom": 511 - bounds["maxY"],
    }
    report = {
        "input": str(input_path),
        "output": str(output_path),
        "sourceSize": [512, 512],
        "outputSize": [512, 512],
        "alphaBounds": bounds,
        "margins": margins,
        "componentCountAlphaGt8": len(component_sizes),
        "largestComponentPixels": best_size,
        "nextLargestComponentPixels": sorted(component_sizes, reverse=True)[1:6],
        "removedAlphaPixels": removed_pixels,
        "edgeTouchAlphaGt8": int(
            np.count_nonzero(rgba[0, :, 3] > 8)
            + np.count_nonzero(rgba[-1, :, 3] > 8)
            + np.count_nonzero(rgba[:, 0, 3] > 8)
            + np.count_nonzero(rgba[:, -1, 3] > 8)
        ),
        "cornerAlpha": [int(rgba[0, 0, 3]), int(rgba[0, -1, 3]), int(rgba[-1, 0, 3]), int(rgba[-1, -1, 3])],
        "visibleAnchor": {
            "x": round(((bounds["minX"] + bounds["maxX"]) / 2) / 512, 6),
            "y": round(bounds["maxY"] / 512, 6),
        },
        "cleanup": "largest-alpha-component-plus-two-pixel-antialias-halo",
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def label_mask_components(mask: np.ndarray) -> list[list[tuple[int, int]]]:
    visited = np.zeros(mask.shape, dtype=bool)
    height, width = mask.shape
    components: list[list[tuple[int, int]]] = []
    for start_y, start_x in np.argwhere(mask):
        start_y = int(start_y)
        start_x = int(start_x)
        if visited[start_y, start_x]:
            continue
        queue: deque[tuple[int, int]] = deque([(start_y, start_x)])
        visited[start_y, start_x] = True
        coordinates: list[tuple[int, int]] = []
        while queue:
            y, x = queue.popleft()
            coordinates.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        queue.append((ny, nx))
        components.append(coordinates)
    return components


def clean_rgba_streaks(input_path: Path, output_path: Path, report_path: Path) -> dict:
    image = Image.open(input_path).convert("RGBA")
    if image.size != (512, 512):
        raise ValueError(f"RGBA streak cleanup expects 512x512, got {image.size}")
    rgba = np.asarray(image).copy()
    rgb = rgba[..., :3].astype(np.int16)
    alpha = rgba[..., 3]
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    brightness = rgb.mean(axis=2)
    neutral = (alpha > 0) & (chroma < 16) & (brightness > 150)
    components = label_mask_components(neutral)
    remove_mask = np.zeros(neutral.shape, dtype=bool)
    flagged: list[dict] = []
    for coordinates in components:
        ys, xs = zip(*coordinates)
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        width = max_x - min_x + 1
        height = max_y - min_y + 1
        aspect = width / max(1, height)
        is_streak = (width >= 24 and height <= 6 and aspect >= 4) or (width >= 60 and height <= 12 and aspect >= 6)
        if is_streak:
            ys_array = np.asarray(ys)
            xs_array = np.asarray(xs)
            remove_mask[ys_array, xs_array] = True
            flagged.append({
                "pixels": len(coordinates),
                "bounds": [min_x, min_y, max_x, max_y],
                "width": width,
                "height": height,
                "aspect": round(aspect, 3),
            })

    expanded = np.asarray(
        Image.fromarray((remove_mask.astype(np.uint8) * 255), "L").filter(ImageFilter.MaxFilter(3))
    ) > 0
    remove_mask = expanded & (alpha > 0) & (chroma < 30) & (brightness > 125)
    removed_pixels = int(np.count_nonzero(remove_mask))
    rgba[..., 3] = np.where(remove_mask, 0, alpha)
    rgba[..., :3] = np.where(rgba[..., 3:4] > 0, rgba[..., :3], 0)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(output_path)

    ys, xs = np.where(rgba[..., 3] > 8)
    bounds = {"minX": int(xs.min()), "minY": int(ys.min()), "maxX": int(xs.max()), "maxY": int(ys.max())}
    report = {
        "input": str(input_path),
        "output": str(output_path),
        "sourceSize": [512, 512],
        "outputSize": [512, 512],
        "alphaBounds": bounds,
        "margins": {"left": bounds["minX"], "top": bounds["minY"], "right": 511 - bounds["maxX"], "bottom": 511 - bounds["maxY"]},
        "neutralComponentCount": len(components),
        "flaggedStreakCount": len(flagged),
        "flaggedStreaks": sorted(flagged, key=lambda item: item["pixels"], reverse=True)[:40],
        "removedAlphaPixels": removed_pixels,
        "edgeTouchAlphaGt8": int(
            np.count_nonzero(rgba[0, :, 3] > 8)
            + np.count_nonzero(rgba[-1, :, 3] > 8)
            + np.count_nonzero(rgba[:, 0, 3] > 8)
            + np.count_nonzero(rgba[:, -1, 3] > 8)
        ),
        "cornerAlpha": [int(rgba[0, 0, 3]), int(rgba[0, -1, 3]), int(rgba[-1, 0, 3]), int(rgba[-1, -1, 3])],
        "visibleAnchor": {
            "x": round(((bounds["minX"] + bounds["maxX"]) / 2) / 512, 6),
            "y": round(bounds["maxY"] / 512, 6),
        },
        "cleanup": "axis-aligned-neutral-streak-components-only",
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--key-mode", choices=("magenta", "rgba-largest", "rgba-streaks"), default="magenta")
    args = parser.parse_args()
    operations = {
        "magenta": clean,
        "rgba-largest": clean_rgba_largest,
        "rgba-streaks": clean_rgba_streaks,
    }
    operation = operations[args.key_mode]
    print(json.dumps(operation(args.input, args.output, args.report), indent=2))


if __name__ == "__main__":
    main()
