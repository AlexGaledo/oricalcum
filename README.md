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

## Using Oricalcum

New accounts open with a **Getting Started** workspace — a guided tour laid out on the
canvas. You can re-create it anytime from **New Workspace → Getting Started**, and delete it
once you're comfortable.

### Concepts

- **Workspace** — a project. It contains your canvases, files, calendar, and people.
- **Nodespace** — a single canvas inside a workspace. A workspace can hold several (see the
  file explorer); switching nodespaces swaps what's on screen.
- **Node** — a card on the canvas: an idea, task, or document. Nodes have a title and a
  rich-text body.
- **Edge** — a connection between two nodes, showing how they relate.

### Canvas basics

1. **Add a node** — pick a shape from the toolbar (left edge) or double-click empty canvas.
2. **Connect nodes** — hover a node to reveal its ports (dots on each side) and drag from a
   port to another node to draw an edge.
3. **Edit content** — double-click a node to open the rich-text editor (headings, bold,
   lists, images); single-click the title to rename.
4. **Move around** — drag empty canvas to pan, scroll/pinch to zoom. On phones the canvas is
   view-only (pan & pinch to explore).

### Nodespaces & files

Open the file explorer (top-left of the canvas). Each workspace can hold multiple
nodespaces plus folders to organize them. Click one to switch the canvas to it.

### The AI assistant & meetings

Tap the spark button (bottom-right) or open the **AI Chatspace**. Ask about your workspace,
or say *"add nodes for…"* and the assistant builds and connects them — it acts only on the
**open** nodespace. Ask it to **schedule a meeting** and it interviews you for the title,
date, time, and duration, confirms, then adds it to the **Calendar**.

### Storage, themes, and sharing

- **Storage** — each workspace has a file drive (backed by S3). Upload and preview files;
  images dropped into nodes are stored here too.
- **Themes** — change the accent color, background, node style, and motion from Project
  Settings or the tweaks panel.
- **Sharing & snapshots** — invite collaborators from the People tab, publish a read-only
  share link, and take snapshots to capture/restore a workspace state.

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
