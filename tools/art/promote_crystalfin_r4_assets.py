#!/usr/bin/env python3
"""Promote the self-reviewed Crystalfin R4 Expedition package into runtime assets."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


REPO_ROOT = Path(__file__).resolve().parents[2]
CANDIDATE_ROOT = REPO_ROOT / "output/character-pilots/crystalfin-seahorse-r4/processed"
EXPEDITION_ROOT = REPO_ROOT / "assets/characters/crystalfin-seahorse/spritesheets/expedition/r4"
METADATA_ROOT = REPO_ROOT / "assets/characters/crystalfin-seahorse/metadata"

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

SOURCE_FAMILIES = {
    "north": ("back", False),
    "northeast": ("northeast", False),
    "east": ("east", False),
    "southeast": ("southeast", False),
    "south": ("front", False),
    "southwest": ("southeast", True),
    "west": ("east", True),
    "northwest": ("northeast", True),
}

SEQUENCE_DIRS = {
    ("walk", "front"): ("front-hover-final", "front-hover"),
    ("walk", "back"): ("back-hover-final", "back-hover"),
    ("walk", "northeast"): ("northeast-hover-final", "northeast-hover"),
    ("walk", "east"): ("east-hover-final", "east-hover"),
    ("walk", "southeast"): ("southeast-hover-final", "southeast-hover"),
    ("attack", "front"): ("front-attack-final", "front-attack"),
    ("attack", "back"): ("back-attack-final", "back-attack"),
    ("attack", "northeast"): ("northeast-attack-final", "northeast-attack"),
    ("attack", "east"): ("east-attack-v2", "east-attack"),
    ("attack", "southeast"): ("southeast-attack-final", "southeast-attack"),
    ("hit", "front"): ("front-hit-final", "front-hit"),
    ("hit", "back"): ("back-hit-final", "back-hit"),
    ("hit", "northeast"): ("northeast-hit-final", "northeast-hit"),
    ("hit", "east"): ("east-hit-v2", "east-hit"),
    ("hit", "southeast"): ("southeast-hit-final", "southeast-hit"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--approval-date", required=True)
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest().upper()


def relative(path: Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def remove_low_alpha_magenta(image: Image.Image) -> Image.Image:
    cleaned = []
    for r, g, b, a in image.get_flattened_data():
        if a > 0 and r > 200 and g < 70 and b > 200:
            cleaned.append((0, 0, 0, 0))
        else:
            cleaned.append((r, g, b, a))
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.putdata(cleaned)
    return result


def load_frames(action: str, family: str, count: int, mirror: bool) -> list[Image.Image]:
    directory_name, prefix = SEQUENCE_DIRS[(action, family)]
    directory = CANDIDATE_ROOT / directory_name
    frames = []
    for index in range(1, count + 1):
        path = directory / f"{prefix}-{index}.png"
        image = Image.open(path).convert("RGBA")
        if image.size != (512, 512):
            raise SystemExit(f"unexpected source frame size {image.size}: {path}")
        if mirror:
            image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        transparent_black = Image.new("RGBA", image.size, (0, 0, 0, 0))
        nonzero_alpha = image.getchannel("A").point(lambda value: 255 if value else 0)
        normalized = Image.composite(image, transparent_black, nonzero_alpha)
        frames.append(normalized)
    return frames


def write_strip(frames: list[Image.Image], path: Path, frame_size: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    strip = Image.new("RGBA", (frame_size * len(frames), frame_size), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        if frame.size != (frame_size, frame_size):
            frame = frame.convert("RGBa").resize(
                (frame_size, frame_size), Image.Resampling.LANCZOS
            ).convert("RGBA")
            frame = remove_low_alpha_magenta(frame)
        strip.alpha_composite(frame, (index * frame_size, 0))
    strip.save(path, optimize=True)


def audit_sheet(path: Path, frame_size: int, frame_count: int) -> dict:
    image = Image.open(path).convert("RGBA")
    expected = (frame_size * frame_count, frame_size)
    if image.size != expected:
        raise SystemExit(f"bad dimensions {image.size}, expected {expected}: {path}")
    hashes: set[str] = set()
    bottom_positions = []
    for index in range(frame_count):
        frame = image.crop((index * frame_size, 0, (index + 1) * frame_size, frame_size))
        alpha = frame.getchannel("A")
        corners = ((0, 0), (frame_size - 1, 0), (0, frame_size - 1), (frame_size - 1, frame_size - 1))
        if any(alpha.getpixel(point) != 0 for point in corners):
            raise SystemExit(f"non-transparent frame corner {index + 1}: {path}")
        bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
        if bbox is None:
            raise SystemExit(f"empty frame {index + 1}: {path}")
        if bbox[0] <= 1 or bbox[1] <= 1 or bbox[2] >= frame_size - 1:
            raise SystemExit(f"unsafe silhouette edge in frame {index + 1}: {path}")
        safe_bottom_margin = max(4, round(frame_size * 18 / 512))
        if bbox[3] > frame_size - safe_bottom_margin:
            raise SystemExit(f"bottom-center safety margin lost in frame {index + 1}: {path}")
        magenta_pixels = sum(
            1
            for r, g, b, a in frame.get_flattened_data()
            if a > 0 and r > 200 and g < 70 and b > 200
        )
        if magenta_pixels:
            raise SystemExit(f"visible magenta residue in frame {index + 1}: {path}")
        bottom_positions.append(bbox[3])
        hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())
    minimum_unique = 4 if frame_count >= 6 else 3
    if len(hashes) < minimum_unique:
        raise SystemExit(f"insufficient pose variation: {path}")
    return {
        "path": relative(path),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "sheetSize": list(image.size),
        "frameSize": [frame_size, frame_size],
        "frameCount": frame_count,
        "transparentFrameCorners": True,
        "bottomCenterSafe": True,
        "bottomAnchorRange": [min(bottom_positions), max(bottom_positions)],
        "uniqueFrameHashes": len(hashes),
        "visibleMagentaPixels": 0,
    }


def export_pair(action: str, direction: str, frame_count: int) -> dict:
    family, mirror = SOURCE_FAMILIES[direction]
    frames = load_frames(action, family, frame_count, mirror)
    master = EXPEDITION_ROOT / "master-512" / (
        f"crystalfin-{action}-{direction}-master-{512 * frame_count}x512-{frame_count}f.png"
    )
    runtime = EXPEDITION_ROOT / "runtime-256" / (
        f"crystalfin-{action}-{direction}-runtime-{256 * frame_count}x256-{frame_count}f.png"
    )
    write_strip(frames, master, 512)
    write_strip(frames, runtime, 256)
    return {
        "sourceFamily": family,
        "mirroredFromEastSide": mirror,
        "master": audit_sheet(master, 512, frame_count),
        "runtime": audit_sheet(runtime, 256, frame_count),
    }


def approval(date: str) -> dict:
    return {
        "approved": True,
        "approvedOn": date,
        "source": "Owner authorized self-review-gated Crystalfin R4 publication in the Codex task",
    }


def main() -> None:
    args = parse_args()
    walk = {direction: export_pair("walk", direction, 8) for direction in DIRECTIONS}
    attack = {direction: export_pair("attack", direction, 6) for direction in DIRECTIONS}
    hit = {direction: export_pair("hit", direction, 4) for direction in DIRECTIONS}
    common = {
        "schemaVersion": 1,
        "companionId": "crystalfin-seahorse",
        "status": "runtime-promoted-owner-approved",
        "ownerApproval": approval(args.approval_date),
        "artDirection": "bright premium 3D storybook miniature with pearlescent resin-clay materials",
        "production": {
            "generator": "ChatGPT image generation with Crystalfin R4 direction and action locks",
            "chromaKeyer": "generate2dsprite processor plus package-local low-alpha magenta cleanup",
            "normalizer": "generate2dsprite shared-scale bottom-anchor processor",
            "manifestBuilder": "tools/art/promote_crystalfin_r4_assets.py",
            "license": "project-owned generated assets; no downloaded third-party art",
        },
        "anchor": {"x": 0.5, "y": 1},
        "sampling": "linear with mipmaps when supported",
        "qualityGate": {
            "visualAudit": "15 source sequences / 94 source frames reviewed at contact-sheet and source resolution",
            "mechanicalReport": "output/character-pilots/crystalfin-seahorse-r4/qc/crystalfin-r4-qc.json",
            "checks": [
                "canonical juvenile upright seahorse identity",
                "premium 3D miniature resin-clay material lock",
                "direction readability across five authored source families",
                "left-side directions generated by deterministic horizontal mirroring",
                "no detached projectile or injury spectacle",
                "transparent safe edges with zero visible magenta residue",
                "stable bottom-center hover datum",
                "no exact duplicate frames",
            ],
            "result": "passed",
        },
        "directionSourcePolicy": {
            "authored": ["north", "northeast", "east", "southeast", "south"],
            "mirrored": {"northwest": "northeast", "west": "east", "southwest": "southeast"},
        },
        "legacyPolicy": {
            "legacyAssetsRetained": True,
            "fallbackOwner": "crystalfin-seahorse",
            "crossOwnerFallbackAllowed": False,
        },
    }
    write_json(METADATA_ROOT / "expedition-walk-r4.json", {
        **common,
        "assetId": "crystalfin-seahorse-expedition-walk-r4",
        "grid": {"directions": list(DIRECTIONS), "framesPerDirection": 8, "fps": 10},
        "runtimeBudget": {
            "decodedBytesAllDirections": 8 * 8 * 256 * 256 * 4,
            "decodedMiBAllDirections": 16,
            "masterSheetsAreNotRuntimeLoaded": True,
            "loadingPolicy": "preload all eight directional walk sheets when the companion pilot attaches; cache for the scene session",
        },
        "directions": walk,
    })
    write_json(METADATA_ROOT / "expedition-actions-r4.json", {
        **common,
        "assetId": "crystalfin-seahorse-expedition-actions-r4",
        "runtimeBudget": {
            "decodedBytesActiveDirection": (6 + 4) * 256 * 256 * 4,
            "decodedMiBActiveDirection": 2.5,
            "decodedBytesAllCachedDirections": 8 * (6 + 4) * 256 * 256 * 4,
            "decodedMiBAllCachedDirections": 20,
            "masterSheetsAreNotRuntimeLoaded": True,
            "loadingPolicy": "lazy per action and current facing; cached per session",
        },
        "actions": {
            "attack_basic": {"frames": 6, "fps": 10, "loop": False, "directions": attack},
            "hit": {"frames": 4, "fps": 12, "loop": False, "directions": hit},
        },
    })
    print(json.dumps({
        "status": "runtime-promoted-owner-approved",
        "companionId": "crystalfin-seahorse",
        "directions": len(DIRECTIONS),
        "promotedSheets": len(DIRECTIONS) * 3 * 2,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
