import type { OriNode, PortSide } from "@/shared/types";

export function getPortPosition(node: OriNode, port: PortSide): { x: number; y: number } {
  switch (port) {
    case "top":
      return { x: node.x + node.w / 2, y: node.y };
    case "right":
      return { x: node.x + node.w, y: node.y + node.h / 2 };
    case "bottom":
      return { x: node.x + node.w / 2, y: node.y + node.h };
    case "left":
      return { x: node.x, y: node.y + node.h / 2 };
  }
}

const PORT_SIDES: PortSide[] = ["top", "right", "bottom", "left"];

export function getNearestPort(node: OriNode, px: number, py: number): PortSide {
  let best = "right" as PortSide;
  let bestDist = Infinity;
  for (const side of PORT_SIDES) {
    const p = getPortPosition(node, side);
    const d = (p.x - px) ** 2 + (p.y - py) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = side;
    }
  }
  return best;
}
