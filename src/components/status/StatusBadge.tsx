import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Clock,
  Inbox,
  Loader,
  Minus,
  OctagonAlert,
  PackageCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { humanStatus, statusTone, type StatusTone } from "@/utils/status";

const TONE_STYLE: Record<StatusTone, { fg: string; bg: string; border: string }> = {
  accent: {
    fg: "var(--uf-accent)",
    bg: "var(--uf-accent-dim)",
    border: "var(--uf-accent-line)",
  },
  success: {
    fg: "var(--uf-success)",
    bg: "var(--uf-success-dim)",
    border: "var(--uf-success-line)",
  },
  warning: {
    fg: "var(--uf-warning)",
    bg: "var(--uf-warning-dim)",
    border: "var(--uf-warning-line)",
  },
  critical: {
    fg: "var(--uf-critical)",
    bg: "var(--uf-critical-dim)",
    border: "var(--uf-critical-line)",
  },
  neutral: {
    fg: "var(--uf-text-secondary)",
    bg: "rgba(255,255,255,0.04)",
    border: "var(--uf-border)",
  },
};

const ICONS: Record<string, LucideIcon> = {
  INTAKE: Inbox,
  FORGING: Shield,
  PROVING: Shield,
  PROCESSING: Loader,
  QUEUED: Clock,
  EXPORTING: Loader,
  VERIFIED: BadgeCheck,
  READY: PackageCheck,
  INGESTED: Check,
  EXPORTED: PackageCheck,
  RESOLVED: Check,
  PASSED: Check,
  HEALTHY: ShieldCheck,
  REQUIRES_REVIEW: AlertTriangle,
  REVIEW: AlertTriangle,
  CONFLICT: AlertTriangle,
  WARNINGS: AlertTriangle,
  DEGRADED: ShieldAlert,
  FAILED: OctagonAlert,
  BLOCKED: OctagonAlert,
  CRITICAL: ShieldX,
  UNVERIFIED: Minus,
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: StatusTone;
  icon?: ReactNode;
  spin?: boolean;
  className?: string;
}

/** Status indicator — icon + label + color, never color alone. */
export function StatusBadge({
  status,
  label,
  tone,
  icon,
  spin,
  className = "",
}: StatusBadgeProps) {
  const resolvedTone = tone ?? statusTone(status);
  const style = TONE_STYLE[resolvedTone];
  const Icon = ICONS[status];
  return (
    <span
      className={`uf-status inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10.5px] whitespace-nowrap ${className}`}
      style={{ color: style.fg, background: style.bg, borderColor: style.border }}
    >
      {icon ??
        (Icon ? (
          <Icon className={`size-3 ${spin ? "animate-spin" : ""}`} aria-hidden />
        ) : null)}
      {label ?? humanStatus(status)}
    </span>
  );
}
