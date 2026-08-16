import { AlertCircle, AlertTriangle, ScanSearch } from "lucide-react";
import { useConflicts, useProducts } from "@/hooks/use-forge-store";
import type { Product } from "@/types/domain";

/**
 * Right-hand inspection console (Stitch reference):
 * 01-05 inspection scope list + live MPN/DESCRIPTION/MATERIAL/STATUS table
 * mirroring what Intake will recover from a catalogue.
 */

const INSPECT_ITEMS = [
  {
    n: "01",
    title: "Structure",
    body: "Document structure parsed — tables, blocks and rows recovered from raw supplier files.",
  },
  {
    n: "02",
    title: "Attributes",
    body: "Attribute extraction — material, size, thread and ratings mapped to canonical labels.",
  },
  {
    n: "03",
    title: "Values",
    body: "Value parsing — units, tolerances and formats reconciled across competing sources.",
  },
  {
    n: "04",
    title: "Relationships",
    body: "Relationship generation — product-to-supplier lineage and catalogue provenance traced.",
  },
  {
    n: "05",
    title: "Sources",
    body: "Source inspection — conflicting claims flagged with confidence scoring for review.",
  },
] as const;

type RowStatus = "OK" | "INCONSISTENT" | "INCOMPLETE";

function materialOf(p: Product): string | null {
  const attr = p.attributes.find(
    (a) => a.key === "MATERIAL" || a.key === "BODY_MATERIAL",
  );
  return attr ? attr.value : null;
}

function statusOf(p: Product, hasOpenConflict: boolean): RowStatus {
  if (hasOpenConflict) return "INCONSISTENT";
  if (
    p.attributes.length === 0 ||
    p.attributes.some((a) => a.verification !== "VERIFIED")
  ) {
    return "INCOMPLETE";
  }
  return "OK";
}

export function InspectionPanel() {
  const products = useProducts();
  const conflicts = useConflicts();

  const openProductIds = new Set(
    conflicts.filter((c) => c.status === "OPEN").map((c) => c.productId),
  );

  const ids = ["PRD-0101", "PRD-0100", "PRD-0103", "PRD-0104", "PRD-0110"];
  const rows = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .map((p) => ({
      product: p,
      status: statusOf(p, openProductIds.has(p.id)),
    }));

  return (
    <div className="flex flex-col gap-4">
      {/* scope list */}
      <section className="rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)]">
        <header className="flex items-center gap-2 border-b border-[var(--uf-border-faint)] px-4 py-2.5">
          <ScanSearch className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
          <h2 className="uf-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--uf-text-primary)]">
            What UniForge will inspect
          </h2>
        </header>
        <ol className="relative px-5 py-4">
          {/* vertical circuit rail */}
          <span
            className="absolute bottom-6 left-[26px] top-6 w-px bg-gradient-to-b from-[var(--uf-accent)] via-[var(--uf-accent-line)] to-transparent"
            aria-hidden
          />
          <div className="flex flex-col gap-4">
            {INSPECT_ITEMS.map((item) => (
              <li key={item.n} className="relative flex items-start gap-4 pl-2">
                <span
                  className="relative z-10 mt-1 size-2 shrink-0 rounded-full border border-[var(--uf-accent)] bg-[var(--uf-bg)] shadow-[0_0_8px_rgba(55,199,234,0.6)]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="uf-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-[var(--uf-accent)]">
                    {item.n} {item.title}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--uf-text-secondary)]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </div>
        </ol>
      </section>

      {/* live inspection table */}
      <section className="overflow-hidden rounded-md border border-[var(--uf-border)] bg-[var(--uf-surface)]">
        <header className="flex items-center justify-between border-b border-[var(--uf-border-faint)] px-4 py-2.5">
          <h2 className="uf-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--uf-text-primary)]">
            Inspection preview
          </h2>
          <span className="uf-mono text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Live pipeline records
          </span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--uf-border)]">
                {["MPN", "Description", "Material", "Status"].map((h) => (
                  <th
                    key={h}
                    className="uf-mono px-4 py-2 text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, status }) => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--uf-border-faint)] last:border-0"
                >
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-1 shrink-0 rounded-full bg-[var(--uf-accent)]"
                        aria-hidden
                      />
                      <span className="uf-mono text-[10.5px] font-medium text-[var(--uf-text-primary)]">
                        {product.mpn}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {product.attributes.length === 0 ? (
                      <span className="uf-mono rounded-sm bg-[var(--uf-warning-dim)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--uf-warning)]">
                        Missing value
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-[var(--uf-text-secondary)]">
                        {product.name.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {materialOf(product) ? (
                      <span className="text-[11.5px] text-[var(--uf-text-primary)]">
                        {materialOf(product)}
                      </span>
                    ) : (
                      <span className="uf-mono rounded-sm bg-[var(--uf-warning-dim)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--uf-warning)]">
                        Missing material
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusCell status={status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusCell({ status }: { status: RowStatus }) {
  if (status === "OK") {
    return (
      <span className="uf-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--uf-success)]">
        OK
      </span>
    );
  }
  if (status === "INCONSISTENT") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <AlertTriangle className="size-3 text-[var(--uf-warning)]" aria-hidden />
        <span className="uf-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--uf-critical)]">
          Inconsistent
        </span>
        <AlertTriangle className="size-3 text-[var(--uf-critical)]" aria-hidden />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <AlertCircle className="size-3 text-[var(--uf-critical)]" aria-hidden />
      <span className="uf-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--uf-critical)]">
        Incomplete
      </span>
    </span>
  );
}
