"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import type { OriNode, PortSide } from "@/shared/types";
import { NodeShapeBg } from "./node-shapes";

interface NodeCardProps {
  node: OriNode;
  isSelected: boolean;
  isConnectSource: boolean;
  isDragging: boolean;
  onPointerDown: (e: MouseEvent) => void;
  onDoubleClick: (e: MouseEvent) => void;
  onPortDown: (e: MouseEvent, side: PortSide) => void;
  onResizeDown: (e: MouseEvent) => void;
}

const PORT_SIDES: PortSide[] = ["top", "right", "bottom", "left"];

export function NodeCard({
  node, isSelected, isConnectSource, isDragging,
  onPointerDown, onDoubleClick, onPortDown, onResizeDown,
}: NodeCardProps) {
  const hasShapeBg =
    node.shape === "hexagon" || node.shape === "diamond" || node.shape === "cloud";
  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.3, 0.7, 0.4, 1] }}
      className={cn(
        "node",
        isSelected && "is-selected",
        isConnectSource && "is-connect-source",
        isDragging && "is-dragging",
      )}
      data-shape={node.shape}
      data-id={node.id}
      style={{
        left: node.x, top: node.y, width: node.w, height: node.h,
        borderColor: hasShapeBg ? "transparent" : undefined,
        background: hasShapeBg ? "transparent" : undefined,
        boxShadow: hasShapeBg ? "none" : undefined,
      }}
      onMouseDown={onPointerDown}
      onDoubleClick={onDoubleClick}
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
