"use client";

import { useFocusStore } from "@/features/canvas/store/focus.store";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { animateCameraTo, cameraForNode } from "@/features/canvas/utils/animate-camera";

/**
 * Breadcrumb of focus hops (node A › node B › …) pinned bottom-center.
 * Clicking an earlier step jumps focus back to it and truncates the trail.
 */
export function FocusTrail() {
  const trail = useFocusStore((s) => s.trail);
  const focusedId = useFocusStore((s) => s.focusedId);
  const hop = useFocusStore((s) => s.hop);
  const exit = useFocusStore((s) => s.exit);
  const returnCamera = useFocusStore((s) => s.returnCamera);
  const nodes = useNodeStore((s) => s.nodes);
  const setSelected = useNodeStore((s) => s.setSelected);

  if (!focusedId || trail.length === 0) return null;

  const titleOf = (id: string) =>
    nodes.find((n) => n.id === id)?.title?.trim() || "untitled";

  const jumpTo = (id: string) => {
    if (id === focusedId) return;
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    hop(id);
    setSelected(id);
    animateCameraTo(cameraForNode(node, useCanvasStore.getState().viewport));
  };

  return (
    <div className="focus-trail" role="navigation" aria-label="Focus trail">
      <button
        type="button"
        className="focus-trail-exit"
        title="Exit focus (Esc)"
        onClick={() => {
          exit();
          if (returnCamera) animateCameraTo(returnCamera);
        }}
      >
        ×
      </button>
      {trail.map((id, i) => (
        <span key={`${id}-${i}`} className="focus-trail-step">
          {i > 0 && <span className="focus-trail-sep">›</span>}
          <button
            type="button"
            className="focus-trail-chip"
            data-current={id === focusedId ? "1" : "0"}
            onClick={() => jumpTo(id)}
          >
            {titleOf(id)}
          </button>
        </span>
      ))}
    </div>
  );
}
