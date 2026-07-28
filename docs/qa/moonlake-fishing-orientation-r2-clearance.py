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
)

ORIENTATIONS = (
    ("front-right", "fishing_front", "bridge_mid", False, "right", 0),
    ("front-left", "fishing_front", "bridge_mid", True, "left", 0),
    ("side-right", "fishing_side", "bridge_mid", False, "right", 8),
    ("side-left", "fishing_side", "bridge_mid", True, "left", -8),
    ("back-far", "fishing_back", "bridge_far", False, "far", 0),
)

FRAME_SIZE = 512
MAX_SPRITE_HEIGHT_PX = 170
RENDER_SCALE = 1.2
BREATHING_SCALE_CEILING = 1.007
ROUTE_SCALES = {
    "bridge_mid": 0.45,
    "bridge_far": 0.42,
}
BRIDGE_BODY_LIMIT_PX = 66.0
MIN_SIDE_WATER_REACH_PX = 25.0
BRIDGE_MID_RAIL_HALF_WIDTH_PX = 26.0
MIN_STABLE_LINE_OVERHANG_PX = 4.0
STABLE_SIDE_FRAMES = frozenset((0, 4, 5, 7))


def load_manifest(companion_id: str) -> dict:
    path = ROOT / "assets" / "characters" / companion_id / "metadata" / "animations.json"
    return json.loads(path.read_text(encoding="utf-8"))


