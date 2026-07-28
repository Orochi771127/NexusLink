from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
COMPANION_IDS = (
    "greyshade-cat",
    "flame-flicker",
    "ice-talon",
    "stone-shard",
    "vine-twist",
    "crystal-rabbit",
    "sprigfawn",
    "starstripe-cub",
    "auriowl",
    "blazetail-kit",
    "crystalfin-seahorse",
    "thunder-pup",
    "wavecub",
    "starflame-phoenix",
    "star-foal",
    "goldenspark-wyrm",
)

FRAME_HEIGHT = 512
MAX_SPRITE_HEIGHT_PX = 170
RENDER_SCALE = 1.2
BREATHING_SCALE_CEILING = 1.007
ROUTE_SCALES = {
    "bridge_near": 0.495,
    "bridge_mid": 0.45,
    "bridge_far": 0.42,
}
LIMITS = {
    "bridge_near": 66.0,
    "bridge_mid": 66.0,
    "bridge_far": 66.0,
}


def load_manifest(companion_id: str) -> dict:
    path = ROOT / "assets" / "characters" / companion_id / "metadata" / "animations.json"
    return json.loads(path.read_text(encoding="utf-8"))


def alpha_widths(entry: dict) -> list[int]:
    sheet = ROOT / str(entry["sheet"]).removeprefix("./")
    frame_width = int(entry["frameWidth"])
    frame_height = int(entry["frameHeight"])
    columns = int(entry["columns"])
    frame_count = int(entry["frameCount"])
    with Image.open(sheet) as source:
        image = source.convert("RGBA")
        widths = []
        for frame_index in range(frame_count):
            left = (frame_index % columns) * frame_width
            top = (frame_index // columns) * frame_height
            alpha = image.crop(
                (left, top, left + frame_width, top + frame_height)
            ).getchannel("A")
            bounds = alpha.getbbox()
            widths.append(0 if bounds is None else bounds[2] - bounds[0])
    return widths


def displayed_width(alpha_width: int, route_scale: float) -> float:
    sprite_scale = MAX_SPRITE_HEIGHT_PX / FRAME_HEIGHT * RENDER_SCALE
    return alpha_width * sprite_scale * route_scale * BREATHING_SCALE_CEILING


def main() -> None:
    cases = []
    failures = []
    for companion_id in COMPANION_IDS:
        manifest = load_manifest(companion_id)
        for animation_id, stops in (
            ("back_walk", ("bridge_near", "bridge_mid", "bridge_far")),
            ("fishing_back", ("bridge_far",)),
        ):
            entry = manifest.get(animation_id)
            if not entry:
                failures.append(f"{companion_id}: missing {animation_id}")
                continue
            widths = alpha_widths(entry)
            if len(widths) != 8 or min(widths) <= 0:
                failures.append(
                    f"{companion_id}: {animation_id} has invalid alpha frames {widths}"
                )
                continue
            alpha_width = max(widths)
            for stop in stops:
                width_px = displayed_width(alpha_width, ROUTE_SCALES[stop])
                limit_px = LIMITS[stop]
                passed = width_px <= limit_px
                cases.append(
                    {
                        "companionId": companion_id,
                        "animationId": animation_id,
                        "stop": stop,
                        "maxOpaqueWidthSourcePx": alpha_width,
                        "displayedWidthPx390": round(width_px, 2),
                        "limitPx390": limit_px,
                        "pass": passed,
                    }
                )
                if not passed:
                    failures.append(
                        f"{companion_id}: {animation_id} at {stop} "
                        f"{width_px:.2f}px exceeds {limit_px:.2f}px"
                    )

    summary = {
        "pass": not failures,
        "companionCount": len(COMPANION_IDS),
        "caseCount": len(cases),
        "animations": ["back_walk", "fishing_back"],
        "routeScales": ROUTE_SCALES,
        "widestCases": sorted(
            cases,
            key=lambda case: case["displayedWidthPx390"],
            reverse=True,
        )[:8],
        "failures": failures,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
