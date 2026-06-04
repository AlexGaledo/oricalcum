"use client";

import { useEffect, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";

/**
 * Workspace shell layout. Resolves the active workspace from the URL param
 * (replacing the old store-only `activeId` flow) so every hub sub-route
 * (overview / people / settings / graphs) operates on the right workspace.
 * Auth is enforced globally by AuthProvider.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const loadWorkspace = useWorkspacesStore((s) => s.loadWorkspace);

  useEffect(() => {
    if (id) loadWorkspace(id);
  }, [id, loadWorkspace]);

  return <>{children}</>;
}
