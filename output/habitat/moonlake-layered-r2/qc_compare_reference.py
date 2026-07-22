from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image


def main() -> int:
    if len(sys.argv) != 3:
        raise SystemExit("usage: qc_compare_reference.py BASE CANDIDATE")

    base_path = Path(sys.argv[1])
    candidate_path = Path(sys.argv[2])

    with Image.open(base_path) as base_image, Image.open(candidate_path) as candidate_image:
        candidate = candidate_image.convert("RGB")
        base = base_image.convert("RGB").resize(candidate.size, Image.Resampling.LANCZOS)
        base_array = np.asarray(base, dtype=np.int16)
        candidate_array = np.asarray(candidate, dtype=np.int16)

    difference = np.abs(base_array - candidate_array)
    max_channel_difference = difference.max(axis=2)
    result = {
        "base": str(base_path),
        "candidate": str(candidate_path),
        "candidateSize": list(candidate.size),
        "meanAbsoluteError": float(difference.mean()),
        "medianAbsoluteError": float(np.median(difference)),
        "p95AbsoluteError": float(np.percentile(difference, 95)),
        "pixelRatioMaxChannelGt8": float((max_channel_difference > 8).mean()),
        "pixelRatioMaxChannelGt16": float((max_channel_difference > 16).mean()),
        "pixelRatioMaxChannelGt32": float((max_channel_difference > 32).mean()),
        "pixelRatioMaxChannelGt64": float((max_channel_difference > 64).mean()),
    }
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
