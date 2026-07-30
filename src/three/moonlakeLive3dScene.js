import {
  MOONLAKE_CAMERA,
  MOONLAKE_INTERACTION_HOTSPOTS,
  MOONLAKE_LIVE3D_ASSET,
  MOONLAKE_VISUAL_MASTER,
  MOONLAKE_VISIBLE_GLB_CANDIDATE,
  MOONLAKE_VISUAL_WALKWAY,
  MOONLAKE_WATERFALLS
} from "./moonlakeLive3dConfig.js";

const QUALITY_DPR = Object.freeze({
  low: 1,
  medium: 1.15,
  high: 1.4
});
const GRASS_COUNT = Object.freeze({ low: 34, medium: 62, high: 92 });
const RAIN_COUNT = Object.freeze({ low: 0, medium: 90, high: 150 });
const IMPORT_TIMEOUT_MS = 12000;
const ASSET_TIMEOUT_MS = 15000;

export async function createMoonlakeLive3dScene({
  gameRoot,
  getEnvironmentState,
  getWeather
} = {}) {
  const disabled = createDisabledController("not_initialized");
  if (!gameRoot || typeof document === "undefined") return disabled;

  const params = new URLSearchParams(window.location.search);
  if (params.get("live3d") === "0") return createDisabledController("query_disabled");
  if (!supportsWebGl()) return createDisabledController("webgl_unavailable");
  const visibleGlbCandidate = params.get(
    MOONLAKE_VISIBLE_GLB_CANDIDATE.queryParam
  ) === MOONLAKE_VISIBLE_GLB_CANDIDATE.queryValue;
  const renderMode = visibleGlbCandidate
    ? "visible_glb_candidate"
    : "owner_approved_live_diorama";

  let canvas = null;
  let renderer = null;
  let resizeObserver = null;
  try {
    const [{ default: THREE }, { GLTFLoader }] = await withTimeout(
      Promise.all([
        importThreeNamespace(),
        import("three/addons/loaders/GLTFLoader.js")
      ]),
      IMPORT_TIMEOUT_MS,
      "three_import_timeout"
    );

    canvas = document.createElement("canvas");
    canvas.className = "moonlake-live3d-canvas";
    canvas.dataset.ready = "false";
    canvas.setAttribute("aria-hidden", "true");
    gameRoot.prepend(canvas);

    const quality = readQuality();
    const reducedMotion = readReducedMotion();
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality !== "low",
      alpha: false,
      powerPreference: quality === "low" ? "low-power" : "high-performance"
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(QUALITY_DPR[quality] || QUALITY_DPR.high);
    renderer.shadowMap.enabled = quality !== "low";
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071322);
    scene.fog = new THREE.FogExp2(0x9fc9dd, 0.012);

    const cameraProfile = visibleGlbCandidate
      ? MOONLAKE_VISIBLE_GLB_CANDIDATE.camera
      : MOONLAKE_CAMERA;
    const camera = new THREE.PerspectiveCamera(
      cameraProfile.fov,
      1,
      MOONLAKE_CAMERA.near,
      MOONLAKE_CAMERA.far
    );
    camera.position.set(
      cameraProfile.position.x,
      cameraProfile.position.y,
      cameraProfile.position.z
    );
    camera.lookAt(
      cameraProfile.target.x,
      cameraProfile.target.y,
      cameraProfile.target.z
    );

    const habitatRoot = new THREE.Group();
    habitatRoot.name = "moonlake_live3d_root";
    scene.add(habitatRoot);

    const visualTexture = await withTimeout(
      new THREE.TextureLoader().loadAsync(MOONLAKE_VISUAL_MASTER.texture),
      ASSET_TIMEOUT_MS,
      "moonlake_visual_master_timeout"
    );
    configureVisualTexture(THREE, visualTexture);
    const visualBackdrop = createVisualBackdrop(THREE, visualTexture);
    visualBackdrop.mesh.visible = !visibleGlbCandidate;
    scene.add(visualBackdrop.mesh);

    const lights = createLighting(THREE, scene, quality);
    const sky = createSky(THREE);
    const water = createLakeWater(THREE);
    const clayLandscape = createClayLandscape(THREE, quality);
    const waterfalls = createWaterfalls(THREE);
    const grass = createGrass(THREE, quality);
    const liveGeometryRig = new THREE.Group();
    liveGeometryRig.name = "moonlake_visible_glb_dynamic_rig";
    liveGeometryRig.visible = visibleGlbCandidate;
    liveGeometryRig.add(
      sky.mesh,
      water.mesh,
      grass.mesh,
      ...waterfalls.items.map((item) => item.group)
    );
    habitatRoot.add(liveGeometryRig);
    clayLandscape.root.visible = false;
    habitatRoot.add(clayLandscape.root);
    const weather = createWeather(THREE, quality);
    habitatRoot.add(weather.root);

    const loader = new GLTFLoader();
    const gltf = await withTimeout(
      loader.loadAsync(MOONLAKE_LIVE3D_ASSET.glb),
      ASSET_TIMEOUT_MS,
      "moonlake_glb_timeout"
    );
    const model = gltf.scene;
    model.name = "moonlake_clay_resin_r3";
    const modelDiagnostics = configureModel(
      THREE,
      model,
      quality,
      visibleGlbCandidate
    );
    habitatRoot.add(model);

    const state = {
      active: true,
      contextLost: false,
      disposed: false,
      ready: true,
      quality,
      reducedMotion,
      renderMode,
      visibleGlbCandidate,
      elapsed: 0,
      frameCount: 0,
      lastWeather: null,
      lastNightMix: 0,
      lastGrassSway: 0,
      renderer,
      scene,
      camera,
      canvas,
      model,
      modelDiagnostics,
      visualBackdrop,
      liveGeometryRig,
      sky,
      water,
      clayLandscape,
      waterfalls,
      grass,
      weather,
      lights,
      interactions: {
        lantern: { strength: 0, center: { x: 0.5, y: 0.5 } },
        crystal: { strength: 0, center: { x: 0.5, y: 0.5 } },
        water: { strength: 0, center: { x: 0.5, y: 0.5 } }
      },
      lastInteraction: null,
      size: { width: 1, height: 1 }
    };

    const resize = () => resizeRenderer(state, gameRoot);
    resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(resize)
      : null;
    resizeObserver?.observe(gameRoot);
    window.addEventListener("resize", resize);
    resize();

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      state.contextLost = true;
      canvas.dataset.ready = "false";
    });
    canvas.addEventListener("webglcontextrestored", () => {
      state.contextLost = false;
      resize();
      canvas.dataset.ready = state.active ? "true" : "false";
    });
    canvas.dataset.ready = "true";

    return {
      get ready() {
        return state.ready && !state.disposed && !state.contextLost;
      },
      setActive(active) {
        state.active = Boolean(active);
        canvas.dataset.ready = state.active && !state.contextLost ? "true" : "false";
      },
      resize,
      update(ticker) {
        updateScene(state, ticker, getEnvironmentState, getWeather);
      },
      projectWorldToScreen(point) {
        return projectWorldToScreen(THREE, state, point);
      },
      projectImageToScreen(point) {
        return projectMoonlakeImagePoint(point, state.size);
      },
      hitTestScreenPoint(point) {
        return hitTestMoonlakeInteraction(point, state.size);
      },
      triggerInteraction(interactionId) {
        return triggerMoonlakeInteraction(state, interactionId);
      },
      getDiagnostics() {
        return buildDiagnostics(state);
      },
      dispose() {
        if (state.disposed) return;
        state.disposed = true;
        resizeObserver?.disconnect();
        window.removeEventListener("resize", resize);
        disposeObjectTree(habitatRoot);
        disposeObjectTree(visualBackdrop.mesh);
        visualBackdrop.texture.dispose();
        renderer.dispose();
        canvas.remove();
      }
    };
  } catch (error) {
    console.warn("Moonlake live 3D fallback active:", error);
    resizeObserver?.disconnect();
    renderer?.dispose?.();
    canvas?.remove?.();
    return createDisabledController(error?.message || "initialization_failed");
  }
}

