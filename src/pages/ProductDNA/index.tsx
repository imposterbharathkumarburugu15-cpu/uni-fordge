import { useState } from "react";
import { Link } from "react-router";
import { useProducts } from "@/hooks/use-forge-store";
import { statusTone, type StatusTone } from "@/utils/status";
import { STAGES } from "@/utils/pipeline";
import { DnaRecord } from "./DnaRecord";

/**
 * PRODUCT DNA — the canonical, authoritative product record.
 * A single continuous engineering workspace: pipeline stage rail,
 * record selector, identity header, and the attribute matrix.
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
  const withStructure = products.filter((p) => p.attributes.length > 0);
  const [selectedId, setSelectedId] = useState("PRD-0101");
  const selected = withStructure.find((p) => p.id === selectedId) ?? withStructure[0];

  return (
    <div className="flex flex-col">
      {/* pipeline stage rail — INTAKE → FORGE → PROVE → RESOLVE → PRODUCT DNA → SHIP */}
      <section
        aria-label="Pipeline stages"
        className="border-b border-[var(--uf-border-faint)]"
      >
        <div className="flex items-center overflow-x-auto py-1 scrollbar-none">
          {STAGES.map((stage, i) => {
            const active = stage.stage === ACTIVE_STAGE;
            const passed = i <= STAGES.findIndex((s) => s.stage === ACTIVE_STAGE);
            return (
              <div key={stage.stage} className="flex shrink-0 items-center">
                <Link
                  to={stage.path}
                  aria-current={active ? "step" : undefined}
                  className={`relative flex items-center gap-2.5 px-3 py-3 transition-colors md:px-4 ${
                    active
                      ? "text-[var(--uf-text-primary)]"
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
                  <span
                    className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] [font-family:var(--uf-font-condensed)] ${
                      active ? "text-[var(--uf-accent)]" : ""
                    }`}
                  >
                    {stage.label}
                  </span>
                  {active && (
                    <span
                      className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--uf-accent)] shadow-[0_0_8px_rgba(55,199,234,0.7)]"
                      aria-hidden
                    />
                  )}
                </Link>
                {i < STAGES.length - 1 && (
                  <span
                    className={`h-px w-6 md:w-12 ${
                      passed ? "bg-[var(--uf-accent)]" : "bg-[var(--uf-border)]"
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
            Canonical records
          </span>
          <span className="uf-mono text-[9.5px] text-[var(--uf-accent)]">
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
              className={`relative flex shrink-0 items-center gap-2.5 border-r border-[var(--uf-border-faint)] px-4 py-3 text-left transition-colors ${
                active
                  ? "bg-[var(--uf-accent-dim)]"
                  : "hover:bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              {active && (
                <span
                  className="absolute inset-y-0 left-0 w-[2px] bg-[var(--uf-accent)]"
                  aria-hidden
                />
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
