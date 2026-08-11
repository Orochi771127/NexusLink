"""Build the Blazetail Kit Orbit-top R3 candidate in Blender.

Offline authoring only. GLB, Blend source and review renders remain under
output/ until the human visual gate promotes them into assets/. The exported
collider node is audit metadata only; src/orbit/orbitPhysics.js remains the
sole authority for collision, energy, objective and outcome truth.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector


ASSET_ID = "blazetail-kit-orbit-top-r3"


def parse_args() -> argparse.Namespace:
    raw = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", required=True)
    return parser.parse_args(raw)


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


def material(
    name: str,
    color: tuple[float, float, float, float],
    *,
    roughness: float,
    metallic: float = 0.0,
    coat: float = 0.0,
    transmission: float = 0.0,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    bsdf = result.node_tree.nodes.get("Principled BSDF")
    set_input(bsdf, "Base Color", color)
    set_input(bsdf, "Roughness", roughness)
    set_input(bsdf, "Metallic", metallic)
    set_input(bsdf, "Coat Weight", coat)
    set_input(bsdf, "Coat Roughness", max(0.05, roughness * 0.4))
    set_input(bsdf, "Transmission Weight", transmission)
    set_input(bsdf, "IOR", 1.46)
    if emission is not None:
        set_input(bsdf, "Emission Color", emission)
        set_input(bsdf, "Emission Strength", emission_strength)
    return result


def assign(obj: bpy.types.Object, mat: bpy.types.Material) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def finish_mesh(obj: bpy.types.Object, mat: bpy.types.Material, bevel: float = 0.02) -> bpy.types.Object:
    for polygon in getattr(obj.data, "polygons", []):
        polygon.use_smooth = True
    if bevel > 0:
        mod = obj.modifiers.new("ResinClayBevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    assign(obj, mat)
    return obj


def sphere(name, parent, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=18, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish_mesh(obj, mat, 0.012)
    obj.parent = parent
    return obj


def torus(name, parent, location, major, minor, mat, scale_z=1.0):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major,
        minor_radius=minor,
        major_segments=48,
        minor_segments=14,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale.z = scale_z
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish_mesh(obj, mat, 0.01)
    obj.parent = parent
    return obj


def cone(name, parent, location, radius1, radius2, depth, mat):
    bpy.ops.mesh.primitive_cone_add(
        vertices=36,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    finish_mesh(obj, mat, 0.028)
    obj.parent = parent
    return obj


def diamond(name, parent, location, scale, mat):
    verts = [(0, 0, 1), (1, 0, 0), (0, 1, 0), (-1, 0, 0), (0, -1, 0), (0, 0, -1)]
    faces = [
        (0, 1, 2), (0, 2, 3), (0, 3, 4), (0, 4, 1),
        (5, 2, 1), (5, 3, 2), (5, 4, 3), (5, 1, 4),
    ]
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.scale = scale
    obj.rotation_euler.z = math.pi * 0.25
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish_mesh(obj, mat, 0.014)
    obj.parent = parent
    return obj


def wedge(name, parent, center, width, depth, height, mat, rotation_z=0.0):
    x = width * 0.5
    y = depth * 0.5
    z = height
    verts = [(-x, -y, 0), (x, -y, 0), (x, y, 0), (-x, y, 0), (0, 0, z)]
    faces = [(0, 1, 2, 3), (0, 4, 1), (1, 4, 2), (2, 4, 3), (3, 4, 0)]
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = center
    obj.rotation_euler.z = rotation_z
    finish_mesh(obj, mat, 0.035)
    obj.parent = parent
    return obj


def curve_ribbon(name, parent, mat, *, resonance: bool):
    data = bpy.data.curves.new(name + "Curve", "CURVE")
    data.dimensions = "3D"
    data.resolution_u = 3
    data.bevel_depth = 0.082 if resonance else 0.068
    data.bevel_resolution = 4
    spline = data.splines.new("NURBS")
    count = 64
    spline.points.add(count - 1)
    start = -math.pi * 0.72
    sweep = math.pi * (1.72 if resonance else 1.52)
    for index in range(count):
        t = index / (count - 1)
        angle = start + sweep * t
        radius = (0.47 + 0.50 * t) * (1.04 if resonance else 1.0)
        z = 0.79 + 0.11 * math.sin(t * math.pi) + (0.07 if resonance else 0)
        spline.points[index].co = (math.cos(angle) * radius, math.sin(angle) * radius, z, 1)
        # One readable flame-tail sweep: broad at the root, visibly pointed at
        # the outer tip. This avoids a uniform hose/cinnamon-roll silhouette.
        spline.points[index].radius = 1.25 - 1.08 * t
    spline.order_u = 4
    spline.use_endpoint_u = True
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    assign(obj, mat)
    obj.parent = parent
    return obj


def add_socket(name, parent, location):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.13
    obj.parent = parent
    return obj


def add_form(parent, mats, *, resonance: bool):
    prefix = "BlazetailResonance" if resonance else "BlazetailBase"
    spread = 1.055 if resonance else 1.0
    sphere(prefix + "_EmberClayLowerShell", parent, (0, 0, 0.46), (0.92 * spread, 0.92 * spread, 0.34), mats["ember"])
    torus(prefix + "_EmberLightResinGuard", parent, (0, 0, 0.64), 0.66 * spread, 0.22, mats["ember_light"], 0.76)
    torus(prefix + "_WarmGoldOuterSeal", parent, (0, 0, 0.67), 0.86 * spread, 0.04, mats["gold"], 0.78)
    torus(prefix + "_WarmGoldCoreBezel", parent, (0, 0, 0.83), 0.40, 0.045, mats["gold"], 0.72)
    sphere(prefix + "_FoxFaceMedallion", parent, (0, -0.05, 0.88), (0.40, 0.34, 0.12), mats["cream"])
    sphere(prefix + "_AmberEyeLeft", parent, (-0.15, -0.27, 0.95), (0.07, 0.045, 0.04), mats["amber"])
    sphere(prefix + "_AmberEyeRight", parent, (0.15, -0.27, 0.95), (0.07, 0.045, 0.04), mats["amber"])
    wedge(prefix + "_FoxEarLeft", parent, (-0.27, 0.12, 0.92), 0.22, 0.19, 0.36, mats["deep_ember"], -0.13)
    wedge(prefix + "_FoxEarRight", parent, (0.27, 0.12, 0.92), 0.22, 0.19, 0.36, mats["deep_ember"], 0.13)
    diamond(prefix + "_HeartCoreDiamond", parent, (0, -0.03, 1.09), (0.18, 0.18, 0.10), mats["core_hot"] if resonance else mats["core"])
    cone(prefix + "_BottomSpinTip", parent, (0, 0, 0.18), 0.10, 0.23, 0.36, mats["gold"])
    curve_ribbon(prefix + "_SingleFlameTailSpiral", parent, mats["flame_hot"] if resonance else mats["flame"], resonance=resonance)
    for index in range(4):
        angle = index * math.pi * 0.5 + math.pi * 0.25
        diamond(
            f"{prefix}_GoldSpiralNode_{index + 1:02d}",
            parent,
            (math.cos(angle) * 0.70 * spread, math.sin(angle) * 0.70 * spread, 0.76),
            (0.10, 0.10, 0.055),
            mats["gold"],
        )
    if resonance:
        torus(prefix + "_ResonanceFieldRing", parent, (0, 0, 0.58), 0.98, 0.035, mats["flame_hot"], 0.76)


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_studio():
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes["Background"]
    background.inputs["Color"].default_value = (0.16, 0.34, 0.42, 1)
    background.inputs["Strength"].default_value = 0.42

    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -0.01))
    floor = bpy.context.object
    floor.name = "ReviewFloor"
    assign(floor, material("ReviewFloorMaterial", (0.38, 0.66, 0.63, 1), roughness=0.82))

    for name, location, energy, color, size in (
        ("WarmKey", (4.2, -4.4, 5.6), 980, (1.0, 0.86, 0.68), 4.2),
        ("SkyFill", (-4.0, -1.0, 3.6), 440, (0.56, 0.86, 1.0), 3.8),
        ("GoldRim", (1.4, 4.2, 5.0), 700, (1.0, 0.61, 0.22), 3.2),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.color = color
        data.shape = "DISK"
        data.size = size
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = location
        look_at(light, (0, 0, 0.6))

    camera_data = bpy.data.cameras.new("ReviewCamera")
    camera = bpy.data.objects.new("ReviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.data.type = "ORTHO"
    bpy.context.scene.camera = camera
    return camera, floor


def set_form_visibility(root, visible_form):
    for child in root.children:
        if child.name.startswith("Socket_") or child.name == "ColliderProxy_Deterministic2D":
            child.hide_render = True
            continue
        visible = child.name == visible_form
        child.hide_render = not visible
        child.hide_viewport = not visible
        for descendant in child.children_recursive:
            descendant.hide_render = not visible
            descendant.hide_viewport = not visible


def render_review(scene, camera, root, out_dir):
    rendered = []
    views = {
        "three-quarter": ((3.5, -4.5, 3.3), (0, 0, 0.58), 3.15),
        "top": ((0.01, -0.01, 7.0), (0, 0, 0.58), 2.85),
        "side": ((4.8, -0.01, 2.0), (0, 0, 0.54), 2.75),
    }
    for form_name, slug in (("BaseForm", "base"), ("ResonanceForm", "resonance")):
        set_form_visibility(root, form_name)
        for view_name, (location, target, scale) in views.items():
            camera.location = location
            camera.data.ortho_scale = scale
            look_at(camera, target)
            path = out_dir / f"{ASSET_ID}-{slug}-{view_name}.png"
            scene.render.filepath = str(path)
            bpy.ops.render.render(write_still=True)
            rendered.append(str(path))
    return rendered


def select_hierarchy(root):
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

    mats = {
        "ember": material("BlazetailEmberClay", (0.58, 0.035, 0.002, 1), roughness=0.54, coat=0.22),
        "ember_light": material("BlazetailEmberLightResin", (0.78, 0.105, 0.006, 1), roughness=0.46, coat=0.30),
        "deep_ember": material("BlazetailDeepEmberClay", (0.17, 0.008, 0.001, 1), roughness=0.62, coat=0.14),
        "cream": material("BlazetailCreamResin", (0.62, 0.31, 0.075, 1), roughness=0.48, coat=0.20),
        "gold": material("BlazetailWarmGold", (0.48, 0.16, 0.004, 1), roughness=0.30, metallic=0.62, coat=0.20),
        "amber": material("BlazetailAmberEye", (0.11, 0.006, 0.001, 1), roughness=0.18, coat=0.68),
        "core": material("BlazetailOrangeCore", (0.86, 0.07, 0.002, 1), roughness=0.16, transmission=0.08, coat=0.72, emission=(0.82, 0.025, 0.0, 1), emission_strength=0.34),
        "core_hot": material("BlazetailResonanceCore", (1.0, 0.25, 0.006, 1), roughness=0.12, transmission=0.10, coat=0.78, emission=(1.0, 0.065, 0.0, 1), emission_strength=1.05),
        "flame": material("BlazetailSingleFlameTail", (0.92, 0.09, 0.001, 1), roughness=0.35, coat=0.38, emission=(0.78, 0.018, 0.0, 1), emission_strength=0.24),
        "flame_hot": material("BlazetailResonanceFlame", (1.0, 0.31, 0.008, 1), roughness=0.22, coat=0.52, emission=(1.0, 0.08, 0.0, 1), emission_strength=0.95),
    }

    root = bpy.data.objects.new("OrbitTopRoot", None)
    bpy.context.collection.objects.link(root)
    root["asset_id"] = ASSET_ID
    root["owner_id"] = "blazetail-kit"
    root["spin_axis"] = "0,0,1"
    root["bottom_contact_z"] = 0.0
    root["physics_authority"] = "src/orbit/orbitPhysics.js"
    root["form_authority"] = "session-only deterministic combat form"

    base = bpy.data.objects.new("BaseForm", None)
    resonance = bpy.data.objects.new("ResonanceForm", None)
    collider = bpy.data.objects.new("ColliderProxy_Deterministic2D", None)
    for obj in (base, resonance, collider):
        bpy.context.collection.objects.link(obj)
        obj.parent = root
    collider["type"] = "circle"
    collider["normalized_radius"] = 1.0
    collider["mesh_is_authority"] = False
    add_socket("Socket_SpinAxis", root, (0, 0, 0))
    add_socket("Socket_Trail", root, (0.92, 0, 0.86))
    add_socket("Socket_Impact", root, (0, -0.88, 0.60))

    add_form(base, mats, resonance=False)
    add_form(resonance, mats, resonance=True)
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

    triangle_count = sum(len(obj.data.polygons) for obj in root.children_recursive if obj.type == "MESH") * 2
    manifest = {
        "schemaVersion": 1,
        "packId": "global-3d-gameplay-batch-r3",
        "generator": "tools/blender/build_blazetail_orbit_top_r3.py",
        "blenderVersion": bpy.app.version_string,
        "humanApprovalRequired": True,
        "runtimePromotionAllowed": False,
        "physicsAuthority": "src/orbit/orbitPhysics.js",
        "asset": {
            "assetId": ASSET_ID,
            "ownerId": "blazetail-kit",
            "glb": str(glb_path),
            "blend": str(blend_path),
            "reviewRenders": renders,
            "nodes": {
                "base": "BaseForm",
                "resonance": "ResonanceForm",
                "colliderProxy": "ColliderProxy_Deterministic2D",
                "spinSocket": "Socket_SpinAxis",
                "trailSocket": "Socket_Trail",
                "impactSocket": "Socket_Impact",
            },
            "bottomContactZ": 0.0,
            "spinAxisAuthoring": [0, 0, 1],
            "triangleBudgetEstimate": triangle_count,
            "collider": {
                "type": "deterministic-2d-circle",
                "source": "src/orbit/orbitPhysics.js body.radius",
                "meshIsAuthority": False,
            },
            "formContract": "base/resonance visibility only; equal-budget session state is not persisted",
            "artStatus": "candidate-awaiting-human",
        },
    }
    manifest_path = out_dir / "blazetail-orbit-top-r3-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"wrote {manifest_path}")


if __name__ == "__main__":
    main()
