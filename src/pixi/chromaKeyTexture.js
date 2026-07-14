const DEFAULT_MAGENTA_KEY = Object.freeze({ r: 255, g: 0, b: 255 });
// 洋紅底道具常見抗鋸齒 fringe：提高容差 + despill，避免紅／洋紅邊
const DEFAULT_TOLERANCE = 58;
const DEFAULT_FEATHER = 2.15;
const DEFAULT_DESPILL = 0.82;

function loadImageElement(texturePath) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${texturePath}`));
    image.src = texturePath;
  });
}

function colorDistance(r, g, b, key) {
  const dr = r - key.r;
  const dg = g - key.g;
  const db = b - key.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 洋紅 spill：邊緣像素被 #FF00FF 染紅時，把過量的 R/B 拉回接近 G，
 * 減少「去背後還留一圈紅邊」的問題。
 */
function despillMagenta(r, g, b, strength) {
  const excess = Math.min(r, b) - g;
  if (excess <= 0) {
    return [r, g, b];
  }
  const pull = excess * strength;
  return [
    Math.max(0, Math.round(r - pull)),
    g,
    Math.max(0, Math.round(b - pull))
  ];
}

/**
 * 將洋紅底（#FF00FF）道具圖轉成透明紋理，供 Pixi 場景快速整合。
 * - 近 key 色：直接透明
 * - soft edge：羽化 alpha
 * - 其餘邊緣：despill 去掉洋紅 fringe
 * 正式版仍建議預處理成透明 PNG（見 tools/preprocess-magenta-props.mjs）。
 */
export async function loadChromaKeyedTexture(texturePath, options = {}) {
  if (!window.PIXI) {
    throw new Error("PixiJS is not available on window.PIXI");
  }

  const keyColor = options.keyColor ?? DEFAULT_MAGENTA_KEY;
  const tolerance = Number(options.tolerance ?? DEFAULT_TOLERANCE);
  const feather = Number(options.feather ?? DEFAULT_FEATHER);
  const despill = Number(options.despill ?? DEFAULT_DESPILL);
  const image = await loadImageElement(texturePath);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const softEdge = tolerance * feather;

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const distance = colorDistance(r, g, b, keyColor);

    if (distance <= tolerance) {
      pixels[index + 3] = 0;
      continue;
    }

    if (distance <= softEdge) {
      const blend = (distance - tolerance) / Math.max(1, softEdge - tolerance);
      const [nr, ng, nb] = despillMagenta(r, g, b, despill);
      pixels[index] = nr;
      pixels[index + 1] = ng;
      pixels[index + 2] = nb;
      pixels[index + 3] = Math.round(pixels[index + 3] * Math.min(1, blend));
      continue;
    }

    // 稍遠但仍帶洋紅 spill 的像素（常見於深色剪影邊緣）
    const [nr, ng, nb] = despillMagenta(r, g, b, despill * 0.55);
    pixels[index] = nr;
    pixels[index + 1] = ng;
    pixels[index + 2] = nb;
  }

  context.putImageData(imageData, 0, 0);
  return PIXI.Texture.from(canvas);
}
