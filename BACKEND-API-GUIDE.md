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

### Nodespace (`/nodespaces`)

A **nodespace** is a graph/file inside a project. Folders nest via `parent_id`; files
own nodes/edges. Each project has ≥1 nodespace; nodes/edges carry `nodespace_id`.

| Wire field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Client- or server-generated |
| `project_id` | `string` | Owning project |
| `parent_id` | `string\|null` | Folder nesting (null = root) |
| `kind` | `"file"\|"folder"` | |
| `name` | `string` | Title |
| `expanded` | `boolean` | Folder UI state |
| `sort` | `number` | Order within parent |
| `nodes` | `{id,x,y}[]` | **Projected** coordinate manifest (read-only; not stored) |
| `created_at`, `updated_at` | `number` | Unix ms |

The `nodes` manifest is the lightweight index (id + title via the row, + node
coordinates) — computed from the nodes table on read, so it's always correct and
loads fast. Full node bodies are fetched separately via `/nodes?nodespace_id=`.

### Node (`/nodes`)

| Wire field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Client-generated |
| `nodespace_id` | `string\|null` | Owning nodespace (the client always sends it) |
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
| `nodespace_id` | `string\|null` | Owning nodespace |
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
> `GET /projects/:pid/nodes` and `/edges` accept an optional `?nodespace_id=` filter — `usePersistence` always passes it so the canvas only loads the active nodespace.

### Nodespaces — `data/api/endpoints/nodespaces.api.ts`

| Method | Path | Client fn | Used by |
|--------|------|-----------|---------|
| `GET` | `/projects/:pid/nodespaces` | `fetchNodespaces` | file tree hydrate (tree + coord manifest) |
| `POST` | `/projects/:pid/nodespaces` | `createNodespace` | new file/folder, import, tutorial seed |
| `PATCH` | `/projects/:pid/nodespaces/:id` | `patchNodespace` | rename / move (`parent_id`) / toggle `expanded` |
| `DELETE` | `/projects/:pid/nodespaces/:id` | `deleteNodespace` | delete (cascades to children + nodes/edges) |

Driven by `features/files` (the "Nodespaces" explorer). The store
(`files.store.ts`) hydrates the tree from the backend and mirrors every mutation;
there is **no local per-file snapshot store anymore**. `usePersistence(projectId,
nodespaceId)` is nodespace-scoped — switching nodespaces re-hydrates from the API.

**Export/Import** (client-side, `features/files/utils/nodespace-io.ts`): a nodespace
serializes to a self-contained JSON (`{ version, nodespace, metadata.nodes[], nodes[],
edges[], camera }`); import recreates it with fresh ids. No server export endpoint.

**Migration**: `features/files/utils/migrate-local-tree.ts` pushes the legacy
local `oricalcum-files` tree to backend nodespaces once per project (guarded by a
`oricalcum-files-migrated:<pid>` flag). The Alembic migration `b2c3d4e5f6a7` backfills
one default nodespace per existing project and adopts its nodes/edges.

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

### Storage (S3) — `data/api/endpoints/storage.api.ts`

