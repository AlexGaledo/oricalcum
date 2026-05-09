"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import type { OriNode } from "@/shared/types";
import { NodeShapeBg } from "./node-shapes";

interface NodeCardProps {
  node: OriNode;
  isSelected: boolean;
  isConnectSource: boolean;
  isDragging: boolean;
  onPointerDown: (e: MouseEvent) => void;
  onDoubleClick: (e: MouseEvent) => void;
  onPortDown: (e: MouseEvent, side: "l" | "r") => void;
}

export function NodeCard({
  node,
  isSelected,
  isConnectSource,
  isDragging,
  onPointerDown,
  onDoubleClick,
  onPortDown,
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
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        borderColor: hasShapeBg ? "transparent" : undefined,
        background: hasShapeBg ? "transparent" : undefined,
        boxShadow: hasShapeBg ? "none" : undefined,
      }}
      onMouseDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      <NodeShapeBg shape={node.shape} width={node.w} height={node.h} />
      <span className="node-inner">{node.title || "untitled"}</span>
      <span className="node-port l" onMouseDown={(e) => onPortDown(e, "l")} />
      <span className="node-port r" onMouseDown={(e) => onPortDown(e, "r")} />
    </motion.div>
  );
}
