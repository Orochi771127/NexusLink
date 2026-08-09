import { getThreeSceneProfile } from "../data/threeSceneProfiles.js";

const IMPORT_TIMEOUT_MS = 8000;
const ASSET_TIMEOUT_MS = 12000;

function disabledController(reason) {
  return {
    ready: false,
    reason,
    update() {},
    resize() {},
    getDiagnostics() {
      return { ready: false, reason, authority: "snapshot-only" };
    },
    dispose() {}
  };
}

function supportsWebGl() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      probe.getContext("webgl2") ||
      probe.getContext("webgl") ||
      probe.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId = 0;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(label)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function readReducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

function findForm(model, nodeName) {
  return model.getObjectByName(nodeName) || null;
}

function disposeTree(root) {
  root?.traverse?.((node) => {
    node.geometry?.dispose?.();
    const materials = Array.isArray(node.material)
      ? node.material
      : node.material
        ? [node.material]
        : [];
    for (const material of materials) {
      for (const value of Object.values(material)) value?.isTexture && value.dispose();
      material.dispose?.();
    }
  });
}

function configureModel(model, profile) {
  model.name = profile.id;
  model.scale.setScalar(0.34 * (profile.model.visualScale || 1));
  const base = findForm(model, profile.model.baseNode);
  const resonance = findForm(model, profile.model.resonanceNode);
  if (!base || !resonance) {
    throw new Error(`orbit_top_nodes_missing:${profile.id}`);
  }
  base.visible = true;
  resonance.visible = false;
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
  });
  return { root: model, base, resonance, currentForm: "base" };
}

function configureActor(actor, body, form, elapsed, reducedMotion) {
  if (!actor || !body || body.out) {
    if (actor) actor.root.visible = false;
    return;
  }
  actor.root.visible = true;
  actor.root.position.set(body.x * 2.05, 0.04, body.y * 2.05);
  const nextForm = form === "resonance" ? "resonance" : "base";
  if (actor.currentForm !== nextForm) actor.currentForm = nextForm;
  actor.base.visible = nextForm === "base";
  actor.resonance.visible = nextForm === "resonance";
  if (!reducedMotion) {
    const direction = body.spinDirection < 0 ? -1 : 1;
    actor.root.rotation.y =
      elapsed * (2.8 + (body.spin || 0) / 18) * direction;
  }
  actor.root.rotation.x = (body.tilt || 0) * 0.28;
  actor.root.rotation.z = (body.wobble || 0) * 0.16;
}

function addPresentationArena(THREE, scene) {
  const arena = new THREE.Group();
  arena.name = "orbit_top_pilot_presentation_arena";
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9ecfd2,
    roughness: 0.38,
    metalness: 0.08,
    transmission: 0.12,
    transparent: true,
    opacity: 0.32
  });
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.25, 0.035, 12, 96),
    ringMaterial
  );
  ring.rotation.x = Math.PI * 0.5;
  ring.position.y = 0.015;
  arena.add(ring);
  scene.add(arena);
  return arena;
}