async function importThreeNamespace() {
  const namespace = await import("three");
  return { default: namespace };
}

function withTimeout(promise, timeoutMs, reason) {
  let timeoutId = null;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(reason)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function supportsWebGl() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      probe.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
      || probe.getContext("webgl", { failIfMajorPerformanceCaveat: true })
    );
  } catch {
    return false;
  }
}

function createDisabledController(reason) {
  return {
    ready: false,
    reason,
    setActive() {},
    resize() {},
    update() {},
    projectWorldToScreen() {
      return null;
    },
    projectImageToScreen() {
      return null;
    },
    hitTestScreenPoint() {
      return null;
    },
    triggerInteraction() {
      return null;
    },
    getDiagnostics() {
      return { ready: false, fallback: true, reason };
    },
    dispose() {}
  };
}

function configureVisualTexture(THREE, texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

function createVisualBackdrop(THREE, texture) {
  const uniforms = {
    map: { value: texture },
    time: { value: 0 },
    nightMix: { value: 0 },
    rainStrength: { value: 0 },
    lanternPulse: { value: 0 },
    lanternCenter: { value: new THREE.Vector2(0.5, 0.5) },
    crystalPulse: { value: 0 },
    crystalCenter: { value: new THREE.Vector2(0.5, 0.5) },
    waterPulse: { value: 0 },
    waterCenter: { value: new THREE.Vector2(0.5, 0.5) },
    viewportAspect: { value: MOONLAKE_VISUAL_MASTER.imageAspect },
    imageAspect: { value: MOONLAKE_VISUAL_MASTER.imageAspect }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    vertexShader: [
      "varying vec2 vUv;",
      "void main() {",
      "  vUv = uv;",
      "  gl_Position = vec4(position.xy, 0.9999, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform sampler2D map;",
      "uniform float time;",
      "uniform float nightMix;",
      "uniform float rainStrength;",
      "uniform float lanternPulse;",
      "uniform vec2 lanternCenter;",
      "uniform float crystalPulse;",
      "uniform vec2 crystalCenter;",
      "uniform float waterPulse;",
      "uniform vec2 waterCenter;",
      "uniform float viewportAspect;",
      "uniform float imageAspect;",
      "varying vec2 vUv;",
      "",
      "float boxMask(vec2 uv, vec2 minUv, vec2 maxUv, float feather) {",
      "  vec2 lower = smoothstep(minUv, minUv + feather, uv);",
      "  vec2 upper = 1.0 - smoothstep(maxUv - feather, maxUv, uv);",
      "  return lower.x * lower.y * upper.x * upper.y;",
      "}",
      "",
      "float radialMask(vec2 uv, vec2 center, float radius, float feather) {",
      "  return 1.0 - smoothstep(radius - feather, radius + feather, distance(uv, center));",
      "}",
      "",
      "vec2 coverUv(vec2 uv) {",
      "  vec2 result = uv;",
      "  if (viewportAspect < imageAspect) {",
      "    result.x = (uv.x - 0.5) * (viewportAspect / imageAspect) + 0.5;",
      "  } else {",
      "    result.y = (uv.y - 0.5) * (imageAspect / viewportAspect) + 0.5;",
      "  }",
      "  return result;",
      "}",
      "",
      "void main() {",
      "  vec2 imageUv = coverUv(vUv);",
      "  vec3 probe = texture2D(map, imageUv).rgb;",
      "  float coolWater = smoothstep(0.02, 0.24, min(probe.g - probe.r, probe.b - probe.r));",
      "  float waterBand = smoothstep(0.50, 0.57, imageUv.y)",
      "    * (1.0 - smoothstep(0.84, 0.89, imageUv.y));",
      "  float waterMask = coolWater * waterBand;",
      "  float green = smoothstep(0.015, 0.16, probe.g - max(probe.r, probe.b));",
      "  float foliageBand = 1.0 - smoothstep(0.70, 0.88, imageUv.y);",
      "",
      "  vec2 animatedUv = imageUv;",
      "  animatedUv.x += sin(imageUv.y * 96.0 + time * 0.72) * 0.00072 * waterMask;",
      "  animatedUv.y += cos(imageUv.x * 72.0 - time * 0.46) * 0.00042 * waterMask;",
      "  animatedUv.x += sin(time * 0.42 + imageUv.y * 19.0) * 0.00058 * green * foliageBand;",
      "",
      "  vec3 color = texture2D(map, animatedUv).rgb;",
      "  float leftFall = boxMask(imageUv, vec2(0.135, 0.625), vec2(0.285, 0.865), 0.018);",
      "  float rightFall = boxMask(imageUv, vec2(0.715, 0.625), vec2(0.865, 0.875), 0.018);",
      "  float waterfallMask = (leftFall + rightFall) * coolWater;",
      "  float fallingStreak = pow(0.5 + 0.5 * sin(imageUv.x * 164.0 - imageUv.y * 42.0 + time * 6.2), 7.0);",
      "  float fallingBand = pow(0.5 + 0.5 * sin(imageUv.y * 176.0 + time * 7.6), 6.0);",
      "  float fallingPulse = 0.5 + 0.5 * sin(imageUv.y * 118.0 + time * 2.8);",
      "  color += vec3(0.075, 0.18, 0.235) * waterfallMask * (0.24 + fallingStreak * 0.28 + fallingBand * 0.13 + fallingPulse * 0.06);",
      "  float fallFoam = boxMask(imageUv, vec2(0.12, 0.605), vec2(0.30, 0.675), 0.025)",
      "    + boxMask(imageUv, vec2(0.69, 0.60), vec2(0.88, 0.675), 0.025);",
      "  float foamPulse = 0.5 + 0.5 * sin(imageUv.x * 94.0 + time * 3.4);",
      "  color += vec3(0.09, 0.19, 0.24) * fallFoam * coolWater * (0.10 + foamPulse * 0.10);",
      "",
      "  float waterGlint = pow(0.5 + 0.5 * sin(imageUv.x * 122.0 + imageUv.y * 76.0 + time * 0.9), 12.0);",
      "  color += vec3(0.05, 0.11, 0.14) * waterGlint * waterMask * (0.07 + rainStrength * 0.05);",
      "",
      "  float lanternGlow = radialMask(imageUv, lanternCenter, 0.052, 0.032) * lanternPulse;",
      "  float lanternSpark = pow(0.5 + 0.5 * sin(time * 11.0 + distance(imageUv, lanternCenter) * 220.0), 10.0);",
      "  color += vec3(0.34, 0.16, 0.035) * lanternGlow * (0.58 + lanternSpark * 0.22);",
      "  float crystalGlow = radialMask(imageUv, crystalCenter, 0.047, 0.030) * crystalPulse;",
      "  float crystalSpark = pow(0.5 + 0.5 * sin(time * 18.0 + imageUv.x * 170.0 - imageUv.y * 130.0), 12.0);",
      "  color += vec3(0.03, 0.31, 0.44) * crystalGlow * (0.54 + crystalSpark * 0.42);",
      "  float waterDistance = distance(imageUv, waterCenter);",
      "  float waterRingRadius = mix(0.012, 0.092, 1.0 - waterPulse);",
      "  float waterRing = 1.0 - smoothstep(0.004, 0.014, abs(waterDistance - waterRingRadius));",
      "  color += vec3(0.035, 0.18, 0.24) * waterRing * waterPulse * waterMask * 0.72;",
      "",
      "  vec3 nightColor = color * vec3(0.34, 0.46, 0.68) * 0.78 + vec3(0.006, 0.014, 0.045);",
      "  float cyanCrystal = smoothstep(0.12, 0.48, color.b - color.r) * smoothstep(0.35, 0.74, color.g);",
      "  float warmMetal = smoothstep(0.03, 0.26, color.r - color.b) * smoothstep(0.30, 0.72, color.r);",
      "  nightColor += cyanCrystal * vec3(0.01, 0.13, 0.25) * 0.56;",
      "  nightColor += warmMetal * vec3(0.10, 0.045, 0.008) * 0.20;",
      "  color = mix(color, nightColor, nightMix);",
      "  color *= 1.0 - rainStrength * 0.055;",
      "  gl_FragColor = vec4(color, 1.0);",
      "}"
    ].join("\n")
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.name = "moonlake_owner_approved_visual_master";
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return { mesh, uniforms, texture };
}

function createLighting(THREE, scene, quality) {
  const hemisphere = new THREE.HemisphereLight(0xc8e8ff, 0x274536, 2.15);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight(0xfff1cc, 4.2);
  sun.position.set(-10, 18, 12);
  sun.target.position.set(0, 0, -2);
  sun.castShadow = quality !== "low";
  const shadowSize = quality === "high" ? 1024 : 512;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 70;
  sun.shadow.bias = -0.0008;
  scene.add(sun, sun.target);

  const moon = new THREE.DirectionalLight(0x8dbfff, 0);
  moon.position.set(8, 16, -14);
  moon.target.position.set(0, 1, -3);
  scene.add(moon, moon.target);

  const campWarmth = new THREE.PointLight(0xff9f55, 0.7, 15, 2);
  campWarmth.position.set(-2.55, 1.2, 3.45);
  scene.add(campWarmth);
  return { hemisphere, sun, moon, campWarmth };
}

function createSky(THREE) {
  const uniforms = {
    topColor: { value: new THREE.Color(0x5d9fce) },
    horizonColor: { value: new THREE.Color(0xc8e6ef) },
    nightMix: { value: 0 }
  };
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: [
      "varying vec3 vWorldPosition;",
      "void main() {",
      "  vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
      "  vWorldPosition = worldPosition.xyz;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 topColor;",
      "uniform vec3 horizonColor;",
      "uniform float nightMix;",
      "varying vec3 vWorldPosition;",
      "void main() {",
      "  float h = normalize(vWorldPosition).y * 0.5 + 0.5;",
      "  float t = smoothstep(0.18, 0.88, h);",
      "  vec3 day = mix(horizonColor, topColor, t);",
      "  vec3 night = mix(vec3(0.018, 0.045, 0.10), vec3(0.035, 0.10, 0.20), t);",
      "  gl_FragColor = vec4(mix(day, night, nightMix), 1.0);",
      "}"
    ].join("\n")
  });
  return {
    mesh: new THREE.Mesh(new THREE.SphereGeometry(76, 28, 16), material),
    uniforms
  };
}

