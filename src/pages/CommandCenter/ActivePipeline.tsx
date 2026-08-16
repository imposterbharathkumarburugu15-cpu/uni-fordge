import { useNavigate } from "react-router";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { StatusBadge } from "@/components/status/StatusBadge";
import { DataTable } from "@/components/tables/DataTable";
import { Mono } from "@/components/common/Mono";
import { useProducts } from "@/hooks/use-forge-store";
import { stageMeta } from "@/utils/pipeline";
import type { Product } from "@/types/domain";

/** In-flight products across all pipeline stages — click through to detail. */
export function ActivePipeline() {
  const navigate = useNavigate();
  const products = useProducts();

  const inFlight = products
    .filter((p) => p.stage !== "SHIP" || p.status !== "READY")
    .sort((a, b) => (a.stage === b.stage ? 0 : a.stage < b.stage ? -1 : 1));

  const columns = [
    {
      key: "stage",
      header: "Stage",
      render: (p: Product) => (
        <span className="uf-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-text-tertiary)]">
          {stageMeta(p.stage).label}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p: Product) => <StatusBadge status={p.status} />,
    },
    {
      key: "mpn",
      header: "MPN",
      render: (p: Product) => <Mono className="text-[var(--uf-text-primary)]">{p.mpn}</Mono>,
    },
    {
      key: "product",
      header: "Product",
      render: (p: Product) => (
        <span className="text-[13px] text-[var(--uf-text-primary)]">{p.name}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (p: Product) => (
        <span className="text-[12px] text-[var(--uf-text-secondary)]">{p.category}</span>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (p: Product) => <ConfidenceMeter value={p.confidence} size="sm" />,
    },
  ];

  return (
    <section aria-label="Active product pipeline">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="uf-section-title">
          <span className="idx">03</span>
          Active Product Pipeline
        </h2>
        <span className="uf-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          {inFlight.length} in flight · click row for record
        </span>
      </div>
      <div className="uf-panel overflow-hidden">
        <DataTable
          columns={columns}
          rows={inFlight}
          rowKey={(p) => p.id}
          onRowClick={(p) => navigate(`/product/${p.id}`)}
          ariaLabel="Active product pipeline"
          emptyMessage="No products in flight"
        />
      </div>
    </section>
  );
}
