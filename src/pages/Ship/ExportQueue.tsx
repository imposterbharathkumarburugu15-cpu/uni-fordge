import { Download, Eye, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Mono, Timestamp } from "@/components/common/Mono";
import { StatusBadge } from "@/components/status/StatusBadge";
import { DataTable, type Column } from "@/components/tables/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProducts, useShipments } from "@/hooks/use-forge-store";
import { shipmentService } from "@/services/shipmentService";
import type { Shipment } from "@/types/domain";
import { formatTimestamp } from "@/utils/format";

/** Export queue — history of downstream deliveries with full actions. */
export function ExportQueue() {
  const shipments = useShipments();
  const products = useProducts();
  const [viewing, setViewing] = useState<Shipment | null>(null);

  const download = (shipment: Shipment) => {
    const rows = shipment.productIds.map((id) => {
      const p = products.find((pr) => pr.id === id);
      return {
        id,
        mpn: p?.mpn ?? id,
        name: p?.name ?? "",
        category: p?.category ?? "",
        confidence: p?.confidence ?? 0,
      };
    });
    const payload = {
      shipment: shipment.id,
      destination: shipment.destinationLabel,
      exportedAt: shipment.completedAt ?? shipment.createdAt,
      validation: shipment.validation,
      products: rows,
    };
    const isCsv = shipment.destination === "EXPORT";
    const blob = isCsv
      ? new Blob(
          [
            ["mpn,name,category,confidence"]
              .concat(rows.map((r) => `${r.mpn},${r.name},${r.category},${r.confidence}`))
              .join("\n"),
          ],
          { type: "text/csv" },
        )
      : new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shipment.id}_${isCsv ? "export.csv" : "manifest.json"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${shipment.id}`);
  };

  const retry = (shipment: Shipment) => {
    void shipmentService.retry(shipment.id);
    toast.info(`Retrying ${shipment.id}`);
  };

  const columns: Column<Shipment>[] = [
    {
      key: "id",
      header: "Export",
      render: (s) => <Mono className="text-[var(--uf-text-primary)]">{s.id}</Mono>,
    },
    {
      key: "destination",
      header: "Destination",
      render: (s) => (
        <span className="text-[12.5px] text-[var(--uf-text-secondary)]">{s.destinationLabel}</span>
      ),
    },
    {
      key: "count",
      header: "Products",
      render: (s) => (
        <span className="uf-mono text-[12px] text-[var(--uf-text-primary)]">
          {s.productIds.length}
        </span>
      ),
    },
    {
      key: "validation",
      header: "Validation",
      render: (s) => <StatusBadge status={s.validation} />,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.status} spin={s.status === "EXPORTING"} />,
    },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (s) => <Timestamp iso={s.completedAt ?? s.createdAt} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewing(s)}
            className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-border-strong)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
          >
            <Eye className="size-3" aria-hidden />
            View
          </button>
          {s.status === "FAILED" && (
            <button
              type="button"
              onClick={() => retry(s)}
              className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-critical-line)] bg-[var(--uf-critical-dim)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--uf-critical)] transition-colors hover:bg-[var(--uf-critical)] hover:text-white"
            >
              <RefreshCw className="size-3" aria-hidden />
              Retry
            </button>
          )}
          {(s.status === "EXPORTED" || s.status === "FAILED") && (
            <button
              type="button"
              onClick={() => download(s)}
              className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--uf-accent)] transition-colors hover:bg-[var(--uf-accent)] hover:text-[var(--uf-primary-foreground)]"
            >
              <Download className="size-3" aria-hidden />
              Download
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">02</span>
          Export Queue
        </h2>
        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          {shipments.length} exports on record
        </span>
      </div>
      <DataTable
        columns={columns}
        rows={shipments}
        rowKey={(s) => s.id}
        ariaLabel="Export queue"
      />

      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
          <DialogHeader>
            <DialogTitle className="uf-mono text-[12px] uppercase tracking-[0.14em] text-[var(--uf-accent)]">
              {viewing?.id} · {viewing?.destinationLabel}
            </DialogTitle>
            <DialogDescription className="pt-1 text-[12px] text-[var(--uf-text-tertiary)]">
              {viewing ? formatTimestamp(viewing.completedAt ?? viewing.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={viewing.validation} />
                <StatusBadge status={viewing.status} spin={viewing.status === "EXPORTING"} />
              </div>
              {viewing.error && (
                <div className="rounded-sm border border-[var(--uf-critical-line)] bg-[var(--uf-critical-dim)] p-3 text-[12.5px] leading-relaxed text-[var(--uf-critical)]">
                  {viewing.error}
                </div>
              )}
              <div>
                <p className="uf-mono mb-2 text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                  Product manifest ({viewing.productIds.length})
                </p>
                <ul className="max-h-56 space-y-1 overflow-y-auto">
                  {viewing.productIds.map((id, i) => {
                    const p = products.find((pr) => pr.id === id);
                    return (
                      <li
                        key={`${id}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-sm border border-[var(--uf-border-faint)] bg-[var(--uf-surface)] px-2.5 py-1.5"
                      >
                        <span className="uf-mono text-[11.5px] text-[var(--uf-text-primary)]">
                          {p?.mpn ?? id}
                        </span>
                        <span className="text-[12px] text-[var(--uf-text-secondary)]">
                          {p?.name ?? "—"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
