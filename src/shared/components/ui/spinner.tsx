import { cn } from "@/shared/lib/cn";

interface SpinnerProps {
  /** Diameter in px. Default 14 (inline/button size). */
  size?: number;
  className?: string;
}

/** Small inline spinner for buttons and pending states. */
export function Spinner({ size = 14, className }: SpinnerProps) {
  return (
    <span
      className={cn("spinner-sm", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
