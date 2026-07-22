#!/usr/bin/env python3
"""Build aligned 512x512 emissive overlays from an explicit staging directory."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


WARM_GLOWS = {
    "tent_near_left": [(342, 334, 58, 72, 145)],
    "tent_near_right": [(174, 337, 55, 70, 145)],
    "tent_mid_left": [(302, 334, 48, 62, 125), (397, 326, 20, 27, 165)],
    "tent_mid_right": [(177, 337, 48, 62, 125), (111, 326, 20, 27, 165)],
    "tent_far": [(256, 350, 48, 64, 140)],
    "crescent_shrine": [(255, 137, 27, 40, 185)],
}


def radial_alpha(glows: list[tuple[int, int, int, int, int]]) -> np.ndarray:
    y, x = np.mgrid[0:512, 0:512]
    alpha = np.zeros((512, 512), dtype=np.float32)
    for center_x, center_y, radius_x, radius_y, maximum in glows:
        distance = np.sqrt(((x - center_x) / radius_x) ** 2 + ((y - center_y) / radius_y) ** 2)
        falloff = np.clip(1.0 - distance, 0.0, 1.0) ** 2
        alpha = np.maximum(alpha, falloff * maximum)
    return alpha.astype(np.uint8)


def warm_plate(root: Path, name: str, glows: list[tuple[int, int, int, int, int]]) -> dict:
    alpha = radial_alpha(glows)
    rgba = np.zeros((512, 512, 4), dtype=np.uint8)
    rgba[..., :3] = np.where(
        alpha[..., None] > 0,
        np.array([255, 187, 82], dtype=np.uint8),
        0,
    )
    rgba[..., 3] = alpha
    output = root / f"{name}_emissive.png"
    Image.fromarray(rgba, "RGBA").save(output)
    return plate_report(output, alpha)


def cyan_plate(root: Path, name: str) -> dict:
    base = np.asarray(Image.open(root / f"{name}_base.png").convert("RGBA"))
    rgb = base[..., :3].astype(np.float32)
    source_alpha = base[..., 3].astype(np.float32) / 255.0
    cyan = (
        (rgb[..., 1] > 75)
        & (rgb[..., 2] > 105)
        & (rgb[..., 2] > rgb[..., 0] * 1.18)
        & (rgb[..., 1] > rgb[..., 0] * 0.82)
        & (source_alpha > 0.1)
    )
    strength = np.clip((rgb[..., 1] + rgb[..., 2] - rgb[..., 0] * 1.4 - 60) / 250, 0, 1)
    core_alpha = (cyan * strength * source_alpha * 235).astype(np.uint8)
    blur = Image.fromarray(core_alpha, "L").filter(ImageFilter.GaussianBlur(8))
    glow_alpha = np.asarray(blur).astype(np.float32) * 0.72
    combined = np.maximum(core_alpha.astype(np.float32), glow_alpha).astype(np.uint8)
    rgba = np.zeros((512, 512, 4), dtype=np.uint8)
    rgba[..., :3] = np.where(
        combined[..., None] > 0,
        np.array([91, 221, 255], dtype=np.uint8),
        0,
    )
    rgba[..., 3] = combined
    output = root / f"{name}_emissive.png"
    Image.fromarray(rgba, "RGBA").save(output)
    return plate_report(output, combined)


def plate_report(path: Path, alpha: np.ndarray) -> dict:
    ys, xs = np.where(alpha > 2)
    bounds = None if len(xs) == 0 else [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    return {
        "path": path.name,
        "size": [512, 512],
        "boundsAlphaGt2": bounds,
        "edgeTouchAlphaGt2": int(
            np.count_nonzero(alpha[0, :] > 2)
            + np.count_nonzero(alpha[-1, :] > 2)
            + np.count_nonzero(alpha[:, 0] > 2)
            + np.count_nonzero(alpha[:, -1] > 2)
        ),
        "cornerAlpha": [int(alpha[0, 0]), int(alpha[0, -1]), int(alpha[-1, 0]), int(alpha[-1, -1])],
        "nonzeroPixels": int(np.count_nonzero(alpha)),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build Moonlake emissive plates inside an explicit non-runtime staging directory."
    )
    parser.add_argument(
        "--staging-root",
        type=Path,
        required=True,
        help="Directory containing the eight *_base.png files; outputs stay in this directory.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = args.staging_root.resolve()
    repo_root = Path(__file__).resolve().parents[3]
    assets_root = (repo_root / "assets").resolve()
    if root == assets_root or assets_root in root.parents:
        raise SystemExit("Refusing to write into assets/**; use an output staging directory.")
    if not root.is_dir():
        raise SystemExit(f"Staging directory does not exist: {root}")

    reports = []
    for name, glows in WARM_GLOWS.items():
        reports.append(warm_plate(root, name, glows))
    reports.append(cyan_plate(root, "beacon_main"))
    reports.append(cyan_plate(root, "beacon_far"))
    report_path = root / "emissive-report.json"
    report_path.write_text(json.dumps({"plates": reports}, indent=2), encoding="utf-8")
    print(json.dumps({"count": len(reports), "report": str(report_path)}, indent=2))


if __name__ == "__main__":
    main()
