import type { OriNode } from "@/shared/types";

export function edgePath(a: OriNode, b: OriNode): string {
  const ax = a.x + a.w;
  const ay = a.y + a.h / 2;
  const bx = b.x;
  const by = b.y + b.h / 2;
  const dx = Math.abs(bx - ax);
  const c = Math.max(40, dx * 0.5);
  return `M${ax} ${ay} C ${ax + c} ${ay}, ${bx - c} ${by}, ${bx} ${by}`;
}

export function freePath(ax: number, ay: number, bx: number, by: number): string {
  const dx = Math.abs(bx - ax);
  const c = Math.max(40, dx * 0.5);
  return `M${ax} ${ay} C ${ax + c} ${ay}, ${bx - c} ${by}, ${bx} ${by}`;
}
