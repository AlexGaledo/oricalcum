import { apiClient } from "./api-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Not found");
  return json.data as T;
}

export interface CreateProjectPayload {
  id?: string;
  name: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export async function fetchProjects() {
  return apiClient.get<Record<string, unknown>[]>("/projects");
}

export async function fetchProject(projectId: string) {
  return apiClient.get<Record<string, unknown>>(`/projects/${projectId}`);
}

export async function createProject(data: CreateProjectPayload) {
  return apiClient.post<Record<string, unknown>>("/projects", data);
}

export async function updateProject(projectId: string, data: Partial<CreateProjectPayload>) {
  return apiClient.put<Record<string, unknown>>(`/projects/${projectId}`, data);
}

export async function deleteProject(projectId: string) {
  return apiClient.delete<void>(`/projects/${projectId}`);
}

export async function patchProjectShare(projectId: string, isPublic: boolean) {
  return apiClient.patch<Record<string, unknown>>(`/projects/${projectId}/share`, { is_public: isPublic });
}

export async function fetchPublicProject(projectId: string) {
  return fetchPublic<Record<string, unknown>>(`/public/projects/${projectId}`);
}

export async function fetchPublicNodes(projectId: string) {
  return fetchPublic<Record<string, unknown>[]>(`/public/projects/${projectId}/nodes`);
}

export async function fetchPublicEdges(projectId: string) {
  return fetchPublic<Record<string, unknown>[]>(`/public/projects/${projectId}/edges`);
}
