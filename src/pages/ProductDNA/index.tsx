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
 * One continuous engineering workspace:
 *   compact identity header → pipeline rail → record selector → attribute matrix.
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
      {/* compact product identity header */}
      {dna && selected && (
        <section
          aria-label="Product identity"
          className="border-b border-[var(--uf-border-faint)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="uf-mono text-[21px] font-semibold tracking-tight text-[var(--uf-text-primary)]">
                  {dna.mpn}
                </h1>
                <span aria-hidden className="text-[13px] text-[var(--uf-text-tertiary)]">
                  ·
                </span>
                <span className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] [font-family:var(--uf-font-condensed)]">
                  {dna.name}
                </span>
              </div>
              <dl className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-1.5">
                <Meta label="Product ID" value={dna.productId} />
                <Meta label="Supplier" value={supplier?.name ?? "—"} />
                <Meta label="Category" value={dna.category} />
                <Meta label="Revision" value={String(dna.revision).padStart(2, "0")} />
                <Meta label="Last verified" value={formatTimestamp(dna.lastVerifiedAt)} />
              </dl>
            </div>

            {/* record readouts — plain label/value, hairline dividers, no boxes */}
            <div className="flex shrink-0 items-stretch divide-x divide-[var(--uf-border-faint)]">
              <Readout
                label="Record state"
                value={
                  openConflicts.length > 0
                    ? "Requires review"
                    : dna.verifiedCount === dna.totalCount
                      ? "Verified"
                      : "In progress"
                }
                tone={
                  openConflicts.length > 0
                    ? "var(--uf-warning)"
                    : dna.verifiedCount === dna.totalCount
                      ? "var(--uf-success)"
                      : "var(--uf-accent)"
                }
              />
              <Readout
                label="Verified"
                value={`${dna.verifiedCount}/${dna.totalCount}`}
                tone="var(--uf-success)"
              />
              <Readout
                label="Confidence"
                value={formatPercent(dna.confidence)}
                tone="var(--uf-accent)"
              />
            </div>
          </div>
        </section>
      )}

      {/* pipeline rail — thin horizontal process line, PRODUCT DNA active,
          RESOLVE flagged when the selected record has open conflicts */}
      <section aria-label="Pipeline stages" className="border-b border-[var(--uf-border-faint)]">
        <div className="flex items-center overflow-x-auto py-1.5 scrollbar-none">
          {STAGES.map((stage, i) => {
            const active = stage.stage === ACTIVE_STAGE;
            const review = stage.stage === "RESOLVE" && openConflicts.length > 0;
            const passed = i < activeIdx;
            return (
              <div key={stage.stage} className="flex shrink-0 items-center">
                <Link
                  to={stage.path}
                  aria-current={active ? "step" : undefined}
                  className={`relative flex items-center gap-2 px-3 py-2 transition-colors md:px-4 ${
                    active
                      ? "text-[var(--uf-text-primary)]"
                      : review
                        ? "text-[var(--uf-warning)]"
                        : passed
                          ? "text-[var(--uf-text-secondary)] hover:text-[var(--uf-text-primary)]"
                          : "text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-secondary)]"
                  }`}
                >
                  <span
                    className={`uf-mono text-[9px] ${
                      active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-tertiary)]"
                    }`}
                  >
                    {stage.index}
                  </span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] [font-family:var(--uf-font-condensed)]">
                    {stage.label}
                  </span>
                  {review && (
                    <span className="flex items-center gap-1" aria-label="Open conflicts require review">
                      <span className="uf-dot uf-dot-warning" aria-hidden />
                      <span className="uf-mono text-[8px] uppercase tracking-[0.1em] text-[var(--uf-warning)]">
                        Review
                      </span>
                    </span>
                  )}
                  {active && (
                    <span
                      className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--uf-accent)]"
                      aria-hidden
                    />
                  )}
                </Link>
                {i < STAGES.length - 1 && (
                  <span
                    className={`h-px w-5 md:w-9 ${
                      passed || review
                        ? "bg-[var(--uf-border-strong)]"
                        : "bg-[var(--uf-border)]"
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
          <span className="uf-mono ml-auto hidden shrink-0 pl-4 text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)] lg:block">
            Stage 05 / 06 · canonical product truth
          </span>
        </div>
      </section>

      {/* record selector — flat strip, hairline dividers */}
      <section
        aria-label="Canonical records"
        className="flex items-stretch overflow-x-auto border-b border-[var(--uf-border-faint)] scrollbar-none"
      >
        <div className="flex shrink-0 items-center gap-2 border-r border-[var(--uf-border-faint)] px-4">
          <span className="uf-mono text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
            Records
          </span>
          <span className="uf-mono text-[9.5px] text-[var(--uf-text-tertiary)]">
            {withStructure.length}
          </span>
        </div>
        {withStructure.map((p) => {
          const active = p.id === selected?.id;
          const verified = p.attributes.filter((a) => a.verification === "VERIFIED").length;
          const dot = TONE_COLOR[statusTone(p.status)];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              aria-pressed={active}
              className={`relative flex shrink-0 items-center gap-2.5 border-r border-[var(--uf-border-faint)] px-4 py-2.5 text-left transition-colors ${
                active
                  ? "bg-[rgba(255,255,255,0.03)]"
                  : "hover:bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              {active && (
                <span className="absolute inset-y-0 left-0 w-[2px] bg-[var(--uf-accent)]" aria-hidden />
              )}
              <span className="uf-dot" style={{ background: dot }} aria-hidden />
              <span
                className={`uf-mono text-[11px] font-medium ${
                  active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-primary)]"
                }`}
              >
                {p.mpn}
              </span>
              <span className="hidden text-[11px] text-[var(--uf-text-secondary)] md:inline">
                {p.name}
              </span>
              <span
                className={`uf-mono text-[9px] ${
                  active ? "text-[var(--uf-accent)]" : "text-[var(--uf-text-tertiary)]"
                }`}
              >
                {verified}/{p.attributes.length}
              </span>
            </button>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="uf-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
        {label}
      </dt>
      <dd className="uf-mono mt-0.5 text-[11px] text-[var(--uf-text-primary)]">{value}</dd>
    </div>
  );
}

function Readout({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="px-5 py-1">
      <p className="uf-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
        {label}
      </p>
      <p className="uf-mono mt-1 text-[12.5px] font-semibold" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}
