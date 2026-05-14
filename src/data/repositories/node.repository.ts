import { useNodeStore } from "@/features/nodes/store/node.store";
import { nodeFromApiShape, nodeToApiShape, toNodeModel, type NodeModel } from "../models/node.model";
import type { SyncStatus } from "../models/node.model";
import type { Repository, SyncableEntity } from "./base.repository";

export class NodeRepository implements Repository<NodeModel> {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  getAll(): NodeModel[] {
    const nodes = useNodeStore.getState().nodes;
    return nodes.map((n) => {
      const existing = this.findInStore(n.id);
      return toNodeModel(n, this.projectId, existing);
    });
  }

  getById(id: string): NodeModel | undefined {
    const node = useNodeStore.getState().nodes.find((n) => n.id === id);
    if (!node) return undefined;
    const existing = this.findInStore(id);
    return toNodeModel(node, this.projectId, existing);
  }

  upsert(entity: NodeModel): void {
    const store = useNodeStore.getState();
    const plain = (({ projectId, version, status, tags, syncStatus, ...rest }) => rest)(entity);
    const existing = store.nodes.find((n) => n.id === entity.id);
    if (existing) {
      store.updateNode(entity.id, { ...plain, updatedAt: entity.updatedAt });
    } else {
      useNodeStore.setState((s) => ({
        nodes: [...s.nodes, { ...plain, createdAt: entity.createdAt, updatedAt: entity.updatedAt }],
      }));
    }
  }

  remove(id: string): void {
    useNodeStore.getState().removeNode(id);
  }

  getDirty(): NodeModel[] {
    return this.getAll().filter((n) => n.syncStatus === "dirty" || n.syncStatus === "pending");
  }

  markSynced(id: string): void {
    this.updateSyncMeta(id, "synced");
  }

  markAllSynced(): void {
    for (const n of this.getAll()) {
      this.updateSyncMeta(n.id, "synced");
    }
  }

  getConflicts(): NodeModel[] {
    return this.getAll().filter((n) => n.syncStatus === "conflicted");
  }

  toApiPayload(): Record<string, unknown>[] {
    return this.getDirty().map((n) => nodeToApiShape({ ...n, syncStatus: "synced", projectId: this.projectId }));
  }

  applyRemote(remoteData: Record<string, unknown>[]): void {
    for (const d of remoteData) {
      const remote = nodeFromApiShape(d, this.projectId);
      const local = this.getById(remote.id);

      if (!local) {
        this.upsert(remote);
        continue;
      }

      if (remote.updatedAt > local.updatedAt && local.syncStatus !== "dirty") {
        this.upsert(remote);
      } else if (remote.updatedAt > local.updatedAt && local.syncStatus === "dirty") {
        useNodeStore.setState((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === remote.id
              ? { ...n, syncStatus: "conflicted" as const }
              : n,
          ),
        }));
      }
    }
  }

  private findInStore(id: string): { version: number; syncStatus: SyncStatus } | undefined {
    return undefined;
  }

  private updateSyncMeta(id: string, syncStatus: SyncStatus): void {
    const store = useNodeStore.getState();
    const node = store.nodes.find((n) => n.id === id);
    if (!node) return;
    useNodeStore.setState((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, syncStatus } as unknown as typeof n : n,
      ),
    }));
  }
}