def frame_masks(entry: dict) -> list[Image.Image]:
    sheet = ROOT / str(entry["sheet"]).removeprefix("./")
    frame_width = int(entry["frameWidth"])
    frame_height = int(entry["frameHeight"])
    columns = int(entry["columns"])
    frame_count = int(entry["frameCount"])
    with Image.open(sheet) as source:
        image = source.convert("RGBA")
        return [
            image.crop(
                (
                    (index % columns) * frame_width,
                    (index // columns) * frame_height,
                    (index % columns + 1) * frame_width,
                    (index // columns + 1) * frame_height,
                )
            ).getchannel("A")
            for index in range(frame_count)
        ]


def dense_body_bounds(alpha: Image.Image) -> tuple[int, int] | None:
    # Rods and fishing lines are intentionally thin. Counting opaque pixels in
    # the lower interaction band keeps the dense character body while excluding
    # those water-reaching elements from bridge-deck clearance.
    lower = alpha.crop((0, 190, FRAME_SIZE, FRAME_SIZE))
    dense_columns = []
    for x in range(FRAME_SIZE):
        column = lower.crop((x, 0, x + 1, lower.height))
        values = column.get_flattened_data()
        opaque_count = sum(1 for value in values if value >= 24)
        if opaque_count >= 12:
            dense_columns.append(x)
    if not dense_columns:
        return None
    return min(dense_columns), max(dense_columns) + 1


def display_scale(route_id: str) -> float:
    return (
        MAX_SPRITE_HEIGHT_PX
        / FRAME_SIZE
        * RENDER_SCALE
        * ROUTE_SCALES[route_id]
        * BREATHING_SCALE_CEILING
    )


def main() -> None:
    cases = []
    failures = []
    for companion_id in COMPANION_IDS:
        manifest = load_manifest(companion_id)
        cached_masks: dict[str, list[Image.Image]] = {}
        for (
            case_id,
            animation_id,
            route_id,
            mirror_x,
            water_side,
            rail_offset_x390,
        ) in ORIENTATIONS:
            entry = manifest.get(animation_id)
            if not entry:
                failures.append(f"{companion_id}: missing {animation_id}")
                continue
            cached_masks.setdefault(animation_id, frame_masks(entry))
            scale = display_scale(route_id)
            body_widths = []
            body_centers = []
            water_reaches = []
            stable_line_overhangs = []
            for frame_index, alpha in enumerate(cached_masks[animation_id]):
                bounds = alpha.getbbox()
                body = dense_body_bounds(alpha)
                if bounds is None or body is None:
                    failures.append(
                        f"{companion_id}: empty body in {animation_id}"
                    )
                    continue
                body_left, body_right = body
                body_widths.append((body_right - body_left) * scale)
                body_center = (body_left + body_right) / 2
                body_centers.append(body_center)
                if water_side == "right":
                    water_reaches.append((bounds[2] - FRAME_SIZE / 2) * scale)
                elif water_side == "left":
                    # The authored rod points right. Runtime mirroring reflects
                    # that right-hand extent onto the left water side.
                    water_reaches.append((bounds[2] - FRAME_SIZE / 2) * scale)
                if (
                    animation_id == "fishing_side"
                    and frame_index in STABLE_SIDE_FRAMES
                ):
                    stable_line_overhangs.append(
                        (bounds[2] - FRAME_SIZE / 2) * scale
                        + abs(rail_offset_x390)
                        - BRIDGE_MID_RAIL_HALF_WIDTH_PX
                    )

            max_body_width = max(body_widths, default=0)
            max_center_drift = max(
                (abs(center - FRAME_SIZE / 2) * scale for center in body_centers),
                default=0,
            )
            max_water_reach = max(water_reaches, default=None)
            min_stable_line_overhang = min(
                stable_line_overhangs,
                default=None,
            )
            passed = (
                max_body_width <= BRIDGE_BODY_LIMIT_PX
                and (
                    max_water_reach is None
                    or max_water_reach >= MIN_SIDE_WATER_REACH_PX
                )
                and (
                    min_stable_line_overhang is None
                    or min_stable_line_overhang
                    >= MIN_STABLE_LINE_OVERHANG_PX
                )
            )
            case = {
                "companionId": companion_id,
                "caseId": case_id,
                "animationId": animation_id,
                "routeId": route_id,
                "mirrorX": mirror_x,
                "waterSide": water_side,
                "railOffsetX390": rail_offset_x390,
                "maxDenseBodyWidthPx390": round(max_body_width, 2),
                "maxDenseBodyCenterDriftPx390": round(max_center_drift, 2),
                "maxWaterReachPx390": (
                    None if max_water_reach is None else round(max_water_reach, 2)
                ),
                "minStableLineOverhangPx390": (
                    None
                    if min_stable_line_overhang is None
                    else round(min_stable_line_overhang, 2)
                ),
                "pass": passed,
            }
            cases.append(case)
            if not passed:
                failures.append(
                    f"{companion_id}/{case_id}: body={max_body_width:.2f}px "
                    f"drift={max_center_drift:.2f}px "
                    f"reach={max_water_reach} "
                    f"stableOverhang={min_stable_line_overhang}"
                )

    summary = {
        "pass": not failures,
        "companionCount": len(COMPANION_IDS),
        "orientationCount": len(ORIENTATIONS),
        "caseCount": len(cases),
        "bridgeBodyLimitPx390": BRIDGE_BODY_LIMIT_PX,
        "minimumWaterReachPx390": MIN_SIDE_WATER_REACH_PX,
        "bridgeMidRailHalfWidthPx390": BRIDGE_MID_RAIL_HALF_WIDTH_PX,
        "minimumStableLineOverhangPx390": MIN_STABLE_LINE_OVERHANG_PX,
        "widestBodies": sorted(
            cases,
            key=lambda case: case["maxDenseBodyWidthPx390"],
            reverse=True,
        )[:8],
        "shortestMaximumWaterReach": sorted(
            (case for case in cases if case["maxWaterReachPx390"] is not None),
            key=lambda case: case["maxWaterReachPx390"],
        )[:8],
        "shortestStableLineOverhang": sorted(
            (
                case
                for case in cases
                if case["minStableLineOverhangPx390"] is not None
            ),
            key=lambda case: case["minStableLineOverhangPx390"],
        )[:8],
        "failures": failures,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
