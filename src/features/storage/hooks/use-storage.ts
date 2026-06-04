"use client";

import { useEffect, useCallback } from "react";
import { useStorageStore } from "../store/storage.store";

/**
 * Binds the storage store to a workspace: loads the root on mount and exposes
 * projectId-bound action handlers so components don't pass it around.
 */
export function useStorage(projectId: string) {
  const store = useStorageStore();

  useEffect(() => {
    // Reset to root and load whenever the workspace changes.
    useStorageStore.setState({ prefix: "", folders: [], files: [], error: null });
    void useStorageStore.getState().refresh(projectId);
  }, [projectId]);

  const navigate = useCallback((prefix: string) => store.navigate(projectId, prefix), [projectId, store]);
  const upload = useCallback((files: File[]) => store.upload(projectId, files), [projectId, store]);
  const remove = useCallback((path: string) => store.remove(projectId, path), [projectId, store]);
  const makeFolder = useCallback((name: string) => store.makeFolder(projectId, name), [projectId, store]);
  const rename = useCallback((from: string, to: string) => store.rename(projectId, from, to), [projectId, store]);
  const download = useCallback((path: string) => store.download(projectId, path), [projectId, store]);
  const getPreviewUrl = useCallback((path: string) => store.getPreviewUrl(projectId, path), [projectId, store]);
  const refresh = useCallback(() => store.refresh(projectId), [projectId, store]);

  return {
    prefix: store.prefix,
    folders: store.folders,
    files: store.files,
    loading: store.loading,
    error: store.error,
    uploads: store.uploads,
    navigate,
    upload,
    remove,
    makeFolder,
    rename,
    download,
    getPreviewUrl,
    refresh,
  };
}
