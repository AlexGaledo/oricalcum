# Backend API Integration Guide

## Overview

This document describes how to connect Oricalcum to a backend API. The data layer in `src/data/` provides the abstraction — you supply the server, and these adapters bridge the gap.

### Architecture at a glance

```
┌──────────────────────────────────────────────┐
│                  UI Layer                     │
│  (React components / Framer Motion)           │
├──────────────────────────────────────────────┤
│             Zustand Stores                    │
│  (node.store / edge.store / canvas.store)     │
├──────────────────────────────────────────────┤
│          Repository Layer                     │
│  (NodeRepository / EdgeRepository / ...)      │
│  ─ wraps stores ─ adds sync metadata ─       │
├──────────────────────────────────────────────┤
│            Sync Engine                        │
│  (SyncEngine / OfflineQueue / ConflictResolver)│
├──────────────────────────────────────────────┤
│             API Client                        │
│  (ApiClient / endpoint functions)             │
├──────────────────────────────────────────────┤
│              Backend Server                   │
│  (your REST / GraphQL API)                    │
└──────────────────────────────────────────────┘
```

---

## Data Models

### Node

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Client-generated (uuid/nanoid) |
| `x`, `y` | `number` | Canvas position |
| `w`, `h` | `number` | Current dimensions |
| `baseW`, `baseH` | `number` | Default dimensions (before text auto-expand) |
| `shape` | `"rectangle"\|"circle"\|"hexagon"\|"diamond"\|"cloud"\|"document"` | Visual shape |
| `title` | `string` | Display label |
| `body` | `string` | Plain-text body |
| `color` | `string?` | Accent override |
| `opacity` | `number?` | 0–1 |
| `tags` | `string[]` | For filtering/search |
| `status` | `"active"\|"archived"\|"deleted"` | Soft delete |
| `version` | `number` | Monotonically increasing; used for conflict detection |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

### Edge

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Client-generated |
| `from` | `string` | Source node ID |
| `to` | `string` | Target node ID |
| `fromPort` | `"top"\|"right"\|"bottom"\|"left"` | Source port |
| `toPort` | `"top"\|"right"\|"bottom"\|"left"` | Target port |
| `animationStyle` | `"flow"\|"pulse"\|"orbit"?` | Visual style |
| `label` | `string?` | Edge label |
| `metadata` | `Record<string, unknown>` | Extensible |
| `version` | `number` | For conflict detection |

### Project

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Server-generated or client |
| `name` | `string` | Display name |
| `description` | `string` | Markdown description |
| `ownerId` | `string` | User who created it |
| `collaborators` | `string[]` | User IDs with access |
| `settings` | `ProjectSettings` | Theme, background, font, animations |
| `camera` | `{ x, y, zoom }` | Last viewport position |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

### Document

| Field | Type | Notes |
|-------|------|-------|
| `nodeId` | `string` | FK to node |
| `content` | `string` | Tiptap JSON (rich text) |
| `version` | `number` | For conflict detection |
| `createdAt` | `number` | Unix ms |
| `updatedAt` | `number` | Unix ms |

---

## API Endpoints

The API client lives in `src/data/api/`. Configure the base URL:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.oricalcum.dev/v1
```

### Standard response envelope

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "serverTime": 1715000000000,
    "requestId": "req_abc123"
  }
}
```

Errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "Node was modified by another user",
    "details": { "localVersion": 3, "serverVersion": 5 }
  }
}
```

### Nodes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:projectId/nodes` | List all nodes for a project |
| `GET` | `/projects/:projectId/nodes/:id` | Get single node |
| `POST` | `/projects/:projectId/nodes` | Create a node |
| `PUT` | `/projects/:projectId/nodes/:id` | Update a node (full replace) |
| `PATCH` | `/projects/:projectId/nodes/:id` | Partial update |
| `DELETE` | `/projects/:projectId/nodes/:id` | Soft or hard delete |

### Edges

Same pattern under `/projects/:projectId/edges`.

### Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects` | List user's projects |
| `GET` | `/projects/:id` | Get project + settings |
| `POST` | `/projects` | Create project |
| `PUT` | `/projects/:id` | Update project metadata/settings |
| `DELETE` | `/projects/:id` | Delete project |

### Documents

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/documents/:nodeId` | Get document content |
| `PUT` | `/documents/:nodeId` | Upsert document (idempotent) |
| `DELETE` | `/documents/:nodeId` | Delete document |

### Sync

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/sync/nodes` | Bidirectional node sync |
| `POST` | `/sync/edges` | Bidirectional edge sync |

Sync payload:

```json
{
  "projectId": "ws_001",
  "lastSyncedAt": 1715000000000,
  "entities": [
    {
      "id": "n_001",
      "x": 100, "y": 200,
      "shape": "hexagon",
      "title": "auth flow",
      "version": 3,
      "updatedAt": 1715000100000
    }
  ]
}
```

Sync response:

```json
{
  "success": true,
  "data": {
    "pushed": 5,
    "pulled": 2,
    "conflicts": [],
    "serverTime": 1715000200000
  }
}
```

---

## Authentication

### Flow

1. User logs in via your auth provider (Supabase, Clerk, Auth0, custom)
2. Store the JWT/token in memory or httpOnly cookie
3. Set it on the API client:

```ts
import { apiClient } from "@/data/api";

// After login:
apiClient.setAuthToken("eyJhbGci...");

// On logout:
apiClient.clearAuthToken();
```

### Token refresh

The `ApiClient` accepts an `onAuthFailure` callback in its constructor. When the server returns 401, this fires — redirect to login or trigger token refresh:

