from __future__ import annotations

from pathlib import Path
import json
import math

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parents[2]
RAW = ROOT / "masters"
FOUNDATION = ROOT / "foundation"
LAYERS = ROOT / "layers"
PREVIEWS = ROOT / "previews"
REPORTS = ROOT / "reports"

ART_SIZE = (1080, 1920)
SAFE_SIZE = (390, 844)
REGIONS = (
    "central_radiant_core",
    "eastern_mystic_mountains",
    "northern_verdant_plains",
    "southeast_forge_hills",
    "southern_harbor_nexus",
    "southwest_tidal_frontier",
)
REGION_PLACEMENT = {
    "central_radiant_core": {"anchor": (0.50, 0.69), "depth": (0.40, 0.58)},
    "eastern_mystic_mountains": {"anchor": (0.50, 0.62), "depth": (0.38, 0.54)},
    "northern_verdant_plains": {"anchor": (0.50, 0.66), "depth": (0.40, 0.57)},
    "southeast_forge_hills": {"anchor": (0.50, 0.62), "depth": (0.40, 0.56)},
    "southern_harbor_nexus": {"anchor": (0.50, 0.68), "depth": (0.40, 0.57)},
    "southwest_tidal_frontier": {"anchor": (0.50, 0.63), "depth": (0.42, 0.58)},
}