function createLakeWater(THREE) {
  const geometry = new THREE.PlaneGeometry(80, 62, 48, 36);
  const uniforms = {
    time: { value: 0 },
    nightMix: { value: 0 },
    rainStrength: { value: 0 }
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: [
      "uniform float time;",
      "uniform float rainStrength;",
      "varying vec2 vUv;",
      "varying float vWave;",
      "void main() {",
      "  vUv = uv;",
      "  vec3 p = position;",
      "  float waveA = sin(p.x * 0.72 + time * 0.62) * 0.045;",
      "  float waveB = cos(p.y * 0.48 - time * 0.48) * 0.035;",
      "  float rain = sin((p.x + p.y) * 2.4 - time * 3.1) * 0.016 * rainStrength;",
      "  p.z += waveA + waveB + rain;",
      "  vWave = p.z;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform float time;",
      "uniform float nightMix;",
      "uniform float rainStrength;",
      "varying vec2 vUv;",
      "varying float vWave;",
      "void main() {",
      "  float ripple = sin(vUv.y * 42.0 + sin(vUv.x * 18.0) * 0.45 + time * 0.55);",
      "  float shimmer = ripple * (0.012 + rainStrength * 0.008);",
      "  vec3 dayDeep = vec3(0.035, 0.34, 0.52);",
      "  vec3 dayShallow = vec3(0.10, 0.63, 0.73);",
      "  vec3 nightDeep = vec3(0.012, 0.08, 0.18);",
      "  vec3 nightShallow = vec3(0.04, 0.28, 0.44);",
      "  vec3 base = mix(mix(dayDeep, dayShallow, vUv.y), mix(nightDeep, nightShallow, vUv.y), nightMix);",
      "  base += vec3(0.20, 0.42, 0.52) * shimmer;",
      "  gl_FragColor = vec4(base, 0.91);",
      "}"
    ].join("\n")
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "moonlake_live_water";
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -0.58, -15.8);
  mesh.receiveShadow = true;
  return { mesh, uniforms };
}

function createClayLandscape(THREE, quality) {
  const root = new THREE.Group();
  root.name = "moonlake_clay_landscape";
  const materials = {
    grass: clayMaterial(THREE, 0x668b4f, 0.82, 0.08),
    grassLight: clayMaterial(THREE, 0x86a862, 0.78, 0.1),
    stone: clayMaterial(THREE, 0x667b76, 0.88, 0.04),
    stoneLight: clayMaterial(THREE, 0x91a39a, 0.84, 0.06),
    platform: clayMaterial(THREE, 0xcab990, 0.76, 0.12),
    platformInset: clayMaterial(THREE, 0x9e8b69, 0.82, 0.07),
    gold: clayMaterial(THREE, 0xb9964c, 0.58, 0.2),
    wood: clayMaterial(THREE, 0x74523a, 0.86, 0.06),
    rope: clayMaterial(THREE, 0xa9895c, 0.9, 0.02),
    trunk: clayMaterial(THREE, 0x70533f, 0.92, 0.02),
    pine: clayMaterial(THREE, 0x345f49, 0.88, 0.04),
    pineLight: clayMaterial(THREE, 0x4c7654, 0.86, 0.05)
  };

  const nearGround = new THREE.Mesh(
    new THREE.CylinderGeometry(6.8, 7.15, 0.72, 40),
    materials.grass
  );
  nearGround.name = "moonlake_near_grass_island";
  nearGround.position.set(-0.35, -0.43, 5.45);
  nearGround.scale.set(1.38, 1, 0.88);
  nearGround.receiveShadow = true;
  root.add(nearGround);

  const farBank = new THREE.Mesh(
    new THREE.CylinderGeometry(5.15, 5.45, 0.64, 36),
    materials.grassLight
  );
  farBank.name = "moonlake_far_bank";
  farBank.position.set(0, -0.39, -12.65);
  farBank.scale.set(1.3, 1, 0.62);
  farBank.receiveShadow = true;
  root.add(farBank);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.78, 2.9, 0.42, 48),
    materials.platform
  );
  platform.name = "moonlake_compass_platform";
  platform.position.set(0, 0.02, 1.2);
  platform.receiveShadow = true;
  root.add(platform);

  const platformRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.03, 0.075, 8, 64),
    materials.platformInset
  );
  platformRing.rotation.x = Math.PI / 2;
  platformRing.position.set(0, 0.245, 1.2);
  root.add(platformRing);
  addCompassRose(THREE, root, materials.gold);

  const bridge = createPlayableBridge(THREE, materials, quality);
  root.add(bridge);
  root.add(
    createOrnateTent(THREE, materials, {
      x: -3.05,
      y: 0.04,
      z: 0.15,
      rotation: 0.34,
      scale: 0.98
    }),
    createOrnateTent(THREE, materials, {
      x: 3.45,
      y: 0.02,
      z: -0.75,
      rotation: -0.42,
      scale: 0.92
    })
  );

  const leftCliff = createCliff(THREE, materials, {
    x: -4.2,
    z: -11.65,
    height: 4.25,
    radius: 2.35,
    seed: 2
  });
  const rightCliff = createCliff(THREE, materials, {
    x: 4.3,
    z: -11.95,
    height: 4.65,
    radius: 2.45,
    seed: 5
  });
  root.add(leftCliff, rightCliff);

  [
    [-5.7, 0.05, -12.1, 0.86],
    [-2.8, 0.02, -13.2, 0.7],
    [5.8, 0.05, -12.6, 0.82],
    [-5.1, 0.02, 4.9, 0.78],
    [5.25, 0.02, 4.3, 0.74],
    [-4.35, 0.02, 7.45, 0.62],
    [4.45, 0.02, 7.15, 0.66]
  ].forEach(([x, y, z, scale], index) => {
    root.add(createClayPine(THREE, materials, x, y, z, scale, index % 2 === 0));
  });

  const stones = createShoreStones(THREE, materials.stoneLight, quality);
  const shrubs = createShrubBeds(THREE, quality);
  root.add(stones, shrubs);
  return { root, bridge, leftCliff, rightCliff };
}

