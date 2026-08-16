import { useState } from "react";
import { Mono } from "@/components/common/Mono";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useProducts } from "@/hooks/use-forge-store";
import { DnaRecord } from "./DnaRecord";

/**
 * PRODUCT DNA — the canonical, authoritative product record.
 * What does UniForge believe this product actually is?
 */
export default function ProductDNA() {
  const products = useProducts();
  const withStructure = products.filter((p) => p.attributes.length > 0);
  const [selectedId, setSelectedId] = useState("PRD-0101");
  const selected = withStructure.find((p) => p.id === selectedId) ?? withStructure[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", "Product DNA"]}
        title="Product DNA"
        subtitle="The canonical record for every product — each attribute traces back to source evidence, confidence and verification status."
      />

      <div className="uf-panel overflow-hidden">
        <div className="uf-panel-head">
          <h2 className="uf-section-title">
            <span className="idx">01</span>
            Canonical Records
          </h2>
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            {withStructure.length} structured records
          </span>
        </div>

        {/* record selector */}
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--uf-border-faint)] px-3 py-2.5 scrollbar-none">
          {withStructure.map((p) => {
            const active = p.id === selected?.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`flex shrink-0 items-center gap-2 rounded-sm border px-3 py-1.5 transition-colors ${
                  active
                    ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)]"
                    : "border-[var(--uf-border)] bg-[var(--uf-surface)] hover:border-[var(--uf-border-strong)]"
                }`}
                aria-pressed={active}
              >
                <Mono className="text-[11px] text-[var(--uf-text-primary)]">{p.mpn}</Mono>
                <span className="text-[12px] text-[var(--uf-text-secondary)]">{p.name}</span>
                <StatusBadge status={p.status} />
              </button>
            );
          })}
        </div>

        {selected ? (
          <DnaRecord key={selected.id} productId={selected.id} />
        ) : (
          <div className="px-5 py-10 text-center">
            <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              No structured records yet
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
