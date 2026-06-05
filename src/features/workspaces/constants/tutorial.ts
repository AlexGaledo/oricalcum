import { uid } from "@/shared/lib/uid";
import type { OriNode, OriEdge, ShapeId, PortSide } from "@/shared/types";

/**
 * The "Getting Started" tutorial workspace — a connected step-flow that teaches
 * new users how Oricalcum works directly on the canvas. Seeded for first-time
 * users and re-creatable from the New-Workspace template picker.
 *
 * `buildTutorial()` stamps fresh ids/timestamps every call so re-creating the
 * template never collides with an existing copy.
 */

export const TUTORIAL_META = {
  name: "Getting Started",
  description: "A guided tour of Oricalcum — read each card, then make it your own.",
  accentColor: "#10A37F",
};

const CARD_W = 244;
const CARD_H = 136;

interface NodeSpec {
  key: string;
  shape: ShapeId;
  x: number;
  y: number;
  title: string;
  body: string;
  w?: number;
  h?: number;
}

// from-key → to-key, with the ports the edge leaves/enters.
interface EdgeSpec {
  from: string;
  to: string;
  fromPort?: PortSide;
  toPort?: PortSide;
}

const NODES: NodeSpec[] = [
  {
    key: "start",
    shape: "hexagon",
    x: 40,
    y: 320,
    w: 236,
    h: 150,
    title: "Start here 👋",
    body:
      "<p><strong>Welcome to Oricalcum</strong> — a visual canvas for ideas, tasks and docs.</p>" +
      "<p>Follow the arrows. <strong>Double-click any card</strong> to open it and read more. " +
      "When you're ready, delete these and start your own.</p>",
  },

  // ── Canvas basics (top row, left → right) ──
  {
    key: "add",
    shape: "rectangle",
    x: 360,
    y: 40,
    title: "1 · Add a node",
    body:
      "<p>Open the <strong>toolbar</strong> (left edge) and pick a shape, or double-click empty canvas.</p>" +
      "<p>A <em>node</em> is a card — an idea, a task, a note.</p>",
  },
  {
    key: "connect",
    shape: "rectangle",
    x: 652,
    y: 40,
    title: "2 · Connect nodes",
    body:
      "<p>Hover a node to reveal its <strong>ports</strong> (the dots on each side). " +
      "Drag from a port to another node to draw an <em>edge</em>.</p>" +
      "<p>Edges show how ideas relate.</p>",
  },
  {
    key: "edit",
    shape: "document",
    x: 944,
    y: 40,
    title: "3 · Edit content",
    body:
      "<p><strong>Double-click</strong> a node to open the rich-text editor: headings, bold, " +
      "lists, images and more.</p>" +
      "<p>Single-click the title to rename it.</p>",
  },
  {
    key: "navigate",
    shape: "rectangle",
    x: 1236,
    y: 40,
    title: "4 · Move around",
    body:
      "<p><strong>Drag</strong> empty canvas to pan, <strong>scroll / pinch</strong> to zoom.</p>" +
      "<p>On phones the canvas is view-only — pan &amp; pinch to explore.</p>",
  },

  // ── Structure + AI (middle row) ──
  {
    key: "nodespaces",
    shape: "document",
    x: 360,
    y: 320,
    title: "Nodespaces & files",
    body:
      "<p>Open the <strong>file explorer</strong> (top-left). Each workspace holds multiple " +
      "<strong>nodespaces</strong> — separate canvases — plus folders to organize them.</p>" +
      "<p>Click one to switch; the canvas swaps to that nodespace.</p>",
  },
  {
    key: "ai",
    shape: "cloud",
    x: 652,
    y: 320,
    w: 252,
    h: 140,
    title: "The AI assistant ✦",
    body:
      "<p>Tap the <strong>spark button</strong> (bottom-right) or the <strong>AI Chatspace</strong>. " +
      "Ask about your workspace, or say “add nodes for…” and it builds + connects them.</p>" +
      "<p>It only acts on the <em>open</em> nodespace.</p>",
  },
  {
    key: "meetings",
    shape: "document",
    x: 944,
    y: 320,
    title: "Schedule meetings",
    body:
      "<p>Ask the assistant to <strong>set up a meeting</strong>. It interviews you for the " +
      "title, date, time and duration, confirms, then adds it to the <strong>Calendar</strong>.</p>",
  },

  // ── Power features (bottom row) ──
  {
    key: "storage",
    shape: "rectangle",
    x: 360,
    y: 600,
    title: "Storage",
    body:
      "<p>The <strong>Storage</strong> tab is your workspace's file drive (backed by S3). " +
      "Upload, preview and organize files; images you drop into nodes live here too.</p>",
  },
  {
    key: "themes",
    shape: "rectangle",
    x: 652,
    y: 600,
    title: "Make it yours",
    body:
      "<p>Change the <strong>accent color</strong> and <strong>theme</strong> from Project " +
      "Settings or the tweaks panel. Backgrounds, node styles and motion are all adjustable.</p>",
  },
  {
    key: "sharing",
    shape: "document",
    x: 944,
    y: 600,
    title: "Share & snapshots",
    body:
      "<p>Invite <strong>collaborators</strong> from the People tab, or publish a " +
      "<strong>read-only share link</strong>.</p>" +
      "<p>Take <strong>snapshots</strong> to capture and restore a workspace state.</p>",
  },
];

const EDGES: EdgeSpec[] = [
  // Start → canvas basics chain
  { from: "start", to: "add", fromPort: "top", toPort: "left" },
  { from: "add", to: "connect" },
  { from: "connect", to: "edit" },
  { from: "edit", to: "navigate" },
  // Start → structure / AI row
  { from: "start", to: "nodespaces" },
  { from: "nodespaces", to: "ai" },
  { from: "ai", to: "meetings" },
  // Down into power features
  { from: "start", to: "storage", fromPort: "bottom", toPort: "left" },
  { from: "nodespaces", to: "storage", fromPort: "bottom", toPort: "top" },
  { from: "ai", to: "themes", fromPort: "bottom", toPort: "top" },
  { from: "meetings", to: "sharing", fromPort: "bottom", toPort: "top" },
];

/** Build a fresh tutorial node/edge set with unique ids + current timestamps. */
export function buildTutorial(): { nodes: OriNode[]; edges: OriEdge[] } {
  const now = Date.now();
  const idByKey: Record<string, string> = {};

  const nodes: OriNode[] = NODES.map((spec) => {
    const id = uid("n");
    idByKey[spec.key] = id;
    const w = spec.w ?? CARD_W;
    const h = spec.h ?? CARD_H;
    return {
      id,
      x: spec.x,
      y: spec.y,
      w,
      h,
      baseW: w,
      baseH: h,
      shape: spec.shape,
      title: spec.title,
      body: spec.body,
      createdAt: now,
      updatedAt: now,
    };
  });

  const edges: OriEdge[] = EDGES.map((e) => ({
    id: uid("e"),
    from: idByKey[e.from],
    to: idByKey[e.to],
    fromPort: e.fromPort ?? "right",
    toPort: e.toPort ?? "left",
  }));

  return { nodes, edges };
}
