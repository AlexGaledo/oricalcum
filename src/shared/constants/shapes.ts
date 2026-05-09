import type { ShapeDef, ShapeId } from "@/shared/types";

export const SHAPES: ShapeDef[] = [
  { id: "rectangle", label: "Rect", w: 160, h: 64 },
  { id: "circle", label: "Circle", w: 120, h: 120 },
  { id: "hexagon", label: "Hex", w: 168, h: 80 },
  { id: "diamond", label: "Diamond", w: 160, h: 96 },
  { id: "cloud", label: "Cloud", w: 180, h: 88 },
  { id: "document", label: "Doc", w: 168, h: 72 },
];

export const SHAPE_BY_ID: Record<ShapeId, ShapeDef> = Object.fromEntries(
  SHAPES.map((s) => [s.id, s]),
) as Record<ShapeId, ShapeDef>;

export const SHAPE_TITLES: Record<ShapeId, string> = {
  rectangle: "idea",
  circle: "concept",
  hexagon: "system",
  diamond: "decision",
  cloud: "thought",
  document: "spec",
};
