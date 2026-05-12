"use client";

import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { useThemeStore } from "@/features/themes/store/theme.store";

export function ConnectBanner() {
  const tool = useCanvasStore((s) => s.tool);
  const drag = useCanvasStore((s) => s.drag);
  const setTool = useCanvasStore((s) => s.setTool);
  const setDrag = useCanvasStore((s) => s.setDrag);
  const hideAll = useThemeStore((s) => s.hideAllUi);

  const visible = (tool === "connect" || drag?.kind === "connect") && !hideAll;
  if (!visible) return null;

  return (
    <div className="connect-banner">
      <span className="pulse" />
      Connect mode · click source, drag to target
      <button
        type="button"
        className="esc"
        onClick={() => {
          setTool("select");
          setDrag(null);
        }}
      >
        ESC
      </button>
    </div>
  );
}
