/** Deterministic relative timestamps for mock data (ISO strings). */
export function ago(minutes: number, now = Date.now()): string {
  return new Date(now - Math.round(minutes * 60_000)).toISOString();
}
