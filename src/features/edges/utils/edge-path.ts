import type { PortSide } from "@/shared/types";

function portDir(port: PortSide): [number, number] {
  switch (port) {
    case "right": return [1, 0];
    case "left": return [-1, 0];
    case "bottom": return [0, 1];
    case "top": return [0, -1];
  }
}

export function edgePath(
  sx: number, sy: number, sp: PortSide,
  tx: number, ty: number, tp: PortSide,
): string {
  const dx = Math.abs(tx - sx);
  const dy = Math.abs(ty - sy);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const c = Math.max(40, dist * 0.45);
  const [sdx, sdy] = portDir(sp);
  const [tdx, tdy] = portDir(tp);
  const c1x = sx + sdx * c;
  const c1y = sy + sdy * c;
  const c2x = tx + tdx * c;
  const c2y = ty + tdy * c;
  return `M${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
}

export function freePath(
  ax: number, ay: number,
  bx: number, by: number,
  ap?: PortSide,
  bp?: PortSide,
): string {
  const dx = Math.abs(bx - ax);
  const dy = Math.abs(by - ay);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const c = Math.max(40, dist * 0.45);
  const [sdx, sdy] = ap ? portDir(ap) : [dx > dy ? Math.sign(bx - ax) : 0, dy > dx ? Math.sign(by - ay) : 0];
  const [tdx, tdy] = bp ? portDir(bp) : [dx > dy ? Math.sign(ax - bx) : 0, dy > dx ? Math.sign(ay - by) : 0];
  const c1x = ax + sdx * c;
  const c1y = ay + sdy * c;
  const c2x = bx + tdx * c;
  const c2y = by + tdy * c;
  return `M${ax} ${ay} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${bx} ${by}`;
}
