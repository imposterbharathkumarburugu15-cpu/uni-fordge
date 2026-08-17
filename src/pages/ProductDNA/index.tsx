import { useState } from "react";
import { Link } from "react-router";
import {
  useConflicts,
  useProductDna,
  useProducts,
  useSuppliers,
} from "@/hooks/use-forge-store";
import { formatPercent, formatTimestamp } from "@/utils/format";
import { STAGES } from "@/utils/pipeline";
import { statusTone, type StatusTone } from "@/utils/status";
import { DnaRecord } from "./DnaRecord";

/**
 * PRODUCT DNA — the canonical, authoritative product record.
 * A flat, continuous engineering workspace: identity line, process rail,
 * record line, then the attribute matrix. No cards, panels, tiles or boxes —
 * information is printed directly onto the workspace.
 */

const TONE_COLOR: Record<StatusTone, string> = {
  accent: "var(--uf-accent)",
  success: "var(--uf-success)",
  warning: "var(--uf-warning)",
  critical: "var(--uf-critical)",
  neutral: "var(--uf-text-tertiary)",
};

const ACTIVE_STAGE = "PRODUCT_DNA";

export default function ProductDNA() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const conflicts = useConflicts();
  const withStructure = products.filter((p) => p.attributes.length > 0);
  const [selectedId, setSelectedId] = useState("PRD-0101");
  const selected = withStructure.find((p) => p.id === selectedId) ?? withStructure[0];
  const dna = useProductDna(selected?.id);
  const supplier = suppliers.find((s) => s.id === selected?.supplierId);
  const openConflicts = selected
    ? conflicts.filter((c) => c.productId === selected.id && c.status === "OPEN")
    : [];

  const activeIdx = STAGES.findIndex((s) => s.stage === ACTIVE_STAGE);

  return (
    /* full-bleed solid workspace — no decorative background texture */
    <div className="relative -mx-4 -my-6 flex flex-col bg-[var(--uf-bg)] px-4 py-6 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      {/* flat identity header — printed line, no boxes */}
      {dna && selected && (
        <section
          aria-label="Product identity"
          className="border-b border-[var(--uf-border-faint)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-4 py-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="uf-mono text-[24px] font-semibold leading-none tracking-tight text-[var(--uf-text-primary)]">
                  {dna.mpn}
                </h1>
                <span aria-hidden className="text-[15px] text-[var(--uf-text-tertiary)]">
                  ·
                </span>
                <span className="text-[16px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] [font-family:var(--uf-font-condensed)]">
                  {dna.name}
                </span>
              </div>
              <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[11px] leading-relaxed">
                <MetaInline label="Product ID" value={dna.productId} />
                <Sep />
                <MetaInline label="Supplier" value={supplier?.name ?? "—"} />
                <Sep />
                <MetaInline label="Category" value={dna.category} />
                <Sep />
                <MetaInline label="Revision" value={String(dna.revision).padStart(2, "0")} />
                <Sep />
                <MetaInline label="Last verified" value={formatTimestamp(dna.lastVerifiedAt)} />
              </p>
            </div>
            <p className="uf-mono shrink-0 pt-1 text-right text-[11px] leading-relaxed">
              <span
                style={{
                  color:
                    openConflicts.length > 0
                      ? "var(--uf-warning)"
                      : dna.verifiedCount === dna.totalCount
                        ? "var(--uf-success)"
                        : "var(--uf-accent)",
                }}
              >
                {openConflicts.length > 0
                  ? "Requires review"
                  : dna.verifiedCount === dna.totalCount
                    ? "Verified"
                    : "In progress"}
              </span>
              <Sep />
              <span className="text-[var(--uf-text-secondary)]">
                {dna.verifiedCount}/{dna.totalCount} verified
              </span>
              <Sep />
              <span className="text-[var(--uf-text-secondary)]">
                confidence <span className="text-[var(--uf-accent)]">{formatPercent(dna.confidence)}</span>
              </span>
            </p>
          </div>
        </section>
      )}

      {/* pipeline rail — one thin horizontal process line */}
      <section
        aria-label="Pipeline stages"
        className="flex items-center overflow-x-auto py-2.5 scrollbar-none"
      >
        {STAGES.map((stage, i) => {
          const active = stage.stage === ACTIVE_STAGE;
          const review = stage.stage === "RESOLVE" && openConflicts.length > 0;
          const passed = i < activeIdx;
          return (
            <div key={stage.stage} className="flex shrink-0 items-center">
              <Link
                to={stage.path}
                aria-current={active ? "step" : undefined}
                className={`relative whitespace-nowrap px-1 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] [font-family:var(--uf-font-condensed)] transition-colors ${
                  active
                    ? "text-[var(--uf-accent)]"
                    : review
                      ? "text-[var(--uf-warning)]"
                      : passed
                        ? "text-[var(--uf-text-secondary)] hover:text-[var(--uf-text-primary)]"
                        : "text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-secondary)]"
                }`}
              >
                {stage.label}
                {review && (
                  <span className="ml-1.5 inline-flex items-center gap-1 align-middle">
                    <span className="uf-dot uf-dot-warning" aria-hidden />
                    <span className="uf-mono text-[8px] uppercase tracking-[0.1em] text-[var(--uf-warning)]">
                      Review
                    </span>
                  </span>
                )}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--uf-accent)]" aria-hidden />
                )}
              </Link>
              {i < STAGES.length - 1 && (
                <span
                  className="h-px w-6 shrink-0 bg-[var(--uf-border-strong)] md:w-10"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </section>

      {/* record line — flat text switcher, no boxes */}
      <section
        aria-label="Canonical records"
        className="flex items-center overflow-x-auto border-b border-[var(--uf-border-faint)] py-2 scrollbar-none"
      >
        <span className="uf-mono shrink-0 text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
          Records
        </span>
        {withStructure.map((p, idx) => {
          const active = p.id === selected?.id;
          const verified = p.attributes.filter((a) => a.verification === "VERIFIED").length;
          const dot = TONE_COLOR[statusTone(p.status)];
          return (
            <span key={p.id} className="flex shrink-0 items-center gap-2.5">
              {idx > 0 && (
                <span aria-hidden className="text-[10px] text-[var(--uf-border-strong)]">
                  ·
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 transition-opacity ${
                  active ? "" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0" style={{ background: dot }} aria-hidden />
                <span
                  className={`uf-mono text-[10.5px] font-medium ${
                    active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-secondary)]"
                  }`}
                >
                  {p.mpn}
                </span>
              </button>
            </span>
          );
        })}
      </section>

      {selected ? (
        <DnaRecord key={selected.id} productId={selected.id} />
      ) : (
        <div className="flex min-h-[320px] items-center justify-center">
          <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            No structured records yet — forge attributes to begin
          </span>
        </div>
      )}
    </div>
  );
}

function MetaInline({ label, value }: { label: string; value: string }) {
  return (
    <span className="uf-mono whitespace-nowrap text-[var(--uf-text-tertiary)]">
      {label} <span className="text-[var(--uf-text-secondary)]">{value}</span>
    </span>
  );
}

function Sep() {
  return (
    <span aria-hidden className="shrink-0 text-[9px] text-[var(--uf-border-strong)]">
      ·
    </span>
  );
}
