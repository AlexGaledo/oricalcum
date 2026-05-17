import type { SyncStatus } from "../models/node.model";

export interface SyncQueueEntry {
  id: string;
  type: "node" | "edge" | "document" | "project";
  action: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = "oricalcum-sync-queue";

export class OfflineQueue {
  private entries: SyncQueueEntry[] = [];

  constructor() {
    this.load();
  }

  enqueue(entry: Omit<SyncQueueEntry, "timestamp" | "retryCount">) {
    this.entries.push({
      ...entry,
      timestamp: Date.now(),
      retryCount: 0,
    });
    this.save();
  }

  dequeue(): SyncQueueEntry | undefined {
    return this.entries.shift();
  }

  peek(): SyncQueueEntry | undefined {
    return this.entries[0];
  }

  retry(entry: SyncQueueEntry) {
    entry.retryCount += 1;
    if (entry.retryCount > 5) {
      this.entries = this.entries.filter((e) => e.id !== entry.id);
    }
    this.save();
  }

  remove(id: string) {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.save();
  }

  clear() {
    this.entries = [];
    this.save();
  }

  get size() {
    return this.entries.length;
  }

  get all() {
    return [...this.entries];
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.entries = JSON.parse(raw);
    } catch {
      this.entries = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      /* storage full — silently degrade */
    }
  }
}
