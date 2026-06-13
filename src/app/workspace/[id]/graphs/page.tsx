"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Canvas, Minimap, SyncPulse, OrbConsoleLazy } from "@/features/canvas";
import type { OrbNodeDot } from "@/features/canvas";
import { useNodeStore } from "@/features/nodes/store/node.store";
import { useThemeStore } from "@/features/themes/store/theme.store";
import { useAssistantStore } from "@/features/assistant/store/assistant.store";
import { useFocusStore } from "@/features/canvas/store/focus.store";
import { animateCameraTo, cameraForNode } from "@/features/canvas/utils/animate-camera";
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
import { useFilesStore } from "@/features/files/store/files.store";
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
  const hydrateFiles = useFilesStore((s) => s.hydrate);
  const activeFileId = useFilesStore((s) => s.activeFileId);
  const filesLoaded = useFilesStore((s) => s.loaded);

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

  // Once the project exists, hydrate its nodespace tree from the backend.
  useEffect(() => {
    if (projectSynced && id) hydrateFiles(id);
  }, [projectSynced, id, hydrateFiles]);

  usePersistence(projectSynced && filesLoaded ? id : null, activeFileId);

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
        <SyncPulse />
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
        <AssistantPanel />
        <NodespaceOrb />
      </div>
      <ContextMenu />
    </>
  );
}

/**
 * Bottom-right orb: AI presence (pulses while the assistant streams), chat
 * trigger (click body → toggle the assistant), and graph navigator (click a
 * node-dot → fly the camera + focus it). Replaces the old floating prompt bar
 * and the spark FAB.
 */
function NodespaceOrb() {
  const accent = useThemeStore((s) => s.accent);
  const nodes = useNodeStore((s) => s.nodes);
  const streaming = useAssistantStore((s) => s.streaming);
  // The doc panel shares the bottom-right corner — hide the orb while editing.
  const openDocId = useCanvasStore((s) => s.openDocId);

  const dots = useMemo<OrbNodeDot[]>(
    () => nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, title: n.title })),
    [nodes],
  );

  const onNavigate = useCallback((nodeId: string) => {
    const node = useNodeStore.getState().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const fs = useFocusStore.getState();
    const cs = useCanvasStore.getState();
    if (fs.focusedId === null) fs.enter(nodeId, { ...cs.camera });
    else if (fs.focusedId !== nodeId) fs.hop(nodeId);
    animateCameraTo(cameraForNode(node, cs.viewport));
  }, []);

  const onToggleChat = useCallback(() => useAssistantStore.getState().toggle(), []);

  if (openDocId) return null;

  return (
    <OrbConsoleLazy
      accent={accent}
      nodes={dots}
      active={streaming}
      onNavigate={onNavigate}
      onToggleChat={onToggleChat}
    />
  );
}
