"""Author the Moonlake visible GLB R4.1A candidate in Blender.

Run:
  blender --background --factory-startup --python \
    tools/moonlake/author_moonlake_visible_r4_1.py -- \
    --output-glb assets/3d/moonlake/moonlake_visible_r4_1.glb \
    --render-dir <temporary review directory>

The script is the reproducible DCC source. It creates a parallel GLB and never
opens or overwrites the accepted R3 asset.
"""

from __future__ import annotations

import argparse
import json
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ASSET_ID = "moonlake-visible-r4-1"
RANDOM_SEED = 4101
BRIDGE_NEAR_Y = -3.9
BRIDGE_FAR_Y = -13.1
BRIDGE_WIDTH = 2.25
BRIDGE_LENGTH = BRIDGE_NEAR_Y - BRIDGE_FAR_Y
BRIDGE_PLANK_COUNT = 18
BRIDGE_GAP = 0.02


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-glb", required=True)
    parser.add_argument("--render-dir", required=True)
    parser.add_argument("--skip-renders", action="store_true")
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(argv)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(datablocks):
            datablocks.remove(datablock)


def make_material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float = 0.72,
    metallic: float = 0.0,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
    alpha_blend: bool = False,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = color
    material.metallic = metallic
    material.roughness = roughness
    node = material.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = color
    node.inputs["Roughness"].default_value = roughness
    node.inputs["Metallic"].default_value = metallic
    if emission is not None:
        emission_input = node.inputs.get("Emission Color") or node.inputs.get("Emission")
        if emission_input:
            emission_input.default_value = emission
        strength_input = node.inputs.get("Emission Strength")
        if strength_input:
            strength_input.default_value = emission_strength
    if color[3] < 1 or alpha_blend:
        node.inputs["Alpha"].default_value = color[3]
        material.surface_render_method = "DITHERED"
        material.use_transparency_overlap = False
    return material


def create_materials() -> dict[str, bpy.types.Material]:
    return {
        "moss_light": make_material(
            "MAT_MOSS_LIGHT", (0.37, 0.53, 0.25, 1), 0.88
        ),
        "moss_dark": make_material(
            "MAT_MOSS_DARK", (0.17, 0.30, 0.16, 1), 0.92
        ),
        "stone": make_material(
            "MAT_CLIFF_STONE", (0.39, 0.43, 0.41, 1), 0.82
        ),
        "platform": make_material(
            "MAT_PLATFORM_STONE", (0.64, 0.62, 0.54, 1), 0.74
        ),
        "wood": make_material(
            "MAT_WARM_WOOD", (0.38, 0.22, 0.11, 1), 0.78
        ),
        "ivory": make_material(
            "MAT_IVORY_CANVAS", (0.82, 0.78, 0.66, 1), 0.88
        ),
        "blue": make_material(
            "MAT_BLUE_CANVAS", (0.10, 0.25, 0.48, 1), 0.76
        ),
        "purple": make_material(
            "MAT_PURPLE_CANVAS", (0.34, 0.19, 0.45, 1), 0.76
        ),
        "gold": make_material(
            "MAT_RESTRAINED_GOLD", (0.70, 0.46, 0.14, 1), 0.34, 0.46
        ),
        "foliage_light": make_material(
            "MAT_FOLIAGE_LIGHT", (0.30, 0.48, 0.20, 1), 0.92
        ),
        "foliage_dark": make_material(
            "MAT_FOLIAGE_DARK", (0.10, 0.27, 0.16, 1), 0.94
        ),
        "water": make_material(
            "MAT_LAKE_WATER", (0.04, 0.38, 0.56, 0.80), 0.18, alpha_blend=True
        ),
        "waterfall": make_material(
            "MAT_WATERFALL", (0.42, 0.82, 0.95, 0.72), 0.12,
            emission=(0.12, 0.48, 0.68, 1),
            emission_strength=0.18,
            alpha_blend=True,
        ),
        "cyan": make_material(
            "MAT_CYAN_CRYSTAL", (0.16, 0.72, 0.88, 1), 0.22, 0.08,
            emission=(0.04, 0.34, 0.48, 1),
            emission_strength=0.42,
        ),
    }


def empty(
    name: str,
    parent: bpy.types.Object | None = None,
    location: tuple[float, float, float] = (0, 0, 0),
) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.35
    obj.location = location
    obj.parent = parent
    return obj


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    if not obj.data or not hasattr(obj.data, "materials"):
        return
    obj.data.materials.append(material)


def smooth(obj: bpy.types.Object) -> None:
    if not obj.data or not hasattr(obj.data, "polygons"):
        return
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def apply_transform(obj: bpy.types.Object) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.select_set(False)


def add_bevel(obj: bpy.types.Object, width: float, segments: int = 2) -> None:
    modifier = obj.modifiers.new("Clay edge softness", "BEVEL")
    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)