Per-workspace files in S3, sandboxed under the `workspaces/{project_id}/` key prefix.
Bytes move **browser ↔ S3 directly via presigned URLs**; the API only mints URLs and does
metadata ops. Access = project **owner or collaborator**. Backend holds AWS creds
(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` in `.env`;
optional `S3_ENDPOINT_URL` for R2/MinIO). Limits: 50 MB/file, MIME allowlist.

| Method | Path | Client fn |
|--------|------|-----------|
| `GET` | `/projects/:pid/storage?prefix=` | `listStorage` (one folder level: `folders[]` + `files[]`) |
| `POST` | `/projects/:pid/storage/presign-upload` | `presignUpload` → PUT URL; browser PUTs bytes |
| `GET` | `/projects/:pid/storage/presign-download?path=` | `presignDownload` (GET URL) |
| `DELETE` | `/projects/:pid/storage?path=` | `deleteStorageItem` (path ending `/` = whole folder) |
| `POST` | `/projects/:pid/storage/folder` | `createFolder` (zero-byte marker) |
| `POST` | `/projects/:pid/storage/move` | `moveStorageItem` (copy+delete; file or folder) |
| `GET` | `/projects/:pid/storage/media?path=` | **auth-free 307 redirect** to a fresh presigned GET |

The `media` endpoint is the **durable `src`** for media embedded in node bodies / avatars
(an `<img>` can't send a Bearer token). Bucket stays private; safety relies on the
**uuid-prefixed keys** that `uploadMedia()` (storage.api) generates. Helpers:
`mediaUrl(pid, path)` builds the stable URL; `uploadMedia(pid, file, folder)` does presign→PUT→return URL.

UI: `features/storage` (`StorageBrowser` at hub route `/workspace/:id/storage`). All node/document
uploads land under `uploded-node-media/`: editor images → `uploded-node-media/`, node attachments
→ `uploded-node-media/{nodeId}/` (listed by prefix, no node-schema change). Workspace avatar →
`_avatar/` (URL stored on `project.settings.avatar`).

#### One-time AWS setup (`../oricalcum-api/infra/`)

Two policies live in `infra/`. Apply both once with an **admin** AWS login — the app's own
IAM user (`oricalcum-s3`) cannot grant itself permissions.

**1. IAM policy — `s3-iam-policy.json`** (attach as an inline policy to user `oricalcum-s3`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "OricalcumObjectRW", "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::oricalcum-bucket/*" },
    { "Sid": "OricalcumListBucket", "Effect": "Allow",
      "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::oricalcum-bucket" }
  ]
}
```

What each line does and **why the API needs it**:

| Action | Resource | Why |
|--------|----------|-----|
| `s3:PutObject` | `bucket/*` (objects) | presigned upload URLs; folder markers (`put_empty`); copy-on-move |
| `s3:GetObject` | `bucket/*` | presigned download/preview URLs; the `media` redirect; copy source on move |
| `s3:DeleteObject` | `bucket/*` | delete file/folder; second half of move (copy → delete) |
| `s3:ListBucket` | `bucket` (the bucket itself) | `list_objects_v2` for the browser. **Note the resource is the bucket ARN, not `/*`** — `ListBucket` is a bucket-level action; putting it on `/*` silently fails with AccessDenied |

Least-privilege: scoped to this one bucket, only the five actions used. No `s3:*`, no other buckets.
Without it every call returns `403 AccessDenied` (this was the initial blocker).

**2. Bucket CORS — `s3-cors.json`** (bucket → Permissions → CORS):

```json
[
  { "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000 }
]
```

Why CORS is needed at all: uploads/downloads go **browser → S3 directly** (the whole point of
presigned URLs — bytes never touch the API). That's a cross-origin request from the Next.js app
to `s3.amazonaws.com`, so the bucket must opt in:

- `AllowedMethods: PUT` — presigned upload (`uploadToPresigned` does `fetch/XHR PUT`).
- `AllowedMethods: GET` — presigned download + image/PDF preview fetches.
- `AllowedOrigins` — the frontend origin(s). Add the prod domain when deploying:
  `["http://localhost:3000", "https://yourdomain.com"]`.
- `AllowedHeaders: *` — lets the signed `Content-Type` (and any `x-amz-*`) headers through on PUT.
- `ExposeHeaders: ETag` — so the browser can read the upload's ETag from the response.
- `MaxAgeSeconds` — caches the preflight `OPTIONS` so the browser doesn't re-ask every upload.

Without CORS the PUT/GET still reach S3 but the browser blocks the JS from reading the result —
uploads appear to hang/fail in devtools with a CORS error.

> Note: the `media` redirect endpoint is server-issued (302 from the API, not a cross-origin
> JS fetch), so an `<img src>` pointing at it works regardless of CORS. CORS only matters for the
> direct presigned PUT/GET the browser makes itself.

Apply via CLI:

```bash
cd ../oricalcum-api
aws iam put-user-policy --user-name oricalcum-s3 --policy-name oricalcum-s3-rw \
  --policy-document file://infra/s3-iam-policy.json --profile admin
aws s3api put-bucket-cors --bucket oricalcum-bucket \
  --cors-configuration file://infra/s3-cors.json --profile admin
```

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