function clayMaterial(THREE, color, roughness, clearcoat) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0,
    clearcoat,
    clearcoatRoughness: 0.78,
    flatShading: false
  });
}

function addCompassRose(THREE, root, material) {
  const center = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.045, 20), material);
  center.position.set(0, 0.255, 1.2);
  root.add(center);
  [
    [0, -1.35, 0.17, 1.25],
    [0, 1.35, 0.17, 1.25],
    [-1.35, 0, 1.25, 0.17],
    [1.35, 0, 1.25, 0.17]
  ].forEach(([x, z, sx, sz]) => {
    const ray = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.04, sz), material);
    ray.position.set(x, 0.255, z + 1.2);
    ray.rotation.y = Math.PI / 4;
    root.add(ray);
  });
}

function createPlayableBridge(THREE, materials, quality) {
  const root = new THREE.Group();
  root.name = "moonlake_playable_bridge";
  const plankGeometry = new THREE.BoxGeometry(1.62, 0.13, 0.47);
  const startZ = -3.2;
  const step = (-11.1 - startZ) / 15;
  for (let index = 0; index < 16; index += 1) {
    const plank = new THREE.Mesh(plankGeometry, materials.wood);
    plank.position.set(2.2, 0.18 + Math.sin(index * 0.58) * 0.025, startZ + step * index);
    plank.rotation.y = Math.sin(index * 0.47) * 0.018;
    plank.castShadow = quality === "high";
    plank.receiveShadow = true;
    root.add(plank);
  }
  [-0.88, 0.88].forEach((offset) => {
    const points = [];
    for (let index = 0; index < 8; index += 1) {
      const progress = index / 7;
      points.push(new THREE.Vector3(
        2.2 + offset,
        0.82 - Math.sin(progress * Math.PI) * 0.24,
        startZ + (-11.1 - startZ) * progress
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const rope = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 42, 0.025, 5, false),
      materials.rope
    );
    root.add(rope);
    [0, 0.33, 0.66, 1].forEach((progress) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.07, 0.92, 8),
        materials.wood
      );
      post.position.set(
        2.2 + offset,
        0.57,
        startZ + (-11.1 - startZ) * progress
      );
      root.add(post);
    });
  });
  return root;
}

function createOrnateTent(THREE, materials, spec) {
  const root = new THREE.Group();
  root.name = "moonlake_ornate_clay_tent";
  root.position.set(spec.x, spec.y, spec.z);
  root.rotation.y = spec.rotation;
  root.scale.setScalar(spec.scale);

  const ivory = clayMaterial(THREE, 0xe5dfca, 0.72, 0.16);
  const blue = clayMaterial(THREE, 0x294f87, 0.68, 0.2);
  const blueDark = clayMaterial(THREE, 0x18375f, 0.78, 0.12);
  const warmInterior = new THREE.MeshStandardMaterial({
    color: 0x5a3927,
    roughness: 0.86,
    emissive: 0x9b5b2f,
    emissiveIntensity: 0.12
  });
  const radius = 1.42;
  const wallHeight = 1.42;
  const roofBaseY = wallHeight;
  const apexY = 3.1;
  const segments = 12;

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.04, wallHeight, segments, 1, true),
    blueDark
  );
  wall.position.y = wallHeight * 0.5;
  wall.castShadow = true;
  wall.receiveShadow = true;
  root.add(wall);
  [0.08, roofBaseY - 0.02].forEach((height, index) => {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(radius * (index === 0 ? 1.025 : 1.015), index === 0 ? 0.045 : 0.06, 7, 36),
      materials.gold
    );
    band.rotation.x = Math.PI / 2;
    band.position.y = height;
    root.add(band);
  });
  for (let index = 0; index < 8; index += 1) {
    const angle = index / 8 * Math.PI * 2;
    const brace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.036, wallHeight * 0.9, 6),
      materials.gold
    );
    brace.position.set(
      Math.sin(angle) * radius * 1.02,
      wallHeight * 0.52,
      Math.cos(angle) * radius * 1.02
    );
    root.add(brace);
  }

  for (let index = 0; index < segments; index += 1) {
    const a0 = (index / segments) * Math.PI * 2;
    const a1 = ((index + 1) / segments) * Math.PI * 2;
    const vertices = new Float32Array([
      0, apexY, 0,
      Math.sin(a0) * radius, roofBaseY, Math.cos(a0) * radius,
      Math.sin(a1) * radius, roofBaseY, Math.cos(a1) * radius
    ]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const panel = new THREE.Mesh(geometry, index % 3 === 1 ? ivory : blue);
    panel.castShadow = true;
    panel.receiveShadow = true;
    root.add(panel);
  }

  const doorway = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 1.3),
    warmInterior
  );
  doorway.position.set(0, 0.68, radius * 1.045 + 0.015);
  root.add(doorway);
  const leftFlap = makeTentFlap(THREE, ivory, -0.48, 0.18);
  const rightFlap = makeTentFlap(THREE, blue, 0.48, -0.18);
  root.add(leftFlap, rightFlap);

  const crownRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.055, 6, 20),
    materials.gold
  );
  crownRing.rotation.x = Math.PI / 2;
  crownRing.position.y = apexY - 0.08;
  root.add(crownRing);
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.07, 3.65, 9),
    materials.gold
  );
  mast.position.y = 1.76;
  root.add(mast);
  const finial = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.42, 8),
    materials.gold
  );
  finial.position.y = 3.52;
  root.add(finial);

  [0.65, 1.02].forEach((ringRadius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(ringRadius, index === 0 ? 0.035 : 0.028, 6, 28),
      materials.gold
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = roofBaseY + (apexY - roofBaseY) * (index === 0 ? 0.55 : 0.22);
    root.add(ring);
  });

  [0.65, 2.48, 3.8, 5.63].forEach((angle) => {
    const base = new THREE.Vector3(Math.sin(angle) * radius, 0.05, Math.cos(angle) * radius);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.06, 1.52, 8),
      materials.gold
    );
    post.position.copy(base);
    post.position.y = 0.76;
    root.add(post);
    const ropeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, apexY - 0.08, 0),
      new THREE.Vector3(base.x * 0.65, 2.1, base.z * 0.65),
      new THREE.Vector3(base.x * 1.28, 0.05, base.z * 1.28)
    ]);
    const rope = new THREE.Mesh(
      new THREE.TubeGeometry(ropeCurve, 18, 0.018, 5, false),
      materials.rope
    );
    root.add(rope);
  });
  return root;
}

function makeTentFlap(THREE, material, x, rotation) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.65);
  shape.lineTo(0.46, -0.65);
  shape.lineTo(-0.2, -0.65);
  shape.closePath();
  const flap = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  flap.position.set(x, 0.67, 1.47);
  flap.rotation.y = rotation;
  return flap;
}

function createCliff(THREE, materials, spec) {
  const root = new THREE.Group();
  root.name = `moonlake_cliff_${spec.seed}`;
  const tiers = [
    { y: spec.height * 0.22, height: spec.height * 0.44, radius: spec.radius },
    { y: spec.height * 0.56, height: spec.height * 0.34, radius: spec.radius * 0.82 },
    { y: spec.height * 0.82, height: spec.height * 0.2, radius: spec.radius * 0.62 }
  ];
  tiers.forEach((tier, index) => {
    const rock = new THREE.Mesh(
      new THREE.CylinderGeometry(
        tier.radius * (0.78 + index * 0.04),
        tier.radius,
        tier.height,
        9
      ),
      index % 2 === 0 ? materials.stone : materials.stoneLight
    );
    rock.position.set(
      spec.x + Math.sin(spec.seed + index) * 0.18,
      tier.y - 0.12,
      spec.z + Math.cos(spec.seed * 0.7 + index) * 0.14
    );
    rock.rotation.y = spec.seed * 0.31 + index * 0.39;
    rock.castShadow = true;
    rock.receiveShadow = true;
    root.add(rock);
  });
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(spec.radius * 0.68, spec.radius * 0.72, 0.24, 12),
    materials.grassLight
  );
  cap.position.set(spec.x, spec.height - 0.02, spec.z);
  cap.scale.z = 0.82;
  cap.receiveShadow = true;
  root.add(cap);
  root.add(createClayPine(
    THREE,
    materials,
    spec.x - spec.radius * 0.22,
    spec.height + 0.08,
    spec.z - 0.1,
    0.56,
    spec.seed % 2 === 0
  ));
  return root;
}

