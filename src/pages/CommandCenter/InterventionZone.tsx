import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { useOpenConflicts } from "@/hooks/use-forge-store";

/**
 * Operational intervention — what needs human review right now.
 * Rendered as a full-width engineering alert band, not a small card.
 */
export function InterventionZone() {
  const navigate = useNavigate();
  const conflicts = useOpenConflicts();

  if (conflicts.length === 0) {
    return (
      <section className="rounded-md border border-[var(--uf-success-line)] bg-[var(--uf-success-dim)] px-5 py-4">
        <p className="uf-mono text-[12px] uppercase tracking-[0.14em] text-[var(--uf-success)]">
          ✓ No conflicts awaiting review — pipeline is clear.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-md border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)]"
      aria-label="Operational intervention"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--uf-warning-line)] px-5 py-3">
        <AlertTriangle className="size-4 text-[var(--uf-warning)]" aria-hidden />
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] [font-family:var(--uf-font-condensed)] text-[var(--uf-warning)]">
          {conflicts.length} conflicts require human review
        </h2>
        <span className="ml-auto hidden text-[12px] text-[var(--uf-text-secondary)] sm:block">
          Automated processing stopped on these attributes pending decision.
        </span>
        <button
          type="button"
          onClick={() => navigate("/resolve")}
          className="uf-mono inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.1em] text-[var(--uf-warning)] transition-colors hover:text-[var(--uf-text-primary)]"
        >
          Open workspace
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="grid divide-y divide-[var(--uf-warning-line)] md:grid-cols-2 md:divide-x md:divide-y-0">
        {conflicts.slice(0, 4).map((conflict) => (
          <button
            key={conflict.id}
            type="button"
            onClick={() => navigate(`/resolve?conflict=${conflict.id}`)}
            className="flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--uf-surface)]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[var(--uf-text-primary)]">
                {conflict.productId} · {conflict.attributeLabel}
              </p>
              <p className="uf-mono mt-0.5 truncate text-[11px] text-[var(--uf-text-tertiary)]">
                {conflict.sources.map((s) => s.value).join(" / ")} ·{" "}
                {conflict.sources.length} sources
              </p>
            </div>
            <div className="hidden sm:block">
              <ConfidenceMeter value={conflict.recommendationConfidence} size="sm" />
            </div>
            <span className="uf-mono shrink-0 text-[11px] text-[var(--uf-warning)]">
              {conflict.id}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
