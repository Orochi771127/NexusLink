#!/usr/bin/env python3
"""Promote the Owner-approved Blazetail R3 candidate package into runtime assets."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image

from build_global_3d_pilot_manifests import glb_stats, read_glb_json


REPO_ROOT = Path(__file__).resolve().parents[2]
CANDIDATE_ROOT = REPO_ROOT / "output/character-pilots/blazetail-kit-r3"
EXPEDITION_SOURCE = CANDIDATE_ROOT / "expedition/processed"
EXPEDITION_ROOT = REPO_ROOT / "assets/characters/blazetail-kit/spritesheets/expedition/r3"
METADATA_ROOT = REPO_ROOT / "assets/characters/blazetail-kit/metadata"
ORBIT_ROOT = REPO_ROOT / "assets/3d/orbit-tops-r3"

DIRECTIONS = (
    ("north", "n"),
    ("northeast", "ne"),
    ("east", "e"),
    ("southeast", "se"),
    ("south", "s"),
    ("southwest", "sw"),
    ("west", "w"),
    ("northwest", "nw"),
)


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


def audit_sheet(path: Path, frame_size: int, frame_count: int) -> dict:
    image = Image.open(path).convert("RGBA")
    expected = (frame_size * frame_count, frame_size)
    if image.size != expected:
        raise SystemExit(f"bad dimensions {image.size}, expected {expected}: {path}")
    hashes: set[str] = set()
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
        hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())
    minimum_unique = 4 if frame_count >= 6 else 3
    if len(hashes) < minimum_unique:
        raise SystemExit(f"insufficient pose variation: {path}")
    return {
        "path": relative(path),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "sheetSize": [image.width, image.height],
        "frameSize": [frame_size, frame_size],
        "frameCount": frame_count,
        "transparentFrameCorners": True,
        "bottomCenterSafe": True,
        "uniqueFrameHashes": len(hashes),
    }


def export_pair(source: Path, stem: str, frame_count: int) -> dict:
    master_dir = EXPEDITION_ROOT / "master-512"
    runtime_dir = EXPEDITION_ROOT / "runtime-256"
    master_dir.mkdir(parents=True, exist_ok=True)
    runtime_dir.mkdir(parents=True, exist_ok=True)
    master = master_dir / f"{stem}-master-{512 * frame_count}x512-{frame_count}f.png"
    runtime = runtime_dir / f"{stem}-runtime-{256 * frame_count}x256-{frame_count}f.png"
    shutil.copy2(source, master)
    source_image = Image.open(source).convert("RGBA")
    frames = []
    for index in range(frame_count):
        frame = source_image.crop((index * 512, 0, (index + 1) * 512, 512))
        frames.append(frame.resize((256, 256), Image.Resampling.LANCZOS))
    strip = Image.new("RGBA", (256 * frame_count, 256), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * 256, 0))
    strip.save(runtime, optimize=True)
    return {
        "master": audit_sheet(master, 512, frame_count),
        "runtime": audit_sheet(runtime, 256, frame_count),
    }


def approval(date: str) -> dict:
    return {
        "approved": True,
        "approvedOn": date,
        "source": "Owner explicitly stated Blazetail R3 passed in the Codex task",
    }


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def promote_expedition(date: str) -> None:
    walk = {}
    attack = {}
    hit = {}
    for direction, short in DIRECTIONS:
        walk[direction] = export_pair(
            EXPEDITION_SOURCE / f"blazetail-kit_walk_{short}_master_4096x512_8f.png",
            f"blazetail-walk-{direction}",
            8,
        )
        attack[direction] = export_pair(
            EXPEDITION_SOURCE / f"blazetail-kit_attack_basic_{short}_master_3072x512_6f.png",
            f"blazetail-attack-{direction}",
            6,
        )
        hit[direction] = export_pair(
            EXPEDITION_SOURCE / f"blazetail-kit_hit_{short}_master_2048x512_4f.png",
            f"blazetail-hit-{direction}",
            4,
        )
    common = {
        "schemaVersion": 1,
        "companionId": "blazetail-kit",
        "status": "runtime-promoted-owner-approved",
        "ownerApproval": approval(date),
        "artDirection": "bright premium 3D storybook miniature with rounded resin-clay materials",
        "production": {
            "generator": "ChatGPT image generation with Blazetail R3 direction locks",
            "chromaKeyer": "tools/art/key_chroma_sprite_sheet.py",
            "normalizer": "tools/art/normalize_illustrated_sprite_grid.py",
            "manifestBuilder": "tools/art/promote_blazetail_r3_assets.py",
            "license": "project-owned generated assets; no downloaded third-party art",
        },
        "anchor": {"x": 0.5, "y": 1},
        "sampling": "linear with mipmaps when supported",
        "qualityGate": {
            "visualAudit": "24 promoted sheets / 144 frames reviewed at contact-sheet and source resolution",
            "checks": [
                "canonical juvenile Blazetail identity",
                "exactly one flame tail",
                "direction readability",
                "no detached combat FX",
                "transparent safe edges",
                "bottom-center anchor stability",
            ],
            "result": "passed",
        },
        "legacyPolicy": {
            "legacyAssetsRetained": True,
            "fallbackOwner": "blazetail-kit",
            "crossOwnerFallbackAllowed": False,
        },
    }
    write_json(METADATA_ROOT / "expedition-walk-r3.json", {
        **common,
        "assetId": "blazetail-kit-expedition-walk-r3",
        "grid": {"directions": [name for name, _ in DIRECTIONS], "framesPerDirection": 8, "fps": 10},
        "runtimeBudget": {
            "decodedBytesAllDirections": 8 * 8 * 256 * 256 * 4,
            "decodedMiBAllDirections": 16,
            "masterSheetsAreNotRuntimeLoaded": True,
            "loadingPolicy": "lazy current-facing sheet; cached per session",
        },
        "directions": walk,
    })
    write_json(METADATA_ROOT / "expedition-actions-r3.json", {
        **common,
        "assetId": "blazetail-kit-expedition-actions-r3",
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


def promote_orbit(date: str) -> None:
    ORBIT_ROOT.mkdir(parents=True, exist_ok=True)
    source = CANDIDATE_ROOT / "orbit/renders/blazetail-kit-orbit-top-r3.glb"
    target = ORBIT_ROOT / source.name
    shutil.copy2(source, target)
    gltf = read_glb_json(target)
    node_names = {node.get("name") for node in gltf.get("nodes", [])}
    required = {
        "OrbitTopRoot", "BaseForm", "ResonanceForm", "ColliderProxy_Deterministic2D",
        "Socket_SpinAxis", "Socket_Trail", "Socket_Impact",
    }
    missing = sorted(required - node_names)
    if missing:
        raise SystemExit(f"missing required Orbit nodes: {missing}")
    stats = glb_stats(target)
    if stats["bytes"] > 2 * 1024 * 1024:
        raise SystemExit("Blazetail Orbit top exceeds 2 MiB runtime budget")
    write_json(ORBIT_ROOT / "manifest.json", {
        "schemaVersion": 1,
        "packId": "orbit-tops-r3",
        "status": "runtime-promoted-owner-approved",
        "generator": "tools/blender/build_blazetail_orbit_top_r3.py",
        "manifestBuilder": "tools/art/promote_blazetail_r3_assets.py",
        "blenderVersion": "5.2.0 LTS",
        "ownerApproval": approval(date),
        "physicsAuthority": "src/orbit/orbitPhysics.js",
        "rendererAuthority": "presentation-only snapshot consumer",
        "runtimePromotionAllowed": True,
        "license": "project-owned Blender-generated asset; no downloaded third-party art",
        "assets": [{
            "assetId": "blazetail-kit-orbit-top-r3",
            "ownerType": "companion",
            "ownerId": "blazetail-kit",
            "path": relative(target),
            "artStatus": "runtime-promoted-owner-approved",
            "nodes": {
                "base": "BaseForm", "resonance": "ResonanceForm",
                "colliderProxy": "ColliderProxy_Deterministic2D",
                "spinSocket": "Socket_SpinAxis", "trailSocket": "Socket_Trail",
                "impactSocket": "Socket_Impact",
            },
            "coordinateFrame": "Blender Z-up authoring; glTF Y-up export",
            "bottomContactZ": 0,
            "spinAxisAuthoring": [0, 0, 1],
            "collider": {
                "type": "deterministic-2d-circle",
                "source": "src/orbit/orbitPhysics.js body.radius",
                "meshIsAuthority": False,
            },
            "formContract": "reversible equal-budget session state; never persisted as Growth",
            "runtimeStats": {**stats, "sha256": sha256(target), "requiredNodes": sorted(required)},
        }],
    })


def main() -> None:
    args = parse_args()
    promote_expedition(args.approval_date)
    promote_orbit(args.approval_date)
    print(json.dumps({
        "status": "runtime-promoted-owner-approved",
        "companionId": "blazetail-kit",
        "expeditionDirections": len(DIRECTIONS),
        "orbitAssets": 1,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
