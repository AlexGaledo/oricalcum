export function uid(prefix: string): string {
  try {
    return `${prefix}_${crypto.randomUUID()}`;
  } catch {
    const fallback = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}_${fallback}`;
  }
}
