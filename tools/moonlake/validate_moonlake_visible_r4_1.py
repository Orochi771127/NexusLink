"""Validate the authored Moonlake R4.1A GLB inside Blender.

Run:
  blender --background --factory-startup --python \
    tools/moonlake/validate_moonlake_visible_r4_1.py -- \
    --glb assets/3d/moonlake/moonlake_visible_r4_1.glb \
    --preserved-r3 assets/3d/moonlake/moonlake_clay_resin_r3.glb
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


EXPECTED_R3_SHA256 = (
    "60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6"
)
MAX_BYTES = 15 * 1024 * 1024
MAX_TRIANGLES = 75_000
MAX_MATERIALS = 14
MAX_RENDERABLE_MESHES = 60
REQUIRED_NODES = {
    "MOONLAKE_VISIBLE_R4_1",
    "R4_ENVIRONMENT",
    "R4_PLATFORM",
    "R4_BRIDGE",
    "R4_CLIFF_LEFT",
    "R4_CLIFF_RIGHT",
    "R4_TENT_LEFT",
    "R4_TENT_RIGHT",
    "R4_FOLIAGE",
    "R4_ACCENTS",
    "R4_NAVIGATION",
    "R4_COLLIDERS",
    "NAV_PLATFORM_CENTER",
    "NAV_BRIDGE_NEAR",
    "NAV_BRIDGE_MID",
    "NAV_BRIDGE_FAR",
    "NAV_FAR_BANK",
    "COLLIDER_PLATFORM_WALKABLE",
    "COLLIDER_BRIDGE_WALKABLE",
    "COLLIDER_FAR_BANK_WALKABLE",
    "COLLIDER_TENT_LEFT",
    "COLLIDER_TENT_RIGHT",
    "R4_FIXED_PORTRAIT_CAMERA",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--glb", required=True)
    parser.add_argument("--preserved-r3", required=True)
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(argv)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest().upper()


def triangle_count() -> int:
    count = 0
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        obj.data.calc_loop_triangles()
        count += len(obj.data.loop_triangles)
    return count


def world_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector((
        min(corner.x for corner in corners),
        min(corner.y for corner in corners),
        min(corner.z for corner in corners),
    ))
    maximum = Vector((
        max(corner.x for corner in corners),
        max(corner.y for corner in corners),
        max(corner.z for corner in corners),
    ))
    return minimum, maximum


def validate_bridge() -> dict[str, object]:
    planks = sorted(
        (
            obj
            for obj in bpy.context.scene.objects
            if obj.name.startswith("R4_BRIDGE_PLANK_")
        ),
        key=lambda obj: obj.location.y,
        reverse=True,
    )
    if len(planks) != 18:
        raise AssertionError(f"expected 18 bridge planks, found {len(planks)}")
    gaps = []
    widths = []
    for plank in planks:
        minimum, maximum = world_bounds(plank)
        widths.append(maximum.x - minimum.x)
    for current, following in zip(planks, planks[1:]):
        current_minimum, _ = world_bounds(current)
        _, following_maximum = world_bounds(following)
        gaps.append(max(0.0, current_minimum.y - following_maximum.y))
    max_gap = max(gaps, default=0.0)
    min_width = min(widths)
    if max_gap > 0.031:
        raise AssertionError(f"bridge gap {max_gap:.5f} exceeds 0.03m")
    if min_width < 2.20:
        raise AssertionError(f"bridge width {min_width:.5f} below 2.20m")

    bridge_root = bpy.data.objects.get("R4_BRIDGE")
    if not bridge_root or not bool(bridge_root.get("continuous_deck")):
        raise AssertionError("R4_BRIDGE continuous_deck extra missing")
    near_overlap = float(bridge_root.get("near_land_overlap_m", 0))
    far_overlap = float(bridge_root.get("far_land_overlap_m", 0))
    if near_overlap < 0.35 or far_overlap < 0.35:
        raise AssertionError("bridge endpoints do not overlap authored land")

    near = bpy.data.objects["NAV_BRIDGE_NEAR"].location
    middle = bpy.data.objects["NAV_BRIDGE_MID"].location
    far = bpy.data.objects["NAV_BRIDGE_FAR"].location
    for name, point in (("near", near), ("mid", middle), ("far", far)):
        if abs(point.x) > min_width * 0.5:
            raise AssertionError(f"bridge {name} waypoint is outside the deck")
    if not (near.y > middle.y > far.y):
        raise AssertionError("bridge waypoints are not ordered near -> mid -> far")

    return {
        "plankCount": len(planks),
        "maxGapM": max_gap,
        "minDeckWidthM": min_width,
        "nearLandOverlapM": near_overlap,
        "farLandOverlapM": far_overlap,
        "waypointOrder": ["near", "mid", "far"],
    }


def validate_colliders() -> list[dict[str, object]]:
    colliders = []
    for name in sorted(node for node in REQUIRED_NODES if node.startswith("COLLIDER_")):
        obj = bpy.data.objects.get(name)
        if obj is None:
            raise AssertionError(f"missing collider {name}")
        if obj.get("node_role") != "collision_proxy":
            raise AssertionError(f"{name} lacks collision_proxy role")
        half_extents = list(obj.get("half_extents_m", []))
        if len(half_extents) != 3 or any(float(value) <= 0 for value in half_extents):
            raise AssertionError(f"{name} has invalid half_extents_m")
        colliders.append({
            "name": name,
            "shape": obj.get("shape"),
            "role": obj.get("collision_role"),
            "halfExtentsM": [float(value) for value in half_extents],
        })
    return colliders


def validate_transforms() -> None:
    for obj in bpy.context.scene.objects:
        scale = obj.scale
        if scale.x < 0 or scale.y < 0 or scale.z < 0:
            raise AssertionError(f"negative scale on {obj.name}")
        if not all(math.isfinite(value) for value in (*obj.location, *obj.rotation_euler, *scale)):
            raise AssertionError(f"non-finite transform on {obj.name}")


def main() -> None:
    args = parse_args()
    glb_path = Path(args.glb).resolve()
    r3_path = Path(args.preserved_r3).resolve()
    if not glb_path.is_file():
        raise FileNotFoundError(glb_path)
    if not r3_path.is_file():
        raise FileNotFoundError(r3_path)
    if glb_path.stat().st_size > MAX_BYTES:
        raise AssertionError(f"GLB exceeds {MAX_BYTES} bytes")
    r3_hash = sha256(r3_path)
    if r3_hash != EXPECTED_R3_SHA256:
        raise AssertionError(f"preserved R3 hash mismatch: {r3_hash}")

    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(glb_path))
    names = {obj.name for obj in bpy.context.scene.objects}
    missing = sorted(REQUIRED_NODES - names)
    if missing:
        raise AssertionError(f"missing required nodes: {missing}")

    triangles = triangle_count()
    if triangles > MAX_TRIANGLES:
        raise AssertionError(f"triangle count {triangles} exceeds {MAX_TRIANGLES}")
    mesh_objects = sum(
        1 for obj in bpy.context.scene.objects if obj.type == "MESH"
    )
    if mesh_objects > MAX_RENDERABLE_MESHES:
        raise AssertionError(
            f"renderable mesh count {mesh_objects} exceeds "
            f"{MAX_RENDERABLE_MESHES}"
        )
    material_names = sorted({
        material.name
        for obj in bpy.context.scene.objects
        if obj.type == "MESH"
        for material in obj.data.materials
        if material is not None
    })
    if len(material_names) > MAX_MATERIALS:
        raise AssertionError(
            f"material count {len(material_names)} exceeds {MAX_MATERIALS}: "
            f"{material_names}"
        )
    validate_transforms()
    bridge = validate_bridge()
    colliders = validate_colliders()

    root = bpy.data.objects["MOONLAKE_VISIBLE_R4_1"]
    if root.get("asset_id") != "moonlake-visible-r4-1":
        raise AssertionError("asset_id extra missing")
    if bool(root.get("shipping_default")):
        raise AssertionError("R4.1A must not be marked shipping_default")

    result = {
        "pass": True,
        "asset": str(glb_path),
        "bytes": glb_path.stat().st_size,
        "sha256": sha256(glb_path),
        "triangles": triangles,
        "materials": len(material_names),
        "materialNames": material_names,
        "renderableMeshes": mesh_objects,
        "objects": len(bpy.context.scene.objects),
        "requiredNodes": len(REQUIRED_NODES),
        "bridge": bridge,
        "colliders": colliders,
        "preservedR3Sha256": r3_hash,
    }
    print("R4_1_VALIDATE_RESULT=" + json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
