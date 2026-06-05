export type FileNodeKind = "file" | "folder";

/**
 * Client shape of a backend nodespace (a graph/file inside a project).
 * The tree is hydrated from `GET /projects/:id/nodespaces` and every mutation
 * mirrors back to the API — there is no local-only snapshot store anymore.
 */
export interface FsNode {
  id: string;
  kind: FileNodeKind;
  name: string;
  parentId: string | null;
  expanded?: boolean;
}

/** Lightweight coordinate manifest projected by the backend (id + position). */
export interface NodeManifestEntry {
  id: string;
  x: number;
  y: number;
}
