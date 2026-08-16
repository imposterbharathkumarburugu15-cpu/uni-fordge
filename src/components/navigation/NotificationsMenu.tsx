import { Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { useActivity } from "@/hooks/use-forge-store";

export function NotificationsMenu() {
  const activity = useActivity();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const hasAlerts = activity.some(
    (e) => e.severity === "warning" || e.severity === "critical",
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-sm border border-transparent text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-border)] hover:bg-[var(--uf-surface)] hover:text-[var(--uf-text-primary)]"
          aria-label={`Notifications${hasAlerts ? " — alerts pending" : ""}`}
        >
          <Bell className="size-4" aria-hidden />
          {hasAlerts && (
            <span
              className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--uf-accent)]"
              aria-hidden
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] p-0 text-[var(--uf-text-primary)]"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="uf-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
            System activity
          </span>
          <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
            {activity.length} events
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--uf-border-faint)]" />
        <div className="max-h-[320px] overflow-y-auto px-4 py-1">
          <ActivityFeed items={activity} limit={8} />
        </div>
        <DropdownMenuSeparator className="bg-[var(--uf-border-faint)]" />
        <DropdownMenuItem
          onSelect={() => {
            setOpen(false);
            navigate("/command-center");
          }}
          className="justify-center py-2.5 text-[12px] text-[var(--uf-accent)] focus:bg-[var(--uf-accent-dim)] focus:text-[var(--uf-accent)]"
        >
          VIEW ALL IN COMMAND CENTER
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
