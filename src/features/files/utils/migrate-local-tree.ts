import { createNodespace, patchNodespace } from "@/data/api/endpoints/nodespaces.api";
import type { BackendNodespace } from "@/data/api/endpoints/nodespaces.api";
import type { FsNode } from "../types/files.types";

const OLD_TREE_KEY = "oricalcum-files";
const flagKey = (projectId: string) => `oricalcum-files-migrated:${projectId}`;

interface OldPersistShape {
  state?: { tree?: FsNode[]; activeFileId?: string | null };
}

/**
 * One-time migration of the pre-backend local file tree (`oricalcum-files`) into
 * real backend nodespaces. Recreates the user's folder/file hierarchy (names +
 * nesting). The local *active* file is mapped onto the backfilled default
 * nodespace so its existing nodes stay attached. Other files become empty
 * nodespaces (per-file node data was never persisted locally, so there is
 * nothing more to recover).
 *
 * Returns true if it created/renamed any backend rows (caller should re-fetch).
 */
export async function migrateLocalTree(
  projectId: string,
  existingSpaces: BackendNodespace[],
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(flagKey(projectId))) return false;

  const raw = localStorage.getItem(OLD_TREE_KEY);
  if (!raw) {
    localStorage.setItem(flagKey(projectId), "1");
    return false;
  }

  let parsed: OldPersistShape;
  try {
    parsed = JSON.parse(raw) as OldPersistShape;
  } catch {
    localStorage.setItem(flagKey(projectId), "1");
    return false;
  }

  const tree = parsed.state?.tree ?? [];
  const activeFileId = parsed.state?.activeFileId ?? null;
  if (tree.length === 0) {
    localStorage.setItem(flagKey(projectId), "1");
    return false;
  }

  // The backfilled "untitled" default (if this project already had nodes).
  const defaultSpace = existingSpaces.find((s) => s.kind === "file") ?? existingSpaces[0];
  // Which local file inherits the default's existing nodes.
  const reuseLocalId =
    (activeFileId && tree.find((n) => n.id === activeFileId && n.kind === "file")?.id) ||
    tree.find((n) => n.kind === "file")?.id ||
    null;

  const now = Date.now();
  const idMap = new Map<string, string>(); // localId -> backendId
  let changed = false;

  // Breadth-first so a parent always exists before its children.
  const queue = tree.filter((n) => n.parentId === null);
  const seen = new Set(queue.map((n) => n.id));
  for (let i = 0; i < queue.length; i++) {
    const next = tree.filter((n) => n.parentId === queue[i].id && !seen.has(n.id));
    for (const c of next) {
      seen.add(c.id);
      queue.push(c);
    }
  }

  for (const node of queue) {
    const parentBackendId = node.parentId ? idMap.get(node.parentId) ?? null : null;

    if (defaultSpace && node.id === reuseLocalId) {
      // Adopt the backfilled default for this file so its nodes carry over.
      idMap.set(node.id, defaultSpace.id);
      try {
        await patchNodespace(projectId, defaultSpace.id, {
          name: node.name,
          parent_id: parentBackendId,
          updated_at: now,
        });
        changed = true;
      } catch (err) {
        console.error("migrate: failed to adopt default nodespace", err);
      }
      continue;
    }

    try {
      const created = await createNodespace(projectId, {
        parent_id: parentBackendId,
        kind: node.kind,
        name: node.name,
        expanded: node.expanded ?? true,
        created_at: now,
        updated_at: now,
      });
      idMap.set(node.id, created.id);
      changed = true;
    } catch (err) {
      console.error("migrate: failed to create nodespace", err);
    }
  }

  localStorage.setItem(flagKey(projectId), "1");
  // The old tree key is no longer the source of truth; drop it to avoid confusion.
  localStorage.removeItem(OLD_TREE_KEY);
  return changed;
}
