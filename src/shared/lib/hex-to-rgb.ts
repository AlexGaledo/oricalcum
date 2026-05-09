export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, "0");
  const n = parseInt(x.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function isLightHex(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return r * 299 + g * 587 + b * 114 > 148000;
}
