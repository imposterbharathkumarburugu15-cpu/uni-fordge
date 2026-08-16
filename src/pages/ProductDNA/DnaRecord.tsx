import { BookOpen, Download, Scale } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Mono, Timestamp } from "@/components/common/Mono";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useConflicts, useEvidence, useProductDna } from "@/hooks/use-forge-store";
import type { ProductDna } from "@/types/domain";
import { formatPercent } from "@/utils/format";

interface DnaRecordProps {
  productId: string;
}

/** The canonical record: what does UniForge believe this product actually is? */
export function DnaRecord({ productId }: DnaRecordProps) {
  const navigate = useNavigate();
  const dna = useProductDna(productId);
  const evidence = useEvidence();
  const conflicts = useConflicts();
  const [viewer, setViewer] = useState<{ open: boolean; attributeKey?: string }>({
    open: false,
  });

  if (!dna) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          Product has no structured DNA yet
        </span>
      </div>
    );
  }

  const openConflicts = conflicts.filter(
    (c) => c.productId === productId && c.status === "OPEN",
  );
  const evidenceChecks = evidence.filter((e) => e.productId === productId).length;

  const exportDna = (record: ProductDna) => {
    const payload = {
      schema: "uniforge.product-dna.v1",
      exportedAt: new Date().toISOString(),
      productId: record.productId,
      mpn: record.mpn,
      name: record.name,
      category: record.category,
      verified: `${record.verifiedCount}/${record.totalCount}`,
      confidence: record.confidence,
      revision: record.revision,
      attributes: record.attributes.map((a) => ({
        attribute: a.attribute.key,
        label: a.attribute.label,
        value: a.attribute.value,
        unit: a.attribute.unit,
        confidence: a.attribute.confidence,
        verification: a.attribute.verification,
        sources: a.sources.map((s) => ({
          document: s.document,
          supplier: s.supplier,
          value: s.value,
          pageRef: s.pageRef,
          agreement: s.agreement,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dna_${record.mpn.replace(/[^A-Za-z0-9-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`DNA export downloaded — ${record.mpn}`);
  };

  return (
    <div>
      {/* record header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--uf-border-faint)] p-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-[var(--uf-text-primary)]">{dna.name}</h3>
            <Mono className="text-[var(--uf-accent)]">{dna.mpn}</Mono>
            <StatusBadge status="VERIFIED" label="VERIFIED" />
          </div>
          <p className="mt-1 text-[12.5px] text-[var(--uf-text-tertiary)]">
            {dna.category} · revision {dna.revision} · last verified{" "}
            <Timestamp iso={dna.lastVerifiedAt} />
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              Attribute verification
            </p>
            <p className="uf-mono mt-0.5 text-[20px] font-semibold text-[var(--uf-success)]">
              {dna.verifiedCount} / {dna.totalCount}
            </p>
          </div>
          <div>
            <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              Confidence
            </p>
            <div className="mt-1">
              <ConfidenceMeter value={dna.confidence} />
            </div>
          </div>
          <div className="text-right">
            <p className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              Evidence checks
            </p>
            <p className="uf-mono mt-0.5 text-[20px] font-semibold text-[var(--uf-accent)]">
              {evidenceChecks}
            </p>
          </div>
        </div>
      </div>

      {/* attribute table with traceability */}
      <div className="overflow-x-auto">
        <table className="uf-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
              <th>Confidence</th>
              <th>Source traceability</th>
              <th>Verification</th>
              <th className="text-right">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {dna.attributes.map(({ attribute, sources }) => (
              <tr key={attribute.key}>
                <td>
                  <span className="text-[12.5px] font-medium text-[var(--uf-text-primary)]">
                    {attribute.label}
                  </span>
                  <span className="uf-mono ml-2 text-[10px] text-[var(--uf-text-tertiary)]">
                    {attribute.key}
                  </span>
                </td>
                <td>
                  <span className="uf-mono text-[13px] font-medium text-[var(--uf-text-primary)]">
                    {attribute.value}
                    {attribute.unit ? (
                      <span className="text-[var(--uf-text-tertiary)]"> {attribute.unit}</span>
                    ) : null}
                  </span>
                </td>
                <td>
                  <ConfidenceMeter value={attribute.confidence} size="sm" />
                </td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                    {sources.map((src, i) => (
                      <span
                        key={`${src.document}-${i}`}
                        className={`uf-mono inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] ${
                          src.agreement === "AGREES"
                            ? "border-[var(--uf-success-line)] bg-[var(--uf-success-dim)] text-[var(--uf-success)]"
                            : src.agreement === "DISAGREES"
                              ? "border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] text-[var(--uf-warning)]"
                              : "border-[var(--uf-border)] bg-[var(--uf-surface)] text-[var(--uf-text-tertiary)]"
                        }`}
                      >
                        <span className="uf-dot" style={{ background: "currentColor" }} aria-hidden />
                        {src.document}
                        <span className="opacity-70">· {src.pageRef}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <StatusBadge status={attribute.verification} />
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewer({ open: true, attributeKey: attribute.key })}
                      className="uf-mono inline-flex items-center gap-1 rounded-sm border border-[var(--uf-border-strong)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] transition-colors hover:text-[var(--uf-text-primary)]"
                    >
                      <BookOpen className="size-3" aria-hidden />
                      Trace
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--uf-border-faint)] px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {openConflicts.length > 0 ? (
            <span className="flex items-center gap-2 text-[12px] text-[var(--uf-warning)]">
              <Scale className="size-3.5" aria-hidden />
              {openConflicts.length} open conflict{openConflicts.length > 1 ? "s" : ""} — record
              not yet canonical
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[12px] text-[var(--uf-success)]">
              <span className="uf-dot uf-dot-success" aria-hidden />
              Fully verified — no open conflicts
            </span>
          )}
          <span className="uf-mono text-[10.5px] text-[var(--uf-text-tertiary)]">
            confidence {formatPercent(dna.confidence)}
          </span>
        </div>
        <div className="flex gap-2">
          {openConflicts[0] && (
            <button
              type="button"
              onClick={() => navigate(`/resolve?conflict=${openConflicts[0].id}`)}
              className="uf-mono inline-flex items-center gap-1.5 rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-3 py-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-warning)] hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)]"
            >
              <Scale className="size-3.5" aria-hidden />
              Review conflict
            </button>
          )}
          <button
            type="button"
            onClick={() => exportDna(dna)}
            className="uf-mono inline-flex items-center gap-1.5 rounded-sm bg-[var(--uf-accent)] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)]"
          >
            <Download className="size-3.5" aria-hidden />
            Export DNA
          </button>
        </div>
      </div>

      <EvidenceViewer
        open={viewer.open}
        onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}
        productId={productId}
        attributeKey={viewer.attributeKey}
      />
    </div>
  );
}
