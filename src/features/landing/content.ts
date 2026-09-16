/**
 * Landing page copy. Everything the marketing page says about the product
 * lives here so the sections stay markup-only and the facts are easy to audit
 * against the app.
 */

export const LANDING = {
  name: "oricalcum",
  motto: "An Oracle for work, teams, and hobbies.",
  pitch:
    "A canvas-first workspace that blends ClickUp structure with Notion flexibility. Lay work out as nodes and edges, write inside each node, and let the assistant build the map with you.",
  github: "https://github.com/AlexGaledo/oricalcum",
} as const;

export const STEPS = [
  {
    n: "01",
    title: "add a node",
    body: "Double-click anywhere on the canvas. A node is an idea, a task or a document: a title plus a rich-text body.",
  },
  {
    n: "02",
    title: "connect it",
    body: "Drag from a node's port onto another node to draw an edge. Pan by dragging, zoom with scroll or pinch, keep your bearings with the minimap.",
  },
  {
    n: "03",
    title: "ask the oracle",
    body: "Say “add nodes for…” and the assistant builds and wires them in the open nodespace. Ask it to schedule a meeting and it lands on the calendar.",
  },
] as const;

export const CAPABILITIES = [
  {
    title: "Canvas-first nodespaces",
    body: "A workspace holds many canvases, organized in a file explorer with folders. Shapes toolbar, minimap, view-only pan and pinch on phones.",
  },
  {
    title: "Rich nodes",
    body: "A TipTap editor in every node: headings, lists, resizable images, code blocks with language detection, and a read-only mode.",
  },
  {
    title: "Edges & ports",
    body: "Drag from a port to connect. Built on React Flow with Zustand stores, so the graph stays responsive as it grows.",
  },
  {
    title: "AI assistant & Chatspace",
    body: "Ask about your workspace from the spark button or the AI Chatspace. Node-building acts only on the nodespace you have open.",
  },
  {
    title: "Meeting scheduler",
    body: "The assistant interviews you for title, date, time and duration, confirms, then adds the meeting to the Calendar.",
  },
  {
    title: "MCP tool surface",
    body: "Twelve tools over nodes, edges and the calendar, served by fastMCP and bound to each request's auth and project scope.",
  },
  {
    title: "Snapshots",
    body: "Capture a workspace state and restore it later.",
  },
  {
    title: "Share & collaborate",
    body: "Invite collaborators from the People tab, or publish a read-only public share link.",
  },
  {
    title: "S3 storage",
    body: "A per-workspace file drive. Upload and preview files; images dropped into nodes are stored there too.",
  },
  {
    title: "Themes & tweaks",
    body: "Mono, Oracle, Cyber and Solar accents; background, node style, glow and motion adjustable from settings or the tweaks panel.",
  },
  {
    title: "Command palette",
    body: "Keyboard shortcuts and a command palette for the whole workspace.",
  },
] as const;

export const ACCENT_PRESETS = [
  { label: "Mono", value: "#10A37F" },
  { label: "Oracle", value: "#8B5CF6" },
  { label: "Cyber", value: "#06B6D4" },
  { label: "Solar", value: "#F59E0B" },
] as const;

export const ARCHITECTURE = [
  { title: "Next.js client", sub: "React Flow · Zustand · TipTap" },
  { title: "FastAPI", sub: "Supabase JWT · SQLAlchemy" },
  { title: "LangGraph ReAct agent", sub: "Gemini · built per request" },
  { title: "fastMCP tools", sub: "nodes · edges · calendar" },
  { title: "Postgres + S3", sub: "Supabase · Alembic · per-workspace drive" },
] as const;

export const MCP_TOOLS = [
  {
    group: "nodes",
    tools: [
      "list_nodes",
      "get_node",
      "create_node",
      "update_node",
      "find_related_nodes",
      "create_summary_node",
    ],
  },
  {
    group: "edges",
    tools: ["list_edges", "connect_nodes", "disconnect_nodes", "get_node_connections"],
  },
  {
    group: "calendar",
    tools: ["list_meetings", "create_meeting"],
  },
] as const;

export const SCREENS = [
  {
    src: "/landing/nodespace.png",
    label: "nodespace",
    caption: "One canvas. Double-click to add a node, drag a port to connect it, prompt the oracle from the bar below.",
    alt: "Oricalcum nodespace canvas with a glowing node inside the neural orb and the AI prompt bar",
  },
  {
    src: "/landing/workspace-hub.png",
    label: "workspace hub",
    caption: "A workspace's front door: live node, edge and crew counters plus its Graphs, Storage, People and Settings modules.",
    alt: "Oricalcum workspace hub showing counters and module cards",
  },
  {
    src: "/landing/dashboard.png",
    label: "dashboard",
    caption: "Every workspace you own or were invited to. New accounts start with a guided Getting Started canvas.",
    alt: "Oricalcum dashboard listing workspaces beside the neural orb",
  },
] as const;

export const SCREEN_SIZE = { width: 1280, height: 720 } as const;

export const STACK = [
  "Next.js",
  "React 19",
  "TypeScript",
  "React Flow",
  "Zustand",
  "TipTap",
  "three.js",
  "FastAPI",
  "PostgreSQL",
  "Supabase",
  "LangGraph",
  "Gemini",
  "fastMCP",
  "AWS S3",
] as const;
