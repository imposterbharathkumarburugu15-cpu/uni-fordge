import { AlertTriangle, CheckCircle2, Eye, RefreshCw, XOctagon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Mono, Timestamp } from "@/components/common/Mono";
import { StatusBadge } from "@/components/status/StatusBadge";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { intakeService } from "@/services/intakeService";
import type { SourceDocument } from "@/types/domain";
import { formatBytes } from "@/utils/format";

interface SourceTableProps {
  sources: SourceDocument[];
  suppliers: Array<{ id: string; name: string; code: string }>;
}

function supplierName(
  id: string,
  suppliers: Array<{ id: string; name: string; code: string }>,
): string {
  return suppliers.find((s) => s.id === id)?.code ?? id;
}

/** Document list — every ingestion state: QUEUED / PROCESSING / INGESTED / FAILED / REQUIRES REVIEW. */
export function SourceTable({ sources, suppliers }: SourceTableProps) {
  const [reviewing, setReviewing] = useState<SourceDocument | null>(null);

  const process = (source: SourceDocument) => {
    void intakeService.process(source.id);
    toast.info(`Processing ${source.filename}`);
  };
  const retry = (source: SourceDocument) => {
    void intakeService.retry(source.id);
    toast.info(`Retrying ${source.filename}`);
  };
  const acknowledge = (source: SourceDocument) => {
    void intakeService.acknowledge(source.id);
    toast.success(`${source.filename} marked ingested`);
  };

  const columns: Column<SourceDocument>[] = [
    {
      key: "document",
      header: "Document",
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[var(--uf-text-primary)]">{s.filename}</p>
          <p className="uf-mono mt-0.5 text-[10px] text-[var(--uf-text-tertiary)]">
            {s.type.replace(/_/g, " ")} · {s.rowCount ? `${s.rowCount.toLocaleString()} rows` : s.pages ? `${s.pages} pages` : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (s) => <Mono className="text-[var(--uf-text-secondary)]">{supplierName(s.supplierId, suppliers)}</Mono>,
    },
    {
      key: "size",
      header: "Size",
      render: (s) => <span className="uf-mono text-[11px] text-[var(--uf-text-secondary)]">{formatBytes(s.sizeBytes)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={s.status} spin={s.status === "PROCESSING"} />
          {s.status === "REQUIRES_REVIEW" && s.errors.length > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] text-[var(--uf-warning)]">
              <AlertTriangle className="size-3" aria-hidden />
              {s.errors.length}
            </span>
          )}
          {s.status === "FAILED" && s.errors.length > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] text-[var(--uf-critical)]">
              <XOctagon className="size-3" aria-hidden />
              {s.errors.length}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (s) => (
        <div className="w-28">
          <div className={`uf-progress ${s.status === "PROCESSING" ? "striped" : ""}`}>
            <span
              style={{
                width: `${s.progress}%`,
                background:
                  s.status === "FAILED"
                    ? "var(--uf-critical)"
                    : s.status === "REQUIRES_REVIEW"
                      ? "var(--uf-warning)"
                      : "var(--uf-accent)",
              }}
            />
          </div>
          <span className="uf-mono mt-1 block text-[10px] text-[var(--uf-text-tertiary)]">
            {s.progress}%
          </span>
        </div>
      ),
    },
    {
      key: "received",
      header: "Received",
      render: (s) => <Timestamp iso={s.receivedAt} />,
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          {s.status === "QUEUED" && (
            <button
              type="button"
              onClick={() => process(s)}
              className="uf-mono rounded-sm border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-accent)] transition-colors hover:bg-[var(--uf-accent)] hover:text-[var(--uf-primary-foreground)]"
            >
              Process
            </button>
          )}
          {s.status === "FAILED" && (
            <button
              type="button"
              onClick={() => retry(s)}
              className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-critical-line)] bg-[var(--uf-critical-dim)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-critical)] transition-colors hover:bg-[var(--uf-critical)] hover:text-white"
            >
              <RefreshCw className="size-3" aria-hidden />
              Retry
            </button>
          )}
          {(s.status === "REQUIRES_REVIEW" || (s.status === "FAILED" && s.errors.length > 0)) && (
            <button
              type="button"
              onClick={() => setReviewing(s)}
              className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-border-strong)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
            >
              <Eye className="size-3" aria-hidden />
              Review
            </button>
          )}
          {s.status === "REQUIRES_REVIEW" && (
            <button
              type="button"
              onClick={() => acknowledge(s)}
              className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-success-line)] bg-[var(--uf-success-dim)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-success)] transition-colors hover:bg-[var(--uf-success)] hover:text-[var(--uf-bg)]"
            >
              <CheckCircle2 className="size-3" aria-hidden />
              Acknowledge
            </button>
          )}
        </div>
      ),
    },
  ];

  const reviewDoc = reviewing;

  return (
    <div>
      <div className="uf-panel overflow-hidden">
        <div className="uf-panel-head">
          <h2 className="uf-section-title">
            <span className="idx">02</span>
            Document Queue
          </h2>
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            {sources.length} documents
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={sources}
          rowKey={(s) => s.id}
          ariaLabel="Ingestion document queue"
        />
      </div>

      {reviewDoc && reviewDoc.errors.length > 0 && (
        <div className="uf-anim-rise mt-4 rounded-md border border-[var(--uf-warning-line)] bg-[var(--uf-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] px-4 py-3">
            <p className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-warning)]">
              Validation report · {reviewDoc.filename}
            </p>
            <button
              type="button"
              onClick={() => setReviewing(null)}
              className="text-[12px] text-[var(--uf-text-tertiary)] hover:text-[var(--uf-text-primary)]"
            >
              Close
            </button>
          </div>
          <ul className="divide-y divide-[var(--uf-border-faint)]">
            {reviewDoc.errors.map((err) => (
              <li key={err.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`uf-mono mt-0.5 shrink-0 rounded-sm border px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.08em] ${
                    err.level === "error"
                      ? "border-[var(--uf-critical-line)] bg-[var(--uf-critical-dim)] text-[var(--uf-critical)]"
                      : "border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] text-[var(--uf-warning)]"
                  }`}
                >
                  {err.level}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[var(--uf-text-primary)]">{err.message}</p>
                  <p className="uf-mono mt-0.5 text-[10.5px] text-[var(--uf-text-tertiary)]">
                    {err.code} · {err.location}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
