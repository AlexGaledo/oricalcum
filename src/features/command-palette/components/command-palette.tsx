"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCommandPaletteStore } from "../store/command-palette.store";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { open, query, setOpen, setQuery, toggle } = useCommandPaletteStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const activeId = useWorkspacesStore((s) => s.activeId);
  const workspaces = useWorkspacesStore((s) => s.workspaces);

  const workspaceId = activeId ?? workspaces[0]?.id;

  const commands: Command[] = useMemo(() => {
    const base = workspaceId ? `/workspace/${workspaceId}` : null;
    const list: Command[] = [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        shortcut: "G D",
        action: () => router.push("/dashboard"),
      },
    ];

    if (base) {
      list.push(
        { id: "nav-overview", label: "Go to Overview", action: () => router.push(base) },
        { id: "nav-graphs", label: "Go to Graphs", action: () => router.push(`${base}/graphs`) },
        { id: "nav-chatspace", label: "Go to AI Chatspace", action: () => router.push(`${base}/chatspace`) },
        { id: "nav-people", label: "Go to People", action: () => router.push(`${base}/people`) },
        { id: "nav-settings", label: "Go to Settings", action: () => router.push(`${base}/settings`) },
      );
    }

    workspaces.forEach((ws) => {
      list.push({
        id: `ws-${ws.id}`,
        label: `Open workspace: ${ws.name}`,
        action: () => router.push(`/workspace/${ws.id}`),
      });
    });

    list.push(
      { id: "act-create-ws", label: "Create new workspace", action: () => router.push("/dashboard") },
      { id: "act-toggle-theme", label: "Toggle theme picker", action: () => {
        const el = document.querySelector('[title="Theme"]') as HTMLButtonElement | null;
        el?.click();
      }},
    );

    return list;
  }, [router, workspaceId, workspaces]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 12);
    return commands
      .filter((c) => c.label.toLowerCase().includes(q))
      .slice(0, 12);
  }, [commands, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      if (isModifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open, toggle, setOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
    }
  }, [open, setQuery]);

  const handleSelect = useCallback(
    (cmd: Command) => {
      cmd.action();
      setOpen(false);
    },
    [setOpen],
  );

  if (!open) return null;

  return (
    <div
      className="cmd-palette-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="cmd-palette-modal">
        <div className="cmd-palette-input-wrap">
          <svg className="cmd-palette-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a command or search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered.length > 0) {
                handleSelect(filtered[0]);
              }
            }}
          />
          <kbd className="cmd-palette-kbd">ESC</kbd>
        </div>

        {filtered.length === 0 ? (
          <div className="cmd-palette-empty">No commands found.</div>
        ) : (
          <ul ref={listRef} className="cmd-palette-list">
            {filtered.map((cmd) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  className="cmd-palette-item"
                  onClick={() => handleSelect(cmd)}
                >
                  <span className="cmd-palette-label">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="cmd-palette-shortcut">{cmd.shortcut}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
