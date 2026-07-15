from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


CHARACTERS = (
    "thunder-pup",
    "wavecub",
    "starflame-phoenix",
    "star-foal",
    "goldenspark-wyrm",
)

ACTIONS = (
    "idle_calm",
    "idle_happy",
    "idle_angry",
    "idle_sad",
    "idle_defensive",
    "blink",
    "right_walk",
    "left_walk",
    "touch_accept",
    "touch_guarded",
    "touch_reject",
    "idle_sick",
    "idle_distant",
    "idle_enjoy",
    "sit",
    "sleep",
    "idle_wake",
    "special_angry",
    "special_sad",
    "hug",
    "idle_dance",
    "idle_wash",
    "special_dance",
    "attack_basic",
    "skill_cast",
    "defend",
    "hit",
    "faint",
    "victory",
)


def checkerboard(size: tuple[int, int], cell: int = 16) -> Image.Image:
    image = Image.new("RGB", size, "#262b33")
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill="#343b45")
    return image


def inspect_frame(frame: Image.Image) -> dict[str, object]:
    alpha = frame.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return {"empty": True}
    left, top, right, bottom = bbox
    margins = {
        "left": left,
        "top": top,
        "right": frame.width - right,
        "bottom": frame.height - bottom,
    }
    return {
        "empty": False,
        "bbox": [left, top, right, bottom],
        "margins": margins,
        "center_x": (left + right) / 2,
        "bottom_y": bottom,
        "alpha_extrema": list(alpha.getextrema()),
    }


def render_contact_sheet(
    character: str,
    action_sheets: list[tuple[str, Image.Image]],
    output: Path,
) -> None:
    columns = 4
    tile_width = 480
    image_height = 240
    label_height = 30
    tile_height = image_height + label_height
    rows = (len(action_sheets) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * tile_width, rows * tile_height), "#11151b")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()

    for index, (action, sheet) in enumerate(action_sheets):
        row, column = divmod(index, columns)
        x = column * tile_width
        y = row * tile_height
        preview = sheet.copy()
        preview.thumbnail((tile_width, image_height), Image.Resampling.LANCZOS)
        background = checkerboard((tile_width, image_height))
        paste_x = x + (tile_width - preview.width) // 2
        paste_y = y + (image_height - preview.height) // 2
        canvas.paste(background, (x, y))
        canvas.paste(preview, (paste_x, paste_y), preview)
        draw.rectangle((x, y + image_height, x + tile_width - 1, y + tile_height - 1), fill="#151a22")
        draw.text((x + 8, y + image_height + 9), f"{index + 1:02d} {action}", fill="#f0f3f7", font=font)
        draw.rectangle((x, y, x + tile_width - 1, y + tile_height - 1), outline="#586273")

    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("output/character-pilots"),
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=Path("output/character-pilots/FINAL_ALIGNMENT_CROP_AUDIT.json"),
    )
    parser.add_argument(
        "--review-dir",
        type=Path,
        default=Path("output/character-pilots/review-boards/final-alignment-audit"),
    )
    args = parser.parse_args()

    problems: list[dict[str, object]] = []
    frames: list[dict[str, object]] = []
    action_summaries: list[dict[str, object]] = []

    for character in CHARACTERS:
        contact_sources: list[tuple[str, Image.Image]] = []
        for action in ACTIONS:
            path = args.root / character / action / f"{character}_{action}_v1_512x512_8f.png"
            if not path.exists():
                problems.append({"character": character, "action": action, "problem": "missing-sheet"})
                continue

            sheet = Image.open(path).convert("RGBA")
            contact_sources.append((action, sheet))
            if sheet.size != (2048, 1024):
                problems.append(
                    {
                        "character": character,
                        "action": action,
                        "problem": "sheet-size",
                        "actual": list(sheet.size),
                    }
                )

            action_frames: list[dict[str, object]] = []
            for frame_index in range(8):
                column = frame_index % 4
                row = frame_index // 4
                frame = sheet.crop((column * 512, row * 512, column * 512 + 512, row * 512 + 512))
                inspected = inspect_frame(frame)
                record = {
                    "character": character,
                    "action": action,
                    "frame": frame_index + 1,
                    **inspected,
                }
                frames.append(record)
                action_frames.append(record)

                if inspected["empty"]:
                    problems.append({**record, "problem": "empty-frame"})
                    continue
                margins = inspected["margins"]
                assert isinstance(margins, dict)
                if min(int(value) for value in margins.values()) < 4:
                    problems.append({**record, "problem": "crop-or-edge-risk"})
                if abs(float(inspected["center_x"]) - 256) > 3:
                    problems.append({**record, "problem": "horizontal-center-drift"})

            nonempty = [frame for frame in action_frames if not frame["empty"]]
            bottom_values = [int(frame["bottom_y"]) for frame in nonempty]
            center_values = [float(frame["center_x"]) for frame in nonempty]
            bottom_span = max(bottom_values) - min(bottom_values) if bottom_values else None
            center_span = max(center_values) - min(center_values) if center_values else None
            if bottom_span is not None and bottom_span > 3:
                problems.append(
                    {
                        "character": character,
                        "action": action,
                        "problem": "within-action-bottom-anchor-drift",
                        "span": bottom_span,
                    }
                )
            if center_span is not None and center_span > 3:
                problems.append(
                    {
                        "character": character,
                        "action": action,
                        "problem": "within-action-horizontal-center-drift",
                        "span": center_span,
                    }
                )
            action_summaries.append(
                {
                    "character": character,
                    "action": action,
                    "bottom_y_span": bottom_span,
                    "center_x_span": center_span,
                }
            )

        render_contact_sheet(
            character,
            contact_sources,
            args.review_dir / f"{character}-all-29-actions.png",
        )

    nonempty_frames = [frame for frame in frames if not frame["empty"]]
    all_margins = [
        int(value)
        for frame in nonempty_frames
        for value in frame["margins"].values()
    ]
    center_values = [float(frame["center_x"]) for frame in nonempty_frames]
    bottom_values = [int(frame["bottom_y"]) for frame in nonempty_frames]
    report = {
        "status": "PASS" if not problems else "FAIL",
        "characters": len(CHARACTERS),
        "actions_per_character": len(ACTIONS),
        "sheets_expected": len(CHARACTERS) * len(ACTIONS),
        "frames_expected": len(CHARACTERS) * len(ACTIONS) * 8,
        "frames_inspected": len(frames),
        "requirements": {
            "frame_size": [512, 512],
            "sheet_size": [2048, 1024],
            "minimum_alpha_margin": 4,
            "maximum_center_offset": 3,
            "maximum_within_action_anchor_span": 3,
        },
        "observed": {
            "minimum_alpha_margin": min(all_margins) if all_margins else None,
            "maximum_alpha_margin": max(all_margins) if all_margins else None,
            "center_x_min": min(center_values) if center_values else None,
            "center_x_max": max(center_values) if center_values else None,
            "bottom_y_min": min(bottom_values) if bottom_values else None,
            "bottom_y_max": max(bottom_values) if bottom_values else None,
            "maximum_within_action_bottom_span": max(
                summary["bottom_y_span"] or 0 for summary in action_summaries
            ),
            "maximum_within_action_center_span": max(
                summary["center_x_span"] or 0 for summary in action_summaries
            ),
        },
        "problems": problems,
        "action_summaries": action_summaries,
        "frames": frames,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "status": report["status"],
                "sheets": report["sheets_expected"],
                "frames": report["frames_inspected"],
                "problems": len(problems),
                "observed": report["observed"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
