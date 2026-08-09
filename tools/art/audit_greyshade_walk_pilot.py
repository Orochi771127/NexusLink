#!/usr/bin/env python3
"""Audit and render an overview of the local Greyshade eight-direction Pilot."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw


DIRECTIONS = (
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest",
)
FRAME_SIZE = 512
FRAME_COUNT = 8


def alpha_at(image: Image.Image, point: tuple[int, int]) -> int:
    return image.getpixel(point)[3]


def audit(root: Path) -> list[list[Image.Image]]:
    direction_frames: list[list[Image.Image]] = []
    all_hashes: set[str] = set()
    for direction in DIRECTIONS:
        sheet_path = root / f"greyshade-walk-{direction}-candidate-4096x512-8f.png"
        qc_path = root / f"greyshade-walk-{direction}-candidate.qc.json"
        if not sheet_path.is_file() or not qc_path.is_file():
            raise SystemExit(f"missing candidate or QC: {direction}")
        qc = json.loads(qc_path.read_text(encoding="utf-8"))
        if qc.get("artStatus") != "candidate-awaiting-human":
            raise SystemExit(f"unexpected art status: {direction}")

        sheet = Image.open(sheet_path).convert("RGBA")
        if sheet.size != (FRAME_SIZE * FRAME_COUNT, FRAME_SIZE):
            raise SystemExit(f"bad sheet dimensions {sheet.size}: {direction}")
        corners = (
            (0, 0),
            (sheet.width - 1, 0),
            (0, sheet.height - 1),
            (sheet.width - 1, sheet.height - 1),
        )
        if any(alpha_at(sheet, point) != 0 for point in corners):
            raise SystemExit(f"non-transparent sheet corner: {direction}")

        frames = []
        direction_hashes: set[str] = set()
        for index in range(FRAME_COUNT):
            frame = sheet.crop((index * FRAME_SIZE, 0, (index + 1) * FRAME_SIZE, FRAME_SIZE))
            digest = hashlib.sha256(frame.tobytes()).hexdigest()
            direction_hashes.add(digest)
            all_hashes.add(digest)
            frames.append(frame)
        if len(direction_hashes) < 6:
            raise SystemExit(f"insufficient pose variation: {direction}")
        direction_frames.append(frames)

    if len(all_hashes) < len(DIRECTIONS) * 6:
        raise SystemExit("insufficient cross-direction variation")
    return direction_frames


def render_overview(direction_frames: list[list[Image.Image]], output: Path) -> None:
    label_width = 150
    tile = 144
    canvas = Image.new("RGBA", (label_width + tile * FRAME_COUNT, tile * len(DIRECTIONS)), "#dcebe7")
    draw = ImageDraw.Draw(canvas)
    for row, (direction, frames) in enumerate(zip(DIRECTIONS, direction_frames)):
        y = row * tile
        draw.rectangle((0, y, canvas.width, y + tile), fill="#dcebe7" if row % 2 == 0 else "#cfdfda")
        draw.text((14, y + tile // 2 - 8), direction.upper(), fill="#16312f")
        for column, frame in enumerate(frames):
            preview = frame.resize((tile, tile), Image.Resampling.LANCZOS)
            canvas.alpha_composite(preview, (label_width + column * tile, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, quality=94)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--overview", type=Path, required=True)
    args = parser.parse_args()
    frames = audit(args.root)
    render_overview(frames, args.overview)
    print(json.dumps({"status": "PASS", "directions": 8, "framesPerDirection": 8, "overview": str(args.overview)}))


if __name__ == "__main__":
    main()
