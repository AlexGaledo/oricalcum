let counter = 0;
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter.toString(36).padStart(3, "0")}`;
}