def cube(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    rotation: tuple[float, float, float] = (0, 0, 0),
    bevel: float = 0.08,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    apply_transform(obj)
    if bevel > 0:
        add_bevel(obj, min(bevel, min(dimensions) * 0.24), 2)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    material: bpy.types.Material,
    parent: bpy.types.Object,
    vertices: int = 16,
    rotation: tuple[float, float, float] = (0, 0, 0),
    scale_xy: tuple[float, float] = (1, 1),
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale.x = scale_xy[0]
    obj.scale.y = scale_xy[1]
    apply_transform(obj)
    if bevel > 0:
        add_bevel(obj, bevel, 2)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def cone(
    name: str,
    location: tuple[float, float, float],
    radius1: float,
    radius2: float,
    depth: float,
    material: bpy.types.Material,
    parent: bpy.types.Object,
    vertices: int = 16,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    assign_material(obj, material)
    obj.parent = parent
    smooth(obj)
    return obj


def ico(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    subdivisions: int = 1,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=subdivisions,
        radius=1,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_transform(obj)
    assign_material(obj, material)
    obj.parent = parent
    smooth(obj)
    return obj


def torus(
    name: str,
    location: tuple[float, float, float],
    major_radius: float,
    minor_radius: float,
    material: bpy.types.Material,
    parent: bpy.types.Object,
    major_segments: int = 32,
    minor_segments: int = 8,
    scale: tuple[float, float, float] = (1, 1, 1),
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=major_segments,
        minor_segments=minor_segments,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_transform(obj)
    assign_material(obj, material)
    obj.parent = parent
    smooth(obj)
    return obj


def curve_between(
    name: str,
    start: tuple[float, float, float],
    end: tuple[float, float, float],
    bevel_depth: float,
    material: bpy.types.Material,
    parent: bpy.types.Object,
) -> bpy.types.Object:
    curve_data = bpy.data.curves.new(name, "CURVE")
    curve_data.dimensions = "3D"
    curve_data.bevel_depth = bevel_depth
    curve_data.bevel_resolution = 1
    spline = curve_data.splines.new("POLY")
    spline.points.add(1)
    spline.points[0].co = (*start, 1)
    spline.points[1].co = (*end, 1)
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.scene.collection.objects.link(obj)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def create_tri_panel_mesh(
    name: str,
    vertices: list[tuple[float, float, float]],
    faces: list[tuple[int, ...]],
    materials: list[bpy.types.Material],
    material_indices: list[int],
    parent: bpy.types.Object,
) -> bpy.types.Object:
    mesh = bpy.data.meshes.new(f"{name}_mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    for material in materials:
        mesh.materials.append(material)
    for polygon, material_index in zip(mesh.polygons, material_indices):
        polygon.material_index = material_index
    return obj


def build_tent(
    name: str,
    location: tuple[float, float, float],
    color_material: bpy.types.Material,
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
    radius: float = 2.15,
) -> None:
    tent_root = empty(name, parent, location)
    segments = 16
    base_z = 0.22
    eave_z = 1.62
    apex_z = 4.05
    vertices: list[tuple[float, float, float]] = [(0, 0, apex_z)]
    for index in range(segments):
        angle = 2 * math.pi * index / segments
        vertices.append((radius * math.cos(angle), radius * math.sin(angle), eave_z))
    faces = []
    indices = []
    for index in range(segments):
        faces.append((0, index + 1, ((index + 1) % segments) + 1))
        indices.append(index % 2)
    create_tri_panel_mesh(
        f"{name}_CANOPY",
        vertices,
        faces,
        [color_material, materials["ivory"]],
        indices,
        tent_root,
    )

    wall_vertices: list[tuple[float, float, float]] = []
    wall_faces: list[tuple[int, ...]] = []
    wall_indices: list[int] = []
    for index in range(segments):
        angle_a = 2 * math.pi * index / segments
        angle_b = 2 * math.pi * (index + 1) / segments
        midpoint = (angle_a + angle_b) * 0.5
        # Leave a doorway toward the camera (+Y).
        if math.sin(midpoint) > 0.82:
            continue
        start = len(wall_vertices)
        wall_vertices.extend([
            (radius * math.cos(angle_a), radius * math.sin(angle_a), base_z),
            (radius * math.cos(angle_b), radius * math.sin(angle_b), base_z),
            (radius * math.cos(angle_b), radius * math.sin(angle_b), eave_z),
            (radius * math.cos(angle_a), radius * math.sin(angle_a), eave_z),
        ])
        wall_faces.append((start, start + 1, start + 2, start + 3))
        wall_indices.append(index % 2)
    create_tri_panel_mesh(
        f"{name}_WALLS",
        wall_vertices,
        wall_faces,
        [color_material, materials["ivory"]],
        wall_indices,
        tent_root,
    )

    cube(
        f"{name}_DOOR_SHADOW",
        (0, radius - 0.055, 0.76),
        (0.88, 0.08, 1.45),
        materials["moss_dark"],
        tent_root,
        bevel=0.04,
    )
    cylinder(
        f"{name}_CENTRE_POLE",
        (0, 0, 2.05),
        0.065,
        4.1,
        materials["gold"],
        tent_root,
        vertices=12,
    )
    for index in range(8):
        angle = 2 * math.pi * index / 8
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        cylinder(
            f"{name}_EAVE_POLE_{index:02d}",
            (x, y, 0.83),
            0.045,
            1.55,
            materials["gold"],
            tent_root,
            vertices=10,
        )
        anchor = (x * 1.28, y * 1.28, 0.03)
        curve_between(
            f"{name}_GUY_ROPE_{index:02d}",
            (x, y, eave_z),
            anchor,
            0.012,
            materials["gold"],
            tent_root,
        )
    cone(
        f"{name}_FINIAL",
        (0, 0, 4.33),
        0.18,
        0.0,
        0.56,
        materials["gold"],
        tent_root,
        vertices=12,
    )


def build_tree(
    name: str,
    location: tuple[float, float, float],
    scale: float,
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    tree_root = empty(name, parent, location)
    cylinder(
        f"{name}_TRUNK",
        (0, 0, 1.15 * scale),
        0.24 * scale,
        2.3 * scale,
        materials["wood"],
        tree_root,
        vertices=12,
    )
    for index, (z, radius) in enumerate(((2.0, 1.15), (2.75, 0.88), (3.4, 0.58))):
        cone(
            f"{name}_CROWN_{index:02d}",
            (0, 0, z * scale),
            radius * scale,
            0.05 * scale,
            1.65 * scale,
            materials["foliage_dark" if index == 0 else "foliage_light"],
            tree_root,
            vertices=12,
        )


def build_crystal(
    name: str,
    location: tuple[float, float, float],
    height: float,
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    cone(
        name,
        (location[0], location[1], location[2] + height * 0.5),
        height * 0.27,
        0,
        height,
        materials["cyan"],
        parent,
        vertices=6,
    )


def build_cliff(
    side: str,
    x_center: float,
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    cliff_root = empty(f"R4_CLIFF_{side}", parent)
    rng = random.Random(RANDOM_SEED + (1 if side == "LEFT" else 2))
    rows = [
        (0.7, 4, 1.9, 1.7),
        (2.15, 4, 1.7, 1.55),
        (3.55, 3, 1.8, 1.45),
        (4.9, 3, 1.55, 1.3),
        (6.05, 2, 1.65, 1.2),
    ]
    for row_index, (z, count, width, height) in enumerate(rows):
        for column in range(count):
            spread = (column - (count - 1) / 2) * (width * 0.86)
            x = x_center + spread + rng.uniform(-0.16, 0.16)
            y = -12.0 + rng.uniform(-0.42, 0.42)
            cube(
                f"R4_CLIFF_{side}_STONE_{row_index:02d}_{column:02d}",
                (x, y, z),
                (
                    width * rng.uniform(0.90, 1.14),
                    2.35 * rng.uniform(0.86, 1.12),
                    height * rng.uniform(0.88, 1.08),
                ),
                materials["stone"],
                cliff_root,
                rotation=(rng.uniform(-0.08, 0.08), rng.uniform(-0.08, 0.08), rng.uniform(-0.09, 0.09)),
                bevel=0.22,
            )
    top_z = 7.05
    cube(
        f"R4_CLIFF_{side}_MOSS_CAP",
        (x_center, -12.05, top_z),
        (5.2, 3.4, 0.42),
        materials["moss_light"],
        cliff_root,
        bevel=0.28,
    )
    for index, offset in enumerate((-1.25, 0.0, 1.3)):
        build_tree(
            f"R4_CLIFF_{side}_TREE_{index:02d}",
            (x_center + offset, -12.1 + rng.uniform(-0.35, 0.35), top_z + 0.2),
            0.68 if index != 1 else 0.86,
            materials,
            cliff_root,
        )
    # Rounded vine clusters keep the mass from reading as a bare stack.
    for index in range(13):
        angle = rng.uniform(0, math.pi * 2)
        x = x_center + math.cos(angle) * rng.uniform(1.5, 2.45)
        y = -10.9 + math.sin(angle) * rng.uniform(0.25, 0.8)
        z = rng.uniform(0.8, 6.4)
        ico(
            f"R4_CLIFF_{side}_VINE_{index:02d}",
            (x, y, z),
            (rng.uniform(0.28, 0.52), rng.uniform(0.16, 0.34), rng.uniform(0.25, 0.48)),
            materials["foliage_light" if index % 2 else "foliage_dark"],
            cliff_root,
        )

    waterfall_x = x_center + (-0.55 if side == "LEFT" else 0.55)
    waterfall_y = -10.68
    waterfall_vertices = [
        (waterfall_x - 0.72, waterfall_y, 6.9),
        (waterfall_x + 0.72, waterfall_y, 6.9),
        (waterfall_x + 0.86, waterfall_y, 0.15),
        (waterfall_x - 0.86, waterfall_y, 0.15),
    ]
    create_tri_panel_mesh(
        f"R4_WATERFALL_{side}",
        waterfall_vertices,
        [(0, 1, 2, 3)],
        [materials["waterfall"]],
        [0],
        cliff_root,
    )
    for stripe_index in range(3):
        stripe_x = waterfall_x + (stripe_index - 1) * 0.38
        curve_between(
            f"R4_WATERFALL_{side}_STREAM_{stripe_index:02d}",
            (stripe_x, waterfall_y - 0.025, 6.75),
            (stripe_x + rng.uniform(-0.12, 0.12), waterfall_y - 0.025, 0.35),
            0.045,
            materials["waterfall"],
            cliff_root,
        )
    torus(
        f"R4_WATERFALL_{side}_SPLASH",
        (waterfall_x, waterfall_y + 0.06, 0.0),
        0.74,
        0.07,
        materials["waterfall"],
        cliff_root,
        major_segments=24,
        minor_segments=6,
        scale=(1.0, 0.48, 1.0),
    )


def build_bridge(
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    bridge = empty("R4_BRIDGE", parent)
    plank_pitch = BRIDGE_LENGTH / BRIDGE_PLANK_COUNT
    plank_depth = plank_pitch - BRIDGE_GAP
    for index in range(BRIDGE_PLANK_COUNT):
        y = BRIDGE_NEAR_Y - plank_pitch * (index + 0.5)
        cube(
            f"R4_BRIDGE_PLANK_{index:02d}",
            (0, y, 0.56),
            (BRIDGE_WIDTH, plank_depth, 0.18),
            materials["wood"],
            bridge,
            rotation=(0, 0, math.sin(index * 0.9) * 0.012),
            bevel=0.045,
        )
    rail_x = BRIDGE_WIDTH * 0.5 + 0.06
    for side_index, x in enumerate((-rail_x, rail_x)):
        for post_index in range(7):
            t = post_index / 6
            y = BRIDGE_NEAR_Y + (BRIDGE_FAR_Y - BRIDGE_NEAR_Y) * t
            cylinder(
                f"R4_BRIDGE_RAIL_POST_{side_index}_{post_index:02d}",
                (x, y, 1.1),
                0.075,
                1.25,
                materials["wood"],
                bridge,
                vertices=12,
                bevel=0.015,
            )
            cone(
                f"R4_BRIDGE_POST_CAP_{side_index}_{post_index:02d}",
                (x, y, 1.82),
                0.13,
                0,
                0.28,
                materials["gold"],
                bridge,
                vertices=10,
            )
        cylinder(
            f"R4_BRIDGE_RAIL_{side_index}",
            (x, (BRIDGE_NEAR_Y + BRIDGE_FAR_Y) * 0.5, 1.55),
            0.065,
            BRIDGE_LENGTH,
            materials["wood"],
            bridge,
            vertices=12,
            rotation=(math.pi * 0.5, 0, 0),
        )
        curve_between(
            f"R4_BRIDGE_ROPE_{side_index}",
            (x, BRIDGE_NEAR_Y, 1.35),
            (x, BRIDGE_FAR_Y, 1.35),
            0.035,
            materials["gold"],
            bridge,
        )
    bridge["deck_width_m"] = BRIDGE_WIDTH
    bridge["deck_length_m"] = BRIDGE_LENGTH
    bridge["plank_count"] = BRIDGE_PLANK_COUNT
    bridge["max_gap_m"] = BRIDGE_GAP
    bridge["near_land_overlap_m"] = 0.60
    bridge["far_land_overlap_m"] = 1.10
    bridge["continuous_deck"] = True


def build_platform(
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    platform = empty("R4_PLATFORM", parent)
    cylinder(
        "R4_PLATFORM_BASE",
        (0, 0, 0.12),
        4.65,
        0.48,
        materials["stone"],
        platform,
        vertices=48,
        scale_xy=(1.0, 0.92),
        bevel=0.12,
    )
    cylinder(
        "R4_PLATFORM_TOP",
        (0, 0, 0.40),
        4.35,
        0.20,
        materials["platform"],
        platform,
        vertices=48,
        scale_xy=(1.0, 0.92),
        bevel=0.07,
    )
    torus(
        "R4_PLATFORM_OUTER_RING",
        (0, 0, 0.52),
        3.78,
        0.055,
        materials["gold"],
        platform,
        major_segments=48,
        minor_segments=6,
        scale=(1.0, 0.92, 1.0),
    )
    torus(
        "R4_PLATFORM_CORE_RING",
        (0, 0, 0.53),
        0.62,
        0.045,
        materials["cyan"],
        platform,
        major_segments=32,
        minor_segments=6,
        scale=(1.0, 0.92, 1.0),
    )
    for index in range(12):
        angle = 2 * math.pi * index / 12
        radius = 2.28
        cube(
            f"R4_PLATFORM_RADIAL_INLAY_{index:02d}",
            (math.cos(angle) * radius * 0.5, math.sin(angle) * radius * 0.5, 0.54),
            (0.045, radius, 0.025),
            materials["gold"],
            platform,
            rotation=(0, 0, -angle),
            bevel=0.01,
        )


def build_foliage(
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    foliage = empty("R4_FOLIAGE", parent)
    rng = random.Random(RANDOM_SEED + 8)
    clusters = [
        (-7.5, 4.8, 1.3),
        (-5.2, 6.0, 1.0),
        (-2.8, 7.0, 1.35),
        (0.0, 7.6, 1.5),
        (2.9, 7.0, 1.35),
        (5.3, 6.0, 1.0),
        (7.6, 4.8, 1.3),
        (-8.0, 1.8, 1.0),
        (8.0, 1.8, 1.0),
        (-7.3, -2.3, 0.88),
        (7.3, -2.3, 0.88),
    ]
    for cluster_index, (cx, cy, scale) in enumerate(clusters):
        cluster = empty(f"R4_BUSH_CLUSTER_{cluster_index:02d}", foliage)
        for blob_index in range(6):
            angle = 2 * math.pi * blob_index / 6 + rng.uniform(-0.25, 0.25)
            distance = rng.uniform(0.15, 0.72) * scale
            ico(
                f"R4_BUSH_{cluster_index:02d}_{blob_index:02d}",
                (
                    cx + math.cos(angle) * distance,
                    cy + math.sin(angle) * distance,
                    0.10 + rng.uniform(0.25, 0.62) * scale,
                ),
                (
                    rng.uniform(0.55, 0.95) * scale,
                    rng.uniform(0.48, 0.85) * scale,
                    rng.uniform(0.42, 0.78) * scale,
                ),
                materials["foliage_light" if blob_index % 3 else "foliage_dark"],
                cluster,
                subdivisions=1,
            )
        for flower_index in range(3):
            ico(
                f"R4_FLOWER_{cluster_index:02d}_{flower_index:02d}",
                (
                    cx + rng.uniform(-0.70, 0.70) * scale,
                    cy + rng.uniform(-0.55, 0.55) * scale,
                    0.72 * scale + rng.uniform(0.08, 0.38),
                ),
                (0.09, 0.09, 0.07),
                materials["purple"],
                cluster,
                subdivisions=1,
            )
    for rock_index in range(34):
        angle = 2 * math.pi * rock_index / 34
        radius = rng.uniform(5.2, 9.4)
        x = math.cos(angle) * radius
        y = math.sin(angle) * radius + 1.2
        if -1.8 < x < 1.8 and y < -2.8:
            continue
        ico(
            f"R4_BORDER_ROCK_{rock_index:02d}",
            (x, y, rng.uniform(-0.05, 0.20)),
            (rng.uniform(0.25, 0.68), rng.uniform(0.20, 0.55), rng.uniform(0.22, 0.50)),
            materials["stone"],
            foliage,
            subdivisions=1,
        )


def build_accents(
    materials: dict[str, bpy.types.Material],
    parent: bpy.types.Object,
) -> None:
    accents = empty("R4_ACCENTS", parent)
    crystal_positions = [
        (-5.0, -1.8, 0.15, 1.15),
        (5.0, -1.8, 0.15, 1.15),
        (-5.8, 2.5, 0.05, 0.92),
        (5.8, 2.5, 0.05, 0.92),
    ]
    for index, (x, y, z, height) in enumerate(crystal_positions):
        build_crystal(
            f"R4_CYAN_CRYSTAL_{index:02d}",
            (x, y, z),
            height,
            materials,
            accents,
        )
    for index, x in enumerate((-2.9, 2.9)):
        lamp = empty(f"R4_PLATFORM_LAMP_{index:02d}", accents, (x, 3.45, 0))
        cylinder(
            f"R4_PLATFORM_LAMP_{index:02d}_POST",
            (0, 0, 0.78),
            0.10,
            1.55,
            materials["gold"],
            lamp,
            vertices=12,
        )
        ico(
            f"R4_PLATFORM_LAMP_{index:02d}_CORE",
            (0, 0, 1.63),
            (0.23, 0.23, 0.30),
            materials["cyan"],
            lamp,
            subdivisions=1,
        )
        cone(
            f"R4_PLATFORM_LAMP_{index:02d}_CAP",
            (0, 0, 1.98),
            0.28,
            0,
            0.42,
            materials["gold"],
            lamp,
            vertices=10,
        )


def build_navigation(parent: bpy.types.Object) -> None:
    navigation = empty("R4_NAVIGATION", parent)
    points = {
        "NAV_PLATFORM_CENTER": (0.0, 0.0, 0.56),
        "NAV_BRIDGE_NEAR": (0.0, BRIDGE_NEAR_Y - 0.35, 0.76),
        "NAV_BRIDGE_MID": (0.0, (BRIDGE_NEAR_Y + BRIDGE_FAR_Y) * 0.5, 0.76),
        "NAV_BRIDGE_FAR": (0.0, BRIDGE_FAR_Y + 0.35, 0.76),
        "NAV_FAR_BANK": (0.0, -14.0, 0.55),
    }
    for name, location in points.items():
        marker = empty(name, navigation, location)
        marker["node_role"] = "navigation_waypoint"
        marker["surface"] = "bridge" if "BRIDGE" in name else "platform"
        marker["walkable"] = True

    colliders = empty("R4_COLLIDERS", parent)
    definitions = {
        "COLLIDER_PLATFORM_WALKABLE": (
            (0.0, 0.0, 0.50),
            "ellipse",
            (4.15, 3.82, 0.18),
            "walkable",
        ),
        "COLLIDER_BRIDGE_WALKABLE": (
            (0.0, (BRIDGE_NEAR_Y + BRIDGE_FAR_Y) * 0.5, 0.67),
            "box",
            (BRIDGE_WIDTH * 0.5, BRIDGE_LENGTH * 0.5, 0.18),
            "walkable",
        ),
        "COLLIDER_FAR_BANK_WALKABLE": (
            (0.0, -14.0, 0.48),
            "box",
            (2.55, 1.75, 0.22),
            "walkable",
        ),
        "COLLIDER_TENT_LEFT": (
            (-5.15, 1.10, 0.75),
            "cylinder",
            (2.15, 2.15, 1.50),
            "obstacle",
        ),
        "COLLIDER_TENT_RIGHT": (
            (5.15, 1.10, 0.75),
            "cylinder",
            (2.15, 2.15, 1.50),
            "obstacle",
        ),
    }
    for name, (location, shape, half_extents, role) in definitions.items():
        marker = empty(name, colliders, location)
        marker.empty_display_type = "CUBE"
        marker.empty_display_size = 1.0
        marker["node_role"] = "collision_proxy"
        marker["collision_role"] = role
        marker["shape"] = shape
        marker["half_extents_m"] = list(half_extents)
        marker["enabled"] = True


def build_scene(materials: dict[str, bpy.types.Material]) -> bpy.types.Object:
    root = empty("MOONLAKE_VISIBLE_R4_1")
    root["asset_id"] = ASSET_ID
    root["asset_version"] = "4.1A"
    root["units"] = "meters"
    root["authoring_up_axis"] = "Z"
    root["gltf_up_axis"] = "Y"
    root["shipping_default"] = False
    root["r2_composition_authority"] = True

    environment = empty("R4_ENVIRONMENT", root)
    # Lake and island foundations.
    cube(
        "R4_LAKE_SURFACE",
        (0, -6.2, -0.48),
        (24.0, 24.0, 0.16),
        materials["water"],
        environment,
        bevel=0.04,
    )
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=16,
        location=(0, 2.2, -1.62),
    )
    island = bpy.context.object
    island.name = "R4_FOREGROUND_ISLAND"
    island.scale = (10.8, 9.6, 1.8)
    apply_transform(island)
    assign_material(island, materials["moss_light"])
    island.parent = environment
    smooth(island)
    cube(
        "R4_FAR_BANK",
        (0, -14.0, 0.06),
        (6.0, 4.0, 0.80),
        materials["moss_light"],
        environment,
        bevel=0.36,
    )

    build_platform(materials, root)
    build_bridge(materials, root)
    build_cliff("LEFT", -6.9, materials, root)
    build_cliff("RIGHT", 6.9, materials, root)

    tent_left_group = empty("R4_TENT_LEFT", root)
    build_tent(
        "R4_TENT_LEFT_ASSEMBLY",
        (-5.15, 1.10, 0.48),
        materials["blue"],
        materials,
        tent_left_group,
    )
    tent_right_group = empty("R4_TENT_RIGHT", root)
    build_tent(
        "R4_TENT_RIGHT_ASSEMBLY",
        (5.15, 1.10, 0.48),
        materials["purple"],
        materials,
        tent_right_group,
    )
    build_tree("R4_TREE_LEFT", (-7.0, -1.2, 0.0), 1.20, materials, root)
    build_tree("R4_TREE_RIGHT", (7.0, -1.2, 0.0), 1.20, materials, root)
    build_foliage(materials, root)
    build_accents(materials, root)
    build_navigation(root)
    return root


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_camera() -> bpy.types.Object:
    camera_data = bpy.data.cameras.new("R4_FIXED_PORTRAIT_CAMERA")
    camera = bpy.data.objects.new("R4_FIXED_PORTRAIT_CAMERA", camera_data)
    bpy.context.scene.collection.objects.link(camera)
    camera.location = (0.0, 27.5, 27.0)
    camera_data.lens = 40
    camera_data.sensor_width = 36
    camera_data.type = "PERSP"
    camera_data.dof.use_dof = True
    camera_data.dof.focus_distance = 34.0
    camera_data.dof.aperture_fstop = 5.6
    look_at(camera, (0.0, -4.0, 1.7))
    camera["camera_role"] = "fixed_portrait_review"
    camera["free_orbit"] = False
    bpy.context.scene.camera = camera
    return camera


def setup_lighting() -> dict[str, bpy.types.Object]:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 390
    scene.render.resolution_y = 844
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 35
    scene.render.use_file_extension = True
    scene.view_settings.look = "AgX - Medium High Contrast"

    world = bpy.data.worlds.new("R4_REVIEW_WORLD")
    world.use_nodes = True
    scene.world = world

    sun_data = bpy.data.lights.new("R4_REVIEW_SUN", "SUN")
    sun_data.energy = 2.4
    sun_data.angle = math.radians(18)
    sun = bpy.data.objects.new("R4_REVIEW_SUN", sun_data)
    bpy.context.scene.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(32), math.radians(-18), math.radians(-34))

    key_data = bpy.data.lights.new("R4_REVIEW_KEY", "AREA")
    key_data.energy = 1150
    key_data.shape = "DISK"
    key_data.size = 9.0
    key = bpy.data.objects.new("R4_REVIEW_KEY", key_data)
    bpy.context.scene.collection.objects.link(key)
    key.location = (-9.0, 7.0, 18.0)
    look_at(key, (0, -3, 1))

    fill_data = bpy.data.lights.new("R4_REVIEW_FILL", "AREA")
    fill_data.energy = 720
    fill_data.shape = "DISK"
    fill_data.size = 12.0
    fill = bpy.data.objects.new("R4_REVIEW_FILL", fill_data)
    bpy.context.scene.collection.objects.link(fill)
    fill.location = (11.0, -1.0, 12.0)
    look_at(fill, (0, -4, 2))

    front_data = bpy.data.lights.new("R4_REVIEW_FRONT", "AREA")
    front_data.energy = 620
    front_data.shape = "DISK"
    front_data.size = 10.0
    front = bpy.data.objects.new("R4_REVIEW_FRONT", front_data)
    bpy.context.scene.collection.objects.link(front)
    front.location = (0.0, 15.0, 17.0)
    look_at(front, (0, -2, 1.5))

    return {
        "sun": sun,
        "key": key,
        "fill": fill,
        "front": front,
        "world": world,
    }


def top_level_owner(
    obj: bpy.types.Object,
    root: bpy.types.Object,
) -> bpy.types.Object:
    current = obj
    while current.parent is not None and current.parent != root:
        current = current.parent
    return current


def merge_static_meshes_by_material(root: bpy.types.Object) -> dict[str, int]:
    """Reduce WebGL draw-call pressure without flattening semantic roots."""
    curves = [obj for obj in bpy.context.scene.objects if obj.type == "CURVE"]
    before = sum(
        1 for obj in bpy.context.scene.objects if obj.type in {"MESH", "CURVE"}
    )
    for obj in curves:
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.convert(target="MESH")
        obj.select_set(False)
    groups: dict[tuple[str, str], list[bpy.types.Object]] = {}
    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH":
            continue
        if obj.name.startswith("R4_BRIDGE_PLANK_"):
            continue
        if len(obj.data.materials) != 1 or obj.data.materials[0] is None:
            continue
        if obj.keys():
            continue
        owner = top_level_owner(obj, root)
        material = obj.data.materials[0]
        groups.setdefault((owner.name, material.name), []).append(obj)

    merged_groups = 0
    for (owner_name, material_name), objects in groups.items():
        if len(objects) < 2:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        active = objects[0]
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = active
        bpy.ops.object.join()
        active.name = f"R4_MERGED_{owner_name}_{material_name}"
        bpy.context.view_layer.objects.active = active
        bpy.ops.object.material_slot_remove_unused()
        active.select_set(False)
        merged_groups += 1

    after = sum(1 for obj in bpy.context.scene.objects if obj.type == "MESH")
    return {
        "renderablesBefore": before,
        "meshObjectsAfter": after,
        "curvesConverted": len(curves),
        "mergedGroups": merged_groups,
    }


def configure_review_variant(
    lights: dict[str, bpy.types.Object],
    variant: str,
) -> None:
    world_node = lights["world"].node_tree.nodes["Background"]
    volume_node = lights["world"].node_tree.nodes.get("R4_MIST_VOLUME")
    if volume_node:
        lights["world"].node_tree.nodes.remove(volume_node)
        lights["world"].node_tree.links.new(
            world_node.outputs["Background"],
            lights["world"].node_tree.nodes["World Output"].inputs["Surface"],
        )

    sun = lights["sun"].data
    key = lights["key"].data
    fill = lights["fill"].data
    front = lights["front"].data
    scene = bpy.context.scene

    if variant == "day-clear":
        world_node.inputs["Color"].default_value = (0.13, 0.32, 0.52, 1)
        world_node.inputs["Strength"].default_value = 0.38
        sun.color = (1.0, 0.82, 0.60)
        sun.energy = 2.5
        key.color = (1.0, 0.80, 0.64)
        key.energy = 1150
        fill.color = (0.38, 0.66, 1.0)
        fill.energy = 720
        front.color = (0.92, 0.94, 1.0)
        front.energy = 620
        scene.view_settings.look = "AgX - Medium High Contrast"
    elif variant == "dusk-mist":
        world_node.inputs["Color"].default_value = (0.22, 0.16, 0.34, 1)
        world_node.inputs["Strength"].default_value = 0.48
        sun.color = (1.0, 0.36, 0.20)
        sun.energy = 1.60
        key.color = (1.0, 0.32, 0.24)
        key.energy = 1050
        fill.color = (0.32, 0.44, 0.90)
        fill.energy = 920
        front.color = (0.68, 0.56, 0.90)
        front.energy = 980
    elif variant == "night-clear":
        world_node.inputs["Color"].default_value = (0.015, 0.035, 0.09, 1)
        world_node.inputs["Strength"].default_value = 0.16
        sun.color = (0.32, 0.48, 0.92)
        sun.energy = 0.48
        key.color = (0.20, 0.38, 0.92)
        key.energy = 520
        fill.color = (0.12, 0.65, 0.86)
        fill.energy = 760
        front.color = (0.22, 0.52, 0.78)
        front.energy = 520
        scene.view_settings.look = "AgX - Medium High Contrast"
    elif variant == "day-rain-proxy":
        world_node.inputs["Color"].default_value = (0.08, 0.20, 0.30, 1)
        world_node.inputs["Strength"].default_value = 0.30
        sun.color = (0.58, 0.70, 0.82)
        sun.energy = 1.15
        key.color = (0.54, 0.66, 0.82)
        key.energy = 720
        fill.color = (0.20, 0.56, 0.78)
        fill.energy = 610
        front.color = (0.62, 0.72, 0.84)
        front.energy = 720
        scene.view_settings.look = "AgX - Medium High Contrast"
    else:
        raise ValueError(f"Unknown review variant: {variant}")


def render_reviews(
    render_dir: Path,
    lights: dict[str, bpy.types.Object],
) -> list[str]:
    render_dir.mkdir(parents=True, exist_ok=True)
    outputs = []
    for variant in ("day-clear", "dusk-mist", "night-clear", "day-rain-proxy"):
        configure_review_variant(lights, variant)
        output_path = render_dir / f"moonlake-visible-r4-1-{variant}-390x844.png"
        bpy.context.scene.render.filepath = str(output_path)
        bpy.ops.render.render(write_still=True)
        outputs.append(str(output_path))
    return outputs


def mesh_triangles() -> int:
    total = 0
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        obj.data.calc_loop_triangles()
        total += len(obj.data.loop_triangles)
    return total


def export_glb(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_cameras=True,
        export_lights=False,
        export_extras=True,
        export_yup=True,
        export_apply=True,
    )


def main() -> None:
    args = parse_args()
    output_path = Path(args.output_glb).resolve()
    render_dir = Path(args.render_dir).resolve()
    random.seed(RANDOM_SEED)
    reset_scene()
    materials = create_materials()
    root = build_scene(materials)
    camera = setup_camera()
    lights = setup_lighting()
    optimization = merge_static_meshes_by_material(root)
    triangles_before_export = mesh_triangles()
    root["authored_triangle_count"] = triangles_before_export
    root["shared_material_count"] = len(materials)
    root["renderable_mesh_objects"] = optimization["meshObjectsAfter"]
    root["bridge_width_m"] = BRIDGE_WIDTH
    root["bridge_length_m"] = BRIDGE_LENGTH
    export_glb(output_path)
    renders = [] if args.skip_renders else render_reviews(render_dir, lights)
    result = {
        "pass": True,
        "assetId": ASSET_ID,
        "outputGlb": str(output_path),
        "bytes": output_path.stat().st_size,
        "trianglesBeforeExport": triangles_before_export,
        "materials": len(materials),
        "objects": len(bpy.context.scene.objects),
        "optimization": optimization,
        "camera": camera.name,
        "bridge": {
            "widthM": BRIDGE_WIDTH,
            "lengthM": BRIDGE_LENGTH,
            "plankCount": BRIDGE_PLANK_COUNT,
            "maxGapM": BRIDGE_GAP,
        },
        "renders": renders,
    }
    print("R4_1_AUTHOR_RESULT=" + json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
