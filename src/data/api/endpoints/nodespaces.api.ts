import { apiClient } from "./api-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

/** Unauthenticated GET for public (shared) resources. Mirrors projects.api. */
async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Not found");
  return json.data as T;
}

/** Backend nodespace shape (snake_case). `nodes` is the projected coord manifest. */
export interface BackendNodespace {
  id: string;
  project_id: string;
  parent_id: string | null;
  kind: "file" | "folder";
  name: string;
  expanded: boolean;
  sort: number;
  is_public: boolean;
  nodes: { id: string; x: number; y: number }[];
  created_at: number;
  updated_at: number;
}

export async function fetchNodespaces(projectId: string) {
  return apiClient.get<BackendNodespace[]>(`/projects/${projectId}/nodespaces`);
}

export async function fetchNodespace(projectId: string, nsid: string) {
  return apiClient.get<BackendNodespace>(`/projects/${projectId}/nodespaces/${nsid}`);
}

export async function createNodespace(projectId: string, data: Record<string, unknown>) {
  return apiClient.post<BackendNodespace>(`/projects/${projectId}/nodespaces`, data);
}

export async function patchNodespace(projectId: string, nsid: string, data: Record<string, unknown>) {
  return apiClient.patch<BackendNodespace>(`/projects/${projectId}/nodespaces/${nsid}`, data);
}

export async function deleteNodespace(projectId: string, nsid: string) {
  return apiClient.delete<void>(`/projects/${projectId}/nodespaces/${nsid}`);
}

/** Toggle public visibility for a single nodespace (independent of the project). */
export async function patchNodespaceShare(projectId: string, nsid: string, isPublic: boolean) {
  return apiClient.patch<BackendNodespace>(
    `/projects/${projectId}/nodespaces/${nsid}/share`,
    { is_public: isPublic },
  );
}

/** Public (read-only) fetchers for a shared nodespace — no auth required. */
export async function fetchPublicNodespace(nsid: string) {
  return fetchPublic<Record<string, unknown>>(`/public/nodespaces/${nsid}`);
}

export async function fetchPublicNodespaceNodes(nsid: string) {
  return fetchPublic<Record<string, unknown>[]>(`/public/nodespaces/${nsid}/nodes`);
}

export async function fetchPublicNodespaceEdges(nsid: string) {
  return fetchPublic<Record<string, unknown>[]>(`/public/nodespaces/${nsid}/edges`);
}
