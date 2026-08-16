import { ArrowRight, Hammer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Mono } from "@/components/common/Mono";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useProducts } from "@/hooks/use-forge-store";
import { forgeService } from "@/services/forgeService";
import type { Product } from "@/types/domain";

/** FORGE workspace: select an in-flight product and commit its attribute mapping. */
export function MappingWorkspace() {
  const products = useProducts();
  const forgeProducts = products.filter((p) => p.stage === "FORGE");
  const [selectedId, setSelectedId] = useState(forgeProducts[0]?.id ?? "");
  const [committing, setCommitting] = useState(false);

  const selected = forgeProducts.find((p) => p.id === selectedId) ?? forgeProducts[0];

  const commit = async (product: Product) => {
    if (!product) return;
    setCommitting(true);
    const next = await forgeService.commit(product.id);
    setCommitting(false);
    if (next?.stage === "PROVE") {
      toast.success(`${product.mpn} committed — attributes moved to PROVE`);
      setSelectedId(forgeProducts.filter((p) => p.id !== product.id)[0]?.id ?? "");
    }
  };

  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">02</span>
          Attribute Mapping Workspace
        </h2>
        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          {forgeProducts.length} products in forge
        </span>
      </div>

      {!selected ? (
        <div className="px-5 py-10 text-center">
          <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            No products awaiting forge — intake more supplier data
          </span>
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
          {/* product selector */}
          <div className="border-b border-[var(--uf-border-faint)] p-3 lg:border-b-0 lg:border-r">
            <p className="uf-mono mb-2 px-1 text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              In-flight products
            </p>
            <ul className="space-y-1.5">
              {forgeProducts.map((p) => {
                const active = p.id === selected?.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-sm border p-2.5 text-left transition-colors ${
                        active
                          ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)]"
                          : "border-[var(--uf-border)] bg-[var(--uf-surface)] hover:border-[var(--uf-border-strong)]"
                      }`}
                      aria-pressed={active}
                    >
                      <div className="flex items-center justify-between">
                        <Mono className="text-[var(--uf-text-primary)]">{p.mpn}</Mono>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="mt-1 truncate text-[12px] text-[var(--uf-text-secondary)]">
                        {p.name}
                      </p>
                      <p className="uf-mono mt-0.5 truncate text-[10px] text-[var(--uf-text-tertiary)]">
                        {p.description.split(".")[0]}.
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* mapping */}
          <div className="p-4">
            <div className="rounded-md border border-[var(--uf-border)] bg-[var(--uf-bg)] p-4">
              <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                Source data
              </p>
              <p className="uf-mono mt-2 text-[13.5px] leading-7 text-[var(--uf-text-secondary)]">
                “{selected.description}”
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.attributes
                  .flatMap((a) => a.rawValues)
                  .slice(0, 8)
                  .map((raw) => (
                    <span
                      key={raw}
                      className="uf-mono rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2 py-0.5 text-[10.5px] text-[var(--uf-text-tertiary)]"
                    >
                      {raw}
                    </span>
                  ))}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="uf-table">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Raw values</th>
                    <th />
                    <th>Normalized value</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.attributes.map((a) => (
                    <tr key={a.key}>
                      <td>
                        <span className="text-[12.5px] font-medium text-[var(--uf-text-primary)]">
                          {a.label}
                        </span>
                        <span className="uf-mono ml-2 text-[10px] text-[var(--uf-text-tertiary)]">
                          {a.key}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {a.rawValues.map((raw) => (
                            <span
                              key={raw}
                              className="uf-mono rounded-sm border border-[var(--uf-border-faint)] bg-[var(--uf-surface)] px-1.5 py-0.5 text-[10px] text-[var(--uf-text-secondary)]"
                            >
                              {raw}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <ArrowRight className="size-3.5 text-[var(--uf-accent-line)]" aria-hidden />
                      </td>
                      <td>
                        <span className="uf-mono text-[12.5px] text-[var(--uf-text-primary)]">
                          {a.value}
                          {a.unit ? <span className="text-[var(--uf-text-tertiary)]"> {a.unit}</span> : null}
                        </span>
                      </td>
                      <td>
                        <ConfidenceMeter value={a.confidence} size="sm" />
                      </td>
                      <td>
                        <StatusBadge status={a.verification} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--uf-border-faint)] pt-4">
              <p className="flex items-center gap-2 text-[12px] text-[var(--uf-text-tertiary)]">
                <Hammer className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
                Forge normalizes supplier shorthand into the canonical attribute model
                before evidence verification.
              </p>
              <button
                type="button"
                onClick={() => commit(selected)}
                disabled={committing}
                className="uf-mono inline-flex items-center gap-2 rounded-sm bg-[var(--uf-accent)] px-4 py-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] transition-colors hover:bg-[var(--uf-accent-bright)] disabled:opacity-50"
              >
                <Hammer className="size-3.5" aria-hidden />
                {committing ? "Committing…" : "Commit transformations → PROVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
