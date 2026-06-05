"use client";

import { type ReactNode } from "react";
import { useParams } from "next/navigation";
import { WorkspaceSidebar } from "@/features/navigation/components/workspace-sidebar";
import { Breadcrumbs } from "@/features/navigation/components/breadcrumbs";
import { useMobileNavStore } from "@/features/navigation/store/mobile-nav.store";

/**
 * Hub chrome shared by the overview / people / settings / chatspace sub-routes.
 * Uses a Notion-style collapsible sidebar + breadcrumbs. On phones the sidebar
 * collapses into a slide-in drawer toggled by the hamburger in the breadcrumb
 * bar; a scrim closes it.
 */
export default function HubLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const hubNavOpen = useMobileNavStore((s) => s.hubNavOpen);
  const toggleHubNav = useMobileNavStore((s) => s.toggleHubNav);
  const closeHubNav = useMobileNavStore((s) => s.closeHubNav);

  return (
    <div className="hub-shell" data-mobile-nav-open={hubNavOpen ? "1" : "0"}>
      <WorkspaceSidebar workspaceId={id} />
      {/* Scrim behind the mobile drawer */}
      <div
        className="hub-nav-scrim"
        onClick={closeHubNav}
        aria-hidden="true"
        data-visible={hubNavOpen ? "1" : "0"}
      />
      <div className="hub-content">
        <div className="hub-breadcrumb-bar">
          <button
            type="button"
            className="hub-nav-trigger"
            onClick={toggleHubNav}
            aria-label="Open navigation"
            aria-expanded={hubNavOpen}
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </button>
          <Breadcrumbs workspaceId={id} />
        </div>
        <main className="hub-main">{children}</main>
      </div>
    </div>
  );
}
