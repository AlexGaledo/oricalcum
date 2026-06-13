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
  isSelected: boolean;
  /** Focus mode: edge doesn't touch the focused node — fade it back. */
  dimmed?: boolean;
  onClick: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
}

export function EdgeBezier({
  edge,
  a,
  b,
  animated,
  style,
  speed,
  isSelected,
  dimmed = false,
  onClick,
  onContextMenu,
}: EdgeBezierProps) {
  const dur = (110 - speed) / 30;
  const sp = getPortPosition(a, edge.fromPort);
  const tp = getPortPosition(b, edge.toPort);
  const d = edgePath(sp.x, sp.y, edge.fromPort, tp.x, tp.y, edge.toPort);
  const cls = cn(
    "edge-line",
    animated && style === "flow" && "style-flow",
    animated && style === "pulse" && "style-pulse",
    isSelected && "is-selected",
    dimmed && "is-dim-edge",
  );
  const gradientId = `edge-grad-${edge.id}`;
  const lineStyle: React.CSSProperties = {
    "--connect-duration": `${dur}s`,
    // Synaptic gradient: bright at the center of the run, fading into the
    // ports. Selected edges fall back to the solid CSS stroke for clarity.
    ...(isSelected ? {} : { stroke: `url(#${gradientId})` }),
  } as React.CSSProperties;
  return (
    <g>
      {!isSelected && (
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={sp.x}
            y1={sp.y}
            x2={tp.x}
            y2={tp.y}
          >
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="0.5" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      )}
      <path
        d={d}
        stroke="transparent"
        strokeWidth={14}
        fill="none"
        className="edge-hit"
        onClick={onClick}
        onContextMenu={onContextMenu}
        style={{ cursor: "pointer" }}
      />
      <path className={cls} d={d} style={lineStyle} onClick={onClick} onContextMenu={onContextMenu} />
      {animated && !dimmed && style === "flow" && (
        <circle r="2.4" className="edge-spark">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} rotate="auto" />
        </circle>
      )}
      {animated && style === "orbit" && (
        <circle r="3.5" className="edge-orbit">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} rotate="auto" />
        </circle>
      )}
    </g>
  );
}
