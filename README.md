# Oricalcum

Oricalcum is an AI-powered workspace that blends the structure of ClickUp with the flexibility of Notion. It is designed for fast, visual thinking with a canvas-first flow, while MCP tools bring automation and context-aware assistance directly into the workspace.

## What it is

Oricalcum is a visual, node-based workspace for planning, writing, and coordinating work in one place. It favors speed, clarity, and collaboration without the overhead of complex setup.

## Core experience

- Canvas-first workspace for mapping ideas, tasks, and documents
- Rich node content with flexible layouts and relationships
- Snapshots to capture and restore workspace states
- Public share view for read-only collaboration
- MCP tool integration for AI-assisted workflows

## Quick start (local)

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the backend (separate repo):

```bash
cd ../oricalcum-api
uv run uvicorn app.main:app --reload --port 3001
```

## Environment variables

Create a .env.local at the repo root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

If you run the backend on a different port, update the URL accordingly.

## Useful scripts

- npm run dev: start Next.js dev server
- npm run build: production build
- npm run start: start production server
- npm run lint: Next.js lint
- npm run typecheck: TypeScript type check
- npm run test: Vitest unit tests
- npm run test:watch: Vitest watch mode
- npm run e2e: Playwright E2E

## Testing

- Unit tests (Vitest): npm run test
- E2E tests (Playwright): npm run e2e
- Backend tests live in ../oricalcum-api/tests

First-time Playwright install:

```bash
npx playwright install chromium
```

## Backend integration notes

The backend is the source of truth. Local storage is only a cache / first-run seed.

See BACKEND-API-GUIDE.md for full details.

## CI/CD

GitHub Actions runs typecheck + build and deploys to Vercel. See cicd_guide.md for setup and required secrets.
