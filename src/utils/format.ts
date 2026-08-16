/** Formatting helpers for operational data. */

const DAY = 86_400_000;

export function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** "14:32:07Z" — UTC clock time for timestamps. */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  return `${d.toISOString().slice(11, 19)}Z`;
}

/** "2026-08-16" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Compact "14:32:07Z · 2026-08-16" */
export function formatTimestamp(iso: string): string {
  return `${formatClock(iso)} · ${formatDate(iso)}`;
}

/** Relative time: "just now", "14m ago", "3h ago", "2d ago". */
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 45_000) return "just now";
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))}m ago`;
  if (diff < DAY) return `${Math.round(diff / 3_600_000)}h ago`;
  return `${Math.round(diff / DAY)}d ago`;
}

/** Confidence 0-1 → "96.8%" */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}