function createClayPine(THREE, materials, x, y, z, scale, alternate) {
  const root = new THREE.Group();
  root.name = "moonlake_clay_pine";
  root.position.set(x, y, z);
  root.scale.setScalar(scale);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 1.15, 8), materials.trunk);
  trunk.position.y = 0.55;
  root.add(trunk);
  const foliageMaterial = alternate ? materials.pineLight : materials.pine;
  [
    [0.92, 0.78, 0.92],
    [1.42, 0.68, 0.82],
    [1.86, 0.52, 0.68]
  ].forEach(([height, radius, length]) => {
    const foliage = new THREE.Mesh(new THREE.ConeGeometry(radius, length, 9), foliageMaterial);
    foliage.position.y = height;
    foliage.castShadow = true;
    root.add(foliage);
  });
  return root;
}

function createShoreStones(THREE, material, quality) {
  const count = quality === "low" ? 18 : quality === "medium" ? 28 : 38;
  const geometry = new THREE.DodecahedronGeometry(0.22, 0);
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.name = "moonlake_shore_stones";
  const helper = new THREE.Object3D();
  const random = mulberry32(0x53484f52);
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    const near = index % 3 !== 0;
    const radiusX = near ? 7.2 : 6.1;
    const radiusZ = near ? 4.25 : 2.15;
    helper.position.set(
      (near ? -0.35 : 0) + Math.cos(angle) * radiusX,
      near ? -0.02 : -0.06,
      (near ? 5.45 : -12.65) + Math.sin(angle) * radiusZ
    );
    const scale = 0.72 + random() * 0.62;
    helper.scale.set(scale * 1.25, scale * 0.7, scale);
    helper.rotation.set(random(), random() * Math.PI, random() * 0.4);
    helper.updateMatrix();
    mesh.setMatrixAt(index, helper.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = quality === "high";
  mesh.receiveShadow = true;
  return mesh;
}

function createShrubBeds(THREE, quality) {
  const root = new THREE.Group();
  root.name = "moonlake_resin_shrub_beds";
  const clusterCount = quality === "low" ? 10 : quality === "medium" ? 14 : 18;
  const leafGeometry = new THREE.IcosahedronGeometry(0.2, 1);
  const leafMaterial = clayMaterial(THREE, 0x4f7d4d, 0.84, 0.08);
  const leaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, clusterCount * 3);
  const flowerGeometry = new THREE.SphereGeometry(0.055, 7, 5);
  const flowerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcfe2f2,
    roughness: 0.62,
    clearcoat: 0.22,
    clearcoatRoughness: 0.58
  });
  const flowers = new THREE.InstancedMesh(flowerGeometry, flowerMaterial, clusterCount);
  const helper = new THREE.Object3D();
  const random = mulberry32(0x42555348);
  const placements = [];
  let guard = 0;
  while (placements.length < clusterCount && guard < clusterCount * 30) {
    guard += 1;
    const farBank = placements.length % 5 === 0;
    const x = (random() - 0.5) * (farBank ? 9.4 : 11.7);
    const z = farBank ? -12.4 - random() * 1.15 : 3.0 + random() * 6.1;
    if (Math.hypot(x, z - 1.2) < 3.35) continue;
    if (x > 1.05 && x < 3.35 && z < -2.2) continue;
    placements.push({ x, z, scale: 0.72 + random() * 0.68 });
  }
  placements.forEach((placement, clusterIndex) => {
    for (let leafIndex = 0; leafIndex < 3; leafIndex += 1) {
      const angle = leafIndex / 3 * Math.PI * 2 + clusterIndex * 0.43;
      helper.position.set(
        placement.x + Math.cos(angle) * 0.17 * placement.scale,
        0.08 + leafIndex * 0.025,
        placement.z + Math.sin(angle) * 0.14 * placement.scale
      );
      helper.scale.set(
        placement.scale * (1.05 + leafIndex * 0.08),
        placement.scale * (0.72 + leafIndex * 0.06),
        placement.scale
      );
      helper.rotation.set(random() * 0.3, random() * Math.PI, random() * 0.25);
      helper.updateMatrix();
      leaves.setMatrixAt(clusterIndex * 3 + leafIndex, helper.matrix);
    }
    helper.position.set(placement.x, 0.31 * placement.scale, placement.z);
    helper.scale.setScalar(placement.scale);
    helper.rotation.set(0, 0, 0);
    helper.updateMatrix();
    flowers.setMatrixAt(clusterIndex, helper.matrix);
    flowers.setColorAt(
      clusterIndex,
      new THREE.Color(clusterIndex % 3 === 0 ? 0x8eb6dd : 0xe4e4cf)
    );
  });
  leaves.instanceMatrix.needsUpdate = true;
  flowers.instanceMatrix.needsUpdate = true;
  flowers.instanceColor.needsUpdate = true;
  leaves.castShadow = quality === "high";
  leaves.receiveShadow = true;
  root.add(leaves, flowers);
  return root;
}

function createWaterfalls(THREE) {
  const items = MOONLAKE_WATERFALLS.map((spec) => {
    const group = new THREE.Group();
    group.name = `moonlake_waterfall_${spec.id}`;
    const uniforms = {
      time: { value: 0 },
      nightMix: { value: 0 },
      phase: { value: spec.phase }
    };
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: [
        "uniform float time;",
        "uniform float phase;",
        "varying vec2 vUv;",
        "void main() {",
        "  vUv = uv;",
        "  vec3 p = position;",
        "  p.x += sin(uv.y * 10.0 + time * 0.75 + phase * 6.283) * 0.035;",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform float time;",
        "uniform float nightMix;",
        "uniform float phase;",
        "varying vec2 vUv;",
        "void main() {",
        "  float flow = fract(vUv.y * 5.0 - time * 0.32 - phase);",
        "  float ribbon = pow(sin(vUv.x * 3.14159265), 0.62);",
        "  float streak = smoothstep(0.42, 0.98, sin((vUv.x * 13.0 + flow * 6.0) * 3.14159) * 0.5 + 0.5);",
        "  float fade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.82, vUv.y);",
        "  vec3 day = mix(vec3(0.20, 0.63, 0.84), vec3(0.72, 0.94, 1.0), streak);",
        "  vec3 night = mix(vec3(0.08, 0.40, 0.72), vec3(0.48, 0.86, 1.0), streak);",
        "  gl_FragColor = vec4(mix(day, night, nightMix), (0.38 + streak * 0.34) * ribbon * fade);",
        "}"
      ].join("\n")
    });
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(spec.width, spec.height, 8, 32),
      material
    );
    ribbon.position.set(spec.position.x, spec.position.y, spec.position.z + 0.04);
    group.add(ribbon);

    const foamMaterial = new THREE.MeshBasicMaterial({
      color: 0xa9eaff,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const foam = new THREE.Mesh(
      new THREE.TorusGeometry(spec.width * 0.42, 0.055, 5, 22),
      foamMaterial
    );
    foam.rotation.x = Math.PI / 2;
    foam.position.set(
      spec.position.x,
      spec.position.y - spec.height * 0.49,
      spec.position.z + 0.16
    );
    group.add(foam);
    return { group, ribbon, foam, uniforms, phase: spec.phase };
  });
  return { items };
}

