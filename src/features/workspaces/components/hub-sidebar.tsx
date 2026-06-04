"use client";

import { useRouter, usePathname } from "next/navigation";
import { GridIcon, PeopleIcon, GearIcon, BackIcon, ChatIcon } from "@/shared/components/icons";

type HubSection = "overview" | "graphs" | "people" | "chatspace" | "settings";

interface Props {
  workspaceId: string;
  workspaceName: string;
  accentColor: string;
}

const ITEMS: { section: HubSection; label: string; icon: typeof GridIcon; path: string }[] = [
  { section: "graphs", label: "Graphs", icon: GridIcon, path: "graphs" },
  { section: "people", label: "People", icon: PeopleIcon, path: "people" },
  { section: "chatspace", label: "AI Chatspace", icon: ChatIcon, path: "chatspace" },
  { section: "settings", label: "Settings", icon: GearIcon, path: "settings" },
];

/** Left "instrument rail" for the workspace hub: return + brand + numbered sections. */
export function HubSidebar({ workspaceId, workspaceName, accentColor }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/workspace/${workspaceId}`;

  const active: HubSection = pathname.endsWith("/graphs")
    ? "graphs"
    : pathname.endsWith("/people")
      ? "people"
      : pathname.endsWith("/chatspace")
        ? "chatspace"
        : pathname.endsWith("/settings")
          ? "settings"
          : "overview";

  return (
    <nav className="hub-rail" aria-label="Workspace navigation">
      <div className="hub-rail-top">
        <button type="button" className="hub-return" onClick={() => router.push("/dashboard")}>
          <BackIcon />
          BACK TO DASHBOARD
        </button>

        <button type="button" className="hub-brand" onClick={() => router.push(base)} title={workspaceName}>
          <span className="hub-brand-hex" style={{ color: accentColor }}>
            <svg viewBox="0 0 30 30" fill="none" width="30" height="30">
              <path d="M8 3 L22 3 L27 15 L22 27 L8 27 L3 15 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="15" cy="15" r="3.4" fill="currentColor" />
            </svg>
          </span>
          <span className="hub-brand-meta">
            <span className="hub-brand-name">{workspaceName}</span>
            <span className="hub-brand-sub">WORKSPACE</span>
          </span>
        </button>
      </div>

      <div className="hub-rail-nav">
        {ITEMS.map(({ section, label, icon: Icon, path }, i) => (
          <button
            key={section}
            type="button"
            className="hub-rail-item"
            data-active={active === section ? "1" : "0"}
            onClick={() => router.push(`${base}/${path}`)}
            title={label}
            style={{ animationDelay: `${0.08 * i + 0.1}s` }}
          >
            <span className="hub-rail-tick" />
            <span className="hub-rail-index">{String(i + 1).padStart(2, "0")}</span>
            <Icon className="hub-rail-icon" />
            <span className="hub-rail-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="hub-rail-foot">
        <span className="hub-rail-foot-k">SECTOR</span>
        <span className="hub-rail-foot-v">{workspaceId.slice(0, 16)}</span>
      </div>
    </nav>
  );
}
