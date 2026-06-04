"use client";

import { type ReactNode } from "react";
import { useParams } from "next/navigation";
import { WorkspaceSidebar } from "@/features/navigation/components/workspace-sidebar";
import { Breadcrumbs } from "@/features/navigation/components/breadcrumbs";

/**
 * Hub chrome shared by the overview / people / settings / chatspace sub-routes.
 * Uses a Notion-style collapsible sidebar + breadcrumbs.
 */
export default function HubLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="hub-shell">
      <WorkspaceSidebar workspaceId={id} />
      <div className="hub-content">
        <div className="hub-breadcrumb-bar">
          <Breadcrumbs workspaceId={id} />
        </div>
        <main className="hub-main">{children}</main>
      </div>
    </div>
  );
}
