from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "playwright" / "moonlake-fishing-orientation-r2-2"
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
    "front-right",
    "front-left",
    "side-right",
    "side-left",
    "back-far",
)

CELL_WIDTH = 270
CELL_HEIGHT = 290
LABEL_HEIGHT = 24
CROP = (165, 205, 355, 405)
SHEET_COLUMNS = 4
SHEET_ROWS = 4


def font() -> ImageFont.ImageFont:
    arial = Path("C:/Windows/Fonts/arial.ttf")
    return ImageFont.truetype(str(arial), 15) if arial.exists() else ImageFont.load_default()


def main() -> None:
    label_font = font()
    for orientation in ORIENTATIONS:
        sheet = Image.new(
            "RGB",
            (CELL_WIDTH * SHEET_COLUMNS, CELL_HEIGHT * SHEET_ROWS),
            "#08111d",
        )
        draw = ImageDraw.Draw(sheet)
        for index, companion_id in enumerate(COMPANION_IDS):
            source_path = OUTPUT / f"{orientation}-{companion_id}.png"
            if not source_path.exists():
                raise FileNotFoundError(source_path)
            with Image.open(source_path) as source:
                scene = source.convert("RGB").crop(CROP)
                scene.thumbnail((CELL_WIDTH, CELL_HEIGHT - LABEL_HEIGHT), Image.Resampling.LANCZOS)
            column = index % SHEET_COLUMNS
            row = index // SHEET_COLUMNS
            left = column * CELL_WIDTH
            top = row * CELL_HEIGHT
            image_x = left + (CELL_WIDTH - scene.width) // 2
            image_y = top + LABEL_HEIGHT
            sheet.paste(scene, (image_x, image_y))
            draw.text(
                (left + 8, top + 4),
                companion_id,
                fill="#f4f8ff",
                font=label_font,
            )
        sheet.save(
            OUTPUT / f"{orientation}-contact-sheet.png",
            format="PNG",
            optimize=True,
        )
        print(OUTPUT / f"{orientation}-contact-sheet.png")


if __name__ == "__main__":
    main()
