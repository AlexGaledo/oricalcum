import { apiClient } from "./api-client";

/** Backend nodespace shape (snake_case). `nodes` is the projected coord manifest. */
export interface BackendNodespace {
  id: string;
  project_id: string;
  parent_id: string | null;
  kind: "file" | "folder";
  name: string;
  expanded: boolean;
  sort: number;
  nodes: { id: string; x: number; y: number }[];
  created_at: number;
  updated_at: number;
}

export async function fetchNodespaces(projectId: string) {
  return apiClient.get<BackendNodespace[]>(`/projects/${projectId}/nodespaces`);
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
