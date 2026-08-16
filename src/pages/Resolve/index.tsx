import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useConflicts,
  useSystemStatus,
} from "@/hooks/use-forge-store";
import { ConflictList } from "./ConflictList";
import { DecisionWorkspace } from "./DecisionWorkspace";

/**
 * RESOLVE — the human decision workspace.
 * Automated processing stops on contested attributes; an engineer
 * decides with full source evidence and an audited reason.
 */
export default function Resolve() {
  const conflicts = useConflicts();
  const system = useSystemStatus();
  const [searchParams, setSearchParams] = useSearchParams();
  const open = conflicts.filter((c) => c.status === "OPEN");
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("conflict") ?? open[0]?.id ?? null,
  );

  // Sync selection with ?conflict= (Prove/Command Center deep links).
  useEffect(() => {
    const fromQuery = searchParams.get("conflict");
    if (fromQuery && conflicts.some((c) => c.id === fromQuery)) {
      setSelectedId(fromQuery);
    } else if (!selectedId && open.length > 0) {
      setSelectedId(open[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const active = conflicts.find((c) => c.id === selectedId);

  const select = (id: string) => {
    setSelectedId(id);
    setSearchParams({ conflict: id }, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", "Resolve"]}
        title="Resolve"
        subtitle="Conflicts that automated processing cannot safely resolve land here. Every decision carries a selected value, reason, source evidence, operator and timestamp."
        meta={
          <>
            <MetaItem label="OPEN" value={`${open.length} conflicts`} tone="var(--uf-warning)" />
            <MetaItem label="QUEUE" value={`${system.resolveQueue} total`} tone="var(--uf-text-secondary)" />
            <MetaItem label="AUDIT" value="full trail" tone="var(--uf-success)" />
          </>
        }
      />

      <div className="uf-panel overflow-hidden">
        <div className="uf-panel-head">
          <h2 className="uf-section-title">
            <span className="idx">01</span>
            Decision Workspace
          </h2>
        </div>
        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          <div className="border-b border-[var(--uf-border-faint)] p-3 lg:border-b-0 lg:border-r">
            <ConflictList
              conflicts={conflicts}
              selectedId={active?.id}
              onSelect={select}
            />
          </div>
          <div className="min-w-0 border-t border-[var(--uf-border-faint)] lg:border-t-0">
            {active ? (
              <DecisionWorkspace key={active.id} conflictId={active.id} />
            ) : (
              <div className="flex min-h-[300px] items-center justify-center">
                <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  No conflicts on record
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
        {label}
      </span>
      <span className="uf-mono text-[11.5px] font-medium" style={{ color: tone }}>
        {value}
      </span>
    </span>
  );
}
