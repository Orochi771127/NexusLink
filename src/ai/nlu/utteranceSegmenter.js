export function segmentUtterance(inputText = "") {
  const text = String(inputText || "").trim();
  if (!text) return [];

  const raw = text
    .split(/[。！？!?；;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (raw.length) return raw;

  return [text];
}