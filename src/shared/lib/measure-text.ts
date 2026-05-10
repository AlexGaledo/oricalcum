export function measureTextWidth(text: string): number {
  if (typeof document === "undefined") return 0;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = '12px "JetBrains Mono", ui-monospace, monospace';
  return ctx.measureText(text || "untitled").width;
}
