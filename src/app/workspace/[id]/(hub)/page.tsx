"use client";

import { useRouter, useParams } from "next/navigation";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { GridIcon, PeopleIcon, GearIcon } from "@/shared/components/icons";

const MODULES = [
  { key: "graphs", icon: GridIcon, name: "Graphs", desc: "Open the canvas and shape your nodes." },
  { key: "people", icon: PeopleIcon, name: "People", desc: "Manage collaborators on this workspace." },
  { key: "settings", icon: GearIcon, name: "Settings", desc: "Secrets, environment variables & metadata." },
] as const;

export default function WorkspaceOverviewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === id));
  const base = `/workspace/${id}`;

  const stats = [
    { val: workspace?.nodeCount ?? 0, lbl: "Nodes" },
    { val: workspace?.edges.length ?? 0, lbl: "Edges" },
    { val: workspace?.userCount ?? 1, lbl: "Crew" },
  ];

  return (
    <div className="hub-view">
      <div className="hub-eyebrow">// WORKSPACE_OVERVIEW</div>

      <header className="hub-hero">
        <div className="hub-eyebrow">ACTIVE SESSION</div>
        <h1 className="hub-hero-title">
          {workspace?.name ?? "Workspace"}
          <span className="hub-cursor" />
        </h1>
        <p className={`hub-hero-desc${workspace?.description ? "" : " is-empty"}`}>
          {workspace?.description || "— no description on file —"}
        </p>
      </header>

      <div className="hub-telemetry">
        {stats.map((s, i) => (
          <div key={s.lbl} className="hub-tele" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
            <span className="hub-tele-val">{String(s.val).padStart(2, "0")}</span>
            <span className="hub-tele-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      <div className="hub-label">Modules</div>
      <div className="hub-modules">
        {MODULES.map(({ key, icon: Icon, name, desc }, i) => (
          <button
            key={key}
            type="button"
            className="hub-module"
            onClick={() => router.push(`${base}/${key}`)}
            style={{ animationDelay: `${0.14 + i * 0.06}s` }}
          >
            <div className="hub-module-top">
              <span className="hub-module-index">{String(i + 1).padStart(2, "0")} /</span>
              <span className="hub-module-arrow">→</span>
            </div>
            <Icon className="hub-module-icon" />
            <div className="hub-module-name">{name}</div>
            <div className="hub-module-desc">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
