import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  BookOpen,
  Check,
  FileSpreadsheet,
  FileText,
  Layers,
  Scale,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConflicts, useEvidence, useProduct, useSources, useSuppliers } from "@/hooks/use-forge-store";
import type { Evidence, SourceDocument, SourceType } from "@/types/domain";
import { formatBytes, formatPercent, formatTimestamp } from "@/utils/format";
import { ConfidenceMeter } from "@/components/status/ConfidenceMeter";
import { Mono } from "@/components/common/Mono";

interface EvidenceViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  attributeKey?: string;
}

const TYPE_ICON: Record<SourceType, typeof FileText> = {
  CATALOGUE: FileSpreadsheet,
  DATASHEET: FileText,
  SPECIFICATION: FileText,
  MATERIAL_GUIDE: FileText,
  PRICEBOOK: FileSpreadsheet,
  SAFETY_SHEET: FileText,
  BOM: Layers,
};

function highlightRaw(excerpt: string, raw: string) {
  if (!raw) return excerpt;
  const idx = excerpt.toLowerCase().indexOf(raw.toLowerCase());
  if (idx === -1) return excerpt;
  return (
    <>
      {excerpt.slice(0, idx)}
      <mark
        className="rounded-[2px] px-0.5"
        style={{ background: "rgba(55,199,234,0.22)", color: "var(--uf-accent-bright)" }}
      >
        {excerpt.slice(idx, idx + raw.length)}
      </mark>
      {excerpt.slice(idx + raw.length)}
    </>
  );
}

/**
 * Evidence viewer — the primary interaction for PROVE and PRODUCT DNA.
 * Left: extraction list per source. Right: rendered document fragment
 * with the extracted value highlighted, agreement and proof metadata.
 */
