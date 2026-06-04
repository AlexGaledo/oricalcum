export type { StorageFile, StorageFolder, StorageListing } from "@/data/api/endpoints/storage.api";

export interface UploadProgress {
  name: string;
  fraction: number;
  error?: string;
}
