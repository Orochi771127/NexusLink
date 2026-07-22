#!/usr/bin/env python3
"""Render deterministic Moonlake R2 placement previews from candidate data."""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ASSET_FILES = {
    "tent_near_left": "tent_near_left_base.png",
    "tent_near_right": "tent_near_right_base.png",
    "tent_mid_left": "tent_mid_left_base.png",
    "tent_mid_right": "tent_mid_right_base.png",
    "tent_far": "tent_far_base.png",
    "beacon_main": "beacon_main_base.png",
    "beacon_far": "beacon_far_base.png",
    "crescent_shrine": "crescent_shrine_base.png",
}

EMISSIVE_FILES = {key: value.replace("_base.png", "_emissive.png") for key, value in ASSET_FILES.items()}


def art_anchor(slot: dict, grid: dict) -> tuple[float, float]:
    column = slot["cell"]["column"]
    row = slot["cell"]["row"]
    return (
        (column + 0.5) * grid["cellWidth"] + slot["offsetPx"]["x"],
        (row + 0.5) * grid["cellHeight"] + slot["offsetPx"]["y"],
    )


def radial_light(size: tuple[int, int], center: tuple[float, float], radius: float, color: str, intensity: float) -> Image.Image:
    width, height = size
    y, x = np.mgrid[0:height, 0:width]
    distance = np.sqrt((x - center[0]) ** 2 + (y - center[1]) ** 2) / radius
    falloff = np.clip(1.0 - distance, 0.0, 1.0) ** 2
    alpha = (falloff * min(1.0, intensity) * 118).astype(np.uint8)
    rgb = tuple(int(color[index:index + 2], 16) for index in (1, 3, 5))
    rgba = np.zeros((height, width, 4), dtype=np.uint8)
    rgba[..., :3] = np.where(alpha[..., None] > 0, np.array(rgb, dtype=np.uint8), 0)
    rgba[..., 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def apply_weather(canvas: Image.Image, weather: str, phase: str) -> Image.Image:
    if weather == "clear":
        return canvas
    if weather == "rain":
        tint = Image.new("RGBA", canvas.size, (21, 67, 104, 22 if phase == "day" else 16))
        canvas = Image.alpha_composite(canvas, tint)
        rain = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(rain)
        rng = random.Random(20260715)
        for _ in range(210):
            x = rng.randint(-80, canvas.width + 80)
            y = rng.randint(170, 1540)
            length = rng.randint(18, 38)
            draw.line((x, y, x - 7, y + length), fill=(176, 220, 255, rng.randint(34, 72)), width=1)
        return Image.alpha_composite(canvas, rain)
    fog = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(fog)
    fog_color = (205, 223, 230) if phase == "day" else (93, 126, 154)
    for bounds, alpha in (
        ((-180, 305, 1260, 610), 40),
        ((-120, 530, 1210, 875), 33),
        ((-180, 760, 1270, 1110), 24),
    ):
        draw.ellipse(bounds, fill=(*fog_color, alpha))
    fog = fog.filter(ImageFilter.GaussianBlur(48))
    return Image.alpha_composite(canvas, fog)


def adapt_to_depth(sprite: Image.Image, depth_band: str, phase: str) -> Image.Image:
    alpha = sprite.getchannel("A")
    rgb = sprite.convert("RGB")
    if phase == "night":
        settings = {
            "far": (0.42, 0.72, (18, 47, 82), 0.34),
            "mid": (0.5, 0.82, (19, 43, 76), 0.24),
            "near": (0.6, 0.9, (22, 42, 69), 0.16),
        }
    else:
        settings = {
            "far": (0.94, 0.76, (178, 202, 214), 0.13),
            "mid": (0.98, 0.9, (190, 207, 214), 0.05),
            "near": (1.0, 1.0, (255, 255, 255), 0.0),
        }
    brightness, color, haze, haze_alpha = settings[depth_band]
    rgb = ImageEnhance.Brightness(rgb).enhance(brightness)
    rgb = ImageEnhance.Color(rgb).enhance(color)
    if haze_alpha:
        rgb = Image.blend(rgb, Image.new("RGB", rgb.size, haze), haze_alpha)
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--background", type=Path, required=True)
    parser.add_argument("--placements", type=Path, required=True)
    parser.add_argument("--asset-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--phase", choices=("day", "night"), required=True)
    parser.add_argument("--weather", choices=("clear", "rain", "mist"), default="clear")
    args = parser.parse_args()

    profile = json.loads(args.placements.read_text(encoding="utf-8"))
    grid = profile["placementGrid"]
    slots = {slot["id"]: slot for slot in profile["slots"]}
    canvas = Image.open(args.background).convert("RGBA")
    if canvas.size != (1080, 1920):
        raise ValueError(f"Background must be 1080x1920, got {canvas.size}")

    if args.phase == "night":
        for placement in profile["placements"]:
            slot = slots[placement["slotId"]]
            anchor_x, anchor_y = art_anchor(slot, grid)
            light = placement.get("light")
            if not light:
                continue
            center = (
                anchor_x + light["offsetPx"]["x"],
                anchor_y + light["offsetPx"]["y"],
            )
            canvas.alpha_composite(
                radial_light(canvas.size, center, light["radius"], light["color"], light["intensity"])
            )

    for placement in profile["placements"]:
        slot = slots[placement["slotId"]]
        anchor_x, anchor_y = art_anchor(slot, grid)

        footprint = slot["shadowFootprint"]
        shadow_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(shadow_layer)
        half_w = footprint["width"] / 2
        half_h = footprint["height"] / 2
        draw.ellipse(
            (
                round(anchor_x - half_w),
                round(anchor_y - half_h / 2),
                round(anchor_x + half_w),
                round(anchor_y + half_h * 1.5),
            ),
            fill=(5, 12, 24, round(255 * footprint["opacity"])),
        )
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=max(2, footprint["height"] / 5)))
        canvas.alpha_composite(shadow_layer)

        source = Image.open(args.asset_dir / ASSET_FILES[placement["assetId"]]).convert("RGBA")
        source = adapt_to_depth(source, slot["depthBand"], args.phase)
        scale = placement["scale"]
        size = (round(source.width * scale), round(source.height * scale))
        sprite = source.resize(size, Image.Resampling.LANCZOS)
        visible_anchor = placement["visibleAnchor"]
        paste_x = round(anchor_x - visible_anchor["x"] * size[0])
        paste_y = round(anchor_y - visible_anchor["y"] * size[1])
        canvas.alpha_composite(sprite, (paste_x, paste_y))
        if args.phase == "night":
            emissive = Image.open(args.asset_dir / EMISSIVE_FILES[placement["assetId"]]).convert("RGBA")
            emissive = emissive.resize(size, Image.Resampling.LANCZOS)
            canvas.alpha_composite(emissive, (paste_x, paste_y))

    canvas = apply_weather(canvas, args.weather, args.phase)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(args.output, quality=95)


if __name__ == "__main__":
    main()
