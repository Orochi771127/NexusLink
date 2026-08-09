#!/usr/bin/env python3
"""Build and validate promoted R2 action and Orbit-top manifests."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

from build_global_3d_pilot_manifests import glb_stats, read_glb_json


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
REPO_ROOT = Path(__file__).resolve().parents[2]
GREYSHADE_ROOT = (
    REPO_ROOT / "assets/characters/greyshade-cat/spritesheets/expedition/r2"
)
GREYSHADE_MANIFEST = (
    REPO_ROOT / "assets/characters/greyshade-cat/metadata/expedition-actions-r2.json"
)
ENEMY_ROOT = REPO_ROOT / "assets/enemies/rift-root-echo/expedition/r2"
ENEMY_MANIFEST = ENEMY_ROOT / "manifest.json"
ORBIT_ROOT = REPO_ROOT / "assets/3d/orbit-tops-r2"
ORBIT_MANIFEST = ORBIT_ROOT / "manifest.json"


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
        raise SystemExit(f"bad sheet dimensions {image.size}, expected {expected}: {path}")

    hashes = set()
    max_soft_edge_ratio = 0.0
    green_fringe_pixels = 0
    visible_pixels_total = 0
    for index in range(frame_count):
        frame = image.crop(
            (index * frame_size, 0, (index + 1) * frame_size, frame_size)
        )
        alpha = frame.getchannel("A")
        corners = (
            (0, 0),
            (frame_size - 1, 0),
            (0, frame_size - 1),
            (frame_size - 1, frame_size - 1),
        )
        if any(alpha.getpixel(point) != 0 for point in corners):
            raise SystemExit(f"non-transparent frame corner {index + 1}: {path}")
        bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
        if bbox is None:
            raise SystemExit(f"empty frame {index + 1}: {path}")
        if bbox[0] <= 1 or bbox[1] <= 1 or bbox[2] >= frame_size - 1:
            raise SystemExit(f"frame silhouette touches unsafe edge {index + 1}: {path}")

        pixels = list(frame.get_flattened_data())
        visible = [pixel for pixel in pixels if pixel[3] > 8]
        solid = sum(pixel[3] >= 128 for pixel in visible)
        if solid == 0:
            raise SystemExit(f"frame has no solid content {index + 1}: {path}")
        max_soft_edge_ratio = max(max_soft_edge_ratio, len(visible) / solid)
        green_fringe_pixels += sum(
            green > max(red, blue) + 28 and blue < green * 0.78
            for red, green, blue, _alpha in visible
        )
        visible_pixels_total += len(visible)
        hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())

    minimum_unique = 3 if frame_count >= 4 else frame_count
    if len(hashes) < minimum_unique:
        raise SystemExit(f"insufficient pose variation: {path}")
    if max_soft_edge_ratio > 1.3:
        raise SystemExit(f"excessive soft matte ratio {max_soft_edge_ratio:.3f}: {path}")
    green_fringe_ratio = green_fringe_pixels / max(1, visible_pixels_total)
    if green_fringe_ratio > 0.004:
        raise SystemExit(f"green fringe ratio {green_fringe_ratio:.4f}: {path}")

    return {
        "path": relative(path),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "sheetSize": [image.width, image.height],
        "frameSize": [frame_size, frame_size],
        "frameCount": frame_count,
        "transparentFrameCorners": True,
        "uniqueFrameHashes": len(hashes),
        "maxSoftEdgeRatio": round(max_soft_edge_ratio, 4),
        "greenFringeRatio": round(green_fringe_ratio, 6),
    }


def approval(approval_date: str) -> dict:
    return {
        "approved": True,
        "approvedOn": approval_date,
        "source": (
            "Owner accepted R2 visual direction and authorized strict self-review, "
            "promotion and protected-main publication in Codex task"
        ),
    }


def build_greyshade_manifest(approval_date: str) -> dict:
    actions = {}
    decoded_all = 0
    decoded_active = 0
    specs = (
        ("attack_basic", "attack", 6, 10),
        ("hit", "hit", 4, 12),
    )
    for action_id, filename_action, frame_count, fps in specs:
        directions = {}
        for direction in DIRECTIONS:
            master = GREYSHADE_ROOT / "master-512" / (
                f"greyshade-{filename_action}-{direction}-master-"
                f"{512 * frame_count}x512-{frame_count}f.png"
            )
            runtime = GREYSHADE_ROOT / "runtime-256" / (
                f"greyshade-{filename_action}-{direction}-runtime-"
                f"{256 * frame_count}x256-{frame_count}f.png"
            )
            directions[direction] = {
                "master": audit_sheet(master, 512, frame_count),
                "runtime": audit_sheet(runtime, 256, frame_count),
            }
            decoded_all += frame_count * 256 * 256 * 4
        decoded_active += frame_count * 256 * 256 * 4
        actions[action_id] = {
            "frames": frame_count,
            "fps": fps,
            "loop": False,
            "directions": directions,
        }

    return {
        "schemaVersion": 1,
        "assetId": "greyshade-cat-expedition-actions-r2",
        "companionId": "greyshade-cat",
        "status": "runtime-promoted-owner-approved",
        "ownerApproval": approval(approval_date),
        "artDirection": "bright 3D miniature with matte resin-clay character material",
        "production": {
            "generator": "ChatGPT image generation using R1 direction locks",
            "chromaKeyer": "tools/art/key_chroma_sprite_sheet.py",
            "normalizer": "tools/art/normalize_illustrated_sprite_grid.py",
            "manifestBuilder": "tools/art/build_global_3d_pilot_r2_manifests.py",
            "license": "project-owned generated assets; no downloaded third-party art",
        },
        "anchor": {"x": 0.5, "y": 1},
        "sampling": "linear with mipmaps when supported",
        "runtimeBudget": {
            "decodedBytesActiveDirection": decoded_active,
            "decodedMiBActiveDirection": round(decoded_active / 1024 / 1024, 2),
            "decodedBytesAllCachedDirections": decoded_all,
            "decodedMiBAllCachedDirections": round(decoded_all / 1024 / 1024, 2),
            "masterSheetsAreNotRuntimeLoaded": True,
            "loadingPolicy": "lazy per action and current facing; cached per session",
        },
        "legacyPolicy": {
            "r1WalkRetained": True,
            "legacyAssetsRetained": True,
            "fallbackOwner": "greyshade-cat",
        },
        "actions": actions,
    }


def build_enemy_manifest(approval_date: str) -> dict:
    move_master = audit_sheet(
        ENEMY_ROOT / "master-512/rift-root-echo-move-south-master-4096x512-8f.png",
        512,
        8,
    )
    move_runtime = audit_sheet(
        ENEMY_ROOT / "runtime-256/rift-root-echo-move-south-runtime-2048x256-8f.png",
        256,
        8,
    )
    attack_master = audit_sheet(
        ENEMY_ROOT / "master-512/rift-root-echo-attack-south-master-3072x512-6f.png",
        512,
        6,
    )
    attack_runtime = audit_sheet(
        ENEMY_ROOT / "runtime-256/rift-root-echo-attack-south-runtime-1536x256-6f.png",
        256,
        6,
    )
    decoded = (8 + 6) * 256 * 256 * 4
    return {
        "schemaVersion": 1,
        "assetId": "rift-root-echo-expedition-actions-r2",
        "enemyId": "rift-root-echo",
        "status": "runtime-promoted-owner-approved",
        "ownerApproval": approval(approval_date),
        "artDirection": "indigo resin-clay root-shadow with cyan resonance droplets",
        "license": "project-owned generated assets; no downloaded third-party art",
        "anchor": {"x": 0.5, "y": 1},
        "runtimeBudget": {
            "decodedBytes": decoded,
            "decodedMiB": round(decoded / 1024 / 1024, 2),
            "masterSheetsAreNotRuntimeLoaded": True,
        },
        "actions": {
            "move": {"frames": 8, "fps": 10, "loop": True, "master": move_master, "runtime": move_runtime},
            "attack": {"frames": 6, "fps": 10, "loop": False, "master": attack_master, "runtime": attack_runtime},
        },
    }


def build_orbit_manifest(approval_date: str) -> dict:
    path = ORBIT_ROOT / "crystalfin-seahorse-orbit-top-r2.glb"
    stats = glb_stats(path)
    if stats["bytes"] > 2 * 1024 * 1024:
        raise SystemExit(f"GLB exceeds 2 MiB budget: {path}")
    gltf = read_glb_json(path)
    node_names = {node.get("name") for node in gltf.get("nodes", [])}
    collider = "ColliderProxy_Deterministic2D"
    if collider not in node_names:
        raise SystemExit(f"missing collider proxy node: {path}")
    return {
        "schemaVersion": 1,
        "packId": "orbit-tops-r2",
        "status": "runtime-promoted-owner-approved",
        "generator": "tools/blender/build_crystalfin_orbit_top_r2.py",
        "manifestBuilder": "tools/art/build_global_3d_pilot_r2_manifests.py",
        "blenderVersion": "5.2.0 LTS",
        "ownerApproval": approval(approval_date),
        "physicsAuthority": "src/orbit/orbitPhysics.js",
        "rendererAuthority": "presentation-only snapshot consumer",
        "license": "project-owned Blender-generated asset; no downloaded third-party art",
        "runtimePromotionAllowed": True,
        "assets": [{
            "assetId": "crystalfin-seahorse-orbit-top-r2",
            "ownerType": "companion",
            "ownerId": "crystalfin-seahorse",
            "path": relative(path),
            "artStatus": "runtime-promoted-owner-approved",
            "nodes": {
                "base": "BaseForm",
                "resonance": "ResonanceForm",
                "colliderProxy": collider,
            },
            "coordinateFrame": "Blender Z-up authoring; glTF Y-up export",
            "bottomContactZ": 0,
            "pivot": [0, 0, 0],
            "spinAxisAuthoring": [0, 0, 1],
            "collider": {
                "type": "deterministic-2d-circle",
                "source": "src/orbit/orbitPhysics.js body.radius",
                "meshIsAuthority": False,
            },
            "runtimeStats": stats,
        }],
    }


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    greyshade = build_greyshade_manifest(args.approval_date)
    enemy = build_enemy_manifest(args.approval_date)
    orbit = build_orbit_manifest(args.approval_date)
    write_json(GREYSHADE_MANIFEST, greyshade)
    write_json(ENEMY_MANIFEST, enemy)
    write_json(ORBIT_MANIFEST, orbit)
    print(json.dumps({
        "status": "PASS",
        "greyshadeManifest": relative(GREYSHADE_MANIFEST),
        "greyshadeRuntimeMiBActiveDirection": greyshade["runtimeBudget"]["decodedMiBActiveDirection"],
        "greyshadeRuntimeMiBAllCachedDirections": greyshade["runtimeBudget"]["decodedMiBAllCachedDirections"],
        "enemyManifest": relative(ENEMY_MANIFEST),
        "orbitManifest": relative(ORBIT_MANIFEST),
        "orbitBytes": orbit["assets"][0]["runtimeStats"]["bytes"],
    }))


if __name__ == "__main__":
    main()
