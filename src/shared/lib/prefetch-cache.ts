interface PrefetchPayload {
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  project: Record<string, unknown>;
}

const cache = new Map<string, PrefetchPayload>();

export const prefetchCache = {
  set: (projectId: string, data: PrefetchPayload) => {
    cache.set(projectId, data);
  },
  get: (projectId: string) => cache.get(projectId),
  has: (projectId: string) => cache.has(projectId),
  delete: (projectId: string) => {
    cache.delete(projectId);
  },
  clear: () => {
    cache.clear();
  },
};
