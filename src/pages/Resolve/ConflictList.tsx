import { Check, Scale } from "lucide-react";
import { Mono } from "@/components/common/Mono";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useProducts } from "@/hooks/use-forge-store";
import type { Conflict } from "@/types/domain";
import { formatRelative } from "@/utils/format";

interface ConflictListProps {
  conflicts: Conflict[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConflictList({ conflicts, selectedId, onSelect }: ConflictListProps) {
  const products = useProducts();
  const open = conflicts.filter((c) => c.status === "OPEN");
  const resolved = conflicts.filter((c) => c.status === "RESOLVED");

  const renderItem = (conflict: Conflict) => {
    const active = conflict.id === selectedId;
    const product = products.find((p) => p.id === conflict.productId);
    return (
      <li key={conflict.id}>
        <button
          type="button"
          onClick={() => onSelect(conflict.id)}
          className={`w-full rounded-sm border p-3 text-left transition-colors ${
            active
              ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)]"
              : conflict.status === "OPEN"
                ? "border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] hover:border-[var(--uf-warning)]"
                : "border-[var(--uf-border)] bg-[var(--uf-surface)] hover:border-[var(--uf-border-strong)]"
          }`}
          aria-pressed={active}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`uf-mono text-[11px] font-medium ${
                conflict.status === "OPEN"
                  ? "text-[var(--uf-warning)]"
                  : "text-[var(--uf-text-secondary)]"
              }`}
            >
              {conflict.id}
            </span>
            <StatusBadge status={conflict.status} />
          </div>
          <p className="mt-1.5 truncate text-[13px] font-medium text-[var(--uf-text-primary)]">
            {conflict.attributeLabel} · {product?.name ?? conflict.productId}
          </p>
          <p className="uf-mono mt-0.5 text-[10.5px] text-[var(--uf-text-tertiary)]">
            {conflict.productId} · {conflict.sources.map((s) => s.value).join(" / ")} ·{" "}
            {formatRelative(conflict.openedAt)}
          </p>
          {conflict.requestedEvidence > 0 && (
            <p className="uf-mono mt-1 text-[10px] text-[var(--uf-text-tertiary)]">
              +{conflict.requestedEvidence} evidence request{conflict.requestedEvidence > 1 ? "s" : ""}
            </p>
          )}
        </button>
      </li>
    );
  };

  return (
    <div>
      <p className="uf-mono mb-2 flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
        <Scale className="size-3 text-[var(--uf-warning)]" aria-hidden />
        Open · {open.length}
      </p>
      {open.length > 0 ? (
        <ul className="space-y-2">{open.map(renderItem)}</ul>
      ) : (
        <div className="rounded-sm border border-[var(--uf-success-line)] bg-[var(--uf-success-dim)] px-4 py-6 text-center">
          <Check className="mx-auto size-5 text-[var(--uf-success)]" aria-hidden />
          <p className="uf-mono mt-2 text-[11px] uppercase tracking-[0.12em] text-[var(--uf-success)]">
            No open conflicts
          </p>
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <p className="uf-mono mb-2 mt-6 flex items-center gap-1.5 px-1 text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            <Mono>History</Mono> · {resolved.length}
          </p>
          <ul className="space-y-2 opacity-80">{resolved.map(renderItem)}</ul>
        </>
      )}
    </div>
  );
}
