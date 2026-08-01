const MIP_FRAME_SIZE = 128;

let activeLoadKey = null;
let activeLoadPromise = null;

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`manifest_http_${response.status}`);
  }
  return response.json();
}

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("manifestation_image_failed"));
    image.src = path;
  });
}

function buildMipFrames(image, animation) {
  const frames = [];
  for (let index = 0; index < animation.frameCount; index++) {
    const column = index % animation.columns;
    const row = Math.floor(index / animation.columns);
    const frame = document.createElement("canvas");
    frame.width = MIP_FRAME_SIZE;
    frame.height = MIP_FRAME_SIZE;
    const frameCtx = frame.getContext("2d");
    frameCtx.imageSmoothingEnabled = true;
    frameCtx.imageSmoothingQuality = "high";
    frameCtx.clearRect(0, 0, MIP_FRAME_SIZE, MIP_FRAME_SIZE);
    frameCtx.drawImage(
      image,
      column * animation.frameWidth,
      row * animation.frameHeight,
      animation.frameWidth,
      animation.frameHeight,
      0,
      0,
      MIP_FRAME_SIZE,
      MIP_FRAME_SIZE
    );
    frames.push(frame);
  }
  return frames;
}

async function loadAsset({ companionId, formalStage, assetRecord }) {
  if (
    !assetRecord ||
    assetRecord.id !== companionId ||
    typeof assetRecord.orbitManifestations !== "string" ||
    typeof assetRecord.animations !== "string"
  ) {
    return { ready: false, stage: formalStage, status: "asset_record_missing" };
  }

  try {
    const [manifest, animations] = await Promise.all([
      fetchJson(assetRecord.orbitManifestations),
      fetchJson(assetRecord.animations)
    ]);
    if (
      manifest?.schemaVersion !== 1 ||
      manifest?.companionId !== companionId
    ) {
      return { ready: false, stage: formalStage, status: "manifest_invalid" };
    }
    const stageAsset = manifest.formalStages?.[formalStage];
    if (
      stageAsset?.status !== "runtime-ready" ||
      stageAsset?.renderMode !== "illustrated-self-projection" ||
      stageAsset?.collisionCarrier !== "outer-resonance-field"
    ) {
      return { ready: false, stage: formalStage, status: "stage_asset_missing" };
    }
    const animation = animations?.[stageAsset.animationId];
    if (
      !animation ||
      animation.frameWidth !== 512 ||
      animation.frameHeight !== 512 ||
      animation.frameCount !== animation.rows * animation.columns ||
      animation.anchor?.x !== 0.5 ||
      animation.anchor?.y !== 1 ||
      typeof animation.sheet !== "string" ||
      animation.sheet.includes("/assets/reference/")
    ) {
      return { ready: false, stage: formalStage, status: "animation_invalid" };
    }
    const image = await loadImage(animation.sheet);
    if (
      image.naturalWidth !== animation.frameWidth * animation.columns ||
      image.naturalHeight !== animation.frameHeight * animation.rows ||
      image.naturalWidth > 4096 ||
      image.naturalHeight > 4096
    ) {
      return { ready: false, stage: formalStage, status: "sheet_invalid" };
    }
    const frames = buildMipFrames(image, animation);
    return {
      ready: true,
      stage: formalStage,
      status: "runtime-ready",
      animationId: stageAsset.animationId,
      renderAsset: Object.freeze({
        companionId,
        formalStage,
        frames: Object.freeze(frames),
        fps: Number.isFinite(animation.fps) ? animation.fps : 3,
        frameCount: animation.frameCount,
        mipFrameSize: MIP_FRAME_SIZE,
        sourceDecodedBytes: image.naturalWidth * image.naturalHeight * 4,
        mipDecodedBytes:
          MIP_FRAME_SIZE * MIP_FRAME_SIZE * 4 * animation.frameCount
      })
    };
  } catch (error) {
    return {
      ready: false,
      stage: formalStage,
      status: "load_failed",
      reason: error?.message || "load_failed"
    };
  }
}

export function loadOrbitManifestationAsset(input) {
  const key = [
    input?.companionId || "",
    input?.formalStage || "",
    input?.assetRecord?.orbitManifestations || ""
  ].join("|");
  if (activeLoadKey === key && activeLoadPromise) return activeLoadPromise;
  activeLoadKey = key;
  activeLoadPromise = loadAsset(input);
  return activeLoadPromise;
}

export function clearOrbitManifestationAsset() {
  activeLoadKey = null;
  activeLoadPromise = null;
}

export function drawOrbitManifestation(
  ctx,
  renderAsset,
  {
    x,
    y,
    radius,
    elapsed = 0,
    reducedMotion = false,
    wobbleAngle = 0,
    alpha = 1
  }
) {
  if (!ctx || !renderAsset?.frames?.length) return false;
  const frameIndex = reducedMotion
    ? 0
    : Math.floor(elapsed * renderAsset.fps) % renderAsset.frameCount;
  const frame = renderAsset.frames[frameIndex] || renderAsset.frames[0];
  const size = Math.max(42, radius * 3.05);
  const baselineY = y + radius * 0.72;
  ctx.save();
  ctx.translate(x, baselineY);
  if (!reducedMotion) ctx.rotate(wobbleAngle * 0.22);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(frame, -size * 0.5, -size, size, size);
  ctx.restore();
  return true;
}
