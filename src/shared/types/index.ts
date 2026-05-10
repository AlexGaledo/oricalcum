export type ShapeId =
  | "rectangle"
  | "circle"
  | "hexagon"
  | "diamond"
  | "cloud"
  | "document";

export type ToolMode = "select" | "connect" | "delete";

export type EdgeAnimationStyle = "flow" | "pulse" | "orbit";

export type BackgroundMode = "plain" | "grid" | "paper" | "collage";

export type FontMode = "mono" | "inter";

export type PortSide = "top" | "right" | "bottom" | "left";

export interface OriNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: ShapeId;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface OriEdge {
  id: string;
  from: string;
  to: string;
  fromPort: PortSide;
  toPort: PortSide;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface Viewport {
  w: number;
  h: number;
}

export interface ShapeDef {
  id: ShapeId;
  label: string;
  w: number;
  h: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  color: string;
}

export type DragGesture =
  | { kind: "pan"; startX: number; startY: number; camX: number; camY: number }
  | { kind: "node"; id: string; startX: number; startY: number; origX: number; origY: number }
  | { kind: "spawn"; shape: ShapeId; x: number; y: number }
  | { kind: "connect"; from: string; fromPort: PortSide; x: number; y: number }
  | null;
