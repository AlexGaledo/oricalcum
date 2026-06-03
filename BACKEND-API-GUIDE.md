# Backend API Integration Guide

## Overview

Oricalcum is wired to a **FastAPI backend** (`../oricalcum-api`). The backend is the **source of truth** for all canvas data; `localStorage` (the Zustand `persist` in `workspaces.store.ts`) is only an offline cache / first-run seed source.

This document reflects the **current, live implementation** as of the `feature/folder-data-storing` work. Earlier drafts described a repository + sync-engine + offline-queue layer — that abstraction was **removed** in favor of a simpler backend-primary persistence hook. See [History](#history).

### Architecture at a glance

```
┌──────────────────────────────────────────────┐
│                  UI Layer                      │
│  (React components / Framer Motion)            │
├──────────────────────────────────────────────┤
│             Zustand Stores                     │
│  node.store / edge.store / canvas.store        │
├──────────────────────────────────────────────┤
│          usePersistence hook                   │
│  features/canvas/hooks/use-persistence.ts      │
│  ─ hydrate on open ─ debounced diff writes ─   │
├──────────────────────────────────────────────┤
│          Endpoint functions                    │
│  data/api/endpoints/*.api.ts                   │
├──────────────────────────────────────────────┤
│             API Client                         │
│  data/api/api-client.ts (ApiClient class)      │
├──────────────────────────────────────────────┤
│          FastAPI Backend                       │
│  ../oricalcum-api (SQLAlchemy + Supabase auth) │
└──────────────────────────────────────────────┘
```

No repository layer, no sync engine, no offline queue. Stores → `usePersistence` → endpoint fns → backend.

---

## Source-of-truth model

- **Open workspace** → `usePersistence(projectId)` runs `fetchNodes` + `fetchEdges` + `fetchProject`, hydrates the stores and camera. A `hydrating` flag prevents the hydration `setState` from echoing back as writes.
- **Seed-on-empty** → if the backend returns 0 nodes/edges but the local cache (from `workspaces.store`) holds data, that local data is uploaded once. Prevents wiping existing local work on first connect.
- **Offline fallback** → if the fetch fails, the locally-cached state is kept so the app still opens.
- **Writes** → store subscriptions diff by id and fire **debounced per-entity REST** calls:
  - node added/changed → coalesced create (if new) or `PATCH` (if known), 400ms debounce per id
  - node removed → `DELETE` (immediate)
  - edge added → create; edge removed → `DELETE`
  - camera changed → `PATCH /projects/:id` with `{ camera }`, 600ms debounce
- **Project meta** (name/description) → debounced `PATCH /projects/:id` from `workspace/page.tsx`.

---

## Data Models (wire contract)

The backend uses **snake_case** JSON. Mapping between the frontend camelCase types (`@/shared/types`) and the wire shape lives in **`features/canvas/utils/entity-mappers.ts`** (`nodeToBackend` / `nodeToBackendPatch` / `nodeFromBackend` / `edgeToBackend` / `edgeFromBackend`). Always use these — do not hand-roll mappers.

### Node (`/nodes`)

| Wire field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Client-generated |
| `x`, `y` | `number` | Canvas position |
| `w`, `h` | `number` | Current dimensions |
| `base_w`, `base_h` | `number` | Default dims before text auto-expand |
| `shape` | `"rectangle"\|"circle"\|"hexagon"\|"diamond"\|"cloud"\|"document"` | |
| `title` | `string` | |
| `body` | `string` | **Rich-text HTML lives here** (not in a separate document) |
| `color` | `string\|null` | |
| `opacity` | `number\|null` | |
| `tags` | `string[]` | Sent as `[]` from client |
| `status` | `"active"\|"archived"\|"deleted"` | |
| `version` | `number` | |
| `created_at`, `updated_at` | `number` | Unix ms |

### Edge (`/edges`)

| Wire field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `from_node`, `to_node` | `string` | Node ids |
| `from_port`, `to_port` | `"top"\|"right"\|"bottom"\|"left"` | |
| `version` | `number` | |

> Note: the backend `edges` table has **no `created_at`/`updated_at`** columns.

### Project (`/projects`)

| Wire field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `name`, `description` | `string` | |
| `owner_id` | `string` | |
| `collaborators` | `string[]` | |
| `settings` | `object` | |
| `camera` | `{ x, y, zoom }` | Last viewport |
| `is_public` | `boolean` | Drives public share view |
| `created_at`, `updated_at` | `number` | Unix ms |

---

## API Endpoints

Base URL is configured via env (default `http://localhost:3001/api/v1`):

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Response envelope

```json
{ "success": true, "data": { }, "error": null,
  "meta": { "serverTime": 1715000000000, "requestId": "req_abc123" } }
```

```json
{ "success": false, "data": null,
  "error": { "code": "INTERNAL_ERROR", "message": "...", "details": null } }
```

`ApiClient` unwraps `.data`; non-2xx or `success:false` throws `ApiError`. A 401 fires `onAuthFailure` → redirect to `/login`.

### Nodes — `data/api/endpoints/nodes.api.ts`

| Method | Path | Client fn | Used by |
|--------|------|-----------|---------|
| `GET` | `/projects/:pid/nodes` | `fetchNodes` | hydrate |
| `GET` | `/projects/:pid/nodes/:id` | `fetchNode` | — |
| `POST` | `/projects/:pid/nodes` | `createNode` | persistence |
| `PATCH` | `/projects/:pid/nodes/:id` | `patchNode` | persistence (move/resize/edit) |
| `DELETE` | `/projects/:pid/nodes/:id` | `deleteNode` | persistence |

> The server also exposes `PUT /nodes/:id` (full replace) but the client uses `PATCH` for partial updates.

### Edges — `edges.api.ts`

`fetchEdges`, `createEdge`, `updateEdge` (PUT), `deleteEdge` under `/projects/:pid/edges`. Client uses fetch/create/delete only (edges are immutable once drawn).

### Projects — `projects.api.ts`

| Method | Path | Client fn |
|--------|------|-----------|
| `GET` | `/projects` | `fetchProjects` |
| `GET` | `/projects/:id` | `fetchProject` |
| `POST` | `/projects` | `createProject` (idempotent on `id`) |
| `PUT` | `/projects/:id` | `updateProject` (full body) |
| `PATCH` | `/projects/:id` | `patchProject` (partial — camera, name, description) |
| `PATCH` | `/projects/:id/share` | `patchProjectShare` (`is_public`) |
| `DELETE` | `/projects/:id` | `deleteProject` |

### Snapshots — `snapshots.api.ts`

| Method | Path | Client fn |
|--------|------|-----------|
| `GET` | `/projects/:pid/snapshots` | `listSnapshots` |
| `GET` | `/projects/:pid/snapshots/:id` | `getSnapshot` (includes `data`) |
| `POST` | `/projects/:pid/snapshots` | `createSnapshot` (`data = { nodes, edges, camera }`) |
| `DELETE` | `/projects/:pid/snapshots/:id` | `deleteSnapshot` |

Driven by the `features/snapshots` store + `SnapshotsPanel`. Restore replaces store state; `usePersistence` diffs it and pushes the converging create/patch/delete calls.

### Public (read-only share) — used by `app/share/[projectId]`

`GET /public/projects/:id`, `/public/projects/:id/nodes`, `/public/projects/:id/edges`. No auth; returns data only when `is_public` is true.

### Documents & Sync — present server-side, **unused by the client**

- `/documents/:nodeId` (GET/PUT/DELETE): body content is stored on `node.body`, so these are not called. `documents.api.ts` was removed from the client.
- `/sync/nodes`, `/sync/edges`: superseded by per-entity REST; not called.

---

## Authentication

Supabase JWT, wired in `providers/auth-provider.tsx`:

```ts
import { apiClient } from "@/data/api";

// on session resolve / auth state change:
apiClient.setAuthToken(session.access_token);
// on sign-out:
apiClient.clearAuthToken();
```

On 401 the client's `onAuthFailure` (configured in `endpoints/api-client.ts`) redirects to `/login`.

---

## Running locally

```bash
# backend
cd ../oricalcum-api
uv run uvicorn app.main:app --reload --port 3001   # /health, /docs

# frontend
npm run dev   # NEXT_PUBLIC_API_URL → http://localhost:3001/api/v1
```

End-to-end check: log in → open workspace → add/move/edit/delete nodes & edges → reload (clear `localStorage` key `oricalcum-workspaces` to prove it loads from the API, not cache). Pan/zoom and rename persist across reload. Capture/restore via the history panel. Toggle share → open `/share/:id` incognito.

---

## Folder structure reference

```
src/data/
├── api/
│   ├── api-client.ts            # ApiClient class (fetch wrapper, retry, auth, abort)
│   ├── api.types.ts            # ApiResponse, PaginatedResponse, ApiError
│   ├── endpoints/
│   │   ├── api-client.ts        # Singleton ApiClient instance
│   │   ├── nodes.api.ts         # fetch/create/patch/delete
│   │   ├── edges.api.ts         # fetch/create/update/delete
│   │   ├── projects.api.ts      # CRUD + patchProject + patchProjectShare + public reads
│   │   └── snapshots.api.ts     # list/get/create/delete
│   └── index.ts                 # barrel
└── index.ts                     # re-exports ./api

src/features/canvas/
├── hooks/use-persistence.ts     # hydrate + debounced diff writes (THE sync logic)
└── utils/entity-mappers.ts      # snake_case ↔ camelCase mappers

src/features/snapshots/
├── store/snapshots.store.ts
├── components/snapshots-panel.tsx
└── index.ts
```

---

## History

Removed in `feature/folder-data-storing` (were dead code — wired only to each other, with a camelCase wire contract that didn't match the backend):

- `src/data/repositories/` (`NodeRepository`, `base.repository`)
- `src/data/sync/` (`SyncEngine`, `OfflineQueue`, `ConflictResolver`)
- `src/data/models/` (camelCase api-shape mappers — replaced by `entity-mappers.ts`)
- `src/data/api/endpoints/documents.api.ts` (body lives on the node)
- `SyncPayload` / `SyncResult` types and `syncNodes` / `syncEdges` fns

If real-time collaboration is added later, prefer a WebSocket push channel feeding the existing stores over reviving the batch-sync layer.
