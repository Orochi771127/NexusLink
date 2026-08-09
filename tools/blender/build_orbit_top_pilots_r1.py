"""Build Nexus Link Orbit-top Pilot candidates in Blender.

Offline authoring only. The exported GLBs remain under output/ until a human
visual gate promotes them into assets/. Runtime collision authority stays in
the deterministic Orbit engine; collider metadata here is an audit contract.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector


def parse_args() -> argparse.Namespace:
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", required=True)
    return parser.parse_args(args)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for datablocks in (
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
    set_input(bsdf, "Coat Roughness", max(0.06, roughness * 0.45))
    if emission is not None:
        set_input(bsdf, "Emission Color", emission)
        set_input(bsdf, "Emission Strength", emission_strength)
    return material


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(material)


def smooth_bevel(obj: bpy.types.Object, bevel: float = 0.05) -> None:
    if hasattr(obj.data, "polygons"):
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    if bevel > 0:
        modifier = obj.modifiers.new("SoftClayBevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3


def add_uv_sphere(
    name: str,
    parent: bpy.types.Object,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth_bevel(obj, 0.02)
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
    scale_z: float = 1.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=64,
        minor_segments=20,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale.z = scale_z
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth_bevel(obj, 0.015)
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
        vertices=48,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    smooth_bevel(obj, 0.06)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_rounded_cube(
    name: str,
    parent: bpy.types.Object,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    rotation_z: float,
    material: bpy.types.Material,
    bevel: float = 0.12,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=(0, 0, rotation_z))
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth_bevel(obj, bevel)
    assign_material(obj, material)
    obj.parent = parent
    return obj


def add_radial_fins(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    *,
    prefix: str,
    radius: float,
    z: float,
    length: float,
    width: float,
) -> list[bpy.types.Object]:
    fins = []
    for index in range(4):
        angle = index * math.pi * 0.5
        x = math.cos(angle) * radius
        y = math.sin(angle) * radius
        fin = add_uv_sphere(
            f"{prefix}_ResonanceFin_{index + 1:02d}",
            parent,
            (x, y, z),
            (length, width, 0.12),
            material,
        )
        fin.rotation_euler.z = angle
        fins.append(fin)
    return fins


def add_cardinal_guards(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    *,
    prefix: str,
    radius: float,
    z: float,
) -> list[bpy.types.Object]:
    guards = []
    for index in range(4):
        angle = index * math.pi * 0.5
        guards.append(
            add_rounded_cube(
                f"{prefix}_CardinalGuard_{index + 1:02d}",
                parent,
                (math.cos(angle) * radius, math.sin(angle) * radius, z),
                (0.17, 0.25, 0.08),
                angle,
                material,
                0.1,
            )
        )
    return guards


def add_greyshade_form(
    parent: bpy.types.Object,
    materials: dict[str, bpy.types.Material],
    resonance: bool,
) -> None:
    prefix = "GreyshadeResonance" if resonance else "GreyshadeBase"
    add_uv_sphere(prefix + "_LowerClayMass", parent, (0, 0, 0.48), (1.05, 1.05, 0.36), materials["clay"])
    add_torus(prefix + "_OuterShell", parent, (0, 0, 0.66), 0.75, 0.27, materials["clay"], 0.82)
    add_torus(prefix + "_CyanChannel", parent, (0, 0, 0.73), 0.61, 0.075, materials["cyan"], 0.72)
    add_torus(prefix + "_GoldBezel", parent, (0, 0, 0.82), 0.31, 0.055, materials["gold"], 0.75)
    add_cone(prefix + "_SpinTip", parent, (0, 0, 0.19), 0.11, 0.26, 0.38, materials["gold"])
    add_cardinal_guards(parent, materials["ivory"], prefix=prefix, radius=0.94, z=0.7)

    for index, angle in enumerate((-0.72, 0.0, 0.72)):
        band = add_torus(prefix + f"_TabbyBand_{index + 1:02d}", parent, (0, 0, 0.79 + index * 0.012), 0.45 + index * 0.13, 0.027, materials["stripe"], 0.72)
        band.rotation_euler.z = angle

    add_uv_sphere(prefix + "_HeartLeft", parent, (-0.13, 0.02, 0.93), (0.22, 0.2, 0.11), materials["cyan"])
    add_uv_sphere(prefix + "_HeartRight", parent, (0.13, 0.02, 0.93), (0.22, 0.2, 0.11), materials["cyan"])
    heart_tip = add_rounded_cube(prefix + "_HeartPoint", parent, (0, -0.12, 0.91), (0.2, 0.2, 0.1), math.pi * 0.25, materials["cyan"], 0.09)
    heart_tip.rotation_euler.z = math.pi * 0.25

    add_uv_sphere(prefix + "_EarFinLeft", parent, (-0.47, 0.63, 0.82), (0.18, 0.29, 0.12), materials["clay"])
    add_uv_sphere(prefix + "_EarFinRight", parent, (0.47, 0.63, 0.82), (0.18, 0.29, 0.12), materials["clay"])
    if resonance:
        add_radial_fins(parent, materials["cyan"], prefix=prefix, radius=1.08, z=0.65, length=0.48, width=0.21)
        add_torus(prefix + "_ResonanceHalo", parent, (0, 0, 0.82), 0.93, 0.045, materials["cyan"], 0.8)


def add_rift_form(
    parent: bpy.types.Object,
    materials: dict[str, bpy.types.Material],
    resonance: bool,
) -> None:
    prefix = "RiftResonance" if resonance else "RiftBase"
    add_torus(prefix + "_OuterClayTorus", parent, (0, 0, 0.65), 0.7, 0.31, materials["rift_clay"], 0.82)
    add_torus(prefix + "_SmokyResinChannel", parent, (0, 0, 0.76), 0.69, 0.095, materials["violet"], 0.72)
    add_torus(prefix + "_TrueVoidBezel", parent, (0, 0, 0.83), 0.36, 0.085, materials["coral"], 0.72)
    add_torus(prefix + "_VoidOcclusionRing", parent, (0, 0, 0.8), 0.23, 0.045, materials["void"], 0.9)
    add_cone(prefix + "_SpinTip", parent, (0, 0, 0.18), 0.1, 0.24, 0.36, materials["trim"])
    add_cardinal_guards(parent, materials["trim"], prefix=prefix, radius=0.96, z=0.69)

    for index in range(4):
        angle = index * math.pi * 0.5 + math.pi * 0.25
        add_rounded_cube(
            prefix + f"_FaultGlyph_{index + 1:02d}",
            parent,
            (math.cos(angle) * 0.56, math.sin(angle) * 0.56, 0.86),
            (0.08, 0.2, 0.045),
            angle,
            materials["coral"],
            0.06,
        )
    if resonance:
        add_radial_fins(parent, materials["violet"], prefix=prefix, radius=1.1, z=0.64, length=0.52, width=0.22)
        add_torus(prefix + "_ResonanceFaultRing", parent, (0, 0, 0.86), 0.91, 0.05, materials["coral"], 0.78)


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_studio() -> tuple[bpy.types.Object, bpy.types.Object]:
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.055, 0.075, 0.08, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.34

    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -0.01))
    floor = bpy.context.object
    floor.name = "ReviewFloor"
    assign_material(floor, make_material("ReviewFloorMaterial", (0.12, 0.16, 0.15, 1), roughness=0.9))

    for name, light_type, location, energy, color, size in (
        ("Key", "AREA", (4.2, -4.0, 6.0), 1050, (1.0, 0.86, 0.72), 4.2),
        ("Fill", "AREA", (-4.0, -1.0, 3.8), 650, (0.55, 0.85, 1.0), 3.5),
        ("Rim", "AREA", (1.5, 4.0, 5.0), 900, (0.45, 0.8, 1.0), 3.0),
    ):
        data = bpy.data.lights.new(name, light_type)
        data.energy = energy
        data.color = color
        data.shape = "DISK"
        data.size = size
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = location
        look_at(light, (0, 0, 0.55))

    camera_data = bpy.data.cameras.new("ReviewCamera")
    camera = bpy.data.objects.new("ReviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 3.5
    bpy.context.scene.camera = camera
    return camera, floor


def set_form_visibility(root: bpy.types.Object, visible_form: str) -> None:
    for child in root.children:
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
    asset_id: str,
) -> list[str]:
    rendered = []
    views = {
        "three-quarter": ((3.8, -4.8, 3.7), (0, 0, 0.6), 3.45),
        "top": ((0.01, -0.01, 7.0), (0, 0, 0.6), 3.35),
    }
    for form_name, form_slug in (("BaseForm", "base"), ("ResonanceForm", "resonance")):
        set_form_visibility(root, form_name)
        for view_name, (location, target, ortho_scale) in views.items():
            camera.location = location
            camera.data.ortho_scale = ortho_scale
            look_at(camera, target)
            path = out_dir / f"{asset_id}-{form_slug}-{view_name}.png"
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


def export_asset(
    out_dir: Path,
    asset_id: str,
    build_form,
    materials: dict[str, bpy.types.Material],
) -> dict:
    root = bpy.data.objects.new("OrbitTopRoot", None)
    bpy.context.collection.objects.link(root)
    root["asset_id"] = asset_id
    root["spin_axis"] = "0,0,1"
    root["bottom_contact_z"] = 0.0
    root["collider_type"] = "deterministic_2d_circle"
    root["collider_radius_normalized"] = 1.0
    root["physics_authority"] = "src/orbit/orbitPhysics.js"

    base = bpy.data.objects.new("BaseForm", None)
    resonance = bpy.data.objects.new("ResonanceForm", None)
    bpy.context.collection.objects.link(base)
    bpy.context.collection.objects.link(resonance)
    base.parent = root
    resonance.parent = root
    build_form(base, materials, False)
    build_form(resonance, materials, True)

    camera, floor = add_studio()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 768
    scene.render.resolution_y = 768
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.image_settings.color_mode = "RGBA"
    renders = render_review(scene, camera, root, out_dir, asset_id)

    # Review renders intentionally isolate one form at a time. Restore both
    # before GLB export so runtime visibility switching has two real nodes.
    for form in root.children:
        form.hide_render = False
        form.hide_viewport = False
        for descendant in form.children_recursive:
            descendant.hide_render = False
            descendant.hide_viewport = False

    floor.hide_render = True
    select_hierarchy(root)
    glb_path = out_dir / f"{asset_id}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=False,
        export_cameras=False,
        export_lights=False,
    )
    blend_path = out_dir / f"{asset_id}.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    return {
        "assetId": asset_id,
        "glb": str(glb_path),
        "blend": str(blend_path),
        "reviewRenders": renders,
        "nodes": {"base": "BaseForm", "resonance": "ResonanceForm"},
        "coordinateFrame": "Blender Z-up authoring; glTF Y-up export",
        "bottomContactZ": 0.0,
        "pivot": [0, 0, 0],
        "spinAxisAuthoring": [0, 0, 1],
        "collider": {
            "type": "deterministic-2d-circle",
            "source": "src/orbit/orbitPhysics.js body.radius",
            "meshIsAuthority": False,
        },
        "artStatus": "candidate-awaiting-human",
    }


def main() -> None:
    args = parse_args()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    clear_scene()
    grey_materials = {
        "clay": make_material("GreyshadeClay", (0.19, 0.21, 0.2, 1), roughness=0.72),
        "stripe": make_material("GreyshadeStripe", (0.025, 0.032, 0.03, 1), roughness=0.68),
        "cyan": make_material("GreyshadeCyanResin", (0.08, 0.72, 0.9, 1), roughness=0.18, transmission=0.26, coat=0.72, emission=(0.05, 0.45, 0.7, 1), emission_strength=0.4),
        "gold": make_material("WarmGoldTrim", (0.72, 0.53, 0.24, 1), roughness=0.35, metallic=0.48, coat=0.25),
        "ivory": make_material("IvoryCeramic", (0.84, 0.82, 0.72, 1), roughness=0.55, coat=0.16),
    }
    grey = export_asset(out_dir, "greyshade-cat-orbit-top-r1", add_greyshade_form, grey_materials)

    clear_scene()
    rift_materials = {
        "rift_clay": make_material("RiftIndigoClay", (0.12, 0.08, 0.19, 1), roughness=0.7),
        "violet": make_material("RiftSmokyResin", (0.38, 0.12, 0.62, 1), roughness=0.2, transmission=0.2, coat=0.65, emission=(0.24, 0.05, 0.42, 1), emission_strength=0.35),
        "coral": make_material("RiftCoralFault", (0.92, 0.18, 0.43, 1), roughness=0.25, coat=0.45, emission=(0.75, 0.04, 0.24, 1), emission_strength=1.6),
        "void": make_material("RiftTrueVoid", (0.004, 0.002, 0.008, 1), roughness=0.9),
        "trim": make_material("RiftIvoryTrim", (0.68, 0.63, 0.58, 1), roughness=0.48, metallic=0.2),
    }
    rift = export_asset(out_dir, "rift-echo-orbit-top-r1", add_rift_form, rift_materials)

    manifest = {
        "schemaVersion": 1,
        "generator": "tools/blender/build_orbit_top_pilots_r1.py",
        "blenderVersion": bpy.app.version_string,
        "humanApprovalRequired": True,
        "runtimePromotionAllowed": False,
        "physicsAuthority": "src/orbit/orbitPhysics.js",
        "assets": [grey, rift],
    }
    manifest_path = out_dir / "orbit-top-pilot-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"wrote {manifest_path}")


if __name__ == "__main__":
    main()
