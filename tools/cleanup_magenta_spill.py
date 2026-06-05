#!/usr/bin/env python
"""Aggressive magenta-key decontamination for Greyshade Cat sprite assets."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image


def decontaminate_magenta_array(
    rgba: np.ndarray,
    *,
    strictness: float = 0.5,
) -> tuple[np.ndarray, dict[str, int | float]]:
    source = rgba.astype(np.float32) / 255.0

    r = source[:, :, 0]
    g = source[:, :, 1]
    b = source[:, :, 2]
    a = source[:, :, 3]
    mean_alpha_before = float(np.mean(a))

    magenta_val = np.minimum(r, b)
    spill = np.maximum(0.0, magenta_val - g)
    visible_magenta_before = (
        (a > 0.0)
        & (r > 0.9)
        & (g < 0.2)
        & (b > 0.9)
    )

    alpha_reduction = np.clip(spill / max(strictness, 1e-6), 0.0, 1.0)
    new_a = a * (1.0 - alpha_reduction)

    edge_mask = (new_a > 0.0) & (spill > 0.01)
    r[edge_mask] = g[edge_mask]
    b[edge_mask] = g[edge_mask]

    source[:, :, 0] = r
    source[:, :, 1] = g
    source[:, :, 2] = b
    source[:, :, 3] = new_a

    result = np.clip(source * 255.0, 0, 255).astype(np.uint8)

    visible_magenta_after = (
        (source[:, :, 3] > 0.0)
        & (source[:, :, 0] > 0.9)
        & (source[:, :, 1] < 0.2)
        & (source[:, :, 2] > 0.9)
    )

    report = {
        "pixels": int(rgba.shape[0] * rgba.shape[1]),
        "decontaminated_pixels": int(np.count_nonzero(edge_mask)),
        "fully_transparent_pixels": int(np.count_nonzero(new_a <= 0.0)),
        "visible_magenta_before": int(np.count_nonzero(visible_magenta_before)),
        "visible_magenta_after": int(np.count_nonzero(visible_magenta_after)),
        "mean_alpha_before": mean_alpha_before,
        "mean_alpha_after": float(np.mean(new_a)),
        "strictness": float(strictness),
        "spill_threshold": 0.01,
    }
    return result, report


def remove_magenta_spill(
    input_path: str | Path,
    output_path: str | Path,
    strictness: float = 0.5,
) -> dict[str, int | float | str | list[int]]:
    input_path = Path(input_path)
    output_path = Path(output_path)
    image = Image.open(input_path).convert("RGBA")
    clean, report = decontaminate_magenta_array(np.array(image, dtype=np.uint8), strictness=strictness)
    result_img = Image.fromarray(clean, "RGBA")

    output_dir = os.path.dirname(str(output_path))
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    result_img.save(output_path)
    print(f"[AGGRESSIVE Cleanup Done] -> {output_path}")

    return {
        "input": str(input_path),
        "output": str(output_path),
        "size": list(image.size),
        **report,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--strictness", type=float, default=0.5)
    parser.add_argument(
        "--report",
        help="Optional JSON report path. Defaults to <output>.report.json when omitted.",
    )
    parser.add_argument("--edge-softness", type=float, help=argparse.SUPPRESS)
    parser.add_argument("--decontam-strength", type=float, help=argparse.SUPPRESS)
    parser.add_argument("--alpha-epsilon", type=float, help=argparse.SUPPRESS)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        report = remove_magenta_spill(args.input, args.output, args.strictness)
        report_path = Path(args.report) if args.report else Path(args.output).with_suffix(".report.json")
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(report, indent=2))
    except Exception as error:
        print(f"[Error] {args.input}: {error}")
        raise


if __name__ == "__main__":
    main()
