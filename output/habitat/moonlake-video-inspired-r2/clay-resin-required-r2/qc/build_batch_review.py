from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
NORMALIZED = ROOT / "concepts" / "normalized"
PREVIEWS = ROOT / "previews"

ITEMS = [
    ("heart-core-carrier-r2", "first-resonance", "1x1"),
    ("element-light-moon-r2", "first-resonance", "1x1"),
    ("element-light-fire-r2", "first-resonance", "1x1"),
    ("element-light-water-r2", "first-resonance", "1x1"),
    ("ritual-foreground-veil-r2", "first-resonance", "1x1"),
    ("ritual-fx-pulse-r2", "first-resonance", "2x2"),
    ("ritual-fx-response-r2", "first-resonance", "2x2"),
    ("resonance-symbol-atlas-r2", "first-resonance", "2x2"),
    ("moment-symbol-quiet-approach-r2", "habitat-moments", "1x1"),
    ("moment-symbol-moon-gaze-r2", "habitat-moments", "1x1"),
    ("moment-symbol-crystal-glimmer-r2", "habitat-moments", "1x1"),
    ("habitat-fx-gentle-motes-r2", "habitat-moments", "2x2"),
    ("habitat-fx-water-ripple-r2", "habitat-moments", "2x2"),
    ("intervention-symbol-steady-r2", "rift-crystal", "1x1"),
    ("intervention-symbol-boundary-r2", "rift-crystal", "1x1"),
    ("intervention-symbol-step-back-r2", "rift-crystal", "1x1"),
    ("resonance-circle-layer-r2", "rift-crystal", "1x1"),
    ("crystal-release-afterglow-r2", "rift-crystal", "2x2"),
]


def normalize_hidden_rgb(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = [
        (0, 0, 0, 0) if alpha == 0 else (red, green, blue, alpha)
        for red, green, blue, alpha in image.get_flattened_data()
    ]
    image.putdata(pixels)
    image.save(path)


def inspect(path: Path, grid: str) -> dict:
    normalize_hidden_rgb(path)
    image = Image.open(path)
    rgba = image.convert("RGBA")
    width, height = rgba.size
    rows, cols = (2, 2) if grid == "2x2" else (1, 1)
    expected = (1024, 1024) if grid == "2x2" else (512, 512)
    cell_width = width // cols
    cell_height = height // rows
    corner_alpha = [
        rgba.getpixel((0, 0))[3],
        rgba.getpixel((width - 1, 0))[3],
        rgba.getpixel((0, height - 1))[3],
        rgba.getpixel((width - 1, height - 1))[3],
    ]
    hidden_rgb = sum(
        1
        for red, green, blue, alpha in rgba.get_flattened_data()
        if alpha == 0 and (red or green or blue)
    )
    cells = []
    for row in range(rows):
        for col in range(cols):
            cell = rgba.crop(
                (
                    col * cell_width,
                    row * cell_height,
                    (col + 1) * cell_width,
                    (row + 1) * cell_height,
                )
            )
            alpha = cell.getchannel("A")
            bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
            if bbox:
                margins = {
                    "left": bbox[0],
                    "top": bbox[1],
                    "right": cell_width - bbox[2],
                    "bottom": cell_height - bbox[3],
                }
                min_margin = min(margins.values())
            else:
                margins = None
                min_margin = None
            edge = (
                [cell.getpixel((x, 0))[3] for x in range(cell_width)]
                + [cell.getpixel((x, cell_height - 1))[3] for x in range(cell_width)]
                + [cell.getpixel((0, y))[3] for y in range(cell_height)]
                + [cell.getpixel((cell_width - 1, y))[3] for y in range(cell_height)]
            )
            cells.append(
                {
                    "row": row,
                    "col": col,
                    "alphaBboxOver8": bbox,
                    "margins": margins,
                    "minMargin": min_margin,
                    "edgeTouchOver8": any(value > 8 for value in edge),
                }
            )
    passed = (
        image.mode == "RGBA"
        and (width, height) == expected
        and max(corner_alpha) == 0
        and hidden_rgb == 0
        and all(
            cell["minMargin"] is not None
            and cell["minMargin"] >= 24
            and not cell["edgeTouchOver8"]
            for cell in cells
        )
    )
    return {
        "mode": image.mode,
        "size": [width, height],
        "expectedSize": list(expected),
        "cornerAlpha": corner_alpha,
        "hiddenRgbAtAlphaZero": hidden_rgb,
        "cells": cells,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "pass": passed,
    }


def load_font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


def checker(size: tuple[int, int], cell: int = 20) -> Image.Image:
    image = Image.new("RGBA", size, (17, 31, 51, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(31, 52, 79, 255))
    return image


def make_contact_sheet(paths: dict[str, Path]) -> Path:
    tile_width = 300
    tile_height = 340
    columns = 4
    rows = 5
    canvas = Image.new("RGBA", (columns * tile_width, rows * tile_height + 80), (7, 18, 34, 255))
    draw = ImageDraw.Draw(canvas)
    draw.text((24, 18), "NEXUS LINK - CLAY / RESIN REQUIRED VISUALS R2", fill=(235, 244, 255), font=load_font(22))
    draw.text((24, 48), "STAGING ONLY / HUMAN REVIEW PENDING / NO ASSETS PROMOTED", fill=(111, 226, 255), font=load_font(12))
    for index, (item_id, group, grid) in enumerate(ITEMS):
        col = index % columns
        row = index // columns
        x = col * tile_width
        y = row * tile_height + 80
        tile = checker((tile_width - 24, 250))
        image = Image.open(paths[item_id]).convert("RGBA")
        image.thumbnail((tile.width - 20, tile.height - 20), Image.Resampling.LANCZOS)
        tile.alpha_composite(image, ((tile.width - image.width) // 2, (tile.height - image.height) // 2))
        canvas.alpha_composite(tile, (x + 12, y))
        draw.text((x + 16, y + 260), f"{index + 1:02d} {item_id}", fill=(238, 244, 252), font=load_font(14))
        draw.text((x + 16, y + 282), f"{group} / {grid}", fill=(105, 220, 255), font=load_font(12))
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    target = PREVIEWS / "contact-sheet-required-18-r2.png"
    canvas.convert("RGB").save(target, quality=94)
    return target


def main() -> None:
    paths = {
        item_id: NORMALIZED / item_id / "final" / f"{item_id}.png"
        for item_id, _, _ in ITEMS
    }
    report_items = []
    for item_id, group, grid in ITEMS:
        path = paths[item_id]
        report_items.append(
            {
                "id": item_id,
                "group": group,
                "grid": grid,
                "path": path.relative_to(ROOT.parents[3]).as_posix(),
                **inspect(path, grid),
            }
        )
    contact_sheet = make_contact_sheet(paths)
    report = {
        "schemaVersion": 1,
        "batchId": "TP-E2-CLAY-RESIN-REQUIRED-VISUALS-R2",
        "itemCount": len(report_items),
        "passCount": sum(item["pass"] for item in report_items),
        "allMechanicalChecksPassed": all(item["pass"] for item in report_items),
        "humanVisualReview": "PENDING",
        "referenceAuditPassed": False,
        "assetPromoted": False,
        "runtimeIntegrated": False,
        "items": report_items,
        "contactSheet": contact_sheet.relative_to(ROOT.parents[3]).as_posix(),
    }
    (ROOT / "qc" / "batch-mechanical-report.json").write_text(
        json.dumps(report, indent=2),
        encoding="utf-8",
    )
    print(json.dumps({"passCount": report["passCount"], "itemCount": len(report_items)}))


if __name__ == "__main__":
    main()