function createGrass(THREE, quality) {
  const count = GRASS_COUNT[quality] || GRASS_COUNT.high;
  const geometry = new THREE.ConeGeometry(0.075, 0.48, 4, 1);
  geometry.translate(0, 0.24, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4c8b55,
    roughness: 0.86,
    metalness: 0,
    flatShading: false
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.name = "moonlake_wind_grass";
  mesh.castShadow = quality === "high";
  mesh.receiveShadow = true;
  const instances = buildGrassInstances(count);
  const helper = new THREE.Object3D();
  instances.forEach((instance, index) => {
    helper.position.set(instance.x, instance.y, instance.z);
    helper.scale.set(instance.scale, instance.scale, instance.scale);
    helper.rotation.y = instance.rotation;
    helper.updateMatrix();
    mesh.setMatrixAt(index, helper.matrix);
    mesh.setColorAt(index, new THREE.Color(instance.color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
  return { mesh, instances, helper };
}

function buildGrassInstances(count) {
  const random = mulberry32(0x4d4f4f4e);
  const instances = [];
  let guard = 0;
  while (instances.length < count && guard < count * 20) {
    guard += 1;
    const farBank = instances.length % 4 === 0;
    const x = (random() - 0.5) * (farBank ? 9 : 11);
    const z = farBank
      ? -12.1 - random() * 2.25
      : 2.2 + random() * 8.7;
    const nearPlatform = Math.hypot(x, z - 1.2) < 3.2;
    const bridgeApproach = x > 1.15 && x < 3.15 && z < -2.4 && z > -12.2;
    if (nearPlatform || bridgeApproach) continue;
    instances.push({
      x,
      y: farBank ? 0.02 : -0.02,
      z,
      scale: 0.65 + random() * 0.8,
      rotation: random() * Math.PI * 2,
      phase: random() * Math.PI * 2,
      color: random() > 0.48 ? 0x5f9d61 : 0x376f49
    });
  }
  return instances;
}

function createWeather(THREE, quality) {
  const root = new THREE.Group();
  root.name = "moonlake_live_weather";
  const rainCount = RAIN_COUNT[quality] || 0;
  const positions = new Float32Array(rainCount * 2 * 3);
  const rainSeeds = [];
  const random = mulberry32(0x5241494e);
  for (let index = 0; index < rainCount; index += 1) {
    rainSeeds.push({
      x: (random() - 0.5) * 24,
      y: 2 + random() * 18,
      z: 8 - random() * 28,
      speed: 7 + random() * 6
    });
  }
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const rainMaterial = new THREE.LineBasicMaterial({
    color: 0xb7dcf2,
    transparent: true,
    opacity: 0.52,
    depthWrite: false
  });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.visible = false;
  root.add(rain);

  const mistMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      opacity: { value: 0 },
      color: { value: new THREE.Color(0xc9dfdf) }
    },
    vertexShader: [
      "varying vec2 vUv;",
      "void main() {",
      "  vUv = uv;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform float opacity;",
      "uniform vec3 color;",
      "varying vec2 vUv;",
      "void main() {",
      "  float edgeX = smoothstep(0.0, 0.24, vUv.x) * (1.0 - smoothstep(0.76, 1.0, vUv.x));",
      "  float edgeY = smoothstep(0.0, 0.34, vUv.y) * (1.0 - smoothstep(0.66, 1.0, vUv.y));",
      "  float drift = 0.82 + 0.18 * sin(vUv.x * 11.0 + vUv.y * 7.0);",
      "  gl_FragColor = vec4(color, opacity * edgeX * edgeY * drift);",
      "}"
    ].join("\n")
  });
  const mist = new THREE.Mesh(new THREE.PlaneGeometry(26, 11), mistMaterial);
  mist.rotation.x = -Math.PI / 2;
  mist.position.set(0, 0.75, -7);
  mist.visible = false;
  root.add(mist);
  return { root, rain, rainSeeds, mist, mistMaterial };
}

function configureModel(THREE, model, quality, visibleGlbCandidate) {
  model.userData.structuralSource = true;
  model.userData.runtimeReskinned = true;
  model.userData.visibleGlbCandidate = visibleGlbCandidate;
  const visibleMeshNames = [];
  const hiddenMeshNames = [];
  const retiredMaterials = new Set();
  model.traverse((node) => {
    if (!node.isMesh) return;
    const normalizedName = String(node.name || "").toLowerCase();
    const intentionallyHidden = MOONLAKE_VISIBLE_GLB_CANDIDATE
      .hiddenMeshTokens
      .some((token) => normalizedName.includes(token));
    node.visible = visibleGlbCandidate && !intentionallyHidden;
    node.castShadow = node.visible && quality !== "low";
    node.receiveShadow = node.visible;
    (node.visible ? visibleMeshNames : hiddenMeshNames).push(node.name);
    const sourceMaterials = Array.isArray(node.material)
      ? node.material
      : [node.material];
    if (!visibleGlbCandidate || intentionallyHidden) return;
    sourceMaterials.filter(Boolean).forEach((material) => retiredMaterials.add(material));
    const replacement = sourceMaterials.map((_, index) => (
      createVisibleGlbCandidateMaterial(THREE, normalizedName, index)
    ));
    node.material = Array.isArray(node.material)
      ? replacement
      : replacement[0];
  });
  retiredMaterials.forEach((material) => material.dispose?.());
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  return {
    visibleMeshNames,
    hiddenMeshNames,
    bounds: {
      min: bounds.min.toArray(),
      max: bounds.max.toArray(),
      size: size.toArray()
    }
  };
}

function createVisibleGlbCandidateMaterial(THREE, nodeName, slotIndex) {
  const base = {
    roughness: 0.78,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.82
  };
  if (nodeName.includes("platform")) {
    return new THREE.MeshPhysicalMaterial({
      ...base,
      color: slotIndex % 2 === 0 ? 0xc8b78f : 0x9f8b68
    });
  }
  if (nodeName.includes("tent_a")) {
    return new THREE.MeshPhysicalMaterial({
      ...base,
      color: slotIndex % 2 === 0 ? 0x274c83 : 0xe1d9c3
    });
  }
  if (nodeName.includes("tent_b")) {
    return new THREE.MeshPhysicalMaterial({
      ...base,
      color: slotIndex % 2 === 0 ? 0x604478 : 0xd9c9b5
    });
  }
  if (nodeName.includes("campfire")) {
    return new THREE.MeshStandardMaterial({
      color: slotIndex % 2 === 0 ? 0x46c6d3 : 0xff9b4d,
      roughness: 0.62,
      metalness: 0,
      emissive: slotIndex % 2 === 0 ? 0x0c6d78 : 0xa54318,
      emissiveIntensity: 0.72
    });
  }
  return new THREE.MeshPhysicalMaterial({
    ...base,
    color: slotIndex % 2 === 0 ? 0x58784a : 0x71847b
  });
}

function resizeRenderer(state, gameRoot) {
  const rect = gameRoot.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (state.size.width === width && state.size.height === height) return;
  state.size.width = width;
  state.size.height = height;
  state.renderer.setSize(width, height, false);
  state.camera.aspect = width / height;
  state.camera.updateProjectionMatrix();
  state.visualBackdrop.uniforms.viewportAspect.value = width / height;
}

function updateScene(state, ticker, getEnvironmentState, getWeather) {
  if (!state.active || state.disposed || state.contextLost) return;
  const deltaSeconds = Math.min(0.05, Math.max(0, Number(ticker?.deltaMS) || 16.67) / 1000);
  state.elapsed += deltaSeconds;
  state.frameCount += 1;

  const environment = typeof getEnvironmentState === "function"
    ? getEnvironmentState()
    : { nightAlpha: 0, sunProgress: 0.5, moonProgress: 0.5 };
  const weatherId = typeof getWeather === "function" ? getWeather() : "clear";
  const nightMix = clamp01(environment?.nightAlpha);
  const rainStrength = weatherId === "rain" ? 1 : weatherId === "mist" ? 0.12 : 0;
  state.lastWeather = weatherId;
  state.lastNightMix = nightMix;

  state.sky.uniforms.nightMix.value = nightMix;
  state.sky.uniforms.topColor.value.set(nightMix > 0.6 ? 0x12315e : 0x5d9fce);
  state.sky.uniforms.horizonColor.value.set(nightMix > 0.6 ? 0x285078 : 0xc8e6ef);
  state.scene.background.set(nightMix > 0.6 ? 0x0b1f3c : 0xa9d2e5);
  state.scene.fog.color.set(nightMix > 0.6 ? 0x1b3550 : 0xa9ced9);
  state.scene.fog.density = weatherId === "mist" ? 0.034 : weatherId === "rain" ? 0.019 : 0.012;

  const sunProgress = clamp01(environment?.sunProgress);
  const moonProgress = clamp01(environment?.moonProgress);
  state.lights.sun.position.set(
    -16 + sunProgress * 32,
    8 + Math.sin(sunProgress * Math.PI) * 15,
    10
  );
  state.lights.moon.position.set(
    15 - moonProgress * 30,
    9 + Math.sin(moonProgress * Math.PI) * 12,
    -10
  );
  state.lights.sun.intensity = (1 - nightMix) * 4.2;
  state.lights.moon.intensity = nightMix * 2.0;
  state.lights.hemisphere.intensity = 2.15 - nightMix * 0.72;
  state.lights.campWarmth.intensity = 0.55 + nightMix * 2.15;
  state.renderer.toneMappingExposure = 1.14 - nightMix * 0.12;

  const motionScale = state.reducedMotion ? 0.16 : 1;
  state.visualBackdrop.uniforms.time.value = state.elapsed * motionScale;
  state.visualBackdrop.uniforms.nightMix.value = nightMix;
  state.visualBackdrop.uniforms.rainStrength.value = rainStrength;
  updateInteractionPulses(state, deltaSeconds);
  state.water.uniforms.time.value = state.elapsed * motionScale;
  state.water.uniforms.nightMix.value = nightMix;
  state.water.uniforms.rainStrength.value = rainStrength;
  state.waterfalls.items.forEach((item) => {
    item.uniforms.time.value = state.elapsed * motionScale;
    item.uniforms.nightMix.value = nightMix;
    item.foam.scale.setScalar(0.94 + Math.sin(state.elapsed * 1.2 + item.phase) * 0.08 * motionScale);
    item.foam.material.opacity = 0.34 + nightMix * 0.18;
  });
  updateGrass(state, motionScale);
  updateWeather(state, weatherId, deltaSeconds, motionScale);
  state.renderer.render(state.scene, state.camera);
}

function updateInteractionPulses(state, deltaSeconds) {
  const decay = {
    lantern: 0.48,
    crystal: 0.7,
    water: 0.58
  };
  Object.entries(state.interactions).forEach(([type, interaction]) => {
    interaction.strength = Math.max(0, interaction.strength - deltaSeconds * decay[type]);
    const pulseUniform = state.visualBackdrop.uniforms[`${type}Pulse`];
    const centerUniform = state.visualBackdrop.uniforms[`${type}Center`];
    if (pulseUniform) pulseUniform.value = interaction.strength;
    if (centerUniform) {
      centerUniform.value.set(interaction.center.x, 1 - interaction.center.y);
    }
  });
}

function updateGrass(state, motionScale) {
  const { grass, elapsed } = state;
  state.lastGrassSway = 0;
  grass.instances.forEach((instance, index) => {
    const sway = Math.sin(elapsed * 0.85 + instance.phase) * 0.085 * motionScale;
    if (index === 0) state.lastGrassSway = sway;
    grass.helper.position.set(instance.x, instance.y, instance.z);
    grass.helper.scale.set(instance.scale, instance.scale, instance.scale);
    grass.helper.rotation.set(sway * 0.45, instance.rotation, sway);
    grass.helper.updateMatrix();
    grass.mesh.setMatrixAt(index, grass.helper.matrix);
  });
  grass.mesh.instanceMatrix.needsUpdate = true;
}

function updateWeather(state, weatherId, deltaSeconds, motionScale) {
  const showRain = weatherId === "rain" && !state.reducedMotion && state.quality !== "low";
  const showMist = weatherId === "mist";
  state.weather.rain.visible = showRain;
  state.weather.mist.visible = showMist;
  state.weather.mistMaterial.uniforms.opacity.value = showMist
    ? 0.105 + Math.sin(state.elapsed * 0.2) * 0.018 * motionScale
    : 0;
  if (!showRain) return;
  const positions = state.weather.rain.geometry.getAttribute("position");
  state.weather.rainSeeds.forEach((drop, index) => {
    drop.y -= drop.speed * deltaSeconds;
    drop.x -= 1.3 * deltaSeconds;
    if (drop.y < -0.5) {
      drop.y = 17 + (index % 7) * 0.41;
      drop.x += 6.5;
    }
    const cursor = index * 6;
    positions.array[cursor] = drop.x;
    positions.array[cursor + 1] = drop.y;
    positions.array[cursor + 2] = drop.z;
    positions.array[cursor + 3] = drop.x + 0.12;
    positions.array[cursor + 4] = drop.y - 0.75;
    positions.array[cursor + 5] = drop.z + 0.18;
  });
  positions.needsUpdate = true;
}

function projectWorldToScreen(THREE, state, point) {
  if (!state.ready || state.contextLost || !point) return null;
  if (state.visibleGlbCandidate) {
    return projectMoonlakeCameraPoint(THREE, state, point);
  }
  return projectMoonlakeVisualPoint(point, state.size);
}

function projectMoonlakeCameraPoint(THREE, state, point) {
  const worldX = Number(point?.x);
  const worldY = Number(point?.y);
  const worldZ = Number(point?.z);
  if (
    !Number.isFinite(worldX)
    || !Number.isFinite(worldY)
    || !Number.isFinite(worldZ)
  ) {
    return null;
  }
  const projected = new THREE.Vector3(worldX, worldY, worldZ)
    .project(state.camera);
  const metadata = projectMoonlakeVisualPoint(point, state.size);
  return {
    ...metadata,
    x: (projected.x * 0.5 + 0.5) * state.size.width,
    y: (-projected.y * 0.5 + 0.5) * state.size.height,
    depth: clamp(projected.z * 0.5 + 0.5, 0, 1),
    visible: projected.z >= -1
      && projected.z <= 1
      && projected.x >= -1.08
      && projected.x <= 1.08
      && projected.y >= -1.08
      && projected.y <= 1.08,
    projectionMode: "three_camera"
  };
}

export function projectMoonlakeVisualPoint(point, viewport = {}) {
  if (!point) return null;
  const worldX = Number(point.x) || 0;
  const worldZ = Number(point.z) || 0;
  const imageAspect = MOONLAKE_VISUAL_MASTER.imageAspect;
  const width = Math.max(1, Number(viewport.width) || 1);
  const height = Math.max(1, Number(viewport.height) || 1);
  const viewportAspect = width / height;
  const perspectiveScale = Math.max(0.038, 0.068 + worldZ * 0.0022);
  const genericImageX = 0.5 + worldX * perspectiveScale;
  const genericImageY = 0.56 + (worldZ - 1.2) * 0.0195;
  const genericScale = clamp(0.72 + genericImageY * 0.16, 0.74, 0.84);
  const walkway = resolveVisualWalkwayPoint(worldX, worldZ);
  const routeWeight = walkway
    ? resolveVisualWalkwayWeight(worldX, worldZ)
    : 0;
  const imageX = walkway
    ? lerp(genericImageX, walkway.imageX, routeWeight)
    : genericImageX;
  const imageY = walkway
    ? lerp(genericImageY, walkway.imageY, routeWeight)
    : genericImageY;
  const displayScale = walkway
    ? lerp(genericScale, walkway.scale, routeWeight)
    : genericScale;
  let screenX = imageX;
  let screenY = imageY;
  if (viewportAspect < imageAspect) {
    screenX = 0.5 + (imageX - 0.5) * (imageAspect / viewportAspect);
  } else {
    screenY = 0.5 + (imageY - 0.5) * (viewportAspect / imageAspect);
  }
  return {
    x: screenX * width,
    y: screenY * height,
    referenceScale390: width / 390,
    depth: clamp((imageY - 0.28) / 0.42, 0, 1),
    scale: displayScale,
    surface: walkway?.surface || "ground",
    routeId: walkway ? MOONLAKE_VISUAL_WALKWAY.routeId : null,
    visible: screenX >= -0.08
      && screenX <= 1.08
      && screenY >= -0.08
      && screenY <= 1.08
  };
}

export function projectMoonlakeImagePoint(point, viewport = {}) {
  if (!point) return null;
  const imageX = Number(point.imageX);
  const imageY = Number(point.imageY);
  if (!Number.isFinite(imageX) || !Number.isFinite(imageY)) return null;
  const width = Math.max(1, Number(viewport.width) || 1);
  const height = Math.max(1, Number(viewport.height) || 1);
  const viewportAspect = width / height;
  const imageAspect = MOONLAKE_VISUAL_MASTER.imageAspect;
  let screenX = imageX;
  let screenY = imageY;
  if (viewportAspect < imageAspect) {
    screenX = 0.5 + (imageX - 0.5) * (imageAspect / viewportAspect);
  } else {
    screenY = 0.5 + (imageY - 0.5) * (viewportAspect / imageAspect);
  }
  return {
    x: screenX * width,
    y: screenY * height,
    visible: screenX >= 0 && screenX <= 1 && screenY >= 0 && screenY <= 1,
    referenceScale390: width / 390
  };
}

function hitTestMoonlakeInteraction(point, viewport) {
  const screenX = Number(point?.x);
  const screenY = Number(point?.y);
  if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
  let closest = null;
  MOONLAKE_INTERACTION_HOTSPOTS.forEach((hotspot) => {
    const projected = projectMoonlakeImagePoint(hotspot, viewport);
    if (!projected?.visible) return;
    const radius = hotspot.radiusPx390 * projected.referenceScale390;
    const distance = Math.hypot(projected.x - screenX, projected.y - screenY);
    if (distance > radius || (closest && closest.distance <= distance)) return;
    closest = {
      ...hotspot,
      x: projected.x,
      y: projected.y,
      radius,
      distance
    };
  });
  return closest;
}

function triggerMoonlakeInteraction(state, interactionId) {
  const hotspot = MOONLAKE_INTERACTION_HOTSPOTS.find((candidate) => candidate.id === interactionId);
  const interaction = hotspot ? state.interactions[hotspot.type] : null;
  if (!hotspot || !interaction) return null;
  interaction.strength = 1;
  interaction.center = { x: hotspot.imageX, y: hotspot.imageY };
  const projected = projectMoonlakeImagePoint(hotspot, state.size);
  state.lastInteraction = {
    id: hotspot.id,
    type: hotspot.type,
    at: state.elapsed
  };
  return {
    ...hotspot,
    x: projected?.x,
    y: projected?.y,
    visible: Boolean(projected?.visible)
  };
}

function resolveVisualWalkwayPoint(worldX, worldZ) {
  const route = MOONLAKE_VISUAL_WALKWAY;
  const isFarLanding = worldZ <= route.farLandingWorldZ;
  const isBridgeApproach = worldZ <= route.bridgeWorldZMax
    && worldX >= route.bridgeEntryBlendStartX;
  if (!isFarLanding && !isBridgeApproach) return null;

  const anchors = route.anchors;
  let from = anchors[0];
  let to = anchors[anchors.length - 1];
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const candidateFrom = anchors[index];
    const candidateTo = anchors[index + 1];
    if (worldZ <= candidateFrom.worldZ && worldZ >= candidateTo.worldZ) {
      from = candidateFrom;
      to = candidateTo;
      break;
    }
  }
  if (worldZ >= anchors[0].worldZ) {
    from = anchors[0];
    to = anchors[0];
  } else if (worldZ <= anchors[anchors.length - 1].worldZ) {
    from = anchors[anchors.length - 1];
    to = anchors[anchors.length - 1];
  }

  const span = Math.max(0.0001, from.worldZ - to.worldZ);
  const progress = from === to
    ? 0
    : clamp((from.worldZ - worldZ) / span, 0, 1);
  const expectedWorldX = lerp(from.worldX, to.worldX, progress);
  const lateralOffset = (worldX - expectedWorldX) * route.lateralImageScale;
  return {
    imageX: lerp(from.imageX, to.imageX, progress) + lateralOffset,
    imageY: lerp(from.imageY, to.imageY, progress),
    scale: lerp(from.scale, to.scale, progress),
    surface: "bridge"
  };
}

function resolveVisualWalkwayWeight(worldX, worldZ) {
  const route = MOONLAKE_VISUAL_WALKWAY;
  if (worldZ <= route.farLandingWorldZ) return 1;
  const width = Math.max(
    0.0001,
    route.bridgeEntryBlendEndX - route.bridgeEntryBlendStartX
  );
  const normalized = clamp(
    (worldX - route.bridgeEntryBlendStartX) / width,
    0,
    1
  );
  return normalized * normalized * (3 - 2 * normalized);
}

function buildDiagnostics(state) {
  return {
    ready: state.ready && !state.contextLost && !state.disposed,
    active: state.active,
    fallback: false,
    contextLost: state.contextLost,
    quality: state.quality,
    reducedMotion: state.reducedMotion,
    renderMode: state.renderMode,
    frameCount: state.frameCount,
    canvasCount: state.canvas.parentElement
      ? state.canvas.parentElement.querySelectorAll(".moonlake-live3d-canvas").length
      : 0,
    size: { ...state.size },
    asset: { ...MOONLAKE_LIVE3D_ASSET },
    visualMaster: {
      ...MOONLAKE_VISUAL_MASTER,
      mode: state.renderMode,
      visible: state.visualBackdrop.mesh.visible,
      role: state.visibleGlbCandidate
        ? MOONLAKE_VISIBLE_GLB_CANDIDATE.rasterRole
        : MOONLAKE_VISUAL_MASTER.sourceRole
    },
    visibleGlbCandidate: {
      ...MOONLAKE_VISIBLE_GLB_CANDIDATE,
      enabled: state.visibleGlbCandidate,
      dynamicRigVisible: state.liveGeometryRig.visible,
      modelVisibleMeshCount: state.modelDiagnostics.visibleMeshNames.length,
      modelHiddenMeshCount: state.modelDiagnostics.hiddenMeshNames.length,
      visibleMeshNames: [...state.modelDiagnostics.visibleMeshNames],
      hiddenMeshNames: [...state.modelDiagnostics.hiddenMeshNames],
      bounds: state.modelDiagnostics.bounds
    },
    environment: {
      weather: state.lastWeather,
      nightMix: state.lastNightMix,
      rainVisible: state.weather.rain.visible,
      mistVisible: state.weather.mist.visible
    },
    animation: {
      visualTime: state.visualBackdrop.uniforms.time.value,
      waterTime: state.water.uniforms.time.value,
      waterfallTimes: state.waterfalls.items.map((item) => item.uniforms.time.value),
      waterfallBackdropStrength: 0.47,
      grassSway: state.lastGrassSway
    },
    interactions: {
      hotspots: MOONLAKE_INTERACTION_HOTSPOTS.length,
      last: state.lastInteraction,
      pulses: Object.fromEntries(
        Object.entries(state.interactions).map(([type, interaction]) => [
          type,
          interaction.strength
        ])
      )
    },
    renderer: {
      calls: state.renderer.info.render.calls,
      triangles: state.renderer.info.render.triangles,
      points: state.renderer.info.render.points,
      lines: state.renderer.info.render.lines
    }
  };
}

function disposeObjectTree(root) {
  root?.traverse?.((node) => {
    node.geometry?.dispose?.();
    if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose?.());
    else node.material?.dispose?.();
  });
}

function readQuality() {
  const requested = document.documentElement?.dataset?.quality || "high";
  if (requested === "low" || requested === "medium") return requested;
  const memory = Number(navigator.deviceMemory) || 8;
  const cores = Number(navigator.hardwareConcurrency) || 8;
  if (memory <= 4 || cores <= 4) return "medium";
  return "high";
}

function readReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
    || document.documentElement?.dataset?.reducedMotionPreference === "reduced";
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(value) {
  return clamp(Number(value) || 0, 0, 1);
}

function lerp(from, to, amount) {
  return from + (to - from) * clamp(Number(amount) || 0, 0, 1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
