import { NodeRepository } from "../repositories/node.repository";
import { OfflineQueue } from "./offline-queue";
import { ConflictResolver } from "./conflict-resolver";
import { syncNodes } from "../api/endpoints/nodes.api";
import type { SyncResult } from "../api/api.types";

export type SyncEvent =
  | { type: "sync:start" }
  | { type: "sync:complete"; pushed: number; pulled: number }
  | { type: "sync:error"; error: Error }
  | { type: "sync:conflicts"; count: number }
  | { type: "online" }
  | { type: "offline" };

type SyncListener = (event: SyncEvent) => void;

export class SyncEngine {
  private nodeRepo: NodeRepository;
  private queue: OfflineQueue;
  private resolver: ConflictResolver;
  private listeners: SyncListener[] = [];
  private isSyncing = false;
  private isOnline = true;

  constructor(projectId: string) {
    this.nodeRepo = new NodeRepository(projectId);
    this.queue = new OfflineQueue();
    this.resolver = new ConflictResolver("lww");

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  on(listener: SyncListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: SyncEvent) {
    for (const l of this.listeners) l(event);
  }

  async sync() {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;
    this.emit({ type: "sync:start" });

    try {
      await this.flushQueue();
      const dirtyNodes = this.nodeRepo.toApiPayload();

      const result: SyncResult<Record<string, unknown>> = dirtyNodes.length > 0
        ? await syncNodes({
            projectId: this.nodeRepo["projectId"],
            lastSyncedAt: null,
            entities: dirtyNodes,
          })
        : { pushed: 0, pulled: 0, conflicts: [], serverTime: Date.now() };

      if (result.conflicts.length > 0) {
        this.emit({ type: "sync:conflicts", count: result.conflicts.length });
      }

      this.nodeRepo.markAllSynced();
      this.emit({ type: "sync:complete", pushed: result.pushed, pulled: result.pulled });
    } catch (err) {
      this.emit({ type: "sync:error", error: err instanceof Error ? err : new Error(String(err)) });
    } finally {
      this.isSyncing = false;
    }
  }

  private async flushQueue() {
    while (this.queue.size > 0) {
      const entry = this.queue.peek();
      if (!entry) break;

      try {
        this.queue.dequeue();
      } catch {
        this.queue.retry(entry);
        break;
      }
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.emit({ type: "online" });
    this.sync();
  }

  private handleOffline() {
    this.isOnline = false;
    this.emit({ type: "offline" });
  }

  destroy() {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", () => this.handleOnline());
      window.removeEventListener("offline", () => this.handleOffline());
    }
    this.listeners = [];
  }
}
