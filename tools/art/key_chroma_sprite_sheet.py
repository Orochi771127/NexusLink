"""Remove a flat green generation matte from an illustrated sprite grid.

The generator is intentionally asked for a chroma matte instead of direct
transparency so hair/fur silhouettes can be audited before normalization.
This tool performs vectorized green-dominance alpha extraction, conservative
despill, and optional cell-edge clearing for generator-drawn grid seams.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--cols", type=int, required=True)
    parser.add_argument("--rows", type=int, required=True)
    parser.add_argument("--edge-clear", type=int, default=2)
    parser.add_argument("--report-out")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    source = Image.open(source_path).convert("RGBA")
    pixels = np.asarray(source).astype(np.float32)
    rgb = pixels[..., :3]
    original_alpha = pixels[..., 3] / 255.0
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    other = np.maximum(red, blue)
    dominance = green - other
    dominance_key = np.clip((dominance - 10.0) / 90.0, 0.0, 1.0)
    brightness_key = np.clip((green - 35.0) / 145.0, 0.0, 1.0)
    key_strength = dominance_key * brightness_key
    alpha = original_alpha * (1.0 - key_strength)
    alpha[alpha < (4.0 / 255.0)] = 0.0

    # Suppress the characteristic green fringe without touching cyan light,
    # where blue is comparable to or greater than green.
    despill_mask = (dominance > 8.0) & (green > blue * 1.08)
    rgb[..., 1] = np.where(
        despill_mask,
        np.minimum(green, other + 10.0),
        green,
    )

    if args.edge_clear > 0:
        height, width = alpha.shape
        cell_width = width // args.cols
        cell_height = height // args.rows
        clear = args.edge_clear
        for col in range(1, args.cols):
            x = col * cell_width
            alpha[:, max(0, x - clear):min(width, x + clear + 1)] = 0.0
        for row in range(1, args.rows):
            y = row * cell_height
            alpha[max(0, y - clear):min(height, y + clear + 1), :] = 0.0
        alpha[:clear, :] = 0.0
        alpha[-clear:, :] = 0.0
        alpha[:, :clear] = 0.0
        alpha[:, -clear:] = 0.0

    result = np.concatenate(
        [np.clip(rgb, 0.0, 255.0), (alpha[..., None] * 255.0)],
        axis=2,
    ).astype(np.uint8)
    Image.fromarray(result, mode="RGBA").save(output_path)

    report = {
        "schemaVersion": 1,
        "source": source_path.as_posix(),
        "output": output_path.as_posix(),
        "sourceSize": [source.width, source.height],
        "grid": {"cols": args.cols, "rows": args.rows},
        "edgeClear": args.edge_clear,
        "transparentPixelRatio": float(np.count_nonzero(alpha == 0.0) / alpha.size),
        "partialAlphaPixelRatio": float(
            np.count_nonzero((alpha > 0.0) & (alpha < 1.0)) / alpha.size
        ),
        "cornerAlpha": [
            int(result[0, 0, 3]),
            int(result[0, -1, 3]),
            int(result[-1, 0, 3]),
            int(result[-1, -1, 3]),
        ],
    }
    if args.report_out:
        report_path = Path(args.report_out)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
