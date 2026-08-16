import { useState } from "react";
import { Mono } from "@/components/common/Mono";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useProducts, useSystemStatus } from "@/hooks/use-forge-store";
import { AttributeBoard, ProveSummary } from "./AttributeBoard";

/**
 * PROVE — validates product attributes against source evidence.
 * "Can we prove that this attribute is correct?"
 */
export default function Prove() {
  const products = useProducts();
  const system = useSystemStatus();
  const candidates = products.filter(
    (p) => p.stage === "PROVE" || p.stage === "RESOLVE",
  );
  const [selectedId, setSelectedId] = useState("PRD-0101");
  const selected = candidates.find((p) => p.id === selectedId) ?? candidates[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={["UniForge", "Prove"]}
        title="Prove"
        subtitle="Every attribute is checked against source evidence — page references, extracted values and confidence. Conflicts surface for human review."
        meta={
          <>
            <MetaItem label="IN PROVE" value={`${system.proveQueue} products`} tone="var(--uf-accent)" />
            <MetaItem label="OPEN CONFLICTS" value={`${system.resolveQueue}`} tone="var(--uf-warning)" />
          </>
        }
      />

      <div className="uf-panel overflow-hidden">
        <div className="uf-panel-head">
          <h2 className="uf-section-title">
            <span className="idx">01</span>
            Attribute Verification Board
          </h2>
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            {candidates.length} products under proof
          </span>
        </div>

        {/* product selector */}
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--uf-border-faint)] px-3 py-2.5 scrollbar-none">
          {candidates.map((p) => {
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
          <>
            <div className="border-b border-[var(--uf-border-faint)] px-4 py-2.5">
              <ProveSummary product={selected} />
            </div>
            <AttributeBoard product={selected} />
          </>
        ) : (
          <div className="px-5 py-10 text-center">
            <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              No products under proof
            </span>
          </div>
        )}
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
