"""Headless Blender audit for the promoted Moonlake live-3D GLB."""

import argparse
import json
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv
    args = argv[argv.index("--") + 1 :] if "--" in argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("glb")
    parser.add_argument("--max-bytes", type=int, default=15 * 1024 * 1024)
    parser.add_argument("--max-triangles", type=int, default=75_000)
    return parser.parse_args(args)


def world_bounds(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    return {
        "min": [round(min(point[index] for point in points), 4) for index in range(3)],
        "max": [round(max(point[index] for point in points), 4) for index in range(3)],
    }


def main():
    args = parse_args()
    glb = os.path.abspath(args.glb)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    triangles = sum(
        sum(max(0, len(polygon.vertices) - 2) for polygon in obj.data.polygons)
        for obj in meshes
    )
    materials = sorted(
        {
            slot.material.name
            for obj in meshes
            for slot in obj.material_slots
            if slot.material is not None
        }
    )
    report = {
        "glb": glb,
        "bytes": os.path.getsize(glb),
        "meshCount": len(meshes),
        "triangles": triangles,
        "materials": materials,
        "objects": [
            {
                "name": obj.name,
                "bounds": world_bounds(obj),
                "materials": [
                    slot.material.name
                    for slot in obj.material_slots
                    if slot.material is not None
                ],
            }
            for obj in sorted(meshes, key=lambda item: item.name)
        ],
    }
    report["pass"] = (
        report["bytes"] <= args.max_bytes
        and report["triangles"] <= args.max_triangles
        and report["meshCount"] > 0
    )
    print("MOONLAKE_LIVE3D_AUDIT=" + json.dumps(report, ensure_ascii=False))
    if not report["pass"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
