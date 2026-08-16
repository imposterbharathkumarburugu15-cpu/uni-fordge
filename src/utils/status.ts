export type StatusTone = "accent" | "success" | "warning" | "critical" | "neutral";

const TONE_BY_STATUS: Record<string, StatusTone> = {
  // pipeline / product
  INTAKE: "accent",
  FORGING: "accent",
  PROVING: "accent",
  PROCESSING: "accent",
  QUEUED: "accent",
  EXPORTING: "accent",
  OPERATIONAL: "success",
  // verified / ready
  VERIFIED: "success",
  READY: "success",
  INGESTED: "success",
  EXPORTED: "success",
  RESOLVED: "success",
  PASSED: "success",
  HEALTHY: "success",
  // review / conflict
  REQUIRES_REVIEW: "warning",
  REVIEW: "warning",
  CONFLICT: "warning",
  WARNINGS: "warning",
  DEGRADED: "warning",
  // failed / blocked
  FAILED: "critical",
  BLOCKED: "critical",
  CRITICAL: "critical",
};

export function statusTone(status: string): StatusTone {
  return TONE_BY_STATUS[status] ?? "neutral";
}

export function humanStatus(status: string): string {
  return status.replace(/_/g, " ");
}