def cover_crop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    scaled = image.resize(
        (math.ceil(image.width * scale), math.ceil(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (scaled.width - target_w) // 2
    top = (scaled.height - target_h) // 2
    return scaled.crop((left, top, left + target_w, top + target_h))


def save_png_resilient(image: Image.Image, path: Path) -> None:
    try:
        image.save(path, optimize=True)
    except OSError:
        if not path.exists():
            raise
        with Image.open(path) as existing:
            if existing.size != image.size:
                raise


def edge_correlation(day: Image.Image, night: Image.Image) -> float:
    def edge_values(image: Image.Image) -> list[float]:
        grayscale = image.convert("L").resize((135, 240), Image.Resampling.BILINEAR)
        edge = ImageOps.autocontrast(grayscale, cutoff=1).filter(ImageFilter.FIND_EDGES)
        return [float(value) for value in edge.get_flattened_data()]

    a = edge_values(day)
    b = edge_values(night)
    mean_a = sum(a) / len(a)
    mean_b = sum(b) / len(b)
    numerator = sum((x - mean_a) * (y - mean_b) for x, y in zip(a, b))
    denominator = math.sqrt(
        sum((x - mean_a) ** 2 for x in a)
        * sum((y - mean_b) ** 2 for y in b)
    )
    return round(numerator / denominator, 4) if denominator else 0.0


def companion_rect(anchor: tuple[float, float]) -> tuple[float, float, float, float]:
    return (anchor[0] - 0.12, anchor[1] - 0.25, 0.24, 0.27)


def add_safe_zone_overlay(
    image: Image.Image, anchor_normalized: tuple[float, float]
) -> Image.Image:
    audited = image.convert("RGBA")
    overlay = Image.new("RGBA", SAFE_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    top_y = round(SAFE_SIZE[1] * 0.12)
    bottom_y = round(SAFE_SIZE[1] * 0.80)
    draw.rectangle((0, 0, SAFE_SIZE[0], top_y), fill=(224, 52, 68, 70))
    draw.rectangle(
        (0, bottom_y, SAFE_SIZE[0], SAFE_SIZE[1]), fill=(224, 52, 68, 70)
    )

    rect = companion_rect(anchor_normalized)
    reserved = (
        round(SAFE_SIZE[0] * rect[0]),
        round(SAFE_SIZE[1] * rect[1]),
        round(SAFE_SIZE[0] * (rect[0] + rect[2])),
        round(SAFE_SIZE[1] * (rect[1] + rect[3])),
    )
    draw.rectangle(reserved, outline=(255, 210, 74, 235), width=3)

    anchor = (
        round(SAFE_SIZE[0] * anchor_normalized[0]),
        round(SAFE_SIZE[1] * anchor_normalized[1]),
    )
    draw.line((anchor[0] - 9, anchor[1], anchor[0] + 9, anchor[1]), fill=(54, 220, 255, 255), width=3)
    draw.line((anchor[0], anchor[1] - 9, anchor[0], anchor[1] + 9), fill=(54, 220, 255, 255), width=3)
    draw.ellipse((anchor[0] - 3, anchor[1] - 3, anchor[0] + 3, anchor[1] + 3), fill=(255, 255, 255, 255))

    return Image.alpha_composite(audited, overlay)


def load_companion_preview() -> Image.Image:
    sheet_path = REPO_ROOT / "assets/characters/greyshade-cat/previews/illustrated/emotion/greyshade-cat_idle_calm_512x512_8f_preview.png"
    with Image.open(sheet_path) as sheet:
        frame = sheet.convert("RGBA").crop((0, 0, sheet.width // 4, sheet.height // 2))
    bbox = frame.getbbox()
    if bbox:
        frame = frame.crop(bbox)
    target_h = 126
    target_w = round(frame.width * target_h / frame.height)
    return frame.resize((target_w, target_h), Image.Resampling.LANCZOS)


def add_companion(image: Image.Image, anchor_normalized: tuple[float, float]) -> Image.Image:
    composite = image.convert("RGBA")
    companion = load_companion_preview()
    anchor = (
        round(SAFE_SIZE[0] * anchor_normalized[0]),
        round(SAFE_SIZE[1] * anchor_normalized[1]),
    )
    position = (anchor[0] - companion.width // 2, anchor[1] - companion.height)
    composite.alpha_composite(companion, dest=position)
    return composite


def build_depth_mask(far_end: float, mid_end: float) -> Image.Image:
    mask = Image.new("L", ART_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    far_y = round(ART_SIZE[1] * far_end)
    mid_y = round(ART_SIZE[1] * mid_end)
    for y in range(ART_SIZE[1]):
        if y <= far_y:
            value = 255
        elif y <= mid_y:
            progress = (y - far_y) / max(1, mid_y - far_y)
            value = round(255 - 135 * progress)
        else:
            progress = (y - mid_y) / max(1, ART_SIZE[1] - mid_y)
            value = round(120 * (1 - progress))
        draw.line((0, y, ART_SIZE[0], y), fill=max(0, min(255, value)))
    return mask


def build_placement_mask(anchor_normalized: tuple[float, float]) -> Image.Image:
    mask = Image.new("L", ART_SIZE, 96)
    draw = ImageDraw.Draw(mask)
    draw.rectangle((0, 0, ART_SIZE[0], round(ART_SIZE[1] * 0.12)), fill=0)
    draw.rectangle((0, round(ART_SIZE[1] * 0.80), ART_SIZE[0], ART_SIZE[1]), fill=0)
    rect = companion_rect(anchor_normalized)
    draw.rectangle(
        (
            round(ART_SIZE[0] * rect[0]),
            round(ART_SIZE[1] * rect[1]),
            round(ART_SIZE[0] * (rect[0] + rect[2])),
            round(ART_SIZE[1] * (rect[1] + rect[3])),
        ),
        fill=255,
    )
    return mask


def build_contact_sheet(paths: list[tuple[str, Path]], filename: str) -> None:
    thumb_size = (195, 422)
    label_h = 24
    columns = 4
    rows = math.ceil(len(paths) / columns)
    sheet = Image.new("RGB", (thumb_size[0] * columns, (thumb_size[1] + label_h) * rows), (12, 18, 28))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, (label, path) in enumerate(paths):
        with Image.open(path) as image:
            thumb = image.convert("RGB").resize(thumb_size, Image.Resampling.LANCZOS)
        x = (index % columns) * thumb_size[0]
        y = (index // columns) * (thumb_size[1] + label_h)
        sheet.paste(thumb, (x, y))
        draw.text((x + 5, y + thumb_size[1] + 5), label, fill=(235, 240, 248), font=font)

    sheet.save(PREVIEWS / filename, quality=91)


def main() -> None:
    for directory in (FOUNDATION, LAYERS, PREVIEWS, REPORTS):
        directory.mkdir(parents=True, exist_ok=True)

    report: dict[str, object] = {
        "artSize": {"width": ART_SIZE[0], "height": ART_SIZE[1]},
        "safeZone": {"width": SAFE_SIZE[0], "height": SAFE_SIZE[1]},
        "uiForbidden": [
            {"id": "hud_top", "x": 0, "y": 0, "w": 1, "h": 0.12},
            {"id": "dock_bottom", "x": 0, "y": 0.8, "w": 1, "h": 0.2},
        ],
        "regions": {},
    }
    contact_paths: list[tuple[str, Path]] = []
    placement_paths: list[tuple[str, Path]] = []

    for region in REGIONS:
        anchor = REGION_PLACEMENT[region]["anchor"]
        depth = REGION_PLACEMENT[region]["depth"]
        rect = companion_rect(anchor)
        normalized: dict[str, Image.Image] = {}
        region_report: dict[str, object] = {
            "companionAnchor": {"x": anchor[0], "y": anchor[1]},
            "companionReservedRect": {
                "x": round(rect[0], 2),
                "y": round(rect[1], 2),
                "w": rect[2],
                "h": rect[3],
            },
            "phases": {},
        }
        depth_mask_path = LAYERS / f"{region}_depth_mask.png"
        placement_mask_path = LAYERS / f"{region}_placement_mask.png"
        save_png_resilient(build_depth_mask(depth[0], depth[1]), depth_mask_path)
        save_png_resilient(build_placement_mask(anchor), placement_mask_path)
        region_report["layers"] = {
            "depthMask": str(depth_mask_path.relative_to(ROOT)).replace("\\", "/"),
            "placementMask": str(placement_mask_path.relative_to(ROOT)).replace("\\", "/"),
            "foregroundOcclusion": "pending_human_selected_extraction",
            "placeableProps": "pending_separate_groundwork_promotion",
        }
        for phase in ("day", "night"):
            raw_path = RAW / f"{region}_{phase}_raw.png"
            with Image.open(raw_path) as source:
                art = source.convert("RGBA").resize(ART_SIZE, Image.Resampling.LANCZOS)
            foundation_path = FOUNDATION / f"{region}_{phase}.png"
            save_png_resilient(art, foundation_path)
            normalized[phase] = art

            mobile = cover_crop(art, SAFE_SIZE)
            preview_path = PREVIEWS / f"{region}_{phase}_390x844.png"
            save_png_resilient(mobile, preview_path)
            audit_path = PREVIEWS / f"{region}_{phase}_safe-zone.png"
            save_png_resilient(add_safe_zone_overlay(mobile, anchor), audit_path)
            placement_path = PREVIEWS / f"{region}_{phase}_companion-placement.png"
            save_png_resilient(add_companion(mobile, anchor), placement_path)
            contact_paths.append((f"{region} {phase}", audit_path))
            placement_paths.append((f"{region} {phase}", placement_path))

            region_report["phases"][phase] = {
                "source": str(raw_path.relative_to(ROOT)).replace("\\", "/"),
                "foundation": str(foundation_path.relative_to(ROOT)).replace("\\", "/"),
                "preview": str(preview_path.relative_to(ROOT)).replace("\\", "/"),
                "audit": str(audit_path.relative_to(ROOT)).replace("\\", "/"),
                "placementPreview": str(placement_path.relative_to(ROOT)).replace("\\", "/"),
                "size": list(art.size),
                "mode": art.mode,
            }

        region_report["dayNightEdgeCorrelation"] = edge_correlation(
            normalized["day"], normalized["night"]
        )
        report["regions"][region] = region_report

    build_contact_sheet(
        contact_paths, "six-region-day-night-safe-zone-contact-sheet.jpg"
    )
    build_contact_sheet(
        placement_paths, "six-region-day-night-companion-placement-contact-sheet.jpg"
    )
    (REPORTS / "dimension-and-alignment-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
