"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { useNodeStore } from "@/features/nodes/store/node.store";

interface Props {
  workspaceId: string;
}

export function Breadcrumbs({ workspaceId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const openDocId = searchParams.get("doc");
  const docNode = useNodeStore((s) => s.nodes.find((n) => n.id === openDocId));

  const segments: { label: string; path?: string }[] = [
    { label: "Dashboard", path: "/dashboard" },
    { label: workspace?.name ?? "Workspace", path: `/workspace/${workspaceId}` },
  ];

  if (pathname.endsWith("/graphs")) {
    segments.push({ label: "Graphs" });
  } else if (pathname.endsWith("/storage")) {
    segments.push({ label: "Storage" });
  } else if (pathname.endsWith("/chatspace")) {
    segments.push({ label: "Chatspace" });
  } else if (pathname.endsWith("/people")) {
    segments.push({ label: "People" });
  } else if (pathname.endsWith("/settings")) {
    segments.push({ label: "Settings" });
  } else if (pathname === `/workspace/${workspaceId}`) {
    segments.push({ label: "Overview" });
  }

  if (docNode) {
    segments.push({ label: docNode.title || "Untitled" });
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumbs">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={`${seg.label}-${i}`} className="breadcrumb-segment">
            {seg.path && !isLast ? (
              <button type="button" className="breadcrumb-link" onClick={() => router.push(seg.path!)}>
                {seg.label}
              </button>
            ) : (
              <span className="breadcrumb-current">{seg.label}</span>
            )}
            {!isLast && <span className="breadcrumb-divider">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
