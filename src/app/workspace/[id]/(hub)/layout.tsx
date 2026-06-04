"use client";

import { type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { HubSidebar } from "@/features/workspaces/components/hub-sidebar";

/**
 * Hub chrome shared by the overview / people / settings sub-routes.
 * Blueprint "mission control" shell. The canvas (`graphs`) lives outside
 * this group and renders full-screen.
 */
export default function HubLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === id));

  return (
    <div className="hub-shell">
      <span className="hub-corner tl" />
      <span className="hub-corner tr" />
      <span className="hub-corner bl" />
      <span className="hub-corner br" />

      <HubSidebar
        workspaceId={id}
        workspaceName={workspace?.name ?? "Workspace"}
        accentColor={workspace?.accentColor ?? "var(--accent)"}
      />
      <main className="hub-main">{children}</main>
    </div>
  );
}
