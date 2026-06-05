"use client";

import { create } from "zustand";
import {
  listStorage,
  presignUpload,
  presignDownload,
  deleteStorageItem,
  createFolder,
  moveStorageItem,
  type StorageFile,
  type StorageFolder,
} from "@/data/api/endpoints/storage.api";
import { uploadToPresigned } from "@/shared/lib/s3-upload";
import type { UploadProgress } from "../types/storage.types";

interface StorageStore {
  /** Current folder, workspace-relative ("" = root). Always ends with "/" when non-empty. */
  prefix: string;
  folders: StorageFolder[];
  files: StorageFile[];
  loading: boolean;
  error: string | null;
  uploads: UploadProgress[];

  refresh: (projectId: string) => Promise<void>;
  navigate: (projectId: string, prefix: string) => Promise<void>;
  upload: (projectId: string, files: File[]) => Promise<void>;
  remove: (projectId: string, path: string) => Promise<void>;
  makeFolder: (projectId: string, name: string) => Promise<void>;
  rename: (projectId: string, fromPath: string, toPath: string) => Promise<void>;
  download: (projectId: string, path: string) => Promise<void>;
  getPreviewUrl: (projectId: string, path: string) => Promise<string>;
}

export const useStorageStore = create<StorageStore>((set, get) => ({
  prefix: "",
  folders: [],
  files: [],
  loading: false,
  error: null,
  uploads: [],

  refresh: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const listing = await listStorage(projectId, get().prefix);
      set({ folders: listing.folders, files: listing.files, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to load" });
    }
  },

  navigate: async (projectId, prefix) => {
    set({ prefix });
    await get().refresh(projectId);
  },

  upload: async (projectId, files) => {
    const prefix = get().prefix;
    set({ uploads: files.map((f) => ({ name: f.name, fraction: 0 })) });

    const setProgress = (name: string, patch: Partial<UploadProgress>) =>
      set((s) => ({
        uploads: s.uploads.map((u) => (u.name === name ? { ...u, ...patch } : u)),
      }));

    await Promise.all(
      files.map(async (file) => {
        try {
          const { url } = await presignUpload(projectId, {
            path: `${prefix}${file.name}`,
            content_type: file.type || "application/octet-stream",
            size: file.size,
          });
          await uploadToPresigned(url, file, (frac) => setProgress(file.name, { fraction: frac }));
          setProgress(file.name, { fraction: 1 });
        } catch (err) {
          setProgress(file.name, { error: err instanceof Error ? err.message : "Upload failed" });
        }
      }),
    );

    await get().refresh(projectId);
    // Clear progress for successful uploads; keep errors visible.
    set((s) => ({ uploads: s.uploads.filter((u) => u.error) }));
  },

  remove: async (projectId, path) => {
    await deleteStorageItem(projectId, path);
    await get().refresh(projectId);
  },

  makeFolder: async (projectId, name) => {
    const clean = name.trim().replace(/^\/+|\/+$/g, "");
    if (!clean) return;
    await createFolder(projectId, `${get().prefix}${clean}`);
    await get().refresh(projectId);
  },

  rename: async (projectId, fromPath, toPath) => {
    await moveStorageItem(projectId, fromPath, toPath);
    await get().refresh(projectId);
  },

  download: async (projectId, path) => {
    const { url } = await presignDownload(projectId, path, true);
    window.open(url, "_blank");
  },

  getPreviewUrl: async (projectId, path) => {
    const { url } = await presignDownload(projectId, path, false);
    return url;
  },
}));
