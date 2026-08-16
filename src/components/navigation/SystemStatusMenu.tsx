import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSystemStatus } from "@/hooks/use-forge-store";
import { formatRelative } from "@/utils/format";

export function SystemStatusMenu() {
  const system = useSystemStatus();
  const operational = system.apiStatus === "OPERATIONAL";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-sm border border-transparent px-2 py-1.5 text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-border)] hover:bg-[var(--uf-surface)] sm:inline-flex"
          aria-label="System status"
        >
          <span
            className={`size-1.5 rounded-full ${
              operational ? "uf-anim-pulse bg-[var(--uf-success)]" : "bg-[var(--uf-warning)]"
            }`}
            aria-hidden
          />
          <span className="uf-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--uf-text-secondary)]">
            Systems {operational ? "Operational" : "Degraded"}
          </span>
          <ChevronDown className="size-3 text-[var(--uf-text-tertiary)]" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[300px] border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] p-0 text-[var(--uf-text-primary)]"
      >
        <DropdownMenuLabel className="px-4 py-3">
          <span className="uf-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)]">
            System status
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--uf-border-faint)]" />
        <div className="space-y-2.5 px-4 py-3 text-[12px]">
          {[
            ["API", system.apiStatus],
            ["LAST SYNC", `${formatRelative(system.lastSync)} · catalogue`],
            ["INTAKE QUEUE", `${system.intakeQueue} docs`],
            ["FORGE QUEUE", `${system.forgeQueue} products`],
            ["PROVE QUEUE", `${system.proveQueue} products`],
            ["RESOLVE QUEUE", `${system.resolveQueue} conflicts`],
            [
              "SOURCE HEALTH",
              `${system.sourceHealth.healthy} healthy · ${system.sourceHealth.degraded} degraded · ${system.sourceHealth.critical} critical`,
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3">
              <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                {k}
              </span>
              <span className="uf-mono text-[11px] text-[var(--uf-text-secondary)]">{v}</span>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
