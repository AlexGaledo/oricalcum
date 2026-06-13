"use client";

import { useMemo, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { hexToRgb } from "@/shared/lib/hex-to-rgb";
import type { OriNode, PortSide } from "@/shared/types";
import { NodeShapeBg } from "./node-shapes";

interface NodeCardProps {
  node: OriNode;
  isSelected: boolean;
  isConnectSource: boolean;
  isDragging: boolean;
  floating: boolean;
  pulsing: boolean;
  /** Skill-tree focus mode: this node's role, or null when focus is inactive. */
  focusState: "focus" | "neighbor" | "dim" | null;
  onPointerDown: (e: MouseEvent) => void;
  onDoubleClick: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
  onPortDown: (e: MouseEvent, side: PortSide) => void;
  onResizeDown: (e: MouseEvent) => void;
}

const PORT_SIDES: PortSide[] = ["top", "right", "bottom", "left"];

export function NodeCard({
  node, isSelected, isConnectSource, isDragging, floating, pulsing, focusState,
  onPointerDown, onDoubleClick, onContextMenu, onPortDown, onResizeDown,
}: NodeCardProps) {
  const hasShapeBg =
    node.shape === "hexagon" || node.shape === "diamond" || node.shape === "cloud";

  const shouldFloat = floating && !isDragging;
  const shouldPulse = pulsing && !isDragging;

  const nodeStyle = useMemo(() => {
    const s: Record<string, string | number> = {
      left: node.x, top: node.y, width: node.w, height: node.h,
      // Gives the hover tilt real vanishing-point depth (framer-motion key).
      transformPerspective: 700,
    };
    if (hasShapeBg) {
      s.borderColor = "transparent";
      s.background = "transparent";
      s.boxShadow = "none";
    }
    if (node.color) {
      const [r, g, b] = hexToRgb(node.color);
      s["--accent" as string] = node.color;
      s["--accent-rgb" as string] = `${r}, ${g}, ${b}`;
    }
    if (node.opacity != null) {
      s.opacity = node.opacity / 100;
    }
    return s;
  }, [node.x, node.y, node.w, node.h, node.color, node.opacity, hasShapeBg]);

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: node.opacity != null ? node.opacity / 100 : 1,
        scale: shouldPulse ? [1, 1.03, 1] : 1,
        y: shouldFloat ? [0, -6, 0, 4, 0] : 0,
        rotate: shouldFloat ? [0, 1, 0, -1, 0] : 0,
      }}
      whileHover={
        isDragging
          ? undefined
          : { rotateX: 2.2, rotateY: -2.4, transition: { duration: 0.18 } }
      }
      transition={{
        opacity: { duration: 0.16, ease: [0.3, 0.7, 0.4, 1] },
        scale: shouldPulse ? { duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" } : { duration: 0.16 },
        y: shouldFloat ? { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" } : { duration: 0.16 },
        rotate: shouldFloat ? { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" } : { duration: 0.16 },
      }}
      className={cn(
        "node",
        isSelected && "is-selected",
        isConnectSource && "is-connect-source",
        isDragging && "is-dragging",
        focusState === "focus" && "is-focus",
        focusState === "neighbor" && "is-neighbor",
        focusState === "dim" && "is-dim",
      )}
      data-shape={node.shape}
      data-id={node.id}
      style={nodeStyle}
      onMouseDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <NodeShapeBg shape={node.shape} width={node.w} height={node.h} />
      <span className="node-inner">{node.title || "untitled"}</span>
      {PORT_SIDES.map((side) => (
        <span
          key={side}
          className={`node-port ${side}`}
          data-port={side}
          onMouseDown={(e) => onPortDown(e, side)}
        />
      ))}
      {isSelected && !isDragging && (
        <span
          className="node-resize-handle"
          onMouseDown={onResizeDown}
        />
      )}
    </motion.div>
  );
}
