"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { WorkspaceCard } from "@/features/workspaces/components/workspace-card";
import { ACCENT_SWATCHES } from "@/config/theme.config";
import { APP } from "@/config/app.config";
import { useAsyncAction } from "@/shared/hooks/use-async-action";
import { Spinner } from "@/shared/components/ui/spinner";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

type NavSection = "workspaces" | "recent" | "templates" | "settings" | "usage";

const TEMPLATES = [
  { id: "empty", name: "Empty Canvas", description: "Blank slate to start fresh" },
  { id: "mindmap", name: "Mind Map", description: "Radial brainstorming layout" },
  { id: "project", name: "Project Plan", description: "Structured flow for projects" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { workspaces, createWorkspace, deleteWorkspace, updateMeta, openWorkspace, fetchWorkspaces, isLoading, isOffline } = useWorkspacesStore();

  const navGuard = useRef(false);
  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(true);
  const [section, setSection] = useState<NavSection>("workspaces");

  // The nav is an in-flow rail on desktop but a slide-in drawer on phones.
  // Default it closed on mobile so it doesn't cover the workspace grid.
  useEffect(() => {
    setNavOpen(!isMobile);
  }, [isMobile]);

  // On mobile, picking a section should close the drawer.
  const selectSection = (s: NavSection) => {
    setSection(s);
    if (isMobile) setNavOpen(false);
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(ACCENT_SWATCHES[0]);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const sorted = [...workspaces].sort((a, b) => b.updatedAt - a.updatedAt);
  const recent = sorted.slice(0, 5);

  const { run: handleCreate, pending: creating } = useAsyncAction(async () => {
    if (!newName.trim()) return;
    await createWorkspace(newName.trim(), newDesc.trim(), newColor);
    setModalOpen(false);
    setNewName("");
    setNewDesc("");
    setNewColor(ACCENT_SWATCHES[0]);
  });

  const { run: createFromTemplate, pending: creatingTemplate } = useAsyncAction(
    (t: (typeof TEMPLATES)[number]) => createWorkspace(t.name, t.description, ACCENT_SWATCHES[0]),
  );

  const handleOpenWorkspace = (id: string) => {
    if (navGuard.current) return;
    navGuard.current = true;
    setTransitioning(true);
    openWorkspace(id, router);
  };

  const displayed = section === "recent" ? recent : sorted;

  return (
    <>
      {transitioning && <div className="dash-transition" />}
      <div className="dash">
      {/* Left nav */}
      <nav className="dash-nav" data-open={navOpen ? "1" : "0"} aria-label="Dashboard navigation">
        <div className="dash-nav-top">
          <div className="brand-mark" style={{ width: 20, height: 20, color: "var(--accent)" }}>
            <svg viewBox="0 0 12 12" fill="none">
              <path d="M3 1 L9 1 L11 6 L9 11 L3 11 L1 6 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="6" cy="6" r="1.4" fill="currentColor" />
            </svg>
          </div>
          {navOpen && <span className="dash-nav-appname">{APP.name}</span>}
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle navigation"
            style={{ marginLeft: "auto" }}
          >
            <span /><span /><span />
          </button>
        </div>

        <div className="dash-nav-items">
          <NavItem icon={<GridIcon />} label="Workspaces" active={section === "workspaces"} onClick={() => selectSection("workspaces")} />
          <NavItem icon={<ClockIcon />} label="Recent" active={section === "recent"} onClick={() => selectSection("recent")} />
          <NavItem icon={<TemplateIcon />} label="Templates" active={section === "templates"} onClick={() => selectSection("templates")} />
          <div className="dash-nav-divider" />
          <NavItem icon={<GearIcon />} label="Settings" active={section === "settings"} onClick={() => selectSection("settings")} />
          <NavItem icon={<ChartIcon />} label="Usage" active={section === "usage"} onClick={() => selectSection("usage")} />
        </div>
      </nav>

      {/* Scrim behind the mobile nav drawer */}
      <div
        className="dash-nav-scrim"
        data-visible={isMobile && navOpen ? "1" : "0"}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      {/* Main */}
      <div className="dash-main">
        <div className="dash-header">
          <button
            type="button"
            className="dash-mobile-trigger"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </button>
          <h2>// {section}</h2>
          {(section === "workspaces" || section === "recent") && (
            <button type="button" className="dash-new-btn" onClick={() => setModalOpen(true)}>
              <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="7" y1="2" x2="7" y2="12" />
                <line x1="2" y1="7" x2="12" y2="7" />
              </svg>
              New Workspace
            </button>
          )}
        </div>

        <div className="dash-body">
          {isOffline && (
            <div className="dash-offline-banner">
              <span>●</span> Offline — changes will sync when you reconnect
            </div>
          )}
          {(section === "workspaces" || section === "recent") && (
            <>
              <div className="dash-section-title">{section === "recent" ? "Recently opened" : "All workspaces"}</div>
              {isLoading && displayed.length === 0 ? (
                <div className="ws-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} height={132} radius={12} />
                  ))}
                </div>
              ) : displayed.length === 0 ? (
                <div className="dash-empty">No workspaces yet. Create one to get started.</div>
              ) : (
                <div className="ws-grid">
                  {displayed.map((ws) => (
                    <WorkspaceCard
                      key={ws.id}
                      workspace={ws}
                      onClick={() => handleOpenWorkspace(ws.id)}
                      onDelete={() => deleteWorkspace(ws.id)}
                      onRename={(name) => updateMeta(ws.id, { name })}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {section === "templates" && (
            <>
              <div className="dash-section-title">Starter templates</div>
              <div className="ws-grid">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    className="ws-card"
                    data-busy={creatingTemplate ? "1" : "0"}
                    onClick={() => createFromTemplate(t)}
                    style={{ cursor: creatingTemplate ? "wait" : "pointer", pointerEvents: creatingTemplate ? "none" : undefined }}
                  >
                    <div className="ws-card-accent" style={{ background: "var(--accent)" }} />
                    <div className="ws-card-body">
                      <div className="ws-card-name">{t.name}</div>
                      <div className="ws-card-desc">{t.description}</div>
                      <div className="ws-card-meta">
                        <span style={{ color: "var(--accent)", fontSize: 11 }}>+ Create from template</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === "settings" && (
            <div className="dash-placeholder">
              <div className="dash-section-title">Settings</div>
              <p className="dash-empty">Theme and preference controls available in the workspace via the Tweaks panel.</p>
            </div>
          )}

          {section === "usage" && (
            <div className="dash-placeholder">
              <div className="dash-section-title">Usage</div>
              <div className="dash-usage-stats">
                <div className="dash-stat">
                  <span className="dash-stat-val">{workspaces.length}</span>
                  <span className="dash-stat-lbl">Workspaces</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-val">{workspaces.reduce((acc, w) => acc + w.nodeCount, 0)}</span>
                  <span className="dash-stat-lbl">Total nodes</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-val">{workspaces.reduce((acc, w) => acc + w.edges.length, 0)}</span>
                  <span className="dash-stat-lbl">Total edges</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New workspace modal */}
      {modalOpen && (
        <div className="ws-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="ws-modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Workspace</h3>
            <label htmlFor="ws-name">Name</label>
            <input
              id="ws-name"
              type="text"
              placeholder="Untitled workspace"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setModalOpen(false); }}
              autoFocus
            />
            <label htmlFor="ws-desc">Description</label>
            <textarea
              id="ws-desc"
              placeholder="Optional description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <label>Accent color</label>
            <div className="ws-modal-colors">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="ws-modal-swatch"
                  data-active={newColor === c ? "1" : "0"}
                  style={{ background: c }}
                  onClick={() => setNewColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="ws-modal-actions">
              <button type="button" className="cancel" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="submit" onClick={() => handleCreate()} disabled={!newName.trim() || creating}>
                {creating ? <Spinner /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className="dash-nav-item" data-active={active ? "1" : "0"} onClick={onClick} title={label}>
      {icon}
      <span className="nav-lbl">{label}</span>
    </button>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 2.5" strokeLinecap="round" />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
      <line x1="7" y1="5.5" x2="7" y2="14.5" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12l3.5-4 3 2.5 3-5.5 2.5 3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="2" y1="14" x2="14" y2="14" />
    </svg>
  );
}
