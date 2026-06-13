"use client";

import { motion } from "framer-motion";
import type { OriNode } from "@/shared/types";
import {
  ExpandIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
} from "@/shared/components/icons";

interface FocusRingProps {
  node: OriNode;
  onEdit: () => void;
  onConnect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const PAD = 26;

/**
 * Radial action ring around the focused node (skill-tree style): edit on top,
 * connect right, duplicate left, delete bottom. Lives in stage space so it
 * tracks the node through camera moves.
 */
export function FocusRing({ node, onEdit, onConnect, onDuplicate, onDelete }: FocusRingProps) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <motion.div
      className="focus-ring"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: [0.3, 0.7, 0.4, 1] }}
      style={{
        left: node.x - PAD,
        top: node.y - PAD,
        width: node.w + PAD * 2,
        height: node.h + PAD * 2,
      }}
      onMouseDown={stop}
    >
      <button type="button" className="focus-ring-btn top" title="Edit content" onClick={onEdit}>
        <ExpandIcon />
      </button>
      <button type="button" className="focus-ring-btn right" title="Connect" onClick={onConnect}>
        <LinkIcon />
      </button>
      <button type="button" className="focus-ring-btn left" title="Duplicate" onClick={onDuplicate}>
        <PlusIcon />
      </button>
      <button type="button" className="focus-ring-btn bottom is-danger" title="Delete node" onClick={onDelete}>
        <TrashIcon />
      </button>
    </motion.div>
  );
}
