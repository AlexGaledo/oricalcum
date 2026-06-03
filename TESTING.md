# Testing

Four layers cover the Oricalcum stack end to end. All run against **real Supabase**
(auth + Postgres) — there is no mock DB. Throwaway accounts (`test+…@oricalcum.test`)
and uuid-scoped rows are created and torn down per run.

| Layer | Where | Run |
|-------|-------|-----|
| Backend API (pytest) | `../oricalcum-api/tests/` | `cd ../oricalcum-api && uv run pytest -v` |
| HTTP smoke | `../oricalcum-api/tests/smoke.py` | start server, then `uv run python tests/smoke.py` |
| Frontend unit (Vitest) | `src/**/*.test.ts` | `npm run test` |
| Frontend E2E (Playwright) | `e2e/` | `npm run e2e` |

## Backend pytest

Real JWT for everything: a shared fixture mints one Supabase account (admin
`create_user`, pre-confirmed), signs in for a real token, and reuses it. A
`second_account` fixture covers 403 ownership. `project` fixture creates/destroys
a project per test (delete cascades to nodes/edges/snapshots).

Covers happy + error paths (401/403/404/409/422), public `is_public` gating, and
cascade delete. `POST /sync/edges` is `xfail` (legacy: `SyncEntity.updated_at`
has no Edge column — endpoint is unused by the client).

## HTTP smoke

`tests/smoke.py` pings every route of a running server once, asserts 2xx, prints a
pass/fail table, cleans up. `API_BASE` env overrides the target (default
`http://localhost:3001/api/v1`).

## Vitest

Pure logic: `entity-mappers` (snake↔camel round-trips, patch emits only mutable
fields), `use-persistence` (hydrate doesn't echo, debounced create/patch, immediate
delete, camera patch), and the snapshots store (capture/restore/refresh/remove).

## Playwright E2E

Drives the real browser through real Supabase login. `playwright.config.ts` launches
**both** servers (FastAPI on 3001, Next dev on 3000). `global-setup` mints the test
account via `POST /auth/signup`; `global-teardown` deletes its projects (API) and the
auth user (Supabase admin REST, service key read from `../oricalcum-api/.env`).

Specs: auth (login / bad creds / redirect), persistence (spawn → POST → reload
rehydrates from API; camera wheel-zoom → PATCH), snapshots (capture → POST → lists),
share (toggle public → `/share/:id` read-only renders the node).

> **Port note:** `.env` sets `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`, but
> the backend here runs on **3001**. The Playwright frontend webServer injects
> `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` so the browser talks to the
> backend it launches. If you run E2E against a manually started stack, align the port.

First run only: `npx playwright install chromium`.
Reuse already-running servers with `PW_NO_SERVER=1 npm run e2e`.
