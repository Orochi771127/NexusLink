"""Build the Crystalfin Seahorse Orbit-top R2 candidate in Blender.

Offline authoring only. The GLB and review renders stay under output/ until a
human visual gate promotes them into assets/. Runtime collision, energy and
ring-out authority remain in src/orbit/orbitPhysics.js; the exported collider
metadata is an audit contract, not a mesh-physics replacement.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector


ASSET_ID = "crystalfin-seahorse-orbit-top-r2"


def parse_args() -> argparse.Namespace:
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", required=True)
    return parser.parse_args(args)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.objects,
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def set_input(bsdf, name: str, value) -> None:
    socket = bsdf.inputs.get(name)
    if socket is not None:
        socket.default_value = value


def make_material(
    name: str,
    color: tuple[float, float, float, float],
    *,
    roughness: float,
    metallic: float = 0.0,
    transmission: float = 0.0,
    coat: float = 0.0,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    set_input(bsdf, "Base Color", color)
    set_input(bsdf, "Roughness", roughness)
    set_input(bsdf, "Metallic", metallic)
    set_input(bsdf, "Transmission Weight", transmission)
    set_input(bsdf, "Coat Weight", coat)
    set_input(bsdf, "Coat Roughness", max(0.05, roughness * 0.42))
    set_input(bsdf, "IOR", 1.46)
    if emission is not None:
        set_input(bsdf, "Emission Color", emission)
        set_input(bsdf, "Emission Strength", emission_strength)
    return material


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(material)


def smooth_bevel(obj: bpy.types.Object, bevel: float = 0.04) -> None:
    if hasattr(obj.data, "polygons"):
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    if bevel > 0:
        modifier = obj.modifiers.new("ResinClayBevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3


def add_uv_sphere(
    name: str,
    parent: bpy.types.Object,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth_bevel(obj, 0.018)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_torus(
    name: str,
    parent: bpy.types.Object,
    location: tuple[float, float, float],
    major_radius: float,
    minor_radius: float,
    material: bpy.types.Material,
    *,
    scale_z: float = 1.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=56,
        minor_segments=16,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale.z = scale_z
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth_bevel(obj, 0.012)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_cone(
    name: str,
    parent: bpy.types.Object,
    location: tuple[float, float, float],
    radius1: float,
    radius2: float,
    depth: float,
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(
        vertices=40,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    smooth_bevel(obj, 0.035)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_crystal(
    name: str,
    parent: bpy.types.Object,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    rotation: tuple[float, float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rotation
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_spiral_ridge(
    name: str,
    parent: bpy.types.Object,
    material: bpy.types.Material,
    *,
    z: float,
    radius: float,
    turns: float,
    thickness: float,
) -> bpy.types.Object:
    curve_data = bpy.data.curves.new(name + "Curve", "CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 3
    curve_data.bevel_depth = thickness
    curve_data.bevel_resolution = 4
    spline = curve_data.splines.new("NURBS")
    point_count = 72
    spline.points.add(point_count - 1)
    for index in range(point_count):
        t = index / (point_count - 1)
        angle = turns * math.tau * t + math.pi * 0.08
        current_radius = radius * (0.16 + 0.84 * t)
        x = math.cos(angle) * current_radius
        y = math.sin(angle) * current_radius
        arch = 0.03 * math.sin(t * math.pi)
        spline.points[index].co = (x, y, z + arch, 1)
    spline.order_u = 4
    spline.use_endpoint_u = True
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(obj)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_belly_plates(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    *,
    prefix: str,
    z: float,
) -> None:
    for index in range(6):
        angle = -0.74 + index * 0.295
        radius = 0.47 + index * 0.028
        x = math.sin(angle) * radius
        y = -0.45 + math.cos(angle) * 0.13
        plate = add_uv_sphere(
            f"{prefix}_IvoryBellyPlate_{index + 1:02d}",
            parent,
            (x, y, z + index * 0.012),
            (0.13, 0.075, 0.045),
            material,
        )
        plate.rotation_euler.z = -angle * 0.72


def add_cardinal_crystals(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    *,
    prefix: str,
    radius: float,
    z: float,
    scale: float,
) -> None:
    for index in range(4):
        angle = index * math.pi * 0.5
        add_crystal(
            f"{prefix}_CardinalCrystal_{index + 1:02d}",
            parent,
            (math.cos(angle) * radius, math.sin(angle) * radius, z),
            (0.34 * scale, 0.16 * scale, 0.12 * scale),
            (0, 0.42, angle),
            material,
        )


def add_crown_crystals(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    *,
    prefix: str,
    radius: float,
    z: float,
    scale: float,
) -> None:
    for index, angle in enumerate((-0.78, -0.39, 0, 0.39, 0.78)):
        local_angle = angle + math.pi * 0.5
        add_crystal(
            f"{prefix}_CrownCrystal_{index + 1:02d}",
            parent,
            (math.cos(local_angle) * radius, math.sin(local_angle) * radius, z + 0.03 * math.cos(angle)),
            (0.16 * scale, 0.34 * scale, 0.14 * scale),
            (0.36, 0, local_angle),
            material,
        )


def add_form(
    parent: bpy.types.Object,
    materials: dict[str, bpy.types.Material],
    *,
    resonance: bool,
) -> None:
    prefix = "CrystalfinResonance" if resonance else "CrystalfinBase"
    shell_scale = 1.08 if resonance else 1.0
    add_uv_sphere(
        prefix + "_AquaticClayLowerShell",
        parent,
        (0, 0, 0.47),
        (1.05 * shell_scale, 1.05 * shell_scale, 0.36),
        materials["clay"],
    )
    add_torus(
        prefix + "_PearlCyanUpperShell",
        parent,
        (0, 0, 0.66),
        0.72 * shell_scale,
        0.27,
        materials["clay"],
        scale_z=0.82,
    )
    add_torus(
        prefix + "_GoldCyberTaoBezel",
        parent,
        (0, 0, 0.78),
        0.59 * shell_scale,
        0.045,
        materials["gold"],
        scale_z=0.76,
    )
    add_torus(
        prefix + "_OuterGoldSealRing",
        parent,
        (0, 0, 0.73),
        0.86 * shell_scale,
        0.026,
        materials["gold"],
        scale_z=0.74,
    )
    add_spiral_ridge(
        prefix + "_SpiralTailRidge",
        parent,
        materials["deep_clay"],
        z=0.94,
        radius=0.46 * shell_scale,
        turns=1.42,
        thickness=0.058,
    )
    add_belly_plates(parent, materials["ivory"], prefix=prefix, z=0.92)
    add_crystal(
        prefix + "_SapphireHeartCoreDiamond",
        parent,
        (0, -0.53, 0.96),
        (0.19, 0.19, 0.1),
        (0, 0, math.pi * 0.25),
        materials["crystal"],
    )
    add_cone(prefix + "_BottomSpinTip", parent, (0, 0, 0.18), 0.11, 0.25, 0.36, materials["gold"])
    add_cardinal_crystals(
        parent,
        materials["crystal"],
        prefix=prefix,
        radius=0.99 * shell_scale,
        z=0.67,
        scale=1.18 if resonance else 1.0,
    )
    add_crown_crystals(
        parent,
        materials["crystal"],
        prefix=prefix,
        radius=0.78 * shell_scale,
        z=0.76,
        scale=1.18 if resonance else 1.0,
    )
    if resonance:
        add_torus(
            prefix + "_ResonanceHalo",
            parent,
            (0, 0, 0.58),
            1.08,
            0.038,
            materials["emissive"],
            scale_z=0.78,
        )
        for index in range(4):
            angle = index * math.pi * 0.5 + math.pi * 0.25
            add_crystal(
                f"{prefix}_ResonanceShard_{index + 1:02d}",
                parent,
                (math.cos(angle) * 1.11, math.sin(angle) * 1.11, 0.63),
                (0.26, 0.11, 0.09),
                (0, 0.32, angle),
                materials["emissive"],
            )


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_studio() -> tuple[bpy.types.Object, bpy.types.Object]:
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.012, 0.035, 0.065, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.26

    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -0.01))
    floor = bpy.context.object
    floor.name = "ReviewFloor"
    assign_material(floor, make_material("ReviewFloorMaterial", (0.08, 0.16, 0.17, 1), roughness=0.84))

    for name, location, energy, color, size in (
        ("CoolKey", (4.1, -4.2, 5.8), 780, (0.82, 0.96, 1.0), 4.0),
        ("BlueFill", (-4.2, -1.2, 3.4), 260, (0.4, 0.68, 1.0), 3.5),
        ("CyanRim", (1.6, 4.1, 5.2), 520, (0.45, 0.9, 1.0), 3.0),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.color = color
        data.shape = "DISK"
        data.size = size
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = location
        look_at(light, (0, 0, 0.58))

    camera_data = bpy.data.cameras.new("ReviewCamera")
    camera = bpy.data.objects.new("ReviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.data.type = "ORTHO"
    bpy.context.scene.camera = camera
    return camera, floor


def set_form_visibility(root: bpy.types.Object, visible_form: str) -> None:
    for child in root.children:
        if child.name == "ColliderProxy_Deterministic2D":
            child.hide_render = True
            continue
        visible = child.name == visible_form
        child.hide_render = not visible
        child.hide_viewport = not visible
        for descendant in child.children_recursive:
            descendant.hide_render = not visible
            descendant.hide_viewport = not visible


def render_review(
    scene: bpy.types.Scene,
    camera: bpy.types.Object,
    root: bpy.types.Object,
    out_dir: Path,
) -> list[str]:
    rendered: list[str] = []
    views = {
        "three-quarter": ((3.7, -4.7, 3.6), (0, 0, 0.58), 3.45),
        "top": ((0.01, -0.01, 7.0), (0, 0, 0.58), 3.35),
    }
    for form_name, form_slug in (("BaseForm", "base"), ("ResonanceForm", "resonance")):
        set_form_visibility(root, form_name)
        for view_name, (location, target, ortho_scale) in views.items():
            camera.location = location
            camera.data.ortho_scale = ortho_scale
            look_at(camera, target)
            path = out_dir / f"{ASSET_ID}-{form_slug}-{view_name}.png"
            scene.render.filepath = str(path)
            bpy.ops.render.render(write_still=True)
            rendered.append(str(path))
    return rendered


def select_hierarchy(root: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for child in root.children_recursive:
        if child.type not in {"CAMERA", "LIGHT"}:
            child.select_set(True)
    bpy.context.view_layer.objects.active = root


def main() -> None:
    args = parse_args()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    clear_scene()

    materials = {
        "clay": make_material("CrystalfinAquaticClay", (0.025, 0.25, 0.56, 1), roughness=0.58, coat=0.3),
        "deep_clay": make_material("CrystalfinDeepClay", (0.008, 0.06, 0.2, 1), roughness=0.64, coat=0.2),
        "ivory": make_material("CrystalfinIvoryInlay", (0.78, 0.69, 0.43, 1), roughness=0.48, coat=0.18),
        "gold": make_material("CrystalfinWarmGold", (0.62, 0.31, 0.045, 1), roughness=0.3, metallic=0.72, coat=0.18),
        "crystal": make_material("CrystalfinSapphireResin", (0.015, 0.28, 0.82, 1), roughness=0.17, transmission=0.12, coat=0.72, emission=(0.01, 0.18, 0.65, 1), emission_strength=0.18),
        "emissive": make_material("CrystalfinResonanceCyan", (0.025, 0.58, 0.95, 1), roughness=0.14, transmission=0.1, coat=0.78, emission=(0.01, 0.42, 0.9, 1), emission_strength=0.82),
    }

    root = bpy.data.objects.new("OrbitTopRoot", None)
    bpy.context.collection.objects.link(root)
    root["asset_id"] = ASSET_ID
    root["owner_id"] = "crystalfin-seahorse"
    root["spin_axis"] = "0,0,1"
    root["bottom_contact_z"] = 0.0
    root["collider_type"] = "deterministic_2d_circle"
    root["collider_radius_normalized"] = 1.0
    root["physics_authority"] = "src/orbit/orbitPhysics.js"
    root["form_authority"] = "session-only presentation"

    base = bpy.data.objects.new("BaseForm", None)
    resonance = bpy.data.objects.new("ResonanceForm", None)
    collider = bpy.data.objects.new("ColliderProxy_Deterministic2D", None)
    bpy.context.collection.objects.link(base)
    bpy.context.collection.objects.link(resonance)
    bpy.context.collection.objects.link(collider)
    base.parent = root
    resonance.parent = root
    collider.parent = root
    collider["type"] = "circle"
    collider["normalized_radius"] = 1.0
    collider["mesh_is_authority"] = False

    add_form(base, materials, resonance=False)
    add_form(resonance, materials, resonance=True)

    camera, floor = add_studio()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 768
    scene.render.resolution_y = 768
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    renders = render_review(scene, camera, root, out_dir)

    for form in (base, resonance):
        form.hide_render = False
        form.hide_viewport = False
        for descendant in form.children_recursive:
            descendant.hide_render = False
            descendant.hide_viewport = False
    collider.hide_render = True
    floor.hide_render = True

    select_hierarchy(root)
    glb_path = out_dir / f"{ASSET_ID}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=False,
        export_cameras=False,
        export_lights=False,
    )
    blend_path = out_dir / f"{ASSET_ID}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

    manifest = {
        "schemaVersion": 1,
        "packId": "global-3d-gameplay-pilots-r2",
        "generator": "tools/blender/build_crystalfin_orbit_top_r2.py",
        "blenderVersion": bpy.app.version_string,
        "humanApprovalRequired": True,
        "runtimePromotionAllowed": False,
        "physicsAuthority": "src/orbit/orbitPhysics.js",
        "assets": [
            {
                "assetId": ASSET_ID,
                "ownerType": "companion",
                "ownerId": "crystalfin-seahorse",
                "glb": str(glb_path),
                "blend": str(blend_path),
                "reviewRenders": renders,
                "nodes": {"base": "BaseForm", "resonance": "ResonanceForm", "colliderProxy": "ColliderProxy_Deterministic2D"},
                "coordinateFrame": "Blender Z-up authoring; glTF Y-up export",
                "bottomContactZ": 0.0,
                "pivot": [0, 0, 0],
                "spinAxisAuthoring": [0, 0, 1],
                "collider": {
                    "type": "deterministic-2d-circle",
                    "source": "src/orbit/orbitPhysics.js body.radius",
                    "meshIsAuthority": False,
                },
                "formContract": "base/resonance visibility only; session state is not persisted",
                "artStatus": "candidate-awaiting-human",
            }
        ],
    }
    manifest_path = out_dir / "crystalfin-orbit-top-r2-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"wrote {manifest_path}")


if __name__ == "__main__":
    main()
