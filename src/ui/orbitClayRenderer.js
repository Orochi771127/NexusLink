const FOUNDATION_IMAGES = new Map();

function getFoundationImage(src) {
  if (!src || typeof Image === "undefined") return null;
  if (FOUNDATION_IMAGES.has(src)) return FOUNDATION_IMAGES.get(src);
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  FOUNDATION_IMAGES.set(src, image);
  return image;
}

function drawImageCover(ctx, image, width, height, focalY = 0.5) {
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return false;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceW = width / scale;
  const sourceH = height / scale;
  const sourceX = Math.max(0, (image.naturalWidth - sourceW) * 0.5);
  const sourceY = Math.max(
    0,
    Math.min(image.naturalHeight - sourceH, image.naturalHeight * focalY - sourceH * 0.5)
  );
  ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, width, height);
  return true;
}

export function preloadOrbitGameplaySkin(profile) {
  return getFoundationImage(profile?.assetSlots?.foundation);
}

function drawClayMound(ctx, x, y, rx, ry, base, light, shadow) {
  ctx.save();
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(x + rx * 0.08, y + ry * 0.16, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.34;
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.22, y - ry * 0.28, rx * 0.54, ry * 0.34, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFoliageCluster(ctx, x, y, size, palette) {
  const offsets = [
    [-0.55, 0.04, 0.58],
    [0, -0.28, 0.7],
    [0.55, 0.04, 0.58],
    [-0.24, 0.34, 0.54],
    [0.27, 0.34, 0.54]
  ];
  ctx.save();
  ctx.fillStyle = palette.shadow;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.08, y + size * 0.42, size * 0.9, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  offsets.forEach(([ox, oy, scale], index) => {
    ctx.fillStyle = index === 1 ? palette.foliageLight : palette.foliage;
    ctx.beginPath();
    ctx.arc(x + ox * size, y + oy * size, size * scale, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "rgba(238, 232, 188, 0.7)";
  for (let i = 0; i < 3; i += 1) {
    const angle = i * 2.2 + 0.4;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * size * 0.55, y + Math.sin(angle) * size * 0.36, Math.max(1, size * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWaterfall(ctx, x, topY, bottomY, width, palette) {
  const gradient = ctx.createLinearGradient(x - width / 2, topY, x + width / 2, topY);
  gradient.addColorStop(0, "rgba(112, 221, 232, 0.16)");
  gradient.addColorStop(0.45, "rgba(210, 251, 248, 0.86)");
  gradient.addColorStop(1, "rgba(72, 179, 203, 0.22)");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, topY, width, bottomY - topY, width * 0.42);
  ctx.fill();
  ctx.fillStyle = palette.resinLight;
  ctx.globalAlpha = 0.26;
  ctx.beginPath();
  ctx.ellipse(x, bottomY, width * 0.85, width * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAmbientMotes(ctx, width, height, profile, time, reducedMotion) {
  const count = profile.ambient?.moteCount || 0;
  const t = reducedMotion ? 0 : time;
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const seed = i + 1;
    const x = ((seed * 73) % 101) / 101 * width;
    const baseY = (((seed * 47) % 97) / 97) * height;
    const y = baseY + Math.sin(t * 0.65 + seed) * 4;
    const radius = 0.8 + (seed % 3) * 0.45;
    ctx.fillStyle = i % 3 === 0 ? profile.palette.gold : profile.palette.cyan;
    ctx.globalAlpha = 0.28 + (seed % 4) * 0.08;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStoneRim(ctx, centerX, centerY, radius, profile) {
  const { palette } = profile;
  const count = profile.arena?.rimStoneCount || 18;
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius * 1.045;
    const y = centerY + Math.sin(angle) * radius * 1.045;
    const stoneW = Math.max(8, radius * 0.13);
    const stoneH = Math.max(5, radius * 0.072);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(1.5, 2.5, stoneW * 0.52, stoneH * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? palette.clayStone : palette.clayStoneLight;
    ctx.beginPath();
    ctx.ellipse(0, 0, stoneW * 0.5, stoneH * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draws presentation only. Arena radius and every gameplay marker still come
 * from the simulation snapshot owned by the caller.
 */
export function drawOrbitClayArena(ctx, {
  width,
  height,
  centerX,
  centerY,
  arenaRadius,
  profile,
  time = 0,
  reducedMotion = false
}) {
  const { palette } = profile;
  const foundation = getFoundationImage(profile.assetSlots?.foundation);
  const foundationReady = drawImageCover(
    ctx,
    foundation,
    width,
    height,
    profile.assetSlots?.foundationFocalY ?? 0.5
  );
  if (foundationReady) {
    const vignette = ctx.createLinearGradient(0, 0, 0, height);
    vignette.addColorStop(0, "rgba(18, 48, 55, 0.04)");
    vignette.addColorStop(0.72, "rgba(12, 55, 62, 0)");
    vignette.addColorStop(1, "rgba(12, 38, 43, 0.12)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    drawAmbientMotes(ctx, width, height, profile, time, reducedMotion);
    return true;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(0.42, palette.skyBottom);
  sky.addColorStop(1, palette.resinDeep);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const cliffY = height * 0.18;
  drawClayMound(ctx, width * 0.08, cliffY, width * 0.25, height * 0.3, palette.distantClay, palette.distantClayLight, palette.shadow);
  drawClayMound(ctx, width * 0.92, cliffY, width * 0.25, height * 0.3, palette.distantClay, palette.distantClayLight, palette.shadow);
  if ((profile.ambient?.waterfallCount || 0) > 0) {
    drawWaterfall(ctx, width * 0.13, height * 0.01, height * 0.34, width * 0.07, palette);
    drawWaterfall(ctx, width * 0.87, height * 0.01, height * 0.34, width * 0.07, palette);
  }

  drawFoliageCluster(ctx, width * 0.06, height * 0.29, Math.max(9, width * 0.035), palette);
  drawFoliageCluster(ctx, width * 0.94, height * 0.27, Math.max(10, width * 0.04), palette);
  drawFoliageCluster(ctx, width * 0.05, height * 0.8, Math.max(11, width * 0.042), palette);
  drawFoliageCluster(ctx, width * 0.95, height * 0.82, Math.max(11, width * 0.042), palette);

  ctx.save();
  ctx.fillStyle = palette.shadow;
  ctx.globalAlpha = profile.arena?.outerShadowAlpha ?? 0.28;
  ctx.beginPath();
  ctx.ellipse(centerX + arenaRadius * 0.035, centerY + arenaRadius * 0.075, arenaRadius * 1.08, arenaRadius * 1.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawStoneRim(ctx, centerX, centerY, arenaRadius, profile);

  const resin = ctx.createRadialGradient(
    centerX - arenaRadius * 0.28,
    centerY - arenaRadius * 0.34,
    arenaRadius * 0.08,
    centerX,
    centerY,
    arenaRadius
  );
  resin.addColorStop(0, palette.resinLight);
  resin.addColorStop(0.46, palette.resinMid);
  resin.addColorStop(1, palette.resinDeep);
  ctx.save();
  ctx.globalAlpha = profile.arena?.resinAlpha ?? 0.92;
  ctx.fillStyle = resin;
  ctx.beginPath();
  ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = palette.clayStoneLight;
  ctx.globalAlpha = profile.arena?.contactRingAlpha ?? 0.82;
  ctx.lineWidth = Math.max(3, arenaRadius * 0.035);
  ctx.beginPath();
  ctx.arc(centerX, centerY, arenaRadius * 1.006, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = palette.gold;
  ctx.globalAlpha = 0.62;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, arenaRadius * 0.965, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawAmbientMotes(ctx, width, height, profile, time, reducedMotion);
  return false;
}

export function drawOrbitClayBody(ctx, {
  x,
  y,
  radius,
  profile,
  variant = "player",
  spinAngle = 0,
  tilt = 0,
  wobbleAngle = 0,
  label = ""
}) {
  const { palette } = profile;
  const isPlayer = variant === "player";
  const core = isPlayer ? palette.cyan : palette.gold;
  const deep = isPlayer ? palette.resinDeep : "#b88745";

  ctx.save();
  ctx.fillStyle = palette.shadow;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.ellipse(x + radius * 0.12, y + radius * 0.58, radius * 0.92, radius * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const fill = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.4,
    radius * 0.06,
    x,
    y,
    radius
  );
  fill.addColorStop(0, "rgba(244, 255, 255, 0.96)");
  fill.addColorStop(0.35, core);
  fill.addColorStop(1, deep);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(wobbleAngle);
  ctx.scale(1 + tilt * 0.22, 1 - tilt * 0.28);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(239, 255, 255, 0.8)";
  ctx.lineWidth = Math.max(1.5, radius * 0.12);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(x - Math.cos(spinAngle) * radius * 0.7, y - Math.sin(spinAngle) * radius * 0.7);
  ctx.lineTo(x + Math.cos(spinAngle) * radius * 0.7, y + Math.sin(spinAngle) * radius * 0.7);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.lineWidth = Math.max(1.5, radius * 0.12);
  ctx.stroke();

  if (label) {
    ctx.fillStyle = profile.palette.text;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y - radius - 7);
  }
}
