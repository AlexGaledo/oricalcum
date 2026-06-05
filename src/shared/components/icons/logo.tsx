import type { CSSProperties } from "react";

/**
 * Oricalcum brand mark. Renders the static logo from /public/oricalcum-logo.svg
 * (the single source for the brand). By default it fills its parent, so the
 * existing sized wrappers (.brand-mark, .splash-logo, .ws-sidebar-mark, …) keep
 * controlling dimensions. Pass `size` to force a square box instead.
 */
export function Logo({
  size,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src="/oricalcum-logo.svg"
      alt="Oricalcum"
      width={size}
      height={size}
      className={className}
      style={{
        display: "block",
        width: size ?? "100%",
        height: size ?? "100%",
        objectFit: "contain",
        ...style,
      }}
      draggable={false}
    />
  );
}
