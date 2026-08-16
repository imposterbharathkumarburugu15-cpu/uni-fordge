import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  OctagonAlert,
} from "lucide-react";
import type { ActivityEvent } from "@/types/domain";
import { formatRelative } from "@/utils/format";

const SEVERITY_ICON = {
  info: { icon: Info, color: "var(--uf-info)" },
  success: { icon: CheckCircle2, color: "var(--uf-success)" },
  warning: { icon: AlertTriangle, color: "var(--uf-warning)" },
  critical: { icon: OctagonAlert, color: "var(--uf-critical)" },
} as const;

interface ActivityFeedProps {
  items: ActivityEvent[];
  limit?: number;
  showTime?: boolean;
}

export function ActivityFeed({ items, limit, showTime = true }: ActivityFeedProps) {
  const visible = limit ? items.slice(0, limit) : items;
  return (
    <ul className="divide-y divide-[var(--uf-border-faint)]">
      {visible.map((event) => {
        const sev = SEVERITY_ICON[event.severity];
        const Icon = sev.icon;
        return (
          <li key={event.id} className="flex items-start gap-3 py-2.5">
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border"
              style={{ borderColor: sev.color, color: sev.color }}
              aria-hidden
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[var(--uf-text-primary)]">
                {event.title}
              </p>
              {event.detail && (
                <p className="mt-0.5 truncate text-xs text-[var(--uf-text-tertiary)]">
                  {event.detail}
                </p>
              )}
            </div>
            {showTime && (
              <span className="uf-mono mt-0.5 shrink-0 text-[10.5px] text-[var(--uf-text-tertiary)]">
                {formatRelative(event.timestamp)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityMarker({ severity }: { severity: ActivityEvent["severity"] }) {
  return <Circle aria-hidden className="sr-only" data-severity={severity} />;
}