export async function createOrbitTopPilotScene({
  stageEl,
  playerProfile,
  enemyProfile
} = {}) {
  const profile = getThreeSceneProfile("orbit-top-pilot");
  if (!profile || !stageEl || typeof document === "undefined") {
    return disabledController("missing_stage");
  }
  const params = new URLSearchParams(globalThis.location?.search || "");
  const enableQueryValue = params.get(profile.enableQuery);
  if (
    enableQueryValue === "0" ||
    (profile.enableByDefault !== true && enableQueryValue !== "1")
  ) {
    return disabledController("query_disabled");
  }
  if (!supportsWebGl()) return disabledController("webgl_unavailable");
  const candidateMode = params.get(profile.candidateQuery) === "1";
  const playerUrl = candidateMode
    ? playerProfile?.model?.candidateGlbPath
    : playerProfile?.model?.glbPath;
  const enemyUrl = candidateMode
    ? enemyProfile?.model?.candidateGlbPath
    : enemyProfile?.model?.glbPath;
  if (!playerUrl || !enemyUrl) {
    return disabledController(
      candidateMode ? "candidate_paths_missing" : "approved_assets_missing"
    );
  }

  let canvas = null;
  let renderer = null;
  let resizeObserver = null;
  let player = null;
  let enemy = null;
  try {
    const [THREE, { GLTFLoader }] = await withTimeout(
      Promise.all([
        import("three"),
        import("three/addons/loaders/GLTFLoader.js")
      ]),
      IMPORT_TIMEOUT_MS,
      "orbit_three_import_timeout"
    );
    canvas = document.createElement("canvas");
    canvas.className = "orbit-three-canvas";
    canvas.dataset.ready = "false";
    canvas.setAttribute("aria-hidden", "true");
    stageEl.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, profile.mobileDprCap));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
    camera.position.set(0, 7.1, 6.6);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xc8f5ff, 0x203133, 1.7));
    const key = new THREE.DirectionalLight(0xffedca, 2.4);
    key.position.set(-3, 7, 4);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6ddcff, 1.2);
    rim.position.set(4, 5, -2);
    scene.add(rim);
    const arena = addPresentationArena(THREE, scene);

    const loader = new GLTFLoader();
    const [playerGltf, enemyGltf] = await withTimeout(
      Promise.all([loader.loadAsync(playerUrl), loader.loadAsync(enemyUrl)]),
      ASSET_TIMEOUT_MS,
      "orbit_top_glb_timeout"
    );
    player = configureModel(playerGltf.scene, playerProfile);
    enemy = configureModel(enemyGltf.scene, enemyProfile);
    scene.add(player.root, enemy.root);

    const state = {
      disposed: false,
      contextLost: false,
      reducedMotion: readReducedMotion(),
      scene,
      camera,
      arena,
      player,
      enemy,
      frameCount: 0,
      lastSnapshotElapsed: 0,
      candidateMode
    };
    const resize = () => {
      const width = Math.max(1, stageEl.clientWidth || 1);
      const height = Math.max(1, stageEl.clientHeight || 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(resize)
      : null;
    resizeObserver?.observe(stageEl);
    globalThis.addEventListener?.("resize", resize);
    resize();

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      state.contextLost = true;
      canvas.dataset.ready = "false";
    });
    canvas.addEventListener("webglcontextrestored", () => {
      state.contextLost = false;
      resize();
      canvas.dataset.ready = "true";
    });
    canvas.dataset.ready = "true";

    return {
      get ready() {
        return !state.disposed && !state.contextLost;
      },
      reason: null,
      resize,
      update(snapshot) {
        if (state.disposed || state.contextLost || !snapshot) return;
        const elapsed = Number(snapshot.elapsed) || 0;
        configureActor(
          state.player,
          snapshot.player,
          snapshot.combatForms?.player?.current,
          elapsed,
          state.reducedMotion
        );
        configureActor(
          state.enemy,
          snapshot.dummy,
          snapshot.combatForms?.dummy?.current,
          elapsed,
          state.reducedMotion
        );
        renderer.render(scene, camera);
        state.frameCount += 1;
        state.lastSnapshotElapsed = elapsed;
      },
      getDiagnostics() {
        return {
          ready: !state.disposed && !state.contextLost,
          authority: "snapshot-only",
          candidateMode: state.candidateMode,
          frameCount: state.frameCount,
          lastSnapshotElapsed: state.lastSnapshotElapsed,
          playerForm: state.player.currentForm,
          enemyForm: state.enemy.currentForm
        };
      },
      dispose() {
        if (state.disposed) return;
        state.disposed = true;
        resizeObserver?.disconnect();
        globalThis.removeEventListener?.("resize", resize);
        disposeTree(player.root);
        disposeTree(enemy.root);
        disposeTree(arena);
        renderer.dispose();
        canvas.remove();
      }
    };
  } catch (error) {
    console.warn("Orbit top 3D fallback active:", error);
    resizeObserver?.disconnect();
    renderer?.dispose?.();
    canvas?.remove?.();
    return disabledController(error?.message || "initialization_failed");
  }
}
