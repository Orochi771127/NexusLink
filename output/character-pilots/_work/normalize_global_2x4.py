from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

from PIL import Image


def load_pipeline(path: Path):
    spec = importlib.util.spec_from_file_location("generate2dsprite_pipeline", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load pipeline module: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Normalize eight globally separated RGBA figures into an exact 4x2 512px grid."
    )
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    parser.add_argument("--pipeline-script", required=True, type=Path)
    parser.add_argument("--fit-scale", type=float, default=0.88)
    parser.add_argument("--min-area", type=int, default=500)
    args = parser.parse_args()

    pipeline = load_pipeline(args.pipeline_script)
    source = Image.open(args.input).convert("RGBA")
    components = pipeline.connected_components(source, min_area=args.min_area)
    selected = components[:8]
    if len(selected) != 8:
        raise ValueError(f"Expected 8 foreground components, found {len(selected)}")

    selected.sort(key=lambda item: (item["bbox"][1] + item["bbox"][3]) / 2)
    top = sorted(selected[:4], key=lambda item: (item["bbox"][0] + item["bbox"][2]) / 2)
    bottom = sorted(selected[4:], key=lambda item: (item["bbox"][0] + item["bbox"][2]) / 2)
    ordered = top + bottom

    crops = []
    for item in ordered:
        x0, y0, x1, y1 = item["bbox"]
        pad = 2
        box = (
            max(0, x0 - pad),
            max(0, y0 - pad),
            min(source.width, x1 + pad),
            min(source.height, y1 + pad),
        )
        crops.append((source.crop(box), box, item))

    max_width = max(crop.width for crop, _, _ in crops)
    max_height = max(crop.height for crop, _, _ in crops)
    scale = min(512 / max_width, 512 / max_height) * args.fit_scale
    bottom_pad = max(0, int(512 * (1 - args.fit_scale) * 0.5))

    sheet = Image.new("RGBA", (2048, 1024), (0, 0, 0, 0))
    frames = []
    report_frames = []
    for index, (crop, source_box, item) in enumerate(crops):
        width = max(1, int(crop.width * scale))
        height = max(1, int(crop.height * scale))
        resized = crop.resize((width, height), Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        paste_x = (512 - width) // 2
        paste_y = 512 - height - bottom_pad
        frame.alpha_composite(resized, (paste_x, paste_y))
        row, col = divmod(index, 4)
        sheet.alpha_composite(frame, (col * 512, row * 512))
        frames.append(frame)
        report_frames.append(
            {
                "frame": index + 1,
                "grid": [row, col],
                "source_component_area": item["area"],
                "source_component_bbox": list(item["bbox"]),
                "source_crop_box": list(source_box),
                "output_size": [width, height],
                "paste_position": [paste_x, paste_y],
            }
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output)
    args.report.write_text(
        json.dumps(
            {
                "input": str(args.input),
                "output": str(args.output),
                "source_size": list(source.size),
                "selected_component_count": len(ordered),
                "fit_scale": args.fit_scale,
                "shared_scale": scale,
                "frames": report_frames,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
