#!/usr/bin/env python3
"""Build and validate promoted Global 3D Gameplay Pilot manifests."""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
from pathlib import Path

from PIL import Image


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
REQUIRED_GLB_NODES = {"OrbitTopRoot", "BaseForm", "ResonanceForm"}


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


def relative(repo_root: Path, path: Path) -> str:
    return path.relative_to(repo_root).as_posix()


def read_glb_json(path: Path) -> dict:
    payload = path.read_bytes()
    if len(payload) < 20:
        raise SystemExit(f"GLB too small: {path}")
    magic, version, total_length = struct.unpack_from("<III", payload, 0)
    if magic != 0x46546C67 or version != 2 or total_length != len(payload):
        raise SystemExit(f"invalid GLB 2 header: {path}")
    offset = 12
    while offset + 8 <= len(payload):
        chunk_length, chunk_type = struct.unpack_from("<II", payload, offset)
        chunk_start = offset + 8
        chunk_end = chunk_start + chunk_length
        if chunk_end > len(payload):
            raise SystemExit(f"GLB chunk exceeds file length: {path}")
        if chunk_type == 0x4E4F534A:
            return json.loads(payload[chunk_start:chunk_end].decode("utf-8").strip())
        offset = chunk_end
    raise SystemExit(f"GLB JSON chunk missing: {path}")


def glb_stats(path: Path) -> dict:
    gltf = read_glb_json(path)
    accessors = gltf.get("accessors", [])
    node_names = sorted(node.get("name") for node in gltf.get("nodes", []) if node.get("name"))
    missing = REQUIRED_GLB_NODES.difference(node_names)
    if missing:
        raise SystemExit(f"{path.name} missing nodes: {sorted(missing)}")

    primitive_count = 0
    vertex_count = 0
    triangle_count = 0
    for mesh in gltf.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            primitive_count += 1
            position_index = primitive.get("attributes", {}).get("POSITION")
            if isinstance(position_index, int) and position_index < len(accessors):
                vertex_count += int(accessors[position_index].get("count", 0))
            index_accessor = primitive.get("indices")
            if isinstance(index_accessor, int) and index_accessor < len(accessors):
                triangle_count += int(accessors[index_accessor].get("count", 0)) // 3

    return {
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "nodeCount": len(gltf.get("nodes", [])),
        "meshCount": len(gltf.get("meshes", [])),
        "primitiveCount": primitive_count,
        "vertexCount": vertex_count,
        "triangleCount": triangle_count,
        "materialCount": len(gltf.get("materials", [])),
        "textureCount": len(gltf.get("textures", [])),
        "requiredNodes": sorted(REQUIRED_GLB_NODES),
        "extensionsUsed": gltf.get("extensionsUsed", []),
    }


def audit_sheet(path: Path, frame_size: int) -> dict:
    image = Image.open(path).convert("RGBA")
    expected_size = (frame_size * 8, frame_size)
    if image.size != expected_size:
        raise SystemExit(f"bad sheet dimensions {image.size}: {path}")

    frame_hashes: set[str] = set()
    max_soft_edge_ratio = 0.0
    for index in range(8):
        frame = image.crop((index * frame_size, 0, (index + 1) * frame_size, frame_size))
        corners = (
            (0, 0),
            (frame_size - 1, 0),
            (0, frame_size - 1),
            (frame_size - 1, frame_size - 1),
        )
        if any(frame.getpixel(point)[3] != 0 for point in corners):
            raise SystemExit(f"non-transparent frame corner {index + 1}: {path}")
        alpha_values = list(frame.getchannel("A").get_flattened_data())
        visible = sum(value > 8 for value in alpha_values)
        solid = sum(value >= 128 for value in alpha_values)
        if solid == 0:
            raise SystemExit(f"empty frame {index + 1}: {path}")
        max_soft_edge_ratio = max(max_soft_edge_ratio, visible / solid)
        frame_hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())

    if len(frame_hashes) < 6:
        raise SystemExit(f"insufficient pose variation: {path}")
    if max_soft_edge_ratio > 1.2:
        raise SystemExit(f"excessive soft matte ratio {max_soft_edge_ratio:.3f}: {path}")

    return {
        "path": relative(REPO_ROOT, path),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "sheetSize": [image.width, image.height],
        "frameSize": [frame_size, frame_size],
        "frameCount": 8,
        "transparentFrameCorners": True,
        "uniqueFrameHashes": len(frame_hashes),
        "maxSoftEdgeRatio": round(max_soft_edge_ratio, 4),
    }


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_sprite_manifest(approval_date: str) -> dict:
    master_root = SPRITE_ROOT / "master-512"
    runtime_root = SPRITE_ROOT / "runtime-256"
    directions = {}
    decoded_bytes = 0
    for direction in DIRECTIONS:
        master = audit_sheet(
            master_root / f"greyshade-walk-{direction}-master-4096x512-8f.png",
            512,
        )
        runtime = audit_sheet(
            runtime_root / f"greyshade-walk-{direction}-runtime-2048x256-8f.png",
            256,
        )
        decoded_bytes += 2048 * 256 * 4
        directions[direction] = {"master": master, "runtime": runtime}

    return {
        "schemaVersion": 1,
        "assetId": "greyshade-cat-expedition-walk-r1",
        "companionId": "greyshade-cat",
        "status": "runtime-promoted-owner-approved",
        "ownerApproval": {
            "approved": True,
            "approvedOn": approval_date,
            "source": "Owner continuation after visual review in Codex task",
        },
        "artDirection": "bright 3D miniature with matte resin-clay character material",
        "production": {
            "generator": "ChatGPT image generation",
            "normalizer": "tools/art/normalize_illustrated_sprite_grid.py",
            "manifestBuilder": "tools/art/build_global_3d_pilot_manifests.py",
            "license": "project-owned generated asset; no downloaded third-party art",
        },
        "grid": {
            "directions": list(DIRECTIONS),
            "framesPerDirection": 8,
            "anchor": {"x": 0.5, "y": 1.0},
            "fps": 10,
            "sampling": "linear with mipmaps when supported",
        },
        "runtimeBudget": {
            "loadedSheetSize": [2048, 256],
            "decodedBytesAllDirections": decoded_bytes,
            "decodedMiBAllDirections": round(decoded_bytes / 1024 / 1024, 2),
            "masterSheetsAreNotRuntimeLoaded": True,
        },
        "legacyPolicy": {
            "referenceAuditedSwap": True,
            "legacyAssetsRetained": True,
            "fallbackOwner": "greyshade-cat",
        },
        "directions": directions,
    }


