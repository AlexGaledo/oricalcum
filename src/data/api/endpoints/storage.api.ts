import { apiClient } from "./api-client";
import { uploadToPresigned } from "@/shared/lib/s3-upload";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  last_modified: number;
}

export interface StorageFolder {
  name: string;
  path: string;
}

export interface StorageListing {
  prefix: string;
  folders: StorageFolder[];
  files: StorageFile[];
}

export interface PresignUploadResult {
  url: string;
  path: string;
}

/** List one folder level. `prefix` is a workspace-relative path ("" = root). */
export async function listStorage(projectId: string, prefix = "") {
  return apiClient.get<StorageListing>(`/projects/${projectId}/storage`, { prefix });
}

export async function presignUpload(
  projectId: string,
  body: { path: string; content_type: string; size: number },
) {
  return apiClient.post<PresignUploadResult>(
    `/projects/${projectId}/storage/presign-upload`,
    body,
  );
}

export async function presignDownload(projectId: string, path: string, download = false) {
  return apiClient.get<{ url: string }>(`/projects/${projectId}/storage/presign-download`, {
    path,
    download: String(download),
  });
}

export async function deleteStorageItem(projectId: string, path: string) {
  // path ending in "/" deletes the whole folder.
  return apiClient.delete<{ deleted: string }>(
    `/projects/${projectId}/storage?path=${encodeURIComponent(path)}`,
  );
}

export async function createFolder(projectId: string, path: string) {
  return apiClient.post<{ path: string }>(`/projects/${projectId}/storage/folder`, { path });
}

export async function moveStorageItem(projectId: string, fromPath: string, toPath: string) {
  return apiClient.post<{ from: string; to: string }>(`/projects/${projectId}/storage/move`, {
    from_path: fromPath,
    to_path: toPath,
  });
}

/** Stable, durable URL for media embedded in node bodies / avatars (302s to a fresh presigned GET). */
export function mediaUrl(projectId: string, path: string): string {
  return `${API_BASE}/projects/${projectId}/storage/media?path=${encodeURIComponent(path)}`;
}

/**
 * Upload a file and return a durable `mediaUrl` for embedding. Stores under an
 * unguessable uuid-prefixed key in `folder` so the auth-free media endpoint stays safe.
 */
export async function uploadMedia(
  projectId: string,
  file: File,
  folder = "_editor",
): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { url, path: storedPath } = await presignUpload(projectId, {
    path,
    content_type: file.type || "application/octet-stream",
    size: file.size,
  });
  await uploadToPresigned(url, file);
  return mediaUrl(projectId, storedPath);
}
