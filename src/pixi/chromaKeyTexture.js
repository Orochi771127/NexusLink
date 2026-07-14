const DEFAULT_MAGENTA_KEY = Object.freeze({ r: 255, g: 0, b: 255 });
const DEFAULT_TOLERANCE = 42;
const DEFAULT_FEATHER = 1.75;

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
 * 將洋紅底（#FF00FF）道具圖轉成透明紋理，供 Pixi 場景快速整合。
 * 邊緣會做輕微羽化，減少硬切鋸齒；正式版仍建議預處理成透明 PNG。
 */
export async function loadChromaKeyedTexture(texturePath, options = {}) {
  if (!window.PIXI) {
    throw new Error("PixiJS is not available on window.PIXI");
  }

  const keyColor = options.keyColor ?? DEFAULT_MAGENTA_KEY;
  const tolerance = Number(options.tolerance ?? DEFAULT_TOLERANCE);
  const feather = Number(options.feather ?? DEFAULT_FEATHER);
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
    const distance = colorDistance(
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
      keyColor
    );

    if (distance <= tolerance) {
      pixels[index + 3] = 0;
      continue;
    }

    if (distance <= softEdge) {
      const blend = (distance - tolerance) / Math.max(1, softEdge - tolerance);
      pixels[index + 3] = Math.round(pixels[index + 3] * Math.min(1, blend));
    }
  }

  context.putImageData(imageData, 0, 0);
  return PIXI.Texture.from(canvas);
}
