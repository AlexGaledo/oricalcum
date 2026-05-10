"use client";

import type { MouseEvent } from "react";
import { cn } from "@/shared/lib/cn";
import type { EdgeAnimationStyle, OriEdge, OriNode } from "@/shared/types";
import { getPortPosition } from "@/features/nodes/utils/port-positions";
import { edgePath } from "../utils/edge-path";

interface EdgeBezierProps {
  edge: OriEdge;
  a: OriNode;
  b: OriNode;
  animated: boolean;
  style: EdgeAnimationStyle;
  speed: number;
  onClick: (e: MouseEvent) => void;
}

export function EdgeBezier({
  edge,
  a,
  b,
  animated,
  style,
  speed,
  onClick,
}: EdgeBezierProps) {
  const dur = (110 - speed) / 30;
  const sp = getPortPosition(a, edge.fromPort);
  const tp = getPortPosition(b, edge.toPort);
  const d = edgePath(sp.x, sp.y, edge.fromPort, tp.x, tp.y, edge.toPort);
  const cls = cn(
    "edge-line",
    animated && style === "flow" && "style-flow",
    animated && style === "pulse" && "style-pulse",
  );
  const cssVars = { "--connect-duration": `${dur}s` } as React.CSSProperties;
  return (
    <g>
      <path className={cls} d={d} style={cssVars} onClick={onClick} />
      {animated && style === "orbit" && (
        <circle r="3.5" className="edge-orbit">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} rotate="auto" />
        </circle>
      )}
    </g>
  );
}
