from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[2]
COMPANION_IDS = (
    "greyshade-cat",
    "auriowl",
    "sprigfawn",
    "crystalfin-seahorse",
    "blazetail-kit",
    "starstripe-cub",
    "thunder-pup",
    "wavecub",
    "starflame-phoenix",
    "star-foal",
    "goldenspark-wyrm",
    "flame-flicker",
    "ice-talon",
    "stone-shard",
    "vine-twist",
    "crystal-rabbit",
)
MECHANICALLY_MIRRORED_IDS = {
    "auriowl",
    "crystalfin-seahorse",
    "blazetail-kit",
    "starstripe-cub",
}


def animation_sheet(companion_id: str, animation_name: str) -> Path:
    metadata_path = ROOT / "assets" / "characters" / companion_id / "metadata" / "animations.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    sheet = metadata[animation_name]["sheet"].removeprefix("./")
    return ROOT / sheet


def flattened_preview(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA").resize((512, 256), Image.Resampling.LANCZOS)
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    background.alpha_composite(image)
    return background.convert("RGB")


def mean_difference(left: Image.Image, right: Image.Image) -> float:
    return sum(ImageStat.Stat(ImageChops.difference(left, right)).mean) / 3


results = []
for companion_id in COMPANION_IDS:
    left_path = animation_sheet(companion_id, "left_walk")
    right_path = animation_sheet(companion_id, "right_walk")
    if not left_path.exists() or not right_path.exists():
        raise AssertionError(f"{companion_id}: directional walk sheet missing")

    left = Image.open(left_path).convert("RGBA")
    right = Image.open(right_path).convert("RGBA")
    if left.size != right.size:
        raise AssertionError(f"{companion_id}: left/right sheet dimensions differ")

    left_preview = flattened_preview(left_path)
    right_preview = flattened_preview(right_path)
    same_direction_difference = mean_difference(right_preview, left_preview)
    mirrored_direction_difference = mean_difference(
        right_preview,
        ImageOps.mirror(left_preview),
    )
    if mirrored_direction_difference >= same_direction_difference:
        raise AssertionError(
            f"{companion_id}: right_walk is visually closer to left-facing than right-facing"
        )

    exact_mirror = ImageChops.difference(right, ImageOps.mirror(left)).getbbox() is None
    if companion_id in MECHANICALLY_MIRRORED_IDS and not exact_mirror:
        raise AssertionError(f"{companion_id}: repaired right_walk is not an exact left-sheet mirror")

    results.append(
        {
            "companionId": companion_id,
            "sameDirectionDifference": round(same_direction_difference, 3),
            "mirroredDirectionDifference": round(mirrored_direction_difference, 3),
            "exactMirror": exact_mirror,
        }
    )

print(
    json.dumps(
        {
            "pass": True,
            "companions": len(results),
            "mechanicallyMirrored": sorted(MECHANICALLY_MIRRORED_IDS),
            "results": results,
        },
        ensure_ascii=False,
        indent=2,
    )
)
