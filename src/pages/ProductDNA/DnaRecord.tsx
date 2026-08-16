import {
  AlertTriangle,
  BookOpen,
  Check,
  Download,
  Loader,
  Minus,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import {
  useConflicts,
  useEvidence,
  useProduct,
  useProductDna,
  useSuppliers,
} from "@/hooks/use-forge-store";
import type { ProductDna, VerificationStatus } from "@/types/domain";
import { formatPercent, formatTimestamp } from "@/utils/format";

interface DnaRecordProps {
  productId: string;
}

/** Technical condensed column labels for the attribute matrix. */
const HEADERS = [
  "Attribute",
  "Value",
  "Confidence",
  "Source traceability",
  "Verification",
  "Evidence",
];

/** Flat, compact verification flags — icon + label, no chips. */
const VERIFICATION_FLAG: Record<
  VerificationStatus,
  { label: string; color: string; Icon: LucideIcon }
> = {
  VERIFIED: { label: "Verified", color: "var(--uf-success)", Icon: Check },
  CONFLICT: { label: "Conflict", color: "var(--uf-warning)", Icon: AlertTriangle },
  PROCESSING: { label: "Processing", color: "var(--uf-accent)", Icon: Loader },
  UNVERIFIED: { label: "Unverified", color: "var(--uf-text-tertiary)", Icon: Minus },
};

const AGREEMENT_COLOR: Record<string, string> = {
  AGREES: "#45c181",
  DISAGREES: "#d9a13b",
  SOLE_SOURCE: "#37c7ea",
};

/** The canonical record: what does UniForge believe this product actually is? */
export function DnaRecord({ productId }: DnaRecordProps) {
  const navigate = useNavigate();
  const dna = useProductDna(productId);
  const product = useProduct(productId);
  const evidence = useEvidence();
  const conflicts = useConflicts();
  const suppliers = useSuppliers();
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
  const supplier = suppliers.find((s) => s.id === product?.supplierId);

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
      {/* product identity header — large, authoritative */}
      <section className="border-b border-[var(--uf-border-faint)] px-2 pb-6 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="min-w-0">
            <p className="uf-eyebrow">Canonical record · product dna</p>
            <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h1 className="text-[40px] font-bold uppercase leading-none tracking-tight text-[var(--uf-text-primary)] md:text-[58px]">
                {dna.mpn}
              </h1>
              <span className="text-[20px] font-semibold uppercase tracking-[0.04em] text-[var(--uf-text-secondary)] [font-family:var(--uf-font-condensed)] md:text-[26px]">
                {dna.name}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2">
              <Meta label="Product id" value={dna.productId} />
              <Meta label="Category" value={dna.category} />
              <Meta label="Supplier" value={supplier?.code ?? supplier?.name ?? "—"} />
              <Meta label="Revision" value={String(dna.revision)} />
              <Meta label="Last verified" value={formatTimestamp(dna.lastVerifiedAt)} />
            </div>
          </div>

          {/* record integrity readouts */}
          <div className="flex shrink-0 items-stretch divide-x divide-[var(--uf-border-faint)] border border-[var(--uf-border-faint)]">
            <Stat
              label="Attributes verified"
              value={`${dna.verifiedCount}/${dna.totalCount}`}
              tone="var(--uf-success)"
            />
            <Stat
              label="Confidence"
              value={formatPercent(dna.confidence)}
              tone="var(--uf-accent)"
              bar={dna.confidence}
            />
            <Stat label="Evidence checks" value={String(evidenceChecks)} tone="var(--uf-accent)" />
          </div>
        </div>
      </section>

      {/* attribute matrix — continuous technical table */}
      <section className="overflow-x-auto" aria-label="Attribute matrix">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--uf-border-strong)]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)] [font-family:var(--uf-font-condensed)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dna.attributes.map(({ attribute, sources }) => {
              const conflict = attribute.verification === "CONFLICT";
              const flag = VERIFICATION_FLAG[attribute.verification];
              return (
                <tr
                  key={attribute.key}
                  className={`border-b border-[var(--uf-border-faint)] last:border-0 ${
                    conflict
                      ? "bg-[var(--uf-warning-dim)] shadow-[inset_2px_0_0_var(--uf-warning)]"
                      : "hover:bg-[rgba(255,255,255,0.015)]"
                  }`}
                >
                  {/* ATTRIBUTE */}
                  <td className="w-[200px] px-3 py-4 align-top">
                    <span
                      className={`flex items-center gap-2 text-[13px] font-semibold ${
                        conflict ? "text-[var(--uf-warning)]" : "text-[var(--uf-text-primary)]"
                      }`}
                    >
                      {conflict && (
                        <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                      )}
                      {attribute.label}
                    </span>
                    <span className="uf-mono mt-1 block text-[9.5px] text-[var(--uf-text-tertiary)]">
                      {attribute.key}
                    </span>
                  </td>

                  {/* VALUE */}
                  <td className="w-[180px] px-3 py-4 align-top">
                    <span className="uf-mono text-[13.5px] font-medium text-[var(--uf-text-primary)]">
                      {attribute.value}
                      {attribute.unit ? (
                        <span className="text-[var(--uf-text-tertiary)]"> {attribute.unit}</span>
                      ) : null}
                    </span>
                  </td>

                  {/* CONFIDENCE — thin technical bar */}
                  <td className="w-[150px] px-3 py-4 align-top">
                    <ConfidenceBar value={attribute.confidence} conflict={conflict} />
                  </td>

                  {/* SOURCE TRACEABILITY — evidence inline */}
                  <td className="px-3 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {sources.map((src, i) => (
                        <SourceLine key={`${src.document}-${i}`} source={src} />
                      ))}
                    </div>
                  </td>

                  {/* VERIFICATION — compact flat flag */}
                  <td className="w-[140px] px-3 py-4 align-top">
                    <span
                      className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] [font-family:var(--uf-font-condensed)]"
                      style={{ color: flag.color }}
                    >
                      <flag.Icon className="size-3" aria-hidden />
                      {flag.label}
                    </span>
                  </td>

                  {/* EVIDENCE */}
                  <td className="w-[110px] px-3 py-4 align-top">
                    <div className="flex items-center justify-end gap-3">
                      <span className="uf-mono text-[9.5px] text-[var(--uf-text-tertiary)]">
                        {sources.length} src
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewer({ open: true, attributeKey: attribute.key })}
                        className="uf-mono inline-flex items-center gap-1 border border-[var(--uf-border-strong)] px-2 py-1 text-[9.5px] uppercase tracking-[0.08em] text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-accent-line)] hover:text-[var(--uf-accent)]"
                      >
                        <BookOpen className="size-3" aria-hidden />
                        Trace
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* footer — record state + actions */}
      <section className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {openConflicts.length > 0 ? (
            <span className="flex items-center gap-2 text-[12px] text-[var(--uf-warning)]">
              <AlertTriangle className="size-3.5" aria-hidden />
              {openConflicts.length} open conflict{openConflicts.length > 1 ? "s" : ""} — record
              not yet canonical
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[12px] text-[var(--uf-success)]">
              <span className="uf-dot uf-dot-success" aria-hidden />
              Fully verified — no open conflicts
            </span>
          )}
          <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            confidence {formatPercent(dna.confidence)} · revision {dna.revision}
          </span>
        </div>
        <div className="flex gap-2">
          {openConflicts[0] && (
            <button
              type="button"
              onClick={() => navigate(`/resolve?conflict=${openConflicts[0].id}`)}
              className="uf-mono inline-flex items-center gap-1.5 border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-3.5 py-2 text-[10.5px] uppercase tracking-[0.08em] text-[var(--uf-warning)] transition-colors hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)]"
            >
              <Scale className="size-3.5" aria-hidden />
              Review conflict
            </button>
          )}
          <button
            type="button"
            onClick={() => exportDna(dna)}
            className="uf-mono inline-flex items-center gap-1.5 bg-[var(--uf-accent)] px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--uf-primary-foreground)] transition-colors hover:bg-[var(--uf-accent-bright)]"
          >
            <Download className="size-3.5" aria-hidden />
            Export DNA
          </button>
        </div>
      </section>

      <EvidenceViewer
        open={viewer.open}
        onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}
        productId={productId}
        attributeKey={viewer.attributeKey}
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="uf-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
        {label}
      </p>
      <p className="uf-mono mt-0.5 text-[11px] text-[var(--uf-text-primary)]">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  bar,
}: {
  label: string;
  value: string;
  tone: string;
  bar?: number;
}) {
  return (
    <div className="min-w-[120px] px-5 py-3">
      <p className="uf-mono text-[8.5px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
        {label}
      </p>
      <p className="uf-mono mt-1.5 text-[20px] font-semibold leading-none" style={{ color: tone }}>
        {value}
      </p>
      {bar !== undefined && (
        <div className="mt-2 h-[3px] w-full bg-[var(--uf-border-faint)]">
          <span
            className="block h-full"
            style={{
              width: `${Math.round(Math.min(1, Math.max(0, bar)) * 100)}%`,
              background: tone,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ConfidenceBar({ value, conflict }: { value: number; conflict: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const color = conflict
    ? "var(--uf-warning)"
    : value >= 0.9
      ? "var(--uf-success)"
      : "var(--uf-accent)";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-[3px] w-[64px] bg-[var(--uf-border-faint)]" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span className="block h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="uf-mono uf-tnum text-[10.5px]" style={{ color }}>
        {formatPercent(value)}
      </span>
    </div>
  );
}

function SourceLine({ source }: { source: ProductDna["attributes"][number]["sources"][number] }) {
  const color = AGREEMENT_COLOR[source.agreement] ?? "var(--uf-text-tertiary)";
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="size-1 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
      <span className="uf-mono max-w-[230px] truncate text-[10px] text-[var(--uf-text-secondary)]" title={source.document}>
        {source.document}
      </span>
      <span className="uf-mono shrink-0 text-[9px] text-[var(--uf-text-tertiary)]">
        · {source.pageRef}
      </span>
      <span className="uf-mono shrink-0 text-[10px] font-medium" style={{ color }}>
        {source.value}
      </span>
      <span
        className="uf-mono shrink-0 rounded-sm border px-1 py-px text-[7.5px] uppercase tracking-[0.08em]"
        style={{ color, borderColor: `${color}55`, background: `${color}12` }}
      >
        {source.agreement === "SOLE_SOURCE" ? "Sole source" : source.agreement}
      </span>
    </div>
  );
}
