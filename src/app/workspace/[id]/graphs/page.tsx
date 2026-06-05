"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Canvas, Minimap } from "@/features/canvas";
import { SpawnGhost } from "@/features/nodes";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import {
  Topbar,
  Toolbar,
  StatusBar,
  ConnectBanner,
} from "@/features/toolbar";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useCanvasStore } from "@/features/canvas/store/canvas.store";
import { usePersistence } from "@/features/canvas/hooks/use-persistence";
import { fetchProject, createProject } from "@/data/api/endpoints/projects.api";
import { ApiError } from "@/data/api/api.types";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

/* ── Heavy overlay / panel components loaded on demand ───────── */
const EditorPanel = dynamic(() => import("@/features/documents").then((m) => ({ default: m.EditorPanel })), {
  ssr: false,
});
const FileExplorer = dynamic(() => import("@/features/files").then((m) => ({ default: m.FileExplorer })), {
  ssr: false,
});
const OricalcumTweaks = dynamic(() => import("@/features/toolbar").then((m) => ({ default: m.OricalcumTweaks })), {
  ssr: false,
});
const VisibilityMenu = dynamic(() => import("@/features/toolbar").then((m) => ({ default: m.VisibilityMenu })), {
  ssr: false,
});
const AiInputBar = dynamic(() => import("@/features/ai-input").then((m) => ({ default: m.AiInputBar })), {
  ssr: false,
});
const AssistantPanel = dynamic(() => import("@/features/assistant").then((m) => ({ default: m.AssistantPanel })), {
  ssr: false,
});
const ContextMenu = dynamic(() => import("@/shared/components/ui/context-menu").then((m) => ({ default: m.ContextMenu })), {
  ssr: false,
});

export default function GraphsCanvasPage() {
  const { id } = useParams<{ id: string }>();
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === id));
  const isMobile = useIsMobile();
  const fileTreeOpen = useCanvasStore((s) => s.fileTreeOpen);
  const setFileTreeOpen = useCanvasStore((s) => s.setFileTreeOpen);
  const [projectSynced, setProjectSynced] = useState(false);

  // sync workspace to backend as a project (seed if missing)
  useEffect(() => {
    if (!id) return;
    setProjectSynced(false);

    fetchProject(id)
      .then(() => setProjectSynced(true))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          createProject({
            id,
            name: workspace?.name ?? "Untitled",
            description: workspace?.description ?? "",
          })
            .then(() => setProjectSynced(true))
            .catch(console.error);
        } else {
          console.error("Failed to sync project:", err);
        }
      });
  }, [id, workspace?.name, workspace?.description]);

  usePersistence(projectSynced ? id : null);

  return (
    <>
      <LoadingScreen />
      <div className="app">
        <div className="reticles">
          <span className="reticle tl" />
          <span className="reticle tr" />
          <span className="reticle bl" />
          <span className="reticle br" />
        </div>

        <Canvas readOnly={isMobile} />
        <Topbar />
        {/* Scrim for the file-explorer drawer on mobile */}
        {isMobile && fileTreeOpen && (
          <div
            className="canvas-drawer-scrim"
            onClick={() => setFileTreeOpen(false)}
            aria-hidden="true"
          />
        )}
        <FileExplorer />
        <Toolbar />
        <ConnectBanner />
        <StatusBar />
        <Minimap />
        <SpawnGhost />
        <EditorPanel />
        <OricalcumTweaks />
        <VisibilityMenu />
        <AiInputBar />
        <AssistantPanel />
      </div>
      <ContextMenu />
    </>
  );
}
