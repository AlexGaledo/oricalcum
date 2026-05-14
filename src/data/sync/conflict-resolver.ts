import type { NodeModel } from "../models/node.model";

export type ConflictStrategy = "lww" | "manual";

export interface ConflictRecord {
  entityId: string;
  type: "node" | "edge" | "document";
  local: NodeModel;
  remote: NodeModel;
  resolved: boolean;
}

export class ConflictResolver {
  private conflicts: Map<string, ConflictRecord> = new Map();
  private strategy: ConflictStrategy;

  constructor(strategy: ConflictStrategy = "lww") {
    this.strategy = strategy;
  }

  setStrategy(s: ConflictStrategy) {
    this.strategy = s;
  }

  detect(local: NodeModel, remote: NodeModel): ConflictRecord | null {
    if (local.syncStatus !== "dirty") return null;
    if (remote.updatedAt <= local.updatedAt) return null;

    const record: ConflictRecord = {
      entityId: local.id,
      type: "node",
      local,
      remote,
      resolved: false,
    };

    if (this.strategy === "lww") {
      this.resolve(record, remote);
      return null;
    }

    this.conflicts.set(local.id, record);
    return record;
  }

  resolve(record: ConflictRecord, winner: NodeModel) {
    this.conflicts.delete(record.entityId);
    record.resolved = true;
  }

  getUnresolved(): ConflictRecord[] {
    return Array.from(this.conflicts.values()).filter((c) => !c.resolved);
  }

  clear() {
    this.conflicts.clear();
  }
}