```ts
const apiClient = new ApiClient({
  baseUrl: "...",
  onAuthFailure: () => {
    // redirect to /login or refresh token
    refreshToken().then(newToken => {
      apiClient.setAuthToken(newToken);
    });
  },
});
```

---

## Sync Strategy

### Write path (client → server)

```
User edits node
  → useNodeStore.updateNode()        (immediate local update)
  → node.syncStatus = "dirty"
  → SyncEngine.sync()                (debounced, e.g. 2s after last change)
    → NodeRepository.getDirty()      (collects all dirty entities)
    → POST /sync/nodes               (send to server)
    → on success: markSynced(id)     (syncStatus = "synced")
    → on failure: keep dirty, retry
```

### Read path (server → client)

```
SyncEngine.sync()
  → GET /projects/:id/nodes?since=<lastSyncedAt>
  → NodeRepository.applyRemote()
    → if remote.updatedAt > local.updatedAt && local is clean:
        overwrite local
    → if remote.updatedAt > local.updatedAt && local is dirty:
        conflict → mark "conflicted"
```

### Offline support

The `OfflineQueue` stores failed mutations in `localStorage`:

```ts
import { offlineQueue } from "@/data/sync";

// Automatically used by SyncEngine:
// 1. Mutation fails → enqueue to offlineQueue
// 2. Browser fires "online" event → SyncEngine flushes queue
// 3. Each entry retried up to 5 times, then dropped
```

### Conflict resolution

`ConflictResolver` supports two strategies:

| Strategy | Behavior |
|----------|----------|
| `"lww"` (default) | Last-write-wins: server timestamp wins if local is clean; if local is dirty and remote is newer, marks as conflicted |
| `"manual"` | Stores both versions; UI can prompt user to choose |

---

## Implementation checklist

### Phase 1 — Basic CRUD

- [ ] Set up `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Implement `POST /auth/login` on the backend
- [ ] Call `apiClient.setAuthToken()` after login
- [ ] Call `fetchProjects()` on dashboard load → populate workspace list
- [ ] Call `fetchNodes()` + `fetchEdges()` on workspace open → load canvas
- [ ] Call `createNode()` / `updateNode()` / `deleteNode()` on user actions
- [ ] Call `upsertDocument()` when document panel saves

### Phase 2 — Sync engine

- [ ] Instantiate `SyncEngine` with current `projectId`
- [ ] Subscribe to store changes → debounce → call `syncEngine.sync()`
- [ ] Handle `sync:start` / `sync:complete` / `sync:error` events (show toast)
- [ ] Test offline: disconnect network → make edits → reconnect → verify sync

### Phase 3 — Collaboration

- [ ] Add WebSocket connection for real-time push
- [ ] On receiving remote mutation → `nodeRepo.applyRemote()`
- [ ] Handle `sync:conflicts` event → show conflict UI
- [ ] Implement manual conflict resolution UI

### Phase 4 — Polish

- [ ] Add loading skeletons during sync
- [ ] Debounce sync to avoid flooding (2s idle debounce)
- [ ] Retry with exponential backoff
- [ ] Add sync status indicator in status bar

---

## Quickstart: wiring SyncEngine into the workspace

```ts
// src/app/workspace/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { SyncEngine } from "@/data/sync";

export default function WorkspacePage() {
  const engineRef = useRef<SyncEngine | null>(null);

  useEffect(() => {
    const projectId = "ws_001"; // get from store/params
    const engine = new SyncEngine(projectId);
    engineRef.current = engine;

    const unsub = engine.on((event) => {
      switch (event.type) {
        case "sync:start":
          console.log("syncing...");
          break;
        case "sync:complete":
          console.log(`pushed ${event.pushed}, pulled ${event.pulled}`);
          break;
        case "sync:error":
          console.error("sync failed", event.error);
          break;
      }
    });

    engine.sync(); // initial pull

    // Auto-sync every 30s
    const interval = setInterval(() => engine.sync(), 30_000);

    return () => {
      unsub();
      clearInterval(interval);
      engine.destroy();
    };
  }, []);

  // ... rest of the workspace
}
```

---

## Folder structure reference

```
src/data/
├── models/
│   ├── node.model.ts          # NodeModel, toNodeModel, nodeToApiShape, nodeFromApiShape
│   ├── edge.model.ts          # EdgeModel, toEdgeModel, edgeToApiShape, edgeFromApiShape
│   ├── project.model.ts       # ProjectModel, defaultProjectSettings, projectToApiShape
│   ├── document.model.ts      # DocumentModel, documentToApiShape, documentFromApiShape
│   └── index.ts               # barrel exports
├── api/
│   ├── api-client.ts          # ApiClient class (generic fetch wrapper)
│   ├── api.types.ts           # ApiResponse, PaginatedResponse, SyncPayload, SyncResult
│   ├── endpoints/
│   │   ├── api-client.ts      # Singleton ApiClient instance
│   │   ├── nodes.api.ts       # CRUD + sync for nodes
│   │   ├── edges.api.ts       # CRUD + sync for edges
│   │   ├── projects.api.ts    # CRUD for projects
│   │   └── documents.api.ts   # CRUD for documents
│   └── index.ts               # barrel exports
├── repositories/
│   ├── base.repository.ts     # Repository<T> interface
│   ├── node.repository.ts     # NodeRepository (wraps useNodeStore)
│   └── index.ts               # barrel exports
├── sync/
│   ├── sync-engine.ts         # SyncEngine (orchestrates push/pull)
│   ├── offline-queue.ts       # OfflineQueue (localStorage-backed)
│   ├── conflict-resolver.ts   # ConflictResolver (LWW / manual)
│   └── index.ts               # barrel exports
└── index.ts                   # top-level barrel
```
