import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function CursorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 3 L5 18 L9 14 L11.5 19 L13.5 18 L11 13 L17 13 Z" />
    </svg>
  );
}
export function HexIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4 L15 4 L20 12 L15 20 L9 20 L4 12 Z" />
    </svg>
  );
}
export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 14 a4 4 0 0 1 0-5.66 l3-3 a4 4 0 0 1 5.66 5.66 l-1.5 1.5" />
      <path d="M14 10 a4 4 0 0 1 0 5.66 l-3 3 a4 4 0 0 1 -5.66 -5.66 l1.5 -1.5" />
    </svg>
  );
}
export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7 L20 7 M9 7 L9 5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2 M6 7 L7 20 a1 1 0 0 0 1 1 h8 a1 1 0 0 0 1 -1 L18 7 M10 11 L10 17 M14 11 L14 17" />
    </svg>
  );
}
export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4 a8 8 0 0 0 0 16 c1.5 0 2 -1 2 -2 c0 -1 -1 -1.5 -1 -2.5 c0 -1 1 -1.5 2.5 -1.5 h2 a3 3 0 0 0 3 -3 a8 8 0 0 0 -8.5 -7" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="11" cy="7.5" r="1" />
      <circle cx="16" cy="9" r="1" />
    </svg>
  );
}
export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
export function ExpandIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4 L20 4 L20 10 M20 4 L14 10 M10 20 L4 20 L4 14 M4 20 L10 14" />
    </svg>
  );
}
export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5 L12 19 M5 12 L19 12" />
    </svg>
  );
}
export function ZoomInIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 7 L12 17 M7 12 L17 12" />
    </svg>
  );
}
export function ZoomOutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 12 L17 12" />
    </svg>
  );
}
export function SlidersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6 L20 6 M4 12 L20 12 M4 18 L20 18" />
      <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 12 C 5 6, 9 4, 12 4 C 15 4, 19 6, 22 12 C 19 18, 15 20, 12 20 C 9 20, 5 18, 2 12 Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3 L21 21" />
      <path d="M10.6 6.2 C 11.1 6.1, 11.6 6, 12 6 C 15 6, 19 8, 22 14" />
      <path d="M2 14 C 3.5 11, 5.5 8.8, 7.6 7.6" />
      <path d="M9.5 11.5 a 3 3 0 0 0 4 4" />
    </svg>
  );
}
export function FitIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8 L4 4 L8 4 M16 4 L20 4 L20 8 M20 16 L20 20 L16 20 M8 20 L4 20 L4 16" />
    </svg>
  );
}
export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51 L15.42 17.49 M15.41 6.51 L8.59 10.49" />
    </svg>
  );
}
