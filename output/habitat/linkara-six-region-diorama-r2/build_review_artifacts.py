from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json


ROOT = Path(__file__).resolve().parent
FOUNDATION = ROOT / "foundation"
RAW = ROOT / "concepts" / "raw"
PREVIEWS = ROOT / "previews"
REPORTS = ROOT / "reports"
SPRITE = Path(__file__).resolve().parents[3] / "assets" / "characters" / "greyshade-cat" / "frames" / "emotion" / "idle_calm" / "frame_01.png"
REGIONS = {
    "central_radiant_core": (0.50, 0.69),
    "eastern_mystic_mountains": (0.50, 0.52),
    "northern_verdant_plains": (0.50, 0.66),
    "southeast_forge_hills": (0.50, 0.62),
    "southern_harbor_nexus": (0.50, 0.68),
    "southwest_tidal_frontier": (0.50, 0.63),
}


def font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


def label(card, text):
    draw = ImageDraw.Draw(card, "RGBA")
    draw.rounded_rectangle((10, 10, 370, 44), 10, fill=(9, 17, 31, 210))
    draw.text((20, 18), text, fill=(255, 255, 255, 255), font=font(16))


def safe_overlay(card):
    overlay = Image.new("RGBA", card.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    draw.rectangle((0, 0, 390, round(844 * 0.12)), fill=(240, 68, 56, 90))
    draw.rectangle((0, round(844 * 0.80), 390, 844), fill=(240, 68, 56, 90))
    draw.rectangle((round(390 * 0.38), round(844 * 0.35), round(390 * 0.62), round(844 * 0.72)), outline=(56, 211, 255, 235), width=3)
    return Image.alpha_composite(card, overlay)


def companion_overlay(card, anchor, sprite):
    composed = card.copy()
    target_h = 146
    target_w = round(sprite.width * target_h / sprite.height)
    pet = sprite.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = round(390 * anchor[0] - target_w / 2)
    y = round(844 * anchor[1] - target_h)
    shadow = Image.new("RGBA", composed.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    sd.ellipse((x + target_w * 0.12, y + target_h * 0.88, x + target_w * 0.88, y + target_h * 1.02), fill=(0, 0, 0, 70))
    composed = Image.alpha_composite(composed, shadow)
    composed.alpha_composite(pet, (x, y))
    return composed


def make_sheet(cards, target, title):
    margin, gap, label_h = 24, 16, 54
    sheet = Image.new("RGB", (margin * 2 + 4 * 390 + 3 * gap, margin * 2 + label_h + 3 * 844 + 2 * gap), (17, 23, 35))
    draw = ImageDraw.Draw(sheet)
    draw.text((margin, 20), title, fill="white", font=font(24))
    for i, card in enumerate(cards):
        x = margin + (i % 4) * (390 + gap)
        y = margin + label_h + (i // 4) * (844 + gap)
        sheet.paste(card.convert("RGB"), (x, y))
    sheet.save(target, quality=92, optimize=True)


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    sprite = Image.open(SPRITE).convert("RGBA")
    safe_cards, placement_cards = [], []
    report = {"artSize": [1080, 1920], "previewSize": [390, 844], "files": []}

    for region, anchor in REGIONS.items():
        for phase in ("day", "night"):
            path = FOUNDATION / f"{region}_{phase}.png"
            raw_path = RAW / path.name
            if not raw_path.exists():
                Image.open(path).save(raw_path)
            source = Image.open(raw_path).convert("RGBA")
            normalized = source.resize((1080, 1920), Image.Resampling.LANCZOS)
            normalized.save(path, optimize=True)
            preview = normalized.resize((390, 844), Image.Resampling.LANCZOS)
            preview_path = PREVIEWS / f"{region}_{phase}.jpg"
            preview.convert("RGB").save(preview_path, quality=92, optimize=True)

            safe = safe_overlay(preview)
            label(safe, f"{region} / {phase} / safe-zone")
            safe_cards.append(safe)
            placed = companion_overlay(preview, anchor, sprite)
            label(placed, f"{region} / {phase} / anchor {anchor[0]:.2f},{anchor[1]:.2f}")
            placement_cards.append(placed)
            placed.convert("RGB").save(PREVIEWS / f"{region}_{phase}_companion.jpg", quality=92, optimize=True)
            report["files"].append({"path": str(path.relative_to(ROOT)).replace("\\", "/"), "size": list(normalized.size), "mode": normalized.mode, "anchor": list(anchor)})

    make_sheet(safe_cards, PREVIEWS / "six-region-day-night-safe-zone-contact-sheet.jpg", "Linkara R2 clay-resin safe-zone audit")
    make_sheet(placement_cards, PREVIEWS / "six-region-day-night-companion-placement-contact-sheet.jpg", "Linkara R2 clay-resin companion placement audit")
    (REPORTS / "dimension-and-alignment-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