def build_orbit_manifest(approval_date: str) -> dict:
    assets = []
    for asset_id, owner_type, owner_id in (
        ("greyshade-cat-orbit-top-r1", "companion", "greyshade-cat"),
        ("rift-echo-orbit-top-r1", "enemy", "rift-echo"),
    ):
        path = ORBIT_ROOT / f"{asset_id}.glb"
        stats = glb_stats(path)
        if stats["bytes"] > 2 * 1024 * 1024:
            raise SystemExit(f"GLB exceeds 2 MiB pilot budget: {path}")
        assets.append({
            "assetId": asset_id,
            "ownerType": owner_type,
            "ownerId": owner_id,
            "path": relative(REPO_ROOT, path),
            "artStatus": "runtime-promoted-owner-approved",
            "nodes": {"base": "BaseForm", "resonance": "ResonanceForm"},
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
        })

    return {
        "schemaVersion": 1,
        "packId": "orbit-tops-r1",
        "status": "runtime-promoted-owner-approved",
        "generator": "tools/blender/build_orbit_top_pilots_r1.py",
        "manifestBuilder": "tools/art/build_global_3d_pilot_manifests.py",
        "blenderVersion": "5.2.0 LTS",
        "ownerApproval": {
            "approved": True,
            "approvedOn": approval_date,
            "source": "Owner continuation after visual review in Codex task",
        },
        "physicsAuthority": "src/orbit/orbitPhysics.js",
        "rendererAuthority": "presentation-only snapshot consumer",
        "license": "project-owned Blender-generated assets; no downloaded third-party art",
        "runtimePromotionAllowed": True,
        "assets": assets,
    }


REPO_ROOT = Path(__file__).resolve().parents[2]
SPRITE_ROOT = REPO_ROOT / "assets/characters/greyshade-cat/spritesheets/expedition/r1"
SPRITE_MANIFEST = REPO_ROOT / "assets/characters/greyshade-cat/metadata/expedition-walk-r1.json"
ORBIT_ROOT = REPO_ROOT / "assets/3d/orbit-tops-r1"
ORBIT_MANIFEST = ORBIT_ROOT / "manifest.json"


def main() -> None:
    args = parse_args()
    sprite_manifest = build_sprite_manifest(args.approval_date)
    orbit_manifest = build_orbit_manifest(args.approval_date)
    write_json(SPRITE_MANIFEST, sprite_manifest)
    write_json(ORBIT_MANIFEST, orbit_manifest)
    print(json.dumps({
        "status": "PASS",
        "spriteManifest": relative(REPO_ROOT, SPRITE_MANIFEST),
        "orbitManifest": relative(REPO_ROOT, ORBIT_MANIFEST),
        "spriteRuntimeMiB": sprite_manifest["runtimeBudget"]["decodedMiBAllDirections"],
        "orbitAssets": len(orbit_manifest["assets"]),
    }))


if __name__ == "__main__":
    main()
