"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Canvas, Minimap } from "@/features/canvas";
import { SpawnGhost } from "@/features/nodes";
import { EditorPanel } from "@/features/documents";
import { FileExplorer } from "@/features/files";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { ContextMenu } from "@/shared/components/ui/context-menu";
import {
  Topbar,
  Toolbar,
  StatusBar,
  ConnectBanner,
  OricalcumTweaks,
  VisibilityMenu,
} from "@/features/toolbar";
import { AiInputBar } from "@/features/ai-input";
import { CalendarView } from "@/features/calendar";
import { AssistantPanel } from "@/features/assistant";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { usePersistence } from "@/features/canvas/hooks/use-persistence";
import { fetchProject, createProject } from "@/data/api/endpoints/projects.api";
import { ApiError } from "@/data/api/api.types";
import { supabase } from "@/lib/supabase";

export default function GraphsCanvasPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === id));
  const [authed, setAuthed] = useState(false);
  const [projectSynced, setProjectSynced] = useState(false);

  // explicit auth guard — redirect to login if no session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      } else {
        setAuthed(true);
      }
    });
  }, [router]);

  // sync workspace to backend as a project (seed if missing)
  useEffect(() => {
    if (!authed || !id) return;
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
  }, [authed, id, workspace?.name, workspace?.description]);

  usePersistence(projectSynced ? id : null);

  if (!authed) return null;

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

        <Canvas />
        <Topbar />
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
        <CalendarView />
        <AssistantPanel />
      </div>
      <ContextMenu />
    </>
  );
}