export function EvidenceViewer({
  open,
  onOpenChange,
  productId,
  attributeKey,
}: EvidenceViewerProps) {
  const navigate = useNavigate();
  const product = useProduct(productId);
  const evidence = useEvidence();
  const sources = useSources();
  const suppliers = useSuppliers();
  const conflicts = useConflicts();

  const productEvidence = useMemo(
    () => evidence.filter((e) => e.productId === productId),
    [evidence, productId],
  );

  const attributeKeys = useMemo(() => {
    const keys = Array.from(new Set(productEvidence.map((e) => e.attributeKey)));
    return keys;
  }, [productEvidence]);

  const [activeAttribute, setActiveAttribute] = useState<string | null>(
    attributeKey ?? null,
  );

  // Sync when the dialog is opened for a different attribute/product.
  useEffect(() => {
    setActiveAttribute(attributeKey ?? null);
    setSelectedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeKey, productId]);
  const currentAttribute = activeAttribute ?? attributeKeys[0] ?? null;

  const attrEvidence = useMemo(
    () =>
      currentAttribute
        ? productEvidence.filter((e) => e.attributeKey === currentAttribute)
        : [],
    [productEvidence, currentAttribute],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: Evidence | undefined =
    attrEvidence.find((e) => e.id === (selectedId ?? attrEvidence[0]?.id)) ??
    attrEvidence[0];

  const attribute = product?.attributes.find((a) => a.key === currentAttribute);
  const openConflict = conflicts.find(
    (c) =>
      c.productId === productId &&
      c.attributeKey === currentAttribute &&
      c.status === "OPEN",
  );

  const proofScore = useMemo(() => {
    if (attrEvidence.length === 0) return 0;
    return attrEvidence.reduce((sum, e) => sum + e.confidence, 0) / attrEvidence.length;
  }, [attrEvidence]);

  const doc = sources.find((s) => s.id === selected?.sourceDocumentId) as
    | SourceDocument
    | undefined;
  const supplier = suppliers.find((s) => s.id === doc?.supplierId);
  const Icon = doc ? TYPE_ICON[doc.type] : FileText;
  const agrees = attribute ? selected?.value === attribute.value : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] p-0 text-[var(--uf-text-primary)]">
        <DialogHeader className="border-b border-[var(--uf-border-faint)] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-3 text-sm uppercase tracking-[0.14em]">
                <Scale className="size-4 text-[var(--uf-accent)]" aria-hidden />
                Evidence Viewer
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <Mono className="text-[var(--uf-text-primary)]">{product?.mpn}</Mono>
                <span className="text-xs text-[var(--uf-text-secondary)]">
                  {product?.name}
                </span>
                <span className="text-[var(--uf-text-tertiary)]">·</span>
                <span className="text-xs text-[var(--uf-text-tertiary)]">
                  {product?.category}
                </span>
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-7 items-center justify-center rounded-sm border border-[var(--uf-border)] text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-border-strong)] hover:text-[var(--uf-text-primary)]"
              aria-label="Close evidence viewer"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Attribute selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--uf-border-faint)] px-5 py-2.5">
          {attributeKeys.map((key) => {
            const label = product?.attributes.find((a) => a.key === key)?.label ?? key;
            const active = key === currentAttribute;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveAttribute(key);
                  setSelectedId(null);
                }}
                className={`uf-mono rounded-sm border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
                  active
                    ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] text-[var(--uf-accent)]"
                    : "border-[var(--uf-border)] text-[var(--uf-text-secondary)] hover:text-[var(--uf-text-primary)]"
                }`}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-0 md:grid-cols-[300px_1fr]">
          {/* Evidence list */}
          <div className="border-r border-[var(--uf-border-faint)] p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                Source evidence
              </span>
              <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                {attrEvidence.length} docs
              </span>
            </div>
            <ul className="space-y-2">
              {attrEvidence.map((e) => {
                const d = sources.find((s) => s.id === e.sourceDocumentId);
                const agree = attribute ? e.value === attribute.value : undefined;
                const isSelected = e.id === selected?.id;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(e.id)}
                      className={`w-full rounded-sm border p-2.5 text-left transition-colors ${
                        isSelected
                          ? "border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)]"
                          : "border-[var(--uf-border)] bg-[var(--uf-surface)] hover:border-[var(--uf-border-strong)]"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`uf-mono text-[10.5px] uppercase tracking-[0.06em] ${
                            agree === false
                              ? "text-[var(--uf-critical)]"
                              : agree
                                ? "text-[var(--uf-success)]"
                                : "text-[var(--uf-text-secondary)]"
                          }`}
                        >
                          {e.value}
                        </span>
                        <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                          {formatPercent(e.confidence)}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-[11px] text-[var(--uf-text-tertiary)]">
                        {d?.filename}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between">
                        <span className="uf-mono text-[10px] text-[var(--uf-text-tertiary)]">
                          {e.pageRef}
                        </span>
                        {agree === false ? (
                          <span className="uf-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--uf-critical)]">
                            Disagrees
                          </span>
                        ) : agree ? (
                          <span className="uf-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--uf-success)]">
                            Agrees
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Document view */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {selected && doc ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex h-full flex-col"
                >
                  {/* Document header */}
                  <div className="flex flex-wrap items-center gap-3 border-b border-[var(--uf-border-faint)] px-5 py-3">
                    <span
                      className="flex size-8 items-center justify-center rounded-sm border"
                      style={{
                        color: "var(--uf-accent)",
                        borderColor: "var(--uf-accent-line)",
                        background: "var(--uf-accent-dim)",
                      }}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[var(--uf-text-primary)]">
                        {doc.filename}
                      </p>
                      <p className="text-[11px] text-[var(--uf-text-tertiary)]">
                        {supplier?.name} · {doc.type.replace(/_/g, " ")} ·{" "}
                        {doc.pages ? `${doc.pages} pages` : `${doc.rowCount?.toLocaleString() ?? 0} rows`} ·{" "}
                        {formatBytes(doc.sizeBytes)}
                      </p>
                    </div>
                    <ConfidenceMeter value={selected.confidence} size="sm" />
                  </div>

                  {/* Page fragment */}
                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-center justify-between border-b border-[var(--uf-border-faint)] pb-1.5">
                      <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                        Source fragment
                      </span>
                      <span className="uf-mono text-[10px] text-[var(--uf-accent)]">
                        {selected.pageRef}
                      </span>
                    </div>
                    <div
                      className="mt-3 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-bg)] p-4 font-mono text-[12.5px] leading-6 text-[var(--uf-text-secondary)]"
                    >
                      {highlightRaw(selected.excerpt, selected.raw)}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-4">
                      {[
                        ["ATTRIBUTE", currentAttribute?.replace(/_/g, " ") ?? "—"],
                        ["EXTRACTED VALUE", selected.value],
                        ["CAPTURED", formatTimestamp(selected.capturedAt).split(" · ")[0]],
                        ["DOCUMENT STATUS", doc.status],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="uf-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                            {k}
                          </dt>
                          <dd className="uf-mono mt-0.5 text-[11.5px] text-[var(--uf-text-primary)]">
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                          Proof score · {currentAttribute?.replace(/_/g, " ")}
                        </span>
                        <span className="uf-mono text-[11px] text-[var(--uf-text-secondary)]">
                          {formatPercent(proofScore)}
                        </span>
                      </div>
                      <div className="uf-progress">
                        <span
                          style={{
                            width: `${Math.round(proofScore * 100)}%`,
                            background:
                              proofScore >= 0.85
                                ? "var(--uf-success)"
                                : proofScore >= 0.7
                                  ? "var(--uf-accent)"
                                  : "var(--uf-warning)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--uf-border-faint)] px-5 py-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-[var(--uf-text-tertiary)]">
                      <BookOpen className="size-3.5" aria-hidden />
                      Extract captured by UNIFORGE intake · OCR confidence{" "}
                      {formatPercent(selected.confidence)}
                    </span>
                    {openConflict ? (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/resolve?conflict=${openConflict.id}`);
                        }}
                        className="uf-mono inline-flex items-center gap-2 rounded-sm border border-[var(--uf-warning-line)] bg-[var(--uf-warning-dim)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--uf-warning)] transition-colors hover:bg-[var(--uf-warning)] hover:text-[var(--uf-bg)]"
                      >
                        <Scale className="size-3.5" aria-hidden />
                        Review conflict
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-[var(--uf-success)]">
                        <Check className="size-3.5" aria-hidden />
                        No open conflict on this attribute
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center">
                  <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
                    No evidence captured for this attribute
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
