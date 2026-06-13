"use client";

import type { ShapeId } from "@/shared/types";

interface ShapeGlyphProps {
  id: ShapeId;
}

export function ShapeGlyph({ id }: ShapeGlyphProps) {
  const stroke = "currentColor";
  const sw = 1.4;
  const f = "none";
  switch (id) {
    case "rectangle":
      return (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="6.5" width="18" height="11" rx="2" fill={f} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="7" fill={f} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M8 5 L16 5 L20 12 L16 19 L8 19 L4 12 Z" fill={f} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 4 L20 12 L12 20 L4 12 Z" fill={f} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "cloud":
      return (
        <svg viewBox="0 0 24 24">
          <path
            d="M7 16 Q4 16 4 13 Q4 10.5 6.5 10.2 Q6.7 7 10 7 Q12.5 7 13.5 9 Q15 8.5 16.5 9.5 Q18.5 10.5 18.5 12.5 Q21 13 21 15 Q21 16 20 16 Z"
            fill={f}
            stroke={stroke}
            strokeWidth={sw}
          />
        </svg>
      );
    case "document":
      return (
        <svg viewBox="0 0 24 24">
          <path
            d="M6 4 L15 4 L19 8 L19 20 L6 20 Z M15 4 L15 8 L19 8"
            fill={f}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

interface NodeShapeBgProps {
  shape: ShapeId;
  width: number;
  height: number;
}

export function NodeShapeBg({ shape, width, height }: NodeShapeBgProps) {
  if (shape === "rectangle" || shape === "circle" || shape === "document") return null;
  const w = width;
  const h = height;
  let path = "";
  if (shape === "hexagon") {
    const inset = h * 0.5;
    path = `M${inset} 1 L${w - inset} 1 L${w - 1} ${h / 2} L${w - inset} ${h - 1} L${inset} ${h - 1} L1 ${h / 2} Z`;
  } else if (shape === "diamond") {
    path = `M${w / 2} 1 L${w - 1} ${h / 2} L${w / 2} ${h - 1} L1 ${h / 2} Z`;
  } else if (shape === "cloud") {
    path = `M${w * 0.18} ${h * 0.9}
            Q${w * 0.02} ${h * 0.85} ${w * 0.06} ${h * 0.55}
            Q${w * 0.03} ${h * 0.3} ${w * 0.22} ${h * 0.28}
            Q${w * 0.28} ${h * 0.08} ${w * 0.45} ${h * 0.12}
            Q${w * 0.58} ${h * 0.0} ${w * 0.7} ${h * 0.18}
            Q${w * 0.86} ${h * 0.12} ${w * 0.94} ${h * 0.38}
            Q${w * 1.0} ${h * 0.62} ${w * 0.86} ${h * 0.78}
            Q${w * 0.84} ${h * 0.96} ${w * 0.62} ${h * 0.92}
            Q${w * 0.4} ${h * 1.0} ${w * 0.18} ${h * 0.9} Z`;
  }
  return (
    <svg className="node-shape" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={path}
        fill="rgba(19, 22, 26, 0.72)"
        stroke="rgba(var(--accent-rgb), 0.65)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
