"""Build the human-gate contact sheet for the Blazetail R3 candidates."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate-root", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", required=True)
    return parser.parse_args()


def font(size: int, *, bold: bool = False) -> ImageFont.ImageFont:
    names = ["arialbd.ttf", "segoeuib.ttf"] if bold else ["arial.ttf", "segoeui.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def fit(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    result = image.copy()
    result.thumbnail(box, Image.Resampling.LANCZOS)
    return result


def composite_panel(canvas, image_path: Path, box, label, draw, title_font, *, checker=False):
    x, y, width, height = box
    draw.rounded_rectangle((x, y, x + width, y + height), radius=22, fill=(17, 38, 43), outline=(111, 177, 166), width=2)
    draw.text((x + 20, y + 14), label, font=title_font, fill=(247, 221, 159))
    image = Image.open(image_path).convert("RGBA")
    viewport = Image.new("RGBA", (width - 32, height - 60), (0, 0, 0, 0))
    if checker:
        checker_draw = ImageDraw.Draw(viewport)
        tile = 24
        for row in range(0, viewport.height, tile):
            for col in range(0, viewport.width, tile):
                shade = (41, 62, 64, 255) if ((row // tile + col // tile) % 2) else (29, 49, 52, 255)
                checker_draw.rectangle((col, row, col + tile, row + tile), fill=shade)
    scaled = fit(image, viewport.size)
    viewport.alpha_composite(scaled, ((viewport.width - scaled.width) // 2, (viewport.height - scaled.height) // 2))
    canvas.alpha_composite(viewport, (x + 16, y + 48))
    return image


def main() -> None:
    args = parse_args()
    root = Path(args.candidate_root)
    output = Path(args.output)
    report_path = Path(args.report)
    output.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    canvas = Image.new("RGBA", (1800, 2300), (8, 25, 30, 255))
    draw = ImageDraw.Draw(canvas)
    heading = font(46, bold=True)
    subheading = font(27, bold=True)
    body = font(22)
    draw.text((70, 45), "Blazetail Kit R3 — Human Visual Gate", font=heading, fill=(255, 227, 160))
    draw.text((70, 105), "Candidate staging only · no assets/** promotion · bright resin/clay miniature family", font=body, fill=(174, 222, 215))

    expedition = root / "expedition" / "processed"
    walk_rows = [
        ("NE walk · 8f", expedition / "blazetail-kit_walk_ne_master_4096x512_8f.png"),
        ("SE walk · 8f", expedition / "blazetail-kit_walk_se_master_4096x512_8f.png"),
        ("NW walk · 8f", expedition / "blazetail-kit_walk_nw_master_4096x512_8f.png"),
        ("SW walk · 8f", expedition / "blazetail-kit_walk_sw_master_4096x512_8f.png"),
        ("SE attack_basic · 6f calibration v2", expedition / "blazetail-kit_attack_basic_se_master_3072x512_6f_v2.png"),
        ("NW hit · 4f calibration", expedition / "blazetail-kit_hit_nw_master_2048x512_4f.png"),
    ]
    dimensions = {}
    y = 165
    for label, path in walk_rows:
        image = composite_panel(canvas, path, (60, y, 1680, 235), label, draw, subheading, checker=True)
        dimensions[path.name] = list(image.size)
        y += 250

    orbit_root = root / "orbit" / "renders"
    orbit_items = [
        ("Base · three-quarter", orbit_root / "blazetail-kit-orbit-top-r3-base-three-quarter.png"),
        ("Base · top", orbit_root / "blazetail-kit-orbit-top-r3-base-top.png"),
        ("Resonance · three-quarter", orbit_root / "blazetail-kit-orbit-top-r3-resonance-three-quarter.png"),
        ("Resonance · top", orbit_root / "blazetail-kit-orbit-top-r3-resonance-top.png"),
    ]
    for index, (label, path) in enumerate(orbit_items):
        col = index % 4
        x = 60 + col * 420
        image = composite_panel(canvas, path, (x, y + 20, 390, 430), label, draw, subheading)
        dimensions[path.name] = list(image.size)

    footer_y = y + 475
    draw.text((70, footer_y), "Review focus", font=subheading, fill=(255, 227, 160))
    notes = [
        "1. Fox identity stays stable: juvenile proportions, ember-orange, cream face, gold spirals, diamond core.",
        "2. Exactly one flame tail in every sprite and one tapered flame-tail sweep on each top form.",
        "3. Diagonal headings read as true front/rear three-quarter views; paws remain bottom-centre aligned.",
        "4. Resonance is brighter/broader but remains a reversible equal-budget session form, not Growth.",
    ]
    for index, note in enumerate(notes):
        draw.text((70, footer_y + 45 + index * 34), note, font=body, fill=(205, 229, 224))

    canvas.convert("RGB").save(output, quality=94)
    report = {
        "schemaVersion": 1,
        "packId": "global-3d-gameplay-batch-r3",
        "ownerId": "blazetail-kit",
        "humanApprovalRequired": True,
        "runtimePromotionAllowed": False,
        "contactSheet": output.as_posix(),
        "dimensions": dimensions,
        "artStatus": "candidate-awaiting-human",
    }
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
