import { cn } from "@/shared/lib/cn";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
}

/** Shimmer placeholder block shown while content is loading. */
export function Skeleton({ width = "100%", height = 16, radius = 6, className }: SkeletonProps) {
  return (
    <span
      className={cn("skeleton", className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden
    />
  );
}
