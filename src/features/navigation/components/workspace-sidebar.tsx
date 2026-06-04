"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useCalendarStore } from "@/features/calendar/store/calendar.store";

type NavItem = {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

function makeNavItems(workspaceId: string, openCalendar: () => void): NavItem[] {
  const base = `/workspace/${workspaceId}`;
  return [
    {
      id: "overview",
      label: "Overview",
      path: base,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
          <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
          <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: "graphs",
      label: "Graphs",
      path: `${base}/graphs`,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="4" cy="4" r="2" />
          <circle cx="12" cy="4" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 4h4M4 6v4M12 6v4M6 12h4" />
        </svg>
      ),
    },
    {
      id: "storage",
      label: "Storage",
      path: `${base}/storage`,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1.5 4.5A1.5 1.5 0 013 3h2.5L7 4.5h6A1.5 1.5 0 0114.5 6v6.5A1.5 1.5 0 0113 14H3a1.5 1.5 0 01-1.5-1.5z" />
        </svg>
      ),
    },
    {
      id: "chatspace",
      label: "AI Chatspace",
      path: `${base}/chatspace`,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4.5a2.5 2.5 0 012.5-2.5h7a2.5 2.5 0 012.5 2.5v5a2.5 2.5 0 01-2.5 2.5H6l-3 2.5v-2.5h-.5A2.5 2.5 0 012 9.5z" />
        </svg>
      ),
    },
    {
      id: "people",
      label: "People",
      path: `${base}/people`,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="5" r="3" />
          <path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" />
        </svg>
      ),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
          <path d="M1.5 6.5h13M5 1v3M11 1v3" />
        </svg>
      ),
      onClick: openCalendar,
    },
    {
      id: "settings",
      label: "Settings",
      path: `${base}/settings`,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
        </svg>
      ),
    },
  ];
}

interface Props {
  workspaceId: string;
}

export function WorkspaceSidebar({ workspaceId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const [collapsed, setCollapsed] = useState(false);
  const openCalendar = useCalendarStore((s) => s.openCalendar);

  const navItems = makeNavItems(workspaceId, openCalendar);
  const activeId = navItems.find((item) => {
    if (!item.path) return false;
    if (item.path === `/workspace/${workspaceId}`) {
      return pathname === item.path;
    }
    return pathname.startsWith(item.path);
  })?.id ?? "overview";

  return (
    <aside
      className="ws-sidebar"
      data-collapsed={collapsed ? "1" : "0"}
      aria-label="Workspace sidebar"
    >
      {/* Header */}
      <div className="ws-sidebar-header">
        <button
          type="button"
          className="ws-sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {collapsed ? (
              <path d="M4 2h8M4 8h8M4 14h8" />
            ) : (
              <path d="M2 4h12M2 8h8M2 12h12" />
            )}
          </svg>
        </button>
        {!collapsed && (
          <div className="ws-sidebar-brand">
            <span className="ws-sidebar-mark">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M3 1 L9 1 L11 6 L9 11 L3 11 L1 6 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                <circle cx="6" cy="6" r="1.4" fill="currentColor" />
              </svg>
            </span>
            <span className="ws-sidebar-name" title={workspace?.name ?? "Workspace"}>
              {workspace?.name ?? "Workspace"}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="ws-sidebar-nav" aria-label="Workspace pages">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="ws-sidebar-item"
            data-active={activeId === item.id ? "1" : "0"}
            onClick={() => (item.onClick ? item.onClick() : router.push(item.path!))}
            title={item.label}
          >
            <span className="ws-sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="ws-sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="ws-sidebar-footer">
        <button
          type="button"
          className="ws-sidebar-item"
          onClick={() => router.push("/dashboard")}
          title="Back to dashboard"
        >
          <span className="ws-sidebar-icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </span>
          {!collapsed && <span className="ws-sidebar-label">Dashboard</span>}
        </button>
      </div>
    </aside>
  );
}
