import type { SyncStatus } from "../models/node.model";

export interface SyncableEntity {
  id: string;
  syncStatus: SyncStatus;
  version: number;
  updatedAt: number;
}

export interface Repository<T extends SyncableEntity> {
  getAll(): T[];
  getById(id: string): T | undefined;
  upsert(entity: T): void;
  remove(id: string): void;
  getDirty(): T[];
  markSynced(id: string): void;
  markAllSynced(): void;
  getConflicts(): T[];
}
