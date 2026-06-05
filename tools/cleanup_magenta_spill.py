#!/usr/bin/env python
"""Vectorized magenta-key decontamination for Greyshade Cat sprite assets."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Remove magenta key backgrounds with vectorized alpha unpremultiplication "
            "and grey-edge color decontamination."
        )
    )
    parser.add_argument("--input", required=True, help="Raw magenta-key PNG.")
    parser.add_argument("--output", required=True, help="Clean transparent PNG.")
    parser.add_argument(
        "--report",
        help="Optional JSON report path. Defaults to <output>.report.json when omitted.",
    )
    parser.add_argument(
        "--strictness",
        type=float,
        default=0.92,
        help="Magenta spill needed to reach fully transparent alpha. Lower is more aggressive.",
    )
    parser.add_argument(
        "--edge-softness",
        type=float,
        default=0.18,
        help="Width of the smooth transition around the magenta key matte.",
    )
    parser.add_argument(
        "--decontam-strength",
        type=float,
        default=1.0,
        help="How strongly contaminated edge RGB is restored toward green-channel grey.",
    )
    parser.add_argument(
        "--alpha-epsilon",
        type=float,
        default=0.001,
        help="Small divisor guard for unpremultiplication.",
    )
    return parser.parse_args()


def smoothstep(edge0: float, edge1: float, values: np.ndarray) -> np.ndarray:
    width = max(edge1 - edge0, 1e-6)
    t = np.clip((values - edge0) / width, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def decontaminate_magenta_array(
    rgba: np.ndarray,
    *,
    strictness: float = 0.92,
    edge_softness: float = 0.18,
    decontam_strength: float = 1.0,
    alpha_epsilon: float = 0.001,
) -> tuple[np.ndarray, dict[str, int | float]]:
    """Return a straight-alpha RGBA array with magenta spill removed.

    The matte is derived from magenta contamination, not a hard RGB threshold.
    For grey sprites, the clean edge color can be reconstructed from the green
    channel because the magenta key contributes red and blue but no green.
    """

    source = rgba.astype(np.float32) / 255.0
    rgb = source[..., :3]
    src_alpha = source[..., 3]

    red = rgb[..., 0]
    green = rgb[..., 1]
    blue = rgb[..., 2]

    rb_spill = np.maximum(np.minimum(red, blue) - green, 0.0)
    matte = smoothstep(
        max(strictness - edge_softness, 0.0),
        max(strictness, edge_softness),
        rb_spill,
    )
    recovered_alpha = np.clip(1.0 - matte, 0.0, 1.0)
    out_alpha = src_alpha * recovered_alpha

    safe_alpha = np.maximum(recovered_alpha, alpha_epsilon)
    grey_luma = np.clip(green / safe_alpha, 0.0, 1.0)
    grey_rgb = np.stack((grey_luma, grey_luma, grey_luma), axis=-1)

    decontam_weight = np.clip(matte * decontam_strength, 0.0, 1.0)[..., None]
    clean_rgb = rgb * (1.0 - decontam_weight) + grey_rgb * decontam_weight
    clean_rgb = np.where(out_alpha[..., None] <= alpha_epsilon, 0.0, clean_rgb)

    output = np.dstack((clean_rgb, out_alpha))
    output_u8 = np.clip(np.rint(output * 255.0), 0, 255).astype(np.uint8)

    visible_magenta_before = (
        (src_alpha > alpha_epsilon)
        & (red > 0.9)
        & (green < 0.2)
        & (blue > 0.9)
    )
    visible_magenta_after = (
        (output[..., 3] > alpha_epsilon)
        & (output[..., 0] > 0.9)
        & (output[..., 1] < 0.2)
        & (output[..., 2] > 0.9)
    )
    touched = matte > 0.0
    report = {
        "pixels": int(rgba.shape[0] * rgba.shape[1]),
        "decontaminated_pixels": int(np.count_nonzero(touched)),
        "fully_transparent_pixels": int(np.count_nonzero(output[..., 3] <= alpha_epsilon)),
        "visible_magenta_before": int(np.count_nonzero(visible_magenta_before)),
        "visible_magenta_after": int(np.count_nonzero(visible_magenta_after)),
        "mean_alpha_before": float(np.mean(src_alpha)),
        "mean_alpha_after": float(np.mean(output[..., 3])),
        "strictness": float(strictness),
        "edge_softness": float(edge_softness),
        "decontam_strength": float(decontam_strength),
    }
    return output_u8, report


def decontaminate_magenta_image(
    image: Image.Image,
    *,
    strictness: float = 0.92,
    edge_softness: float = 0.18,
    decontam_strength: float = 1.0,
    alpha_epsilon: float = 0.001,
) -> tuple[Image.Image, dict[str, int | float]]:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    clean, report = decontaminate_magenta_array(
        rgba,
        strictness=strictness,
        edge_softness=edge_softness,
        decontam_strength=decontam_strength,
        alpha_epsilon=alpha_epsilon,
    )
    return Image.fromarray(clean, "RGBA"), report


def remove_magenta_spill(
    input_path: str | Path,
    output_path: str | Path,
    *,
    strictness: float = 0.92,
    edge_softness: float = 0.18,
    decontam_strength: float = 1.0,
    alpha_epsilon: float = 0.001,
) -> dict[str, int | float | str]:
    input_path = Path(input_path)
    output_path = Path(output_path)
    image = Image.open(input_path).convert("RGBA")
    clean, report = decontaminate_magenta_image(
        image,
        strictness=strictness,
        edge_softness=edge_softness,
        decontam_strength=decontam_strength,
        alpha_epsilon=alpha_epsilon,
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    clean.save(output_path)
    return {
        "input": str(input_path),
        "output": str(output_path),
        "size": list(image.size),
        **report,
    }


def main() -> None:
    args = parse_args()
    report = remove_magenta_spill(
        args.input,
        args.output,
        strictness=args.strictness,
        edge_softness=args.edge_softness,
        decontam_strength=args.decontam_strength,
        alpha_epsilon=args.alpha_epsilon,
    )
    report_path = Path(args.report) if args.report else Path(args.output).with_suffix(".report.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
